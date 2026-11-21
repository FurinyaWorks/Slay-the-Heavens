import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {join,relative,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const [repo,root]=process.argv.slice(2).map(x=>resolve(x));
const {bridge}=await import(pathToFileURL(join(repo,'experiments/art-tech-lab/rpc.mjs')));
const {inventory}=await import(pathToFileURL(join(repo,'experiments/coop-primitive-lab/scenes.mjs')));
const {cases}=JSON.parse(readFileSync(join(root,'inventory.json')));
const sha=buf=>createHash('sha256').update(buf).digest('hex'),client=bridge();
const unpack=r=>r.structuredContent??JSON.parse(r.content.find(x=>x.type==='text').text);
const call=async (name,args)=>unpack(await client.call(name,args));
const results={};
try{
 await client.request('initialize',{protocolVersion:'2024-11-05',capabilities:{},clientInfo:{name:'event-sweep',version:'1'}});
 for(const entry of cases){
  const key=entry.id.replace(/-60$/,'');
  const scene=join(root,entry.filename),out=join(root,key);
  mkdirSync(out,{recursive:true});
  assert.equal(sha(readFileSync(scene)),entry.sha256);
  const {handle}=await call('qxqy_project_open',{path:relative(process.cwd(),scene)});
  const play=(action,args={})=>call('qxqy_studio_play',{handle,action,args});
  let counts,screen;
  try{
   const state=await play('start',{inspect:true,paint:true,canvasId:'mobile-16-9',clockMode:'manual',playerCount:1,viewPlayerIndex:1});
   assert.equal(state.mountError,null);
   counts=inventory(state.tree);
   assert.equal(counts.created,entry.expectedCreated);
   assert.equal(counts.visible,entry.expectedInitialVisible);
   const visual=await client.call('qxqy_studio_play_screenshot',{handle});
   const d=visual.content.find(x=>x.type==='image');
   assert(d,'Missing screenshot');
   assert.deepEqual(unpack(visual).assetWarnings,[]);
   screen=Buffer.from(d.data,'base64');
   writeFileSync(join(out,'screen.png'),screen);
  }finally{await play('stop');}
  const runtime=await call('qxqy_studio_export',{handle,action:'export',args:{format:'gia',assetType:'server-control-template'}});
  const files=runtime.files??[runtime];
  assert.equal(files.length,1);
  const warnings=files[0].warnings??[];assert(warnings.every(text=>text==="客户端控件容器: 新服务端控件模板写入显式空 Info.related，避免跨沙箱复用伴生资源 GUID 产生无法加载的索引。"));
  const gia=Buffer.from(files[0].data,'base64');
  writeFileSync(join(out,'event.gia'),gia);
  results[key]={controls:counts.created,images:counts.images,visible:counts.visible,containers:counts.containers,
   warnings,giaBytes:gia.length,giaSha256:sha(gia),screenshotSha256:sha(screen)};
  console.log(key,counts.created,gia.length);
 }
 assert.equal(Object.keys(results).length,cases.length);
 writeFileSync(join(root,'sweep-simulator.json'),JSON.stringify(results,null,2)+'\n');
}finally{client.close();}
