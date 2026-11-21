// Exact predecessor view for historical receipts; live builds keep current sources.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {exactSourceContinuation} from './exact-source-continuation.mjs';
const hash=s=>createHash('sha256').update(s).digest('hex');
const bytes=readFileSync(new URL('../fixtures/combat-visual-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'445e065c6a996a736d1e3a5445702e0d4eb407a4ffa9aa5a393b8a285a137eda');
const packet=JSON.parse(gunzipSync(bytes));
assert.equal(packet.base,'1a60a09704ec8e0699cb2a705721b623545a5f09');
const rows=packet.files,continuations=new Map();
for(const [path,row]of Object.entries(rows)){
 assert.equal(path,row.path);assert.equal(hash(row.before.source),row.before.sha256);
 assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(row.before.source)}\0${row.before.source}`).digest('hex'),row.before.gitBlob);
 continuations.set(path,exactSourceContinuation(row));
}
export function beforeCombatVisualSource(path,source,read=p=>readFileSync(p,'utf8')){
 return continuations.get(path)?.predecessor(path,source,read)??source;
}
export function combatVisualPriorRead(read=readFileSync){return(path,encoding)=>{
 const raw=read(path,encoding);if(typeof raw!=='string'&&!Buffer.isBuffer(raw))return raw;
 const text=typeof raw==='string'?raw:raw.toString('utf8');
 const prior=beforeCombatVisualSource(path,text,owner=>read(owner,'utf8'));
 return typeof raw==='string'?prior:prior===text?raw:Buffer.from(prior);
};}

export function assertCombatVisualCurrent(path,source,read=p=>readFileSync(p,'utf8')){
 if(!continuations.has(path))return;
 assert.notEqual(beforeCombatVisualSource(path,source,read),source,'fresh combat visual source: '+path);
}
