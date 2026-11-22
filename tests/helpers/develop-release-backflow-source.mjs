// Exact Develop predecessors for Release backflow. Live builds read current sources.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';

const hash=(bytes,algorithm='sha256')=>createHash(algorithm).update(bytes).digest('hex');
const blob=source=>hash(`blob ${Buffer.byteLength(source)}\0${source}`,'sha1');
const archive=readFileSync(new URL('../fixtures/develop-release-backflow-source.json.gz',import.meta.url));
assert.equal(hash(archive),'c50d048f5daaa4ecc7ffa110ca9a4dc144cb4393e51fb8666c572b16347bede4','exact Develop Release-backflow source archive');
const {base,files:releaseFiles,shopBase,shop}=JSON.parse(gunzipSync(archive));
assert.equal(base,'742a540ffc999e91acdface3d8fc7f753731f0a8');
assert.equal(shopBase,'82ba375397ffd7f8f8175a7a1fd18a973450ecc6');
const travelerArchive=readFileSync(new URL('../fixtures/develop-traveler-touch-source.json.gz',import.meta.url));
assert.equal(hash(travelerArchive),'58bed3fd2bfe7a20e5e9d2b9760b5f7dd165bde92201dd49fa90e36bb17168c9','exact Develop Traveler touch source archive');
const traveler=JSON.parse(gunzipSync(travelerArchive));
assert.equal(traveler.base,shopBase);
assert.deepEqual(Object.keys(traveler.files),['src/lua/abyss_battle_detail_bindings.lua','tests/lua/traveler_power_tooltip.lua']);
for(const path of Object.keys(traveler.files))assert(!Object.hasOwn(releaseFiles,path)&&!Object.hasOwn(shop,path),'distinct Develop backflow source owner: '+path);
const refactorArchive=readFileSync(new URL('../fixtures/develop-card-display-responsibilities-source.json.gz',import.meta.url));
assert.equal(hash(refactorArchive),'fafb7ec975e6ae3fa1f0629a7366a0f673bbad64668afede85267e7af0d0871c','exact Develop card-display-responsibilities predecessor archive');
const refactor=JSON.parse(gunzipSync(refactorArchive));
assert.equal(refactor.base,'8a59d03c26ec54360c4e6953958522dc8d2e8d07');
assert.deepEqual(Object.keys(refactor.files),["src/lua/abyss_watcher_flow_cards.lua"]);
const files={...releaseFiles,...traveler.files};
for(const path of Object.keys(refactor.files))assert(!Object.hasOwn(files,path)&&!Object.hasOwn(shop,path),'distinct Develop refactor source owner: '+path);
for(const {before,after} of [...Object.values(files),...Object.values(shop),...Object.values(refactor.files)]){
 assert.equal(hash(before.source),before.sha256);
 assert.equal(blob(before.source),before.gitBlob);
 assert.match(after.sha256,/^[a-f0-9]{64}$/);
 assert.match(after.gitBlob,/^[a-f0-9]{40}$/);
}
const current=path=>Object.hasOwn(refactor.files,path)?refactor.files[path]:Object.hasOwn(files,path)?files[path]:Object.hasOwn(shop,path)?shop[path]:undefined;
export const developBackflowOwns=path=>current(path)!==undefined;
function matches(source,expected){
 if(typeof source!=='string'||source.includes('\r\r\n'))return false;
 const lf=source.replaceAll('\r\n','\n');
 return hash(lf)===expected.sha256&&blob(lf)===expected.gitBlob;
}
export function assertDevelopBackflowCurrent(path,source){
 assert(matches(source,current(path).after),'fresh current production owner: '+path);
}
function predecessor(layer,path,source){
 if(!Object.hasOwn(layer,path)||!matches(source,layer[path].after))return source;
 const before=layer[path].before.source;
 return source.includes('\r\n')?before.replaceAll('\n','\r\n'):before;
}
export function beforeDevelopBackflow(path,source){
 return predecessor(shop,path,predecessor(files,path,predecessor(refactor.files,path,source)));
}
const forethoughtOwners=['src/lua/abyss_deck_ui.lua','scripts/deck-ui-layout.mjs'];
export function authenticateDevelopBackflow(path,source,read){
 const prior=beforeDevelopBackflow(path,source);
 if(prior===source)return source;
 const row=matches(source,current(path).after)?current(path):shop[path];
 const owners=forethoughtOwners.includes(path)?forethoughtOwners:[path];
 for(const owner of owners){
  let live;
  try{live=read(owner);}catch(error){assert.fail('combined linked owner missing: '+owner+': '+String(error?.message??error));}
  const expected=owner===path?row:current(owner);
  assert(matches(live,expected.after),'combined linked owner identity: '+owner+' changed during Develop backflow validation');
 }
 return prior;
}
