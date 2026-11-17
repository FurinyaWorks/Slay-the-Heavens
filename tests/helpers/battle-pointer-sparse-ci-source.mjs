// CI-only outer continuation. Production projectors never import this trust leaf.
import assert from 'node:assert/strict';
import {inspectionCiSource,inspectionBeforeRead,assertInspectionCiCurrent} from './battle-pointer-inspection-ci-source.mjs';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const hash=b=>createHash('sha256').update(b).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const bytes=readFileSync(new URL('./battle-pointer-sparse-ci-source.json.gz',import.meta.url));
assert.equal(hash(bytes),"8e273356da55756ccb64b3fb37c1d8f70d1f0694bf2760605eb74ac26efa61d6",'complete sparse battle pointer CI continuation');
const packet=JSON.parse(gunzipSync(bytes));
assert.equal(packet.schemaVersion,1);assert.equal(packet.normalization,'LF');
assert.equal(packet.baseCommit,'01c2e763f60eadff72c07325dbe671cd2267d0a4');
assert.equal(packet.productCommit,'82b1a114ca486140ae913cca6a0834cab52417cb');
assert.equal(packet.currentTreeCommitted,false,'CI helper after bindings are a worktree capture; product producer remains separately committed');
assert.deepEqual(packet.currentInventory,packet.priorInventory,'sparse battle pointer changes no raw discovery');
for(const [path,row]of Object.entries(packet.files))for(const binding of [row.before,row.current].filter(Boolean)){
 assert.equal(binding.source,norm(binding.source),path);assert.equal(hash(binding.source),binding.sha256,path);
 assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(binding.source)}\0`).update(binding.source).digest('hex'),binding.gitBlob,path);
}
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
export const battlePointerSparseCiPacket=freeze(packet);
export function battlePointerSparseCiCheckedSource(path,source,before){
 const row=Object.hasOwn(packet.files,path)?packet.files[path]:null;
 if(!row?.before||typeof source!=='string'||source.includes('\r\r\n'))return source;
 if(before&&row.before.sha256!==before.sha256)return source;
 return hash(norm(source))===row.current.sha256?row.before.source:source;
}
export function battlePointerSparseCiSource(path,source,before,read=readFileSync){
 if(path.startsWith('src/')||path==='config/architecture.json')return source;
 return battlePointerSparseCiCheckedSource(path,inspectionCiSource(path,source,read),before);
}
export function battlePointerSparseCiRead(read=readFileSync){return(path,encoding)=>{
 const raw=read(path,encoding);
 if(!Object.hasOwn(packet.files,path)||!packet.files[path].before)return raw;
 const text=typeof raw==='string'?raw:raw.toString('utf8'),prior=battlePointerSparseCiSource(path,text,undefined,read);
 return typeof raw==='string'?prior:prior===text?raw:Buffer.from(prior);
};}
export function assertBattlePointerSparseRawInventory(paths,kind='js'){
 assert(['js','lua'].includes(kind));assert.deepEqual([...paths].sort(),packet.currentInventory[kind],'complete sparse battle pointer raw discovery inventory');
}
export function assertBattlePointerSparseCiCurrent(read=readFileSync){
 assertInspectionCiCurrent(read);read=inspectionBeforeRead(read,{production:true,authenticate:false});
 for(const [path,row]of Object.entries(packet.files))
  assert.equal(hash(norm(read(path,'utf8'))),row.current.sha256,'fresh complete integration source: sparse battle pointer '+path);
 for(const [path,sha]of Object.entries(packet.immutableArchives))
  assert.equal(hash(read(path)),sha,'retained complete immutable sparse battle pointer predecessor: '+path);
}

// Only complete-CI validation uses explicit production predecessor bindings.
export function battlePointerSparseCiValidationRead(read=readFileSync){read=inspectionBeforeRead(read,{production:true});return(path,encoding)=>{
 const raw=read(path,encoding);
 if(!Object.hasOwn(packet.files,path)||!packet.files[path].before)return raw;
 const text=typeof raw==='string'?raw:raw.toString('utf8'),prior=battlePointerSparseCiCheckedSource(path,text);
 return typeof raw==='string'?prior:prior===text?raw:Buffer.from(prior);
};}
