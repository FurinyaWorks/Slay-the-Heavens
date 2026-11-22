import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,writeFileSync,rmSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {gunzipSync} from 'node:zlib';
import * as monsters from '../scripts/monster-art.mjs';
import {toLua} from '../scripts/build-lua-data.mjs';
import {runLua} from '../scripts/test-lua.mjs';
import {writePortraitModule,portraitRuntimeInventory} from '../scripts/official-portraits.mjs';

function temporary(t){const dir=mkdtempSync(join(tmpdir(),'capacity-payload-'));t.after(()=>rmSync(dir,{recursive:true,force:true}));return dir;}
function drawing(){
 const slot=i=>({anchorMax:[.5,.5],anchorMin:[.5,.5],pivot:[.5,.5],scale:[1,1],
  image:100001+i%3,imageType:i%2?'basic':'stretch',position:[-32.123456789+i/7,1e-9*i],
  size:[3.141592653589793,4+i/11],rotation:[0,0,-21.5+i/3],colour:[i%256,24,251,127]});
 return {enabled:true,status:'refined-release',canvas:[106,106],hostOrigin:[0,0],
  assets:{one:{enemyId:'one',capacity:115,slots:Array.from({length:115},(_,i)=>slot(i))},
   two:{enemyId:'two',capacity:96,slots:Array.from({length:96},(_,i)=>slot(i+115))}},
  bindings:{one:'one',two:'two'},poolCapacity:115,provenance:{sourceSha256:'a'.repeat(64)}};
}
const equalLua=`local function same(a,b)
 assert(type(a)==type(b),'value type changed')
 if type(a)~='table' then assert(a==b,'numeric/string value changed');return end
 for k,v in pairs(a) do same(v,b[k]) end
 for k in pairs(b) do assert(a[k]~=nil,'extra field') end
end
`;
test('refined geometry emits a smaller payload and actual Lua restores every value without shared slot defaults',t=>{
 assert.equal(typeof monsters.monsterArtPayloadSource,'function','lossless refined payload producer is required');
 const input=drawing(),before=structuredClone(input),source=monsters.monsterArtPayloadSource(input);
 assert.deepEqual(input,before,'packing must not mutate validated inputs');
 assert(Buffer.byteLength(source)<Buffer.byteLength(toLua(input))*.6,'remove repeated geometry field/default storage');
 const dir=temporary(t),file=join(dir,'equivalence.lua');
 writeFileSync(file,`local wanted=${toLua(input)}\nlocal actual=(function()\n${source}\nend)()\n${equalLua}
 same(wanted,actual)
 local a,b=actual.assets.one.slots[1],actual.assets.one.slots[2]
 assert(a.anchorMin~=b.anchorMin and a.anchorMin~=a.anchorMax and a.pivot~=a.anchorMax)
 assert(a.position~=b.position and a.scale~=b.scale and a.colour~=b.colour)
 a.anchorMin[1]=0;assert(b.anchorMin[1]==0.5 and a.anchorMax[1]==0.5)
 print('all slot values equal')\n`);
 const result=runLua(file,{timeout:30000});assert.equal(result.status,0,result.stderr);assert.match(result.stdout,/all slot values equal/);
});
test('legacy and disabled monster payloads keep their exact source recipe',()=>{
 assert.equal(typeof monsters.monsterArtPayloadSource,'function');
 for(const input of [null,{enabled:true,status:'legacy',assets:{one:{slots:[]}}}])
  assert.equal(monsters.monsterArtPayloadSource(input),`-- Generated from the bounded native monster registry.\nreturn ${toLua(input??{})}\n`);
});
test('packing rejects unrepresented fields, changed defaults, unsupported types and nonfinite geometry',()=>{
 assert.equal(typeof monsters.monsterArtPayloadSource,'function');
 for(const change of [s=>{s.unknown=1;},s=>{s.scale=[2,1];},s=>{s.anchorMin=[0,.5];},
  s=>{s.imageType='other';},s=>{s.position[0]=NaN;},s=>{s.rotation=[0,0];}]){
  const input=drawing();change(input.assets.one.slots[0]);
  assert.throws(()=>monsters.monsterArtPayloadSource(input),/compact monster slot/);
 }
});
test('official portrait payload omits the unused legacy full body and retains actual assets and inventory',t=>{
 const dir=temporary(t),official=join(dir,'official'),legacy=join(dir,'legacy');mkdirSync(official);mkdirSync(legacy);
 const source=writePortraitModule(official,{officialAssets:true});
 assert(!/\bbattle133=\(function/.test(source),'official profile must not carry replaced 4315-shape drawing');
 const inventory=portraitRuntimeInventory(official);
 assert(inventory.assets.some(a=>a.asset==='traveler-geo/portraits/lumine-native-v1'&&a.images===464));
 assert(inventory.assets.some(a=>a.asset==='lowpolyLumine'&&a.images===1600));
 const file=join(dir,'official-assets.lua');
 writeFileSync(file,`local a=(function()\n${source}\nend)()\nassert(a.battle133==nil)\nassert(a.avatar96.count==4822)\nassert(a.lowpolyLumine.count==1600)\nassert(a.battleApprovedNative.count==464)\nprint('official assets intact')\n`);
 const result=runLua(file,{timeout:30000});assert.equal(result.status,0,result.stderr);assert.match(result.stdout,/official assets intact/);
 assert.match(writePortraitModule(legacy),/\bbattle133=\(function/,'legacy callers retain their original drawing');
});

test('Release capacity history rejects a current source replaced with its predecessor on reread',async()=>{
 const {assertIntegrationSuccessorsCurrent}=await import('./helpers/fork-preflight-source.mjs');
 const archive=readFileSync(new URL('./helpers/release-capacity-source.json.gz',import.meta.url));
 const {files}=JSON.parse(gunzipSync(archive));
 const path='scripts/build-native-candidate.mjs';
 const previous=files[path].before.source;
 assert.doesNotThrow(()=>assertIntegrationSuccessorsCurrent((file,encoding)=>
  files[file]?.before.source??readFileSync(file,encoding)));
 let reads=0;
 const subsequentPredecessor=(file,encoding)=>file===path&&++reads>1?previous:readFileSync(file,encoding);
 assert.throws(()=>assertIntegrationSuccessorsCurrent(subsequentPredecessor),{message:'fresh Release capacity source: '+path});
 assert.equal(reads,2);
});
