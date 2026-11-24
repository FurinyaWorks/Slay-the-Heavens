-- Run presentation policy. Pages still own their existing resource writers;
-- room/phase transitions never decide inventory visibility independently.
local number=require('abyss_numbers').integer
local M={}

function M.resourceText(run,player,fallbackHp)
    local state=player or (run and run.phase=='combat' and run.combat and run.combat.player) or run
    local hp=state and state.hp or fallbackHp
    local maxHp=state and state.maxHp or fallbackHp
    return number(hp)..'/'..number(maxHp),number(state and state.gold or 0)
end
function M.visible(self)
    local run=self.run
    return run~=nil and not self.characterOpen and not self.sessionPaused
        and not self.settlementRequested and not self.settlementBusy
        and (self.mode=='map' or self.mode=='battle' or self.mode=='node')
        and run.phase~='ending_proceed'
end
function M.blocked(self)
    return self.exitOpen==true and not self.routeOpen or self.menuOpen or self.deckUI.visible or self.potionUI.visible
        or self.choiceUI and self.choiceUI.visible or self.battleUI.busy
        or self.prologue and self.prologue:covering() or false
end
function M.resources(child,visible)
    for _,name in ipairs({'battlePanel','mapPanel','nodePanel'})do
        local page=child(name)
        local bar=page:GetChild(name=='battlePanel' and 'topBar' or 'officialRunBar')
        if bar then bar:SetVisible(visible)end
        local resources=page:GetChild('resources') or page
        local keys=name=='battlePanel' and {'hpIcon','player','goldIcon','piles','title'}
            or {'hpIcon','hp','goldIcon','gold'}
        for _,key in ipairs(keys)do resources:GetChild(key):SetVisible(visible)end
        if name=='nodePanel' then page:GetChild('title'):SetVisible(visible)end
    end
end
return M
