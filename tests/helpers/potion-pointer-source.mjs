import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {exactSourceContinuation} from './exact-source-continuation.mjs';

const bytes=readFileSync(new URL('../fixtures/potion-pointer-source.json.gz',import.meta.url));
const sha256=value=>createHash('sha256').update(value).digest('hex');
assert.equal(sha256(bytes),'6af6671cef5295036c1f38f17d51ee96f77ed5b2ecc5003cb851d7c55a40ac11','potion pointer owner witness');
const rows=Object.entries(JSON.parse(gunzipSync(bytes)));
const continuations=new Map(rows.map(([path,row])=>{
 assert.equal(row.path,path);
 assert.equal(sha256(row.before.source),row.before.sha256);
 assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(row.before.source)}\0`).update(row.before.source).digest('hex'),row.before.gitBlob);
 return [path,exactSourceContinuation(row)];
}));
export const potionPointerSourcePaths=Object.freeze([...continuations.keys()]);
export function projectPotionPointerSource(path,source,binding){
 return continuations.get(path)?.project(path,source,binding)??source;
}
export function authorizePotionPointerSource(path,source,binding,samples,read){
 for(const continuation of continuations.values())continuation.authorize(path,source,binding,samples,read);
}
export function beforePotionPointerSource(path,source,read){
 return continuations.get(path)?.predecessor(path,source,read)??source;
}
