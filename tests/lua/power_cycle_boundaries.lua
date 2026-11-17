package.path='src/lua/?.lua;'..package.path
local roots={'abyss_power_order','abyss_power_schedule','abyss_power_membership','abyss_turn_power_phases'}
for _,first in ipairs({'abyss_power_order','abyss_power_schedule'})do
 for _,name in ipairs(roots)do package.loaded[name]=nil end
 require(first)
 local Order=require('abyss_power_order')
 local Schedule=require('abyss_power_schedule')
 local Membership=require('abyss_power_membership')
 assert(Order==Membership,'display and public API must share ordinary mutable slots')
 local previous={'strength','weak','thorns'}
 local actor={definitionId='fixture',statuses={strength=2,weak=1,thorns=1},powerOrder=previous}
 local state={player={statuses={}}}
 local calls=0
 local original=Order.remove
 Order.remove=function(owner,id)
  assert(owner==actor and id=='weak','schedule changed display removal arguments')
  calls=calls+1
  return original(owner,id)
 end
 assert(Schedule.remove(state,actor,'weak')==false,'unrecorded schedule removal keeps old return')
 assert(calls==1,'schedule must read the public remove slot at each call')
 assert(actor.powerOrder~=previous and table.concat(actor.powerOrder,',')=='strength,thorns')
 assert(table.concat(previous,',')=='strength,weak,thorns','detached frames must not be mutated')
 assert(actor.statuses.weak==1,'schedule removal must not remove status membership')
 assert(actor.powerScheduleOrder==nil and actor.powerScheduleSerial==nil)
 local marker={kind='identity-preserved-error'}
 Order.remove=function()error(marker)end
 local ok,err=pcall(Schedule.remove,state,actor,'weak')
 assert(not ok and err==marker,'public replacement errors must retain identity')
 Order.remove=original
 local player={statuses={weak=1},powerOrder={'weak'}}
 assert(Schedule.remove(state,player,'weak')==false)
 assert(player.powerOrder[1]=='weak','player display removal is owned by its caller')
 assert(package.loaded.abyss_actor==nil and package.loaded.abyss_combat==nil,'ordering must cold load without executors')
end
print('POWER_CYCLE_BOUNDARIES 2 cold orders passed')
