-- Deterministic fixture driver. The project actor/scene Lua computes every visual control.
local F=dofile('tests/lua/support/game_ui_fixture.lua')
local Run=require('abyss_run')
local Queue=require('abyss_encounter_queue')
local Acts=require('abyss_acts')
local C=F.Combat
local EnemyView=require('abyss_battle_enemy_view')
local surfaces=require('abyss_monster_surfaces')
local Art=require('abyss_monster_art_data')
assert(Art.status=='refined-release')
local portraitSpec={}
for _,n in ipairs(require('abyss_ui_layout')) do
    if n.name=='stage' then
        for _,child in ipairs(n.children) do
            if child.name=='battlePanel' then portraitSpec=child end
        end
    end
end
local function round(n) return math.floor(n+.5) end
local platform={
    seed=10,prologue=false,imageSource='static',imageFillRight=3,
    color=function(r,g,b,a) return {r=round(r),g=round(g),b=round(b),a=round(a)} end,
}
local root=F.Viewport.apply(F.control({children=F.Layout}),1280,720)
local panel=root:GetChild('battlePanel')
local scene=panel:GetChild('chapterBattleScene')
local sceneData=require('abyss_chapter_battle_scene_data')
local sceneRows=sceneData.rows
for _,batch in pairs(scene.children) do
    for name,slot in pairs(batch.children) do
        local index=tonumber(name:match('%d+'))
        slot.imageId=(sceneRows[1][index] or sceneRows[2][index] or sceneRows[3] and sceneRows[3][index])[1]
        slot.SetFillHorizontal=function(self,_,amount) self.fixtureFill={shape='horizontal',from='right',amount=amount} end
        slot.SetFillUnused=function(self) self.fixtureFill=false end
    end
end
local api=F.monsterActors()
local ordinary=api.instantiate
api.templateIndexByDefinition={}
local refinedTemplatesByIndex={
    [4]=assert(F.Templates.AbyssMonsterActor41),
    [5]=assert(F.Templates.AbyssMonsterActor96),
    [6]=assert(F.Templates.AbyssMonsterActor115),
}
for id,entry in pairs(Art.assets) do
    api.templateIndexByDefinition[id]=assert(({[41]=4,[96]=5,[115]=6})[entry.capacity])
end
local serial=0
api.instantiate=function(index,parent)
    local spec=refinedTemplatesByIndex[index]
    if not spec then return ordinary(index,parent) end
    local actor=F.control(spec,parent)
    serial=serial+1
    parent.children['refinedActor'..serial]=actor
    return actor
end
platform.monsterActors=api
-- Supply the mock native template API only. The approved Traveler controller
-- creates and positions its own 464 real production geometry rows.
local figure=panel:GetChild('hero'):GetChild('officialFigure')
local function setActive(self,value)
    self.active=value
    F.setEngineActive(self,value)
end
figure.SetActive=setActive
local heroAsset=require('abyss_traveler_portrait_assets')
heroAsset.imagePrefabId,heroAsset.containerPrefabId=41,73
Enum={ImageSource={StaticReference='static'},ImageType={Stretch=2},ImageFillHorizontalType={Right=3}}
Color={FromRGBA=platform.color}
local artSerial=0
game={
    InstantiateClientUIControl=function(index,parent)
        assert(index==41 or index==73)
        artSerial=artSerial+1
        local control=F.control({name='heroArt'..artSerial,kind=index==41 and 'image' or 'container'},parent)
        control.SetActive=setActive
        control.SetFillUnused=function(self) self.fixtureFill=false end
        control.SetFillHorizontal=function(self,_,amount) self.fixtureFill={shape='horizontal',from='right',amount=amount} end
        control.active=false
        parent.children[control.name]=control
        return control
    end,
    DestroyClientUIControl=function(control)
        control.parent.children[control.name]=nil
        setActive(control,false)
    end,
}
platform.portraits=assert(require('abyss_traveler_portraits').new(root,print,{battlePortrait=true}))
local ui=F.GameUI.new(root,F.Data,F.Presentation,'click',platform)
root.ui=ui
assert(F.start(ui))
assert(Run.startCombat(ui.run,'raven_adept_solo'))
local manager=assert(surfaces.get(panel))
local function encode(v)
    if v==nil then return 'null' end
    if type(v)=='string' then
        return '"'..v:gsub('[%c"\\]',function(c)
            return ({['"']='\\"',['\\']='\\\\',['\n']='\\n'})[c] or string.format('\\u%04x',c:byte())
        end)..'"'
    end
    if type(v)~='table' then return tostring(v) end
    local out={}
    if #v>0 then
        for _,x in ipairs(v) do out[#out+1]=encode(x) end
        return '['..table.concat(out,',')..']'
    end
    local keys={}
    for k in pairs(v) do keys[#keys+1]=k end
    table.sort(keys)
    for _,k in ipairs(keys) do out[#out+1]=encode(k)..':'..encode(v[k]) end
    return '{'..table.concat(out,',')..'}'
end
local function hex(c)
    if type(c)=='table' then return string.format('#%02X%02X%02X%02X',c.r,c.g,c.b,c.a) end
    return c
end
local function dynamicSpec(child)
    if child.name=='actorPage' then return {name='actorPage',kind='container',size={1280,720}} end
    if child.name:match('^heroArt%d+$') then return {name=child.name,kind=child.kind} end
    return assert(F.Templates[child.name],'unknown dynamic template '..tostring(child.name))
end
local function sortedExtras(control,known)
    local extras={}
    for key,child in pairs(control.children) do
        if not known[key] then extras[#extras+1]={key,child} end
    end
    table.sort(extras,function(a,b)
        local aPreference,bPreference=tonumber(a[1]:match('%d+$')),tonumber(b[1]:match('%d+$'))
        if aPreference and bPreference and aPreference~=bPreference then return aPreference<bPreference end
        return a[1]<b[1]
    end)
    return extras
end
local function dump(control,spec)
    if control.visible==false or control.activeInHierarchy==false then return nil end
    if not ({container=true,image=true,text=true,presetButton=true})[spec.kind] then return nil end
    local children,known={},{}
    for _,child in ipairs(spec.children or {}) do
        known[child.name]=true
        if spec.kind~='presetButton' or child.name=='normal' then
            local snapshot=dump(assert(control:GetChild(child.name),child.name),child)
            if snapshot then children[#children+1]=snapshot end
        end
    end
    for _,entry in ipairs(sortedExtras(control,known)) do
        local snapshot=dump(entry[2],dynamicSpec(entry[2]))
        if snapshot then children[#children+1]=snapshot end
    end
    local fill=spec.fill
    if control.fixtureFill~=nil then fill=control.fixtureFill or nil end
    local text
    if spec.text then
        text=C.copy(spec.text);text.content=control.text;text.colour=hex(control.fontColor) or text.colour
    end
    return {name=spec.name,kind=spec.kind=='presetButton' and 'container' or spec.kind,
        position={control.x or control.anchoredPositionX,control.y or control.anchoredPositionY},
        size={control.sizeDeltaX or 0,control.sizeDeltaY or 0},
        anchor=control.anchorMin and {min=control.anchorMin,max=control.anchorMax} or spec.anchor,
        pivot=control.pivot or spec.pivot,rotation=control.rotation or control.localRotationZ or spec.rotation,
        scale=control.scale or spec.scale,image=control.imageId or spec.image,
        imageType=({[1]='basic',[2]='stretch'})[control.imageType] or spec.imageType,
        colour=hex(control.imageColor) or spec.colour,opacity=not control.imageColor and spec.opacity or nil,
        fill=fill,mask=control.enableMask==true or spec.mask,feather=spec.feather,
        invertMask=spec.invertMask,text=text,children=children}
end
local function capture(name,context)
    -- Wait on the real presentation clock so the turn-start banner clears the actors.
    for _=1,5 do ui:update(.4) end
    for _=1,60 do
        if platform.portraits:status().battle.phase=='ready' then break end
        ui:update(.02)
    end
    assert(platform.portraits:status().battle.phase=='ready','approved Traveler art is not ready')
    assert(not panel:GetChild('feedback'):GetChild('v25TurnNotice').visible,'turn notice still obstructs the scene')
    assert(scene.visible,'chapter battle scene hidden')
    local variant=ui.run.act
    if variant==2 and sceneRows[3] and ui.run.encounterId=='act2_collector' then variant=3 end
    local backgroundSlots=0
    for _,batch in pairs(scene.children) do
        for name,slot in pairs(batch.children) do
            local index=tonumber(name:match('%d+'))
            local expected=sceneRows[variant][index]
            assert(slot.visible==not not expected,'wrong active chapter slot '..index..' for variant '..variant)
            if slot.visible then
                backgroundSlots=backgroundSlots+1
                assert(slot.imageId==expected[1],'wrong active chapter image in '..index)
                if variant~=1 then
                    assert(slot.x==expected[2] and slot.y==expected[3] and
                        slot.sizeDeltaX==expected[4] and slot.sizeDeltaY==expected[5],
                        'wrong active chapter transform in '..index)
                end
            end
        end
    end
    assert(variant==3 or backgroundSlots==(variant==2 and 249 or 229),'wrong active chapter paint inventory')
    local battle=ui.run.combat
    local data={}
    for _,actor in ipairs(battle.enemies) do
        local box=assert(manager:find(actor.id))
        local art=assert(box:GetChild('monsterArt'))
        assert(art.visible and not box:GetChild('portrait').visible,actor.definitionId..' native art fell back')
        local g=EnemyView.geometry(actor,true)
        local classifications=F.Theme.layout.enemyRow.groundContact.classification
        local hit=box:GetChild('hit')
        local count=0
        for _,group in pairs(art:GetChild('monsterSamples').children) do
            for _,shape in pairs(group.children) do
                if shape.visible then count=count+1 end
            end
        end
        assert(count>0)
        data[#data+1]={id=actor.definitionId,x=box.x,y=box.y,sourcePosition=actor.sourcePosition,
            shapes=count,portrait=g.portrait,footY=g.groundY,classification=classifications and classifications[actor.definitionId],hp=actor.hp,hpY=box:GetChild('hp').y,
            hitY=hit.y,hitWidth=hit.sizeDeltaX,hitHeight=hit.sizeDeltaY,
            intentY=box:GetChild('intentIcon').y,flight=actor.statuses.flight,contactShadow=box:GetChild('plate').visible}
    end
    print('SCENE '..encode({name=name,context=context,act=ui.run.act,floor=ui.run.floor,encounterId=ui.run.encounterId,backgroundVariant=variant,backgroundSlots=backgroundSlots,enemies=data,tree=dump(panel,portraitSpec)}))
end
local function battle(options,act)
    options.deck=options.deck or {'strike','strike','defend','defend','defend'}
    options.seed=options.seed or 10
    ui.run.act=act
    ui.run.encounterId='visual_capture_fixture'
    ui.run.floor=act==2 and 18 or 1
    ui.run.combat=assert(C.new(F.Data,options))
    ui:refresh()
    return ui.run.combat
end
local function ids(state)
    local result={}
    for _,actor in ipairs(state.enemies) do result[#result+1]=actor.definitionId end
    return table.concat(result,',')
end
local function group(source,booleans,integers,expected,act)
    local i,j=0,0
    local options={sourceEncounter=source,encounterBoundary={
        misc={boolean=function() i=i+1;local v=booleans[i];assert(v~=nil);return v end,
            integer=function() j=j+1;return assert(integers[j]) end},
        visualFloat=function()return 0 end,
    }}
    local state=battle(options,act or 1)
    assert(ids(state)==expected,ids(state))
    return state
end
local function enterAct2Boss(name,id)
    local run=ui.run
    run.phase,run.nodeFlow,run.floor,run.act='map',nil,Acts.get(2).boss,2
    run.encounters=Queue.new(run.runSeed,2)
    run.bossInitialization={profile='source-history',bossList={name,name}}
    assert(Run.startRoomCombat(run,'boss'))
    assert(run.encounterId=='act2_'..id and ids(run.combat)==id)
    ui:refresh()
    return run.combat
end

if not CAPTURE_ONLY then
group('2 Louse',{true,true},{},'red_louse,red_louse')
capture('double-red-louse','Production MonsterHelper formation, inject true,true at the misc Boolean boundary')
group('2 Louse',{true,false},{},'red_louse,green_louse')
capture('mixed-louse','Production MonsterHelper formation, inject true,false at the misc Boolean boundary')
group('Gremlin Gang',{}, {7,6,2,0}, 'wizard_gremlin,shield_gremlin,sneaky_gremlin,mad_gremlin')
capture('gremlin-gang','Production MonsterHelper formation, deterministic weighted draws 7,6,2,0')
group('Small Slimes',{true},{},'spike_slime_s,acid_slime_m')
capture('small-slimes','Production MonsterHelper formation, deterministic misc true')

local Summons=require('abyss_act2_summons')
local b=enterAct2Boss('Collector','collector')
capture('collector-before-summon','Production Run.startRoomCombat Boss entry at floor 33, before the first Torch Head summon')
F.click(root,'battlePanel','endTurn')
assert(ids(b)=='torch_head,torch_head,collector',ids(b))
capture('collector-summon','Production Collector End Turn triggered Summons.torches and Combat.summonEnemies')
b=enterAct2Boss('Automaton','automaton')
F.click(root,'battlePanel','endTurn')
assert(ids(b)=='bronze_orb,automaton,bronze_orb',ids(b))
capture('automaton-summon','Production Automaton End Turn triggered Summons.bronze and Combat.summonEnemies')
b=group('Gremlin Leader',{}, {0,2}, 'mad_gremlin,sneaky_gremlin,gremlin_leader',2)
assert(not b.aiRng)
b.seed=6 -- deterministic legacy RNG point whose next 1..8 draw selects Wizard
Summons.rally(C,b,b.enemies[3])
assert(ids(b)=='wizard_gremlin,mad_gremlin,sneaky_gremlin,gremlin_leader',ids(b));ui:refresh()
capture('leader-wizard-summon','Production Gremlin Leader Summons.rally and Combat.summonEnemies, deterministic pre-rally RNG seed 6')

ui.run.phase,ui.run.nodeFlow,ui.run.floor,ui.run.act='map',nil,18,2
ui.run.encounters=Queue.new('10',2)
assert(Queue.peek(ui.run.encounters,'normal')=='3 Byrds')
assert(Run.startRoomCombat(ui.run,'normal'))
b=ui.run.combat
C.draw(b,20)
local lead=b.enemies[1]
assert(lead.definitionId=='byrd' and lead.statuses.flight==3)
lead.statuses.flight=1 -- same legal pre-contact setup as byrd_ground_trial.lua
ui:refresh()
capture('byrd-01-flight','Production round, Act II encounter seed 10, lead fixture at one Flight immediately before real Strike')
local function strike()
    for index,card in ipairs(b.hand) do
        if card.cardId=='strike' then
            F.click(root,'battlePanel','card'..index)
            assert(ui.battleUI.selected==card.uid)
            return
        end
    end
    error('no Strike in legal hand')
end
local function intent()return lead.intents[lead.intentIndex].id end
strike()
F.click(root,'battlePanel','enemy1')
assert(lead.statuses.flight==0 and intent()=='stunned')
capture('byrd-02-knockdown','Real pointer Strike selected and played through production UI, Flight 1 to 0')
F.click(root,'battlePanel','endTurn')
assert(lead.statuses.flight==0 and intent()=='headbutt')
capture('byrd-03-headbutt-ready','Real turn advance from Stunned to Headbutt')
F.click(root,'battlePanel','endTurn')
assert(lead.statuses.flight==0 and intent()=='airborne')
F.click(root,'battlePanel','endTurn')
assert(lead.statuses.flight==3)
capture('byrd-04-relift','Real turn advance through Headbutt to Flight 3')

end

local gallery={}
for _,entry in ipairs(F.Data.enemies.enemies) do gallery[#gallery+1]={entry.id,1} end
for _,entry in ipairs(require('abyss_act1_bosses').enemies) do gallery[#gallery+1]={entry.id,1} end
for _,entry in ipairs(require('abyss_act2_enemies').enemies) do gallery[#gallery+1]={entry.id,2} end
assert(#gallery==42)
local seen={}
for _,entry in ipairs(gallery) do
    assert(not seen[entry[1]])
    seen[entry[1]]=true
    local name='monster-'..entry[1]
    if not CAPTURE_ONLY or CAPTURE_ONLY==name then
        if entry[1]=='gremlin_leader' then
            group('Gremlin Leader',{}, {0,2}, 'mad_gremlin,sneaky_gremlin,gremlin_leader',2)
            capture(name,'Production Gremlin Leader formation with deterministic weighted ally draws 0,2')
        elseif entry[1]=='collector' then
            enterAct2Boss('Collector','collector')
            capture(name,'Production Collector boss encounter at floor 33, announced Spawn intent')
        else
            battle({enemies={entry[1]}},entry[2])
            capture(name,'Single-enemy coverage fixture from the same 42 combat definitions used in native_enemy_portraits.lua')
        end
    end
end
