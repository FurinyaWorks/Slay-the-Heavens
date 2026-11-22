import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {exactSourceMatches} from './source-fingerprint.mjs';

const archive=readFileSync(new URL('./official-background-fixture-source.json.gz',import.meta.url));
assert.equal(createHash('sha256').update(archive).digest('hex'),'f32f1ff8ac118f3ea5d7dd988f71ebc35284c683ebc862b98c752e8bb4dd5c0f','exact official background fixture archive');
const {schemaVersion,base,files}=JSON.parse(gunzipSync(archive));
assert.equal(schemaVersion,1);
assert.equal(base,'67fc8750dd6ef9a13067c6a43137f910b6a44228');
for(const [path,{before,after}] of Object.entries(files)){
 assert(exactSourceMatches(before.source,before),path+' exact fixture predecessor');
 assert.match(after.sha256,/^[a-f0-9]{64}$/);
 assert.match(after.gitBlob,/^[a-f0-9]{40}$/);
}
export function beforeOfficialBackgroundFixture(path,source){
 if(!Object.hasOwn(files,path))return source;
 const {before,after}=files[path];
 if(!exactSourceMatches(source,after))return source;
 return source.includes('\r\n')?before.source.replaceAll('\n','\r\n'):before.source;
}
