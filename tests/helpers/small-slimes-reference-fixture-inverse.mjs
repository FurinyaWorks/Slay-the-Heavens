import assert from 'node:assert/strict';
import {exactSourceMatches} from './source-fingerprint.mjs';
import {restoreExactFixtureHunks} from './exact-fixture-hunks.mjs';
const reference="        reference.relics={'burning_blood'};reference.relicCounters={};reference.relicCombat={attackPlayed=false}";
const generation='        local generation=run.combatGeneration';
export const smallSlimesReferenceFixture=Object.freeze({
 path:'tests/lua/small_slimes.lua',
 beforeSha256:'dde5543a126f0991fba7fa7fabadd25d21e65b26c323f0a38acc686b5eda7258',
 afterSha256:'9bd483cc6ba2dbbe28eaeb30a51852e9054173da66ec681b0d723d6274ee2b02',
 hunks:[{at:265,
  before:[reference,generation].join('\n'),
  after:[reference,
   '        -- Pin the new first-turn hook owners independently of the actual Run.',
   '        reference.rareRelicCombat={firstPocketTurn=true,gamblingActivated=false,topCanDraw=true,topDisabled=false}',
   '        reference.shopRelicCombat={pellets={}}',generation].join('\n'),
 }],
});
// #951 updated approved enemy and relic-field names in the live tests.
const reviewedSmallSlimeNames=Object.freeze({
 "path": "tests/lua/small_slimes.lua",
 "beforeSha256": "9bd483cc6ba2dbbe28eaeb30a51852e9054173da66ec681b0d723d6274ee2b02",
 "afterSha256": "dfa20b5c16ca4c93e245d49efbfd20070f127dfe0c4f6a2c8f5100f6260a5958",
 "hunks": [
  {
   "at": 99,
   "before": "    -- preceding Cultist queue item. This isolates entry, not prior victory.",
   "after": "    -- preceding Raven Adept queue item. This isolates entry, not prior victory."
  },
  {
   "at": 103,
   "before": "    eq(source,'Cultist');run.encounters=nextQueue",
   "after": "    eq(source,'Raven Adept');run.encounters=nextQueue"
  },
  {
   "at": 222,
   "before": "    cultist_solo={'cultist'},jaw_solo={'jaw_worm'},louse_pair={'red_louse','red_louse'},",
   "after": "    raven_adept_solo={'raven_adept'},jaw_solo={'jaw_worm'},louse_pair={'red_louse','red_louse'},"
  },
  {
   "at": 225,
   "before": "    blue_slaver_solo={'blue_slaver'},red_slaver_solo={'red_slaver'},fungi_pair={'fungi_beast','fungi_beast'},",
   "after": "    blue_guard_solo={'blue_guard'},red_guard_solo={'red_guard'},fungi_pair={'fungi_beast','fungi_beast'},"
  },
  {
   "at": 267,
   "before": "        reference.rareRelicCombat={firstPocketTurn=true,gamblingActivated=false,topCanDraw=true,topDisabled=false}",
   "after": "        reference.rareRelicCombat={firstPocketTurn=true,tacticalBadgeActivated=false,topCanDraw=true,topDisabled=false}"
  }
 ]
});
const liveNames={sha256:'dfa20b5c16ca4c93e245d49efbfd20070f127dfe0c4f6a2c8f5100f6260a5958',gitBlob:'100d90de9fe3dd26f7c370d52e40a378775c19b6'};
const previousNames={sha256:'9bd483cc6ba2dbbe28eaeb30a51852e9054173da66ec681b0d723d6274ee2b02',gitBlob:'efc23bd13676b33b7a446ed991f3c0d5e32831ec'};

function beforeReviewedSmallSlimeNames(path,source){
 if(path!==reviewedSmallSlimeNames.path||!exactSourceMatches(source,liveNames))return source;
 const lf=source.replaceAll('\r\n','\n');
 if(source!==lf&&source!==lf.replaceAll('\n','\r\n'))return source;
 const prior=restoreExactFixtureHunks(reviewedSmallSlimeNames,path,source);
 assert(exactSourceMatches(prior,previousNames),'exact pre-#951 small slime fixture');
 return prior;
}

// Original-body verification alone receives the exact pre-hook-owner fixture.
export function preSmallSlimesReferenceFixtureSource(path,source){
 return restoreExactFixtureHunks(smallSlimesReferenceFixture,path,beforeReviewedSmallSlimeNames(path,source));
}
