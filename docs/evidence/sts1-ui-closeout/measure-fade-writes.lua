local Theme=require('abyss_theme')
local counts={}
local function control(name,children)
    return setmetatable({
        GetChild=function(_,key)return children and children[key]end,
        SetVisible=function(self,value)self.visible=value end,
        SetSizeDelta=function()end, SetAnchoredPosition=function()end,
        SetAsLastSibling=function()end,AddCursorEventListener=function()end,
    },{__newindex=function(self,key,value)
        if key=='imageColor' then counts[name]=(counts[name] or 0)+1 else rawset(self,key,value)end
    end})
end
local function colour(r,g,b,a)return {r=r,g=g,b=b,a=a}end
if STS_UI_BASELINE then
    local scene={}
    for i=1,7 do scene['element'..i]=control('element')end
    local root=control('root',{fade=control('alpha'),scene=control('scene',scene),blocker=control('blocker')})
    local old=require('abyss_prologue').new(root,{color=colour,progress=function()return 4 end})
    assert(old:play(function()return true end))
    for _=1,60 do old:update(1/60)end
    assert(old.phase=='hold')
else
    local root=control('root',{veil=control('alpha'),blocker=control('blocker')})
    local ready=true
    local fade=require('abyss_page_reveal').new(root,function()return ready end,nil,nil,{color=colour,duration=Theme.motion.slow})
    local old={page='characterPanel',mode='menu',characterOpen=true}
    local next={page='mapPanel',mode='map'}
    fade:begin(old);fade:step(old,0);fade:step(old,0);fade:step(old,Theme.motion.slow)
    assert(not fade:covered())
    counts={}
    local intent=old;ready=false
    assert(fade:depart(function()intent=next;return true end))
    for _=1,60 do
        if fade:step(intent,1/60) then fade:begin(intent)end
        fade:paint(false)
    end
    assert(fade.state=='preparing' and fade.alpha==1)
end
print(('ALPHA_WRITES %d ELEMENT_WRITES %d'):format(counts.alpha or 0,counts.element or 0))
