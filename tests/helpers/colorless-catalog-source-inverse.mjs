// Proposal facade: the original epoch module and its oracle are byte-for-byte frozen.
export * from './epochs/colorless/tests/helpers/colorless-catalog-source-inverse.mjs';
import { preColorlessCatalogSource as original } from './epochs/colorless/tests/helpers/colorless-catalog-source-inverse.mjs';
import {authenticateDevelopBackflow,beforeDevelopBackflow} from './develop-release-backflow-source.mjs';
import {sourceEpoch} from './combined-epoch/source-epoch.mjs';
import {readFileSync} from 'node:fs';
const live=p=>readFileSync(new URL('../../'+p,import.meta.url),'utf8');
const descriptionPath='src/lua/abyss_colorless_cards.lua';
export function preColorlessCatalogSource(path,source,{readSource=live}={}){
 readSource=readers.get(readSource)??readSource;
 const projected=sourceEpoch.preCombinedSource(path,source,{target:'colorless',readSource});
 if(typeof readSource!=='function')return original(path,beforeDevelopBackflow(path,projected),{readSource});
 const predecessor=path===descriptionPath?authenticateDevelopBackflow(path,projected,readSource):projected;
 const historical=sourceEpoch.combinedReader(readSource,'colorless');
 const readHistorical=owner=>owner===descriptionPath?authenticateDevelopBackflow(owner,historical(owner),readSource):historical(owner);
 return original(path,predecessor,{readSource:readHistorical});
}
const readers=new WeakMap();
export function colorlessCatalogReader(readSource=live){
 if(readers.has(readSource))return readSource;
 const reader=path=>preColorlessCatalogSource(path,readSource(path),{readSource});
 readers.set(reader,readSource);return reader;
}
