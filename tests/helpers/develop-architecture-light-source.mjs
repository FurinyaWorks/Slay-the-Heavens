// The same fixed outer archive without loading the many older source epochs.
// Every authorization still rereads the entire current production/input closure.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {readDevelopArchitecturePatch,validateArchitectureBinding} from './develop-architecture-source-epoch.mjs';
export const architecturePatch=readDevelopArchitecturePatch();
const hash=s=>createHash('sha256').update(s).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
assert.equal(architecturePatch.baseCommit,'c2409ad750c15124b7b843c6bbfa5b222537cb75');
assert.deepEqual(Object.keys(architecturePatch.authentication).sort(),architecturePatch.inventoryAfter,'complete lightweight production authentication inventory');
for(const [path,sha]of Object.entries(architecturePatch.authentication))assert((path==='config/architecture.json'||/^src\/lua\/[A-Za-z0-9_-]+\.lua$/.test(path))&&(sha===null||/^[a-f0-9]{64}$/.test(sha)),'complete lightweight production identity');
for(const table of [architecturePatch.before,architecturePatch.current])for(const row of Object.values(table))validateArchitectureBinding(row);
for(const row of Object.values(architecturePatch.inputs)){validateArchitectureBinding(row.before);validateArchitectureBinding(row.current);}
export function authenticateArchitectureSources(read=readFileSync,{inputs=false}={}){
 const records={...architecturePatch.authentication,...(inputs?Object.fromEntries(Object.entries(architecturePatch.inputs).map(([p,row])=>[p,row.current?.sha256??null])):{})};
 for(const [path,sha]of Object.entries(records)){
  let source;try{source=read(path,'utf8');}catch(error){assert.fail('architecture linked owner missing: '+path+': '+String(error?.message??error));}
  assert(sha===null?source===null||source===undefined:typeof source==='string'&&hash(norm(source))===sha,'architecture linked owner identity: '+path);
 }
}
export function preArchitectureProductSource(path,source,{read=readFileSync}={}){
 const current=Object.hasOwn(architecturePatch.current,path)?architecturePatch.current[path]:null;
 const before=Object.hasOwn(architecturePatch.before,path)?architecturePatch.before[path]:null;
 if(typeof source!=='string'||!current||!before||hash(norm(source))!==current.sha256)return source;
 authenticateArchitectureSources(read);return before.source;
}
export function preArchitectureExecutableSource(path,source,{read=readFileSync}={}){
 const row=Object.hasOwn(architecturePatch.inputs,path)?architecturePatch.inputs[path]:null;
 if(typeof source!=='string'||!row?.before||!row.current||hash(norm(source))!==row.current.sha256)return source;
 authenticateArchitectureSources(read,{inputs:true});return row.before.source;
}
