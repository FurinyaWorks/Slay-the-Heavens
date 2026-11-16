// CI-only complete bootstrap continuation. No gameplay source or production projector.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const hash=b=>createHash('sha256').update(b).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const bytes=readFileSync(new URL('./release-bootstrap-ci-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'868f4e717b4ebe7af6a77b8bf6239748629d6d11b6de6e15af9f0e668a3971d6','complete Release bootstrap CI continuation');
// Append an exact CI-only current view. The old bootstrap/integration archives
// and their hashes stay immutable; production code never imports this helper.
const capacityBytes=readFileSync(new URL('./task111-capacity-ci-source.json',import.meta.url));
assert.equal(hash(capacityBytes),'b30875912d25e3adcd6cd83a0c71c5c5c1d97f9a219c20f7094d667c2f584108','complete TASK-111 CI continuation');
const capacity=JSON.parse(capacityBytes);
assert.equal(capacity.schemaVersion,1);assert.equal(capacity.normalization,'LF');
assert.equal(capacity.baseCommit,'1cc5479b713edab6fd26db4e20f8eb22b7401cb2');
assert.equal(capacity.productionCommit,'be5466c1a35f78b660c3c7e712b714c98af0ce24');
assert.equal(capacity.currentTreeCommitted,false,'CI/test bindings are a capture after the production freeze');
assert.deepEqual(Object.keys(capacity.files),['scripts/official-portraits.mjs','scripts/platform-load.mjs','tests/official-portraits-build.test.mjs','tests/platform-load.test.mjs','tests/v25-portrait-profile.test.mjs']);
for(const [path,row]of Object.entries(capacity.files))for(const binding of [row.before,row.current]){
 assert.equal(binding.source,norm(binding.source),path);assert.equal(hash(binding.source),binding.sha256,path);
 assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(binding.source)}\0`).update(binding.source).digest('hex'),binding.gitBlob,path);
}
// Review correction is a new exact outer view; committed predecessor packets remain immutable.
const reviewBytes=readFileSync(new URL('./task111-capacity-review-ci-source.json',import.meta.url));
assert.equal(hash(reviewBytes),'6be10ce258d1d6654f91c01047bf442bf4b9cc7e2eafcf5137b3565ef832f325','complete TASK-111 review CI continuation');
const review=JSON.parse(reviewBytes);
assert.equal(review.schemaVersion,1);assert.equal(review.normalization,'LF');
assert.equal(review.baseCommit,'7d62a227af187c2df7edf4941adb8fb30cf708b6');
assert.equal(review.sourceComment,'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/703#issuecomment-6905101000');
assert.equal(review.currentTreeCommitted,false);
assert.deepEqual(Object.keys(review.files),['scripts/art/ready-card-runtime.mjs','scripts/build-ui.mjs','scripts/platform-load.mjs','tests/build-ui-input-protection.test.mjs','tests/platform-load.test.mjs']);
for(const [path,row]of Object.entries(review.files)){
 for(const binding of [row.before,row.current]){
  assert.equal(binding.source,norm(binding.source),path);assert.equal(hash(binding.source),binding.sha256,path);
  assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(binding.source)}\0`).update(binding.source).digest('hex'),binding.gitBlob,path);
 }
 if(capacity.files[path])assert.deepEqual(row.before,capacity.files[path].current,'retained TASK-111 predecessor: '+path);
}
function reviewBefore(path,source){
 const row=Object.hasOwn(review.files,path)?review.files[path]:null;
 if(!row||typeof source!=='string'||source.includes('\r\r\n'))return source;
 return hash(norm(source))===row.current.sha256?row.before.source:source;
}
function capacityBefore(path,source,before){
 source=reviewBefore(path,source);
 const row=Object.hasOwn(capacity.files,path)?capacity.files[path]:null;
 if(!row||typeof source!=='string'||source.includes('\r\r\n')||before&&row.before.sha256!==before.sha256)return source;
 return hash(norm(source))===row.current.sha256?row.before.source:source;
}
const packet=JSON.parse(gunzipSync(bytes));
assert.equal(packet.schemaVersion,1);assert.equal(packet.normalization,'LF');
assert.equal(packet.baseCommit,'36b9b157ee6f05b65eb9f1da7e2978647d36c210');
assert.equal(packet.bootstrapPredecessorCommit,'c2409ad750c15124b7b843c6bbfa5b222537cb75');
assert.equal(packet.currentCommit,packet.baseCommit);
assert.equal(packet.currentTreeCommitted,false,'auxiliary after bindings are a worktree capture, not claimed in bootstrap');
const bootstrap=['.github/workflows/licenses.yml','.github/workflows/quality.yml','.github/workflows/quick-feedback.yml'];
assert.deepEqual(Object.keys(packet.files).filter(p=>p.startsWith('.github/')).sort(),bootstrap);
assert.deepEqual(packet.currentInventory,packet.priorInventory,'bootstrap changes no test discovery');
for(const [path,row]of Object.entries(packet.files)){
 assert.equal(row.beforeCommit,bootstrap.includes(path)?packet.bootstrapPredecessorCommit:packet.baseCommit,'exact bootstrap CI predecessor: '+path);
 for(const binding of [row.before,row.current]){
  assert.equal(binding.source,norm(binding.source),path);assert.equal(hash(binding.source),binding.sha256,path);
  assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(binding.source)}\0`).update(binding.source).digest('hex'),binding.gitBlob,path);
 }
}
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
export const releaseBootstrapCiPacket=freeze(packet);
export const capacityCiPacket=freeze(capacity);
export const capacityReviewCiPacket=freeze(review);
function checkedSource(path,source,before){
 source=capacityBefore(path,source,before);
 const row=Object.hasOwn(packet.files,path)?packet.files[path]:null;
 if(!row||typeof source!=='string'||source.includes('\r\r\n'))return source;
 if(before&&row.before.sha256!==before.sha256)return source;
 return hash(norm(source))===row.current.sha256?row.before.source:source;
}
export const releaseBootstrapCiCheckedSource=checkedSource;
export function releaseBootstrapCiSource(path,source,before){
 if(path.startsWith('src/')||path==='config/architecture.json')return source;
 return checkedSource(path,source,before);
}
export function releaseBootstrapCiRead(read=readFileSync){return(path,encoding)=>{
 const raw=read(path,encoding),text=typeof raw==='string'?raw:raw.toString('utf8'),prior=releaseBootstrapCiSource(path,text);
 return typeof raw==='string'?prior:prior===text?raw:Buffer.from(prior);
};}
export function releaseBootstrapWorkflowBefore(path,source){
 assert(bootstrap.includes(path),'explicit complete bootstrap workflow');
 const row=packet.files[path];
 assert.equal(typeof source,'string');assert(!source.includes('\r\r\n'));
 assert.equal(hash(norm(source)),row.current.sha256,'fresh complete Release bootstrap workflow: '+path);
 return row.before.source;
}
export function assertReleaseBootstrapRawInventory(paths,kind='js'){
 assert(['js','lua'].includes(kind));
 assert.deepEqual([...paths].sort(),packet.currentInventory[kind],'complete Release bootstrap raw discovery inventory');
}
export function assertReleaseBootstrapCiCurrent(read=readFileSync){
 for(const [path,row]of Object.entries(review.files))
  assert.equal(hash(norm(read(path,'utf8'))),row.current.sha256,'fresh complete TASK-111 CI source: review '+path);
 for(const [path,row]of Object.entries(capacity.files))
  assert.equal(hash(norm(reviewBefore(path,read(path,'utf8')))),row.current.sha256,'fresh complete TASK-111 CI source: '+path);
 const rawRead=read;
 read=(path,encoding)=>{
  const raw=rawRead(path,encoding);
  if(!Object.hasOwn(capacity.files,path)&&!Object.hasOwn(review.files,path))return raw;
  const source=typeof raw==='string'?raw:raw.toString('utf8'),prior=capacityBefore(path,source);
  return typeof raw==='string'?prior:prior===source?raw:Buffer.from(prior);
 };
 for(const [path,row]of Object.entries(packet.files))
  assert.equal(hash(norm(read(path,'utf8'))),row.current.sha256,'fresh complete integration source: bootstrap '+path);
 for(const [path,sha]of Object.entries(packet.immutableArchives))
  assert.equal(hash(read(path)),sha,'retained complete immutable bootstrap predecessor: '+path);
}
