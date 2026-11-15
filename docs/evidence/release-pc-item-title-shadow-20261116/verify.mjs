import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const root=new URL('./',import.meta.url),read=path=>readFileSync(new URL(path,root));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const inventory=JSON.parse(read('compressed-inventory.json'));
for(const item of inventory){
 const gzip=read(item.path),raw=gunzipSync(gzip);
 assert.equal(gzip.length,item.gzipBytes,item.path);assert.equal(sha(gzip),item.gzipSha256,item.path);
 assert.equal(raw.length,item.rawBytes,item.path);assert.equal(sha(raw),item.rawSha256,item.path);
}
const runs=JSON.parse(read('runs.json'));
for(const run of runs)for(const field of ['stdout','stderr','boundInputs'])if(run[field]){
 const expected=run[field],gzip=read(expected.path),raw=gunzipSync(gzip);
 assert.equal(sha(raw),expected.rawSha256,run.name+' '+field);
 assert.equal(raw.length,expected.rawBytes,run.name+' '+field);
 assert.equal(sha(gzip),expected.gzipSha256,run.name+' '+field);
}
const receipt=JSON.parse(read('receipt.json')),continuation=JSON.parse(read('continuation.json'));
assert.equal(receipt.productHead,continuation.productHead);
for(const item of [receipt.inputReceipt,receipt.beforeInputReceipt])assert.equal(sha(read(item.path)),item.sha256);
const inputs=JSON.parse(gunzipSync(read(receipt.inputReceipt.path)));
assert.equal(inputs.head,receipt.productHead);assert.equal(inputs.inputs.length,5320);
assert.equal(inputs.dependencies.length,684);assert.equal(inputs.tools.length,1);
assert.equal(continuation.paths.filter(p=>!p.unchangedFromSource).length,1);
assert(continuation.selectiveContinuation.bothHelpersVerbatim);
assert(continuation.selectiveContinuation.reverseOnlyHelpersAndOneRelicCallEqualsPredecessor);
assert.equal(runs.find(r=>r.name==='reward-pool-retirement-green-peer').status,0);
assert.equal(runs.find(r=>r.name==='frozen-preview-contract').status,1);
console.log(JSON.stringify({result:'ARCHIVE_HASH_PASS_ONLY',productHead:receipt.productHead,compressedFiles:inventory.length,runs:runs.length,currentProductTestsRerun:false,sourceCi:'UNVERIFIED'}));
