import test from 'node:test';
import assert from 'node:assert/strict';
import * as costs from '../scripts/production-costs.mjs';

test('costs count pages, templates and cards separately without treating ancestor-hidden pages as waste',()=>{
 const card={name:'card1',kind:'container',children:[{name:'stsReferenceChrome',kind:'container',children:[]},{name:'art',kind:'image',image:100001}]};
 const layout={name:'Game',controls:[{name:'stage',children:[{name:'battlePanel',visible:false,children:[card]},{name:'menuPanel',children:[]}]}]};
 const templates=[{name:'Deck',children:[{...card,name:'face'}]}];
 const r=costs.productionCosts([{name:'abyss_data',bytes:17},{name:'abyss_a',bytes:9}],layout,templates,{abyss_a:'core'});
 assert.equal(r.measurement,'offline-production-inputs-not-official-storage');
 assert.equal(r.cardHosts.length,2);assert.equal(r.cardHosts[0].controls,3);
 assert.equal(r.pages.find(p=>p.path.endsWith('battlePanel')).hiddenControls,4);
 assert.equal(r.templates[0].controls,4);
 assert.deepEqual(r.lua.map(x=>[x.name,x.category]),[['abyss_data','configuration'],['abyss_a','core']]);
 assert.equal(r.imageReferences.find(x=>x.image===100001).instances,2);
 assert.equal(r.officialStorageMB,null);
});
test('growth ranks comparable paths including added/removed modules and never invents an old path baseline',()=>{
 const before={schemaVersion:1,lua:[{name:'a',bytes:10},{name:'gone',bytes:8}],pages:[{path:'Game/stage/a',jsonBytes:20}],templates:[],cardHosts:[]};
 const after={schemaVersion:1,lua:[{name:'a',bytes:15},{name:'new',bytes:9}],pages:[{path:'Game/stage/a',jsonBytes:12}],templates:[],cardHosts:[]};
 assert.deepEqual(costs.productionCostDelta(after,before).lua.map(r=>[r.name,r.deltaBytes]),[['new',9],['a',5],['gone',-8]]);
 assert.equal(costs.productionCostDelta(after,before).pages[0].deltaBytes,-8);
 assert.equal(costs.productionCostDelta(after).status,'UNVERIFIED-no-comparable-breakdown');
 for(const partial of [{},{schemaVersion:1},{...before,lua:undefined},{...before,schemaVersion:2}]){
  assert.equal(costs.productionCostDelta(after,partial).status,'UNVERIFIED-no-comparable-breakdown');
 }
 for(const invalid of [[{name:'a',bytes:NaN}],[{name:'a',bytes:10},{name:'a',bytes:20}],[{bytes:10}]]){
  assert.equal(costs.productionCostDelta(after,{...before,lua:invalid}).status,'UNVERIFIED-no-comparable-breakdown');
 }
});
