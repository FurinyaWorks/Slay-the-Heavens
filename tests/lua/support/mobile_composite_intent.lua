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
host.run.combat=C.new(F.Data,{enemies={'raven_adept'},deck={'defend'},seed=42});host:refresh()
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
print('MOBILE_COMPOSITE_INTENT_PASS natural Bellow, detail/source, source geometry, rule unchanged, next attack, actor replacement, Dome')
