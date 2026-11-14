-- Execute the real view function with native sibling-order semantics, without
-- loading an unrelated historical source projection or a generated candidate.
for _,name in ipairs({'abyss_nodes','abyss_potion_discard_ui','abyss_narrative','abyss_bgm',
 'abyss_character_select_view','abyss_game_ui_menu_view','abyss_card_skin','abyss_neow_history',
 'abyss_ending_history','abyss_acts','abyss_native_pages','abyss_page_reveal'})do
 package.loaded[name]={}
end
package.loaded.abyss_numbers={integer=tostring}
package.loaded.abyss_game_ui_input={mapReturnAvailable=function()return true end}
package.loaded.abyss_game_ui_navigation_view={runMenu=function()end}
local theme={officialAssets={battleHud={deck={0,0,1},menu={0,0,1},routeBackText='返回战斗'}}}
package.loaded.abyss_theme=theme
local View=require('abyss_game_ui_view')
for _,profile in ipairs({'official-assets-first','v25-reference'})do
 theme.presentationProfile=profile
 local order={}
 local function node(name,children)
  local n={name=name,visible=true,children=children or {}}
  function n:GetChild(key)for _,c in ipairs(self.children)do if c.name==key then return c end end end
  function n:GetChildren()return self.children end
  function n:SetVisible(v)self.visible=v end
  function n:SetAnchoredPosition(x,y)self.x,self.y=x,y end
  function n:SetLocalScale(x,y,z)self.scale={x,y,z}end
  function n:SetAsLastSibling()for i,c in ipairs(order)do if c==self then table.remove(order,i);break end end;order[#order+1]=self end
  return n
 end
 local function entry(name)
  local faces={}
  for _,state in ipairs({'normal','hover','pressed','disabled'})do
   local original,overlay=node('label'),node('officialBattleHud');overlay.visible=false
   faces[#faces+1]=node(state,{original,overlay})
  end
  return node(name,{node('open',{node('hit',faces)})})
 end
 local relic,map=node('relicBar'),node('mapPanel',{node('previewBack',{node('label'),node('hit')})})
 local exit,deck,dialog,menu=entry('exitEntry'),entry('deckEntry'),node('exitPanel'),node('runMenu')
 order={relic,map,exit,deck,dialog,menu}
 local roots={relicBar=relic,mapPanel=map,exitEntry=exit,deckEntry=deck}
 local function index(n)for i,c in ipairs(order)do if c==n then return i end end end
 local self={mode='battle',routeOpen=true,deckUI={visible=false},map={},mapUI={setVisible=function()end,setNavigationEnabled=function()end}}
 local refresh=View.refreshForeground(nil,self,{},exit,function()return true end,dialog,function()return false end,
  menu,function()return true end,function(name)return roots[name]end,function()if dialog.visible then dialog:SetAsLastSibling()end end)
 for _=1,3 do
  refresh();assert(index(map)<index(relic),'map paper covered the shared relic component')
  assert(index(relic)<index(exit),'map paper covered the settings entry')
  for _,face in ipairs(exit:GetChild('open'):GetChild('hit'):GetChildren())do
   assert(face:GetChild('officialBattleHud').visible and not face:GetChild('label').visible,'settings native face was not activated')
  end
 end
 self.routeOpen=false;self.mode='map';refresh();assert(index(map)<index(relic))
 relic.visible=false;self.exitOpen=true;self.menuOpen=true
 local covered=View.refreshForeground(nil,self,{},exit,function()return false end,dialog,function()return true end,
  menu,function()return true end,function(name)return roots[name]end,function()dialog:SetAsLastSibling()end)
 covered();assert(not relic.visible and index(dialog)>index(map),'modal must retain foreground')
end
print('MOBILE_RUN_HUD_PASS 2')
