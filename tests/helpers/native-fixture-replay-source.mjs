import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';

const sha256=source=>createHash('sha256').update(source).digest('hex');
const blob=source=>createHash('sha1').update(`blob ${Buffer.byteLength(source)}\0`).update(source).digest('hex');
const archive=readFileSync(new URL('./native-fixture-replay-source.json.gz',import.meta.url));
assert.equal(sha256(archive),'5743ecc4139667a78cea2871f25679aa05d400a9deadccb702d0196ed06bd52a','exact native fixture replay archive');
const {schemaVersion,base,files}=JSON.parse(gunzipSync(archive));
assert.equal(schemaVersion,1);
assert.equal(base,'67fc8750dd6ef9a13067c6a43137f910b6a44228');
assert.deepEqual(Object.keys(files),[
 'tests/lua/game_ui_timer_safety.lua',
 'tests/lua/geo_public_entry.lua',
 'tests/lua/map_ui_chapters.lua',
 'tests/lua/support/native_card_art_contexts.lua',
 'tests/lua/support/native_card_art_fallback_ownership.lua',
 'tests/lua/support/native_card_art_runtime_contexts.lua',
]);
for(const [path,{before,after}] of Object.entries(files)){
 for(const row of [before,after]){
  assert.equal(row.source,row.source.replaceAll('\r\n','\n'),path+' exact LF source');
  assert.equal(sha256(row.source),row.sha256,path+' exact source SHA256');
  assert.equal(blob(row.source),row.gitBlob,path+' exact source Git blob');
 }
 assert.notEqual(before.gitBlob,after.gitBlob,path+' distinct source epochs');
}

function currentSource(source,after){
 return typeof source==='string'&&!source.includes('\r\r\n')&&source.replaceAll('\r\n','\n')===after.source;
}

export function assertNativeFixturesCurrent(read){
 for(const [path,{after}] of Object.entries(files))
  assert(currentSource(read(path,'utf8'),after),'fresh complete native fixture source: '+path);
}

export function beforeNativeFixtureReplay(path,source){
 if(!Object.hasOwn(files,path))return source;
 const {before,after}=files[path];
 if(!currentSource(source,after))return source;
 return source.includes('\r\n')?before.source.replaceAll('\n','\r\n'):before.source;
}
