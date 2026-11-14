import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {sourceEpoch,navigationPriorEpoch} from './helpers/closeout-source-epoch.mjs';
import {navigationPatch,extendNavigationEpoch} from './helpers/navigation-source-epoch.mjs';
const read=p=>readFileSync(p,'utf8').replaceAll('\r\n','\n');
test('navigation authenticates complete current production and retains every historical byte and absence',()=>{
 const before=navigationPriorEpoch.proof,p=sourceEpoch.proof;
 const inventory=['config/architecture.json',...readdirSync('src/lua').filter(n=>n.endsWith('.lua')).map(n=>'src/lua/'+n)].sort();
 assert.deepEqual(Object.keys(p.current).sort(),inventory);
 for(const path of inventory){
  assert.equal(read(path),p.current[path].source,path);
  assert.deepEqual(p.targets.navigationPrior.files[path],before.current[path]??null,path+' predecessor');
  for(const [name,row]of Object.entries(before.targets))assert.deepEqual(p.targets[name].files[path],row.files[path]??null,name+'/'+path);
 }
 const path='config/architecture.json';
 assert.equal(sourceEpoch.preCombinedSource(path,read(path),{target:'navigationPrior',readSource:read}),before.current[path].source);
 for(const owner of Object.keys(navigationPatch.current))for(const value of [null,read(owner)+'\n']){
  assert.throws(()=>sourceEpoch.preCombinedSource(path,read(path),{target:'navigationPrior',readSource:p=>p===owner?value:read(p)}),/linked owner identity/,owner);
 }
});
test('navigation rejects incomplete or invented predecessors rather than refreshing them',()=>{
 for(const mutate of [p=>p.inventoryBefore.pop(),p=>delete p.before['src/lua/abyss_game_ui_navigation.lua'],p=>delete p.current['src/lua/abyss_game_ui_navigation_view.lua'],p=>p.before['config/architecture.json'].source+='\n',p=>p.current['config/architecture.json'].source+='\n']){
  const patch=structuredClone(navigationPatch);mutate(patch);assert.throws(()=>extendNavigationEpoch(navigationPriorEpoch,patch));
 }
});
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {navigationCiPatch,extendNavigationCi} from './helpers/navigation-ci-source.mjs';
import {navigationCiBytes} from './helpers/navigation-ci-binding.mjs';
test('navigation CI preserves archived release bytes, all prior views and rejects forged continuation',()=>{
 const bytes=readFileSync('tests/helpers/integrated-ci-source.json.gz');
 assert.equal(createHash('sha256').update(bytes).digest('hex'),'813333fabb5d6ace681503dfc8aee87b14d3586dc1b983969b324e86a50fe6bd');
 const old=JSON.parse(gunzipSync(bytes)),next=extendNavigationCi(old);
 assert.deepEqual(next.inventories,old.inventories);assert.deepEqual(next.binaryViews,old.binaryViews);
 for(const [path,row]of Object.entries(old.files))assert.deepEqual(next.files[path].views,row.views,path+' original test sources');
 for(const path of Object.keys(navigationCiPatch.files)){
  for(const mutate of [p=>p.files[path].before=p.files[path].before===null?{foreign:true}:null,p=>p.files[path].after.source+='\n']){
   const patch=structuredClone(navigationCiPatch);mutate(patch);
   assert.throws(()=>extendNavigationCi(old,patch));
  }
 }
 const patch=structuredClone(navigationCiPatch);patch.inventory.after.shift();assert.throws(()=>extendNavigationCi(old,patch));
 assert(read('tests/helpers/navigation-ci-binding.mjs').includes(createHash('sha256').update(navigationCiBytes).digest('hex')));
});
