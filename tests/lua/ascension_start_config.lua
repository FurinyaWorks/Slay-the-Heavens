local F = dofile('tests/lua/support/game_ui_fixture.lua')
local Run = require('abyss_run')

local function dataWithFlag(enabled)
    local data = require('abyss_copy').copy(F.Data)
    data.rules.ascensionEnabled = enabled
    return data
end

local function host(data, seed, newSeed)
    local canvas = F.control({children=F.Layout})
    local root = F.Viewport.apply(canvas,1280,720)
    return F.GameUI.new(root,data,F.Presentation,'click',{
        seed=seed,newSeed=newSeed,prologue=false,imageSource='static',
        color=function(r,g,b,a)return {r=r,g=g,b=b,a=a}end})
end

local function selectTraveler(ui)
    assert(ui:start())
    assert(ui:selectCharacter('traveler'))
end

local calls = 0
local function entropy()
    calls = calls + 1
    return 42000
end

assert(F.Data.rules.ascensionEnabled == false, 'shipped configuration must default to disabled')
local disabled = host(F.Data,nil,entropy)
selectTraveler(disabled)
local ok, why = disabled:confirmCharacter({ascension=0,seed='123'})
assert(not ok and why=='ascension_disabled' and calls==0 and disabled.run==nil)
assert(disabled:confirmCharacter() and calls==1)
assert(disabled.run.ascension==nil and disabled.run.seedSource==nil)
assert(package.loaded.abyss_ascension_rules==nil, 'flag-off loaded ascension rules')
local legacy = Run.new(dataWithFlag(nil),42000)
assert(legacy.ascension==nil and legacy.seedSource==nil and legacy.runSeed=='42000')

local enabled = dataWithFlag(true)
local random = host(enabled,nil,entropy)
selectTraveler(random)
for _, bad in ipairs({
    {input={ascension=1}, reason='ascension_locked'},
    {input={ascension=15}, reason='invalid_ascension'},
    {input={ascension=0.5}, reason='invalid_ascension'},
    {input={ascension='0'}, reason='invalid_ascension'},
    {input={seed='9223372036854775808'}, reason='invalid_player_seed'},
    {input={seed='01'}, reason='invalid_player_seed'},
    {input={seed=1}, reason='invalid_player_seed'},
    {input=false, reason='invalid_run_config'},
}) do
    ok, why = random:confirmCharacter(bad.input)
    assert(not ok and why==bad.reason and calls==1 and random.run==nil and not random.starting, tostring(why))
end
local log
local originalPrint = print
print = function(line) log=line; originalPrint(line) end
local accepted=random:confirmCharacter()
print = originalPrint
assert(accepted and calls==2)
local codeVersion=assert(require('abyss_narrative').codeVersion, 'missing generated code version')
assert(log=='ABYSS_RUN seed=42000 source=random version='..codeVersion..' character=ironclad ascension=0', log)
assert(random.run.ascension==0 and random.run.seedSource=='random' and random.run.runSeed=='42000')
assert(random.run.eventRng.counter==disabled.run.eventRng.counter)
for i, node in ipairs(disabled.map.nodes) do
    local same = random.map.nodes[i]
    assert(same.type==node.type and same.encounterId==node.encounterId)
end
assert(#random.map.nodes==#disabled.map.nodes)

local explicit = host(enabled,'9223372036854775807',function()error('must not sample entropy')end)
selectTraveler(explicit)
local request = {ascension=0,seed='-9223372036854775808'}
assert(explicit:confirmCharacter(request))
local first = explicit.run
assert(first.seedSource=='player' and first.runSeed==request.seed and explicit.map.runSeed==request.seed)
assert(explicit.seed=='9223372036854775807')
request.ascension, request.seed = 14, '0'
first.seed=17
assert(first.ascension==0 and first.runSeed=='-9223372036854775808')

first.phase='defeat'; explicit:refresh(); selectTraveler(explicit)
assert(explicit:confirmCharacter({ascension=0,seed=first.runSeed}))
assert(explicit.run.runSeed==first.runSeed and explicit.run.seedSource=='player' and explicit.seed=='9223372036854775807')
explicit.run.phase='defeat'; explicit:refresh(); selectTraveler(explicit)
assert(explicit:confirmCharacter())
assert(explicit.run.runSeed=='9223372036854775807' and explicit.run.seedSource=='internal')
assert(explicit.seed=='-9223372036854775808', 'internal restart must preserve signed64 rollover')

local Rules = require('abyss_ascension_rules')
local ids = {'eliteDensity','normalAttack','eliteAttack','bossAttack','actHealing','startingHealth',
    'normalStats','eliteStats','bossStats','ascendersBane','potionSlots','upgradedRewards','bossGold','startingMaxHp'}
assert(Rules.maximum==14)
for _, id in ipairs(ids) do assert(not Rules.active(nil,id)) end
for level=0,Rules.maximum do
    local run = Run.new(enabled,'0',nil,{ascension=level,seedSource='player'})
    assert(run.ascension==level and run.seedSource=='player')
    for threshold,id in ipairs(ids) do assert(Rules.active(run.ascension,id)==(level>=threshold),id) end
end
assert(not pcall(Run.new,enabled,'0',nil,{ascension=15,seedSource='random'}))
assert(not pcall(Run.new,enabled,'0',nil,{ascension=0,seedSource='unknown'}))
assert(not pcall(Run.new,enabled,nil,nil,{ascension=0,seedSource='player'}), 'player input must be explicit')
assert(not pcall(Run.new,enabled,1,nil,{ascension=0,seedSource='player'}), 'player input must be lossless text')
assert(not pcall(Run.new,F.Data,'0',nil,{ascension=0,seedSource='random'}))
print('ASCENSION_START_CONFIG_PASS')
