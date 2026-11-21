-- Run with: PILE_BUILD=<absolute official build> luatex --luaonly tests/benchmarks/pile_browser.lua
local build=assert(os.getenv('PILE_BUILD'))
local source=os.getenv('PILE_SOURCE') or 'src/lua'
package.path=build..'/?.lua;'..source..'/?.lua;tests/lua/?.lua;'..package.path
local Fixture=dofile('tests/lua/support/game_ui_fixture.lua')
local Gate=require('abyss_page_reveal')
local Game=require('abyss_game_ui')
local Art=require('abyss_card_art_runtime')
local LuaClock=os.clock
local Combat=Fixture.Combat
local create=Game.new
local host
local function ready(intent)
    local deck=host.deckUI
    if intent.page=='deckPanel' and deck.gridReady and not deck.pending and not deck.calibrating then deck.gridReady() end
    return (intent.page~='deckPanel' or not (deck.pending or deck.calibrating or deck.pendingGrid))
        and Art.presentationReady(intent.page)
end
Game.new=function(root,data,presentation,event,platform)
    platform.presentationReady=ready
    platform.presentationPage=Art.setPresentationPage
    host=create(root,data,presentation,event,platform)
    return host
end
local function tick()
    host:update(1/60)
    Art.update()
    host.pageReveal:step(Gate.intent(host))
end
local function settle()
    for turn=1,8 do
        tick()
        if not host.pageReveal:covered() then return turn end
    end
    error('unready page')
end
local function setup(amount,kind)
    local root
    host,root=Fixture.fixture(nil,function()return true end)
    settle()
    assert(host:start())
    settle()
    assert(Fixture.confirmStart(host))
    settle()
    local run=host.run
    assert(require('abyss_run').startCombat(run,'cultist_solo'))
    local cards={}
    for i=1,amount do
        local instance=Combat.copy(run.deck[(i-1)%#run.deck+1])
        instance.uid=10000+i
        cards[i]=instance
    end
    if kind=='master' then run.deck=cards else run.combat[kind]=cards end
    host:refresh()
    settle()
    return root
end
local function timeProjection(owner,name,sample,field)
    for index=1,100 do
        local key,original=debug.getupvalue(owner,index)
        if not key then break end
        if key==name then
            debug.setupvalue(owner,index,function(...)
                local start=LuaClock()
                local first,second=original(...)
                sample[field]=sample[field]+LuaClock()-start
                return first,second
            end)
            return function()debug.setupvalue(owner,index,original)end
        end
    end
    error('missing benchmark phase '..name)
end
local function measure(samples,root,kind,action)
    local panel=root:GetChild('deckPanel')
    local grid=panel:GetChild('pileGrid')
    local cover=root:GetChild('pageReveal')
    local chrome=panel:GetChild('pileChrome')
    local deck=host.deckUI
    local rawRefresh,rawGrid=host.refresh,grid.RefreshItems
    local sample={refresh=0,grid=0,fill=0,refreshes=0,grids=0,fills=0,snapshot=0,projection=0}
    local endSnapshot=timeProjection(deck.open,'pileCards',sample,'snapshot')
    local endProjection=timeProjection(deck.open,'projectCards',sample,'projection')
    grid.flush=function(self)
        for i=0,math.min(self.itemCount,15)-1 do self:recycle(i,i+self.indexBase) end
    end
    host.refresh=function(self)
        local start=LuaClock()
        sample.refreshes=sample.refreshes+1
        rawRefresh(self)
        sample.refresh=sample.refresh+LuaClock()-start
    end
    grid.RefreshItems=function(self,n,fill)
        local start=LuaClock()
        sample.grids=sample.grids+1
        rawGrid(self,n,function(control,index)
            local before=LuaClock()
            sample.fills=sample.fills+1
            fill(control,index)
            sample.fill=sample.fill+LuaClock()-before
        end)
        sample.grid=sample.grid+LuaClock()-start
    end
    local start=LuaClock()
    local heap=collectgarbage('count')
    assert(action())
    sample.callback=LuaClock()-start
    sample.shell=panel.visible and chrome.visible and (not cover.visible or host.pageReveal.localFrame) and 0 or nil
    local function visible()
        return not host.pageReveal:covered() and not (deck.pending or deck.calibrating or deck.pendingGrid)
    end
    local turn=0
    while not visible() and turn<8 do
        tick()
        turn=turn+1
        if not sample.shell and panel.visible and chrome.visible and (not cover.visible or host.pageReveal.localFrame) then sample.shell=turn end
    end
    assert(visible(),'first viewport did not publish for '..kind)
    sample.total=LuaClock()-start
    sample.turn=turn
    sample.layout=sample.grid-sample.fill
    sample.heap=collectgarbage('count')-heap
    local cells=0
    for _ in pairs(grid.items) do cells=cells+1 end
    sample.cells=cells
    host.refresh,grid.RefreshItems=rawRefresh,rawGrid
    endSnapshot();endProjection()
    samples[#samples+1]=sample
end
local function report(kind,amount,mode,samples)
    local fields={'callback','total','refresh','grid','fill','layout','snapshot','projection','turn','shell','refreshes','grids','fills','heap','cells'}
    local row={kind,amount,mode,#samples}
    for index,field in ipairs(fields) do
        local values={}
        for _,sample in ipairs(samples) do values[#values+1]=sample[field] or -1 end
        table.sort(values)
        local scale=index<=8 and 1000 or 1
        for _,quantile in ipairs({.5,.95}) do
            row[#row+1]=string.format('%.3f',values[math.ceil(#values*quantile)]*scale)
        end
    end
    print('PILE_METRIC\t'..table.concat(row,'\t'))
end
print('PILE_FIELDS\tkind\tamount\tmode\tn\tcallback_ms\ttotal_ms\trefresh_ms\tgrid_ms\tfill_ms\tgrid_exclusive_ms\tpile_snapshot_ms\tprojection_ms\tvisible_turn\tshell_turn\thost_refreshes\tgrid_refreshes\tfill_callbacks\theap_KiB\tretained_cells (each P50,P95)')
local samples=tonumber(os.getenv('PILE_SAMPLES')) or 30
for _,kind in ipairs({'draw','discard','exhaust','master'}) do
    if not os.getenv('PILE_KIND') or os.getenv('PILE_KIND')==kind then
    for _,amount in ipairs({7,20,75,250}) do
        local cold,warm,sort={},{},{}
        for iteration=1,samples do
            local root=setup(amount,kind)
            local panel=root:GetChild('deckPanel')
            local function open()
                if kind=='master' then return host:openDeck() end
                return root:GetChild('battlePanel'):GetChild(kind..'Icon'):GetChild('hit').click()
            end
            local fields={'type','type','cost','name','name','original'}
            measure(cold,root,kind,open)
            local function close() assert(host:closeDeck());settle() end
            close()
            measure(warm,root,kind,open)
            local field=fields[(iteration-1)%#fields+1]
            local hit=panel:GetChild('pileTools'):GetChild(field):GetChild('hit')
            assert(hit.click())
            settle()
            measure(sort,root,kind,hit.click)
            close()
            if iteration%5==0 then collectgarbage('collect') end
        end
        report(kind,amount,'cold',cold)
        report(kind,amount,'warm',warm)
        report(kind,amount,'sort',sort)
    end
    end
end
