// Observation only: preserve exact builtin arguments, receiver and return.
import childProcess from 'node:child_process';
import {syncBuiltinESMExports} from 'node:module';
import {appendFileSync} from 'node:fs';
import {performance} from 'node:perf_hooks';
const original=childProcess.spawnSync;
childProcess.spawnSync=function(...args){
 const lua=args[1]?.[2];
 const script=typeof lua==='string' ? lua.slice(-200).match(/card_input_port(?:_slice_[23])?\.lua/)?.[0] : undefined;
 const start=performance.now();
 let result;
 try{return result=Reflect.apply(original,this,args);}
 finally{if(script){try{appendFileSync('$EVIDENCE_TMP/original-process-observations.jsonl',JSON.stringify({script,elapsedMs:performance.now()-start,timeoutMs:args[2]?.timeout,status:result?.status})+'\n');}catch(error){console.error('Timing observation not saved:',error.code);}}}
};
syncBuiltinESMExports();
