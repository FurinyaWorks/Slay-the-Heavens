// Exact historical input adapter only; current Host behavior executes live source.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const definitions=[
 ['src/lua/abyss_battle_details.lua','battle-details',
  ['086cc3ca4927fa48b5f1a06246b89966bebf9c94c7142c82d7778ee13ea8ea94','3effa612b28720d278947e2a7b870ce89ce90a38'],
  ['ad3c87062e3a8e713a01c58d13d6afe9ad6fb4e75bbb11335564003c63ca88c7','8c97a675538abdedd45bd7fb38a977bd39cd82c2']],
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
