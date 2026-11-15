// CI-only trust leaf; production and isolated production copies never import it.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const hash=b=>createHash('sha256').update(b).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const bytes=readFileSync(new URL('./release-picker-controls-ci-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'8f63e3cb7ee9b5a81139b4193589ce6f098e423d43b576d190925411681776fe','complete release picker controls CI continuation');
const packet=JSON.parse(gunzipSync(bytes));
assert.equal(packet.schemaVersion,1);assert.equal(packet.normalization,'LF');
assert.equal(packet.baseCommit,'1cc5479b713edab6fd26db4e20f8eb22b7401cb2');
assert.equal(packet.priorBaseCommit,'36b9b157ee6f05b65eb9f1da7e2978647d36c210');
assert.equal(packet.bootstrapPredecessorCommit,'c2409ad750c15124b7b843c6bbfa5b222537cb75');
assert.match(packet.currentCommit,/^[a-f0-9]{40}$/);
const bootstrap=['.github/workflows/licenses.yml','.github/workflows/quality.yml','.github/workflows/quick-feedback.yml'];
assert.deepEqual(Object.keys(packet.files).filter(p=>p.startsWith('.github/')).sort(),bootstrap);
for(const [path,row]of Object.entries(packet.files))assert.equal(row.beforeCommit,packet.baseCommit,'exact actual Release picker controls CI predecessor: '+path);
assert.equal(packet.currentTreeCommitted,true);
assert.deepEqual(packet.priorPickerPacket,{path:'tests/helpers/release-picker-controls-ci-before-release1cc-source.json.gz',sha256:'550daa97c0f2e9d96a965dbfb51ed49111fc8ebc4f92cb78f09c8eb0c745fc4f'});
assert.deepEqual(Object.keys(packet.bootstrapCurrentBindings).sort(),[
 '.github/workflows/licenses.yml','.github/workflows/quality.yml','.github/workflows/quick-feedback.yml',
 'tests/ci-complete-calibration.test.mjs','tests/ci-posix-concurrency.test.mjs','tests/engineering-quality.test.mjs',
 'tests/full-quality.test.mjs','tests/helpers/integrated-ci-source.mjs','tests/integrated-ci-source.cases.mjs','tests/quick-feedback.test.mjs',
],'complete ten actual Release bootstrap current sources');
for(const [path,row]of Object.entries(packet.bootstrapCurrentBindings))
 assert.deepEqual(packet.files[path].before,row.current,'exact actual Release bootstrap current predecessor: '+path);
for(const [path,row]of Object.entries(packet.files))for(const binding of [row.before,row.current].filter(Boolean)){
 assert.equal(binding.source,norm(binding.source),path);assert.equal(hash(binding.source),binding.sha256,path);
 assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(binding.source)}\0`).update(binding.source).digest('hex'),binding.gitBlob,path);
}
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
export const releasePickerControlsCiPacket=freeze(packet);
function checkedSource(path,source,before){
 const row=Object.hasOwn(packet.files,path)?packet.files[path]:null;
 if(!row?.before||typeof source!=='string'||source.includes('\r\r\n'))return source;
 if(before&&row.before.sha256!==before.sha256)return source;
 return hash(norm(source))===row.current.sha256?row.before.source:source;
}
// Only the explicit complete-CI validator may compare a production owner's
// freshly checked after binding with its immutable CI predecessor record.
export const releasePickerControlsCiCheckedSource=checkedSource;
export function releasePickerControlsCiSource(path,source,before){
 if(path.startsWith('src/')||path==='config/architecture.json')return source;
 return checkedSource(path,source,before);
}
export function releasePickerControlsCiRead(read=readFileSync){return(path,encoding)=>{
 const raw=read(path,encoding),text=typeof raw==='string'?raw:raw.toString('utf8'),prior=releasePickerControlsCiSource(path,text);
 return typeof raw==='string'?prior:prior===text?raw:Buffer.from(prior);
};}
export function releasePickerControlsPriorInventory(paths,kind='js',read=readFileSync){
 assert(['js','lua'].includes(kind));
 const before=packet.priorInventory[kind],current=packet.currentInventory[kind],sorted=[...paths].sort();
 if(JSON.stringify(sorted)===JSON.stringify(before))return [...paths];
 // Older complete receipt inventories have already left this outer layer.
 // Their own immutable validators retain the original missing/duplicate checks.
 if(!current.some(path=>!before.includes(path)&&sorted.includes(path)))return [...paths];
 assert.deepEqual(sorted,current,'complete release picker controls raw '+(kind==='lua'?'Lua discovery':'JS')+' inventory');
 for(const path of current.filter(p=>!before.includes(p)))
  assert.equal(hash(norm(read(path,'utf8'))),packet.files[path].current.sha256,'fresh release picker controls added inventory source: '+path);
 return [...before];
}
export function assertReleasePickerControlsRawInventory(paths,kind='js'){
 assert(['js','lua'].includes(kind));
 assert.deepEqual([...paths].sort(),packet.currentInventory[kind],'complete release picker controls raw discovery inventory');
}
// Performance forecasts remain diagnostic. These are the actual per-job
// execution deadlines, including the explicitly trusted local-only route.
export function assertReleasePickerControlsExecutionGuards(workflow){
 const source=norm(workflow),start=source.indexOf('\njobs:\n');
 assert(start>=0,'raw Quality jobs section');
 const jobs=Object.fromEntries(source.slice(start+7).split(/\n(?=  [A-Za-z0-9_-]+:\n)/).map(block=>[block.match(/^  ([A-Za-z0-9_-]+):\n/)?.[1],block]));
 for(const [job,expected]of [
  ['fast',"${{ matrix.os == 'windows-2025' && 45 || 30 }}"],
  ['rules',"${{ inputs.runner_pool == 'local-special' && 75 || 45 }}"],
  ['engineering-posix-shards','30']]){
  const values=[...(jobs[job]??'').matchAll(/^    timeout-minutes: (.*)$/gm)].map(match=>match[1]);
  assert.deepEqual(values,[expected],'raw Quality execution deadline: '+job);
 }
 const runners=[...jobs.rules.matchAll(/^    runs-on: (.*)$/gm)].map(match=>match[1]);
 assert.deepEqual(runners,["${{ github.event_name == 'workflow_dispatch' && inputs.runner_pool == 'local-special' && (github.ref == 'refs/heads/develop' || github.ref == 'refs/heads/master') && fromJSON('[\"self-hosted\", \"Windows\", \"X64\", \"slay-the-abyss\"]') || 'windows-2025' }}"],'raw Quality trusted local runner guard');
}
export function assertReleasePickerControlsCiCurrent(read=readFileSync){
 for(const [path,row]of Object.entries(packet.files))
  assert.equal(hash(norm(read(path,'utf8'))),row.current.sha256,'fresh complete integration source: release picker controls '+path);
 for(const [path,sha]of Object.entries(packet.immutableArchives))
  assert.equal(hash(read(path)),sha,'retained complete immutable release predecessor: '+path);
}
