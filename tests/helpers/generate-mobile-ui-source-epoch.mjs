import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {mobileUiBase,mobileUiProducers} from './mobile-ui-source-plan.mjs';
const mode=process.argv[2]??'--check';assert(['--check','--write'].includes(mode));
const hash=s=>createHash('sha256').update(s).digest('hex');
const git=(...args)=>execFileSync('git',args,{maxBuffer:4*1024*1024});
const binding=(commit,path)=>{
 const raw=git('show',commit+':'+path),source=raw.toString();assert(!source.includes('\r'),'original Git owner must already be LF');
 const gitBlob=git('rev-parse',commit+':'+path).toString().trim();
 assert.equal(createHash('sha1').update(`blob ${raw.length}\0`).update(raw).digest('hex'),gitBlob);
 return {source,sha256:hash(raw),gitBlob};
};
const oldPacket='tests/helpers/session-menu-source-epoch.json.gz';
const prior=git('show',mobileUiBase+':'+oldPacket);
assert.equal(hash(prior),'bba0ec427b8c036d15149cfff4800f3559f6dbf2f282e22368e30afdc3805665');
assert.deepEqual(readFileSync(oldPacket),prior,'all original menu/mobile/Neow layers remain physically unchanged');
const groups=mobileUiProducers.map(plan=>{
 assert.equal(git('rev-parse',plan.commit+'^').toString().trim(),plan.parent,'real independent producer parent');
 const before={},current={};
 for(const path of plan.paths){
  before[path]=binding(plan.parent,path);current[path]=binding(plan.commit,path);
  assert.deepEqual(before[path],binding(mobileUiBase,path),'producer parent matches complete original P0 current owner');
  assert.notEqual(before[path].sha256,current[path].sha256,'actual product change');
  assert.equal(readFileSync(path,'utf8').replaceAll('\r\n','\n'),current[path].source,'live owner equals independent producer');
 }
 return {name:plan.name,producerCommit:plan.commit,parentCommit:plan.parent,before,current};
});
const packet={schemaVersion:1,normalization:'LF',baseCommit:mobileUiBase,
 priorSessionPacketSha256:hash(prior),groups};
const bytes=gzipSync(JSON.stringify(packet));bytes[9]=10;
const path='tests/helpers/mobile-ui-source-epoch.json.gz';
if(mode==='--write')writeFileSync(path,bytes);else assert.deepEqual(readFileSync(path),bytes,'fresh seven-owner mobile UI continuation');
console.log(JSON.stringify({owners:7,producers:groups.length,sha256:hash(bytes),bytes:bytes.length}));
