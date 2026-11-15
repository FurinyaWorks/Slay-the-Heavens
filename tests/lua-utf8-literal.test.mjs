import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {luaString,toLua} from '../scripts/build-lua-data.mjs';
import {originalV4ToLua} from '../scripts/build-original-v4.mjs';
import {utf8LuaString,utf8ToLua} from '../scripts/lua-utf8-literal.mjs';
const require=createRequire(import.meta.url);
test('UTF-8 literals preserve all Lua string bytes, keys, controls and numeric values',()=>{
 const directory=mkdtempSync(join(tmpdir(),'abyss-utf8-literal-'));
 try{
  const strings=['中文，易伤 88/88→9999/9999','🙂旅行者🗺️','\\230\\1"\'\n\r\t\0'+'9]=]--',
   Array.from({length:256},(_,code)=>String.fromCharCode(code)).join(''),'\u2028\u2029\ufeff'];
  const value={strings,中文:{'复杂键\\\n"':strings[2]},numbers:[0,-0,1,-2,1.2345678901234567,1e-300,1e300],yes:true,no:false};
  const program=`local a=${toLua(value)}\nlocal b=${utf8ToLua(value)}\nlocal function equal(x,y)\n assert(type(x)==type(y),'type')\n if type(x)~='table'then assert(x==y,'value');if type(x)=='string'then assert(#x==#y,'bytes')end;return end\n for k,v in pairs(x)do equal(v,y[k])end;for k in pairs(y)do assert(x[k]~=nil,'extra key')end\nend\nequal(a,b)\nequal(${originalV4ToLua({missing:null,nested:[null,'中文']})},${utf8ToLua({missing:null,nested:[null,'中文']},{nullAsNil:true})})\nprint('UTF8_LITERAL_BYTE_EQUAL')\n`;
  const file=join(directory,'check.lua');writeFileSync(file,program);
  const result=spawnSync(process.execPath,[require.resolve('fengari-node-cli/src/lua-cli.js'),file],{encoding:'utf8',timeout:30000,windowsHide:true});
  assert.ifError(result.error);assert.equal(result.status,0,result.stdout+result.stderr);assert.match(result.stdout,/UTF8_LITERAL_BYTE_EQUAL/);
  assert(Buffer.byteLength(utf8LuaString(strings[0]))<Buffer.byteLength(luaString(strings[0])));
  for(const broken of ['\ud800','\udfff'])assert.throws(()=>utf8LuaString(broken),/well-formed/);
  for(const unsupported of [null,undefined,NaN,Infinity])assert.throws(()=>utf8ToLua(unsupported),/Unsupported/);
 }finally{rmSync(directory,{recursive:true,force:true});}
});
