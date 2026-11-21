import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {join,relative,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const [repo,inputs,out]=process.argv.slice(2).map(s=>resolve(s));
const {bridge}=await import(pathToFileURL(join(repo,'experiments/art-tech-lab/rpc.mjs')));
const {inventory}=await import(pathToFileURL(join(repo,'experiments/coop-primitive-lab/scenes.mjs')));
const client=bridge();
const positionAtEvent=process.env.EVENT_SLOT_POSITION==='1';
const unpack=r=>r.structuredContent??JSON.parse(r.content.find(x=>x.type==='text').text);
const call=async (name,args)=>unpack(await client.call(name,args));
const sha=b=>createHash('sha256').update(b).digest('hex');
mkdirSync(out,{recursive:true});
const entries=JSON.parse(readFileSync(join(inputs,'inventory.json'))).cases;
const records={};
try{
 await client.request('initialize',{protocolVersion:'2024-11-05',capabilities:{},clientInfo:{name:'event-offslot-probe',version:'1'}});
 for(const {id,filename,sha256} of entries){
  const raw=readFileSync(join(inputs,filename));assert.equal(sha(raw),sha256);
  const src=JSON.parse(raw), art=src.assets.server.root.children;
  assert.equal(art.length,1);assert.equal(art[0].children.length,48);
  records[id]={sourceSaveSha256:sha256};
  for(const shown of [true,false]){
   const save=structuredClone(src);
   const fitRoot=save.assets.server.root.children[0];
   fitRoot.visible=shown;
   if(positionAtEvent)for(const pose of Object.values(fitRoot.transformByPlatform))pose.offset={x:-372,y:-50};
   const key=id+'-'+(shown?'shown':'hidden'),file=join(out,key+'.save.json');
   writeFileSync(file,JSON.stringify(save));
   const {handle}=await call('qxqy_project_open',{path:relative(process.cwd(),file)});
   try{
    const state=await call('qxqy_studio_play',{handle,action:'start',args:{inspect:true,paint:true,clockMode:'manual',playerCount:1,viewPlayerIndex:1,canvasId:'mobile-16-9'}});
    assert.equal(state.mountError,null);
    assert.deepEqual([state.canvasWidth,state.canvasHeight],[1280,720]);
    const n=inventory(state.tree);assert.equal(n.created,49);assert.equal(n.visible,shown?49:0);
    const shot=await client.call('qxqy_studio_play_screenshot',{handle});
    const meta=unpack(shot);
    assert.deepEqual(meta.assetWarnings,[]);
    const sameFrame=await client.call('qxqy_studio_play_screenshot',{handle});
    const image=Buffer.from(shot.content.find(x=>x.type==='image').data,'base64');
    const repeat=Buffer.from(sameFrame.content.find(x=>x.type==='image').data,'base64');
    assert.deepEqual(repeat,image,'fixed frame screenshot bytes changed');
    assert.equal(unpack(sameFrame).frame,meta.frame);assert.equal(unpack(sameFrame).time,meta.time);
    writeFileSync(join(out,key+'.png'),image);
    records[id][shown?'shown':'hidden']={visible:n.visible,screenshotSha256:sha(image), repeatIdentical:true,frame:meta.frame,time:meta.time};
   }finally{await call('qxqy_studio_play',{handle,action:'stop'});}
  }
  assert.equal(records[id].shown.frame,records[id].hidden.frame);
  assert.equal(records[id].shown.time,records[id].hidden.time);
 }
 writeFileSync(join(out,'capture.json'),JSON.stringify(records,null,2)+'\n');
}finally{client.close();}
