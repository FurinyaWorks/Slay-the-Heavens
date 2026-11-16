import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const [repoArg,dirArg,out]=process.argv.slice(2);
const repo=resolve(repoArg),dir=resolve(dirArg);
process.chdir(repo);
const {packageInventory}=await import(pathToFileURL(join(repo,'scripts/platform-load.mjs')).href);
const sha=b=>createHash('sha256').update(b).digest('hex');
const read=n=>readFileSync(join(dir,n));
const layout=JSON.parse(read('game-ui.json'));
const templates=JSON.parse(read('game-ui-templates.json'));
const summary=(node,hidden=false)=>{
  const invisible=hidden||node.visible===false;
  let nodes=1, initialHidden=invisible?1:0, leafImages=0;
  const children=node.children??node.controls??[];
  if(node.kind==='image'&&!children.length)leafImages++;
  for(const c of children){
    const s=summary(c,invisible);nodes+=s.nodes;initialHidden+=s.initialHidden;leafImages+=s.leafImages;
  }
  return {nodes,initialHidden,leafImages};
};
const stage=layout.controls.find(x=>x.name==='stage');
const subtrees=stage.children.map(n=>({name:n.name,...summary(n,stage.visible===false),jsonBytes:Buffer.byteLength(JSON.stringify(n))}));
const other=layout.controls.filter(n=>n!==stage).map(n=>({name:n.name,...summary(n),jsonBytes:Buffer.byteLength(JSON.stringify(n))}));
const templateReports=templates.map(n=>({name:n.name,...summary(n),jsonBytes:Buffer.byteLength(JSON.stringify(n))}));
const faces=[];
function scanFaces(n,path=''){
  path+='/'+n.name;
  const children=n.controls??n.children??[];
  if(children.some(c=>c.name==='artPlate'))faces.push({path,...summary(n)});
  for(const c of children) scanFaces(c,path);
}
scanFaces(layout);
for(const n of templates) scanFaces(n,'templates');
const inventory=packageInventory(dir);
assert.deepEqual(inventory.artFeatures,{cards:false,menuBackground:true,selectionAvatar:true,battlePortrait:true,monsters:false});
assert.equal(subtrees.reduce((s,x)=>s+x.nodes,0)+1+other.reduce((s,x)=>s+x.nodes,0)+templateReports.reduce((s,x)=>s+x.nodes,0),inventory.controls);
assert.equal(inventory.runtimeCardArt,undefined);
const result={release:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),measurement:'generated default CLI profile, pre-SDK; not official storage or device load', flags:inventory.artFeatures,
 outputs:Object.fromEntries(['game-ui.json','game-ui-templates.json','abyss_ui_layout.lua'].map(n=>[n,{bytes:read(n).length,sha256:sha(read(n))}])),
 lua:{modules:inventory.modules.length,bytes:inventory.luaBytes,top:inventory.modules.sort((a,b)=>b.bytes-a.bytes).slice(0,12)},
 ui:{structuralCardFaces:faces,structuralCardFaceNodes:faces.reduce((n,x)=>n+x.nodes,0),controls:inventory.controls,initialHidden:inventory.hiddenControls,artSamplesOnly:inventory.artPools,hashEqualLeafOccurrences:inventory.repeatedPrimitiveInstances,
   subtrees:subtrees.sort((a,b)=>b.nodes-a.nodes),other,templates:templateReports.sort((a,b)=>b.nodes-a.nodes)},
 background:inventory.runtimeBackgrounds,portraits:inventory.runtimePortraits};
const payload=JSON.stringify(result,null,2)+'\n';
writeFileSync(resolve(out),payload);
console.log('PASS project inventory and separate stage ownership accounting');
console.log(JSON.stringify({lua:result.lua,ui:result.ui.subtrees.slice(0,6),total:result.ui.controls,templates:result.ui.templates.length,flags:result.flags},null,2));
