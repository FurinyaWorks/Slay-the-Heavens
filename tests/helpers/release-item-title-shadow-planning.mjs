// Authenticates an observed local floor; it never certifies Hosted completion.
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const hash=b=>createHash('sha256').update(b).digest('hex'),norm=b=>b.toString().replaceAll('\r\n','\n');
export const retirementPlanningReceiptPath='docs/evidence/release-item-title-shadow-source-1116/retirement-planning-receipt.json';
const bytes=readFileSync(new URL('../../'+retirementPlanningReceiptPath,import.meta.url));
assert.equal(hash(bytes),'c2683273e948613338618d60755a55c2a56a164a643d7a626cc0d6926314b1b7','immutable observed local planning receipt');
export const retirementPlanningReceipt=JSON.parse(bytes);
export function assertRetirementPlanningCurrent(read=readFileSync){
 const p=retirementPlanningReceipt;
 assert.equal(hash(read(retirementPlanningReceiptPath)),hash(bytes),'fresh local planning receipt');
 for(const row of p.closure)assert.equal(hash(norm(read(row.path))),row.lfSha256,'fresh retirement execution input: '+row.path);
 for(const row of p.dependencies)assert.equal(hash(read(row.path)),row.sha256,'fresh retirement dependency input: '+row.path);
 const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(dir+'/'+e.name):[dir+'/'+e.name]);
 for(const prefix of ['src/lua/','data/'])assert.deepEqual(walk(prefix.slice(0,-1)).filter(path=>prefix==='data/'||path.endsWith('.lua')).sort(),p.closure.filter(r=>r.path.startsWith(prefix)).map(r=>r.path),'complete retirement execution corpus: '+prefix);
 for(const [path,sha]of Object.entries(p.evidence))assert.equal(hash(read(path)),sha,'original local planning evidence: '+path);
 const get=suffix=>JSON.parse(gunzipSync(read(Object.keys(p.evidence).find(path=>path.endsWith(suffix)))));
 const before=get('input-receipt-before-retirement.json.gz'),after=get('/input-receipt.json.gz');
 assert.deepEqual(before.dependencies,after.dependencies);assert.deepEqual(before.tools,after.tools);
 const b=new Map(before.inputs.map(r=>[r.path,r.sha256])),a=new Map(after.inputs.map(r=>[r.path,r.sha256]));
 assert.deepEqual([...new Set([...b.keys(),...a.keys()])].filter(path=>b.get(path)!==a.get(path)).sort(),['src/lua/abyss_battle_reward_layout.lua','tests/helpers/reward-pool-retirement-runtime.lua',p.entry].sort(),'only the three retirement inputs changed between complete receipts');
 const sampled=get(p.run.boundInputs.path);
 assert.equal(sampled.length,3);for(const row of sampled){assert.equal(hash(row.source),row.sha256);assert.equal(row.sha256,a.get(row.path),'sampled peer source matches final complete receipt');assert.equal(hash(norm(row.source)),p.closure.find(r=>r.path===row.path).lfSha256,'sampled peer LF source matches active execution');}
 const peerLogPath=Object.keys(p.evidence).find(path=>path.endsWith(p.run.stdout.path)),peerLog=gunzipSync(read(peerLogPath));
 assert.equal(hash(peerLog),p.run.stdout.rawSha256);assert.match(peerLog.toString(),/ℹ duration_ms 79767\.5945/);
 const fresh=JSON.parse(gunzipSync(read(p.freshObservation.path)));
 assert.deepEqual(fresh.before,fresh.after,'complete new executable snapshots stay unchanged throughout the fresh measurement');
 assert.deepEqual(fresh.before.map(row=>row.path),[...p.closure,...p.dependencies].map(row=>row.path),'complete fresh observation input inventory');
 for(const [i,row]of fresh.before.entries())assert.equal(row.sha256,[...p.closure,...p.dependencies][i].sha256,'new physical sample input binding: '+row.path);
 assert.equal(fresh.status,0);assert.equal(fresh.error,null);assert.equal(fresh.signal,null);assert.equal(fresh.node,'v24.18.0');
 assert.equal(fresh.nodeSha256,'9a4eb5f1c29c6a2e93852ead46b999e284a6a5ca8bab4d4e241d587d025a52de');
 const log=gunzipSync(read(p.floor.sourceLog));assert.equal(hash(log),p.floor.sourceLogUncompressedSha256);
 assert.match(log.toString(),/ℹ tests 2\r?\nℹ suites 0\r?\nℹ pass 2\r?\nℹ fail 0\r?\nℹ cancelled 0\r?\nℹ skipped 0\r?\nℹ todo 0/);
 assert.equal(Number(/ℹ duration_ms ([\d.]+)/.exec(log.toString())[1]),p.freshObservation.nodeReportedDurationMs);
 assert.equal(fresh.wallDurationMs,p.freshObservation.wallDurationMs);assert.equal(p.floor.durationMs,Math.max(79861,fresh.wallDurationMs,Math.ceil(p.freshObservation.nodeReportedDurationMs)),'new evidence cannot lower an observed planning floor');
 assert.equal(p.run.status,0);assert.equal(p.run.error,null);assert.equal(p.run.signal,null);
 assert.equal(Date.parse(p.run.finishedAt)-Date.parse(p.run.startedAt),79861);assert.equal(p.node.version,'v24.18.0');
 const timings=JSON.parse(read('scripts/ci-test-timings.json','utf8'));
 assert.deepEqual(timings.jsPlanning.localLowerBounds[p.entry],{...p.floor,sourceReceipt:retirementPlanningReceiptPath,sourceReceiptSha256:hash(bytes)},'exact observed floor uses original planning mechanism');
 return p;
}
