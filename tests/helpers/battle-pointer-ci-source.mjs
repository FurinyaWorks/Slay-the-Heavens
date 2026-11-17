// CI-only outer continuation. Production projectors never import this trust leaf.
import assert from 'node:assert/strict';
import {battlePointerSparseCiSource} from './battle-pointer-sparse-ci-source.mjs';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const hash=b=>createHash('sha256').update(b).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const bytes=readFileSync(new URL('./battle-pointer-ci-source.json.gz',import.meta.url));
assert.equal(hash(bytes),"c5a93b3780fe741cec5393eabf5fe4c0d684952eb2bcf3b50e6b62fcbc0983ea",'complete battle pointer CI continuation');
const packet=JSON.parse(gunzipSync(bytes));
assert.equal(packet.schemaVersion,1);assert.equal(packet.normalization,'LF');
assert.equal(packet.baseCommit,'33d71575c5f186a1b54f7bf3e4f1826c145aa1d9');
assert.equal(packet.productCommit,'2bc0d126e74d518664b6719274448624a1c67121');
assert.equal(packet.currentTreeCommitted,false,'CI helper after bindings are a worktree capture; product producer remains separately committed');
assert.deepEqual(packet.currentInventory,packet.priorInventory,'battle pointer changes no raw discovery');
for(const [path,row]of Object.entries(packet.files))for(const binding of [row.before,row.current].filter(Boolean)){
 assert.equal(binding.source,norm(binding.source),path);assert.equal(hash(binding.source),binding.sha256,path);
 assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(binding.source)}\0`).update(binding.source).digest('hex'),binding.gitBlob,path);
}
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
export const battlePointerCiPacket=freeze(packet);
export function battlePointerCiCheckedSource(path,source,before){
 const row=Object.hasOwn(packet.files,path)?packet.files[path]:null;
 if(!row?.before||typeof source!=='string'||source.includes('\r\r\n'))return source;
 if(before&&row.before.sha256!==before.sha256)return source;
 return hash(norm(source))===row.current.sha256?row.before.source:source;
}
export function battlePointerCiSource(path,source,before,read=readFileSync){
 if(path.startsWith('src/')||path==='config/architecture.json')return source;
 return battlePointerCiCheckedSource(path,battlePointerSparseCiSource(path,source,undefined,read),before);
}
export function battlePointerCiRead(read=readFileSync){return(path,encoding)=>{
 const raw=read(path,encoding),text=typeof raw==='string'?raw:raw.toString('utf8'),prior=battlePointerCiSource(path,text,undefined,read);
 return typeof raw==='string'?prior:prior===text?raw:Buffer.from(prior);
};}
export function assertBattlePointerRawInventory(paths,kind='js'){
 assert(['js','lua'].includes(kind));assert.deepEqual([...paths].sort(),packet.currentInventory[kind],'complete battle pointer raw discovery inventory');
}
export function assertBattlePointerCiCurrent(read=readFileSync){
 for(const [path,row]of Object.entries(packet.files))
  assert.equal(hash(norm(read(path,'utf8'))),row.current.sha256,'fresh complete integration source: battle pointer '+path);
 for(const [path,sha]of Object.entries(packet.immutableArchives))
  assert.equal(hash(read(path)),sha,'retained complete immutable battle pointer predecessor: '+path);
}
