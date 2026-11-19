local G=require('abyss_game_ui');local make=G.new;local host;local F
local uiProfile=require('abyss_ui_profile')
local Art=require('abyss_card_art_runtime');local Gate=require('abyss_page_reveal')
G.new=function(root,data,presentation,event,p)
 if uiProfile.nativePageLifecycle then
  local active={}
  for _,name in ipairs({'nodePanel','choicePanel'})do
   local page=root:GetChild(name);local prior=getmetatable(page);active[page]=true
   setmetatable(page,{__index=function(c,key)if key=='active'then return active[c]end;return prior.__index(c,key)end,
    __newindex=function(c,key,value)assert(key~='active','active is readonly');return prior.__newindex(c,key,value)end})
   page.SetActive=function(c,value)active[c]=value;F.setEngineActive(c,value)end
  end
 end
 p.nativePageLifecycle=uiProfile.nativePageLifecycle
 p.presentationReady=function(intent)return (intent.page~='deckPanel' or not(host.deckUI.pending or host.deckUI.calibrating or host.deckUI.pendingGrid)) and Art.presentationReady(intent.page)end
 p.presentationPage=function(page)Art.setPresentationPage(page)end
 return make(root,data,presentation,event,p)
end
F=dofile('tests/lua/support/game_ui_fixture.lua')
local rawSort=table.sort;local active
-- Node Fengari os.clock uses process.uptime, not CPU or device timing.
-- This counter includes table.sort plus the instrumentation callback.
table.sort=function(list,less)
 if active and list[1] and list[1].card and list[1].definition then
  local start=os.clock();local calls=0
  rawSort(list,function(a,b)calls=calls+1;return less(a,b)end)
  active.comparisons=active.comparisons+calls;active.sortSeconds=active.sortSeconds+(os.clock()-start)
 else return rawSort(list,less)end
end
local function settle()
 for _=1,5 do host:update(1/60);Art.update();host.pageReveal:step(Gate.intent(host));host:refresh()end
 assert(not host.pageReveal:covered())
end
local function same(a,b)
 if type(a)~=type(b)then return false end
 if type(a)~='table'then return a==b end
 for k,v in pairs(a)do if not same(v,b[k])then return false end end
 for k in pairs(b)do if a[k]==nil then return false end end
 return true
end
local profile=require('abyss_theme').presentationProfile or 'default'
for _,count in ipairs({12,60,200})do
 local root;host,root=F.fixture();settle();assert(F.start(host));settle();assert(host.run.phase~='combat')
 local ids={'strike','defend','bash','anger','barricade','whirlwind','wound'}
 host.run.deck={}
 for i=1,count do host.run.deck[i]={uid=i,cardId=ids[(i-1)%#ids+1],upgraded=false}end
 local before=F.Combat.copy(host.run);before.elapsedSeconds=nil
 local grid=root:GetChild('deckPanel'):GetChild(require('abyss_theme').presentationProfile=='official-assets-first' and 'pileGrid' or 'grid')
 -- The shared fixture caps callbacks at 12. Model actual visible native cells
 -- from public geometry for larger deck stress inputs, never offscreen cards.
 grid.flush=function(self)
  local _,height=self:GetItemSize();local _,gap=self:GetItemSpacing();local top=self:GetPadding()
  local columns=self.layoutConstraintFixedCount or (profile=='official-assets-first' and 5 or require('abyss_theme').layout.deckView.columns)
  local visible=math.max(0,math.ceil((self.sizeDeltaY-top)/(height+gap)))*columns
  for i=0,math.min(self.itemCount,visible)-1 do self:recycle(i,i+self.indexBase)end
 end
 assert(host:openDeck());settle()
 local refresh=grid.RefreshItems;local refreshes=0
 grid.RefreshItems=function(self,n,fn)refreshes=refreshes+1;return refresh(self,n,fn)end
 local cover=root:GetChild('pageReveal');local visibility=cover.SetVisible;local shown=0
 cover.SetVisible=function(self,v)if v then shown=shown+1 end;return visibility(self,v)end
 for _,mode in ipairs({'original','type','cost'})do
  local r={comparisons=0,sortSeconds=0};local clickSeconds,settleSeconds=0,0;local firstRefresh,firstShown=refreshes,shown
  for i=1,5 do
   active=r;local started=os.clock();assert(host.deckUI:setSort(mode),'sort rejected '..mode);clickSeconds=clickSeconds+os.clock()-started;active=nil
   started=os.clock();settle();settleSeconds=settleSeconds+os.clock()-started
   local after=F.Combat.copy(host.run);after.elapsedSeconds=nil;assert(same(before,after),'non-clock run state changed')
  end
  print(string.format('PC03_BASELINE profile=%s cards=%d mode=%s sorts=5 clickMs=%.3f settleMs=%.3f comparatorMs=%.3f comparisons=%d refreshCalls=%d coverTrueCalls=%d',profile,count,mode,clickSeconds*1000,settleSeconds*1000,r.sortSeconds*1000,r.comparisons,refreshes-firstRefresh,shown-firstShown))
 end
 host:disable()
end
print('PC03_BASELINE_COMPLETED')
