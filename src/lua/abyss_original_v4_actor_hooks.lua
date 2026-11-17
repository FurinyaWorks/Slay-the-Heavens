-- Enemy-death resource settlement; no card execution or actor dependency.
local M={}
function M.enemyDied(state,enemy,before)
    if not state.originalV4 or before<=0 or enemy.hp>0 or enemy==state.player then return end
    if state.originalV4.role=='AR' and enemy.v4Directive then enemy.v4Directive=nil;local v=state.originalV4;v.bond=math.min(state.originalV4Rules.AR.bond_max,v.bond+state.originalV4Rules.AR.marked_target_death_gain)end
    enemy.v4Bloom=nil;enemy.v4Directive=nil
end
return M
