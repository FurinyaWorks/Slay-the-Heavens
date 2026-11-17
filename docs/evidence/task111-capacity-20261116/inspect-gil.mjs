import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const auditToolRoot=resolve(process.env.MILIASTRA_MCP_ROOT||'work/miliastra-toolchain');
const wire=await import(pathToFileURL(auditToolRoot+'/src/scene/wire.mjs'));
const native=await import(pathToFileURL(auditToolRoot+'/src/scene-save.mjs'));
import {productionCosts} from '../../../scripts/production-costs.mjs';
const [receiptPath,out]=process.argv.slice(2),r=JSON.parse(readFileSync(receiptPath)),mapPath=process.env.CAPACITY_CANDIDATE_FILE??r.candidate.path;
const bytes=readFileSync(mapPath),root=wire.container(bytes),fields=wire.fields(root);
if(createHash('sha256').update(bytes).digest('hex')!==r.candidate.sha256)throw Error('Candidate hash differs from the immutable receipt');
const text=(data,id)=>wire.fields(data).find(f=>f.id===id&&f.wire===2)?.data.toString('utf8');
const scripts=wire.fields(wire.one(root,50)).filter(f=>f.id===1&&f.wire===2).map(f=>({name:text(f.data,2),sourceBytes:Buffer.byteLength(text(f.data,5)),recordBytes:f.raw.length,sha256:createHash('sha256').update(text(f.data,5)).digest('hex')}));
const records=new Map(wire.fields(wire.one(root,9)).filter(f=>f.id===502&&f.wire===2).map(f=>[Number(wire.one(f.data,501,0)),f.raw.length]));
const face=native.listInterface({mapPath}),paths=new Map(),trees=[];
for(const row of face.clientInterfaces){
 const ui=native.getClientUi({mapPath,ui:row.name});trees.push(ui.interface);
 for(const [path,id] of Object.entries(ui.ids))paths.set(path==='/'?row.name:path===row.name?row.name+'@container':row.name+'/'+path,{id,recordBytes:records.get(id)});
}
for(const row of face.clientTemplates){
 const ui=native.getClientUi({mapPath,template:row.name});trees.push(ui.template);
 for(const [path,id] of Object.entries(ui.ids))paths.set(path,{id,recordBytes:records.get(id)});
}
function cost(path){const rows=[...paths].filter(([p])=>p===path||p.startsWith(path+'/'));return {path,records:rows.length,recordBytes:rows.reduce((n,[,r])=>n+r.recordBytes,0)};}
const generated=resolve(receiptPath,'../generated');
const layout=JSON.parse(readFileSync(generated+'/game-ui.json')),templates=JSON.parse(readFileSync(generated+'/game-ui-templates.json'));
const inputCosts=productionCosts(scripts.map(s=>({name:s.name,bytes:s.sourceBytes})),layout,templates,JSON.parse(readFileSync('config/architecture.json')).layers);
const sectionBytes=id=>fields.filter(f=>f.id===id).reduce((n,f)=>n+f.raw.length,0);
const report={schemaVersion:1,measurement:'actual-GIL-wire-bytes-not-official-storage',officialStorageMB:null,officialStatus:'UNVERIFIED',
 identity:{sourceCommit:r.sourceCommit,sourceDirty:r.sourceDirty,buildId:r.buildId,payloadDigest:r.payloadDigest,...r.candidate},baseMap:r.baseMap,artFeatures:r.artFeatures,
 toolchain:r.toolchainIdentity,statuses:r.statuses,sections:fields.map(f=>({id:f.id,wire:f.wire,bytes:f.raw.length})),
 totals:{gilBytes:bytes.length,rootBytes:root.length,uiSectionBytes:sectionBytes(9),scriptSectionBytes:sectionBytes(50),luaSourceBytes:scripts.reduce((n,s)=>n+s.sourceBytes,0),uiRecords:records.size,mappedRecords:paths.size},
 lua:scripts.sort((a,b)=>b.recordBytes-a.recordBytes),pages:inputCosts.pages.map(row=>({...row,...cost(row.path)})),
 templates:inputCosts.templates.map(row=>({...row,...cost(row.path)})),cardHosts:inputCosts.cardHosts.map(row=>({...row,...cost(row.path)})),
 controls:[...paths].map(([path,row])=>({path,...row})),inputCosts};
writeFileSync(out,JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({...report.totals,cardHosts:report.cardHosts.length,cardRecordBytes:report.cardHosts.reduce((n,r)=>n+r.recordBytes,0),topPages:report.pages.slice(0,4)},null,2));
