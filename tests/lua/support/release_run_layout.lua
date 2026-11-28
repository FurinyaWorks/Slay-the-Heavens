local mode=...
local H=assert(loadfile('tests/lua/support/mobile_run_hud_geometry.lua'))('helpers')
local Run=require('abyss_run')
local Map=require('abyss_map')
local Theme=require('abyss_theme')
local Routes=dofile('tests/lua/support/map_routes.lua')
local opening='/nodePanel/eventView'
local battle='/battlePanel/'
local relic='/relicBar/'
local scale=1179/720

local function near(actual,expected,label)
    assert(math.abs(actual-expected)<.01,('%s: %.2f vs %.2f px'):format(label,actual,expected))
end
local function above(a,b,gap)
    return a.y-a.h/2>=b.y+b.h/2+(gap or 0)-.01
end
local function contains(outer,inner)
    return math.abs(outer.x-inner.x)+inner.w/2<=outer.w/2+.01
        and math.abs(outer.y-inner.y)+inner.h/2<=outer.h/2+.01
end
local function target(picture,path)
    local hit=picture.at(path)
    assert(hit.w/3>=44 and hit.h/3>=44,path..' below 44pt')
    return hit
end
local function reachable(picture,path)
    local hit=picture.at(path)
    for _,fraction in ipairs({-.49,0,.49})do
        local hits=picture.hits(hit.x,hit.y+hit.h*fraction)
        assert(hits[#hits] and hits[#hits].path==path,path..' is obscured')
    end
end
local function openingChoices(host,picture,screen,count,mobile)
    local bubble=picture.at(opening..'/bubble')
    local prior=bubble
    for i=1,4 do
        local base=opening..'/option'..i
        local _,row=picture.at(base)
        assert(row.visible==(i<=count),'wrong Neow row count')
        if i<=count then
            local path=base..'/hit'
            local hit=picture.at(path)
            local stageLeft=(screen[1]-screen[2]*1280/720)/2
            assert(hit.x-hit.w/2>=stageLeft and hit.x+hit.w/2<screen[1]/2+screen[2]/10,'Neow row not grouped on the left')
            local bottom=screen[2]+hit.y-hit.h/2
            local required=mobile and 21*3 or 20*screen[2]/720
            assert(bottom>=required,'Neow bottom clearance is '..bottom..'px')
            assert(above(prior,hit),'Neow options overlap the speech bubble or each other')
            if i==1 then
                local face=picture.at(base..'/stsNeowChrome')
                assert(bubble.y-bubble.h/2-(face.y+face.h/2)<=125*screen[2]/720,
                    'Neow speech is too far above its first option')
            end
            local text,caption=picture.at(base..'/stsNeowText')
            local copy=caption.text:gsub('<[^>]+>','')
            assert(contains(hit,text),'Neow caption exceeds its touch bounds')
            assert(contains(hit,picture.at(base..'/stsNeowChrome')),'Neow button face exceeds its touch bounds')
            -- A full em per codepoint overestimates mixed CJK/ASCII text width.
            assert(utf8.len(copy)*21*screen[2]/720<=text.w,'Neow caption cannot fit at readable size: '..copy)
            if mobile then target(picture,path)end
            reachable(picture,path)
            prior=hit
        end
    end
end

local function heading(picture,base,title,expected,reference)
    local path=base..title
    local text,control,spec=picture.at(path)
    assert(control.visible~=false and control.activeInHierarchy and control.text==expected,
        'wrong reward heading: '..tostring(control.text))
    local ink=control.fontColor
    if ink then
        assert(ink.r==230 and ink.g==230 and ink.b==230 and ink.a==255,
            ('%s runtime ink: %d,%d,%d,%d'):format(path,ink.r,ink.g,ink.b,ink.a))
    else
        assert(spec.text.colour=='#E6E6E6' and (spec.text.opacity or 1)==1,
            path..' generated ink: '..spec.text.colour)
    end
    local paper,material=picture.at(base..'/v25RewardPaper/paperCore')
    assert(material.visible~=false,'reward banner is hidden')
    near(text.x,paper.x,'banner/title X')
    near(text.y,paper.y,'banner/title Y')
    if reference then assert(above(reference,paper,4*scale),'reward banner covers the relic strip')end
    return paper
end

if mode=='opening-layout' then
    for _,mobile in ipairs({true,false})do
        for _,history in ipairs({0,1})do
            local host,_,picture,screen=H.create(mobile,{readNeowHistory=function()return {bossCount=history}end})
            assert(host.run.nodeFlow.event.stage=='neow_intro')
            openingChoices(host,picture,screen,1,mobile)
            H.click(picture,opening..'/option1/hit',1)
            local count=history==0 and 2 or 4
            assert(#host.run.nodeFlow.event.rewards==count)
            if count==4 then
                -- Longest combined drawback/reward wording, using the real Neow text writer.
                host.run.nodeFlow.event.rewards[3]={type='RANDOM_COLORLESS_2',drawback='CURSE'}
                host:refresh()
            end
            openingChoices(host,picture,screen,count,mobile)
            H.click(picture,opening..'/option'..(history==0 and 2 or 4)..'/hit',2)
            assert(host.run.nodeFlow.event.stage=='neow_result')
            openingChoices(host,picture,screen,1,mobile)
            H.click(picture,opening..'/option1/hit',3)
            assert(host.mode=='map')
        end
    end
elseif mode=='topbar-layout' then
    local host,_,picture=H.create(true)
    local background=picture.at('/mapPanel/officialRunBar/steel')
    assert(background.h/1179<=.125,'visible top bar takes '..background.h/1179*100 ..'% of the viewport')
    host.run.potionSlots=5
    host:refresh()
    local paths={'/mapPanel/mapRoute/hit','/deckEntry/open/hit','/exitEntry/open/hit'}
    for i=1,5 do paths[#paths+1]=H.sharedPath(i)end
    local firstRelic=target(picture,relic..'slot1/hit')
    for _,path in ipairs(paths)do
        local hit=target(picture,path)
        assert(above(hit,firstRelic,4*scale),path..' enters the relic input strip')
    end
elseif mode=='relic-layout' then
    for _,mobile in ipairs({true,false})do
        local host,_,picture,screen=H.create(mobile)
        local k=screen[2]/720
        local left=(screen[1]-1280*k)/2
        local first=picture.at(relic..'slot1/hit')
        near(first.x-first.w/2,left+(mobile and 40 or 24)*k,'first relic safe leading bound')
        local count=host.relicUI.barCapacity
        for i=1,2*count+1 do host.run.relics[i]='burning_blood'end
        host:refresh()
        H.click(picture,relic..'next/hit',1)
        local previous=picture.at(relic..'previous/hit')
        local next=picture.at(relic..'next/hit')
        assert(H.nonOverlap(previous,next) and previous.x-previous.w/2>=left
            and next.x+next.w/2<=screen[1]-left,'pagination exceeds the stage')
        for i=1,count do
            local slot=picture.at(relic..'slot'..i..'/hit')
            assert(H.nonOverlap(slot,previous) or math.abs(slot.x-previous.x)>=(slot.w+previous.w)/2-.01)
            assert(H.nonOverlap(slot,next) or math.abs(slot.x-next.x)>=(slot.w+next.w)/2-.01)
        end
        near(picture.at(relic..'slot1/hit').x,first.x,'first relic after pagination')
        H.click(picture,relic..'slot1/hit',2)
        assert(host.relicUI.selectedIndex==count+1 and host:closeDeck())
        H.click(picture,relic..'previous/hit',3)
        assert(host.relicUI.barPage==1)
    end
elseif mode=='treasure-layout' then
    for _,mobile in ipairs({true,false})do
        local host,root,picture=H.create(mobile)
        local path=Routes.to(host.map,function(n)return n.type=='treasure' and n.roomKind~='boss_treasure'end)
        for i=1,#path-1 do assert(Map.choose(host.map,path[i]))end
        host:refresh()
        assert(host.mapUI:choose(path[#path]))
        local base='/nodePanel/treasureView'
        local _,closedTitle=picture.at(base..'/page')
        assert(closedTitle.visible==false,'closed chest shows rewards')
        local closedPaper=root:GetChild('nodePanel'):GetChild('treasureView'):GetChild('v25RewardPaper')
        assert(not closedPaper or closedPaper.visible==false,'closed chest shows empty banner')
        H.click(picture,base..'/chest/hit',50)
        local motion=Theme.layout.nativeNode.roomMotion
        host.nodeUI:update(motion.shakeDuration+motion.burstDuration)
        local _,title=picture.at(base..'/page')
        assert(title.text:find('宝箱奖励',1,true),'wrong chest title')
        local limit=mobile and picture.at(relic..'slot1/hit')
        heading(picture,base,'/page',title.text,limit)
        host.nodeUI:update(2)
        heading(picture,base,'/page',title.text,limit)
        assert(host:openDeck() and host:closeDeck())
        heading(picture,base,'/page',title.text,limit)
        local note=picture.at(base..'/bossDescription')
        assert(note.y-note.h/2>=-(mobile and 1179 or 1080),'treasure note clipped at viewport bottom')
        if mobile then
            local notice=picture.at('/nodePanel/notice')
            assert(above(picture.at(relic..'slot1/hit'),notice,4*scale),'chest notice enters the relic strip')
            assert(H.nonOverlap(notice,picture.at(base..'/page')),'chest notice obscures the title')
        end
        H.click(picture,base..'/rewardItem1/hit',51)
        assert(host.run.gold>99,'chest gold claim did not resolve')
    end
else
    for _,mobile in ipairs({true,false})do
        local host,_,picture=H.create(mobile)
        local limit=mobile and picture.at(relic..'slot1/hit')
        assert(Run.startCombat(host.run,'raven_adept_solo'))
        host:refresh();host:update(1)
        for _,enemy in ipairs(host.run.combat.enemies)do enemy.hp=0 end
        host.run.combat.phase='victory';assert(Run.finishCombat(host.run));host:refresh()
        local list=battle..'rewardList'
        if mode=='reward-list-layout' then
            heading(picture,list,'/title','战斗胜利',limit)
            host:update(1)
            heading(picture,list,'/title','战斗胜利',limit)
            H.click(picture,battle..'goldReward',1)
            assert(host.run.rewards.goldClaimed)
            heading(picture,list,'/title','战斗胜利',limit)
            if mobile then
                local rewards=host.run.rewards
                rewards.goldClaimed=false
                rewards.stolenGold={type='STOLEN_GOLD',amount=30,claimed=false}
                rewards.relics={{id='vajra',sourceId='Vajra'},{id='anchor',sourceId='Anchor'}}
                rewards.emeraldKey={claimed=false}
                rewards.potion={id='fire_potion',resolved=false}
                host.run.lastResult.allEnemiesEscaped=true
                host:refresh()
                local paper=heading(picture,list,'/title','敌人已逃跑',limit)
                local previous=picture.at(list..'/subtitle')
                assert(above(paper,previous),'expanded list subtitle crosses the banner')
                for _,name in ipairs({'goldReward','stolenGold','potionHelp/relicReward1','potionHelp/relicReward2',
                    'potionHelp/emeraldKeyReward','claimPotion','cardReward'})do
                    local row,control=picture.at(battle..name)
                    assert(control.visible and above(previous,row),name..' overlaps another reward row or the header')
                    assert(row.y-row.h/2>=-1179,name..' extends below the stage')
                    previous=row
                end
            end
        else
            host:update(1)
            H.click(picture,battle..'cardReward',1)
            local pick=battle..'rewardStage'
            heading(picture,pick,'/title','选择一张卡牌',limit)
            host:update(1)
            heading(picture,pick,'/title','选择一张卡牌',limit)
            for i=1,3 do
                local card,control=picture.at(battle..'card'..i)
                assert(control.visible and above(picture.at(pick..'/subtitle'),card),'missing or occluded card '..i)
            end
            if mobile then
                local skip=target(picture,battle..'skip')
                for i=1,3 do assert(above(picture.at(battle..'card'..i),skip),'skip overlaps a card')end
                reachable(picture,battle..'skip')
            end
            H.click(picture,battle..'skip',2)
            assert(host.run.phase=='reward' and select(2,picture.at(list)).visible)
            heading(picture,list,'/title','战斗胜利',limit)
            local count=#host.run.deck
            H.click(picture,battle..'cardReward',3)
            heading(picture,pick,'/title','选择一张卡牌',limit)
            host:update(1)
            H.click(picture,battle..'card2/hit',4)
            assert(#host.run.deck==count+1 and host.run.rewards.cardResolved,'card pick did not claim exactly once')
        end
    end
end
print('RUN_HUD_PASS '..mode)
