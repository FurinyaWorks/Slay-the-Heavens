// Native storage factoring only. Authored UI remains the logical contract;
// references create independent native instances, with no new Lua update work.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {isReadyCardHost} from './art/ready-card-runtime.mjs';
export const sharedCardPrefix='AbyssSharedCardFace';
export const cardSharingProfile='native-card-face-sharing-v1';
const children=n=>n.controls??n.children??[];
const rootFields=new Set(['name','kind','children','size','position','scale','rotation','pivot','anchor','visible','active','focusable','devices']);
const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const count=n=>1+children(n).reduce((sum,c)=>sum+count(c),0);
const total=(layout,templates)=>count(layout)+templates.reduce((sum,t)=>sum+count(t),0);
const hasNavigation=n=>Object.hasOwn(n,'navigation')||children(n).some(hasNavigation);
const localChildren=n=>children(n).every(c=>!['script','scripts','navigation'].some(k=>Object.hasOwn(c,k))&&localChildren(c));
const owns=name=>typeof name==='string'&&name.startsWith(sharedCardPrefix);
export function packNativeCardFaces(layout,templates,{enabled=true}={}){
 const original=structuredClone({layout,templates}),packed=structuredClone(original),groups=new Map();let logicalHosts=0;
 // Native name/path navigation is settled inside one physical scope. Preserve
 // all authored paths whenever any explicit target exists, including outsiders.
 enabled=enabled&&![layout,...templates].some(hasNavigation);
 function scan(node,withinHost=false){
  const host=isReadyCardHost(node);
  if(host){
   logicalHosts++;
   // A Reference cannot carry Container-only flags or private root scripts.
   if(!withinHost&&enabled&&node.kind==='container'&&Object.keys(node).every(k=>rootFields.has(k))
    &&Array.isArray(node.size)&&node.size.length===2&&localChildren(node)){
    const key=JSON.stringify({size:node.size,children:node.children});
    if(!groups.has(key))groups.set(key,[]);groups.get(key).push(node);
   }
  }
  for(const child of children(node))scan(child,withinHost||host);
 }
 [packed.layout,...packed.templates].forEach(node=>scan(node));
 const shared=[];let sharedHosts=0;
 if(enabled)assert(!templates.some(t=>owns(t.name)),'Reserved shared card template in authored inputs');
 for(const rows of groups.values()){
  if(rows.length<2||(rows.length-1)*(count(rows[0])-1)<=1)continue;
  const sample=rows[0],name=sharedCardPrefix+(shared.length+1);
  shared.push({name,kind:'container',size:structuredClone(sample.size),children:structuredClone(sample.children)});
  for(const node of rows){node.kind='reference';node.template=name;delete node.children;sharedHosts++;}
 }
 packed.templates.unshift(...shared);
 const sharing={schemaVersion:1,profile:cardSharingProfile,logicalHosts,sharedHosts,templateNames:shared.map(t=>t.name),
  beforeControls:total(layout,templates),afterControls:total(packed.layout,packed.templates),sourceDigest:digest(original),packedDigest:digest(packed)};
 assert(!sharing.sharedHosts||sharing.afterControls<sharing.beforeControls,'Shared native storage must reduce physical records');
 assert.deepEqual(expandSharedCardFaces(packed.layout,packed.templates),original,'Shared native card storage must reconstruct the complete authored UI');
 return {...packed,sharing};
}
export function expandSharedCardFaces(layout,templates){
 const known=new Map();for(const t of templates){assert(!known.has(t.name),'Duplicate template name');known.set(t.name,t);}
 function expand(node,stack=[]){
  if(Array.isArray(node))return node.map(n=>expand(n,stack));
  if(!node||typeof node!=='object')return node;
  if(node.kind==='reference'&&owns(node.template)){
   const target=known.get(node.template);assert(target,'Missing shared card template: '+node.template);
   assert(!stack.includes(node.template),'Shared card template cycle');
   assert(target.kind==='container'&&JSON.stringify(target.size)===JSON.stringify(node.size),'Shared card template root mismatch');
   const {template,...root}=node;
   return {...structuredClone(root),kind:'container',children:expand(target.children,[...stack,template])};
  }
  return Object.fromEntries(Object.entries(node).map(([k,v])=>[k,expand(v,stack)]));
 }
 return {layout:expand(layout),templates:templates.filter(t=>!owns(t.name)).map(t=>expand(t))};
}

// Bind the compiler's complete deterministic definition set, never a subset.
export function cardSharingBindings(sharing,indices){
 assert(sharing?.schemaVersion===1&&sharing.profile===cardSharingProfile,'Unsupported shared card packing profile');
 const names=sharing.templateNames;
 assert(Array.isArray(names)&&new Set(names).size===names.length&&names.every((name,i)=>name===sharedCardPrefix+(i+1)),'Invalid shared card template names');
 assert(indices&&typeof indices==='object'&&!Array.isArray(indices)&&Object.keys(indices).length===names.length,'Incomplete shared card template bindings');
 const ids=names.map(name=>indices[name]);
 assert(names.every(name=>Object.hasOwn(indices,name))&&ids.every(id=>Number.isSafeInteger(id)&&id>0)&&new Set(ids).size===ids.length,'Invalid shared card template bindings');
 return Object.fromEntries(names.map(name=>[name,indices[name]]));
}
export function assertSharedCardBaseOwnership(baseSha,prior,actualTemplates){
 const actual=actualTemplates.filter(t=>owns(t.name));
 if(!actual.length&&!prior?.nativeUiPacking)return [];
 assert(prior?.candidate?.sha256===baseSha&&prior.nativeUiPacking,'Unowned shared card templates: shared template ownership is unknown');
 const bindings=cardSharingBindings(prior.nativeUiPacking.sharing,prior.nativeUiPacking.templateIndices);
 assert.deepEqual(actual.map(t=>[t.name,t.templateIndex]).sort(),Object.entries(bindings).sort(),'Shared card template ownership differs from the base receipt');
 return Object.keys(bindings);
}
export function assertNoExternalSharedCardReferences(spec){
 function visit(n){assert(!(n.kind==='reference'&&owns(n.template)||n.kind==='grid'&&(owns(n.itemTemplate)||owns(n.grid?.itemTemplate))),'External UI still references an owned shared card template');for(const c of children(n))visit(c);}
 visit(spec);
}
export function assertCardSharingPlan(layout,templates,packing){
 cardSharingBindings(packing?.sharing,packing?.templateIndices);
 const expected=packNativeCardFaces(layout,templates);
 assert.deepEqual(packing.sharing,expected.sharing,'Shared card packing differs from complete same-source plan');
 return expected;
}
