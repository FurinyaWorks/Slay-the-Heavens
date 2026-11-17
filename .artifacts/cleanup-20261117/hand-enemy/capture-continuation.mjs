// Append-only full-source capture. Existing archives are read, never rewritten.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,readdirSync,existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {gzipSync,gunzipSync,brotliCompressSync,brotliDecompressSync,constants} from 'node:zlib';
import {sourceEpoch} from '../../../tests/helpers/closeout-source-epoch.mjs';
import {discoverJs} from '../../../scripts/ci-shards.mjs';
const base='5bb154a0649b2a5c372f0f08c0f93ee0ec716249';
const commits={hand:'e259ca49be9d2e3b3526a5efa762814ef96df1c9',enemy:'4d40bdac703c80e51054d551f1512ff02fc0adbc',hand5bb:base,enemyRepair150:'1508139e1918af4eeb455e4124241fd927c896b2',enemyCalibration:'e229f7c4943915e33109e6bdc293c4dd3fcbedc2',release698:'b9bca884ed9b9831965b409885d78f719b9a567a',release:'00ab3fe6d386f55aecfb063e59aeca2cf5065807',releaseAf77:'af77fb2461c548f0faf104761d107397f75dca08'};
const hash=b=>createHash('sha256').update(b).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const bind=source=>({source:norm(source),sha256:hash(norm(source)),gitBlob:createHash('sha1').update(`blob ${Buffer.byteLength(norm(source))}\0`).update(norm(source)).digest('hex')});
const git=(...args)=>execFileSync('git',args,{encoding:'utf8',maxBuffer:64*1024*1024,stdio:['ignore','pipe','pipe']});
const trees=Object.fromEntries(Object.entries(commits).map(([k,c])=>[k,new Set(git('ls-tree','-r','--name-only',c).trim().split('\n'))]));
const cachePath='tests/helpers/hand-enemy-release-ci-source.json.gz';
let previous=existsSync(cachePath)?JSON.parse(gunzipSync(readFileSync(cachePath))):null;
const expandPacket=packed=>{
 if(packed.storageFormat==='deduplicated-complete-records-brotli-v1'){
  const {recordsBrotli,recordsByteLength,recordsSha256,...metadata}=packed;
  const raw=brotliDecompressSync(Buffer.from(recordsBrotli,'base64'),{maxOutputLength:recordsByteLength});
  assert.equal(raw.length,recordsByteLength);assert.equal(hash(raw),recordsSha256,'complete SHA record dictionary');
  packed={...metadata,storageFormat:'deduplicated-complete-records-v1',records:JSON.parse(raw)};
 }
 const record=id=>{if(id===null)return null;assert(Object.hasOwn(packed.records,id),'complete stored source record');return packed.records[id];};
 const result={...packed,files:Object.fromEntries(Object.entries(packed.files).map(([path,row])=>[path,{...row,before:record(row.before),current:record(row.current),views:Object.fromEntries(Object.entries(row.views).map(([domain,id])=>[domain,record(id)]))}]))};
 delete result.records;delete result.storageFormat;return result;
};
if(previous?.storageFormat==='deduplicated-complete-records-v1'||previous?.storageFormat==='deduplicated-complete-records-brotli-v1')previous=expandPacket(previous);
const historical=(domain,path)=>{
 if(previous?.viewCommits[domain]===commits[domain]&&previous.files[path]&&Object.hasOwn(previous.files[path].views,domain))return previous.files[path].views[domain];
 return trees[domain].has(path)?bind(git('show',commits[domain]+':'+path)):null;
};
const unpack=path=>JSON.parse(gunzipSync(readFileSync(path)));
const old=unpack('tests/helpers/hand-enemy-ci-source.json.gz'),successor=unpack('tests/helpers/hand-enemy-successor-ci.json.gz');
const oldFiles={...old.files};for(const [p,r]of Object.entries(successor.files))oldFiles[p]={current:r.current,views:r.views};
const paths=new Set([...Object.keys(oldFiles),...Object.keys(sourceEpoch.proof.current).filter(p=>sourceEpoch.proof.current[p])]);
for(const c of [commits.release,commits.enemyCalibration,commits.releaseAf77])for(const path of git('diff','--name-only',base,c).trim().split('\n'))if(/^(tests|scripts|src|config|\.github)\//.test(path)&&/\.(mjs|lua|json|yml|yaml)$/.test(path))paths.add(path);
for(const path of [...git('diff','--name-only',base).trim().split('\n'),...git('ls-files','--others','--exclude-standard','tests/helpers').trim().split('\n')])if(/^(tests|scripts|src|config|\.github)\//.test(path)&&/\.(mjs|lua|json|yml|yaml)$/.test(path))paths.add(path);
// Fixed trust leaves must not bind themselves, directly or through the packet.
for(const p of ['tests/helpers/hand-enemy-ci-source.mjs','tests/helpers/hand-enemy-release-ci-source.mjs'])paths.delete(p);
const files={};for(const path of [...paths].sort()){
 const current=bind(readFileSync(path,'utf8')),views=Object.fromEntries(Object.keys(commits).map(domain=>[domain,oldFiles[path]?.views?.[domain]??historical(domain,path)]));
 if(oldFiles[path])for(const [domain,row]of Object.entries(oldFiles[path].views))assert.deepEqual(views[domain],row,'immutable original '+domain+' '+path);
 files[path]={before:oldFiles[path]?.current??historical('hand5bb',path),current,views};
}
if(previous)for(const [path,row]of Object.entries(previous.files)){
 assert.deepEqual(files[path].before,row.before,'preserved complete before: '+path);
 for(const domain of Object.keys(previous.viewCommits))assert.deepEqual(files[path].views[domain],row.views[domain],'preserved old complete domain '+domain+': '+path);
}
const archives={...old.immutableArchives};
for(const path of git('ls-files','tests/helpers/*.gz').trim().split('\n'))archives[path]=hash(readFileSync(path));
delete archives['tests/helpers/hand-enemy-release-ci-source.json.gz'];
if(previous)for(const [path,sha]of Object.entries(previous.archives))assert.equal(archives[path],sha,'immutable original archive: '+path);
const inventories=domain=>({js:[...trees[domain]].filter(p=>/^tests\/[^/]+\.test\.mjs$/.test(p)).sort(),lua:[...trees[domain]].filter(p=>/^tests\/lua\/[^/]+\.lua$/.test(p)).sort()});
const packet={schemaVersion:1,normalization:'LF',baseCommit:base,currentTreeCommitted:false,currentCommitRole:'uncommitted normal forward merge source capture; no device acceptance',viewCommits:commits,files,archives,currentInventory:{js:discoverJs(),lua:readdirSync('tests/lua').filter(n=>n.endsWith('.lua')).map(n=>'tests/lua/'+n).sort()},viewInventories:Object.fromEntries(Object.keys(commits).map(k=>[k,inventories(k)]))};
// Store each complete immutable binding once; expansion restores every proof
// field verbatim. No source, domain, assertion or historical record is removed.
const records={},store=row=>{
 if(row===null)return null;assert(row&&typeof row.source==='string'&&row.sha256&&row.gitBlob);
 if(Object.hasOwn(records,row.sha256))assert.deepEqual(records[row.sha256],row);else records[row.sha256]=row;
 return row.sha256;
};
const stored={...packet,storageFormat:'deduplicated-complete-records-v1',files:Object.fromEntries(Object.entries(packet.files).map(([path,row])=>[path,{...row,before:store(row.before),current:store(row.current),views:Object.fromEntries(Object.entries(row.views).map(([domain,binding])=>[domain,store(binding)]))}])),records};
assert.deepEqual(expandPacket(stored),packet,'lossless complete continuation capture');
const recordBytes=Buffer.from(JSON.stringify(records));
const recordData=brotliCompressSync(recordBytes,{params:{[constants.BROTLI_PARAM_QUALITY]:11,[constants.BROTLI_PARAM_LGWIN]:24,[constants.BROTLI_PARAM_SIZE_HINT]:recordBytes.length}});
const {records:completeRecords,...metadata}=stored;
const compressedStored={...metadata,storageFormat:'deduplicated-complete-records-brotli-v1',recordsBrotli:recordData.toString('base64'),recordsByteLength:recordBytes.length,recordsSha256:hash(recordBytes)};
assert.deepEqual(expandPacket(compressedStored),packet,'lossless compressed complete continuation capture');
const bytes=gzipSync(JSON.stringify(compressedStored),{level:9,mtime:0});
writeFileSync('tests/helpers/hand-enemy-release-ci-source.json.gz',bytes);
console.log(JSON.stringify({sha256:hash(bytes),bytes:bytes.length,files:Object.keys(files).length,archives:Object.keys(archives).length,closeoutSha:hash(norm(readFileSync('tests/helpers/closeout-source-epoch.mjs','utf8')))},null,2));
