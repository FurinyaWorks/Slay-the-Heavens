// Small exact successor of the immutable reviewed integration CI archive.
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {lateCiBytes} from './late-ci-binding.mjs';
const hash=s=>createHash('sha256').update(s).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
export const lateCiProof=freeze(JSON.parse(gunzipSync(lateCiBytes)));
assert.equal(lateCiProof.schemaVersion,1);assert.equal(lateCiProof.baseCommit,'e65d9b98fbec69442047650254238cd9244df805');
assert.equal(lateCiProof.priorArchiveSha256,'813333fabb5d6ace681503dfc8aee87b14d3586dc1b983969b324e86a50fe6bd');
for(const [path,row]of Object.entries(lateCiProof.files))for(const side of ['before','after']){
 const b=row[side];if(b===null)continue;
 assert.equal(b.source,norm(b.source));assert.equal(hash(b.source),b.sha256,path+' complete late CI '+side);
 assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(b.source)}\0`).update(b.source).digest('hex'),b.gitBlob);
}
export function extendLateCiProof(prior){
 assert.deepEqual(lateCiProof.inventoryBefore,prior.inventory,'complete e65 JS inventory');
 assert.deepEqual(lateCiProof.luaInventoryBefore,prior.luaInventory,'complete e65 Lua inventory');
 const files={...prior.files};
 for(const [path,row]of Object.entries(lateCiProof.files)){
  const old=prior.files[path];if(old)assert.deepEqual(row.before,old.current,'immutable e65 CI predecessor: '+path);
  files[path]={current:row.after,views:old?.views??{}};
 }
 const closure=Object.fromEntries(Object.entries(prior.closure).map(([path,row])=>[path,{...row,after:lateCiProof.helperClosure[path]?.after??row.after}]));
 return freeze({...prior,files,closure,inventory:lateCiProof.inventoryAfter,luaInventory:lateCiProof.luaInventoryAfter});
}
export function assertLateCiCurrent(prior,read=readFileSync){
 for(const [path,row]of Object.entries(lateCiProof.files))assert.equal(hash(norm(read(path,'utf8'))),row.after.sha256,'fresh complete late CI source: '+path);
 for(const [path,row]of Object.entries(lateCiProof.binary))assert.equal(hash(read(path)),row.after,'fresh complete late CI binary: '+path);
 const js=readdirSync('tests').filter(p=>p.endsWith('.test.mjs')).map(p=>'tests/'+p).sort();
 const lua=readdirSync('tests/lua').filter(p=>p.endsWith('.lua')).map(p=>'tests/lua/'+p).sort();
 assert.deepEqual(js,lateCiProof.inventoryAfter,'complete raw late JS discovery');assert.deepEqual(lua,lateCiProof.luaInventoryAfter,'complete raw late Lua discovery');
 for(const [path,row]of Object.entries(lateCiProof.helperClosure))assert.equal(hash(path.endsWith('.gz')?read(path):norm(read(path,'utf8'))),row.after,'fresh late copy owner: '+path);
 // Prior archive/leaf are still authenticated by their original reader.
 assert.equal(hash(read('tests/helpers/integrated-ci-source.json.gz')),lateCiProof.priorArchiveSha256);
}
export function renderLateCiBinding(sha){
 assert.match(sha,/^[a-f0-9]{64}$/);
 return `// Fixed successor trust leaf; excluded from its own archive.\nimport assert from 'node:assert/strict';\nimport {readFileSync} from 'node:fs';\nimport {createHash} from 'node:crypto';\nexport const lateCiBytes=readFileSync(new URL('./late-ci-source.json.gz',import.meta.url));\nassert.equal(createHash('sha256').update(lateCiBytes).digest('hex'),${JSON.stringify(sha)},'complete late CI continuation');\n`;
}
