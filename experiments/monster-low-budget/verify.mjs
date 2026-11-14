// Verify saved experiment identities and boundaries, not fresh execution or device quality.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const out=path.resolve(process.argv[2]??'build/monster-low-budget');
const read=p=>JSON.parse(fs.readFileSync(p)),sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const fit=read(path.join(out,'fit-receipt.json')),runtime=read(path.join(out,'runtime-receipt.json'));
const switching=read(path.join(out,'switch-receipt.json'));
const comparison=read(path.join(out,'comparison-receipt.json'));
assert.equal(comparison.compareScriptSha256,sha('experiments/monster-low-budget/compare.py'));
assert.equal(comparison.pngSha256,sha(path.join(out,'comparison.png')));
for(const input of comparison.inputs){
 assert.equal(input.sourceSha256,fit.samples.find(s=>s.enemy===input.enemy).sourceSha256);
 assert.equal(input.runtimePngSha256,sha(path.join(out,input.enemy,'native-runtime.png')));
}
assert.equal(runtime.status,'pass');assert.equal(runtime.fitReceiptSha256,sha(path.join(out,'fit-receipt.json')));
assert.equal(runtime.runtimeScriptSha256,sha('experiments/monster-low-budget/runtime.mjs'));
assert.equal(fit.fitterSha256,sha('scripts/art/segment-lowpoly.py'));
assert.equal(fit.placementSha256,sha('scripts/art/native-triangle-placement.py'));
assert.equal(fit.fitScriptSha256,sha('experiments/monster-low-budget/fit.py'));
assert.equal(runtime.geometrySourceSha256,sha('src/lua/abyss_battle_enemy_view.lua'));
for(const input of runtime.sourceInputs)assert.equal(input.sha256,sha(input.path),'Runtime construction source changed');
assert.equal(switching.status,'pass');assert.equal(switching.remainingControls,0);
assert.equal(switching.luaSha256,sha('experiments/monster-low-budget/switch.lua'));
assert.equal(switching.driverSha256,sha('experiments/monster-low-budget/switch.mjs'));
assert.equal(switching.surfaceTemplatesCreated,3);assert.equal(switching.surfaceTemplatesDestroyed,3);
assert.equal(switching.sameIdentityReuses,1);assert.equal(switching.staleCallbacksRejected,3);
assert.equal(switching.cancelledCreationAllocated,0);assert(switching.reusedHost);
for(const record of switching.sampleSaves)assert.equal(record.sha256,sha(path.join(out,record.enemy,'sample.save.json')));
assert.equal(runtime.officialCapacity,'UNVERIFIED');assert.equal(runtime.pcAndMobile,'UNVERIFIED');
assert.deepEqual(runtime.samples.map(s=>s.enemy),['jaw_worm','hexaghost']);
for(const sample of runtime.samples){
 const source=fit.samples.find(s=>s.enemy===sample.enemy);assert(source);
 assert.equal(source.sourceReview,'PASS_SOURCE_CANDIDATE_ONLY');
 assert.equal(source.sourceApprovals.owner,false);assert.equal(source.sourceApprovals.device,false);
 assert.equal(sample.remainingControls,0);assert.equal(sample.reuseAllocated,0);assert.equal(sample.reuseCycles,5);
 assert.equal(sample.inputs.length,4);assert(sample.inputs.every(i=>i.passed));
 assert.equal(sample.pngSha256,sha(path.join(out,sample.enemy,'native-runtime.png')));
 assert.deepEqual(sample.costs.map(c=>c.budget),[100,200,400]);
 for(const cost of sample.costs){
  const file=path.join(out,sample.enemy,`budget-${cost.budget}.json`),pack=read(file);
  assert.equal(cost.packSha256,sha(file),'Runtime was not generated from this pack');
  assert.equal(pack.sourceSha256,source.sourceSha256);assert.equal(pack.opaqueBackground,false);
  const actual=pack.shapes.reduce((sum,s)=>sum+(s.type==='polygon'?2:1),0);
  assert.equal(actual,cost.drawImages);assert(actual>0&&actual<=cost.budget);
  assert.equal(cost.fiveActorDrawingImages,actual*5);
  assert.equal(cost.fiveActorActualControls,2+5*(actual+cost.batchContainers+1+4));
  assert.equal(cost.fiveActorRemaining,0);
 }
}
console.log('PASS: six packs, actual image/whole-scene counts, source identities, 8 hits, same-host replacement/cancel, stale callbacks and zero cleanup residue');
