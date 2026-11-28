-- Each entry is the first level that applies the rule. Higher levels retain it.
local thresholds = {
    eliteDensity = 1, normalAttack = 2, eliteAttack = 3, bossAttack = 4,
    actHealing = 5, startingHealth = 6, normalStats = 7, eliteStats = 8, bossStats = 9,
    ascendersBane = 10, potionSlots = 11, upgradedRewards = 12, bossGold = 13, startingMaxHp = 14,
}
local M = {maximum = thresholds.startingMaxHp}

function M.validLevel(level)
    return type(level)=='number' and level>=0 and level<=M.maximum and level%1==0
end

function M.active(level, rule)
    return level~=nil and level>=assert(thresholds[rule],'unknown ascension rule')
end

return M
