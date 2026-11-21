// Capture real generated UI via the production Lua writers; explicit state fixture.
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import assert from 'node:assert/strict';
import {buildUI} from '../../scripts/build-ui.mjs';
import {buildLuaData,luaString} from '../../scripts/build-lua-data.mjs';
const out=resolve(process.argv[2]);mkdirSync(out,{recursive:true});
const generated=join(out,'generated');buildLuaData('data',join(generated,'abyss_data.lua'));buildUI(generated,undefined,{officialAssets:true,nativePageLifecycle:true});
const before=spawnSync('git',['show','9aa83560:src/lua/abyss_battle_render_hud.lua'],{encoding:'utf8'});assert.equal(before.status,0);writeFileSync(join(out,'before-hud.lua'),before.stdout);
const scenes=[];
for(const previous of [false,true]){
 const code=`package.path=${luaString(generated+'/?.lua;src/lua/?.lua')}
 ${previous?`package.preload.abyss_battle_render_hud=assert(loadfile(${luaString(join(out,'before-hud.lua'))}))`:''}
 local F=dofile('tests/lua/support/game_ui_fixture.lua')
 local V=dofile('scripts/official-assets-preview.lua')
 local ui,root=F.fixture()
 assert(F.start(ui))
 assert(ui.mapUI:choose(F.Nodes.available(ui.run,ui.map)[1].id));ui:update(1)
 assert(ui.run.phase=='combat')
 local battle=ui.run.combat
 for _,energy in ipairs(${previous?'{0}':'{3,0,3}'})do
  battle.energy=energy;ui:refresh()
  V.capture('${previous?'previous':'corrected'}-'..#V.scenes..'-'..energy,ui,root,'Controlled real Combat energy fixture; production UI render; not official client')
  assert(battle.energy==energy)
 end
 V.print()`;
 const r=spawnSync(process.execPath,[createRequire(import.meta.url).resolve('fengari-node-cli/src/lua-cli.js'),'-e',code],{encoding:'utf8',maxBuffer:64*1024*1024,timeout:120000});
 writeFileSync(join(out,previous?'before-capture.log':'capture.log'),r.stdout+r.stderr);assert.equal(r.status,0,r.stdout+r.stderr);
 scenes.push(...JSON.parse(r.stdout.split('\n').find(l=>l.startsWith('OFFICIAL_VISUAL_SCENES ')).slice('OFFICIAL_VISUAL_SCENES '.length)));
}
writeFileSync(join(out,'scenes.json'),JSON.stringify(scenes));
console.log('ENERGY_REAL_LUA_CAPTURE',scenes.map(s=>s.name));
