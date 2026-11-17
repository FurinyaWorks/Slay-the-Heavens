import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import{execFileSync}from'node:child_process';import{pathToFileURL}from'node:url';import{resolve}from'node:path';
const {assertReleaseSelectionMapCiCurrent:check}=await import(pathToFileURL(resolve('tests/helpers/release-selection-map-ci-source.mjs')));
const p=JSON.parse(readFileSync('tests/helpers/release-fast-freeze-eol-continuation.json'));let n=0;
for(const[path,row]of Object.entries(p.files)){assert.equal(row.current.source,execFileSync('git',['show',p.parents[0]+':'+path],{encoding:'utf8'}));assert.equal(row.before.source,execFileSync('git',['show',p.priorParents[0]+':'+path],{encoding:'utf8'}));n+=2;for(const value of [row.before.source,row.current.source+'\n','',null]){assert.throws(()=>check((q,e)=>q===path?value:readFileSync(q,e)));n++;}check((q,e)=>q===path?row.current.source.replaceAll('\n','\r\n'):readFileSync(q,e));n++;}
check();n++;
const w=readFileSync('.github/workflows/quality.yml','utf8');assert(w.includes('edited'));assert(w.includes('Require frozen Release Full before publication'));assert(w.indexOf('check-release-scope.mjs')<w.indexOf('ci-impact.mjs'));assert(!w.split('  push:')[1].split('  workflow_dispatch:')[0].includes('release/**'));n+=4;
console.log('Independent new-parent PASS',n,'checks');
