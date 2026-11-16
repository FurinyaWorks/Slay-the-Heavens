import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,join,dirname} from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
import {loadNativeUiEncoder} from '../../../scripts/native-ui-encoder.mjs';
import {writeScriptBatch} from '../../../scripts/native-script-batch.mjs';
import {runNativeClientCheck} from '../../../scripts/native-client-check.mjs';
import {pathToFileURL} from 'node:url';
const auditToolRoot=resolve(process.env.MILIASTRA_MCP_ROOT||'work/miliastra-toolchain');
const wire=await import(pathToFileURL(auditToolRoot+'/src/scene/wire.mjs'));
const {luaSyntaxError}=await import(pathToFileURL(auditToolRoot+'/src/client-check.mjs'));
const receiptPath=process.argv[2],output=resolve(process.argv[3]);mkdirSync(output);
const receipt=JSON.parse(readFileSync(receiptPath)),base=process.env.CAPACITY_CANDIDATE_FILE??receipt.candidate.path,toolRoot=auditToolRoot;
const {native}=await loadNativeUiEncoder(toolRoot),hash=b=>createHash('sha256').update(b).digest('hex');
const generated=join(dirname(receiptPath),'generated'),layout=JSON.parse(readFileSync(join(generated,'game-ui.json'))),templates=JSON.parse(readFileSync(join(generated,'game-ui-templates.json')));
const parts=n=>n.controls??n.children??[],isCard=n=>parts(n).some(c=>c.name==='stsReferenceChrome');
const cards=[];
function collect(n){if(isCard(n))cards.push(n);else for(const c of parts(n))collect(c);}
for(const n of [layout,...templates])collect(n);
function withoutCards(node){const copy=structuredClone(node);for(const key of ['controls','children'])if(copy[key])copy[key]=copy[key].filter(n=>!isCard(n)).map(withoutCards);return copy;}
const factors={
 cards:{kind:'hidden-UI-addition',hosts:cards.length,controls:cards.map((n,i)=>({name:'probe'+i,kind:'container',size:[150,210],children:[structuredClone(n)]}))},
 otherUi:{kind:'hidden-UI-addition',controls:withoutCards(layout).controls},
 portraitData:{kind:'unmounted-data-module-addition',module:'abyss_traveler_portrait_assets'},
 nonVersionData:{kind:'unmounted-data-module-addition',module:'abyss_original_v4_data'}
};
const baseBytes=readFileSync(base),root=wire.container(baseBytes),text=(b,id)=>wire.fields(b).find(f=>f.id===id&&f.wire===2)?.data.toString('utf8');
assert.equal(hash(baseBytes),receipt.candidate.sha256,'immutable source candidate');
const sources=new Map(wire.fields(wire.one(root,50)).filter(f=>f.id===1&&f.wire===2).map(f=>[text(f.data,2),text(f.data,5)]));
const baseUi=new Map(wire.fields(wire.one(root,9)).filter(f=>f.id===502&&f.wire===2).map(f=>[Number(wire.one(f.data,501,0)),f.raw]));
const originalControlIds=new Set();
for(const row of native.listInterface({mapPath:base}).clientInterfaces){const ui=native.getClientUi({mapPath:base,ui:row.name});for(const id of Object.values(ui.ids))originalControlIds.add(id);}
const experiments=[];
for(const labels of [...Object.keys(factors).map(k=>[k]),Object.keys(factors)]){
 const name=labels.join('+'),directory=join(output,name);mkdirSync(directory,{recursive:true});let mapPath=base;
 for(const label of labels){const factor=factors[label];
  if(factor.controls)mapPath=native.addClientUi({mapPath,name:'CapacityProbe_'+label,hidden:true,controls:factor.controls,outputName:'probe-'+label},directory).mapPath;
  else {const out=join(directory,label);mkdirSync(out,{recursive:true});mapPath=writeScriptBatch(mapPath,[{name:'capacity_probe_'+label,source:sources.get(factor.module)}],out,{...wire,clientScriptRecord:native.clientScriptRecord,luaSyntaxError});}
 }
 const bytes=readFileSync(mapPath),after=wire.container(bytes),newUi=new Map(wire.fields(wire.one(after,9)).filter(f=>f.id===502&&f.wire===2).map(f=>[Number(wire.one(f.data,501,0)),f.raw]));
 assert([...originalControlIds].every(id=>baseUi.get(id).equals(newUi.get(id))),'original gameplay UI records must remain exact');
 const check=runNativeClientCheck({mapPath},toolRoot);assert.equal(check.ok,true,JSON.stringify(check).slice(0,500));
 const row={experimentId:randomUUID(),kind:'same-source-additive-component-probe-not-RC',factors:labels,sourceCommit:receipt.sourceCommit,payloadDigest:receipt.payloadDigest,
  baseCandidateSha256:receipt.candidate.sha256,embeddedBuildId:receipt.buildId,sha256:hash(bytes),bytes:bytes.length,addedWireBytes:bytes.length-baseBytes.length,
  originalGameplayUiRecordsUnchanged:true,staticCheck:{ok:check.ok,errors:check.errors,warnings:check.warnings?.length},officialStorageMB:null,officialStatus:'UNVERIFIED',path:mapPath};
 experiments.push(row);console.log(name,row.addedWireBytes);
}
const singles=experiments.filter(r=>r.factors.length===1).reduce((n,r)=>n+r.addedWireBytes,0),combined=experiments.at(-1).addedWireBytes;
writeFileSync(join(output,'experiments.json'),JSON.stringify({schemaVersion:1,method:'Add hidden UI or an unmounted pure-data module to the exact same clean C0; no gameplay controls removed. These are incremental codec costs, NOT removal savings or official MB. Wrappers and native bookkeeping included.',cardHosts:cards.length,experiments,combinedMinusSinglesWireBytes:combined-singles},null,2)+'\n');
