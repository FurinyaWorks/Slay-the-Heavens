import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {loadPotionArt,validatePotionArt,productionPotions,foreignPotions} from '../scripts/potion-art.mjs';

test('potion illustrations match actual registered full-source42 and the independent competition33 sampler',()=>{
 const source=readFileSync('src/lua/abyss_potion_random.lua','utf8');
 const ids=section=>[...section.matchAll(/\{'[^']+','([^']+)'/g)].map(m=>m[1]);
 const main=ids(source.slice(source.indexOf('local pool={'),source.indexOf('local rarities=')));
 const classes=ids(source.slice(source.indexOf('local classEntries={'),source.indexOf('local originalCharacters=')));
 assert.deepEqual([...productionPotions].sort(),main.sort());
 assert.deepEqual([...foreignPotions].sort(),classes.sort());
 const names=new Map(JSON.parse(readFileSync('data/potions.json','utf8')).potions.map(row=>[row.id,row.name]));
 for(const path of ['src/lua/abyss_class_potions.lua','src/lua/abyss_silent_potions.lua']){
  const text=readFileSync(path,'utf8');
  for(const row of text.matchAll(/\{id='([^']+)'[^{}\n]*name='([^']+)'/g))names.set(row[1],row[2]);
 }
 const registry=loadPotionArt();assert.equal(names.size,42);
 for(const [id,asset]of Object.entries(registry.assets))assert.equal(asset.name,names.get(id),id+' diverged from real definition');
 const metrics=validatePotionArt(registry);
 assert.equal(metrics.production,33);assert.equal(metrics.fullSource,42);
 assert.ok(metrics.shapes<=420);assert.equal(metrics.maxShapes,10);
});

test('resource guard rejects recoloured copies, missing scope, oversized pools, and rotated overflow',()=>{
 const registry=loadPotionArt(),mutate=change=>{const copy=structuredClone(registry);change(copy);return copy;};
 assert.throws(()=>validatePotionArt(mutate(r=>delete r.assets.energy_potion)),/exact full-source42/);
 assert.throws(()=>validatePotionArt(mutate(r=>r.assets.poison_potion.production=true)),/semantic receipt/);
 assert.throws(()=>validatePotionArt(mutate(r=>r.capacity=16)),/format/);
 assert.throws(()=>validatePotionArt(mutate(r=>{
  r.assets.skill_potion.shapes=structuredClone(r.assets.attack_potion.shapes);
  for(const s of r.assets.skill_potion.shapes)s.colour='#FF0000';
 })),/Duplicate potion geometry/);
 assert.throws(()=>validatePotionArt(mutate(r=>Object.assign(r.assets.fire_potion.shapes[0],{x:35,rotation:45}))),/outside canvas/);
 assert.throws(()=>validatePotionArt(mutate(r=>r.assets.energy_potion.shapes.push(...r.assets.energy_potion.shapes))),/capacity/);
});

test('high-confusion potion families retain distinct colour-independent major geometry',()=>{
 const assets=loadPotionArt().assets;
 for(const family of [
  ['strength_potion','flex_potion'],['dexterity_potion','speed_potion'],
  ['block_potion','heart_of_iron','essence_of_steel'],
  ['attack_potion','skill_potion','power_potion','colorless_potion'],
  ['energy_potion','ancient_potion'],['fire_potion','fear_potion'],
 ]){
  const patterns=family.map(id=>JSON.stringify(assets[id].shapes.slice(4).map(({colour,...shape})=>shape)));
  assert.equal(new Set(patterns).size,family.length,'only tint or bottle shell distinguishes '+family.join('/'));
 }
 // These checks establish geometry; a reviewer must still look at the small sheets.
});

test('archived small-size sheets match frozen recipes and contain actual declared pixel sizes',()=>{
 const directory='docs/evidence/potion-semantic-icons-20261115/';
 const coverage=JSON.parse(readFileSync(directory+'coverage.json','utf8'));
 const source=readFileSync('data/presentation/lowcost-potion-art.json','utf8').replaceAll('\r\n','\n');
 const hash=value=>createHash('sha256').update(value).digest('hex');
 assert.equal(hash(source),coverage.sourceSha256);
 const index=JSON.parse(readFileSync(directory+'gallery-index.json','utf8'));
 assert.equal(index.sourceSha256,coverage.sourceSha256);assert.equal(index.files.length,13);
 assert.deepEqual(index.order,Object.keys(loadPotionArt().assets));
 assert.deepEqual(index.neutral24ExactDuplicatePairs,[]);
 for(const row of index.files){
  const data=readFileSync(directory+row.file);assert.equal(hash(data),row.sha256,row.file);
  assert.equal(data.subarray(1,4).toString(),'PNG');
  if(row.mode==='named')continue;
  assert.equal(data.readUInt32BE(16),7*(row.iconPixels+20));
  assert.equal(data.readUInt32BE(20),6*(row.iconPixels+20));
 }
});
