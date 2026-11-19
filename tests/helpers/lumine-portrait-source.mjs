// Historical adapter only. Current portrait/producer still run their live source.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {exactSourceContinuation} from './exact-source-continuation.mjs';
export const luminePortraitSourcePath='src/lua/abyss_traveler_portraits.lua';
const owner=luminePortraitSourcePath;
const hash=value=>createHash('sha256').update(value).digest('hex');
let continuation;
function exactLumine(){
 if(continuation)return continuation;
 const bytes=readFileSync(new URL('./release-source-epoch.json.gz',import.meta.url));
 assert.equal(hash(bytes),'5e41bb3cf23863526a60f15ce164419221c123f6d88a8b2fb3da18c9806ab780','immutable release portrait predecessor archive');
 const {source,sha256,gitBlob}=JSON.parse(gunzipSync(bytes)).current[owner];
 assert.equal(sha256,'95e3ab2064d416d4ba82c122f7af0c91c72a17423e427c5ea3c3b4bb32d1c363');assert.equal(hash(source),sha256);
 assert.equal(gitBlob,'3046e3ba9443517d9254d8001b7b5acc6db8d847');
 assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(source)}\0`).update(source).digest('hex'),gitBlob);
 const before=Object.freeze({source,sha256,gitBlob});
 const after=Object.freeze({sha256:'ce06dcef6ba1232d411dd2fda696dd153478ea068731408a3ba6ef3966227a4a',gitBlob:'d0b9eadb7ac53a21e059d9b34a52153cb76cab9b'});
 continuation=exactSourceContinuation({path:owner,before,after});
 return continuation;
}
export function projectLumineSource(path,source,binding){
 return path===owner?exactLumine().project(path,source,binding):source;
}
export function authorizeLumineSource(path,source,binding,samples,read){
 if(path===owner||samples.some(([entry])=>entry===owner))exactLumine().authorize(path,source,binding,samples,read);
}
export function beforeLumineSource(path,source,read){
 return path===owner?exactLumine().predecessor(path,source,read):source;
}
