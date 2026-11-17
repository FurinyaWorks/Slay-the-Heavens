import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const source=readFileSync('tests/release-selection-map-source.test.mjs','utf8');
const start=source.indexOf('// Original pointer contracts.');
const end=source.indexOf("pointerTest('inspection continuation",start);
assert(start>0&&end>start);
const segment=source.slice(start,end).replace(/from '(\.\/[^']+)'/g,(_,p)=>`from '${pathToFileURL(resolve('tests',p)).href}'`);
const union=pathToFileURL(resolve('tests/helpers/potion-pointer-ci-union.mjs')).href;
const harness=`import assert from 'node:assert/strict';import {readFileSync as disk,readdirSync} from 'node:fs';import {potionPointerCiUnionRead,withPotionPointerCiUnionValidation} from '${union}';
let drift=false;const bad='src/lua/abyss_battle_potion_popup.lua';
const actualUnionReadFileSync=(p,e)=>p===bad&&drift?(e?'wrong':Buffer.from('wrong')):disk(p,e);
const actualPost697DiscoverJs=()=>[];const nodeTest=(n,fn)=>fn({});
${segment}
await pointerTest('independent async expiry',async c=>{
 assert(c.actualReadFileSync(bad,'utf8').length>0);
 await Promise.resolve();drift=true;
 assert.equal(c.actualReadFileSync(bad,'utf8'),'wrong','foreign source remains visible');
 assert.throws(()=>c.actualReadFileSync('tests/ci-complete-calibration.test.mjs','utf8'),/fresh union owner/);
 assert.throws(()=>c.rawReadFileSync('tests/ci-complete-calibration.test.mjs','utf8'),/fresh union owner/);
 drift=false;assert(c.actualReadFileSync(bad,'utf8').length>0);
});
console.log('PASS actual wrapper: synchronous read, await teardown, current and historical reader drift rejection, recovery');`;
await import('data:text/javascript;base64,'+Buffer.from(harness).toString('base64'));
