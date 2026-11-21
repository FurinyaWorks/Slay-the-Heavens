local Layout=require('abyss_ui_layout')
local Prototype=dofile('experiments/sts1-combat-feedback/light-trails.lua')
local function find(node,name)
 if node.name==name then return node end
 for _,child in ipairs(node.children or node)do local hit=find(child,name);if hit then return hit end end
end
local battleSpec=find(Layout,'battlePanel')
local feedbackSpec=find(battleSpec,'feedback')
local prototypeSpec=Prototype.layout();assert(#prototypeSpec.children==18)
feedbackSpec.children[#feedbackSpec.children+1]=prototypeSpec
local F=dofile('tests/lua/support/game_ui_fixture.lua')
local ui,root=F.fixture();assert(F.start(ui))
assert(ui.mapUI:choose(F.Nodes.available(ui.run,ui.map)[1].id));ui:update(3)
local stage=root:GetChild('battlePanel');local overlay=stage:GetChild('feedback')
local platform={imageSource='static',color=function(r,g,b,a)return{r=math.floor(r+.5),g=math.floor(g+.5),b=math.floor(b+.5),a=math.floor(a+.5)}end}
local Flow=require('abyss_card_flow');local flow=Flow.new(stage,platform)
local spike=Prototype.new(overlay:GetChild('referenceSpike'),platform,Flow.burn)
local Theme=require('abyss_theme');local catalog=ui.run.combat.catalog
local card=ui.run.combat.hand[1]
local presentation=require('abyss_presentation')
local function frame(pile)
 local s={hand={},draw={},discard={},exhaust={},catalog=catalog};if pile then s[pile]={card}end;return s
end
-- Export only the actual flight overlay and actual destination controls.
local keep={feedback=true,drawIcon=true,discardIcon=true,exhaustIcon=true,draw=true,discard=true,exhaust=true}
for i=#battleSpec.children,1,-1 do if not keep[battleSpec.children[i].name]then table.remove(battleSpec.children,i)end end
for _,s in ipairs(Layout)do if s.name=='stage'then for i=#s.children,1,-1 do if s.children[i].name~='battlePanel'then table.remove(s.children,i)end end end end
local V=dofile('scripts/official-assets-preview.lua')
for _,destination in ipairs({'discard','draw','exhaust'})do
 flow:reset();spike.reset()
 flow:playing(card,{tx=-40,ty=55})
 flow:sync(frame(),frame(destination),nil,true)
 stage:GetChild('exhaustIcon'):SetVisible(true);stage:GetChild('exhaust'):SetVisible(true)
 stage:GetChild('exhaust').text=destination=='exhaust' and '1' or '0'
 local length=destination=='exhaust' and Flow.burn.hold+Flow.burn.burn+Flow.burn.fly+.12 or Theme.motion.slow+.55
 local frames=math.ceil(length/.04)
 for n=1,frames do
  flow:update(length/frames,catalog,presentation,false)
  spike.update(flow.active[1],overlay:GetChild('cardTrail1'),length/frames)
  V.capture(destination..'-'..n,ui,root,'Reference spike: real production CardFlow trajectory + 18 pooled overlay primitives; controlled membership fixture; no game-rule changes')
  V.scenes[#V.scenes].durationMs=length/frames*1000
  local snapshot=find(V.scenes[#V.scenes].tree,'referenceSpike')
  for i,part in ipairs(snapshot.children)do part.feather=prototypeSpec.children[i].feather end
 end
 assert(not flow:busy(),'flight must finish and recycle')
end
V.print()
print('REFERENCE_FLOW_SPIKE fixed 18 controls, real pile endpoints, reset and recycling passed')
