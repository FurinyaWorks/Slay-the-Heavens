// CI-only sparse continuation: real committed bootstrap before, captured combined after.
// The original bootstrap and potion packets remain immutable historical views.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const hash=b=>createHash('sha256').update(b).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const bytes=readFileSync(new URL('./potion-bootstrap-ci-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'6f30c23631e3f405df1fbfc43a22c48267a893289ed8953991955a7d98280b08','complete potion bootstrap CI continuation');
const packet=JSON.parse(gunzipSync(bytes));
assert.equal(packet.schemaVersion,1);assert.equal(packet.normalization,'LF');
assert.equal(packet.beforeCommit,'b67226945c2be47c8fff31f1362412b973f68875');
assert.equal(packet.potionCommit,'402cdb49d81fe85be63f51fa14cbd2514ef4b29f');
assert.equal(packet.productCommit,'551677b7966437e07a95fc3b08ef8747d48a1a10');
assert.equal(packet.currentTreeCommitted,false,'auxiliary capture has no invented future commit');
for(const [path,row]of Object.entries(packet.files))for(const binding of [row.current,row.before,row.potion].filter(Boolean)){
 assert.equal(binding.source,norm(binding.source),path);assert.equal(hash(binding.source),binding.sha256,path);
 assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(binding.source)}\0`).update(binding.source).digest('hex'),binding.gitBlob,path);
}
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
export const potionBootstrapCiPacket=freeze(packet);
export function potionBootstrapCiCheckedSource(path,source,before){
 const row=Object.hasOwn(packet.files,path)?packet.files[path]:null;
 if(!row?.before||typeof source!=='string'||source.includes('\r\r\n'))return source;
 if(before&&row.before.sha256!==before.sha256)return source;
 return hash(norm(source))===row.current.sha256?row.before.source:source;
}
export function potionBootstrapCiSource(path,source,before){
 if(path.startsWith('src/')||path==='config/architecture.json')return source;
 return potionBootstrapCiCheckedSource(path,source,before);
}
// Actual linear CI predecessor: combined -> committed b672. Production stays raw.
export function potionBootstrapCiRead(read=readFileSync){return(path,encoding)=>{
 const raw=read(path,encoding),text=typeof raw==='string'?raw:raw.toString('utf8'),prior=potionBootstrapCiSource(path,text);
 return typeof raw==='string'?prior:prior===text?raw:Buffer.from(prior);
};}
// Explicit historical validation only; never use this reader as the raw entry.
export function potionBootstrapHistoricalRead(target,read=readFileSync){
 assert(['bootstrap','potion'].includes(target));
 return(path,encoding)=>{
  const raw=read(path,encoding),text=typeof raw==='string'?raw:raw.toString('utf8');
  const row=Object.hasOwn(packet.files,path)?packet.files[path]:null,binding=row?.[target==='bootstrap'?'before':'potion'];
  const prior=binding&&hash(norm(text))===row.current.sha256?binding.source:text;
  return typeof raw==='string'?prior:prior===text?raw:Buffer.from(prior);
 };
}
export function assertPotionBootstrapRawInventory(paths,kind='js'){
 assert(['js','lua'].includes(kind));
 assert.deepEqual([...paths].sort(),packet.currentInventory[kind],'complete potion bootstrap raw discovery inventory');
}
export function assertPotionBootstrapCiCurrent(read=readFileSync){
 for(const [path,row]of Object.entries(packet.files))
  assert.equal(hash(norm(read(path,'utf8'))),row.current.sha256,'fresh complete integration source: potion bootstrap '+path);
 for(const [path,sha]of Object.entries(packet.immutableArchives))
  assert.equal(hash(read(path)),sha,'retained immutable potion bootstrap predecessor: '+path);
}
