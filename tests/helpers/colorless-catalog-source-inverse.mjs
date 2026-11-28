// Proposal facade: the original epoch module and its oracle are byte-for-byte frozen.
export * from './epochs/colorless/tests/helpers/colorless-catalog-source-inverse.mjs';
import { preColorlessCatalogSource as original,colorlessCatalogSourceProof } from './epochs/colorless/tests/helpers/colorless-catalog-source-inverse.mjs';
import {authenticateDevelopBackflow,beforeDevelopBackflow} from './develop-release-backflow-source.mjs';
import {sourceEpoch} from './combined-epoch/source-epoch.mjs';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {beforeStsDetailSource} from './release-sts-detail-source.mjs';
import {architectureSourceFormat} from './architecture-source-format.mjs';
const live=p=>readFileSync(new URL('../../'+p,import.meta.url),'utf8');
const architecturePath='config/architecture.json';
function normalizePrimaryConfig(path,source){
 // Preserve the original token-only primary-input allowance for the exact
 // #1080 release successor. Linked reads still authenticate raw owner bytes.
 if(path!==architecturePath||typeof source!=='string'||beforeStsDetailSource(path,source)!==source)return source;
 const lf=source.replaceAll('\r\n','\n');
 if(lf.includes('\r')||source!==lf&&source!==lf.replaceAll('\n','\r\n'))return source;
 try{
  const input=architectureSourceFormat(path,source);
  if(!input.tokensEqual)return source;
  const raw=live(path);
  if(beforeStsDetailSource(path,raw)===raw)return source;
  const custody=architectureSourceFormat(path,raw);
  return custody.tokensEqual&&input.formatted===custody.formatted?raw:source;
 }catch{return source;}
}
const descriptionPath='src/lua/abyss_colorless_cards.lua';
export function preColorlessCatalogSource(path,source,{readSource=live}={}){
 if(!Object.hasOwn(colorlessCatalogSourceProof.files[path]??{},'beforeSource'))return source;
 readSource=readers.get(readSource)??readSource;
 const input=normalizePrimaryConfig(path,source);
 if(input!==source&&typeof readSource==='function'){
  const raw=readSource,current=input.replaceAll('\r\n','\n');
  const strictRead=owner=>{
   const value=raw(owner);
   if(owner===architecturePath)
    assert(value===current||value===current.replaceAll('\n','\r\n'),
     'Colorless catalog linked owner identity: '+owner);
   return value;
  };
  // Establish freshness even if a legacy reader does not request this path,
  // and keep enforcing the same raw identity on every downstream reread.
  strictRead(path);readSource=strictRead;
 }
 const projected=sourceEpoch.preCombinedSource(path,input,{target:'colorless',readSource});
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
