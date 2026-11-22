-- Opt-in source-level timing. Run from the checkout whose Lua is measured:
-- node node_modules/fengari-node-cli/src/lua-cli.js <probe> <room> <samples> <fixture> [cold]
-- Requires newly generated official refined native-page UI/data in build/lua.
package.path='build/lua/?.lua;src/lua/?.lua;'..package.path
local native=dofile(arg[3] or 'tests/lua/support/map_room_transition_fixture.lua')
local Nodes=require('abyss_nodes')
local Map=require('abyss_map')
local Run=require('abyss_run')
local Combat=require('abyss_combat')
local clock,printResult=os.clock,print
local cpuClock=CPU_CLOCK or function()return 0 end
local sample,entryFrame,veil,cover
local function traced(owner,name,label,onCall)
    local call=owner[name]
    owner[name]=function(...)
        if not sample then return call(...) end
        if onCall then onCall() end
        local cpuBegan,began=cpuClock(),clock()
        local value=table.pack(call(...))
        local wall,cpu=(clock()-began)*1000,(cpuClock()-cpuBegan)*1000
        local phase=sample[label] or {ms=0,calls=0,maxMs=0,cpuMs=0}
        phase.ms,phase.calls,phase.maxMs=phase.ms+wall,phase.calls+1,math.max(phase.maxMs,wall)
        phase.cpuMs=phase.cpuMs+cpu
        sample[label]=phase
        return table.unpack(value,1,value.n)
    end
end

local function recordEntry()
    sample.entryFrame=entryFrame
    sample.entryAlpha=veil.imageColor.a
end
traced(Nodes,'enter','core',recordEntry)
traced(Nodes,'view','projection')
traced(Map,'restore','restore')
traced(Map,'generate','generate')
traced(Map,'choose','choose')
traced(Map,'view','mapProjection')
traced(Run,'transaction','transaction')
traced(Combat,'copy','combatCopy')

local function emitted(kind,index,depth,actual)
    local rows={}
    for name,value in pairs(sample) do
        local field=type(value)=='number' and string.format('%f',value) or
            string.format('{"ms":%f,"calls":%d,"maxMs":%f,"cpuMs":%f}',value.ms,value.calls,value.maxMs,value.cpuMs)
        rows[#rows+1]=string.format('"%s":%s',name,field)
    end
    table.sort(rows)
    printResult(string.format('{"room":"%s","resolved":"%s","index":%d,"seed":42,"depth":%d,"cache":"%s",%s}',
        kind,actual,index,depth,arg[4]=='cold' and 'cold' or 'warm',table.concat(rows,',')))
end

local function measure(kind,index)
    local host,root,assets,_,_,id,hit,depth=native.onMap(kind)
    -- Constructing another seed before input is a deliberate cold-cache control.
    if arg[4]=='cold' then Map.generate(host.run.data,'43',host.run.act)end
    cover=root:GetChild('pageReveal')
    veil=cover:GetChild('veil')
    local initialAlpha=veil.imageColor.a
    local copiesBefore=assets.created
    local releasesBefore=assets.destroyed
    traced(host.mapUI,'render','mapPaint')
    traced(host.mapUI,'focusCurrent','mapFocus')
    traced(host.nodeUI,'render','roomPaint')
    traced(host.battleUI,'render','battlePaint')
    traced(assets,'ready','readiness',function()
        if not sample.firstReadyPollFrame and host.map.currentNodeId==id then sample.firstReadyPollFrame=entryFrame end
    end)
    sample,entryFrame={},0
    local cpuStart,start=cpuClock(),clock()
    assert(native.tap(hit,100))
    sample.clickMs=(clock()-start)*1000
    if cover.visible and veil.imageColor.a~=initialAlpha then sample.feedbackFrame=0 end
    local active,peak=0,0
    for frame=1,600 do
        if not host.pageReveal:covered()then break end
        entryFrame=frame
        local began=clock()
        OnUpdate(native.frame)
        local duration=(clock()-began)*1000
        active,peak=active+duration,math.max(peak,duration)
        if not sample.feedbackFrame and cover.visible and veil.imageColor.a~=initialAlpha then sample.feedbackFrame=frame end
    end
    assert(script.updating and not host.disabled and not host.pageReveal:covered() and host.map.currentNodeId==id)
    sample.fullFrame,sample.maxUpdateMs,sample.activeMs=entryFrame,peak,sample.clickMs+active
    sample.nativeInstantiated=assets.created-copiesBefore
    sample.nativeDestroyed=assets.destroyed-releasesBefore
    sample.measuredWallMs=(clock()-start)*1000
    if CPU_CLOCK then sample.activeCpuMs=(cpuClock()-cpuStart)*1000 end
    emitted(kind,index,depth,host.run.nodeFlow.type)
    sample=nil
    OnDestroy()
end

print=function() end
local kind=assert(arg[1],'room type required')
for index=1,tonumber(arg[2]) or 1 do measure(kind,index) end
print=printResult
