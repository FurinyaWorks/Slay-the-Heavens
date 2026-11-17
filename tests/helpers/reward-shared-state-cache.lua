-- Minimal production-painter regression with an unavailable art pool.
-- Deliberate dependency stubs isolate shared native image ownership, not device behavior.
package.loaded.abyss_theme={presentationProfile='official-assets-first',officialAssets={rewardRows={normal={},hover={},iconSize=28,ink={}}},color={textMuted={}},icon={}}
package.loaded.abyss_lowcost_art={paint=function()return false end}
package.loaded.abyss_relic_view_ui={icon=function(id)return id end}
package.loaded.abyss_relic_hooks={localId=function(id)return id end}
local painter=dofile(os.getenv('REWARD_PAINTER_SOURCE')or'src/lua/abyss_battle_reward_layout.lua')
local icon={visible=true}
function icon:SetImage(source,id)self.imageId=id;self.imageSource=source end
function icon:SetVisible(value)self.visible=value end
local owner={}
function owner:GetChild(name)if name=='rewardIcon'then return icon end end
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
 assert(icon.visible,'unavailable pool must use native fallback')
end
paint(normal,'normal','blue_candle');paint(hover,'hover','blue_candle')
paint(normal,'normal','calling_bell')
assert(icon.imageId=='calling_bell')
paint(hover,'hover','blue_candle')
print('CROSS_STATE_NATIVE_IMAGE expected=blue_candle actual='..tostring(icon.imageId))
assert(icon.imageId=='blue_candle','shared native icon must not reuse state-local identity cache')
local setter=icon.SetImage
icon.SetImage=function()return false end
paint(normal,'normal','calling_bell')
assert(icon.imageId=='blue_candle','rejected setter did not change image')
icon.SetImage=setter;paint(normal,'normal','calling_bell')
assert(icon.imageId=='calling_bell','false result must not cache success')
icon.SetImage=function()error('injected image setter error')end
assert(not pcall(paint,hover,'hover','blue_candle'))
icon.SetImage=setter;paint(hover,'hover','blue_candle')
assert(icon.imageId=='blue_candle','throw must not cache success')
platform.imageSource='replacement-source';paint(normal,'normal','blue_candle')
assert(icon.imageSource=='replacement-source','source change must repaint same identity')
print('CROSS_STATE_SHARED_NATIVE_IDENTITY_PASS')
