local F=dofile('tests/lua/support/game_ui_fixture.lua')
local H=assert(loadfile('/workspace/hotfix-run-hud/tests/lua/support/mobile_run_hud_geometry.lua'))('helpers')
local Run,Map=require('abyss_run'),require('abyss_map')
local Routes=dofile('tests/lua/support/map_routes.lua')
local Layout=require('abyss_ui_layout')
local stage;for _,s in ipairs(Layout)do if s.name=='stage'then stage=s end end
local Templates=require('abyss_ui_templates')
local function encode(v)
 if type(v)=='string' then return '"'..v:gsub('[%c"\\]',function(c)return ({['"']='\\"',['\\']='\\\\',['\n']='\\n'})[c] or string.format('\\u%04x',c:byte())end)..'"'end
 if type(v)~='table'then return v==nil and 'null' or tostring(v)end
 local out={};if #v>0 then for _,x in ipairs(v)do out[#out+1]=encode(x)end;return '['..table.concat(out,',')..']'end
 for k,x in pairs(v)do out[#out+1]=encode(k)..':'..encode(x)end;return '{'..table.concat(out,',')..'}'
end
local function hex(c)return type(c)=='table' and string.format('#%02X%02X%02X%02X',c.r,c.g,c.b,c.a or 255)or c end
local function ordered(c,s)
 local rows,known={},{}
 for i,child in ipairs(s.children or {})do
  known[child.name]=true;local box=c:GetChild(child.name)
  if box then rows[#rows+1]={box=box,spec=child,order=i}end
 end
 for name,box in pairs(c.children or {})do
  if not known[name]and (name:match('^nativeActor')or name:match('^nativeBrowserCard'))then
   local spec=Templates[box.name]or {name=name,kind=box.kind,size={box.sizeDeltaX or 0,box.sizeDeltaY or 0}}
   rows[#rows+1]={box=box,spec=spec,order=10000}
  end
 end
 table.sort(rows,function(a,b)return(a.box.reviewRaised or a.order-10000)<(b.box.reviewRaised or b.order-10000)end)
 return rows
end
local scenes={}
local function capture(name,ui,root,screen,picture)
 local rows={}
 local function walk(c,s,parent,path)
  if not c or c.visible==false or c.activeInHierarchy==false then return end
  local pos=s.position or {0,0};local scale=s.scale or{1,1}
  local x=parent[1]+(c.x or pos[1])*parent[3]
  local y=parent[2]-(c.y or pos[2])*parent[4]
  local kx=parent[3]*(c.localScaleX or scale[1]);local ky=parent[4]*(c.localScaleY or scale[2])
  local size=s.size or{0,0};local w=(c.sizeDeltaX or size[1])*kx;local h=(c.sizeDeltaY or size[2])*ky
  path=path..'/'..s.name
  local kind=s.kind
  if kind=='image'or kind=='text'or kind=='cursorArea'or kind=='presetButton'then rows[#rows+1]={path=path,kind=kind,x=x,y=y,w=w,h=h,colour=hex(c.imageColor)or s.colour,image=c.imageId or s.image,opacity=s.opacity or 1,rotation=c.rotation and c.rotation[3]or s.rotation or 0,
   raycast=c.raycastTarget,content=kind=='text'and c.text or nil,fontSize=kind=='text'and s.text.fontSize*math.min(kx,ky)or nil,align=s.text and s.text.align,ink=s.text and(hex(c.fontColor)or s.text.colour),raised=c.reviewRaised}end
  for _,r in ipairs(ordered(c,s))do if s.kind~='presetButton'or r.spec.name=='normal'then walk(r.box,r.spec,{x,y,kx,ky},path)end end
 end
 walk(root,stage,{screen[1]/2,screen[2]/2,1,1},'')
 for _,row in ipairs(rows)do
  if(row.kind=='cursorArea'or row.kind=='presetButton')and row.raycast~=false then
   local hits=picture.hits(row.x,-row.y);local top=hits[#hits]
   row.receivesAtCenter=not not(top and '/stage'..top.path==row.path)
  end
 end
 local ids={};for i,id in ipairs(ui.run.relics)do ids[i]=id end
 local meta={mode=ui.mode,phase=ui.run.phase,hp=ui.run.hp,maxHp=ui.run.maxHp,gold=ui.run.gold,floor=ui.run.floor,relics=ids,potions=ui.run.potions,capacity=Run.potionCapacity(ui.run),barPage=ui.relicUI.barPage,barCapacity=ui.relicUI.barCapacity,selectedIndex=ui.relicUI.selectedIndex}
 meta.touchBoxes={}
 for _,path in ipairs({'/relicBar/slot1/hit','/relicBar/previous/hit','/relicBar/next/hit','/relicPanel/close/hit','/relicPanel/previous/hit','/relicPanel/next/hit'})do
  local ok,box=pcall(picture.at,path);if ok then meta.touchBoxes[path]=box end
 end
 scenes[#scenes+1]={name=SIDE..'-'..(screen[1]==2556 and 'phone' or'pc')..'-'..name,width=screen[1],height=screen[2],rows=rows,meta=meta}
end
local relics={'burning_blood','omamori','matryoshka','anchor','potion_belt','ancient_tea_set','lizard_tail','maw_bank','winged_greaves','nloths_mask','bag_of_preparation','happy_flower','vajra','orichalcum','pen_nib','nunchaku','horn_cleat','art_of_war','centennial_puzzle','lantern','preserved_insect','oddly_smooth_stone','strawberry','pear','mango','stone_calendar'}
for _,mobile in ipairs({false,true})do
 local ui,root,picture,screen=H.create(mobile)
 ui.run.potions={[1]='fruit_juice',[3]='fire_potion'}
 ui.run.relics={};for i=1,5 do ui.run.relics[i]=relics[i]end
 ui.run.relicCounters={omamori=0,matryoshka=2};ui:refresh()
 capture('map5',ui,root,screen,picture)
 ui.run.data.rules.events.encounterId='upgrade_shrine'
 local path=Routes.to(ui.map,function(n)return n.type=='event'end)
 for i=1,#path-1 do assert(Map.choose(ui.map,path[i]))end
 ui:refresh();assert(ui.mapUI:choose(path[#path]))
 capture('event5',ui,root,screen,picture)
 if SIDE=='after'then
  ui.run.relics={};for i=1,26 do ui.run.relics[i]=relics[i]end;ui:refresh()
  capture('event26-page1',ui,root,screen,picture)
  H.click(picture,'/relicBar/next/hit',700)
  capture('event26-page2',ui,root,screen,picture)
  H.click(picture,'/relicBar/slot1/hit',701)
  assert(ui.relicUI.selectedIndex==(mobile and 12 or 26),'physical index mismatch')
  capture('detail',ui,root,screen,picture)
  assert(ui:closeDeck());assert(ui.relicUI.barPage==2,'lost bar page')
  capture('detail-return',ui,root,screen,picture)
 end
end
print('REVIEW_VISUAL '..encode(scenes))
