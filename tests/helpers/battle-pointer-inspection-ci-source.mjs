// CI-only exact continuation. Every historical projection authenticates fresh raw owners.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {pointerBeforePotionEpoch as sourceEpoch} from './closeout-source-epoch.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const bytes=readFileSync(new URL('./battle-pointer-inspection-ci-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'eabdb32e61788967dd4377fa5d0f62039b3e37331ec54edb64f604b1feb60e4c','complete inspection battle pointer CI continuation');
const packet=JSON.parse(gunzipSync(bytes));
assert.equal(packet.schemaVersion,1);assert.equal(packet.normalization,'LF');
assert.equal(packet.baseCommit,'5a4ea961c878e688f609528cbc1ee7868e6316f5');
assert.equal(packet.productCommit,'b01cdd5858924cc9caf84cc3134fa52e5958add7');
assert.equal(packet.currentTreeCommitted,false);
assert.deepEqual(packet.currentInventory,packet.priorInventory,'inspection changes no raw discovery');
for(const [path,row]of Object.entries(packet.files))for(const binding of [row.before,row.current].filter(Boolean)){
 assert.equal(binding.source,norm(binding.source),path);assert.equal(hash(binding.source),binding.sha256,path);
 assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(binding.source)}\0`).update(binding.source).digest('hex'),binding.gitBlob,path);
}
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
export const inspectionCiPacket=freeze(packet);
export function assertInspectionCiCurrent(read=readFileSync){
 for(const path of sourceEpoch.proof.owners){
  const source=read(path,'utf8');assert.equal(typeof source,'string','fresh linked owner: '+path);
  assert.equal(hash(norm(source)),sourceEpoch.proof.current[path].sha256,'fresh linked owner: '+path);
 }
 for(const [path,row]of Object.entries(packet.files))assert.equal(hash(norm(read(path,'utf8'))),row.current.sha256,'fresh complete integration source: inspection '+path);
 for(const [path,sha]of Object.entries(packet.immutableArchives))assert.equal(hash(read(path)),sha,'retained complete immutable sparse battle pointer predecessor: '+path);
}
function priorSource(path,source,{production=false,read=readFileSync,authenticate=true}={}){
 if(!production&&(path.startsWith('src/')||path==='config/architecture.json'))return source;
 const row=Object.hasOwn(packet.files,path)?packet.files[path]:null;
 if(!row?.before||typeof source!=='string'||source.includes('\r\r\n')||hash(norm(source))!==row.current.sha256||row.before.sha256===row.current.sha256)return source;
 if(authenticate)assertInspectionCiCurrent(read);
 return row.before.source;
}
export function inspectionCiSource(path,source,read=readFileSync){return priorSource(path,source,{read});}
export function inspectionBeforeRead(read=readFileSync,{production=false,authenticate=true}={}){return(path,encoding)=>{
 const raw=read(path,encoding),text=typeof raw==='string'?raw:raw.toString('utf8');
 const prior=priorSource(path,text,{read,production,authenticate});
 return typeof raw==='string'?prior:prior===text?raw:Buffer.from(prior);
};}
