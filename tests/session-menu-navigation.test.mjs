import test from 'node:test';
import assert from 'node:assert/strict';
import {runLua} from '../scripts/test-lua.mjs';
import {readFileSync,writeFileSync,unlinkSync,readdirSync} from 'node:fs';
import {sourceEpoch,releaseSourceEpoch} from './helpers/closeout-source-epoch.mjs';
import {toLua} from '../scripts/build-lua-data.mjs';
import {gameLayout} from '../scripts/game-ui-layout.mjs';
import {applyV25MenuLayout,v25MenuRuntimeLayout} from '../scripts/v25-menu-layout.mjs';
import {nativeTheme} from '../scripts/native-ui-theme.mjs';
import {withViewport} from '../scripts/viewport-layout.mjs';
test('session menu preserves live state, confirms destructive actions and uses platform settlement',()=>{
 const r=runLua('tests/lua/session_menu_navigation.lua');
 assert.equal(r.status,0,r.stdout+r.stderr);
 assert.match(r.stdout,/SESSION_MENU_NAVIGATION_PASS 4/);
});
test('reward and mandatory card choices resume with their original live tokens',()=>{
 const r=runLua('tests/lua/session_menu_choices.lua');
 assert.equal(r.status,0,r.stdout+r.stderr);assert.match(r.stdout,/SESSION_MENU_CHOICES_PASS 2/);
});
test('real V25 menu controls support controller round trips without overlapping entries',()=>{
 const path='build/lua/session_menu_v25_layout.lua';
 const layout=withViewport(applyV25MenuLayout(gameLayout(),nativeTheme),nativeTheme);
 const frames={...v25MenuRuntimeLayout,start:nativeTheme.menuPresentation.start,quit:nativeTheme.menuPresentation.quit};
 writeFileSync(path,`return ${toLua({controls:layout.controls,frames})}\n`);
 try{
  const r=runLua('tests/lua/support/session_menu_v25.lua');
  assert.equal(r.status,0,r.stdout+r.stderr);assert.match(r.stdout,/SESSION_MENU_V25_PASS/);
 }finally{unlinkSync(path);}
});

test('menu source continuation retains the complete release corpus and rejects new owner drift',()=>{
 const read=p=>readFileSync(p,'utf8').replaceAll('\r\n','\n');
 const paths=['config/architecture.json',...readdirSync('src/lua').filter(p=>p.endsWith('.lua')).map(p=>'src/lua/'+p)].sort();
 assert.deepEqual(paths,Object.keys(sourceEpoch.proof.current).sort());
 const added=paths.filter(p=>!Object.hasOwn(releaseSourceEpoch.proof.current,p));
 assert.deepEqual(added,['src/lua/abyss_game_ui_navigation.lua','src/lua/abyss_game_ui_navigation_view.lua']);
 for(const p of paths)assert.equal(read(p),sourceEpoch.proof.current[p].source,p);
 for(const p of added){
  assert.equal(sourceEpoch.proof.targets.sessionMenuPrior.files[p],null);
  assert.equal(JSON.parse(read('config/architecture.json')).layers[p.split('/').at(-1).slice(0,-4)],'ui');
 }
 const p='config/architecture.json',current=read(p);
 assert.equal(sourceEpoch.preCombinedSource(p,current,{target:'sessionMenuPrior',readSource:read}),releaseSourceEpoch.proof.current[p].source);
 for(const owner of added){
  assert.throws(()=>sourceEpoch.preCombinedSource(p,current,{target:'sessionMenuPrior',readSource:q=>q===owner?read(q)+'\n':read(q)}),/linked owner identity/);
  assert.throws(()=>sourceEpoch.preCombinedSource(p,current,{target:'sessionMenuPrior',readSource:q=>q===owner?null:read(q)}),/linked owner identity/);
 }
});
