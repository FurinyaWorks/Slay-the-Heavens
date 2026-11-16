// Exact CI-only join. Both immutable standalone packets remain authoritative.
import {gunzipSync} from 'node:zlib';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {pc06CiPacket,assertPc06CiCurrent} from './pc06-settings-ci-source.mjs';
import {releaseSelectionMapCiPacket,assertReleaseSelectionMapCiCurrent} from './release-selection-map-ci-source.mjs';
const hash=s=>createHash('sha256').update(s).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const repairBytes=readFileSync(new URL('./settings-map-inventory-repair.json.gz',import.meta.url));
assert.equal(hash(repairBytes),'0c0bc9781ac8bc5741ab26a387aec8374208cc9e513d845a46d9bd7432a13e09','complete settings inventory repair');
const repair=JSON.parse(gunzipSync(repairBytes));
assert.equal(repair.schemaVersion,1);assert.equal(repair.parent,'6cdfd8dbe23aa115e45c1c37a5bc7883d0c46c41');
assert.equal(repair.path,'tests/helpers/integrated-ci-source.mjs');
const repairSource=(path,source)=>path===repair.path&&typeof source==='string'&&!source.includes('\r\r\n')&&norm(source)===repair.current?repair.before:source;
const bytes=norm(readFileSync(new URL('./settings-map-integration.json',import.meta.url),'utf8'));
assert.equal(hash(bytes),'765c65d0dacfbe0fa4db3861416534d41a924ce226565ee1baaaa0416af19054','complete settings/map integration identity');
export const settingsMapPacket=JSON.parse(bytes);
assert.equal(settingsMapPacket.head,'9cc1b85f49f49317824c6e6ef86f625dfa73c826');
assert.equal(settingsMapPacket.base,'33d71575c5f186a1b54f7bf3e4f1826c145aa1d9');
const packets={settings:pc06CiPacket,selection:releaseSelectionMapCiPacket};
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
freeze(settingsMapPacket);freeze(repair);
assert.equal(hash(repair.before),settingsMapPacket.files[repair.path],'exact inventory helper predecessor');
export function settingsMapSource(path,source,side='selection'){
 source=repairSource(path,source);
 assert(Object.hasOwn(packets,side),'known standalone settings/map view');
 if(path.startsWith('src/')||path==='config/architecture.json'||path==='scripts/official-battle-hud.mjs')return source;
 if(!Object.hasOwn(settingsMapPacket.files,path)||typeof source!=='string'||source.includes('\r\r\n')||hash(norm(source))!==settingsMapPacket.files[path])return source;
 const other=side==='settings'?'selection':'settings';
 return packets[side].files[path]?.current.source??packets[other].files[path]?.before?.source??source;
}
export function settingsMapRead(side='selection',read=readFileSync){return(path,encoding)=>{
 const value=read(path,encoding);
 return typeof value==='string'?settingsMapSource(path,value,side):value;
};}
export function settingsMapPriorInventory(paths,kind='js'){
 assert(['js','lua'].includes(kind));
 assert.deepEqual([...paths].sort(),releaseSelectionMapCiPacket.currentInventory[kind],'complete settings/map raw discovery');
 return [...pc06CiPacket.inventory[kind]];
}
export function assertSettingsMapCurrent(read=readFileSync){
 assert.equal(hash(read('tests/helpers/settings-map-inventory-repair.json.gz')),hash(repairBytes),'fresh settings inventory repair');
 assert.equal(norm(read(repair.path,'utf8')),repair.current,'fresh settings inventory helper');
 const raw=read;read=(path,encoding)=>repairSource(path,raw(path,encoding));
 for(const [path,sha]of Object.entries(settingsMapPacket.files)){
  const source=read(path,'utf8');assert.equal(typeof source,'string','fresh settings/map source: '+path);
  assert.equal(hash(norm(source)),sha,'fresh complete integration source: settings/map '+path);
 }
 for(const [path,sha]of Object.entries(settingsMapPacket.archives))assert.equal(hash(read(path)),sha,'immutable settings/map predecessor: '+path);
 assertPc06CiCurrent(settingsMapRead('settings',read));
 assertReleaseSelectionMapCiCurrent(settingsMapRead('selection',read));
}
