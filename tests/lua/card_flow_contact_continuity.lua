-- CLI/Fengari + native-control mock. This is not a client/device visual test.
package.path='build/lua/?.lua;src/lua/?.lua;'..package.path
local F=dofile('tests/lua/support/game_ui_fixture.lua')
local Run=require('abyss_run')
local function near(a,b)return math.abs(a-b)<1e-8 end
local function same(a,b,path)
 path=path or 'run'
 assert(type(a)==type(b),'committed state type changed '..path)
 if type(a)~='table'then assert(a==b,'committed state value changed '..path..' '..tostring(a)..' ~= '..tostring(b));return end
 for key,value in pairs(a)do same(value,b[key],path..'.'..tostring(key))end
 for key in pairs(b)do assert(a[key]~=nil,'committed state field changed')end
end
local function snapshot(run)
 local copy=F.Combat.copy(run,{[run.data]=run.data,[run.combat.catalog]=run.combat.catalog})
 -- Host consumes committed events once when playback completes.
 copy.combat.events={}
 -- The existing Host playtime clock continues during every update.
 copy.elapsedSeconds=nil
 return copy
end
local function setup(controlledCard)
 local sounds={}
 local host,root=F.fixture(nil,nil,nil,nil,nil,function(cue)sounds[#sounds+1]=cue end)
 assert(F.start(host))
 F.click(root,'mapPanel','node1')
 assert(host.mode=='battle'and host.run.phase=='combat')
 local function find(entries,name)
  for _,entry in ipairs(entries)do
   if entry.name==name then return entry end
   local found=find(entry.children or{},name);if found then return found end
  end
 end
 local overlay=find(F.Layout,'feedback')
 local played=find(overlay.children,'playedCard')
 -- Both are direct siblings, equal-size containers. Their imported anchors
 -- and pivots agree (omission uses the same native centre default), so their
 -- anchored origins share one coordinate system; own scale cannot offset it.
 for index=1,10 do
  local trail=find(overlay.children,'cardTrail'..index)
  for _,key in ipairs({'size','anchor','pivot','rotation','scale','position'})do same(played[key],trail[key])end
 end
 if controlledCard then
  -- Exhaust is not in the starter deck: this supplementary case constructs a
  -- legal deck, then uses the same Host controls and Run.play transaction.
  host.run.combat=F.Combat.new(F.Data,{deck={controlledCard},enemies={'cultist'},seed=11})
  host:refresh()
 end
 for _=1,100 do host:update(.01)end
 return host,root:GetChild('battlePanel'),sounds
end
local function test(name,cardId,destination,controlled)
 local host,panel,sounds=setup(controlled and cardId)
 local ui,battle=host.battleUI,host.run.combat
 local slot
 for index,card in ipairs(battle.hand)do if card.cardId==cardId then slot=index;break end end
 assert(slot,'missing legal card '..cardId)
 local uid=battle.hand[slot].uid
 local plays,calls=0,0
 local original=Run.play
 Run.play=function(...)calls=calls+1;return original(...)end
 panel:GetChild('card'..slot):GetChild('hit').click()
 assert(ui.selected==uid,'C-tier click selection')
 local _,reason=F.Combat.canPlay(battle,uid,nil)
 if reason=='invalid_target'then F.actorControl(panel,'enemy1'):GetChild('hit').click()
 else panel:GetChild('playArea'):GetChild('hit').click()end
 Run.play=original
 assert(calls==1 and ui.busy and ui.feedback.busy,'one successful Host command owns busy')
 for _,event in ipairs(battle.events)do if event.kind=='play'and event.detail.uid==uid then plays=plays+1 end end
 assert(plays==1,'one committed play for the UID')
 local committed=snapshot(host.run)
 local contact,trail,arrived
 local clock,ticks=host.run.elapsedSeconds,0
 for _=1,1000 do
  local feedback=ui.feedback
  if feedback.current and feedback.current.kind~='play'and not contact then
   local card=panel:GetChild('feedback'):GetChild('playedCard')
   assert(card.visible,'visible contact precedes departure')
   contact={card.x,card.y,parent=card.parent,scaleX=card.localScaleX,scaleY=card.localScaleY}
   assert(contact.scaleX>0 and contact.scaleY>0 and (card.localRotationZ or 0)==0,
    'visible contact has a finite positive scale about its shared centre pivot')
  end
  for index,entry in pairs(feedback.cardFlow.active)do if entry.uid==uid then
   assert(entry.from=='play'and entry.to==destination,'same UID reaches committed pile')
   local box=panel:GetChild('feedback'):GetChild('cardTrail'..index)
   assert(box.visible,'departure is visible')
   if not trail then
    assert(box.parent==contact.parent,'contact and departure share the same transformed parent')
    assert(box.localScaleX>0 and box.localScaleY>0 and (box.localRotationZ or 0)==0,
     'departure scales about the same centre pivot without an anchor offset')
    print('PC22_TRANSFORM uid='..uid..' sameParent=true centrePivot=true contact='..contact[1]..','..contact[2]
     ..' scale='..contact.scaleX..','..contact.scaleY..' departure='..box.x..','..box.y..' scale='..box.localScaleX..','..box.localScaleY)
    assert(near(box.x,contact[1])and near(box.y,contact[2]),'native departure anchor equals native contact anchor')
   end
   assert(contact and near(entry.start[1],contact[1])and near(entry.start[2],contact[2]),
    'pile departure must begin at the visible contact position; no vertical teleport')
   trail=true
   if entry.arrived then arrived=true end
  end end
  if not ui.busy and not feedback.cardFlow:busy()then break end
  host:update(.01);ticks=ticks+1
 end
 assert(contact and trail and arrived,'contact, departure and endpoint all observed')
 assert(not ui.busy and not ui.feedback.busy and not ui.feedback.cardFlow:busy(),'normal input released')
 same(snapshot(host.run),committed)
 assert(near(host.run.elapsedSeconds,clock+ticks*.01),'existing Host clock advances by unmodified update deltas')
 assert(#battle.events==0,'Host consumed the original event stream')
 local actions=0
 for _,cue in ipairs(sounds)do if cue=='player_action'then actions=actions+1 end end
 assert(actions==1,'one action sound')
 print('ok card_flow_contact_continuity - '..name..' UID '..uid..' contact='..contact[1]..','..contact[2]..' -> '..destination..'; committed rules/RNG unchanged')
end
test('natural opening attack','strike','discard')
test('natural opening defense without target offset','defend','discard')
test('controlled legal exhaust area skill','shockwave','exhaust',true)
print('PC22_CONTACT_CONTINUITY_PASS 3')
