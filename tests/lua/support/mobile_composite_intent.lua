-- Actual GameUI, source AI selection and native controls; no client/device claim.
local F=dofile('tests/lua/support/game_ui_fixture.lua')
local Run,C,V=require('abyss_run'),require('abyss_combat'),require('abyss_battle_intent_view')
local host,root=F.fixture();assert(F.start(host));assert(Run.startCombat(host.run,'jaw_solo'))
local battle=host.run.combat;local enemy=battle.enemies[1]
local turns=0
while C.intent(battle,1).id~='jaw_worm_3'do assert(turns<8 and C.endTurn(battle));turns=turns+1 end
assert(turns==1,'fixed project seed reaches Bellow after one real core endTurn')
assert((enemy.statuses.strength or 0)==0 and enemy.block==0,'next-intent effects have not executed')
local detail=V.intentView(battle,1);local rows={}
for _,row in ipairs(detail.rows)do rows[row.name]=row end
assert(rows['力量 3']and rows['格挡 6']and detail.sourceEnum=='DEFEND_BUFF')
local selected=V.selectedDescriptor(battle,1)
assert(selected.intent=='DEFEND_BUFF'and selected.face.badge=='buff','selected source descriptor must retain its secondary buff')
host:refresh();host:update(.8)
local panel=root:GetChild('battlePanel')
local function actor()return F.actorControl(panel,'enemy1')end
local box=actor();local primary,badge=box:GetChild('intentIcon'),box:GetChild('intentBadge')
assert(primary.visible and primary.imageId==F.Theme.icon.intent.defend,'source primary shield must remain')
assert(badge.visible and badge.imageId==F.Theme.icon.intent.buff,'both pending Bellow effects must be visible')
assert(badge.imageColor.r==F.Theme.color.buff.r and badge.imageColor.a==primary.imageColor.a,'secondary retains buff meaning and source fade')
assert(math.abs(badge.y-primary.y)<.001 and badge.x-badge.sizeDeltaX/2>=primary.x+primary.sizeDeltaX/2+F.Theme.space.xs-.001,
 'existing secondary glyph must clear the source primary')
assert(not box:GetChild('intentExtra').visible and not box:GetChild('intentLabel').visible)
assert(not box:GetChild('intent').visible,'DEFEND_BUFF does not fabricate attack damage')
-- The existing source hitbox, anchor and main glyph sizes remain untouched.
local g=require('abyss_battle_enemy_view').geometry(enemy)
local hit=box:GetChild('intentHit')
assert(primary.x==g.intentX and primary.y==g.intentY and hit.x==g.intentX and hit.y==g.intentY)
assert(hit.sizeDeltaX==64*F.Theme.canvas.base[1]/1920 and hit.sizeDeltaY==64*F.Theme.canvas.base[2]/1080)
local before=C.copy(battle)
local writes=0;local methods={}
for _,name in ipairs({'SetImage','SetSizeDelta','SetAnchoredPosition'})do
 methods[name]=badge[name]
 badge[name]=function(self,...)writes=writes+1;return methods[name](self,...)end
end
host:refresh();host:update(0)
assert(writes==0,'unchanged composite badge reuses the existing image and geometry caches')
for name,method in pairs(methods)do badge[name]=method end
assert(enemy.block==0 and(enemy.statuses.strength or 0)==0,'rendering must not execute the next intent')
assert(#battle.events==#before.events and battle.turn==before.turn,'rendering creates no combat event or turn')
F.click(root,'battlePanel','endTurn') -- Native action listeners may return no value.
assert(enemy.statuses.strength==3 and enemy.block==6,'real Bellow rule still executes once')
box=actor();assert(not box:GetChild('intentBadge').visible,'next selected attack retires the buff badge')
assert(box:GetChild('intentIcon').imageId==F.Theme.icon.intent.attack)
local attack=V.intentView(battle,1)
assert(box:GetChild('intent').text==attack.value:gsub('×','x'),'source attack damage and multiplier remain exact')
-- A replacement source actor cannot inherit the old composite badge.
host.run.combat=C.new(F.Data,{enemies={'cultist'},deck={'defend'},seed=42});host:refresh()
box=actor();assert(box:GetChild('intentIcon').visible and not box:GetChild('intentBadge').visible)
assert(box:GetChild('intentIcon').imageId==F.Theme.icon.intent.buff,'ordinary BUFF remains a single icon')
-- Hide a new, real DEFEND_BUFF through Runic Dome, then restore via a fresh owner.
host.run.combat=battle;assert(Run.obtainRelic(host.run,'runic_dome'))
local hidden=C.new(F.Data,{enemies={'jaw_worm'},deck={'defend'},seed=1})
local hiddenTurns=0
while C.intent(hidden,1).id~='jaw_worm_3'do assert(hiddenTurns<8 and C.endTurn(hidden));hiddenTurns=hiddenTurns+1 end
host.run.combat=hidden;host:refresh();box=actor()
assert(not box:GetChild('intentIcon').visible and not box:GetChild('intentBadge').visible,'Dome hides both pending effects')
assert(not box:GetChild('intentHit').visible,'hidden intent does not expose detail hitbox')
host:disable()

local packHost,packRoot=F.fixture();assert(F.start(packHost))
local queue=require('abyss_encounter_queue')
local roomRun=Run.new(F.Data,91)
for _=1,3 do local _,nextQueue=queue.consume(roomRun.encounters,'normal');roomRun.encounters=nextQueue end
roomRun.floor=4
assert(Run.startRoomCombat(roomRun,'normal'))
local pack=roomRun.combat
assert(pack.sourceEncounter=='Gremlin Gang' and #pack.enemies==4,'use the normal-room formation')
assert(Run.startCombat(packHost.run,'cultist_solo'))
packHost.run.combat=pack
packHost:refresh();packHost:update(.8)
local packPanel=packRoot:GetChild('battlePanel')
local weakGremlins,previousRight=0,-math.huge
for index,gremlin in ipairs(pack.enemies)do
 local control=F.actorControl(packPanel,'enemy'..index)
 local icon,second,damage=control:GetChild('intentIcon'),control:GetChild('intentBadge'),control:GetChild('intent')
 if gremlin.definitionId=='fat_gremlin'then
  weakGremlins=weakGremlins+1
  assert(icon.visible and icon.imageId==F.Theme.icon.intent.attack and damage.visible and damage.text=='4')
  assert(second.visible and second.imageId==F.Theme.icon.intent.debuff,'迟缓小魔 must show its pending Weak alongside attack 4')
  assert(second.imageColor.r==F.Theme.color.debuff.r and second.imageColor.a==icon.imageColor.a)
  assert(second.y==icon.y and second.x+second.sizeDeltaX/2<=icon.x-icon.sizeDeltaX/2-F.Theme.space.xs+.001)
  assert(damage.x-damage.sizeDeltaX/2>=icon.x+icon.sizeDeltaX/2+F.Theme.space.xs-.001)
  if weakGremlins==1 then
   assert(control:GetChild('intentHit').click(),'intent remains inspectable')
   assert(packHost.battleUI.info.kind=='intent' and packHost.battleUI.info.index==index)
  end
  local rows=V.intentView(pack,index).rows
  assert(rows[1].name=='攻击 4' and rows[2].name=='虚弱 1')
 else
  assert(not second.visible,'neighboring single-intent gremlin must have no badge')
 end
 local left,right=math.huge,-math.huge
 for _,part in ipairs({icon,second,damage})do
  if part.visible then
   local start=control.x+part.x-part.sizeDeltaX/2
   local width=part==damage and utf8.len(part.text)*F.Theme.layout.intent.numberSize or part.sizeDeltaX
   left,right=math.min(left,start),math.max(right,start+width)
  end
 end
 assert(left>previousRight,'adjacent gremlins must have separate intent rows')
 previousRight=right
end
assert(weakGremlins==2 and (pack.player.statuses.weak or 0)==0,'both badges are previews for independent instances')
packHost:disable()
print('MOBILE_COMPOSITE_INTENT_PASS natural Bellow and Gremlin Gang, detail/source, geometry, rule unchanged, replacement, Dome')
