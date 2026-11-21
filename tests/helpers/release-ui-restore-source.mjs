import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';

const hash=(source,algorithm='sha256')=>createHash(algorithm).update(source).digest('hex');
const blob=source=>hash(`blob ${Buffer.byteLength(source)}\0${source}`,'sha1');

function matches(source,binding){
 if(!binding||typeof source!=='string'||source.includes('\r\r\n'))return false;
 const text=source.replaceAll('\r\n','\n');
 return hash(text)===binding.sha256&&blob(text)===binding.gitBlob;
}

export function releaseUiRestoreArchive(bytes,expectedSha,expectedBase='ff6af63d9bf93056dd772347d10dc749e7fa8d34'){
 assert.equal(hash(bytes),expectedSha,'exact Release UI source archive');
 const {base,files}=JSON.parse(gunzipSync(bytes));
 assert.equal(base,expectedBase);
 for(const [path,{before,after}] of Object.entries(files)){
  assert.equal(hash(before.source),before.sha256,path+' base SHA256');
  assert.equal(blob(before.source),before.gitBlob,path+' base Git blob');
  assert.match(after.sha256,/^[a-f0-9]{64}$/);
  assert.match(after.gitBlob,/^[a-f0-9]{40}$/);
 }
 function project(path,source){
  if(!Object.hasOwn(files,path)||!matches(source,files[path].after))return source;
  const prior=files[path].before.source;
  return source.includes('\r\n')?prior.replaceAll('\n','\r\n'):prior;
 }
 return {files,project};
}

const {files,project}=releaseUiRestoreArchive(readFileSync(new URL('./release-ui-restore-source.json.gz',import.meta.url)),
 'e38609afe1efa63715e2f54619fde19501b20b59ebb9a9aaf5944e82b22e339b');
const rightClick=releaseUiRestoreArchive(readFileSync(new URL('./release-card-right-click-source.json.gz',import.meta.url)),
 'a157bfd25b91346bc4b9c7beae6de19baec13e824ee808d59e827b5052d78a1a','ae15cf5f597728f0fe876f7136230955c3ec6179');
const fieldCancel=releaseUiRestoreArchive(readFileSync(new URL('./release-card-field-cancel-source.json.gz',import.meta.url)),
 'f38a352f98ef946e1e836781dd9ebd131010c03e04cfa62f928d94f6358c3bca','aa8fde88c2a077f3e7266984cdf3a4e6be8fc45a');
const controlsGuideRemoval=releaseUiRestoreArchive(readFileSync(new URL('./release-controls-guide-removal-source.json.gz',import.meta.url)),
 'c0124d8879ae800a7eb1aff1efecc321122e721615faaf4cd8080808a249c53e','db8bca6ad226bc816de7e6919a320d9d41fe9a78');
export const releaseControlsGuideRemovalSourcePaths=Object.freeze(Object.keys(controlsGuideRemoval.files).filter(path=>path.startsWith('src/lua/')));
export const beforeReleaseControlsGuideRemoval=controlsGuideRemoval.project;
export const releaseRightClickSourcePaths=Object.freeze(Object.keys(rightClick.files));
export const releaseUiRestoreSourcePaths=Object.freeze([...new Set([...Object.keys(files),...Object.keys(fieldCancel.files)])]);
export const beforeReleaseRightClick=(path,source)=>rightClick.project(path,fieldCancel.project(path,source));
export const beforeReleaseUiRestore=(path,source)=>project(path,beforeReleaseRightClick(path,beforeReleaseControlsGuideRemoval(path,source)));
const authorizationPaths=[...new Set([...releaseUiRestoreSourcePaths,...releaseRightClickSourcePaths,...releaseControlsGuideRemovalSourcePaths])];

export function authorizeReleaseUiRestore(samples,read){
 // A combined replay that contains current menu code must use the same release
 // version for every sampled menu owner. Older all-historical views still replay.
 const currentMenu=samples.some(([path,input])=>releaseControlsGuideRemovalSourcePaths.includes(path)
  &&matches(input,controlsGuideRemoval.files[path].after));
 for(const path of authorizationPaths){
  const inputs=samples.filter(sample=>sample[0]===path).map(sample=>sample[1]);
  if(!inputs.length)continue;
  const menuBinding=controlsGuideRemoval.files[path]?.after;
  const expected=currentMenu&&menuBinding?menuBinding
   :[menuBinding,fieldCancel.files[path]?.after,rightClick.files[path]?.after,files[path]?.after]
    .find(binding=>inputs.some(input=>matches(input,binding)));
  if(!expected)continue;
  const message='combined linked owner identity: '+path+' changed during owner validation';
  assert(inputs.every(input=>matches(input,expected)),message);
  let live;
  try{live=read(path);}catch(error){assert.fail('combined linked owner missing: '+path+': '+String(error?.message??error));}
  assert(matches(live,expected),message);
 }
}

export function beforeAuthenticatedReleaseUiRestore(path,source,read){
 const prior=beforeReleaseUiRestore(path,source);
 if(prior!==source)authorizeReleaseUiRestore([[path,source]],read);
 return prior;
}
