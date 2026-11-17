package.path='build/lua/?.lua;src/lua/?.lua;'..package.path
local C=require('abyss_combat')
local Actions=require('abyss_card_actions')
local Silent=require('abyss_silent_final_cards')
local Defect=require('abyss_defect_final_cards')
local Watcher=require('abyss_watcher_final_cards')
local marker={kind='host-boundary-result'}
local count=0
local function test(name,fn)fn();count=count+1;print('PASS '..name)end

test('fresh cards read the current Defect initializer and retain instance identity',function()
 local old=Defect.created
 local state={catalog={cards={strike={}}},nextUid=1}
 local called
 Defect.created=function(s,card)assert(s==state);called=card;card.boundary='current' end
 local card=Actions.fresh(C,state,'strike')
 assert(called==card and card.boundary=='current'and card.uid==1 and state.nextUid==2)
 Defect.created=function()error(marker)end
 local ok,err=pcall(Actions.fresh,C,state,'strike')
 assert(not ok and err==marker,'initializer error identity must cross the host')
 Defect.created=old
end)

test('retention and Silent choices dynamically read their existing public methods',function()
 local oldAllowed,oldChoose=Silent.allowedAfterVictory,Silent.choose
 local effect={op='silentFinal',kind='boundary'}
 Silent.allowedAfterVictory=function(e)assert(e==effect);return marker end
 assert(Actions.reactionRetained(effect,C)==marker)
 local state={pendingChoice={op='silentFinal'}}
 Silent.choose=function(host,s,token,uid)
  assert(host==C and s==state and token==17 and uid==29)
  return false,marker
 end
 local ok,why=Actions.choose(C,state,17,29)
 assert(ok==false and why==marker)
 Silent.allowedAfterVictory,Silent.choose=oldAllowed,oldChoose
end)

test('Watcher dispatch reads replaced operation and execution slots',function()
 local oldOps,oldExecute=Watcher.ops,Watcher.execute
 local state,item={},{effect={op='boundaryWatcher'}}
 Watcher.ops={boundaryWatcher=true}
 Watcher.execute=function(host,s,e)
  assert(host==C and s==state and e==item.effect)
  return marker
 end
 assert(Actions.apply(C,state,item)==marker)
 Watcher.ops,Watcher.execute=oldOps,oldExecute
end)

test('Colorless admission preserves the existing CardActions public enqueue slot',function()
 local old=Actions.enqueue
 local state={player={statuses={magnetism=2}}}
 local seen=0
 Actions.enqueue=function(s,e)
  assert(s==state and e.op=='colorless'and e.kind=='generateColorless'and e.value==2)
  seen=seen+1
 end
 require('abyss_colorless_cards').startTurn(state)
 assert(seen==1)
 Actions.enqueue=old
end)

print('CORE_OTHER_HOST_BOUNDARIES '..count..' groups passed')
