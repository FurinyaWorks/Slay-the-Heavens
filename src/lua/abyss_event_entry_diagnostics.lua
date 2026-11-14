-- Detached best-effort entry diagnostics. No RNG calls, state owners or services
-- are imported. The caller emits only after the transaction has rolled back.
local M={}
local function field(object,key)
    if type(object)=='table'then return rawget(object,key)end
end
local function scalar(value)
    local kind=type(value)
    if kind=='string'or kind=='boolean'then return value end
    if kind=='number'and value==value and math.abs(value)<math.huge then return value end
end
local function counter(state)
    local value=field(state,'counter')
    if type(value)=='number'and value%1==0 then return scalar(value)end
end
local function safe(fn,...)
    local ok,result=pcall(fn,...)
    if ok then return result end
end
local function mapped(run,node)
    local id=field(node,'eventId')
    if not id then id=field(field(field(field(run,'data'),'rules'),'events'),'encounterId')end
    return scalar(id)
end
local function attempt(run,context)
    local node=field(context,'node')
    return {nodeId=scalar(field(node,'id')),floor=scalar(field(node,'floor')),
        sourceType=scalar(field(context,'sourceType')),resolvedType=scalar(field(node,'type')),
        originalId=scalar(field(node,'originalEventId')),mappedId=mapped(run,node),
        eventCounter=counter(field(context,'nextEventRng')),
        selectionCounter=counter(field(context,'selectionRng')),
        roomMiscCounter=counter(field(context,'nextMiscRng')),runMiscCounter=counter(field(run,'miscRng'))}
end
function M.attempt(run,context)return safe(attempt,run,context)end

local function requested(map,nodeId)
    local nodes=field(map,'nodes')
    if type(nodes)~='table'then return end
    for _,node in next,nodes do if field(node,'id')==nodeId then return node end end
end
local function counters(run,nested)
    if nested then return {known=false}end
    return {known=true,eventCounter=counter(field(run,'eventRng')),miscCounter=counter(field(run,'miscRng'))}
end
local function failure(run,map,nodeId,reason,attempted,nested)
    local node=requested(map,nodeId)
    local source=field(attempted,'sourceType')or scalar(field(node,'type'))
    if source~='event'then return end
    local original=scalar(field(attempted,'originalId'))or scalar(field(node,'originalEventId'))
    local id=scalar(field(attempted,'mappedId'))or mapped(run,node)
    return {schemaVersion=1,kind='event_entry_failure',reason=scalar(reason),
        phase=nested and 'awaiting_outer_rollback'or 'after_rollback',
        run={runSeed=scalar(field(run,'runSeed')),currentSeed=scalar(field(run,'seed')),
            eventSeed=scalar(field(run,'eventSeed')),act=scalar(field(run,'act')),
            identityScope=nested and 'uncommitted_transaction'or 'committed_post_rollback'},
        node={id=scalar(nodeId),floor=scalar(field(node,'floor')),sourceType=source,
            resolvedType=scalar(field(attempted,'resolvedType'))or scalar(field(node,'type'))},
        event={originalId=original,mappedId=id,originalIdKnown=original~=nil,mappedIdKnown=id~=nil},
        committed=counters(run,nested),attempted={eventCounter=scalar(field(attempted,'eventCounter')),
            selectionCounter=scalar(field(attempted,'selectionCounter')),
            roomMiscCounter=scalar(field(attempted,'roomMiscCounter')),runMiscCounter=scalar(field(attempted,'runMiscCounter'))}}
end
function M.failure(run,map,nodeId,reason,attempted,nested)return safe(failure,run,map,nodeId,reason,attempted,nested)end

local function encoded(value)
    value=scalar(value)
    if value==nil then return 'nil'end
    local text=type(value)..':'..tostring(value)
    local result,length={},0
    for i=1,#text do
        local char=text:sub(i,i)
        local part=char:match('[%w_.:-]')and char or string.format('%%%02X',text:byte(i))
        if length+#part>160 then result[#result+1]='~';break end
        result[#result+1],length=part,length+#part
    end
    return table.concat(result)
end
function M.line(receipt)
    local parts={'ABYSS_EVENT_ENTRY_FAILURE'}
    local function add(name,object,key)parts[#parts+1]=name..'='..encoded(field(object,key or name))end
    for _,key in ipairs({'runSeed','currentSeed','eventSeed','act'})do add(key,receipt.run)end
    for _,key in ipairs({'id','floor','sourceType','resolvedType'})do add('node_'..key,receipt.node,key)end
    for _,key in ipairs({'originalId','mappedId','originalIdKnown','mappedIdKnown'})do add(key,receipt.event)end
    add('reason',receipt);add('phase',receipt)
    for _,key in ipairs({'eventCounter','miscCounter'})do add('committed_'..key,receipt.committed,key)end
    for _,key in ipairs({'eventCounter','selectionCounter','roomMiscCounter','runMiscCounter'})do add('attempted_'..key,receipt.attempted,key)end
    return table.concat(parts,' ')
end
function M.emit(receipt)
    if field(receipt,'phase')~='after_rollback'then return false end
    return pcall(function()print(M.line(receipt))end)
end
return M
