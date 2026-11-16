local _,control=dofile('tests/lua/support/node_ui_cases.lua')(math.huge,math.huge)
local UI,Run,Map,Nodes=require('abyss_node_ui'),require('abyss_run'),require('abyss_map'),require('abyss_nodes')
local data,Layout=require('abyss_data'),require('abyss_ui_layout')
local Theme,Narrative=require('abyss_theme'),require('abyss_narrative')
local function find(nodes,name)for _,n in ipairs(nodes)do if n.name==name then return n end local v=n.children and find(n.children,name);if v then return v end end end
local function setup()
 local run,map=Run.new(data,42),Map.generate(data,42)
 while not run.nodeFlow do
  local choices=Map.available(map);local chosen
  for _,node in ipairs(choices)do if node.type=='shop'then chosen=node;break end end
  if chosen then assert(Nodes.enter(run,map,chosen.id))else assert(Map.choose(map,choices[1].id))end
 end
 run.gold=10000
 local root=control(find(Layout,'nodePanel'))
 local presentation=require('abyss_character_presentation').prepare(require('abyss_presentation'),run.data)
 local ui=UI.new(root,run,map,presentation,'click',nil,{color=function(r,g,b,a)return{r=r,g=g,b=b,a=a}end,imageSource='static'})
 ui:setVisible(true)
 return ui,root
end
local ui,root=setup()
local m=ui.merchant
local line=root:GetChild('merchant'):GetChild('line')
local elapsed,last,lastText=0,nil,nil
for frame=1,2400 do
 ui:update(1/60);elapsed=frame/60
 local c=m.current
 local key=c.kind..':'..c.page
 if key~=last then
  print(string.format('PAGE %.4f %s',elapsed,key));last=key
 end
 if c.shown>=c.ends[c.page] and line.text~=lastText then
  print(string.format('FULL %.4f %s %s',elapsed,key,line.text));lastText=line.text
 end
 if c.kind=='greet' then break end
end
-- Direct component input, not native mouse/touch/controller evidence.
assert(m:tap());local c=m.current;assert(c.shown==c.ends[c.page])
print('ACCELERATE current page complete')
assert(ui:press('shopView/card1') and ui:press('confirm'))
assert(m.current.kind=='buy');print('BUY replaces greeting immediately')
ui.run.gold=0;ui:render();assert(not ui:press('shopView/card2'))
assert(m.current.kind=='poor');print('POOR replaces purchase immediately')
local beforeCurrent=m.current;local before=m.current.shown;ui:setVisible(false);ui:update(10)
assert(m.current==beforeCurrent and m.current.shown==before);print('HIDDEN preserves reading position')
ui:setVisible(true);ui:update(1/60)
assert(m.current==beforeCurrent and m.current.shown>before);print('RESUME advances same line')
