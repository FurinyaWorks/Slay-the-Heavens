local F=dofile('tests/lua/support/game_ui_fixture.lua')
local UI,Run,Map,Combat=require('abyss_node_ui'),require('abyss_run'),require('abyss_map'),require('abyss_combat')
local function spec(name,list)
 for _,s in ipairs(list or F.Layout)do if s.name==name then return s end;local found=spec(name,s.children or{});if found then return found end end
end
local function hydrate(c,s)
 c.x,c.y=table.unpack(s.position or{0,0});c.scale=s.scale or{1,1}
 c.localRotationZ=s.rotation or 0
 if s.text then c.fontSize=s.text.fontSize;c.minimumFontSize=s.text.minFontSize;c.adaptiveFontSize=s.text.autoSize end
 for _,part in ipairs(s.children or{})do hydrate(c:GetChild(part.name),part)end
end
local function scene(id,touch)
 local source={};for k,v in pairs(F.Data)do source[k]=v end
 source.rules=Combat.copy(F.Data.rules);source.rules.events.encounterId=id
 local run,map=Run.new(source,42),Map.generate(source,42);run.hp,run.gold=41,40
 local entered=false
 for _=1,20 do
  local choices=Map.available(map)
  for _,node in ipairs(choices)do if node.type=='event'then assert(F.Nodes.enter(run,map,node.id));entered=true;break end end
  if entered then break end;assert(Map.choose(map,choices[1].id))
 end
 assert(entered)
 local s=spec('nodePanel');local root=F.control(s);hydrate(root,s)
 local ui=UI.new(root,run,map,F.Presentation,'click',nil,{touchScreen=function()return touch end,enhancedRooms=true,imageSource='static',
  cursorEvents={CursorEnter='enter',CursorExit='exit',CursorDown='down',CursorUp='up',CursorEndDrag='endDrag'},color=function(r,g,b,a)return{r=r,g=g,b=b,a=a}end})
 ui:setVisible(true)
 if id=='knowing_skull'then assert(ui:press('eventView/option1'))end
 return ui,root,run
end
local function plain(text)return(text:gsub('<[^>]+>',''))end
local function lineCount(text,font,width)
 local lines,x=1,0
 for _,code in utf8.codes(plain(text))do
  local advance=code<128 and font/2 or font
  if code==10 then lines,x=lines+1,0 elseif x+advance>width then lines,x=lines+1,advance else x=x+advance end
 end
 return lines
end
local mobile=EVENT_TOUCH and F.Theme.presentationProfile=='official-assets-first'
for _,id in ipairs({'cleric','purifier','knowing_skull'})do
 local baseline,old=scene(id,false);local ui,root,run=scene(id,EVENT_TOUCH)
 local event,prior=root:GetChild('eventView'),old:GetChild('eventView')
 assert(event:GetChild('body').text==prior:GetChild('body').text,'event body content changed')
 local body=event:GetChild('body');assert(body.fontSize==prior:GetChild('body').fontSize,'body blindly enlarged')
 local boxes={};local count=0
 for i=1,4 do
  local box,previous=event:GetChild('option'..i),prior:GetChild('option'..i)
  assert(box:GetChild('title').text==previous:GetChild('title').text,'choice content lost')
  assert(box:GetChild('description').text==previous:GetChild('description').text,'choice description lost')
  if box.visible then
   count=count+1;local hit=box:GetChild('hit');local title=box:GetChild('title')
   if mobile then
    assert(hit.kind=='cursorArea' and hit.sizeDeltaY>=88,'event hit still44')
    assert(hit.sizeDeltaY*EVENT_HEIGHT/720>=44,'event physical target below44pt reference')
    assert(title.fontSize==24 and title.minimumFontSize==24 and title.adaptiveFontSize==false)
    assert(title.sizeDeltaY+.000001>=lineCount(title.text,title.fontSize,title.sizeDeltaX)*title.fontSize*1.6+8,'full option text clips')
    local low,high=box.y-hit.sizeDeltaY/2,box.y+hit.sizeDeltaY/2
    assert(low>=-316 and high<=body.y-body.sizeDeltaY/2-8,'option overlaps body or safe edge')
    for _,a in ipairs(boxes)do assert(high+8<=a[1]or a[2]+8<=low,'88 targets overlap')end
    boxes[#boxes+1]={low,high}
   else
    assert(hit.sizeDeltaY==previous:GetChild('hit').sizeDeltaY and box.y==previous.y,'PC/legacy event geometry changed')
   end
  end
 end
 if mobile then
  assert(body.sizeDeltaY+.000001>=lineCount(body.text,body.fontSize,body.sizeDeltaX)*body.fontSize*1.6+8,'full narrative does not fit')
  assert(event:GetChild('name').x+event:GetChild('name').sizeDeltaX/2<body.x-body.sizeDeltaX/2,'heading covers narrative')
  local paper=event:GetChild('plate')
  assert(paper.y+paper.sizeDeltaY/2>=body.y+body.sizeDeltaY/2 and paper.y-paper.sizeDeltaY/2<=body.y-body.sizeDeltaY/2,'paper does not cover full body')
  assert(body.sizeDeltaY>=prior:GetChild('body').sizeDeltaY,'old long-text capacity reduced')
  if count<=3 then assert(body.sizeDeltaY==250,'short option stack lost long-text room')end
  local surface=event:GetChild('plateBorder'):GetChild('v25EventParchment');local ribbon=surface:GetChild('ribbon')
  for _,tri in ipairs(ribbon:GetChildren())do
   -- Actual right-half100003 vertices; a full image rectangle would include the masked half.
   local angle=tri.localRotationZ*math.pi/180
   for _,p in ipairs({{0,0},{tri.sizeDeltaX/2,0},{0,tri.sizeDeltaY}})do
    local px,py=p[1]*tri.scale[1],p[2]*tri.scale[2]
    local x=ribbon.x+(tri.x+math.cos(angle)*px-math.sin(angle)*py)*ribbon.scale[1]
    assert(x<=body.x-body.sizeDeltaX/2-8,'native ribbon crosses narrative first line')
   end
  end
 end
 if id=='cleric'then
  assert(utf8.len(body.text)==80 and count==3,'real80-character cleric fixture drift')
  local option=event:GetChild('option1');local text=option:GetChild('title').text
  if F.Theme.presentationProfile~='official-assets-first'then text=text..' '..option:GetChild('description').text end
  assert(utf8.len(plain(text))==35,'real35-character option fixture drift')
  local hit=event:GetChild('option1'):GetChild('hit');local e={touchId=31}
  hit.listeners.down(e)
  if mobile then assert(hit.sizeDeltaY*event:GetChild('option1').scale[2]*EVENT_HEIGHT/720>=44,'pressed hit below44pt reference')end
  hit.listeners.up(e);assert(hit.listeners.click(e))
  assert(run.hp==61 and run.gold==5,'native event command changed')
 elseif id=='knowing_skull'then assert(count==4,'real four-option fixture missing')end
 print('EVENT_READING '..id..' rows='..count..' bodyChars='..utf8.len(body.text)..' bodyLines='..lineCount(body.text,body.fontSize,body.sizeDeltaX))
end
print('MOBILE_EVENT_READING_PASS')
