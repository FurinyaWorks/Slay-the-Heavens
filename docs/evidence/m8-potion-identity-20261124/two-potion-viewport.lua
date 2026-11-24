require('abyss_theme');require('abyss_data');require('abyss_ui_layout');require('abyss_ui_templates');require('abyss_presentation')
local T=require('abyss_theme');assert(T.presentationProfile=='official-assets-first')
local H=assert(loadfile('tests/lua/support/mobile_run_hud_geometry.lua'))('helpers')
local Run=require('abyss_run')
local h,root,pic,screen=H.create(true,{nativePageLifecycle=true})
assert(Run.startCombat(h.run,'raven_adept_solo'));h:refresh();h:update(1)
h.run.potionSlots=3; h.run.potions={[1]='fairy_in_a_bottle',[2]='entropic_brew'}
h:refresh()
local scale=screen[2]/720
local function near(a,b)assert(math.abs(a-b)<.001,tostring(a)..' != '..tostring(b))end
local function hitsAt(x,y,path)
 for _,row in ipairs(pic.hits(x,y))do if row.path==path then return true end end
 return false
end
local function tint(c)
 local a=assert(c.imageColor);return table.concat({a.r,a.g,a.b,a.a},':')
end
local refs={}
for i=1,2 do
 local path='/battlePanel/potion'..i
 local hbox,hit=pic.at(path)
 assert(hit.visible and hit.interactable)
 near(hbox.w/scale,84);near(hbox.h/scale,84)
 if refs.box then
  local gap=(hbox.x-refs.box.x-(hbox.w+refs.box.w)/2)/scale;near(gap,8)
  local x=(hbox.x+refs.box.x)/2
  assert(not hitsAt(x,hbox.y,path) and not hitsAt(x,hbox.y,'/battlePanel/potion1'),'two-slot gap steals tap')
  print('MOBILE_DESIGN_GAP '..gap)
 else refs.box=hbox end
 local _,cap=pic.at('/battlePanel/potionHelp/potionCaption'..i);assert(cap.visible==false)
 for _,state in ipairs({'normal','hover','pressed','disabled'})do
  local f=path..'/'..state
  local b,ctrl=pic.at(f..'/bottle')
  local _, label=pic.at(f..'/label'); assert(label.visible==false)
  near(b.x,hbox.x);near(b.y,hbox.y);local k=state=='pressed' and .96 or 1;near(b.w/scale,42*k);near(b.h/scale,48*k)
  assert(ctrl.visible and ctrl.imageId==111047,'not matching native bottle ID')
  local color=tint(ctrl)
  if i==1 then refs[state]=color else assert(refs[state]==color,'not same tint') end
  print(table.concat({'FACE',i,state,b.w/scale,b.h/scale,ctrl.imageId,color},'\t'))
 end
end
local popup='/battlePanel/potionHelp/potionPopup'
for i,wanted in ipairs({'瓶中精灵','熵之酿'})do
 local path='/battlePanel/potion'..i
 H.click(pic,path,60+i)
 local pb,pc=pic.at(popup)
 local _,title=pic.at(popup..'/title')
 local hb=pic.at(path);near(pb.x,hb.x)
 assert(pc.visible and title.text==wanted,'wrong selected title: '..tostring(title.text))
 print('POPUP '..i..' '..title.text)
 local _,use=pic.at(popup..'/use')
 print('CAN_USE '..i..' '..tostring(use.interactable))
 if i==1 then assert(not use.interactable) else assert(use.interactable) end
 -- Same slot closes; keep both inventory entries alive during geometry witness.
 pic.tap(hb.x,hb.y,70+i,popup..'/dismiss')
 local _,closed=pic.at(popup)
 assert(not closed.visible)
end
assert(h.run.potions[1]=='fairy_in_a_bottle' and h.run.potions[2]=='entropic_brew')
print('TWO_SLOT_OFFICIAL_PHONE_HOST_PASS')
