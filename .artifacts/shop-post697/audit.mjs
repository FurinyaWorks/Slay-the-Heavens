import assert from 'node:assert/strict';
import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {sourceEpoch,preShopPost697SourceEpoch} from '../../tests/helpers/closeout-source-epoch.mjs';
import {shopPost697CiPacket as ci,assertShopPost697CiCurrent} from '../../tests/helpers/shop-post697-ci-source.mjs';
import {shopPost697SourcePacket as p} from '../../tests/helpers/shop-post697-source.mjs';
import {discoverJs} from '../../scripts/ci-shards.mjs';
const git=(...a)=>execFileSync('git',a,{maxBuffer:32*1024*1024});
const sha=b=>createHash('sha256').update(b).digest('hex');
const norm=b=>b.toString('utf8').replaceAll('\r\n','\n');
const rows=[];
for(const [commit,files]of [[p.currentCommit,sourceEpoch.proof.current],[p.baseCommit,preShopPost697SourceEpoch.proof.current],[p.shopCommit,sourceEpoch.proof.targets.shopBeforeMap.files]])for(const [path,row]of Object.entries(files))if(row)rows.push({key:commit+':'+path,row});
for(const [path,row]of Object.entries(ci.files))for(const [name,view]of Object.entries(row.views))if(view)rows.push({key:ci.viewCommits[name]+':'+path,row:view});
const keys=[...new Set(rows.map(r=>r.key))];
const raw=execFileSync('git',['cat-file','--batch'],{input:keys.join('\n')+'\n',maxBuffer:64*1024*1024});let at=0;const objects=new Map();
for(const key of keys){const end=raw.indexOf(10,at),header=raw.subarray(at,end).toString(),size=Number(header.split(' ')[2]);assert(Number.isInteger(size),key+': '+header);at=end+1;objects.set(key,raw.subarray(at,at+size));at+=size+1;}
assert.equal(at,raw.length);
for(const {key,row}of rows)assert.equal(norm(objects.get(key)),row.source,key);
for(const [path,row]of Object.entries(sourceEpoch.proof.current))if(row)assert.equal(norm(readFileSync(path)),row.source,path);
assertShopPost697CiCurrent();
for(const kind of ['js','lua'])assert.deepEqual((kind==='js'?discoverJs():readdirSync('tests/lua').filter(n=>n.endsWith('.lua')).map(n=>'tests/lua/'+n)).sort(),ci.currentInventory[kind]);
const inventories=Object.fromEntries(Object.entries(ci.viewCommits).map(([name,commit])=>[name,new Set(git('ls-tree','-r','--name-only',commit).toString().trim().split('\n'))]));
let oldArchives=0;
for(const [path,digest]of Object.entries(ci.immutableArchives)){
 const name=Object.keys(inventories).find(name=>inventories[name].has(path));
 if(!name){assert.equal(path,'tests/helpers/shop-post697-source.json.gz');continue;}
 const bytes=git('show',ci.viewCommits[name]+':'+path),pointer=bytes.toString().match(/^version https:\/\/git-lfs.github.com\/spec\/v1\noid sha256:([a-f0-9]{64})\nsize (\d+)\n$/);
 assert.equal(pointer?pointer[1]:sha(bytes),digest,'original archive Git bytes: '+path);
 if(pointer)assert.equal(readFileSync(path).length,Number(pointer[2]));oldArchives++;
}
const kept={};
for(const [commit,paths]of [[p.shopCommit,['src/lua/abyss_node_ui_input.lua','src/lua/abyss_shop_selection.lua','scripts/node-ui-layout.mjs','tests/node-ui-layout.test.mjs','tests/shop-dismiss.test.mjs','tests/lua/shop_dismiss.lua','docs/backlog-details/TASK-38.6-SHOP-DISMISS-20261115.md']],[p.baseCommit,['src/lua/abyss_game_ui_input.lua','src/lua/abyss_game_ui_view.lua']]])for(const path of paths){
 const blob=git('rev-parse',commit+':'+path).toString().trim();assert.equal(git('rev-parse','HEAD:'+path).toString().trim(),blob,path);kept[path]={commit,blob};
}
const architecture=JSON.parse(readFileSync('config/architecture.json','utf8'));
for(const path of Object.keys(p.current))assert.equal(architecture.layers[path.split('/').at(-1).slice(0,-4)],'ui');
const report={head:git('rev-parse','HEAD').toString().trim(),base:p.baseCommit,original:p.shopCommit,product:p.currentCommit,gitObjects:keys.length,production:352,currentOwners:sourceEpoch.proof.owners.length,legacyReleaseOwners:preShopPost697SourceEpoch.proof.owners.length,newOwners:sourceEpoch.proof.owners.filter(path=>!preShopPost697SourceEpoch.proof.owners.includes(path)),bindings:Object.keys(ci.files).length,archives:Object.keys(ci.immutableArchives).length,oldArchivesUnchanged:oldArchives,raw:Object.fromEntries(Object.entries(ci.currentInventory).map(([k,v])=>[k,v.length])),kept,packetSha256:sha(readFileSync('tests/helpers/shop-post697-ci-source.json.gz'))};
writeFileSync('.artifacts/shop-post697/audit.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
