// Historical projection only; old proof identities never certify current rendering.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
export const nativePowerCountPath='src/lua/abyss_monster_power_view.lua';
const identities={
 before:['64a01d5c8b97872a574749418afa0ee415290a760f62f8b70e40f369a9f90627','ce7e3f358c6508a9a49e836f6fef36b8b131d361'],
 after:['a760832e5d98e689ad1ae16437544cdda0f2082089058ea9174fe730e42c7bbe','eaecfa88b7606fb9523ae98122fdea397a665e3d'],
};
const texts=Object.fromEntries(Object.entries(identities).map(([name,[sha,blob]])=>{
 const source=readFileSync(new URL(`../fixtures/native-power-count-${name}.lua`,import.meta.url),'utf8').replaceAll('\r\n','\n');
 assert.equal(createHash('sha256').update(source).digest('hex'),sha,'native count complete source SHA');
 assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(source)}\0`).update(source).digest('hex'),blob,'native count complete Git blob');
 return [name,source];
}));
export function projectHistoricalNativePowerCount(path,source){
 return path===nativePowerCountPath&&typeof source==='string'&&source.replaceAll('\r\n','\n')===texts.after?texts.before:source;
}
export function isNativePowerCountPredecessor(binding){
 return binding?.source===texts.before&&binding?.sha256===identities.before[0]&&binding?.gitBlob===identities.before[1];
}
