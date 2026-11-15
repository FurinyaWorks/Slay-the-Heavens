import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdirSync,mkdtempSync,readFileSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {buildUI} from '../scripts/build-ui.mjs';
for(const officialAssets of [false,true])test(`${officialAssets?'official':'default'} compiled drag line starts hidden before any gesture or native page publication`,()=>{
 mkdirSync('build',{recursive:true});const dir=mkdtempSync(join(process.cwd(),'build','drag-line-'));
 try{
  buildUI(dir,undefined,{officialAssets});let found=0;
  function visit(n){
   if(n.name==='dragLayer'){
    const line=n.children.find(c=>c.name==='line');assert(line,'missing geometry anchor');
    assert.equal(line.visible,false,'obsolete gold guide is initially visible in the encoded native child state');
    assert.equal(line.kind,'image');assert(line.size.every(v=>v>0));found++;
   }
   for(const c of n.children??n.controls??[])visit(c);
  }
  for(const name of ['battle-ui.json','game-ui.json'])visit(JSON.parse(readFileSync(join(dir,name),'utf8')));
  assert.equal(found,2,'both independently embedded battle roots must be protected');
 }finally{rmSync(dir,{recursive:true,force:true});}
});
