import test from 'node:test';
import assert from 'node:assert/strict';
import {runLua} from '../scripts/test-lua.mjs';
import {readFileSync,writeFileSync,unlinkSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {randomUUID} from 'node:crypto';
import {luaString} from '../scripts/build-lua-data.mjs';

test('generated host starts under native capability guards and rejects the escaped startup write',()=>{
  const source=readFileSync('src/lua/abyss_battle_render_hud.lua','utf8');
  const anchor='hit.raycastTarget=host.options.onPile~=nil and frame.active==true';
  assert.equal(source.split(anchor).length,2,'mutation must target exactly one production line');
  const mutant=source.replace(anchor,'hit.interactable=host.options.onPile~=nil and frame.active==true');
  const entry=join(tmpdir(),`abyss-native-contract-${randomUUID()}.lua`);
  writeFileSync(entry,`ABYSS_NATIVE_MUTANT=${luaString(mutant)}\ndofile('tests/lua/support/native_startup_contract.lua')\n`);
  try {
    const result=runLua(entry);
    assert.equal(result.status,0,result.stdout+result.stderr);
    assert.match(result.stdout,/NATIVE_STARTUP_CONTRACT_PASS/);
  } finally {unlinkSync(entry);}
});

test('fatal native bootstrap failure stops enabled BGM without weakening cleanup or engine teardown',()=>{
  const result=runLua('tests/lua/support/fatal_bgm_stop.lua');
  assert.equal(result.status,0,result.stdout+result.stderr);
  assert.match(result.stdout,/FATAL_BGM_STOP_PASS 8/);
});

test('fatal BGM Release continuation authenticates current owners and preserves the exact predecessor',async()=>{
  const {sourceEpoch}=await import('./helpers/closeout-source-epoch.mjs');
  const path='src/lua/abyss_ui.lua',target='releaseFatalBgmPrior';
  const current=readFileSync(path,'utf8'),before=sourceEpoch.proof.targets[target].files[path].source;
  assert.notEqual(current,before);
  const raw=owner=>readFileSync(owner,'utf8');
  const project=read=>sourceEpoch.preCombinedSource(path,current,{target,readSource:read});
  assert.equal(project(raw),before);
  for(const owner of [path,'src/lua/abyss_battle_card_bindings.lua'])for(const kind of ['missing','null','drift']){
    const read=p=>{
      if(p!==owner)return raw(p);
      if(kind==='missing')throw Error('missing '+p);
      return kind==='null'?null:raw(p)+'\n';
    };
    assert.throws(()=>project(read),undefined,owner+' '+kind);
    assert.equal(project(raw),before);
  }
  const noRead=()=>{throw Error('foreign bytes must not authorize replay');};
  for(const source of [before,current+'\n'])
    assert.equal(sourceEpoch.preCombinedSource(path,source,{target,readSource:noRead}),source);
  assert.equal(sourceEpoch.preCombinedSource(path,current.replaceAll('\n','\r\n'),{target,readSource:raw}),before);
});
