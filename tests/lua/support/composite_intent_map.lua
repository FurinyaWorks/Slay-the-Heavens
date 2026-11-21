-- Actual GameUI, source AI selection and native controls; no client/device claim.
local F=dofile('tests/lua/support/game_ui_fixture.lua')
local Run,C,V=require('abyss_run'),require('abyss_combat'),require('abyss_battle_intent_view')
local cursor={CursorDown='down',CursorDrag='drag',CursorUp='up',CursorExit='exit',CursorEnter='enter',CursorEndDrag='endDrag'}
local host,root=F.fixture(nil,nil,nil,cursor);assert(F.start(host));assert(Run.startCombat(host.run,'jaw_solo'))
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
local function same(a,b)
 if type(a)~=type(b)then return false end
 if type(a)~='table'then return a==b end
 for k,v in pairs(a)do if not same(v,b[k])then return false end end
 for k in pairs(b)do if a[k]==nil then return false end end
 return true
end
local function get(...)
 local c=root;for _,name in ipairs({...})do c=assert(c:GetChild(name),name)end;return c
end
local function tap(hit,id)
 hit.listeners.down({touchId=id});hit.listeners.up({touchId=id});return hit.click({touchId=id})
end
local before=C.copy(host.run);local run,map=host.run,host.map
assert(tap(get('battlePanel','topBar','battleRoute','hit'),201));assert(host.routeOpen)
assert(not host.mapUI.navigationEnabled and not host.mapUI:choose('f1_l1'))
assert(tap(get('mapPanel','previewBack','hit'),202))
assert(host.mode=='battle' and not host.routeOpen and host.run==run and host.map==map and host.run.combat==battle)
assert(same(before,host.run),'Map/return must leave complete Run including RNG and pending Bellow unchanged')
box=actor();primary,badge=box:GetChild('intentIcon'),box:GetChild('intentBadge')
assert(primary.visible and primary.imageId==F.Theme.icon.intent.defend)
assert(badge.visible and badge.imageId==F.Theme.icon.intent.buff,'returned current Bellow retains its real secondary')
assert((enemy.statuses.strength or 0)==0 and enemy.block==0,'Map cannot execute pending intent')
-- The original public C-tier action remains valid after actual Map return.
F.click(root,'battlePanel','endTurn')
assert(enemy.statuses.strength==3 and enemy.block==6,'real returned Bellow executes exactly once')
box=actor();assert(not box:GetChild('intentBadge').visible,'next attack cannot retain Bellow badge')
assert(box:GetChild('intentIcon').imageId==F.Theme.icon.intent.attack)
host:disable();print('GAMEUI_MAP_INTENT_PASS 1')
