import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';import cp from 'node:child_process';
import {packet,assertCurrent,ciSource,jointRead} from './690-outer-runtime.mjs';
const hash=s=>createHash('sha256').update(s).digest('hex');let checks=0;assertCurrent();checks++;
// Independently resolve original Git side blobs, not the captured expected values.
for(const [side,ref]of Object.entries(packet.inputs))for(const [path,row]of Object.entries(packet.files))if(row.views[side]){
 const actual=cp.execFileSync('git',['show',ref+':'+path],{encoding:'utf8',maxBuffer:30e6}).replaceAll('\r\n','\n');
 assert.equal(hash(actual),row.views[side],side+':'+path);checks++;
}
const anchor='tests/ci-complete-calibration.test.mjs',source=readFileSync(anchor,'utf8');
for(const side of ['navigation','pc22']){
 const expected=packet.sources[packet.files[anchor].views[side]];assert.equal(ciSource(anchor,source,side),expected);checks++;
 assert.equal(jointRead(side)(anchor,'utf8'),expected);checks++;
 assert.equal(jointRead(side)(anchor).toString(),expected);checks++;
 const prod='src/lua/abyss_card_flow.lua',raw=readFileSync(prod,'utf8');assert.equal(ciSource(prod,raw,side),raw);checks++;
 assert.equal(jointRead(side,readFileSync,{productionView:true})(prod,'utf8'),packet.sources[packet.files[prod].views[side]]);checks++;
 for(const path of ['src/lua/abyss_card_flow.lua','src/lua/abyss_game_ui_input.lua','tests/helpers/navigation-map-integration.mjs','tests/helpers/release-pc22-basic-feedback-source.json.gz','tests/helpers/release-card-contact-integration.mjs','tests/helpers/release-card-contact-integration.json','tests/helpers/combined-epoch/source-epoch-runtime.mjs','tests/helpers/ci-fast-migration.json','docs/reviews/node-ui-refactor-sources-20261029.json.gz','tests/fixtures/max-hp-accepted-source-inverse.json',Object.keys(packet.archives)[0]]){
  let bad=false;const read=(p,e)=>{const raw=readFileSync(p,e);return bad&&p===path?typeof raw==='string'?raw+'\n':Buffer.concat([raw,Buffer.from('\n')]):raw;};
  const reader=jointRead(side,read);assert.equal(reader(anchor,'utf8'),expected);checks++;bad=true;
  assert.throws(()=>reader(anchor,'utf8'));checks++;assert.throws(()=>ciSource(anchor,source,side,read));checks++;
  bad=false;assert.equal(reader(anchor,'utf8'),expected);checks++;
  assert.throws(()=>ciSource(anchor,source,side,(p,e)=>{if(p===path)throw Error('missing '+p);return readFileSync(p,e);}));checks++;
 }
 for(const value of [source+'\n',source.slice(1),source.replaceAll('\n','\r\r\n'),Buffer.from(source),null,{},7]){
  let reads=0;assert.equal(ciSource(anchor,value,side,()=>{reads++;throw Error('foreign IO');}),value);assert.equal(reads,0);checks+=2;
 }
 let reads=0;assert.equal(ciSource('__proto__',source,side,()=>{reads++;throw Error('foreign IO');}),source);assert.equal(reads,0);checks+=2;
}
const crlf=(p,e)=>{const raw=readFileSync(p,e);return typeof raw==='string'?raw.replaceAll('\r\n','\n').replaceAll('\n','\r\n'):raw;};assertCurrent(crlf);checks++;
assert.throws(()=>assertCurrent((p,e)=>p==='src/lua/abyss_card_flow.lua'?readFileSync(p):readFileSync(p,e)));checks++;
console.log(JSON.stringify({result:'PASS',checks,files:Object.keys(packet.files).length,archives:Object.keys(packet.archives).length,stage:'consumers not integrated'}));
