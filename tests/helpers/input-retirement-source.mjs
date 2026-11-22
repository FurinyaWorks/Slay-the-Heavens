// Reverse the current input retirement for exact legacy presentation replays.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {beforeActionButtons} from './action-buttons-source.mjs';

const hash=(bytes,algorithm='sha256')=>createHash(algorithm).update(bytes).digest('hex');
const gitBlob=source=>hash(`blob ${Buffer.byteLength(source)}\0${source}`,'sha1');
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

function matches(source,identity){
 if(typeof source!=='string'||source.includes('\r\r\n'))return false;
 const text=normalize(source);
 return hash(text)===identity.sha256&&gitBlob(text)===identity.gitBlob;
}
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

const browserArchive=readFileSync(new URL('../fixtures/develop-deck-browser-backflow-source.json.gz',import.meta.url));
assert.equal(hash(browserArchive),'9f62aef27e5bc61741311bb2507fa75a58b67544d33136ccbc6a5978edd9f284','exact Develop deck browser archive');
const browserBackflow=JSON.parse(gunzipSync(browserArchive));
assert.equal(browserBackflow.base,'beba19bad25db7de71f96af521656c13b882909b');
for(const [path,row] of Object.entries(browserBackflow.files)){
 assert(matches(row.before.source,row.before),'exact deck browser predecessor: '+path);
 assert.match(row.after.sha256,/^[a-f0-9]{64}$/);assert.match(row.after.gitBlob,/^[a-f0-9]{40}$/);
}
export function beforeDeckBrowserBackflow(path,source){
 const row=Object.hasOwn(browserBackflow.files,path)&&browserBackflow.files[path];
 if(!row||!matches(source,row.after))return source;
 return source.includes('\r\n')?row.before.source.replaceAll('\n','\r\n'):row.before.source;
}

export function beforeInputRetirement(path,source,options){
 const browserPrior=beforeDeckBrowserBackflow(path,source);
 if(browserPrior!==source)source=beforeActionButtons(path,browserPrior);
 if(!Object.hasOwn(files,path))return source;
 const row=files[path];
 if(!matches(source,row.after)&&!configLayoutMatches(source,row.after,options))return source;
 return source.includes('\r\n')?row.before.source.replaceAll('\n','\r\n'):row.before.source;
}

export function beforeInputRetirementReader(read){
 if(typeof read!=='function')return read;
 return path=>{
  if(path!==retiredControllerPath)return beforeInputRetirement(path,read(path));
  let source,missing;
  try{source=read(path);}catch(error){
   if(error.code!=='ENOENT')throw error;
   missing=error;
  }
  if(source!==null&&source!==undefined)return source;
  let pointer;
  try{pointer=read(pointerInputPath);}catch(error){
   if(error.code!=='ENOENT')throw error;
  }
  if(matches(pointer,added[pointerInputPath]))return removed[path].source;
  if(missing)throw missing;
  return source;
 };
}

export function authenticateInputRetirement(path,source,read,options){
 const prior=beforeInputRetirement(path,source,options);
 if(prior===source)return source;
 let live;
 try{live=read(path);}catch(error){assert.fail('combined linked owner missing: '+path+': '+String(error?.message??error));}
 const browserOwner=beforeDeckBrowserBackflow(path,source)!==source;
 const identity=browserOwner?browserBackflow.files[path].after:files[path].after;
 assert(matches(live,identity),'combined linked owner identity: '+path+' during input retirement validation');
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
  const source=suitePredecessor(path,suitePredecessor(path,suitePredecessor(path,beforeActionButtons(path,beforeDeckBrowserBackflow(path,bytes)),files),suite.deck.files),suite.earlier);
  return typeof raw==='string'?source:Buffer.from(source);
 }};
}
