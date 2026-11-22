import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';

const sha256=source=>createHash('sha256').update(source).digest('hex');
const blob=source=>createHash('sha1').update(`blob ${Buffer.byteLength(source)}\0`).update(source).digest('hex');
const archive=readFileSync(new URL('./native-fixture-replay-source.json.gz',import.meta.url));
assert.equal(sha256(archive),'47bd373dbd725d8a5fec37b881d484e891b9788c696b6f5c22baefbacacdbd2c','exact native fixture replay archive');
const {schemaVersion,base,inputRetirementHead,files}=JSON.parse(gunzipSync(archive));
assert.equal(schemaVersion,1);
assert.equal(base,'67fc8750dd6ef9a13067c6a43137f910b6a44228');
assert.equal(inputRetirementHead,'392fae8d8dee2bd57829dda0e8da836f45107398');
assert.deepEqual(Object.keys(files),[
 'tests/lua/game_ui_timer_safety.lua',
 'tests/lua/geo_public_entry.lua',
 'tests/lua/map_ui_chapters.lua',
 'tests/lua/support/native_card_art_contexts.lua',
 'tests/lua/support/native_card_art_fallback_ownership.lua',
 'tests/lua/support/native_card_art_runtime_contexts.lua',
 'tests/native-ui-theme.test.mjs',
]);
assert.deepEqual(Object.keys(files).filter(path=>files[path].inputRetirement),[
 'tests/lua/game_ui_timer_safety.lua','tests/native-ui-theme.test.mjs',
]);
for(const [path,{before,after,inputRetirement}] of Object.entries(files)){
 for(const row of [before,after,inputRetirement].filter(Boolean)){
  assert.equal(row.source,row.source.replaceAll('\r\n','\n'),path+' exact LF source');
  assert.equal(sha256(row.source),row.sha256,path+' exact source SHA256');
  assert.equal(blob(row.source),row.gitBlob,path+' exact source Git blob');
 }
 assert.notEqual(before.gitBlob,after.gitBlob,path+' distinct source epochs');
 if(inputRetirement){
  assert.notEqual(inputRetirement.gitBlob,before.gitBlob,path+' distinct upstream source epoch');
  assert.notEqual(inputRetirement.gitBlob,after.gitBlob,path+' distinct composed source epoch');
 }
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

// Restore #899's complete post-retirement fixture before its own historical inverse.
export function beforeNativeFixtureInputRetirement(path,source,{requireCurrent=false}={}){
 if(!Object.hasOwn(files,path)||!files[path].inputRetirement)return source;
 const {after,inputRetirement}=files[path],current=currentSource(source,after);
 if(requireCurrent)assert(current,'fresh composed input retirement fixture: '+path);
 if(!current)return source;
 return source.includes('\r\n')?inputRetirement.source.replaceAll('\n','\r\n'):inputRetirement.source;
}
