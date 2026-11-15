import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
const read=name=>readFileSync(new URL(name,import.meta.url));
const receipt=JSON.parse(read('receipt.json'));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
assert.equal(receipt.baseSha,'36b9b157ee6f05b65eb9f1da7e2978647d36c210');
assert.equal(receipt.productSha,'862c3f2a8988b1af21fc897d6de1d65650798a0d');
const logs=new Map();
for(const entry of receipt.files){
 const compressed=read(entry.file);assert.equal(hash(compressed),entry.sha256);
 const raw=gunzipSync(compressed);assert.equal(raw.length,entry.rawBytes);assert.equal(hash(raw),entry.rawSha256);
 logs.set(entry.file.slice(0,-3),raw.toString('utf8'));
}
assert(logs.get('red-source-test.log').includes('approved full body has no ground shadow'));
assert.match(logs.get('red-source-test.log'),/fail 2/);
assert.match(logs.get('green-boundaries-final.log'),/pass 2/);
assert.match(logs.get('targeted.log'),/pass 67/);
assert.match(logs.get('engineering.log'),/no new diagnostics/);
const plan=JSON.parse(logs.get('fast-plan.json').replace(/^\uFEFF/,''));
assert.equal(plan.full,true);assert.equal(plan.reason,'Shared build/test infrastructure: scripts/build-ui.mjs');
assert.equal(receipt.results.full,'required_not_run');
const review=JSON.parse(read('review.json'));
assert.equal(review.result,'PASS_SCOPED');assert.equal(review.head,receipt.productSha);assert.equal(review.base,receipt.baseSha);
assert.deepEqual(review.findings,[]);
for(const [name,entry]of Object.entries(review.artifacts)){
 const bytes=gunzipSync(read(name+'.gz'));assert.equal(hash(bytes),entry.sha256);assert.equal(bytes.length,entry.bytes);
}
console.log('ARCHIVE_PASS files='+logs.size+' red=2 finalGreen=2 existing=67 review=PASS_SCOPED full=required_not_run');
