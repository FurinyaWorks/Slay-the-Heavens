package.path='src/lua/?.lua;build/lua/?.lua;'..package.path
local C,Run,Display=require('abyss_combat'),require('abyss_run'),require('abyss_card_display')
local data=Run.new(require('abyss_data'),42).data
local look=require('abyss_character_presentation').prepare(require('abyss_presentation'),data)
local specs={
 {name='base_attack_only',value=14,arrow='same',can=true},
 {name='weak_attack_only',weak=1,value=10,arrow='down',can=true},
 {name='base_with_skill',skill=true,value=14,arrow='same',can=false},
 {name='weak_with_skill',skill=true,weak=1,value=10,arrow='down',can=false},
 {name='upgraded_weak',upgrade=true,weak=1,value=13,arrow='down',can=true},
 {name='negative_strength',strength=-3,value=11,arrow='down',can=true},
}
for _,spec in ipairs(specs)do
 local s=C.new(data,{deck={},enemies={'cultist'},seed=42});s.energy=3
 s.hand={{uid=7001,cardId='clash',upgraded=spec.upgrade==true},{uid=7002,cardId=spec.skill and 'defend' or 'strike'}};s.draw={};s.discard={};s.exhaust={}
 s.enemies[1].hp=200;s.enemies[1].maxHp=200;s.enemies[1].block=0;s.enemies[1].statuses={}
 if spec.weak then C.addStatus(s.player,'weak',spec.weak)end
 if spec.strength then C.addStatus(s.player,'strength',spec.strength)end
 local c=s.hand[1];local before={energy=s.energy,hand=#s.hand,hp=s.enemies[1].hp,seed=s.seed}
 local def=C.cardDefinition(s,c);local preview=C.cardPreview(s,c,1);local token=Display.values(def,preview)[1]
 local text=Display.combatText(look.clash,def,c,preview,s,1)
 local can,why=C.canPlay(s,c.uid,1)
 assert(token.base==(spec.upgrade and 18 or 14) and token.current==spec.value and token.direction==spec.arrow)
 assert(can==spec.can,'canPlay mismatch '..spec.name)
 assert(s.energy==before.energy and #s.hand==before.hand and s.enemies[1].hp==before.hp and s.seed==before.seed,'preview mutated state')
 local played=C.play(s,c.uid,1)
 assert(played==spec.can)
 local lost=before.hp-s.enemies[1].hp;assert(lost==(spec.can and spec.value or 0))
 if not spec.can then assert(s.energy==before.energy and #s.hand==before.hand and s.seed==before.seed,'rejected play mutated state')end
 print('PC34 '..spec.name..' id=clash name='..look.clash.name..' base='..token.base..' shown='..token.text..' colour='..token.colourKey..' canPlay='..tostring(can)..' reason='..tostring(why)..' actualHpLoss='..lost..' text='..text)
end
print('PC34_DIAGNOSTIC_PASS 6; controlled states only, original screenshot state unknown')
