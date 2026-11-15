local F=dofile('tests/lua/support/game_ui_fixture.lua')
local Run=require('abyss_run')
local Asset=require('abyss_traveler_portrait_assets')
Asset.imagePrefabId,Asset.containerPrefabId=41,73
local canvas=F.control({children=F.Layout})
-- This fixture normally models command state only. Import the native initial
-- transforms and raycast flag for the geometry/layer contract under test.
local function initial(control,spec)
 if spec.position then control:SetAnchoredPosition(table.unpack(spec.position))end
 if spec.scale then control:SetLocalScale(spec.scale[1],spec.scale[2],1)end
 if spec.raycastTarget~=nil then control.raycastTarget=spec.raycastTarget end
 for _,child in ipairs(spec.children or{})do initial(control:GetChild(child.name),child)end
end
initial(canvas,{children=F.Layout})
local root=F.Viewport.apply(canvas,1280,720)
local panel=root:GetChild('battlePanel');local hero=panel:GetChild('hero')
local figure=hero:GetChild('officialFigure');local shadow=assert(figure:GetChild('groundShadow'))
assert(shadow.parent==figure and shadow.raycastTarget==false)
local created,images={},{}
local function activation(self,value)F.setEngineActive(self,value)end
figure.SetActive=activation
Enum={ImageSource={StaticReference='static'},ImageType={Basic=1,Stretch=2}}
Color={FromRGBA=function(r,g,b,a)return {r=r,g=g,b=b,a=a}end}
game={InstantiateClientUIControl=function(index,parent)
 assert(index==41 or index==73)
 local c=F.control({name='formal'..(#created+1),kind=index==41 and 'image' or 'container'},parent)
 c.SetActive=activation;created[#created+1]=c
 if index==41 then c:SetImage('static',100001);images[#images+1]=c end
 return c
end,DestroyClientUIControl=function(c)c:SetVisible(false);return true end}
local portraits=require('abyss_traveler_portraits').new(root,nil,{battlePortrait=true})
local ui=F.GameUI.new(root,F.Data,F.Presentation,'click',{seed=1,imageSource='static',color=function(r,g,b,a)return {r=r,g=g,b=b,a=a}end,portraits=portraits})
root.ui=ui
local function visible(c)
 while c do if c.visible==false or c.alive==false or c.activeInHierarchy==false then return false end;c=c.parent end
 return true
end
local function ready()
 for _=1,1000 do ui:update(.02);if portraits:status().battle.phase=='ready'then return end end
 error('approved portrait never ready')
end
assert(not visible(shadow),'unprepared figure leaked ground shadow')
assert(F.start(ui));assert(Run.startCombat(ui.run,'cultist_solo'));ui:refresh();ready()
assert(#images==7303,'ground shadow changed the approved native figure rows')
assert(visible(shadow) and shadow.imageColor.a==255)
local complete=#created
assert(shadow.x==1.5 and shadow.y==-93 and shadow.sizeDeltaX==127 and shadow.sizeDeltaY==15.875)
local scale=figure.scale[2]
local bottom=(figure.y or 0)+shadow.y*scale-shadow.sizeDeltaY*scale/2
local hp=hero:GetChild('hpFill')
assert(bottom>hp.y+hp.sizeDeltaY/2,'ground shadow covers HP')
assert(ui:openMenu());assert(F.click(root,'runMenu','mainMenu'));assert(not visible(shadow))
assert(F.click(root,'menuPanel','continueRun'));ready()
assert(visible(shadow) and #created==complete,'returning to battle rebuilt the shadow/figure')
-- Real end-turn damage drives the existing player death clock/alpha.
ui.run.combat=F.Combat.new(F.Data,{deck={'strike'},enemies={'jaw_worm'},seed=42});ui.run.combat.player.hp=1
ui:refresh();ui:update(.02);panel:GetChild('endTurn').click();assert(ui.battleUI.busy)
local faded=false
for _=1,1000 do
 ui:update(.02)
 if ui.battleUI.feedback.dying.player then
  assert(shadow.imageColor.a==hero:GetChild('portrait').imageColor.a,'shadow does not share death alpha')
  faded=faded or shadow.imageColor.a<255
 end
 if not ui.battleUI.busy and not ui.motion.deathReveal and ui.run.phase=='defeat'then break end
end
assert(faded and not visible(shadow),'death left a visible orphan shadow')
assert(F.start(ui))
assert(ui.mode=='node' and ui.run.nodeFlow.event.id=='neow')
F.click(root,'nodePanel','eventView/option1');F.click(root,'nodePanel','eventView/option2');F.click(root,'nodePanel','eventView/option1')
assert(ui.mode=='map');assert(ui.mapUI:choose(F.Nodes.available(ui.run,ui.map)[1].id));assert(ui.mode=='battle');ready();ui:update(.02)
assert(visible(shadow) and shadow.imageColor.a==255 and #created==complete,'new run failed to restore reused shadow')
assert(portraits:release() and not visible(shadow),'release leaked ground shadow')
ui:disable();portraits:onEngineDestroy()
assert(not visible(shadow),'destroy leaked ground shadow')
print('PLAYER_GROUND_SHADOW_PASS source feet alpha pause restart release exact7303')
