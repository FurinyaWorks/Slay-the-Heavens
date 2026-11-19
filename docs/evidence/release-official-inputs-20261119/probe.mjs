// Offline compiler-input evidence only. This does not emulate native GetChild.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,join,dirname,relative} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
const root=resolve(process.argv[2]),generated=resolve(process.argv[3]),out=resolve(process.argv[4]);
process.chdir(root);
const use=p=>import(pathToFileURL(join(root,p)).href);
const {packNativeCardFaces}=await use('scripts/native-ui-card-sharing.mjs');
const {assertNativeUiCapacity}=await use('scripts/build-ui.mjs');
const {assertOfficialRunContracts}=await use('scripts/official-run-layout.mjs');
const {officialAssetFlags,validateOfficialAssets,officialAssetsArgs,officialAssetsProfile}=await use('scripts/official-assets-profile.mjs');
const {sourceInputs}=await use('scripts/build-native-candidate.mjs');
const expectedInputs=JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)),'source-inputs.json'),'utf8'));
assert.deepEqual(sourceInputs(root,{artFeatures:officialAssetFlags}),expectedInputs.map(({path,sha256,bytes})=>({path,sha256,bytes})));
const {candidateScriptFiles}=await use('scripts/native-candidate-scripts.mjs');
const hash=b=>createHash('sha256').update(b).digest('hex');
const json=p=>JSON.parse(readFileSync(join(generated,p),'utf8'));
const layout=json('game-ui.json'),templates=json('game-ui-templates.json'),profile=json('assembly-profile.json');
assert.equal(profile.uiProfile,'official-assets');assert.equal(profile.releaseCandidate,false);
assert.equal(profile.nativePageLifecycle,true);assert.deepEqual(profile.artFeatures,officialAssetFlags);
assert.equal(validateOfficialAssets({officialAssets:true}),true);
assert.throws(()=>validateOfficialAssets({officialAssets:true,releaseCandidate:true}),/separate non-release/);
assert.throws(()=>officialAssetsArgs(['--official-assets','--official-assets']),/duplicate/);
assert.throws(()=>validateOfficialAssets({officialAssets:true,artFeatures:{cards:true}}),/disable custom cards/);
const builder=readFileSync(join(root,'scripts/build-native-candidate.mjs'),'utf8');
assert(builder.includes('packNativeCardFaces(layout,templates,{enabled:!officialAssets&&!v25BattleChrome&&!lightweight2d&&!componentWidgets})'));
const packing=packNativeCardFaces(layout,templates,{enabled:false});
assert.equal(packing.sharing.sharedHosts,0);assert.deepEqual(packing.sharing.templateNames,[]);
assert.deepEqual({layout:packing.layout,templates:packing.templates},{layout,templates});
assertOfficialRunContracts([json('battle-ui.json'),layout,...templates]);
for(const tree of [layout,...templates])assertNativeUiCapacity(tree);
const children=n=>n.controls??n.children??[];
function entries(tree,prefix=''){
 const path=[prefix,tree.name].filter(Boolean).join('/');
 const list=children(tree);assert.equal(new Set(list.map(n=>n.name)).size,list.length,'duplicate child at '+path);
 return [[path,tree],...list.flatMap(n=>entries(n,path))];
}
const all=[...entries(layout),...templates.flatMap(t=>entries(t,'templates'))];
const refs=all.filter(([,n])=>n.kind==='reference');assert.deepEqual(refs,[],'no reference expansion may hide interactive children');
const direct=(tree,path)=>{
 let node=tree;
 for(const part of path.split('/')){assert.notEqual(node.kind,'reference','reference boundary at '+path);node=children(node).find(n=>n.name===part);assert(node,'missing physical input '+path);}
 assert(['cursorArea','presetButton'].includes(node.kind),'unexpected input kind '+path);
 assert(node.size?.every(n=>Number.isFinite(n)&&n>0),'positive authored input size '+path);
 return node;
};
const theme=json('official-assets-theme.json'),pickerColumns=theme.layout.nativeNode.picker.columns.length;
assert.equal(pickerColumns,3,'official profile has three live picker slots');
const stage0=children(layout).find(n=>n.name==='stage'),node0=children(stage0).find(n=>n.name==='nodePanel'),picker0=children(node0).find(n=>n.name==='pickerView');
for(let i=pickerColumns+1;i<=6;i++){const retired=children(picker0).find(n=>n.name===`card${i}`);assert.equal(retired.visible,false);assert.deepEqual(children(retired),[]);}
const groups={
 hand:Array.from({length:10},(_,i)=>`stage/battlePanel/card${i+1}/hit`),
 shop:Array.from({length:7},(_,i)=>`stage/nodePanel/shopView/card${i+1}/hit`),
 picker:Array.from({length:pickerColumns},(_,i)=>`stage/nodePanel/pickerView/card${i+1}/hit`),
 forge:Array.from({length:12},(_,i)=>`stage/nodePanel/pickerView/forgeGrid/card${i+1}/hit`),
 choice:Array.from({length:2},(_,i)=>`stage/choicePanel/card${i+1}/hit`),
 controls:['stage/battlePanel/endTurn','stage/nodePanel/merchant/talk/hit','stage/nodePanel/confirm/hit','stage/choicePanel/confirm/hit'],
};
const merchant0=children(node0).find(n=>n.name==='merchant'),nextIndicator=children(merchant0).find(n=>n.name==='next');
assert.equal(nextIndicator.kind,'image','merchant next is a decorative indicator, not an input');
assert.deepEqual(children(nextIndicator),[]);
const hits=Object.fromEntries(Object.entries(groups).map(([group,paths])=>[group,paths.map(path=>{const n=direct(packing.layout,path);return {path,kind:n.kind,size:n.size,position:n.position??null};})]));
const negative=[];
for(const path of [groups.hand[0],groups.shop[0],groups.picker[0],groups.choice[0],groups.controls[1]]){
 const mutant=structuredClone(packing.layout),parts=path.split('/');let parent=mutant;
 for(const part of parts.slice(0,-1))parent=children(parent).find(n=>n.name===part);
 const key=parent.controls?'controls':'children';parent[key]=parent[key].filter(n=>n.name!==parts.at(-1));
 assert.throws(()=>direct(mutant,path),/missing physical input/);negative.push({path,mutation:'remove requested control',result:'rejected'});
}
const mutant=structuredClone(packing.layout),stage=children(mutant).find(n=>n.name==='stage'),battle=children(stage).find(n=>n.name==='battlePanel'),card=children(battle).find(n=>n.name==='card1');
card.kind='reference';card.template='AbyssSharedCardFace1';delete card.children;
assert.throws(()=>direct(mutant,groups.hand[0]),/reference boundary/);negative.push({path:groups.hand[0],mutation:'replace host with reference',result:'rejected'});
const scripts=candidateScriptFiles(join(root,'src/lua'),generated);
const files=readdirSync(generated).sort().map(name=>{const bytes=readFileSync(join(generated,name));return {path:name,bytes:bytes.length,sha256:hash(bytes)};});
const result={schemaVersion:1,sourceCommit:'1ceb7c1a0c8575497c29acfd5a407ae399a9aaa2',status:'OFFLINE_INPUTS_VERIFIED',officialAssetsProfile,
 profile,packing:packing.sharing,layoutRecords:all.length,referenceRecords:refs.length,maxDirectChildren:Math.max(...all.map(([,n])=>children(n).length)),
 verifiedInputPaths:hits,retiredPickerSlots:[4,5,6],negativeControls:negative,generatedFiles:files,
 compactJsonBytes:{layout:Buffer.byteLength(JSON.stringify(layout)),templates:Buffer.byteLength(JSON.stringify(templates))},
 sourceInputs:{count:expectedInputs.length,bytes:expectedInputs.reduce((n,s)=>n+s.bytes,0),lfsObjects:expectedInputs.filter(s=>s.lfsOid).length},
 preBindingLuaInputs:{count:scripts.length,bytes:scripts.reduce((n,s)=>n+readFileSync(s.sourceFile).length,0),modules:scripts.map(s=>({name:s.name,path:relative(root,s.sourceFile).startsWith('..')?'generated/'+s.name+'.lua':relative(root,s.sourceFile),bytes:readFileSync(s.sourceFile).length,sha256:hash(readFileSync(s.sourceFile))}))},
 limits:{levelStorageMB:20,serverStorageMB:3,internalTargetMB:16,officialMeasurement:'UNVERIFIED',inputControlMaximumChildren:60},
 notVerified:['GIL encoding/readback','engine reference/GetChild behavior','actual fallback candidate identity and post-binding Lua bytes','official capacity/import/ready','PC and physical phone','Hosted Full','release authorization']};
writeFileSync(out,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:result.status,sourceCommit:result.sourceCommit,paths:Object.values(hits).reduce((n,v)=>n+v.length,0),negativeControls:negative.length,controls:all.length,references:refs.length,sharedHosts:packing.sharing.sharedHosts,maxDirectChildren:result.maxDirectChildren,compactJsonBytes:result.compactJsonBytes,preBindingLuaInputs:{count:result.preBindingLuaInputs.count,bytes:result.preBindingLuaInputs.bytes},sourceInputs:result.sourceInputs},null,2));
