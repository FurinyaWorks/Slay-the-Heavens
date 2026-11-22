import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';

const sha256=source=>createHash('sha256').update(source).digest('hex');
const blob=source=>createHash('sha1').update('blob '+Buffer.byteLength(source)+'\0').update(source).digest('hex');
const archive=readFileSync(new URL('./native-host-replay-source.json.gz',import.meta.url));
assert.equal(sha256(archive),'f6e9062262769766edcca6a82898acec6b66a0e7f3b30d26655c2b45eb511da5','exact native host replay archive');
const {schemaVersion,base,inputRetirementHead,files}=JSON.parse(gunzipSync(archive));
assert.equal(schemaVersion,1);
assert.equal(base,'67fc8750dd6ef9a13067c6a43137f910b6a44228');
assert.equal(inputRetirementHead,'392fae8d8dee2bd57829dda0e8da836f45107398');
assert.deepEqual(Object.keys(files).filter(path=>files[path].inputRetirement),['scripts/relic-view-layout.mjs']);
for(const [path,{before,after}] of Object.entries(files)){
 assert.equal(sha256(before.source),before.sha256,path+' exact predecessor SHA256');
 assert.equal(blob(before.source),before.gitBlob,path+' exact predecessor Git blob');
 assert.match(after.sha256,/^[a-f0-9]{64}$/);
 assert.match(after.gitBlob,/^[a-f0-9]{40}$/);
}
const upstreamLayout=files['scripts/relic-view-layout.mjs'].inputRetirement;
assert.equal(sha256(upstreamLayout.source),upstreamLayout.sha256,'exact #899 relic layout SHA256');
assert.equal(blob(upstreamLayout.source),upstreamLayout.gitBlob,'exact #899 relic layout blob');
function currentSource(source,after){
 if(typeof source!=='string'||source.includes('\r\r\n'))return false;
 const text=source.replaceAll('\r\n','\n');
 return sha256(text)===after.sha256&&blob(text)===after.gitBlob;
}
export function nativeHostReplayOwns(path){
 return Object.hasOwn(files,path);
}
export function beforeNativeHostReplay(path,source){
 if(!nativeHostReplayOwns(path))return source;
 const {before,after}=files[path];
 if(!currentSource(source,after))return source;
 return source.includes('\r\n')?before.source.replaceAll('\n','\r\n'):before.source;
}

// The live builder copies detail.size; the #899 witness retains its reviewed bytes.
export function beforeNativeHostInputRetirement(path,source,{requireCurrent=false}={}){
 if(path!=='scripts/relic-view-layout.mjs')return source;
 const current=currentSource(source,files[path].after);
 if(requireCurrent)assert(current,'fresh composed input retirement builder: '+path);
 if(!current)return source;
 return source.includes('\r\n')?upstreamLayout.source.replaceAll('\n','\r\n'):upstreamLayout.source;
}
