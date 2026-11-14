// Append-only current CI identities. The release archive and historical views stay byte-identical.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {navigationCiBytes as bytes} from './navigation-ci-binding.mjs';
export const navigationCiPatch=JSON.parse(gunzipSync(bytes));
export function extendNavigationCi(original,patch=navigationCiPatch){
 assert.equal(patch.baseCommit,'58a30edfcb06cb34403ca71d04fcea9d3e4352ef');
 assert.equal(patch.sourceCommit,'3f627d5dfb764826c9ab5a13de12bcdca5aefd24');
 const next=structuredClone(original);
 for(const [path,row]of Object.entries(patch.files)){
  assert.deepEqual(original.files[path]?.current??null,row.before,'exact navigation CI predecessor: '+path);
  assert(row.after);assert.equal(createHash('sha256').update(row.after.source).digest('hex'),row.after.sha256,'complete navigation CI source');assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(row.after.source)}\0`).update(row.after.source).digest('hex'),row.after.gitBlob,'navigation CI Git identity');next.files[path]={...original.files[path],current:row.after,views:original.files[path]?.views??{}};
 }
 for(const [path,row]of Object.entries(patch.closure)){
  assert.deepEqual(original.closure[path]??null,row.before,'exact navigation helper predecessor: '+path);
  next.closure[path]=row.after;
 }
 for(const key of ['inventory','luaInventory']){
  assert.deepEqual(original[key],patch[key].before,'complete navigation predecessor inventory');
  assert.equal(new Set(patch[key].after).size,patch[key].after.length);
  for(const path of original[key])assert(patch[key].after.includes(path),'no old test removed');
  next[key]=patch[key].after;
 }
 return next;
}
