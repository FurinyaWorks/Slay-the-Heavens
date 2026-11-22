import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {luaString} from '../scripts/build-lua-data.mjs';
import {runLua} from '../scripts/test-lua.mjs';

const fixture='tests/lua/pointer_cover_ownership.lua';

test('page covers reject delayed mouse and touch callbacks across menu, combat, choice, and shop', () => {
  const result=runLua(fixture);
  assert.equal(result.status,0,result.stdout+result.stderr);
  assert.match(result.stdout,/POINTER_COVER_OWNERSHIP_PASS/);
});

test('sharing platform input callbacks across hosts bypasses the covered host', t => {
  const source=readFileSync('src/lua/abyss_game_ui.lua','utf8');
  const isolation='platform=setmetatable({},{__index=platform})';
  assert.equal(source.split(isolation).length,2);
  const directory=mkdtempSync(join(tmpdir(),'abyss-pointer-cover-mutation-'));
  t.after(()=>rmSync(directory,{recursive:true,force:true}));
  const script=join(directory,'shared-host.lua');
  writeFileSync(script,`package.preload.abyss_game_ui=function()return assert(load(${luaString(source.replace(isolation,''))},'@shared-platform'))()end
assert(loadfile(${luaString(fixture)}))('shared-host')\n`);
  const result=runLua(script);
  assert.notEqual(result.status,0);
  assert.match(result.stderr,/shared platform let Host B bypass Host A cover/);
});
