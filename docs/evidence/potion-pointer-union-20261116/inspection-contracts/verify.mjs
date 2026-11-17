import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {assertPotionPointerCiUnionCurrent as current} from '../../../../tests/helpers/potion-pointer-ci-union.mjs';
let checks=0;current();checks++;
const changed=['tests/release-selection-map-source.test.mjs','tests/helpers/copy-integration-source-closure.mjs','tests/helpers/potion-pointer-ci-copy-closure.json','tests/helpers/potion-pointer-ci-before-contracts.json.gz'];
for(const path of changed)for(const mode of ['missing','empty','drift','null']){
 const read=(p,e)=>{if(p!==path)return readFileSync(p,e);if(mode==='missing')throw Error('missing '+path);if(mode==='null')return null;const b=mode==='empty'?Buffer.alloc(0):Buffer.concat([readFileSync(p),Buffer.from('\n')]);return e?b.toString(e):b;};
 assert.throws(()=>current(read),mode==='null'?TypeError:err=>{assert(err.message.includes(mode==='missing'?'missing '+path:path.endsWith('.gz')?'fresh pre-contracts union':'fresh union input '+path));return true;});checks++;
}
const old=execFileSync('git',['show','2d64949ffe80ad11c83321af0e2440ebbc54339c:tests/release-selection-map-source.test.mjs']);
assert.throws(()=>current((p,e)=>p===changed[0]?e?old.toString(e):old:readFileSync(p,e)),/fresh union input tests\/release-selection-map-source.test.mjs/);checks++;
current();checks++;console.log(JSON.stringify({status:'PASS',checks}));
