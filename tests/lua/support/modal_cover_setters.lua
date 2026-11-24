package.path='src/lua/?.lua;'..package.path
local Gate=require('abyss_page_reveal')
local function blocker()
 return {SetAnchoredPosition=function()end,SetSizeDelta=function()end}
end
local function fixture()
 local hooks={};local writes=0
 local veil={alive=true}
 function veil:SetAnchoredPosition(x,y)
  writes=writes+1;self.x,self.y=x,y
  if hooks.position then return hooks.position(self,x,y)end
 end
 function veil:SetSizeDelta(w,h)
  writes=writes+1
  if hooks.failSize then return false end
  self.w,self.h=w,h
  if hooks.size then return hooks.size(self,w,h)end
 end
 local hitBlocker=blocker()
 local cover={SetVisible=function(self,v)self.visible=v end,SetAsLastSibling=function()end,
  GetChild=function(_,name)if name=='veil'then return veil elseif name=='blocker'then return hitBlocker end end}
 local frames={full={0,0,1280,720},deckPanel={0,28,1120,560}}
 local g=Gate.new(cover,function()return not hooks.pending end,nil,frames)
 local run,battle={},{}
 local base={page='battlePanel',mode='battle',phase='combat',run=run,battle=battle}
 local deck={page='deckPanel',mode='battle',phase='combat',run=run,battle=battle}
 local nextBattle={page='battlePanel',mode='battle',phase='combat',run=run,battle={}}
 g:request(base);g:step(base);assert(g:step(base))
 return g,veil,hooks,deck,nextBattle,function()return writes end
end
local function full(veil)assert(veil.x==0 and veil.y==0 and veil.w==1280 and veil.h==720,'full cover geometry was not restored')end
do
 local g,veil,hooks,deck,nextBattle=fixture()
 hooks.failSize=true
 assert(not pcall(g.request,g,deck),'size false must fail closed')
 assert(veil.y==28,'exercise the partial successful position write')
 hooks.failSize=false;g:request(nextBattle);full(veil)
end
for _,setter in ipairs({'position','size'})do
 for _,entry in ipairs({'request','begin','finish'})do
 local g,veil,hooks,deck,nextBattle,writes=fixture();local switched=false
 if entry=='begin'then g:request(nextBattle)end
 hooks[setter]=function()
  if not switched then switched=true;g:request(nextBattle)end
 end
 if entry=='request'then assert(not g:request(deck),'obsolete setter request reported success')
 elseif entry=='begin'then assert(not g:begin(deck),'obsolete setter begin reported success')
 else hooks.pending=true;assert(g:begin(deck));assert(not g:finish(deck),'obsolete post-paint request reported success')end
 assert(g.painting==nil,'obsolete begin retained its old post-paint ticket')
 assert(g.intent==nextBattle and switched,'reentrant request lost its owner')
 assert(not g:finish(nextBattle) and g.intent==nextBattle,'retired outer finish changed the current request')
 full(veil)
 local completed=writes();g:paint();assert(writes()==completed,'obsolete outer setter poisoned the newer successful geometry cache')
 hooks.pending=false;g:step(nextBattle);assert(g:step(nextBattle));assert(g.published==nextBattle,'setter reentry published the retired modal')
 end
end
do
 local g,veil,hooks,deck,_,writes=fixture();local nested=false
 hooks.position=function()if not nested then nested=true;g:paint()end end
 assert(not g:request(deck),'same-epoch nested paint must invalidate the outer paint token')
 assert(veil.x==0 and veil.y==28 and veil.w==1120 and veil.h==560)
 local completed=writes();g:paint();assert(writes()==completed,'same-epoch outer paint replaced the nested success cache')
end
for _,boundary in ipairs({'position','size','onIntent'})do
 local hooks,queries={},{}
 local veil={alive=true}
 function veil:SetAnchoredPosition()if hooks.position then hooks.position()end end
 function veil:SetSizeDelta()if hooks.size then hooks.size()end end
 local hitBlocker=blocker()
 local cover={SetVisible=function(self,v)self.visible=v end,SetAsLastSibling=function()end,
  GetChild=function(_,name)if name=='veil'then return veil elseif name=='blocker'then return hitBlocker end end}
 local frames={full={0,0,1280,720},deckPanel={0,28,1120,560},potionPanel={0,0,500,400}}
 local g=Gate.new(cover,function(intent)queries[#queries+1]=intent.page;return intent.page~='potionPanel' end,
  function()if hooks.onIntent then hooks.onIntent()end end,frames)
 local run,battle={},{}
 local base={page='battlePanel',mode='battle',phase='combat',run=run,battle=battle}
 local deck={page='deckPanel',mode='battle',phase='combat',run=run,battle=battle}
 local potion={page='potionPanel',mode='battle',phase='combat',run=run,battle=battle}
 g:request(base);g:step(base);assert(g:step(base))
 local once=false
 hooks[boundary]=function()if not once then once=true;g:request(potion)end end
 local reads=#queries
 assert(not g:step(deck),'retired outer step reported publication after '..boundary..' reentry')
 assert(g.intent==potion and g.published==base,'step published an obsolete modal after '..boundary..' reentry')
 assert(g:covered() and cover.visible,'unready replacement modal lost its input cover')
 assert(#queries==reads,'retired outer step queried readiness for the old modal')
 assert(not g:step(potion) and queries[#queries]=='potionPanel','replacement must use its own readiness')
end
do
 local gate
 local map={page='mapPanel',mode='map',phase='map'}
 local deck={page='deckPanel',mode='map',phase='map',deckPaged=true,deckProgressive=true}
 local choice={page='choicePanel',mode='battle',phase='combat'}
 local veil={visible=true}
 local function setPosition()end
 veil.SetAnchoredPosition,veil.SetSizeDelta=setPosition,setPosition
 function veil:SetVisible(value)
     if not value then assert(gate:request(choice), 'reentrant strict page request failed') end
     self.visible=value
 end
 local blocker={SetAnchoredPosition=setPosition,SetSizeDelta=setPosition}
 local cover={GetChild=function(_,name)return name=='veil' and veil or name=='blocker' and blocker or nil end,
     SetVisible=function(self,value)self.visible=value end,SetAsLastSibling=function()end}
 gate=Gate.new(cover,function(intent)return intent.page=='mapPanel'end,nil,{
     full={0,0,1280,720},deckPaged={0,0,918,452},deckPanel={0,0,918,452},choicePanel={0,0,800,600}
 })
 assert(not gate:step(map));assert(gate:step(map));assert(not gate:covered())
 assert(not gate:request(deck) and gate.intent==choice and gate:covered())
 assert(gate:paint(true))
 assert(cover.visible and veil.visible,'strict choice screen was unintentionally left unmasked after the native visibility call changed owners')
end
print('MODAL_COVER_SETTERS_PASS partial-failure/position-reentry/size-reentry/same-epoch-paint/step-reentry')
