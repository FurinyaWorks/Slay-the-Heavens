import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
const dir='experiments/characters/hutao-v6-followup-1115';
const sha=b=>createHash('sha256').update(b).digest('hex');
const read=p=>fs.readFileSync(dir+'/'+p);
const source=JSON.parse(read('source-manifest.json')),patch=JSON.parse(read('patch-manifest.json'));
const old=read('baseline/source.html'),candidate=read('candidate.html');
assert.equal(sha(old),source.sourceSha256);assert.equal(sha(candidate),patch.candidateSha256);
assert.equal(createHash('sha1').update(Buffer.from(`blob ${old.length}\0`)).update(old).digest('hex'),source.sourceGitBlob);
let expected=old.toString('utf8');
for(const e of patch.edits){assert.equal(expected.split(e.before).length-1,e.count);expected=expected.replaceAll(e.before,e.after);}
assert.equal(candidate.toString('utf8'),expected,'Only documented text replacements are permitted');
const oldScripts=[...old.toString('utf8').matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(x=>x[1]);
const scripts=[...candidate.toString('utf8').matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(x=>x[1]);
assert.equal(scripts.length,2);scripts.forEach((s,i)=>new vm.Script(s,{filename:'candidate-inline-'+i}));
assert.equal(scripts[0].slice(scripts[0].indexOf('class HutaoGame')),oldScripts[0].slice(oldScripts[0].indexOf('class HutaoGame')));
for(const test of source.tests){
 assert.equal(sha(read('tests/'+test.name+'.test.mjs')),test.adaptedSha256);
 assert.equal(sha(read('baseline/'+test.name+'.test.mjs.txt')),test.sourceSha256);
}
const red=read('evidence/red-r02.tap').toString(),green=read('evidence/green-final.tap').toString();
assert.match(red,/# tests 5\r?\n# suites 0\r?\n# pass 1\r?\n# fail 4/);
assert.match(green,/# tests 29\r?\n# suites 0\r?\n# pass 29\r?\n# fail 0\r?\n# cancelled 0\r?\n# skipped 0/);
const report={status:'pass',sourceGitBlob:source.sourceGitBlob,sourceSha256:source.sourceSha256,candidateSha256:patch.candidateSha256,
 changedStringOccurrences:patch.edits.reduce((n,e)=>n+e.count,0),engineByteIdentical:true,cardIdentitiesAndMechanics:'29-test-suite includes per-card 75-entry comparison',
 checks:['exact-source-Git-blob','only-seven-listed-text-occurrences','complete-engine-identical','two-inline-script-syntax','prior-test-path-only-adaptation','red-four-copy-failures','29-green-no-skip'],
 evidence:{redSha256:sha(read('evidence/red-r02.tap')),greenSha256:sha(read('evidence/green-final.tap')),truthfulCopyTestSha256:sha(read('tests/truthful-copy.test.mjs'))},
 namingGate:'HOLD',task96:'Blocked: specific Liyue role/version undecided',productionEnabled:false,officialPc:'UNVERIFIED',physicalMobile:'UNVERIFIED',fullCi:'NOT_RUN'};
fs.writeFileSync(dir+'/evidence/verification.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
