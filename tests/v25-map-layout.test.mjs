import test from 'node:test';
import assert from 'node:assert/strict';
import {mapLayout,mapGeometry} from '../scripts/map-ui-layout.mjs';
import {gameLayout} from '../scripts/game-ui-layout.mjs';
import {withViewport} from '../scripts/viewport-layout.mjs';
import {nativeTheme} from '../scripts/native-ui-theme.mjs';
import {assertNativeUiCapacity} from '../scripts/build-ui.mjs';
import {applyV25MapLayout,v25MapSource} from '../scripts/v25-map-layout.mjs';

const children=node=>node.controls??node.children??[];
const all=node=>[node,...children(node).flatMap(all)];
const find=(node,name)=>all(node).find(item=>item.name===name);
const entries=node=>Object.fromEntries(children(node).flatMap(c=>[[c.name,c],...Object.entries(entries(c)).map(([path,v])=>[c.name+'/'+path,v])]));

test('paper chrome preserves every graph, edge, scrolling and node-input object and path',()=>{
 const layout=mapLayout(),paths=entries(layout),themeBefore=structuredClone(nativeTheme),geometry=mapGeometry();
 const protectedPaths=Object.entries(paths).filter(([path])=>/\/(?:node\d+|edge\d+|dragArea|next|previous)(?:\/|$)/.test('/'+path));
 const snapshots=new Map(protectedPaths.map(([path,node])=>[path,structuredClone(node)]));
 applyV25MapLayout(layout,nativeTheme);const after=entries(layout);
 for(const[path,node]of protectedPaths){
  assert.equal(after[path],node,path);
  if(/^edge\d+$/.test(node.name)){
   const before=snapshots.get(path);assert.equal(node.kind,'container');assert.equal(node.children.length,8);
   for(const key of ['name','size','position','visible'])assert.deepEqual(node[key],before[key],path+'/'+key);
   for(const stroke of node.children){assert.equal(stroke.image,100001);assert.equal(stroke.colour,before.colour);assert.equal(stroke.kind,'image');}
  }else assert.deepEqual(node,snapshots.get(path),path);
 }
 assert.equal(all(layout).filter(c=>/^node\d+$/.test(c.name)).length,92);
 assert.equal(all(layout).filter(c=>/^edge\d+$/.test(c.name)).length,126);
 assert.deepEqual(mapGeometry(),geometry);assert.deepEqual(nativeTheme,themeBefore);
 assertNativeUiCapacity(layout);
});

test('paper and blue legend have layered native silhouettes, continuous light and no new input',()=>{
 const layout=mapLayout(),before=all(layout),hits=before.filter(c=>c.kind==='cursorArea').length;
 applyV25MapLayout(layout,nativeTheme);const panel=find(layout,'mapPanel'),paper=panel.children[0];
 assert.equal(paper.name,'v25MapPaper');assert(paper.children.length>10);
 assert(paper.children.some(c=>c.image===106095));assert(paper.children.some(c=>c.name.startsWith('paperEdge')));
 const legend=find(layout,'typeLegend'),chrome=legend.children[0];assert.equal(chrome.name,'v25LegendPaper');
 assert.deepEqual(legend.position,[486,22.5]);assert.deepEqual(legend.size,[266,333]);
 assert(chrome.children.some(c=>c.name==='topRoll'));assert(chrome.children.some(c=>c.name==='bottomRoll'));
 assert.equal(find(legend,'title').text.content,'图例');
 assert.equal(find(legend,'eventLabel').text.content,'未知');assert.equal(find(legend,'shopLabel').text.content,'商人');
 assert.equal(find(legend,'bossIcon').visible,true);assert.equal(find(legend,'bossLabel').visible,true);
 assert.equal(find(legend,'bossLabel').text.content,'首领');
 assert.equal(all(layout).filter(c=>c.kind==='cursorArea').length,hits);
 for(const node of all(paper).concat(all(chrome)))assert(!node.script&&!node.scripts&&!node.focusable);
});

test('wrapped production map retains live HUD contents and return command identities',()=>{
 const layout=withViewport(gameLayout(),nativeTheme),panel=find(layout,'mapPanel');
 const button=find(panel,'previewBack'),hit=find(button,'hit'),label=find(button,'label'),hp=find(panel,'resources').children.find(c=>c.name==='hp');
 const hpHint=find(find(panel,'resourceHints'),'hp'),hpHit=find(hpHint,'hit');
 label.text.content='实时返回文案';hp.text.content='57/80';
 const battleBefore=structuredClone(find(layout,'battlePanel'));
 applyV25MapLayout(layout,nativeTheme);
 assert.equal(find(panel,'previewBack'),button);assert.equal(find(button,'hit'),hit);assert.equal(find(button,'label'),label);
 assert.equal(label.text.content,'实时返回文案');assert.equal(hp.text.content,'57/80');
 assert.deepEqual(button.position,[-552,-235]);assert.deepEqual(hit.size,[184,52]);
 assert.equal(find(hpHint,'hit'),hpHit);assert(hpHit.size[0]>=48);
 assert(hp.position[0]+hp.size[0]/2<=hpHint.position[0]+hpHit.size[0]/2,'live HP text escaped its retained help target');
 assert(find(button,'v25ReturnFlag'));assert.deepEqual(find(layout,'battlePanel'),battleBefore);
 assertNativeUiCapacity(layout);
});

test('duplicate or malformed map refuses before changing input',()=>{
 const layout=mapLayout();applyV25MapLayout(layout,nativeTheme);const before=structuredClone(layout);
 assert.throws(()=>applyV25MapLayout(layout,nativeTheme),/already/);assert.deepEqual(layout,before);
 const broken=mapLayout();find(broken,'typeLegend').children=find(broken,'typeLegend').children.filter(c=>c.name!=='title');
 const prior=structuredClone(broken);assert.throws(()=>applyV25MapLayout(broken,nativeTheme),/title/);assert.deepEqual(broken,prior);
 assert.match(v25MapSource.stylesSha256,/^[0-9a-f]{64}$/);assert(v25MapSource.differences.includes('grain'));
});

test('map legend title retains source centre and font while fitting one native glyph line',()=>{
 const layout=mapLayout();applyV25MapLayout(layout,nativeTheme);
 const title=find(find(layout,'typeLegend'),'title');
 assert.deepEqual(title.position,[0,129]);assert.equal(title.text.fontSize,26);assert.equal(title.text.minFontSize,26);
 assert.equal(title.text.content,'图例');assert.deepEqual(title.size,[230,52]);
});

import {mkdirSync,writeFileSync} from 'node:fs';
import {battleLayout} from '../scripts/ui-layout.mjs';
import {applyStsRewardRows} from '../scripts/sts-reward-row-layout.mjs';
import {runLua} from '../scripts/test-lua.mjs';
test('reward return uses the adopted low-control rounded character material in every state',()=>{
 const layout=battleLayout();applyStsRewardRows(layout,structuredClone(nativeTheme));
 const find=(n,k)=>n.name===k?n:(n.children??n.controls??[]).map(c=>find(c,k)).find(Boolean);
 const button=find(layout,'continue');
 for(const state of button.children){
  const flag=find(state,'v25Flag');assert(flag);
  assert(find(flag,'corner-1_-1'),'rounded disc corners replace stepped flag bands');
  assert(!JSON.stringify(flag).includes('band0'));
 }
});
test('curved route geometry is stable, bounded, endpoint preserving and independent of RNG',()=>{
 mkdirSync('build',{recursive:true});
 const path='build/recording-route-curve.lua';
 writeFileSync(path,`local UI=require('abyss_map_ui')
assert(type(UI.routePoint)=='function','missing curved route geometry')
for seed=1,40 do
 local lastY=-1000
 for i=0,100 do
  local t=i/100
  local x,y=UI.routePoint(20,30,140,180,t,seed)
  local xx,yy=UI.routePoint(20,30,140,180,t,seed)
  assert(x==xx and y==yy,'unstable decoration')
  assert(math.abs(x-(20+120*t))<=12 and y>=lastY,'curve escapes bounded corridor')
  if i==0 then assert(x==20 and y==30)end
  if i==100 then assert(math.abs(x-140)<.00001 and y==180)end
  lastY=y
 end
 local x=UI.routePoint(20,30,140,180,.5,seed)
 assert(math.abs(x-80)>1,'route remains straight')
end
print('ROUTE_CURVE_PASS')
`);
 const result=runLua(path);
 assert.equal(result.status,0,result.stdout+result.stderr);
});

import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {beforeRecordingUi,authorizeReleaseUiRestore} from './helpers/release-ui-restore-source.mjs';
test('recording historical continuation accepts exact owners and rejects stale, drifted or mixed reads',()=>{
 const {files}=JSON.parse(gunzipSync(readFileSync('tests/helpers/recording-0401-source.json.gz')));
 for(const [path,row] of Object.entries(files)){
  const live=readFileSync(path,'utf8');
  assert.equal(beforeRecordingUi(path,live),row.before.source,path);
  const drift=live+'\n-- unreviewed drift\n';
  assert.equal(beforeRecordingUi(path,drift),drift,'unknown bytes must remain unprojected');
  assert.throws(()=>authorizeReleaseUiRestore([[path,live]],()=>drift),/recording UI linked owner changed/);
 }
});
