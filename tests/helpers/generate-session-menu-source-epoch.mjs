// Append only the reviewed deck notification continuation to the frozen menu witness.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {gzipSync,gunzipSync} from 'node:zlib';
import {assertOriginalSessionMenuWitness} from './session-menu-source-epoch.mjs';
const mode=process.argv[2]??'--check';assert(['--check','--write'].includes(mode));
const path='tests/helpers/session-menu-source-epoch.json.gz';
const hash=s=>createHash('sha256').update(s).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const binding=source=>({source,sha256:hash(source),gitBlob:createHash('sha1').update(`blob ${Buffer.byteLength(source)}\0`).update(source).digest('hex')});
const patch=JSON.parse(gunzipSync(readFileSync(path)));delete patch.continuation;
assertOriginalSessionMenuWitness(patch);
const currentCommit='aa2060671da1bfd5b7151c48ae8babf7b38d5640';
const paths=['src/lua/abyss_game_ui.lua','src/lua/abyss_game_ui_view.lua'];
const before={},current={};
for(const p of paths){
 before[p]=patch.current[p];assert(before[p],'registered menu owner: '+p);
 current[p]=binding(norm(execFileSync('git',['show',currentCommit+':'+p],{encoding:'utf8'})));
 assert.notEqual(current[p].sha256,before[p].sha256,'changed reviewed source: '+p);
 assert.equal(norm(readFileSync(p,'utf8')),current[p].source,'exact current continuation: '+p);
}
patch.continuation={schemaVersion:1,baseCommit:patch.menuCommit,currentCommit,before,current};
const bytes=gzipSync(JSON.stringify(patch));
bytes[9]=10; // Preserve the exact already reviewed Windows archive on POSIX.
if(mode==='--write')writeFileSync(path,bytes);else assert.deepEqual(readFileSync(path),bytes,'fresh session menu continuation');
console.log(JSON.stringify({paths:paths.length,sha256:hash(bytes)}));
