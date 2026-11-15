// CI-only PC06 continuation. The old Release/bootstrap receipts stay immutable.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const hash=b=>createHash('sha256').update(b).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const bytes=readFileSync(new URL('./pc06-settings-ci-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'cebeefff8b88e89c3763879dfb56140d44f5a86b6e93f641088657293cca44df','complete PC06 CI continuation');
const packet=JSON.parse(gunzipSync(bytes));
assert.equal(packet.schemaVersion,1);assert.equal(packet.normalization,'LF');
assert.equal(packet.baseCommit,'1cc5479b713edab6fd26db4e20f8eb22b7401cb2');
assert.equal(packet.productCommit,'21d48c4e41d0f2879acd4824a60e251c739433e8');
assert.equal(packet.currentTreeCommitted,false,'only the product is committed at collection');
assert.deepEqual(Object.keys(packet.files).sort(),['scripts/official-battle-hud.mjs','tests/ci-complete-calibration.test.mjs','tests/encounter-formation-source-epoch.test.mjs','tests/helpers/integrated-ci-source.mjs','tests/integrated-ci-source.cases.mjs','tests/official-run-chrome.test.mjs']);
assert.deepEqual(packet.inventory.js.length,876);assert.deepEqual(packet.inventory.lua.length,1423);
for(const [path,row]of Object.entries(packet.files)){
 assert.equal(row.beforeCommit,packet.baseCommit,'exact PC06 CI predecessor: '+path);
 assert.equal(row.project,path!=='scripts/official-battle-hud.mjs','only registered CI seams project: '+path);
 for(const binding of [row.before,row.current]){
  assert.equal(binding.source,norm(binding.source),path);assert.equal(hash(binding.source),binding.sha256,path);
  assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(binding.source)}\0`).update(binding.source).digest('hex'),binding.gitBlob,path);
 }
}
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
export const pc06CiPacket=freeze(packet);
export function pc06CiSource(path,source,before){
 const row=Object.hasOwn(packet.files,path)?packet.files[path]:null;
 if(!row?.project||typeof source!=='string'||source.includes('\r\r\n'))return source;
 if(before&&before.sha256!==row.before.sha256)return source;
 return hash(norm(source))===row.current.sha256?row.before.source:source;
}
// Binary reads remain binary. A Buffer supplied for UTF-8 is never promoted
// into an authenticated source string; current guards below reject it.
export function pc06CiRead(read=readFileSync){
 assert.equal(typeof read,'function');
 return(path,encoding)=>{const raw=read(path,encoding);return typeof raw==='string'?pc06CiSource(path,raw):raw;};
}
// An explicit historical test view, separate from the CI seam projector above.
// The current product remains visible to normal readers and current guards.
export function pc06HistoricalSource(path,source,read=readFileSync){
 const row=Object.hasOwn(packet.files,path)?packet.files[path]:null;
 if(!row||typeof source!=='string'||source.includes('\r\r\n')||hash(norm(source))!==row.current.sha256)return source;
 assertPc06CiCurrent(read);
 return row.before.source;
}
export function pc06HistoricalRead(read=readFileSync){
 assert.equal(typeof read,'function');
 return(path,encoding)=>{const raw=read(path,encoding);return typeof raw==='string'?pc06HistoricalSource(path,raw,read):raw;};
}
export function assertPc06CiCurrent(read=readFileSync){
 for(const [path,row]of Object.entries(packet.files)){
  const source=read(path,'utf8');assert.equal(typeof source,'string','fresh PC06 CI source text: '+path);
  assert.equal(hash(norm(source)),row.current.sha256,'fresh complete integration source: PC06 '+path);
 }
 for(const [path,sha]of Object.entries(packet.immutableArchives))
  assert.equal(hash(read(path)),sha,'retained immutable PC06 predecessor: '+path);
 for(const [path,sha]of Object.entries(packet.retainedSources)){
  const source=read(path,'utf8');assert.equal(typeof source,'string','retained PC06 source text: '+path);
  assert.equal(hash(norm(source)),sha,'retained PC06 trust/source boundary: '+path);
 }
}
