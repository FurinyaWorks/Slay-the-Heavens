import test from 'node:test';
import assert from 'node:assert/strict';
import * as checks from '../scripts/check-lua-static.mjs';
const file='src/lua/probe.lua',legacy={ [file]:{'$/old#1':20} };
const metrics=(id,value)=>({errors:[],modules:[{file,functions:[{id,name:'old',line:1,complexity:value}]}]});
test('scoped architecture budgets bind old debt to complete AST identities and govern every new helper at 15',()=>{
 assert.equal(typeof checks.reviewScopedArchitectureComplexity,'function');
 assert.deepEqual(checks.reviewScopedArchitectureComplexity(metrics('$/old#1',20),legacy).errors,[]);
 assert.ok(checks.reviewScopedArchitectureComplexity(metrics('$/old#1',21),legacy).errors.some(e=>/21 exceeds 20/.test(e.message)));
 assert.ok(checks.reviewScopedArchitectureComplexity(metrics('$/new#1/old#1',16),legacy).errors.some(e=>/16 exceeds 15/.test(e.message)));
 assert.deepEqual(checks.reviewScopedArchitectureComplexity(metrics('$/new#1/old#1',15),legacy).errors,[]);
});
