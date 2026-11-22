import assert from 'node:assert/strict';
import {portableHalfMasks} from './portable-half-mask.mjs';
import {readFileSync,writeFileSync,mkdirSync,readdirSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
const args=process.argv.slice(2);
const portable=args.includes('--mirror-left-masks');
const budgetSweep=args.includes('--budget-sweep');
const countArg=args.find(x=>x.startsWith('--expected-count='));
const expected=countArg ? Number(countArg.split('=')[1]) : 49;
assert(Number.isSafeInteger(expected) && expected>=1 && expected<=49,'invalid event count');
const positional=args.filter(x=>x!=='--mirror-left-masks' && x!=='--budget-sweep' && x!==countArg);
assert.equal(positional.length,3,'expected repo, input, output');
const [repo,inDir,outDir]=positional.map(x=>resolve(x));
const imp=path=>import(pathToFileURL(join(repo,path)));
const {nativeShape}=await imp('scripts/v25-battle-scene.mjs');
const {simulatorSave}=await imp('experiments/coop-primitive-lab/build.mjs');
const {inventory}=await imp('experiments/coop-primitive-lab/scenes.mjs');
const sha=(p)=>createHash('sha256').update(readFileSync(p)).digest('hex');
mkdirSync(outDir,{recursive:true});
mkdirSync(join(outDir,'scenes'),{recursive:true});
const data={},cases=[];
const tierIds=[32,60,96];
const group=(name,children)=>({name,kind:'container',position:[0,0],size:[330,330],children,raycastTarget:false});
const rounded=x=>typeof x==='number'?Math.round(x*1e5)/1e5:Array.isArray(x)?x.map(rounded):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).map(([k,v])=>[k,rounded(v)])):x;
const origin=[640-165,338-165];
function makeImages(pack,tier){
 let result=tier.shapes.flatMap((shape,i)=>{
  const name='p'+i, opacity=shape.opacity??1;
  if(shape.type==='nativeTriangle'){
   const {cx,cy,w,h,rx,ry,rz}=shape.placement;
   return [{name,kind:'image',position:[cx-165,cy-165],size:[w,h],rotation:[rx,ry,rz],image:100003,colour:shape.colour,opacity,raycastTarget:false}];
  }
  assert(['rect','polygon'].includes(shape.type));
  const placed=shape.box?{box:[shape.box[0]+origin[0],shape.box[1]+origin[1],...shape.box.slice(2)]}:
   {points:shape.points.map(([x,y])=>[x+origin[0],y+origin[1]])};
  return nativeShape({...shape,...placed,name,opacity},{image:{rect:100001}},{edgeBleed:0}).map(n=>({...n,colour:shape.colour,opacity,raycastTarget:false}));
 }).map(rounded);
 assert.equal(result.length,tier.projectedImageControls,'actual exporter projection differs: '+pack.id);
 for(const n of result){
  assert([100001,100003].includes(n.image)&&n.size.every(v=>typeof v==='number'&&v>0));
  assert(n.position.every(Number.isFinite)&&n.opacity>0&&n.opacity<=1);
 }
 return result;
}
const save=(path,data)=>{writeFileSync(path,JSON.stringify(data)+'\n');return statSync(path).size;};
for(const id of readdirSync(inDir).sort()){
 const pack=JSON.parse(readFileSync(join(inDir,id,'fit.json'))); assert.equal(id,pack.id);
 const record={sourceSha256:pack.sourceSha256,sourceBytes:pack.sourceBytes,sourceMode:pack.sourceMode,alphaPreserved:pack.alphaPreserved,tiers:{}};
 for(const budget of tierIds){
  const t=pack.tiers[budget],images=makeImages(pack,t);
  assert(images.length<=budget);
  const direct=images.length<=60,children=direct?images:Array.from({length:Math.ceil(images.length/60)},(_,j)=>group('part'+j,images.slice(j*60,(j+1)*60)));
  const root=group(budgetSweep?id.replace(/_(full|48|52|56)$/,''):id,children),stats=inventory([root]);
  const key=id+'-'+budget,counts={images:stats.images,containers:stats.containers,total:stats.created};
  const info={geometry:t.geometry,...counts,maskHalfImages:images.filter(n=>n.fill).length,fitScore:t.maeAt144,method:t.method,floatBytes:Buffer.byteLength(JSON.stringify(root))};
  record.tiers[budget]=info;
  if(budget===60){
   record.controlTree=root;
   const filename=key+'.save.json',ss=simulatorSave(key,{roots:[portable?portableHalfMasks(root):root]});
   save(join(outDir,'scenes',filename),ss);
   cases.push({id:key,filename,sha256:sha(join(outDir,'scenes',filename)),expectedCreated:stats.created,expectedInitialVisible:stats.visible,expectedPeakVisible:stats.visible});
  }
 }
 data[id]=record;
}
assert.equal(Object.keys(data).length,expected);
const info={schemaVersion:1,exportHalfMaskMode:portable?'left-mirror-x':'legacy-left-unmirrored',description:'Offline event art candidate; only one event root is intended on screen. No game integration.',canvas:[330,330],officialCapacity:'NOT_RUN',physicalDevices:'NOT_RUN',fits:data};
save(join(outDir,'native-controls.json'),info);
const byTier=Object.fromEntries(tierIds.map(t=>{
 const values=Object.values(data).map(x=>x.tiers[t]);
 const stats=k=>{const v=values.map(x=>x[k]).sort((a,b)=>a-b);return {min:v[0],median:v[Math.floor(v.length/2)],max:v.at(-1),sum:v.reduce((a,b)=>a+b,0)};};
 return [t,{images:stats('images'),total:stats('total'),fitScore:stats('fitScore'),floatBytes:stats('floatBytes')}];
}));
save(join(outDir,'summary.json'),{byTier,nativeControlCatalogBytes:statSync(join(outDir,'native-controls.json')).size,cases:cases.length});
save(join(outDir,'scenes','inventory.json'),{room:{min:1,max:2},cases});
console.log(JSON.stringify(byTier));
