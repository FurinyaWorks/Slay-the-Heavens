import test from 'node:test';
import assert from 'node:assert/strict';
import {validateBattlePair,battlePhases} from '../scripts/benchmark-battle-runtime.mjs';
const sha='a'.repeat(64);
function report(mode='counts') {return {mode,rows:battlePhases.map((phase,i)=>({phase,elapsedMs:1,frames:[120,300,80,120,300,600,...Array(12).fill(300),0][i],coreHash:sha,visualHash:mode==='visual'?sha:null,visualFrames:mode==='visual'?[120,300,80,120,300,600,...Array(12).fill(300),0][i]:0,liveControls:10,effects:phase==='disable'?0:1,outputs:phase==='disable'?0:1,memory:{rss:100,heapUsed:50},counts:{nativeCalls:3,propertyWrites:3,methods:{SetVisible:3},properties:{visible:3},calls:Object.fromEntries(['particles.paint','GameUI.update','BattleUI.update','Feedback.update','nodeUI.update','mapUI.update'].map(k=>[k,[120,300,80,120,300,600,...Array(12).fill(300),0][i]]).filter(([,v])=>v>0)),allocations:mode==='allocations'?{site:10}:{},created:1,destroyed:1}}))};}
test('battle pair accepts deterministic calls and exact core/visual equality with lower cost',()=>{
 for(const mode of ['counts','allocations','visual']){
  const a=report(mode),b=structuredClone(a);b.rows[0].counts.nativeCalls=2;b.rows[0].counts.methods.SetVisible=2;
  assert.equal(validateBattlePair(a,b),true);
 }
});
test('battle pair rejects missing work, source-state drift, leaks and counter corruption',()=>{
 for(const mutate of [r=>r.rows.pop(),r=>r.rows.reverse(),r=>r.rows[0].frames--,r=>r.rows[0].coreHash='b'.repeat(64),r=>r.rows[0].liveControls++,r=>r.rows[0].outputs++,r=>r.rows[0].effects++,r=>r.rows[0].counts.calls['particles.paint']--,r=>r.rows[0].counts.methods.SetVisible=2,r=>r.rows[0].elapsedMs=NaN,r=>r.rows[0].counts.nativeCalls++,r=>r.rows[0].memory.heapUsed=0]){
  const a=report(),b=structuredClone(a);mutate(b);assert.throws(()=>validateBattlePair(a,b));
 }
});
test('visual pair requires every measured update and exact rendered fields',()=>{
 for(const change of [r=>r.rows[0].visualHash='b'.repeat(64),r=>r.rows[0].visualHash=null,r=>r.rows[0].visualFrames--]){
  const a=report('visual'),b=structuredClone(a);change(b);assert.throws(()=>validateBattlePair(a,b));
 }
});

test('fixed workload rejects identical omissions and identical retained outputs on both sides',()=>{
 for(const mutate of [r=>r.rows.forEach(x=>{x.frames=0;x.counts.calls={};}),r=>{r.rows.at(-1).outputs=1;},r=>{r.rows[7].liveControls++;}]){
  const a=report();mutate(a);assert.throws(()=>validateBattlePair(a,structuredClone(a)));
 }
});

test('allocation instrumentation preserves return token boundaries and Lua table-call sugar',async()=>{
 const {instrumentTableLiterals}=await import('../scripts/runtime-baseline/allocations.mjs');
 const {createRequire}=await import('node:module'),require=createRequire(import.meta.url);
 const {lua,lauxlib,lualib,to_luastring,to_jsstring}=require('fengari');const L=lauxlib.luaL_newstate();lualib.luaL_openlibs(L);
 const source='local function f(x)return x end;local x=f{a={2}};return{x=x or {},y=(function()return{3}end)()}';
 const code='local n=0;function ALLOC(_,v)n=n+1;return v end;local function run() '+instrumentTableLiterals(source,'probe')+' end;local r=run();assert(n==4 and r.x.a[1]==2 and r.y[1]==3)';
 assert.equal(lauxlib.luaL_dostring(L,to_luastring(code)),lua.LUA_OK,to_jsstring(lua.lua_tostring(L,-1)||to_luastring('')));
});
