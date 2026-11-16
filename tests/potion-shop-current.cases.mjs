import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {potionShopCiPacket as packet,assertPotionShopCiCurrent,potionShopHistoricalRead,potionShopCiSource,potionShopPriorInventory,assertPotionShopRawInventory} from './helpers/potion-shop-ci-source.mjs';

for (const target of ['potion','shop']) for (const warmed of [false,true]) {
 test(`potion/shop ${target} ${warmed?'warm':'cold'} union rejects complete corpus faults`,()=>{
  const anchor=Object.keys(packet.files).find(p=>!p.startsWith('src/')&&packet.files[p].views[target]&&packet.files[p].views[target].sha256!==packet.files[p].current.sha256);
  assert(anchor,'a genuinely projected non-production anchor');
  let fault=null;
  const raw=(p,e)=>{
   if(p===fault?.path){
    if(fault.kind==='missing')throw Error('missing '+p);
    if(fault.kind==='null')return null;
    return e?readFileSync(p,e)+'\nFAULT':Buffer.concat([readFileSync(p),Buffer.from('FAULT')]);
   }
   return readFileSync(p,e);
  };
  const historical=potionShopHistoricalRead(target,raw);
  const convert=()=>potionShopCiSource(anchor,packet.files[anchor].current.source,raw,target);
  const prior=packet.files[anchor].views[target].source;
  const inventories=()=>{
   for(const kind of ['js','lua'])assert.deepEqual(potionShopPriorInventory(packet.currentInventory[kind],kind,raw,target),packet.viewInventories[target][kind]);
  };
  assertPotionShopCiCurrent(raw);
  for(const path of [...Object.keys(packet.files),...Object.keys(packet.immutableArchives)]) for(const kind of ['missing','null','drift']){
   fault=null;
   if(warmed){assert.equal(historical(anchor,'utf8'),prior);assert.equal(convert(),prior);inventories();}
   fault={path,kind};
   const label=`${target} ${path} ${kind}`;
   if(path===anchor&&kind==='null')assert.equal(historical(anchor,'utf8'),null,label);
   else if(path===anchor&&kind==='drift')assert.equal(historical(anchor,'utf8'),raw(anchor,'utf8'),label);
   else assert.throws(()=>historical(anchor,'utf8'),label);
   assert.throws(convert,label);
   for(const inventoryKind of ['js','lua'])assert.throws(()=>potionShopPriorInventory(packet.currentInventory[inventoryKind],inventoryKind,raw,target),label+' '+inventoryKind);
  }
  fault=null;
  assert.equal(historical(anchor,'utf8'),prior);assert.equal(convert(),prior);inventories();
  for(const kind of ['js','lua']){
   const full=packet.currentInventory[kind];assertPotionShopRawInventory(full,kind);
   for(const bad of [full.slice(1),[...full,full[0]],[...full,'foreign']]){
    assert.throws(()=>assertPotionShopRawInventory(bad,kind));
    assert.throws(()=>potionShopPriorInventory(bad,kind,raw,target));
   }
  }
 });
}
