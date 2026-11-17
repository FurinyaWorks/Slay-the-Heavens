package.path='src/lua/?.lua;build/lua/?.lua;'..package.path
local C=require('abyss_combat')
local D=require('abyss_data')
local Profiles=require('abyss_character_profiles')
local Build=require('abyss_build_actions')
local Choice=require('abyss_hand_choice')
local Silent=require('abyss_silent')
local failed=0
local function test(name,fn)
 local ok,why=pcall(fn)
 if not ok then failed=failed+1 end
 print((ok and 'PASS 'or 'FAIL ')..name..(ok and ''or ': '..tostring(why)))
end
local function battle(character,deck)
 return C.new(Profiles.prepare(D,character),{enemies={'cultist'},deck=deck or {},seed=42})
end
test('temporary hand creation retains both repeatable Master Reality callbacks',function()
 local data=Profiles.prepare(D,'watcher');local seen={}
 for _,card in ipairs(data.cards.cards)do seen[card.id]=true end
 for _,card in ipairs(D.cards.cards)do if not seen[card.id]then data.cards.cards[#data.cards.cards+1]=C.copy(card)end end
 local s=C.new(data,{enemies={'cultist'},deck={'master_reality'},seed=42,enableStances=true})
 assert(C.play(s,s.hand[1].uid))
 assert(s.catalog.cards.searing_blow.repeatable)
 local nextUid=s.nextUid
 Build.makeCard(s,{cardId='searing_blow',value=1,pile='hand'},C)
 assert(#s.hand==1 and s.hand[1].upgrades==2,'temporary hand generation lost a constructor upgrade')
 assert(s.hand[1].uid==nextUid and s.nextUid==nextUid+1)
end)
test('one-card put-on-deck still consumes the source random-zero selection',function()
 local s=battle('ironclad',{'defend'});local card=s.hand[1]
 local counter=s.cardRandomRng.counter
 assert(Choice.begin(s,'put_on_deck',1,nil,C)==true)
 assert(s.cardRandomRng.counter==counter+1,'single-card deck choice lost its RNG consumption')
 assert(#s.hand==0 and s.draw[1]==card)
end)
test('a changed upgrade flag invalidates a captured hand choice before movement',function()
 local s=battle('ironclad',{'defend','strike'})
 assert(Choice.begin(s,'put_on_deck',1,nil,C)=='pause')
 local pending=s.pendingHandChoice;local first,second=s.hand[1],s.hand[2]
 first.upgraded=not first.upgraded
 local ok,why=Choice.choose(s,{first.uid},pending.token,C)
 assert(ok==false and why=='stale_hand_choice_hand','changed upgrade was accepted as the captured physical card')
 assert(s.pendingHandChoice==pending and #s.hand==2 and s.hand[1]==first and s.hand[2]==second and #s.draw==0)
end)
test('Shiv UID collisions reject before any generation writes or callbacks',function()
 local s=battle('silent');local nextUid=s.nextUid
 local existing={uid=nextUid,cardId='defend_green',upgraded=false};s.draw={existing}
 local events=#s.events
 local ok,why=pcall(Silent.generateShivs,s,1,false,C)
 assert(not ok and type(why)=='string'and why:find('card UID collision',1,true),'Shiv generation accepted an owned UID')
 assert(s.nextUid==nextUid and #s.hand==0 and #s.events==events and s.draw[1]==existing and #s.draw==1)
end)
assert(failed==0,tostring(failed)..' CARD_STRATEGY_OWNER_SEMANTICS failures')
print('CARD_STRATEGY_OWNER_SEMANTICS 4 groups passed')
