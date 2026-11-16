import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {luaString} from '../scripts/build-lua-data.mjs';
import {originalV4ToLua} from '../scripts/build-original-v4.mjs';
import {runLua} from '../scripts/test-lua.mjs';

for(const [name,encode] of [['content',luaString],['frozen V4',originalV4ToLua]]){
 test(name+' emits UTF8 without redundant decimal byte expansion',()=>{
  const value='旅行者 胡桃 😀';
  assert.equal(encode(value),'"'+value+'"');
  assert.equal(Buffer.byteLength(encode(value)),Buffer.byteLength(value)+2);
 });
 test(name+' preserves every control byte, DEL, following digits and literal escape syntax in Lua',()=>{
  const dir=mkdtempSync(join(tmpdir(),'lua-capacity-'));
  try{
   const controls=Array.from({length:32},(_,n)=>String.fromCharCode(n)+'123').join('');
   const value=controls+'\x7f9"\\123\\u{41}\\z\r\n中文 😀 \u2028\u2029 end return os.exit(9) --';
   const script=join(dir,'roundtrip.lua');
   writeFileSync(script,`local s=${encode(value)}\nfor i=1,#s do io.write(string.format('%02x',string.byte(s,i))) end`);
   const result=runLua(script);
   assert.equal(result.status,0,result.stderr);
   assert.equal(result.stdout,Buffer.from(value).toString('hex'));
   assert.throws(()=>encode('\ud800'),/well-formed Unicode/);
  }finally{rmSync(dir,{recursive:true,force:true});}
 });
}
