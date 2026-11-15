// Preserve exact Git bytes; adapt only prior test input paths, never their assertions.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const dir='experiments/characters/hutao-v6-followup-1115';
const bytes=fs.readFileSync(dir+'/baseline/source.html');
const hash=(b,algorithm='sha256')=>createHash(algorithm).update(b).digest('hex');
const blob=hash(Buffer.concat([Buffer.from(`blob ${bytes.length}\0`),bytes]),'sha1');
assert.equal(blob,'d4b97370fa5e314c725edc3a1136fb1523790c78','Exact 7c3 source bytes required');
const manifest={sourceCommit:'7c3abce098e789cacca03f25ee528047e24fbe25',sourceGitBlob:blob,
 sourcePath:'experiments/characters/hutao/full75/胡桃V5_75卡命名修订五战试玩版.html',sourceSha256:hash(bytes),sourceBytes:bytes.length,
 currentDevelopBase:'e65d9b98fbec69442047650254238cd9244df805',tests:[],
 note:'README at original source records a different SHA; Git blob and actual byte SHA above are authoritative for this follow-up.',
 namingApproved:false,productionEnabled:false};
for(const [name,originalBlob]of [['report-copy','73566914eac5f32f3cbb50f74fdb235b6de4249a'],['keyboard-controls','dd1f43c2366535626bc13918b69bd0ef16b3554c'],['modal-focus','ba39664631d64fc4c6eb576cf0e62e572644a285']]){
 const file=`${dir}/tests/${name}.test.mjs`,raw=fs.readFileSync(file);
 assert.equal(hash(Buffer.concat([Buffer.from(`blob ${raw.length}\0`),raw]),'sha1'),originalBlob);
 // Retain original source unchanged for provenance; only local test URL differs.
 fs.writeFileSync(`${dir}/baseline/${name}.test.mjs.txt`,raw);
 const source=raw.toString('utf8');
 const adapted=source.replace("../experiments/characters/hutao/full75/胡桃V5_75卡命名修订五战试玩版.html","../candidate.html")
  .replace("../experiments/characters/hutao/full75/","../");
 assert.notEqual(adapted,source);fs.writeFileSync(file,adapted);
 manifest.tests.push({name,sourceGitBlob:originalBlob,sourceSha256:hash(raw),adaptedSha256:hash(Buffer.from(adapted)),changes:'Input URL only; assertions unchanged'});
}
assert(!fs.existsSync(dir+'/candidate.html'),'Do not overwrite an existing candidate');
fs.writeFileSync(dir+'/candidate.html',bytes);
fs.writeFileSync(dir+'/source-manifest.json',JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify(manifest));
