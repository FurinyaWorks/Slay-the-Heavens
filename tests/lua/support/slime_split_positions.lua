package.path='src/lua/?.lua;build/lua/?.lua;'..package.path
local H=dofile('tests/lua/support/battle_action_fixture.lua')
local finishDeath=dofile('tests/lua/support/monster_death_fixture.lua')
local checkIntent=dofile('tests/lua/support/intent_face_assertion.lua')
local Surfaces=require('abyss_monster_surfaces')
local IntentView=require('abyss_battle_intent_view')
local C=H.F.Combat

local function bounds(box)
    local hit=box:GetChild('hit')
    local center=box.x+hit.x
    return center-hit.sizeDeltaX/2,center+hit.sizeDeltaX/2
end

local function checkSplit(family, origin, withAlly, width, height, targetRight)
    local enemies={family..'_slime_l'}
    if withAlly then table.insert(enemies,1,'sneaky_gremlin') end
    local host,ui,panel,_,tap,drain=H.setup({'strike'},enemies)
    local state=host.run.combat
    local parentIndex=#enemies
    local parent=state.enemies[parentIndex]
    parent.sourcePosition=origin
    if withAlly then state.enemies[1].sourcePosition={x=-550,y=0} end
    host:resize(width,height)
    C.damage(state,state.player,parent,parent.hp-29,true)
    assert(C.intent(state,parentIndex).kind=='split')
    host:refresh()
    tap('endTurn',101)
    drain()
    finishDeath(host,ui,parent.id)
    host:refresh()

    local left,right=state.enemies[parentIndex],state.enemies[parentIndex+2]
    assert(left.definitionId==family..'_slime_m' and right.definitionId==left.definitionId)
    assert(left.id~=right.id and left.hp==29 and right.hp==29 and parent.hp==0)
    local surfaces=assert(Surfaces.get(panel))
    local leftBox,leftSlot=surfaces:find(left.id)
    local rightBox,rightSlot=surfaces:find(right.id)
    assert(leftBox and rightBox and leftBox~=rightBox and leftBox.visible and rightBox.visible)
    local leftEdge,leftEnd=bounds(leftBox)
    local rightEdge,rightEnd=bounds(rightBox)
    assert(leftEnd<rightEdge,'native split hitboxes overlap')
    assert(leftEdge>=-640 and rightEnd<=640,'split hitboxes must be within the battle canvas')
    if withAlly then
        local _,allyEnd=bounds(assert(surfaces:find(state.enemies[1].id)))
        assert(allyEnd<leftEdge,'split hitboxes must clear the surviving ally')
    end
    assert(leftBox:GetChild('hp').text=='29/29' and rightBox:GetChild('hp').text=='29/29')
    checkIntent(leftBox,IntentView.intentView(state,parentIndex))
    checkIntent(rightBox,IntentView.intentView(state,parentIndex+2))

    local x,y=0,0
    if origin then x,y=origin.x,origin.y end
    assert(left.sourcePosition.x==x-134 and right.sourcePosition.x==x+134)
    assert(left.sourcePosition.y==y and right.sourcePosition.y==y)
    assert(left.sourcePosition~=right.sourcePosition)

    tap('card1',102)
    tap('enemy'..(targetRight and rightSlot or leftSlot),103)
    drain()
    assert(left.hp==(targetRight and 29 or 23) and right.hp==(targetRight and 23 or 29),
        'a fresh attack must damage only the selected child')
end

for _,family in ipairs({'acid','spike'}) do
    checkSplit(family,nil,false,1280,720,false)
    checkSplit(family,{x=120,y=-8},true,960,720,true)
end
print('SPLIT_NATIVE_POSITIONS_PASS')
