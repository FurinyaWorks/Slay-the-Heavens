-- Deferred M17 regression attachment. Run with real generated modules and the
-- existing game_ui_fixture; this is not registered as a test before its owner lands.
local F=dofile('tests/lua/support/game_ui_fixture.lua')
local Run=require('abyss_run')
local specs=setmetatable({},{__mode='k'})
local function hydrate(c,s)
 specs[c]=s;c.x,c.y=table.unpack(s.position or{0,0})
 c.scale={table.unpack(s.scale or{1,1})};c.localScaleX,c.localScaleY=c.scale[1],c.scale[2]
 c.localRotationZ=type(s.rotation)=='number'and s.rotation or 0
 if s.text then c.fontSize=s.text.fontSize;c.minimumFontSize=s.text.minFontSize;c.adaptiveFontSize=s.text.autoSize end
 for _,part in ipairs(s.children or{})do hydrate(c:GetChild(part.name),part)end
end
local canvas=F.control({children=F.Layout})
for _,spec in ipairs(F.Layout)do hydrate(canvas:GetChild(spec.name),spec)end
local viewport={2556,1179};local root=F.Viewport.apply(canvas,table.unpack(viewport))
local battle=root:GetChild('battlePanel')
local originalDraw={battle:GetChild('drawIcon').x,battle:GetChild('drawIcon').y,
 battle:GetChild('drawIcon'):GetChild('hit').sizeDeltaX,battle:GetChild('drawIcon'):GetChild('hit').sizeDeltaY}
local platform={seed=1,imageSource='static',touchScreen=function()return M17_TOUCH end,
 color=function(r,g,b,a)return{r=r,g=g,b=b,a=a}end}
local host=F.GameUI.new(root,F.Data,F.Presentation,'click',platform);root.ui=host
assert(F.start(host));assert(Run.startCombat(host.run,'cultist_solo'));host:refresh()
local run,combat=host.run,host.run.combat
local rules={combat.energy,#combat.hand,#combat.draw,#combat.discard,#run.deck,run.hp,run.gold}
local mismatches={}
local function center(c)
 local x,y=0,0
 while c and c~=root do
  local s=c.scale or{1,1};local a=(c.localRotationZ or 0)*math.pi/180
  local px,py=x*s[1],y*s[2]
  x,y=(c.x or 0)+math.cos(a)*px-math.sin(a)*py,(c.y or 0)+math.sin(a)*px+math.cos(a)*py
  c=c.parent
 end
 return x,y
end
local function near(a,b)return math.abs(a-b)<.001 end
local function check(label)
 local ex,ey=center(battle:GetChild('energyIcon'))
 local scale=math.min(viewport[1]/1280,viewport[2]/720)
 for _,name in ipairs({'energyRing','energyDisc','energyIcon','energy'})do
  local c=battle:GetChild(name)
  if c then
   local x,y=center(c);local spec=specs[c]
   print(string.format('M17_WORLD %s %s design=%.4f,%.4f pixel=%.4f,%.4f size=%.4f,%.4f visible=%s kind=%s image=%s',
    label,name,x,y,viewport[1]/2+x*scale,viewport[2]/2-y*scale,c.sizeDeltaX,c.sizeDeltaY,tostring(c.visible),c.kind,tostring(c.imageId or spec.image)))
   if not near(x,ex)or not near(y,ey)then mismatches[#mismatches+1]=label..'/'..name end
  end
 end
 local pile=battle:GetChild('drawIcon');local hit=pile:GetChild('hit')
 local px,py=center(pile);local hx,hy=center(hit)
 assert(near(px,hx)and near(py,hy),'draw receiver must follow its actual parent')
 local glyph=pile:GetChild('nativePileMark')or pile:GetChild('glyph')
 local gx,gy=center(glyph);assert(near(px,gx)and near(py,gy),'draw glyph must stay with its actual hit')
 local expected=M17_TOUCH and M17_HAS_MOBILE and{-552,-272,88,88}or originalDraw
 assert(near(px,expected[1])and near(py,expected[2])and hit.sizeDeltaX==expected[3]and hit.sizeDeltaY==expected[4],
  'energy-only patch must not change draw position or hit dimensions')
 print(string.format('M17_DRAW %s design=%.4f,%.4f hit=%.4f,%.4f',label,hx,hy,hit.sizeDeltaX,hit.sizeDeltaY))
 assert(host.run==run and host.run.combat==combat)
 local current={combat.energy,#combat.hand,#combat.draw,#combat.discard,#run.deck,run.hp,run.gold}
 for i,value in ipairs(rules)do assert(current[i]==value,'UI geometry must preserve energy/draw/run state')end
end
check('combat')
assert(host:openMenu());assert(host:closeExit());host:refresh();check('menu-return')
assert(host:openExit());assert(host:closeExit());host:refresh();check('exit-cancel')
for _,size in ipairs({{1280,720},{2556,1179}})do
 viewport=size;F.Viewport.apply(canvas,table.unpack(size));host:resize(table.unpack(size));host:refresh();check('resize-'..size[1])
end
if M17_PATCHED then
 -- Optional decorative fields may be absent in lightweight helper trees.
 -- The mandatory energyIcon/energy paths still use their original strict lookup.
 local ring,disc=battle.children.energyRing,battle.children.energyDisc
 battle.children.energyRing,battle.children.energyDisc=nil,nil
 local ok,why=pcall(require('abyss_mobile_hud').apply,root,platform)
 battle.children.energyRing,battle.children.energyDisc=ring,disc
 assert(ok,why);check('optional-helper-restored')
end
assert(#mismatches==0,'M17_ENERGY_LAYER_RED '..table.concat(mismatches,','))
print('M17_ENERGY_LAYERS_PASS '..tostring(M17_HAS_MOBILE)..' '..tostring(M17_TOUCH))
