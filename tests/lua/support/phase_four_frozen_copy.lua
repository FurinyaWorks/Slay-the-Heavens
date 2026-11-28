-- Replay only known copy/identity changes against the archived #349 snapshot.
-- All 176 rows still come from the live presenter. Exact new suffixes must match
-- before projecting them back; the original digest protects the rest of each row.
local M={}
local innate={'先天。','先天：开局优先抽到。'}
local innateExhaust={'先天。消耗。','先天：开局优先抽到。消耗。'}
local devotion={'。下回合起抽牌后获等量真言，无真言且供奉达10层时直接进入神格。',
    '：从下回合起，每回合抽牌后获得等量真言；没有真言且供奉达到 10 层时，直接进入神格。'}
local eviscerate={'本回合每主动弃 1 张牌，本牌少费 1（最低 0）。',
    '本回合每次主动弃牌，本牌费用降低 1，最低 0；新回合恢复基础费用。'}
local ethereal={'虚无。','虚无：回合结束时仍在手中则消耗。'}
local function strike(n)
    return {'手牌、抽牌堆和弃牌堆中每有一张『剑势』系列牌，基础伤害增加'..n..'点。',
        '手牌、抽牌堆和弃牌堆中每有一张带打击标签的牌，基础伤害增加 '..n..'。'}
end
local strike2,strike3=strike(2),strike(3)
local copyChanges={
    after_image={upgradeText=innate},
    backstab={text=innateExhaust,upgradeText=innateExhaust,combatText=innateExhaust,upgradeCombatText=innateExhaust},
    boot_sequence={text=innateExhaust,upgradeText=innateExhaust,combatText=innateExhaust,upgradeCombatText=innateExhaust},
    brutality={upgradeText=innate},
    devotion={text=devotion,upgradeText=devotion},
    eviscerate={text=eviscerate,upgradeText=eviscerate,combatText=eviscerate,upgradeCombatText=eviscerate},
    infinite_blades={upgradeText=innate},
    perfected_strike={text=strike2,upgradeText=strike3,combatText=strike2,upgradeCombatText=strike3},
    storm={upgradeText=innate},
    void={text=ethereal,upgradeText=ethereal},
}
local function archivedText(id,card,field)
    local copy=card[field] or ''
    local pair=(copyChanges[id] or {})[field]
    if not pair then return copy end
    local current,archived=pair[1],pair[2]
    assert(copy:sub(-#current)==current,'current copy differs from reviewed wording: '..id..'/'..field)
    return copy:sub(1,#copy-#current)..archived
end
function M.currentId(id) return id=='calculated_gamble' and 'calculated_exchange' or id end
function M.archiveRow(id,card)
    assert(card.id==M.currentId(id),'unexpected current identity: '..id)
    return table.concat({id,card.name,archivedText(id,card,'text'),archivedText(id,card,'upgradeText'),
        archivedText(id,card,'combatText'),archivedText(id,card,'upgradeCombatText'),card.cost,card.upgradeCost,card.type},'\0')..'\1'
end
return M
