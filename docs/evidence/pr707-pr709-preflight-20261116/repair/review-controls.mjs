import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
// Run from the exact combined candidate root. No candidate files are modified.
const {beforeFastFreezeCombination:project,assertReleaseSelectionMapCiCurrent:check,releaseSelectionMapCiSource:source,releaseSelectionMapCiCheckedSource:checked}=await import(pathToFileURL(resolve('tests/helpers/release-selection-map-ci-source.mjs')));
const packet=JSON.parse(readFileSync('tests/helpers/release-fast-freeze-combination.json'));
let n=0; const ok=(label,fn)=>{fn();n++;console.log('PASS',n,label);};
ok('complete current candidate',()=>check());
for(const[path,row]of Object.entries(packet.files)){
 const raw=readFileSync(path,'utf8');
 ok(path+' exact current',()=>assert.equal(raw,row.current.source));
 ok(path+' exact Git freeze predecessor',()=>assert.equal(execFileSync('git',['show',packet.parents[1]+':'+path],{encoding:'utf8'}),row.before.source));
 for(const [eol,input]of [['LF',raw],['CRLF',raw.replaceAll('\n','\r\n')]]){
  ok(path+' '+eol+' complete projection',()=>assert.equal(project(path,input),row.before.source));
  for(const before of [{sha256:'0'.repeat(64)},{sha256:row.current.sha256},{}]){
   ok(path+' '+eol+' wrong before public source',()=>assert.equal(source(path,input,before),input));
   ok(path+' '+eol+' wrong before checked source',()=>assert.equal(checked(path,input,before),input));
  }
 }
 for(const input of [raw+'\n',raw.slice(1),raw.replaceAll('\n','\r\r\n'),null,{},17,Buffer.from(raw),row.before.source])
  ok(path+' malformed/foreign input opaque',()=>assert.equal(project(path,input),input));
 for(const key of ['__proto__','constructor','foreign/'+path])ok(path+' unknown path opaque',()=>assert.equal(project(key,raw),raw));
 for(const input of [raw+'\n',raw.slice(1),row.before.source,execFileSync('git',['show',packet.parents[0]+':'+path],{encoding:'utf8'})])
  ok(path+' current rejects drift/stale parents',()=>assert.throws(()=>check((p,e)=>p===path?input:readFileSync(p,e))));
 ok(path+' current rejects missing owner',()=>assert.throws(()=>check((p,e)=>{if(p===path)throw Error('missing');return readFileSync(p,e)})));
}
console.log('TOTAL',n,'PASS; 0 FAIL');
for(const p of ['tests/helpers/release-selection-map-ci-source.mjs','tests/helpers/release-fast-freeze-combination.json','tests/release-selection-map-source.test.mjs','.github/workflows/quality.yml'])console.log('SHA256',createHash('sha256').update(readFileSync(p)).digest('hex'),p);
