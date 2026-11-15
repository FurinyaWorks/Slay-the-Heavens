local H=dofile('tests/lua/support/battle_gesture_fixture.lua')
local F,Theme=H.F,H.F.Theme
local function near(a,b)assert(math.abs(a-b)<1e-6,tostring(a)..' ~= '..tostring(b))end
-- iPhone 14 Pro reference: 2556x1179 at 3x, landscape 852x393 points.
-- These are geometry checks; actual text rasterization/touch still needs the device.
local points=393/720
local function findSpec(name,parent)
 for _,node in ipairs(parent or F.Layout)do
  if node.name==name then return node end
  local found=findSpec(name,node.children or {})
  if found then return found end
 end
end
local handBody=findSpec('label',assert(findSpec('card1',assert(findSpec('battlePanel')).children)).children).text.fontSize
local function bounds(card)
 local hit=card:GetChild('hit');local a=card.localRotationZ*math.pi/180
 local dx,dy=hit.x*card.localScaleX,hit.y*card.localScaleY
 local x,y=card.x+math.cos(a)*dx-math.sin(a)*dy,card.y+math.sin(a)*dx+math.cos(a)*dy
 return {x-hit.sizeDeltaX*card.localScaleX/2,x+hit.sizeDeltaX*card.localScaleX/2,
  y-hit.sizeDeltaY*card.localScaleY/2,y+hit.sizeDeltaY*card.localScaleY/2}
end
for _,touch in ipairs({false,true})do
 for _,count in ipairs({1,5,10})do
  local deck={};for i=1,count do deck[i]='defend'end
  local host,ui,panel=H.setup(deck,nil,{touchScreen=function()return touch end})
  F.Combat.draw(host.run.combat,count);host:refresh();host:update(10)
  for _,slot in ipairs(count==1 and {1}or {1,math.ceil(count/2),count})do
   ui:setHover(nil);ui:render(true);host:update(10)
   local idle=bounds(panel:GetChild('card'..slot))
   ui:setHover(slot);ui:render(true);host:update(10)
   local card=panel:GetChild('card'..slot)
   for edge,value in ipairs(bounds(card))do near(value,idle[edge])end
   if count>1 then
    local other=panel:GetChild('card'..(slot%count+1));local hit=bounds(card)
    assert(other.x<hit[1]or other.x>hit[2],'raised touch card steals an adjacent lane')
   end
   if touch then
    assert(handBody*card.localScaleX*points>=13,'focused touch body is below 13pt reference')
    assert(card.y-Theme.layout.card.size[2]*card.localScaleY/2>=-316-1e-6,'touch peek covers the reference home inset')
   else near(card.localScaleX,Theme.motion.hoverScale)end
  end
  host:disable()
 end
end
local Combat=require('abyss_combat')
local Discard=require('abyss_discard')
local spec
for _,layer in ipairs(F.Layout)do for _,p in ipairs(layer.children or{})do if p.name=='choicePanel'then spec=p end end end
for _,touch in ipairs({false,true})do
 local deck={};for i=1,10 do deck[i]='defend'end
 local battle=Combat.new(F.Data,{deck=deck,enemies={'cultist'},seed=42});Combat.draw(battle,10)
 assert(Discard.begin(battle,1))
 local root=F.control(assert(spec))
 local view=require('abyss_choice_ui').new(root,F.Presentation,'click',{
  imageSource='static',touchScreen=function()return touch end,color=function(r,g,b,a)return {r=r,g=g,b=b,a=a}end},function()return true end)
 assert(view:refresh({phase='combat',combat=battle,combatGeneration=1},true))
 local first,second=root:GetChild('card1'),root:GetChild('card2')
 if touch then
  local font=findSpec('label',assert(findSpec('face',spec.children)).children).text.fontSize
  assert(font*first.localScaleX*points>=13,'choice body is below 13pt reference')
  assert(second.x-first.x>Theme.layout.card.size[1]*first.localScaleX,'three touch card faces overlap')
  for _,name in ipairs({'before','after','confirm'})do
   local button=root:GetChild(name);local hit=button:GetChild('hit')
   assert(hit.sizeDeltaY*points>=44 and button.y-hit.sizeDeltaY/2>=-316,'touch footer misses minimum target or home inset')
  end
 else near(first.localScaleX,1);near(second.x-first.x,Theme.layout.combatChoice.step[1])end
 for _=1,3 do assert(root:GetChild('after'):GetChild('hit').click())end
 near(root:GetChild('card1').x,0)
 assert(not root:GetChild('card2').visible and not root:GetChild('after'):GetChild('hit').interactable)
 view:close()
end
for _,touch in ipairs({false,true})do
 local host,ui,panel=H.setup({'defend'},nil,{touchScreen=function()return touch end})
 host.run.phase,host.run.rewards='reward',{gold=0,goldClaimed=true,manualContinue=true,
  cardResolved=false,cards={'strike','defend','bash'}}
 host:refresh();panel:GetChild('cardReward').click()
 assert(ui.rewardView)
 host:update(10)
 local card=panel:GetChild('card2')
 if touch then
  assert(handBody*card.localScaleX*points>=13,'reward body is below 13pt reference')
  ui:setHover(2);host:update(10)
  local half=Theme.layout.card.size[2]*card.localScaleY/2
  local skip=panel:GetChild('skip');local hit=skip
  local heading=panel:GetChild('rewardStage')
  local subtitle=heading:GetChild('subtitle');local title=heading:GetChild('title')
  local paper=heading:GetChild('v25RewardPaper');near(title.y,paper.y)
  local titleSpec=findSpec('title',findSpec('rewardStage').children)
  assert(title.y-titleSpec.size[2]/2>subtitle.y+subtitle.sizeDeltaY/2,'reward title overlaps subtitle')
  assert(title.y+titleSpec.size[2]/2<312,'reward title overlaps shared run HUD')
  local disc=findSpec('costDisc',findSpec('card2',findSpec('battlePanel').children).children)
  local top=card.y+math.max(Theme.layout.card.size[2]/2,disc.position[2]+disc.size[2]/2)*card.localScaleY
  assert(top<subtitle.y-subtitle.sizeDeltaY/2,'reward cost disc overlaps subtitle')
  assert(card.y-half>skip.y+hit.sizeDeltaY/2,'reward card overlaps skip receiver')
  assert(Theme.layout.card.size[1]*card.localScaleX<Theme.layout.rewardPick.step,'hover reward overlaps neighbours')
  assert(skip.y-hit.sizeDeltaY/2>=-316 and hit.sizeDeltaY*points>=44)
 else near(card.localScaleX,Theme.layout.rewardPick.scale)end
 host:disable()
end
print('MOBILE_PHYSICAL_CARDS_PASS')
