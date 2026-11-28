// Proposal facade: the original epoch module and its oracle are byte-for-byte frozen.
export * from './epochs/develop/tests/helpers/relic-query-source-inverse.mjs';
import { preRelicQuerySource as original } from './epochs/develop/tests/helpers/relic-query-source-inverse.mjs';
import {sourceEpoch} from './combined-epoch/source-epoch.mjs';
import {readFileSync} from 'node:fs';
import {currentRewardReplay} from './reward-current-source.mjs';
import {beforeCurrentDeckEntranceOwner} from './develop-release-backflow-source.mjs';
import {beforeReleaseClosureFixture} from './release-closure-fixture-source.mjs';
const releaseLayoutOwners=new Set(['src/lua/abyss_battle_reward_layout.lua','src/lua/abyss_map_ui.lua']);
const beforeReleaseLayout=(path,source)=>releaseLayoutOwners.has(path)?beforeReleaseClosureFixture(path,source):source;
const live=p=>readFileSync(new URL('../../'+p,import.meta.url),'utf8');
export function preRelicQuerySource(path,source,{readSource=live}={}){
 readSource=readers.get(readSource)??readSource;
 const replay=currentRewardReplay(path,source,readSource);
 source=replay.source;
 readSource=replay.read;
 const entranceRead=typeof readSource==='function'?owner=>beforeCurrentDeckEntranceOwner(owner,beforeReleaseLayout(owner,readSource(owner))):readSource;
 const input=beforeCurrentDeckEntranceOwner(path,beforeReleaseLayout(path,source));
 const projected=sourceEpoch.preCombinedSource(path,input,{target:'develop',readSource:entranceRead});
 return original(path,projected,{readSource:(typeof entranceRead==='function'?sourceEpoch.combinedReader(entranceRead,'develop'):entranceRead)});
}
const readers=new WeakMap();
export function relicQueryReader(readSource=live){
 if(readers.has(readSource))return readSource;
 const reader=path=>preRelicQuerySource(path,readSource(path),{readSource});
 readers.set(reader,readSource);return reader;
}
