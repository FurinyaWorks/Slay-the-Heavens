-- Isolated software probe using the exact generated default layout.
local F=dofile('tests/lua/support/game_ui_fixture.lua')
local function check(case)
 local canvas=F.control({children=F.Layout})
 local root,scale=F.Viewport.apply(canvas,case[2],case[3])
 local ui=F.GameUI.new(root,F.Data,F.Presentation,'click',{
   seed=1,touchScreen=function() return case[4] end,imageSource='static',
   color=function(r,g,b,a) return {r=r,g=g,b=b,a=a} end,
 })
 root.ui=ui
 local entry=root:GetChild('exitEntry')
 local hit=entry:GetChild('open'):GetChild('hit')
 for _,variant in ipairs({'normal','hover','pressed','disabled'}) do
    local state=assert(hit:GetChild(variant))
    assert(not state:GetChild('label').visible)
    assert(not state:GetChild('officialBattleHud'))
    for i=1,3 do
        local stroke=assert(state:GetChild('menuStroke'..i))
        assert(stroke.visible and (stroke.sizeDeltaX == 14 and stroke.sizeDeltaY == 1))
    end
 end
 local function openAndResume(page)
    assert(ui.mode==page and entry.visible and hit.interactable)
    local current=ui.run
    assert(F.click(root,'exitEntry','open'))
    assert(ui.menuOpen and root:GetChild('runMenu').visible and not entry.visible)
    assert(F.click(root,'runMenu','resume'))
    assert(not ui.menuOpen and entry.visible and ui.run==current and ui.mode==page)
 end
 openAndResume('menu')
 assert(F.start(ui) and ui.mode=='map' and ui.run)
 openAndResume('map')
 assert(F.click(root,'mapPanel','node1') and ui.mode=='battle')
 openAndResume('battle')
 print(('PASS %s scale=%.4f three menu strokes and click/cancel on menu, map, battle'):format(case[1],scale))
end
check({'PC Host',1920,1080,false})
check({'phone-size Host',2556,1179,true})
