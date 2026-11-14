// Historical projection only. Production behavior is checked in fresh room VMs.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
export const relicRoomPath='src/lua/abyss_relic_hooks.lua';
const identities={
 before:['19b0ba4fcd2c5ca37219623868b8cdd978787e8861e50e2e43fefb8c70be2f2f','792504a367f4488fb08942e0030d5376ea4de73c'],
 after:['37aa2d1a45619480824ad399cc3a271a2178e0c09e725a5d25e0f33f53acf7fc','65684c0cc13211875aa3c4240612ac7656e85273'],
};
const texts=Object.fromEntries(Object.entries(identities).map(([name,[sha,blob]])=>{
 const text=readFileSync(new URL(`../fixtures/relic-room-${name}.lua`,import.meta.url),'utf8').replaceAll('\r\n','\n');
 assert.equal(createHash('sha256').update(text).digest('hex'),sha,'room complete source SHA');
 assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(text)}\0`).update(text).digest('hex'),blob,'room complete Git blob');
 return [name,text];
}));
export function projectHistoricalRelicRoom(path,source){
 return path===relicRoomPath&&typeof source==='string'&&source.replaceAll('\r\n','\n')===texts.after?texts.before:source;
}
export function isRelicRoomPredecessor(binding){return binding?.source===texts.before&&binding?.sha256===identities.before[0]&&binding?.gitBlob===identities.before[1];}
