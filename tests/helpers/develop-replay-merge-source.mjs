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
let replay,mapRoomReplay;

export function beforeCurrentDevelopReplayMerge(path,source){
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
