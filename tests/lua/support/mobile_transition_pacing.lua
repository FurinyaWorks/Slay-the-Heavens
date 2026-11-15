local F=dofile('tests/lua/support/game_ui_fixture.lua')
local Prologue=require('abyss_prologue')
local P=F.Theme.layout.prologue
local count=0
local function test(fn)fn();count=count+1 end
local function fixture()
 local root=F.Viewport.apply(F.control({children=F.Layout}),1280,720)
 local panel=root:GetChild('prologuePanel')
 local stage,commits=7,0
 local state=Prologue.new(panel,{color=function(r,g,b,a)return{r=r,g=g,b=b,a=a}end,
  clickEvent='click',progress=function()return stage end})
 assert(state:play(function()commits=commits+1;return true end))
 return state,panel,function(value)stage=value end,function()return commits end
end
test(function()
 local state,_,_,commits=fixture();state:update(P.fadeIn)
 state:update(20)
 assert(state.target==7 and state.lit==1 and state.phase=='hold','one blocked frame consumed all visible elements')
 for expected=2,7 do state:update(20);assert(state.lit==expected,'completed elements must remain sequential')end
 assert(state.phase=='close' and commits()==1)
 state:update(P.markOut);state:update(P.reveal);assert(not state:covering() and commits()==1)
end)
test(function()
 local state,_,stage=fixture();state:update(P.fadeIn);stage(3)
 for _=1,20 do state:update(.05)end
 assert(state.target==3 and state.lit==3 and state.phase=='hold','unfinished preparation must stay covered')
 stage(7);for _=1,60 do state:update(.05)end
 assert(not state:covering())
end)
test(function()
 local state=fixture();local elapsed=0
 while state:covering() do state:update(.01);elapsed=elapsed+.01;assert(elapsed<4,'opening did not complete')end
 assert(elapsed>=2.25 and elapsed<2.5,'requested readable opening must last about 2.3 logical seconds')
end)
test(function()
 local state,panel,_,commits=fixture();assert(state:cancel());state:update(20)
 assert(not panel.visible and commits()==0 and not state:covering(),'cancelled opening restarted work')
end)
print('MOBILE_TRANSITION_PACING_PASS '..count)
