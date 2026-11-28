local monsterControl=dofile('tests/lua/support/monster_control_fixture.lua')
-- Source-level native UIImage SetImage coverage, not official-device evidence.
local C,Theme=require('abyss_combat'),require('abyss_theme')
local EnemyView=require('abyss_battle_enemy_view')
local EncounterQueue=require('abyss_encounter_queue')
local PowerSurfaces=require('abyss_monster_power_surfaces')
local Run=require('abyss_run')
local SourceGeometry=require('abyss_monster_source_geometry')
local Summons=require('abyss_act2_summons')
local ground=Theme.layout.enemyRow.groundContact
local H=not ground and dofile('tests/lua/support/battle_action_fixture.lua')
local F=H and H.F or dofile('tests/lua/support/game_ui_fixture.lua')
-- Visible soles measured from the center of the 106px refined mattes.
local soleRows={
    acid_slime_s=38, acid_slime_m=46, acid_slime_l=45,
    spike_slime_s=30, spike_slime_m=38, spike_slime_l=22, slime_boss=38,
    red_louse=50, green_louse=44, raven_adept=46, jaw_worm=44,
    blue_guard=47, red_guard=47, looter=46, fungi_beast=47,
    mad_gremlin=42, fat_gremlin=44, sneaky_gremlin=45, shield_gremlin=44, wizard_gremlin=49,
    gremlin_nob=43, guardian=48, lagavulin=48, centurion=52, mystic=47,
    taskmaster=47, snake_plant=43, chosen=43, shelled_parasite=44, snecko=33,
    mugger=48, gremlin_leader=43, torch_head=34, automaton=46, champ=48,
}
local bakedShadows={gremlin_nob=true,chosen=true,torch_head=true,gremlin_leader=true}
local twoShadows={blue_guard=true,red_guard=true,taskmaster=true,raven_adept=true,looter=true,mugger=true,
    sneaky_gremlin=true,shield_gremlin=true,mad_gremlin=true,lagavulin=true,guardian=true,
    shelled_parasite=true,snecko=true,automaton=true}
-- Ground clearance in the fixed official layout before the contact change.
local hoveringBottom={sentry=-26,hexaghost=-26,spheric_guardian=-26,book_of_stabbing=-68/3,bronze_orb=-26}
local expected={
    looter=112030,
    guardian=112046,
    raven_adept=112022,
    jaw_worm=112038,
    red_louse=112013,
    green_louse=112014,
    acid_slime_s=112009,
    acid_slime_m=112009,
    acid_slime_l=112010,
    spike_slime_s=112007,
    spike_slime_m=112007,
    spike_slime_l=112008,
    blue_guard=112031,
    red_guard=112050,
    fungi_beast=112033,
    mad_gremlin=112022,
    sneaky_gremlin=112025,
    fat_gremlin=112023,
    wizard_gremlin=112024,
    shield_gremlin=112025,
    gremlin_nob=112037,
    lagavulin=112026,
    sentry=112027,
    hexaghost=112022,
    slime_boss=112004,
    spheric_guardian=112026,
    centurion=112017,
    mystic=112021,
    taskmaster=112031,
    book_of_stabbing=112024,
    snake_plant=112033,
    chosen=112025,
    shelled_parasite=112014,
    byrd=112065,
    snecko=112037,
    mugger=112030,
    gremlin_leader=112020,
    torch_head=112016,
    collector=112022,
    automaton=112027,
    bronze_orb=112026,
    champ=112018,
}
local function near(got,want,label)
    assert(type(got)=='number' and math.abs(got-want)<.00001,label..': '..tostring(got)..' ~= '..tostring(want))
end
local function checkControls(actor,box,g,id)
    local portrait,hit,hpHit=box:GetChild('portrait'),box:GetChild('hit'),box:GetChild('hpHit')
    local art=assert(box:GetChild('monsterArt'),id..' release native art template')
    assert(art.visible and not portrait.visible,id..' refined art must replace the native fallback image')
    near(box.x,g.x,id..' root X');near(box.y,g.y,id..' root Y')
    near(portrait.sizeDeltaY,g.portrait,id..' portrait size')
    near(art.x,portrait.x or 0,id..' refined art pose X');near(art.y,portrait.y or 0,id..' refined art pose Y')
    near(art:GetChild('monsterSamples').localScaleY,g.portrait/106,id..' refined art matte scale')
    near(box.x+hit.x,g.hitX,id..' target center X');near(box.y+hit.y,g.hitY,id..' target center Y')
    near(hit.sizeDeltaX,g.hitWidth,id..' target width');near(hit.sizeDeltaY,g.hitHeight,id..' target height')
    near(box.y+box:GetChild('hpFill').y,g.y+g.healthY,id..' health bar Y')
    assert(hpHit.visible,id..' health target visibility')
    near(hpHit.y,box:GetChild('hpFill').y,id..' health target Y')
    near(box:GetChild('intentIcon').y,g.intentY,id..' intent Y')
    assert(g.intentY>g.hitY+g.hitHeight/2-g.y,id..' intent must clear target top')
    local powers=assert(PowerSurfaces.get(box:GetChild('statusRow')))
    for _,entry in ipairs(C.statusView(actor))do
        local power=assert(powers:find(entry.id),id..' missing status '..entry.id)
        local powerHit=power:GetChild('hit')
        assert(power.visible and powerHit.visible and power.y+powerHit.y<hpHit.y,id..' status target must stay below health')
    end
end
local function checkGround(actor,box)
    local id=actor.definitionId
    local g=EnemyView.geometry(actor,true)
    checkControls(actor,box,g,id)
    local row=soleRows[id]
    local expectedPads=row and (bakedShadows[id] and 0 or twoShadows[id] and 2 or 1) or 0
    assert(#(g.footprints or {})==expectedPads,id..' runtime shadow count')
    for index,name in ipairs({'plate','border'})do
        assert(box:GetChild(name).visible==(index<=expectedPads),id..' rendered shadow visibility '..name)
    end
    if row then
        local source=SourceGeometry.resolve(actor)
        local depthY=-112+source.y*7/30
        local hitBottom=depthY+math.min(0,source.hbY*g.portrait/math.max(source.width,source.height))
        local art=box:GetChild('monsterArt')
        near(box.y+art.y-art:GetChild('monsterSamples').localScaleY*row,depthY,id..' measured sole world Y')
        near(g.y+assert(g.groundY,id..' explicit contact'),depthY,id..' shadow contact plane')
        near(g.hitY-g.hitHeight/2,hitBottom,id..' contact-relative target bottom')
        near(g.y+g.healthY,hitBottom-20,id..' contact-relative health Y')
        for index=1,expectedPads do
            local shadow=box:GetChild(index==1 and 'plate' or 'border')
            near(box.y+shadow.y,depthY-1,id..' rendered shadow world Y')
        end
    else
        assert(not g.groundY and not g.footprints,id..' altitude must stay free of ground contact')
        if id=='collector' then
            near(box.x,360,id..' pose X');near(box.y,164.5,id..' pose Y')
            near(box:GetChild('hit').y+box.y,143.884615384615,id..' world target Y')
            near(box:GetChild('hpFill').y+box.y,31.384615384615,id..' world HP Y')
            near(box:GetChild('intentIcon').y+box.y,289,id..' world intent Y')
        elseif not actor.sourcePosition then
            near(g.y-g.portrait/2,hoveringBottom[id] or -26,id..' original altitude')
        end
    end
end
local function recordScene(scene)
    local data=require('abyss_chapter_battle_scene_data')
    local slots,writes={},0
    local function track(control,method)
        local original=assert(control[method],method)
        control[method]=function(self,...)
            writes=writes+1
            return original(self,...)
        end
    end
    local function fill()writes=writes+1 end
    track(scene,'SetVisible')
    for _,batch in pairs(scene.children)do
        for name,slot in pairs(batch.children)do
            local index=tonumber(name:match('%d+'))
            slots[index]=slot
            slot.imageId=(data.rows[1][index] or data.rows[2][index])[1]
            slot.SetFillHorizontal,slot.SetFillUnused=fill,fill
            for _,method in ipairs({'SetImage','SetVisible','SetPivot','SetLocalScale','SetLocalRotation','SetSizeDelta','SetAnchoredPosition'})do
                track(slot,method)
            end
        end
    end
    return {slots=slots,rows=data.rows,writes=function()return writes end}
end
local function setupRelease()
    local data=require('abyss_monster_art_data')
    assert(data.status=='refined-release')
    local api=F.monsterActors()
    local instantiate=api.instantiate
    local tiers={'AbyssMonsterActor41','AbyssMonsterActor96','AbyssMonsterActor115'}
    local capacityIndex={[41]=4,[96]=5,[115]=6}
    api.templateIndexByDefinition={}
    for id,key in pairs(data.bindings)do api.templateIndexByDefinition[id]=assert(capacityIndex[data.assets[key].capacity])end
    local serial=0
    api.instantiate=function(index,parent)
        if index<4 then return instantiate(index,parent)end
        local spec=assert(F.Templates[tiers[index-3]])
        local box=F.control(spec,parent)
        serial=serial+1
        parent.children['refinedActor'..serial]=box
        return box
    end
    local root=F.Viewport.apply(F.control({children=F.Layout}),1280,720)
    local panel=root:GetChild('battlePanel')
    local scene=recordScene(panel:GetChild('chapterBattleScene'))
    local host=F.GameUI.new(root,F.Data,F.Presentation,'click',{seed=1,prologue=false,imageSource='static',
        color=function(r,g,b,a)return {r=r,g=g,b=b,a=a}end,monsterActors=api,imageFillRight=3})
    root.ui=host
    assert(F.start(host));assert(Run.startCombat(host.run,'raven_adept_solo'))
    return host,host.battleUI,panel,scene
end
local setup=ground and setupRelease or H.setup
local host,_,panel,scene=setup({'defend'},{'raven_adept'})
local catalog=host.run.combat.catalog.enemies
local ids={}
for _,definition in ipairs(F.Data.enemies.enemies)do ids[#ids+1]=definition.id end
for _,module in ipairs({'abyss_act1_bosses','abyss_act2_enemies'})do
    for _,definition in ipairs(require(module).enemies)do ids[#ids+1]=definition.id end
end
assert(#ids==42,'all two-act definitions including bosses and summons')
if ground then
    local classification=assert(ground.classification,'refined chapter release requires explicit stance for all 42 monsters')
    for _,id in ipairs(ids)do
        local class=soleRows[id] and 'grounded' or hoveringBottom[id] and 'hovering'
            or id=='byrd' and 'flight' or id=='collector' and 'perched'
        assert(class and classification[id]==class,id..' must have its authored stance')
        if soleRows[id] then near(ground.feet[id],soleRows[id]/106,id..' authored sole row')
        else assert(ground.feet[id]==nil and ground.footprints[id]==nil,id..' must not use a static contact')end
    end
    local total=0
    for _ in pairs(classification)do total=total+1 end
    assert(total==#ids,'stance keys match the exact 42-monster roster')
end
local seen={}
for first=1,#ids,5 do
    local members={}
    for i=first,math.min(first+4,#ids)do
        local id=ids[i]
        assert(not seen[id] and expected[id] and catalog[id],id)
        seen[id]=true
        assert(type(Theme.icon.enemy[id])=='number' and Theme.icon.enemy[id]==expected[id],id..' exact native lookup')
        members[#members+1]=id
    end
    host.run.combat=C.new(F.Data,{deck={'defend'},enemies=members})
    host:refresh()
    for slot,id in ipairs(members)do
        local box=monsterControl(panel,'enemy'..slot)
        assert(box.visible and box:GetChild('portrait').imageId==expected[id],id..' real battle SetImage')
        if ground then checkGround(host.run.combat.enemies[slot],box)end
    end
end
local count=0;for id in pairs(expected)do assert(seen[id],id);count=count+1 end
assert(count==42)
local function checkCollectorScene()
    local run=host.run
    run.floor,run.act,run.encounters=33,2,EncounterQueue.new(run.runSeed,2)
    local function startBoss(name,encounterId)
        run.phase,run.nodeFlow='map',nil
        run.bossInitialization={profile='source-history',bossList={name}}
        assert(Run.startRoomCombat(run,'boss'))
        assert(run.encounterId==encounterId)
        host:refresh()
    end
    local function checkScene(index)
        for i,row in ipairs(scene.rows[index])do
            local slot=scene.slots[i]
            assert(slot.visible==not not row,'chapter slot visibility '..i)
            if row then
                assert(slot.imageId==row[1],'chapter slot image '..i)
                near(slot.x,row[2],'chapter slot X '..i);near(slot.y,row[3],'chapter slot Y '..i)
                near(slot.sizeDeltaX,row[4],'chapter slot width '..i);near(slot.sizeDeltaY,row[5],'chapter slot height '..i)
                local color=slot.imageColor
                assert(color.r==row[12] and color.g==row[13] and color.b==row[14] and color.a==row[15],'chapter slot tint '..i)
            end
        end
    end
    assert(#scene.slots==250,'Collector must reuse the bounded chapter pool')
    startBoss('Automaton','act2_automaton');checkScene(2)
    startBoss('Collector','act2_collector');checkScene(3)
    local collector=run.combat.enemies[1]
    checkGround(collector,monsterControl(panel,'enemy1'))
    local writes=scene.writes()
    host:refresh();host:update(.05)
    assert(scene.writes()==writes,'Collector refresh/tick repeats no chapter writes')
    Summons.torches(C,run.combat,collector,false);host:refresh()
    assert(run.combat.enemies[3]==collector and scene.writes()==writes,'summon reordering keeps the existing throne')
    collector.hp=0;host:refresh()
    assert(scene.writes()==writes,'Collector death keeps its throne for the rest of the encounter')
    startBoss('Automaton','act2_automaton');checkScene(2)
    assert(scene.writes()>writes,'next Act II encounter repaints the ordinary arena')
    writes=scene.writes();host:refresh()
    assert(scene.writes()==writes,'ordinary Act II refresh also repeats no chapter writes')
end
-- Boss summons exercise the move-specific constructors and source insertion order.
for _,scenario in ipairs({
    {{'collector'},function(battle)Summons.torches(C,battle,battle.enemies[1],false)end,
        {{'torch_head',-470,0},{'torch_head',-285,0},{'collector'}}},
    {{'automaton'},function(battle)Summons.bronze(C,battle)end,
        {{'bronze_orb',-300,200},{'automaton'},{'bronze_orb',200,130}}},
    {{'mad_gremlin','sneaky_gremlin','gremlin_leader'},function(battle)
        C.summonEnemies(battle,{{id='wizard_gremlin',x=200,y=12}})
    end,{{'mad_gremlin'},{'sneaky_gremlin'},{'gremlin_leader'},{'wizard_gremlin',200,12}}},
})do
    local members,summon,formation=table.unpack(scenario)
    local battle=C.new(F.Data,{deck={'defend'},enemies=members})
    host.run.combat=battle
    summon(battle)
    host:refresh()
    assert(#battle.enemies==#formation,members[#members]..' summoned count')
    for i,want in ipairs(formation)do
        local id,x,y=table.unpack(want)
        local enemy=battle.enemies[i]
        local box=monsterControl(panel,'enemy'..i)
        assert(enemy.definitionId==id,id..' summoned display order')
        assert(box:GetChild('portrait').imageId==expected[id],id..' summoned SetImage')
        if x then assert(enemy.sourcePosition.x==x and enemy.sourcePosition.y==y,id..' summon constructor offsets')end
        if ground then checkGround(enemy,box)end
        if ground and id=='bronze_orb' then
            local art=box:GetChild('monsterArt')
            near(box.y+art.y-art:GetChild('monsterSamples').localScaleY*53,-26+y*2/3,id..' airborne summon depth')
        end
    end
end
if ground then
    -- Fixed MonsterHelper offsets and deterministic colors/gremlin draws.
    for _,formation in ipairs({
        {'2 Louse',{true,true},{},{'red_louse','red_louse'},{10,30}},
        {'2 Louse',{true,false},{},{'red_louse','green_louse'},{10,30}},
        {'Gremlin Gang',{},{7,4,0,4},{'wizard_gremlin','fat_gremlin','mad_gremlin','shield_gremlin'},{25,-12,-35,40}},
    })do
        local color,pick=0,0
        local boundary={misc={boolean=function()color=color+1;return formation[2][color]end,
            integer=function()pick=pick+1;return formation[3][pick]end}}
        local battle=C.new(F.Data,{deck={'defend'},sourceEncounter=formation[1],encounterBoundary=boundary})
        host.run.combat=battle
        host:refresh()
        for slot,id in ipairs(formation[4])do
            local actor=battle.enemies[slot]
            assert(actor.definitionId==id and actor.sourcePosition.y==formation[5][slot],formation[1]..' original slot '..slot)
            local box=monsterControl(panel,'enemy'..slot)
            checkGround(actor,box)
            local art=box:GetChild('monsterArt')
            near(box.y+art.y-art:GetChild('monsterSamples').localScaleY*soleRows[id],-112+formation[5][slot]*7/30,
                formation[1]..' rendered formation depth')
        end
    end
    checkCollectorScene()
    print('LUA_RELEASE_ENEMY_CONTACT_PASS 42 classes + measured geometry + formations + summons')
end
-- Missing portrait mappings keep the tier fallback on a legal source actor.
-- An unknown combat definition has no constructor geometry to render.
local raven_adeptImage=Theme.icon.enemy.raven_adept
Theme.icon.enemy.raven_adept=nil
for _,tier in ipairs({'normal','elite','boss'})do
    local battle=C.new(F.Data,{deck={'defend'},enemies={'raven_adept'}})
    battle.enemies[1].tier=tier
    host.run.combat=battle;host:refresh()
    assert(monsterControl(panel,'enemy1'):GetChild('portrait').imageId==Theme.icon.node[tier=='normal' and 'combat' or tier],tier..' fallback')
end
Theme.icon.enemy.raven_adept=raven_adeptImage
assert(Theme.icon.enemy.verify==true,'device verification remains pending')
print('LUA_NATIVE_ENEMY_PORTRAITS_PASS 42 + summons + unknown fallbacks')
