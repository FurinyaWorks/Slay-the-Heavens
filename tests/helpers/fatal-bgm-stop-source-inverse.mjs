// One exact entry-source continuation; original epoch proofs remain immutable.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const hash=s=>createHash('sha256').update(s).digest('hex');
const blob=s=>createHash('sha1').update(`blob ${Buffer.byteLength(s)}\0`).update(s).digest('hex');
const before=readFileSync(new URL('../fixtures/fatal-bgm-stop-before.lua',import.meta.url),'utf8').replaceAll('\r\n','\n');
const after=readFileSync(new URL('../fixtures/fatal-bgm-stop-after.lua',import.meta.url),'utf8').replaceAll('\r\n','\n');
assert.equal(hash(before),'14ece0f2989116258357923edcada9a2eca8e14c78da198599a3e0367f343d53');
assert.equal(blob(before),'c879d7e5895432e3e5ed2bdeac66b24581aa8066');
assert.equal(hash(after),'f75f309ae65559a4a1f0fd2f134193d631c7c23bd22a6ac182b35e412a7278bd');
assert.equal(blob(after),'4e69f5518eabb05de77ac8d8336147eca754f7d6');
const currentBytes=readFileSync(new URL('../fixtures/fatal-bgm-e65-source.json.gz',import.meta.url));
assert.equal(hash(currentBytes),'3e560e461232785753f5a574732ec834b19c51cfd700f09cce212009dd4a22fb');
const current=JSON.parse(gunzipSync(currentBytes));
assert.equal(current.schemaVersion,1);
assert.equal(current.baseCommit,'e65d9b98fbec69442047650254238cd9244df805');
assert.equal(current.path,'src/lua/abyss_ui.lua');
assert.equal(hash(current.before),'19989127f817f2659be6a29661a916ddf04a2961f43d48a1e35367d95efd01c1');
assert.equal(hash(current.after),'5ce18f5cd92624d57af9ccb522a3b1f5882f8f42b6658e0d10463b8d992a8cb8');
export const fatalBgmCurrentSource=Object.freeze(current);
export function preFatalBgmStopSource(path,source){
 if(path!=='src/lua/abyss_ui.lua'||typeof source!=='string')return source;
 const current=source.replaceAll('\r\n','\n');
 if(hash(current)===hash(fatalBgmCurrentSource.after))return fatalBgmCurrentSource.before;
 if(hash(current)!==hash(after))return source;
 assert.equal(blob(current),blob(after),'complete fatal BGM entry source');
 return before;
}
