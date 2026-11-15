#!/usr/bin/env node
'use strict';
/* Deterministic reward-only probe. Frozen B1 HTML input; no gameplay, no external packages.
 * Run: node experiments/characters/hutao-v6-lab/experiments/2026-11-15-rarity-policy-probe.cjs <path-to-v6-e-draw1-b1.html>
 * Prints JSON; compare with committed results. REQUIRES exact frozen B1 git blob.
 */
const fs=require('fs'),crypto=require('crypto');
function parsePool(html) {
 const legacy=[...html.matchAll(/\bC\('([^']+)','[^']*','(基础|普通|罕见|稀有)'/g)].map(m=>({id:m[1],rarity:m[2]}));
 const defs=[...html.matchAll(/^\s*\['([a-z]\d{2})','[^']*','(普通|罕见|稀有)'/gm)].map(m=>({id:m[1],rarity:m[2]}));
 const all=[...legacy,...defs], sm=html.match(/const STARTER=\[([^\]]+)\]/);
 if(!sm)throw Error("MISSING_STARTER");
 const starter=[...sm[1].matchAll(/'([^']+)'/g)].map(m=>m[1]);
 const pool=all.filter(x=>!starter.includes(x.id));
 const by={"普通":[],"罕见":[],"稀有":[]};for(const c of pool){if(!(c.rarity in by))throw Error("UNKNOWN_RARITY");by[c.rarity].push(c.id);}
 if(all.length!==75||new Set(all.map(x=>x.id)).size!==75||starter.length!==10||pool.length!==69||by["普通"].length!==26||by["罕见"].length!==25||by["稀有"].length!==18)throw Error("POOL_CONTRACT");
 if(!html.includes("offerRewards(){const candidates=this.shuffle([...REWARD_POOL]);return candidates.slice(0,3);}")||!html.includes("rand(){this.seed=(Math.imul(this.seed,1664525)+1013904223)>>>0;return this.seed/4294967296;}"))throw Error("SOURCE_METHOD_DRIFT");
 return {all,starter,pool,by};
}
function runRarityProbe(poolData){
 const seen={baseline:new Set(),weighted:new Set()},by=poolData.by;
 const categories={"普通":"common","罕见":"uncommon","稀有":"rare"};
 const catOf=Object.fromEntries(poolData.pool.map(x=>[x.id,categories[x.rarity]]));
 const types=["normal","normal","elite","normal"];
 const tierBase={normal:{common:60,uncommon:37,rare:3},elite:{common:50,uncommon:40,rare:10}};
 function rng(seed){let x=seed>>>0;return ()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296;};}
 function shuffle(xs,rand){for(let i=xs.length-1;i>0;i--){let j=Math.floor(rand()*(i+1)),tmp=xs[i];xs[i]=xs[j];xs[j]=tmp;}return xs;}
 function offers(policy,seed) {
  const rand=rng(seed),out=[];let offset=-5;
  for(let floor=1;floor<=4;floor++){
   const type=types[floor-1];let ids=[];
   if(policy==="baseline"){ids=shuffle(poolData.pool.map(x=>x.id),rand).slice(0,3);}
   else{
    const options={common:by["普通"].slice(),uncommon:by["罕见"].slice(),rare:by["稀有"].slice()};
    for(let slot=0;slot<3;slot++){
     const base=tierBase[type],shift=base.rare+offset;
     const rare=Math.max(0,shift),uncommon=Math.max(0,Math.min(100-rare,base.uncommon+Math.min(0,shift)));
     const roll=rand()*100;
     const k=roll<rare?"rare":roll<rare+uncommon?"uncommon":"common";
     if(!options[k].length)throw Error("EMPTY_TIER:"+k);
     const index=Math.floor(rand()*options[k].length);
     const [id]=options[k].splice(index,1);
     ids.push(id);
     if(k==="rare")offset=-5;
     else if(k==="common")offset=Math.min(40,offset+1);
    }
   }
   out.push({floor,type,ids});
  }
  return out;
 }
 function fresh(){return {screens:0,slots:0,duplicates:0,missing:0,rareScreens:0,multiRareScreens:0,byType:{normal:{screens:0,slots:0,common:0,uncommon:0,rare:0,rareScreens:0},elite:{screens:0,slots:0,common:0,uncommon:0,rare:0,rareScreens:0}},perCard:Object.fromEntries(poolData.pool.map(x=>[x.id,0]))}}
 function tally(v,rewards){for(const screen of rewards){v.screens++;v.slots+=screen.ids.length;v.byType[screen.type].screens++;v.byType[screen.type].slots+=screen.ids.length;if(new Set(screen.ids).size!==3)v.duplicates++;let rare=0;for(const id of screen.ids){if(!(id in catOf)){v.missing++;continue;}v.perCard[id]++;v.byType[screen.type][catOf[id]]++;if(catOf[id]==="rare")rare++;}if(rare>0){v.rareScreens++;v.byType[screen.type].rareScreens++;}if(rare>1)v.multiRareScreens++;}}
 function compact(v){
  const cardRanges={};for(const [k,label] of Object.entries({"普通":"common","罕见":"uncommon","稀有":"rare"})){let arr=by[k].map(id=>v.perCard[id]);cardRanges[label]={min:Math.min(...arr),max:Math.max(...arr),zero:arr.filter(n=>n===0).length};}
  delete v.perCard;v.perCardByRarity=cardRanges;v.rareScreenRate=+(v.rareScreens/v.screens).toFixed(6);
  for(const x of Object.values(v.byType)){x.rareSlotRate=+(x.rare/x.slots).toFixed(6);x.rareScreenRate=+(x.rareScreens/x.screens).toFixed(6);}
  return v;
 }
 const result={method:"source-anchored deterministic reward-only simulation (not HutaoGame 5-battle)",sourceGitBlob:"3da512df7e62afdbfe49c7a8d47a781bebe65786",seedSplits:{training:[40001,50000],holdout:[50001,60000]},rarityPools:{common:by["普通"].length,uncommon:by["罕见"].length,rare:by["稀有"].length},screenTypes:types,policies:{baseline:"original B1 Fisher-Yates pool shuffle, no replacement in screen",weighted:"rarity first (normal 60/37/3, elite 50/40/10), STS1-style offset -5/+common1/reset on rare; uniform ID within selected tier; no duplicate IDs"},expectedOriginalRareSlotRate:18/69,expectedOriginalRareScreenRate:1-(51*50*49)/(69*68*67),splits:{}};
 for(const [split,from,to] of [["training",40001,50000],["holdout",50001,60000]]){
  const rs={baseline:fresh(),weighted:fresh()};
  for(let seed=from;seed<=to;seed++){for(const policy of ["baseline","weighted"]){const o=offers(policy,seed);tally(rs[policy],o);}}
  for(const policy of ["baseline","weighted"])rs[policy]=compact(rs[policy]);
  result.splits[split]=rs;
 }
 const a=JSON.stringify(offers("baseline",40001)),b=JSON.stringify(offers("weighted",40001));
 result.invariants={sampleBaselineDeterministic:a===JSON.stringify(offers("baseline",40001)),sampleWeightedDeterministic:b===JSON.stringify(offers("weighted",40001)),allOffersThree: Object.values(result.splits).every(x=>Object.values(x).every(v=>v.screens===40000&&v.slots===120000)),noDuplicatesOrMissing:Object.values(result.splits).every(x=>Object.values(x).every(v=>v.duplicates===0&&v.missing===0)),everyCardSeen:Object.values(result.splits).every(x=>Object.values(x).every(v=>Object.values(v.perCardByRarity).every(k=>k.zero===0)))};
 if(Object.values(result.invariants).some(x=>!x))throw Error("AUDIT_INVARIANT_FAILED");
 return result;
}
const p=process.argv[2];if(!p){console.error('usage: node 2026-11-15-rarity-policy-probe.cjs <frozen-B1.html>');process.exit(2);}
const s=fs.readFileSync(p,'utf8');const sha=crypto.createHash('sha1').update('blob '+Buffer.byteLength(s)+'\0').update(s).digest('hex');if(sha!=='3da512df7e62afdbfe49c7a8d47a781bebe65786')throw Error('SOURCE_MISMATCH:'+sha);
console.log(JSON.stringify(runRarityProbe(parsePool(s)),null,2));
