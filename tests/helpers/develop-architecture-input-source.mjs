// Exact non-production ABI/source adapters for immutable historical receipts.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {architecturePatch,preArchitectureExecutableSource,preArchitectureProductSource} from './develop-architecture-light-source.mjs';
import {architectureClosureBytes} from './develop-architecture-helper-binding.mjs';
const closure=JSON.parse(architectureClosureBytes);
const closureRows={...closure.files,...closure.sourceOnly};
const norm=s=>s.replaceAll('\r\n','\n'),hash=b=>createHash('sha256').update(b).digest('hex');
const sourceHash=(path,source)=>hash(/\.(?:mjs|js|json|lua)$/.test(path)?norm(Buffer.isBuffer(source)?source.toString('utf8'):source):source);
export function preArchitectureInputSource(path,source,beforeSource,{read=readFileSync}={}){
 if(typeof source!=='string')return source;
 const production=preArchitectureProductSource(path,source,{read});if(production!==source)return production;
 const prior=preArchitectureExecutableSource(path,source,{read});
 if(prior!==source)return prior;
 const row=Object.hasOwn(closureRows,path)?closureRows[path]:null;
 if(!row||row.before===null||typeof beforeSource!=='string'||hash(norm(source))!==row.after)return source;
 assert.equal(hash(norm(beforeSource)),row.before,'complete architecture helper predecessor: '+path);
 for(const [owner,binding]of Object.entries(closureRows))assert.equal(sourceHash(owner,read(owner)),binding.after,'fresh architecture helper source: '+owner);
 return beforeSource;
}
export function preArchitectureInventory(paths,kind,{read=readFileSync}={}){
 const inventory=architecturePatch.inventories?.[kind];if(!inventory)return [...paths];
 const actual=[...paths].sort();
 if(JSON.stringify(actual)===JSON.stringify(inventory.before))return [...paths];
 const additions=inventory.current.filter(path=>!inventory.before.includes(path));
 if(!additions.some(path=>actual.includes(path)))return [...paths];
 assert.deepEqual(actual,inventory.current,'complete architecture '+kind+' discovery inventory');
 for(const path of additions){
  const row=architecturePatch.inputs[path];assert(row?.current,'complete added architecture inventory source: '+path);
  assert.equal(hash(norm(read(path,'utf8'))),row.current.sha256,'fresh added architecture inventory source: '+path);
 }
 return [...inventory.before];
}
