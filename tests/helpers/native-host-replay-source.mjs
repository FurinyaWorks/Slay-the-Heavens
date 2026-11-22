import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';

const sha256=source=>createHash('sha256').update(source).digest('hex');
const blob=source=>createHash('sha1').update('blob '+Buffer.byteLength(source)+'\0').update(source).digest('hex');
const archive=readFileSync(new URL('./native-host-replay-source.json.gz',import.meta.url));
assert.equal(sha256(archive),'979352d3332e2cc708d22055ed69bb3fcc00a954c1cd55f8f807924116360145','exact native host replay archive');
const {schemaVersion,base,files}=JSON.parse(gunzipSync(archive));
assert.equal(schemaVersion,1);
assert.equal(base,'67fc8750dd6ef9a13067c6a43137f910b6a44228');
for(const [path,{before,after}] of Object.entries(files)){
 assert.equal(sha256(before.source),before.sha256,path+' exact predecessor SHA256');
 assert.equal(blob(before.source),before.gitBlob,path+' exact predecessor Git blob');
 assert.match(after.sha256,/^[a-f0-9]{64}$/);
 assert.match(after.gitBlob,/^[a-f0-9]{40}$/);
}
export function nativeHostReplayOwns(path){
 return Object.hasOwn(files,path);
}
export function beforeNativeHostReplay(path,source){
 if(!nativeHostReplayOwns(path)||typeof source!=='string'||source.includes('\r\r\n'))return source;
 const {before,after}=files[path],text=source.replaceAll('\r\n','\n');
 if(sha256(text)!==after.sha256||blob(text)!==after.gitBlob)return source;
 return source.includes('\r\n')?before.source.replaceAll('\n','\r\n'):before.source;
}
