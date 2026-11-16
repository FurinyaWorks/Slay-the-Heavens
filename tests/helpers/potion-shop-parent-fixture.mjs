// Test-only exact parent fixture, not an authorization reader for the current tree.
// Current-union contracts are exercised separately against live raw reads.
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {potionShopCiPacket,assertPotionShopCiCurrent} from './potion-shop-ci-source.mjs';
export function potionShopParentFixture(target,raw=readFileSync){
 assert(Object.hasOwn(potionShopCiPacket.viewCommits,target));
 assertPotionShopCiCurrent(raw);
 const sources=new Map(Object.entries(potionShopCiPacket.files).filter(([,row])=>row.views[target]).map(([p,row])=>[p,row.views[target].source]));
 return(path,encoding)=>sources.has(path)?encoding?sources.get(path):Buffer.from(sources.get(path)):raw(path,encoding);
}
