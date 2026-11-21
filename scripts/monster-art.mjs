// Source artwork is shared; each monster instance owns a candidate-bound output surface.
import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {enemyUnitTemplate,enemyPowerTemplate} from './ui-layout.mjs';
import {createHash} from 'node:crypto';
import {nativeArtPool,validateNativeCardArt} from './card-art-samples.mjs';
import {toLua} from './build-lua-data.mjs';

const compactSlotKeys=['anchorMax','anchorMin','colour','image','imageType','pivot','position','rotation','scale','size'];
function compactMonsterSlot(slot){
  const same=(value,expected)=>JSON.stringify(value)===JSON.stringify(expected);
  const vector=(value,count)=>Array.isArray(value)&&value.length===count&&value.every(Number.isFinite);
  if(!same(Object.keys(slot).sort(),compactSlotKeys)||!['anchorMax','anchorMin','pivot'].every(key=>same(slot[key],[.5,.5]))
    ||!same(slot.scale,[1,1])||![100001,100002,100003].includes(slot.image)||!['basic','stretch'].includes(slot.imageType)
    ||!vector(slot.position,2)||!vector(slot.size,2)||!vector(slot.rotation,3)||!vector(slot.colour,4))throw Error('Unsupported compact monster slot');
  return [slot.image,slot.imageType==='basic'?0:1,...slot.position,...slot.size,...slot.rotation,...slot.colour].join(',');
}
export function monsterArtPayloadSource(art){
  const header='-- Generated from the bounded native monster registry.\n';
  if(art?.status!=='refined-release')return `${header}return ${toLua(art??{})}\n`;
  const packed={...art,assets:Object.fromEntries(Object.entries(art.assets).map(([id,asset])=>
    [id,{...asset,slots:asset.slots.map(compactMonsterSlot).join(';')}]))};
  // Retain every numeric spelling and restore independent mutable arrays once
  // at module load, before the existing renderer receives the original schema.
  return `${header}local art=${toLua(packed)}
for _,asset in pairs(art.assets) do
 local slots={}
 for row in string.gmatch(asset.slots,"[^;]+") do
  local v={}
  for number in string.gmatch(row,"[^,]+") do v[#v+1]=assert(tonumber(number)) end
  slots[#slots+1]={image=v[1],imageType=v[2]==0 and "basic" or "stretch",
   position={v[3],v[4]},size={v[5],v[6]},rotation={v[7],v[8],v[9]},colour={v[10],v[11],v[12],v[13]},
   anchorMin={0.5,0.5},anchorMax={0.5,0.5},pivot={0.5,0.5},scale={1,1}}
 end
 asset.slots=slots
end
return art\n`;
}
export const monsterSourceInputs=Object.freeze(['art/monsters/acid_slime_m/native-art-r02/native-art.lua','art/monsters/acid_slime_m/native-art-r02/native-art.json']);
export function prepareMonsterArt(input) {
  const registry=input??JSON.parse(readFileSync('data/presentation/native-monster-art.json','utf8'));
  const inputPaths=[];
  if(!input&&registry.enabled) {
    if(!Array.isArray(registry.sourceInputs)||registry.sourceInputs.length!==4)throw new Error('Missing monster art provenance');
    for(const [index,record] of registry.sourceInputs.entries()) {
      if(typeof record.path!=='string'||!record.path.startsWith(index<2?'art/monsters/acid_slime_m/native-art-r02/':'art/monster-benchmarks/genshin-v1/dendro-slime/')||record.path.includes('..')||!/^([a-f0-9]{64})$/.test(record.sha256))throw new Error('Invalid monster art source record');
      // Raw source PNG/prompt are provenance, not runtime image dependencies.
      if(index<2) {
        if(record.path!==`art/monsters/acid_slime_m/native-art-r02/native-art.${index===0?'lua':'json'}`||record.sha256!==registry.asset?.[index===0?'luaSha256':'jsonSha256'])throw new Error('Monster art provenance identity mismatch');
        if(createHash('sha256').update(readFileSync(record.path)).digest('hex')!==record.sha256)throw new Error('Monster native source hash mismatch');
        inputPaths.push(record.path);
      }
    }
  }
  if(registry.schemaVersion!==1||typeof registry.enabled!=='boolean'||![undefined,1,5].includes(registry.poolCount))throw new Error('Invalid monster art registry');
  if(!registry.enabled)return null;
  const asset=registry.asset;
  if(asset?.enemyId!=='acid_slime_m'||!Array.isArray(registry.canvas)||registry.canvas.length!==2||registry.canvas.some(n=>!Number.isFinite(n)||n<=0)
    ||!Array.isArray(asset.slots)||asset.slots.length>600||asset.slots.some(slot=>![100001,100002,100003].includes(slot.image)))throw new Error('Invalid bounded monster art asset');
  // Keep the mature native slot/type validation, without loosening its contract.
  const capacity=validateNativeCardArt({schemaVersion:2,editorCommit:'103025f9095d8089e3f9bf097f4d0c5fe039d546',canvas:[144,64],
    assets:{cleave:{...asset,cardId:'cleave'}}});
  const assets={[asset.enemyId]:{...structuredClone(asset),cardId:asset.enemyId,capacity}};
  const bindings=registry.bindings??{[asset.enemyId]:asset.enemyId};
  if(!bindings||typeof bindings!=='object'||Array.isArray(bindings)||Object.keys(bindings).length>42||Object.keys(registry.additionalAssets??{}).length>41)throw new Error('Invalid bounded monster catalog');
  for(const [id,entry] of Object.entries(registry.additionalAssets??{})) {
    if(!/^[a-z][a-z0-9-]+$/.test(id)||entry.enemyId!==id||assets[id]||!Array.isArray(entry.slots)||entry.slots.length>600||entry.slots.some(slot=>![100001,100002,100003].includes(slot.image)))throw new Error('Invalid additional monster art asset');
    const count=validateNativeCardArt({schemaVersion:2,editorCommit:'103025f9095d8089e3f9bf097f4d0c5fe039d546',canvas:[144,64],assets:{cleave:{...entry,cardId:'cleave'}}});
    if(!Array.isArray(entry.sourceInputs)||entry.sourceInputs.length!==2)throw new Error('Missing additional monster provenance');
    for(const [index,record] of entry.sourceInputs.entries()) {
      const extension=index===0?'lua':'json';
      if(record.path!==`art/monster-benchmarks/${['pyro-abyss-mage','geovishap-hatchling','stonehide-lawachurl'].includes(id)?'genshin-v1':'genshin-v2'}/${id}/native-art.${extension}`||record.sha256!==entry[extension+'Sha256'])throw new Error('Additional monster provenance identity mismatch');
      if(!input&&createHash('sha256').update(readFileSync(record.path)).digest('hex')!==record.sha256)throw new Error('Additional monster source hash mismatch');
      inputPaths.push(record.path);
    }
    assets[id]={...structuredClone(entry),cardId:id,capacity:count};
  }
  for(const [enemy,id] of Object.entries(bindings))if(!/^[a-z][a-z0-9_]+$/.test(enemy)||!Object.hasOwn(assets,id))throw new Error('Invalid monster binding');
  if(!Object.keys(assets).every(id=>Object.values(bindings).includes(id)))throw new Error('Unbound monster art asset');
  const poolCapacity=Math.max(...Object.values(assets).map(a=>a.capacity));
  for(const entry of Object.values(assets))entry.capacity=poolCapacity;
  // Validate the complete retained catalog above before selecting candidate payloads.
  const allow=registry.candidateAssets;
  if(allow!==undefined&&(!Array.isArray(allow)||allow.length===0||new Set(allow).size!==allow.length
    ||allow.some(id=>typeof id!=='string'||!Object.hasOwn(assets,id))||!allow.includes(asset.enemyId)))throw Error('Invalid monster candidate asset whitelist');
  const selected=allow?new Set(allow):null;
  const selectedAssets=Object.fromEntries(Object.entries(assets).filter(([id])=>!selected||selected.has(id)));
  const additionalAssets=Object.fromEntries(Object.entries(registry.additionalAssets??{}).filter(([id])=>!selected||selected.has(id)));
  const selectedBindings=Object.fromEntries(Object.entries(bindings).filter(([,id])=>!selected||selected.has(id)));
  const selectedPaths=new Set(Object.values(additionalAssets).flatMap(entry=>entry.sourceInputs.map(record=>record.path)));
  return {...structuredClone(registry),additionalAssets,inputPaths:inputPaths.filter(path=>monsterSourceInputs.includes(path)||selectedPaths.has(path)),
    assets:selectedAssets,bindings:selectedBindings,poolCapacity,asset:selectedAssets[asset.enemyId]};
}
export const monsterPowerTemplateName='AbyssMonsterPower';
export const monsterActorTemplateName='AbyssMonsterActor';
export const monsterActorBindingModule='abyss_monster_actor_binding';
export function monsterActorTemplate(art) {
  const actor=enemyUnitTemplate(monsterActorTemplateName);
  actor.visible=false;
  if(art) {
    const pool=nativeArtPool(art.poolCapacity??art.asset.capacity);
    pool.name='monsterSamples';pool.position=[0,0];pool.size=[...art.canvas];
    for(const group of pool.children)group.size=[...art.canvas];
    const host={name:'monsterArt',kind:'container',position:[0,0],size:[...art.canvas],visible:false,children:[pool]};
    actor.children.unshift(host);
  }
  return actor;
}
// Bounded physical capacities for the refined profile. Legacy fixtures retain
// monsterActorTemplate() and their historical shared-pool contract.
export const monsterActorTierCapacities=Object.freeze([41,96,115]);
export const monsterActorTierNames=Object.freeze(monsterActorTierCapacities.map(n=>monsterActorTemplateName+n));
export function refinedMonsterTierNames(receipt) {
  const tiers=receipt?.monsterActors?.tiers;
  if(!tiers||Object.keys(tiers).length!==monsterActorTierNames.length||
    monsterActorTierNames.some(name=>!Object.hasOwn(tiers,name)))throw Error('Invalid refined monster tier inventory');
  return monsterActorTierNames;
}
export function monsterActorTiers(art) {
  const templates=[monsterActorTemplate(null)];
  if(!art)return {templates,templateByDefinition:{},artData:null};
  const occupied=new Set();
  const assets=Object.fromEntries(Object.entries(art.assets).map(([id,asset])=>{
    const count=asset.slots?.length;
    const capacity=monsterActorTierCapacities.find(n=>Number.isSafeInteger(count)&&count>0&&count<=n);
    if(!capacity)throw Error('Invalid refined monster drawing capacity: '+id);
    return [id,{...asset,capacity}];
  }));
  const templateByDefinition=Object.fromEntries(Object.entries(art.bindings).map(([definition,id])=>{
    if(!Object.hasOwn(assets,id))throw Error('Invalid refined monster template binding: '+definition);
    const capacity=assets[id].capacity;
    occupied.add(capacity);
    return [definition,monsterActorTemplateName+capacity];
  }));
  const tiers=monsterActorTierCapacities.filter(n=>occupied.has(n));
  for(const capacity of tiers) {
    const template=monsterActorTemplate({...art,poolCapacity:capacity});
    template.name=monsterActorTemplateName+capacity;
    templates.push(template);
  }
  // CardDisplay iterates metadata.capacity to clear each physical shape. Never
  // serialize the shared maximum into a smaller tier's selected asset.
  const artData={...art,assets,poolCapacity:tiers.at(-1)??0};
  if(art.asset)artData.asset=assets[art.asset.enemyId];
  return {templates,templateByDefinition,artData};
}
export function attachMonsterArt(tree,art) {
  let found=0;
  function visit(node) {
    const children=node.children??node.controls??[];
    const layer=children.find(c=>c.name==='actorLayer');
    if(layer) {
      if(layer.kind!=='container'||layer.mask||layer.children?.length||JSON.stringify(layer.position)!=='[0,0]')throw Error('Invalid empty monster actor layer');
      if(children.some(c=>/^enemy[0-9]+$/.test(c.name)))throw Error('Static enemies cannot coexist with dynamic actor surfaces');
      found++;
    }
    for(const child of children)visit(child);
  }
  visit(tree);
  if(found!==1)throw Error('Missing or ambiguous monster actor layer');
  if(art)art.hostOrigin=[0,0];
}
export function writeMonsterActorBinding(directory,{templateIndex=0,containerTemplateIndex=0,powerTemplateIndex=0,enabled=false,templateIndexByDefinition}={}) {
  for(const index of [templateIndex,containerTemplateIndex,powerTemplateIndex])if(!Number.isSafeInteger(index)||index<0)throw Error('Invalid monster actor template index');
  if(enabled&&(!templateIndex||!containerTemplateIndex||!powerTemplateIndex||new Set([templateIndex,containerTemplateIndex,powerTemplateIndex]).size!==3))throw Error('Monster actor binding requires distinct positive template indices');
  let tierBindings='';
  if(templateIndexByDefinition!==undefined){
    if(!enabled||!templateIndexByDefinition||Array.isArray(templateIndexByDefinition)||typeof templateIndexByDefinition!=='object')throw Error('Invalid refined actor binding');
    const entries=Object.entries(templateIndexByDefinition);
    if(entries.length!==42||entries.some(([key,index])=>!/^[a-z][a-z0-9_]+$/.test(key)||!Number.isSafeInteger(index)||index<=0||
      [templateIndex,containerTemplateIndex,powerTemplateIndex].includes(index)))throw Error('Invalid refined actor binding entry');
    tierBindings=',templateIndexByDefinition={'+entries.map(([key,index])=>`[${JSON.stringify(key)}]=${index}`).join(',')+'}';
  }
  writeFileSync(join(directory,monsterActorBindingModule+'.lua'),`-- Candidate-local bindings; zero is an unbound offline preview, not a playable candidate.\nreturn {templateIndex=${templateIndex},containerTemplateIndex=${containerTemplateIndex},powerTemplateIndex=${powerTemplateIndex},enabled=${enabled?'true':'false'}${tierBindings}}\n`);
}
export function bindMonsterActorTemplates(directory,{actor,group,power,templateIndexByDefinition}) {
  for(const result of [actor,group,power])if(!Number.isSafeInteger(result?.templateIndex)||result.templateIndex<=0)throw Error('Missing actual monster actor template index');
  writeMonsterActorBinding(directory,{templateIndex:actor.templateIndex,containerTemplateIndex:group.templateIndex,powerTemplateIndex:power.templateIndex,enabled:true,templateIndexByDefinition});
}
export function monsterActorInventory(template) {
  const count=node=>1+(node.children??[]).reduce((total,child)=>total+count(child),0);
  const shapes=node=>(/^shape[0-9]+$/.test(node.name)?1:0)+(node.children??[]).reduce((total,child)=>total+shapes(child),0);
  return {templateName:monsterActorTemplateName,controlsPerActor:count(template),shapesPerActor:shapes(template),
    powerTemplateName:monsterPowerTemplateName,controlsPerPower:count(enemyPowerTemplate()),powerAllocation:'per-power-instance',
    allocation:'per-drawable-actor-instance',measurement:'offline-template-count-not-official-load',officialImport:'not_run',devices:'not_run'};
}
