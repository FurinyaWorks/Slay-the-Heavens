import {exactSourceContinuation} from './exact-source-continuation.mjs';
// One exact UI pair. No input-owner or legacy fixture continuation is authorized.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const hash=s=>createHash('sha256').update(s).digest('hex');
const bytes=readFileSync(new URL('../fixtures/fatal-bgm-e65-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'3e560e461232785753f5a574732ec834b19c51cfd700f09cce212009dd4a22fb');
const packet=JSON.parse(gunzipSync(bytes));
assert.equal(packet.schemaVersion,1);assert.equal(packet.baseCommit,'e65d9b98fbec69442047650254238cd9244df805');
assert.equal(packet.path,'src/lua/abyss_ui.lua');
assert.equal(hash(packet.before),'19989127f817f2659be6a29661a916ddf04a2961f43d48a1e35367d95efd01c1');
assert.equal(hash(packet.after),'5ce18f5cd92624d57af9ccb522a3b1f5882f8f42b6658e0d10463b8d992a8cb8');
const bind=source=>Object.freeze({source,sha256:hash(source),gitBlob:createHash('sha1').update(`blob ${Buffer.byteLength(source)}\0`).update(source).digest('hex')});
export const fatalBgmPair=Object.freeze({path:packet.path,before:bind(packet.before),after:bind(packet.after)});
export const {project:projectFatalBgmSource,authorize:authorizeFatalBgmSource,predecessor:beforeFatalBgmSource}=exactSourceContinuation(fatalBgmPair);
