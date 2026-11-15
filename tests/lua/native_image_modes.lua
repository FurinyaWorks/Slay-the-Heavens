local F=dofile('tests/lua/support/game_ui_fixture.lua')
local Binding=require('abyss_image_mode_binding')
local Modes=require('abyss_image_modes')
local enums={basic='DOCUMENTED_BASIC',stretch='DOCUMENTED_STRETCH'}
local totals={reads=0,writes=0};local state=setmetatable({},{__mode='k'})
local function hook(node)
 if state[node]then return end
 local old=getmetatable(node);local row={value=enums.basic,writes=0};state[node]=row
 setmetatable(node,{__index=function(c,key)
  if key=='imageType'then totals.reads=totals.reads+1;if row.onRead then row.onRead()end;return row.value end
  if key=='alive'and row.onAlive then row.onAlive()end
  return old.__index(c,key)
 end,__newindex=function(c,key,value)
  if key=='imageType'then totals.writes=totals.writes+1;row.writes=row.writes+1
   if not row.reject then row.value=value end;if row.onWrite then row.onWrite()end;return end
  return old.__newindex(c,key,value)
 end})
 for _,child in pairs(node.children)do hook(child)end
end
local function at(root,path)
 local c=root;for i=2,#path do c=assert(c:GetChild(path[i]),path[i])end;return c
end
local function canvas()
 local c=F.control({name='canvas',children=F.Layout});local root=c:GetChild('stage')
 -- F.Layout is the children of the imported stage, not a second stage wrapper.
 root=root or c;hook(root);return root
end
local root=canvas();local owner=Modes.new(root,Binding,enums,function()return 0 end)
local expected=0
for _,page in ipairs({'battlePanel','nodePanel','deckPanel','choicePanel'})do
 local ready=false
 for _=1,100 do owner:beginFrame();local why;ready,why=owner:step(page);assert(not why,why)
  assert(owner.lastRequests<=64,'per-frame mode request bound');if ready then break end end
 assert(ready,'page never ready '..page)
 for _,row in ipairs(Binding.static)do if row.path[2]==page then
  local n=at(root,row.path);assert(state[n].value==enums[row.mode]);expected=expected+1
 end end
 local r,w=totals.reads,totals.writes
 for _=1,3 do owner:beginFrame();assert(owner:step(page))end
 assert(totals.reads==r and totals.writes==w,'stable page repeated native mode calls')
end
assert(expected==#Binding.static and expected==1637)
local staticReads,staticWrites,staticLookups,staticAlive=totals.reads,totals.writes,owner.lookups,owner.aliveReads
-- Both actual generated native grid callbacks receive the same binder. A cell
-- cannot be published by DeckUI.gridReady until all of its template modes pass.
local deck=root:GetChild('deckPanel')
for _,name in ipairs({'grid','pileGrid'})do
 local grid=assert(deck:GetChild(name));local refresh=grid.RefreshItems
 grid.RefreshItems=function(self,amount,callback)
  return refresh(self,amount,function(control,index)hook(control);return callback(control,index)end)
 end
end
local Run=require('abyss_run');local run=Run.new(F.Data,42)
assert(Run.startCombat(run,'cultist_solo'))
local view=require('abyss_deck_ui').new(deck,F.Presentation,'click',{
 color=function(...)return{...}end,imageSource='static',imageModes=owner},function()end)
local used={}
for _,choice in ipairs({false,{op='exhaustChoose',token={},cards={run.combat.hand[1]}}})do
 assert(view:open(run,choice or nil));view:update(0)
 local grid=deck:GetChild(choice and 'grid'or'pileGrid');grid:flush()
 assert(view.pendingGrid,'unbound real grid was published')
 for _,cell in pairs(grid.items)do assert(not cell.visible,'partial template visible')end
 local ready=false
 for _=1,100 do owner:beginFrame();local ok,why=owner:step('deckPanel');assert(not why,why)
  if view.gridReady then ready=view.gridReady()end
  if ready and ok then break end end
 assert(ready,'template callback failed to become ready')
 local name=choice and 'AbyssDeckCard'or'AbyssBattlePileCard';used[name]=true
 for _,cell in pairs(grid.items)do
  assert(cell.visible and owner:templateReady(cell))
  for _,row in ipairs(Binding.templates)do if row.scope==name then assert(state[at(cell,row.path)].value==enums[row.mode])end end
 end
 local r,w=totals.reads,totals.writes
 grid:flush();assert(not view.gridReady or view.gridReady())
 owner:beginFrame();assert(owner:step('deckPanel'))
 assert(totals.reads==r and totals.writes==w,'same grid cache rewrote modes')
 view:close();owner:beginFrame();assert(owner:step('menuPanel'))
end
assert(used.AbyssDeckCard and used.AbyssBattlePileCard)
-- Retired generation and late native setter reentry must not become ready.
local spec=Binding.templates[1];local template=require('abyss_ui_templates')[spec.scope]
local cell=F.control(template);hook(cell)
local live=true;owner:request('deckPanel');owner:template(cell,spec.scope,function()return live end)
local target=at(cell,spec.path);state[target].value=nil
state[target].onWrite=function()live=false end
owner:beginFrame();owner:step('deckPanel');assert(not owner:templateReady(cell))
state[target].onWrite=nil;live=true;owner:template(cell,spec.scope,function()return live end)
for _=1,10 do owner:beginFrame();assert(select(2,owner:step('deckPanel'))==nil)end
assert(owner:templateReady(cell),'cancelled reusable cell could not finish')
local reused=F.control(template);hook(reused);owner:template(reused,spec.scope,function()return true end)
local reentered=at(reused,spec.path);state[reentered].value=nil
state[reentered].onWrite=function()state[reentered].onWrite=nil;owner:template(reused,spec.scope,function()return true end)end
owner:beginFrame();local _,reentryReason=owner:step('deckPanel');assert(not reentryReason)
assert(not owner:templateReady(reused),'reentrant old lease published readiness')
for _=1,10 do owner:beginFrame();owner:step('deckPanel')end
assert(owner:templateReady(reused),'new lease did not resume')
-- Setter refusal fails closed through the existing readiness result.
local broken=canvas();local reject=Modes.new(broken,Binding,enums,function()return 0 end)
local first=Binding.static[1];local bad=at(broken,first.path);state[bad].value=nil;state[bad].reject=true
reject:beginFrame();local ok,why=reject:step(first.path[2]);assert(not ok and why:match('readback rejected'))
local missing={schemaVersion=1,static={{path={'stage','absent'},mode='stretch'}},templates={},templateNames={}}
local absent=Modes.new(root,missing,enums,function()return 0 end);absent:beginFrame()
local present,reason=absent:step('absent');assert(not present and reason:match('path missing'))
state[bad].reject=false;state[bad].onRead=function()error('injected imageType getter rejection')end
local unreadable=Modes.new(broken,Binding,enums,function()return 0 end);unreadable:beginFrame()
local accepted,denied=unreadable:step(first.path[2]);assert(not accepted and denied:match('getter rejection'))
state[bad].onRead=nil
-- The 8ms threshold is checked inside the same 64-request preparation step.
local slow=canvas();local elapsed=0
local slowFirst
for _,row in ipairs(Binding.static)do if row.path[2]=='nodePanel'then slowFirst=row;break end end
state[at(slow,slowFirst.path)].onRead=function()elapsed=.009 end
local paced=Modes.new(slow,Binding,enums,function()return elapsed end)
paced:beginFrame();assert(not paced:step('nodePanel'));assert(paced.lastRequests==1,'over-budget getter allowed a second request')
assert(not paced:step('nodePanel'));assert(paced.lastRequests==1,'same-frame readiness reset the time budget')
-- Release in a native setter never publishes or retains a current lease.
local retired=canvas();local dying=Modes.new(retired,Binding,enums,function()return 0 end)
local late=at(retired,first.path);state[late].value=nil;state[late].onWrite=function()dying:release()end
dying:beginFrame();assert(not dying:step(first.path[2]));assert(dying.dead)
local lookupRoot=canvas();local lookupOwner=Modes.new(lookupRoot,Binding,enums,function()return 0 end)
local get=lookupRoot.GetChild;local callsAfterRetirement=0
lookupRoot.GetChild=function(control,name)
 local child=get(control,name);lookupOwner:release()
 local nested=child.GetChild
 child.GetChild=function(...)callsAfterRetirement=callsAfterRetirement+1;return nested(...)end
 return child
end
lookupOwner:beginFrame();assert(not lookupOwner:step(first.path[2]))
assert(callsAfterRetirement==0,'continued native path traversal after retirement')
local aliveRoot=canvas();local aliveOwner=Modes.new(aliveRoot,Binding,enums,function()return 0 end);local aliveCalls=0
state[aliveRoot].onAlive=function()aliveCalls=aliveCalls+1;if aliveCalls==3 then aliveOwner:release()end end
aliveOwner:beginFrame();assert(not aliveOwner:step(first.path[2]))
assert(aliveOwner.lookups==0 and aliveOwner.reads==0,'alive getter retirement escaped the pre-call guard')
print('IMAGE_MODE_CALLS staticReads='..staticReads..' staticWrites='..staticWrites..' staticGetChild='..staticLookups..' staticAliveReads='..staticAlive..' ownerGetChild='..owner.lookups..' totalReads='..totals.reads..' totalWrites='..totals.writes)
print('NATIVE_IMAGE_MODES_PASS static=1637 templates=86 controlsAdded=0')
