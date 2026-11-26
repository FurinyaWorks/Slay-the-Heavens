import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';import luaparse from 'luaparse';
import {createHash} from 'node:crypto';
import {discoverSources,dependencyCycles} from '../scripts/lua-quality-metrics.mjs';
import {analyzeSources} from '../scripts/check-architecture.mjs';
import {reviewResponsibilityComplexity} from '../scripts/check-lua-static.mjs';
import {luaString} from '../scripts/build-lua-data.mjs';
import {presenceHash,runActorPresence} from './helpers/actor-presence-vm.mjs';
const read=p=>readFileSync(p,'utf8').replaceAll('\r\n','\n');
const roots=['abyss_actor_presence','abyss_act2_ai_moves','abyss_act2_summons','abyss_silent_discard_cards'];
function closure(g,n){const seen=new Set(),pending=[n];while(pending.length){const next=pending.pop();if(seen.has(next))continue;seen.add(next);for(const e of g.edges)if(e.from===next)pending.push(e.to);}return [...seen].sort();}

const reviewedNamingCheckpoints=new Map([['actor_presence_contract',3],['act2_party_snapshot',20]]);
const silentDiscardFixture='silent_discard_build';
const priorExchangeId='calculated_gamble',currentExchangeId='calculated_exchange';
const stringIs=(cell,text)=>cell?.[0]==='string'&&cell[1]===text;
const field=(entries,key,tag='string')=>entries?.find(([[type,name]])=>type===tag&&name===key)?.[1];
function reviewedGraphNames(graph){
 const tables=new Map(graph.definitions.filter(([kind])=>kind==='table').map(([,id,entries])=>[id,entries]));
 const dereference=cell=>cell?.[0]==='table'?tables.get(cell[1]):undefined;
 const changes=[0,0,0];
 for(const entries of tables.values()){
  const id=field(entries,'id'),source=field(entries,'sourceId'),name=field(entries,'name');
  // #951 changed these two card display names in the production catalog.
  if(stringIs(id,'bite')&&stringIs(source,'Bite')&&stringIs(name,'噬咬')){name[1]='迅袭';changes[0]++;}
  if(stringIs(id,'jax')&&stringIs(source,'J.A.X.')&&stringIs(name,'激素')){name[1]='元素增幅';changes[1]++;}
  if(stringIs(id,'snake_dagger')&&stringIs(source,'Dagger')){
   const intents=dereference(field(entries,'intents'));
   const explode=dereference(field(intents,'2','number'));
   const effects=dereference(field(explode,'effects'));
   const selfDestruct=dereference(field(effects,'2','number'));
   const op=field(selfDestruct,'op');
   if(stringIs(field(explode,'id'),'explode')&&stringIs(field(explode,'kind'),'attack')
       &&selfDestruct?.length===1&&stringIs(op,'daggerSacrifice')){op[1]='daggerExpenditure';changes[2]++;}
  }
 }
 return changes;
}

function frozenSilentFixturePrelude(path){
 const raw=readFileSync(path,'utf8'),source=raw.replaceAll('\r\n','\n');
 assert(raw===source||raw===source.replaceAll('\n','\r\n'),'complete Silent fixture line endings');
 assert.equal(presenceHash(source),'bb16f540d685060cb3f3834a394faacb1197c1fdf6f2b6af0a23a01bb983b9bd','exact original Silent fixture');
 const blob=createHash('sha1').update(`blob ${Buffer.byteLength(source)}\0`).update(source).digest('hex');
 assert.equal(blob,'6c4f9b81778aaab02e8f77e2d7064c6c5d017aa3','exact original Silent fixture Git blob');
 assert.equal(source.split('Cards.exchangeActions').length-1,3);
 assert.equal(source.split(luaString(currentExchangeId)).length-1,11);
 // The frozen module and its catalog still own the original #951 names.
 const fixture=source.replaceAll('Cards.exchangeActions','Cards.gambleActions')
  .replaceAll(luaString(currentExchangeId),luaString(priorExchangeId));
 return `
 local fixtureDofile=dofile
 dofile=function(path)
  if path~=${luaString(path)} then return fixtureDofile(path) end
  dofile=fixtureDofile
  return assert(load(${luaString(fixture)},${luaString('@'+path)}))()
 end`;
}

function reviewedSilentCardNames(graph){
 const tables=new Map(graph.definitions.filter(([kind])=>kind==='table').map(([,id,entries])=>[id,entries]));
 const dereference=cell=>cell?.[0]==='table'?tables.get(cell[1]):undefined;
 let catalogRows=0,references=0;
 for(const entries of tables.values()){
  const catalog=entries.find(([key])=>stringIs(key,priorExchangeId));
  if(catalog){
   const definition=dereference(catalog[1]),id=field(definition,'id'),source=field(definition,'sourceId');
   const effects=dereference(field(definition,'effects'));
   const action=dereference(field(effects,'1','number')),op=field(action,'op');
   assert(stringIs(id,priorExchangeId)&&stringIs(source,'Calculated Gamble')
     &&action?.length===1&&stringIs(op,'calculatedGamble'),'owned frozen Exchange catalog row');
   // Only the catalog key and its exact definition are renamed in place.
   catalog[0][1]=currentExchangeId;
   id[1]=currentExchangeId;
   source[1]='Calculated Exchange';
   op[1]='calculatedExchange';
   catalogRows++;
  }
  const cardId=field(entries,'cardId');
  if(stringIs(cardId,priorExchangeId)){cardId[1]=currentExchangeId;references++;}
 }
 assert.equal(catalogRows,1,'one frozen Exchange catalog row per checkpoint');
 return references;
}

function reviewedBeforeObservation(fixture,before){
 const silent=fixture===silentDiscardFixture;
 const reviewedCheckpoints=silent?20:reviewedNamingCheckpoints.get(fixture);
 if(reviewedCheckpoints===undefined)return before;
 // Authenticate the complete raw trace before projecting the reviewed names.
 const trace=readFileSync(before.traceFile,'utf8');
 assert(trace.endsWith('\n'),'complete frozen VM trace');
 const rows=trace.slice(0,-1).split('\n');
 assert.equal(rows.length,before.graphs.length);
 let originalBytes=0,bytes=0,changed=0,exchangeReferences=0;
 const graphs=rows.map((line,index)=>{
  const {label,graph}=JSON.parse(line);
  const original=JSON.stringify(graph);
  assert.deepEqual({label,sha256:presenceHash(original)},before.graphs[index]);
  originalBytes+=Buffer.byteLength(original);
  const counts=reviewedGraphNames(graph);
  if(counts.some(Boolean)){
   assert.deepEqual(counts,[1,1,1],`${fixture}/${label}: exact reviewed scalar fields`);
   changed++;
  }
  if(silent)exchangeReferences+=reviewedSilentCardNames(graph);
  const projected=JSON.stringify(graph);
  bytes+=Buffer.byteLength(projected);
  return {label,sha256:presenceHash(projected)};
 });
 assert.equal(originalBytes,before.bytes);
 assert.equal(changed,reviewedCheckpoints,'reviewed naming checkpoints: '+fixture);
 if(silent){
  assert.equal(rows.length,20,'all original Silent graph checkpoints');
  assert.equal(exchangeReferences,75,'reviewed Exchange card references across the original branches');
 }
 return {graphs,bytes};
}
test('presence query consumers have no transitive Actor or combat execution dependency including deferred imports',()=>{
 const sources=Object.fromEntries(Object.entries(discoverSources()).map(([p,s])=>[p.slice(8,-4),s])),policy=JSON.parse(read('config/architecture.json'));
 const g=analyzeSources(sources,policy);assert.deepEqual(g.errors,[]);
 const forbidden=['abyss_actor','abyss_combat','abyss_card_actions','abyss_relic_combat_hooks','abyss_relic_family_combat'];
 for(const root of roots){assert(!closure(g,root).some(n=>forbidden.includes(n)));assert(!dependencyCycles(g.nodes,g.edges).some(c=>c.members.includes(root)));}
 assert.deepEqual(closure(g,'abyss_actor_presence'),['abyss_actor_presence']);
 for(const root of roots)for(const prefix of ["local bad=require('abyss_actor')\n","local function bad()return require('abyss_actor')end\n"]){
  const negative=analyzeSources({...sources,[root]:prefix+sources[root]},policy);
  assert(negative.errors.some(e=>e.message.includes('actor-presence-independence')));assert(closure(negative,root).includes('abyss_actor'));
 }
});
test('entire presence leaf and both dynamic bridges including nested functions enforce CC15',()=>{
 for(const [file,names]of [['src/lua/abyss_actor_presence.lua',['outer']],['src/lua/abyss_actor.lua',['presenceIndex','presenceNewIndex']]])for(const name of names){
  const source=`local function ${name}() return function()end end`,row=(column,subject)=>({file,line:1,column,code:'W561',message:`cyclomatic complexity of ${subject} is too high (16 > 0)`});
  const errors=reviewResponsibilityComplexity([row(1,'main chunk'),row(7,`function '${name}'`),row(source.indexOf('function()')+1,'function')],{[file]:source}).errors;
  assert(errors.some(e=>e.file===file&&e.message===`Responsibility complexity 16 exceeds 15: function '${name}'`));
  assert(errors.some(e=>e.file===file&&e.message==='Responsibility complexity 16 exceeds 15: function'));
  if(file.includes('_presence'))assert(errors.some(e=>e.file===file&&e.message==='Responsibility complexity 16 exceeds 15: main chunk'));
 }
});
for(const fixture of ['actor_presence_contract','act2_party_snapshot','silent_discard_build'])test(`${fixture}: complete independent before/current graphs preserve states, aliases, RNG, returns and errors`,()=>{
 const path='tests/lua/'+fixture+'.lua',options={trace:fixture!=='actor_presence_contract'};
 const frozen=fixture===silentDiscardFixture?{...options,prelude:frozenSilentFixturePrelude(path)}:options;
 const before=runActorPresence('before',path,frozen),after=runActorPresence('after',path,options);
 assert.equal(before.status,0,before.error);assert.equal(after.status,0,after.error);assert(before.graphs.length>0);
 const comparison=reviewedBeforeObservation(fixture,before);
 assert.deepEqual(after.logs,before.logs);assert.deepEqual(after.generated,before.generated);assert.deepEqual(after.graphs,comparison.graphs);assert.equal(after.bytes,comparison.bytes);
 mkdirSync('build/actor-presence',{recursive:true});writeFileSync(`build/actor-presence/${fixture}-equivalence.json`,JSON.stringify({fixture,checkpoints:after.graphs,bytesPerSide:after.bytes,generated:after.generated},null,2)+'\n');
});
for(const root of roots)test(`${root}: cold query loading does not initialize Actor and early overrides stay visible after facade load`,()=>{
 const prelude=`require('${root}');local P=require('abyss_actor_presence');assert(not package.loaded.abyss_actor and not package.loaded.abyss_combat and not package.loaded.abyss_card_actions)
 local old=P.isActive;local special=function()return 'early' end;P.isActive=special;local A=require('abyss_actor');assert(A.isActive==special);A.isActive=old
 for _,key in ipairs({'isActive','isPresent'})do local original=A[key];P[key]=false;assert(A[key]==false);A[key]=nil;assert(P[key]==nil);P[key]=original;assert(A[key]==original)end`;
 const result=runActorPresence('after','tests/lua/actor_presence_contract.lua',{prelude});assert.equal(result.status,0,result.error);
});
for(const [label,module,from,to,marker]of [
 ['half-dead targetability','abyss_actor_presence',' and not actor.halfDead','',/inactive flag halfDead/],
 ['rebirth encounter presence','abyss_actor_presence',' or actor.awakenedRebirthPending','',/rebirth presence retains truthy value/],
 ['dead refund','abyss_silent_discard_cards','if not Actors.isActive(state.player) then return false end','if false then return false end',/dead player receives no refund/],
])test(`a parsed ${label} regression fails its behavior assertion`,()=>{
 const s=read('src/lua/'+module+'.lua');assert.equal(s.split(from).length,2);const changed=s.replace(from,to);luaparse.parse(changed,{luaVersion:'5.3'});
 const result=runActorPresence('after','tests/lua/actor_presence_contract.lua',{mutation:{name:module,source:changed}});assert.notEqual(result.status,0);assert.match(result.error,marker);
});
