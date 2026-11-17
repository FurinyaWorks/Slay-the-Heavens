import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {discoverJs} from '../../../../scripts/ci-shards.mjs';
import {assertPotionPointerCiUnionCurrent as current,withPotionPointerCiUnionValidation as scope,potionPointerCiUnionPacket as packet} from '../../../../tests/helpers/potion-pointer-ci-union.mjs';
import {assertInspectionCiCurrent,inspectionCiPacket} from '../../../../tests/helpers/battle-pointer-inspection-ci-source.mjs';
import {assertBattlePointerSparseCiCurrent,battlePointerSparseCiValidationRead} from '../../../../tests/helpers/battle-pointer-sparse-ci-source.mjs';
import {battlePointerCiPacket,assertBattlePointerCiCurrent} from '../../../../tests/helpers/battle-pointer-ci-source.mjs';
let checks=0;
const added=['battle-pointer-ci-source','battle-pointer-sparse-ci-source','battle-pointer-inspection-ci-source'].flatMap(n=>['mjs','json.gz'].map(e=>'tests/helpers/'+n+'.'+e));
for(const p of added){let expected=execFileSync('git',['show','ad6fe84:'+p]);if(p.endsWith('inspection-ci-source.mjs'))expected=Buffer.from(expected.toString().replace('import {sourceEpoch}', 'import {pointerBeforePotionEpoch as sourceEpoch}'));assert.deepEqual(readFileSync(p),expected);checks++;}
current();checks++;
for(const p of [...added,'src/lua/abyss_battle_card_gestures.lua','tests/potion-popup-click-payload.test.mjs','tests/helpers/potion-pointer-ci-before-pointer.json.gz'])for(const mode of ['missing','empty','drift','null']){
 const custom=(path,encoding)=>{if(path!==p)return readFileSync(path,encoding);if(mode==='missing')throw Error('missing '+p);if(mode==='null')return null;const b=mode==='empty'?Buffer.alloc(0):Buffer.concat([readFileSync(p),Buffer.from('\n')]);return encoding?b.toString(encoding):b;};
 assert.throws(()=>scope('pointer',custom,()=>assert.fail('damaged raw reader cannot authorize pointer view')));checks++;
}
assert.throws(()=>assertInspectionCiCurrent(),/fresh linked owner/);checks++;
scope('pointer',readFileSync,read=>{
 assertInspectionCiCurrent(read);assertBattlePointerSparseCiCurrent(read);assertBattlePointerCiCurrent(battlePointerSparseCiValidationRead(read));checks++;
 const path=Object.keys(inspectionCiPacket.files).find(p=>!p.startsWith('src/')&&p!=='config/architecture.json');assert(path);
 assert.throws(()=>assertInspectionCiCurrent((p,e)=>p===path?read(p,e)+'\n':read(p,e)),/fresh complete integration source: inspection/);checks++;
});
// Extract the actual consumer function, not a parallel implementation.
const source=readFileSync('tests/ci-complete-calibration.test.mjs','utf8'),body=source.slice(source.indexOf('function pointerDiscovery(kind){'),source.indexOf('const rawReleaseDiscoverJs=()=>pointerDiscovery'));
for(const kind of ['js','lua']){
 const js=discoverJs(),lua=readdirSync('tests/lua').filter(n=>n.endsWith('.lua'));
 const make=(j,l)=>new Function('assert','battlePointerCiPacket','actualPost697DiscoverJs','readdirSync',body+';return pointerDiscovery;')(assert,battlePointerCiPacket,()=>j,()=>l);
 assert.deepEqual(make(js,lua)(kind).sort(),battlePointerCiPacket.currentInventory[kind]);checks++;
 const values=kind==='js'?js:lua;
 for(const changed of [values.slice(1),[...values,values[0]],[...values,kind==='js'?'tests/foreign.test.mjs':'foreign.lua'],values.filter(x=>!x.includes('potion_popup_click_payload')&&!x.includes('potion-popup-click-payload'))]){assert.throws(()=>make(kind==='js'?changed:js,kind==='lua'?changed:lua)(kind),/complete union inventory retains potion and pointer discovery/);checks++;}
}
let escaped;scope('pointer',readFileSync,read=>{escaped=read;});assert.throws(()=>escaped(added[0]),/escaped synchronous scope/);checks++;
current();checks++;
console.log(JSON.stringify({status:'PASS',checks,inputs:Object.keys(packet.files).length,originalFiles:5,explicitPointerEpochImport:1}));
