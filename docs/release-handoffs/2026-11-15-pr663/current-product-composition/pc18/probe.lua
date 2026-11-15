local originalRequire=require;require=function(name)local value=originalRequire(name);return value end -- normalize Lua 5.4 loader second result to project runtime require contract
package.path='profile-matrix-695-699/repo/build/default/?.lua;profile-matrix-695-699/repo/src/lua/?.lua;'..package.path
local Theme=require('abyss_theme')
-- Narrow render dependency: exact capacity/count definitions, no combat/Host execution.
local f=assert(io.open('profile-matrix-695-699/repo/src/lua/abyss_run_potions.lua'));local source=f:read('*a');f:close()
local first=assert(source:find('    function Run.potionCapacity',1,true))
local last=assert(source:find('    function Run.obtainPotion',first,true))
local Run={};assert(load('local Run=...; '..source:sub(first,last-1)))(Run);package.loaded.abyss_run=Run
local UI=require('abyss_potion_discard_ui')
local calls=0
local function control(n,parent)
 local c={name=n.name,kind=n.kind,parent=parent,children={},visible=n.visible~=false}
 function c:GetChild(name)return self.children[name]end
 function c:SetVisible(v)self.visible=v end
 function c:SetImage(source,id)assert(source=='static' and type(id)=='number');self.imageId=id;calls=calls+1 end
 function c:SetAnchoredPosition(x,y)self.x=x;self.y=y end
 for _,v in ipairs(n.children or {})do c.children[v.name]=control(v,c)end
 return c
end
local entry=control(dofile('pc18-default-runtime-2314/entry.lua'))
local hit=entry:GetChild('open'):GetChild('hit')
local platform={imageSource='static',color=function(r,g,b,a)return {r=r,g=g,b=b,a=a}end}
local run={potions={},potionSlots=3,relics={}}
assert(Run.potionCapacity(run)==3)
local results={}
for _,id in ipairs({'fire_potion','strength_potion','flex_potion'})do
 run.potions={id};UI.refreshEntry(hit,run,platform,true)
 local b=hit:GetChild('normal'):GetChild('slot1'):GetChild('bottle')
 assert(b.visible and b.imageId==Theme.icon.potion[id])
 for _,s in ipairs({'normal','hover','pressed','disabled'})do
  local slot=hit:GetChild(s):GetChild('slot1');assert(slot:GetChild('bottleArt')==nil,'default contains no art pool')
  assert(slot:GetChild('bottle').visible)
 end
 results[id]=b.imageId
 print('DEFAULT_FALLBACK '..id..' image='..b.imageId)
end
assert(results.fire_potion==results.strength_potion and results.strength_potion==results.flex_potion,'same atlas silhouettes persist without pool')
run.potions={};UI.refreshEntry(hit,run,platform,true)
for _,s in ipairs({'normal','hover','pressed','disabled'})do assert(not hit:GetChild(s):GetChild('slot1'):GetChild('bottle').visible)end
print('PASS actual #699 refreshEntry; default generated owner; 3 identities x 4 states + empty retirement; missing pools preserve atlas fallback, not distinct illustrations; image writes='..calls)
