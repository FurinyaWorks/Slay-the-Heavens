local data, variant = ...
if variant=='shared-metadata' then
 for _,asset in pairs(data.art.assets)do asset.capacity=data.art.poolCapacity end
end
package.preload.abyss_theme=function()return {}end
package.preload.abyss_card_skin=function()return setmetatable({},{__index=function()error("unexpected card skin access")end})end
local Art=require('abyss_monster_art')
local Surfaces=require('abyss_monster_surfaces')
local function control(n)
 local c={visible=n.visible~=false,alive=true,children={}}
 for _,spec in ipairs(n.children or {})do c.children[spec.name]=control(spec)end
 for _,m in ipairs({'SetAnchorMin','SetAnchorMax','SetPivot','SetSizeDelta','SetLocalScale','SetLocalRotation','SetAnchoredPosition','SetAsLastSibling','SetImage'})do c[m]=function()end end
 function c:GetChild(name)return assert(self.children[name],'missing physical child '..name)end
 function c:SetVisible(value)self.visible=value end
 return c
end
local stage=control({children={{name='actorLayer'}}})
local templates=data.templates
local live={}
local api={enabled=true,templateIndex=1,containerTemplateIndex=5,templateIndexByDefinition=data.indices}
function api.instantiate(index,parent)
 assert(parent==stage:GetChild('actorLayer'))
 local c=control(templates[index]);live[c]=true;return c
end
function api.destroy(box)assert(live[box]);live[box]=nil;box.alive=false end
local tone={r=255,g=255,b=255,a=255}
local platform={monsterActors=api,imageSource=1,imageTypes={basic=17,stretch=23},color=function(r,g,b,a)return{r=r,g=g,b=b,a=a}end}
local owner=Surfaces.new(stage,platform)
local view=Art.new(stage,platform,data.art,owner)
local function row(id,definitionId)return{id=id,actor={definitionId=definitionId}}end
local battle={}
local small,medium,large,absent=row('a','slime_boss'),row('b','chosen'),row('c','mugger'),row('d','mad_gremlin')
local function paint(rows)
 owner:select(rows,battle);view:select(rows)
 for i,r in ipairs(rows)do
  local box=owner:find(r.id)
  local ok=view:write(box,0,0,106,tone)
  if i==4 then assert(not ok and not box.children.monsterArt and box:GetChild('portrait').visible)
  else
   assert(ok,'paint failed: '..r.actor.definitionId)
   assert(box:GetChild('monsterArt').visible and not box:GetChild('portrait').visible)
  end
 end
end
paint({small,medium,large,absent})
local originalSmall=owner:find('a')
local originalMedium=owner:find('b')
local originalFallback=owner:find('d')
paint({small,medium,large,absent})
assert(owner:find('a')==originalSmall and owner:find('b')==originalMedium and owner:find('d')==originalFallback)
paint({small,row('b','slime_boss'),large,absent})
assert(owner:find('a')==originalSmall and owner:find('b')~=originalMedium and owner:find('d')==originalFallback and not originalMedium.alive)
view:clear();owner:clear();assert(next(live)==nil)
print('PAINT PASS 41/96/115; no-art visible; cross-tier repainted and released')
