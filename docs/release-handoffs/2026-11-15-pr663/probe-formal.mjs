import {buildNativeCandidate} from './formal/scripts/build-native-candidate.mjs';
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync,readFileSync,readdirSync,existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('./formal/',import.meta.url));
const git=(...args)=>execFileSync('git',['-C',root,...args],{encoding:'utf8'}).trim();
assert.equal(git('status','--porcelain'),'');
const head=git('rev-parse','HEAD');
const out='build/rc-pre-sdk-probe';
const baseMap='build/rc-pre-sdk-local-sentinel.gil';
mkdirSync(join(root,'build'),{recursive:true});
writeFileSync(join(root,baseMap),'Isolated dummy input; never a valid GIL.');
let reached=0;
const marker='STOP BEFORE OFFICIAL SDK: local receipt boundary';
const client={async readResource({uri}){assert.equal(uri,'miliastra://workflow');reached++;throw Error(marker);},
 async callTool(){assert.fail('No native SDK calls permitted');}};
const options={root,baseMap,client,releaseCandidate:true,workKey:'contest-2026',sourceCommit:head};
for(const [name,flags,reject] of [
 ['official',{officialAssets:true},/Official assets require a separate non-release candidate/],
 ['lifecycle',{nativePageLifecycle:true},/Native page lifecycle requires an explicit bounded non-release experiment/],
 ['official-lifecycle',{officialAssets:true,nativePageLifecycle:true},/Official assets require a separate non-release candidate/],
]){
 await assert.rejects(buildNativeCandidate({...options,...flags,output:out+'-'+name}),reject);
 assert.equal(reached,0);
 assert(!existsSync(join(root,out+'-'+name)));
 console.log('PASS currently rejected before build:',name,reject.source);
}
await assert.rejects(buildNativeCandidate({...options,output:out}),error=>error.message===marker);
assert.equal(reached,1);
const output=join(root,out);
const entries=readdirSync(output);assert.equal(entries.length,1);
const path=join(output,entries[0]),gen=join(path,'generated');
const receipt=JSON.parse(readFileSync(join(path,'failure.json'),'utf8'));
assert.equal(receipt.sourceCommit,head);
assert.equal(receipt.sourceDirty,false);
assert.equal(receipt.release.version,'v2.0.0');
assert.equal(receipt.release.workKey,'contest-2026');
assert.equal(receipt.uiProfile.nativePageLifecycle,false);
assert(!receipt.officialAssetsProfile);
assert.equal(receipt.liveWriteEnabled,false);
assert(!existsSync(join(path,'candidate.json')));
assert(!existsSync(join(path,'candidate.gil')));
const narrative=readFileSync(join(gen,'abyss_narrative.lua'),'utf8');
assert.match(narrative,/\bcodeVersion="v2\.0\.0"/);
assert.equal(git('status','--porcelain'),'');
console.log('PASS default formal: actual generators + pre-SDK checks reached one local sentinel only');
console.log(JSON.stringify({source:head,tree:git('rev-parse','HEAD^{tree}'),release:receipt.release,flags:receipt.artFeatures.flags,uiProfile:receipt.uiProfile,generatedFiles:readdirSync(gen).length,narrativeSha256:createHash('sha256').update(narrative).digest('hex'),noNativeSDK:true,noCandidate:true},null,2));
