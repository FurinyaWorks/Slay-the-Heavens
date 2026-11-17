import assert from 'node:assert/strict';
import {readFileSync as read} from 'node:fs';
import vm from 'node:vm';
import {battlePointerCiPacket} from '../../../../tests/helpers/battle-pointer-ci-source.mjs';
import {assertInspectionCiCurrent} from '../../../../tests/helpers/battle-pointer-inspection-ci-source.mjs';
import {withPotionPointerCiUnionValidation as scope} from '../../../../tests/helpers/potion-pointer-ci-union.mjs';
const text=read('tests/ci-complete-calibration.test.mjs','utf8');
const fn=text.slice(text.indexOf('function pointerDiscovery(kind){'),text.indexOf('const rawReleaseDiscoverJs=()=>pointerDiscovery'));
let count=0;
for(const kind of ['js','lua']){
 const extra=kind==='js'?'tests/potion-popup-click-payload.test.mjs':'tests/lua/potion_popup_click_payload.lua';
 const good=[...battlePointerCiPacket.currentInventory[kind],extra].sort();
 function run(paths){const context={assert,battlePointerCiPacket,actualPost697DiscoverJs:()=>paths,readdirSync:()=>paths.map(p=>p.slice('tests/lua/'.length))};return vm.runInNewContext(fn+`;JSON.stringify(pointerDiscovery('${kind}'))`,context);}
 assert.deepEqual(JSON.parse(run(good)),battlePointerCiPacket.currentInventory[kind]);count++;
 for(const bad of [good.filter(p=>p!==extra),good.slice(1),[...good,extra],[...good,kind==='js'?'tests/foreign.test.mjs':'tests/lua/foreign.lua']]){assert.throws(()=>run(bad),/complete union inventory/);count++;}
}
assert.throws(()=>assertInspectionCiCurrent(read),/fresh linked owner/);count++;
scope('pointer',read,r=>assertInspectionCiCurrent(r));count++;
for(const path of ['src/lua/abyss_battle_potion_popup.lua','tests/potion-popup-click-payload.test.mjs']){
 assert(read(path).length>0);
 const bad=(p,e)=>p===path?(e?'wrong':Buffer.from('wrong')):read(p,e);
 assert.throws(()=>scope('pointer',bad,r=>assertInspectionCiCurrent(r)),/fresh union (owner|input)/);count++;
}
scope('pointer',read,r=>assertInspectionCiCurrent(r));count++;
console.log('PASS independent',count,'real inventory function, explicit epoch/default rejection, union-only source mutation controls');
