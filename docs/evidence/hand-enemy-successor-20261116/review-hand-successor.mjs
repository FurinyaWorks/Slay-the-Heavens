import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {execFileSync} from 'node:child_process';import {gunzipSync} from 'node:zlib';import {createHash} from 'node:crypto';
const h=x=>createHash('sha256').update(x).digest('hex'), norm=x=>x.replaceAll('\r\n','\n');
const p=JSON.parse(gunzipSync(readFileSync('tests/helpers/hand-enemy-successor-ci.json.gz'))), orig=JSON.parse(gunzipSync(readFileSync('tests/helpers/hand-enemy-ci-source.json.gz')));let n=0;
for(const [path,row]of Object.entries(p.files)){
 assert.equal(row.before.source,norm(execFileSync('git',['show',p.baseCommit+':'+path],{encoding:'utf8'})));n++;
 assert.equal(row.current.source,norm(readFileSync(path,'utf8')));n++;
 if(orig.files[path])assert.deepEqual(row.views,orig.files[path].views);else for(const [domain,ref]of Object.entries(orig.viewCommits))assert.equal(row.views[domain].source,norm(execFileSync('git',['show',ref+':'+path],{encoding:'utf8'})));n++;
}
const {assertHandEnemyCiCurrent,handEnemyHistoricalRead}=await import(process.cwd()+'/tests/helpers/hand-enemy-ci-source.mjs');
assertHandEnemyCiCurrent();n++;
for(const domain of ['hand','enemy']){
 for(const path of Object.keys(p.files)){
  const read=(f,e)=>{const raw=readFileSync(f,e);return typeof raw==='string'?raw.replaceAll('\n','\r\n'):raw;};
  const a=handEnemyHistoricalRead(domain,read)(path,'utf8'),b=handEnemyHistoricalRead(domain)(path);assert(Buffer.isBuffer(b));assert.equal(norm(a),b.toString());n+=2;
 }
}
for(const path of [...Object.keys(p.files),'tests/helpers/hand-enemy-successor-ci.json.gz','tests/helpers/enemy-post697-ci-reader-repair.json.gz']){
 for(const fault of ['missing','null','drift']){const read=(f,e)=>{if(f!==path)return readFileSync(f,e);if(fault==='missing')throw new Error('missing');if(fault==='null')return null;const x=readFileSync(f,e);return typeof x==='string'?x+'x':Buffer.concat([x,Buffer.from('x')]);};assert.throws(()=>assertHandEnemyCiCurrent(read));n++;}
 assertHandEnemyCiCurrent();n++;
}
console.log('independent successor checks PASS',n);
