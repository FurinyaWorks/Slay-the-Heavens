import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const m=await import(process.cwd()+'/tests/helpers/closeout-source-epoch.mjs');
const p=m.sourceEpoch.proof;let checks=0;
for(const [path,row] of Object.entries(p.current))if(row){assert.equal(createHash('sha256').update(readFileSync(path,'utf8').replaceAll('\r\n','\n')).digest('hex'),row.sha256,path);checks++;}
for(const [target,leaf]of [['releaseNavigationReviewed',m.releaseNavigationSourceEpoch],['releaseSelectionMapReviewed',m.releaseSelectionMapSourceEpoch],['releasePc22BasicFeedbackReviewed',m.releasePc22BasicFeedbackSourceEpoch]]){
 assert.deepEqual(p.targets[target].files,leaf.proof.current);checks++;
 for(const [name,view]of Object.entries(leaf.proof.targets)){assert.deepEqual(p.targets[name],view);checks++;}
}
for(const [path,target]of [['src/lua/abyss_card_flow.lua','releaseNavigationReviewed'],['src/lua/abyss_game_ui_input.lua','releasePc22BasicFeedbackReviewed']]){
 const raw=readFileSync(path,'utf8');const read=p=>readFileSync(p,'utf8');
 assert.equal(m.sourceEpoch.preCombinedSource(path,raw,{target,readSource:read}),p.targets[target].files[path].source);checks++;
 for(const linked of ['src/lua/abyss_card_flow.lua','src/lua/abyss_game_ui_input.lua']){
  assert.throws(()=>m.sourceEpoch.preCombinedSource(path,raw,{target,readSource:p=>read(p)+(p===linked?'\n':'')}));checks++;
 }
}
console.log(JSON.stringify({checks,production:Object.keys(p.current).length,targets:Object.keys(p.targets).length,result:'PASS'}));
