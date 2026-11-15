import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

export const productionPotions=['blood_potion','elixir','heart_of_iron','block_potion','dexterity_potion','energy_potion','explosive_potion','fire_potion','strength_potion','swift_potion','weak_potion','fear_potion','attack_potion','skill_potion','power_potion','colorless_potion','flex_potion','speed_potion','blessing_of_the_forge','regen_potion','ancient_potion','liquid_bronze','gamblers_brew','essence_of_steel','duplication_potion','distilled_chaos','liquid_memories','cultist_potion','fruit_juice','snecko_oil','fairy_in_a_bottle','smoke_bomb','entropic_brew'];
export const foreignPotions=['poison_potion','cunning_potion','ghost_in_a_jar','focus_potion','potion_of_capacity','essence_of_darkness','bottled_miracle','stance_potion','ambrosia'];

export function validatePotionArt(registry){
 if(registry.schemaVersion!==1||registry.canvas!==100||registry.capacity!==10)throw Error('Invalid potion art format');
 const wanted=[...productionPotions,...foreignPotions].sort();
 if(JSON.stringify(Object.keys(registry.assets).sort())!==JSON.stringify(wanted))throw Error('Potion art must cover exact full-source42');
 const signatures=new Set();let count=0,max=0;
 for(const [id,asset]of Object.entries(registry.assets)){
  if(!asset.name||!asset.motif||!asset.meaning||asset.production!==productionPotions.includes(id))throw Error('Missing semantic receipt: '+id);
  if(!asset.shapes.length||asset.shapes.length>registry.capacity)throw Error('Potion art capacity: '+id);
  for(const s of asset.shapes){
   if(![100001,100002,100003].includes(s.image)||![s.x,s.y,s.w,s.h,s.rotation??0].every(Number.isFinite)||s.w<=0||s.h<=0||!/^#[0-9a-f]{6}$/i.test(s.colour))throw Error('Invalid potion primitive: '+id);
   const a=(s.rotation??0)*Math.PI/180;
   if(Math.abs(s.x)+(Math.abs(s.w*Math.cos(a))+Math.abs(s.h*Math.sin(a)))/2>50.01||Math.abs(s.y)+(Math.abs(s.w*Math.sin(a))+Math.abs(s.h*Math.cos(a)))/2>50.01)throw Error('Potion art outside canvas: '+id);
  }
  // Deliberately ignore colour: recolouring one bottle is not a new illustration.
  const signature=JSON.stringify(asset.shapes.map(({colour,...shape})=>shape));
  if(signatures.has(signature))throw Error('Duplicate potion geometry: '+id);signatures.add(signature);
  count+=asset.shapes.length;max=Math.max(max,asset.shapes.length);
 }
 return {fullSource:42,production:33,shapes:count,maxShapes:max,capacity:registry.capacity,sha256:createHash('sha256').update(JSON.stringify(registry)).digest('hex')};
}
export function loadPotionArt(path=new URL('../data/presentation/lowcost-potion-art.json',import.meta.url)){
 const registry=JSON.parse(readFileSync(path,'utf8'));validatePotionArt(registry);return registry;
}
