// CI-only join of #696 picker, #697 selection/map and landed #698 card contact. Original packets stay immutable.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {sourceEpoch} from './closeout-source-epoch.mjs';
import {releasePc22BasicFeedbackCiPacket as pc22,assertReleasePc22BasicFeedbackCiCurrent} from './release-pc22-basic-feedback-ci-source.mjs';
import {releasePickerControlsCiPacket as picker,assertReleasePickerControlsCiCurrent} from './release-picker-controls-ci-source.mjs';
import {releaseSelectionMapCiPacket as selection,assertReleaseSelectionMapCiCurrent} from './release-selection-map-ci-source.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const bytes=norm(readFileSync(new URL('./release-picker-b9-integration.json',import.meta.url),'utf8'));
assert.equal(hash(bytes),'f9b1ecc845564a649cb5644a6cccce7206f3182c1f7163ac7bd61698a2ce97e6','complete Release card-contact integration bindings');
export const integrationPacket=JSON.parse(bytes);
assert.equal(integrationPacket.head,'e9866fece8a01ed5fd5dc5530d8b4d9da4bbc9bc');
assert.equal(integrationPacket.base,'b9bca884ed9b9831965b409885d78f719b9a567a');
const packets={picker,pc22,selection};
assert.deepEqual(integrationPacket.addedJs,['tests/release-card-contact-integration.test.mjs','tests/release-picker-map-integration.test.mjs']);
integrationPacket.inventory=Object.fromEntries(['js','lua'].map(kind=>[kind,[...new Set([
 ...pc22.currentInventory[kind],...picker.currentInventory[kind],...selection.currentInventory[kind],...(kind==='js'?integrationPacket.addedJs:[]),
])].sort()]));
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
freeze(integrationPacket);
for(const side of Object.keys(packets))for(const kind of ['js','lua'])
 assert(packets[side].currentInventory[kind].every(path=>integrationPacket.inventory[kind].includes(path)),'retain complete '+side+' '+kind+' inventory');
// CI projections never intercept production authorization. Complete standalone
// production views below explicitly go through the fresh joint owner validator.
function uncheckedCiSource(path,source,side='picker'){
 assert(Object.hasOwn(packets,side),'known Release integration side');
 if(path.startsWith('src/')||path==='config/architecture.json')return source;
 if(typeof source!=='string'||source.includes('\r\r\n')||!Object.hasOwn(integrationPacket.files,path)||hash(norm(source))!==integrationPacket.files[path])return source;
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
 for(const path of added)assert.equal(hash(norm(read(path,'utf8'))),integrationPacket.files[path],'fresh Release integration added inventory source: '+path);
 assertReleaseIntegrationCurrent(read);
 return [...prior];
}
export function assertReleaseIntegrationCurrent(read=readFileSync){
 assert.equal(norm(read('tests/helpers/release-picker-b9-integration.json','utf8')),bytes,'fresh complete integration source: B9 trust packet');
 for(const path of sourceEpoch.proof.owners)assert.equal(hash(norm(read(path,'utf8'))),sourceEpoch.proof.current[path].sha256,'fresh complete integration source: linked owner '+path);
 for(const [path,sha]of Object.entries(integrationPacket.files))assert.equal(hash(norm(read(path,'utf8'))),sha,'fresh complete integration source: Release join '+path);
 for(const [path,sha]of Object.entries(integrationPacket.archives))assert.equal(hash(read(path)),sha,'retained complete immutable Release join predecessor: '+path);
 assertReleasePc22BasicFeedbackCiCurrent(uncheckedRead('pc22',read));
 assertReleasePickerControlsCiCurrent(uncheckedRead('picker',read));
 assertReleaseSelectionMapCiCurrent(uncheckedRead('selection',read));
}
