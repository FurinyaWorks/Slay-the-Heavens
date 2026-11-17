// Diagnostic boundary checks only, not a production snapshot equivalence suite.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {assertCurrent,packet} from '../../../tests/helpers/release-navigation-pc22-join.mjs';
const source=Object.keys(packet.files).find(p=>p.endsWith('.mjs'));
const archive=Object.keys(packet.archives)[0];
assertCurrent(readFileSync);
for(const kind of ['source','archive','missing','crcrlf']){
 const reader=(path,encoding)=>{
  const value=readFileSync(path,encoding);
  if(kind==='archive'?path===archive:path===source){
   if(kind==='missing')throw Error('ENOENT diagnostic');
   if(kind==='archive')return Buffer.concat([value,Buffer.from('x')]);
   if(kind==='crcrlf')return value+'\r\r\n';
   return value+'\n// negative';
  }
  return value;
 };
 assert.throws(()=>assertCurrent(reader));
 console.log(kind+' rejected after valid baseline');
}
const input=Buffer.from('raw'),saved=Buffer.from(input);input[0]=0;
assert.equal(saved.toString(),'raw');
const output=Buffer.from(saved);output[0]=0;assert.equal(saved.toString(),'raw');
console.log('Buffer capture/output copy isolation PASS');
