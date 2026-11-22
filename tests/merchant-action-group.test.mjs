import test from 'node:test';
import assert from 'node:assert/strict';
import {runLua} from '../scripts/test-lua.mjs';
import {nativeTheme} from '../scripts/native-ui-theme.mjs';
import {nodeLayout} from '../scripts/node-ui-layout.mjs';
import {officialAssetsTheme,applyOfficialAssets} from '../scripts/official-assets-layout.mjs';
import {gameLayout} from '../scripts/game-ui-layout.mjs';
import {v25Theme} from '../scripts/v25-layout.mjs';
import {applyV25NodeLayout} from '../scripts/v25-node-layout.mjs';
const child=(node,name)=>(node.children??node.controls??[]).find(part=>part.name===name);
const bounds=([x,y,w,h])=>[x-w/2,y-h/2,x+w/2,y+h/2];
const overlaps=(a,b)=>a[0]<b[2]&&a[2]>b[0]&&a[1]<b[3]&&a[3]>b[1];
function assertClearance(theme,page=child(nodeLayout(theme),'nodePanel')){
 const merchant=child(page,'merchant'),room=child(page,'shopRoom'),shop=child(page,'shopView');
 const vendor=child(room,'vendor'),talk=child(merchant,'talk'),bubble=child(merchant,'bubble');
 assert.deepEqual(vendor.position,talk.position);
 assert.deepEqual(talk.size,child(talk,'hit').size);
 assert(talk.size.every((value,i)=>value>=Math.max(44,vendor.size[i])),'receiver covers the full figure');
 assert.equal(child(merchant,'portrait'),undefined);
 assert.equal(room.visible,false);assert.equal(shop.visible,false);assert.equal(bubble.visible,false);
 assert(page.children.indexOf(room)<page.children.indexOf(shop),'shelf must slide above the room');
 assert.equal(child(merchant,'line').text.colour,theme.layout.merchant.bubble.ink);
 const feedback=bounds([...bubble.position,...bubble.size]),tap=bounds([...talk.position,...talk.size]);
 const occupied=shop.children.filter(n=>/^(card\d+|price\d+|relic\d+|relicPrice\d+|potion\d+|potionPrice\d+|removal|removalPrice)$/.test(n.name));
 const l=theme.layout.nativeNode;
 for(const part of occupied){
  const frame=[...part.position,...part.size];
  if(/^card\d+$/.test(part.name)){frame[2]*=l.shop.hoverScale;frame[3]*=l.shop.hoverScale;}
  assert(!overlaps(feedback,bounds(frame)),`temporary feedback overlaps ${part.name}`);
 }
 for(const action of [l.shop.cancel,l.shop.confirm,l.confirm])assert(!overlaps(feedback,bounds(action)));
 for(const name of ['notice','hp','gold','title','v25Identity']){
  const part=child(page,name);
  if(part)assert(!overlaps(feedback,bounds([...part.position,...part.size])),`temporary feedback overlaps ${name}`);
 }
 assert(!overlaps(tap,bounds(l.back)),'merchant must leave the exit separately reachable');
 for(const area of [feedback,tap])assert(area[0]>=-640+theme.canvas.safe.x&&area[2]<=640-theme.canvas.safe.x&&area[1]>=-360&&area[3]<=360,'shop input and feedback fit the safe area');
}
test('native merchant receiver covers the grounded figure and leaves exit separate',()=>{
 assertClearance(nativeTheme);
});
test('official merchant projection preserves room and shelf layering with seven offers',()=>{
 const theme=officialAssetsTheme(nativeTheme),layout=gameLayout();
 applyOfficialAssets([layout],theme);
 assertClearance(theme,child(layout,'nodePanel'));
});
test('V25 projection keeps the merchant receiver and feedback handles',()=>{
 const theme=v25Theme(nativeTheme),layout=gameLayout(),page=child(layout,'nodePanel');
 const merchant=child(page,'merchant'),line=child(merchant,'line'),talk=child(merchant,'talk');
 line.text.content='谢啦！';
 applyV25NodeLayout(layout,theme);
 assert.strictEqual(child(page,'merchant'),merchant);assert.strictEqual(child(merchant,'line'),line);
 assert.strictEqual(child(merchant,'talk'),talk);assert.equal(line.text.content,'谢啦！');
 assertClearance(theme,page);
});
test('grouped merchant purchase actions preserve mouse and touch trade and dialogue',()=>{
 const r=runLua('tests/lua/merchant_action_group.lua');
 assert.equal(r.status,0,r.stdout+r.stderr);
 assert.match(r.stdout,/MERCHANT_ACTION_GROUP_PASS/);
});
