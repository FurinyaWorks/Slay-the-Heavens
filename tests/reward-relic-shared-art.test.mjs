import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {buildUI} from '../scripts/build-ui.mjs';
import {runLua} from '../scripts/test-lua.mjs';
import {attachLowCostArt} from '../scripts/lowcost-art.mjs';
const children=n=>n.children??n.controls??[];
const find=(n,name)=>n.name===name?n:children(n).map(c=>find(c,name)).find(Boolean);
const count=n=>1+children(n).reduce((sum,c)=>sum+count(c),0);
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const states=['normal','hover','pressed','disabled'];

test('reward relics share one real root fallback/pool with unchanged state faces and no new input',()=>{
 const dir=mkdtempSync(join(tmpdir(),'abyss-reward-shared-'));
 try{
  buildUI(dir,undefined,{officialAssets:true,nativePageLifecycle:true});
  for(const file of ['battle-ui.json','game-ui.json']){
   const tree=read(join(dir,file));let removed=0,added=0;
   for(let i=1;i<=2;i++){
    const row=find(tree,'relicReward'+i),icon=row.children.find(c=>c.name==='rewardIcon'),pool=row.children.find(c=>c.name==='rewardIconArt');
    assert(icon&&pool);assert.deepEqual(icon.position,[-118,0]);assert.deepEqual(icon.size,[28,28]);
    assert.deepEqual(pool.position,icon.position);assert.equal(pool.children.length,16);assert.equal(pool.visible,false);
    assert.equal(row.kind,'presetButton');assert.equal(row.focusable,true);
    assert.deepEqual(row.states,Object.fromEntries(states.map(s=>[s,s])));
    const pictureIndex=row.children.indexOf(icon);
    for(const name of states){
     const face=row.children.find(c=>c.name===name);assert(row.children.indexOf(face)<pictureIndex,'picture stays above active face');
     assert.deepEqual(face.size,row.size);assert.deepEqual(face.scale,[1,1]);
     assert.deepEqual(face.children.map(c=>c.name),['border','plate','stsRewardFace','label']);
     const label=face.children.find(c=>c.name==='label');
     assert(icon.position[0]+icon.size[0]/2<=label.position[0]-label.size[0]/2,'picture never overlaps label');
    }
    for(const part of [icon,pool,...pool.children]){
     assert.equal(part.raycastTarget,false,'no extra hit target');assert(!part.focusable&&!part.states&&!part.script);
    }
    removed+=3;added+=count(pool);
   }
   assert.equal(added-removed,28,'two real shared pools minus duplicate native fallbacks');
   const snapshot=JSON.stringify(tree);attachLowCostArt(tree);assert.equal(JSON.stringify(tree),snapshot,'attachment is idempotent');
  }
  const entry=join(dir,'shared-runtime.lua');
  writeFileSync(entry,`package.path=${JSON.stringify(dir.replaceAll('\\','/')+'/?.lua;')}..package.path;dofile('tests/lua/reward_relic_shared_art.lua')`);
  const r=runLua(entry);assert.equal(r.status,0,r.stdout+r.stderr);assert.match(r.stdout,/REWARD_RELIC_SHARED_ART_PASS/);
  buildUI(join(dir,'default'));
  for(const file of ['battle-ui.json','game-ui.json'])for(let i=1;i<=2;i++){
   const row=find(read(join(dir,'default',file)),'relicReward'+i);
   assert(!row.children.some(c=>c.name==='rewardIconArt'),'default profile retains its existing presentation');
  }
 }finally{rmSync(dir,{recursive:true,force:true});}
});
