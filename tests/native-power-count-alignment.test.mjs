import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {runLua} from '../scripts/test-lua.mjs';
import {luaString} from '../scripts/build-lua-data.mjs';
import {nativePowerCountPath as path} from './helpers/native-power-count-historical-source.mjs';
const read=p=>readFileSync(p,'utf8').replaceAll('\r\n','\n');
const before=read('tests/fixtures/native-power-count-before.lua'),after=read('tests/fixtures/native-power-count-after.lua');

test('current native Power right-top budget preserves real Host state, signed values and callback ownership',()=>{
 assert.equal(read(path),after);
 const r=runLua('tests/lua/native_power_count_alignment.lua');
 assert.equal(r.status,0,r.stdout+r.stderr);assert.match(r.stdout,/NATIVE_POWER_COUNT_ALIGNMENT_PASS 90/);
});
test('complete old source is a real failing direction oracle in an independent fresh VM',()=>{
 const folder=mkdtempSync(join(tmpdir(),'native-count-direction-'));
 try{
  const entry=join(folder,'old.lua');writeFileSync(entry,`package.preload.abyss_monster_power_view=assert(load(${luaString(before)},'@frozen-power-before'))\ndofile('tests/lua/native_power_count_alignment.lua')\n`);
  const r=runLua(entry);assert.notEqual(r.status,0);assert.match(r.stderr,/NATIVE_POWER_RIGHT_TOP/);
 }finally{rmSync(folder,{recursive:true,force:true});}
});
