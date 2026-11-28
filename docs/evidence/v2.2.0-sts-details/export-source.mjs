// Integration preview of the existing GameUI with current source modules. This
// is a source-generated Simulator save, never an actual GIL readback.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
const [checkout,outDirectory,expectedSource]=process.argv.slice(2);
if(!checkout||!outDirectory||!expectedSource)throw Error('Usage: export-source.mjs <checkout> <new output> <source SHA>');
const repo=path.resolve(checkout);
const out=path.resolve(outDirectory);
const source=execFileSync('git',['-C',repo,'rev-parse','HEAD'],{encoding:'utf8'}).trim();
if(source!==expectedSource)throw Error('Unexpected source SHA '+source);
const dirty=execFileSync('git',['-C',repo,'status','--porcelain','--untracked-files=all','--','src','data','scripts','art'],{encoding:'utf8'}).trim();
if(dirty)throw Error('Dirty runtime source '+dirty);
const fromRepo=filename=>import(pathToFileURL(path.join(repo,filename)));
const {buildUI}=await fromRepo('scripts/build-ui.mjs');
const {previewImageMaskFields}=await fromRepo('scripts/native-candidate-preview.mjs');
const {deckBrowserParts,deckBrowserBindingSource}=await fromRepo('scripts/deck-ui-layout.mjs');
const {buildLuaData}=await fromRepo('scripts/build-lua-data.mjs');
process.chdir(repo);
const generated=path.join(out,'generated');
if(fs.existsSync(out))throw Error('Use a new integration evidence directory');
buildUI(generated,undefined,{officialAssets:true,refinedReleaseMonsterArt:true,nativePageLifecycle:true,experimentalCharacters:false});
buildLuaData('data',path.join(generated,'abyss_data.lua'));
const layout=JSON.parse(fs.readFileSync(path.join(generated,'game-ui.json')));
const templates=JSON.parse(fs.readFileSync(path.join(generated,'game-ui-templates.json')));
const save=JSON.parse(fs.readFileSync('experiments/art-tech-lab/seed.save.json'));
let guid=1800000000;const templateIds=Object.fromEntries(templates.map(t=>[t.name,++guid]));
const scripts=new Map(fs.readdirSync('src/lua').filter(f=>f.endsWith('.lua')).map(f=>[f,fs.readFileSync('src/lua/'+f,'utf8')]));
for(const f of fs.readdirSync(generated).filter(f=>f.endsWith('.lua')))scripts.set(f,fs.readFileSync(path.join(generated,f),'utf8'));
// The real importer supplies these indices when writing its native templates.
scripts.set('abyss_monster_actor_binding.lua',`return {enabled=true,templateIndex=${templateIds.AbyssMonsterActor},powerTemplateIndex=${templateIds.AbyssMonsterPower},containerTemplateIndex=${templateIds.AbyssReadyCardGroup}}`);
const browserParts=deckBrowserParts.map(part=>({...part,templateIndex:templateIds[part.name]}));
if(!browserParts.every(part=>Number.isSafeInteger(part.templateIndex)))throw Error('missing official browser part');
scripts.set('abyss_deck_browser_binding.lua',deckBrowserBindingSource(templateIds.AbyssBattlePileCard,browserParts));
const scriptIds=Object.fromEntries([...scripts.keys()].map(name=>[name.slice(0,-4),++guid]));
const argb=(hex='#FFFFFF',a=1)=>((Math.round(a*(hex.length===9?parseInt(hex.slice(7,9),16):255))<<24)|parseInt(hex.slice(1,7),16))>>>0;
const cap=value=>value[0].toUpperCase()+value.slice(1);
const vector=(a,def)=>({x:a?.[0]??def[0],y:a?.[1]??def[1]});
const align={centre:'Middle',middle:'Middle',left:'Left',right:'Right',top:'Top',bottom:'Bottom'};
function convert(s,template=false){
 const kinds={container:'container',image:'image',text:'textbox',cursorArea:'cursor',presetButton:'button',grid:'grid',reference:'reference',keyHint:'keyhint',textWindow:'textwindow',animation:'animation',fullscreenAnimation:'fullscreen'};
 const kind=kinds[s.kind];if(!kind)throw Error('Unsupported '+s.kind);
 const index=template?templateIds[s.name]:++guid;
 const n={id:'n'+index,guid:index,kind,name:s.name,active:s.active!==false,visible:s.visible!==false,canControllerFocus:s.focusable===true,scriptMappingIds:[],giaRelatedGuids:[],transformByPlatform:{}};
 for(const [platform,device]of [['KEYBOARD',null],['TOUCHSCREEN','mobile'],['CONTROLLER_CONSOLE','console'],['CONTROLLER_MOBILE','mobileGamepad']]){
  const v={...s,...s.devices?.[device]};
  const [x,y,z]=Array.isArray(v.rotation)?v.rotation:[0,0,v.rotation??0];
  n.transformByPlatform[platform]={scale:{...vector(v.scale,[1,1]),z:1},rotation:{x,y,z},anchorMin:vector(v.anchor?.min,[.5,.5]),anchorMax:vector(v.anchor?.max,[.5,.5]),offset:vector(v.position,[0,0]),size:vector(v.size,[0,0]),pivot:vector(v.pivot,[.5,.5])};
 }
 if(kind==='container')Object.assign(n,{showCursor:s.showCursor===true,disableKeyEventPassthrough:s.blockKeys===true,disableCursorEventPassthrough:s.blockCursor===true,isolateNavigation:s.isolateNavigation===true});
 if(kind==='image'){
  const imageSource=cap(s.imageSource??'staticReference');
  const shape=s.fill?.shape??'horizontal';
  Object.assign(n,{imageId:s.image,imageSource,imageType:imageSource==='StaticReference'&&s.image>100006?cap(s.imageType??'basic'):null,
   imageColor:argb(s.colour,s.opacity??1),...previewImageMaskFields(s),fillAmount:s.fill?.amount??1,
   fillType:cap(shape),fillClockwise:s.fill?.clockwise!==false});
  if(s.fill?.from){
   const field={horizontal:'fillHorizontalType',vertical:'fillVerticalType',radial90:'fillRadial90Type'}[shape]??'fillRadialType';
   n[field]=cap(s.fill.from);
  }
 }
 if(kind==='textbox'||kind==='textwindow'){const t=s.text??{};Object.assign(n,{text:t.content??'',fontSize:t.fontSize??20,minimumFontSize:t.minFontSize??20,adaptiveFontSize:t.autoSize===true,fontColor:argb(t.colour),bgColor:argb(t.background??'#000000',t.backgroundOpacity??0),enableOutline:t.outline!==false,outlineColor:argb(t.outlineColour??'#333333',t.outlineOpacity??.2),horizontalAlignment:align[t.align]??'Middle',verticalAlignment:align[t.valign]??'Middle'});}
 if(kind==='cursor'||kind==='button')Object.assign(n,{raycastTarget:true,interactable:s.enabled!==false});
 if(kind==='grid'){const g=s.grid;Object.assign(n,{itemPrefabId:templateIds[s.itemTemplate],raycastTarget:true,interactable:true,showScrollBar:g.scrollbar!==false,scrollDirection:g.horizontal||g.rows?'Horizontal':'Vertical',layoutConstraint:'Fixed',layoutConstraintFixedCount:g.columns??g.rows,cellSizeX:g.itemSize[0],cellSizeY:g.itemSize[1],spacingX:g.spacing[0],spacingY:g.spacing[1],padding1X:g.padding[0],padding1Y:g.padding[1],padding2X:g.padding[2],padding2Y:g.padding[3],previewCount:g.preview??5});}
 if(kind==='reference')n.referencedPrefabId=templateIds[s.template];
 if(kind==='keyhint'){n.keyboardKeyCode=s.key;n.controllerKeyCode=s.padKey;}
 if(kind==='animation'||kind==='fullscreen'){n.animationId=s.effect;n.playSoundEffect=s.effectSound===true;n.layer=s.below?'BelowAllControls':'AboveAllControls';}
 n.children=(s.children??s.controls??[]).map(c=>convert(c)).reverse();
 if(s.states)for(const [state,field]of [['hover','hoverChildId'],['pressed','pressedChildId'],['disabled','unavailableChildId']])n[field]=n.children.find(c=>c.name===s.states[state])?.id??null;
 for(const script of [...(s.scripts??[]),...(s.script?[s.script]:[])]){const name=typeof script==='string'?script:script.name;n.scriptMappingIds.push(scriptIds[name]);}
 return n;
}
const root=convert({name:'root',kind:'container',size:[0,0],anchor:{min:[0,0],max:[1,1]},children:layout.controls,script:layout.script,showCursor:true,blockCursor:true,blockKeys:true});
save.assets.server.root.children=[root];save.assets.server.selectedId=root.id;
save.assets.client.root.children=templates.map(t=>convert(t,true));
save.assets.scripts=[...scripts].map(([name,source])=>({id:'s'+scriptIds[name.slice(0,-4)],guid:scriptIds[name.slice(0,-4)],path:name,source,controlAsset:name==='abyss_ui.lua'?'server-control-template':null,controlId:name==='abyss_ui.lua'?root.id:null}));
save.meta.name='release/v2.2.0 '+source.slice(0,8)+' official-assets-battle-v3 source projection';
fs.writeFileSync(path.join(out,'game.save.json'),JSON.stringify(save));
fs.writeFileSync(path.join(out,'integration-source.json'),JSON.stringify({scope:'Source-generated official-assets-battle-v3 GameUI; simulator template indices bound locally',source,productionProfile:{officialAssets:true,refinedReleaseMonsterArt:true,nativePageLifecycle:true,experimentalCharacters:false},modules:Object.fromEntries([...scripts].map(([n,s])=>[n,createHash('sha256').update(s).digest('hex')]))},null,2));
console.log(path.join(out,'game.save.json'));
