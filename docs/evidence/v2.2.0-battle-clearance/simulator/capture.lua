-- Offline native API mock traversal of the actual generated stage and runtime controls.
local Game=require('abyss_game_ui')
local savedNew=Game.new
local F
local serial=0
local dynamicSpecs=setmetatable({}, {__mode='k'})
local function track(c)
    local raise=c.SetAsLastSibling
    c.SetAsLastSibling=function(self)serial=serial+1;self.captureOrder=serial;return raise(self)end
    for _,part in pairs(c.children or {})do track(part)end
end
Game.new=function(root,data,presentation,event,platform)
    track(root)
    platform.nativePageLifecycle=true
    platform.textAlignments={
        horizontal={Left='left',Middle='centre'},
        vertical={Top='top',Middle='middle'},
    }
    for _,name in ipairs({'nodePanel','choicePanel'})do
        local panel=root:GetChild(name)
        local prior=getmetatable(panel)
        local active=true
        setmetatable(panel,{
            __index=function(c,k)if k=='active'then return active end;return prior.__index(c,k)end,
            __newindex=function(c,k,v)assert(k~='active');return prior.__newindex(c,k,v)end,
        })
        panel.SetActive=function(c,value)active=value;F.setEngineActive(c,value)end
    end
    return savedNew(root,data,presentation,event,platform)
end
F=dofile('tests/lua/support/game_ui_fixture.lua')

local Run=require('abyss_run')
local Combat=require('abyss_combat')
local Viewport=require('abyss_viewport')
local Geom=require('abyss_battle_enemy_view')
local Surfaces=require('abyss_monster_surfaces')
local Powers=require('abyss_monster_power_surfaces')
local Theme=require('abyss_theme')
local PortraitAssets=require('abyss_traveler_portrait_assets')
-- buildUI emits unbound engine indices; these mock handles model GIL bindings.
PortraitAssets.imagePrefabId=41
PortraitAssets.containerPrefabId=73
local Templates=require('abyss_ui_templates')
local stage
for _,spec in ipairs(F.Layout)do if spec.name=='stage'then stage=spec end end

local function encode(value)
    if type(value)=='string'then
        return '"'..value:gsub('[%c"\\]',function(c)
            return ({['"']='\\"',['\\']='\\\\'})[c] or string.format('\\u%04x',c:byte())
        end)..'"'
    end
    if type(value)~='table'then return value==nil and 'null' or tostring(value)end
    local out={}
    if #value>0 then
        for _,item in ipairs(value)do out[#out+1]=encode(item)end
        return '['..table.concat(out,',')..']'
    end
    local keys={}
    for key in pairs(value)do keys[#keys+1]=key end
    table.sort(keys)
    for _,key in ipairs(keys)do out[#out+1]=encode(key)..':'..encode(value[key])end
    return '{'..table.concat(out,',')..'}'
end

local function hex(c)
    if type(c)=='table'then return string.format('#%02X%02X%02X%02X',c.r,c.g,c.b,c.a or 255) end
    return c
end

local function ordered(control,spec)
    local rows,known={},{}
    for index,child in ipairs(spec.children or {})do
        known[child.name]=true
        local c=control:GetChild(child.name)
        if c then rows[#rows+1]={c=c,s=child,order=index}end
    end
    for name,c in pairs(control.children or {})do
        if not known[name] and dynamicSpecs[c] then
            local spec=dynamicSpecs[c]
            rows[#rows+1]={c=c,s={name=name,kind=spec.kind,children=spec.children},order=#rows+1,created=c.captureCreated}
        end
    end
    table.sort(rows,function(a,b)return (a.c.captureOrder or a.created or a.order-10000)<(b.c.captureOrder or b.created or b.order-10000)end)
    return rows
end

-- Keep the native hierarchy for the existing Beyond Simulator rasterizer.
local function dump(c,s)
    if c.visible==false or c.activeInHierarchy==false then return nil end
    if not ({container=true,image=true,text=true,presetButton=true})[s.kind] then return nil end
    local children={}
    local face=s.kind=='presetButton' and c.interactable==false and 'disabled'or'normal'
    for _,row in ipairs(ordered(c,s))do
        if s.kind~='presetButton'or row.s.name==face then
            local child=dump(row.c,row.s)
            if child then children[#children+1]=child end
        end
    end
    local t
    if s.text then
        t=Combat.copy(s.text)
        t.content,t.colour=c.text,hex(c.fontColor)or t.colour
        t.fontSize=c.fontSize or t.fontSize
        t.align,t.valign=c.horizontalAlignment or t.align,c.verticalAlignment or t.valign
    end
    local fill=s.fill
    if c.fillAmount then
        fill=Combat.copy(fill or {shape='horizontal',from='right'})
        fill.amount=c.fillAmount
    end
    return {
        name=s.name,kind=s.kind=='presetButton' and 'container' or s.kind,
        position={c.x or c.anchoredPositionX,c.y or c.anchoredPositionY},
        size={c.sizeDeltaX or 0,c.sizeDeltaY or 0},
        anchor=c.anchorMin and {min=c.anchorMin,max=c.anchorMax} or s.anchor,
        pivot=c.pivot or s.pivot,rotation=c.rotation or c.localRotationZ or s.rotation,
        scale=c.scale or s.scale, image=c.imageId or s.image,
        imageType=({[1]='basic',[2]='stretch'})[c.imageType] or s.imageType,
        colour=hex(c.imageColor)or s.colour,opacity=not c.imageColor and s.opacity or nil,
        fill=fill,mask=c.enableMask==true or s.mask,feather=s.feather,invertMask=s.invertMask,
        text=t,children=children
    }
end

local function capture(name,root,screen,geometry)
    local rows={}
    local function walk(c,s,pose,path)
        if c.visible==false or c.activeInHierarchy==false then return end
        local p,k=s.position or {0,0},s.scale or {1,1}
        local a=s.anchor or {min={.5,.5},max={.5,.5}}
        local amx,amy=table.unpack(c.anchorMin or {c.anchorMinX or a.min[1],a.min[2]})
        local axx,axy=table.unpack(c.anchorMax or {c.anchorMaxX or a.max[1],a.max[2]})
        local pivot=c.pivot or s.pivot or {.5,.5}
        local lx=(c.x or p[1])+(amx+(axx-amx)*pivot[1]-pose.pivot[1])*pose.w
        local ly=(c.y or p[2])+(amy+(axy-amy)*pivot[2]-pose.pivot[2])*pose.h
        local x,y=pose.x+pose.a*lx+pose.b*ly,pose.y+pose.c*lx+pose.d*ly
        local sx,sy=c.localScaleX or k[1],c.localScaleY or k[2]
        local rotation=c.rotation or s.rotation
        if type(rotation)~='table' then rotation={0,0,rotation or 0}end
        local r=c.localRotationZ or rotation[3]
        local theta=r*math.pi/180
        local rx,ry=rotation[1]*math.pi/180,rotation[2]*math.pi/180
        local co,si=math.cos(theta),math.sin(theta)
        local cx,sinx,cy,siny=math.cos(rx),math.sin(rx),math.cos(ry),math.sin(ry)
        local ra,rb,rc,rd=sx*(cy*co+siny*sinx*si),sy*(-cy*si+siny*sinx*co),sx*cx*si,sy*cx*co
        local ma,mb=pose.a*ra+pose.b*rc,pose.a*rb+pose.b*rd
        local mc,md=pose.c*ra+pose.d*rc,pose.c*rb+pose.d*rd
        local width=(c.sizeDeltaX or 0)+(axx-amx)*pose.w
        local height=(c.sizeDeltaY or 0)+(axy-amy)*pose.h
        path=path..'/'..s.name
        local matrix={ma,mb,mc,md}
        if s.kind=='cursorArea'or s.kind=='presetButton' then
            if c.raycastTarget~=false then
                rows[#rows+1]={path=path,kind='hit',x=x,y=y,w=width,h=height,matrix=matrix,pivot=pivot}
            end
        elseif s.kind=='image'or s.kind=='text'then
            local t=s.text
            rows[#rows+1]={path=path,kind=s.kind,x=x,y=y,w=width,h=height,sx=math.sqrt(ma*ma+mc*mc),sy=math.sqrt(mb*mb+md*md),
                matrix=matrix,pivot=pivot,
                rotation=r,fill=c.fillAmount or (s.fill and s.fill.amount),
                image=c.imageId or s.image,colour=hex(c.imageColor)or s.colour,opacity=c.imageColor and 1 or s.opacity or 1,
                text=t and c.text,font=t and (c.fontSize or t.fontSize),minFont=t and t.minFontSize,autoSize=t and t.autoSize,
                align=t and (c.horizontalAlignment or t.align),valign=t and (c.verticalAlignment or t.valign),ink=t and (hex(c.fontColor)or t.colour),
                outline=t and t.outlineColour}
        end
        local face=s.kind=='presetButton' and c.interactable==false and 'disabled'or'normal'
        for _,row in ipairs(ordered(c,s))do
            if s.kind~='presetButton'or row.s.name==face then walk(row.c,row.s,{x=x,y=y,a=ma,b=mb,c=mc,d=md,w=width,h=height,pivot=pivot},path)end
        end
    end
    walk(root,stage,{x=screen[1]/2,y=screen[2]/2,a=1,b=0,c=0,d=-1,w=0,h=0,pivot={.5,.5}},'')
    print('FRAME '..encode({name=name,width=screen[1],height=screen[2],controls=rows,geometry=geometry}))
    if os.getenv('CAPTURE_SIMULATOR')=='1' then
        local children={dump(root,stage)}
        local mobile=screen[1]==1560
        for _,spec in ipairs(F.Layout)do
            if spec.name=='canvasBackdrop' then children[#children+1]=dump(root.parent:GetChild(spec.name),spec) end
        end
        print('SCENE '..encode({name=name,viewport=screen,preset=mobile and 'mobile-19.5-9' or 'pc-16-9',
            tree={name='capture',kind='container',size=screen,children=children}}))
    end
end


local function make(mobile)
    local simulator=os.getenv('CAPTURE_SIMULATOR')=='1'
    local screen=mobile and (simulator and {1560,720} or {2556,1179}) or (simulator and {1600,900} or {1920,1080})
    local specByIndex={Templates.AbyssMonsterActor,{name='actorPage',kind='container',size={1280,720}},Templates.AbyssMonsterPower,
        Templates.AbyssMonsterActor41,Templates.AbyssMonsterActor96,Templates.AbyssMonsterActor115}
    local art=assert(require('abyss_monster_art_data'))
    local tiers={[41]=4,[96]=5,[115]=6}
    local api={enabled=true,templateIndex=1,containerTemplateIndex=2,powerTemplateIndex=3,templateIndexByDefinition={}}
    for id,key in pairs(art.bindings or {})do api.templateIndexByDefinition[id]=assert(tiers[art.assets[key].capacity])end
    local spawn=0
    function api.instantiate(index,parent)
        local spec=assert(specByIndex[index],'unknown release UI template '..index)
        local box=F.control(spec,parent)
        spawn=spawn+1
        parent.children['nativeActor'..spawn]=box
        dynamicSpecs[box]=spec
        box.captureCreated=-1000+spawn
        track(box)
        return box
    end
    function api.destroy(box)
        for name,child in pairs(box.parent.children)do
            if child==box then box.parent.children[name]=nil;return end
        end
    end
    local root=Viewport.apply(F.control({children=F.Layout}),table.unpack(screen))
    local cursor={CursorDown='down',CursorUp='up',CursorDrag='drag',CursorEndDrag='endDrag',CursorEnter='enter',CursorExit='exit'}
    local pointer={}
    local function colour(r,g,b,a)return {r=r,g=g,b=b,a=a}end
    local figure=root:GetChild('battlePanel'):GetChild('hero'):GetChild('officialFigure')
    figure.SetActive=F.setEngineActive
    Enum={ImageSource={StaticReference='static'},ImageType={Stretch=2},ImageFillHorizontalType={Right=3}}
    Color={FromRGBA=colour}
    game={InstantiateClientUIControl=function(index,parent)
        assert(index==41 or index==73,'unknown official traveler template '..index)
        spawn=spawn+1
        local spec={name='nativePortrait'..spawn,kind=index==41 and 'image' or 'container'}
        local box=F.control(spec,parent)
        box.SetActive=F.setEngineActive
        box.SetFillHorizontal=function(c,_,amount)c.fillAmount=amount end
        box.SetFillUnused=function(c)c.fillAmount=nil end
        box.captureCreated=-1000+spawn
        parent.children[spec.name]=box
        dynamicSpecs[box]=spec
        if index==41 then box:SetImage('static',100001)end
        track(box)
        return box
    end,DestroyClientUIControl=api.destroy}
    local portraits=require('abyss_traveler_portraits').new(root,print,{battlePortrait=true})
    local host=F.GameUI.new(root,F.Data,F.Presentation,'click',{
        seed=1,prologue=false,imageSource='static',imageFillRight=3,imageTypes={basic=1,stretch=2},
        color=colour,monsterActors=api,portraits=portraits,
        touchScreen=function()return mobile end,cursorEvents=cursor,cursorPosition=function()return pointer.x,pointer.y end,
    })
    root.ui=host
    host:resize(table.unpack(screen))
    assert(F.start(host))
    host.run.floor=F.Data.rules.map.bossFloor
    assert(Run.startCombat(host.run,'boss_guardian'))
    host:refresh();for _=1,24 do host:update(.125)end
    local state=host.run.combat
    for _=1,500 do
        if portraits:status().battle.phase=='ready' then break end
        host:update(.02)
    end
    local portrait=portraits:status().battle
    assert(portrait.phase=='ready','official traveler portrait not ready: '..portrait.phase..' '..tostring(portrait.reason))
    assert(state.enemies[1].definitionId=='guardian')
    assert(#state.hand==5,'initial hand must contain five cards, got '..#state.hand)
    return host,root,screen,state,pointer
end

for _,mobile in ipairs({false,true})do
    local host,root,screen,state,pointer=make(mobile)
    local panel=root:GetChild('battlePanel')
    local enemy=state.enemies[1]
    local function snapshot(scene)
        local box=assert(Surfaces.get(panel):control(1))
        local pool=assert(Powers.get(box:GetChild('statusRow')))
        local g=Geom.geometry(enemy, true)
        local geometry={profile=Theme.presentationProfile,refinedStatus=require('abyss_monster_art_data').status,
            actor=enemy.definitionId,phase=enemy.aiPhase,hp=enemy.hp,block=enemy.block,body=g,powers={},cards={}}
        pool:each(function(power,_,entry)
            if power.visible then
                local icon,count,hit=power:GetChild('icon'),power:GetChild('count'),power:GetChild('hit')
                geometry.powers[#geometry.powers+1]={id=entry.id,amount=count.text,icon={box.x+power.x,box.y+power.y,icon.sizeDeltaX,icon.sizeDeltaY},
                    count={box.x+power.x+count.x,box.y+power.y+count.y,count.sizeDeltaX,count.sizeDeltaY},font=count.fontSize or Theme.font.small,
                    hit={box.x+power.x,box.y+power.y,hit.sizeDeltaX,hit.sizeDeltaY},iconId=icon.imageId}
            end
        end)
        for i=1,#state.hand do
            local card=panel:GetChild('card'..i)
            geometry.cards[i]={x=card.x,y=card.y,angle=card.localRotationZ,scale=card.localScaleX,
                w=Theme.layout.card.size[1],h=Theme.layout.card.size[2],id=state.hand[i].cardId,
                hit={x=card:GetChild('hit').x,y=card:GetChild('hit').y,
                     w=card:GetChild('hit').sizeDeltaX,h=card:GetChild('hit').sizeDeltaY}}
        end
        assert(#geometry.powers>0,'Guardian power missing in '..scene)
        capture((mobile and 'mobile-' or 'pc-')..scene,root,screen,geometry)
    end
    assert(enemy.aiPhase=='offense' and enemy.statuses.mode_shift>0)
    snapshot('offense')
    if not mobile then
        local card=panel:GetChild('card4')
        card:GetChild('hit').listeners.enter()
        for _=1,8 do host:update(.125)end
        assert(host.battleUI.hover==4,'desktop hover failed')
        snapshot('offense-hover')
        card:GetChild('hit').listeners.exit()
        for _=1,8 do host:update(.125)end
    end
    local spent=Combat.damage(state,state.player,enemy,enemy.statuses.mode_shift,true)
    assert(spent>0 and enemy.aiPhase=='defense' and enemy.block>0)
    -- Resolve the Guardian's Sharp Hide action through Combat and draw back to five.
    assert(Combat.endTurn(state));host:refresh();for _=1,24 do host:update(.125)end
    assert(enemy.aiPhase=='defense' and enemy.statuses.sharp_hide>0 and #state.hand==5,
        'expected five cards against the defensive Guardian with Sharp Hide')
    snapshot('defense')
    if mobile then
        local deck={'strike','defend','bash','strike','defend','strike','defend','strike','defend','strike','defend','strike'}
        state=Combat.new(F.Data,{deck=deck,seed=42,sourceEncounter='Lots of Slimes',
            encounterBoundary={misc={integer=function(lo)return lo end,boolean=function()return false end},visualFloat=function(lo)return lo end}})
        assert(#state.enemies==5,'expected canonical five-slime formation')
        Combat.draw(state,5)
        assert(#state.hand==10,'expected maximum-size hand')
        for _,slime in ipairs(state.enemies)do
            Combat.addStatus(slime,'weak',2)
            Combat.addStatus(slime,'vulnerable',3)
            Combat.addStatus(slime,'strength',4)
        end
        host.run.combat=state
        host:refresh();for _=1,24 do host:update(.125)end
        enemy=state.enemies[1]
        snapshot('lots-of-slimes-ten')
    end
end
