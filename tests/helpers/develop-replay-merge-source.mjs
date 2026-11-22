import {readFileSync} from 'node:fs';
import {releaseUiRestoreArchive} from './release-ui-restore-source.mjs';

const mergedPaths=new Set([
 'tests/deck-browser-reveal-reuse.test.mjs',
 'tests/deck-item-lifecycle.test.mjs',
 'tests/helpers/copy-integration-source-closure.mjs',
 'tests/helpers/develop-release-backflow-source.mjs',
 'tests/helpers/v2-p1-ci-source.mjs',
 'tests/official-battle-relic-icons.test.mjs',
 'tests/relic-view-layout.test.mjs',
 'tests/sts-card-reference-runtime.test.mjs',
 'tests/sts-page-reveal.test.mjs',
]);
const mapRoomMergedPaths=new Set([
 'tests/helpers/combined-epoch/source-epoch-runtime.mjs',
 'tests/helpers/copy-integration-source-closure.mjs',
 'tests/helpers/develop-release-backflow-source.mjs',
 'tests/sts-page-reveal.test.mjs',
]);
let replay,mapRoomReplay,mapRoomReplayCohort;

const mapRoomCohortPaths=new Set([
 'tests/helpers/combined-epoch/source-epoch-runtime.mjs',
 'tests/helpers/copy-integration-source-closure.mjs',
 'tests/helpers/develop-release-backflow-source.mjs',
 'tests/helpers/round3-catalog-source-inverse.mjs',
 'tests/encounter-formation-source-epoch.test.mjs',
 'tests/run-max-hp-config-inverse.test.mjs',
 'tests/session-menu-navigation.test.mjs',
 'scripts/build-native-audio-game.mjs',
 'tests/candidate-art-policy.test.mjs',
 'tests/lua/node_event_copy.lua',
 'tests/official-battle-potion-hud-source-epoch.test.mjs',
]);
export function beforeMapRoomReplayCohort(path,source){
 if(!mapRoomCohortPaths.has(path))return source;
 mapRoomReplayCohort??=releaseUiRestoreArchive(readFileSync(new URL('./map-room-replay-cohort-source.json.gz',import.meta.url)),
  '61c7b47aedc0d7742fcba449d2dce0936475e67c01558c44c606d916446a1e48','67fc8750dd6ef9a13067c6a43137f910b6a44228');
 return mapRoomReplayCohort.project(path,source);
}

export function beforeCurrentDevelopReplayMerge(path,source){
 source=beforeMapRoomReplayCohort(path,source);
 if(!mapRoomMergedPaths.has(path))return source;
 mapRoomReplay??=releaseUiRestoreArchive(readFileSync(new URL('./develop-map-room-replay-merge-source.json.gz',import.meta.url)),
  '859ef1f31ae5990213c98b3cb1db9ce8468f936579607d5718e825341225ebae','0044a5b7bef2f6ffbf14d5e41b4f79a9ae56daed');
 return mapRoomReplay.project(path,source);
}

// Historical readers continue through the exact pre-merge helpers. The live
// copier and production authentication use the combined current definitions.
export function beforeDevelopReplayMerge(path,source){
 source=beforeCurrentDevelopReplayMerge(path,source);
 if(!mergedPaths.has(path))return source;
 replay??=releaseUiRestoreArchive(readFileSync(new URL('./develop-replay-merge-source.json.gz',import.meta.url)),
  'a9c9075900b1e618f7fb23dcb4e3bc08dc88b5fdd9f798f5b881e0fbf465391f','7bcb98f9271a49bf9ca7eaf46b6f229335e60e8e');
 return replay.project(path,source);
}
