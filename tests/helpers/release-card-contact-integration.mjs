// CI-only join of #697 and #698. Original packets and assertions stay immutable.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {sourceEpoch} from './closeout-source-epoch.mjs';
import {releasePc22BasicFeedbackCiPacket as pc22,assertReleasePc22BasicFeedbackCiCurrent} from './release-pc22-basic-feedback-ci-source.mjs';
import {releaseSelectionMapCiPacket as selection,assertReleaseSelectionMapCiCurrent} from './release-selection-map-ci-source.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const bytes=norm(readFileSync(new URL('./release-card-contact-integration.json',import.meta.url),'utf8'));
assert.equal(hash(bytes),'374e9f3ab0117d08ec202c406d9be466f7f94644b86daf8a3095a3e3a298c171','complete Release card-contact integration bindings');
export const integrationPacket=JSON.parse(bytes);
assert.equal(integrationPacket.head,'17580f25c742a7facb5626db8fc17efb4abe269b');
assert.equal(integrationPacket.base,'33d71575c5f186a1b54f7bf3e4f1826c145aa1d9');
const packets={pc22,selection};
assert.deepEqual(integrationPacket.addedJs,['tests/release-card-contact-integration.test.mjs']);
integrationPacket.inventory=Object.fromEntries(['js','lua'].map(kind=>[kind,[...new Set([
 ...pc22.currentInventory[kind],...selection.currentInventory[kind],...(kind==='js'?integrationPacket.addedJs:[]),
])].sort()]));
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
freeze(integrationPacket);
for(const side of Object.keys(packets))for(const kind of ['js','lua'])
 assert(packets[side].currentInventory[kind].every(path=>integrationPacket.inventory[kind].includes(path)),'retain complete '+side+' '+kind+' inventory');
// CI projections never intercept production authorization. Complete standalone
// production views below explicitly go through the fresh joint owner validator.
export function integrationCiSource(path,source,side='pc22'){
 assert(Object.hasOwn(packets,side),'known Release integration side');
 if(path.startsWith('src/')||path==='config/architecture.json')return source;
 if(typeof source!=='string'||source.includes('\r\r\n')||!Object.hasOwn(integrationPacket.files,path)||hash(norm(source))!==integrationPacket.files[path])return source;
 const own=packets[side].files[path],other=packets[side==='pc22'?'selection':'pc22'].files[path];
 return own?.current.source??other?.before?.source??source;
}
export function integrationRead(side='pc22',read=readFileSync){return(path,encoding)=>{
 const raw=read(path,encoding);
 if(typeof raw!=='string'&&!Buffer.isBuffer(raw))return raw;
 const text=typeof raw==='string'?raw:raw.toString('utf8');
 const prior=integrationCiSource(path,text,side);
 return typeof raw==='string'?prior:prior===text?raw:Buffer.from(prior);
};}
export function integrationProductionRead(side='pc22',read=readFileSync){
 assert(Object.hasOwn(packets,side),'known Release integration side');
 const ciRead=integrationRead(side,read);
 return(path,encoding)=>{
  if(!path.startsWith('src/')&&path!=='config/architecture.json')return ciRead(path,encoding);
  const raw=read(path,encoding);if(typeof raw!=='string'&&!Buffer.isBuffer(raw))return raw;
  const text=typeof raw==='string'?raw:raw.toString('utf8');
  const prior=sourceEpoch.preCombinedSource(path,text,{
   target:side==='pc22'?'releasePc22BasicFeedbackReviewed':'releaseSelectionMapReviewed',readSource:p=>read(p,'utf8')});
  return typeof raw==='string'?prior:prior===text?raw:Buffer.from(prior);
 };
}
export function integrationInventory(kind='js'){
 assert(['js','lua'].includes(kind));return [...integrationPacket.inventory[kind]];
}
export function assertIntegrationRawInventory(paths,kind='js'){
 assert(['js','lua'].includes(kind));assert.deepEqual([...paths].sort(),integrationPacket.inventory[kind],'complete Release integration raw discovery inventory');
}
export function integrationPriorInventory(paths,side='pc22',kind='js',read=readFileSync){
 assert(Object.hasOwn(packets,side));assert(['js','lua'].includes(kind));
 const current=integrationPacket.inventory[kind],prior=packets[side].currentInventory[kind],added=current.filter(p=>!prior.includes(p));
 if(!added.some(p=>paths.includes(p)))return [...paths];
 assertIntegrationRawInventory(paths,kind);
 for(const path of added)assert.equal(hash(norm(read(path,'utf8'))),integrationPacket.files[path],'fresh Release integration added inventory source: '+path);
 return [...prior];
}
export function assertReleaseIntegrationCurrent(read=readFileSync){
 for(const [path,sha]of Object.entries(integrationPacket.files))assert.equal(hash(norm(read(path,'utf8'))),sha,'fresh complete integration source: Release join '+path);
 for(const [path,sha]of Object.entries(integrationPacket.archives))assert.equal(hash(read(path)),sha,'retained complete immutable Release join predecessor: '+path);
 assertReleasePc22BasicFeedbackCiCurrent(integrationRead('pc22',read));
 assertReleaseSelectionMapCiCurrent(integrationRead('selection',read));
}
