import {beforeMapRoomReplayCohort} from './develop-replay-merge-source.mjs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';

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
for(const [path,row] of Object.entries(packet.receipts))for(const [sha,retained] of Object.entries(row.before)){
 assert.equal(retained.sha256,sha,path+' recorded receipt identity');
 assert(matches(retained.source,retained),path+' exact retained receipt source');
}
for(const [path,row] of Object.entries(packet.continuations))
 assert(matches(row.before.source,row.before),path+' exact calibration continuation predecessor');

export function beforeCalibrationReplay(path,source){
 if(!Object.hasOwn(packet.continuations,path))return source;
 const row=packet.continuations[path];
 if(!matches(source,row.after))return source;
 return source.includes('\r\n')?row.before.source.replaceAll('\n','\r\n'):row.before.source;
}

// A frozen receipt may read a registered old blob only after checking the
// corresponding current file. Raw Full discovery and inputs use their normal readers.
export function readCalibrationReceiptInput(path,digest,read,readCurrent=readFileSync){
 if(!Object.hasOwn(packet.receipts,path))return read();
 const row=packet.receipts[path];
 if(!Object.hasOwn(row.before,digest))return read();
 if(row.current===null)assert.throws(()=>readCurrent(path,'utf8'),{code:'ENOENT'},'retired receipt input reappeared: '+path);
 else{
  const raw=readCurrent(path,'utf8');
  let current=raw;
  if(path==='tests/helpers/combined-epoch/source-epoch-runtime.mjs'||path==='tests/helpers/copy-integration-source-closure.mjs'){
   current=beforeMapRoomReplayCohort(path,raw);
   assert.notEqual(current,raw,'current receipt input changed: '+path);
  }
  assert(matches(current,row.current),'current receipt input changed: '+path);
 }
 return row.before[digest].source;
}
