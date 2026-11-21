// Real SDK software renderer of captured production controls, enlarged as a crop.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,join,relative} from 'node:path';
import assert from 'node:assert/strict';
import {bridge} from '../art-tech-lab/rpc.mjs';
import {previewImageMaskFields} from '../../scripts/native-candidate-preview.mjs';
const out=resolve(process.argv[2]);const scenes=JSON.parse(readFileSync(join(out,'scenes.json')));
const generated=process.argv[3]??join(out,'generated');
const flowMode=process.argv[4]==='flow',gallery=process.argv[4]==='gallery';
const layout=JSON.parse(readFileSync(join(generated,'game-ui.json')));
const seed=JSON.parse(readFileSync('experiments/art-tech-lab/seed.save.json'));
const parts=n=>{const v=n?.children??n?.controls;return Array.isArray(v)?v:Object.values(v??{});};
const all=n=>[n,...parts(n).flatMap(all)];const find=(n,key)=>all(n).find(c=>c.name===key);
const proto=new Map();for(const n of [...all(seed.assets.server.root),...all(seed.assets.client.root)])if(!proto.has(n.kind))proto.set(n.kind,n);
let serial=1800000000;
const vec=(v,d)=>({x:v?.[0]??d[0],y:v?.[1]??d[1]});
const colour=(s='#FFFFFF',opacity=1)=>{s=s.slice(1);return ((Math.round((s.length===8?parseInt(s.slice(6),16):255)*opacity)<<24)|parseInt(s.slice(0,6),16))>>>0};
const cap=s=>s[0].toUpperCase()+s.slice(1);const align={centre:'Middle',middle:'Middle',left:'Left',right:'Right',top:'Top',bottom:'Bottom'};
function node(s){
 const kind={text:'textbox',image:'image',container:'container'}[s.kind];assert(kind,'only captured visual controls');
 const n=structuredClone(proto.get(kind)??proto.get('container'));
 Object.assign(n,{id:'proof'+(++serial),guid:serial,name:s.name,kind,active:true,visible:s.visible!==false,scriptMappingIds:[],children:[],transformByPlatform:{},syncAllDevices:true});
 const xyz=Array.isArray(s.rotation)?s.rotation:[0,0,s.rotation??0];
 for(const p of ['KEYBOARD','TOUCHSCREEN','CONTROLLER_CONSOLE','CONTROLLER_MOBILE'])n.transformByPlatform[p]={offset:vec(s.position,[0,0]),size:vec(s.size,[0,0]),scale:{...vec(s.scale,[1,1]),z:1},rotation:{x:xyz[0],y:xyz[1],z:xyz[2]},anchorMin:{x:.5,y:.5},anchorMax:{x:.5,y:.5},pivot:vec(s.pivot,[.5,.5])};
 if(kind==='image')Object.assign(n,{imageId:s.image,imageSource:'StaticReference',imageType:s.image>100006?cap(s.imageType??'basic'):null,imageColor:colour(s.colour,s.opacity??1),...previewImageMaskFields(s),fillAmount:s.fill?.amount??1,fillType:cap(s.fill?.shape??'horizontal'),fillClockwise:true});
 if(kind==='textbox'){const t=s.text;Object.assign(n,{text:t.content,fontSize:t.fontSize,adaptiveFontSize:t.autoSize===true,minimumFontSize:t.minFontSize??t.fontSize,fontColor:colour(t.colour),bgColor:0,enableOutline:t.outline===true,outlineColor:colour(t.outlineColour??'#000000',t.outlineOpacity??1),horizontalAlignment:align[t.align]??'Middle',verticalAlignment:align[t.valign]??'Middle'});}
 n.children=parts(s).filter(c=>['container','image','text'].includes(c.kind)).map(node).reverse();return n;
}
function enrich(c,s){const enriched={...s,...c};if(c.text)enriched.text={...s?.text,...c.text};enriched.children=parts(c).map(n=>enrich(n,parts(s??{}).find(p=>p.name===n.name)));return enriched;}
const names=['energyRing','energyDisc','energyIcon','energy'];const receipts=[];
const b=bridge();
try{
 await b.request('initialize',{protocolVersion:'2024-11-05',capabilities:{},clientInfo:{name:'production-energy-reference',version:'1'}});
 for(const scene of scenes){
  const children=(flowMode||gallery)?[]:names.map(name=>{const actual=find(scene.tree,name),spec=find(layout,name);assert(actual&&spec,name);const n=enrich(actual,spec);n.position=[n.position[0]+511,n.position[1]+233];return n;});
  const crop=gallery?scene.tree:flowMode?enrich(find(scene.tree,'battlePanel'),find(layout,'battlePanel')):{name:'Captured production energy crop',kind:'container',position:[0,0],size:[1280,720],scale:[4,4],children};
  const title={name:'caption',kind:'text',position:[0,gallery?320:245],size:[1100,70],text:{content:scene.name,fontSize:30,colour:'#FFFFFF',align:'centre',valign:'middle'}};
  const footer={...title,name:'scope',position:[0,gallery?-330:-265],text:{...title.text,content:gallery?'Current formal native status textures / SDK software capture / not official client':flowMode?'Reference SPIKE / 18 pooled overlays / SDK software capture / not shipped':'Production Lua controls / SDK software capture / 4x crop / not official client',fontSize:18}};
  const background={name:'diagnostic field',kind:'image',position:[0,0],size:[1280,720],image:100001,colour:'#171B20'};
  const root=node({name:'Production snapshot',kind:'container',position:[0,0],size:[1280,720],children:[background,crop,title,footer]});
  const save=structuredClone(seed);save.assets.server.root.children=[root];save.assets.server.selectedId=root.id;save.assets.client.root.children=[];save.assets.scripts=[];save.meta={name:scene.name};
  const file=join(out,scene.name+'.save.json');writeFileSync(file,JSON.stringify(save));
  const open=await b.call('qxqy_project_open',{path:relative(process.cwd(),file)});const {handle}=open.structuredContent;
  await b.call('qxqy_studio_play',{handle,action:'start'});
  const r=await b.call('qxqy_studio_play_screenshot',{handle});const pic=r.content.find(c=>c.type==='image');assert(pic,'real renderer PNG missing');assert.deepEqual(r.structuredContent.assetWarnings,[],'all catalog textures must resolve');
  writeFileSync(join(out,scene.name+'.png'),Buffer.from(pic.data,'base64'));receipts.push({scene:scene.name,...r.structuredContent,content:r.content.filter(c=>c.type!=='image')});
 }
}finally{b.close()}
writeFileSync(join(out,'sdk-receipts.json'),JSON.stringify(receipts,null,2));console.log('SDK_ENERGY_CAPTURE',receipts.map(r=>r.scene));
