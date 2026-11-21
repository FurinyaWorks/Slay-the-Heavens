import assert from 'node:assert/strict';
import test from 'node:test';
import {nativeAudioBuildArgs} from '../scripts/build-native-audio-game.mjs';
import {refinedMonsterTierNames} from '../scripts/monster-art.mjs';
import {gameBuildArgs} from '../scripts/build-game.mjs';
import {nativeCandidateBuildArgs} from '../scripts/build-native-candidate.mjs';

test('standard release game and native candidate CLIs opt in to the refined monster profile',()=>{
 const stock=gameBuildArgs(['base.gil']);
 assert.ok(stock.includes('--refined-release-monsters'));
 assert.equal(nativeCandidateBuildArgs(stock).options.refinedReleaseMonsterArt,true);
 assert.equal(nativeCandidateBuildArgs(['base.gil']).options.refinedReleaseMonsterArt,true);
 assert.equal(nativeCandidateBuildArgs(['base.gil','--art-version=legacy']).options.refinedReleaseMonsterArt,false);
});

test('explicit official v2 and default v3 choices agree across game and audio command lines',()=>{
 for(const [flags,expected] of [[[],true],[['--official-assets'],false],[['--art-monsters=false'],false],
  [['--official-assets','--refined-release-monsters'],true]]){
  assert.equal(nativeCandidateBuildArgs(['base.gil',...flags]).options.refinedReleaseMonsterArt,expected);
  assert.equal(nativeAudioBuildArgs(['base.gil',...flags]).options.refinedReleaseMonsterArt===true,expected);
 }
});

test('refined audit cannot use receipt keys as arbitrary paths',()=>{
 const names=['AbyssMonsterActor41','AbyssMonsterActor96','AbyssMonsterActor115'];
 assert.deepEqual(refinedMonsterTierNames({monsterActors:{tiers:Object.fromEntries(names.map(n=>[n,{}]))}}),names);
 const tiers=Object.fromEntries([...names.slice(0,2),'../../output'].map(n=>[n,{}]));
 assert.throws(()=>refinedMonsterTierNames({monsterActors:{tiers}}),/Invalid refined monster tier inventory/);
});
