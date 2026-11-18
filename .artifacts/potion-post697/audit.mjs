import assert from 'node:assert/strict';
import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {sourceEpoch,prePotionPost697SourceEpoch,releaseSelectionMapLegacyEpoch} from '../../tests/helpers/closeout-source-epoch.mjs';
import {potionPost697CiPacket as ci,assertPotionPost697CiCurrent} from '../../tests/helpers/potion-post697-ci-source.mjs';
import {potionPost697SourcePacket as production} from '../../tests/helpers/potion-post697-source.mjs';
import {discoverJs} from '../../scripts/ci-shards.mjs';
const git=(...args)=>execFileSync('git',['-c','core.commitGraph=false',...args],{maxBuffer:32*1024*1024});
const sha=b=>createHash('sha256').update(b).digest('hex');
const norm=b=>b.toString('utf8').replaceAll('\r\n','\n');
function objects(keys){
 const raw=execFileSync('git',['cat-file','--batch'],{input:keys.join('\n')+'\n',maxBuffer:64*1024*1024});
 const out=new Map();let pos=0;
 for(const key of keys){const end=raw.indexOf(10,pos),header=raw.subarray(pos,end).toString(),size=Number(header.split(' ')[2]);assert(Number.isInteger(size),key+': '+header);pos=end+1;out.set(key,raw.subarray(pos,pos+size));pos+=size+1;}
 assert.equal(pos,raw.length);return out;
}
const rows=[];
for(const [name,epoch]of [['potion',prePotionPost697SourceEpoch],['selection',releaseSelectionMapLegacyEpoch]])
 for(const [path,row]of Object.entries(epoch.proof.current))if(row)rows.push({key:ci.viewCommits[name]+':'+path,row});
for(const [path,row]of Object.entries(ci.files))for(const [name,view]of Object.entries(row.views))if(view)rows.push({key:ci.viewCommits[name]+':'+path,row:view});
for(const [path,row]of Object.entries(production.current))rows.push({key:production.currentCommit+':'+path,row});
const keys=[...new Set(rows.map(r=>r.key))],bytes=objects(keys);
for(const {key,row}of rows)assert.equal(norm(bytes.get(key)),row.source,key);
for(const [path,row]of Object.entries(sourceEpoch.proof.current))if(row)assert.equal(norm(readFileSync(path)),row.source,path);
assertPotionPost697CiCurrent();
for(const kind of ['js','lua']){
 const current=kind==='js'?discoverJs():readdirSync('tests/lua').filter(n=>n.endsWith('.lua')).map(n=>'tests/lua/'+n);
 assert.deepEqual(current.sort(),ci.currentInventory[kind]);
}
const runtime={};
for(const [commit,paths]of [[production.baseCommit,Object.keys(production.inheritedPotion)],[production.selectionCommit,Object.keys(production.current)]])for(const path of paths){
 const expected=git('rev-parse',commit+':'+path).toString().trim();assert.equal(git('rev-parse','HEAD:'+path).toString().trim(),expected);runtime[path]={commit,blob:expected};
}
const inventories=Object.fromEntries(Object.entries(ci.viewCommits).map(([name,commit])=>[name,new Set(git('ls-tree','-r','--name-only',commit).toString().trim().split('\n'))]));
const archives=[];
for(const [path,digest]of Object.entries(ci.immutableArchives)){
 const name=Object.keys(inventories).find(name=>inventories[name].has(path));
 if(!name){assert.equal(path,'tests/helpers/potion-post697-source.json.gz');continue;}
 const old=git('show',ci.viewCommits[name]+':'+path),pointer=old.toString().match(/^version https:\/\/git-lfs.github.com\/spec\/v1\noid sha256:([a-f0-9]{64})\nsize (\d+)\n$/);
 assert.equal(pointer?pointer[1]:sha(old),digest,'unchanged archive Git bytes: '+path);
 if(pointer)assert.equal(readFileSync(path).length,Number(pointer[2]));
 archives.push({path,sha256:digest});
}
const report={head:git('rev-parse','HEAD').toString().trim(),base:production.selectionCommit,productCommit:production.currentCommit,productionGitObjects:keys.length,productionCurrent:Object.values(sourceEpoch.proof.current).filter(Boolean).length,owners:sourceEpoch.proof.owners.length,legacyOwners:releaseSelectionMapLegacyEpoch.proof.owners.length,newOwners:sourceEpoch.proof.owners.filter(p=>!prePotionPost697SourceEpoch.proof.owners.includes(p)),bindings:Object.keys(ci.files).length,archives:Object.keys(ci.immutableArchives).length,oldArchivesUnchanged:archives.length,raw:Object.fromEntries(Object.entries(ci.currentInventory).map(([k,v])=>[k,v.length])),runtime,packetSha256:sha(readFileSync('tests/helpers/potion-post697-ci-source.json.gz'))};
writeFileSync('.artifacts/potion-post697/audit.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
