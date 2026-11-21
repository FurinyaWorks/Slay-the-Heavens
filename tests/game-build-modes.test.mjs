import test from 'node:test';
import assert from 'node:assert/strict';
import {gameBuildArgs} from '../scripts/build-game.mjs';
import {nativeCandidateBuildArgs} from '../scripts/build-native-candidate.mjs';
test('default game build selects the approved official UI and native page lifecycle',()=>{
 const args=gameBuildArgs(['base.gil','build/candidates']);
 assert.deepEqual(args,['base.gil','build/candidates','--official-assets','--native-page-lifecycle']);
});
test('documented direct GIL build and default game alias select the same native UI',()=>{
 const direct=nativeCandidateBuildArgs(['base.gil','out']);
 const alias=nativeCandidateBuildArgs(gameBuildArgs(['base.gil','out']));
 assert.deepEqual(direct,alias);
 assert.equal(direct.options.officialAssets,true);
 assert.equal(direct.options.nativePageLifecycle,true);
 assert.equal(nativeCandidateBuildArgs(['base.gil','--release-candidate']).options.officialAssets,true);
 assert.equal(nativeCandidateBuildArgs(['base.gil','--art-version=legacy']).options.officialAssets,false);
 assert.equal(nativeCandidateBuildArgs(['base.gil','--art-menu-background=true']).options.officialAssets,false);
});
test('card-art disable options and matching artwork flags keep the approved UI for release builds',()=>{
 for(const flag of ['--art-cards=false','--no-ready-card-art','--native-card-art-count=0','--art-menu-background=false','--art-battle-portrait=true']){
  const {options}=nativeCandidateBuildArgs(['base.gil','--release-candidate',flag]);
  assert.equal(options.officialAssets,true,flag);
  assert.equal(options.nativePageLifecycle,true,flag);
  assert.equal(options.nativeCardArt,undefined,flag);
 }
});
test('explicit Enhanced selects the bounded 2D preset',()=>{
 const args=gameBuildArgs(['base.gil','--art-version=enhanced']);
 assert(args.includes('--lightweight-2d'));assert(args.includes('--native-page-lifecycle'));
 assert(args.includes('--art-cards=false'));assert(args.includes('--art-monsters=false'));
});
test('Legacy selects classic artwork path without changing core data or rules',()=>{
 const args=gameBuildArgs(['base.gil','--art-version=legacy']);
 assert(!args.includes('--lightweight-2d'));assert(!args.includes('--native-page-lifecycle'));
 assert(args.includes('--art-menu-background=true'));assert(args.includes('--art-selection-avatar=true'));
});
test('unaccepted 3D and ambiguous options fail before spawning any builder',()=>{
 for(const args of [['base.gil','--combat=3d'],['base.gil','--art-version=bad'],['base.gil','--combat=2d','--combat=3d'],['base.gil','--playtest']])assert.throws(()=>gameBuildArgs(args));
});
