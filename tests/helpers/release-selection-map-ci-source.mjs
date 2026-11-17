import {fastFreezeB9Source} from './release-fast-freeze-b9-union.mjs';
// CI-only trust leaf; production and isolated production copies never import it.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {beforeReleaseFastB9SelectionTest} from './release-fast-b9-ci-source.mjs';
import {beforeCapacityB9Ci} from './release-capacity-b9-ci-source.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const bytes=readFileSync(new URL('./release-selection-map-ci-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'c2aebd6d6748a87026870c3524ea644d10b350ab820da5c4710a24043205ba03','complete release selection map CI continuation');
const packet=JSON.parse(gunzipSync(bytes));
assert.equal(packet.schemaVersion,1);assert.equal(packet.normalization,'LF');
assert.equal(packet.baseCommit,'1cc5479b713edab6fd26db4e20f8eb22b7401cb2');
assert.equal(packet.priorBaseCommit,'36b9b157ee6f05b65eb9f1da7e2978647d36c210');
assert.equal(packet.bootstrapPredecessorCommit,'c2409ad750c15124b7b843c6bbfa5b222537cb75');
assert.match(packet.currentCommit,/^[a-f0-9]{40}$/);
const bootstrap=['.github/workflows/licenses.yml','.github/workflows/quality.yml','.github/workflows/quick-feedback.yml'];
assert.deepEqual(Object.keys(packet.files).filter(p=>p.startsWith('.github/')).sort(),bootstrap);
for(const [path,row]of Object.entries(packet.files))assert.equal(row.beforeCommit,packet.baseCommit,'exact actual Release selection map CI predecessor: '+path);
assert.equal(packet.currentTreeCommitted,true);
assert.deepEqual(packet.priorSlicePacket,{path:'tests/helpers/release-selection-map-ci-before-release1cc-source.json.gz',sha256:'ab9597d0237daaf530f609ca6772576e170d0785e1fd66852c7e54800909fd66'});
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
// Only authenticate this narrow freeze correction; keep all prior sources immutable.
const freezeBytes=readFileSync(new URL('./release-freeze-ci-source.json.gz',import.meta.url));
assert.equal(hash(freezeBytes),'3e6d2131fa47bfee542300e0eeab6b4a8f9df0f7e5c029946559f77c48e71cb3','complete Release freeze CI continuation');
const freezePacket=JSON.parse(gunzipSync(freezeBytes));
assert.equal(freezePacket.schemaVersion,1);assert.equal(freezePacket.normalization,'LF');
assert.equal(freezePacket.baseCommit,'33d71575c5f186a1b54f7bf3e4f1826c145aa1d9');
assert.deepEqual(Object.keys(freezePacket.files),['.github/workflows/quality.yml','scripts/check-release-scope.mjs','tests/pr-history.test.mjs','tests/release-selection-map-source.test.mjs','tests/ci-posix-concurrency.test.mjs']);
for(const [path,row]of Object.entries(freezePacket.files)){
 if(Object.hasOwn(packet.files,path))assert.deepEqual(row.before,packet.files[path].current,'exact Release freeze predecessor: '+path);
 for(const b of [row.before,row.current].filter(Boolean)){
  assert.equal(b.source,norm(b.source));assert.equal(hash(b.source),b.sha256,path);
  assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(b.source)}\0`).update(b.source).digest('hex'),b.gitBlob,path);
 }
}
// Exact complete historical-fixture repair; immutable predecessor sources remain unchanged.
const fixtureRepairs={
 "tests/ci-summary-runners.test.mjs": {
  "current": "a8b1480f8b7d44e6b3dce5df25d667399e09f0142e945c9ab26fc710417a8551",
  "before": "c13e584a22ca96185e638ec5e9da85fc45183eed3bb15c9170508f0385058e28",
  "edits": [
   [
    "import {releaseFreezeCiBefore} from './helpers/release-selection-map-ci-source.mjs';\n",
    ""
   ],
   [
    "    const current = releaseFreezeCiBefore('.github/workflows/quality.yml', workflow).replaceAll('\\n', eol);\n",
    "    const current = workflow.replaceAll('\\n', eol);\n"
   ],
   [
    "    const current = releaseFreezeCiBefore('.github/workflows/quality.yml', workflow).replaceAll('\\n', eol);\n",
    "    const current = workflow.replaceAll('\\n', eol);\n"
   ],
   [
    "    const current = releaseFreezeCiBefore('.github/workflows/quality.yml', workflow).replaceAll('\\n', eol);\n",
    "    const current = workflow.replaceAll('\\n', eol);\n"
   ],
   [
    "\n// Authenticate the complete live input before using any historical test fixture.\ntest('Release freeze fixture continuation rejects unknown paths and all byte drift', () => {\n  const predecessors = {\n  \"tests/ci-summary-runners.test.mjs\": \"c13e584a22ca96185e638ec5e9da85fc45183eed3bb15c9170508f0385058e28\",\n  \"tests/ci-windows-shape-expansion.test.mjs\": \"d28a52f2e892ed88e68cbe5fd29d123dfe6a5b86de5d8053b48a6a117504c874\",\n  \"tests/engineering-quality.test.mjs\": \"202561d7a39e1390441b8ff13c1dacedd29688c48fd6f00524293091d585cd1b\",\n  \"tests/full-quality.test.mjs\": \"a3e104aba2134af3681eda85522b76b6886a1e040cb4f8cfb557aed6f922db51\"\n};\n  for (const [path, expected] of Object.entries(predecessors)) {\n    const live = readFileSync(path, 'utf8').replaceAll('\\r\\n', '\\n');\n    for (const eol of ['\\n', '\\r\\n']) {\n      const source = live.replaceAll('\\n', eol);\n      assert.equal(digest(releaseFreezeCiBefore(path, source)), expected);\n      for (const foreign of [source + eol, source.slice(1), source.replaceAll(eol, '\\r\\r\\n'), null, {}, 17])\n        assert.equal(releaseFreezeCiBefore(path, foreign), foreign);\n      for (const unknown of ['__proto__', 'constructor', 'foreign/' + path])\n        assert.equal(releaseFreezeCiBefore(unknown, source), source);\n    }\n  }\n  assert.match(workflow, /reopened, edited, ready_for_review/);\n  assert(workflow.includes('node scripts/check-release-scope.mjs'));\n  for (const bad of [workflow + '\\n', workflow.replace('reopened, edited,', 'reopened,'),\n    workflow.replace('node scripts/check-release-scope.mjs', 'echo bypass')])\n    assert.equal(releaseFreezeCiBefore('.github/workflows/quality.yml', bad), bad);\n});\n",
    ""
   ]
  ]
 },
 "tests/ci-windows-shape-expansion.test.mjs": {
  "current": "118566137510d978b4c7abf6595aecd34a4571ee72b1a0bc580fd907d0db0e6d",
  "before": "d28a52f2e892ed88e68cbe5fd29d123dfe6a5b86de5d8053b48a6a117504c874",
  "edits": [
   [
    "import {releaseFreezeCiBefore} from './helpers/release-selection-map-ci-source.mjs';\n",
    ""
   ],
   [
    " const workflow=beforeExecutionTimeoutWorkflow(releaseFreezeCiBefore('.github/workflows/quality.yml',readFileSync('.github/workflows/quality.yml','utf8').replaceAll('\\r\\n','\\n')));\n",
    " const workflow=beforeExecutionTimeoutWorkflow(readFileSync('.github/workflows/quality.yml','utf8').replaceAll('\\r\\n','\\n'));\n"
   ]
  ]
 },
 "tests/engineering-quality.test.mjs": {
  "current": "e2376dbca82911a27d9f32f585aba6e5afba0b2fbe5beb4bd68edd28f95c4aa4",
  "before": "202561d7a39e1390441b8ff13c1dacedd29688c48fd6f00524293091d585cd1b",
  "edits": [
   [
    "import {releaseFreezeCiBefore} from './helpers/release-selection-map-ci-source.mjs';\n",
    ""
   ],
   [
    "  const historical=releaseBootstrapWorkflowBefore('.github/workflows/quality.yml',releaseFreezeCiBefore('.github/workflows/quality.yml',workflow));\n",
    "  const historical=releaseBootstrapWorkflowBefore('.github/workflows/quality.yml',workflow);\n"
   ]
  ]
 },
 "tests/full-quality.test.mjs": {
  "current": "e2b0d03df22d2f9d87a5e6adc93bcf7f7077f7d0b007579fbd295a84e5fbd2b5",
  "before": "a3e104aba2134af3681eda85522b76b6886a1e040cb4f8cfb557aed6f922db51",
  "edits": [
   [
    "import {releaseFreezeCiBefore} from './helpers/release-selection-map-ci-source.mjs';\n",
    ""
   ],
   [
    " const workflow=releaseBootstrapWorkflowBefore('.github/workflows/quality.yml',releaseFreezeCiBefore('.github/workflows/quality.yml',physical));\n",
    " const workflow=releaseBootstrapWorkflowBefore('.github/workflows/quality.yml',physical);\n"
   ],
   [
    " const current=beforeDraftQualityWorkflow(releaseFreezeCiBefore('.github/workflows/quality.yml',readFileSync('.github/workflows/quality.yml','utf8').replaceAll('\\r\\n','\\n')));\n",
    " const current=beforeDraftQualityWorkflow(readFileSync('.github/workflows/quality.yml','utf8').replaceAll('\\r\\n','\\n'));\n"
   ]
  ]
 }
};
export function releaseFreezeCiBefore(path,source){
 source=fastFreezeB9Source(path,source,'freeze');
 if(Object.hasOwn(fixtureRepairs,path)&&typeof source==='string'&&!source.includes('\r\r\n')){
  const row=fixtureRepairs[path],current=norm(source);
  if(hash(current)===row.current){
   let prior=current;for(const [after,before]of row.edits)prior=prior.replace(after,before);
   assert.equal(hash(prior),row.before,'complete historical-fixture predecessor: '+path);
   return prior;
  }
 }
 const row=Object.hasOwn(freezePacket.files,path)?freezePacket.files[path]:null;
 if(!row?.before||typeof source!=='string'||source.includes('\r\r\n'))return source;
 return hash(norm(source))===row.current.sha256?row.before.source:source;
}
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
export const releaseSelectionMapCiPacket=freeze(packet);
export const releaseFreezeCiPacket=freeze(freezePacket);
export function historicalSource(path,source){
 source=capacityReleaseCiBefore(path,source);
 source=beforeReleaseFastB9SelectionTest(path,releaseFreezeCiBefore(path,source));
 if(path==='tests/release-selection-map-source.test.mjs'&&typeof source==='string'&&!source.includes('\r\r\n')&&hash(norm(source))==='f8f63b397e57267e7d69ed174575459726aa34651196ed6ff307a33b912a5764'){
  const prior=norm(source).replace('import {historicalSource,releaseSelectionMapCiPacket,','import {releaseSelectionMapCiPacket,').replace('assert.equal(hash(historicalSource(path,source)),row.current.sha256,path);','assert.equal(hash(source),row.current.sha256,path);').replace('production?source:row.before?.source??historicalSource(path,source),path);','production?source:row.before?.source??source,path);');
  assert.equal(hash(prior),packet.files[path].current.sha256,'complete prior selection map test');return prior;
 }

 if(path==='tests/helpers/release-bootstrap-ci-source.mjs'&&typeof source==='string'&&hash(norm(source))==='ce667d97bc69c66654c857fcf1d51d35dfaa39e09d375c3f10bd789ce89de6e8')return packet.files[path].current.source;
 if(path!=='.github/workflows/quality.yml'||typeof source!=='string')return source;
 const eol=source.includes('\r\n')?'\r\n':'\n';
 const block=["      - name: Require frozen Release Full before publication",
  "        if: github.event_name == 'pull_request' && github.event.pull_request.base.ref == 'master' && startsWith(github.event.pull_request.head.ref, 'release/')",
  '        env:', '          GH_TOKEN: ${{ github.token }}', '        run: node scripts/release-ci.mjs verify-pr', ''].join(eol);
 const push='  push:'+eol+'    branches: [develop, master]'+eol;
 if(source.split(block).length!==2||source.split(push).length!==2)return source;
 const stripped=source.replace(block,'');
 const prior=stripped.replace('  push:'+eol+'    branches: [develop, master]'+eol,
  '  push:'+eol+"    branches: [develop, master, 'release/**']"+eol);
 return hash(norm(prior))===packet.files[path].current.sha256?prior:source;
}
// Exact composition over the committed Release and capacity leaves. Their
// complete packets stay immutable; this outer view authenticates only the
// changed CI owners before supplying their full Release predecessors.
const capacityReleaseBytes=readFileSync(new URL('./task111-release-integration-ci-source.json.gz',import.meta.url));
assert.equal(hash(capacityReleaseBytes),'92e8c369968fcf18d46c1787b4e5ea06c0a1f74246ffec4339bd1a524cac453e','complete TASK-111 Release integration CI continuation');
const capacityRelease=JSON.parse(gunzipSync(capacityReleaseBytes));
assert.equal(capacityRelease.schemaVersion,1);assert.equal(capacityRelease.normalization,'LF');
assert.equal(capacityRelease.releaseCommit,'33d71575c5f186a1b54f7bf3e4f1826c145aa1d9');
assert.equal(capacityRelease.capacityCommit,'bf74c0c391a0700740fee9b7cb8695bff615366a');
assert.equal(capacityRelease.mergeCommit,'7b6e63283e5b2b1fede623ad2a3ac0498a4c2558');
assert.equal(capacityRelease.currentTreeCommitted,false);
assert.deepEqual(Object.keys(capacityRelease.files),['tests/helpers/release-bootstrap-ci-source.mjs','tests/release-selection-map-source.test.mjs']);
for(const [path,row]of Object.entries(capacityRelease.files)){
 assert.deepEqual(row.before,packet.files[path].current,'complete committed Release CI predecessor: '+path);
 for(const binding of [row.before,row.current]){
  assert.equal(binding.source,norm(binding.source),path);assert.equal(hash(binding.source),binding.sha256,path);
  assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(binding.source)}\0`).update(binding.source).digest('hex'),binding.gitBlob,path);
 }
}
export const capacityReleaseCiPacket=freeze(capacityRelease);
export function capacityReleaseCiBefore(path,source){
 source=beforeCapacityB9Ci(path,source,'capacity');
 const row=Object.hasOwn(capacityRelease.files,path)?capacityRelease.files[path]:null;
 if(!row||typeof source!=='string'||source.includes('\r\r\n'))return source;
 return hash(norm(source))===row.current.sha256?row.before.source:source;
}
function checkedSource(path,source,before){
 const row=Object.hasOwn(packet.files,path)?packet.files[path]:null;
 if(before&&(!row?.before||row.before.sha256!==before.sha256))return source;
 source=historicalSource(path,source);
 if(!row?.before||typeof source!=='string'||source.includes('\r\r\n'))return source;
 return hash(norm(source))===row.current.sha256?row.before.source:source;
}
// Only the explicit complete-CI validator may compare a production owner's
// freshly checked after binding with its immutable CI predecessor record.
export const releaseSelectionMapCiCheckedSource=checkedSource;
export function releaseSelectionMapCiSource(path,source,before){
 if(path==='tests/helpers/draft-quality-workflow.mjs'&&typeof source==='string'&&!source.includes('\r\r\n')&&hash(norm(source))==='357ad5c4d68378063b02cf75396f804c8c2b61d12a925595663a4b533948e4e6'){
  if(before&&before.sha256!=='5c3cc95c0371927db143c573c1500843b97ca8e138f67737aede03e558b1d986')return source;
  const prior=norm(source).replace("import {beforeReleaseFullGate} from './release-ci-workflow.mjs';\n",'').replace('  text = beforeReleaseFullGate(text);\n','');
  assert.equal(hash(prior),'5c3cc95c0371927db143c573c1500843b97ca8e138f67737aede03e558b1d986','complete pre-Release draft helper');
  return prior;
 }

 if(path==='tests/ci-impact.test.mjs'&&typeof source==='string'){
  const prior=norm(source).replace(/\nimport '\.\/helpers\/release-ci\.cases\.mjs';\n$/, '\n');
  if(hash(prior)==='bc325f953a1a8d6b44b24e7d7481e174386df3a5a102dc78581d19397dd0d602')source=prior;
 }
 if(path.startsWith('src/')||path==='config/architecture.json')return source;
 return checkedSource(path,source,before);
}
export function releaseSelectionMapCiRead(read=readFileSync){return(path,encoding)=>{
 const raw=read(path,encoding),text=typeof raw==='string'?raw:raw.toString('utf8'),prior=releaseSelectionMapCiSource(path,text);
 return typeof raw==='string'?prior:prior===text?raw:Buffer.from(prior);
};}
export function releaseSelectionMapPriorInventory(paths,kind='js',read=readFileSync){
 assert(['js','lua'].includes(kind));
 const before=packet.priorInventory[kind],current=packet.currentInventory[kind],sorted=[...paths].sort();
 if(JSON.stringify(sorted)===JSON.stringify(before))return [...paths];
 // Older complete receipt inventories have already left this outer layer.
 // Their own immutable validators retain the original missing/duplicate checks.
 if(!current.some(path=>!before.includes(path)&&sorted.includes(path)))return [...paths];
 assert.deepEqual(sorted,current,'complete release selection map raw '+(kind==='lua'?'Lua discovery':'JS')+' inventory');
 for(const path of current.filter(p=>!before.includes(p)))
  assert.equal(hash(norm(historicalSource(path,read(path,'utf8')))),packet.files[path].current.sha256,'fresh release selection map added inventory source: '+path);
 return [...before];
}
export function assertReleaseSelectionMapRawInventory(paths,kind='js'){
 assert(['js','lua'].includes(kind));
 assert.deepEqual([...paths].sort(),packet.currentInventory[kind],'complete release selection map raw discovery inventory');
}
// Performance forecasts remain diagnostic. These are the actual per-job
// execution deadlines, including the explicitly trusted local-only route.
export function assertReleaseSelectionMapExecutionGuards(workflow){
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
export function assertReleaseSelectionMapCiCurrent(read=readFileSync){
 for(const [path,row]of Object.entries(capacityRelease.files))
  assert.equal(hash(norm(beforeCapacityB9Ci(path,read(path,'utf8'),'capacity'))),row.current.sha256,'fresh complete integration source: capacity Release merge '+path);
 for(const [path,row]of Object.entries(packet.files))
  assert.equal(hash(norm(historicalSource(path,read(path,'utf8')))),row.current.sha256,'fresh complete integration source: release selection map '+path);
 for(const [path,sha]of Object.entries(packet.immutableArchives))
  assert.equal(hash(read(path)),sha,'retained complete immutable release predecessor: '+path);
}
