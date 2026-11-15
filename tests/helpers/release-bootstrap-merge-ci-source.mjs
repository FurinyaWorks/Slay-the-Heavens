// CI-only outer composition. Both complete original trust packets stay immutable.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {execFileSync} from 'node:child_process';
const hash=b=>createHash('sha256').update(b).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const bytes=readFileSync(new URL('./release-bootstrap-merge-ci-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'1656049e4539b353628590e920a0bbb76fab2a23651caf0037aaf981fcc629a9','complete actual Release merge CI composition');
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
export const releaseMergeCiPacket=freeze(JSON.parse(gunzipSync(bytes)));
const packet=releaseMergeCiPacket;
assert.equal(packet.schemaVersion,1);assert.equal(packet.normalization,'LF');
assert.equal(packet.releaseCommit,'1cc5479b713edab6fd26db4e20f8eb22b7401cb2');
assert.equal(packet.releaseParent,'36b9b157ee6f05b65eb9f1da7e2978647d36c210');
assert.equal(packet.currentTreeCommitted,false,'composition current is a complete worktree capture');
for(const [path,row]of Object.entries(packet.files))for(const binding of [row.current,row.slicePrior,row.bootstrapView].filter(Boolean)){
 assert.equal(binding.source,norm(binding.source),path);assert.equal(hash(binding.source),binding.sha256,path);
 assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(binding.source)}\0`).update(binding.source).digest('hex'),binding.gitBlob,path);
}
export function assertReleaseMergeCurrent(read=readFileSync){
 for(const [path,row]of Object.entries(packet.files))
  assert.equal(hash(norm(read(path,'utf8'))),row.current.sha256,'fresh complete integration source: actual Release merge '+path);
 for(const [path,expected]of Object.entries(packet.immutableArchives))
  assert.equal(hash(read(path)),expected,'retained actual Release merge archive: '+path);
}
export function releaseMergeSource(path,source,target,read=readFileSync){
 assert(['slicePrior','bootstrapView'].includes(target),'known actual Release merge view');
 if(path.startsWith('src/')||path==='config/architecture.json')return source;
 const row=Object.hasOwn(packet.files,path)?packet.files[path]:null;
 if(!row?.[target]||typeof source!=='string'||source.includes('\r\r\n')||hash(norm(source))!==row.current.sha256)return source;
 // Authenticate the complete live composition afresh, never a retained after cache.
 assertReleaseMergeCurrent(read);
 return row[target].source;
}
export function releaseMergeRead(target,read=readFileSync){return(path,encoding)=>{
 const raw=read(path,encoding),row=Object.hasOwn(packet.files,path)?packet.files[path]:null;
 if(!row)return raw;
 const text=typeof raw==='string'?raw:raw.toString('utf8'),prior=releaseMergeSource(path,text,target,read);
 return typeof raw==='string'?prior:prior===text?raw:Buffer.from(prior);
};}
// Explicit Git authentication bridges identical production bases without
// relabelling any original product producer, before binding or target metadata.
export function assertReleaseMergeGitProvenance(git=(...args)=>execFileSync('git',args,{maxBuffer:32*1024*1024}).toString('utf8')){
 assert.equal(git('show','-s','--format=%P',packet.releaseCommit).trim(),packet.releaseParent,'actual Release single parent');
 assert.equal(git('rev-parse',packet.releaseCommit+'^{tree}').trim(),packet.releaseTree,'actual Release tree');
 assert.equal(git('rev-parse',packet.bootstrapProducer+'^{tree}').trim(),packet.releaseTree,'actual squash equals reviewed bootstrap tree');
 const corpus=commit=>git('ls-tree','-r','--format=%(path)\t%(objectname)',commit,'--','src/lua','config/architecture.json').trim().split('\n')
  .filter(line=>/\.lua\t|^config\/architecture\.json\t/.test(line)).sort();
 assert.deepEqual(corpus(packet.releaseParent),packet.productionBaseBlobs,'complete prior production Git blobs');
 assert.deepEqual(corpus(packet.releaseCommit),packet.productionBaseBlobs,'complete actual Release production Git blobs');
 for(const [path,row]of Object.entries(packet.bootstrapGitBindings)){
  const source=norm(git('show',packet.releaseCommit+':'+path));
  assert.equal(hash(source),row.sha256,'actual Release Git binding: '+path);
  assert.equal(git('rev-parse',packet.releaseCommit+':'+path).trim(),row.gitBlob,'actual Release Git blob: '+path);
 }
}
