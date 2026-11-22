--[=[
MIT License

Copyright (c) 2026 LiuL

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
]=]
-- Two frozen Lumine hosts only. No rules, timers, fitting or original OnStart.
-- Property order follows Primitive's MIT runtime, copyright 2026 LiuL.
local M = {}
-- Legacy and texture-only callers do not load the approved animation module.
local function idleModule(data)
    if data.renderProfile=='approved-idle-v1' then return require('abyss_lumine_idle') end
end
local owners = setmetatable({}, {__mode='k'})
local CANCELLED = {}
local GROUP_SIZE, PAGE_SIZE = 60, 3600
local SELECTION_BUILD_LIMIT, SELECTION_WARM_LIMIT = 64, 24
local SELECTION_BUILD_SECONDS, SELECTION_WARM_SECONDS = .004, .0015
local function integer(n) return type(n)=='number' and n>0 and n<math.huge and n%1==0 end
local function compactProfile(data)
    return data.renderProfile=='compact-v1' or data.renderProfile=='bounded-2d-v1' or data.renderProfile=='approved-idle-v1'
end
local function digest(value)
    return type(value)=='string' and #value==64 and value:match('^[a-f0-9]+$')~=nil
end
local function validateBounded(data,width)
    assert(data.width==width and integer(data.count) and data.count<=60 and #data.rows==data.count
        and digest(data.sourceSha256) and digest(data.jsonSha256),'unexpected bounded portrait data')
end
-- Breakthrough low-poly rows: 20 fields, official primitive/sprite IDs, rotX/rotY squash.
local function lowpoly(data)
    return type(data)=='table' and data.renderProfile=='lowpoly-v1' and integer(data.width) and integer(data.height)
        and integer(data.count) and data.count<=2304 and #data.rows==data.count and type(data.jsonSha256)=='string'
end
local function validateRoot(r,width)
    assert(#r==13 and r[1]==0 and r[2]==0 and r[3]==width and r[4]==width and r[5]==.5 and r[6]==.5
        and r[7]==.5 and r[8]==.5 and r[9]==.5 and r[10]==.5 and r[11]==1 and r[12]==1 and r[13]==0,'unexpected portrait ROOT')
end
local function validate(data, width, count, source, json)
    assert(type(data)=='table','unexpected portrait data')
    local idle=idleModule(data)
    if idle then idle.validate(data);return end
    if data.renderProfile=='bounded-2d-v1' then validateBounded(data,width)
    else
        local compact=compactProfile(data) or data.renderProfile=='selection-budget-v1'
        local expected=compact and data.count or count
        assert(data.width==width and expected>0 and expected<=(compact and 2304 or count) and #data.rows==expected
            and data.sourceSha256==source and data.jsonSha256==json,'unexpected frozen portrait data')
    end
    validateRoot(data.root,width)
end
local function v25Profile(asset)
    local profile=asset.v25PortraitProfile
    if profile==nil then return nil end
    assert(type(profile)=='table' and profile.schemaVersion==1
        and profile.sourceSha256=='4851e4aae6c43799ec31e2b2ebd06f9b00cf07161f26e71d72a6ec89191ad98e'
        and profile.battleDisplay==210 and profile.selectionDisplay==1380,'unexpected V25 portrait profile')
    local fields={schemaVersion=true,sourceSha256=true,battleDisplay=true,selectionDisplay=true,battlePosition=true,selectionPosition=true}
    for key in pairs(profile)do assert(fields[key],'unexpected V25 portrait field')end
    for _,name in ipairs({'battlePosition','selectionPosition'})do
        local position=profile[name]
        assert(type(position)=='table' and #position==2,'unexpected V25 portrait position')
        for _,value in ipairs(position)do
            assert(type(value)=='number' and value==value and math.abs(value)<math.huge,'invalid V25 portrait coordinate')
        end
    end
    local drawing=asset.battle133
    assert(type(drawing)=='table' and drawing.renderProfile~='bounded-2d-v1'
        and drawing.renderProfile~='lowpoly-v1','V25 requires the frozen full-body drawing')
    validate(drawing,133,4315,'ae2161957033d688b1bed1c7ab2ad2891d5f7bf5e34b291f9ecaef7cfa11f880','f8a7af7b079aa5bbb7e16b502b222f1fd7dbfaa2c30f6eef1bf0d76af0a0a248')
    return profile
end
local function controller(host, data, display, templates, options)
    local Idle=idleModule(data)
    local Asset=templates or require('abyss_traveler_portrait_assets')
    local retryFailedOnPause=type(options)=='table' and options.retryFailedOnPause==true
    local fixedSelectionTemplate=type(options)=='table' and options.fixedSelectionTemplate==true
    local nativeLifecycle=type(options)=='table' and options.nativeLifecycle==true
    local ownerEpoch=type(options)=='table' and options.ownerEpoch or function()return 0 end
    local rotation=type(options)=='table' and options.rotation or 0
    local tint=type(options)=='table' and options.tint
    local base=type(options)=='table' and options.position or nil
    if base then base={base[1],base[2]}end
    assert(host,'missing dedicated portrait host')
    local self,created={},{}
    local idlePages,idleSample,idleTime,wasIdle,idlePaused={},nil,0,nil,false
    local poseTicket
    local phase,generation,nextIndex='idle',0,1
    local page,group,pageIndex,groupIndex=nil,nil,0,0
    local revealGroups,revealIndex,revealedPages={},1,{}
    local presenting=false
    local unmaskedTemplate
    local working,pending,hiding=false,false,false
    local reason,cleanupFailures=nil,0
    local activationEpoch,nativePaused=0,nil
    local function current(token)return (phase=='building' or phase=='revealing') and generation==token and host.alive~=false end
    local function check(token)if not current(token)then error(CANCELLED,0)end end
    local function hide()
        if phase=='destroyed' or host.alive==false or hiding then return true end
        hiding=true;local ok,result=pcall(host.SetVisible,host,false);hiding=false
        if not ok or result==false then reason=ok and 'host hide rejected' or tostring(result);return false end
        return true
    end
    local function resetGroups()
        page,group,pageIndex,groupIndex=nil,nil,0,0
        revealGroups,revealIndex,revealedPages={},1,{}
    end
    local function cleanup()
        local old,retained,blocked=created,{},{};created={};cleanupFailures=0
        idlePages={};idleSample=nil;idleTime=0;wasIdle=nil
        resetGroups()
        for i=#old,1,-1 do
            if phase=='destroyed'then created={};return true end
            local node=old[i];local c=node.control
            if c.alive~=false then
                local ok,result=true,true
                if not blocked[c]then ok,result=pcall(game.DestroyClientUIControl,c)end
                if blocked[c] or not ok or result==false then
                    if not blocked[c]then cleanupFailures=cleanupFailures+1;reason=ok and 'destroy rejected' or tostring(result)end
                    if c.alive~=false then retained[#retained+1]=node;blocked[node.parent]=true end
                end
            end
        end
        for i=#retained,1,-1 do created[#created+1]=retained[i]end
        pending=false
        if #created>0 then phase='release_failed';return false end
        return cleanupFailures==0
    end
    local function fail(err)
        if phase=='destroyed'then created={};return end
        phase='failed';generation=generation+1;reason=tostring(err);hide();cleanup()
    end
    -- Official ClientUIBaseControl: active/visible are read-only observations;
    -- SetActive also gates attached scripts. These slots carry no root script.
    -- Only V25 opts into checked boundary transitions; old profiles keep their
    -- original setter ordering. Paused cache is retained, never called released.
    local function nativeTransition(active,visible,reset)
        activationEpoch=activationEpoch+1
        local ticket,revision,stage,owner=activationEpoch,generation,phase,ownerEpoch()
        local function valid()
            if host.alive==false or generation~=revision or phase~=stage or ownerEpoch()~=owner
                or activationEpoch~=ticket then error(CANCELLED,0)end
        end
        local function set(method,property,wanted)
            local setter=host[method];valid()
            assert(type(setter)=='function','V25 portrait native method unavailable: '..method)
            local actual=host[property];valid()
            assert(type(actual)=='boolean','V25 portrait native readback unavailable: '..property)
            if actual~=wanted then assert(setter(host,wanted)~=false,'V25 portrait native setter rejected: '..method);valid()end
            assert(host[property]==wanted,'V25 portrait native readback mismatch: '..property);valid()
        end
        assert(type(host.active)=='boolean','V25 portrait native active unavailable');valid()
        if not active then set('SetVisible','visible',false)end
        set('SetActive','active',active)
        if reset and base then
            assert(host:SetAnchoredPosition(base[1],base[2])~=false,'V25 portrait reset position rejected');valid()
            assert(host:SetLocalScale(display/data.width,display/data.width,1)~=false,'V25 portrait reset scale rejected');valid()
        end
        if reset and type(options)=='table' and options.rotation~=nil then
            assert(host:SetLocalRotation(0,0,rotation)~=false,'V25 portrait reset rotation rejected');valid()
        end
        set('SetVisible','visible',visible);valid()
        nativePaused=not active
    end
    local function reconcileCancellation()
        if phase=='released' and host.alive~=false then
            -- The old native setter may finish after a synchronous release.
            -- Read back/deactivate only the still-live released decoration.
            hide()
            if nativeLifecycle or fixedSelectionTemplate then pcall(nativeTransition,false,false,false)end
        end
    end
    local function transition(active,visible,reset)
        local wasWorking=working;working=true
        local ok,err=pcall(nativeTransition,active,visible,reset)
        if not ok then
            if err~=CANCELLED then fail(err)
            else reconcileCancellation()end
        end
        if pending and not wasWorking then cleanup()end
        working=wasWorking
        return ok
    end
    local function call(token,c,name,...)
        check(token);assert(type(c[name])=='function','missing native method '..name)
        assert(c[name](c,...)~=false,'native method rejected '..name);check(token)
    end
    local function transform(token,c)
        call(token,c,'SetAnchorMin',.5,.5);call(token,c,'SetAnchorMax',.5,.5);call(token,c,'SetPivot',.5,.5)
        call(token,c,'SetSizeDelta',data.width,data.height or data.width);call(token,c,'SetLocalScale',1,1,1)
        call(token,c,'SetLocalRotation',0,0,0);call(token,c,'SetAnchoredPosition',0,0)
    end
    local function create(token,prefab,parent)
        local c=game.InstantiateClientUIControl(prefab,parent)
        if c then created[#created+1]={control=c,parent=parent}end
        check(token);assert(c,'portrait template unavailable')
        if not fixedSelectionTemplate or c.visible~=false then call(token,c,'SetVisible',false)end
        return c
    end
    local function rowColour(r)
        if not tint then return Color.FromRGBA(r[15],r[16],r[17],r[18])end
        local luminance=.2126*r[15]+.7152*r[16]+.0722*r[17]
        local function channel(value)return math.floor((luminance+(value-luminance)*tint.saturation)*tint.brightness+.5)end
        return Color.FromRGBA(channel(r[15]),channel(r[16]),channel(r[17]),math.floor(r[18]*tint.opacity+.5))
    end
    local function usesUnmaskedDefaults(c)
        if unmaskedTemplate==nil then
            local known,clear=pcall(function()return c.enableMask==false and c.enableFill==false end)
            unmaskedTemplate=known and clear
        end
        return unmaskedTemplate
    end
    local function imageMask(token,c,r)
        if #r==21 then
            -- The shared white template has no mask/fill by default. Fall back
            -- to explicit initialization when the native clone cannot confirm it.
            if fixedSelectionTemplate and r[21]~=1 and usesUnmaskedDefaults(c) then return end
            c.enableMask=r[21]==1;check(token)
            if r[21]==1 then call(token,c,'SetFillHorizontal',Enum.ImageFillHorizontalType.Right,.5)
            else call(token,c,'SetFillUnused')end
        end
    end
    local function selectionTransform(token,c,r)
        -- The official base and half-triangle templates already have centered
        -- anchors, centered pivot and unit scale. Only write the authored overrides.
        if r[1]~=(r[21]==1 and 100003 or 100001) then call(token,c,'SetImage',Enum.ImageSource.StaticReference,r[1])end
        if r[6]~=.5 or r[7]~=.5 then call(token,c,'SetPivot',r[6],r[7])end
        call(token,c,'SetSizeDelta',r[4],r[5])
        if r[12]~=1 or r[13]~=1 then call(token,c,'SetLocalScale',r[12],r[13],1)end
        if r[19]~=0 or r[20]~=0 or r[14]~=0 then call(token,c,'SetLocalRotation',r[19],r[20],r[14])end
        call(token,c,'SetAnchoredPosition',r[2],r[3])
    end
    local function image(token,c,r)
        local tri=data.renderProfile=='lowpoly-v1'
        assert(tri and (#r==20 or #r==21) and integer(r[1]) or #r==18 and r[1]==100001,'unexpected portrait image row')
        if compactProfile(data) or data.rectanglesOnly then
            -- Shared template supplies the white image and identity transforms.
            -- Basic shape 100001 has no imageType field. Its rectangle is sized
            -- directly; gallery nine-slice modes do not apply to this resource.
            call(token,c,'SetSizeDelta',r[4],r[5]);call(token,c,'SetAnchoredPosition',r[2],r[3])
            c.imageColor=rowColour(r);check(token)
            call(token,c,'SetVisible',true);return
        end
        if fixedSelectionTemplate then
            selectionTransform(token,c,r)
            c.imageColor=rowColour(r);check(token)
            imageMask(token,c,r)
            call(token,c,'SetAsLastSibling')
            if c.active~=true then call(token,c,'SetActive',true)end
            call(token,c,'SetVisible',true)
            return
        end
        call(token,c,'SetImage',Enum.ImageSource.StaticReference,r[1])
        if r[1]<100001 or r[1]>100006 then
            c.imageType=Enum.ImageType.Stretch;check(token);assert(c.imageType==Enum.ImageType.Stretch,'imageType rejected')
        end
        call(token,c,'SetAnchorMin',r[8],r[9]);call(token,c,'SetAnchorMax',r[10],r[11]);call(token,c,'SetPivot',r[6],r[7])
        call(token,c,'SetSizeDelta',r[4],r[5]);call(token,c,'SetLocalScale',r[12],r[13],1)
        call(token,c,'SetLocalRotation',tri and r[19] or 0,tri and r[20] or 0,r[14]);call(token,c,'SetAnchoredPosition',r[2],r[3])
        c.imageColor=rowColour(r);check(token)
        imageMask(token,c,r)
        call(token,c,'SetAsLastSibling');call(token,c,'SetActive',true);call(token,c,'SetVisible',true)
    end
    function self.status(_)
        local nativeActive,known
        if nativeLifecycle then
            local ok,value=pcall(function()if host.alive~=false then return host.active end end)
            known=ok and type(value)=='boolean'
            if known then nativeActive=value end
        end
        return {phase=phase,generation=generation,nextIndex=nextIndex,revealIndex=revealIndex,total=#data.rows,owned=#created,
            retained=phase=='release_failed' and #created or 0,reason=reason,cleanupFailures=cleanupFailures,
            nativeActive=nativeActive,nativeStateKnown=known,nativePaused=nativePaused,
            shown=fixedSelectionTemplate and host.alive~=false and host.visible==true}
    end
    -- Keep the first broad layers together. The initial base alone is a flat
    -- underpaint; the second authored group gives the scene readable structure.
    local function hasSelectionImage()
        return revealIndex>math.min(2,math.ceil(#data.rows/GROUP_SIZE))
    end
    function self.present(_,wanted)
        presenting=wanted
        if phase~='building' and phase~='ready' then return false end
        local visible=wanted and hasSelectionImage()
        if host.visible==visible and host.active==wanted then return true end
        return transition(wanted,visible,false)
    end
    local function resume()
        if fixedSelectionTemplate then return true end
        if nativeLifecycle then return transition(true,phase=='ready',true)end
        if data.cache or compactProfile(data) then host:SetActive(true);host:SetVisible(phase=='ready')end
        if base then self:pose(0,0,1,1)end
        return true
    end
    local function canBegin()
        return not working and phase~='destroyed' and phase~='failed' and phase~='release_failed'
    end
    local function templatesBound()
        return integer(Asset.imagePrefabId) and integer(Asset.containerPrefabId)
            and Asset.imagePrefabId~=100001 and Asset.containerPrefabId~=100001
    end
    function self.begin(_,foreground)
        if not canBegin() then return false end
        if host.alive==false then self:destroy();return false end
        idlePaused=false
        if phase=='building' or phase=='revealing' or phase=='ready'then return resume()end
        if not templatesBound() then fail('unbound portrait templateIndex');return false end
        generation=generation+1;phase='building';nextIndex=1;reason=nil;resetGroups()
        local token=generation;working=true
        local ok,err=pcall(function()
            if fixedSelectionTemplate then nativeTransition(foreground==true,false,false)
            elseif nativeLifecycle then nativeTransition(true,false,false)
            else call(token,host,'SetVisible',false);call(token,host,'SetActive',true)end
            call(token,host,'SetAnchorMin',.5,.5);call(token,host,'SetAnchorMax',.5,.5);call(token,host,'SetPivot',.5,.5)
            call(token,host,'SetSizeDelta',data.width,data.height or data.width)
            call(token,host,'SetLocalScale',display/data.width,display/data.width,1);call(token,host,'SetLocalRotation',0,0,rotation)
            if base then call(token,host,'SetAnchoredPosition',base[1],base[2])end
            -- Keep the dedicated slot position; never import ROOT offsets into the shared hero/button.
        end)
        if not ok then
            if err~=CANCELLED then fail(err)elseif nativeLifecycle or fixedSelectionTemplate then reconcileCancellation()end
        end
        if pending then cleanup()end;working=false
        return ok and current(token)
    end
    local function finishSelectionGroup(token)
        -- Complete groups are immutable and ready under the hidden host during
        -- prewarm. Never publish a partial group or reorder painter layers.
        if data.revealWithNext and data.revealWithNext[groupIndex] then return end
        if not revealedPages[page] then
            call(token,page,'SetVisible',true);revealedPages[page]=true
        end
        while revealIndex<=groupIndex do
            call(token,revealGroups[revealIndex].control,'SetVisible',true)
            revealIndex=revealIndex+1
        end
        if presenting and hasSelectionImage() and not host.visible then call(token,host,'SetVisible',true)end
    end
    local function makeContainer(token,parent)
        local control=create(token,Asset.containerPrefabId,parent)
        transform(token,control)
        if fixedSelectionTemplate then
            if control.active~=true then call(token,control,'SetActive',true)end
        else
            call(token,control,'SetActive',not data.runtimeV2)
            call(token,control,'SetVisible',not data.runtimeV2)
        end
        return control
    end
    local function buildImage(token)
        local row=data.rows[nextIndex]
        local template=row[21]==1 and assert(Asset.selectionHalfImagePrefabId,'missing half-triangle template') or Asset.imagePrefabId
        local c=create(token,template,group);image(token,c,row);nextIndex=nextIndex+1
        local complete=nextIndex>#data.rows
        if fixedSelectionTemplate and (complete or (nextIndex-1)%GROUP_SIZE==0) then finishSelectionGroup(token)end
        if not complete then return end
        if fixedSelectionTemplate then phase='ready'
        elseif data.runtimeV2 then phase='revealing'
        else call(token,host,'SetVisible',true);phase='ready'end
    end
    local function buildNext(token)
        local p=Idle and data.bandByRow[nextIndex] or math.floor((nextIndex-1)/PAGE_SIZE)+1
        local g=math.floor((nextIndex-1)/GROUP_SIZE)+1
        if pageIndex~=p then
            page=makeContainer(token,host);pageIndex=p
            if Idle then idlePages[p]=page;groupIndex=0 end
        elseif groupIndex~=g then
            group=makeContainer(token,page);groupIndex=g
            if data.runtimeV2 then revealGroups[#revealGroups+1]={control=group,page=page}end
        else
            buildImage(token)
        end
    end
    -- Exactly one native creation attempt.
    function self.step(_)
        if host.alive==false then self:destroy()end
        if working or (phase~='building' and phase~='revealing')then return false end
        local token=generation;working=true
        if phase=='revealing' then
            local ok,err=pcall(function()
                for _=1,4 do
                    local entry=revealGroups[revealIndex]
                    if not entry then break end
                    if not revealedPages[entry.page] then
                        call(token,entry.page,'SetVisible',true);call(token,entry.page,'SetActive',true);revealedPages[entry.page]=true
                    end
                    call(token,entry.control,'SetVisible',true);call(token,entry.control,'SetActive',true)
                    revealIndex=revealIndex+1
                end
                if revealIndex>#revealGroups then call(token,host,'SetVisible',true);phase='ready'end
            end)
            if not ok then
                if err~=CANCELLED then fail(err)else reconcileCancellation()end
            end
            if pending then cleanup()end;working=false;return ok,'reveal'
        end
        local ok,err=pcall(buildNext,token)
        if not ok then
            if err~=CANCELLED then fail(err)
            elseif fixedSelectionTemplate then reconcileCancellation()end
        end
        if phase=='destroyed'then created={} elseif pending then cleanup()end
        working=false;return true
    end
    function self.pause(_)
        idlePaused=true
        -- Owners that opt in can retry failed artwork on their next activation.
        if retryFailedOnPause and (phase=='failed' or phase=='release_failed')then return self:release()end
        if not data.cache and not compactProfile(data) then return self:release()end
        if phase=='destroyed' or host.alive==false then return false end
        if fixedSelectionTemplate then return self:present(false)end
        if nativeLifecycle then return transition(false,false,false)end
        host:SetVisible(false);host:SetActive(false);return true
    end
    function self.release(_)
        if phase=='destroyed'then return true end
        if pending then return true end
        local wasWorking=working;working=true;generation=generation+1;phase='released';pending=true;presenting=false
        local hidden=hide();if wasWorking then return hidden end
        local cleaned=cleanup();working=false;return hidden and cleaned
    end
    local function poseWrite(c,method,...)
        if phase~='ready' or generation~=poseTicket or idlePaused or host.alive==false or c.alive==false then error(CANCELLED,0)end
        assert(c[method](c,...)~=false,'idle native setter rejected')
        if phase~='ready' or generation~=poseTicket or idlePaused or host.alive==false or c.alive==false then error(CANCELLED,0)end
    end
    local function paintIdle(dt,motionState)
        local idle=motionState=='idle'
        if data.motion~='static' then
            idleTime=(idleTime+math.min(dt or 0,.1))%data.period
            local sample,sampleTime=Idle.sample(data,idleTime)
            if idleSample~=sample or wasIdle~=idle then
                Idle.paint(data,idlePages,sampleTime,idle,poseWrite);idleSample=sample;wasIdle=idle
            end
        end
        return idle
    end
    function self.pose(_,x,y,sx,sy,dt,motionState)
        if host.alive==false then self:destroy();return end
        if working or Idle and idlePaused or (phase~='building' and phase~='ready')then return end
        working=true;poseTicket=generation
        local ok,err=pcall(function()
            if Idle and phase=='ready' then
                -- The approved bands own idle movement. Do not stack the old
                -- whole-body ActorMotion breathing on top of the source field.
                if paintIdle(dt,motionState) then x,y,sx,sy=0,0,1,1 end
            end
            assert(host:SetAnchoredPosition(x+(base and base[1] or 0),y+(base and base[2] or 0))~=false,'portrait pose rejected')
            if host.alive==false then self:destroy();return end
            if Idle and idlePaused then return end
            if phase=='building' or phase=='ready'then assert(host:SetLocalScale(sx*display/data.width,sy*display/data.width,1)~=false,'portrait scale rejected')end
        end)
        if not ok and err~=CANCELLED then fail(err)end
        if phase=='destroyed'then created={} elseif pending then cleanup()end
        working=false
    end
    function self.destroy(_)generation=generation+1;phase='destroyed';pending=false;created={};idlePages={};resetGroups()end
    return self
end
local function activeTargets(mode,characterOpen,stopped,character,preloadSelection)
    if stopped then return {}end
    local choosing=characterOpen==true
    local warm=preloadSelection==true and mode=='menu' and not choosing
    local selection=warm or choosing and character=='ironclad'
    return {avatar=choosing or warm,battle=mode=='battle' and character=='ironclad',selection=selection,cardFan=selection,
        selectScene=choosing or warm,battleScene=mode=='battle',menuScene=mode=='menu' and not choosing}
end
local function selectionFigure(Asset,official,profile)
    return official and assert(Asset.lowpolyLumine,'official selection requires approved 1600 background')
                or profile and Asset.battle133 or lowpoly(Asset.lowpolyHero) and Asset.lowpolyHero or Asset.selection133 or Asset.battle133
end
local function officialSelections(Asset)
    local entries={{id='ironclad',host='lumineSelectionBackground',drawing=selectionFigure(Asset,true)}}
    for _,entry in ipairs(Asset.selectionVariants or {})do
        assert(#entries<4 and type(entry.id)=='string' and type(entry.host)=='string'
            and lowpoly(entry.drawing) and entry.drawing.runtimeV2 and entry.drawing.cache,'invalid selection variant')
        entries[#entries+1]=entry
    end
    return entries
end
local function battleFigure(Asset,official)
    if not official then
        local drawing=Asset.battle133
        validate(drawing,133,4315,'ae2161957033d688b1bed1c7ab2ad2891d5f7bf5e34b291f9ecaef7cfa11f880','f8a7af7b079aa5bbb7e16b502b222f1fd7dbfaa2c30f6eef1bf0d76af0a0a248')
        return drawing
    end
    local drawing=assert(Asset.battleApprovedNative,'official battle requires the approved native Lumine drawing')
    assert(lowpoly(drawing) and drawing.width==133 and drawing.height==133 and drawing.count==464
        and drawing.literalSha256=='73070e14234502e7a61b0be601b9ada017bb4d90b0f58cccd305673cd2fddfef'
        and drawing.jsonSha256=='a0c792109a74f71be0a52d9a59f39828e1d4818ce8d1bba915606b984d89f831',
        'unexpected native Lumine drawing identity')
    return drawing
end
-- cardTemplates: ready-card image/container template indices, used when only the cards flag is on.
local function requiredPortrait(row,scope,wanted,mode,character,characterOpen)
    if row.progressive then return (not scope or scope.selection) and characterOpen and row.role==character end
    return (not scope or scope[row.name]) and (wanted[row.name] or row.name=='result' and (mode=='victory' or mode=='defeat'))
end
local function portraitReadiness(row,mode,resultOutcome)
    local state=row.adapter:status()
    if state.phase=='failed' or state.phase=='release_failed' or state.phase=='destroyed' then return false,state.reason or state.phase end
    if not row.active or state.phase~='ready' or row.name=='result' and resultOutcome~=mode then
        return false,nil,table.concat({row.name,state.phase,state.owned or 0,state.revealIndex or 0},':')
    end
    return true
end
local function enabled(flags,key)
    return type(flags)=='table' and flags[key]==true
end
local function selectionFallback(panel,details,official)
    return official and {panel:GetChild('v25Background')} or {details:GetChild('portraits')}
end
local function fallbackControls(row)
    return (row.name~='selection' or row.active or row.restoreOnPause)and row.fallback or {}
end
local dots={'• · ·','· • ·','· · •'}
local function show(control,visible)
    if control and control.alive~=false and control.visible~=visible then control:SetVisible(visible)end
end
local function pendingSelection(state)
    return state.phase=='building' or state.phase=='revealing'
end
local function advanceSelection(row,dt)
    if not row.active or not row.panel.visible then return end
    if pendingSelection(row.adapter:status()) then
        row.wait=(row.wait or 0)+dt
    elseif row.fadeTime then
        row.fadeTime=math.max(0,row.fadeTime-dt)
    end
end
local function paintSelectionWait(row,waiting)
    if waiting and row.dots and row.dots.alive~=false then
        local label=dots[1+math.floor((row.wait-.5)*6)%#dots]
        if row.dots.text~=label then row.dots.text=label end
    end
    show(row.dots,waiting)
end
local function paintSelection(row,state)
    local visible=row.active and row.panel.visible
    local pending=visible and pendingSelection(state)
    paintSelectionWait(row,pending and not state.shown and (row.wait or 0)>=.5)
    if not row.progressive and visible and state.phase=='ready' and row.wasPending then row.fadeTime=.16 end
    row.wasPending=pending
    local fading=visible and state.phase=='ready' and (row.fadeTime or 0)>0
    if fading and row.matte and row.matte.alive~=false then
        local alpha=math.floor(82*row.fadeTime/.16+.5)
        if alpha~=row.fadeAlpha then
            row.matte.imageColor=Color.FromRGBA(15,17,23,alpha)
            row.fadeAlpha=alpha
        end
    end
    show(row.matte,fading)
end
function M.new(stage,report,flags,cardTemplates)
    local selecting=enabled(flags,'selectionAvatar')
    local fighting=enabled(flags,'battlePortrait')
    local carding=enabled(flags,'cards')
    local landing=enabled(flags,'menuBackground')
    if not selecting and not fighting and not carding and not landing then return nil end
    if owners[stage]then return owners[stage]end
    local Asset=require('abyss_traveler_portrait_assets')
    local profile=v25Profile(Asset)
    local theme=require('abyss_theme')
    local official=theme.presentationProfile=='official-assets-first'
    local epoch=0
    if carding and not lowpoly(Asset.lowpolyCardFan) then carding=false end
    if landing and not lowpoly(Asset.lowpolyLand) then landing=false end
    if not selecting and not fighting and not carding and not landing then return nil end
    local avatar,battle,selection,selectionRow,rows=nil,nil,nil,nil,{}
    local selections,activeSelection={},nil
    local result,resultHost,resultRow,resultOutcome
    local templates=integer(Asset.imagePrefabId) and Asset.imagePrefabId~=100001 and integer(Asset.containerPrefabId) and Asset
        or type(cardTemplates)=='table' and {imagePrefabId=cardTemplates.imageTemplateIndex,containerPrefabId=cardTemplates.containerTemplateIndex}
    if landing and templates then
        -- Bottom-most layout slot (first child): behind every hand/monster/HUD control.
        for _,entry in ipairs({{'selectScene','characterPanel',{'border','face'}},{'battleScene','battlePanel',{}},{'menuScene','menuPanel',{}}})do
            local panel=stage:GetChild(entry[2]);local host=panel and panel:GetChild('lowpolyScene')
            if host then
                local cover={};for _,name in ipairs(entry[3])do cover[#cover+1]=panel:GetChild(name)end
                rows[#rows+1]={name=entry[1],adapter=controller(host,Asset.lowpolyLand,Asset.lowpolyLand.width,templates),fallback=cover,active=false}
            end
        end
    end
    local function attachOfficialSelection(panel,details)
        assert(Asset.selectionUses=='lowpolyLumine','official selection requires approved background schema')
        local entries=officialSelections(Asset)
        local seenHosts={}
        for _,entry in ipairs(entries)do
            local host=assert(panel:GetChild(entry.host),'missing approved selection background host')
            assert(not selections[entry.id] and not seenHosts[host],'duplicate selection variant')
            seenHosts[host]=true
            local adapter=controller(host,entry.drawing,1280,Asset,{fixedSelectionTemplate=true,
                ownerEpoch=function()return epoch end,retryFailedOnPause=true})
            local row={name='selection',role=entry.id,adapter=adapter,fallback=selectionFallback(panel,details,true),
                active=false,restoreOnPause=true,progressive=true,panel=panel,
                dots=details:GetChild('portraitLoading'),matte=details:GetChild('portraitFade')}
            selections[entry.id]=row
        end
        -- Register the drawing order once; only the requested row does foreground work.
        for _,entry in ipairs(entries)do rows[#rows+1]=selections[entry.id]end
        selectionRow=selections.ironclad;selection=selectionRow.adapter
    end
    local function attachSelection()
        validate(Asset.avatar96,96,4822,'c30551e1fed1cd7f18c61b67fe0ad0cd6e52c61bfa6ae937ccd9e4c90e7f72bb','93bcf4303d370f7faac2b8289146acfe655bae6dced0abf5257e407d69f748ef')
        local panel=assert(stage:GetChild('characterPanel'))
        local traveler=assert(panel:GetChild('traveler'))
        local bust=assert(traveler:GetChild('hit'):GetChild('normal'):GetChild('bust'))
        avatar=controller(traveler:GetChild('officialAvatar'),Asset.avatar96,assert(bust.sizeDeltaX),Asset,
            profile and {nativeLifecycle=true,ownerEpoch=function()return epoch end})
        local details=panel:GetChild('details')
        local row={name='avatar',adapter=avatar,fallback={},active=false,visibleOwner=traveler,symbolOwner=panel:GetChild('v25Roster')}
        for _,name in ipairs({'normal','hover','pressed','disabled'})do row.fallback[#row.fallback+1]=traveler:GetChild('hit'):GetChild(name):GetChild('bust')end
        local host=details and details:GetChild('officialSelectionFigure')
        if official then attachOfficialSelection(panel,details)
        elseif host then
            local figure=selectionFigure(Asset,false,profile)
            if figure.renderProfile~='lowpoly-v1' then
                validate(figure,133,4315,'ae2161957033d688b1bed1c7ab2ad2891d5f7bf5e34b291f9ecaef7cfa11f880','f8a7af7b079aa5bbb7e16b502b222f1fd7dbfaa2c30f6eef1bf0d76af0a0a248')
            end
            local display=profile and profile.selectionDisplay or assert(details:GetChild('portraitFrame').sizeDeltaX)
            selection=controller(host,figure,display,Asset,{position=profile and profile.selectionPosition,
                nativeLifecycle=profile~=nil,ownerEpoch=function()return epoch end,retryFailedOnPause=true})
            local fallback=selectionFallback(panel,details,false)
            selectionRow={name='selection',adapter=selection,fallback=fallback,active=false,restoreOnPause=true,
                panel=panel,dots=details:GetChild('portraitLoading'),matte=details:GetChild('portraitFade')}
            rows[#rows+1]=selectionRow
        end
        rows[#rows+1]=row
    end
    if selecting then
        if official then
            local ok,reason=pcall(attachSelection)
            if not ok then
                avatar,selection,selectionRow,selections=nil,nil,nil,{}
                if report then pcall(report,'ABYSS_PORTRAIT selection phase=failed reason='..tostring(reason))end
            end
        else attachSelection()end
    end
    if carding then
        -- Premium frames + low-poly illustrations fanned under the select details, like the breakthrough GIF.
        local panel=stage:GetChild('characterPanel')
        local parent=panel and panel:GetChild('details')
        if templates and parent and integer(templates.containerPrefabId) then
            local host=game.InstantiateClientUIControl(templates.containerPrefabId,parent)
            if host then
                pcall(host.SetVisible,host,false)
                pcall(host.SetAnchoredPosition,host,0,-250)
                local fan=controller(host,Asset.lowpolyCardFan,Asset.lowpolyCardFan.width,templates)
                rows[#rows+1]={name='cardFan',adapter=fan,fallback={},active=false}
            end
        end
    end
    local battleDrawing
    if fighting then
        battleDrawing=battleFigure(Asset,official)
        local hero=assert(stage:GetChild('battlePanel'):GetChild('hero'))
        battle=controller(hero:GetChild('officialFigure'),battleDrawing,profile and profile.battleDisplay or official and theme.layout.player.portrait or 400/3,Asset,
            {retryFailedOnPause=true,position=profile and profile.battlePosition or official and theme.officialAssets.battlePortraitPosition,
                nativeLifecycle=profile~=nil,ownerEpoch=function()return epoch end})
        -- UnitView deliberately hides the shipped geometric player placeholder.
        -- Publication failure or pause must not override that presentation policy.
        local icon=require('abyss_theme').icon.player
        rows[#rows+1]={name='battle',adapter=battle,fallback={hero:GetChild('portrait')},active=false,
            fallbackVisible=not(type(icon)=='table' and icon.status=='placeholder')}
    end
    local function resultController(outcome)
        local defeat=outcome=='defeat'
        return controller(resultHost,Asset.battle133,260,Asset,{position={-342.5,defeat and -157 or -56},
            -- CSS -83deg uses screen Y-down; native candidate uses Y-up +83.
            -- Direction, sampled detail and the dim colour remain device-unverified.
            rotation=defeat and 83 or 0,tint={brightness=.45,saturation=.45,opacity=defeat and .30 or .38},
            nativeLifecycle=true,ownerEpoch=function()return epoch end})
    end
    if profile then
        local menu=stage:GetChild('menuPanel');local page=menu and menu:GetChild('result')
        local chrome=page and page:GetChild('v25ResultChrome')
        resultHost=chrome and chrome:GetChild('subject')
        if resultHost then
            resultOutcome='victory';result=resultController(resultOutcome)
            resultRow={name='result',adapter=result,fallback={},active=false};rows[#rows+1]=resultRow
        end
    end
    if #rows==0 and not (official and selecting) then return nil end
    local timeBudget=avatar and Asset.avatar96.runtimeV2 or fighting and battleDrawing.runtimeV2 or carding or landing
    local self,busy,destroyed,painting={},false,false,false
    local warmAdmission=false
    local pendingSync
    local function finishSync()
        busy=false
        local nextSync=pendingSync
        pendingSync=nil
        if nextSync and not destroyed then self:sync(table.unpack(nextSync,1,5))end
    end
    local fallbackVisibility=setmetatable({},{__mode='k'})
    local function paintFallback(control,visible,phase)
        local setter=control.SetVisible
        local painted=fallbackVisibility[control]
        if painted and painted.visible==visible and painted.phase==phase and painted.setter==setter
            and control.visible==visible then return false end
        -- Invalidate before a native call: rejected or overlapping writes are not promises.
        fallbackVisibility[control]=nil
        local ok,accepted=pcall(setter,control,visible)
        if ok and accepted~=false and control.alive~=false and control.visible==visible then
            fallbackVisibility[control]={visible=visible,phase=phase,setter=setter}
        end
        return true
    end
    local function presentingRow(row,state)
        if not row.active then return false end
        if row.progressive then return state.shown end
        return state.phase=='ready'
    end
    local function paintRowFallback(row,state)
        local ready=presentingRow(row,state)
        local fallbackVisible=row.fallbackVisible~=false
        for _,c in ipairs(fallbackControls(row))do
            if destroyed then return end
            if c.alive~=false then
                local visible=not ready and fallbackVisible
                if not row.progressive or c.visible~=visible then
                    local wrote=paintFallback(c,visible,state.phase)
                    -- A native setter may synchronously release. Restore the
                    -- backing if the old hide completed after its release.
                    if ready and wrote and not destroyed then
                        local latest=row.adapter:status()
                        if not presentingRow(row,latest) then paintFallback(c,fallbackVisible,latest.phase)end
                    end
                end
            end
        end
    end
    local function paintPortraitRow(row)
        local state=row.adapter:status()
        paintRowFallback(row,state)
        if destroyed then return end
        if row.name=='selection' then
            local ok=pcall(paintSelection,row,state)
            if not ok then
                pcall(show,row.dots,false);pcall(show,row.matte,false)
                row.dots,row.matte=nil,nil
            end
        end
        if row.lastPhase~=state.phase then
            row.lastPhase=state.phase
            if report then pcall(report,'ABYSS_PORTRAIT '..row.name..' phase='..state.phase..' owned='..state.owned..' reason='..tostring(state.reason))end
        end
    end
    local function paint()
        if destroyed or painting then return end
        painting=true
        for _,row in ipairs(rows)do
            if destroyed or pendingSync then break end
            if not row.progressive or row==(activeSelection or selectionRow) then paintPortraitRow(row)end
        end
        painting=false
    end
    function self.status(_)
        local adapter=activeSelection and activeSelection.adapter or selection
        return {avatar=avatar and avatar:status() or {phase='disabled',owned=0},
            battle=battle and battle:status() or {phase='disabled',owned=0},selection=adapter and adapter:status(),
            result=result and result:status(),batchSize=64}
    end
    function self.syncResult(_,mode,stopped)
        if not result or busy or destroyed then return false end
        busy=true;local token=epoch
        local wanted=not stopped and (mode=='victory' or mode=='defeat')
        if wanted and resultOutcome~=mode then
            resultRow.active=false
            local released=result:release()
            if epoch~=token or destroyed then busy=false;return false end
            if not released then paint();busy=false;return false end
            result=resultController(mode);resultRow.adapter=result;resultOutcome=mode;resultRow.lastPhase=nil
        end
        local accepted=true
        if wanted and not resultRow.active then resultRow.active=true;accepted=result:begin()
        elseif not wanted and resultRow.active then resultRow.active=false;accepted=result:pause()end
        if epoch~=token or destroyed then busy=false;return false end
        local phase=result:status().phase
        local valid=phase~='failed' and phase~='release_failed' and phase~='destroyed'
        paint();finishSync();return accepted~=false and valid and epoch==token and not destroyed
    end
    local function transitionRow(row,wanted,mode,stopped)
        local accepted=true
            local resultOwned=row.name=='result' and not stopped and (mode=='victory' or mode=='defeat')
            if not resultOwned then
                if wanted[row.name] and not row.active then row.active=true;accepted=row.adapter:begin()
                elseif not wanted[row.name] and row.active then
                    row.active=false;row.wait,row.fadeTime=nil,nil
                    accepted=row.adapter:pause()
                end
            end
        return accepted
    end
    local function presentationTargets(mode,characterOpen,stopped,character,preloadSelection)
        local wanted=activeTargets(mode,characterOpen,stopped,character,preloadSelection)
        for _,row in ipairs(rows)do
            if official and row.name=='avatar' then
                local symbol=row.symbolOwner and row.symbolOwner.visible~=false
                row.fallbackVisible=not symbol
                if row.visibleOwner.visible~=true or symbol then wanted.avatar=false end
            end
        end
        return wanted
    end
    local function selectionSuperseded(row,token)
        if epoch~=token then return true end
        if not pendingSync then return false end
        -- A queued refresh for the same role must still finish presentation.
        -- No visibility has been published at this point.
        row.active=false;activeSelection=nil
        row.adapter:pause()
        return true
    end
    local function showSelected(row,token)
        row.active=true
        local state=row.adapter:status()
        if state.phase=='failed' or state.phase=='release_failed' then
            if not row.adapter:release() then return end
            if selectionSuperseded(row,token) then return end
        end
        if row.adapter:begin(true) and not selectionSuperseded(row,token) then
            if state.phase=='ready' then row.fadeTime=.16 end
            row.adapter:present(true)
        end
    end
    local function syncSelected(wanted,token)
        local previous=activeSelection
        if wanted==previous then return end
        activeSelection=nil
        if previous then
            previous.active=false;previous.wait,previous.fadeTime=nil,nil
            previous.adapter:pause()
        end
        if not wanted or epoch~=token or pendingSync then return end
        activeSelection=wanted
        showSelected(wanted,token)
    end
    local function syncRows(wanted,mode,stopped,token)
        for _,row in ipairs(rows)do
            if pendingSync then break end
            if not row.progressive then
                local accepted=transitionRow(row,wanted,mode,stopped)
                if epoch~=token then return false end
                if profile and accepted==false and row.name~='selection' then return false end
            end
        end
        return true
    end
    function self.sync(_,mode,characterOpen,stopped,character,preloadSelection)
        if destroyed then return false end
        if busy then
            -- Native setters can synchronously dispatch newer UI input.
            -- Apply only the latest intent after the in-flight setter returns.
            pendingSync={mode,characterOpen,stopped,character,preloadSelection}
            return false
        end
        busy=true;local token=epoch
        -- Official artwork has its own post-admission scheduler. The legacy
        -- hint also starts thumbnails and decoration and only applies there.
        if profile or official then preloadSelection=false end
        local wanted=presentationTargets(mode,characterOpen,stopped,character,preloadSelection)
        syncSelected(not stopped and characterOpen and selections[character] or nil,token)
        local accepted=epoch==token and syncRows(wanted,mode,stopped,token)
        if not pendingSync then paint()end
        finishSync()
        return accepted and (not profile or epoch==token)
    end
    local pagePortraits={characterPanel={avatar=true,selection=true,cardFan=true,selectScene=true},
        battlePanel={battle=true,battleScene=true},menuPanel={menuScene=true,result=true}}
    function self.readyForPage(_,mode,characterOpen,character,page)
        local scope=page and pagePortraits[page]
        if page and not scope then return true end
        if destroyed then return false,'portrait owner destroyed' end
        if busy then return false end
        local wanted=presentationTargets(mode,characterOpen,false,character,false)
        for _,row in ipairs(rows)do
            if requiredPortrait(row,scope,wanted,mode,character,characterOpen) then
                local ready,reason,progress=portraitReadiness(row,mode,resultOutcome)
                if not ready then return false,reason,progress end
            end
        end
        return true
    end
    local function buildStep(foregroundAllowed)
        -- The selected drawing gets its slice before optional scenes or thumbnails.
        if activeSelection and foregroundAllowed~=false then
            local progressed,kind=activeSelection.adapter:step()
            if progressed then return true,kind,true end
        end
        for _,row in ipairs(rows)do
            if row.active and not row.progressive then
                local progressed,kind=row.adapter:step()
                if progressed then return true,kind,false end
            end
        end
        return false
    end
    local function buildForeground(foregroundAllowed)
        local start=os.clock()
        for i=1,SELECTION_BUILD_LIMIT do
            local progressed,kind,selectionWork=buildStep(foregroundAllowed)
            if pendingSync or not progressed or kind=='reveal' then break end
            if selectionWork and i%4==0 and os.clock()-start>=SELECTION_BUILD_SECONDS then break end
            if timeBudget and i%8==0 and os.clock()-start>=.008 then break end
        end
    end
    function self.tick(_,dt,foregroundAllowed)
        if busy or destroyed then return end
        busy=true
        local row=activeSelection or selectionRow
        if row and dt and dt>0 then advanceSelection(row,dt)end
        buildForeground(foregroundAllowed)
        if not pendingSync then paint()end
        finishSync()
    end
    local function buildWarm(adapter,start)
        if not adapter:begin() then return end
        for _=1,SELECTION_WARM_LIMIT do
            if pendingSync or os.clock()-start>=SELECTION_WARM_SECONDS or not adapter:step() then break end
        end
    end
    local function idleFrame(dt)
        return type(dt)=='number' and dt>=0 and dt<=.05
    end
    function self.warmSelection(_,eligible,dt,frameStarted)
        if not official or not selectionRow or destroyed then return end
        local admitted=warmAdmission
        warmAdmission=eligible
        -- Only the default portrait is speculative. The other role caches
        -- acquire controls only when the player selects those roles.
        if not eligible or not admitted or busy or activeSelection or not idleFrame(dt) then return end
        local adapter=selectionRow.adapter
        local phase=adapter:status().phase
        if phase~='idle' and phase~='released' and phase~='building' then return end
        local start=os.clock()
        if start-frameStarted>=SELECTION_BUILD_SECONDS then return end
        busy=true
        buildWarm(adapter,start)
        finishSync()
    end
    function self.battlePose(_,x,y,sx,sy,dt,motionState)
        if busy or destroyed or not battle then return end
        busy=true;battle:pose(x,y,sx,sy,dt,motionState);paint();finishSync()
    end
    function self.release(_)
        if destroyed then return true end
        warmAdmission=false;activeSelection=nil
        pendingSync=nil;epoch=epoch+1;local old=busy;busy=true;local ok=true
        for _,row in ipairs(rows)do
            row.active=false;row.wait,row.fadeTime=nil,nil
            if not row.adapter:release()then ok=false end
        end
        paint();pendingSync=nil;busy=old;return ok
    end
    function self.onEngineDestroy(_)
        pendingSync=nil;epoch=epoch+1;destroyed=true;for _,row in ipairs(rows)do row.active=false;row.adapter:destroy()end
        -- Keep owners[stage] as a weak-key tombstone even before engine alive=false.
    end
    owners[stage]=self;return self
end
M.createController=controller
return M
