// Read-only identities, plus a fresh report. Run from this isolated worktree root.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const git=args=>execFileSync('git',args,{encoding:'utf8',maxBuffer:16*1024*1024}).trimEnd();
const hash=b=>createHash('sha256').update(b).digest('hex');
const base='1cc5479b713edab6fd26db4e20f8eb22b7401cb2',original='23bed75c642f8f4af5c2783526a5afc4a57f471f';
for(const sha of [base,original])execFileSync('git',['merge-base','--is-ancestor',sha,'HEAD']);
const checkpoint=git(['rev-parse','b48acb5a']);
assert.equal(git(['rev-parse','HEAD:src/lua']),git(['rev-parse',original+':src/lua']));
assert.equal(git(['rev-parse','HEAD:scripts/lowcost-art.mjs']),git(['rev-parse',original+':scripts/lowcost-art.mjs']));
const fixture='tests/lua/reward_relic_shared_art.lua',source=readFileSync(fixture,'utf8').replaceAll('\r\n','\n');
const patchCommit='8fa591fa858174afdc0a5d62f92cf40cc43f3a60';
const patch=execFileSync('git',['show',patchCommit+':docs/release-handoffs/2026-11-15-pr663/pr689-default-profile-fixture.patch'],{encoding:'utf8'});
const added=patch.split('\n').filter(line=>line.startsWith('+')&&!line.startsWith('+++')).map(line=>line.slice(1)).join('\n')+'\n';
const prior=execFileSync('git',['show',original+':'+fixture],{encoding:'utf8'});
assert.equal(source,prior.replace('local before=streams();h:refresh()\n','local before=streams();h:refresh()\n'+added),'exact existing patch, all official assertions retained');
const blob=createHash('sha1').update(`blob ${Buffer.byteLength(source)}\0`).update(source).digest('hex');
assert.equal(blob,'9246752ab7d5aab26ca07c22b7cb17efc076daca');
const ci=JSON.parse(gunzipSync(readFileSync('tests/helpers/blue-candle-ci-source.json.gz')));
const profile=JSON.parse(readFileSync('data/presentation/ui_theme.json','utf8')).presentationProfile??null;
assert.notEqual(profile,'official-assets-first');
const {runLua}=await import('../../../scripts/test-lua.mjs');
writeFileSync('build/profile-identity.lua',`local Theme=require('abyss_theme');assert(Theme.presentationProfile==${profile===null?'nil':JSON.stringify(profile)});print('DEFAULT_PROFILE='..tostring(Theme.presentationProfile))`);
const runtime=runLua('build/profile-identity.lua');assert.equal(runtime.status,0,runtime.stdout+runtime.stderr);
const {sourceEpoch}=await import('../../../tests/helpers/closeout-source-epoch.mjs');
const {assertIntegratedCurrent}=await import('../../../tests/helpers/integrated-ci-source.mjs');
assertIntegratedCurrent();
const report={schemaVersion:1,base,original,checkpoint,productLuaTree:git(['rev-parse','HEAD:src/lua']),
 fixtureBlob:blob,fixtureSha256:hash(source),patchCommit,patchSha256:hash(patch),defaultProfile:profile,defaultRuntimeIdentity:runtime.stdout.trim(),
 productionPaths:Object.keys(sourceEpoch.proof.current).length,productionTargets:Object.keys(sourceEpoch.proof.targets).length,
 productionOwners:sourceEpoch.proof.owners.length,ciPaths:Object.keys(ci.files).length,
 retainedPredecessorArchives:Object.keys(ci.immutableArchives).filter(p=>!p.includes('blue-candle-source')).length,
 rawInventory:Object.fromEntries(Object.entries(ci.currentInventory).map(([k,v])=>[k,v.length])),
 packetHashes:Object.fromEntries(['blue-candle-source','blue-candle-ci-source'].map(name=>[name,hash(readFileSync('tests/helpers/'+name+'.json.gz'))])),
 independentReview:'pending parent review',hostedQuick:'existing failure not rerun',officialCandidate:'not_run'};
writeFileSync(new URL('./identity.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
