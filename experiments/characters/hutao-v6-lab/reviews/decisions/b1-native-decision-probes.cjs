// Exact B1 and PR640 first-script native HutaoGame decision fixtures.
// Read-only. Requires local files from the pinned implementation source; verifies SHA1 Git blobs.
const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const expected={A:'364e1d3e8c8559e2fcb26276b9ae8a2813f21735',B1:'3da512df7e62afdbfe49c7a8d47a781bebe65786'};
function load(file,sha){if(!file)throw Error('Require source file paths as CLI args');const b=fs.readFileSync(file);const actual=crypto.createHash('sha1').update('blob '+b.length+'\\0').update(b).digest('hex');if(actual!==sha)throw Error('SOURCE_MISMATCH '+actual+' expected '+sha);const match=b.toString('utf8').match(/<script>([\\s\\S]*?)<\\/script>/);if(!match)throw Error('No first script');return vm.runInNewContext(match[1]+'\\n({HutaoGame,CARDS,STARTER,REWARD_POOL,ENCOUNTERS})',Object.create(null),{timeout:3000});}

const results=(function audit(A,B){
 const results={schema:1,review:"胡桃机制独立评审",candidate:"v6-e-draw1-b1-20261115",blobs:{B1:"3da512df7e62afdbfe49c7a8d47a781bebe65786",A:"364e1d3e8c8559e2fcb26276b9ae8a2813f21735"},method:"Exact frozen first-script HutaoGame executed in isolated synchronous V8; diagnostic state setups; not browser or natural campaign",checks:[]};
 const add=(id,scenario,observed,assertion)=>results.checks.push({id,scenario,observed,assertion:{pass:!!assertion.pass,claim:assertion.claim}});
 function setup(engine,ids,settings={}){
  const g=new engine.HutaoGame(settings.seed??2);
  if(settings.floorIndex!==undefined&&settings.floorIndex!==0)g.startCombat(settings.floorIndex);
  g.hp=settings.hp??72;g.butterfly=settings.butterfly??0;g.energy=settings.energy??3;
  g.hand=ids.map(id=>g.newCard(id));g.drawPile=(settings.draw||[]).map(id=>g.newCard(id));g.discardPile=[];g.exhaustPile=[];g.selected=settings.selected??0;
  if(settings.firstFoeHp!==undefined)g.enemies[0].hp=settings.firstFoeHp;
  if(settings.markFirst!==undefined)g.enemies[0].mark=settings.markFirst;
  if(settings.equalFoeHp){for(const e of g.enemies){e.hp=settings.equalFoeHp;e.maxHp=settings.equalFoeHp}}
  return g;
 }
 const state=g=>({phase:g.phase,floor:g.floor,turn:g.turn,hp:g.hp,energy:g.energy,block:g.block,butterfly:g.butterfly,enemyHp:g.enemies.map(e=>e.hp),enemyMark:g.enemies.map(e=>e.mark),hand:g.hand.map(c=>c.id),draw:g.drawPile.length,relicUsed:g.relicUsed,healUsed:g.healUsed,markKillBlock:g.markKillBlock});
 const play=(g,id,targetIndex=0)=>{const c=g.hand.find(x=>x.id===id);if(!c)throw Error("missing "+id);return g.play(c.uid,targetIndex)};
 const boot=new B.HutaoGame(20261112);
 add("boot","Natural engine constructor(seed=20261112)",{cards:Object.keys(B.CARDS).length,upgrades:Object.keys(B.CARDS).length*2,starter:B.STARTER.length,rewards:B.REWARD_POOL.length,encounters:B.ENCOUNTERS.length,starterIds:B.STARTER,initial:state(boot)}, {pass:Object.keys(B.CARDS).length===75&&B.STARTER.length===10&&B.REWARD_POOL.length===69&&boot.hp===72&&boot.energy===3&&boot.hand.length===5,claim:"75 IDs, 150 form definitions, 10 starter, 69 reward, 72HP/3 energy/5 draw"});
 const attacks={};
 for(const [name,engine] of [["A",A],["B1",B]]){
   const g=setup(engine,["e","heavy","guard"],{draw:["normal"]});
   const before=state(g);const e=play(g,"e");const afterE=state(g);const h=play(g,"heavy");const gd=play(g,"guard");const afterCards=state(g);
   attacks[name]={before,playE:e,afterE,heavy:h,guard:gd,afterCards};
 }
 add("e-heavy-guard","Synthetic same E + heavy + guard; top-of-pile normal, both source engines; perform E/heavy/guard",attacks,{pass:attacks.A.afterE.hand.length===2&&attacks.B1.afterE.hand.length===3&&attacks.A.afterCards.hp===attacks.B1.afterCards.hp&&attacks.A.afterCards.energy===0&&attacks.B1.afterCards.energy===0&&attacks.A.afterCards.enemyHp[0]===attacks.B1.afterCards.enemyHp[0]&&attacks.B1.afterCards.hand.includes("normal"),claim:"B1 extra draw offers option but cannot be an extra paid action after same E/heavy/guard 3-energy line"});
 const g6=setup(B,["e"],{hp:6,draw:["normal"]}),b6=state(g6),r6=play(g6,"e"),a6=state(g6);
 const g7=setup(B,["e"],{hp:7}),r7=play(g7,"e"),a7=state(g7),end7=g7.endTurn(),after7=state(g7);
 add("e-6-7-hp","Synthetic first-encounter hand E alone; HP6 reject vs HP7 allow then end-turn attack7", {hp6:{before:b6,play:r6,after:a6},hp7:{play:r7,afterE:a7,endTurn:end7,after:after7}}, {pass:!r6.ok&&JSON.stringify(b6)===JSON.stringify(a6)&&r7.ok&&a7.hp===1&&a7.block===4&&after7.phase==="lose",claim:"Cannot-pay is safe; E at 7HP is legally playable but dies to 7 attack after relic block4"});
 const gEmpty=setup(B,["e"],{hp:72}),er=play(gEmpty,"e");
 add("e-empty-piles","Synthetic E alone, both drawPile and discardPile empty", {play:er,after:state(gEmpty),lastLog:gEmpty.logs[0]}, {pass:er.ok&&gEmpty.hp===66&&gEmpty.hand.length===0&&gEmpty.block===4,claim:"E still costs 6HP and 1 energy, but attempts draw with zero available cards"});
 const nat=new B.HutaoGame(50242),natBefore=state(nat),rNat=play(nat,"e"),natAfter=state(nat),normal=nat.hand.find(c=>c.id==="normal"),canNormal=normal?nat.canPlay(normal):null;
 add("seed-50242","Actual starter shuffle/real opening hand from seed 50242, play natural E", {before:natBefore,playE:rNat,after:natAfter,normalCanPlay:canNormal}, {pass:natBefore.hand.includes("e")&&!natBefore.hand.some(x=>["normal","heavy"].includes(x))&&rNat.ok&&natAfter.hand.includes("normal")&&canNormal.ok,claim:"A natural opening with no attack may gain an immediately playable normal attack via B1 draw"});
 const gSingle=setup(B,["u10","normal"],{hp:72,energy:3,firstFoeHp:1,markFirst:2});
 const u10=play(gSingle,"u10"),afterU10=state(gSingle),kill=play(gSingle,"normal"),afterKill=state(gSingle);
 const gSingleControl=setup(B,["normal"],{hp:72,energy:3,firstFoeHp:1,markFirst:2}),kill0=play(gSingleControl,"normal"),afterControl=state(gSingleControl);
 add("u10-single-foe","Synthetic one enemy marked and 1HP; compare u10(2energy)->normal vs normal alone", {treated:{u10,afterU10,kill,afterKill},control:{kill:kill0,after:afterControl},relatedLogs:gSingle.logs.slice(0,6)}, {pass:u10.ok&&kill.ok&&afterKill.phase==="reward"&&afterKill.block===0&&afterKill.hp===afterControl.hp&&afterKill.markKillBlock===5&&afterKill.energy===0&&afterControl.energy===2,claim:"On the final enemy, u10 kill-block triggers then checkWin resets block to zero, with no HP benefit"});
 const gMulti=setup(B,["u10","normal"],{floorIndex:3,hp:72,energy:3,firstFoeHp:1,markFirst:2});
 const twoU=play(gMulti,"u10"),twoK=play(gMulti,"normal",0),twoBefore=state(gMulti),twoEnd=gMulti.endTurn(),twoAfter=state(gMulti);
 const gMultiControl=setup(B,["normal"],{floorIndex:3,hp:72,energy:3,firstFoeHp:1,markFirst:2});
 const twoK0=play(gMultiControl,"normal",0),twoEnd0=gMultiControl.endTurn(),twoAfter0=state(gMultiControl);
 add("u10-multi-foe","Synthetic fourth encounter: marked first enemy1HP, surviving second enemy attacks9", {treated:{twoU,twoK,beforeTurn:twoBefore,endTurn:twoEnd,after:twoAfter},control:{twoK:twoK0,endTurn:twoEnd0,after:twoAfter0}}, {pass:twoU.ok&&twoK.ok&&twoBefore.block===5&&twoAfter.hp===68&&twoAfter0.hp===63,claim:"u10 can prevent 5 real HP against another still-alive attacking foe, so not globally useless"});
 function qOrder(ids){const g=setup(B,ids,{hp:36,butterfly:2,energy:3});for(const id of ids)play(g,id);return state(g)}
 const qFirst=qOrder(["q","normal"]),atkFirst=qOrder(["normal","q"]);
 add("q-heal-order","Synthetic HP36, butterfly2, Q + normal, first foe35 HP; compare order", {qThenAttack:qFirst,attackThenQ:atkFirst}, {pass:qFirst.hp===atkFirst.hp&&atkFirst.enemyHp[0]===qFirst.enemyHp[0]-2&&qFirst.hp===43,claim:"Healing before attack crosses half HP and reduces first-hit butterfly bonus by 2; both end at same HP"});
 function pauseOrder(ids){const g=setup(B,ids,{hp:34,butterfly:2,energy:2});for(const id of ids)play(g,id);return state(g)}
 const pauseFirst=pauseOrder(["u18","normal"]),atkBeforePause=pauseOrder(["normal","u18"]);
 add("u18-pause-order","Synthetic HP34, butterfly2; u18 + normal, two energy; order", {u18ThenAttack:pauseFirst,attackThenU18:atkBeforePause}, {pass:pauseFirst.hp===atkBeforePause.hp&&pauseFirst.block===atkBeforePause.block&&atkBeforePause.enemyHp[0]===pauseFirst.enemyHp[0]-5,claim:"Attack then voluntarily end butterfly deals 5 more vs same HP/block, a real tactical order decision"});
 const wildG=setup(B,["wildfire"],{floorIndex:1,hp:72,butterfly:2,selected:1,equalFoeHp:50}),wildR=play(wildG,"wildfire",1);
 add("wildfire-target-order","Synthetic two 50HP enemies, butterfly2, selected second enemy before playing wildfire", {play:wildR,after:state(wildG)}, {pass:wildR.ok&&wildG.enemies[0].hp===42&&wildG.enemies[1].hp===45,claim:"Butterfly's first-hit +3 goes to first internal enemy, not selected target; UI needs to make this ordering clear"});
 results.total=results.checks.length;results.assertionsPassed=results.checks.filter(x=>x.assertion.pass).length;
 return results;
})(load(process.argv[3],expected.A),load(process.argv[2],expected.B1));
console.log(JSON.stringify(results,null,2));
if(results.assertionsPassed!==results.total)process.exitCode=1;
