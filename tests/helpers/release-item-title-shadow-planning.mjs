// Authenticates an observed local floor; it never certifies Hosted completion.
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const hash=b=>createHash('sha256').update(b).digest('hex'),norm=b=>b.toString().replaceAll('\r\n','\n');
// npm's generated hidden lock was sampled with CRLF. Reconstruct exactly that
// text for comparison on LF hosts; every dependency payload remains byte-bound.
const dependencyBytes=(path,raw)=>path==='node_modules/.package-lock.json'
 ?Buffer.from(norm(raw).replaceAll('\n','\r\n')):raw;
export const retirementPlanningReceiptPath='docs/evidence/release-item-title-shadow-source-1116/retirement-planning-receipt.json';
const bytes=Buffer.from(norm(readFileSync(new URL('../../'+retirementPlanningReceiptPath,import.meta.url))));
assert.equal(hash(bytes),'9c1148f4042dd123b1b2e0a2be95c5dfd83c62cadb56cddd06bd252834d98a55','immutable observed local planning receipt');
export const retirementPlanningReceipt=JSON.parse(bytes);
export function assertRetirementPlanningCurrent(read=readFileSync){
 const p=retirementPlanningReceipt;
 assert.equal(hash(norm(read(retirementPlanningReceiptPath))),hash(bytes),'fresh local planning receipt');
 for(const row of p.closure){
  const content=read(row.path),text=/\.(?:mjs|js|json|lua|md|txt|yml|yaml)$/.test(row.path);
  assert.equal(hash(text?norm(content):content),text?row.lfSha256:row.sha256,'fresh retirement execution input: '+row.path);
 }
 for(const row of p.dependencies)assert.equal(hash(dependencyBytes(row.path,read(row.path))),row.sha256,'fresh retirement dependency input: '+row.path);
 const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(dir+'/'+e.name):[dir+'/'+e.name]);
 const sampledMetadata=['data/README.md','data/SOURCES.md'];
 assert.deepEqual(p.sampledMetadata.map(row=>row.path),sampledMetadata,'only the two confirmed non-executable descriptions are sample-only');
 // Keep discovery fail-closed for every other path, including newly added
 // JSON, asset or executable inputs; do not broadly ignore document suffixes.
 for(const prefix of ['src/lua/','data/'])assert.deepEqual(walk(prefix.slice(0,-1)).filter(path=>prefix==='data/'?!sampledMetadata.includes(path):path.endsWith('.lua')).sort(),p.closure.filter(r=>r.path.startsWith(prefix)).map(r=>r.path),'complete retirement execution corpus: '+prefix);
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
 const sampledInputs=[...[...p.closure,...p.sampledMetadata].sort((a,b)=>a.path<b.path?-1:a.path>b.path?1:0),...p.dependencies];
 assert.deepEqual(fresh.before.map(row=>row.path),sampledInputs.map(row=>row.path),'complete original physical observation inventory includes its sample-only metadata');
 for(const [i,row]of fresh.before.entries())assert.equal(row.sha256,sampledInputs[i].sha256,'new physical sample input binding: '+row.path);
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

export const shadowPlanningReceiptPath='docs/evidence/release-item-title-shadow-source-1116/shadow-planning-receipt.json';
const shadowBytes=Buffer.from(norm(readFileSync(new URL('../../'+shadowPlanningReceiptPath,import.meta.url))));
assert.equal(hash(shadowBytes),'bde02bd9f6f0990e608766e471d43cd012553babe49c352bffadcdd59c52f719','immutable corrected shadow complete-file planning receipt');
export const shadowPlanningReceipt=JSON.parse(shadowBytes);
export function assertShadowPlanningCurrent(read=readFileSync){
 const p=shadowPlanningReceipt;
 assert.equal(hash(norm(read(shadowPlanningReceiptPath))),hash(shadowBytes),'fresh shadow planning receipt');
 for(const row of p.closure){const b=read(row.path);assert.equal(hash(row.lfSha256?norm(b):b),row.lfSha256??row.sha256,'fresh shadow execution input: '+row.path);}
 for(const row of p.dependencies)assert.equal(hash(dependencyBytes(row.path,read(row.path))),row.sha256,'fresh shadow dependency input: '+row.path);
 const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(dir+'/'+e.name):[dir+'/'+e.name]);
 assert.deepEqual(p.sampledMetadataExcluded,['data/README.md','data/SOURCES.md']);
 for(const prefix of ['src/lua/','data/'])assert.deepEqual(walk(prefix.slice(0,-1)).filter(path=>prefix==='data/'?!p.sampledMetadataExcluded.includes(path):path.endsWith('.lua')).sort(),p.closure.filter(row=>row.path.startsWith(prefix)).map(row=>row.path),'complete shadow execution corpus: '+prefix);
 // Only this one floor is self-referential. The sampled config, including all
 // old observations and the retirement floor, remains otherwise complete.
 const current=JSON.parse(read(p.config.path,'utf8')),projected=structuredClone(current);
 delete projected.jsPlanning.localLowerBounds[p.entry];
 assert.equal(hash(JSON.stringify(projected,null,2)+'\n'),p.config.lfSha256,'complete shadow planning config except its sole new floor');
 assert.equal(hash(p.config.source),p.config.lfSha256);assert(!JSON.parse(p.config.source).jsPlanning.localLowerBounds[p.entry]);
 assert.deepEqual(current.jsPlanning.localLowerBounds[p.entry],{...p.floor,sourceReceipt:shadowPlanningReceiptPath,sourceReceiptSha256:hash(shadowBytes)},'exact new shadow floor and complete receipt binding');
 for(const [path,sha]of Object.entries(p.evidence))assert.equal(hash(read(path)),sha,'original complete shadow sample: '+path);
 const sample=JSON.parse(gunzipSync(read(p.observation.path))),inputs=[...p.closure,...p.dependencies];
 assert.deepEqual(sample.before,sample.after,'every measured shadow input remains unchanged');
 assert.deepEqual(sample.before.map(row=>row.path),[...inputs.map(row=>row.path),p.config.path],'complete measured shadow input inventory');
 for(const [i,row]of inputs.entries())assert.equal(sample.before[i].sha256,row.sha256,'physical shadow sample input: '+row.path);
 assert.equal(sample.before.at(-1).sha256,hash(p.config.source),'sampled complete original config before the one new floor');
 assert.equal(sample.freezeCommit,'c34443bcd56350fbe7a2bc9396bcdc9090d2dddb');assert.equal(sample.node,'v24.18.0');assert.equal(sample.nodeSha256,'9a4eb5f1c29c6a2e93852ead46b999e284a6a5ca8bab4d4e241d587d025a52de');
 assert.deepEqual([sample.status,sample.error,sample.signal],[0,null,null]);
 const log=gunzipSync(read(p.floor.sourceLog));assert.equal(hash(log),p.floor.sourceLogUncompressedSha256);
 assert.match(log.toString(),/ℹ tests 3\r?\nℹ suites 0\r?\nℹ pass 3\r?\nℹ fail 0\r?\nℹ cancelled 0\r?\nℹ skipped 0\r?\nℹ todo 0/);
 assert.equal(Number(/ℹ duration_ms ([\d.]+)/.exec(log.toString())[1]),p.floor.nodeReportedDurationMs);
 assert.equal(sample.wallDurationMs,p.floor.wallDurationMs);assert.equal(p.floor.durationMs,Math.max(18852,sample.wallDurationMs,Math.ceil(p.floor.nodeReportedDurationMs)),'new observation cannot lower a complete observed shadow cost');
 return p;
}

// Owner 2026-11-07: predictions are diagnostic; physical job guards are hard.
// Read the unique four-space job property, never a step-local lookalike.
export function assertReleaseItemTitleShadowPhysicalGuards(source){
 const expected={fast:"${{ matrix.os == 'windows-2025' && 45 || 30 }}",rules:"${{ inputs.runner_pool == 'local-special' && 75 || 45 }}",'engineering-posix-shards':'30'};
 for(const [name,value]of Object.entries(expected)){
  const blocks=[...norm(source).matchAll(new RegExp(`^  ${name}:\\n[\\s\\S]*?(?=^  [\\w-]+:|(?![\\s\\S]))`,'gm'))];
  assert.equal(blocks.length,1,'unique physical guard job: '+name);
  const timeouts=[...blocks[0][0].matchAll(/^    timeout-minutes: (.+)$/gm)].map(match=>match[1]);
  assert.deepEqual(timeouts,[value],'unique original physical job timeout: '+name);
 }
}
