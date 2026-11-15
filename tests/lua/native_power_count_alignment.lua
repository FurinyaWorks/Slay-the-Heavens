-- Current production Host. Conservative native glyph budget, not original GDX H0.
local F=dofile('tests/lua/support/game_ui_fixture.lua')
local same=dofile('tests/lua/support/current_game_ui_parity_fixture.lua').same
local Enemy=require('abyss_battle_enemy_view')
local Powers=require('abyss_monster_power_surfaces')
local power=dofile('tests/lua/support/monster_power_control_fixture.lua')
local actors=require('abyss_monster_surfaces')
local mobile=false
local host,root=F.fixture(nil,nil,nil,nil,nil,nil,{touchScreen=function()return mobile end})
assert(F.start(host));assert(require('abyss_run').startCombat(host.run,'cultist_solo'))
local panel=root:GetChild('battlePanel')
local function near(a,b)return math.abs(a-b)<1e-7 end
local countSpec
for _,spec in ipairs(F.Templates.AbyssMonsterPower.children)do if spec.name=='count'then countSpec=spec end end
assert(countSpec.text.fontSize==20 and countSpec.text.align=='right'and countSpec.text.valign=='top')
assert(countSpec.text.minimumFontSize==nil or countSpec.text.minimumFontSize==20)
local checked=0
for _,touch in ipairs({false,true})do
 mobile=touch
 local boundary={misc={integer=function()return 0 end,boolean=function()return false end},visualFloat=function()return 0 end}
 local deck={};for i=1,10 do deck[i]='strike'end
 local battle=F.Combat.new(F.Data,{deck=deck,seed=42,sourceEncounter='Lots of Slimes',encounterBoundary=boundary})
 F.Combat.draw(battle,10-#battle.hand)
 for _,actor in ipairs(battle.enemies)do actor.block=999;F.Combat.addStatus(actor,'strength',1)end
 host.run.combat=battle
 for _,amount in ipairs({1,10,99,100,999,1000,-7,-999,0})do
  for _,actor in ipairs(battle.enemies)do actor.statuses.strength=amount end
  local before=F.Combat.copy(host.run)
  local enemies,hand,rng= battle.enemies,battle.hand,battle.rng
  host:refresh();host.battleUI:render()
  same(host.run,before,'render mutates complete Run')
  assert(battle.enemies==enemies and battle.hand==hand and battle.rng==rng and host.run.combat==battle)
  for index,actor in ipairs(battle.enemies)do
   local box=assert(actors.get(panel):find(actor.id));local g=Enemy.geometry(actor)
   local chip=power(box,'strength');local count=chip:GetChild('count')
   assert(count.visible==(amount~=0)and count.text==(amount==0 and ''or tostring(amount)),'full signed source count')
   assert(count.sizeDeltaX>=#count.text*20 and count.sizeDeltaY==40,'unchanged native count capacity')
   local amountY=(mobile and -22 or -18)*g.sourceScale
   local inkCentre=count.y+(40-20)/2
   assert(near(inkCentre,amountY+20),'NATIVE_POWER_RIGHT_TOP: count projects above source amount anchor')
   assert(near(count.x+count.sizeDeltaX/2,22*g.sourceScale),'source right anchor changed')
   local hit=chip:GetChild('hit')
   assert(hit.x==0 and hit.y==0 and near(hit.sizeDeltaX,(mobile and 55 or 48)*g.sourceScale)and near(hit.sizeDeltaY,48*g.sourceScale))
   local actorHit=box:GetChild('hit')
   assert(near(actorHit.x,g.hitX-g.x)and near(actorHit.y,g.hitY-g.y)and near(actorHit.sizeDeltaX,g.hitWidth)and near(actorHit.sizeDeltaY,g.hitHeight))
   local ordered={};Powers.get(box:GetChild('statusRow')):each(function(_,_,entry)ordered[#ordered+1]=entry.id end)
   local source=F.Combat.statusView(actor)
   assert(#ordered==#source);for i,status in ipairs(source)do assert(ordered[i]==status.id,'source Power membership/order changed')end
   assert(box:GetChild('block').sizeDeltaX<3*24,'known source Block capacity NoGo must remain visible')
   checked=checked+1
  end
 end
 -- Native status hit keeps the exact actor and power identity after reprojection.
 local actor=battle.enemies[2];actor.statuses.strength=7;host:refresh()
 local box=actors.get(panel):find(actor.id);local chip=power(box,'strength')
 local before=F.Combat.copy(host.run)
 chip:GetChild('hit').click({touchId=31})
 local info=host.battleUI.info
 assert(info and info.id==actor.id and info.index==2 and info.battle==battle and info.statusId=='strength','Power callback identity changed')
 same(host.run,before,'status callback mutates complete Run')
end
print('NATIVE_POWER_COUNT_ALIGNMENT_PASS '..checked..' native budget projections; source H0/pixel/device unverified; Block NoGo retained')
