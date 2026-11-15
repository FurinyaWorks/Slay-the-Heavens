import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,rmSync,realpathSync} from 'node:fs';
import {join,relative,isAbsolute} from 'node:path';
import {tmpdir} from 'node:os';
import {buildUI} from '../scripts/build-ui.mjs';
import {compileImageModes,verifyImageModes} from '../scripts/native-image-modes.mjs';
const all=n=>[n,...(n.children??[]).flatMap(all)];
const count=(nodes,key)=>nodes.flatMap(all).filter(n=>Object.hasOwn(n,key)).length;
function assertProjection(source,native){
 assert.deepEqual(Object.keys(native).sort(),Object.keys(source).filter(k=>!['imageType','flagBounds'].includes(k)).sort());
 for(const k of Object.keys(native)){
  if(k==='children'){assert.equal(native.children.length,source.children.length);source.children.forEach((c,i)=>assertProjection(c,native.children[i]));}
  else assert.deepEqual(native[k],source[k],source.name+'.'+k);
 }
}
const wrapper=flag=>({controls:[{name:'characterPanel',kind:'container',children:[{name:'cancel',kind:'container',children:[{name:'hit',kind:'presetButton',children:[{name:'normal',kind:'container',children:[flag]}]}]}]}]});
const flag=()=>({name:'v25Flag',kind:'container',size:[180,60],flagBounds:[-29,28],children:[{name:'rim',kind:'container',flagBounds:[-29,28],children:[]},{name:'cloth',kind:'container',flagBounds:[-28,27],children:[]}]});

test('complete official source and templates retain all geometry while native projection consumes exactly 24 flag bounds',t=>{
 const temp=realpathSync.native(tmpdir()),dir=mkdtempSync(join(temp,'native-projection-'));
 t.after(()=>{const target=realpathSync.native(dir),within=relative(temp,target);assert(!isAbsolute(within)&&within.startsWith('native-projection-')&&!within.startsWith('..'));rmSync(target,{recursive:true,force:true});});
 buildUI(dir,undefined,{officialAssets:true});
 const source=JSON.parse(readFileSync(join(dir,'game-ui.json'))),templates=JSON.parse(readFileSync(join(dir,'game-ui-templates.json')));
 const original=structuredClone({source,templates}),compiled=compileImageModes(source,templates);
 assert.equal(count(source.controls,'flagBounds'),24);assert.equal(count(templates,'flagBounds'),0);
 assert.equal(count(compiled.layout.controls,'flagBounds')+count(compiled.templates,'flagBounds'),0);
 assert.deepEqual(compiled.proof.nativeProjection,{consumedFlagBounds:{static:24,templates:0}});
 assert.deepEqual({source,templates},original,'construction tree is still complete');
 const {controls:sourceControls,...sourceRoot}=source,{controls:nativeControls,...nativeRoot}=compiled.layout;
 assert.deepEqual(nativeRoot,sourceRoot);assert.equal(nativeControls.length,sourceControls.length);
 sourceControls.forEach((n,i)=>assertProjection(n,nativeControls[i]));
 assert.equal(templates.length,compiled.templates.length);templates.forEach((n,i)=>assertProjection(n,compiled.templates[i]));
 assert.deepEqual(compiled.layout,JSON.parse(readFileSync(join(dir,'game-ui-native.json'))));
 assert.deepEqual(compiled.templates,JSON.parse(readFileSync(join(dir,'game-ui-templates-native.json'))));
 assert.equal(compiled.binding.static.length,1637);assert.equal(compiled.binding.templates.length,86);
 assert(verifyImageModes(source,templates,compiled));
 const images=sourceControls.flatMap(all).filter(n=>n.kind==='image');
 assert.deepEqual(nativeControls.flatMap(all).filter(n=>n.kind==='image').map(n=>[n.name,n.image,n.position,n.size,n.scale,n.rotation,n.fill,n.colour,n.opacity]),images.map(n=>[n.name,n.image,n.position,n.size,n.scale,n.rotation,n.fill,n.colour,n.opacity]));
});

test('the same native projection consumes legal template flag metadata and preserves unknown metadata verbatim',()=>{
 const source=wrapper(flag());source.controls[0].futureMetadata={keep:['all',17]};
 source.controls[0].children[0].children[0].children[0].children[0].futureFlagField={keep:true};
 const templates=[{name:'FlagTemplate',kind:'container',children:structuredClone(source.controls)}];
 const copy=structuredClone({source,templates}),compiled=compileImageModes(source,templates);
 assert.deepEqual(compiled.proof.nativeProjection,{consumedFlagBounds:{static:3,templates:3}});
 assertProjection(source.controls[0],compiled.layout.controls[0]);assertProjection(templates[0],compiled.templates[0]);
 assert.deepEqual(compiled.layout.controls[0].futureMetadata,{keep:['all',17]});
 assert.deepEqual({source,templates},copy);
});

test('malformed bounds and unrecognized flag metadata producers fail instead of silently disappearing',()=>{
 for(const value of [null,[],[0],[0,1,2],[1,0],[0,0],[NaN,1],[-Infinity,1],['0',1],{low:0,high:1}]){
  const node=flag();node.flagBounds=value;assert.throws(()=>compileImageModes(wrapper(node),[]),/flagBounds/);
 }
 for(const node of [{...flag(),name:'otherFlag'},{...flag(),kind:'image'}])assert.throws(()=>compileImageModes(wrapper(node),[]),/flagBounds/);
 assert.throws(()=>compileImageModes({controls:[flag()]},[]),/flagBounds/,'known field on a foreign owner must not be filtered');
 const source=wrapper(flag()),compiled=compileImageModes(source,[]);
 compiled.layout.controls[0].children[0].children[0].children[0].children[0].size[0]+=1;
 assert.throws(()=>verifyImageModes(source,[],compiled),/coverage differs/,'geometry changes remain rejected');
});
