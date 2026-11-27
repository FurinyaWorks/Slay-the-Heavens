-- Controlled room/deck setup. Every turn, damage and reward uses production commands.
local Data=require('abyss_data')
local Run=require('abyss_run')
local Combat=require('abyss_combat')
local Encounters=require('abyss_encounter_queue')

local deck={
    'barricade','impervious','shrug_it_off','shrug_it_off','shrug_it_off',
    'power_through','power_through','entrench','entrench','body_slam','body_slam','body_slam',
    'offering','offering','flame_barrier','flame_barrier',
}

local function startBoss(seen)
    local run=Run.new(Data,'42',{experimental=true,campaign=true,campaignProfile='full-source',character='ironclad'})
    for _,card in ipairs(Combat.copy(run.deck)) do assert(Run.removeCard(run,card.uid)) end
    for _,id in ipairs(deck) do assert(Run.obtainCard(run,id,{upgraded=true})) end
    run.act,run.floor,run.encounters=3,50,Encounters.new(run.runSeed,3)
    run.bossInitialization,run.encounters=Encounters.initializeBoss(run.encounters,seen)
    assert(Run.startRoomCombat(run,'boss'))
    return run
end

local cardScores={barricade=1000,offering=30,power_through=100,impervious=120,shrug_it_off=80,flame_barrier=75}
local function chooseCard(battle)
    local choice,rank=nil,0
    for _,card in ipairs(battle.hand) do
        if card.cardId=='body_slam' then
            for target,enemy in ipairs(battle.enemies) do
                local score=math.min(battle.player.block,enemy.hp+enemy.block)
                if score>rank and Combat.canPlay(battle,card.uid,target) then
                    choice,rank={uid=card.uid,target=target},score
                end
            end
        else
            local score=cardScores[card.cardId] or 0
            if card.cardId=='entrench' then score=battle.player.block>12 and 150 or 10 end
            if score>rank and Combat.canPlay(battle,card.uid) then choice,rank={uid=card.uid},score end
        end
    end
    return choice
end

local function eventOccurred(battle,kind,predicate)
    for _,event in ipairs(battle.events) do
        if event.kind==kind and predicate(event.detail,event.frame) then return true end
    end
    return false
end

local function playBattle(run)
    local battle=run.combat
    local oneTwinRemaining=false
    for _=1,140 do
        if run.phase~='combat' then break end
        local choice=chooseCard(battle)
        if choice then assert(Run.play(run,choice.uid,choice.target))
        else assert(Run.endTurn(run)) end
        if #battle.enemies==2 and battle.enemies[1].hp==0 and battle.enemies[2].hp>0 then
            assert(run.phase=='combat' and run.victories==0)
            oneTwinRemaining=true
        end
    end
    assert(run.phase=='reward' and run.victories==1 and Combat.outcome(battle)=='victory')
    assert(battle.turn>=3 and battle.player.hp>0)
    local rewards,gold=run.rewards,run.gold
    assert(not Run.endTurn(run) and rawequal(run.rewards,rewards) and run.gold==gold and run.victories==1)
    return battle,oneTwinRemaining
end

local function awakenedOne()
    local run=startBoss({})
    assert(run.encounterSource=='Awakened One')
    local battle=playBattle(run)
    local boss=battle.enemies[3]
    assert(boss.definitionId=='awakened_one' and boss.awakenedForm==2 and boss.hp==0)
    assert(eventOccurred(battle,'status',function(d) return d.target==boss.id and d.status=='strength' and d.amount==1 end))
    assert(eventOccurred(battle,'heal',function(d) return d.target==boss.id and d.amount==300 end))
    assert(battle.enemies[1].escaped and battle.enemies[2].escaped,'living cultists escape after the final form')
end

local function donuDeca()
    local run=startBoss({CROW=true})
    assert(run.encounterSource=='Donu and Deca')
    local battle,oneTwinRemaining=playBattle(run)
    local deca,donu=battle.enemies[1],battle.enemies[2]
    assert(deca.definitionId=='deca' and donu.definitionId=='donu' and oneTwinRemaining)
    assert(eventOccurred(battle,'cards_created',function(d) return d.cardId=='dazed' and d.amount==2 and d.source==deca.id end))
    assert(eventOccurred(battle,'status',function(d) return d.target==deca.id and d.source==donu.id and d.status=='strength' and d.amount==3 end))
    assert(eventOccurred(battle,'block',function(d) return d.target==donu.id and d.amount==16 end))
end

local function timeEater()
    local run=startBoss({CROW=true,DONUT=true})
    assert(run.encounterSource=='Time Eater')
    local battle=playBattle(run)
    local boss=battle.enemies[1]
    assert(boss.definitionId=='time_eater' and boss.timeEaterUsedHaste and boss.hp==0)
    assert(eventOccurred(battle,'status',function(d) return d.target==boss.id and d.status=='time_warp' and d.amount==-11 end))
    assert(eventOccurred(battle,'status',function(d) return d.target==boss.id and d.status=='strength' and d.amount==2 end))
    assert(eventOccurred(battle,'heal',function(d,frame) return d.target==boss.id and d.amount>0 and frame.enemies[1].hp==228 end))
end

awakenedOne()
donuDeca()
timeEater()
print('ACT3_BOSS_COMPLETE_FIGHTS_PASS 3')
