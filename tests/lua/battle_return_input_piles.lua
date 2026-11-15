local first,last=...
first,last=first or 1,last or 7
local H=dofile('tests/lua/support/battle_gesture_fixture.lua')
local originalTest,finish=dofile('tests/lua/support/battle_action_fixture.lua').suite('BATTLE_RETURN_INPUT_PILES')
local registered,executed=0,0
local function test(name,fn)
 registered=registered+1
 if registered>=first and registered<=last then originalTest(name,fn);executed=executed+1 end
end
local same=dofile('tests/lua/support/battle_return_state.lua')
for _,kind in ipairs({'draw','discard','exhaust'})do for _,release in ipairs({'up','endDrag'})do
 test('completed drag '..release..' cannot ghost-open '..kind..'; same touch Down recovers',function()
  local h,u,p,e,t,drain,_,root=H.setup()
  e('card1','down',7);e('card1','drag',7,0,0);e('dragLayer',release,7,0,0);drain()
  local before=H.F.Combat.copy(h.run)
  local entry=p:GetChild(kind..'Icon'):GetChild('hit')
  entry.click({touchId=7});entry.click({touchId=7})
  assert(not h.deckUI.visible,'old drag Click opened a pile overlay')
  assert(same(before,h.run),'ghost pile interaction changed rules/RNG')
  assert(entry.listeners.down,'pile must recognize a fresh physical sequence')
  entry.listeners.down({touchId=7});if entry.listeners.up then entry.listeners.up({touchId=7})end
  assert(entry.click({touchId=7}) and h.deckUI.visible and h.deckUI.pileKind==kind,'new same-touch pile tap stayed locked')
  assert(root:GetChild('deckPanel'):GetChild('close'):GetChild('hit').click())
  assert(not h.deckUI.visible and u.active and same(before,h.run))
  t('endTurn',9);assert(h.run.combat.turn==2,'first legal action after pile close failed')
 end)
end end
for _,closing in ipairs({'click-only','pointer'})do for _,reader in ipairs({'status','transientCard'})do
 test('pile '..closing..' '..reader..' dismissal cannot open beneath reader',function()
  local h,u,p=H.setup()
  local entry=p:GetChild('discardIcon'):GetChild('hit')
  if reader=='status'then assert(u:showStatus(0))else assert(u:openHelp(assert(u:cardHelpSpec(1)),p:GetChild('card1'),true))end
  local before=H.F.Combat.copy(h.run)
  if closing=='pointer'then assert(entry.listeners.down);entry.listeners.down({touchId=8});if entry.listeners.up then entry.listeners.up({touchId=8})end end
  entry.click({touchId=8})
  assert(not u.info,'detail did not close')
  assert(same(before,h.run))
  if reader=='transientCard'then
   assert(h.deckUI.visible and h.deckUI.pileKind=='discard','automatic hand hover must preserve the independent pile click')
   return
  end
  assert(not h.deckUI.visible,'modal dismissal opened a pile underneath')
  if closing=='pointer'then entry.listeners.down({touchId=8});if entry.listeners.up then entry.listeners.up({touchId=8})end end
  assert(entry.click({touchId=8}) and h.deckUI.visible,'independent pile retry failed')
 end)
end
end
for _,touch in ipairs({8,false})do
 test('independent '..tostring(touch)..' Click-only pile entry remains available after drag',function()
  local h,u,p,e,t,drain=H.setup()
  e('card1','down',7);e('card1','drag',7,0,0);e('dragLayer','up',7,0,0);drain()
  assert(p:GetChild('discardIcon'):GetChild('hit').click({touchId=touch or nil}) and h.deckUI.pileKind=='discard')
 end)
end
test('Controller confirm opens its own pile and consumes only its same-frame pointer echo',function()
 local focus
 local api={events={Confirm='confirm',Cancel='cancel',Focus='focus'},directions={Left='left',Right='right'},modes={Specified='specified'},
  getFocus=function()return focus end,setFocus=function(c)focus=c end,isController=function()return true end}
 local cursor={CursorDown='down',CursorDrag='drag',CursorUp='up',CursorEndDrag='endDrag'}
 local h,root=H.F.fixture(nil,nil,nil,cursor,false,nil,nil,api);assert(H.F.start(h));assert(H.Run.startCombat(h.run,'cultist_solo'))
 h.run.combat=H.F.Combat.new(H.F.Data,{deck={'defend','defend'},enemies={'cultist'}});h:refresh()
 local p=root:GetChild('battlePanel');local u=h.battleUI
 local function emit(name,kind,x,y)
  local box=H.F.actorControl(p,name);local hit=box.listeners and box or box:GetChild('hit')
  return assert(hit.listeners[kind])({touchId=7,GetUIPos=function()return 640+(x or box.x or 0),360+(y or box.y or 0)end})
 end
 emit('card1','down');emit('card1','drag',0,0);emit('dragLayer','up',0,0)
 for _=1,400 do if not u.busy then break end;h:update(.05)end
 assert(not u.busy and h.run.combat.player.block==5)
 h:update(.01);h:syncController();local entry=p:GetChild('discardIcon'):GetChild('hit');assert(entry.canControllerFocus)
 api.setFocus(entry);assert(entry.navigationListeners.confirm() and h.deckUI.visible and h.deckUI.pileKind=='discard')
 local generation=h.deckUI.generation;assert(not entry.click({touchId=7}) and h.deckUI.generation==generation)
end)
test('Controller detail close cannot revive held or released endTurn permissions',function()
 for _,released in ipairs({false,true})do
  local focus
  local api={events={Confirm='confirm',Cancel='cancel',Focus='focus'},directions={Left='left',Right='right'},modes={Specified='specified'},
   getFocus=function()return focus end,setFocus=function(c)focus=c end,isController=function()return true end}
  local cursor={CursorDown='down',CursorDrag='drag',CursorUp='up',CursorEndDrag='endDrag'}
  local h,root=H.F.fixture(nil,nil,nil,cursor,false,nil,nil,api);assert(H.F.start(h));assert(H.Run.startCombat(h.run,'cultist_solo'));h:refresh()
  local u,p=h.battleUI,root:GetChild('battlePanel');local action=p:GetChild('endTurn')
  action.listeners.down({touchId=7});if released then action.listeners.up({touchId=7})end
  assert(u:showStatus(0));h:update(.01);h:syncController()
  local close=p:GetChild('statusInfo'):GetChild('hit');api.setFocus(close);assert(close.canControllerFocus)
  close.navigationListeners.confirm();assert(not u.info)
  h:update(.01);action.listeners.up({touchId=7});action.click({touchId=7});assert(h.run.combat.turn==1,'Controller close revived old endTurn')
  action.listeners.down({touchId=7});action.listeners.up({touchId=7});action.click({touchId=7});assert(h.run.combat.turn==2,'Controller close locked same-touch fresh operation')
 end
end)
assert(registered==14 and executed==last-first+1,'complete bounded pile matrix must register and execute')
finish()
print('BATTLE_RETURN_INPUT_PILE_SLICE '..first..' '..last..' '..executed)
