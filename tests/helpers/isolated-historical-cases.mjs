import assert from 'node:assert/strict';
import {execFile} from 'node:child_process';
import {availableParallelism} from 'node:os';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {promisify} from 'node:util';
import {historicalTest} from './historical-baseline-inputs.mjs';

const workerFlag='--isolated-historical-case';
const nameFilter=/(?:^|[\s"'])--test-(?:name|skip)-pattern(?=[=\s"']|$)/;

export function runHistoricalCases(url,suite,cases){
 const hasNameFilter=process.execArgv.some(arg=>nameFilter.test(arg))
  ||nameFilter.test(process.env.NODE_OPTIONS??'');
 if(process.argv[2]===workerFlag){
  const selected=cases.find(([name])=>name===process.argv[3]);
  assert(selected,'registered historical replay case');
  historicalTest(...selected);
  return;
 }
 if(availableParallelism()<2||hasNameFilter){
  for(const entry of cases)historicalTest(...entry);
  return;
 }
 // The historical harness changes cwd. Each worker owns its verified inputs.
 const execute=promisify(execFile),file=fileURLToPath(url),env={...process.env};
 delete env.NODE_TEST_CONTEXT;
 test(suite,{concurrency:2},async context=>{
  await Promise.all(cases.map(([name])=>context.test(name,async()=>{
   const {stdout}=await execute(process.execPath,['--test-reporter=tap',file,workerFlag,name],{env,maxBuffer:1024*1024,windowsHide:true})
    .catch(error=>assert.fail([error.stdout,error.stderr,error.message].filter(Boolean).join('\n')));
   assert.match(stdout,/^# tests 1\r?$/m,'the isolated process ran one registered case');
   assert.match(stdout,/^# pass 1\r?$/m,'the isolated historical case passed');
  })));
 });
}
