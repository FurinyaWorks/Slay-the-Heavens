import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {buildLuaData,luaString} from '../scripts/build-lua-data.mjs';
import {buildUI} from '../scripts/build-ui.mjs';

const require=createRequire(import.meta.url);

test('official Host paints a destination room once, gates pending assets and retains page fade',t=>{
 const output=mkdtempSync(join(tmpdir(),'develop-map-room-'));
 t.after(()=>rmSync(output,{recursive:true,force:true}));
 buildLuaData('data',join(output,'abyss_data.lua'));
 buildUI(output,undefined,{officialAssets:true});
 const paths=luaString(output.replaceAll('\\','/')+'/?.lua;src/lua/?.lua;');
 const source=`package.path=${paths}..package.path\ndofile('tests/lua/support/map_room_reveal.lua')`;
 const result=spawnSync(process.execPath,[require.resolve('fengari-node-cli/src/lua-cli.js'),'-e',source],
  {encoding:'utf8',timeout:60000,maxBuffer:2*1024*1024});
 assert.equal(result.status,0,result.stdout+result.stderr+String(result.error??''));
 assert.match(result.stdout,/MAP_ROOM_REVEAL_PASS/);
});
