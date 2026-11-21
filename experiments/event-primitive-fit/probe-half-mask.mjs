import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {bridge} from '../art-tech-lab/rpc.mjs';
import {simulatorSave} from '../coop-primitive-lab/build.mjs';
import {portableHalfMasks} from './portable-half-mask.mjs';
import {mkdirSync} from 'node:fs';
const b=bridge(), root=process.argv[2]??'build/event-mask-probe';mkdirSync(root,{recursive:true});
const unpack=r=>r.structuredContent??JSON.parse(r.content.find(x=>x.type==='text').text);
const call=async (name,args)=>unpack(await b.call(name,args));
const scenarios=[{id:'straight',rotation:0,y:1},{id:'rotated',rotation:36,y:1},{id:'rotated-mirror-y',rotation:-74,y:-1}];
const variants={truth:{side:'Right',x:1},past:{side:'Left',x:1},mirror:{side:'Left',x:-1}};
try {
 await b.request('initialize',{protocolVersion:'2024-11-05',capabilities:{},clientInfo:{name:'neutral-mask-proof',version:'1'}});
 for(const s of scenarios)for(const [key,v] of Object.entries(variants)){
  const id=s.id+'-'+key;
  const one={name:'triangle',kind:'image',position:[0,0],size:[128,67],colour:'#FFFFFF',image:100003,
   pivot:[.5,0],rotation:s.rotation,scale:[1,s.y],fill:{shape:'horizontal',from:'right',amount:.5}};
  const save=simulatorSave('neutral-mask',{roots:[{name:'event',kind:'container',children:[key==='mirror'?portableHalfMasks(one):one],size:[330,330]}]});
  const n=save.assets.server.root.children[0].children[0];n.fillHorizontalType=v.side;
  const path=root+'/'+id+'.json';writeFileSync(path,JSON.stringify(save)+'\n');
  const {handle}=await call('qxqy_project_open',{path});
  const r=await call('qxqy_studio_play',{handle,action:'start',args:{inspect:true,paint:true,canvasId:'mobile-16-9',clockMode:'manual'}});
  assert.equal(r.mountError,null);assert.equal(r.paint.length,1);
  const image=await b.call('qxqy_studio_play_screenshot',{handle});
  const shot=image.content.find(x=>x.type==='image');assert(shot);
  writeFileSync(root+'/'+id+'.png',Buffer.from(shot.data,'base64'));
  await call('qxqy_studio_play',{handle,action:'stop'});
  const ex=await call('qxqy_studio_export',{handle,action:'export',args:{format:'gia',assetType:'server-control-template'}});
  const asset=(ex.files??[ex])[0];assert(asset.data);
  writeFileSync(root+'/'+id+'.gia',Buffer.from(asset.data,'base64'));
  console.log(id,r.paint[0].fillHorizontalType,r.canvasWidth,r.canvasHeight,Buffer.from(asset.data,'base64').length);
 }
}finally{b.close()}
