// Exact current preparation -> independent parent views. Not release acceptance.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {sourceEpoch} from './closeout-source-epoch.mjs';
const PACKET_SHA='96e6399468a6d82f5ad3c4345ef913d76fa29b564e1ae24b22ff70135dae603f';
const hash=b=>createHash('sha256').update(b).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const bytes=readFileSync(new URL('./potion-pointer-ci-union.json.gz',import.meta.url));
assert.equal(hash(bytes),PACKET_SHA,'immutable potion-pointer CI union');
const packet=JSON.parse(gunzipSync(bytes));
const contractsPriorPath='tests/helpers/potion-pointer-ci-before-contracts.json.gz';
const contractsPriorSha='59a9caa65c459476abd135caddd73a35ba4a69e7784207c089afd5084f555b52';
const contractsPriorBytes=readFileSync(new URL('./potion-pointer-ci-before-contracts.json.gz',import.meta.url));
assert.equal(hash(contractsPriorBytes),contractsPriorSha,'exact pre-contracts union');
assert.equal(packet.contractsPredecessorCommit,'80921cad5e545ce58b43a2fd8596a930fce71d51');
assert.equal(packet.contractsPredecessorSha256,contractsPriorSha);
const contractsPrior=JSON.parse(gunzipSync(contractsPriorBytes));
const contractsChanges=['tests/release-selection-map-source.test.mjs','tests/helpers/copy-integration-source-closure.mjs','tests/helpers/potion-pointer-ci-copy-closure.json'];
assert.deepEqual(Object.keys(packet.files),Object.keys(contractsPrior.files));
for(const [path,row]of Object.entries(contractsPrior.files)){
 if(!contractsChanges.includes(path))assert.deepEqual(packet.files[path],row,'unchanged pre-contracts input '+path);
 assert.deepEqual(Object.keys(packet.files[path].views),Object.keys(row.views),'unchanged pre-contracts domains '+path);
 for(const [target,view]of Object.entries(row.views)){
  assert.equal(packet.files[path].views[target].sha256,view.sha256,'unchanged pre-contracts parent '+path);
  if(view.source!==undefined)assert.equal(packet.files[path].views[target].source,view.source,'retained pre-contracts source '+path);
 }
}
const pointerCiPriorPath='tests/helpers/potion-pointer-ci-before-pointer.json.gz';
const pointerCiPriorSha='d5654ff207845a19b5a3221b9e7e8ec27319d865a556c525f40972c1e0d99255';
const pointerCiPriorBytes=readFileSync(new URL('./potion-pointer-ci-before-pointer.json.gz',import.meta.url));
assert.equal(hash(pointerCiPriorBytes),pointerCiPriorSha,'exact pre-pointer CI union');
assert.equal(packet.pointerCiPredecessorCommit,'0780e604323bc78139e0fcf3fc68f1b9d78e6ca8');
assert.equal(packet.pointerCiPredecessorSha256,pointerCiPriorSha);
const pointerCiPrior=JSON.parse(gunzipSync(pointerCiPriorBytes));
const addedPointerCiPaths=['battle-pointer-ci-source','battle-pointer-sparse-ci-source','battle-pointer-inspection-ci-source'].flatMap(name=>['mjs','json.gz'].map(ext=>'tests/helpers/'+name+'.'+ext));
const pointerCiChanges=['tests/ci-complete-calibration.test.mjs','tests/helpers/copy-integration-source-closure.mjs','tests/helpers/potion-pointer-ci-copy-closure.json',...addedPointerCiPaths];
assert.deepEqual(Object.keys(contractsPrior.files),[...Object.keys(pointerCiPrior.files),...addedPointerCiPaths].sort());
for(const [path,row]of Object.entries(pointerCiPrior.files)){
 if(!pointerCiChanges.includes(path))assert.deepEqual(contractsPrior.files[path],row,'unchanged pre-pointer CI input '+path);
 assert.deepEqual(Object.keys(contractsPrior.files[path].views),Object.keys(row.views),'unchanged pre-pointer CI domains '+path);
 for(const [target,view]of Object.entries(row.views)){
  assert.equal(contractsPrior.files[path].views[target].sha256,view.sha256,'unchanged pre-pointer CI parent '+path);
  if(view.source!==undefined)assert.equal(contractsPrior.files[path].views[target].source,view.source,'retained pre-pointer CI parent source '+path);
 }
}
const behaviorPriorPath='tests/helpers/potion-pointer-ci-before-behavior.json.gz';
const behaviorPriorSha='c3b5c1472a46517f1dd3c636cb9a639737829782a4b8651faeb1f12523193345';
const behaviorPriorBytes=readFileSync(new URL('./potion-pointer-ci-before-behavior.json.gz',import.meta.url));
assert.equal(hash(behaviorPriorBytes),behaviorPriorSha,'exact pre-behavior union');
assert.equal(packet.behaviorPredecessorCommit,'1b3b5834ddf8deaf73c3cd392e496b3aca7e085f');
assert.equal(packet.behaviorPredecessorSha256,behaviorPriorSha);
const behaviorPrior=JSON.parse(gunzipSync(behaviorPriorBytes));
const addedBehaviorPaths=['tests/lua/support/battle_pointer_identity_cases.lua','tests/lua/support/battle_sparse_pointer_cases.lua'];
const behaviorChanges=['tests/mobile-card-release.test.mjs','tests/helpers/copy-integration-source-closure.mjs','tests/helpers/potion-pointer-ci-copy-closure.json',...addedBehaviorPaths];
assert.deepEqual(Object.keys(pointerCiPrior.files),[...Object.keys(behaviorPrior.files),...addedBehaviorPaths].sort());
for(const [path,row]of Object.entries(behaviorPrior.files)){
 if(!behaviorChanges.includes(path))assert.deepEqual(pointerCiPrior.files[path],row,'unchanged pre-behavior input '+path);
 assert.deepEqual(Object.keys(pointerCiPrior.files[path].views),Object.keys(row.views),'unchanged pre-behavior domains '+path);
 for(const [target,view]of Object.entries(row.views)){
  assert.equal(pointerCiPrior.files[path].views[target].sha256,view.sha256,'unchanged pre-behavior parent '+path);
  if(view.source!==undefined)assert.equal(pointerCiPrior.files[path].views[target].source,view.source,'retained pre-behavior parent source '+path);
 }
}
const copyPriorPath='tests/helpers/potion-pointer-ci-before-copy.json.gz';
const copyPriorSha='0347d209241d64516606376302ecdd8d0c90d13237628eb3b9f702ec9c51dc79';
const copyPriorBytes=readFileSync(new URL('./potion-pointer-ci-before-copy.json.gz',import.meta.url));
assert.equal(hash(copyPriorBytes),copyPriorSha,'exact pre-copy union');
assert.equal(packet.copyPredecessorCommit,'0e1eae89f1240572a35f34af5cb07dd0c3816a92');
assert.equal(packet.copyPredecessorSha256,copyPriorSha);
const copyPrior=JSON.parse(gunzipSync(copyPriorBytes));
const addedCopyPaths=['tests/helpers/potion-pointer-ci-copy-closure.json'];
const copyChanges=['tests/helpers/copy-integration-source-closure.mjs',...addedCopyPaths];
assert.deepEqual(Object.keys(behaviorPrior.files),[...Object.keys(copyPrior.files),...addedCopyPaths].sort());
for(const [path,row]of Object.entries(behaviorPrior.files))if(!copyChanges.includes(path))assert.deepEqual(row,copyPrior.files[path],'unchanged pre-copy input '+path);
const readersPriorPath='tests/helpers/potion-pointer-ci-before-readers.json.gz';
const readersPriorSha='2550d7de0c1b491e342b2a50d453fd4553593f524da152181da6cff0fcdd0435';
const readersPriorBytes=readFileSync(new URL('./potion-pointer-ci-before-readers.json.gz',import.meta.url));
assert.equal(hash(readersPriorBytes),readersPriorSha,'exact pre-readers union');
assert.equal(packet.readersPredecessorCommit,'43be61802b62d9783e801ab672ecd5d52afec3a6');
assert.equal(packet.readersPredecessorSha256,readersPriorSha);
const readersPrior=JSON.parse(gunzipSync(readersPriorBytes));
const addedReaderPaths=['tests/helpers/joint-ui-ci-source-inverse.mjs','tests/helpers/closeout-ci-source.mjs','tests/helpers/run-hud-ci-source.mjs','tests/helpers/sts-style-ci-source.mjs','tests/helpers/menu-red-ci-source.mjs'];
const readerChanges=['tests/ci-complete-calibration.test.mjs','tests/integrated-ci-source.cases.mjs', 'tests/helpers/integrated-ci-source.mjs', 'tests/helpers/joint-ui-ci-source-inverse.mjs', 'tests/helpers/closeout-ci-source.mjs', 'tests/helpers/run-hud-ci-source.mjs', 'tests/helpers/sts-style-ci-source.mjs', 'tests/helpers/menu-red-ci-source.mjs'];
assert.deepEqual(Object.keys(behaviorPrior.files),[...Object.keys(readersPrior.files),...addedReaderPaths,...addedCopyPaths].sort());
for(const [path,row]of Object.entries(behaviorPrior.files))if(![...readerChanges,...copyChanges].includes(path))assert.deepEqual(row,readersPrior.files[path],'unchanged pre-readers input '+path);
const calibrationPriorPath='tests/helpers/potion-pointer-ci-before-calibration.json.gz';
const calibrationPriorSha='7b049aac614a17f37f3c272e11c45df127c43f83d5109567018ea548ac921081';
const calibrationPriorBytes=readFileSync(new URL('./potion-pointer-ci-before-calibration.json.gz',import.meta.url));
assert.equal(hash(calibrationPriorBytes),calibrationPriorSha,'exact pre-calibration union');
assert.equal(packet.calibrationPredecessorCommit,'d2a8fa6d3d0beba9774b07083589a867497efba2');
assert.equal(packet.calibrationPredecessorSha256,calibrationPriorSha);
const calibrationPrior=JSON.parse(gunzipSync(calibrationPriorBytes));
assert.deepEqual(Object.keys(behaviorPrior.files).filter(path=>![...addedReaderPaths,...addedCopyPaths].includes(path)),Object.keys(calibrationPrior.files));
for(const [path,row]of Object.entries(behaviorPrior.files))if(![...readerChanges,...copyChanges].includes(path))assert.deepEqual(row,calibrationPrior.files[path],'unchanged pre-calibration input '+path);
const integratedPriorBytes=readFileSync(new URL('./potion-pointer-ci-before-integrated.json.gz',import.meta.url));
const integratedPriorSha='4e21ceac3bdf6bf34a7f4c3d9426c8b26a3c6f7eee600b3688f79154fcc0b22b';
assert.equal(hash(integratedPriorBytes),integratedPriorSha,'exact pre-integrated union');
assert.equal(packet.integratedPredecessorCommit,'324d2a2797201725cb104097567d69da681b84a8');
assert.equal(packet.integratedPredecessorSha256,integratedPriorSha);
const integratedPrior=JSON.parse(gunzipSync(integratedPriorBytes));
assert.deepEqual(Object.keys(behaviorPrior.files).filter(path=>![...addedReaderPaths,...addedCopyPaths].includes(path)),Object.keys(integratedPrior.files));
for(const [path,row]of Object.entries(behaviorPrior.files))if(!['tests/integrated-ci-source.cases.mjs',...readerChanges,...copyChanges].includes(path))assert.deepEqual(row,integratedPrior.files[path],'unchanged previous consumer binding '+path);
const priorPacketPath='tests/helpers/potion-pointer-ci-before-selection.json.gz';
const priorPacketSha='ed0dd1a847de736030747f4b1b2a051e42930830a885046ffc96c11270098ccb';
const priorBytes=readFileSync(new URL('./potion-pointer-ci-before-selection.json.gz',import.meta.url));
assert.equal(hash(priorBytes),priorPacketSha,'immutable pre-selection CI union');
assert.equal(packet.predecessorCommit,'7d02a6ae3be107730b7c1c128720e22c8431cbbe');
assert.equal(packet.predecessorPacketSha256,priorPacketSha);
const previous=JSON.parse(gunzipSync(priorBytes));
assert.deepEqual(Object.keys(behaviorPrior.files).filter(path=>![...addedReaderPaths,...addedCopyPaths].includes(path)),Object.keys(previous.files),'complete predecessor CI input set');
for(const [path,row]of Object.entries(behaviorPrior.files)){
 if([...addedReaderPaths,...addedCopyPaths].includes(path))continue;
 assert.deepEqual(Object.keys(row.views),Object.keys(previous.files[path].views),'unchanged parent domains '+path);
 for(const [target,view]of Object.entries(row.views)){
  const before=previous.files[path].views[target];
  assert.equal(view.sha256,before.sha256,'unchanged original parent identity '+path);
  if(before.source!==undefined)assert.equal(view.source,before.source,'unchanged complete original parent source '+path);
 }
 if(!['tests/release-selection-map-source.test.mjs','tests/integrated-ci-source.cases.mjs',...readerChanges,...copyChanges].includes(path))assert.deepEqual(row.current,previous.files[path].current,'unchanged other union input '+path);
}
assert.equal(packet.schemaVersion,1);assert.equal(packet.normalization,'LF');
assert.equal(packet.baseCommit,'29ae8d2cb2a5b729c348191ee56910b1aa77386c');
assert.deepEqual(packet.viewCommits,{potion:'eabff9b0bf2cce17ae05913c0e5d47366d0ff173',pointer:'ad6fe84dbcc11e28e8a82258f889a6841b46c8c6'});
const saved=(row,target)=>{const view=row.views[target];return view?row.current.encoding==='base64'?Buffer.from(view.source,'base64'):view.source:null;};
for(const row of Object.values(packet.files))for(const target of Object.keys(row.views))if(row.views[target].sha256!==row.current.sha256)assert.equal(hash(saved(row,target)),row.views[target].sha256,'complete exact CI union predecessor');
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
export const potionPointerCiUnionPacket=freeze(packet);
const authenticatedSnapshots=new WeakSet();
export function assertPotionPointerCiUnionCurrent(read=readFileSync){
 if(authenticatedSnapshots.has(read))return;
 assert.equal(hash(read(contractsPriorPath)),contractsPriorSha,'fresh pre-contracts union');
 assert.equal(hash(read(pointerCiPriorPath)),pointerCiPriorSha,'fresh pre-pointer CI union');
 assert.equal(hash(read(behaviorPriorPath)),behaviorPriorSha,'fresh pre-behavior union');
 assert.equal(hash(read(copyPriorPath)),copyPriorSha,'fresh pre-copy union');
 assert.equal(hash(read(readersPriorPath)),readersPriorSha,'fresh pre-readers union');
 assert.equal(hash(read(calibrationPriorPath)),calibrationPriorSha,'fresh pre-calibration union');
 assert.equal(hash(read('tests/helpers/potion-pointer-ci-before-integrated.json.gz')),integratedPriorSha,'fresh pre-integrated union');
 assert.equal(hash(read(priorPacketPath)),priorPacketSha,'fresh immutable pre-selection CI union');
 assert.equal(hash(read('tests/helpers/potion-pointer-ci-union.json.gz')),PACKET_SHA,'fresh immutable potion-pointer CI union');
 // Authenticate every product source, not merely the changed/previously-owned slice.
 for(const [path,row]of Object.entries(sourceEpoch.proof.current))if(row){
  const raw=read(path,'utf8');assert.equal(typeof raw,'string','fresh union owner '+path);
  assert(!raw.includes('\r\r\n'),'malformed union owner '+path);
  assert.equal(hash(norm(raw)),row.sha256,'fresh union owner '+path);
 }
 for(const [path,row]of Object.entries(packet.files)){
  const raw=read(path,row.current.encoding==='base64'?undefined:'utf8');
  if(typeof raw==='string')assert(!raw.includes('\r\r\n'),'malformed union input '+path);
  assert.equal(hash(typeof raw==='string'?norm(raw):raw),row.current.sha256,'fresh union input '+path);
 }
}
export function potionPointerCiUnionSource(path,source,target='potion',read=readFileSync,{production=false}={}){
 assert(Object.hasOwn(packet.viewCommits,target),'explicit potion-pointer predecessor');
 if(!production&&(path.startsWith('src/')||path==='config/architecture.json'))return source;
 const row=Object.hasOwn(packet.files,path)?packet.files[path]:null;
 if(!row?.views[target]||row.current.encoding!=='utf8'||typeof source!=='string'||source.includes('\r\r\n')||hash(norm(source))!==row.current.sha256)return source;
 const prior=saved(row,target);if(row.views[target].sha256===row.current.sha256)return source;
 assertPotionPointerCiUnionCurrent(read);return prior;
}
export function potionPointerCiUnionRead(target='potion',read=readFileSync,{production=false}={}){return(path,encoding)=>{
 const raw=read(path,encoding);if(raw===null||raw===undefined)return raw;
 const row=Object.hasOwn(packet.files,path)?packet.files[path]:null;
 if(Buffer.isBuffer(raw)&&row?.current.encoding==='base64'&&row.views[target]&&hash(raw)===row.current.sha256&&row.views[target].sha256!==row.current.sha256){assertPotionPointerCiUnionCurrent(read);return Buffer.from(saved(row,target));}
 const text=typeof raw==='string'?raw:raw.toString('utf8');
 const prior=potionPointerCiUnionSource(path,text,target,read,{production});
 return typeof raw==='string'?prior:prior===text?raw:Buffer.from(prior);
};}
// A complete synchronous assertion consumes one immutable capture, not a reusable
// public reader. Fresh public projections above intentionally never use this path.
export function withPotionPointerCiUnionValidation(target,read,validate){
 assert(Object.hasOwn(packet.viewCommits,target));
 const captured=new Map();
 for(const path of new Set([...Object.keys(sourceEpoch.proof.current),...Object.keys(packet.files),'tests/helpers/potion-pointer-ci-union.json.gz',priorPacketPath,calibrationPriorPath,readersPriorPath,copyPriorPath,behaviorPriorPath,pointerCiPriorPath,contractsPriorPath,'tests/helpers/potion-pointer-ci-before-integrated.json.gz'])){
  if(sourceEpoch.proof.current[path]===null&&!Object.hasOwn(packet.files,path))continue;
  const bytes=read(path);assert(Buffer.isBuffer(bytes),'validation capture bytes '+path);captured.set(path,Buffer.from(bytes));
 }
 let active=true;
 const snapshot=(path,encoding)=>{assert(active,'CI union current snapshot escaped synchronous scope');const value=captured.has(path)?Buffer.from(captured.get(path)):read(path);return encoding?value.toString(encoding):value;};
 assertPotionPointerCiUnionCurrent(snapshot);
 authenticatedSnapshots.add(snapshot);
 const prior=(path,encoding)=>{
  assert(active,'CI union validation reader escaped synchronous scope');
  const raw=snapshot(path,encoding),row=Object.hasOwn(packet.files,path)?packet.files[path]:null;
  if(!row?.views[target]||row.views[target].sha256===row.current.sha256)return raw;
  const value=saved(row,target);return encoding?Buffer.isBuffer(value)?value.toString(encoding):value:Buffer.isBuffer(value)?Buffer.from(value):Buffer.from(value);
 };
 try{const result=validate(prior,snapshot);assert(!result||typeof result.then!=='function','CI union validation must be synchronous');}
 finally{active=false;authenticatedSnapshots.delete(snapshot);captured.clear();}
}
