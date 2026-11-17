// Exact CI-only composition of the saved enemy repair and actual Release squash.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const hash=b=>createHash('sha256').update(b).digest('hex');
const normalized=s=>typeof s==='string'&&!s.includes('\r\r\n')?s.replaceAll('\r\n','\n'):null;
const packetPath='tests/helpers/release-enemy-capacity-join.json.gz';
const bytes=readFileSync(new URL('./release-enemy-capacity-join.json.gz',import.meta.url));
assert.equal(hash(bytes),'50efd38e755b823866d75b873ae9b74aceb265bf59301d7ed678c79e48485847','complete enemy capacity join packet');
const packet=JSON.parse(gunzipSync(bytes));
assert.deepEqual(packet.parents,{enemy:'2f5335443338cf46e045e47ff9fada215fdef391',release:'00ab3fe6d386f55aecfb063e59aeca2cf5065807'});
for(const [path,row]of Object.entries(packet.files))for(const source of Object.values(row.before).filter(v=>v!==null))
 assert.equal(normalized(source),source,'complete LF predecessor '+path);
// The four executable regression repairs retain their complete d0c82e64 input.
// Only exact current bytes receive this CI-only inverse; all old packets stay fixed.
const regressionTests={
 "tests/sts-style-source-epoch.test.mjs": {
  "current": "edb4b2442afbc83d6d74b3df6a3610708461caa46746a90126cd5c71dc345bec",
  "before": "eb5fa6dad1ad421aa4c565d2e700f91e04b510ae2602c4186c26c0732eb78435",
  "edits": [
   [
    " for(const path of feedbackCiPaths)assert.throws(()=>assertStsStyleCiCurrent(discoverJs(),(p,e)=>{\n  const raw=readFileSync(p,e);return p!==path?raw:typeof raw==='string'?raw+'\\n':Buffer.concat([raw,Buffer.from('\\n')]);\n }),error=>error.code==='ERR_ASSERTION'&&[\n  'fresh complete StS CI source: '+path,'fresh StS helper source: '+path,\n  'fresh complete integration source: enemy capacity '+path,\n ].includes(error.message.split('\\n')[0]),path);\n",
    " for(const path of feedbackCiPaths)assert.throws(()=>assertStsStyleCiCurrent(discoverJs(),(p,e)=>readFileSync(p,e)+(p===path?'\\n':'')),/fresh (?:complete StS CI|StS helper) source/,path);\n"
   ]
  ]
 },
 "tests/native-candidate.test.mjs": {
  "current": "7b4971fe0a5d687c5c3ce4a0a4fbb6253108a1d3b2ac41fed29bc980afac662f",
  "before": "eafc053664014ad68a5a3b5160cc77e34b37761d39928df444e8740652b2a02e",
  "edits": [
   [
    " const {enemyCapacityRead}=await import('./helpers/release-enemy-capacity-join.mjs');\n const capacityRead=enemyCapacityRead('release');\n",
    ""
   ],
   [
    "  const source=capacityRead(file,'utf8').replaceAll('\\r\\n','\\n');assert.equal(sha256(source),row.current.sha256);\n",
    "  const source=readFileSync(file,'utf8').replaceAll('\\r\\n','\\n');assert.equal(sha256(source),row.current.sha256);\n"
   ],
   [
    "   assert.throws(()=>assertIntegratedCurrent((path,encoding)=>path===file?changed:readFileSync(path,encoding)),error=>error.code==='ERR_ASSERTION'&&[\n    'fresh complete integration source: enemy capacity '+file,\n    'fresh complete TASK-111 CI source: default reduction / fresh complete integration source: '+file,\n    'fresh complete TASK-111 CI source: audio handoff / fresh complete integration source: '+file,\n   ].includes(error.message.split('\\n')[0]));\n",
    "   assert.throws(()=>assertIntegratedCurrent((path,encoding)=>path===file?changed:readFileSync(path,encoding)),/fresh complete TASK-111 CI source/);\n"
   ]
  ]
 },
 "tests/platform-load.test.mjs": {
  "current": "b921bfbc713f3159f4ae30399b040c13003387f59722b2a667bc74d8deeea28f",
  "before": "750eaa348c270e8ee2e0a67a480f65cde357f2a9944bc24a78983a8981341198",
  "edits": [
   [
    " const {enemyCapacityRead}=await import('./helpers/release-enemy-capacity-join.mjs');\n const capacityRead=enemyCapacityRead('release');\n",
    ""
   ],
   [
    "  const current=capacityRead(path,'utf8').replaceAll('\\r\\n','\\n');\n",
    "  const current=readFileSync(path,'utf8').replaceAll('\\r\\n','\\n');\n"
   ],
   [
    "   assert.throws(()=>assertIntegratedCurrent((file,encoding)=>file===path?changed:readFileSync(file,encoding)),error=>error.code==='ERR_ASSERTION'&&[\n    'fresh complete integration source: enemy capacity '+path,'fresh complete TASK-111 CI source: '+path,\n   ].includes(error.message.split('\\n')[0]));\n",
    "   assert.throws(()=>assertIntegratedCurrent((file,encoding)=>file===path?changed:readFileSync(file,encoding)),/fresh complete TASK-111 CI source/);\n"
   ],
   [
    "  const current=capacityRead(path,'utf8').replaceAll('\\r\\n','\\n');\n",
    "  const current=readFileSync(path,'utf8').replaceAll('\\r\\n','\\n');\n"
   ],
   [
    "   assert.throws(()=>assertIntegratedCurrent((file,encoding)=>file===path?changed:readFileSync(file,encoding)),error=>error.code==='ERR_ASSERTION'&&[\n    'fresh complete integration source: enemy capacity '+path,'fresh complete TASK-111 CI source: review '+path,\n   ].includes(error.message.split('\\n')[0]));\n",
    "   assert.throws(()=>assertIntegratedCurrent((file,encoding)=>file===path?changed:readFileSync(file,encoding)),/fresh complete TASK-111 CI source/);\n"
   ]
  ]
 },
 "tests/release-card-contact-integration.test.mjs": {
  "current": "fa0061fb8b108beb1befabe3a6cee9a876f350eb9533c65773c87370cd525761",
  "before": "596b443a447ff1af73b47e0adda2b31abf1659ec5f8f6763cf73e364792511a7",
  "edits": [
   [
    "    assert.equal(norm(beforeCapacityB9Ci(path,source.replaceAll('\\n','\\r\\n'))),norm(releaseRead(path,'utf8')));\n",
    "    assert.equal(beforeCapacityB9Ci(path,source.replaceAll('\\n','\\r\\n')),releaseRead(path,'utf8'));\n"
   ],
   [
    "test('regression repairs preserve exact LF parent views and reject fresh missing stale or malformed current inputs',()=>{\n const anchor='scripts/build-ui.mjs';\n for(const path of ['tests/sts-style-source-epoch.test.mjs','tests/native-candidate.test.mjs',\n  'tests/platform-load.test.mjs','tests/release-card-contact-integration.test.mjs']){\n  const current=norm(readFileSync(path,'utf8')),prior=enemyCapacitySource(path,current,'release');\n  assert.notEqual(prior,current,'the executable repair retains a distinct immutable predecessor');\n  assert(!prior.includes('\\r'),'parent view uses exact LF bytes');\n  assert.equal(enemyCapacitySource(path,current.replaceAll('\\n','\\r\\n'),'release'),prior);\n  for(const changed of [null,current+'\\n',prior])assert.throws(()=>enemyCapacityRead('release',(p,e)=>p===path?changed:readFileSync(p,e))(anchor,'utf8'),\n   error=>error.code==='ERR_ASSERTION'&&error.message.split('\\n')[0]==='fresh complete integration source: enemy capacity '+path);\n  for(const foreign of [current+'\\n',current.replaceAll('\\n','\\r\\r\\n'),null,17,Buffer.from(current)]){\n   let reads=0;assert.strictEqual(enemyCapacitySource(path,foreign,'release',{read:()=>{reads++;throw Error('unknown source');}}),foreign);assert.equal(reads,0);\n  }\n  const crcrlf=Buffer.from(current.replaceAll('\\n','\\r\\r\\n'));\n  assert.strictEqual(enemyCapacityRead('release',(p,e)=>p===path?(e?crcrlf.toString():crcrlf):readFileSync(p,e))(path),crcrlf);\n }\n assertEnemyCapacityCurrent();\n});\n\n",
    ""
   ]
  ]
 }
};
function regressionBefore(path,source){
 const row=Object.hasOwn(regressionTests,path)?regressionTests[path]:null,text=normalized(source);
 if(!row||text===null||hash(text)!==row.current)return source;
 let prior=text;for(const [current,before]of row.edits)prior=prior.replace(current,before);
 assert.equal(hash(prior),row.before,'complete d0c82e64 regression predecessor: '+path);
 return prior;
}
export function assertEnemyCapacityCurrent(read=readFileSync){
 assert.equal(hash(read(packetPath)),hash(bytes),'fresh complete integration source: '+packetPath);
 for(const [path,row]of Object.entries(regressionTests)){
  const source=normalized(read(path,'utf8'));
  assert(source!==null&&hash(source)===row.current,'fresh complete integration source: enemy capacity '+path);
 }
 for(const [path,row]of Object.entries(packet.files)){
  const source=normalized(regressionBefore(path,read(path,'utf8')));
  assert(source!==null&&hash(source)===row.current,'fresh complete integration source: enemy capacity '+path);
 }
 for(const [path,digest]of Object.entries(packet.archives))
  assert.equal(hash(path.endsWith('.gz')?read(path):normalized(read(path,'utf8'))),digest,'immutable Release join predecessor: '+path);
}
export function enemyCapacitySource(path,source,side,{read=readFileSync}={}){
 assert(Object.hasOwn(packet.parents,side),'known enemy capacity parent');
 // This is a CI source view, never a production-owner authorization reader.
 if(typeof path!=='string'||path.startsWith('src/')||path.startsWith('data/')||path.startsWith('config/'))return source;
 const prior=regressionBefore(path,source);
 if(prior!==source)assertEnemyCapacityCurrent(read);
 source=prior;
 const row=Object.hasOwn(packet.files,path)?packet.files[path]:null,text=normalized(source);
 if(!row||row.before[side]===null||text===null||hash(text)!==row.current||text===row.before[side])return source;
 assertEnemyCapacityCurrent(read);
 return row.before[side];
}
export function enemyCapacityRead(side,read=readFileSync){
 assert(Object.hasOwn(packet.parents,side),'known enemy capacity parent');
 return(path,encoding)=>{
  const raw=read(path,encoding);
  if(typeof raw!=='string'&&!Buffer.isBuffer(raw))return raw;
  const source=typeof raw==='string'?raw:raw.toString('utf8');
  const prior=enemyCapacitySource(path,source,side,{read});
  return typeof raw==='string'?prior:prior===source?raw:Buffer.from(prior);
 };
}
