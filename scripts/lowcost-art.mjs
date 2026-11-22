import {readFileSync} from 'node:fs';
export const eventArtRegistry = 'data/presentation/event-native-controls.json';
const child=(n,key)=>(n?.controls??n?.children??[]).find(c=>c.name===key);
export function loadLowCostArt(){
 const result={};
 for(const [kind,capacity]of [['relic',16],['enemy',32]]){
  const source=JSON.parse(readFileSync(new URL(`../data/presentation/lowcost-${kind}-art.json`,import.meta.url),'utf8'));
  if(source.schemaVersion!==1||source.canvas!==100||source.capacity!==capacity||!Object.keys(source.assets??{}).length)throw Error('Invalid low-cost artwork registry: '+kind);
  for(const [id,asset]of Object.entries(source.assets)){
   if(!asset.name||!Array.isArray(asset.shapes)||!asset.shapes.length||asset.shapes.length>capacity)throw Error('Invalid artwork capacity: '+id);
   for(const shape of asset.shapes)if(![100001,100002,100003].includes(shape.image)||
    ![shape.x,shape.y,shape.w,shape.h,shape.rotation??0].every(Number.isFinite)||shape.w<=0||shape.h<=0||
    Math.abs(shape.x)+shape.w/2>72||Math.abs(shape.y)+shape.h/2>72||!/^#[0-9a-f]{6}$/i.test(shape.colour))throw Error('Invalid artwork shape: '+id);
  }
  result[kind]=source;
 }
 return result;
}
export function loadEventArt(path, eventIds) {
  const source = JSON.parse(readFileSync(path, 'utf8'));
  const canvas = 330, capacity = 60;
  const fits = source.fits ?? {};
  if (source.schemaVersion !== 1 || source.exportHalfMaskMode !== 'left-mirror-x' ||
      !Array.isArray(source.canvas) || source.canvas.length !== 2 || !source.canvas.every(size => size === canvas) ||
      !eventIds.length || new Set(eventIds).size !== eventIds.length ||
      Object.keys(fits).length !== eventIds.length || !eventIds.every(id => Object.hasOwn(fits, id))) {
    throw Error('Event artwork must contain the exact Release event IDs and a 330px control catalog');
  }
  const pair = value => Array.isArray(value) && value.length === 2 && value.every(Number.isFinite);
  const assets = {}, unavailable = [];
  for (const id of eventIds) {
    const root = fits[id]?.controlTree;
    if (root?.name !== id || root.kind !== 'container' || root.raycastTarget !== false ||
        !pair(root.size) || !root.size.every(size => size === canvas) ||
        !pair(root.position) || !root.position.every(position => position === 0) ||
        !Array.isArray(root.children) || root.children.length < 1 || root.children.length > capacity) {
      throw Error('Invalid event artwork pool input: ' + id);
    }
    const shapes = root.children.map(shape => {
      const {image, position, size, fill, opacity, colour} = shape;
      const rotation = Array.isArray(shape.rotation) ? shape.rotation : [0, 0, shape.rotation ?? 0];
      const pivot = shape.pivot ?? [.5, .5], scale = shape.scale ?? [1, 1];
      if (shape.kind !== 'image' || shape.raycastTarget !== false || ![100001, 100003].includes(image) ||
          !pair(position) || !pair(size) || !size.every(value => value > 0) ||
          rotation.length !== 3 || !rotation.every(Number.isFinite) ||
          !pair(pivot) || !pivot.every(value => value >= 0 && value <= 1) ||
          !pair(scale) || !scale.every(value => Math.abs(value) === 1) ||
          !/^#[0-9a-f]{6}$/i.test(colour) || !Number.isFinite(opacity) || opacity <= 0 || opacity > 1 ||
          (fill && (image !== 100003 || fill.shape !== 'horizontal' || fill.from !== 'right' || fill.amount !== .5))) {
        throw Error('Invalid event artwork shape: ' + id + '/' + shape.name);
      }
      return {image, x:position[0], y:position[1], w:size[0], h:size[1], rotation,
        pivot, scale, halfMask:Boolean(fill), colour:colour + Math.round(opacity * 255).toString(16).padStart(2, '0')};
    });
    // Very large single-axis triangles at a rounded 90° lose usable precision.
    // Keep the existing picture for an event whose fit exceeds this local bound.
    if (shapes.some(shape => Math.max(shape.w, shape.h) > 2 * canvas)) unavailable.push(id);
    else assets[id] = {shapes};
  }
  return {canvas, capacity, assets, unavailable};
}
function pool(icon,capacity,canvas=100,shape={image:100001}){return {name:icon.name+'Art',kind:'container',position:[...(icon.position??[0,0])],size:[canvas,canvas],visible:false,raycastTarget:false,
 children:Array.from({length:capacity},(_,i)=>({name:'shape'+i,kind:'image',size:[1,1],colour:'#FFFFFF',visible:false,raycastTarget:false,...shape}))};}
export function attachLowCostArt(tree,eventArt){
 function walk(node,path=''){
  path+='/'+node.name;const children=node.controls??node.children??[];
  for(const c of [...children])walk(c,path);
  const portrait=child(node,'portrait');
  if(portrait&&node.name==='AbyssMonsterActor'&&!child(node,'portraitArt'))children.splice(children.indexOf(portrait)+1,0,pool(portrait,32));
  const icon=child(node,'icon');
  const relic= /\/relicBar\/slot\d+$/.test(path)||/\/relicPanel\/(row\d+\/slot|single)$/.test(path)||
   /\/shopView\/relic\d+$/.test(path)||/\/treasureView\/(reward|rewardItem\d+)$/.test(path);
  if(icon&&relic&&!child(node,'iconArt'))children.splice(children.indexOf(icon)+1,0,pool(icon,16));
  const rewardIcon=child(node,'rewardIcon');
  if(rewardIcon&&/\/relicReward[12]\/[^/]+$/.test(path)&&!child(node,'rewardIconArt'))
   children.splice(children.indexOf(rewardIcon)+1,0,pool(rewardIcon,16));
  if(eventArt&&path.endsWith('/nodePanel/eventView')&&!child(node,'artArt')){
   const art=child(node,'art');
   if(!art)throw Error('Event artwork requires the existing event picture');
   // Native runtime setters require serialized fill support on every reused slot.
   const halfTriangle={image:100003,fill:{shape:'horizontal',from:'right',amount:.5}};
   children.splice(children.indexOf(art)+1,0,pool(art,eventArt.capacity,eventArt.canvas,halfTriangle));
  }
 }
 walk(tree);return tree;
}
