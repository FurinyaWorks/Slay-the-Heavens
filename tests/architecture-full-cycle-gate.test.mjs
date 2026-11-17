import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {analyzeSources,checkArchitecture,main} from '../scripts/check-architecture.mjs';
const sources={a:'local M={}\nfunction M.later()return require("b")end\nreturn M',b:'return require("a")'};
const policy={layers:{a:'core',b:'core'},deferredImports:[{from:'a',to:'b',reason:'late callback'}],fullDependencyAcyclic:true};
test('full dependency gate rejects reviewed delayed feedback edges',()=>{
 const graph=analyzeSources(sources,policy,{});
 assert.ok(graph.errors.some(e=>e.message==='Full dependency cycle (including deferred imports): a -> b'),JSON.stringify(graph.errors));
});
test('full dependency gate rejects delayed self imports and accepts acyclic deferred capabilities',()=>{
 const self=analyzeSources({a:'return function()return require("a")end'},{layers:{a:'core'},deferredImports:[{from:'a',to:'a'}],fullDependencyAcyclic:true},{});
 assert.ok(self.errors.some(e=>/Full dependency cycle/.test(e.message)));
 assert.deepEqual(analyzeSources({...sources,b:'return {}'},policy,{}).errors,[]);
});
test('full dependency gate rejects malformed policy values and remains explicitly enabled in production',()=>{
 for(const value of [null,'true',1,[],{}])assert.ok(analyzeSources({a:'return {}'},{layers:{a:'core'},fullDependencyAcyclic:value},{}).errors.some(e=>/fullDependencyAcyclic must be a boolean/.test(e.message)));
 assert.equal(JSON.parse(readFileSync('config/architecture.json')).fullDependencyAcyclic,true);
});

test('standalone production architecture entry requires the full dependency gate',()=>{
 const root=mkdtempSync(join(tmpdir(),'architecture-full-'));
 try {
  mkdirSync(join(root,'src/lua'),{recursive:true});mkdirSync(join(root,'config'));
  writeFileSync(join(root,'src/lua/a.lua'),'return {}');
  for(const flag of [undefined,false]){
   const candidate={layers:{a:'core'}};if(flag!==undefined)candidate.fullDependencyAcyclic=flag;
   writeFileSync(join(root,'config/architecture.json'),JSON.stringify(candidate));
   assert.ok(checkArchitecture(root).errors.some(e=>e.message==='Production architecture policy must enable fullDependencyAcyclic'));
  }
 }finally{rmSync(root,{recursive:true,force:true})}
});

test('shared engineering cannot bypass the production full dependency gate',()=>{
 const report=analyzeSources({a:'return {}'},{layers:{a:'core'}},{});
 assert.throws(()=>main(report),/Production architecture policy must enable fullDependencyAcyclic/);
});
