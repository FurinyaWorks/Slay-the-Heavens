import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {discoverJs} from '../../../scripts/ci-shards.mjs';
const base='1cc5479b713edab6fd26db4e20f8eb22b7401cb2';
const git=args=>execFileSync('git',args,{encoding:'utf8',maxBuffer:16*1024*1024}).trimEnd();
const hash=b=>createHash('sha256').update(b).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const bind=s=>({source:s,sha256:hash(s),gitBlob:createHash('sha1').update(`blob ${Buffer.byteLength(s)}\0`).update(s).digest('hex')});
const prior=p=>{try{return bind(norm(execFileSync('git',['show',base+':'+p],{encoding:'utf8',stdio:['ignore','pipe','ignore']})));}catch{return null;}};
const currentCommit=git(['rev-parse','b48acb5a']);
function output(name,packet){
 const path='tests/helpers/'+name+'.json.gz',bytes=gzipSync(JSON.stringify(packet),{level:9});
 if(process.argv.includes('--check'))assert(readFileSync(path).equals(bytes),'exact recapture: '+path);
 else writeFileSync(path,bytes);
 console.log(JSON.stringify({path,bytes:bytes.length,sha256:hash(bytes)}));
}
if(process.argv[2]==='production'){
 const path='src/lua/abyss_battle_reward_layout.lua',current=bind(norm(readFileSync(path,'utf8')));
 assert.equal(current.gitBlob,git(['rev-parse','23bed75c:'+path]));
 output('blue-candle-source',{schemaVersion:1,normalization:'LF',baseCommit:base,currentCommit,
  producerCommit:'23bed75c642f8f4af5c2783526a5afc4a57f471f',before:{[path]:prior(path)},current:{[path]:current}});
 for(const p of ['tests/helpers/closeout-source-epoch.mjs','tests/helpers/blue-candle-source.mjs'])console.log(JSON.stringify({path:p,sha256:hash(norm(readFileSync(p,'utf8')))}));
}else if(process.argv[2]==='ci'){
 const changed=new Set([...git(['diff','--name-only',base]).split('\n'),...git(['ls-files','--others','--exclude-standard','tests']).split('\n')]);
 const files={};
 for(const p of [...changed].sort())if(/^(scripts|src|tests|config|\.github)\//.test(p)&&/\.(mjs|lua|json|yml|yaml)$/.test(p)&&p!=='tests/helpers/blue-candle-ci-source.mjs')
  files[p]={before:prior(p),current:bind(norm(readFileSync(p,'utf8')))};
 const immutableArchives={};
 for(const p of git(['ls-tree','-r','--name-only',base,'tests/helpers']).split('\n').filter(p=>p.endsWith('.gz'))){
  const old=execFileSync('git',['show',base+':'+p],{maxBuffer:16*1024*1024}),bytes=readFileSync(p);
  const lfs=old.toString().match(/^version https:\/\/git-lfs.github.com\/spec\/v1\noid sha256:([a-f0-9]{64})\nsize (\d+)\n$/);
  if(lfs){assert.equal(hash(bytes),lfs[1],'retained LFS old packet: '+p);assert.equal(bytes.length,Number(lfs[2]));}
  else assert(bytes.equals(old),'retained old packet: '+p);
  immutableArchives[p]=hash(bytes);
 }
 immutableArchives['tests/helpers/blue-candle-source.json.gz']=hash(readFileSync('tests/helpers/blue-candle-source.json.gz'));
 const priorInventory={
  js:git(['ls-tree','--name-only',base+':tests']).split('\n').filter(p=>p.endsWith('.test.mjs')).map(p=>'tests/'+p).sort(),
  lua:git(['ls-tree','--name-only',base+':tests/lua']).split('\n').filter(p=>p.endsWith('.lua')).map(p=>'tests/lua/'+p).sort()};
 const currentInventory={js:discoverJs(),lua:readdirSync('tests/lua').filter(p=>p.endsWith('.lua')).map(p=>'tests/lua/'+p).sort()};
 output('blue-candle-ci-source',{schemaVersion:1,normalization:'LF',baseCommit:base,currentCommit,currentTreeCommitted:false,files,immutableArchives,priorInventory,currentInventory});
 console.log(JSON.stringify({paths:Object.keys(files),archives:Object.keys(immutableArchives).length,inventory:Object.fromEntries(Object.entries(currentInventory).map(([k,v])=>[k,v.length]))}));
}else throw Error('Use production or ci [--check]');
