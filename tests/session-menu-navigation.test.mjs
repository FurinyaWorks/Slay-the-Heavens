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
import {gunzipSync,gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
test('session menu preserves live state, confirms destructive actions and uses platform settlement',()=>{
 const r=runLua('tests/lua/session_menu_navigation.lua');
 assert.equal(r.status,0,r.stdout+r.stderr);
 assert.match(r.stdout,/SESSION_MENU_NAVIGATION_PASS 4/);
});

test('deck notification continuation preserves immutable menu sources and authenticates both exact current owners',()=>{
 const hash=s=>createHash('sha256').update(s).digest('hex');
 const {continuation,...menu}=JSON.parse(gunzipSync(readFileSync('tests/helpers/session-menu-source-epoch.json.gz')));
 assert.equal(hash(gzipSync(JSON.stringify(menu))),'ee5c239203d26701a31b1a5b71db4aa984c664db6b2bcc2482007f567ff94f52');
 const proof=sourceEpoch.proof,read=p=>readFileSync(p,'utf8').replaceAll('\r\n','\n');
 assert.equal(proof.currentCommit,'aa2060671da1bfd5b7151c48ae8babf7b38d5640');
 assert.equal(proof.owners.length,116);assert.equal(Object.keys(proof.current).length,352);
 for(const p of Object.keys(continuation.current)){
  assert.deepEqual(proof.targets.sessionMenuReviewed.files[p],menu.current[p]);
  assert.deepEqual(continuation.before[p],menu.current[p]);
  assert.equal(proof.current[p].source,read(p));
  assert.equal(sourceEpoch.preCombinedSource(p,read(p),{target:'sessionMenuReviewed',readSource:read}),menu.current[p].source);
  for(const owner of Object.keys(continuation.current))for(const replacement of [null,read(owner)+'\n'])
   assert.throws(()=>sourceEpoch.preCombinedSource(p,read(p),{target:'sessionMenuReviewed',readSource:q=>q===owner?replacement:read(q)}),/linked owner identity/);
  const foreign=read(p)+'\n';let reads=0;
  assert.equal(sourceEpoch.preCombinedSource(p,foreign,{target:'sessionMenuReviewed',readSource:()=>{reads++;return null;}}),foreign);
  assert.equal(reads,0);
 }
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
