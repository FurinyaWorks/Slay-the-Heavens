import test from 'node:test';
import assert from 'node:assert/strict';
import {runLua} from '../scripts/test-lua.mjs';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {preFatalBgmStopSource,fatalBgmCurrentSource} from './helpers/fatal-bgm-stop-source-inverse.mjs';
import {createSourceEpochProjector} from './helpers/combined-epoch/source-epoch-runtime.mjs';

const entry='src/lua/abyss_ui.lua',other='src/lua/abyss_bgm.lua';
const before=readFileSync('tests/fixtures/fatal-bgm-stop-before.lua','utf8').replaceAll('\r\n','\n');
const after=readFileSync('tests/fixtures/fatal-bgm-stop-after.lua','utf8').replaceAll('\r\n','\n');
const bind=source=>({source,sha256:createHash('sha256').update(source).digest('hex')});
function projector(){
 return createSourceEpochProjector({schemaVersion:1,normalization:'LF',currentCommit:'a'.repeat(40),
  owners:[entry,other],current:{[entry]:bind(before),[other]:bind('return true\n')},
  targets:{prior:{commit:'b'.repeat(40),files:{[entry]:bind('return nil\n'),[other]:bind('return false\n')}}}});
}

test('entry projection accepts only the complete pinned file and preserves unknown bytes',()=>{
 assert.equal(readFileSync(entry,'utf8').replaceAll('\r\n','\n'),fatalBgmCurrentSource.after,'fresh production source matches current witness');
 assert.equal(preFatalBgmStopSource(entry,after),before);
 assert.equal(preFatalBgmStopSource(entry,after.replaceAll('\n','\r\n')),before);
 for(const source of [before,after+'\n',after.replace('fatalMusic=nil','fatalMusic=false'),after.slice(0,-30)])
  assert.equal(preFatalBgmStopSource(entry,source),source);
 assert.equal(preFatalBgmStopSource(other,after),after);
});

test('current release continuation retains all readiness changes and rejects unknown entry bytes',()=>{
 const {before,after}=fatalBgmCurrentSource;
 assert.equal(preFatalBgmStopSource(entry,after),before);
 assert.equal(preFatalBgmStopSource(entry,after.replaceAll('\n','\r\n')),before);
 assert.match(before,/local artFailures=\{\}/);
 assert.match(after,/presentationReady=presentationReady,presentationPage=presentationPage/);
 for(const source of [before,after+'\n',after.replace('fatalMusic=nil','fatalMusic=false'),after.slice(0,-30)])
  assert.equal(preFatalBgmStopSource(entry,source),source);
 assert.equal(preFatalBgmStopSource(other,after),after);
});

test('each source projection authenticates fresh owners and rejects entry changes within and between calls',()=>{
 const epoch=projector(),sources={[entry]:after,[other]:'return true\n'};
 const read=path=>sources[path];
 const project=source=>epoch.preCombinedSource(entry,source,{target:'prior',readSource:read});
 assert.equal(project(after),'return nil\n');
 sources[entry]=before;assert.throws(()=>project(after),/entry changed during owner validation/);
 sources[entry]=after;assert.throws(()=>project(before),/entry changed during owner validation/);
 sources[entry]=before;assert.equal(project(before),'return nil\n','pure historical epoch remains usable');
 sources[entry]=after;assert.equal(project(after),'return nil\n');
 for(const mutation of [after+'\n-- drift\n',undefined]){
  sources[entry]=mutation;assert.throws(()=>project(after),/entry changed|linked owner/);
 }
 sources[entry]=after;sources[other]='return false\n';assert.throws(()=>project(after),/linked owner identity/);
 sources[other]=undefined;assert.throws(()=>project(after),/linked owner identity/);
 sources[other]='return true\n';assert.equal(project(after),'return nil\n','fresh valid owners recover after rejected warm calls');
 let reads=0;
 assert.equal(epoch.preCombinedSource(entry,after+'\n',{target:'prior',readSource:()=>{reads++;throw Error('must not read');}}),after+'\n');
 assert.equal(reads,0,'foreign entry cannot authorize linked reads');
});

test('fatal native bootstrap failure stops enabled BGM without weakening cleanup or engine teardown',()=>{
  const result=runLua('tests/lua/fatal_bgm_stop.lua');
  assert.equal(result.status,0,result.stdout+result.stderr);
  assert.match(result.stdout,/FATAL_BGM_STOP_PASS 8/);
});
