// Standalone review harness; it reimplements only immutable B1's starter/LCG/shuffle/draw algorithm.
// Source blob: 3da512df7e62afdbfe49c7a8d47a781bebe65786
// NOT HutaoGame execution: no card resolution, HP economy, UI or battle simulations.
const result=(function simulate(){
 const S=['normal','normal','normal','guard','guard','guard','heavy','e','q','caution'];
 const AT=new Set(['normal','heavy']), AR=['40001:40512','50001:50512'];
 function one(seed){
   let state=seed>>>0;const r=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296};
   const pile=S.slice();for(let i=pile.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[pile[i],pile[j]]=[pile[j],pile[i]]}
   const hand=Array.from({length:5},()=>pile.pop());
   const drawnAfterE=pile.pop();
   const attacks=hand.filter(x=>AT.has(x)).length;
   const hasE=hand.includes('e'),hasQ=hand.includes('q'),hasHeavy=hand.includes('heavy');
   return {hand,drawnAfterE,attacks,hasE,hasQ,hasHeavy};
 }
 function analyze(lo,hi){
  const m={seeds:hi-lo+1,openingE:0,E_and_heavy:0,E_and_Q:0,E_no_attack:0,E_no_attack_next_attack:0,E_one_attack_next_attack:0,E_two_or_more_attacks_next_attack:0,E_next_draw_attack:0,E_next_draw_guard:0,E_next_draw_q:0,E_next_draw_caution:0,E_and_Q_no_attack:0,firstExamples:{E_no_attack_next_attack:[],E_and_Q_no_attack:[],E_two_or_more_attacks_next_attack:[]}};
  for(let seed=lo;seed<=hi;seed++){
   const x=one(seed);if(!x.hasE)continue;
   m.openingE++;if(x.hasHeavy)m.E_and_heavy++;if(x.hasQ)m.E_and_Q++;
   if(x.attacks===0){m.E_no_attack++;if(x.hasQ)m.E_and_Q_no_attack++;if(AT.has(x.drawnAfterE)){m.E_no_attack_next_attack++;if(m.firstExamples.E_no_attack_next_attack.length<5)m.firstExamples.E_no_attack_next_attack.push({seed,hand:x.hand,next:x.drawnAfterE})} if(x.hasQ&&m.firstExamples.E_and_Q_no_attack.length<5)m.firstExamples.E_and_Q_no_attack.push({seed,hand:x.hand,next:x.drawnAfterE})}
   if(AT.has(x.drawnAfterE)){m.E_next_draw_attack++;if(x.attacks===1)m.E_one_attack_next_attack++;if(x.attacks>=2){m.E_two_or_more_attacks_next_attack++;if(m.firstExamples.E_two_or_more_attacks_next_attack.length<5)m.firstExamples.E_two_or_more_attacks_next_attack.push({seed,hand:x.hand,next:x.drawnAfterE})}}
   if(x.drawnAfterE==='guard')m.E_next_draw_guard++;if(x.drawnAfterE==='q')m.E_next_draw_q++;if(x.drawnAfterE==='caution')m.E_next_draw_caution++;
  }
  return m;
 }
 return {schema:1,source_blob:"3da512df7e62afdbfe49c7a8d47a781bebe65786",method:"Source-derived deterministic starter shuffle only; not execution of HutaoGame or a combat A/B trial",training:analyze(40001,40512),holdout:analyze(50001,50512)};
})();
console.log(JSON.stringify(result,null,2));
