// Exact historical input adapter only; current Host behavior executes live source.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const definitions=[
 ['src/lua/abyss_battle_details.lua','battle-details',
  ['23d5e423b607b9f4ec86b9544931180eab71b74af95a944670a02c5c79d1a5b3','fd7ccb2abdd9691be8d3ef7f75aff204a34f9e1b'],
  ['dfbe0b7e84ea05cd97e92e232e45fdb4aeb5de6b89fae9f9f5f83e77e7fdaab0','71061858b11ae804c9d4f0a73dfee9accc71a66d']],
 ['src/lua/abyss_battle_ui.lua','battle-pile',
  ['c703bb46e116735b9c3805bacc814cee8ade3ea07bb39f79c75151b6fa728481','1dfefb14189dc33d34967aef98390a7f7e925ec2'],
  ['5be0546825b758ebe44dcac613cf7280d0350fd7401b7f770d9e79b686edf2c9','984fcdc2893a6192bff3241a5272ffe39e03a4cd']],
];
const bindings=new Map(definitions.map(([path,prefix,...ids])=>[path,ids.map(([sha256,gitBlob],i)=>{
 const source=readFileSync(new URL(`../fixtures/${prefix}-${i?'after':'before'}.lua`,import.meta.url),'utf8').replaceAll('\r\n','\n');
 assert.equal(createHash('sha256').update(source).digest('hex'),sha256,'complete battle return source SHA');
 assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(source)}\0`).update(source).digest('hex'),gitBlob,'complete battle return Git blob');
 return Object.freeze({source,sha256,gitBlob});
})]));
export const battleReturnBindings=Object.freeze(Object.fromEntries(bindings));
export function projectBattleReturnSource(path,source){
 const pair=bindings.get(path);
 return pair&&typeof source==='string'&&source.replaceAll('\r\n','\n')===pair[1].source?pair[0].source:source;
}
export function isBattleReturnPredecessor(path,binding){
 const before=bindings.get(path)?.[0];
 return !!before&&binding?.source===before.source&&binding?.sha256===before.sha256&&binding?.gitBlob===before.gitBlob;
}
export function assertBattleReturnClosure(readSource){
 for(const [path,pair]of bindings){
  let actual;try{actual=readSource(path);}catch(error){assert.fail('combined linked owner missing: '+path+': '+String(error?.message??error));}
  assert(typeof actual==='string'&&actual.replaceAll('\r\n','\n')===pair[1].source,'combined linked owner identity: battle return continuation '+path);
 }
}
export function assertBattleReturnOwner(path,source){
 const pair=bindings.get(path);
 assert(pair&&typeof source==='string'&&source.replaceAll('\r\n','\n')===pair[1].source,'combined linked owner identity: battle return sampled owner '+path);
}
