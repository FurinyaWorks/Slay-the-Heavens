-- Offline native API mock traversal of the actual generated stage and runtime controls.
local Game=require('abyss_game_ui')
local savedNew=Game.new
local F
local serial=0
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
local H=assert(loadfile(SUPPORT..'mobile_run_hud_geometry.lua'))('helpers')
local Run,Map=require('abyss_run'),require('abyss_map')
local Routes=dofile('tests/lua/support/map_routes.lua')
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
        if not known[name] and name:match('^nativeActor')then
            rows[#rows+1]={c=c,s=Templates[c.name] or {name=name,kind=c.kind},order=#rows+1}
        end
    end
    table.sort(rows,function(a,b)return (a.c.captureOrder or a.order-10000)<(b.c.captureOrder or b.order-10000)end)
    return rows
end

local function capture(name,root,picture,screen)
    local rows={}
    local function walk(c,s,pose,path)
        if c.visible==false or c.activeInHierarchy==false then return end
        local p,k=s.position or {0,0},s.scale or {1,1}
        local x=pose.x+(c.x or p[1])*pose.sx
        local y=pose.y-(c.y or p[2])*pose.sy
        local sx,sy=pose.sx*(c.localScaleX or k[1]),pose.sy*(c.localScaleY or k[2])
        local width,height=c.sizeDeltaX or 0,c.sizeDeltaY or 0
        path=path..'/'..s.name
        if s.kind=='cursorArea'or s.kind=='presetButton' then
            local hits=picture.hits(x,-y)
            if hits[#hits] and '/stage'..hits[#hits].path==path then
                rows[#rows+1]={path=path,kind='hit',x=x,y=y,w=width*math.abs(sx),h=height*math.abs(sy)}
            end
        elseif s.kind=='image'or s.kind=='text'then
            local t=s.text
            rows[#rows+1]={path=path,kind=s.kind,x=x,y=y,w=width,h=height,sx=sx,sy=sy,
                px=pose.sx,py=pose.sy,pivot=c.pivot or s.pivot or {.5,.5},
                rotation=c.rotation and c.rotation[3]or s.rotation or 0,fill=c.fillAmount or (s.fill and s.fill.amount),
                image=c.imageId or s.image,colour=hex(c.imageColor)or s.colour,opacity=s.opacity or 1,
                text=t and c.text,font=t and (c.fontSize or t.fontSize),minFont=t and t.minFontSize,autoSize=t and t.autoSize,
                align=t and (c.horizontalAlignment or t.align),valign=t and (c.verticalAlignment or t.valign),ink=t and (hex(c.fontColor)or t.colour),
                outline=t and t.outlineColour}
        end
        local face=s.kind=='presetButton' and c.interactable==false and 'disabled'or'normal'
        for _,row in ipairs(ordered(c,s))do
            if s.kind~='presetButton'or row.s.name==face then walk(row.c,row.s,{x=x,y=y,sx=sx,sy=sy},path)end
        end
    end
    walk(root,stage,{x=screen[1]/2,y=screen[2]/2,sx=1,sy=1},'')
    print('FRAME '..encode({name=name,width=screen[1],height=screen[2],controls=rows}))
end

local function enter(host,kind)
    local path=Routes.to(host.map,function(n)return n.type==kind and n.roomKind~='boss_treasure'end)
    for i=1,#path-1 do assert(Map.choose(host.map,path[i]))end
    host:refresh()
    assert(host.mapUI:choose(path[#path]))
end

for _,mobile in ipairs({false,true})do
    local prefix=mobile and 'iphone-' or 'pc-'
    for _,count in ipairs({2,4})do
        local host,root,picture,screen=H.create(mobile,{readNeowHistory=function()return {bossCount=count==2 and 0 or 1}end})
        if count==2 then capture(prefix..'neow-continue',root,picture,screen)end
        H.click(picture,'/nodePanel/eventView/option1/hit',1)
        if count==4 then
            host.run.nodeFlow.event.rewards[3]={type='RANDOM_COLORLESS_2',drawback='CURSE'}
            host:refresh()
        end
        capture(prefix..'neow-'..count,root,picture,screen)
    end
    local host,root,picture,screen=H.create(mobile)
    local function shot(scene)capture(prefix..scene,root,picture,screen)end
    shot('map')
    host.run.potionSlots=5
    host.run.potions={[1]='fire_potion',[2]='block_potion',[4]='speed_potion',[5]='fruit_juice'}
    local ids={'burning_blood','omamori','matryoshka','anchor','potion_belt','ancient_tea_set','lizard_tail',
        'maw_bank','winged_greaves','bag_of_preparation','happy_flower','vajra','orichalcum','pen_nib'}
    for i=1,27 do host.run.relics[i]=ids[(i-1)%#ids+1]end
    host:refresh()
    shot('map-relics')
    H.click(picture,'/relicBar/next/hit',4)
    shot('map-relics-page2')
    H.click(picture,'/relicBar/slot1/hit',5)
    shot('map-relic-detail')
    assert(host:closeDeck())
    assert(host.relicUI:turnBar(-1))
    assert(Run.startCombat(host.run,'cultist_solo'))
    host:refresh();host:update(1)
    shot('combat')
    for _,enemy in ipairs(host.run.combat.enemies)do enemy.hp=0 end
    host.run.combat.phase='victory'
    assert(Run.finishCombat(host.run))
    host:refresh();host:update(1)
    shot('reward-list')
    H.click(picture,'/battlePanel/cardReward',6)
    host:update(1)
    shot('reward-pick')
    host,root,picture,screen=H.create(mobile)
    host.run.data.rules.events.encounterId='upgrade_shrine'
    enter(host,'event')
    shot('event')
    for _,room in ipairs({'shop','camp'})do
        host,root,picture,screen=H.create(mobile)
        enter(host,room)
        shot(room)
    end
    host,root,picture,screen=H.create(mobile)
    enter(host,'treasure')
    shot('treasure-closed')
    H.click(picture,'/nodePanel/treasureView/chest/hit',7)
    host.nodeUI:update(2)
    shot('treasure-rewards')
end
