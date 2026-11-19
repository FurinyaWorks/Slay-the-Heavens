-- Exact current Develop runtime with the existing generated official-assets tree.
local F=dofile('tests/lua/support/game_ui_fixture.lua')
local Theme,Run,Hooks=require('abyss_theme'),require('abyss_run'),require('abyss_relic_hooks')
local Random,Pool=require('abyss_sts_random'),require('abyss_relic_pool')
local h,root=F.fixture();assert(F.start(h));assert(Run.startCombat(h.run,'cultist_solo'))
local run=h.run;run.phase='reward'
run.rewards={manualContinue=true,gold=0,goldClaimed=true,cardResolved=true,cards={},
 relics={{id='blue_candle',sourceId='Blue Candle'},{id='strike_dummy',sourceId='StrikeDummy'}}}
local function same(a,b)
 assert(type(a)==type(b),'snapshot type')
 if type(a)~='table'then assert(a==b,'snapshot value');return end
 for k,v in pairs(a)do same(v,b[k])end
 for k in pairs(b)do assert(a[k]~=nil,'unexpected snapshot key')end
end
local function streams()
 return {Pool.snapshot(run.relicPool),Random.snapshot(run.cardRng),Random.snapshot(run.miscRng),Random.snapshot(run.treasureRng)}
end
local before=streams();h:refresh()
local row=root:GetChild('battlePanel'):GetChild('potionHelp'):GetChild('relicReward1')
assert(Hooks.localId(run.rewards.relics[1].sourceId)=='blue_candle')
local rewardArt=row:GetChild('rewardIconArt')
print('PROFILE '..Theme.presentationProfile)
print('IDENTITY Blue Candle -> '..Hooks.localId('Blue Candle'))
local rewardRecipeShown=rewardArt and rewardArt.visible
print('REWARD_SHARED_POOL '..tostring(rewardArt~=nil))
for _,state in ipairs({'normal','hover','pressed','disabled'})do
 local face=row:GetChild(state);local icon=face:GetChild('rewardIcon')
 local pool=face:GetChild('rewardIconArt')
 print('REWARD_STATE '..state..' fallback='..tostring(icon and icon.imageId)..' pool='..tostring(pool~=nil))
end
same(streams(),before)
assert(F.click(root,'battlePanel','potionHelp/relicReward1'))
local index=#run.relics
assert(run.relics[index]=='blue_candle' and run.rewards.relics[1].claimed)
assert(not row.visible and not run.rewards.relics[2].claimed)
local function recipe(icon,label)
 local pool=assert(icon.parent:GetChild('iconArt'))
 assert(pool.visible and not icon.visible)
 local asset=assert(Theme.lowCostArt.relic.assets.blue_candle)
 local n=0
 for i=0,15 do
  local shape=pool:GetChild('shape'..i);local expected=asset.shapes[i+1]
  assert(shape.visible==(expected~=nil))
  if expected then
   n=n+1;assert(shape.imageId==expected.image and shape.x==expected.x and shape.y==expected.y)
   assert(shape.sizeDeltaX==expected.w and shape.sizeDeltaY==expected.h);same(shape.imageColor,expected.colour)
  end
 end
 print(label..' blue_candle recipe='..n..' fallbackVisible='..tostring(icon.visible))
end
recipe(root:GetChild('relicBar'):GetChild('slot'..index):GetChild('icon'),'OWNED_BAR')
assert(h:openRelics(index));recipe(root:GetChild('relicPanel'):GetChild('single'):GetChild('icon'),'OWNED_DETAIL')
assert(h:closeDeck());same(streams(),before)
print('CLAIM_AND_RNG_PASS; other reward remains unclaimed')
assert(rewardRecipeShown,'BLUE_CANDLE_REWARD_IDENTITY_GAP: reward has no candle recipe although owned bar/detail do')
