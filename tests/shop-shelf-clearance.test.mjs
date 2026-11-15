import test from 'node:test';
import assert from 'node:assert/strict';
import {nativeTheme} from '../scripts/native-ui-theme.mjs';
import {gameLayout} from '../scripts/game-ui-layout.mjs';
import {withViewport} from '../scripts/viewport-layout.mjs';
import {officialAssetsTheme,applyOfficialAssets} from '../scripts/official-assets-layout.mjs';

const parts=n=>n.controls??n.children??[];
const find=(n,name)=>n.name===name?n:parts(n).map(c=>find(c,name)).find(Boolean);
const rectangle=(n,scale=1,dy=0)=>{
 const [x,y]=n.position??[0,0],[w,h]=n.size;
 return {left:x-w*scale/2,right:x+w*scale/2,bottom:y+dy-h*scale/2,top:y+dy+h*scale/2};
};
const overlaps=(a,b)=>Math.min(a.right,b.right)>Math.max(a.left,b.left)&&Math.min(a.top,b.top)>Math.max(a.bottom,b.bottom);

for(const official of [false,true])test(`${official?'official':'default'} shop keeps all goods, prices and stable hit targets clear at rest and on hover`,()=>{
 const theme=official?officialAssetsTheme(nativeTheme):structuredClone(nativeTheme);
 const layout=withViewport(gameLayout(theme),theme);
 if(official)applyOfficialAssets([layout],theme);
 const shop=find(layout,'shopView'),L=theme.layout.nativeNode.shop;
 const cards=Array.from({length:7},(_,i)=>find(shop,`card${i+1}`));
 const items=['relic','potion'].flatMap(category=>Array.from({length:3},(_,i)=>find(shop,`${category}${i+1}`)));
 assert.equal(cards.length,7);assert.equal(items.length,6);
 for(const item of items){
  assert.deepEqual(find(item,'hit').size,item.size,'goods retain the complete purchase/inspection target');
  const label=find(item,'name');
  assert(label.size[0]>=104&&label.size[1]>=40,'long item names keep their existing autosizing text budget');
  assert.equal(label.text.autoSize,true);
 }
 const removal=find(shop,'removal');
 // Compare the full composition with the original shelf. This guards against
 // fixing overlap by hiding goods, shrinking cards/text/hit areas or adding UI.
 const originalSource=structuredClone(nativeTheme);
 for(const category of ['relics','potions'])originalSource.layout.nativeNode.shop[category].columns=[-50,140,330];
 const originalTheme=official?officialAssetsTheme(originalSource):originalSource;
 const original=withViewport(gameLayout(originalTheme),originalTheme);
 if(official)applyOfficialAssets([original],originalTheme);
 const normalized=structuredClone(layout),oldShop=find(original,'shopView');
 for(const item of items){
  const old=find(oldShop,item.name),updated=find(find(normalized,'shopView'),item.name);
  assert.equal(updated.position[0]-old.position[0],50);
  updated.position[0]=old.position[0];
  const price=find(find(normalized,'shopView'),item.name.replace(/(\d+)$/,'Price$1'));
  const oldPrice=find(oldShop,price.name);
  assert.equal(price.position[0]-oldPrice.position[0],50);
  price.position[0]=oldPrice.position[0];
 }
 assert.deepEqual(normalized,original,'only twelve goods/price horizontal anchors change');
 const goods=[...cards,...items,removal];
 const prices=[...cards.map((_,i)=>find(shop,`price${i+1}`)),...['relic','potion'].flatMap(category=>Array.from({length:3},(_,i)=>find(shop,`${category}Price${i+1}`))),find(shop,'removalPrice')];
 for(const focused of [-1,...cards.keys()]){
  const bounds=goods.map((n,i)=>rectangle(n,i===focused?L.hoverScale:1));
  const priceBounds=prices.map((n,i)=>rectangle(n,1,i===focused?-(L.hoverScale-1)*theme.layout.card.size[1]/2:0));
  for(let i=0;i<goods.length;i++)for(let j=i+1;j<goods.length;j++)
   assert(!overlaps(bounds[i],bounds[j]),`${goods[i].name} overlaps ${goods[j].name}; focused=${focused+1}`);
  for(let i=0;i<prices.length;i++){
   for(let j=0;j<goods.length;j++)assert(!overlaps(priceBounds[i],bounds[j]),`${prices[i].name} overlaps ${goods[j].name}; focused=${focused+1}`);
   for(let j=i+1;j<prices.length;j++)assert(!overlaps(priceBounds[i],priceBounds[j]),`${prices[i].name} overlaps ${prices[j].name}`);
  }
 }
});
