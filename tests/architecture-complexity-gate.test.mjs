import test from 'node:test';
import assert from 'node:assert/strict';
import * as staticChecks from '../scripts/check-lua-static.mjs';
const metric=value=>({errors:[],modules:[{file:'src/lua/probe.lua',functions:[{name:'nested',line:2,complexity:value}]}]});
test('global complexity ceiling rejects any function above 30 and incomplete evidence',()=>{
 assert.equal(typeof staticChecks.reviewGlobalComplexity,'function');
 assert.deepEqual(staticChecks.reviewGlobalComplexity(metric(30)).errors,[]);
 assert.match(staticChecks.reviewGlobalComplexity(metric(31)).errors[0].message,/31 exceeds 30/);
 assert.ok(staticChecks.reviewGlobalComplexity({errors:[{message:'missing measurement'}],modules:[]}).errors.length);
 assert.ok(staticChecks.reviewGlobalComplexity({errors:[],modules:[]}).errors.length);
});
