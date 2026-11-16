import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
const hash=value=>createHash('sha256').update(value).digest('hex');
const center=[.5,.5],same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export function rowsToSlots(data,canvasWidth) {
 const width=(data.logicalSize??[data.width,data.height])[0];
 const rows=data.rows??Object.values(data.imageRows).flat();
 assert(Number.isFinite(width)&&width>0&&rows.length>0&&rows.length<=41);
 const k=canvasWidth/width;
 return rows.map(r=>{
  assert((r.length===20||r.length===21)&&r.every(Number.isFinite));
  assert([100002,100003].includes(r[0])&&(r[20]??0)===0,'unsupported masked or non-native row');
  assert(same(r.slice(5,7),center)&&same(r.slice(7,9),center)&&same(r.slice(9,11),center)&&same(r.slice(11,13),[1,1]),'unsupported pivot/scale');
  assert(r[3]>0&&r[4]>0&&r.slice(14,18).every(x=>Number.isInteger(x)&&x>=0&&x<=255));
  return {image:r[0],position:r.slice(1,3).map(x=>x*k),size:r.slice(3,5).map(x=>x*k),pivot:[...center],anchorMin:[...center],anchorMax:[...center],scale:[1,1],rotation:[r[18],r[19],r[13]],colour:r.slice(14,18),imageType:'stretch'};
 });
}
export function testDrawings(registry,assets,toLua) {
 assert(same(registry.canvas,[106,106]));
 const expected={};
 for(const [enemy,id,path] of assets) {
  assert(!registry.bindings[enemy]&&!registry.additionalAssets[id]);
  const bytes=readFileSync(path);
  const slots=rowsToSlots(JSON.parse(bytes),registry.canvas[0]);
  // These hashes identify actual fixture bytes, not a production exporter or
  // claimed runtime-source files. prepareMonsterArt(input) uses explicit test input.
  const luaSha256=hash(toLua(slots)),jsonSha256=hash(bytes);
  registry.additionalAssets[id]={enemyId:id,slots,luaSha256,jsonSha256,sourceInputs:[
   {path:'art/monster-benchmarks/genshin-v2/'+id+'/native-art.lua',sha256:luaSha256},
   {path:'art/monster-benchmarks/genshin-v2/'+id+'/native-art.json',sha256:jsonSha256}
  ]};
  registry.bindings[enemy]=id;registry.candidateAssets.push(id);expected[enemy]=slots;
 }
 return expected;
}
