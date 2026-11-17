-- Minimal production-painter regression with an unavailable art pool.
-- Deliberate dependency stubs isolate shared native image ownership, not device behavior.
package.loaded.abyss_theme={presentationProfile='official-assets-first',officialAssets={rewardRows={normal={},hover={},iconSize=28,ink={}}},color={textMuted={}},icon={}}
package.loaded.abyss_lowcost_art={paint=function(icon)
 local pool=icon.parent:GetChild('rewardIconArt');if not pool then return false end
 pool:SetVisible(true);icon:SetVisible(false);return true
end}
package.loaded.abyss_relic_view_ui={icon=function(id)return id end}
package.loaded.abyss_relic_hooks={localId=function(id)return id end}
local painter=dofile(os.getenv('REWARD_PAINTER_SOURCE')or'src/lua/abyss_battle_reward_layout.lua')
local icon={visible=true}
function icon:SetImage(source,id)self.imageId=id end
function icon:SetVisible(value)self.visible=value end
local owner={}
function owner:GetChild(name)if name=='rewardIcon'then return icon elseif name=='rewardIconArt'then return self.pool end end
local function newPool()
 local p={parent=owner};function p:SetVisible(v)self.visible=v end;return p
end
owner.pool=newPool()
icon.parent=owner
local function part()
 local face={parent=owner}
 function face:GetChild(name)
  if name=='stsRewardFace'then return {GetChildren=function()return {}end}end
  if name=='label'then return {}end
 end
 return face
end
local normal,hover=part(),part()
local run={rewards={relics={{id='blue_candle'}}}}
local platform={imageSource='static'}
local function paint(face,state,id)
 run.rewards.relics[1].id=id
 assert(painter.paintButton('relicReward1',face,state,run,platform,function()end,function()end))

end
paint(normal,'normal','blue_candle');paint(hover,'hover','blue_candle')
local first=owner.pool;owner.pool=newPool();local second=owner.pool
paint(normal,'normal','blue_candle');assert(second.visible and not first.visible)
owner.pool=nil
paint(hover,'hover','blue_candle')
assert(icon.visible,'missing pool restores native fallback')
print('CROSS_STATE_POOL expected=false actual='..tostring(second.visible))
assert(not second.visible,'shared pool retirement must follow latest row owner across states')
print('CROSS_STATE_SHARED_POOL_RETIREMENT_PASS')
