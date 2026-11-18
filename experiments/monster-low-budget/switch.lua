-- Standalone experimental surface lifecycle. This is not the production actor manager.
local host=script.object
local generation,requestGeneration,instance,current,pending=0,0,nil,nil,nil
local firstCallback
local metrics={created=0,destroyed=0,reused=0,staleRejected=0,accepted=0}
function OnStart()script:EnableUpdate(true)end
local function release()
 if instance and instance.alive~=false then
  assert(game.DestroyClientUIControl(instance)~=false)
  metrics.destroyed=metrics.destroyed+1
 end
 instance,current=nil,nil
end
function Request(id)
 requestGeneration=requestGeneration+1
 if instance and instance.alive~=false and current==id then
  pending=nil;metrics.reused=metrics.reused+1;return
 end
 pending={id=id,generation=requestGeneration}
 host:SetVisible(true)
end
function OnUpdate()
 if not pending then return end
 local request=pending;pending=nil
 if request.generation~=requestGeneration then return end
 generation=generation+1;release()
 instance=assert(game.InstantiateClientUIControl(request.id,host));current=request.id
 metrics.created=metrics.created+1
 local owner,token=instance,generation
 local callback=function()
  if token~=generation or owner~=instance or owner.alive==false then
   metrics.staleRejected=metrics.staleRejected+1;return false
  end
  metrics.accepted=metrics.accepted+1;return true
 end
 instance:GetChild('hit'):AddCursorEventListener(Enum.CursorEventType.CursorClick,callback)
 firstCallback=firstCallback or callback
end
function Close()
 generation=generation+1;requestGeneration=requestGeneration+1
 pending=nil;release();host:SetVisible(false)
end
function AssertState(created,destroyed,reused,stale,accepted)
 assert(metrics.created==created and metrics.destroyed==destroyed and metrics.reused==reused and metrics.staleRejected==stale)
 if accepted~=nil then assert(metrics.accepted==accepted)end
end
function DelayedOldCallback()assert(firstCallback and firstCallback()==false)end
function OnDestroy()Close()end
