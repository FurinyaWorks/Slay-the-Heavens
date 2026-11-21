-- Offline native Lua + mock controls. CPU time is NOT device input-to-photon latency.
local H=dofile('tests/lua/support/battle_gesture_fixture.lua')
local host,ui,panel,_,_,_,_,root=H.setup({'bash','defend'})
local writes,refreshes=0,0
local seen={}
local function instrument(node)
 if seen[node] then return end;seen[node]=true
 for _,key in ipairs({'SetVisible','SetImage','SetSizeDelta','SetAnchoredPosition','RefreshItems'})do
  local old=node[key]
  if old then node[key]=function(...)writes=writes+1;return old(...)end end
 end
 for _,child in pairs(node.children or {})do instrument(child)end
 for _,child in pairs(node.items or {})do instrument(child)end
end
instrument(root)
local old=host.refresh;host.refresh=function(...)refreshes=refreshes+1;return old(...)end
local function report(name,open,close)
 collectgarbage('collect');local memory=collectgarbage('count');local samples={};local wall={};writes,refreshes=0,0
 for i=1,50 do
  local w=os.gettimeofday();local t=os.clock();open();samples[i]=(os.clock()-t)*1000;wall[i]=(os.gettimeofday()-w)*1000;close()
 end
 collectgarbage('collect');local retained=collectgarbage('count')-memory
 local firstWrites,firstRefresh=writes,refreshes
 for i=1,50 do open();close() end
 collectgarbage('collect');local steady=collectgarbage('count')-memory-retained
 table.sort(samples);table.sort(wall)
 print(string.format('DETAIL_BENCH %s n=50 cpu_median_ms=%.3f cpu_p95_ms=%.3f wall_median_ms=%.3f wall_p95_ms=%.3f native_calls=%d host_refreshes=%d retained_KiB=%.3f next50_KiB=%.3f',name,samples[25],samples[48],wall[25],wall[48],firstWrites,firstRefresh,retained,steady))
end
report('relic',function()assert(host:openRelics(1))end,function()assert(host:closeDeck())end)
report('card',function()assert(ui:openHelp({kind='card',index=0,uid=host.run.combat.hand[1].uid},nil,false));assert(panel:GetChild('statusInfo').visible)end,
 function()ui:showStatus(0)end)
report('status',function()assert(ui:showStatus(0));assert(panel:GetChild('statusInfo').visible)end,function()ui:showStatus(0)end)
