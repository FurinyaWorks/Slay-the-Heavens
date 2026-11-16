// CI-only join of #697 and #689. Original packets and assertions stay immutable.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {sourceEpoch} from './closeout-source-epoch.mjs';
import {blueCandleCiPacket as candle,assertBlueCandleCiCurrent} from './blue-candle-ci-source.mjs';
import {releaseSelectionMapCiPacket as selection,assertReleaseSelectionMapCiCurrent} from './release-selection-map-ci-source.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const bytes=norm(readFileSync(new URL('./release-candle-map-integration.json',import.meta.url),'utf8'));
assert.equal(hash(bytes),'85ef4520cef00cb6110b52e6f92a63dac47c51fd68156d3f945af41fbc08de4a','complete Release card-contact integration bindings');
export const integrationPacket=JSON.parse(bytes);
assert.equal(integrationPacket.head,'aad672ac4e84741825596ecb034464d16daf49d8');
assert.equal(integrationPacket.base,'33d71575c5f186a1b54f7bf3e4f1826c145aa1d9');
const packets={candle,selection};
assert.deepEqual(integrationPacket.addedJs,['tests/release-candle-map-integration.test.mjs']);
integrationPacket.inventory=Object.fromEntries(['js','lua'].map(kind=>[kind,[...new Set([
 ...candle.currentInventory[kind],...selection.currentInventory[kind],...(kind==='js'?integrationPacket.addedJs:[]),
])].sort()]));
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
freeze(integrationPacket);
for(const side of Object.keys(packets))for(const kind of ['js','lua'])
 assert(packets[side].currentInventory[kind].every(path=>integrationPacket.inventory[kind].includes(path)),'retain complete '+side+' '+kind+' inventory');
// CI projections never intercept production authorization. Complete standalone
// production views below explicitly go through the fresh joint owner validator.
export function integrationCiSource(path,source,side='candle'){
 assert(Object.hasOwn(packets,side),'known Release integration side');
 if(path.startsWith('src/')||path==='config/architecture.json')return source;
 if(typeof source!=='string'||source.includes('\r\r\n')||!Object.hasOwn(integrationPacket.files,path)||hash(norm(source))!==integrationPacket.files[path])return source;
 const own=packets[side].files[path],other=packets[side==='candle'?'selection':'candle'].files[path];
 return own?.current.source??other?.before?.source??source;
}
export function integrationRead(side='candle',read=readFileSync){return(path,encoding)=>{
 const raw=read(path,encoding);
 if(typeof raw!=='string'&&!Buffer.isBuffer(raw))return raw;
 const text=typeof raw==='string'?raw:raw.toString('utf8');
 const prior=integrationCiSource(path,text,side);
 return typeof raw==='string'?prior:prior===text?raw:Buffer.from(prior);
};}
export function integrationProductionRead(side='candle',read=readFileSync){
 assert(Object.hasOwn(packets,side),'known Release integration side');
 const ciRead=integrationRead(side,read);
 return(path,encoding)=>{
  if(!path.startsWith('src/')&&path!=='config/architecture.json')return ciRead(path,encoding);
  const raw=read(path,encoding);if(typeof raw!=='string'&&!Buffer.isBuffer(raw))return raw;
  const text=typeof raw==='string'?raw:raw.toString('utf8');
  const prior=sourceEpoch.preCombinedSource(path,text,{
   target:side==='candle'?'blueCandleReviewed':'releaseSelectionMapReviewed',readSource:p=>read(p,'utf8')});
  return typeof raw==='string'?prior:prior===text?raw:Buffer.from(prior);
 };
}
export function integrationInventory(kind='js'){
 assert(['js','lua'].includes(kind));return [...integrationPacket.inventory[kind]];
}
export function assertIntegrationRawInventory(paths,kind='js'){
 assert(['js','lua'].includes(kind));assert.deepEqual([...paths].sort(),integrationPacket.inventory[kind],'complete Release integration raw discovery inventory');
}
export function integrationPriorInventory(paths,side='candle',kind='js',read=readFileSync){
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
 assertBlueCandleCiCurrent(integrationRead('candle',read));
 assertReleaseSelectionMapCiCurrent(integrationRead('selection',read));
}
