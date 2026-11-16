// CI-only join of #697 and #706. Original packets and assertions stay immutable.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {sourceEpoch} from './closeout-source-epoch.mjs';
import {runtimeParticleCiPacket as particle,assertRuntimeParticleCiCurrent} from './runtime-particle-ci-source.mjs';
import {releaseSelectionMapCiPacket as selection,assertReleaseSelectionMapCiCurrent} from './release-selection-map-ci-source.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const bytes=norm(readFileSync(new URL('./release-runtime-integration.json',import.meta.url),'utf8'));
assert.equal(hash(bytes),'7c82e03a78f243b053788c97800e0f107f514e0cb66f525e69fc9320c29b4f87','complete Release card-contact integration bindings');
export const integrationPacket=JSON.parse(bytes);
assert.equal(integrationPacket.head,'514de9a7b9641c7269ac81f9c7504ea7f21161e7');
assert.equal(integrationPacket.base,'33d71575c5f186a1b54f7bf3e4f1826c145aa1d9');
const packets={particle,selection};
assert.deepEqual(integrationPacket.addedJs,['tests/release-runtime-integration.test.mjs']);
integrationPacket.inventory=Object.fromEntries(['js','lua'].map(kind=>[kind,[...new Set([
 ...particle.currentInventory[kind],...selection.currentInventory[kind],...(kind==='js'?integrationPacket.addedJs:[]),
])].sort()]));
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
freeze(integrationPacket);
for(const side of Object.keys(packets))for(const kind of ['js','lua'])
 assert(packets[side].currentInventory[kind].every(path=>integrationPacket.inventory[kind].includes(path)),'retain complete '+side+' '+kind+' inventory');
// CI projections never intercept production authorization. Complete standalone
// production views below explicitly go through the fresh joint owner validator.
export function integrationCiSource(path,source,side='particle'){
 assert(Object.hasOwn(packets,side),'known Release integration side');
 if(path.startsWith('src/')||path==='config/architecture.json')return source;
 if(typeof source!=='string'||source.includes('\r\r\n')||!Object.hasOwn(integrationPacket.files,path)||hash(norm(source))!==integrationPacket.files[path])return source;
 const own=packets[side].files[path],other=packets[side==='particle'?'selection':'particle'].files[path];
 return own?.current.source??other?.before?.source??source;
}
export function integrationRead(side='particle',read=readFileSync){return(path,encoding)=>{
 const raw=read(path,encoding);
 if(typeof raw!=='string'&&!Buffer.isBuffer(raw))return raw;
 const text=typeof raw==='string'?raw:raw.toString('utf8');
 const prior=integrationCiSource(path,text,side);
 return typeof raw==='string'?prior:prior===text?raw:Buffer.from(prior);
};}
export function integrationProductionRead(side='particle',read=readFileSync){
 assert(Object.hasOwn(packets,side),'known Release integration side');
 const ciRead=integrationRead(side,read);
 return(path,encoding)=>{
  if(!path.startsWith('src/')&&path!=='config/architecture.json')return ciRead(path,encoding);
  const raw=read(path,encoding);if(typeof raw!=='string'&&!Buffer.isBuffer(raw))return raw;
  const text=typeof raw==='string'?raw:raw.toString('utf8');
  const prior=sourceEpoch.preCombinedSource(path,text,{
   target:side==='particle'?'runtimeParticleReviewed':'releaseSelectionMapReviewed',readSource:p=>read(p,'utf8')});
  return typeof raw==='string'?prior:prior===text?raw:Buffer.from(prior);
 };
}
export function integrationInventory(kind='js'){
 assert(['js','lua'].includes(kind));return [...integrationPacket.inventory[kind]];
}
export function assertIntegrationRawInventory(paths,kind='js'){
 assert(['js','lua'].includes(kind));assert.deepEqual([...paths].sort(),integrationPacket.inventory[kind],'complete Release integration raw discovery inventory');
}
export function integrationPriorInventory(paths,side='particle',kind='js',read=readFileSync){
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
 assertRuntimeParticleCiCurrent(integrationRead('particle',read));
 assertReleaseSelectionMapCiCurrent(integrationRead('selection',read));
}
