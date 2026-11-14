// Installed SDK native controls/software renderer. No texture substitution or device claim.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {pathToFileURL}from 'node:url';import {asset,sha}from './assets.mjs';
const [sdkArg,rendererArg,outArg='experiments/monster-lowpoly-combat/evidence/comparison']=process.argv.slice(2);
const sdk=await import(pathToFileURL(path.resolve(sdkArg))),{vc}=await import(pathToFileURL(path.resolve(rendererArg))),out=path.resolve(outArg);fs.mkdirSync(out,{recursive:true});
const seed=JSON.parse(fs.readFileSync('experiments/art-tech-lab/seed.save.json')),samples={};function collect(n){samples[n.kind]??=n;for(const c of n.children??[])collect(c)}collect(seed.assets.server.root);let serial=60000;
function node(kind,name,position,size,extras={}){const n=structuredClone(samples[kind]);Object.assign(n,{id:'mfc'+(++serial),guid:1073900000+serial,name,children:[],scriptMappingIds:[],active:true,visible:true,...extras});for(const t of Object.values(n.transformByPlatform))Object.assign(t,{scale:{x:1,y:1,z:1},rotation:{x:0,y:0,z:0},anchorMin:{x:.5,y:.5},anchorMax:{x:.5,y:.5},offset:{x:position[0],y:position[1]},size:{x:size[0],y:size[1]},pivot:{x:.5,y:.5}});return n;}
const image=(name,pos,size,id,rgba)=>node('image',name,pos,size,{imageId:id,imageColor:rgba,enableMask:false,enableFill:true});
const colour=c=>((c[3]<<24)|(c[0]<<16)|(c[1]<<8)|c[2])>>>0;
function picture(a,name,pos,side){const host=node('container',name,pos,[side,side]),k=side/106;for(let start=0;start<a.slots.length;start+=60){const group=node('container','group'+start,[0,0],[side,side]);host.children.push(group);for(const [j,s]of a.slots.slice(start,start+60).entries()){
 const n=image('shape'+(start+j),s.position.map(v=>v*k),s.size.map(v=>v*k),s.image,colour(s.colour));for(const t of Object.values(n.transformByPlatform)){t.rotation={x:s.rotation[0],y:s.rotation[1],z:s.rotation[2]};t.pivot={x:s.pivot[0],y:s.pivot[1]};t.scale={x:s.scale[0],y:s.scale[1],z:1};}
 if(s.fitHalf)Object.assign(n,{enableMask:true,fillType:'Horizontal',fillHorizontalType:'Right',fillAmount:.5});else n.fillType='Unused';group.children.push(n);
 }}return host;}
const registry=JSON.parse(fs.readFileSync('data/presentation/native-monster-art.json'));
const report={scope:'Installed SDK software native-control comparison; not official client or GPU/phone',sdkSha256:sha(sdkArg),rendererSha256:sha(rendererArg),samples:[]};
for(const [id,budgets]of [['large-geo-slime',[100,200,350]],['ruin-guard',[200,350,500]]]){
 const project=structuredClone(seed.assets.server);project.root.children=[];project.root.scriptMappingIds=[];const stage=node('container','comparison',[0,0],[1280,720]);project.root.children.push(stage);stage.children.push(image('background',[0,0],[1280,720],100001,0xff203244));
 const variants=[{label:'old '+registry.additionalAssets[id].slots.length,a:registry.additionalAssets[id]},...budgets.map(b=>({label:'budget '+b,a:asset(id,b)}))];
 for(const [row,side]of [106,127].entries())for(const [col,v]of variants.entries()){
 const x=-450+col*300,y=140-row*280;const host=picture(v.a,'art-'+row+'-'+col,[x,y],side);stage.children.push(host);
 stage.children.push(node('textbox','caption-'+row+'-'+col,[x,y-100],[280,30],{text:`${id} ${v.label} / ${side}px`,fontSize:14,minimumFontSize:14,fontColor:0xffeee0c0,bgColor:0,enableOutline:false}));
 }
 const reverse=n=>{for(const c of n.children??[])reverse(c);n.children?.reverse()};reverse(project.root);
 const save={...structuredClone(seed),assets:{...structuredClone(seed.assets),server:project,scripts:[]}};const file=path.join(out,id+'.save.json');fs.writeFileSync(file,JSON.stringify(save));
 const at=performance.now(),session=sdk.Gr(project,{canvasId:'pc-16-9'}),createMs=performance.now()-at;const snapshot=sdk.ya(session,{view:true,paint:true,compact:true}),renderAt=performance.now(),png=vc(snapshot.scene,snapshot.canvasWidth,snapshot.canvasHeight,{});
 fs.writeFileSync(path.join(out,id+'-native.png'),png.data);const controls=session.runtime.controlsById.size;session.runtime.destroy();assert.equal(session.runtime.controlsById.size,0);
 report.samples.push({id,variants:variants.map(v=>({label:v.label,images:v.a.slots.length})),createMs,softwareRenderMs:performance.now()-renderAt,actualControls:controls,remainingControls:0,saveSha256:sha(file),pngSha256:sha(path.join(out,id+'-native.png'))});
 console.log(id,controls,createMs);
}
fs.writeFileSync(path.join(out,'receipt.json'),JSON.stringify(report,null,2));
