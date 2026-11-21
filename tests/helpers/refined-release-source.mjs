// Historical-only continuation. Production builds and test discovery use live inputs.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';

const hash=(source,algorithm='sha256')=>createHash(algorithm).update(source).digest('hex');
const blob=source=>hash(`blob ${Buffer.byteLength(source)}\0${source}`,'sha1');
const normalize=source=>source.replaceAll('\r\n','\n');
const gzip=readFileSync(new URL('./refined-release-source.json.gz',import.meta.url));
assert.equal(hash(gzip),'7362133512c07d6107d65bd62a021919e527a53589207841b84221dff481ad41','exact refined Release source archive');
const {schemaVersion,base,normalization,files,addedJs}=JSON.parse(gunzipSync(gzip));
assert.equal(schemaVersion,1);assert.equal(normalization,'LF');
assert.equal(base,'7381cf7152ba7a726506f9a5b525e13cfbd2c87a');
const paths=Object.keys(files),owners=paths.filter(path=>path.startsWith('src/lua/'));
export const refinedReleaseProductionPaths=Object.freeze(owners);
assert.deepEqual(owners,['src/lua/abyss_monster_art.lua','src/lua/abyss_monster_surfaces.lua']);
for(const [path,{before,after}]of Object.entries(files)){
 assert.equal(normalize(before.source),before.source,path);
 assert.equal(hash(before.source),before.sha256,path);
 assert.equal(blob(before.source),before.gitBlob,path);
 assert.notEqual(before.sha256,after.sha256,path);
}
for(const {sha256,gitBlob} of [...Object.values(files).map(row=>row.after),...Object.values(addedJs)]){
 assert.match(sha256,/^[a-f0-9]{64}$/);assert.match(gitBlob,/^[a-f0-9]{40}$/);
}
function matches(source,binding){
 if(!binding||typeof source!=='string'||source.includes('\r\r\n'))return false;
 const lf=normalize(source);
 return hash(lf)===binding.sha256&&blob(lf)===binding.gitBlob;
}
function project(path,source){
 if(!Object.hasOwn(files,path)||!matches(source,files[path].after))return source;
 const prior=files[path].before.source;
 return source.includes('\r\n')?prior.replaceAll('\n','\r\n'):prior;
}
export function beforeRefinedReleaseCiSource(path,source){
 return owners.includes(path)?source:project(path,source);
}
export function beforeRefinedReleaseProduction(path,source){
 return owners.includes(path)?project(path,source):source;
}
export function authorizeRefinedReleaseProduction(samples,read){
 if(!samples.some(([path,source])=>owners.includes(path)&&matches(source,files[path].after)))return;
 for(const [path,source]of samples){
  if(owners.includes(path))assert(matches(source,files[path].after),'mixed linked refined Release source: '+path);
 }
 for(const path of owners){
  let source;try{source=read(path);}catch(error){assert.fail('combined linked owner missing: '+path+': '+String(error?.message??error));}
  assert(matches(source,files[path].after),'combined linked owner identity: '+path+' changed during refined Release source validation');
 }
}
export function assertRefinedReleaseSourcesCurrent(read=readFileSync){
 for(const path of paths)assert(matches(read(path,'utf8'),files[path].after),'fresh complete integration source: refined Release '+path);
}
export function refinedReleaseHistoricalInput(path,read){
 if(!Object.hasOwn(files,path)||owners.includes(path))return undefined;
 const source=read(path,'utf8');
 assert(matches(source,files[path].after),'fresh refined Release historical input: '+path);
 return project(path,source);
}
export function beforeRefinedReleaseJsInventory(paths,preceding,read,required=false){
 const added=Object.keys(addedJs);
 if(!required&&!added.some(path=>paths.includes(path)))return paths;
 assert.deepEqual([...paths].sort(),[...preceding,...added].sort(),'complete current raw discovery inventory');
 for(const path of added)assert(matches(read(path,'utf8'),addedJs[path]),'fresh added inventory source: '+path);
 return paths.filter(path=>!Object.hasOwn(addedJs,path));
}
