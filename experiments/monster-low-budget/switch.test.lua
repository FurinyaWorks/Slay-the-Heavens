-- Execute the real experimental controller without the optional Windows SDK.
-- The stub measures Lua command ownership, not native rendering or input dispatch.
local controller=arg[1] or 'experiments/monster-low-budget/switch.lua'
local created,destroyed,live=0,0,{}
local host={visible=true}
function host:SetVisible(value)self.visible=value end
script={object=host,EnableUpdate=function(_,value)assert(value==true)end}
Enum={CursorEventType={CursorClick=1}}
game={}
function game.InstantiateClientUIControl(id,parent)
 assert(parent==host)
 local hit={}
 function hit:AddCursorEventListener(kind,callback)
  assert(kind==Enum.CursorEventType.CursorClick);self.click=callback
 end
 local instance={id=id,alive=true,hit=hit}
 function instance:GetChild(name)assert(self.alive and name=='hit');return hit end
 live[#live+1]=instance;created=created+1
 return instance
end
function game.DestroyClientUIControl(instance)
 assert(instance.alive,'must not destroy a surface twice')
 instance.alive=false;destroyed=destroyed+1;return true
end
dofile(controller)
OnStart()

-- A pending B must be cancelled when the latest request returns to live A.
Request(100);OnUpdate()
local first=live[1];assert(first.hit.click()==true)
Request(400);Request(100);OnUpdate()
assert(created==1 and destroyed==0 and first.alive,
 'LATEST_REQUEST_LOST: A -> queued B -> A must retain live A')
assert(first.hit.click()==true,'retained A must keep its live callback')
AssertState(1,0,1,0)
print('PASS pending replacement cancelled by current identity; callback stays valid')

-- Coalesce several replacements to the most recent request before construction.
Request(400);Request(200);OnUpdate()
assert(created==2 and destroyed==1 and live[2].id==200)
assert(first.hit.click()==false and live[2].hit.click()==true)
AssertState(2,1,1,1)
local second=live[2]
print('PASS pending replacements coalesce; retired callback rejected')

Request(400);Close();OnUpdate()
assert(created==2 and destroyed==2 and not host.visible)
assert(second.hit.click()==false)
AssertState(2,2,1,2)
Close()
assert(destroyed==2,'repeated close/destroy must be idempotent')
print('PASS close cancels pending construction and rejects old callback')

Request(100);OnUpdate()
assert(created==3 and live[3].hit.click()==true and host.visible)
OnDestroy()
assert(destroyed==3 and live[3].hit.click()==false)
OnDestroy();assert(destroyed==3)
AssertState(3,3,1,3)
for _,instance in ipairs(live)do assert(not instance.alive)end
print('PASS reopen uses a new owner; zero live experimental surfaces')
