import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {potionShopCiPacket as packet,assertPotionShopCiCurrent,potionShopHistoricalRead,potionShopCiSource,potionShopPriorInventory,assertPotionShopRawInventory} from './helpers/potion-shop-ci-source.mjs';
import test from 'node:test';
test('potion/shop current union rejects missing null drift after warm reads and raw inventory faults',()=>{
const path=Object.keys(packet.files).find(p=>!p.startsWith('src/')&&packet.files[p].views.potion&&packet.files[p].views.potion.sha256!==packet.files[p].current.sha256);
let fault=null;
const raw=(p,e)=>{if(p===fault?.path){if(fault.kind==='missing')throw Error('missing '+p);if(fault.kind==='null')return null;return e?readFileSync(p,e)+'\nFAULT':Buffer.concat([readFileSync(p),Buffer.from('FAULT')]);}return readFileSync(p,e)};
const historical=potionShopHistoricalRead('potion',raw);
const convert=()=>potionShopCiSource(path,packet.files[path].current.source,raw);
assertPotionShopCiCurrent(raw);assert.equal(historical(path,'utf8'),packet.files[path].views.potion.source);assert.equal(convert(),packet.files[path].views.potion.source);
for(const p of [...Object.keys(packet.files),...Object.keys(packet.immutableArchives)])for(const kind of ['missing','null','drift']){fault={path:p,kind};if(p===path&&kind==='null')assert.equal(historical(path,'utf8'),null);else if(p===path&&kind==='drift')assert.equal(historical(path,'utf8'),raw(path,'utf8'));else assert.throws(()=>historical(path,'utf8'),p+' '+kind);assert.throws(convert,p+' '+kind);fault=null;}
for(const kind of ['js','lua']){const full=packet.currentInventory[kind];assertPotionShopRawInventory(full,kind);assert.deepEqual(potionShopPriorInventory(full,kind,raw),packet.viewInventories.potion[kind]);for(const bad of [full.slice(1),[...full,full[0]],[...full,'foreign']])assert.throws(()=>assertPotionShopRawInventory(bad,kind));}


});
