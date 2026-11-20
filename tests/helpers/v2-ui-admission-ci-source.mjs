import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';

const sha256 = value => createHash('sha256').update(value).digest('hex');
const bytes = readFileSync(new URL('../fixtures/v2-ui-admission-ci-source.json.gz', import.meta.url));
assert.equal(sha256(bytes),'f68bb9c5d353afd9b05cac08179d049dd42518680bb4469e4dcf202b58b39af4','historical UI admission source identities');
const archive = JSON.parse(gunzipSync(bytes));
for (const row of Object.values(archive)) {
  if (row.before) assert.equal(sha256(row.before),row.beforeSha256);
  if (row.openingStatue) assert.equal(sha256(row.openingStatue.before),row.openingStatue.beforeSha256);
  if (row.successor?.before) assert.equal(sha256(row.successor.before),row.successor.beforeSha256);
}

const recoveryBytes = readFileSync(new URL('../fixtures/v2-ui-source-recovery.json.gz', import.meta.url));
assert.equal(sha256(recoveryBytes),'f2cf2fa19f205f66cfef861692b9d6574aab970682ba8ba9e2f501d70cf8b769','v2 UI recovery source identities');
const recovery = JSON.parse(gunzipSync(recoveryBytes));
assert.equal(recovery.base,'eaf4a4a50640697f4c497fe116db94c1ed69a10d');
for (const row of Object.values(recovery.files)) assert.equal(sha256(row.before),row.beforeSha256);

const potionNeutralBytes = readFileSync(new URL('../fixtures/potion-neutral-ci-source.json.gz', import.meta.url));
assert.equal(sha256(potionNeutralBytes),'5d426a0f966cb3bcff547e78d498cf41608e56cea0aa99530f28924cb72c0b66','potion neutral CI predecessor identity');
const potionNeutral = JSON.parse(gunzipSync(potionNeutralBytes));
for (const row of Object.values(potionNeutral)) {
  assert.equal(sha256(row.before),row.beforeSha256);
  assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(row.before)}\0`).update(row.before).digest('hex'),row.beforeGitBlob);
}

const potionPointerBytes = readFileSync(new URL('../fixtures/potion-pointer-ci-source.json.gz', import.meta.url));
assert.equal(sha256(potionPointerBytes),'922c811b2441673341f87b813d5acd3f17ac669bf59190926e4b9bd2c96d7c04','potion pointer CI predecessor identities');
const potionPointer = JSON.parse(gunzipSync(potionPointerBytes));
for (const row of Object.values(potionPointer)) {
  assert.equal(sha256(row.before),row.beforeSha256);
  assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(row.before)}\0`).update(row.before).digest('hex'),row.beforeGitBlob);
}

function project(source, row) {
  if (!row || typeof source!=='string' || source.includes('\r\r\n') ||
      sha256(source.replaceAll('\r\n','\n'))!==row.sha256) return source;
  return source.includes('\r\n') ? row.before.replaceAll('\n','\r\n') : row.before;
}

const officialBattleWitnessPath = 'tests/seven-refactor-source-epoch.test.mjs';
function beforeOfficialBattleWitness(path,source) {
  if (path!==officialBattleWitnessPath || typeof source!=='string' || source.includes('\r\r\n')) return source;
  const current=source.replaceAll('\r\n','\n');
  if (sha256(current)!=='a801de89a1d0b409c6879755d3f54e9e070a96594655f06d5a95750609ecbc65') return source;
  const prior=current
    .replace("import {beforePotionPointerSource} from './helpers/potion-pointer-source.mjs';\n",'')
    .replace('// noncombatPrior may leave unchanged owners at their newer live identity.\nconst beforePointerRead=p=>beforePotionPointerSource(p,noncombatPriorRead(p),currentRaw);\n','')
    .replace('beforeV2UiHudSource(p,beforePointerRead(p),currentRaw)','beforeV2UiHudSource(p,noncombatPriorRead(p),currentRaw)');
  assert.equal(sha256(prior),recovery.files[path].sha256,'exact official battle witness predecessor');
  return source.includes('\r\n') ? prior.replaceAll('\n','\r\n') : prior;
}

// Keep the exact #763 readability adapter visible to its frozen integration receipt.
function beforeRunHudReadabilityAdapter(path,source) {
  if (path!=='tests/helpers/run-hud-ci-source.mjs' || typeof source!=='string' || source.includes('\r\r\n')) return source;
  const current=source.replaceAll('\r\n','\n');
  if (sha256(current)!=='b3d6e5263fcdb25a102cfacdea2cc76a382f83056f34099968e68476ec3b59aa') return source;
  const prior=current
    .replace("import {beforePotionReadabilityEvidence} from './v2-ui-admission-ci-source.mjs';\n",'')
    .replace('preMenuRedCiSource(path,beforePotionReadabilityEvidence(path,source))','preMenuRedCiSource(path,source)');
  assert.equal(sha256(prior),'084db705f3390910da925c32970a18279b78063f4a03d2331a19a775229c5524','exact run HUD readability adapter predecessor');
  return source.includes('\r\n') ? prior.replaceAll('\n','\r\n') : prior;
}

const extractionWitnessPath = 'tests/game-ui-extraction-source-inverse.test.mjs';
const extractionWitnessHunks = [
  [
    "};\n// The new potion source witness reads these owners again after the frozen layer's owner scan.\nconst potionRereads=['src/lua/abyss_battle_card_gestures.lua','src/lua/abyss_battle_ui.lua'];\ntest('portrait demand layer authenticates fresh complete owners and rejects warm drift before entering the prior epoch',()=>{\n",
    "};\ntest('portrait demand layer authenticates fresh complete owners and rejects warm drift before entering the prior epoch',()=>{\n"
  ],
  [
    " assert.equal(target.files[path].source,preNoncombatDemandEpoch.proof.current[path].source);\n let reads=[];const reader=p=>{reads.push(p);return raw(p);};\n for(const input of [source,source.replaceAll('\\n','\\r\\n')]){\n  reads=[];assert.equal(sourceEpoch.preCombinedSource(path,input,{target:'noncombatDemandPrior',readSource:reader}),target.files[path].source);\n  assert.deepEqual(reads,[...sourceEpoch.proof.owners,...potionRereads]);\n }\n for(const input of [source+'\\n',source.slice(1),target.files[path].source,null,{}]){\n  reads=[];assert.equal(sourceEpoch.preCombinedSource(path,input,{target:'noncombatDemandPrior',readSource:p=>{reads.push(p);throw Error('foreign linked read');}}),input);assert.deepEqual(reads,[]);\n }\n",
    " assert.equal(target.files[path].source,preNoncombatDemandEpoch.proof.current[path].source);\n let reads=0;const reader=p=>{reads++;return raw(p);};\n for(const input of [source,source.replaceAll('\\n','\\r\\n')]){\n  reads=0;assert.equal(sourceEpoch.preCombinedSource(path,input,{target:'noncombatDemandPrior',readSource:reader}),target.files[path].source);\n  assert.equal(reads,sourceEpoch.proof.owners.length);\n }\n for(const input of [source+'\\n',source.slice(1),target.files[path].source,null,{}]){\n  reads=0;assert.equal(sourceEpoch.preCombinedSource(path,input,{target:'noncombatDemandPrior',readSource:()=>{reads++;throw Error('foreign linked read');}}),input);assert.equal(reads,0);\n }\n"
  ],
  [
    " for(const drift of [source+'\\n',null]){live=drift;assert.throws(()=>sourceEpoch.preCombinedSource(path,source,{target:'noncombatDemandPrior',readSource:mutable}),/combined linked owner identity/);}\n for(const owner of potionRereads){\n  let seen=0;\n  const late=p=>p===owner&&++seen===2?null:raw(p);\n  assert.throws(()=>sourceEpoch.preCombinedSource(path,source,{target:'noncombatDemandPrior',readSource:late}),\n   error=>error.message.includes('combined linked owner identity: '+owner+' changed during owner validation'));\n  assert.equal(seen,2);\n }\n});\n",
    " for(const drift of [source+'\\n',null]){live=drift;assert.throws(()=>sourceEpoch.preCombinedSource(path,source,{target:'noncombatDemandPrior',readSource:mutable}),/combined linked owner identity/);}\n});\n"
  ],
  [
    " for(const path of changed){\n  const source=live(path),fresh=[];let reads=0;\n  assert.equal(epoch.preCombinedSource(path,source,{target:'noncombatPrior',readSource:p=>{fresh.push(p);return live(p);}}),target.files[path].source);\n  assert.deepEqual(fresh,[...epoch.proof.owners,...potionRereads],'every owner, including both potion rereads, is read freshly');\n  for(const input of [source+'\\n',source.slice(1),target.files[path].source,null,{}]){\n",
    " for(const path of changed){\n  const source=live(path);let reads=0;\n  assert.equal(epoch.preCombinedSource(path,source,{target:'noncombatPrior',readSource:p=>{reads++;return live(p);}}),target.files[path].source);\n  assert.equal(reads,epoch.proof.owners.length,'every owner read freshly');\n  for(const input of [source+'\\n',source.slice(1),target.files[path].source,null,{}]){\n"
  ]
];
function beforeExtractionWitness(path,source) {
  if (path!==extractionWitnessPath || typeof source!=='string' || source.includes('\r\r\n')) return source;
  let prior=source.replaceAll('\r\n','\n');
  if (sha256(prior)!=='34716b7b36b85bc2838f6a4fdbf941f53b974d2f3ccffe4cc8c8a10bcda0b367') return source;
  for (const [after,before] of extractionWitnessHunks) {
    assert.equal(prior.split(after).length,2,'unique exact extraction witness predecessor hunk');
    prior=prior.replace(after,()=>before);
  }
  assert.equal(sha256(prior),recovery.files[path].sha256,'exact extraction witness predecessor');
  return source.includes('\r\n') ? prior.replaceAll('\n','\r\n') : prior;
}

export function beforeV2UiEvidence(path, source) {
  source = beforeExtractionWitness(path,source);
  source = beforeRunHudReadabilityAdapter(path,source);
  source = beforeOfficialBattleWitness(path,source);
  if (Object.hasOwn(potionNeutral,path)) source = project(source,{sha256:potionNeutral[path].afterSha256,before:potionNeutral[path].before});
  if (Object.hasOwn(potionPointer,path)) source = project(source,{sha256:potionPointer[path].afterSha256,before:potionPointer[path].before});
  if (Object.hasOwn(recovery.files,path)) source = project(source,recovery.files[path]);
  if (!Object.hasOwn(archive,path)) return source;
  const row = archive[path];
  return project(project(source,row.openingStatue),row.successor);
}

export function beforeV2UiAdmission(path, source) {
  if (!Object.hasOwn(archive,path)) return source;
  const row = archive[path];
  return project(source,{sha256:row.afterSha256,before:row.before});
}

// This is a historical CI observation only; current Full still runs the new fixture.
const potionReadabilityHunks = [
  [
    " host.run.potions[slot]='flex_potion';host:refresh()\n -- A fresh bottle press retires the preceding dismissal's pointer barrier.\n local touch=1100+slot\n if slot<=3 then tap('potion'..slot,touch)\n else\n  local control=assert(panel:GetChild('potionHelp'):GetChild('potion'..slot))\n  for _,kind in ipairs({'down','up','click'})do control.listeners[kind]({touchId=touch})end\n end\n assert(ui.potionMenu and ui.potionMenu.slot==slot and popup.visible,'physical slot opens '..slot)\n assert(math.abs(popup.x)+popup.sizeDeltaX/2<=Theme.canvas.base[1]/2,'physical slot bounds '..slot)\n popup:GetChild('dismiss').listeners.click({touchId=1000+slot})\n assert(not ui.potionMenu and not popup.visible,'click-only dismissal closes physical slot '..slot)\nend\n",
    " host.run.potions[slot]='flex_potion';host:refresh()\n assert(ui:openPotionMenu(slot));assert(math.abs(popup.x)+popup.sizeDeltaX/2<=Theme.canvas.base[1]/2,'physical slot bounds '..slot)\n popup:GetChild('dismiss').listeners.click({touchId=1000+slot})\nend\n"
  ]
];
export function beforePotionReadabilityEvidence(path,source) {
  if (path!=='tests/lua/potion_popup_readability.lua' || typeof source!=='string' || source.includes('\r\r\n')) return source;
  let prior=source.replaceAll('\r\n','\n');
  if (sha256(prior)!=='ff78e2969f322ead7cb8f1c374a3b825ed8b7256edccd08554e49d3899d7a8bd') return source;
  for (const [after,before] of potionReadabilityHunks) {
    assert.equal(prior.split(after).length,2,'unique exact potion readability predecessor hunk');
    prior=prior.replace(after,()=>before);
  }
  assert.equal(sha256(prior),'5d54fbec3347132dff535f90e5145e137c56990062a8f60f2bb75785b4762794','exact potion readability predecessor');
  return source.includes('\r\n') ? prior.replaceAll('\n','\r\n') : prior;
}
