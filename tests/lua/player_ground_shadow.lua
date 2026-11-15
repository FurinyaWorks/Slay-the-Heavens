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
-- The lowest opaque native row and shadow must share the same transformed
-- ground plane through idle bands and the existing whole-host action pose.
local foot
for index,row in ipairs(Asset.battleApprovedIdle.rows)do
 if row[18]>=128 and row[3]-row[5]/2==-93 then foot=images[index];break end
end
assert(foot,'approved solid foot row missing')
local function point(control,x,y)
 while control do
  x=(control.x or 0)+x*(control.localScaleX or 1)
  y=(control.y or 0)+y*(control.localScaleY or 1)
  control=control.parent
 end
 return x,y
end
local function grounded()
 local fx,fy=point(foot,0,-foot.sizeDeltaY/2)
 local left,ground=point(shadow,-shadow.sizeDeltaX/2,0)
 local right=point(shadow,shadow.sizeDeltaX/2,0)
 assert(math.abs(fy-ground)<1e-7 and fx>=left and fx<=right,'transformed feet detached from ground shadow')
end
for _=1,44 do
 portraits:battlePose(0,0,1,1,.05,'idle');grounded()
end
local Combat=require('abyss_combat')
local before=Combat.copy(ui.run)
local function same(a,b)
 if type(a)~='table' or type(b)~='table'then return a==b end
 for key,value in pairs(a)do if not same(value,b[key])then return false end end
 for key in pairs(b)do if a[key]==nil then return false end end
 return true
end
portraits:battlePose(31,-7,1.2,.8,.02,'action');grounded()
assert(figure.localScaleX~=figure.localScaleY,'nonuniform action transform was not exercised')
assert(same(before,ui.run),'portrait/shadow pose changed Run or RNG')
portraits:battlePose(0,0,1,1,.02,'idle');grounded()
local enemy=F.actorControl(panel,'enemy1');local lookup=enemy.GetChild
enemy.GetChild=function(self,name)
 assert(name~='officialFigure','player shadow painter touched an enemy portrait host')
 return lookup(self,name)
end
ui:update(.02);enemy.GetChild=lookup
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
print('PLAYER_GROUND_SHADOW_PASS source feet alpha pause restart release exact7303 idleBands actionTransform runRng enemyIsolation')
