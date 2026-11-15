/* Hu Tao PR640 independent economy audit. Executes only the frozen first HTML script.
 * No DOM, network, testWinBattle, practiceAdd or random seed adaptation.
 * Preregistered at 2026-11-15-prereg.md before execution.
 */
function runEconomyAudit() {
 const splits=[{name:"training",start:1,end:256},{name:"holdout",start:1001,end:1256}];
 const policies=["guard","balanced","ignite","rush"];
 const weights={
  guard: {damage:0.9,block:1.9,heal:1.8,draw:1.2,mark:0.6,pay:8,burst:0.2},
  balanced: {damage:1.35,block:1.2,heal:1.25,draw:1.5,mark:0.9,pay:2.4,burst:1},
  ignite: {damage:1.7,block:0.75,heal:1.05,draw:1.3,mark:1.25,pay:0.8,burst:2},
  rush: {damage:2.0,block:0.3,heal:0.5,draw:1.15,mark:1.2,pay:1.5,burst:1.4}
 };
 const restThreshold={guard:62,balanced:43,ignite:32,rush:18};
 const scoring = { training:{},holdout:{} };
 const anomaly=[];
 const cfg={seeds:splits,policies,turnCap:24,actionCap:40,starter:STARTER,rewardMode:"natural_offers_top_fixed_score",campThreshold:restThreshold};
 function wilson(success,n){if(!n)return [0,0];const z=1.96,p=success/n,den=1+z*z/n,
   ctr=(p+z*z/(2*n))/den,rad=z*Math.sqrt(p*(1-p)/n+z*z/(4*n*n))/den;
   return [+Math.max(0,ctr-rad).toFixed(4),+Math.min(1,ctr+rad).toFixed(4)];}
 function hpCost(id,up){const c=CARDS[id],ops=up?c.upgradeEffects:c.effects;return ops?ops.filter(x=>x.op==="pay").reduce((s,x)=>s+x.n,0):id==="e"?6:id==="bloodshot"?2:0;}
 function utility(g,card,p,targetIdx){
  const d=CARDS[card.id],w=weights[p],foes=g.live(),target=g.getTarget(targetIdx);let damage=0,block=0,draw=0,heal=0,mark=0,pay=hpCost(card.id,card.upgraded);
  const up=card.upgraded,low=g.hp-pay<=36,startedButterfly=g.butterfly>0,marked=!!(target?.mark>0);
  const incoming=foes.reduce((a,e)=>{let q=g.enemyIntent(e);return a+(q.type==="attack"?(e.weak?Math.floor(q.amount*.75):q.amount):0);},0);
  const need=Math.max(0,incoming-g.block);
  const cond=e=>!e.if||(e.if==="low"?low:e.if==="high"?!low:e.if==="butterfly"?startedButterfly:e.if==="marked"?marked:e.if==="unmarked"?!marked:e.if==="multi"?foes.length>=2:e.if==="enemy_half"?(target&&target.hp*2<=target.maxHp):false);
  const ops=up?d.upgradeEffects:d.effects;
  if(ops) for(const e of ops){if(!cond(e))continue;
    if(e.op==="damage")damage+=e.n*(e.hits||1)*(e.all?foes.length:1)+(e.bonusIfMarked&&marked?e.bonusIfMarked:0)+(e.bonusIfLow&&low?e.bonusIfLow:0);
    else if(e.op==="block")block+=e.n;
    else if(e.op==="heal")heal+=Math.min(e.n,Math.max(0,g.maxHp-g.hp+pay),Math.max(0,12-g.healUsed));
    else if(e.op==="draw")draw+=e.n;
    else if(e.op==="mark")mark+=e.all?foes.length:1;
    else if(e.op==="cash")damage+=(target?.mark||0)*e.n;
    else if(e.op==="nextDraw")draw+=.8*e.n;
    else if(e.op==="nextBlock")block+=.5*e.n;
    else if(e.op==="nextEnergy")draw+=1.2*e.n;
    else if(e.op==="weak")block+=(e.all?foes.length:1)*3;
    else if(e.op==="butterfly")mark+=1.4*e.n;
    else if(e.op==="prepAttack")damage+=2.2;
    else if(e.op==="bloomPower"||e.op==="hearthPower")mark+=2;
    else if(e.op==="markKillBlock")block+=2;
    else if(e.op==="guardLife"&&g.hp<=18)block+=5;
    else if(e.op==="counter")damage+=e.n*.6;
    else if(e.op==="endButterfly"&&g.butterfly>0)block-=3;
  }else{
    switch(card.id){
     case "normal": damage=up?9:6;break;
     case "heavy": damage=up?10:7;mark=startedButterfly?1:0;break;
     case "guard": block=up?8:5;break;
     case "caution":block=(up?10:7)+(low?3:0);break;
     case "e": if(startedButterfly)return -500; mark=p==="guard"?-99:1.8; block=g.relicUsed?0:4;break;
     case "q":damage=(low?(up?18:14):(up?14:11))*foes.length;heal=Math.min(low?(up?8:7):(up?5:4),Math.max(0,g.maxHp-g.hp),12-g.healUsed);break;
     case "mark":damage=up?6:4;mark=1;break;
     case "aid":block=up?10:7;draw=1;break;
     case "trick":draw=1;block=startedButterfly?(up?5:3):0;break;
     case "farewell":damage=(up?8:6)+(target?.mark||0)*(up?4:3);break;
     case "bloodshot":damage=up?17:14;break;
     case "red":damage=up?8:5;mark=startedButterfly?1:0;break;
     case "wildfire":damage=(up?7:5)*foes.length;break;
     case "hearth":mark=low?2.5:0.7;break;
     case "afterglow":block=up?9:6;draw=startedButterfly?1:0;break;
     case "spear":damage=(up?5:4)*2;break;
     case "last":block=up?9:6;break;
     case "renew":block=up?9:7;mark=startedButterfly?1:0;break;
    }
  }
  if(p==="guard"&&pay>0)return -500;
  const viableDamage=Math.min(damage,foes.reduce((sum,e)=>sum+e.hp+e.block,0));
  const viableBlock=Math.min(block,need);
  let bonus=(card.id==="e"&&!startedButterfly?(p==="ignite"?19:p==="rush"?12:p==="balanced"?7:0):0);
  if(card.id==="e"&&p==="balanced"&&!g.hand.some(c=>c.uid!==card.uid&&CARDS[c.id].type==="攻击"&&g.cardCost(c)<=g.energy-1))bonus-=8;
  if(card.id==="q"&&heal>0)bonus+=4;
  let val=w.damage*viableDamage+w.block*viableBlock+w.heal*heal+w.draw*draw*2.5+w.mark*mark*3-w.pay*pay+bonus;
  if(pay>0&&g.hp-pay<=12)val-=35;
  if(g.energy===0&&g.cardCost(card)===0)val+=1;
  if(d.exhaust)val-=0.25;
  return val;
 }
 function rewardScore(id,p){const d=CARDS[id],ops=d.effects||[],w=weights[p],pay=hpCost(id,false);
   const dmg=ops.filter(e=>e.op==="damage").reduce((n,e)=>n+e.n*(e.hits||1)*(e.all?2:1),0)+(d.type==="攻击"?5:0);
   const block=ops.filter(e=>e.op==="block").reduce((n,e)=>n+e.n,0);
   const heal=ops.filter(e=>e.op==="heal").reduce((n,e)=>n+e.n,0);
   const utility = w.damage*dmg+w.block*block+w.heal*heal+ops.filter(e=>e.op==="draw").reduce((n,e)=>n+e.n*2*w.draw,0)+ops.filter(e=>e.op==="mark").length*3*w.mark+w.burst*ops.filter(e=>e.op==="butterfly").length*6 -w.pay*pay-2*d.cost;
   return utility + (d.type==="能力"&&p!=="rush"?1:0);
 }
 function chooseReward(g,p){const offers=g.offers.slice();return offers.sort((a,b)=>rewardScore(b,p)-rewardScore(a,p)||a.localeCompare(b))[0]||null;}
 function chooseUpgrade(g,p){
  const order=p==="guard"?["guard","caution","q","heavy","normal","e"]:
  p==="ignite"?["e","heavy","q","normal","caution","guard"]:
  ["q","heavy","e","normal","caution","guard"];
  const options=g.deck.filter(c=>!c.upgraded);
  options.sort((a,b)=>{const ia=order.indexOf(a.id),ib=order.indexOf(b.id);return (ia<0?99:ia)-(ib<0?99:ib)||a.uid-b.uid;});
  return options[0]?.uid;
 }
 function runOne(seed,p){
  const g=new HutaoGame(seed), trace={seed,policy:p,opening:g.hand.map(x=>x.id),floors:[],offered:[],failed:null},m={
   paid:0,enemyLoss:0,healed:0,restHeal:0,campRest:0,campUpgrade:0,firstTurnE:0,firstBattleE:0,totalE:0,
   turns:0,cardsPlayed:0,offerRare:0,offerTotal:0,rewardRare:0,rewardCards:[],maxHealUsed:0
  };
  let done=false;
  for(let step=0;step<2000&&!done;step++){
   if(g.phase==="combat"){
    if(g.turn>24){trace.failed={floor:g.floor,turn:g.turn,why:"turn_cap",hp:g.hp};done=true;break;}
    if(!trace.floors.some(x=>x.floor===g.floor))trace.floors.push({floor:g.floor,startHP:g.hp,firstHand:g.hand.map(x=>x.id)});
    let plays=0;
    while(g.phase==="combat"&&plays<40){
     const ti=g.live().map((e,i)=>({idx:i,hp:e.hp})).sort((a,b)=>a.hp-b.hp||a.idx-b.idx)[0]?.idx??0;
     let choices=g.hand.filter(c=>g.canPlay(c,ti).ok).map(c=>({c,score:utility(g,c,p,ti)}));
     choices.sort((a,b)=>b.score-a.score||a.c.uid-b.c.uid);
     if(!choices.length||choices[0].score<=0.5)break;
     const item=choices[0],before=g.hp,h0=g.healUsed,paid=hpCost(item.c.id,item.c.upgraded);
     const ok=g.play(item.c.uid,ti);if(!ok.ok)throw Error("strategy-invalid-play:"+JSON.stringify(ok));
     m.paid+=paid;m.healed+=g.healUsed-h0;
     m.cardsPlayed++;plays++;
     if(item.c.id==="e"){m.totalE++;if(g.turn===1&&g.floor===1)m.firstTurnE++;if(g.floor===1)m.firstBattleE++;}
     if(Math.abs(g.hp-(before-paid+g.healUsed-h0))>0)throw Error("hp-accounting play");
     m.maxHealUsed=Math.max(m.maxHealUsed,g.healUsed);
     if(g.phase!=="combat")break;
    }
    if(plays===40){trace.failed={floor:g.floor,turn:g.turn,why:"action_cap",hp:g.hp};done=true;break;}
    if(g.phase==="combat"){
      let before=g.hp,prevTurn=g.turn;
      g.endTurn();m.enemyLoss+=Math.max(0,before-g.hp);m.turns++;
      if(g.turn===prevTurn&&g.phase==="combat")throw Error("turn_not_advancing");
      if(g.phase==="lose")trace.failed={floor:g.floor,turn:prevTurn,why:"death",hp:g.hp,logs:g.logs.slice(0,8)};
    }
   } else if(g.phase==="reward"){
      m.offerRare+=g.offers.filter(id=>CARDS[id].rarity==="稀有").length;m.offerTotal+=g.offers.length;
      const select=chooseReward(g,p);
      trace.offered.push({floor:g.floor,offers:g.offers.slice(),selected:select});
      if(select){m.rewardCards.push(select);if(CARDS[select].rarity==="稀有")m.rewardRare++;}
      const r=g.takeReward(select);if(!r.ok)throw Error("reward_failure:"+JSON.stringify(r));
   } else if(g.phase==="camp"){
      const before=g.hp;
      let action=g.hp<=restThreshold[p]?"rest":"upgrade";
      let uid=action==="upgrade"?chooseUpgrade(g,p):undefined;
      if(action==="upgrade"&&uid===undefined){action="rest";uid=undefined;}
      const r=g.takeCamp(action,uid);if(!r.ok)throw Error("camp_failure:"+JSON.stringify(r));
      if(action==="rest"){m.campRest++;m.restHeal+=g.hp-before;}else m.campUpgrade++;
   } else {done=true;break;}
  }
  if(!done)throw Error("global_step_cap");
  trace.final={phase:g.phase,floor:g.floor,hp:g.hp,wins:g.wins,turn:g.turn,deck:g.deck.map(c=>c.id+(c.upgraded?"+":"")).slice(-8)};
  return {trace,m,win:g.phase==="win",dead:g.phase==="lose",timeout:!!trace.failed&&["turn_cap","action_cap"].includes(trace.failed.why),floor:g.floor};
 }
 function summarize(arr){
   const n=arr.length,w=arr.filter(x=>x.win).length,d=arr.filter(x=>x.dead).length,to=arr.filter(x=>x.timeout).length;
   const fields=["paid","enemyLoss","healed","restHeal","campRest","campUpgrade","firstTurnE","firstBattleE","totalE","turns","cardsPlayed","offerRare","offerTotal","rewardRare","maxHealUsed"];
   const sums={};for(const k of fields){let s=arr.reduce((a,x)=>a+x.m[k],0);sums[k+"Sum"]=s;sums[k+"PerRun"]=+(s/n).toFixed(3);}
   const rareOfferRate=sums.offerTotalSum?+(sums.offerRareSum/sums.offerTotalSum).toFixed(4):null;
   return {n,wins:w,deaths:d,timeouts:to,winWilson95:wilson(w,n),avgHighestFloor:+(arr.reduce((s,x)=>s+x.floor,0)/n).toFixed(3),rareOfferRate, ...sums,
    examples:arr.filter(x=>!x.win).slice(0,4).map(x=>({seed:x.trace.seed,failed:x.trace.failed,final:x.trace.final,opening:x.trace.opening,offered:x.trace.offered}))};
 }
 for(const split of splits)for(const p of policies){
  let arr=[];for(let seed=split.start;seed<=split.end;seed++){try{arr.push(runOne(seed,p));}catch(e){anomaly.push({seed,p,error:String(e)});}}
  scoring[split.name][p]=summarize(arr);
 }
 const cardCheck={cardCount:Object.keys(CARDS).length,baseUpgradeForms:0,played:0,rejected:0,throws:[],realStarterCount:STARTER.length,rewardPoolCount:REWARD_POOL.length,rarityRewards:{}};
 for(const [id,d] of Object.entries(CARDS)){cardCheck.rarityRewards[d.rarity]=(cardCheck.rarityRewards[d.rarity]||0)+(REWARD_POOL.includes(id)?1:0);
 for(const up of [false,true]){cardCheck.baseUpgradeForms++; const g=new HutaoGame(999);g.hand=[g.newCard(id,up)];g.energy=3;g.hp=72;g.enemies[0].hp=1000;g.enemies[0].maxHp=1000;try{const r=g.play(g.hand[0].uid,0);if(r.ok)cardCheck.played++;else {cardCheck.rejected++;cardCheck.throws.push({id,up,reason:r.reason});}}catch(e){cardCheck.throws.push({id,up,error:String(e)});}}}
 const sameCostDominated=[];const ids=Object.keys(CARDS);
 for(let i=0;i<ids.length;i++)for(let j=0;j<ids.length;j++){
  if(i===j)continue;const a=CARDS[ids[i]],b=CARDS[ids[j]];
  if(!a.effects||!b.effects||a.cost!==b.cost||a.type!==b.type||a.exhaust!==b.exhaust||a.effects.length!==b.effects.length||a.upgradeEffects.length!==b.upgradeEffects.length)continue;
  let strict=false,valid=true;
  for(const k of ["effects","upgradeEffects"]){for(let z=0;z<a[k].length;z++){
    const ac=a[k][z],bc=b[k][z];
    for(const key of new Set([...Object.keys(ac),...Object.keys(bc)])){
      if(key==="n"){if(ac.n>bc.n)valid=false;if(ac.n<bc.n)strict=true;}
      else if(ac[key]!==bc[key])valid=false;
    }
  }}
  if(valid&&strict)sameCostDominated.push({worse:a.id,better:b.id,aRarity:a.rarity,bRarity:b.rarity});
 }
 return {cfg,engine:{sourceBlob:"364e1d3e8c8559e2fcb26276b9ae8a2813f21735",method:"isolated-V8-function-eval-of-frozen-first-script",noDom:true},cardCheck,sameCostDominated,scoring,anomaly:anomaly.slice(0,30),anomalyCount:anomaly.length};
}
