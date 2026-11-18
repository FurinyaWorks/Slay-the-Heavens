import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdtempSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
const head = 'd32bcca464f12271c7a8a48a6d2bc42d5c0bec3e';
const tree = 'a6c2182f59e28429485efbf5ee46adecb1305f2e';
const base = '5a86c6c2a3784d28fa819ab7487dd58cc7a778b1';
const baseTree = '25e627940ad33a177f0bbd9e939bacc04643a94d';
const release = '1ceb7c1a0c8575497c29acfd5a407ae399a9aaa2';
const releaseTree = 'b4b58920d3c53e35e4c11388b745eb42c722e70d';
const git = (...args) => execFileSync('git', args, {maxBuffer: 10_000_000});
const gitText = (...args) => git(...args).toString('utf8');
const sh = s => createHash('sha256').update(s).digest('hex');
const raw = (commit, path) => git('show', commit + ':' + path);
const view = (commit, path) => raw(commit, path).toString('utf8');
const oid = (commit, path) => gitText('rev-parse', commit + ':' + path).trim();
const archive = (commit, path) => JSON.parse(gunzipSync(raw(commit, path)));
const imp = p => import(pathToFileURL(resolve(p)));
assert.equal(gitText('rev-parse', 'HEAD', 'HEAD^{tree}'), head + '\n' + tree + '\n');
assert.equal(gitText('rev-parse', base + '^{tree}', release + '^{tree}'), baseTree + '\n' + releaseTree + '\n');
const chain = [head];
while (chain.at(-1) !== release) {
 const p = gitText('cat-file','-p',chain.at(-1)).match(/^parent ([a-f0-9]{40})$/m);
 assert(p && chain.length < 10);
 chain.push(p[1]);
}
assert(chain.includes(base));
console.log('REVIEW PASS exact HEAD/tree, delta base and raw object chain to Release');
const actions='src/lua/abyss_battle_actions.lua', gestures='src/lua/abyss_battle_card_gestures.lua';
assert.deepEqual(gitText('diff','--name-only',base,head,'--','src','data','config').trim().split('\n'),[actions,gestures]);
const backBody = text => text.match(/function owner\.controllerBack\(_\)[\s\S]*?\n    end\n/)[0];
assert.match(backBody(view(release,gestures)),/dependencies\.notice\(""\)/);
assert.equal(backBody(view(base,gestures)),backBody(view(head,gestures)));
assert.equal(view(head,gestures).replace('pairs(ownership.enemyInputs)','ipairs(ownership.enemyInputs)'),view(base,gestures));
const stable = ['tests/helpers/release-pointer-identity-ci.json.gz','tests/helpers/release-pointer-identity-source.json.gz',
'tests/helpers/release-card-cancel-notice-ci.json.gz','tests/helpers/release-card-cancel-notice-source.json.gz','tests/helpers/integrated-ci-source.json.gz',
'tests/helpers/closeout-ci-source.json.gz','tests/helpers/release-source-epoch.json.gz','scripts/ci-test-timings.json','scripts/ci-timeout-policy.mjs','.github/workflows/quality.yml'];
for (const p of stable) assert.equal(oid(head,p),oid(base,p),p);
console.log('REVIEW PASS two product paths, PC35 Back body unchanged, old archives/timing/workflow blobs unchanged');
const pref='tests/helpers/release-pointer-overlay';
const source = archive(head,pref+'-source.json.gz'), ci=archive(head,pref+'-ci.json.gz');
const original = archive(head,'tests/helpers/release-pointer-identity-source.json.gz');
const originalCi = archive(head,'tests/helpers/release-pointer-identity-ci.json.gz');
assert.equal(source.base,base);
assert.equal(ci.base,base);
assert.equal(ci.productionArchive,sh(raw(head,pref+'-source.json.gz')));
for (const p of Object.keys(source.current)) {
 for (const [ref,row] of [[base,source.before[p]],[head,source.current[p]]]) {
  assert.equal(row.source,view(ref,p),p + ':' + ref);
  assert.equal(row.sha256,sh(raw(ref,p)),p);
  assert.equal(row.gitBlob,oid(ref,p),p);
 }
}
const files=gitText('diff','--name-only',base,head,'--','tests').trim().split('\n');
assert.deepEqual(files.filter(p=>!p.startsWith(pref)&&!p.endsWith('/release-potion-enemy-source.mjs')).sort(),Object.keys(ci.files).sort());
for (const [p,row] of Object.entries(ci.files)) {
 assert.equal(row.before,view(base,p),p);
 assert.equal(row.beforeSha256,sh(raw(base,p)),p);
 assert.equal(row.beforeSha256,originalCi.files[p].afterSha256,p);
 assert.equal(row.afterSha256,sh(raw(head,p)),p);
}
for(const [p,row] of Object.entries(original.current)){
 assert.equal(row.source,view(base,p),p);
 if(p!==gestures)assert.equal(oid(head,p),oid(base,p),p);
}
console.log('REVIEW PASS exact two production witnesses and six CI fixture/helper witnesses bound to Git; recovered seven unchanged blobs intact');
const {sourceEpoch}=await imp('tests/helpers/closeout-source-epoch.mjs');
const {assertReleasePotionEnemyCurrent,releasePotionEnemyRead}=await imp('tests/helpers/release-potion-enemy-source.mjs');
const {integratedSource}=await imp('tests/helpers/integrated-ci-source.mjs');
const {proof}=sourceEpoch;
assert.equal(proof.currentTreeCommitted,false);
assert.equal(proof.currentCommit,base);
const prior=proof.targets.releasePointerOverlayPrior;
assert.equal(prior.commit,base);
assert.equal(Object.keys(prior.files).length,352);
assert.equal(Object.keys(proof.targets).length,85);
assert.equal(proof.owners.length,129); assert(proof.owners.includes(actions) && proof.owners.includes(gestures));
const read=(p,e)=>readFileSync(p,e);
for(const [p,row] of Object.entries(proof.current)) {
 const actual=read(p,'utf8').replaceAll('\r\n','\n');
 assert.equal(actual,row.source,p);
 assert.equal(sh(actual),row.sha256,p);
}
for(const p of [actions,gestures]){
 const input=proof.current[p].source;
 assert.equal(sourceEpoch.preCombinedSource(p,input,{target:'releasePointerOverlayPrior'}),prior.files[p].source);
 assert.equal(sourceEpoch.preCombinedSource(p,input.replaceAll('\n','\r\n'),{target:'releasePointerOverlayPrior'}),prior.files[p].source);
 const foreign=input+'\n';let ownerReads=0;
 assert.equal(sourceEpoch.preCombinedSource(p,foreign,{target:'releasePointerOverlayPrior',readSource:()=>{ownerReads++}}),foreign);
 assert.equal(ownerReads,0);
}
const readAlter=(p,alter)=>(path,e)=>path===p?alter(read(path,e)):read(path,e);
for(const broken of [actions,gestures]){
 const other=broken===actions?gestures:actions;
 const fresh=proof.current[other].source;
 const project=reader=>sourceEpoch.preCombinedSource(other,fresh,{target:'releasePointerOverlayPrior',readSource:p=>reader(p,'utf8')});
 assert.equal(project(read),prior.files[other].source);
 assert.throws(()=>project(readAlter(broken,s=>s+'\n')),/combined linked owner identity/);
 assert.throws(()=>project(readAlter(broken,()=>{throw Error('review owner missing')})),/combined linked owner missing/);
 assert.equal(project(read),prior.files[other].source);
}
console.log('REVIEW PASS complete raw production, exact current and CRLF projection, wrong primary passes unchanged without authorization, linked drift/missing refuses after successful previous calls');
assertReleasePotionEnemyCurrent(read);
const calibration='tests/ci-complete-calibration.test.mjs';
const input=read(calibration,'utf8');
const project=read=>integratedSource(calibration,input,'release',read);
const historical=project(read);
assert.notEqual(historical,input);
for(const p of [actions,gestures,pref+'-source.json.gz',pref+'-ci.json.gz','tests/lua/support/target_anonymous_context.lua','tests/mobile-card-release.test.mjs']){
 const taint=readAlter(p,s=>typeof s==='string'?s+'\n':Buffer.concat([s,Buffer.from('drift')]));
 assert.throws(()=>project(taint),/fresh (Release replay owner|immutable pointer overlay production archive|pointer overlay CI continuation|complete integration source: pointer overlay)/,p);
}
assert.equal(project(read),historical);
const fixture='tests/lua/support/target_anonymous_context.lua';
for(const side of ['release','potion']) assert.equal(releasePotionEnemyRead(side,read)(fixture,'utf8'),read(fixture,'utf8'));
assert.equal(releasePotionEnemyRead('release',read)(actions,'utf8'),read(actions,'utf8'));
assert.equal(releasePotionEnemyRead('potion',read)(actions,'utf8'),view(base,actions));
console.log('REVIEW PASS older calibration replay exact; both owners/archive/fixture drift rejected; live Release path and new support fixture remain raw');

const {copyIntegrationSourceClosure}=await imp('tests/helpers/copy-integration-source-closure.mjs');
const isolated=mkdtempSync(resolve(tmpdir(),'release-overlay-review-'));
try {
 copyIntegrationSourceClosure(isolated);
 const copiedDir=resolve(isolated,'tests/helpers');
 assert(readFileSync(resolve(copiedDir,'release-pointer-overlay-source.json.gz')).equals(raw(head,pref+'-source.json.gz')));
 const copied=(await import(pathToFileURL(resolve(copiedDir,'closeout-source-epoch.mjs')))).sourceEpoch.proof;
 assert.deepEqual(copied,proof);
 const predecessor=resolve(copiedDir,'review-predecessor-closeout.mjs');
 writeFileSync(predecessor,raw(base,'tests/helpers/closeout-source-epoch.mjs'));
 const previous=(await import(pathToFileURL(predecessor))).sourceEpoch.proof;
 assert.deepEqual(previous.current,prior.files);
 assert.equal(Object.keys(previous.targets).length,84);
 for(const [name,target] of Object.entries(previous.targets)) assert.deepEqual(proof.targets[name],target,name);
 assert.deepEqual(previous.owners,proof.owners);
 writeFileSync(resolve(copiedDir,'release-pointer-overlay-source.json.gz'),'modified archive');
 const copyTarget=mkdtempSync(resolve(tmpdir(),'release-overlay-review-target-'));
 try {
  assert.throws(()=>copyIntegrationSourceClosure(copyTarget,{sourceRoot:isolated}),/fresh helper copy identity: tests\/helpers\/release-pointer-overlay-source.json.gz/);
 } finally { rmSync(copyTarget,{recursive:true,force:true}); }
} finally { rmSync(isolated,{recursive:true,force:true}); }
console.log('REVIEW PASS isolated helper closure imports exact current; prior complete proof and all 84 historical targets remain byte-identical; copied archive drift rejects');
