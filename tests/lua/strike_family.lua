local C,Run=require('abyss_combat'),require('abyss_run')
local Data,Actions=require('abyss_data'),require('abyss_card_actions')
local Display=require('abyss_card_display')
local Presentation=require('abyss_character_presentation')
local colors=require('abyss_theme').color
local Strike=require('abyss_strike')
local ids={
    'strike','twin_strike','pommel_strike','wild_strike','perfected_strike',
    'strike_green','strike_blue','strike_purple','sneaky_strike','meteor_strike',
    'thunder_strike','windmill_strike','swift_strike',
}
local expected={}
for _,id in ipairs(ids)do expected[id]=true end

local function battle(character)
    local options=character~='ironclad' and {character=character,experimental=true} or nil
    local run=Run.new(Data,42,options)
    assert(Run.startCombat(run,'raven_adept_solo'))
    local s=run.combat
    s.hand,s.draw,s.discard,s.exhaust={},{},{},{}
    s.energy=20
    s.enemies[1].hp,s.enemies[1].maxHp=500,500
    return s,Presentation.prepare(require('abyss_presentation'),run.data)
end
local function add(s,pile,id,upgraded)
    local c=Actions.fresh(C,s,id)
    c.upgraded=upgraded==true
    local cards=s[pile];cards[#cards+1]=c
    return c
end
local function settle(s,card,damage)
    assert(C.cardPreview(s,card,1)[1].low==damage)
    assert(C.play(s,card.uid,1))
end

for _,character in ipairs({'ironclad','silent','defect','watcher'})do
    local s=battle(character)
    for id,card in pairs(s.catalog.cards)do
        assert(Strike.matches(card)==(expected[id]==true),character..' Strike membership: '..id)
    end
    for _,id in ipairs(ids)do assert(s.catalog.cards[id],character..' missing '..id)end
end
assert(Strike.matches({strikeTag=true}) and Strike.matches({tags={'STRIKE'}}))
assert(Strike.matches({sourceTags={'STRIKE'}}))
assert(not Strike.matches({name='剑势·初式'}))
assert(not Strike.matches({sourceTags={'STRIKE'},upgrade={sourceTags={}}},true))

local s,presentation=battle('ironclad')
local v=presentation.perfected_strike
local suffix='点伤害。手牌、抽牌堆和弃牌堆中每有一张『剑势』系列牌，基础伤害增加'
assert(v.text=='造成6'..suffix..'2点。')
assert(v.upgradeText=='造成6'..suffix..'3点。')
for _,upgraded in ipairs({false,true})do
    s.hand,s.draw,s.discard,s.exhaust={},{},{},{}
    s.enemies[1].hp=500
    local c=add(s,'hand','perfected_strike',upgraded)
    local bonus=upgraded and 3 or 2
    assert(C.cardPreview(s,c,1)[1].low==6+bonus,'counts itself exactly once')
    add(s,'hand','strike')
    local strike=add(s,'draw','strike')
    s.discard[1]=Actions.fresh(C,s,'strike',strike)
    add(s,'discard','perfected_strike',not upgraded)
    add(s,'draw','sneaky_strike')
    add(s,'discard','swift_strike')
    add(s,'exhaust','wild_strike')
    add(s,'hand','anger')
    add(s,'hand','dual_wield')
    local damage=6+7*bonus
    local live=upgraded and v.upgradeCombatText or v.combatText
    for _=1,2 do
        local copy=C.cardDefinition(s,c)
        local preview=C.cardPreview(s,c,1,copy)
        local text=Display.format(live,copy,preview,colors):gsub('<color=#[%x]+>',''):gsub('</color>','')
        assert(text=='造成'..damage..suffix..bonus..'点。')
    end
    settle(s,c,damage)
    assert(s.enemies[1].hp==500-damage)
    assert(s.catalog.cards[c.cardId].effects[1].value==6)
end

-- Havoc removes its target from the draw pile before the queued card resolves.
s=battle('ironclad')
local havoc=add(s,'hand','havoc')
local autoplay=add(s,'draw','perfected_strike',true)
assert(C.play(s,havoc.uid,1))
assert(s.enemies[1].hp==491 and s.exhaust[1]==autoplay)
s=battle('ironclad')
s.player.statuses.duplication=1
settle(s,add(s,'hand','perfected_strike'),8)
assert(s.enemies[1].hp==484,'a same-instance replay counts the original once')

for _,case in ipairs({
    {'ironclad','twin_strike',8,2},
    {'ironclad','perfected_strike',11,1},
    {'ironclad','sneaky_strike',15,1},
    {'ironclad','swift_strike',10,1},
    {'defect','thunder_strike',10,2},
    {'ironclad','anger',6,1},
})do
    local character,id,hit,times=table.unpack(case)
    s=battle(character)
    s.relics[#s.relics+1]='strike_dummy'
    if id=='thunder_strike' then s.orbChannelCounts.lightning=2 end
    settle(s,add(s,'hand',id),hit)
    assert(s.enemies[1].hp==500-hit*times,id..' Strike Dummy damage per hit')
end
print('Strike family: all four catalogs, pile counts, copies, autoplay, dynamic text and per-hit relic damage')
