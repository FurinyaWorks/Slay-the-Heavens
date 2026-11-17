import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {assertIntegratedCurrent} from '../../../tests/helpers/integrated-ci-source.mjs';
import {beforeCapacityB9Ci,capacityB9CiRead,assertCapacityB9ReaderRepairCurrent} from '../../../tests/helpers/release-capacity-b9-ci-source.mjs';
const path='tests/helpers/release-capacity-b9-reader-repair.json.gz';
const packet=JSON.parse(gunzipSync(readFileSync(path)));
const norm=s=>s.replaceAll('\r\n','\n'),hash=b=>createHash('sha256').update(b).digest('hex');
let checks=0;
const equal=(a,b)=>{assert.strictEqual(a,b);checks++;};
const throws=(fn,pattern)=>{assert.throws(fn,pattern);checks++;};
const replacements=new Map();
const read=(p,e)=>{if(replacements.has(p)){const value=replacements.get(p);if(value instanceof Error)throw value;return typeof value==='function'?value(e):value;}return readFileSync(p,e);};
assertIntegratedCurrent(read);checks++;
for(const [file,row]of Object.entries(packet.files)){
 const current=norm(readFileSync(file,'utf8'));
 equal(hash(current),row.current.sha256);
 for(const input of [current,current.replaceAll('\n','\r\n')]){
  equal(norm(beforeCapacityB9Ci(file,input)),row.before.source);
  const value=capacityB9CiRead(()=>Buffer.from(input))(file);
  assert(Buffer.isBuffer(value));checks++;
  equal(norm(value.toString('utf8')),row.before.source);
 }
 for(const value of [current+'\n',current.slice(1),current.slice(0,-1),current.replaceAll('\n','\r\r\n'),null,{},17,Buffer.from(current)])equal(beforeCapacityB9Ci(file,value),value);
 equal(beforeCapacityB9Ci(file,current,'unknown'),current);
 equal(beforeCapacityB9Ci(file,current,'b9',{sha256:'0'.repeat(64)}),current);
 equal(beforeCapacityB9Ci('foreign/'+file,current),current);
 for(const value of [current+'\n',current.slice(1),current.replaceAll('\n','\r\r\n'),null,Buffer.from(current),new Error('missing '+file)]){
  replacements.set(file,value);
  throws(()=>assertCapacityB9ReaderRepairCurrent(read),new RegExp(file.replaceAll('.','\\.')));
  throws(()=>assertIntegratedCurrent(read),new RegExp(file.replaceAll('.','\\.')));
  replacements.delete(file);assertCapacityB9ReaderRepairCurrent(read);checks++;
 }
}
for(const value of [Buffer.concat([readFileSync(path),Buffer.from('\n')]),null,new Error('missing '+path)]){
 replacements.set(path,value);throws(()=>assertIntegratedCurrent(read),/reader repair packet|missing|data.*argument/i);replacements.delete(path);
 assertCapacityB9ReaderRepairCurrent(read);checks++;
}
for(const file of ['src/lua/abyss_card_flow.lua','scripts/build-ui.mjs']){
 replacements.set(file,(e)=>e?readFileSync(file,'utf8')+'\n':Buffer.concat([readFileSync(file),Buffer.from('\n')]));
 throws(()=>assertIntegratedCurrent(read),/source|owner/);replacements.delete(file);
}
assertIntegratedCurrent(read);checks++;
assertIntegratedCurrent((p,e)=>{const value=readFileSync(p,e);return typeof value==='string'?norm(value).replaceAll('\n','\r\n'):value;});checks++;
const opaque=Buffer.from([0,255,31,139,128]);equal(capacityB9CiRead(()=>opaque)('unknown/archive.gz'),opaque);
console.log(JSON.stringify({pass:true,checks,files:Object.keys(packet.files).length,freshSameReader:true,binaryOpaque:true}));
