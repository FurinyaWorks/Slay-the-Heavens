import test from 'node:test';
import assert from 'node:assert/strict';
import {geoStatue} from '../scripts/sts-neow-guide-layout.mjs';
import {gameLayout} from '../scripts/game-ui-layout.mjs';
import {nativeTheme} from '../scripts/native-ui-theme.mjs';
import {officialAssetsTheme,applyOfficialAssets} from '../scripts/official-assets-layout.mjs';
const child=(n,name)=>(n?.children??n?.controls??[]).find(c=>c.name===name);
test('rock statue uses bounded static controls and two shared library shapes',()=>{
 const statue=geoStatue(officialAssetsTheme(nativeTheme));
 const images=statue.children.flatMap(group=>group.children);
 assert(images.length>0 && images.length<=310);
 assert(statue.children.every(group=>group.children.length<=60));
 assert.deepEqual([...new Set(images.map(node=>node.image))].sort(),[100001,100003]);
 assert(images.every(node=>node.kind==='image' && node.opacity===1));
});

test('Neow scene fills precisely the shared HUD body area, detecting the old exposed gold strip',()=>{
 for(const change of [{},{y:332.5,height:55}]){
  const theme=officialAssetsTheme(nativeTheme);Object.assign(theme.officialAssets.battleHud,change);
  const layout=gameLayout(theme);applyOfficialAssets([layout],theme);
  const stage=child(layout,'stage')??layout,figure=child(child(child(stage,'nodePanel'),'eventView'),'neowFigure');
  const scene=child(figure,'scene'),[x,y]=scene.position,[w,h]=scene.size,hud=theme.officialAssets.battleHud;
  const hudBottom=360-(hud.y-hud.height/2);
  assert.deepEqual([x,w],[0,1280]);assert.equal(360-y-h/2,hudBottom);assert.equal(360-y+h/2,720);
  assert.notEqual(80,hudBottom,'old scene640 must fail the HUD seam contract');
  assert.notEqual(44,hudBottom,'independent topBar44 also leaves a one-pixel gold gap');
  assert(child(figure,'geoStatue'));
 }
});
