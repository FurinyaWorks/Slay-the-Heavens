// CI-only join of #696 picker, #697 selection/map and landed #698 card contact. Original packets stay immutable.
import {assertCapacityPreflightCurrent} from './release-capacity-preflight-source.mjs';
import {assertFastFreezeB9UnionCurrent} from './release-fast-freeze-b9-union.mjs';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {integratedCiBytes} from './integrated-ci-binding.mjs';
import {stsStyleCiBytes} from './sts-style-ci-binding.mjs';
import {feedbackCiPatch} from './sts-feedback-ci.mjs';
import {extendFeedbackCiProof} from './sts-feedback-source-runtime.mjs';
import {releasePickerControlsCiRead,releasePickerControlsCiSource,releasePickerControlsCiCheckedSource,releasePickerControlsPriorInventory} from './release-picker-controls-ci-source.mjs';
import {releaseBootstrapCiSource,releaseBootstrapCiCheckedSource,assertReleaseBootstrapCiCurrent} from './release-bootstrap-ci-source-picker-before-capacity.mjs';
import {assertReleaseIntegrationCurrent as assertCapacityIntegrationCurrent,integrationRead as capacityIntegrationRead,integrationCapacityCiRead as originalCapacityCiRead} from './release-card-contact-integration.mjs';
import {assertReleaseBootstrapCiCurrent as assertCapacityBootstrapCurrent} from './release-bootstrap-ci-source.mjs';
import {releasePc22BasicFeedbackCiRead} from './release-pc22-basic-feedback-ci-source.mjs';
import {sourceEpoch} from './closeout-source-epoch.mjs';
import {releasePc22BasicFeedbackCiPacket as pc22,assertReleasePc22BasicFeedbackCiCurrent} from './release-pc22-basic-feedback-ci-source.mjs';
import {releasePickerControlsCiPacket as picker,assertReleasePickerControlsCiCurrent} from './release-picker-controls-ci-source.mjs';
import {releaseSelectionMapCiPacket as selection,assertReleaseSelectionMapCiCurrent} from './release-selection-map-ci-source-picker-before-capacity.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const bytes=norm(readFileSync(new URL('./release-picker-b9-integration.json',import.meta.url),'utf8'));
assert.equal(hash(bytes),'06c515adc402c299dc1fa8210cc110622869c80660a6960d3a3cf9d62c7f8914','complete Release card-contact integration bindings');
export const integrationPacket=JSON.parse(bytes);
assert.equal(integrationPacket.head,'e9866fece8a01ed5fd5dc5530d8b4d9da4bbc9bc');
assert.equal(integrationPacket.base,'b9bca884ed9b9831965b409885d78f719b9a567a');
const capacityJoinBytes=norm(readFileSync(new URL('./release-picker-capacity-join.json',import.meta.url),'utf8'));
assert.equal(hash(capacityJoinBytes),'c0acb1ca67272b88be37050885b0c11fd75a7aeb3d805c5aab0929fa5ef24125','complete picker capacity join');
const capacityJoin=JSON.parse(capacityJoinBytes);
assert.equal(capacityJoin.prepCommit,'c2d32421e63f104675fb98d7af033cb5817555eb');
assert.equal(capacityJoin.releaseCommit,'00ab3fe6d386f55aecfb063e59aeca2cf5065807');
const currentImplementation=norm(readFileSync(new URL(import.meta.url),'utf8'));
const preflightJoinBytes=norm(readFileSync(new URL('./release-picker-preflight-join.json',import.meta.url),'utf8'));
assert.equal(hash(preflightJoinBytes),'ff8eb5a358444ad440c5680da967545250ad9ab37cb500b313cb4a3e547cc3b6','complete picker preflight join');
const preflightJoin=JSON.parse(preflightJoinBytes);
assert.deepEqual(preflightJoin.parents,{picker:'af3ddb2eef8969959454c432cb2743288917a086',release:'af77fb2461c548f0faf104761d107397f75dca08'});
function preflightJoinSource(path,source,domain){
 const row=Object.hasOwn(preflightJoin.files,path)?preflightJoin.files[path]:null;
 if(!row||typeof row[domain]!=='string'||typeof source!=='string'||source.includes('\r\r\n')||hash(norm(source))!==row.currentSha256)return source;
 return source.includes('\r\n')?row[domain].replaceAll('\n','\r\n'):row[domain];
}
function preflightJoinRead(domain,read){return(path,encoding)=>{
 const raw=read(path,encoding);if(typeof raw!=='string'&&!Buffer.isBuffer(raw))return raw;
 if(Buffer.isBuffer(raw)&&!Object.hasOwn(preflightJoin.files,path))return raw;
 const text=typeof raw==='string'?raw:raw.toString('utf8'),prior=preflightJoinSource(path,text,domain);
 return typeof raw==='string'?prior:prior===text?raw:Buffer.from(prior);
};}
const packets={picker,pc22,selection};
assert.equal(integrationPacket.fixedStsValidatorBefore.sha256,'054113396d3db48407c2aee4f5c9563e6c4f2e8a80d37c979c79b6b3afac423a');
assert.equal(hash(integrationPacket.fixedStsValidatorBefore.source),integrationPacket.fixedStsValidatorBefore.sha256,'exact fixed StS validator predecessor');
assert.deepEqual(integrationPacket.addedJs,['tests/release-card-contact-integration.test.mjs','tests/release-picker-map-integration.test.mjs']);
integrationPacket.inventory=Object.fromEntries(['js','lua'].map(kind=>[kind,[...new Set([
 ...pc22.currentInventory[kind],...picker.currentInventory[kind],...selection.currentInventory[kind],...(kind==='js'?integrationPacket.addedJs:[]),
])].sort()]));
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
freeze(integrationPacket);freeze(capacityJoin);freeze(preflightJoin);
for(const side of Object.keys(packets))for(const kind of ['js','lua'])
 assert(packets[side].currentInventory[kind].every(path=>integrationPacket.inventory[kind].includes(path)),'retain complete '+side+' '+kind+' inventory');
// CI projections never intercept production authorization. Complete standalone
// production views below explicitly go through the fresh joint owner validator.
function uncheckedCiSource(path,source,side='picker'){
 assert(Object.hasOwn(packets,side),'known Release integration side');
 if(path.startsWith('src/')||path==='config/architecture.json')return source;
 source=capacityJoinSource(path,source,'prep');
 if(typeof source!=='string'||source.includes('\r\r\n')||!Object.hasOwn(integrationPacket.files,path)||hash(norm(source))!==integrationPacket.files[path])return source;
 if(path==='tests/helpers/sts-style-ci-source.mjs')return integrationPacket.fixedStsValidatorBefore.source;
 const own=packets[side].files[path],other=Object.values(packets).map(p=>p.files[path]).find(p=>p?.before);
 return own?.current.source??other?.before?.source??source;
}
export function integrationCiSource(path,source,side='picker',read=readFileSync){
 const prior=uncheckedCiSource(path,source,side);
 if(prior!==source)assertReleaseIntegrationCurrent(read);
 return prior;
}
function uncheckedRead(side,read){return(path,encoding)=>{
 const raw=read(path,encoding);if(typeof raw!=='string'&&!Buffer.isBuffer(raw))return raw;
 // Freshly read opaque archives have no text projection in either exact domain.
 if(Buffer.isBuffer(raw)&&!Object.hasOwn(integrationPacket.files,path)&&!Object.hasOwn(capacityJoin.files,path)&&!Object.hasOwn(preflightJoin.files,path))return raw;
 const text=typeof raw==='string'?raw:raw.toString('utf8'),prior=uncheckedCiSource(path,text,side);
 return typeof raw==='string'?prior:prior===text?raw:Buffer.from(prior);
};}
export function integrationRead(side='picker',read=readFileSync){return(path,encoding)=>{
 const raw=read(path,encoding);
 if(typeof raw!=='string'&&!Buffer.isBuffer(raw))return raw;
 const text=typeof raw==='string'?raw:raw.toString('utf8');
 const prior=integrationCiSource(path,text,side,read);
 return typeof raw==='string'?prior:prior===text?raw:Buffer.from(prior);
};}
export function integrationProductionRead(side='picker',read=readFileSync){
 assert(Object.hasOwn(packets,side),'known Release integration side');
 const ciRead=integrationRead(side,read);
 return(path,encoding)=>{
  if(!path.startsWith('src/')&&path!=='config/architecture.json')return ciRead(path,encoding);
  const raw=read(path,encoding);if(typeof raw!=='string'&&!Buffer.isBuffer(raw))return raw;
  const text=typeof raw==='string'?raw:raw.toString('utf8');
  const prior=sourceEpoch.preCombinedSource(path,text,{
   target:{picker:'releasePickerControlsReviewed',pc22:'releasePc22BasicFeedbackReviewed',selection:'releaseSelectionMapReviewed'}[side],readSource:p=>read(p,'utf8')});
  if(prior!==text)assertReleaseIntegrationCurrent(read);
  return typeof raw==='string'?prior:prior===text?raw:Buffer.from(prior);
 };
}
export function integrationInventory(kind='js'){
 assert(['js','lua'].includes(kind));return [...integrationPacket.inventory[kind]];
}
export function assertIntegrationRawInventory(paths,kind='js'){
 assert(['js','lua'].includes(kind));assert.deepEqual([...paths].sort(),integrationPacket.inventory[kind],'complete Release integration raw discovery inventory');
}
export function integrationPriorInventory(paths,side='picker',kind='js',read=readFileSync){
 assert(Object.hasOwn(packets,side));assert(['js','lua'].includes(kind));
 const current=integrationPacket.inventory[kind],prior=packets[side].currentInventory[kind],added=current.filter(p=>!prior.includes(p));
 if(!added.some(p=>paths.includes(p)))return [...paths];
 assertIntegrationRawInventory(paths,kind);
 for(const path of added)assert.equal(hash(norm(capacityJoinSource(path,read(path,'utf8'),'prep'))),integrationPacket.files[path],'fresh Release integration added inventory source: '+path);
 assertReleaseIntegrationCurrent(read);
 return [...prior];
}
function assertPrepIntegrationCurrent(read){
 assert.equal(norm(read('tests/helpers/release-picker-b9-integration.json','utf8')),bytes,'fresh complete integration source: B9 trust packet');
 for(const path of sourceEpoch.proof.owners)assert.equal(hash(norm(read(path,'utf8'))),sourceEpoch.proof.current[path].sha256,'fresh complete integration source: linked owner '+path);
 for(const [path,sha]of Object.entries(integrationPacket.files))assert.equal(hash(norm(read(path,'utf8'))),sha,'fresh complete integration source: Release join '+path);
 for(const [path,sha]of Object.entries(integrationPacket.archives))assert.equal(hash(read(path)),sha,'retained complete immutable Release join predecessor: '+path);
 assertReleasePc22BasicFeedbackCiCurrent(uncheckedRead('pc22',read));
 assertReleasePickerControlsCiCurrent(uncheckedRead('picker',read));
 assertReleaseSelectionMapCiCurrent(uncheckedRead('selection',read));
}

// Fixed validator only: the private historical view never leaves this call.
// Public readers above still freshly authenticate on every projected read.
const fixedIntegratedProof=freeze(JSON.parse(gunzipSync(integratedCiBytes)));
function uncheckedPickerProductionRead(read){
 const ciRead=uncheckedRead('picker',read);
 return(path,encoding)=>{
  if(!path.startsWith('src/')&&path!=='config/architecture.json')return ciRead(path,encoding);
  const raw=read(path,encoding);if(typeof raw!=='string'&&!Buffer.isBuffer(raw))return raw;
  const text=typeof raw==='string'?raw:raw.toString('utf8');
  const prior=sourceEpoch.preCombinedSource(path,text,{target:'releasePickerControlsReviewed',readSource:p=>read(p,'utf8')});
  return typeof raw==='string'?prior:prior===text?raw:Buffer.from(prior);
 };
}
export function assertReleaseIntegratedCurrent(read=readFileSync){
 assertReleaseIntegrationCurrent(read);
 read=uncheckedPickerProductionRead(read);
 assertReleasePickerControlsCiCurrent(read);
 assertReleaseBootstrapCiCurrent(releasePickerControlsCiRead(read));
 for(const [path,row]of Object.entries(fixedIntegratedProof.files))assert.equal(hash(norm(releaseBootstrapCiCheckedSource(path,releasePickerControlsCiCheckedSource(path,read(path,'utf8')),row.current))),row.current.sha256,'fresh complete integration source: '+path);
 for(const [path,row]of Object.entries(fixedIntegratedProof.closure))assert.equal(hash(path.endsWith('.gz')?read(path):norm(releaseBootstrapCiSource(path,releasePickerControlsCiSource(path,read(path,'utf8')),fixedIntegratedProof.files[path]?.current))),row.after,'fresh integration copy owner: '+path);
}

const fixedStsBeforeProof=JSON.parse(gunzipSync(stsStyleCiBytes));
assert.equal(fixedStsBeforeProof.schemaVersion,1);assert.equal(fixedStsBeforeProof.normalization,'LF');
assert.equal(fixedStsBeforeProof.baseCommit,'cb1eac63620b908d880b8a339ab834b1b533dfc1');
for(const [path,row]of Object.entries(fixedStsBeforeProof.files))for(const side of ['before','after']){
 const binding=row[side];if(binding===null)continue;
 assert.equal(hash(binding.source),binding.sha256,path+'/'+side);
 assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(binding.source)}\0`).update(binding.source).digest('hex'),binding.gitBlob);
}
for(const [path,row]of Object.entries(fixedStsBeforeProof.helperSources??{})){
 assert.equal(hash(row.source),row.sha256,path+' complete helper record');
 assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(row.source)}\0`).update(row.source).digest('hex'),row.gitBlob);
}
freeze(fixedStsBeforeProof);
const fixedStsProof=extendFeedbackCiProof(fixedStsBeforeProof,feedbackCiPatch);

function uncheckedStsRead(read){return(path,encoding)=>{
 const raw=read(path,encoding);
 const binary=Object.hasOwn(fixedIntegratedProof.binaryViews,path)?fixedIntegratedProof.binaryViews[path]:null;
 if(Buffer.isBuffer(raw)&&binary?.views.sts&&hash(raw)===binary.current){
  const saved=binary.views.sts,bytes=read(saved.path);assert.equal(hash(bytes),saved.sha256,'complete immutable integration binary predecessor');return bytes;
 }
 const text=typeof raw==='string'?raw:raw.toString('utf8');
 let prior=text;
 if(!path.startsWith('src/')&&path!=='config/architecture.json'){
  const row=Object.hasOwn(fixedIntegratedProof.files,path)?fixedIntegratedProof.files[path]:null;
  prior=uncheckedCiSource(path,prior,'picker');
  prior=releaseBootstrapCiSource(path,releasePickerControlsCiSource(path,prior),row?.current);
  if(row?.views.sts&&typeof prior==='string'&&!prior.includes('\r\r\n')&&hash(norm(prior))===row.current.sha256&&row.views.sts.sha256!==row.current.sha256)prior=row.views.sts.source;
 }
 return typeof raw==='string'?prior:prior===text?raw:Buffer.from(prior);
};}
function uncheckedPickerInventory(paths,kind,read){
 const current=integrationPacket.inventory[kind],prior=picker.currentInventory[kind],added=current.filter(p=>!prior.includes(p));
 if(!added.some(p=>paths.includes(p)))return [...paths];
 assertIntegrationRawInventory(paths,kind);
 for(const path of added)assert.equal(hash(norm(capacityJoinSource(path,read(path,'utf8'),'prep'))),integrationPacket.files[path],'fresh Release integration added inventory source: '+path);
 return [...prior];
}
function uncheckedStsInventory(paths,read){
 const target='sts',kind='js';
 const current=kind==='js'?fixedIntegratedProof.inventory:fixedIntegratedProof.luaInventory;
 const prior=fixedIntegratedProof.inventories[target]?.[kind];
 assert(prior,'known integration inventory');
 const originalRead=read;
 paths=uncheckedPickerInventory(paths,kind,originalRead);
 read=uncheckedRead('picker',originalRead);
 paths=releasePickerControlsPriorInventory(paths,kind,read);
 // New standalone reviewed views consume raw discovery. Older chained views
 // retain their existing idempotent prior-inventory contract.
 if(target==='selection'||target==='release')assert.deepEqual([...paths].sort(),current,'complete reviewed raw '+kind+' inventory');
 if(JSON.stringify([...paths].sort())===JSON.stringify(prior))return [...paths];
 const added=current.filter(p=>!prior.includes(p));
 if(added.length===0){
  assert.deepEqual([...paths].sort(),current,'complete identical integration '+kind+' inventory');
  return [...prior];
 }
 if(!added.some(path=>paths.includes(path)))return [...paths];
 assert.deepEqual([...paths].sort(),current,kind==='lua'?'complete integration Lua discovery inventory':'complete integration js inventory');
 for(const path of added){
  const row=fixedIntegratedProof.files[path];assert(row,'complete added inventory source: '+path);
   assert.equal(hash(norm(releaseBootstrapCiSource(path,releasePickerControlsCiSource(path,read(path,'utf8')),row.current))),row.current.sha256,'fresh added inventory source: '+path);
 }
 return [...prior];
}
export function assertReleaseStsStyleCiCurrent(paths,read=readFileSync){
 assertReleaseIntegrationCurrent(read);
 paths=uncheckedStsInventory(paths,read);
 read=uncheckedStsRead(read);
 assert.deepEqual([...paths].sort(),fixedStsProof.afterInventory,'complete StS current Full inventory');
 for(const [p,row]of Object.entries(fixedStsProof.files))assert.equal(hash(norm(read(p,'utf8'))),row.after.sha256,'fresh complete StS CI source: '+p);
 for(const [p,row]of Object.entries(fixedStsProof.helperSources))assert.equal(hash(norm(read(p,'utf8'))),row.sha256,'fresh StS helper source: '+p);
}

// One public call, one fresh boundary if either the current join or final
// historical transform changes bytes. No authorization survives this call.
export function releaseIntegratedSource(path,source,target,read=readFileSync){
 assert(Object.hasOwn(fixedIntegratedProof.sources,target),'known integration input');
 if(path.startsWith('src/')||path==='config/architecture.json')return source;
 const original=source;
 const row=Object.hasOwn(fixedIntegratedProof.files,path)?fixedIntegratedProof.files[path]:null;
 source=uncheckedCiSource(path,source,'picker');
 const joined=source!==original;
 source=releaseBootstrapCiSource(path,releasePickerControlsCiSource(path,source),row?.current);
 if(row?.views[target]&&typeof source==='string'&&!source.includes('\r\r\n')&&hash(norm(source))===row.current.sha256&&row.views[target].sha256!==row.current.sha256)source=row.views[target].source;
 if(joined||source!==original)assertReleaseIntegrationCurrent(read);
 return source;
}

export function releaseIntegratedPriorInventory(paths,target,kind='js',read=readFileSync){
 const current=kind==='js'?fixedIntegratedProof.inventory:fixedIntegratedProof.luaInventory;
 const prior=fixedIntegratedProof.inventories[target]?.[kind];
 assert(prior,'known integration inventory');
 let authenticated=false;
 const ensure=()=>{if(!authenticated){assertReleaseIntegrationCurrent(originalRead);authenticated=true;}};
 const originalRead=read;
 const projected=(path,encoding)=>{
  const raw=originalRead(path,encoding);if(typeof raw!=='string'&&!Buffer.isBuffer(raw))return raw;
  const text=typeof raw==='string'?raw:raw.toString('utf8'),prior=uncheckedCiSource(path,text,'picker');
  if(prior!==text)ensure();
  return typeof raw==='string'?prior:prior===text?raw:Buffer.from(prior);
 };
 const currentJoin=integrationPacket.inventory[kind],priorJoin=picker.currentInventory[kind];
 assert(['js','lua'].includes(kind));
 const addedJoin=currentJoin.filter(p=>!priorJoin.includes(p));
 if(addedJoin.some(p=>paths.includes(p))){
  assertIntegrationRawInventory(paths,kind);
  for(const path of addedJoin)assert.equal(hash(norm(capacityJoinSource(path,originalRead(path,'utf8'),'prep'))),integrationPacket.files[path],'fresh Release integration added inventory source: '+path);
  ensure();paths=[...priorJoin];
 }
 read=projected;
 paths=releasePickerControlsPriorInventory(paths,kind,read);
 // New standalone reviewed views consume raw discovery. Older chained views
 // retain their existing idempotent prior-inventory contract.
 if(target==='selection'||target==='release')assert.deepEqual([...paths].sort(),current,'complete reviewed raw '+kind+' inventory');
 if(JSON.stringify([...paths].sort())===JSON.stringify(prior))return [...paths];
 const added=current.filter(p=>!prior.includes(p));
 if(added.length===0){
  assert.deepEqual([...paths].sort(),current,'complete identical integration '+kind+' inventory');
  return [...prior];
 }
 if(!added.some(path=>paths.includes(path)))return [...paths];
 assert.deepEqual([...paths].sort(),current,kind==='lua'?'complete integration Lua discovery inventory':'complete integration js inventory');
 for(const path of added){
  const row=fixedIntegratedProof.files[path];assert(row,'complete added inventory source: '+path);
   assert.equal(hash(norm(releaseBootstrapCiSource(path,releasePickerControlsCiSource(path,read(path,'utf8')),row.current))),row.current.sha256,'fresh added inventory source: '+path);
 }
 return [...prior];
}

// Exact outer join: raw current identity is checked before either private domain.
function capacityJoinSource(path,source,domain){
 source=preflightJoinSource(path,source,'picker');
 const row=Object.hasOwn(capacityJoin.files,path)?capacityJoin.files[path]:null;
 if(!row?.[domain]||typeof source!=='string'||source.includes('\r\r\n')||hash(norm(source))!==row.currentSha256)return source;
 return source.includes('\r\n')?row[domain].source.replaceAll('\n','\r\n'):row[domain].source;
}
function capacityJoinRead(domain,read){return(path,encoding)=>{
 const raw=read(path,encoding);if(typeof raw!=='string'&&!Buffer.isBuffer(raw))return raw;
 if(Buffer.isBuffer(raw)&&!Object.hasOwn(capacityJoin.files,path)&&!Object.hasOwn(preflightJoin.files,path))return raw;
 const text=typeof raw==='string'?raw:raw.toString('utf8'),prior=capacityJoinSource(path,text,domain);
 return typeof raw==='string'?prior:prior===text?raw:Buffer.from(prior);
};}
export function assertReleaseIntegrationCurrent(read=readFileSync){
 assert.equal(norm(read('tests/helpers/release-picker-b9-integration.mjs','utf8')),currentImplementation,'fresh complete integration source: picker implementation');
 assert.equal(norm(read('tests/helpers/release-picker-preflight-join.json','utf8')),preflightJoinBytes,'fresh complete picker preflight join packet');
 for(const [path,row]of Object.entries(preflightJoin.files))assert.equal(hash(norm(read(path,'utf8'))),row.currentSha256,'fresh complete integration source: picker preflight '+path);
 const releaseRead=preflightJoinRead('release',read);
 assertCapacityPreflightCurrent(releaseRead);
 assertFastFreezeB9UnionCurrent(releaseRead);
 assertCapacityIntegrationCurrent(releaseRead);
 read=preflightJoinRead('picker',read);
 assert.equal(norm(read('tests/helpers/release-picker-capacity-join.json','utf8')),capacityJoinBytes,'fresh complete picker capacity join packet');
 for(const [path,row]of Object.entries(capacityJoin.files))assert.equal(hash(norm(read(path,'utf8'))),row.currentSha256,'fresh complete integration source: picker capacity '+path);
 for(const [path,sha]of Object.entries(capacityJoin.archives))assert.equal(hash(read(path)),sha,'fresh complete picker capacity archive: '+path);
 assertPrepIntegrationCurrent(capacityJoinRead('prep',read));
 const capacityRead=capacityJoinRead('capacity',read);
 assertCapacityIntegrationCurrent(capacityRead);
 assertCapacityBootstrapCurrent(releasePc22BasicFeedbackCiRead(capacityIntegrationRead('pc22',capacityRead)));
}
export function integrationCapacityCiRead(read=readFileSync){
 return(path,encoding)=>{
  const raw=read(path,encoding);
  // Evaluate the pure historical transform from this one captured read.
  // Fresh authorization below still reads the original caller, not the capture.
  const value=originalCapacityCiRead(capacityJoinRead('capacity',()=>raw))(path,encoding);
  const changed=Buffer.isBuffer(raw)&&Buffer.isBuffer(value)?!raw.equals(value):raw!==value;
  if(changed)assertReleaseIntegrationCurrent(read);
  return value;
 };
}

// Exact #703 current view, distinct from its older capacity CI predecessors.
// A transformed result always authenticates the complete live caller closure.
export function integrationCapacityCurrentRead(read=readFileSync){
 return(path,encoding)=>{
  const raw=read(path,encoding);
  const value=capacityJoinRead('capacity',()=>raw)(path,encoding);
  const changed=Buffer.isBuffer(raw)&&Buffer.isBuffer(value)?!raw.equals(value):raw!==value;
  if(changed)assertReleaseIntegrationCurrent(read);
  return value;
 };
}

// #707 current domain is separate from the immutable #703 current domain.
export function integrationPreflightCurrentRead(read=readFileSync){return(path,encoding)=>{
 const raw=read(path,encoding);
 if(path.startsWith('src/')||path==='config/architecture.json')return raw;
 const value=preflightJoinRead('release',()=>raw)(path,encoding);
 const changed=Buffer.isBuffer(raw)&&Buffer.isBuffer(value)?!raw.equals(value):raw!==value;
 if(changed)assertReleaseIntegrationCurrent(read);
 return value;
};}
