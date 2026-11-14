local F=dofile('tests/lua/support/game_ui_fixture.lua')
local cursor={CursorDown='down',CursorUp='up',CursorExit='exit',CursorEndDrag='endDrag'}
local ui,root=F.fixture(nil,nil,nil,cursor)
assert(root:GetChild('compendiumEntries'),'missing actual generated catalogue entries')
local Host=ABYSS_COMPENDIUM_MUTANT and assert(load(ABYSS_COMPENDIUM_MUTANT,'@compendium_context_mutant'))()
    or require('abyss_compendium_host')
Host.attach(ui,root,F.Data,F.Presentation,'click',{cursorEvents=cursor})
local Run=require('abyss_run');local originalNew=Run.new
Run.new=function()error('catalogue created Run')end
local oldRandom,oldSeed=math.random,math.randomseed
math.random=function()error('catalogue consumed RNG')end
math.randomseed=function()error('catalogue reseeded RNG')end
local rng=require('abyss_sts_random');local rngFunctions={}
for key,value in pairs(rng)do if type(value)=='function'then
 rngFunctions[key]=value;rng[key]=function()error('catalogue consumed source RNG '..key)end
end end
local function hit(panel,name)return root:GetChild(panel):GetChild(name):GetChild('hit')end
local function click(panel,name)return hit(panel,name).click()end
local entries=root:GetChild('compendiumEntries')
assert(entries.visible and not ui.run and ui.mode=='menu')
local startHit=hit('menuPanel','start')
startHit.listeners.down({touchId=91});startHit.listeners.up({touchId=91})
assert(click('compendiumEntries','cards'));assert(ui:closeCompendium())
assert(not startHit.click({touchId=91}) and not ui.characterOpen and not ui.run,'old title gesture survived modal close')
local cardEntry=hit('compendiumEntries','cards')
for _,transition in ipairs({'characters','exit'})do
 cardEntry.listeners.down({touchId=92});cardEntry.listeners.up({touchId=92})
 if transition=='characters'then assert(ui:start());assert(ui:closeCharacters())
 else assert(ui:openExit());assert(ui:closeExit())end
 assert(not cardEntry.click({touchId=92}) and not ui.compendium.visible,'old entry gesture survived '..transition..' transition')
end
cardEntry.listeners.down({touchId=93});cardEntry.listeners.exit({touchId=93});cardEntry.listeners.up({touchId=93})
assert(not cardEntry.click({touchId=93}),'cancelled entry gesture activated')
for _,kind in ipairs({'cards','relics','potions'})do
 assert(click('compendiumEntries',kind),'menu entry failed '..kind)
 assert(ui.mode=='compendium' and ui.compendium.visible and ui.run==nil)
 assert(not root:GetChild('menuPanel').visible)
 assert(not root:GetChild('exitEntry').visible,'main menu gear leaked into catalogue')
 local exitOpen,menuOpen=ui.exitOpen,ui.menuOpen
 assert(not ui:openMenu() and not ui:openExit(),'catalogue allowed hidden menu modal')
 assert(not hit('exitEntry','open').click(),'stale hidden gear callback opened a modal')
 assert(ui.exitOpen==exitOpen and ui.menuOpen==menuOpen,'catalogue changed menu modal state')
 assert(not ui:start(),'old start accepted while compendium owns foreground')
 local b=ui.compendium;assert(b.selected and #b.selected.text>0)
 local total=0
 repeat
  total=total+math.min(F.Theme.layout.compendium.rows,#b.rows-(b.page-1)*F.Theme.layout.compendium.rows)
 until not b.commands.next()
 assert(total==#b.rows,'unreachable catalogue row')
 assert(ui:update(.05));assert(ui:closeCompendium())
 assert(ui.mode=='menu' and entries.visible and not ui.run)
end
assert(click('compendiumEntries','cards'))
local browser=ui.compendium
local strike
for i,row in ipairs(browser.rows)do if row.id=='strike'then strike=i end;assert(not row.definition.originalV4)end
assert(strike and browser:select(strike))
local base=browser.pages[1]
assert(browser.commands.upgrade() and browser.upgraded and browser.pages[1]~=base)
assert(browser.commands.upgrade() and not browser.upgraded and browser.pages[1]==base)
local function selectCard(id)
 for index,row in ipairs(browser.rows)do if row.id==id then assert(browser:select(index));return end end
 error('missing public preview '..id)
end
local function visibleDetail()return root:GetChild('compendiumPanel'):GetChild('detail').text end
selectCard('body_slam')
assert(visibleDetail():find('费用 1',1,true),'base printed cost is missing')
assert(browser.commands.upgrade())
assert(visibleDetail():find('费用 0',1,true),'cost-only upgrade is not visible')
selectCard('whirlwind')
assert(visibleDetail():find('费用 X',1,true),'X cost is not readable')
selectCard('dazed')
assert(visibleDetail():find('费用 不可打出',1,true),'unplayable printed cost is not readable')
local text=('中文长说明'):rep(100)
browser.rows[1].text=text;assert(browser:select(1))
local detail={visibleDetail()}
while browser.commands.detailNext()do detail[#detail+1]=visibleDetail()end
assert(table.concat(detail):sub(-#text)==text,'long detail lost text')
browser.rows[1].text=('段落\n'):rep(50);assert(browser:select(1))
assert(#browser.pages>1 and table.concat(browser.pages):sub(-#browser.rows[1].text)==browser.rows[1].text,'newline-heavy detail truncated')
-- A pointer released on a previous page or modal generation cannot activate later.
local nextHit=hit('compendiumPanel','next')
assert(browser.commands.next())
nextHit.listeners.down({touchId=7});nextHit.listeners.up({touchId=7})
assert(browser.commands.previous());local page=browser.page
assert(not nextHit.click({touchId=7}) and browser.page==page)
local close=hit('compendiumPanel','close')
close.listeners.down({touchId=8});close.listeners.up({touchId=8});assert(ui:closeCompendium())
assert(click('compendiumEntries','cards'))
assert(not close.click({touchId=8}) and browser.visible,'old close crossed modal generation')
ui:resize(1000,700);assert(not browser.visible and ui.mode=='menu')
assert(click('compendiumEntries','relics'));ui:disable()
assert(ui.disabled and not browser.visible and not entries.visible)
assert(not ui:openCompendium('cards') and ui.disabled,'catalogue revived disabled host')
assert(not browser:open('cards') and not browser.commands.next(),'destroyed browser revived')
assert(not browser:destroy(),'repeat destroy must be inert')
Run.new=originalNew;math.random,math.randomseed=oldRandom,oldSeed
for key,value in pairs(rngFunctions)do rng[key]=value end
local focus
local api={events={Confirm='confirm',Cancel='cancel'},directions={Left=1,Right=2,Up=3,Down=4},modes={Specified=1},
 getFocus=function()return focus end,setFocus=function(control)focus=control end,isController=function()return true end}
local controlled,controlledRoot=F.fixture(nil,nil,nil,cursor,nil,nil,nil,api)
Host.attach(controlled,controlledRoot,F.Data,F.Presentation,'click',{cursorEvents=cursor})
local controlledEntry=controlledRoot:GetChild('compendiumEntries'):GetChild('cards'):GetChild('hit')
focus=controlledEntry
assert(controlledEntry.navigationListeners.confirm() and controlled.compendium.visible,'controller catalogue entry failed')
controlled:update(.05)
local gear=controlledRoot:GetChild('exitEntry'):GetChild('open'):GetChild('hit')
assert(not controlled.controller:eligible(controlled.controller.byControl[gear]),'controller gear remained eligible in catalogue')
focus=gear;assert(not gear.navigationListeners.confirm() and not controlled.exitOpen,'controller gear opened hidden modal')
focus=controlledRoot:GetChild('compendiumPanel'):GetChild('close'):GetChild('hit')
assert(focus.navigationListeners.confirm() and controlled.mode=='menu','controller catalogue return failed')
controlled:disable()
print('COMPENDIUM_UI_PASS entries, full catalogue, upgrade, long text, stale pointers, resize, disable, no Run/RNG')
