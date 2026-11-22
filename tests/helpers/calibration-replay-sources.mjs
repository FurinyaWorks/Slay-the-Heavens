import {beforeMapRoomReplayCohort} from './develop-replay-merge-source.mjs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {readRetiredInputLuaReceipt,readRetiredInputTestReceipt} from './input-retirement-inventory.mjs';
import {readRetiredController,retiredControllerPath} from './input-retirement-source.mjs';
import {stsStylePriorRuntime} from './sts-style-prior-runtime.mjs';

const hash=(bytes,algorithm='sha256')=>createHash(algorithm).update(bytes).digest('hex');
const blob=source=>hash(`blob ${Buffer.byteLength(source)}\0${source}`,'sha1');
const lf=source=>source.replaceAll('\r\n','\n');
const bytes=readFileSync(new URL('./calibration-replay-sources.json.gz',import.meta.url));
assert.equal(hash(bytes),'ba41b8ca02fb157121f08addffdd14ade94d0d759494cfa9b56344426746c926','exact historical calibration input archive');
const packet=JSON.parse(gunzipSync(bytes));
assert.equal(packet.schemaVersion,1);
assert.equal(packet.base,'469e80240c5b7c60f75ff434bebac62d73c0bd0c');
const matches=(source,row)=>typeof source==='string'&&!source.includes('\r\r\n')&&
 hash(lf(source))===row.sha256&&blob(lf(source))===row.gitBlob;
const retirementBytes=readFileSync(new URL('./input-retirement-calibration-source.json.gz',import.meta.url));
assert.equal(hash(retirementBytes),'8c729cb23b70d84cc7d6e93c2ed976a2a16d02034ce5f3f9da6c0efb5470ad1f','exact calibration input retirement packet');
const retirement=JSON.parse(gunzipSync(retirementBytes));
assert.equal(retirement.base,'0461bcd30dac18818318cbafa77ad72fad069e0a');
for(const [path,row] of Object.entries(retirement.extra)){
 assert(Object.hasOwn(retirement.current,path),'registered calibration input successor: '+path);
 assert(matches(row.source,row),path+' exact retained fixture');
}
for(const row of retirement.retiredLua)assert(matches(row.source,row),'exact retired relic-view fixture');
for(const [path,row] of Object.entries(retirement.continuations))
 assert(matches(row.before.source,row.before),path+' exact input retirement CI test predecessor');
for(const [path,row] of Object.entries(packet.receipts))for(const [sha,retained] of Object.entries(row.before)){
 assert.equal(retained.sha256,sha,path+' recorded receipt identity');
 assert(matches(retained.source,retained),path+' exact retained receipt source');
}
for(const [path,row] of Object.entries(packet.continuations))
 assert(matches(row.before.source,row.before),path+' exact calibration continuation predecessor');

export function beforeCalibrationReplay(path,source){
 if(Object.hasOwn(retirement.continuations,path)){
  const {before,after}=retirement.continuations[path];
  if(matches(source,after))source=source.includes('\r\n')?before.source.replaceAll('\n','\r\n'):before.source;
 }
 if(!Object.hasOwn(packet.continuations,path))return source;
 const row=packet.continuations[path];
 if(!matches(source,row.after))return source;
 return source.includes('\r\n')?row.before.source.replaceAll('\n','\r\n'):row.before.source;
}

// A frozen receipt may read a registered old blob only after checking the
// corresponding current file. Raw Full discovery and inputs use their normal readers.
export function readCalibrationReceiptInput(path,digest,read,readCurrent=readFileSync){
 const retired=readRetiredInputTestReceipt(path,digest,readCurrent);
 if(retired!==undefined)return retired;
 if(path==='tests/lua/relic_view_controller_click.lua'){
  const row=retirement.retiredLua.find(row=>row.sha256===digest);
  if(row)return readRetiredInputLuaReceipt(path,digest,readCurrent,row);
 }
 const current=Object.hasOwn(retirement.current,path)?retirement.current[path]:null;
 const retained=Object.hasOwn(packet.receipts,path)&&Object.hasOwn(packet.receipts[path].before,digest)?packet.receipts[path].before[digest]:null;
 if(path===retiredControllerPath&&digest===stsStylePriorRuntime.files[path].sha256){
  assert(readRetiredController(p=>readCurrent(p,'utf8')).restored,'retired production controller receipt requires the current pointer owner');
  return stsStylePriorRuntime.files[path].source;
 }
 if(current){
  const extra=Object.hasOwn(retirement.extra,path)?retirement.extra[path]:null;
  const prior=Object.hasOwn(stsStylePriorRuntime.files,path)?stsStylePriorRuntime.files[path]:null;
  const witness=retained??(extra?.sha256===digest?extra:prior?.sha256===digest?prior:null);
  if(witness){
   assert(matches(readCurrent(path,'utf8'),current),'current receipt input changed: '+path);
   assert(matches(witness.source,witness),path+' exact retained calibration input');
   return witness.source;
  }
 }
 if(!Object.hasOwn(packet.receipts,path))return read();
 const row=packet.receipts[path];
 if(!Object.hasOwn(row.before,digest))return read();
 if(row.current===null)assert.throws(()=>readCurrent(path,'utf8'),{code:'ENOENT'},'retired receipt input reappeared: '+path);
 else{
  const raw=readCurrent(path,'utf8');
  let current=raw;
  if(path==='tests/helpers/combined-epoch/source-epoch-runtime.mjs'||path==='tests/helpers/copy-integration-source-closure.mjs'||
     path==='tests/helpers/round3-catalog-source-inverse.mjs'){
   current=beforeMapRoomReplayCohort(path,raw);
   assert.notEqual(current,raw,'current receipt input changed: '+path);
  }
  assert(matches(current,row.current),'current receipt input changed: '+path);
 }
 return row.before[digest].source;
}
