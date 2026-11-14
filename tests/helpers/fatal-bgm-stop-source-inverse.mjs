// One exact entry-source continuation; original epoch proofs remain immutable.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const hash=s=>createHash('sha256').update(s).digest('hex');
const blob=s=>createHash('sha1').update(`blob ${Buffer.byteLength(s)}\0`).update(s).digest('hex');
const before=readFileSync(new URL('../fixtures/fatal-bgm-stop-before.lua',import.meta.url),'utf8').replaceAll('\r\n','\n');
const after=readFileSync(new URL('../fixtures/fatal-bgm-stop-after.lua',import.meta.url),'utf8').replaceAll('\r\n','\n');
assert.equal(hash(before),'14ece0f2989116258357923edcada9a2eca8e14c78da198599a3e0367f343d53');
assert.equal(blob(before),'c879d7e5895432e3e5ed2bdeac66b24581aa8066');
assert.equal(hash(after),'f75f309ae65559a4a1f0fd2f134193d631c7c23bd22a6ac182b35e412a7278bd');
assert.equal(blob(after),'4e69f5518eabb05de77ac8d8336147eca754f7d6');
export function preFatalBgmStopSource(path,source){
 if(path!=='src/lua/abyss_ui.lua'||typeof source!=='string')return source;
 const current=source.replaceAll('\r\n','\n');
 if(hash(current)!==hash(after))return source;
 assert.equal(blob(current),blob(after),'complete fatal BGM entry source');
 return before;
}
