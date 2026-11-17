package.path='src/lua/?.lua;build/lua/?.lua;'..package.path
local C=require('abyss_combat')
local Q=require('abyss_action_queue')
local Choices=require('abyss_combat_effect_choice')
local Cards=require('abyss_combat_effect_cards')
local Final=require('abyss_silent_final_cards')
local data=require('abyss_character_profiles').prepare(require('abyss_data'),'silent')
local passed,failed=0,0
local function test(name,fn)
 local ok,why=pcall(fn)
 if ok then passed=passed+1 else failed=failed+1 end
 print((ok and 'PASS 'or 'FAIL ')..name..(ok and ''or ': '..tostring(why)))
end
for _,path in ipairs({'requestDiscard','tools'})do
 for _,upgraded in ipairs({false,true})do
  test(path..' queues automatic Reflex discard without a resolving card '..tostring(upgraded),function()
   local s=C.new(data,{deck={{cardId='reflex',upgraded=upgraded}},enemies={'cultist'},seed=42})
   assert(#s.hand==1 and s.hand[1].cardId=='reflex'and #s.draw==0 and #s.discard==0)
   local card=s.hand[1]
   assert(not s.resolvingCard)
   Q.start(s,{})
   if path=='requestDiscard'then
    assert(Choices.requestDiscard({state=s,combat=C,effect={op='requestDiscard',value=1},queue=Q})==true)
   else Final.apply(C,s,{effect={op='silentFinal',kind='tools',value=1}})end
   assert(#s.hand==0 and #s.discard==1 and s.discard[1]==card,'automatic discard must move the original Reflex once')
   assert(not s.pendingDiscard and not s.pendingDiscardDraws and not s.resolvingCard)
   local queued=s.actionQueue.actions
   assert(#queued==1 and queued[1].kind=='effect')
   assert(queued[1].effect.op=='discardReflexDraw'and queued[1].effect.value==(upgraded and 3 or 2)
    and queued[1].effect.uid==card.uid,'the real queue must retain the correct Reflex draw tail')
   assert(Q.run(s,{effect=function(current,action,queue)
    return Cards.discardReflexDraw({state=current,combat=C,effect=action.effect,queue=queue,
     helpers={event=require('abyss_events').emit}})
   end}))
   assert(not s.actionQueue and #s.hand==1 and s.hand[1]==card and #s.discard==0,
    'the deferred real draw must complete without duplicating its physical card')
  end)
 end
end
assert(failed==0,tostring(failed)..' production discard host failures')
print('DISCARD_HOST_BOUNDARIES '..passed..' groups passed')
