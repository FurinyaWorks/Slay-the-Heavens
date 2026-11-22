package.path='src/lua/?.lua;build/lua/?.lua;'..package.path
local F=dofile('tests/lua/support/game_ui_fixture.lua')
local function rejects(fn,needle)
 local ok,why=pcall(fn);assert(not ok and tostring(why):find(needle,1,true),tostring(why))
end
local cursor=F.control({name='strict-cursor',kind='cursorArea'})
rejects(function()return cursor.interactable end,'CursorArea')
rejects(function()cursor.interactable=false end,'CursorArea')
assert(cursor.activeInHierarchy==true,'documented native hierarchy state must be readable')
rejects(function()cursor.activeInHierarchy=false end,'read-only')
cursor.raycastTarget=false;assert(cursor.raycastTarget==false)
local preset=F.control({name='strict-button',kind='presetButton'})
preset.interactable=false;assert(preset.interactable==false)
assert(preset.activeInHierarchy==true)
rejects(function()preset.activeInHierarchy=false end,'read-only')

-- The generated host startup must exercise the real BattleUI constructor.
local host,root=F.fixture()
assert(host.mode=='menu' and host.run==nil and not host.battleUI.active)
local pile=root:GetChild('battlePanel'):GetChild('drawIcon'):GetChild('hit')
assert(pile.kind=='cursorArea' and pile.raycastTarget==false)
local endTurn=root:GetChild('battlePanel'):GetChild('endTurn')
assert(endTurn.kind=='presetButton' and endTurn.interactable==false and endTurn.raycastTarget==false)

-- Engine activation does not change visibility or hit geometry.
for _,kind in ipairs({'cursorArea','presetButton'}) do
 for _,target in ipairs({'control','ancestor'}) do
  local ancestor=F.control({name='active-page',kind='container'})
  local item=F.control({name='active-item',kind=kind,size={48,48}},ancestor)
  local inactive=target=='control' and item or ancestor
  F.setEngineActive(inactive,false)
  assert(item.alive and ancestor.alive and item.visible and ancestor.visible
   and item.parent==ancestor and item.raycastTarget and item.activeInHierarchy==false)
  assert(item.sizeDeltaX==48 and item.sizeDeltaY==48)
  F.setEngineActive(inactive,true)
  assert(item.activeInHierarchy)
 end
end

local function dispatch(item,event,pointer)
 if not item.activeInHierarchy or not item.visible or item.raycastTarget==false then return false end
 return assert(item.listeners[event],event)(pointer)
end

-- Model engine filtering before dispatching to the actual generated Start listeners.
-- A new in-scope gesture can still open selection and confirm a Run.
local cursorEvents={CursorDown='down',CursorUp='up'}
for _,target in ipairs({'control','ancestor'}) do
 local generated,tree=F.fixture(nil,nil,nil,cursorEvents)
 local menu=tree:GetChild('menuPanel')
 local start=menu:GetChild('start'):GetChild('hit')
 assert(generated.mode=='menu' and generated.run==nil and start.kind=='cursorArea')
 assert(not start.canControllerFocus and not start.navigationListeners)
 local inactive=target=='control' and start or menu
 F.setEngineActive(inactive,false)
 local hiddenPointer={touchId=11}
 assert(not dispatch(start,'down',hiddenPointer))
 assert(not dispatch(start,'up',hiddenPointer))
 assert(not dispatch(start,'click',hiddenPointer))
 assert(not generated.characterOpen and generated.run==nil)
 F.setEngineActive(inactive,true)
 local pointer={touchId=12}
 dispatch(start,'down',pointer)
 dispatch(start,'up',pointer)
 assert(dispatch(start,'click',pointer) and generated.characterOpen and generated.run==nil)
 assert(F.confirmStart(generated) and generated.mode=='map' and generated.run)
end
print('NATIVE_CURSOR_FIELDS_PASS strict fields, generated startup, hierarchy and pointer dispatch')
