local NativeContract = dofile('tests/lua/support/native_ui_contract.lua')
-- Real Run/Map/Nodes and generated native controls; no gameplay rules are mocked.
package.path = "src/lua/?.lua;build/lua/?.lua;" .. package.path
local UI, Nodes = require("abyss_node_ui"), require("abyss_nodes")
local Run, Map, Combat = require("abyss_run"), require("abyss_map"), require("abyss_combat")
local Data, Layout, Presentation = require("abyss_data"), require("abyss_ui_layout"), require("abyss_presentation")
local cursor = {CursorEnter="enter", CursorExit="exit", CursorDown="down", CursorUp="up", CursorEndDrag="endDrag", CursorDrag="drag"}
local function control(spec, parent, writes)
    local box = {parent=parent, visible=spec.visible~=false, children={}, listeners={},
        x=(spec.position or {})[1] or 0,y=(spec.position or {})[2] or 0,
        size=spec.size,scale={1,1,1}}
    function box:GetChild(key) return self.children[key] end
    function box:SetVisible(value) self.visible=value end
    function box:SetSizeDelta(width,height) NativeContract.sizeDelta(width,height);
        self.size={width,height};self.sizeDeltaX,self.sizeDeltaY=width,height
    end
    function box:SetLocalScale(x,y,z) self.scale={x,y,z} end
    function box:SetAnchoredPosition(x,y)
        writes[self]=(writes[self] or 0)+1
        self.x,self.y=x,y
    end
    function box:AddCursorEventListener(event, fn) NativeContract.listener(event,fn);
        assert(not self.listeners[event], "duplicate listener") self.listeners[event]=fn
    end
    for _, child in ipairs(spec.children or {}) do box.children[child.name]=control(child,box,writes) end
    return box
end
local function setup(touchScreen)
    local run,map=Run.new(Data,42),Map.generate(Data,42)
    -- Frozen independent relic stream used by the existing membership-card fixture.
    run.relicPool=require('abyss_relic_pool').new('2',run.data.relicSource)
    while not run.nodeFlow do
        local choices=Map.available(map) assert(#choices>0)
        for _,node in ipairs(choices) do
            if node.type=="shop" then assert(Nodes.enter(run,map,node.id)) break end
        end
        if not run.nodeFlow then assert(Map.choose(map,choices[1].id)) end
    end
    run.gold=10000 -- funding fixture only; original cards, prices and rules are unchanged
    local function find(list)
        for _,spec in ipairs(list) do
            if spec.name=="nodePanel" then return spec end
            local found=spec.children and find(spec.children) if found then return found end
        end
    end
    local writes={}
    local root=control(assert(find(Layout)),nil,writes)
    local ui=UI.new(root,run,map,Presentation,"click",nil,{cursorEvents=cursor,color=function(r,g,b,a)return {r=r,g=g,b=b,a=a}end,touchScreen=function() return touchScreen==true end})
    ui:setVisible(true)
    local function get(key)
        local box=root for part in key:gmatch("[^/]+") do box=assert(box:GetChild(part),key) end
        return box
    end
    local function emit(key,event,id,payload)
        local fn=get(key.."/hit").listeners[event]
        if fn then
            if payload=="nil" then return fn() end
            if payload=="empty" then return fn({}) end
            return fn({touchId=id})
        end
    end
    local function tap(key,id,payload)
        local box=get(key) while box do assert(box.visible,"hidden physical target "..key) box=box.parent end
        emit(key,"down",id) emit(key,"up",id) return emit(key,"click",id,payload)
    end
    local function picker()
        assert(tap("shopView/removal",22)) assert(tap("pickerView/card1",22))
        assert(ui.mode=="picker" and ui.selected)
    end
    return ui,get,emit,tap,picker,run,writes
end

for _,mobile in ipairs({false,true}) do
 local ui,get,emit,tap,picker,run,writes=setup(mobile)
 assert(get('shopRoom').visible and not get('shopView').visible,'enter shop must show scene before goods')
 assert(not ui.actions['shopView/card1'] and not writes[get('shopView/card1')],'hidden goods were rendered on room entry')
 local gold=run.gold
 assert(not ui:press('shopView/card1') and run.gold==gold,'hidden goods accepted purchase')
 assert(get('merchant').visible and get('merchant/talk').visible)
 emit('merchant/talk','down',99);ui:setVisible(false);ui:setVisible(true)
 emit('merchant/talk','up',99)
 assert(not emit('merchant/talk','click',99),'stale merchant tap survived hide/show')
 emit('merchant/talk','down',11)
 for _,event in ipairs({'up','drag','endDrag','exit'})do emit('merchant/talk',event,12) end
 emit('merchant/talk','up',11)
 for _,event in ipairs({'drag','endDrag','exit'})do emit('merchant/talk',event,12) end
 assert(not emit('merchant/talk','click',12),'foreign click accepted')
 assert(emit('merchant/talk','click',11),'foreign event swallowed the valid merchant click')
 assert(not get('shopView').visible and ui.shopBusy,'cold click must leave the complete room up while the shelf is staged')
 assert(get('shopRoom').visible and not get('merchant/talk').visible)
 assert(not ui:press('shopView/card1'),'transition accepted purchase')
 assert(not emit('merchant/talk','click'),'repeat open accepted')
 for _=1,7 do
    ui:update(1/30)
    assert(not get('shopView').visible and get('shopRoom').visible,'partially filled shelf became visible')
 end
 ui:update(1/30)
 assert(get('shopView').visible and get('shopView').y>300)
 local cardWrites=writes[get('shopView/card1')]
 ui:update(.15)
 assert(get('shopView').y>0 and get('shopView').y<300)
 ui:update(.16)
 assert(get('shopView').y==0 and not get('shopRoom').visible)
 assert(writes[get('shopView/card1')]==cardWrites,'shelf animation re-rendered a card')
 local offer=run.nodeFlow.cards[1]
 assert(tap('shopView/card1') and tap('confirm'))
 assert(run.gold==gold-offer.price and run.nodeFlow.cards[1].sold)
 assert(get('merchant/line').text=='谢啦！' and get('merchant/bubble').visible)
 ui:update(3)
 assert(not get('merchant/bubble').visible)
 ui:update(20)
 assert(not get('merchant/bubble').visible,'unprompted idle dialogue returned')
 picker();assert(tap('confirm'));assert(ui.mode=='main')
 assert(tap('back'));assert(not run.nodeFlow.complete and get('shopRoom').visible)
 assert(not tap('back'),'repeat exit accepted')
 ui:update(.31);assert(run.nodeFlow.complete)
 assert(not get('shopView').visible)
end
print('SHOP_ENTRY_PASS mouse/touch scene, parent motion, lock, buy, purge, exit')
