// Current join is separate from the immutable navigation slice/bootstrap domains.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {sourceEpoch} from './closeout-source-epoch.mjs';
import {releaseMergeCiPacket,releaseMergeSource as oldMergeSource,assertReleaseMergeCurrent as oldMergeCurrent} from './release-bootstrap-merge-ci-source.mjs';
import {releaseNavigationCiPacket} from './release-navigation-ci-source.mjs';
import {releaseSelectionMapCiPacket} from './release-selection-map-ci-source.mjs';
const hash=s=>createHash('sha256').update(s).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const bytes=readFileSync(new URL('./navigation-map-ci-c433d789e470.json.gz',import.meta.url));
assert.equal(hash(bytes),'c433d789e470edb9307d5c0a13a7a65f9e1a8ac540232dc60af58b62b13b60fd','complete navigation/map outer join');
export const navigationMapPacket=JSON.parse(gunzipSync(bytes));
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
assert.equal(navigationMapPacket.head,'26cad4a66e9ec0ef64655afa8bd7fbbc92830f47');
assert.equal(navigationMapPacket.base,'33d71575c5f186a1b54f7bf3e4f1826c145aa1d9');
assert.deepEqual(Object.keys(navigationMapPacket).sort(),['archives','base','currentTreeCommitted','files','head','inventories','normalization','schemaVersion','sources']);
assert.equal(navigationMapPacket.schemaVersion,1);assert.equal(navigationMapPacket.normalization,'LF');assert.equal(navigationMapPacket.currentTreeCommitted,false);
const originals=[releaseNavigationCiPacket,releaseMergeCiPacket,releaseSelectionMapCiPacket];
const expectedPaths=[...new Set([...originals.flatMap(p=>Object.keys(p.files)),
 'tests/helpers/release-navigation-ci-source.mjs','tests/helpers/release-bootstrap-merge-ci-source.mjs','tests/helpers/release-selection-map-ci-source.mjs',
 'tests/helpers/navigation-map-legacy-domains.mjs','tests/helpers/navigation-map-merged-input.json','tests/release-navigation-map-integration.test.mjs',
 'tests/release-navigation-source.test.mjs','tests/release-selection-map-source.test.mjs'])].sort();
assert.deepEqual(Object.keys(navigationMapPacket.files).sort(),expectedPaths,'complete outer join source domain');
const archivePaths=[...new Set([...originals.flatMap(p=>Object.keys(p.immutableArchives)),
 'tests/helpers/release-navigation-ci-source.json.gz','tests/helpers/release-bootstrap-merge-ci-source.json.gz','tests/helpers/release-selection-map-ci-source.json.gz'])].sort();
assert.deepEqual(Object.keys(navigationMapPacket.archives).sort(),archivePaths,'complete outer join archive domain');
for(const original of originals)for(const [path,id]of Object.entries(original.immutableArchives))assert.equal(navigationMapPacket.archives[path],id,'unchanged original archive identity: '+path);
assert.deepEqual(navigationMapPacket.inventories.navigation,releaseNavigationCiPacket.currentInventory);
assert.deepEqual(navigationMapPacket.inventories.selection,releaseSelectionMapCiPacket.currentInventory);
for(const kind of ['js','lua'])assert.deepEqual(navigationMapPacket.inventories.joint[kind],[...new Set([
 ...releaseNavigationCiPacket.currentInventory[kind],...releaseSelectionMapCiPacket.currentInventory[kind],...(kind==='js'?['tests/release-navigation-map-integration.test.mjs']:[])])].sort());
for(const [id,source]of Object.entries(navigationMapPacket.sources))assert.equal(hash(source),id,'complete immutable standalone source atom');
for(const row of Object.values(navigationMapPacket.files)){
 assert.deepEqual(Object.keys(row).sort(),['current','views']);assert.match(row.current,/^[a-f0-9]{64}$/);
 assert.deepEqual(Object.keys(row.views).sort(),['navigation','selection']);
 for(const id of Object.values(row.views))assert(id===null||Object.hasOwn(navigationMapPacket.sources,id),'complete standalone source reference');
}
freeze(navigationMapPacket);
// The real menus retired help; keep the complete earlier fixture assertions as
// historical views, accepting only these reviewed replacement bytes on disk.
const fixtureBytes=readFileSync(new URL('./navigation-help-retirement-fixtures.json.gz',import.meta.url));
assert.equal(hash(fixtureBytes),'c0671bd990a62117af7b46bf89c735cc7defae6dae2caba619f1ff8b28c588f6','complete navigation help retirement fixture continuation');
export const navigationFixturePacket=freeze(JSON.parse(gunzipSync(fixtureBytes)));
assert.equal(navigationFixturePacket.schemaVersion,1);
assert.equal(navigationFixturePacket.baseCommit,'198357cfb03a36c6290966d8cee83daea47fd700');
assert.equal(navigationFixturePacket.normalization,'LF');assert.equal(navigationFixturePacket.currentTreeCommitted,false);
assert.deepEqual(Object.keys(navigationFixturePacket.files),['tests/lua/m3_chinese_copy.lua','tests/lua/native_ui_parity.lua','tests/m3-chinese-copy.test.mjs','tests/native-ui-parity.test.mjs','tests/release-navigation-map-integration.test.mjs']);
for(const [path,row]of Object.entries(navigationFixturePacket.files))for(const binding of [row.before,row.current]){
 assert.equal(binding.source,norm(binding.source),path);assert.equal(hash(binding.source),binding.sha256,path);
 assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(binding.source)}\0`).update(binding.source).digest('hex'),binding.gitBlob,path);
}
// A separate exact continuation retains the previous help-retirement packet.
const menuBytes=readFileSync(new URL('./navigation-menu-reader-repair.json',import.meta.url));
assert.equal(hash(menuBytes),'cbc3fc4b9050bf6405cc25029fd98ee47bf7b1e4a8780b40a953b2d53d9538ae','complete menu reader continuation');
const menuPacket=freeze(JSON.parse(menuBytes));
assert.equal(menuPacket.baseCommit,'ad1df7f3f02561701339d030d3acffb3218aa549');
assert.deepEqual(Object.keys(menuPacket.files),['tests/mobile-typography.test.mjs','tests/release-navigation-map-integration.test.mjs']);
for(const [path,row]of Object.entries(menuPacket.files))for(const binding of [row.before,row.current]){
 assert.equal(binding.source,norm(binding.source),path);assert.equal(hash(binding.source),binding.sha256,path);
}
function menuReaderBefore(path,source,read){
 const row=Object.hasOwn(menuPacket.files,path)?menuPacket.files[path]:null;
 if(!row||typeof source!=='string'||source.includes('\r\r\n')||hash(norm(source))!==row.current.sha256)return source;
 assert.equal(hash(read('tests/helpers/navigation-menu-reader-repair.json')),hash(menuBytes),'immutable menu reader continuation');
 for(const [p,binding]of Object.entries(menuPacket.files)){
  const raw=read(p,'utf8');assert.equal(typeof raw,'string','fresh menu reader: '+p);
  assert.equal(hash(norm(raw)),binding.current.sha256,'fresh menu reader: '+p);
 }
 return row.before.source;
}
export function assertNavigationFixturesCurrent(read=readFileSync){
 assert.equal(hash(read('tests/helpers/navigation-help-retirement-fixtures.json.gz')),hash(fixtureBytes),'immutable navigation fixture predecessor');
 for(const [path,row]of Object.entries(navigationFixturePacket.files)){
  const source=menuReaderBefore(path,read(path,'utf8'),read);assert.equal(typeof source,'string','fresh navigation fixture: '+path);
  assert.equal(hash(norm(source)),row.current.sha256,'fresh navigation fixture: '+path);
 }
}
export function navigationFixtureBefore(path,source,read=readFileSync){
 source=menuReaderBefore(path,source,read);
 const row=Object.hasOwn(navigationFixturePacket.files,path)?navigationFixturePacket.files[path]:null;
 if(!row||typeof source!=='string'||source.includes('\r\r\n')||hash(norm(source))!==row.current.sha256)return source;
 assertNavigationFixturesCurrent(read);return row.before.source;
}
export function navigationMapSource(path,source,side='navigation',read=readFileSync){
 assert(['navigation','selection'].includes(side),'known navigation/map standalone view');
 if(path.startsWith('src/')||path==='config/architecture.json')return source;
 source=navigationFixtureBefore(path,source,read);
 const row=Object.hasOwn(navigationMapPacket.files,path)?navigationMapPacket.files[path]:null;
 if(!row||typeof source!=='string'||source.includes('\r\r\n')||hash(norm(source))!==row.current)return source;
 const id=row.views[side];return id===null?source:navigationMapPacket.sources[id];
}
export function navigationMapRead(side='navigation',read=readFileSync){return(path,encoding)=>{
 const raw=read(path,encoding);return typeof raw==='string'?navigationMapSource(path,raw,side,read):raw;
};}
export function navigationMapProductionRead(side='navigation',read=readFileSync){
 const ci=navigationMapRead(side,read);
 return(path,encoding)=>{
  if(!path.startsWith('src/')&&path!=='config/architecture.json')return ci(path,encoding);
  const raw=read(path,encoding);if(typeof raw!=='string')return raw;
  return sourceEpoch.preCombinedSource(path,raw,{target:side==='navigation'?'releaseNavigationReviewed':'releaseSelectionMapReviewed',readSource:p=>read(p,'utf8')});
 };
}
// One synchronous validator invocation owns this reader. A new reader is made
// for every public call; authorization is never shared between calls or runs.
export function navigationValidationRead(read=readFileSync){
 const ci=navigationMapRead('navigation',read);let ownersChecked=false;
 return(path,encoding)=>{
  if(!path.startsWith('src/')&&path!=='config/architecture.json')return ci(path,encoding);
  const raw=read(path,encoding);if(typeof raw!=='string')return raw;
  const p=sourceEpoch.proof,input='src/lua/abyss_game_ui_input.lua';
  if(!ownersChecked){
   const current=read(input,'utf8');assert.equal(typeof current,'string','linked owner identity: '+input);
   assert.equal(hash(norm(current)),p.current[input].sha256,'linked owner identity: '+input);
   sourceEpoch.preCombinedSource(input,current,{target:'releaseNavigationReviewed',readSource:p=>read(p,'utf8')});
   ownersChecked=true;
  }
  const row=p.current[path];
  return row&&hash(norm(raw))===row.sha256?p.targets.releaseNavigationReviewed.files[path]?.source??raw:raw;
 };
}
export function navigationMapPriorInventory(paths,side='navigation',kind='js'){
 assert(['navigation','selection'].includes(side));assert(['js','lua'].includes(kind));
 const sorted=[...paths].sort(),current=navigationMapPacket.inventories.joint[kind],prior=navigationMapPacket.inventories[side][kind];
 if(JSON.stringify(sorted)===JSON.stringify(prior))return [...paths];
 const added=current.filter(p=>!prior.includes(p));
 if(!added.some(p=>paths.includes(p)))return [...paths];
 assert.deepEqual(sorted,current,'complete navigation/map raw inventory');return [...prior];
}
export function assertNavigationMapRawInventory(paths,kind='js'){
 assert(['js','lua'].includes(kind));assert.deepEqual([...paths].sort(),navigationMapPacket.inventories.joint[kind],'complete navigation/map raw inventory');
}
export function assertNavigationMapCurrent(read=readFileSync){
 assertNavigationFixturesCurrent(read);
 for(const [path,row]of Object.entries(navigationMapPacket.files)){
  const s=read(path,'utf8');assert.equal(typeof s,'string','fresh navigation/map source: '+path);
  assert.equal(hash(norm(navigationFixtureBefore(path,s,read))),row.current,'fresh complete integration source: navigation/map '+path);
 }
 for(const [path,id]of Object.entries(navigationMapPacket.archives))assert.equal(hash(read(path)),id,'immutable navigation/map predecessor: '+path);
}
export function navigationDomainSource(path,source,target,read=readFileSync){
 const current=navigationMapSource(path,source,'navigation',read);
 if(path.startsWith('src/')||path==='config/architecture.json')return source;
 const row=Object.hasOwn(releaseMergeCiPacket.files,path)?releaseMergeCiPacket.files[path]:null;
 if(row?.[target]&&typeof current==='string'&&!current.includes('\r\r\n')&&hash(norm(current))===row.current.sha256)
  assertNavigationMapCurrent(read);
 return oldMergeSource(path,current,target,navigationValidationRead(read));
}
export function navigationDomainRead(target,read=readFileSync){return(path,encoding)=>{
 const raw=read(path,encoding);
 if(typeof raw==='string')return navigationDomainSource(path,raw,target,read);
 if(encoding||!Buffer.isBuffer(raw)||!Object.hasOwn(releaseMergeCiPacket.files,path))return raw;
 const text=raw.toString('utf8'),prior=navigationDomainSource(path,text,target,read);
 return prior===text?raw:Buffer.from(prior);
};}
export function assertNavigationDomainCurrent(read=readFileSync){
 assertNavigationMapCurrent(read);oldMergeCurrent(navigationValidationRead(read));
}
export {navigationMapRead as integrationRead,navigationMapSource as integrationCiSource,navigationMapProductionRead as integrationProductionRead,navigationMapPriorInventory as integrationPriorInventory};
export function integrationInventory(kind='js'){assert(['js','lua'].includes(kind));return [...navigationMapPacket.inventories.joint[kind]];}
