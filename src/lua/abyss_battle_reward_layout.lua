-- Preserve the approved ordinary list; expand only independent multi-item rows.
local Theme=require('abyss_theme')
local RelicView=require('abyss_relic_view_ui')
local M={}
local rowFaces=setmetatable({},{__mode='k'})
local names={'goldReward','stolenGold','relicReward1','relicReward2','emeraldKeyReward','claimPotion','cardReward'}
local rowNames={};for _,name in ipairs(names)do rowNames[name]=true end
local relicRows={relicReward1=1,relicReward2=2}
local function iconId(value)return type(value)=='table'and value.id or value end
local function rewardIcon(name,run)
 if name=='cardReward'then return iconId(Theme.icon.deck)end
 if name=='emeraldKeyReward'then return iconId(Theme.icon.lock)end
 local rewards=run and run.rewards
 if name=='claimPotion'then return Theme.icon.potion[rewards and rewards.potion and rewards.potion.id]or Theme.icon.potion.empty end
end
local function paintRelic(cached,index,run,platform,size)
 local rewards=run and run.rewards
 local item=rewards and rewards.relics and rewards.relics[index]
 local id=item and (item.id or item.sourceId) or false
 if cached.relic==id then return end
 RelicView.paint(cached.icon,id or nil,size,platform,run,Theme.icon.node.treasure)
 cached.relic=id
end
local function paintIcon(cached,name,run,platform,size)
 if name=='goldReward'or name=='stolenGold'then return end
 local index=relicRows[name]
 if index then return paintRelic(cached,index,run,platform,size)end
 local id=rewardIcon(name,run)
 if platform.imageSource and cached.id~=id then cached.icon:SetImage(platform.imageSource,id);cached.id=id end
end
local function paintProceed(part,state,ink)
 if not part:GetChild('v25Flag')then return false end
 local art=Theme.officialAssets
 ink(part:GetChild('label'),state=='disabled'and Theme.color.textMuted or art.rewardRows.ink or art.flagButton.fallbackInk)
 return true
end
function M.paintButton(name,part,state,run,platform,tint,ink)
 if name=='continue'then return paintProceed(part,state,ink)end
 local token=Theme.officialAssets and Theme.officialAssets.rewardRows
 if Theme.presentationProfile~='official-assets-first'or not token then return false end
 if not rowNames[name]then return false end
 local cached=rowFaces[part]
 if not cached then
  cached={parts=part:GetChild('stsRewardFace'):GetChildren(),icon=part:GetChild('rewardIcon')};rowFaces[part]=cached
 end
 local tone=token[state]or token.normal
 if cached.tone~=tone then for _,image in ipairs(cached.parts)do tint(image,tone)end;cached.tone=tone end
 ink(part:GetChild('label'),state=='disabled'and Theme.color.textMuted or token.ink)
 paintIcon(cached,name,run,platform,token.iconSize)
 return true
end
-- Last successful size writer per native handle; owner tokens hold no view references.
local sizes=setmetatable({},{__mode='k'})
local function size(control,width,height,owner)
 local painted=sizes[control]
 if owner and painted and painted.owner==owner and painted.width==width
  and painted.height==height and control.alive~=false then return end
 -- Revoke both promises when native setters overlap in either completion order.
 local pending={};sizes[control]=pending
 local ok,result=pcall(control.SetSizeDelta,control,width,height)
 local current=sizes[control]==pending
 sizes[control]=nil
 if not ok then error(result,0)end
 if result~=false and current and owner then
  sizes[control]={owner=owner,width=width,height=height}
 end
end
local function visibleRewards(frame)
 local run=frame.run
 local rewards=frame.listing and run.rewards
 local visible={goldReward=rewards and not rewards.goldClaimed,stolenGold=frame.stolen and not frame.stolen.claimed,
  emeraldKeyReward=rewards and rewards.emeraldKey and not rewards.emeraldKey.claimed,
  claimPotion=frame.pendingPotion,cardReward=rewards and not rewards.cardResolved}
 for i=1,2 do
  local item=rewards and rewards.relics and rewards.relics[i]
  visible['relicReward'..i]=item and not item.claimed
 end
 return visible
end
-- Reflow both list densities inside the same HUD/content boundary. The
-- original desktop layouts and reward transactions remain the defaults.
function M.mobileLayouts(hud)
 if not hud then return end
 local base=Theme.layout.battleRewards
 local mobile=hud.rewardList
 local function fit(layout,slots)
  local titleY=hud.contentTop-layout.title[4]/2-4
  local top=mobile.rowY+base.rowSize[2]/2+8
  local bottom=top-base.rowSize[2]-16-(slots-1)*mobile.rowStep
  return setmetatable({
   title={layout.title[1],titleY,layout.title[3],layout.title[4]},
   subtitle={layout.subtitle[1],titleY-38,layout.subtitle[3],28},
   rowOrigin={layout.rowOrigin[1],mobile.rowY},rowStep=mobile.rowStep,
   panelY=(top+bottom)/2,panelHeight=top-bottom,potionLabel=mobile.potionLabel,
  },{__index=layout})
 end
 return {fit(base,4),fit(base.expanded,#names)}
end

local function positionHost(box,layout)
 -- The shared approved reward host follows the existing ordinary/expanded
 -- layout; the dimmer stays below the battle bar in canvas coordinates.
 local stage=layout.stage
 local field=box:GetChild('v25RewardField')
 if field then field:SetAnchoredPosition(-stage[1],-stage[2])end
 if Theme.presentationProfile=='official-assets-first'and Theme.officialAssets.rewardRows then
  local token=Theme.officialAssets.rewardRows
  local panel=box:GetChild('stsRewardPanel')
  panel:SetAnchoredPosition(token.panelPosition[1]-stage[1],(layout.panelY or token.panelPosition[2])-stage[2])
  local height=layout.panelHeight or token.panelSize[2]+stage[4]-Theme.layout.battleRewards.stage[4]
  panel:SetLocalScale(1,height/token.panelSize[2],1)
 end
end
function M.render(frame,child,sizeOwner,mobileLayouts)
 local visible=visibleRewards(frame)
 local count=0;for _,name in ipairs(names)do if visible[name]then count=count+1 end end
 local base=Theme.layout.battleRewards
 local layout=count>4 and base.expanded or base
 if mobileLayouts then layout=mobileLayouts[count>4 and 2 or 1] end
 local box=child('rewardList');local stage=layout.stage
 box:SetAnchoredPosition(stage[1],stage[2]);size(box,stage[3],stage[4],sizeOwner)
 positionHost(box,layout)
 size(box:GetChild('border'),stage[3],stage[4],sizeOwner)
 size(box:GetChild('plate'),stage[3]-Theme.space.border*2,stage[4]-Theme.space.border*2,sizeOwner)
 local paper=box:GetChild('v25RewardPaper')
 for _,name in ipairs({'title','subtitle'})do
  local pos=layout[name]
  local x,y=pos[1]-stage[1],pos[2]-stage[2]
  local control=box:GetChild(name)
  control:SetAnchoredPosition(x,y)
  size(control,pos[3],pos[4],sizeOwner)
  if paper and name=='title' then paper:SetAnchoredPosition(x,y) end
 end
 local row=0
 for _,name in ipairs(names)do
  local control=child(name);control:SetVisible(not not visible[name])
  if visible[name]then
   control:SetAnchoredPosition(layout.rowOrigin[1],layout.rowOrigin[2]-row*layout.rowStep)
   row=row+1
  end
 end
 if frame.manual then child('continue'):SetAnchoredPosition(layout.continue[1],layout.continue[2])end
 local caption=child('potionReward');local position=layout.potionLabel
 caption:SetVisible(frame.pendingPotion==true)
 caption:SetAnchoredPosition(position[1],position[2]);size(caption,position[3],position[4],sizeOwner)
 frame.rewardRows=count
 frame.rewardLayout=layout
end

function M.banner(dependencies,mobile)
 local battle,animation
 local veil=Theme.officialAssets.backdropVeil
 local rise=mobile and 0 or Theme.space.xl
 local official=Theme.presentationProfile=='official-assets-first'
 local colour=official and Theme.color.panelSunken or Theme.color.text
 local function paint(view,progress)
  local ease=1-(1-progress)^3
  local y=view.y+(1-ease)*rise
  local scale=.85+.15*ease
  view.paper:SetAnchoredPosition(view.x,y)
  view.title:SetAnchoredPosition(view.x,y)
  view.title:SetLocalScale(scale,scale,1)
  dependencies.ink(view.title,{r=colour.r,g=colour.g,b=colour.b,a=math.floor(colour.a*(official and 1 or ease)+.5)})
  dependencies.tint(view.dim,{r=veil.r,g=veil.g,b=veil.b,a=math.floor(veil.a*(.5+.5*ease)+.5)})
 end
 local function show(frame,active)
  if not frame.reward then battle=nil end
  if not frame.listing or not active then
   if animation then paint(animation,1);animation=nil end
   return
  end
  if battle~=frame.run.combat then
   battle=frame.run.combat
   local box=dependencies.child('rewardList')
   local paper=box:GetChild('v25RewardPaper')
   animation=paper and {paper=paper,title=box:GetChild('title'),dim=box:GetChild('v25RewardField'):GetChild('dark'),age=0}
  end
  if animation then
   local layout=frame.rewardLayout
   animation.x,animation.y=layout.title[1]-layout.stage[1],layout.title[2]-layout.stage[2]
   paint(animation,animation.age/Theme.motion.slow)
  end
 end
 local function update(dt)
  if not animation then return end
  animation.age=animation.age+dt
  local progress=math.min(1,animation.age/Theme.motion.slow)
  paint(animation,progress)
  if progress==1 then animation=nil end
 end
 return show,update
end
return M
