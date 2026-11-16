test('legacy actual697 release selection map raw Full inventory retains all tests, diagnostic forecasts and actual execution guards',t=>{
 const rawReleaseReadFileSync=enemyPost697HistoricalRead('selection',actualEnemyPost697ReadFileSync);
 const rawReleaseDiscoverJs=()=>enemyPost697PriorInventory(actualEnemyPost697DiscoverJs(),'js',actualEnemyPost697ReadFileSync,'selection');
 const rawReleaseLua=()=>enemyPost697PriorInventory(readdirSync('tests/lua').filter(n=>n.endsWith('.lua')).map(n=>'tests/lua/'+n).sort(),'lua',actualEnemyPost697ReadFileSync,'selection');
 assertReleaseSelectionMapCiCurrent(rawReleaseReadFileSync);
 assertReleaseSelectionMapExecutionGuards(rawReleaseReadFileSync('.github/workflows/quality.yml','utf8'));
 const js=rawReleaseDiscoverJs(),lua=rawReleaseLua(),p=releaseSelectionMapCiPacket;
 assert.deepEqual(js,p.currentInventory.js);assert.deepEqual(lua,p.currentInventory.lua);
 for(const path of p.priorInventory.js)assert(js.includes(path));
 for(const path of p.priorInventory.lua)assert(lua.includes(path));
 assert.equal(rawCurrentTimings.unknownJsMs,10000);
 for(const [platform,count,target,guard]of [['win32',18,1800000,2700000],['linux',15,1200000,1800000]]){
  for(const path of js.filter(path=>!p.priorInventory.js.includes(path)))
   assert(rawCurrentJsPlanningWeights([path],platform)[path]>=rawCurrentTimings.unknownJsMs,'new unmeasured test retains its conservative cost: '+path);
  const bins=Array.from({length:count},(_,i)=>rawCurrentJsShard(js,`${i+1}/${count}`,platform));
  assert.deepEqual(bins.flatMap(bin=>bin.files).sort(),js);assert.equal(new Set(bins.flatMap(bin=>bin.files)).size,js.length);
  const loads=bins[0].loads;let combined=loads;
  if(platform==='win32'){
   const luaBins=Array.from({length:count},(_,i)=>shardLuaScripts(lua,`${i+1}/${count}`,{...rawCurrentTimings,windowsJsShardMs:loads},2));
   assert.deepEqual(luaBins.flat().sort(),lua);assert.equal(new Set(luaBins.flat()).size,lua.length);
   const cost=f=>rawCurrentTimings.luaShard[f]??rawCurrentTimings.lua[f]??rawCurrentTimings.unknownLuaMs;
   const safety=f=>rawCurrentTimings.lua[f]??rawCurrentTimings.unknownLuaMs;
   combined=luaBins.map((bin,i)=>{
    const pool=[0,0];for(const f of bin.filter(f=>safety(f)<10000).sort((a,b)=>safety(b)-safety(a)||a.localeCompare(b)))pool[pool[0]<=pool[1]?0:1]+=cost(f);
    return loads[i]+bin.filter(f=>safety(f)>=10000).reduce((sum,f)=>sum+cost(f),0)+Math.max(...pool);
   });
  }
  const forecast=Math.max(...combined)+60000;
  t.diagnostic(`${platform}: raw ${js.length} JS / ${lua.length} Lua; forecast ${forecast}ms; target ${target}ms; overrun ${Math.max(0,forecast-target)}ms; unchanged execution guard ${guard}ms; not hosted completion`);
  // Owner 2026-11-07: forecasts and reserve are advisory. The job-scoped
  // raw workflow deadlines above remain hard assertions.
 }
});
