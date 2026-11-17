import test from 'node:test';
import assert from 'node:assert/strict';
import {readdirSync} from 'node:fs';
import {discoverJs,jsShard,timings} from '../scripts/ci-shards.mjs';
import {qualityShardMatrices} from '../scripts/ci-quality-shape.mjs';
import {shardLuaScripts} from '../scripts/test-lua.mjs';
test('complete architecture regression work fits original budgets while the former POSIX capacity fails',t=>{
 const files=discoverJs(),lua=readdirSync('tests/lua').filter(f=>f.endsWith('.lua')).map(f=>'tests/lua/'+f).sort();
 assert.equal(qualityShardMatrices.windows.length,18);assert.equal(qualityShardMatrices.posix.length,16);
 const old=jsShard(files,'1/15','linux').loads;
 assert.ok(Math.max(...old)+60000>1200000,'keep the observed cost problem visible');
 for(const [platform,count,budget]of [['win32',18,1800000],['linux',16,1200000]]){
  const bins=Array.from({length:count},(_,i)=>jsShard(files,`${i+1}/${count}`,platform));
  assert.deepEqual(bins.flatMap(b=>b.files).sort(),files);const loads=bins[0].loads;let costs=loads;
  if(platform==='win32'){
   const luaBins=Array.from({length:count},(_,i)=>shardLuaScripts(lua,`${i+1}/${count}`,{...timings,windowsJsShardMs:loads},2));
   assert.deepEqual(luaBins.flat().sort(),lua);
   const cost=f=>timings.luaShard[f]??timings.lua[f]??timings.unknownLuaMs;
   const safety=f=>timings.lua[f]??timings.unknownLuaMs;
   costs=luaBins.map((bin,i)=>{const pool=[0,0];for(const file of bin.filter(f=>safety(f)<10000).sort((a,b)=>safety(b)-safety(a)||a.localeCompare(b)))pool[pool[0]<=pool[1]?0:1]+=cost(file);return loads[i]+bin.filter(f=>safety(f)>=10000).reduce((n,f)=>n+cost(f),0)+Math.max(...pool)});
  }
  const forecast=Math.max(...costs)+60000;assert.ok(forecast<budget,`${platform} ${forecast}<${budget}`);
  t.diagnostic(`${platform}: ${files.length}JS/${lua.length}Lua complete; forecast ${forecast}ms < original ${budget}ms (includes 60000ms reserve)`);
 }
});
