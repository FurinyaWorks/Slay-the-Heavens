// Sensitivity checks against a freshly collected SDK controls-only experiment.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const source=path.resolve(process.argv[2]??'build/monster-low-budget-sdk-20261118');
const verifier=path.resolve('experiments/monster-low-budget/verify.mjs');
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'monster-controls-'));
const results=[];
const invoke=(directory,flags=['--controls-only'])=>spawnSync(process.execPath,[verifier,directory,...flags],{encoding:'utf8',timeout:30000});
function assertGreen(directory){
 const result=invoke(directory);assert.ifError(result.error);
 assert.equal(result.status,0,result.stdout+result.stderr);assert.match(result.stdout,/PASS controls only; rendering\/gallery NOT_RUN/);
}
function mutateJson(directory,file,change){
 const target=path.join(directory,file),value=JSON.parse(fs.readFileSync(target));change(value);fs.writeFileSync(target,JSON.stringify(value));
}
const cases=[
 ['full-mode-rejects-partial',()=>{},[],/Controls-only receipts cannot satisfy full visual verification/],
 ['partial-cannot-be-pass',dir=>mutateJson(dir,'runtime-receipt.json',r=>{r.status='pass'}),undefined,/Controls-only receipts/],
 ['partial-cannot-claim-rendering',dir=>mutateJson(dir,'runtime-receipt.json',r=>{r.rendering='pass'}),undefined,/NOT_RUN/],
 ['partial-cannot-claim-png',dir=>mutateJson(dir,'runtime-receipt.json',r=>{r.samples[0].pngSha256='0'.repeat(64)}),undefined,/null/],
 ['sdk-mismatch',dir=>mutateJson(dir,'switch-receipt.json',r=>{r.sdkSha256='0'.repeat(64)}),undefined,/same SDK/],
 ['geometry-drift',dir=>mutateJson(dir,'jaw_worm/budget-100.json',r=>{r.shapes[0].colour='#000000'}),undefined,/not generated from this pack/],
 ['missing-pack',dir=>fs.unlinkSync(path.join(dir,'jaw_worm/budget-100.json')),undefined,/ENOENT/],
 ['stale-controller',dir=>mutateJson(dir,'switch-receipt.json',r=>{r.luaSha256='0'.repeat(64)}),undefined,/AssertionError/],
];
try{
 assertGreen(source);
 for(const [name,mutation,flags,message]of cases){
  const directory=path.join(temporary,name);fs.cpSync(source,directory,{recursive:true});
  assertGreen(directory);mutation(directory);
  const result=invoke(directory,flags);assert.ifError(result.error);
  assert.equal(result.status,1,name+': '+result.stdout+result.stderr);assert.match(result.stderr,message,name);
  results.push({case:name,status:'rejected'});
 }
 assertGreen(source);
 console.log(JSON.stringify({baseline:'pass',negativeControls:results,originalRestored:'pass'}));
}finally{fs.rmSync(temporary,{recursive:true,force:true})}
