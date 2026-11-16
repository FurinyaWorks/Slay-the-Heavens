import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { checkPortraitReceipt } from './receipt.mjs';
const fixturePath=process.env.MONSTER_ART_FIXTURES
const read=name=>JSON.parse(readFileSync(fixturePath?new URL(name, fixturePath):new URL('../r5/'+name,import.meta.url)));
const cases=[
  ['slime','slime/native-layout.json','slime/runtime-result.json',44],
  ['ruin','ruin/native-layout-whole-119.json','ruin/runtime-result-119.json',119],
];
for(const [name,shape,receipt,expected] of cases){
 test(name+' approved baseline counts match real offline receipt',()=>{
  assert.equal(checkPortraitReceipt(read(shape),read(receipt),expected).controls, expected);
 });
}
test('reject changed counts, leaked controls, or unauthorized shape IDs',()=>{
 const [,shape,receipt,expected]=cases[0], a=read(shape), b=read(receipt);
 assert.throws(()=>checkPortraitReceipt(a,{...b,controls:expected-3},expected),/containers/);
 assert.throws(()=>checkPortraitReceipt(a,{...b,liveAfterRelease:1},expected));
 a.rows[0][0]=600000;
 assert.throws(()=>checkPortraitReceipt(a,b,expected),/primitive ID/);
});
