import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {paths,checkUi,checkReceipt,checkEmbeddedScripts} from './check-readback.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
const sourceCommit='1'.repeat(40),buildId='8f29120f-8bb6-4826-911b-71edd49e630e';
const bytes=Buffer.from('synthetic candidate bytes, not an encoded GIL');
const rootSource=`print("ABYSS_BUILD ${buildId}")\nreturn true\n`;
function packet(){
 const uiProfile={schemaVersion:1,nativePageLifecycle:false},art={schemaVersion:2,flags:{cards:false,menuBackground:true,selectionAvatar:true,battlePortrait:true,monsters:false}};
 const baseSha256='2'.repeat(64);
 return {sourceCommit,sourceDirty:false,buildId,payloadDigest:'3'.repeat(64),liveWriteEnabled:false,checked:{ok:true,errors:0},
  sourceReceipt:{sha256:'4'.repeat(64)},baseSha256,baseAfter:baseSha256,candidate:{sha256:sha(bytes),bytes:bytes.length},sha256:sha(bytes),
  uiProfile:{...uiProfile,configSha256:sha(JSON.stringify(uiProfile))},artFeatures:{...art,configSha256:sha(JSON.stringify(art))},toolchainIdentity:{sourceSha256:'5'.repeat(64)},moduleDigests:{abyss_ui:sha(rootSource),helper:sha('return {}')}};
}
function layout() {
 const ui={name:'SlayTheAbyss',scripts:[{name:'abyss_ui'}],controls:[]},ids={};let id=500;
 for(const path of paths){
  const trail=[];let list=ui.controls;
  for(const part of path.split('/')){
   trail.push(part);let n=list.find(n=>n.name===part);
   if(!n){n={name:part,kind:trail.join('/')===path?'cursorArea':'container',children:[],size:[32,16]};list.push(n);ids[trail.join('/')]=++id}
   list=n.children;
  }
 }
 return {interface:ui,ids};
}
function pathOf(ui,path){let list=ui.interface.controls,n;for(const p of path.split('/')){n=list.find(n=>n.name===p);list=n.children;}return n}
const first='stage/battlePanel/card1/hit';
test('physical paths, mount, payload bindings and modules pass on controlled inputs',()=>{
 assert.equal(checkUi(layout()).length,49);
 checkReceipt(packet(),bytes,sourceCommit);
 checkEmbeddedScripts(packet(),{scripts:[{name:'abyss_ui',source:rootSource},{name:'helper',source:'return {}'}]});
});
test('strict direct traversal rejects reference despite apparent descendant',()=>{
 const l=layout();pathOf(l,'stage/battlePanel/card1').kind='reference';
 assert.throws(()=>checkUi(l),/reference boundary at stage\/battlePanel\/card1/);
});
test('missing target, missing physical id, duplicate sibling and terminal alias all fail closed',()=>{
 let l=layout();pathOf(l,'stage/battlePanel/card1').children=[];assert.throws(()=>checkUi(l),/missing\/duplicate physical path/);
 l=layout(); delete l.ids[first];assert.throws(()=>checkUi(l),/missing physical record id/);
 l=layout();pathOf(l,'stage/battlePanel/card1').children.push(pathOf(l,first));assert.throws(()=>checkUi(l),/missing\/duplicate physical path/);
 l=layout();l.ids['stage/battlePanel/card2/hit']=l.ids[first];assert.throws(()=>checkUi(l),/duplicate terminal id/);
});
test('receipt rejects changed map bytes, wrong commit, dirty tree, and official-assets lab profile',()=>{
 assert.throws(()=>checkReceipt(packet(),Buffer.concat([bytes,Buffer.from('!')]),sourceCommit),/final GIL bytes/);
 const r=packet();assert.throws(()=>checkReceipt(r,bytes,'a'.repeat(40)),/exact clean source/);
 r.sourceDirty=true;assert.throws(()=>checkReceipt(r,bytes,sourceCommit),/exact clean source/);
 r.sourceDirty=false;r.officialAssetsProfile={};assert.throws(()=>checkReceipt(r,bytes,sourceCommit),/default native profile/);
 delete r.officialAssetsProfile;r.artFeatures.flags.menuBackground=false;assert.throws(()=>checkReceipt(r,bytes,sourceCommit),/default native art flags/);
 const badUi=packet();delete badUi.uiProfile;assert.throws(()=>checkReceipt(badUi,bytes,sourceCommit),/default native UI profile/);
 const forgedUi=packet();forgedUi.uiProfile.configSha256='0'.repeat(64);assert.throws(()=>checkReceipt(forgedUi,bytes,sourceCommit),/default native UI profile/);
});
test('missing mount, replaced module or forged build marker are rejected',()=>{
 const l=layout();l.interface.scripts=[];assert.throws(()=>checkUi(l),/root mount/);
 const r=packet();const scripts=[{name:'abyss_ui',source:rootSource},{name:'helper',source:'return false'}];
 assert.throws(()=>checkEmbeddedScripts(r,{scripts}),/embedded source mismatch: helper/);
 scripts[1].source='return {}'; r.buildId='8f29120f-8bb6-4826-911b-71edd49e630f';
 assert.throws(()=>checkEmbeddedScripts(r,{scripts}),/build marker mismatch/);
});
