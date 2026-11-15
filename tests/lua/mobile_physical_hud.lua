local F=dofile('tests/lua/support/game_ui_fixture.lua')
local function hydrate(c,s)
 c.x,c.y=table.unpack(s.position or {0,0});c.scale=s.scale or {1,1}
 c.localScaleX,c.localScaleY=c.scale[1],c.scale[2]
 if s.text then c.fontSize=s.text.fontSize;c.minimumFontSize=s.text.minFontSize;c.adaptiveFontSize=s.text.autoSize end
 c.geometryWrites=0
for _,method in ipairs({'SetAnchoredPosition','SetSizeDelta','SetLocalScale'})do
  local original=c[method];c[method]=function(self,...)self.geometryWrites=self.geometryWrites+1;return original(self,...)end
 end
 for _,part in ipairs(s.children or {})do hydrate(c:GetChild(part.name),part)end
end
local canvas=F.control({children=F.Layout})
for _,s in ipairs(F.Layout)do hydrate(canvas:GetChild(s.name),s)end
local root=F.Viewport.apply(canvas,2556/3,1179/3)
local originalFont=root:GetChild('battlePanel'):GetChild('player').fontSize
local platform={seed=1,imageSource='static',touchScreen=MOBILE_HUD_TEST~=nil and function()return MOBILE_HUD_TEST end or nil,
 color=function(r,g,b,a)return {r=r,g=g,b=b,a=a}end}
local Mobile=require('abyss_mobile_hud');local apply=Mobile.apply;local initializations=0
Mobile.apply=function(...)initializations=initializations+1;return apply(...)end
local ui=F.GameUI.new(root,F.Data,F.Presentation,'click',platform);root.ui=ui
local battle=root:GetChild('battlePanel')
local active=MOBILE_HUD_TEST and F.Theme.presentationProfile=='official-assets-first'
if not active then
 assert(battle:GetChild('player').fontSize==originalFont,'PC/legacy readout changed')
 local original={12,34};assert(Mobile.handOrigin(platform,'draw',original)==original)
 local Mobile=require('abyss_mobile_hud');assert(Mobile.apply(root,platform)==nil)
 print('MOBILE_PHYSICAL_HUD_PASS unmodified');return
end
assert(battle:GetChild('player').fontSize==24,'phone HP is still 18UI (~9.8pt)')
for _,state in ipairs({'normal','hover','pressed','disabled'})do
 local face=battle:GetChild('endTurn'):GetChild(state);local label=face:GetChild('label')
 assert(math.abs(face.scale[1]*label.scale[1]-face.scale[2]*label.scale[2])<.000001,'End Turn font horizontally compressed')
 assert(label.fontSize==24 and label.minimumFontSize==24 and label.adaptiveFontSize==false)
end
local function at(path)
 local c=root;for name in path:gmatch('[^/]+')do c=assert(c:GetChild(name),path)end;return c
end
local function bounds(c)
 local result={math.huge,math.huge,-math.huge,-math.huge}
 for _,dx in ipairs({-.5,.5})do for _,dy in ipairs({-.5,.5})do
  local x,y=c.sizeDeltaX*dx,c.sizeDeltaY*dy;local n=c
  while n and n~=root do
   local s=n.scale or{1,1};local a=(n.localRotationZ or(n.rotation and n.rotation[3])or 0)*math.pi/180
   local px,py=x*s[1],y*s[2]
   x,y=(n.x or 0)+math.cos(a)*px-math.sin(a)*py,(n.y or 0)+math.sin(a)*px+math.cos(a)*py;n=n.parent
  end
  result[1],result[2]=math.min(result[1],x),math.min(result[2],y)
  result[3],result[4]=math.max(result[3],x),math.max(result[4],y)
 end end
 return result
end
local function clear(a,b)return a[3]<=b[1]or b[3]<=a[1]or a[4]<=b[2]or b[4]<=a[2]end
local targets={'exitEntry/open/hit','deckEntry/open/hit','battlePanel/topBar/battleRoute/hit','battlePanel/drawIcon/hit','battlePanel/discardIcon/hit','battlePanel/exhaustIcon/hit','battlePanel/endTurn'}
local function verify()
 for i,path in ipairs(targets)do
  local hit=at(path);assert(hit.kind=='cursorArea'or hit.kind=='presetButton','not actual receiver')
  local a=bounds(hit);assert(a[3]-a[1]>=88 and a[4]-a[2]>=88,path..' smaller than88')
  assert(a[1]>=-600 and a[3]<=600 and a[2]>=-316 and a[4]<=360,path..' outside landscape safe rectangle')
  assert((a[3]-a[1])*393/720>=48 and(a[4]-a[2])*360/720>=44,'physical point conversion')
  for j=1,i-1 do assert(clear(a,bounds(at(targets[j]))),path..' overlaps '..targets[j])end
 end
 for _,page in ipairs({'mapPanel','nodePanel','battlePanel'})do
  local panel=at(page);local resources=panel:GetChild('resources')or panel
  local hp=resources:GetChild(page=='battlePanel'and'player'or'hp')
  local gold=resources:GetChild(page=='battlePanel'and'piles'or'gold')
  for _,label in ipairs({hp,gold})do
   assert(label.fontSize==24 and label.minimumFontSize==24 and label.adaptiveFontSize==false)
   assert(label.sizeDeltaY+.000001>=24*1.6+3.6,'native line box too short')
  end
  assert(hp.sizeDeltaX>=9*24*.65+8 and gold.sizeDeltaX>=6*24*.65+8,'worst digits do not fit')
  assert(clear(bounds(hp),bounds(gold)))
  assert(bounds(gold)[3]<=F.Theme.officialAssets.battleHud.potionX-25-8,'gold touches potion')
 end
end
assert(F.start(ui));ui.run.hp,ui.run.maxHp,ui.run.gold=9999,9999,999999;ui:refresh();verify()
for _,path in ipairs(targets)do local a=bounds(at(path));print('HUD_WORLD '..path..' '..table.concat(a,','))end
for _,slot in ipairs(at('relicBar'):GetChildren())do
 local hit=slot:GetChild('hit')
 if hit and slot.visible then
  local a=bounds(hit)
  for i=1,3 do assert(clear(a,bounds(at(targets[i]))),'top HUD steals relic input')end
  assert(clear(a,bounds(at('mapPanel/resourceHints/hp/hit'))),'HP hint covers relic')
  assert(clear(a,bounds(at('mapPanel/resourceHints/gold/hit'))),'gold hint covers relic')
  for i=1,#ui.map.nodes do
   local node=F.mapControl(at('mapPanel'),'node'..i)
   assert(clear(a,bounds(node:GetChild('hit'))),'relic row overlaps map node')
  end
 end
end
assert(bounds(at('relicEntry/open/hit'))[4]<=272-8,'relic entry touches main utility targets')
assert(at('mapPanel/resources/hp').text=='9999/9999')
-- Real command receivers retain their bindings after the physical resize.
assert(at('deckEntry/open/hit').listeners.click());assert(ui.deckUI.visible);assert(ui:closeDeck())
assert(at('exitEntry/open/hit').listeners.click());assert(ui.exitOpen);assert(ui:closeExit())
local savedRun,savedMap=ui.run,ui.map
local Run,Map=require('abyss_run'),require('abyss_map')
local eventRun,eventMap=Run.new(F.Data,42),Map.generate(F.Data,42)
local entered=false
for _=1,20 do
 local choices=Map.available(eventMap)
 for _,node in ipairs(choices)do
  if node.type=='event'then assert(F.Nodes.enter(eventRun,eventMap,node.id));entered=true;break end
 end
 if entered then break end
 assert(Map.choose(eventMap,choices[1].id))
end
assert(entered);eventRun.hp,eventRun.maxHp,eventRun.gold=9999,9999,999999
ui.run,ui.map=eventRun,eventMap;ui:refresh();assert(ui.mode=='node');verify()
ui.run,ui.map=savedRun,savedMap;ui:refresh()
F.click(root,'mapPanel','node1');assert(ui.mode=='battle');verify()
local function handClear()
 for _=1,20 do ui:update(.05)end
 for i=1,#ui.run.combat.hand do
  local card=battle:GetChild('card'..i)
  for _,path in ipairs({'battlePanel/drawIcon/hit','battlePanel/discardIcon/hit','battlePanel/exhaustIcon/hit','battlePanel/endTurn'})do
   assert(clear(bounds(card:GetChild('hit')),bounds(at(path))),'pile or End Turn steals hand hit '..i..' '..path)
  end
 end
end
handClear();F.Combat.draw(ui.run.combat,5);ui:refresh();assert(#ui.run.combat.hand==10);handClear()
for _,i in ipairs({1,10})do F.click(root,'battlePanel','card'..i);handClear()end
local energy=bounds(at('battlePanel/energyIcon'));assert(clear(energy,bounds(at('battlePanel/drawIcon'))),'energy ring covers shifted draw icon')
assert(at('battlePanel/energy').y==at('battlePanel/energyIcon').y,'energy text left behind')
for _,kind in ipairs({'draw','discard','exhaust'})do
 local p=Mobile.handOrigin(platform,kind,{0,0});assert(p==F.Theme.officialAssets.mobileHud[kind],'draw interpolation ignored calibrated pile')
end
local flow=require('abyss_card_flow').new(battle,platform)
local card=ui.run.combat.hand[1]
flow:sync({hand={card}},{discard={card}},'discard',false)
assert(flow.waiting[1].finish[1]==552 and flow.waiting[1].finish[2]==-272,'card flight missed moved discard icon')
assert(at('battlePanel/topBar/battleRoute/hit').listeners.click());assert(ui.routeOpen)
local back=at('mapPanel/previewBack/label');assert(back.text=='返回战斗'and back.sizeDeltaX>=4*back.fontSize+8,'route return caption clipped')
assert(at('mapPanel/previewBack/hit').listeners.click());assert(not ui.routeOpen)
for _,kind in ipairs({'draw','discard','exhaust'})do
 local cards=ui.run.combat[kind];if #cards==0 then cards[1]=ui.run.combat.hand[1]end
 ui:refresh();assert(at('battlePanel/'..kind..'Icon/hit').listeners.click());assert(ui.deckUI.visible);assert(ui:closeDeck())
end
-- Real committed combat completion retains the shared resource readouts.
for _,enemy in ipairs(ui.run.combat.enemies)do enemy.hp=0 end
assert(require('abyss_run').finishCombat(ui.run));ui:refresh();verify()
assert(ui.run.phase=='reward')
local before={};for _,path in ipairs(targets)do local c=at(path);before[c]={c.x,c.y,c.sizeDeltaX,c.sizeDeltaY,c.geometryWrites}end
for _,state in ipairs({'normal','hover','pressed','disabled'})do
 local c=at('battlePanel/endTurn/'..state);before[c]={c.x,c.y,c.sizeDeltaX,c.sizeDeltaY,c.geometryWrites}
end
for _=1,3 do ui:refresh()end
for c,v in pairs(before)do assert(c.x==v[1]and c.y==v[2]and c.sizeDeltaX==v[3]and c.sizeDeltaY==v[4]);assert(c.geometryWrites==v[5],'stable refresh rewrote calibrated geometry')end
assert(initializations==1,'calibration repeated')
print('MOBILE_PHYSICAL_HUD_PASS touch')
