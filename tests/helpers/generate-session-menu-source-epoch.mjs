// Append the exact committed mobile slice without changing either prior witness.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {gzipSync,gunzipSync} from 'node:zlib';
import {assertOriginalSessionMenuWitness,assertPriorSessionMenuWitness} from './session-menu-source-epoch.mjs';
const mode=process.argv[2]??'--check';assert(['--check','--write'].includes(mode));
const path='tests/helpers/session-menu-source-epoch.json.gz';
const hash=s=>createHash('sha256').update(s).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const binding=source=>({source,sha256:hash(source),gitBlob:createHash('sha1').update(`blob ${Buffer.byteLength(source)}\0`).update(source).digest('hex')});
const packet=JSON.parse(gunzipSync(readFileSync(path)));assertPriorSessionMenuWitness(packet);
const {mobileContinuation,...priorPacket}=packet;
const patch={...priorPacket};delete patch.continuation;
assertOriginalSessionMenuWitness(patch);
const currentCommit='aa2060671da1bfd5b7151c48ae8babf7b38d5640';
const paths=['src/lua/abyss_game_ui.lua','src/lua/abyss_game_ui_view.lua'];
const before={},current={};
for(const p of paths){
 before[p]=patch.current[p];assert(before[p],'registered menu owner: '+p);
 current[p]=binding(norm(execFileSync('git',['show',currentCommit+':'+p],{encoding:'utf8'})));
 assert.notEqual(current[p].sha256,before[p].sha256,'changed reviewed source: '+p);
}
patch.continuation={schemaVersion:1,baseCommit:patch.menuCommit,currentCommit,before,current};
assert.deepEqual(patch,priorPacket,'complete immutable deck notification packet');
const mobileCommit='ca103dedb636ad064951c33f207a01bad93bbef8';
const mobilePaths=['src/lua/abyss_ui.lua','src/lua/abyss_game_ui_input.lua','src/lua/abyss_game_ui_view.lua'];
const mobileBefore={},mobileCurrent={};
for(const p of mobilePaths){
 mobileBefore[p]=binding(norm(execFileSync('git',['show',currentCommit+':'+p],{encoding:'utf8'})));
 mobileCurrent[p]=binding(norm(execFileSync('git',['show',mobileCommit+':'+p],{encoding:'utf8'})));
 assert.notEqual(mobileCurrent[p].sha256,mobileBefore[p].sha256,'changed committed mobile source: '+p);
}
patch.mobileContinuation={schemaVersion:1,baseCommit:currentCommit,currentCommit:mobileCommit,before:mobileBefore,current:mobileCurrent};
for(const [p,row]of Object.entries({...current,...mobileCurrent}))assert.equal(norm(readFileSync(p,'utf8')),row.source,'exact current continuation: '+p);
const bytes=gzipSync(JSON.stringify(patch));
bytes[9]=10; // Preserve the exact already reviewed Windows archive on POSIX.
if(mode==='--write')writeFileSync(path,bytes);else assert.deepEqual(readFileSync(path),bytes,'fresh session menu continuation');
console.log(JSON.stringify({paths:mobilePaths.length,currentCommit:mobileCommit,sha256:hash(bytes)}));
