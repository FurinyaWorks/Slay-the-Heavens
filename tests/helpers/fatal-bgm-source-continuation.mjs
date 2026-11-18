// One exact UI pair. No input-owner or legacy fixture continuation is authorized.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const hash=s=>createHash('sha256').update(s).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const bytes=readFileSync(new URL('../fixtures/fatal-bgm-e65-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'3e560e461232785753f5a574732ec834b19c51cfd700f09cce212009dd4a22fb');
const packet=JSON.parse(gunzipSync(bytes));
assert.equal(packet.schemaVersion,1);assert.equal(packet.baseCommit,'e65d9b98fbec69442047650254238cd9244df805');
assert.equal(packet.path,'src/lua/abyss_ui.lua');
assert.equal(hash(packet.before),'19989127f817f2659be6a29661a916ddf04a2961f43d48a1e35367d95efd01c1');
assert.equal(hash(packet.after),'5ce18f5cd92624d57af9ccb522a3b1f5882f8f42b6658e0d10463b8d992a8cb8');
const bind=source=>Object.freeze({source,sha256:hash(source),gitBlob:createHash('sha1').update(`blob ${Buffer.byteLength(source)}\0`).update(source).digest('hex')});
export const fatalBgmPair=Object.freeze({path:packet.path,before:bind(packet.before),after:bind(packet.after)});
const same=(source,binding)=>typeof source==='string'&&norm(source)===binding.source;
const exact=(binding,expected)=>binding?.source===expected.source&&binding?.sha256===expected.sha256&&binding?.gitBlob===expected.gitBlob;
export function projectFatalBgmSource(path,source,binding){
 return path===packet.path&&exact(binding,fatalBgmPair.before)&&same(source,fatalBgmPair.after)?packet.before:source;
}
// Only a historical before-bound compatibility projection needs a second UI
// read. Current after-bound owners keep their original strict once-in-order
// admission; the normal closure already authenticates their exact raw bytes.
export function authorizeFatalBgmSource(path,input,binding,samples,read){
 const entries=[[path,input,binding],...samples].filter(([p,,b])=>p===packet.path&&(exact(b,fatalBgmPair.before)||exact(b,fatalBgmPair.after)));
 if(!entries.some(([, ,b])=>exact(b,fatalBgmPair.before)))return;
 const expected=same(entries[0][1],fatalBgmPair.after)?fatalBgmPair.after:fatalBgmPair.before;
 const message='combined linked owner identity: fatal BGM entry changed during owner validation';
 for(const [,source]of entries)assert(same(source,expected),message);
 if(expected===fatalBgmPair.before)return; // The legacy-only path retains its original reads.
 let live;try{live=read(packet.path);}catch(error){assert.fail('combined linked owner missing: '+packet.path+': '+String(error?.message??error));}
 assert(same(live,expected),message);
}

// Archived receipt consumers validate the complete live BGM source first.
export function beforeFatalBgmSource(path,source,read) {
 const prior=projectFatalBgmSource(path,source,fatalBgmPair.before);
 if(prior!==source)authorizeFatalBgmSource(path,source,fatalBgmPair.before,[],read);
 return prior;
}
