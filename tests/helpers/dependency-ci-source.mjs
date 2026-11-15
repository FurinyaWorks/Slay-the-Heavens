// Small exact successor. The original archive, leaf and all six views survive.
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {dependencyCiBytes} from './dependency-ci-binding.mjs';
const hash=s=>createHash('sha256').update(s).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
export const dependencyCiProof=freeze(JSON.parse(gunzipSync(dependencyCiBytes)));
const patch=dependencyCiProof,archive='tests/helpers/dependency-ci-source.json.gz',leaf='tests/helpers/dependency-ci-binding.mjs';
assert.equal(patch.schemaVersion,1);assert.equal(patch.normalization,'LF');
assert.equal(patch.baseCommit,'c2409ad750c15124b7b843c6bbfa5b222537cb75');
assert.equal(patch.priorArchiveSha256,'f0b7137f7d0462dff36b78e39a39aab8804ba9a097b1b72bdf6686cf10f15c35');
for(const [path,row]of Object.entries(patch.files))for(const b of [row.before,row.after].filter(Boolean)){
 assert.equal(b.source,norm(b.source));assert.equal(hash(b.source),b.sha256,'complete successor source: '+path);
 assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(b.source)}\0`).update(b.source).digest('hex'),b.gitBlob);
}
export function renderDependencyCiBinding(sha){
 assert.match(sha,/^[a-f0-9]{64}$/);
 return `// Fixed successor trust leaf; excluded from its own archive.\nimport assert from 'node:assert/strict';\nimport {readFileSync} from 'node:fs';\nimport {createHash} from 'node:crypto';\nexport const dependencyCiBytes=readFileSync(new URL('./dependency-ci-source.json.gz',import.meta.url));\nassert.equal(createHash('sha256').update(dependencyCiBytes).digest('hex'),${JSON.stringify(sha)},'complete dependency/BGM CI successor');\n`;
}
const transport=()=>({[archive]:{before:null,after:hash(dependencyCiBytes)},[leaf]:{before:null,after:hash(renderDependencyCiBinding(hash(dependencyCiBytes)))}});
export function extendDependencyCiProof(prior){
 assert.deepEqual(patch.inventoryBefore,prior.inventory,'complete predecessor JS inventory');
 assert.deepEqual(patch.luaInventoryBefore,prior.luaInventory,'complete predecessor Lua inventory');
 const files={...prior.files},closure={...prior.closure};
 for(const [path,row]of Object.entries(patch.files)){
  const old=prior.files[path];
  if(old)assert.deepEqual(row.before,old.current,'immutable CI source predecessor: '+path);
  files[path]={current:row.after,views:old?.views??{},oldSource:row.before};
 }
 for(const [path,row]of Object.entries({...patch.helperClosure,...transport()})){
  if(closure[path])assert.equal(row.before,closure[path].after,'exact successor closure predecessor: '+path);
  closure[path]={before:closure[path]?closure[path].before:row.before,after:row.after};
 }
 return freeze({...prior,files,closure,inventory:patch.inventoryAfter,luaInventory:patch.luaInventoryAfter});
}
export function extendDependencyHelperClosure(prior){
 const current={...prior};
 for(const [path,row]of Object.entries({...patch.helperClosure,...transport()})){
  assert.equal(prior[path]??null,row.before,'exact successor copy predecessor: '+path);current[path]=row.after;
 }
 return freeze(current);
}
export function assertDependencyCiCurrent(read=readFileSync){
 for(const [path,row]of Object.entries(patch.files))assert.equal(hash(norm(read(path,'utf8'))),row.after.sha256,'fresh complete integration source: '+path);
 for(const [path,row]of Object.entries({...patch.binary,...transport()}))assert.equal(hash(path.endsWith('.gz')?read(path):norm(read(path,'utf8'))),row.after,'fresh complete integration source: '+path);
 for(const [path,row]of Object.entries(patch.helperClosure))assert.equal(hash(path.endsWith('.gz')?read(path):norm(read(path,'utf8'))),row.after,'fresh complete integration source: '+path);
 const inventory=(dir,ext)=>readdirSync(dir).filter(p=>p.endsWith(ext)).map(p=>dir+'/'+p).sort();
 assert.deepEqual(inventory('tests','.test.mjs'),patch.inventoryAfter,'complete raw successor JS inventory');
 assert.deepEqual(inventory('tests/lua','.lua'),patch.luaInventoryAfter,'complete raw successor Lua inventory');
 assert.equal(hash(read('tests/helpers/integrated-ci-source.json.gz')),patch.priorArchiveSha256);
}
