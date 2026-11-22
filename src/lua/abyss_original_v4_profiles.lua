-- Production original identities. Frozen data is never rewritten or taxed here.
local M={}
local ids={hutao='HT',arlecchino='AR',furina='FR',raiden='RD',HT='HT',AR='AR',FR='FR',RD='RD'}
local names={HT='hutao',AR='arlecchino',FR='furina',RD='raiden'}
local rarity={['基础']='basic',['普通']='common',['罕见']='uncommon',['稀有']='rare'}
local function copy(v)
    if type(v)~='table' then return v end
    local t={};for k,x in pairs(v)do t[k]=copy(x)end;return t
end
function M.is(id)return ids[id]~=nil end
local function hasTarget(effects)
    for _,e in ipairs(effects)do
        if e.target~='all' and (e.op=='damage' or e.op=='damage_spent' or e.op=='bloom' or e.op=='cash_bloom'
            or e.op=='directive' or e.op=='mature' or e.op=='absorb' or e.op=='eye_pulse')then return true end
        if e.op=='when' and (e.condition:match('_target$') or e.condition=='enemy_low' or hasTarget(e.effects))then return true end
    end
    return false
end
local function definition(raw,color)
    local frozenCard=copy(raw)
    local function version(up)
        local value=raw[up and 'upgrade' or 'base']
        return {cost=value.cost,effects={{op='originalV4',raw=frozenCard,upgraded=up}},exhaust=value.exhaust,originalV4Upgraded=up}
    end
    local card=version(false)
    card.id=raw.id;card.name=raw.name;card.color=color;card.rarity=assert(rarity[raw.rarity])
    card.type=(raw.category=='normal' or raw.category=='charged') and 'attack' or 'skill'
    card.category=raw.category;card.originalV4=frozenCard
    card.target=(hasTarget(raw.base.effects) or hasTarget(raw.upgrade.effects)) and 'ENEMY' or 'SELF'
    card.upgrade=version(true)
    return card
end
local function loadout(data,id)
    local role=assert(ids[id],'unknown original character')
    assert(not data.originalV4Role and not data.experimentalCharacter,'character data already prepared')
    local frozen=require('abyss_original_v4_data')
    local spec=assert(frozen.rules.roles[role])
    local relic='original_v4_'..role:lower()
    return frozen,spec,{id=names[role],role=role,color=names[role],originalV4=true,maxHp=spec.max_hp,
        starterDeck=copy(spec.starter),startingRelic=relic},
        {id=relic,name=spec.relic,rarity='starter',trigger='original_v4',effects={}}
end
function M.preview(data,id)
    local frozen,spec,profile,relic=loadout(data,id)
    local cards,wanted={},{}
    for _,card in ipairs(spec.starter)do wanted[card]=true end
    for _,raw in ipairs(frozen.cards)do
        if raw.role==profile.role and wanted[raw.id] then cards[#cards+1]=definition(raw,profile.color)end
    end
    return {cards={cards=cards,starter_deck={cards=copy(spec.starter)}},
        relics={relics={relic}},rules={player={maxHp=spec.max_hp,startingGold=data.rules.player.startingGold,
            startingRelics={relic.id}}},originalV4Role=profile.role},profile
end
function M.prepare(data,id)
    local frozen,spec,profile,relic=loadout(data,id)
    local prepared=copy(data);local color,role=profile.color,profile.role
    local pools={common={},uncommon={},rare={}}
    local shop,metadata={common={attack={},skill={},power={}},uncommon={attack={},skill={},power={}},rare={attack={},skill={},power={}}},{}
    local count=0
    for _,raw in ipairs(frozen.cards)do if raw.role==role then
        count=count+1
        local card=definition(raw,color)
        prepared.cards.cards[#prepared.cards.cards+1]=card
        if pools[card.rarity]then
            pools[card.rarity][#pools[card.rarity]+1]=card.id
            shop[card.rarity][card.type][#shop[card.rarity][card.type]+1]=card.id
            metadata[card.id]={sourceId=card.id,rarity=card.rarity,type=card.type}
        end
    end end
    assert(count==frozen.rules.scope.cards_per_role,'incomplete original card pool')
    for _,pool in pairs(pools)do table.sort(pool)end
    for _,typed in pairs(shop)do for _,pool in pairs(typed)do table.sort(pool)end end
    prepared.cards.sourcePools=copy(prepared.cards.sourcePools or {})
    prepared.cards.sourcePools.reward=copy(pools);prepared.cards.sourcePools.src=copy(pools)
    prepared.cards.sourcePools.shop=shop;prepared.cards.sourcePools.cardSourceMetadata=metadata
    prepared.cards.starter_deck={cards=copy(spec.starter)}
    prepared.relics.relics[#prepared.relics.relics+1]=relic
    prepared.rules.player.maxHp=spec.max_hp
    prepared.rules.player.energyPerTurn=frozen.rules.common.energy_per_turn
    prepared.rules.player.drawPerTurn=frozen.rules.common.draw_per_turn
    prepared.rules.player.maxHand=frozen.rules.common.hand_cap
    prepared.rules.player.startingRelics={relic.id}
    prepared.originalV4Role=role;prepared.originalV4Rules=copy(frozen.rules)
    return prepared,profile
end
return M
