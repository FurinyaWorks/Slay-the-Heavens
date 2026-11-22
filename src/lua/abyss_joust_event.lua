-- Independent behavior implementation of TheJoust.buttonEffect, fixed
-- aeubanks/sts@319009d5. Nodes owns the enclosing command transaction.
local Run=require('abyss_run')
local Random=require('abyss_sts_random')
local M={}
local OWNER_CHANCE=Random.float32(0.3)
local function row(choice,title,description)
    return {choice=choice,title=title,description=description,enabled=true}
end
function M.prepare(_,event)
    event.stage='halt'
    event.body='两名决斗者正在准备比试，邀请你担任一方的后勤助手。'
end
function M.options(_,event)
    if event.stage=='halt' then return {row('continue','走近','了解后勤委托的费用和报酬。')} end
    if event.stage=='explanation' then
        return {row('bet_against','协助挑战者','支付50金币购置补给；若挑战者获胜，获得100金币。'),
            row('bet_for','协助庄园主','支付50金币购置补给；若庄园主获胜，获得250金币。')}
    end
    if event.stage=='pre_joust' then return {row('continue','开始比试','观看两名决斗者交手。')} end
    if event.stage=='joust' then return {row('continue','查看结果','查看比试结果和委托报酬。')} end
    if event.stage=='complete' then return {row('leave','离开','返回路线。')} end
    return {}
end
local function placeBet(run,event,choice)
    -- Eligibility checks 50 gold before the event is drawn. The source
    -- buttons remain enabled thereafter; loseGold clamps stale funds to 0.
    event.betFor=choice=='bet_for'
    event.goldPaid=math.min(run.gold,50)
    run.gold=math.max(0,run.gold-50)
    event.stage='pre_joust'
    event.body='补给已交付，决斗者准备开始比试。'
end
local function rollJoust(run,event)
    -- This is the only rule-RNG call: AFTER paying for supplies and confirming the choice,
    -- BEFORE the outcome page. The 0.3f binary32 threshold is intentional.
    event.ownerWins=Random.randomBooleanChance(run.miscRng,OWNER_CHANCE)
    event.stage='joust'
    event.body='两名决斗者开始交手。'
end
local function settleBet(run,event)
    event.won=event.betFor==event.ownerWins
    event.payout=event.won and (event.betFor and 250 or 100) or 0
    event.goldGained=event.payout>0 and Run.gainGold(run,event.payout) or 0
    event.stage='complete'
    event.body=(event.ownerWins and '庄园主获胜。' or '挑战者获胜。')..
        (event.won and '你协助的一方获胜，获得'..event.goldGained..'金币。' or '你协助的一方落败，本次委托没有报酬。')
end
function M.choose(run,flow,choice,uid)
    local event=flow.event
    if uid~=nil then return false,'invalid_event_choice' end
    if event.stage=='halt' and choice=='continue' then
        event.stage='explanation'
        event.body='为任意一方购置补给需50金币。协助挑战者获胜可得100金币，协助庄园主获胜可得250金币。'
    elseif event.stage=='explanation' and (choice=='bet_against' or choice=='bet_for') then
        placeBet(run,event,choice)
    elseif event.stage=='pre_joust' and choice=='continue' then
        rollJoust(run,event)
    elseif event.stage=='joust' and choice=='continue' then
        settleBet(run,event)
    elseif event.stage=='complete' and choice=='leave' then
        return true,'complete'
    else return false,'invalid_event_choice' end
    return true,'pending'
end
return M
