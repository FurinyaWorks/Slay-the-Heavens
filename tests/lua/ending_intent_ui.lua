local readPowers=dofile('tests/lua/support/power_tip_fixture.lua')
local monsterControl=dofile('tests/lua/support/monster_control_fixture.lua')
package.path='src/lua/?.lua;build/lua/?.lua;'..package.path
local F=dofile('tests/lua/support/game_ui_fixture.lua')
local UI,Run=require('abyss_battle_ui'),require('abyss_run')
local function fixture(ids)
 local canvas=F.control({children=F.Layout});local root=F.Viewport.apply(canvas,1280,720):GetChild('battlePanel')
 local ui=UI.new(root,F.Data,F.Presentation,'click',F.withMonsterActors({imageSource='static',color=function(r,g,b,a)return{r=r,g=g,b=b,a=a}end}),{embedded=true})
 local run=Run.new(F.Data,42);run.phase='combat'
 run.combat=assert(F.Combat.new(F.Data,{seed=42,enemies=ids,deck={}}));ui.run=run
 return ui,root,run.combat
end
do
 local ui,root,s=fixture({'corrupt_heart'});ui:render()
 monsterControl(root,'enemy1'):GetChild('intentHit').click()
 assert(ui.info and ui.info.powerTips and not ui.info.kind)
 local _,rows=readPowers(root)
 assert(rows[1]=='<color=#F5D78A>策略</color>\n这名敌人将要对你施加一种强大的负面效果。')
end
do
 local ui,root,s=fixture({'spire_shield','spire_spear'})
 for i,intent in ipairs(s.enemies[1].intents)do if intent.id=='smash'then s.enemies[1].intentIndex=i end end
 F.Combat.addStatus(s.enemies[1],'weak',1);F.Combat.addStatus(s.enemies[1],'strength',1);F.Combat.addStatus(s.player,'vulnerable',1)
 ui:render();dofile('tests/lua/support/intent_face_assertion.lua')(monsterControl(root,'enemy1'),require('abyss_battle_intent_view').intentView(s,1))
 assert(monsterControl(root,'enemy1'):GetChild('intent').text=='59','detached UI preview must preserve source back-attack identity')
 monsterControl(root,'enemy1'):GetChild('intentHit').click()
 local _,rows=readPowers(root)
 assert(rows[1]=='<color=#F5D78A>攻势</color>\n这名敌人将要格挡并攻击造成 59 点伤害。')
end
do
 local ui,root,s=fixture({'deca','donu'})
 ui:render()
 local box=monsterControl(root,'enemy1')
 assert(s.enemies[1].definitionId=='deca' and box:GetChild('intent').text=='10x2')
 box:GetChild('intentHit').click()
 local _,rows=readPowers(root)
 assert(rows[1]=='<color=#F5D78A>策略</color>\n这名敌人将要对你施加负面效果并攻击造成 10 点伤害。')
end
do
 local ui,root,s=fixture({'corrupt_heart'});local e=s.enemies[1]
 assert(require('abyss_actor').applyPower(s,e,'painful_stabs',-1,e))
 local entries=F.Combat.statusView(e);local owned
 for _,entry in ipairs(entries)do if entry.id=='painful_stabs'then owned=entry end end
 assert(owned and owned.amount==-1 and owned.stack=='none')
 ui:render();assert(ui:openHelp({index=1,statusId='painful_stabs'}))
 local panel=root:GetChild('statusInfo');local name=panel:GetChild('name1')
 assert(name.text==s.catalog.statuses.painful_stabs.name,'no-number status must not show -1 stacks')
 assert(name.fontColor.r==F.Theme.color.buff.r and name.fontColor.g==F.Theme.color.buff.g,'actual PainfulStabs must use buff colour')
 local text=panel:GetChild('text1').text;assert(#text>0 and not text:find('-1',1,true))
 local Status=require('abyss_battle_status_view')
 assert(Status.statusKind({id='strength',amount=-1,kind='buff'})=='debuff')
 assert(Status.statusKind({id='dexterity',amount=-1,kind='buff'})=='debuff')
end
print('ENDING_INTENT_UI_PASS 4 strict generated-tree cases; offline controlled, no platform acceptance')
