import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {exactSourceMatches} from './source-fingerprint.mjs';
import {beforeUiEntranceWitness} from './ui-entrance-source.mjs';

const archive=readFileSync(new URL('./native-flow-fixture-source.json.gz',import.meta.url));
assert.equal(createHash('sha256').update(archive).digest('hex'),'5709c250f1411a9edbdaa6669bf0d39bfecc824841684b7948eba3297d5aea35','exact native flow fixture archive');
const {base,files}=JSON.parse(gunzipSync(archive));
assert.equal(base,'0461bcd30dac18818318cbafa77ad72fad069e0a');
assert.deepEqual(Object.keys(files),[
 'scripts/potion-discard-layout.mjs',
 'src/lua/abyss_match_event_ui.lua',
 'tests/helpers/replay-reviewed-selection.mjs',
 'tests/lua/formal_campaign_entry.lua',
 'tests/lua/full_source_campaign_entry.lua',
 'tests/lua/support/native_monster_only_entry.lua',
 'tests/official-assets-runtime.test.mjs',
 'tests/official-assets.test.mjs',
 'tests/official-battle-pile-layout.test.mjs',
 'tests/readable-unit-typography-inverse.test.mjs',
 'tests/sts-character-browser.test.mjs',
 'tests/sts-selection-fade.test.mjs',
]);
for(const [path,{before,after}] of Object.entries(files)){
 assert(exactSourceMatches(before.source,before),path+' exact native flow predecessor');
 assert.match(after.sha256,/^[a-f0-9]{64}$/);
 assert.match(after.gitBlob,/^[a-f0-9]{40}$/);
 assert.notEqual(before.gitBlob,after.gitBlob);
}

// Approved release backflows and the v2.2.0 confirmation fixture supersede these witnesses.
const releaseFixtures=Object.freeze({
 'scripts/potion-discard-layout.mjs':{
  sha256:'76d82e1933ec00aca5cf18a4b4fdbcd9f794be17f99fb56e7fd66d6a5728fed4',gitBlob:'ef706fa822ee91fc3302fc39b2b41bc33bc54ca4',
 },
 'tests/lua/support/native_monster_only_entry.lua':{
  sha256:'0c192425a730c27bab65e5ebc18fc340c9b2414e8558485922041e01fbaf00c1',gitBlob:'29e0bb8b789624f2128780c7711d122bb0687368',
 },
 'tests/official-assets-runtime.test.mjs':{
  sha256:'fd43e53300bdb0f7f178a6887a0e8a5a7c329ad5d0075b7a99a5d343c6f390b7',gitBlob:'b7b75635e0ead0544e430a94f110315b5e81f2ea',
 },
 'tests/sts-character-browser.test.mjs':{
  sha256:'a8c371980710a7824aff8328cf5c041b06b1199eea548cb4e51b17668a7d40dc',gitBlob:'be5b6ad2bc339cfc227818355a4505b94f88ddf9',
 },
 'tests/sts-selection-fade.test.mjs':{
  sha256:'d8dffaece4dc46ca98ec9c594fdd839d19bfe50d39ce0c9adff1cd3cf2fcea59',gitBlob:'11ff711ede191ccd9d1c73fc1e9cf1a8ae07c1ec',
 },
});

export function beforeNativeFlowFixture(path,source,{requireCurrent=false}={}){
 if(!Object.hasOwn(files,path))return source;
 source=beforeUiEntranceWitness(path,source);
 const {before,after}=files[path];
 const current=exactSourceMatches(source,after)||Object.hasOwn(releaseFixtures,path)&&exactSourceMatches(source,releaseFixtures[path]);
 if(requireCurrent)assert(current,'fresh complete native flow fixture: '+path);
 if(!current)return source;
 return source.includes('\r\n')?before.source.replaceAll('\n','\r\n'):before.source;
}

export function assertNativeFlowFixturesCurrent(read){
 for(const [path,{after}] of Object.entries(files)){
  const source=read(path,'utf8');
  assert(exactSourceMatches(source,releaseFixtures[path]??after),'fresh complete native flow fixture: '+path);
 }
}
