-- Real current Host and source formations. No HP/readout layout substitution.
local F=dofile('tests/lua/support/game_ui_fixture.lua')
local V=dofile('scripts/official-assets-preview.lua')
local C=F.Combat
local host,root=F.fixture();assert(F.start(host));assert(require('abyss_run').startCombat(host.run,'cultist_solo'))
local panel=root:GetChild('battlePanel')
local manager=require('abyss_monster_surfaces').get(panel)
local countFont,countAlign,countValign
for _,spec in ipairs(F.Templates.AbyssMonsterPower.children)do if spec.name=='count'then
 countFont=spec.text.fontSize;countAlign=spec.text.align;countValign=spec.text.valign
end end
assert(countFont==20 and countAlign=='right'and countValign=='top')
local function clear(a,b)return math.abs(a[1]-b[1])+1e-7>=(a[3]+b[3])/2 or math.abs(a[2]-b[2])+1e-7>=(a[4]+b[4])/2 end
local total=0
for _,amount in ipairs({1,5,10})do
 local deck={};for i=1,amount do deck[i]='strike'end
 local boundary={misc={integer=function()return 0 end,boolean=function()return false end},visualFloat=function()return 0 end}
 local battle=C.new(F.Data,{deck=deck,seed=42,sourceEncounter=assert(POWER_ALIGNMENT_GROUP),encounterBoundary=boundary})
 if #battle.hand<amount then C.draw(battle,amount-#battle.hand)end
 assert(#battle.hand==amount)
 for _,actor in ipairs(battle.enemies)do actor.block=999;C.addStatus(actor,'strength',1)end
 host.run.combat=battle;host:refresh();for _=1,16 do host:update(.1)end
 local shown,collisions=0,{}
 for index=1,10 do local card=panel:GetChild('card'..index)
  if card.visible and card.activeInHierarchy then
   shown=shown+1
   local angle=(card.localRotationZ or 0)*math.pi/180;local scale=card.localScaleX or 1
   local width=(math.abs(math.cos(angle))*card.sizeDeltaX+math.abs(math.sin(angle))*card.sizeDeltaY)*scale
   local height=(math.abs(math.cos(angle))*card.sizeDeltaY+math.abs(math.sin(angle))*card.sizeDeltaX)*scale
   local rect={card.x,card.y,width,height}
   local function collision(kind,actorId,other)
    if not clear(rect,other)then collisions[#collisions+1]={card=index,actorId=actorId,kind=kind,cardRect=rect,powerRect=other}end
   end
   for _,actor in ipairs(battle.enemies)do local box=assert(manager:find(actor.id))
    for _,name in ipairs({'blockEdge','hpBorder'})do local part=box:GetChild(name)
     collision(name,actor.id,{box.x+part.x,box.y+part.y,part.sizeDeltaX,part.sizeDeltaY})
    end
    local function visit(parent,x,y)
     for _,control in pairs(parent.children or {})do
      local cx,cy=x+(control.x or 0),y+(control.y or 0)
      if control.visible and control.activeInHierarchy and (control.name=='icon'or control.name=='count')then
       local w,h=control.sizeDeltaX,control.sizeDeltaY
       if control.name=='count'then
        local frameW,frameH=w,h;w=math.min(w,utf8.len(control.text)*countFont);h=countFont
        cx=cx+(frameW-w)/2;cy=cy+(frameH-h)/2
       end
       collision(control.name,actor.id,{cx,cy,w,h})
      end
      visit(control,cx,cy)
     end
    end
    local powers=box:GetChild('statusRow');visit(powers,box.x+(powers.x or 0),box.y+(powers.y or 0))
   end
  end
 end
 assert(shown==amount,'actual hand controls must match real hand')
 total=total+#collisions
 -- Structured diagnostics stay separate from complete source scene snapshots.
 local function quote(s)return '"'..s:gsub('\\','\\\\'):gsub('"','\\"')..'"'end
 local kinds={};for _,c in ipairs(collisions)do kinds[#kinds+1]=quote(c.kind..':actor='..c.actorId..':card='..c.card)end
 print('POWER_COUNT_CLEARANCE {"hand":'..amount..',"collisions":'..#collisions..',"kinds":['..table.concat(kinds,',')..']}')
 V.capture('source-hand-'..amount,host,root,'offline native20 budget; real source '..POWER_ALIGNMENT_GROUP..'; actual settled hand; forced Block999/Strength1')
end
V.print()
if POWER_ALIGNMENT_ALLOW_KNOWN_FAILURES~=true then assert(total==0,'Power glyph/actual hand clearance remains unresolved')end
