// Exact Develop predecessors for Release backflow. Live builds read current sources.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';

const hash=(bytes,algorithm='sha256')=>createHash(algorithm).update(bytes).digest('hex');
const blob=source=>hash(`blob ${Buffer.byteLength(source)}\0${source}`,'sha1');
const archive=readFileSync(new URL('../fixtures/develop-release-backflow-source.json.gz',import.meta.url));
assert.equal(hash(archive),'c92d7559ea1ba351da90cee3296a9f05ab1eb55b0aa18b76ffbfd885f73a62dd','exact Develop Release-backflow source archive');
const {base,files,shopBase,shop}=JSON.parse(gunzipSync(archive));
assert.equal(base,'742a540ffc999e91acdface3d8fc7f753731f0a8');
assert.equal(shopBase,'82ba375397ffd7f8f8175a7a1fd18a973450ecc6');
for(const {before,after} of [...Object.values(files),...Object.values(shop)]){
 assert.equal(hash(before.source),before.sha256);
 assert.equal(blob(before.source),before.gitBlob);
 assert.match(after.sha256,/^[a-f0-9]{64}$/);
 assert.match(after.gitBlob,/^[a-f0-9]{40}$/);
}
const current=path=>Object.hasOwn(files,path)?files[path]:Object.hasOwn(shop,path)?shop[path]:undefined;
export const developBackflowOwns=path=>current(path)!==undefined;
function matches(source,expected){
 if(typeof source!=='string'||source.includes('\r\r\n'))return false;
 const lf=source.replaceAll('\r\n','\n');
 return hash(lf)===expected.sha256&&blob(lf)===expected.gitBlob;
}
export function assertDevelopBackflowCurrent(path,source){
 assert(matches(source,current(path).after),'fresh current production owner: '+path);
}
function predecessor(layer,path,source){
 if(!Object.hasOwn(layer,path)||!matches(source,layer[path].after))return source;
 const before=layer[path].before.source;
 return source.includes('\r\n')?before.replaceAll('\n','\r\n'):before;
}
export function beforeDevelopBackflow(path,source){
 return predecessor(shop,path,predecessor(files,path,source));
}
export function authenticateDevelopBackflow(path,source,read){
 const prior=beforeDevelopBackflow(path,source);
 if(prior===source)return source;
 let live;
 try{live=read(path);}catch(error){assert.fail('combined linked owner missing: '+path+': '+String(error?.message??error));}
 const row=matches(source,current(path).after)?current(path):shop[path];
 assert(matches(live,row.after),'combined linked owner identity: '+path+' changed during Develop backflow validation');
 return prior;
}
