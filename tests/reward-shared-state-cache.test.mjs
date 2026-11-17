import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
for(const [file,marker]of [
 ['reward-shared-state-cache.lua','CROSS_STATE_SHARED_NATIVE_IDENTITY_PASS'],
 ['reward-shared-state-pool.lua','CROSS_STATE_SHARED_POOL_RETIREMENT_PASS'],
])test(`shared reward owner cross-state regression: ${file}`,()=>{
 const env={...process.env,LUA_PATH:'./src/lua/?.lua;;',LUA_PATH_5_3:'./src/lua/?.lua;;',LUA_INIT:'',LUA_INIT_5_3:''};
 delete env.REWARD_PAINTER_SOURCE;
 const result=spawnSync(process.execPath,[require.resolve('fengari-node-cli/src/lua-cli.js'),`tests/helpers/${file}`],{
  encoding:'utf8',timeout:10000,maxBuffer:1024*1024,windowsHide:true,env,
 });
 assert.equal(result.status,0,result.stdout+result.stderr+String(result.error??''));
 // Fengari can print a Lua error while returning 0; require the terminal assertion marker.
 assert.match(result.stdout,new RegExp(`^${marker}$`,'m'),result.stdout+result.stderr);
 assert.equal(result.stderr,'');
});
