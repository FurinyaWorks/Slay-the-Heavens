// CI-only complete bootstrap continuation. No gameplay source or production projector.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const hash=b=>createHash('sha256').update(b).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const bytes=readFileSync(new URL('./release-bootstrap-ci-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'868f4e717b4ebe7af6a77b8bf6239748629d6d11b6de6e15af9f0e668a3971d6','complete Release bootstrap CI continuation');
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
function checkedSource(path,source,before){
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
 for(const [path,row]of Object.entries(packet.files))
  assert.equal(hash(norm(read(path,'utf8'))),row.current.sha256,'fresh complete integration source: bootstrap '+path);
 for(const [path,sha]of Object.entries(packet.immutableArchives))
  assert.equal(hash(read(path)),sha,'retained complete immutable bootstrap predecessor: '+path);
}
