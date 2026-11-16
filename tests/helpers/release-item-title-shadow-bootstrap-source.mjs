// Exact outer composition of this slice and the actually merged Release base.
// Neither immutable predecessor packet nor a production projector imports it.
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {itemCiRepairSource,itemCiRepairRead,assertItemCiRepairCurrent} from './release-item-ci-repair-source.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const bytes=readFileSync(new URL('./release-item-title-shadow-bootstrap-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'dabab7788653b45eff7f570f2ab2ae3797b40e1d91a5fe9ea0a54d0354a45be8','complete item title shadow actual Release composition');
const packet=JSON.parse(gunzipSync(bytes));
assert.equal(packet.schemaVersion,1);assert.equal(packet.normalization,'LF');
assert.equal(packet.releaseBase,'1cc5479b713edab6fd26db4e20f8eb22b7401cb2');
assert.equal(packet.priorRelease,'36b9b157ee6f05b65eb9f1da7e2978647d36c210');
assert.equal(packet.itemCheckpoint,'7e33dbf2b536061e917c9e992ec4fa5109a8cbda');
assert.equal(packet.currentTreeCommitted,false,'worktree after capture does not invent a commit');
for(const [path,row]of Object.entries(packet.files))for(const binding of [row.current,...Object.values(row.views)].filter(Boolean)){
 if(typeof binding.source==='string'){
  assert.equal(binding.source,norm(binding.source),path);assert.equal(hash(binding.source),binding.sha256,path);
  assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(binding.source)}\0`).update(binding.source).digest('hex'),binding.gitBlob,path);
 }
}
assert.equal(Object.keys(packet.releaseGitFiles).length,10,'complete actual Release changed Git view');
assert.equal(Object.keys(packet.productionEquivalence).length,352,'complete production base equivalence');
for(const [path,row]of Object.entries(packet.productionEquivalence))assert.equal(row.beforeGitBlob,row.releaseGitBlob,'actual Release preserves production base: '+path);
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
export const itemTitleShadowBootstrapPacket=freeze(packet);
function text(raw){
 if(typeof raw==='string')return raw;
 assert(Buffer.isBuffer(raw),'composition source bytes');const value=raw.toString('utf8');
 assert(Buffer.from(value).equals(raw),'composition source UTF-8');return value;
}
export function itemTitleShadowBootstrapSource(path,source,view){
 assert(['item','release'].includes(view),'explicit item or actual Release view');
 const original=source;
 source=itemCiRepairSource(path,source);
 if(path.startsWith('src/')||path==='config/architecture.json')return source;
 const row=Object.hasOwn(packet.files,path)?packet.files[path]:null,target=row?.views[view];
 if(row?.current.kind!=='text'||typeof target?.source!=='string'||typeof source!=='string'||source.includes('\r\r\n'))return original;
 return hash(norm(source))===row.current.sha256?target.source:source;
}
export function itemTitleShadowBootstrapRead(view,read=readFileSync){read=itemCiRepairRead(read);return(path,encoding)=>{
 const raw=read(path,encoding),row=Object.hasOwn(packet.files,path)?packet.files[path]:null;
 if(row?.current.kind!=='text')return raw;
 const source=text(raw),prior=itemTitleShadowBootstrapSource(path,source,view);
 return typeof raw==='string'?prior:prior===source?raw:Buffer.from(prior);
};}
export function assertItemTitleShadowBootstrapCurrent(read=readFileSync){
 assertItemCiRepairCurrent(read);read=itemCiRepairRead(read);
 for(const [path,row]of Object.entries(packet.files)){
  let raw;try{raw=read(path);}catch(error){assert.fail('fresh complete integration source: item Release composition '+path+': '+String(error?.message??error));}
  assert.equal(hash(row.current.kind==='text'?norm(text(raw)):raw),row.current.sha256,'fresh complete integration source: item Release composition '+path);
 }
 for(const [path,sha]of Object.entries(packet.archives))assert.equal(hash(read(path)),sha,'retained immutable item Release composition: '+path);
}
export function itemTitleShadowBootstrapInventory(paths,view,kind='js'){
 assert(['item','release'].includes(view));assert(['js','lua'].includes(kind));
 assert.deepEqual([...paths].sort(),packet.inventory.current[kind],'complete item Release raw inventory');
 assertItemTitleShadowBootstrapCurrent();
 return [...packet.inventory[view][kind]];
}
export function assertItemTitleShadowBootstrapRawInventory(kind='js'){
 const paths=kind==='js'?readdirSync('tests').filter(p=>p.endsWith('.test.mjs')).map(p=>'tests/'+p):readdirSync('tests/lua').filter(p=>p.endsWith('.lua')).map(p=>'tests/lua/'+p);
 assert.deepEqual(paths.sort(),packet.inventory.current[kind],'complete item Release raw inventory');
}
