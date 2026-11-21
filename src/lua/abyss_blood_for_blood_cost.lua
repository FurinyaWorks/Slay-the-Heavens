-- Read card cost metadata and commit the Blood for Blood upgrade cost.
local copy=require('abyss_copy').copy
local M={}
local function integer(n)
 return type(n)=='number' and n==n and n%1==0 and n>=0 and n<=2147483647
end
function M.resolved(s,c)
 local d=copy(assert(s.catalog.cards[c.cardId],'unknown status-build card'))
 if c.upgraded then for k,v in pairs(d.upgrade or {}) do d[k]=copy(v) end end;return d
end
function M.cost(s,c)
 local d=M.resolved(s,c);local base=c.combatCost or d.cost;local turn=c.turnCost
 if turn==nil then turn=base end
 assert(integer(base) and integer(turn),'invalid Blood for Blood cost metadata');return base,turn
end
-- Host invokes before changing the upgraded flag. Catalog upgrade damage is
-- still applied by ordinary definition merging, never copied into the instance.
function M.onUpgrade(s,c)
 assert(c.cardId=='blood_for_blood' and not c.upgraded,'invalid Blood for Blood upgrade')
 local base,turn=M.cost(s,c);local rawBase=base<4 and base-1 or 3
 c.combatCost=math.max(0,rawBase);c.turnCost=turn>0 and math.max(0,rawBase+turn-base) or 0
 return true
end
return M
