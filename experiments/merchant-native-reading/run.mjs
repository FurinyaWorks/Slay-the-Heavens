// Isolated production merchant + production layout on the installed SDK model.
// Not a projected GIL, full NodeUI transaction test, official font or device run.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {merchantControl} from '../../scripts/cinematic-ui-layout.mjs';
import {nativeTheme} from '../../scripts/native-ui-theme.mjs';
import {officialAssetsTheme} from '../../scripts/official-assets-layout.mjs';
import {buildUiTheme} from '../../scripts/build-ui-theme.mjs';
import {toLua} from '../../scripts/build-lua-data.mjs';

const [sdkPath,outArg='build/merchant-native-reading']=process.argv.slice(2);
assert(sdkPath,'run.mjs <existing-sdk-session> [new-output-directory]');
assert(process.argv.length<=4,'Expected SDK path and one new output directory');
const out=path.resolve(outArg);assert(!fs.existsSync(out),'Use a new output directory; keep prior evidence');fs.mkdirSync(out,{recursive:true});
const sdk=await import(pathToFileURL(path.resolve(sdkPath)));
const sha=file=>createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const seed=JSON.parse(fs.readFileSync('experiments/art-tech-lab/seed.save.json'));
const samples={};function index(node){samples[node.kind]??=node;for(const child of node.children??[])index(child)}index(seed.assets.server.root);
const narrative=JSON.parse(fs.readFileSync('data/presentation/narrative.zh-CN.json'));
assert(Object.values(narrative.merchant).every(text=>!/[|\n\r]/.test(text)),'State trace delimiter must be absent from copy');
const modulePaths=['src/lua/abyss_merchant.lua','src/lua/abyss_merchant_pages.lua','src/lua/abyss_prologue.lua'];
const inputPaths=[...modulePaths,'data/presentation/narrative.zh-CN.json','data/presentation/ui_theme.json',
 'scripts/cinematic-ui-layout.mjs','scripts/native-ui-theme.mjs','scripts/official-assets-layout.mjs',
 'scripts/build-ui-theme.mjs','experiments/art-tech-lab/seed.save.json'];
const report={schemaVersion:1,status:'running',scope:'Real SDK standalone merchant component and modeled cursor dispatch; not full NodeUI, GIL, official client/font or device acceptance',
 inputs:inputPaths.map(file=>({path:file,sha256:sha(file)})),driverSha256:sha(new URL(import.meta.url)),sdkSha256:sha(sdkPath),
 renderer:'NOT_RUN',officialClient:'NOT_RUN',physicalMobile:'NOT_RUN',userReadingApproval:'NOT_RUN',profiles:[]};
let serial=70000;
const rgba=hex=>0xff000000+parseInt(hex.slice(1,7),16);
function convert(spec){
 const kind={container:'container',image:'image',text:'textbox',cursorArea:'cursor'}[spec.kind];assert(kind,'Unknown production control kind');
 const node=structuredClone(samples[kind]);Object.assign(node,{id:'mr'+(++serial),guid:1073900000+serial,name:spec.name,children:[],scriptMappingIds:[],active:true,visible:spec.visible!==false});
 for(const t of Object.values(node.transformByPlatform))Object.assign(t,{offset:{x:spec.position?.[0]??0,y:spec.position?.[1]??0},size:{x:spec.size[0],y:spec.size[1]},anchorMin:{x:.5,y:.5},anchorMax:{x:.5,y:.5},pivot:{x:.5,y:.5},scale:{x:1,y:1,z:1},rotation:{x:0,y:0,z:spec.rotation??0}});
 if(kind==='image')Object.assign(node,{imageId:spec.image,imageColor:rgba(spec.colour??'#FFFFFF'),enableFill:false,enableMask:false});
 if(kind==='textbox')Object.assign(node,{text:spec.text.content,fontSize:spec.text.fontSize,minimumFontSize:spec.text.minFontSize,adaptiveFontSize:spec.text.autoSize===true,fontColor:rgba(spec.text.colour),bgColor:0,enableOutline:spec.text.outline!==false,
  horizontalAlignment:{left:'Left',centre:'Middle',right:'Right'}[spec.text.align],verticalAlignment:{top:'Top',middle:'Middle',bottom:'Bottom'}[spec.text.valign]});
 if(kind==='cursor')Object.assign(node,{raycastTarget:true,canControllerFocus:spec.focusable===true});
 node.children=(spec.children??[]).map(convert).reverse();return node;
}
for(const [profile,theme]of [['default',structuredClone(nativeTheme)],['official-projection',officialAssetsTheme(structuredClone(nativeTheme))]]){
 const directory=path.join(out,profile);fs.mkdirSync(directory,{recursive:true});
 const themeFile=path.join(directory,'theme.json'),themeLua=path.join(directory,'theme.lua');fs.writeFileSync(themeFile,JSON.stringify(theme));
 const themeSource=buildUiTheme(themeFile,'data',themeLua),spec=merchantControl(theme),project=structuredClone(seed.assets.server);
 project.root.children=[convert(spec)];project.root.scriptMappingIds=[];
 const session=sdk.Gr(project,{canvasId:'pc-16-9'}),runtime=session.runtime,root=runtime.roots[0];assert(root?.name==='merchant');
 let source='local loaders,cache={},{}\nlocal function require(name) if cache[name] then return cache[name] end local value=assert(loaders[name],name)();cache[name]=value;return value end\n';
 for(const file of modulePaths)source+=`loaders[${JSON.stringify(path.basename(file,'.lua'))}]=function()\n${fs.readFileSync(file,'utf8')}\nend\n`;
 source+=`loaders.abyss_theme=function()\n${themeSource}\nend\nloaders.abyss_narrative=function()return ${toLua(narrative)}end\n`;
 source+=`local merchant,run,clicks\nfunction OnStart()\n script:EnableUpdate(true);run={};clicks=0\n merchant=require('abyss_merchant').new(script.object,{color=function(r,g,b,a)return{r=r,g=g,b=b,a=a}end})\n merchant:setVisible(true);merchant:enter(run)\n script.object:GetChild('talk'):GetChild('hit'):AddCursorEventListener(Enum.CursorEventType.CursorClick,function()clicks=clicks+1;merchant:tap()end)\nend\nfunction OnUpdate(dt)merchant:update(dt)end\nfunction Inspect(label)\n local c=merchant.current\n print('MERCHANT_STATE|'..label..'|'..c.kind..'|'..c.page..'|'..c.shown..'|'..c.ends[c.page]..'|'..#c.chars..'|'..script.object:GetChild('line').text..'|'..clicks..'|'..(c.shown>=c.ends[c.page] and 1 or 0))\nend\nfunction Visibility(value)merchant:setVisible(value)end\nfunction React(kind)assert(merchant:react(kind))end\nfunction EnterAgain()merchant:enter(run)end\nfunction EnterNewRun()run={};merchant:enter(run)end\n`;
 fs.writeFileSync(path.join(directory,'mounted.lua'),source);
 const mounted=runtime.mountScript({path:'merchant-native-reading.lua',control:root,source});
 const errors=()=>runtime.logs.filter(log=>log.level==='lua-error');
 const step=()=>{sdk.dn(session,1/60);assert.equal(errors().length,0,JSON.stringify(errors()))};
 function inspect(label){
  const before=runtime.logs.length;runtime.runChunk(mounted.env,`Inspect(${JSON.stringify(label)})`,label);
  assert.equal(errors().length,0,JSON.stringify(errors()));
  const row=runtime.logs.slice(before).find(log=>log.text.startsWith('MERCHANT_STATE|'));assert(row);
  const [,tag,kind,page,shown,end,total,text,clicks,complete]=row.text.split('|');
  return {tag,kind,page:Number(page),shown:Number(shown),end:Number(end),total:Number(total),text,clicks:Number(clicks),complete:complete==='1',time:runtime.clock.time};
 }
 function command(code){runtime.runChunk(mounted.env,code,code);assert.equal(errors().length,0,JSON.stringify(errors()))}
 function click(visible=true){
  const hit=root.children.find(c=>c.name==='talk').children.find(c=>c.name==='hit'),boxes=sdk.wi(session),box=boxes.get(hit.Id),matrix=sdk.pa(session,boxes).get(hit.Id),p=sdk.Me(matrix,box.centerX,box.centerY);
  sdk.vi(session,'move',p.x,p.y);const actual=sdk.vi(session,'down',p.x,p.y);
  assert.equal(actual?.Id,visible?hit.Id:undefined,'SDK cursor dispatch target differs');
  step();sdk.vi(session,'up',p.x,p.y);step();
 }
const row={profile,budget:theme.layout.merchant.pageCharacters,line:spec.children.find(c=>c.name==='line'),canvas:[runtime.canvasWidth,runtime.canvasHeight],initialControls:runtime.controlsById.size,automatic:[],manual:[],actions:[]};
 try{
  let lastPage='',lastFull='';
  for(let frame=0;frame<2400;frame++){
   step();const current=inspect('auto');
   if(current.kind+':'+current.page!==lastPage){row.automatic.push({...current,event:'page'});lastPage=current.kind+':'+current.page}
   if(current.complete&&current.kind+':'+current.page!==lastFull){row.automatic.push({...current,event:'full'});lastFull=current.kind+':'+current.page}
   if(current.kind==='greet')break;
  }
  const full=row.automatic.filter(e=>e.event==='full'&&e.kind==='encounter');assert.equal(full.map(e=>e.text).join(''),narrative.merchant.encounter);
  assert.equal(inspect('after-auto').kind,'greet');
  click();const accelerated=inspect('accelerate');assert.equal(accelerated.shown,accelerated.end);row.actions.push(accelerated);
  command("React('buy')");click();const buy=inspect('buy');assert.equal(buy.text,'「'+narrative.merchant.purchaseSuccess+'」');row.actions.push(buy);
  command("React('poor')");const poor=inspect('poor');assert.equal(poor.kind,'poor');row.actions.push(poor);
  command('Visibility(false)');const hidden=inspect('hidden');for(let i=0;i<600;i++)step();click(false);const paused=inspect('hidden-click');
  assert.equal(paused.clicks,hidden.clicks);assert.equal(paused.shown,hidden.shown);assert.equal(paused.text,hidden.text);row.actions.push(paused);
  command('Visibility(true)');step();const resumed=inspect('resumed');assert.equal(resumed.kind,poor.kind);assert(resumed.shown>poor.shown);row.actions.push(resumed);
  command('EnterAgain()');assert.equal(inspect('reenter').kind,'greet');row.actions.push(inspect('reenter'));
  command('EnterNewRun()');
  for(let page=0;page<32;page++){
   click();const current=inspect('manual-full');assert(current.complete);row.manual.push(current);
   if(current.end===current.total)break;
   click();
  }
  assert.equal(row.manual.map(e=>e.text).join(''),narrative.merchant.encounter);
  assert.deepEqual(row.manual.map(e=>e.text),full.map(e=>e.text),'SDK pointer and automatic pages differ');
  assert.equal(runtime.controlsById.size,row.initialControls,'Component state changes allocated controls');
  row.status='component_passed';
 }finally{
  runtime.destroy();row.remainingControls=runtime.controlsById.size;assert.equal(row.remainingControls,0);
  fs.writeFileSync(path.join(directory,'trace.json'),JSON.stringify(row,null,2)+'\n');report.profiles.push(row);
 }
 console.log(JSON.stringify({profile,status:row.status,controls:row.initialControls,remaining:row.remainingControls,fullPages:row.automatic.filter(e=>e.event==='full').length}));
}
report.status='component_passed';fs.writeFileSync(path.join(out,'receipt.json'),JSON.stringify(report,null,2)+'\n');
