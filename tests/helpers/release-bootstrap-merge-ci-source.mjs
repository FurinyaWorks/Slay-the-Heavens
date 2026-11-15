// CI-only outer composition. Both complete original trust packets stay immutable.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {execFileSync} from 'node:child_process';
const hash=b=>createHash('sha256').update(b).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const bytes=readFileSync(new URL('./release-bootstrap-merge-ci-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'363579362238b55eca0913ba39a107008e901ecd38112a4dc412bbc4be56b14c','complete actual Release merge CI composition');
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
export function releaseMergeArchivedGitRead(proof=packet.gitObjectProof){
 const objects=new Map();
 for(const [id,row]of Object.entries(proof)){
  assert(['commit','tree'].includes(row.type),'declared Git proof object type');
  const bytes=Buffer.from(row.base64,'base64');
  assert.equal(createHash('sha1').update(`${row.type} ${bytes.length}\0`).update(bytes).digest('hex'),id,'complete archived Git object');
  objects.set(id,{...row,bytes});
 }
 const object=(id,type)=>{const row=objects.get(id);assert.equal(row?.type,type,'required complete Git '+type+' '+id);return row.bytes;};
 const header=id=>object(id,'commit').toString('utf8').split('\n\n')[0];
 const tree=id=>{
  const bytes=object(id,'tree'),entries=[];let offset=0;
  while(offset<bytes.length){
   const space=bytes.indexOf(32,offset),nul=bytes.indexOf(0,space+1);
   assert(space>offset&&nul>space&&nul+21<=bytes.length,'complete Git tree entry');
   entries.push({mode:bytes.toString('utf8',offset,space),name:bytes.toString('utf8',space+1,nul),id:bytes.subarray(nul+1,nul+21).toString('hex')});offset=nul+21;
  }
  return entries;
 };
 const root=id=>{const match=header(id).match(/^tree ([a-f0-9]{40})$/m);assert(match,'Git commit root');return match[1];};
 const resolve=(id,path)=>{
  let row={id:root(id),mode:'40000'};
  for(const part of path.split('/')){assert.equal(row.mode,'40000');row=tree(row.id).find(entry=>entry.name===part);assert(row,'Git tree path '+path);}
  return row;
 };
 return(...args)=>{
  if(args[0]==='show'&&args[1]==='-s')return [...header(args[3]).matchAll(/^parent ([a-f0-9]{40})$/gm)].map(match=>match[1]).join(' ');
  if(args[0]==='rev-parse'&&args[1].endsWith('^{tree}'))return root(args[1].slice(0,-7));
  if(args[0]==='ls-tree'){
   const commit=args[3],rows=tree(resolve(commit,'src/lua').id).filter(row=>row.name.endsWith('.lua')).map(row=>'src/lua/'+row.name+'\t'+row.id);
   rows.push('config/architecture.json\t'+resolve(commit,'config/architecture.json').id);return rows.sort().join('\n');
  }
  if(args[0]==='rev-parse'||args[0]==='show'){
   const [commit,...parts]=args[1].split(':'),path=parts.join(':'),id=resolve(commit,path).id;
   if(args[0]==='rev-parse')return id;
   const row=packet.bootstrapGitBindings[path];assert(row,'declared complete bootstrap blob');assert.equal(id,row.gitBlob);
   assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(row.source)}\0`).update(row.source).digest('hex'),id,'Git tree authenticates complete bootstrap source');return row.source;
  }
  assert.fail('unsupported archived Git proof query');
 };
}
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
