import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {join, resolve, relative} from 'node:path';
import {pathToFileURL} from 'node:url';
const [repoPath,inputPath,...names]=process.argv.slice(2);
const repo=resolve(repoPath),input=resolve(inputPath),workspace=resolve(input,'..');
const {bridge}=await import(pathToFileURL(join(repo,'experiments/art-tech-lab/rpc.mjs')));
const {previewImageMaskFields}=await import(pathToFileURL(join(repo,'scripts/native-candidate-preview.mjs')));
const seed=JSON.parse(readFileSync(join(repo,'experiments/art-tech-lab/seed.save.json')));
const platforms=['KEYBOARD','TOUCHSCREEN','CONTROLLER_CONSOLE','CONTROLLER_MOBILE'];
const align={left:'Left',centre:'Middle',middle:'Middle',right:'Right',top:'Top',bottom:'Bottom'};
const vec=(v,fallback)=>({x:v?.[0]??fallback[0],y:v?.[1]??fallback[1]});
const cap=s=>s?.[0]?.toUpperCase()+s?.slice(1);
const sha=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
function colour(hex='#FFFFFF',opacity=1){
  const source=hex.replace('#','');
  assert([6,8].includes(source.length),hex);
  const alpha=source.length===8?parseInt(source.slice(6),16):255;
  return ((Math.round(alpha*opacity)<<24)|parseInt(source.slice(0,6),16))>>>0;
}
let serial=1800000000;
function convert(spec){
  const kind={text:'textbox',container:'container',image:'image'}[spec.kind];
  assert(kind,spec.kind);
  const guid=++serial;
  const xyz=Array.isArray(spec.rotation)?spec.rotation:[0,0,spec.rotation??0];
  const transform={
    offset:vec(spec.position,[0,0]),size:vec(spec.size,[0,0]),scale:{...vec(spec.scale,[1,1]),z:1},
    anchorMin:vec(spec.anchor?.min,[.5,.5]),anchorMax:vec(spec.anchor?.max,[.5,.5]),
    pivot:vec(spec.pivot,[.5,.5]),rotation:{x:xyz[0],y:xyz[1],z:xyz[2]},
  };
  const output={id:'n'+guid,guid,kind,name:spec.name,active:true,visible:true,syncAllDevices:true,
    giaRelatedGuids:[],scriptMappingIds:[],transformByPlatform:Object.fromEntries(platforms.map(p=>[p,transform])),
    children:Array.isArray(spec.children)?spec.children.map(convert).reverse():[]};
  if(kind==='image'){
    assert(Number.isSafeInteger(spec.image),spec.name);
    Object.assign(output,{imageId:spec.image,imageSource:'StaticReference',
      imageType:spec.image>100006?cap(spec.imageType??'basic'):null,
      imageColor:colour(spec.colour,spec.opacity??1),...previewImageMaskFields(spec),
      fillAmount:spec.fill?.amount??1,fillType:cap(spec.fill?.shape??'horizontal'),
      fillClockwise:spec.fill?.clockwise!==false});
    if(spec.fill?.from){
      const field={horizontal:'fillHorizontalType',vertical:'fillVerticalType',radial90:'fillRadial90Type'}[spec.fill.shape]??'fillRadialType';
      output[field]=cap(spec.fill.from);
    }
  }
  if(kind==='textbox'){
    const t=spec.text;
    Object.assign(output,{text:t.content,fontSize:t.fontSize,adaptiveFontSize:t.autoSize===true,
      minimumFontSize:t.minFontSize??t.fontSize,fontColor:colour(t.colour,t.opacity??1),
      bgColor:colour(t.background??'#000000',t.backgroundOpacity??0),enableOutline:t.outline===true,
      outlineColor:colour(t.outlineColour??'#000000',t.outlineOpacity??1),
      horizontalAlignment:align[t.align]??'Middle',verticalAlignment:align[t.valign]??'Middle'});
  }
  return output;
}
const unpack=r=>r.structuredContent??JSON.parse(r.content.find(c=>c.type==='text').text);
const scenes=readFileSync(input,'utf8').split('\n').filter(line=>line.startsWith('SCENE ')).map(line=>JSON.parse(line.slice(6)));
assert(scenes.length>0);
process.chdir(workspace);
const out=join(workspace,process.env.SIM_OUTPUT_SUBDIR??(names.length?'probe':'png'));
mkdirSync(out,{recursive:true});
const files=[];
const pending=names.length?names.map(name=>scenes.find(scene=>scene.name===name)):scenes;
assert(pending.every(Boolean),'unknown requested screenshot');
const publishedPriority=['collector-before-summon','collector-summon','double-red-louse','mixed-louse','gremlin-gang','automaton-summon','byrd-01-flight','byrd-02-knockdown','byrd-04-relift'];
if(!names.length)pending.sort((a,b)=>{
  const rank=scene=>{const n=publishedPriority.indexOf(scene.name);return n===-1?publishedPriority.length:n;};
  return rank(a)-rank(b);
});
for(let start=0;start<pending.length;start+=9){
 const b=bridge();
 try {
  await b.request('initialize',{protocolVersion:'2024-11-05',capabilities:{},
    clientInfo:{name:'v220-production-enemy-contact-capture',version:'1'}});
  for(const scene of pending.slice(start,start+9)){
    serial=1800000000;
    const save=structuredClone(seed);
    const root=save.assets.server.root.children[0];
    root.children=[convert({name:'stage',kind:'container',size:[1280,720],scale:[1.25,1.25],children:[scene.tree]})];
    save.assets.server.selectedId=root.id;
    save.assets.client.root.children=[];
    save.assets.scripts=[];
    save.meta={name:scene.name};
    const savePath=join(out,scene.name+'.save.json');
    writeFileSync(savePath,JSON.stringify(save));
    const {handle}=unpack(await b.call('qxqy_project_open',{path:relative(workspace,savePath)}));
    let r;
    try {
      await b.call('qxqy_studio_play',{handle,action:'start',args:{clockMode:'manual',canvasId:'pc-16-9'}});
      r=await b.call('qxqy_studio_play_screenshot',{handle});
    } finally {
      await b.call('qxqy_studio_play',{handle,action:'stop'});
    }
    const image=r.content.find(c=>c.type==='image');
    assert(image?.mimeType==='image/png',scene.name);
    const file=join(out,scene.name+'.png');
    writeFileSync(file,Buffer.from(image.data,'base64'));
    const meta=unpack(r);
    assert.equal(meta.assetWarnings.length,0,JSON.stringify(meta.assetWarnings));
    const receipt={...scene,tree:undefined,sha256:sha(file),snapshotSaveSha256:sha(savePath),capture:meta};
    files.push(receipt);
    console.log(scene.name,meta.assetWarnings?.length??'no metadata');
  }
 } finally {
  b.close();
  writeFileSync(join(out,'receipts.json'),JSON.stringify(files,null,2)+'\n');
}
}
