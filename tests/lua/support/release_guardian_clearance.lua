-- Generated Release UI and production writers, with native controls mocked by the shared fixture.
local F=dofile('tests/lua/support/game_ui_fixture.lua')
local Theme=F.Theme
local Combat=F.Combat
local Actors=require('abyss_actor')
local Surfaces=require('abyss_monster_surfaces')
local PowerSurfaces=require('abyss_monster_power_surfaces')
local Guardian=require('abyss_guardian_ai')
local E=require('abyss_battle_enemy_view')
assert(require('abyss_monster_art_data').status=='refined-release')
assert(Theme.layout.enemyRow.groundContact,'missing Release contact layout')

local touch=false
local cursor={CursorEnter='enter',CursorExit='exit',CursorDown='down',CursorUp='up',CursorDrag='drag',CursorEndDrag='endDrag'}
local host,root=F.fixture(nil,nil,nil,cursor,nil,nil,{touchScreen=function()return touch end})
assert(F.start(host))
local panel=root:GetChild('battlePanel')
local function bounds(card)
    local rotation=card.localRotationZ*math.pi/180
    local sin,cos=math.sin(rotation),math.cos(rotation)
    local scale=card.localScaleY
    local w,h=table.unpack(Theme.layout.card.size)
    local top=card.y+(w*math.abs(sin)+h*math.abs(cos))*scale/2
    local hit=card:GetChild('hit')
    local hitTop=card.y+scale*(sin*hit.x+cos*hit.y+hit.sizeDeltaY/2)
    return top,hitTop
end
local function checkPower(actor,id)
    local box=assert(Surfaces.get(panel):find(actor.id))
    local power=assert(PowerSurfaces.get(box:GetChild('statusRow')):find(id))
    local icon,count,hit=power:GetChild('icon'),power:GetChild('count'),power:GetChild('hit')
    assert(power.visible and icon.visible and count.visible and hit.visible,'Guardian power must be rendered with its amount and receiver')
    assert(tonumber(count.text)==actor.statuses[id],'Guardian power lost its real amount')
    local y=box.y+power.y
    local bottom=math.min(y+icon.y-icon.sizeDeltaY/2,y+count.y+count.sizeDeltaY/2-Theme.font.small*1.2,
        y+hit.y-hit.sizeDeltaY/2)
    local hand,receiver=-math.huge,-math.huge
    for i=1,5 do
        local card=panel:GetChild('card'..i)
        local _,restY,restAngle=F.Viewport.handSlot(5,i-1,host.battleUI.handWidthExtra)
        assert(card.y==restY and card.localRotationZ==restAngle and card.localScaleY==1,'hand has not reached its resting pose')
        local visualTop,hitTop=bounds(card)
        hand,receiver=math.max(hand,visualTop),math.max(receiver,hitTop)
    end
    print(string.format('GUARDIAN_CLEARANCE %s %s hand=%.3f receiver=%.3f power=%.3f',
        touch and 'touch' or 'mouse',id,hand,receiver,bottom))
    assert(bottom>hand,'resting Release hand covers Guardian '..id)
    assert(bottom>receiver,'resting Release card receiver covers Guardian '..id)
    if touch then
        local event={touchId=90}
        hit.listeners.down(event);hit.listeners.up(event);hit.listeners.click(event)
    else hit.listeners.enter() end
    local info=assert(host.battleUI.info,'Guardian status reader did not open')
    assert(info.statusId==id and info.source==hit and info.transient==not touch)
    if touch then panel:GetChild('statusDismiss').click({touchId=91}) else hit.listeners.exit() end
    assert(not host.battleUI.info)
    return bottom
end

local function checkCardInput(battle,guardian,width,height)
    local slot=1
    while battle.hand[slot].cardId~='strike' do slot=slot+1 end
    local card=panel:GetChild('card'..slot)
    local hit=card:GetChild('hit')
    local function at(x,y)
        return {touchId=7,GetUIPos=function()return width/2+x,height/2+y end}
    end
    local uid=battle.hand[slot].uid
    local function press()
        local event=at(card.x,card.y+35)
        hit.listeners.down(event)
        return event
    end
    local event=press()
    hit.listeners.up(event);hit.listeners.click(event)
    host:update(.5)
    assert(host.battleUI.selected==uid and card.localScaleY==Theme.motion.hoverScale,'tap did not select and raise the card')
    assert(host.battleUI:cancelAim())
    host:update(.5)
    assert(not host.battleUI.selected and card.localScaleY==1,'cancel did not restore the idle pose')

    press()
    local g=E.geometry(guardian)
    local target=at(g.hitX,g.hitY)
    hit.listeners.drag(target)
    -- Captured release is delivered by the same full-battle layer used on device.
    panel:GetChild('dragLayer'):GetChild('hit').listeners.up(target)
    assert(battle.energy==2 and #battle.hand==4,'physical drag did not play the selected Strike once')
end

for _,mobile in ipairs({false,true}) do
    touch=mobile
    local width,height=mobile and 1560 or 1280,720
    root:SetSizeDelta(width,height);host:resize(width,height)
    local battle=Combat.new(F.Data,{enemies={'guardian'},deck={'strike','defend','strike','defend','bash'},seed=42})
    assert(#battle.hand==5)
    host.run.phase,host.run.combat='combat',battle
    host:refresh();host:update(.8);host:update(.8)
    local guardian=battle.enemies[1]
    local before=E.geometry(guardian)
    local bottom=checkPower(guardian,'mode_shift')
    if not touch then
        local card=panel:GetChild('card4')
        card:GetChild('hit').listeners.enter()
        host:update(.5)
        assert(host.battleUI.hover==4 and bounds(card)>bottom,'desktop focus lost the raised card pose')
        card:GetChild('hit').listeners.exit();host:update(.5)
    end
    local hp=guardian.hp
    guardian.hp=hp-guardian.statuses.mode_shift
    Guardian.hpLost(battle,guardian,hp);Guardian.flush(battle,guardian)
    assert(guardian.aiPhase=='defense' and guardian.statuses.mode_shift==0)
    Actors.addStatus(guardian,'sharp_hide',3)
    host:refresh();host:update(.8);host:update(.8)
    local after=E.geometry(guardian)
    assert(before.x==after.x and before.y==after.y and before.groundY==after.groundY)
    assert(before.hitHeight>after.hitHeight,'Guardian form did not resize the target')
    checkPower(guardian,'sharp_hide')
    checkCardInput(battle,guardian,width,height)
    for _=1,80 do host:update(.05)end
end
host:disable()
print('RELEASE_GUARDIAN_CLEARANCE_PASS')
