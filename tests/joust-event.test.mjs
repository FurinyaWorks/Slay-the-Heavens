import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {runLua} from '../scripts/test-lua.mjs';

const slices=[['tests/lua/joust_event.lua',[1,2]],['tests/lua/joust_event_slice_2.lua',[3,4,5,6]]];
const cases='tests/lua/support/joust_event_cases.lua';
const read=path=>readFileSync(path,'utf8').replaceAll('\r\n','\n');
const hash=source=>createHash('sha256').update(source).digest('hex');
// git 31005d173d1147b6b370aac832dd5beaf177cdb3:tests/lua/joust_event.lua,
// not a hash of the newly extracted helper. Reconstruct every original byte.
const originalSha256='5ea9fd9e36215c9bfab708f46a2c71eab2d93bb69fe9a0d6afc857e651ec95c1';
const groupsSha256='68fab1c78b15f48264a11dabc9a9592f4c31a1018e9ecc6d00362cf127f64fc5';
const originalDispatcher="local n=0\nlocal function test(name,fn)fn();n=n+1;print('PASS joust '..n..' '..name)end\n";
const slicedDispatcher=`local n,registered=0,0
local function test(name,fn)
 registered=registered+1
 if registered<first or registered>last then return end
 fn();n=n+1;print('PASS joust '..registered..' '..name)
end
`;
const prefix='return function(first,last)\n';
const summary="print('JOUST_EVENT '..n..' passed')\n";
const suffix="assert(registered==6,'all six original Joust groups must remain registered')\n"
 +"assert(n==last-first+1,'Joust slice group coverage')\n"+summary+'end\n';
const retiredJoustIds=[['bet_against','support_challenger'],['bet_for','support_owner'],['betFor','supportsOwner']];
function assertOriginalJoust(source){
 for(const [before,after] of retiredJoustIds) source=source.replaceAll(after,before);
 source=source.replaceAll('\r\n','\n');
 assert.ok(source.startsWith(prefix)&&source.endsWith(suffix),'Joust extraction envelope');
 assert.equal(source.split(slicedDispatcher).length,2,'Joust has one range-only dispatcher');
 const original=source.slice(prefix.length,-suffix.length).replace(slicedDispatcher,originalDispatcher)+summary;
 assert.equal(hash(original),originalSha256,'Joust complete original fixture identity');
 const groups=original.slice(original.indexOf("test('five source"),original.lastIndexOf(summary));
 assert.equal(hash(groups),groupsSha256,'Joust original ordered groups and bodies');
}
function assertJoustCoverage(outputs){
 assert.deepEqual(outputs.map(output=>output.file),slices.map(([file])=>file),'Joust requires both actual entry outputs');
 const union=[];
 for(const [index,{stdout}]of outputs.entries()){
  const [file,expected]=slices[index];
  const ids=[...stdout.matchAll(/^PASS joust (\d+) .+$/gm)].map(match=>Number(match[1]));
  assert.deepEqual(ids,expected,`Joust executed original groups: ${file}`);
  assert.match(stdout,new RegExp(`^JOUST_EVENT ${expected.length} passed$`,'m'));
  union.push(...ids);
 }
 assert.deepEqual(union,[1,2,3,4,5,6],'Joust original groups 1..6 execute exactly once');
}

test('original Joust fixture bytes and ordered group bodies survive range-only extraction',()=>{
 assert.ok(existsSync(cases),'Joust shared original cases must exist');
 const source=read(cases);assertOriginalJoust(source);assertOriginalJoust(source.replaceAll('\n','\r\n'));
 for(const [file,ids]of slices)assert.equal(read(file),`dofile('${cases}')(${ids[0]},${ids.at(-1)})\n`,'Joust entry only selects a complete original group range');
});
test('original Joust identity rejects seed, assertion, helper and group-order drift',()=>{
 assert.ok(existsSync(cases),'Joust shared original cases must exist');
 const source=read(cases);
 const first=source.indexOf("test('five source"),second=source.indexOf("test('source boolean"),third=source.indexOf("test('stale funds");
 const mutations=[
  source.replace('for seed=0,31 do','for seed=0,30 do'),
  source.replace('for seed=0,15 do','for seed=0,14 do'),
  source.replace("{'support_challenger','support_owner'}","{'support_challenger'}"),
  source.replace("eq(why,'transaction_failed');same(r,before)","eq(why,'transaction_failed')"),
  source.replace('eq(r.nodeFlow,flow);eq(r.nodeFlow.event,event)','eq(r.nodeFlow,flow)'),
  source.replace('r.gold=100','r.gold=101'),
  source.slice(0,first)+source.slice(second,third)+source.slice(first,second)+source.slice(third),
  source.replace(' if registered<first or registered>last then return end',' if registered<=first or registered>last then return end'),
 ];
 for(const mutation of mutations){assert.notEqual(mutation,source);assert.throws(()=>assertOriginalJoust(mutation),/Joust/);}
});
test('Joust coverage guard rejects missing slices, duplicate groups and range drift',()=>{
 const outputs=slices.map(([file,ids])=>({file,stdout:ids.map(id=>`PASS joust ${id} original group\n`).join('')+`JOUST_EVENT ${ids.length} passed\n`}));
 assertJoustCoverage(outputs);
 for(const mutation of [outputs.slice(0,1),[outputs[0],outputs[0]],
  [outputs[0],{...outputs[1],stdout:outputs[1].stdout.replace('PASS joust 3','PASS joust 2')}],
  [outputs[0],{...outputs[1],stdout:outputs[1].stdout.replace('PASS joust 6 original group\n','')}],
  [outputs[0],{...outputs[1],stdout:outputs[1].stdout.replace('JOUST_EVENT 4 passed','JOUST_EVENT 6 passed')}],
 ])assert.throws(()=>assertJoustCoverage(mutation));
});
test('Joust preserves five screens, exact RNG timing, payout rules and rollback',()=>{
 const outputs=slices.map(([file])=>{
  const started=performance.now(),result=runLua(file);
  assert.equal(result.status,0,result.stdout+result.stderr);
  console.log(`Joust entry ${file}: ${(performance.now()-started).toFixed(3)} ms (original 30000 ms budget)`);
  return {file,stdout:result.stdout};
 });
 assertJoustCoverage(outputs);
});

// M7: exercise the complete event responsibility, including future helpers.
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {requireLuaTool} from '../scripts/setup-lua-static.mjs';
import {parseDiagnostics,reviewResponsibilityComplexity} from '../scripts/check-lua-static.mjs';
import {joustTrace} from './helpers/joust-trace.mjs';
const joustPath='src/lua/abyss_joust_event.lua';
const joustBefore=read('tests/fixtures/joust-event-before.lua');
// Replay the old reducer with the approved display text so that the full
// graph comparison still detects unrelated field changes and numeric drift.
const releaseCopy=[
 ['两名决斗者拦住去路，邀请你观看一场比试。','两名决斗者正在准备比试，邀请你担任一方的后勤助手。'],
 ['听取比试和下注规则。','了解后勤委托的费用和报酬。'],
 ['押挑战者','协助挑战者'],
 ['押庄园主','协助庄园主'],
 ['支付50金币；若','支付50金币购置补给；若'],
 ['查看胜者及下注结果。','查看比试结果和委托报酬。'],
 ['你已下注，决斗者准备开始比试。','补给已交付，决斗者准备开始比试。'],
 ['你押中了胜者，获得','你协助的一方获胜，获得'],
 ['你押下的金币归对方所有。','你协助的一方落败，本次委托没有报酬。'],
 ['挑战者胜出可获得100金币，庄园主胜出可获得250金币；每次下注50金币。','为任意一方购置补给需50金币。协助挑战者获胜可得100金币，协助庄园主获胜可得250金币。'],
];
const joustBeforeWithReleaseCopy=releaseCopy.reduce((source,[before,after])=>{
 assert(source.includes(before),before);
 return source.replaceAll(before,after);
},retiredJoustIds.reduce((source,[before,after])=>source.replaceAll(before,after),joustBefore));

const joustErrors=(source,rows)=>reviewResponsibilityComplexity(rows,{[joustPath]:source}).errors.filter(e=>e.file===joustPath);
function measureJoust(source){
 const dir=mkdtempSync(join(tmpdir(),'joust-cc-'));
 try{
  const file=join(dir,'joust.lua');writeFileSync(file,source);
  const result=spawnSync(requireLuaTool().file,[file,'--formatter','plain','--codes','--ranges','--no-color',
   '--max-cyclomatic-complexity','0','--only','561'],{encoding:'utf8',timeout:10000});
  assert.ifError(result.error);assert([0,1].includes(result.status),result.stdout+result.stderr);
  assert.equal(result.stderr,'');return parseDiagnostics(result.stdout).map(row=>({...row,file:joustPath}));
 }finally{rmSync(dir,{recursive:true,force:true});}
}
test('Joust complete module meets CC15 and retains the immutable baseline',()=>{
 assert.equal(hash(joustBefore),'c579ccb9efe508634e712388ccdf1ac61b54295922f59b89f47f032be2ea1a04');
 const rows=measureJoust(read(joustPath));
 assert(rows.length>=5);assert(rows.every(row=>Number(row.message.match(/\((\d+) > 0\)/)[1])<=15),JSON.stringify(rows));
 assert.deepEqual(joustErrors(read(joustPath),rows),[]);
 console.log('JOUST_COMPLEXITY '+JSON.stringify(rows));
});
test('Joust stages preserve independent old/new graph, RNG, callback and failure traces',()=>{
 const old=joustTrace(joustBeforeWithReleaseCopy),current=joustTrace(read(joustPath));
 assert(old.length>100);assert.deepEqual(current,old);
 console.log('JOUST_TRACE '+JSON.stringify({checkpoints:old.length,sha256:hash(JSON.stringify(old))}));
});
test('Joust hard gate rejects old hotspot, future helpers, anonymous functions and chunk regressions',()=>{
 const source=read(joustPath),current=measureJoust(source);
 assert(joustErrors(joustBefore,measureJoust(joustBefore)).some(e=>e.message.includes('23 exceeds 15')));
 const branches=Array.from({length:16},(_,i)=>`if probe==${i} then probe=${i+1} end`).join('\n');
 for(const extra of [`local probe=0\n${branches}\n`,
  `local function futureHelper(probe)\n${branches}\nend\n`,
  `local futureHelper=function(probe)\n${branches}\nend\n`]){
  const mutant=source.replace('\nreturn M','\n'+extra+'return M');assert.notEqual(mutant,source);
  assert(joustErrors(mutant,measureJoust(mutant)).some(e=>e.message.includes('exceeds 15')));
 }
 assert(joustErrors(source,current.slice(1)).some(e=>e.message.includes('Incomplete')));
 assert(joustErrors(source,[...current,current[1]]).some(e=>e.message.includes('Duplicate')));
 assert(joustErrors(source,current.map((r,i)=>i===1?{...r,column:r.column+1}:r)).some(e=>e.message.includes('AST')));
});
test('Joust real semantic mutations change the trace or fail a named assertion',()=>{
 const source=read(joustPath),expected=joustTrace(joustBeforeWithReleaseCopy);
 for(const [from,to]of [
  ['math.max(0,run.gold-50)','math.max(0,run.gold-49)'],
  ['Random.randomBooleanChance(run.miscRng,OWNER_CHANCE)','not Random.randomBooleanChance(run.miscRng,OWNER_CHANCE)'],
  ['event.supportsOwner and 250 or 100','event.supportsOwner and 251 or 100'],
  ["event.stage='complete'","event.stage='halt'"],
  ['uid~=nil','uid'],
 ]){
  assert.equal(source.split(from).length,2,from+' unique mutation');
  let result;
  try{result=joustTrace(source.replace(from,to));}
  catch(error){assert.match(error.message,/:\d+: (valid payout|UID rejection before stage effects|partial payout failure)$/);continue;}
  assert.notDeepEqual(result,expected,from);
 }
});
