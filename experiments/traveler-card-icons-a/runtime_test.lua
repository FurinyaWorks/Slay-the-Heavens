local path, packFile=assert(arg[1]),assert(arg[2])
local M=assert(loadfile(path))()
local pack=assert(loadfile(packFile))()
local function deny(f,needle)
    local ok,err=pcall(f)
    assert(not ok and tostring(err):find(needle,1,true),tostring(err))
end
local id='cleave'
local function natives(owner,opts)
    opts=opts or {}
    local methods={}
    for i,key in ipairs({'SetAnchorMin','SetAnchorMax','SetPivot','SetSizeDelta','SetAnchoredPosition','SetLocalScale','SetLocalRotation','SetVisible','SetImage','SetFillHorizontal'})do
        methods[key]=function(c,...)c[key..'Value']={...}
            if key=='SetFillHorizontal' then
                assert(c.template==3 and c.enableMask and c.SetImageValue[2]==100003)
                assert(c[key..'Value'][1]=='right' and c[key..'Value'][2]==.5)
            end
        end
    end
    local made={}
    local beginCalls=0
    local templates={container=1,image=2,half=3}
    local instantiate=function(template,host)
        beginCalls=beginCalls+1
        if opts.stop and beginCalls==opts.stop then error('fixture create error')end
        local c=setmetatable({template=template,host=host},{__index=methods})
        made[c]=true
        return c
    end
    local destroy=function(c)assert(made[c]);made[c]=nil end
    local conf={explicitTrialOptIn=owner==true,asset=pack,templates=opts.templates or templates,instantiate=instantiate,destroy=destroy,
        color=function(...)return {...}end,staticImageSource='reference',rightFill='right'}
    return conf,made,function()return beginCalls end
end
do
    local conf=natives(false)
    deny(function()M.new(conf)end,'not opted in')
    conf=natives(true,{templates={container=1,image=2,half=2}})
    deny(function()M.new(conf)end,'templates must be distinct')
    local put=pack.enabled;pack.enabled=true
    conf=natives(true);deny(function()M.new(conf)end,'expected disabled')
    pack.enabled=put
    put=pack.cardCount;pack.cardCount=74
    deny(function()M.new(conf)end,'expected disabled')
    pack.cardCount=put
    local card=pack.cards[id];put=card.icon[1][21];card.icon[1][21]=2
    deny(function()M.new(conf)end,'invalid mask')
    card.icon[1][21]=put
end
local function run()
    local conf, made, calls=natives(true)
    local art=M.new(conf)
    assert(calls()==0,'pack creation activated native art')
    deny(function()art:step(33)end,'at most 32')
    deny(function()art:place({},'not_bound','A')end,'unknown pinned card ID')
    local totalImages,totalMasks,maxImage=0,0,0
    for name, card in pairs(pack.cards)do
        for _,mode in ipairs({'A','B'})do
            local host={}
            local plan=art:place(host,name,mode,{keepExistingBacking=true})
            assert(plan.images==#card.icon+(mode=='B' and 6 or 0))
            assert(art:status(host).phase=='pending' and art:status(host).owned==0)
            repeat
                local before=calls()
                assert(art:step(32)<=32 and calls()-before<=32)
            until art:status(host).phase~='pending'
            local st=art:status(host)
            assert(st.phase=='ready' and st.owned==plan.owned and st.root.SetVisibleValue[1]==true)
            local seen, images=0,0
            for c in pairs(made)do
                if c.template==3 then seen=seen+1;assert(c.SetFillHorizontalValue[2]==.5)end
                if c.template~=1 then images=images+1;assert(c.SetLocalRotationValue[1]*c.SetLocalRotationValue[2]==0)end
            end
            local actual=0;for _,r in ipairs(card.icon)do actual=actual+r[21]end
            assert(seen==actual and images==plan.images)
            totalImages=totalImages+images;totalMasks=totalMasks+seen;maxImage=math.max(maxImage,images)
            assert(art:release(host) and not art:release(host) and next(made)==nil)
        end
    end
    local hosts={};for i=1,10 do hosts[i]={};art:place(hosts[i],id,'B')end
    deny(function()art:place({},id,'A')end,'at most 10')
    local complete=false
    for i=1,80 do
        assert(art:step()<=32)
        if art:status(hosts[10]).phase=='ready'then complete=true;break end
    end
    assert(complete)
    for i=1,10 do assert(art:release(hosts[i]))end;assert(next(made)==nil)
    local failconf, failedMade=natives(true,{stop=3})
    local fail=M.new(failconf);fail:place(hosts[1],id,'B');fail:step()
    assert(fail:status(hosts[1]).phase=='failed' and next(failedMade)==nil)
    assert(fail:release(hosts[1]))
    print('Lua template-bridge fixture passed: 75 A + 75 B, '..totalImages..' images incl optional decoration (reused type backing), '..totalMasks..' masked visits, max '..maxImage..' image/card; 10-slot scheduler and cleanup')
end
run()
