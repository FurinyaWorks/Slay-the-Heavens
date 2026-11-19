import assert from 'node:assert/strict';
import {readFileSync as raw} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const bridge='tests/helpers/release-potion-enemy-source.mjs';
const {assertReleasePotionEnemyCurrent}=await import(pathToFileURL(resolve(bridge)));
const path='tests/integrated-ci-source.cases.mjs';
const packet=p=>JSON.parse(gunzipSync(raw('tests/helpers/release-'+p+'-ci.json.gz')));
const join=packet('full-converge');
assert.equal(join.path,path);
const replacements=[
 [2,'history parent',join.sources.history.text],
 [3,'PC22 parent',join.sources.pc22.text],
 [4,'Full follow-up after',packet('historical-input').files[path].before],
 [5,'first Full-repair after',packet('full-followup').files[path].before],
];
const mode=process.argv[2]??'strict';
assert(['first','older','strict'].includes(mode));
const selected=mode==='first'?replacements.slice(0,2):mode==='older'?replacements.slice(2):replacements;
const sha=b=>createHash('sha256').update(b).digest('hex');
console.log(JSON.stringify({mode,bridgeSha256:sha(raw(bridge)),joinSha256:sha(raw('tests/helpers/release-full-converge-ci.json.gz'))}));
for(const [at,label,old] of selected){
 let seen=0,injected=0,error;
 const read=(p,e)=>{
  if(p===path&&e==='utf8'&&++seen===at){injected++;return old;}
  return raw(p,e);
 };
 try{assertReleasePotionEnemyCurrent(read);}
 catch(e){error=e.message.split('\n')[0];}
 assert.equal(injected,1);
 console.log(JSON.stringify({at,label,seen,injected,accepted:!error,error}));
 if(mode==='strict'){
  assert.equal(error,'fresh Release Full CI convergence source: '+path);
  assert.equal(seen,at);
 }else assert.equal(error,undefined,'the pre-fix defect is the acceptance of precise old bytes');
 assertReleasePotionEnemyCurrent(raw);
}
