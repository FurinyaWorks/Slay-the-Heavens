// Exact Develop predecessors for Release backflow. Live builds read current sources.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';

const hash=(bytes,algorithm='sha256')=>createHash(algorithm).update(bytes).digest('hex');
const blob=source=>hash(`blob ${Buffer.byteLength(source)}\0${source}`,'sha1');
const archive=readFileSync(new URL('../fixtures/develop-release-backflow-source.json.gz',import.meta.url));
assert.equal(hash(archive),'0274fb7add34eeb3fe478d240e371bb2ac7af872932c262334b0613a0dc9d738','exact Develop Release-backflow source archive');
const {base,files}=JSON.parse(gunzipSync(archive));
assert.equal(base,'82ba375397ffd7f8f8175a7a1fd18a973450ecc6');
for(const {before,after} of Object.values(files)){
 assert.equal(hash(before.source),before.sha256);
 assert.equal(blob(before.source),before.gitBlob);
 assert.match(after.sha256,/^[a-f0-9]{64}$/);
 assert.match(after.gitBlob,/^[a-f0-9]{40}$/);
}
export const developBackflowOwns=path=>Object.hasOwn(files,path);
function matches(source,expected){
 if(typeof source!=='string'||source.includes('\r\r\n'))return false;
 const lf=source.replaceAll('\r\n','\n');
 return hash(lf)===expected.sha256&&blob(lf)===expected.gitBlob;
}
export function beforeDevelopBackflow(path,source){
 if(!developBackflowOwns(path)||!matches(source,files[path].after))return source;
 const before=files[path].before.source;
 return source.includes('\r\n')?before.replaceAll('\n','\r\n'):before;
}
export function authenticateDevelopBackflow(path,source,read){
 const prior=beforeDevelopBackflow(path,source);
 if(prior===source)return source;
 let live;
 try{live=read(path);}catch(error){assert.fail('combined linked owner missing: '+path+': '+String(error?.message??error));}
 assert(matches(live,files[path].after),'combined linked owner identity: '+path+' changed during Develop backflow validation');
 return prior;
}
