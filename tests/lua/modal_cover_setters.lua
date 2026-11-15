package.path='src/lua/?.lua;'..package.path
local Gate=require('abyss_page_reveal')
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
 local cover={SetVisible=function(self,v)self.visible=v end,SetAsLastSibling=function()end,
  GetChild=function(_,name)if name=='veil'then return veil end end}
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
print('MODAL_COVER_SETTERS_PASS partial-failure/position-reentry/size-reentry/same-epoch-paint')
