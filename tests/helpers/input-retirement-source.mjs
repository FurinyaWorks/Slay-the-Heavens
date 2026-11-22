// Reverse the current input retirement for exact legacy presentation replays.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {beforeNativeFixtureInputRetirement} from './native-fixture-replay-source.mjs';
import {beforeNativeHostInputRetirement} from './native-host-replay-source.mjs';
import {beforeNativeFlowFixture} from './native-flow-fixture-source.mjs';
import {exactSourceMatches as matches} from './source-fingerprint.mjs';

const hash=(bytes,algorithm='sha256')=>createHash(algorithm).update(bytes).digest('hex');
const normalize=source=>source.replaceAll('\r\n','\n');
const archive=readFileSync(new URL('../fixtures/develop-input-retirement-source.json.gz',import.meta.url));
const evidenceSha256='ed86f17b8f643d4392828e582582859d7b86d0a143de94b1fac4cfab9a5bf912';
assert.equal(hash(archive),evidenceSha256,'exact input-retirement source archive');
const {base,files,removed,added,suite}=JSON.parse(gunzipSync(archive));
assert.equal(base,'74aa9a18311c972d2021bef9700153291620b45b');
export const retiredControllerPath='src/lua/abyss_controller.lua';
export const pointerInputPath='src/lua/abyss_pointer_input.lua';
assert.deepEqual(Object.keys(removed),[retiredControllerPath]);
assert.deepEqual(Object.keys(added),[pointerInputPath]);
assert.equal(suite.deck.base,'00229683d0d38660c98ced2f4a41e89d84fc5e4e');
assert.deepEqual(Object.keys(suite.added),['tests/input-device-scope.test.mjs','tests/pointer-cover-ownership.test.mjs','tests/relic-view-input.test.mjs']);
assert.deepEqual(Object.keys(suite.removed),['tests/relic-view-controller-click.test.mjs']);
assert.deepEqual(Object.keys(suite.deck.added),['tests/deck-pages.test.mjs']);

const continued=[...Object.values(files),...Object.values(suite.deck.files),...Object.values(suite.earlier)];
for(const row of [...continued.map(row=>row.before),...Object.values(removed),...Object.values(suite.removed),...Object.values(suite.trustPredecessors)]){
 assert(!row.source.includes('\r')&&matches(row.source,row),'exact input-retirement predecessor');
}
for(const row of [...continued.map(row=>row.after),...Object.values(added),...Object.values(suite.added),...Object.values(suite.deck.added)]){
 assert.match(row.sha256,/^[a-f0-9]{64}$/);assert.match(row.gitBlob,/^[a-f0-9]{40}$/);
}

function configLayoutMatches(source,expected,{allowConfigLayout=false}={}){
 if(!allowConfigLayout||!expected.tokensSha256||typeof source!=='string'||source.includes('\r\r\n'))return false;
 const tokens=source.replace(/"(?:\\.|[^"\\])*"|[ \t\r\n]+/g,token=>token.startsWith('"')?token:'');
 if(hash(tokens)!==expected.tokensSha256)return false;
 try{JSON.parse(source);return true;}catch{return false;}
}

export function beforeMergedInputRetirement(path,source,options){
 if(path==='scripts/potion-discard-layout.mjs')source=beforeNativeFlowFixture(path,source);
 return beforeNativeHostInputRetirement(path,beforeNativeFixtureInputRetirement(path,source,options),options);
}
export const inputRetirementOwns=path=>Object.hasOwn(files,path);
export const isCurrentInputRetirementSource=(path,source)=>inputRetirementOwns(path)&&matches(beforeMergedInputRetirement(path,source),files[path].after);

export function beforeInputRetirement(path,source,options){
 if(!Object.hasOwn(files,path))return source;
 const row=files[path],witness=beforeMergedInputRetirement(path,source);
 if(!matches(witness,row.after)&&!configLayoutMatches(witness,row.after,options))return source;
 return source.includes('\r\n')?row.before.source.replaceAll('\n','\r\n'):row.before.source;
}

export function readRetiredController(read){
 let source,missing;
 try{source=read(retiredControllerPath);}catch(error){
  if(error.code!=='ENOENT')throw error;
  missing=error;
 }
 if(source!==null&&source!==undefined)return {source,restored:false};
 let pointer;
 try{pointer=read(pointerInputPath);}catch(error){
  if(error.code!=='ENOENT')throw error;
 }
 if(matches(pointer,added[pointerInputPath]))return {source:removed[retiredControllerPath].source,restored:true};
 if(missing)throw missing;
 return {source,restored:false};
}
export function beforeInputRetirementReader(read){
 if(typeof read!=='function')return read;
 return path=>path===retiredControllerPath?readRetiredController(read).source:beforeInputRetirement(path,read(path));
}

export function authenticateInputRetirement(path,source,read,options){
 const prior=beforeInputRetirement(path,source,options);
 if(prior===source)return source;
 let live;
 try{live=read(path);}catch(error){assert.fail('combined linked owner missing: '+path+': '+String(error?.message??error));}
 const witness=beforeMergedInputRetirement(path,live);
 const merged=beforeMergedInputRetirement(path,source)!==source;
 assert((witness!==live)===merged&&matches(witness,files[path].after),
  'combined linked owner identity: '+path+' during input retirement validation');
 return prior;
}

export function assertPointerInputSource(source){
 assert(matches(source,added[pointerInputPath]),'fresh pointer input module: '+pointerInputPath);
}

function suitePredecessor(path,source,layer){
 if(!Object.hasOwn(layer,path))return source;
 const row=layer[path];
 assert(matches(source,row.after),'fresh StS input successor: '+path);
 return normalize(source)===source?row.before.source:row.before.source.replaceAll('\n','\r\n');
}

// Release and StS receipts share the same signed deck-pages predecessors.
export function beforeDeckPagesSuiteSource(path,source,{requireCurrent=false}={}){
 if(!Object.hasOwn(suite.deck.files,path))return source;
 const {before,after}=suite.deck.files[path];
 const current=matches(beforeInputRetirement(path,source),after);
 if(requireCurrent)assert(current&&(!inputRetirementOwns(path)||isCurrentInputRetirementSource(path,source)),
  'fresh complete integration source: '+path);
 if(!current)return source;
 return source.includes('\r\n')?before.source.replaceAll('\n','\r\n'):before.source;
}

export function beforeInputRetirementStsSuite(paths,read,trustSuccessors){
 assert.deepEqual(Object.keys(trustSuccessors).sort(),Object.keys(suite.trustPredecessors).sort(),'exact StS helper trust leaf paths');
 for(const sha of Object.values(trustSuccessors))assert.match(sha,/^[a-f0-9]{64}$/,'input retirement StS helper trust leaf');
 const names=new Set(paths);
 assert.equal(names.size,paths.length,'unique live StS suite inventory');
 for(const [path,identity] of Object.entries(suite.added)){
  assert(names.delete(path)&&matches(read(path,'utf8'),identity),'fresh new StS inventory source: '+path);
 }
 for(const path of Object.keys(suite.removed)){
  assert(!names.has(path),'retired StS fixture is absent: '+path);
  assert.throws(()=>read(path,'utf8'),{code:'ENOENT'});
  names.add(path);
 }
 for(const [path,identity] of Object.entries(suite.deck.added)){
  assert(names.delete(path)&&matches(suitePredecessor(path,read(path,'utf8'),files),identity),'fresh deck inventory source: '+path);
 }
 return {paths:[...names].sort(),read:(path,encoding)=>{
  if(Object.hasOwn(suite.removed,path)){
   const source=suite.removed[path].source;
   return encoding?source:Buffer.from(source);
  }
  const raw=read(path,encoding);
  if(Object.hasOwn(suite.trustPredecessors,path)){
   const text=typeof raw==='string'?raw:raw.toString('utf8');
   assert(!text.includes('\r\r\n')&&hash(normalize(text))===trustSuccessors[path],'fresh input retirement StS helper: '+path);
   const prior=suite.trustPredecessors[path].source;
   const source=text.includes('\r\n')?prior.replaceAll('\n','\r\n'):prior;
   return typeof raw==='string'?source:Buffer.from(source);
  }
  if(![files,suite.deck.files,suite.earlier].some(layer=>Object.hasOwn(layer,path)))return raw;
  const bytes=typeof raw==='string'?raw:raw.toString('utf8');
  const source=suitePredecessor(path,suitePredecessor(path,suitePredecessor(path,bytes,files),suite.deck.files),suite.earlier);
  return typeof raw==='string'?source:Buffer.from(source);
 }};
}
