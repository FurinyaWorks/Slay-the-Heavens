-- Isolated, explicit opt-in renderer for the 75-card art trial. Not loaded by the game.
-- Callers provide the actual template bridge. Never alias the half-triangle template
-- to the standard image template: native masks are available only on the former.
local M={}
local IMAGE,CONTAINER,HALF='image','container','half'
local function assertf(v,n)if not v then error(n,3)end;return v end
local function integer(v,lo,hi) return type(v)=='number' and v%1==0 and v>=lo and v<=hi end
local function finite(v) return type(v)=='number' and math.abs(v)<math.huge end
function M.preflight(asset)
    assertf(type(asset)=='table' and asset.schemaVersion==1 and asset.enabled==false
        and type(asset.cards)=='table' and asset.cardCount==75,'expected disabled 75-card trial asset')
    local count=0
    for id,a in pairs(asset.cards)do
        count=count+1
        assertf(type(id)=='string' and id:match('^[a-z][a-z_0-9]*$') and a.id==id and
            type(a.name)=='string' and a.name~='' and type(a.sourceAssetSha256)=='string'
            and #a.sourceAssetSha256==64,'invalid card binding')
        assertf(type(a.icon)=='table' and #a.icon>=1 and #a.icon<=60 and type(a.decoration)=='table' and type(a.backing)=='table'
            and #a.decoration==6,'invalid art budget')
        for _,part in ipairs({a.icon,a.decoration,a.backing})do
            for _,r in ipairs(part)do
                assertf(#r==21 and (r[1]==100001 or r[1]==100002 or r[1]==100003),'unsupported art row')
                for i=1,21 do assertf(finite(r[i]), 'nonfinite art row') end
                assertf(r[4]>0 and r[5]>0 and r[4]<=200 and r[5]<=160,'out of bounds native art size')
                for i=6,11 do assertf(r[i]>=0 and r[i]<=1,'invalid native anchor or pivot')end
                assertf(math.abs(r[12])==1 and math.abs(r[13])==1 and math.abs(r[19])<=78
                    and math.abs(r[20])<=78 and r[19]*r[20]==0,'invalid axis or scale')
                for i=15,18 do assertf(integer(r[i],0,255),'invalid native shade')end
                assertf(r[21]==0 or r[21]==1 and r[1]==100003,'invalid mask')
            end
        end
        assertf(type(a.backing)=='table' and #a.backing==1 and a.backing[1][1]==100001,'invalid backing')
    end
    assertf(count==75,'incorrect number of distinct cards')
end
function M.new(opts)
    assertf(type(opts)=='table' and opts.explicitTrialOptIn==true,'not opted in to card artwork trial')
    assertf(type(opts.instantiate)=='function' and type(opts.destroy)=='function' and type(opts.color)=='function'
        and opts.staticImageSource~=nil and opts.rightFill~=nil,'native capabilities missing')
    local ts=assertf(opts.templates,'missing native templates')
    for _,k in ipairs({IMAGE,CONTAINER,HALF})do assertf(integer(ts[k],1,2147483647),'missing native template: '..k)end
    assertf(ts.image~=ts.half and ts.container~=ts.image and ts.container~=ts.half,'native templates must be distinct')
    M.preflight(opts.asset)
    local api,live={},{}
    local function spawn(host,key)
        return assertf(opts.instantiate(ts[key],host),'native fixture create failed: '..key)
    end
    local function destroy(parts)
        -- The root owns all its children in a real widget tree. Reverse order
        -- frees explicit children first, as in the existing card-art controller.
        for i=#parts,1,-1 do pcall(opts.destroy,parts[i])end
    end
    local function transform(cmd,r)
        cmd:SetAnchorMin(r[8],r[9]);cmd:SetAnchorMax(r[10],r[11]);cmd:SetPivot(r[6],r[7])
        cmd:SetSizeDelta(r[4],r[5]);cmd:SetAnchoredPosition(r[2],r[3])
        cmd:SetLocalScale(r[12],r[13],1);cmd:SetLocalRotation(r[19],r[20],r[14])
    end
    local queued={}
    local function clean(job)
        destroy(job.parts);job.parts={}
    end
    function api:place(host,id,variant,opts2)
        assertf(host~=nil and not live[host],'trial host unavailable or already owned')
        assertf(variant=='A' or variant=='B','trial route must be A or B')
        local active=0;for _ in pairs(live)do active=active+1 end
        assertf(active<10,'trial can manage at most 10 simultaneous card hosts')
        local a=assertf(opts.asset.cards[id], 'unknown pinned card ID: '..tostring(id))
        local stack={}
        if not(opts2 and opts2.keepExistingBacking)then stack[#stack+1]=a.backing[1]end
        if variant=='B'then for _,r in ipairs(a.decoration)do stack[#stack+1]=r end end
        for _,r in ipairs(a.icon)do stack[#stack+1]=r end
        local job={parts={},rows=stack,index=1,images=#stack,batches=math.ceil(#stack/60),phase='pending',host=host,indexInBatch=60}
        live[host]=job;queued[#queued+1]=job
        return {images=job.images,batches=job.batches,owned=1+job.images+job.batches}
    end
    function api:status(host)
        local j=live[host]
        return j and {phase=j.phase,images=j.images,owned=#j.parts,reason=j.reason,root=j.root}
    end
    function api:release(host)
        local j=live[host]
        if not j then return false end
        live[host]=nil;j.phase='released';clean(j);return true
    end
    local function allocate(job)
        local center={0,0,0,144,64,.5,.5,.5,.5,.5,.5,1,1,0,0,0,0,0,0,0,0}
        local function take(parent,key)
            local c=spawn(parent,key);job.parts[#job.parts+1]=c;return c
        end
        if not job.root then
            job.root=take(job.host,CONTAINER)
            transform(job.root,center);job.root:SetVisible(false)
        elseif job.indexInBatch>=60 then
            job.batch=take(job.root,CONTAINER);job.indexInBatch=0
            transform(job.batch,center)
        else
            local r=job.rows[job.index]
            local image=take(job.batch,r[21]==1 and HALF or IMAGE)
            transform(image,r);image:SetImage(opts.staticImageSource,r[1])
            image.imageColor=opts.color(r[15],r[16],r[17],r[18])
            if r[21]==1 then image.enableMask=true;image:SetFillHorizontal(opts.rightFill,.5)end
            image:SetVisible(true)
            job.indexInBatch=job.indexInBatch+1;job.index=job.index+1
            if job.index>#job.rows then job.root:SetVisible(true);job.phase='ready' end
        end
    end
    function api:step(max)
        max=max or 32
        assertf(integer(max,1,32),'one trial update may create at most 32 controls')
        local created=0
        while created<max and #queued>0 do
            local j=queued[1]
            if j.phase~='pending'then table.remove(queued,1)
            else
                local ok,reason=pcall(allocate,j)
                created=created+1  -- attempts, upper bound on actual allocations
                if not ok then clean(j);j.phase='failed';j.reason=tostring(reason)end
            end
        end
        return created
    end
    return api
end
return M
