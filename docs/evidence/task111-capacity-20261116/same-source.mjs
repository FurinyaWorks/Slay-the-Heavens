import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
import {writeScriptBatch} from '../../../scripts/native-script-batch.mjs';
import {loadNativeUiEncoder} from '../../../scripts/native-ui-encoder.mjs';
import {runNativeClientCheck} from '../../../scripts/native-client-check.mjs';
import {runLua} from '../../../scripts/test-lua.mjs';
import {luaString} from '../../../scripts/build-lua-data.mjs';
import {pathToFileURL} from 'node:url';
const auditToolRoot=resolve(process.env.MILIASTRA_MCP_ROOT||'work/miliastra-toolchain');
const wire=await import(pathToFileURL(auditToolRoot+'/src/scene/wire.mjs'));
const {luaSyntaxError}=await import(pathToFileURL(auditToolRoot+'/src/client-check.mjs'));
const toolRoot=auditToolRoot;
const {native}=await loadNativeUiEncoder(toolRoot);
const receipt=JSON.parse(readFileSync(process.argv[2])),base=process.env.CAPACITY_CANDIDATE_FILE??receipt.candidate.path,output=resolve(process.argv[3]);mkdirSync(output);
const digest=b=>createHash('sha256').update(b).digest('hex');
assert.equal(digest(readFileSync(base)),receipt.candidate.sha256,'immutable source candidate');
const root=wire.container(readFileSync(base));
const text=(b,id)=>wire.fields(b).find(f=>f.id===id&&f.wire===2)?.data.toString('utf8');
const scripts=wire.fields(wire.one(root,50)).filter(f=>f.id===1&&f.wire===2).map(f=>({name:text(f.data,2),source:text(f.data,5)}));
const names=['abyss_data','abyss_original_v4_data','abyss_theme','abyss_narrative','abyss_presentation'];
const changes=names.map(name=>{
 const source=scripts.find(s=>s.name===name).source;
 // Apply only to canonical generated literals. All escape bytes outside these
 // five data modules, including gameplay source and build markers, stay exact.
 const compact=source.replace(/(?:\\(?:1[2-9][0-9]|2[0-5][0-9]))+/g,part=>{
  const bytes=Buffer.from([...part.matchAll(/\\(\d{3})/g)].map(m=>Number(m[1])));
  return new TextDecoder('utf-8',{fatal:true}).decode(bytes);
 });
 writeFileSync(join(output,name+'-before.lua'),source);writeFileSync(join(output,name+'-after.lua'),compact);
 return {name,source:compact,beforeBytes:Buffer.byteLength(source),afterBytes:Buffer.byteLength(compact)};
});
const compare=`local values=0
local function equal(a,b,path)
 assert(type(a)==type(b),path..' type')
 if type(a)~='table' then assert(a==b,path..' value');values=values+1;return end
 for k,v in pairs(a)do assert(b[k]~=nil,path..' missing key');equal(v,b[k],path..'/'..tostring(k))end
 for k in pairs(b)do assert(a[k]~=nil,path..' extra key')end
end
${names.map(n=>`equal(dofile(${luaString(join(output,n+'-before.lua'))}),dofile(${luaString(join(output,n+'-after.lua'))}),${luaString(n)})`).join('\n')}
print('PASS scalarValues='..values)`;
const comparisonPath=join(output,'equivalence.lua');writeFileSync(comparisonPath,compare);
const equivalence=runLua(comparisonPath);assert.equal(equivalence.status,0,equivalence.stderr);console.log(equivalence.stdout.trim());
const portraitBefore=scripts.find(s=>s.name==='abyss_traveler_portrait_assets').source;
const retired=portraitBefore.split('\n').filter(line=>line.startsWith('selection133='));assert.equal(retired.length,1);
const portraitAfter=portraitBefore.replace(retired[0]+'\n','');
const portraitChange={name:'abyss_traveler_portrait_assets',source:portraitAfter,beforeBytes:Buffer.byteLength(portraitBefore),afterBytes:Buffer.byteLength(portraitAfter)};
writeFileSync(join(output,'portrait-before.lua'),portraitBefore);writeFileSync(join(output,'portrait-after.lua'),portraitAfter);
const portraitCheck=compare.slice(0,compare.indexOf(names.map(n=>`equal(dofile(${luaString(join(output,n+'-before.lua'))})`)[0]))+
 `local before=dofile(${luaString(join(output,'portrait-before.lua'))});local after=dofile(${luaString(join(output,'portrait-after.lua'))})\n`+
 `assert(before.selection133.count==1940 and #before.selection133.rows==1940);assert(after.selection133==nil);before.selection133=nil;equal(before,after,'portrait');print('PASS remaining portrait scalarValues='..values)`;
writeFileSync(join(output,'portrait-equivalence.lua'),portraitCheck);
const portraitEquivalence=runLua(join(output,'portrait-equivalence.lua'));assert.equal(portraitEquivalence.status,0,portraitEquivalence.stderr);console.log(portraitEquivalence.stdout.trim());
const experiments=[];
for(const [label,selected] of [['general-data',changes.filter(r=>r.name!=='abyss_original_v4_data')],['frozen-v4',changes.filter(r=>r.name==='abyss_original_v4_data')],['combined',changes],['retired-selection',[portraitChange]],['final-combined',[...changes,portraitChange]]]){
 const directory=join(output,label);mkdirSync(directory,{recursive:true});
 const mapPath=writeScriptBatch(base,selected.map(({name,source})=>({name,source})),directory,{...wire,clientScriptRecord:native.clientScriptRecord,luaSyntaxError});
 const bytes=readFileSync(mapPath),after=wire.container(bytes);
 const unchangedSections=wire.fields(root).filter(f=>f.id!==50).every(f=>wire.fields(after).find(a=>a.id===f.id)?.raw.equals(f.raw));assert(unchangedSections);
 const check=runNativeClientCheck({mapPath},toolRoot);assert.equal(check.ok,true,JSON.stringify(check).slice(0,500));
 const row={experimentId:randomUUID(),label,kind:'same-source-wire-experiment-not-RC',sourceCommit:receipt.sourceCommit,payloadDigest:receipt.payloadDigest,
  embeddedBuildId:receipt.buildId,baseCandidateSha256:receipt.candidate.sha256,path:mapPath,sha256:digest(bytes),bytes:bytes.length,savedWireBytes:readFileSync(base).length-bytes.length,
  factors:selected.map(({name,beforeBytes,afterBytes})=>({name,beforeBytes,afterBytes,savedSourceBytes:beforeBytes-afterBytes})),
  unchangedNonScriptSections:unchangedSections,check:{ok:check.ok,errors:check.errors,warnings:check.warnings?.length},officialStorageMB:null,officialStatus:'UNVERIFIED'};
 experiments.push(row);console.log(label,row.savedWireBytes);
}
assert.equal(experiments[2].savedWireBytes,experiments[0].savedWireBytes+experiments[1].savedWireBytes);
assert.equal(experiments[4].savedWireBytes,experiments[2].savedWireBytes+experiments[3].savedWireBytes);
writeFileSync(join(output,'experiments.json'),JSON.stringify({schemaVersion:1,sourceReceipt:process.argv[2],equivalence:{status:'PASS',stdout:equivalence.stdout,portraitStdout:portraitEquivalence.stdout},experiments},null,2)+'\n');
