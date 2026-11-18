local F=dofile('tests/lua/support/hand_layout_values_fixture.lua')
local Theme=require('abyss_theme')
local apply=F.upvalue(require('abyss_battle_card_view').new,'applyHandPose')
local values=F.upvalue(apply,'handValues')
local canvas,size=Theme.canvas.base,Theme.layout.card.size
local count=0
for _,dimensions in ipairs({{1280,720},{1600,900},{1920,1080}})do
 Theme.canvas.base=dimensions
 for _,card in ipairs({size,{128,192},{150,210}})do
  Theme.layout.card.size=card
  for _,angle in ipairs({-45,0,32})do for _,scale in ipairs({.16,1,1.4})do
   for _,width in ipairs({false,72,220})do
    local pose={x=137,y=-259,scale=scale,angle=angle/2}
    local target={restAngle=angle,baseY=-320,hitWidth=width or nil}
    local expected=F.reference(pose,target)
    local actual={values(pose,target)}
    assert(#actual==8 and type(actual[1])=='number','hand values still allocate a return tuple')
    for i=1,8 do assert(actual[i]==expected[i],'hand geometry scalar changed: '..i)end
    count=count+1
   end
  end end
 end
end
Theme.canvas.base,Theme.layout.card.size=canvas,size
print('HAND_LAYOUT_VALUES_PASS variants='..count)
