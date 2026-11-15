// Exact three-owner continuation; no historical archive is replaced.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {fatalBgmCurrentSource,preFatalBgmStopSource} from './fatal-bgm-stop-source-inverse.mjs';
import {battleReturnBindings,projectBattleReturnSource} from './battle-return-historical-source.mjs';
const norm=s=>s.replaceAll('\r\n','\n');
const bind=source=>Object.freeze({source,sha256:createHash('sha256').update(source).digest('hex'),gitBlob:createHash('sha1').update(`blob ${Buffer.byteLength(source)}\0`).update(source).digest('hex')});
export const lateProduction=Object.freeze({
 ...Object.fromEntries(Object.entries(battleReturnBindings).map(([p,pair])=>[p,Object.freeze({before:pair[0],after:pair[1]})])),
 [fatalBgmCurrentSource.path]:Object.freeze({before:bind(fatalBgmCurrentSource.before),after:bind(fatalBgmCurrentSource.after)}),
});
export const lateProductionPaths=Object.freeze(Object.keys(lateProduction).sort());
const legacyPath='src/lua/abyss_ui.lua';
const legacyBefore=norm(readFileSync(new URL('../fixtures/fatal-bgm-stop-before.lua',import.meta.url),'utf8'));
const legacyAfter=norm(readFileSync(new URL('../fixtures/fatal-bgm-stop-after.lua',import.meta.url),'utf8'));
const same=(source,expected)=>typeof source==='string'&&norm(source)===expected;
const identity=(row,source)=>row?.source===source;
export function projectLateSource(path,source,binding){
 const prepared=preFatalBgmStopSource(path,projectBattleReturnSource(path,source));
 return typeof prepared==='string'&&identity(binding,norm(prepared))?prepared:source;
}
// A live continuation cannot borrow an old owner sampled earlier in this call.
// Re-read only the small continuation group; never cache owner authorization.
export function authorizeLateSources(path,input,binding,samples,read){
 const entries=[[path,input,binding],...samples];
 const live=entries.some(([p,s,b])=>lateProduction[p]&&same(s,lateProduction[p].after.source)
  &&(identity(b,lateProduction[p].before.source)||identity(b,lateProduction[p].after.source)));
 const legacy=!live&&entries.some(([p,s,b])=>p===legacyPath&&same(s,legacyAfter)&&identity(b,legacyBefore));
 if(!live&&!legacy)return;
 const expected=live?Object.fromEntries(lateProductionPaths.map(p=>[p,lateProduction[p].after.source])):{[legacyPath]:legacyAfter};
 const message=p=>'combined linked owner identity: fatal BGM entry changed during owner validation / late continuation '+p;
 for(const [p,s]of entries)if(Object.hasOwn(expected,p))assert(same(s,expected[p]),message(p));
 for(const [p,source]of Object.entries(expected)){
  let actual;try{actual=read(p);}catch(error){assert.fail('combined linked owner missing: '+p+': '+String(error?.message??error));}
  assert(same(actual,source),message(p));
 }
}
