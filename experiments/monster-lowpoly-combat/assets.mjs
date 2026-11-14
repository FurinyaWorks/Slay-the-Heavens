// Experiment adapter: reuse V25 primitive placement and the production actor pool.
import fs from 'node:fs';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
import {nativeShape} from '../../scripts/v25-battle-scene.mjs';
export const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
export function asset(enemy,budget){
 const file=`experiments/monster-lowpoly-combat/results/${enemy}/budget-${budget}.json`,pack=JSON.parse(fs.readFileSync(file)),k=106/Math.max(pack.width,pack.height);
 const nodes=pack.shapes.flatMap((s,i)=>{
  if(s.type==='ellipse')return [{image:100002,position:[(s.box[0]+s.box[2]/2-pack.width/2)*k,(pack.height/2-s.box[1]-s.box[3]/2)*k],size:[s.box[2]*k,s.box[3]*k],rotation:[0,0,0],colour:s.colour}];
  if(s.type==='nativeTriangle'){const p=s.placement;return [{image:100003,position:[(p.cx-pack.width/2)*k,(p.cy-pack.height/2)*k],size:[p.w*k,p.h*k],rotation:[p.rx,p.ry,p.rz],colour:s.colour}];}
  return nativeShape({...s,name:'fit'+i,opacity:1},{image:{rect:100001}}).map(n=>({...n,position:[(n.position[0]+640-pack.width/2)*k,(n.position[1]-338+pack.height/2)*k],size:n.size.map(v=>v*k),rotation:[0,0,n.rotation??0],fitHalf:!!n.fill}));
 });
 assert.equal(nodes.length,pack.nativeImages);
 const slots=nodes.map(n=>({image:n.image,position:n.position,size:n.size,pivot:n.pivot??[.5,.5],anchorMin:[.5,.5],anchorMax:[.5,.5],scale:n.scale??[1,1],rotation:n.rotation,
 colour:[1,3,5].map(i=>parseInt(n.colour.slice(i,i+2),16)).concat(255),imageType:'stretch',fitHalf:n.fitHalf===true}));
 for(const s of slots){assert([100001,100002,100003].includes(s.image));assert([...s.position,...s.size,...s.rotation].every(Number.isFinite));assert(s.size.every(v=>v>0));}
 return {enemyId:enemy,cardId:enemy,slots,capacity:slots.length,sourceSha256:pack.sourceSha256,luaSha256:sha(file),jsonSha256:sha(file),budget};
}
export function registry(slime=350,guard=500){
 assert([100,200,350,'old'].includes(slime));assert([200,350,500,'old'].includes(guard));
 const retained=JSON.parse(fs.readFileSync('data/presentation/native-monster-art.json'));
 const assets=Object.fromEntries([['large-geo-slime',slime],['ruin-guard',guard]].map(([id,b])=>{
  if(b!=='old')return [id,asset(id,b)];
  const a=structuredClone(retained.additionalAssets[id]);a.cardId=id;a.budget='old';a.sourceSha256=asset(id,id==='large-geo-slime'?350:500).sourceSha256;return [id,a];
 }));
 const capacity=Math.max(...Object.values(assets).map(a=>a.slots.length));for(const a of Object.values(assets))a.capacity=capacity;
 return {schemaVersion:1,enabled:true,canvas:[106,106],poolCapacity:capacity,asset:assets['large-geo-slime'],assets,bindings:{spike_slime_l:'large-geo-slime',lagavulin:'ruin-guard'},experiment:true};
}
export function adaptCardDisplay(source){
 source=source.replaceAll('\r\n','\n');
 const anchor='    control:SetVisible(true)\nend\nlocal function writeStaticNativeArt';assert.equal(source.split(anchor).length,2);
 return source.replace(anchor,`    -- Candidate-only half-triangle adaptation; templates serialize fill support.
    control.enableMask=slot.fitHalf==true
    if slot.fitHalf then control:SetFillHorizontal(Enum.ImageFillHorizontalType.Right,.5)
    else control:SetFillUnused()end
`+anchor);
}
