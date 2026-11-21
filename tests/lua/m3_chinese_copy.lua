local F=dofile('tests/lua/support/game_ui_fixture.lua')
local h,r=F.fixture();assert(F.start(h))
local CardDisplay=require('abyss_card_display')
for _,d in ipairs(h.run.data.cards.cards)do
 local p=F.Presentation[d.id]
 if p then
  for _,upgraded in ipairs({false,true})do
   local text=CardDisplay.permanentText(p,d,{cardId=d.id,upgraded=upgraded})
   assert(not text:find('打击类牌。',1,true),'redundant strike tag in normal body '..d.id)
   assert(not text:gsub('<[^>]*>',''):find('[A-Za-z][A-Za-z]'),'English effect text '..d.id)
   assert(not text:find('TODO',1,true) and not text:find('TBD',1,true),'placeholder '..d.id)
  end
 end
end
local RelicNames=require('abyss_relic_names')
assert(RelicNames.get(h.run.data,'chemical_x')=='化学物质零号')
for _,d in ipairs(h.run.data.relics.relics)do
 -- Reward/node labels use the display resolver, not the raw source label.
 local name=RelicNames.get(h.run.data,d.id)
 assert(name:find('[\228-\233]') and not name:find('[A-Za-z]'),'non-Chinese relic name '..d.id)
 local text=h.nodeUI:describeRelic(h.run,d.id)
 assert(text~='' and text:find('[\228-\233]') and not text:find('[A-Za-z][A-Za-z]'),'non-Chinese relic effect '..d.id)
end
assert(h:openMenu())
local menu=r:GetChild('runMenu')
local run,map=h.run,h.map
local hp,gold,deck,relics=run.hp,run.gold,run.deck,run.relics
assert(not menu:GetChild('help') and not h:confirmExit())
assert(menu:GetChild('abandon'):GetChild('hit').click())
local exit=r:GetChild('exitPanel')
assert(exit.visible and not exit:GetChild('help') and not exit:GetChild('guide'))
assert(not menu:GetChild('abandon'):GetChild('hit').click())
assert(h.run==run and h.map==map and run.hp==hp and run.gold==gold and run.deck==deck and run.relics==relics)
assert(exit:GetChild('message').text:find('无法恢复',1,true))
assert(exit:GetChild('whyText').text:find('退出奇域后无法继续',1,true),'session scope must be explicit')
assert(exit:GetChild('cancel'):GetChild('hit').click())
assert(not h.exitOpen)
print('M3_CHINESE_COPY_PASS')
