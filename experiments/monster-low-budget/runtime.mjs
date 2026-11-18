// Standalone native-control experiment. No production registrations or GIL writes.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {nativeShape} from '../../scripts/v25-battle-scene.mjs';
import {runLua} from '../../scripts/test-lua.mjs';
import {toLua} from '../../scripts/build-lua-data.mjs';
const args=process.argv.slice(2),noRender=args.includes('--no-render');
assert.equal(args.filter(arg=>arg==='--no-render').length,noRender?1:0,'--no-render may only be supplied once');
assert(!args.some(arg=>arg.startsWith('--')&&arg!=='--no-render'),'Unknown runtime option');
const [sdkPath,rendererPath,imageRoot,outArg='build/monster-low-budget']=args.filter(arg=>arg!=='--no-render');
assert(sdkPath&&rendererPath&&imageRoot,'runtime.mjs <existing SDK session> <renderer> <image cache> [output]');
const out=path.resolve(outArg),theme=JSON.parse(fs.readFileSync('data/presentation/ui_theme.json'));
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const sdk=await import(pathToFileURL(path.resolve(sdkPath)));
const vc=noRender?null:(await import(pathToFileURL(path.resolve(rendererPath)))).vc;
const seed=JSON.parse(fs.readFileSync('experiments/art-tech-lab/seed.save.json'));
const samples={};function find(n){samples[n.kind]??=n;for(const c of n.children??[])find(c)}find(seed.assets.server.root);
let serial=50000;
const clone=(kind,name,position,size,extras={})=>{
 const n=structuredClone(samples[kind]);Object.assign(n,{id:'mlb'+(++serial),guid:1073900000+serial,name,children:[],scriptMappingIds:[],active:true,visible:true,...extras});
 for(const t of Object.values(n.transformByPlatform)){Object.assign(t,{scale:{x:1,y:1,z:1},rotation:{x:0,y:0,z:0},anchorMin:{x:.5,y:.5},anchorMax:{x:.5,y:.5},offset:{x:position[0],y:position[1]},size:{x:size[0],y:size[1]},pivot:{x:.5,y:.5}})}
 return n;
};
const rgba=hex=>0xff000000+parseInt(hex.replace('#',''),16);
const image=(name,pos,size,id,colour='#FFFFFF')=>clone('image',name,pos,size,{imageId:id,imageColor:rgba(colour),enableMask:false,enableFill:false});
const label=(name,text,pos)=>clone('textbox',name,pos,[300,40],{text,fontSize:16,minimumFontSize:16,fontColor:0xffeadfc9,bgColor:0,enableOutline:false});
function primitive(shape,index,side){
 const k=side/256;
 if(shape.type==='nativeTriangle'){
  const p=shape.placement,n=image('facet'+index,[(p.cx-128)*k,(p.cy-128)*k],[p.w*k,p.h*k],100003,shape.colour);
  for(const t of Object.values(n.transformByPlatform))t.rotation={x:p.rx,y:p.ry,z:p.rz};return [n];
 }
 return nativeShape({...shape,name:'facet'+index,opacity:1},{image:{rect:100001}}).map((spec,j)=>{
  const n=image('facet'+index+'_'+j,[(spec.position[0]+640-128)*k,(spec.position[1]-338+128)*k],spec.size.map(v=>v*k),spec.image,shape.colour);
  for(const t of Object.values(n.transformByPlatform)){
   t.rotation.z=spec.rotation??0;
   if(spec.pivot)t.pivot={x:spec.pivot[0],y:spec.pivot[1]};
   if(spec.scale)t.scale={x:spec.scale[0],y:spec.scale[1],z:1};
  }
  if(spec.fill)Object.assign(n,{enableFill:true,fillType:'Horizontal',fillHorizontalType:'Right',fillAmount:.5});return n;
 });
}
const geometryScript=path.join(out,'geometry-probe.lua');
fs.writeFileSync(geometryScript,`package.loaded.abyss_theme=${toLua(theme)}\nlocal view=require('abyss_battle_enemy_view')\nfor _,id in ipairs({'jaw_worm','hexaghost'})do local g=view.geometry({definitionId=id});print(id,g.portrait,g.hitWidth,g.hitHeight,g.healthY,g.intentY)end\n`);
let geometryResult;try{geometryResult=runLua(geometryScript)}finally{fs.unlinkSync(geometryScript)}
assert.equal(geometryResult.status,0,geometryResult.stdout+geometryResult.stderr);
const geometry=Object.fromEntries(geometryResult.stdout.trim().split(/\r?\n/).map(line=>{
 const [id,...v]=line.split(/\s+/);const [portrait,hitWidth,hitHeight,healthY,intentY]=v.map(Number);
 return [id,{portrait,hitWidth,hitHeight,healthY,intentY}];
}));
const report={schemaVersion:1,status:'running',scope:noRender?
 'Actual installed Simulator native control construction and hit only; rendering and gallery comparison NOT_RUN. Not official client/GPU/physical device/capacity':
 'Actual installed Simulator native control construction, hit and software PNG; not official client/GPU/physical device/capacity',
 runtimeScriptSha256:sha(new URL(import.meta.url)),fitReceiptSha256:sha(path.join(out,'fit-receipt.json')),
 sourceInputs:['data/presentation/ui_theme.json','src/lua/abyss_monster_source_geometry.lua','scripts/v25-battle-scene.mjs','experiments/art-tech-lab/seed.save.json'].map(file=>({path:file,sha256:sha(file)})),
 sdkSha256:sha(sdkPath),rendererSha256:noRender?null:sha(rendererPath),rendering:noRender?'NOT_RUN':'requested',
 galleryComparison:noRender?'NOT_RUN':'requested',geometrySourceSha256:sha('src/lua/abyss_battle_enemy_view.lua'),
 geometry,officialCapacity:'UNVERIFIED',pcAndMobile:'UNVERIFIED',samples:[]};
const images=new Map(),officialAssets=[];
if(!noRender)for(const id of [112038,112022]){
 for(const dir of fs.readdirSync(path.join(imageRoot,'sprite-v1'))){
  const file=path.join(imageRoot,'sprite-v1',dir,id+'.png');
  if(fs.existsSync(file)){
   const canvas=await import(pathToFileURL(path.resolve(imageRoot,'../../../../art-lab-runtime/node_modules/@napi-rs/canvas/index.js')));
   images.set('StaticReference:'+id,await canvas.loadImage(file));officialAssets.push({id,path:file,sha256:sha(file)});break;
  }
 }
}
if(!noRender)for(const id of [112038,112022])assert(images.has('StaticReference:'+id),'Missing actual official comparison asset '+id);
report.officialAssets=officialAssets;
for(const enemy of ['jaw_worm','hexaghost']){
 const g=geometry[enemy],project=structuredClone(seed.assets.server);
 project.root.children=[];project.root.scriptMappingIds=[];
 const stage=clone('container','MonsterBudgetExperiment',[0,0],[1280,720]);project.root.children.push(stage);
 stage.children.push(image('background',[0,0],[1280,720],100001,'#1A2734'));
 const columns=[{label:'SDK gallery ID '+theme.icon.enemy[enemy],id:theme.icon.enemy[enemy]},... [100,200,400].map(budget=>({label:budget+' images budget',budget}))];
 const costs=[];
 for(const [index,column]of columns.entries()){
  const actor=clone('container','actor'+index,[-480+index*320,0],[g.portrait,g.portrait]);stage.children.push(actor);
  actor.children.push(label('caption',column.label,[0,220]));
  if(column.id)actor.children.push(image('official',[0,0],[g.portrait,g.portrait],column.id));
  else{
   const file=path.join(out,enemy,'budget-'+column.budget+'.json'),pack=JSON.parse(fs.readFileSync(file));
   const nodes=pack.shapes.flatMap((shape,i)=>primitive(shape,i,g.portrait));
   assert.equal(nodes.length,pack.nativeImages,'Final emitted image count must match placement cost');
   for(let start=0;start<nodes.length;start+=60){const batch=clone('container','batch'+start,[0,0],[g.portrait,g.portrait]);batch.children=nodes.slice(start,start+60);actor.children.push(batch)}
   costs.push({budget:column.budget,packSha256:sha(file),drawImages:nodes.length,batchContainers:Math.ceil(nodes.length/60),hostContainers:1,
    masks:nodes.filter(n=>n.enableMask||n.enableFill).length,packBytes:fs.statSync(file).size,
    fiveActorDrawingImages:nodes.length*5,fiveActorContainers:(1+Math.ceil(nodes.length/60))*5,
    syntheticFiveActorStress:true});
  }
  actor.children.push(image('health',[0,g.healthY],[g.hitWidth,6],100001,'#C97159'));
  actor.children.push(image('intent',[0,g.intentY],[18,18],100003,'#F1C982'));
  actor.children.push(clone('cursor','hit',[0,0],[g.hitWidth,g.hitHeight],{raycastTarget:true}));
 }
 // Serialized native sibling order is front-to-back; authoring above is paint order.
 const reversePaintOrder=n=>{for(const child of n.children??[])reversePaintOrder(child);n.children?.reverse()};
 reversePaintOrder(project.root);
 const emptyClient=structuredClone(seed.assets.client);emptyClient.root.children=[];
 const save={format:'qxqy-simulator-save',version:4,assets:{server:project,client:emptyClient,scripts:[]},serverLogic:seed.serverLogic};
 const saveBytes=Buffer.from(JSON.stringify(save));fs.writeFileSync(path.join(out,enemy,'sample.save.json'),saveBytes);
 const start=performance.now();const session=sdk.Gr(project,{canvasId:'mobile-16-9'});
 const runtime=session.runtime,initialControls=runtime.controlsById.size;
 const root=runtime.roots.find(n=>n.name==='MonsterBudgetExperiment')??runtime.roots.flatMap(n=>n.children).find(n=>n.name==='MonsterBudgetExperiment');
 assert(root,'Compiled experiment root missing');
 const script=runtime.mountScript({path:'monster-low-budget-probe.lua',control:root,source:`
 function OnStart()
  for i=0,3 do local a=script.object:GetChild('actor'..i);a:GetChild('hit'):AddCursorEventListener(Enum.CursorEventType.CursorClick,function()print('MLB_HIT '..i)end)end
 end
 function Hide()script.object:SetVisible(false)end
 function Show()script.object:SetVisible(true)end
 `});
 const createMs=performance.now()-start,inputs=[];
 for(let i=0;i<4;i++){
  const target=root.children.find(n=>n.name==='actor'+i).children.find(n=>n.name==='hit');
  const boxes=sdk.wi(session),box=boxes.get(target.Id),matrix=sdk.pa(session,boxes).get(target.Id);
  const point=sdk.Me(matrix,box.centerX,box.centerY);sdk.vi(session,'move',point.x,point.y);
  const hit=sdk.vi(session,'down',point.x,point.y);sdk.dn(session,1/60);sdk.vi(session,'up',point.x,point.y);sdk.dn(session,1/60);
  assert.equal(hit?.Id,target.Id,'Native hit not aligned with actor '+i);inputs.push({actor:i,passed:true});
 }
 const beforeReuse=runtime.controlsById.size;
 for(let i=0;i<5;i++){runtime.runChunk(script.env,'Hide();Show()','reuse-'+i)}
 assert.equal(runtime.controlsById.size,beforeReuse,'Visibility switching allocated new controls');
 let pngSha256=null,renderMs=null;
 if(!noRender){
  const snapshot=sdk.ya(session,{view:true,paint:true,compact:true}),renderStart=performance.now();
  const png=vc(snapshot.scene,snapshot.canvasWidth,snapshot.canvasHeight,{images});
  fs.writeFileSync(path.join(out,enemy,'native-runtime.png'),png.data);
  renderMs=performance.now()-renderStart;pngSha256=createHash('sha256').update(png.data).digest('hex');
 }
 const row={enemy,createMs,renderMs,initialControls,sampleSaveBytes:saveBytes.length,costs,inputs,
  reuseCycles:5,reuseAllocated:runtime.controlsById.size-beforeReuse,
  pngSha256};
 assert.equal(runtime.logs.filter(l=>l.level==='lua-error').length,0,JSON.stringify(runtime.logs));
 runtime.destroy();row.remainingControls=runtime.controlsById.size;assert.equal(row.remainingControls,0);
 // Actual five-instance allocation probe. Five bosses is deliberately synthetic,
 // a resource upper-bound probe rather than a legal encounter or visual layout.
 for(const cost of costs){
  const stressProject=structuredClone(project),stressStage=stressProject.root.children[0];
  const sourceActor=stage.children.find(n=>n.name==='actor'+([100,200,400].indexOf(cost.budget)+1));
  const background=stage.children.find(n=>n.name==='background');
  const actors=Array.from({length:5},(_,index)=>{
   const actor=structuredClone(sourceActor);
   const refresh=n=>{n.id='mlb'+(++serial);n.guid=1073900000+serial;for(const child of n.children??[])refresh(child)};
   refresh(actor);actor.name='stressActor'+index;
   for(const transform of Object.values(actor.transformByPlatform))transform.offset.x=-440+index*220;
   return actor;
  });
  stressStage.children=[...actors.reverse(),background];
  const at=performance.now(),stress=sdk.Gr(stressProject,{canvasId:'mobile-16-9'});
  cost.fiveActorCreatedMs=performance.now()-at;cost.fiveActorActualControls=stress.runtime.controlsById.size;
  const expected=2+5*(cost.drawImages+cost.batchContainers+1+4);
  assert.equal(cost.fiveActorActualControls,expected,'Five actors must count all hosts, captions, HP, intent and hit controls');
  stress.runtime.destroy();cost.fiveActorRemaining=stress.runtime.controlsById.size;assert.equal(cost.fiveActorRemaining,0);
 }
 report.samples.push(row);console.log(JSON.stringify({enemy,createMs,initialControls,remainingControls:row.remainingControls}));
}
report.status=noRender?'controls_passed':'pass';
if(!noRender){report.rendering='pass';report.galleryComparison='pass'}
fs.writeFileSync(path.join(out,'runtime-receipt.json'),JSON.stringify(report,null,2)+'\n');
