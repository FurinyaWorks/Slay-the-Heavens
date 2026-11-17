import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync as diskReadFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {discoverJs} from '../scripts/ci-shards.mjs';
import {sourceEpoch,pickerMapSourceEpoch,cardContactSourceEpoch,preReleasePickerControlsSourceEpoch,releasePickerControlsSourceEpoch,releaseSelectionMapSourceEpoch} from './helpers/closeout-source-epoch.mjs';
import {integrationPacket,integrationCiSource,integrationRead,integrationInventory,integrationPriorInventory,assertIntegrationRawInventory,assertReleaseIntegrationCurrent} from './helpers/release-picker-b9-integration.mjs';
import {releasePickerControlsCiPacket,assertReleasePickerControlsExecutionGuards} from './helpers/release-picker-controls-ci-source.mjs';
import {releaseSelectionMapCiPacket,assertReleaseSelectionMapExecutionGuards} from './helpers/release-selection-map-ci-source.mjs';
const readFileSync=diskReadFileSync;
const historicalRead=(path,encoding)=>{const raw=readFileSync(path,encoding);if(!(typeof path==='string'&&(path.startsWith('src/')||path==='config/architecture.json')))return raw;const text=typeof raw==='string'?raw:raw.toString('utf8');const current=sourceEpoch.proof.current[path];if(!current||text.replaceAll('\r\n','\n')!==current.source)return raw;sourceEpoch.preCombinedSource(path,text,{target:'releaseSelectionMapReviewed',readSource:p=>readFileSync(p,'utf8')});const prior=pickerMapSourceEpoch.proof.current[path].source;return typeof raw==='string'?prior:Buffer.from(prior);};
const hash=b=>createHash('sha256').update(b).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');

test('joint Release authenticates the full live production corpus and retains both immutable standalone corpora',()=>{
 const sourceEpoch=pickerMapSourceEpoch,readFileSync=historicalRead;
 const p=sourceEpoch.proof,prior=preReleasePickerControlsSourceEpoch.proof;
 const files=['config/architecture.json',...readdirSync('src/lua').filter(p=>p.endsWith('.lua')).map(p=>'src/lua/'+p)].sort();
 assert.equal(files.length,352);assert.deepEqual(files,Object.keys(p.current).filter(path=>p.current[path]!==null).sort());
 for(const path of files)assert.equal(norm(readFileSync(path,'utf8')),p.current[path].source,path+' fresh joint source');
 for(const [name,target]of Object.entries(prior.targets))assert.deepEqual(p.targets[name],target,name+' complete immutable original target');
 assert.equal(Object.keys(prior.targets).length,64);assert.equal(Object.keys(p.targets).length,68);
 assert.equal(prior.owners.length,116);assert.equal(p.owners.length,116);
 assert.deepEqual(p.targets.releasePickerControlsReviewed.files,releasePickerControlsSourceEpoch.proof.current);
 assert.deepEqual(p.targets.releaseSelectionMapReviewed.files,releaseSelectionMapSourceEpoch.proof.current);
 for(const side of [releasePickerControlsSourceEpoch,releaseSelectionMapSourceEpoch])for(const [name,target]of Object.entries(side.proof.targets))assert.deepEqual(p.targets[name],target);
 const changed=files.filter(path=>p.current[path].sha256!==prior.current[path].sha256);
 assert.deepEqual(changed,['src/lua/abyss_game_ui_input.lua','src/lua/abyss_game_ui_view.lua','src/lua/abyss_node_ui_feedback.lua']);
 const card=p.current['src/lua/abyss_node_ui_feedback.lua'].source;
 assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(card)}\0`).update(card).digest('hex'),'e6caa9a86bab022830c2e924e616108f53644c08');
 assert.equal(p.currentTreeCommitted,false,'historical producer commits are not relabelled as a committed joint corpus');
});

test('joint owner authorization freshly rejects every missing changed or mistyped owner and leaves foreign inputs visible',()=>{
 const sourceEpoch=pickerMapSourceEpoch,readFileSync=historicalRead;
 const p=sourceEpoch.proof,anchor='src/lua/abyss_node_ui_feedback.lua',raw=path=>readFileSync(path,'utf8'),source=norm(raw(anchor));
 for(const target of ['releasePickerControlsPrior','releaseSelectionMapReviewed']){
  const seen=[];
  assert.equal(sourceEpoch.preCombinedSource(anchor,source,{target,readSource:path=>{seen.push(path);return raw(path);}}),p.targets[target].files[anchor].source);
  assert.deepEqual(seen,p.owners);
  for(const owner of p.owners)for(const replacement of [null,raw(owner)+'\n',Buffer.from(raw(owner))])
   assert.throws(()=>sourceEpoch.preCombinedSource(anchor,source,{target,readSource:path=>path===owner?replacement:raw(path)}),/linked owner/);
 }
 for(const input of [source+'\n',source.slice(1),null,17,Buffer.from(source),source.replaceAll('\n','\r\r\n')]){
  let calls=0;assert.equal(sourceEpoch.preCombinedSource(anchor,input,{target:'releasePickerControlsPrior',readSource:()=>{calls++;throw Error('foreign');}}),input);assert.equal(calls,0);
 }
});

test('joint CI binds every current input, preserves both packets and never masks production or foreign drift',()=>{
 assertReleaseIntegrationCurrent();
 for(const [path,sha]of Object.entries(integrationPacket.files)){
  const source=norm(readFileSync(path,'utf8'));assert.equal(hash(source),sha,path);
  for(const side of ['picker','selection']){
   for(const foreign of [source+'\n',source.slice(1),null,{},17])assert.equal(integrationCiSource(path,foreign,side),foreign,path);
   for(const foreignPath of ['__proto__','constructor','foreign/'+path])assert.equal(integrationCiSource(foreignPath,source,side),source);
   if(path.startsWith('src/')||path==='config/architecture.json'){
    assert.equal(integrationCiSource(path,source,side),source,'CI cannot authorize production');
    assert.equal(norm(integrationRead(side)(path,'utf8')),source,'CI reader leaves raw production authorization to the production projector');
   }
  }
  for(const mode of ['changed','missing'])assert.throws(()=>assertReleaseIntegrationCurrent((p,e)=>{
   if(p!==path)return readFileSync(p,e);if(mode==='missing')throw Error('missing '+p);return e?source+'\n':Buffer.from(source+'\n');
  }),mode==='missing'?/missing/:/fresh complete integration source/);
 }
 for(const [side,packet]of [['picker',releasePickerControlsCiPacket],['selection',releaseSelectionMapCiPacket]]){
  const read=integrationRead(side);
  for(const [path,row]of Object.entries(packet.files))assert.equal(hash(norm(read(path,'utf8'))),row.current.sha256,path+' exact '+side+' current view');
 }
 for(const path of Object.keys(integrationPacket.archives))assert.throws(()=>assertReleaseIntegrationCurrent((p,e)=>p===path?Buffer.concat([readFileSync(p),Buffer.from('\n')]):readFileSync(p,e)),/immutable Release join predecessor/);
});

test('joint raw inventories retain both additions and reject missing duplicate foreign and changed inputs',()=>{
 const raw={js:discoverJs(),lua:readdirSync('tests/lua').filter(p=>p.endsWith('.lua')).map(p=>'tests/lua/'+p).sort()};
 for(const [kind,paths]of Object.entries(raw)){
  assert.deepEqual(paths,integrationInventory(kind));assertIntegrationRawInventory(paths,kind);
  for(const [side,packet]of [['picker',releasePickerControlsCiPacket],['selection',releaseSelectionMapCiPacket]]){
   assert.deepEqual(integrationPriorInventory(paths,side,kind),packet.currentInventory[kind]);
   const added=paths.filter(p=>!packet.currentInventory[kind].includes(p));
   if(kind==='js')assert(added.length>0);
   else {
    const historicalAdded=releasePickerControlsCiPacket.currentInventory.lua.filter(p=>!releaseSelectionMapCiPacket.currentInventory.lua.includes(p));
    assert.equal(historicalAdded.length,0,'both standalone inputs retain the same complete Lua inventory');
    assert.deepEqual(added,['tests/lua/card_flow_contact_continuity.lua'],'B9 adds its exact retained contact regression');
   }
   if(added.length)assert.throws(()=>assertIntegrationRawInventory(paths.filter(p=>!added.includes(p)),kind),/raw discovery inventory/);
   for(const path of added)assert.throws(()=>integrationPriorInventory(paths,side,kind,(p,e)=>readFileSync(p,e)+(p===path?'\n':'')),/fresh Release integration added inventory source/);
  }
  for(const bad of [[],paths.slice(1),[...paths,paths[0]],[...paths,'tests/foreign.test.mjs']])assert.throws(()=>assertIntegrationRawInventory(bad,kind),/raw discovery inventory/);
 }
 const workflow=readFileSync('.github/workflows/quality.yml','utf8');
 assertReleasePickerControlsExecutionGuards(workflow);assertReleaseSelectionMapExecutionGuards(workflow);
});

// The two historical joint contracts above remain separate; this is the actual new corpus.
test('B9 picker union retains all three complete production views and validates the raw current corpus',()=>{
 const p=sourceEpoch.proof;
 assert.equal(Object.keys(p.current).filter(k=>p.current[k]!==null).length,352);
 assert.equal(Object.keys(p.targets).length,70);assert.equal(p.owners.length,117);
 for(const [path,row]of Object.entries(p.current))if(row)assert.equal(norm(diskReadFileSync(path,'utf8')),row.source,path);
 for(const prior of [pickerMapSourceEpoch,cardContactSourceEpoch])for(const [name,target]of Object.entries(prior.proof.targets))assert.deepEqual(p.targets[name],target);
 for(const target of ['releasePickerControlsReviewed','releasePc22BasicFeedbackReviewed','releaseSelectionMapReviewed']){
  const path='src/lua/abyss_card_flow.lua',source=diskReadFileSync(path,'utf8');
  assert.equal(sourceEpoch.preCombinedSource(path,source,{target,readSource:p=>diskReadFileSync(p,'utf8')}),p.targets[target].files[path].source);
 }
});
