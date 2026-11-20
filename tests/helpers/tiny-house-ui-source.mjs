import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {exactSourceContinuation} from './exact-source-continuation.mjs';

const bytes=readFileSync(new URL('../fixtures/tiny-house-ui-source.json.gz',import.meta.url));
const digest=source=>createHash('sha256').update(source).digest('hex');
assert.equal(digest(bytes),'66bfcad375c58f5c96a6e0b06afd1cdf5df490002628d5e837eb9ab6cc3a3c02','exact Tiny House UI source continuation');
const rows=Object.entries(JSON.parse(gunzipSync(bytes)));
const continuations=new Map(rows.map(([path,row])=>{
 assert.equal(row.path,path);
 assert.equal(digest(row.before.source),row.before.sha256);
 assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(row.before.source)}\0`).update(row.before.source).digest('hex'),row.before.gitBlob);
 return [path,exactSourceContinuation(row)];
}));
export const tinyHouseUiSourcePaths=Object.freeze([...continuations.keys()]);
export function projectTinyHouseUiSource(path,source,binding){
 return continuations.get(path)?.project(path,source,binding)??source;
}
export function authorizeTinyHouseUiSource(path,source,binding,samples,read){
 for(const continuation of continuations.values())continuation.authorize(path,source,binding,samples,read);
}
export function beforeTinyHouseUiSource(path,source,read){
 return continuations.get(path)?.predecessor(path,source,read)??source;
}
