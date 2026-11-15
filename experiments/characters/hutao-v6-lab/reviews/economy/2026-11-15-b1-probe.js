/* B1 independent economy probes; concatenate with immutable first <script> from A/B.
 * Invocation: new Function(frozenFirstScript + thisFile + 'return runB1EconomyProbe();')()
 * Diagnostic hand/pile overrides are NOT natural rewards, and must not be used for win rates.
 */
function runB1EconomyProbe(){
  const results={};
  function game({hp=72,energy=3,hand=['e'],top=['normal'],discard=[],enemyHp=1000,enemyBlock=0,butterfly=0,relicUsed=false}={}){
    const g=new HutaoGame(777);
    g.phase='combat';g.hp=hp;g.energy=energy;g.block=0;g.butterfly=butterfly;g.relicUsed=relicUsed;
    g.healUsed=0;g.hand=hand.map(id=>g.newCard(id));g.drawPile=top.map(id=>g.newCard(id)).reverse();
    g.discardPile=discard.map(id=>g.newCard(id));g.exhaustPile=[];
    g.enemies[0].hp=enemyHp;g.enemies[0].maxHp=enemyHp;g.enemies[0].block=enemyBlock;
    return g;
  }
  function state(g){return {phase:g.phase,hp:g.hp,energy:g.energy,block:g.block,butterfly:g.butterfly,relicUsed:g.relicUsed,healed:g.healUsed,
    hand:g.hand.map(c=>c.id),draw:g.drawPile.length,discard:g.discardPile.length,exhaust:g.exhaustPile.length,
    enemyHp:g.enemies[0].hp,logs:g.logs.slice(0,5).map(x=>x.msg)}}
  function act(g,id){const c=g.hand.find(x=>x.id===id);if(!c)return {ok:false,reason:'missing in hand'};return g.play(c.uid,0);}
  function runE(cfg){const g=game(cfg),initial=state(g),can=g.canPlay(g.hand[0],0),ret=act(g,'e');return {initial,can,ret,after:state(g)}}
  results.fullHpE=runE({hp:72,energy:3,top:['normal']});
  results.fullHpEnergy1=runE({hp:72,energy:1,top:['normal']});
  results.emptyPiles=runE({hp:72,energy:3,top:[],discard:[]});
  results.lowHp6=runE({hp:6,energy:3,top:['normal']});
  results.lowHp7=runE({hp:7,energy:3,top:['normal']});
  results.fullHand=runE({hp:72,energy:3,hand:['e',...Array(9).fill('normal')],top:['guard']});
  results.noRelic=runE({hp:72,energy:3,top:['normal'],relicUsed:true});
  const twice=game({hp:72,energy:3,hand:['e','e'],top:['normal','guard']});
  const first=act(twice,'e'),a=state(twice),second=act(twice,'e');results.twiceE={first,afterFirst:a,second,afterSecond:state(twice)};
  const usable=game({hp:72,energy:3,hand:['e'],top:['normal']});
  const pe=act(usable,'e'),pn=act(usable,'normal');
  results.drawToAction={e:pe,normal:pn,after:state(usable)};
  const burn=game({hp:7,energy:3,hand:['e'],top:['normal'],enemyHp:35});
  const start=act(burn,'e'),post=state(burn),attack=act(burn,'normal'),end=burn.endTurn();
  results.lowHpEnemyTrade={e:start,postE:post,attack,end,after:state(burn)};
  const qFirst=game({hp:36,energy:5,hand:['e','q','normal'],top:[]});
  const e1=act(qFirst,'e'),q1=act(qFirst,'q'),normal1=act(qFirst,'normal');
  const qAfter=game({hp:36,energy:5,hand:['e','q','normal'],top:[]});
  const e2=act(qAfter,'e'),normal2=act(qAfter,'normal'),q2=act(qAfter,'q');
  results.lowHpOrder={E_Q_normal:{acts:[e1,q1,normal1],state:state(qFirst)},E_normal_Q:{acts:[e2,normal2,q2],state:state(qAfter)},note:'5 energy is a diagnostic counterfactual, not an unmodified first-turn natural resource'};
  const staticCount={distinct:Object.keys(CARDS).length,forms:Object.keys(CARDS).length*2,startingDeck:STARTER.length,
    rewardPool:REWARD_POOL.length,rarityRewards:{},zeroCostCards:[],payCards:[],drawCards:[],healCards:[],relic:'引蝶灯（first HP pay +4 block per battle）'};
  for(const id of REWARD_POOL){const r=CARDS[id].rarity;staticCount.rarityRewards[r]=(staticCount.rarityRewards[r]||0)+1;}
  for(const [id,c] of Object.entries(CARDS)){if(c.cost===0)staticCount.zeroCostCards.push(id);
    if(c.effects?.some(x=>x.op==='pay')||['e','bloodshot'].includes(id))staticCount.payCards.push(id);
    if(c.effects?.some(x=>x.op==='draw')||['e','aid','trick'].includes(id))staticCount.drawCards.push(id);
    if(c.effects?.some(x=>x.op==='heal')||id==='q')staticCount.healCards.push(id);
  }
  staticCount.probAtLeastOneRare=1-(51*50*49)/(69*68*67);
  results.staticCount=staticCount;
  const forms={attempted:0,played:0,rejected:[],exceptions:[]};
  for(const id of Object.keys(CARDS))for(const upgraded of [false,true]){const g=game({hp:72,energy:3,hand:[],top:[],enemyHp:1000});
    const c=g.newCard(id,upgraded);g.hand=[c];forms.attempted++;
    try{const x=g.play(c.uid,0);if(x.ok)forms.played++;else forms.rejected.push({id,upgraded,reason:x.reason});}catch(e){forms.exceptions.push({id,upgraded,error:String(e)});}}
  results.formCheck=forms;
  // After exhausting all zero-cost draws there is no positive draw+energy self-recursion on same turn.
  const zeros=game({hp:72,energy:0,hand:['trick','c16','red'],top:['normal','normal'],butterfly:2});
  results.zeroEnergyActions={before:state(zeros),playTrick:act(zeros,'trick'),playC16:act(zeros,'c16'),playRed:act(zeros,'red'),after:state(zeros)};
  return results;
}
