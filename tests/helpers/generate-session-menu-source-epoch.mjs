// Append only the reviewed deck notification continuation to the frozen menu witness.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {gzipSync,gunzipSync} from 'node:zlib';
import {assertOriginalSessionMenuWitness,assertNavigationRetirementPredecessor,assertNeowStaticPredecessor} from './session-menu-source-epoch.mjs';
const mode=process.argv[2]??'--check';assert(['--check','--write'].includes(mode));
const path='tests/helpers/session-menu-source-epoch.json.gz';
const hash=s=>createHash('sha256').update(s).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const binding=source=>({source,sha256:hash(source),gitBlob:createHash('sha1').update(`blob ${Buffer.byteLength(source)}\0`).update(source).digest('hex')});
const packet=JSON.parse(gunzipSync(readFileSync(path)));assertNeowStaticPredecessor(packet);
const {neowRetirementStaticContinuation,...retirementPacket}=packet;
assertNavigationRetirementPredecessor(retirementPacket);
const {neowRetirementContinuation,...priorPacket}=retirementPacket;
const patch={...priorPacket};delete patch.continuation;
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
assert.deepEqual(patch,priorPacket,'complete immutable prior navigation packet');
const retiredPath='src/lua/abyss_node_ui_feedback.lua';
const retiredBase='808a310cfc9a0c2734ec424d7ac80d3a040557c8',retiredCommit='b1c2cb0f1f0a15524c3c57734cc7efbc10ac319a';
const retiredBefore=binding(norm(execFileSync('git',['show',retiredBase+':'+retiredPath],{encoding:'utf8'})));
const retiredCurrent=binding(norm(execFileSync('git',['show',retiredCommit+':'+retiredPath],{encoding:'utf8'})));
assert.notEqual(retiredBefore.sha256,retiredCurrent.sha256,'changed real Neow retirement source');
patch.neowRetirementContinuation={schemaVersion:1,baseCommit:retiredBase,currentCommit:retiredCommit,
 before:{[retiredPath]:retiredBefore},current:{[retiredPath]:retiredCurrent}};
assert.deepEqual(patch,retirementPacket,'complete immutable original Neow fix packet');
const staticCommit='9783f9ed4fdf021270668b66c863b9dfeebc7150';
const staticCurrent=binding(norm(execFileSync('git',['show',staticCommit+':'+retiredPath],{encoding:'utf8'})));
assert.notEqual(staticCurrent.sha256,retiredCurrent.sha256,'changed actual optional-flow helper bytes');
assert.equal(norm(readFileSync(retiredPath,'utf8')),staticCurrent.source,'exact current optional-flow helper source');
patch.neowRetirementStaticContinuation={schemaVersion:1,baseCommit:retiredCommit,currentCommit:staticCommit,
 before:{[retiredPath]:retiredCurrent},current:{[retiredPath]:staticCurrent}};
const bytes=gzipSync(JSON.stringify(patch));
bytes[9]=10; // Preserve the exact already reviewed Windows archive on POSIX.
if(mode==='--write')writeFileSync(path,bytes);else assert.deepEqual(readFileSync(path),bytes,'fresh session menu continuation');
console.log(JSON.stringify({paths:paths.length,sha256:hash(bytes)}));
