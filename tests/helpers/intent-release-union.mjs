// Exact current Release/intent composition. Historical fixtures below replay
// immutable parents only; current admission always authenticates live raw bytes.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const hash=b=>createHash('sha256').update(b).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const archive='tests/helpers/intent-release-union.json.gz';
const digest='5fb5f766d0db3629c8feedfab1c63d211b78c5455f59a0aded1714734b017a23';
const bytes=readFileSync(new URL('./intent-release-union.json.gz',import.meta.url));
assert.equal(hash(bytes),digest,'complete actual Release and intent union');
const packet=JSON.parse(gunzipSync(bytes));
assert.deepEqual(packet.parents,{release:'af77fb2461c548f0faf104761d107397f75dca08',intent:'e1221ee0abc265a720cd71a87d01b9d109c51475'});
assert.equal(packet.currentTreeCommitted,false,'CI capture is separate from committed product producers');
for(const [path,row]of Object.entries(packet.files))for(const binding of [row.current,...Object.values(row.parents)].filter(Boolean)){
 assert.equal(binding.source,norm(binding.source));assert.equal(hash(binding.source),binding.sha256,path+' complete source');
 assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(binding.source)}\0`).update(binding.source).digest('hex'),binding.gitBlob,path+' Git identity');
}
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
export const intentReleasePacket=freeze(packet);
export function assertIntentReleaseCurrent(read=readFileSync){
 assert.equal(hash(read(archive)),digest,'fresh immutable actual Release and intent union archive');
 const leaf=read('tests/helpers/intent-release-union.mjs','utf8');
 assert.equal(typeof leaf,'string');assert(!leaf.includes('\r\r\n'));
 assert.equal(hash(norm(leaf).replace(/const digest='[a-f0-9]{64}';/,"const digest='UNION_PACKET_SHA';")),packet.leafTemplateSha,'fresh complete integration source: intent Release trust leaf');
 for(const [path,row]of Object.entries(packet.files)){
  const source=read(path,'utf8');assert.equal(typeof source,'string','fresh complete integration source: '+path);
  assert(!source.includes('\r\r\n'),'fresh complete integration source malformed EOL: '+path);
  assert.equal(hash(norm(source)),row.current.sha256,'fresh complete integration source: intent Release '+path);
 }
 for(const [path,sha]of Object.entries(packet.archives))assert.equal(hash(read(path)),sha,'immutable intent Release predecessor: '+path);
}
function checked(path,source,target,before){
 assert(Object.hasOwn(packet.parents,target),'explicit actual Release or intent domain');
 const row=Object.hasOwn(packet.files,path)?packet.files[path]:null,prior=row?.parents[target];
 if(!prior||typeof source!=='string'||source.includes('\r\r\n')||before&&before.sha256!==prior.sha256||hash(norm(source))!==row.current.sha256||prior.sha256===row.current.sha256)return source;
 return source.includes('\r\n')?prior.source.replaceAll('\n','\r\n'):prior.source;
}
export function intentReleaseCiSource(path,source,target='release',read=readFileSync,before){
 if(path.startsWith('src/')||path==='config/architecture.json')return source;
 const prior=checked(path,source,target,before);
 if(prior!==source)assertIntentReleaseCurrent(read);
 return prior;
}
// Full production history is deliberately explicit and separately named from
// CI projection. Each conversion rechecks the same caller's complete raw corpus.
export function intentReleaseHistoricalRead(target='release',read=readFileSync){return(path,encoding)=>{
 const raw=read(path,encoding);if(typeof raw!=='string'&&!Buffer.isBuffer(raw))return raw;
 const source=typeof raw==='string'?raw:raw.toString('utf8'),prior=checked(path,source,target);
 if(prior===source)return raw;
 assertIntentReleaseCurrent(read);
 return typeof raw==='string'?prior:Buffer.from(prior);
};}
export function assertIntentReleaseRawInventory(paths,kind='js'){
 assert(['js','lua'].includes(kind));assert.deepEqual([...paths].sort(),packet.inventory[kind],'complete actual intent Release raw discovery inventory');
}
export function intentReleasePriorInventory(paths,kind='js',target='release',read=readFileSync){
 assert(['js','lua'].includes(kind));assert(Object.hasOwn(packet.parents,target));
 const prior=packet.parentInventories[target][kind],sorted=[...paths].sort();
 if(JSON.stringify(sorted)===JSON.stringify(prior))return [...paths];
 assertIntentReleaseRawInventory(paths,kind);assertIntentReleaseCurrent(read);return [...prior];
}
// An invocation-scoped gate for existing complete validators. No authorization
// or live bytes survive this call; the supplied operation gets the same reader.
export function withIntentReleaseCurrent(target,read,operation){
 assertIntentReleaseCurrent(read);
 return operation((path,encoding)=>{
  const raw=read(path,encoding);if(typeof raw!=='string'&&!Buffer.isBuffer(raw))return raw;
  const source=typeof raw==='string'?raw:raw.toString('utf8'),prior=checked(path,source,target);
  return prior===source?raw:typeof raw==='string'?prior:Buffer.from(prior);
 });
}
// Test fixture only: immutable original parent sources and exact inventory.
// This never certifies the current tree. Original fault injection wraps this
// reader downstream, so missing/null/drift still reach the original validators.
export function intentReleaseFixtureRead(target,read=readFileSync){
 assert(Object.hasOwn(packet.parents,target));
 return(path,encoding)=>{
  const row=Object.hasOwn(packet.files,path)?packet.files[path].parents[target]:null;
  if(row)return encoding?row.source:Buffer.from(row.source);
  return read(path,encoding);
 };
}
export function intentReleaseFixtureInventory(kind='js',target='release'){
 assert(['js','lua'].includes(kind));assert(Object.hasOwn(packet.parents,target));return [...packet.parentInventories[target][kind]];
}
