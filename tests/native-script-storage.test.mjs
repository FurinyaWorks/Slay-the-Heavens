import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import lua from 'luaparse';
import {packNativeScript,nativeScriptStorageProfile} from '../scripts/native-script-storage.mjs';
import {toLua} from '../scripts/build-lua-data.mjs';

function run(t,source){
 const dir=mkdtempSync(join(tmpdir(),'native-storage-'));t.after(()=>rmSync(dir,{recursive:true,force:true}));
 const path=join(dir,'check.lua');writeFileSync(path,source);
 const result=spawnSync(process.execPath,['node_modules/fengari-node-cli/src/lua-cli.js',path],{encoding:'utf8',timeout:30000});
 assert.equal(result.status,0,result.stdout+result.stderr+String(result.error??''));
 return result.stdout;
}
test('native static tables use smaller storage while actual Lua retains all values and independent mutable descendants',t=>{
 const rows=Array.from({length:200},(_,i)=>({name:'岩系旅行者 · '+i,position:[.5,-i],size:[128,210],
  colour:{r:190,g:34,b:i,a:255},rotation:[0,0,0],enabled:i%2===0,children:[{label:'圆角按钮\n确认升级',amount:i+1}]}));
 const original='-- generated\nreturn '+toLua({rows,copy:rows})+'\n';
 const packed=packNativeScript('abyss_theme',original,nativeScriptStorageProfile);
 assert(Buffer.byteLength(packed)<Buffer.byteLength(original)*.65,'native table source must stop repeating field names and escaped UTF-8');
 assert.match(run(t,`local a=(function()\n${original}\nend)() local b=(function()\n${packed}\nend)()
 local function same(x,y)
  assert(type(x)==type(y));if type(x)~='table'then assert(x==y);return end
  for k,v in pairs(x)do same(v,y[k])end
  for k in pairs(y)do assert(x[k]~=nil)end
 end
 same(a,b);b.rows[1].colour.r=1;b.rows[1].position[1]=9;b.rows[1].children[1].label='changed'
 assert(b.copy[1].colour.r==190 and b.copy[1].position[1]==.5 and b.copy[1].children[1].label=='圆角按钮\\n确认升级')
 assert(b.rows[2].colour.r==190);print('VALUES_AND_OWNERSHIP_PASS')`),/VALUES_AND_OWNERSHIP_PASS/);
});
test('ordinary profiles and the exact native startup marker retain their original bytes',()=>{
 const source='-- kept for legacy provenance\nprint("ABYSS_BUILD 123")\nreturn {}\n';
 assert.equal(packNativeScript('abyss_theme',source),source);
 assert.equal(packNativeScript('abyss_ui',source,nativeScriptStorageProfile),source);
 assert.throws(()=>packNativeScript('abyss_theme',source,'unknown'),/storage profile/);
});
test('official competition storage omits unpublished V4 data and legacy storage still serves it',t=>{
 const name='abyss_original_v4_data';
 const source='return {cards={{id="unpublished"}},rules={roles={}}}\n';
 assert.equal(packNativeScript(name,source),source);
 for(const profile of ['lossless-lua-v1','lossless-lua-v2']){
  const packed=packNativeScript(name,source,profile);
  assert.match(run(t,`local data=(function()${packed}end)();assert(data.cards[1].id=='unpublished');print('V4_DATA_PASS')`),/V4_DATA_PASS/);
 }
 const competition=packNativeScript(name,source,nativeScriptStorageProfile);
 assert.doesNotMatch(competition,/unpublished|cards/);
 assert.match(run(t,`package.preload.${name}=function()${competition}end
 local ok,message=pcall(require,'${name}');assert(not ok and message:find('unavailable in the competition campaign',1,true))
 print('V4_UNAVAILABLE_PASS')`),/V4_UNAVAILABLE_PASS/);
});
test('Lua token boundaries, byte patterns, comments and source line numbers survive compact code storage',t=>{
 const original=`-- a removed comment\nlocal x=1 -- another comment\nlocal pattern="[%z\\1-\\127\\194-\\244][\\128-\\191]*"\nlocal text=[=[中文[[原文]]]=]\nlocal y=x - -2\nreturn {a=1 .. "2",b=y,pattern=pattern,text=text,quote="\\092230\\0008", flag=false}\n`;
 const packed=packNativeScript('abyss_storage_example',original,nativeScriptStorageProfile);
 assert(Buffer.byteLength(packed)<Buffer.byteLength(original));
 const tokens=source=>{const p=lua.parse(Buffer.from(source).toString('latin1'),{wait:true,luaVersion:'5.3',encodingMode:'pseudo-latin1'}),out=[];
  for(;;){const token=p.lex();if(token.type===lua.tokenTypes.EOF)return out;out.push([token.type,token.value,token.line]);}};
 assert.deepEqual(tokens(packed),tokens(original));
 assert.match(run(t,`local a=(function()\n${original}\nend)()local b=(function()\n${packed}\nend)()for k,v in pairs(a)do assert(v==b[k])end print('BYTE_STRINGS_PASS')`),/BYTE_STRINGS_PASS/);
 assert.throws(()=>packNativeScript('abyss_bad','return {',nativeScriptStorageProfile));
});
test('large object arity and sparse/nil tables remain valid without a new Lua stack or register limit',t=>{
 const object=Object.fromEntries(Array.from({length:300},(_,i)=>['key'+i,i]));
 const source='return '+toLua({object,second:object})+'\n';
 const packed=packNativeScript('abyss_data',source,nativeScriptStorageProfile);
 assert.match(run(t,`local a=(function()${packed}end)()assert(a.object.key299==299 and a.second.key0==0)print('LARGE_TABLE_PASS')`),/LARGE_TABLE_PASS/);
 const dynamic='local calls=0;local function f()calls=calls+1;return calls end;return {a=f(),b=f()}';
 const safe=packNativeScript('abyss_theme',dynamic,nativeScriptStorageProfile);
 assert.match(run(t,`local a=(function()${safe}end)()assert(a.a==1 and a.b==2)print('DYNAMIC_FALLBACK_PASS')`),/DYNAMIC_FALLBACK_PASS/);
});
test('v2 shortens generated decimals without decoding at load or changing Lua number subtypes',t=>{
 const values='0.500,0.000,-0.000,2.000,2,0.000000000000000001,1.23456789012345670,1e-308,0x1.3p2';
 const repeated=Array.from({length:80},()=>"{100001,0.500}").join(",");
 const original=`return {kind="portrait",rows={{${values}},{${values}}},repeated={${repeated}},["end"]="留",[1]="numeric"}\n`;
 const name='abyss_traveler_portrait_assets';
 const old=packNativeScript(name,original,'lossless-lua-v1');
 const packed=packNativeScript(name,original,nativeScriptStorageProfile);
 assert(Buffer.byteLength(packed)<Buffer.byteLength(old));
 assert.doesNotMatch(packed,/\b(?:load|tonumber|unpack)\b/);
 assert.match(packed,/^local [A-H,]+=.*100001/);
 assert.match(run(t,`local a=(function()${original}end)();local b=(function()${packed}end)()
 assert(a.kind==b.kind and b["end"]=="留" and b[1]=="numeric")
 for i,row in ipairs(a.rows)do for j,n in ipairs(row)do
  local actual=b.rows[i][j];assert(n==actual and math.type(n)==math.type(actual))
  if n==0 then assert(1/n==1/actual)end
 end end
 for i,row in ipairs(b.repeated)do assert(row[1]==a.repeated[i][1] and row[2]==.5 and math.type(row[1])=="integer")end
 b.repeated[1][1]=2;assert(b.repeated[2][1]==100001)
 b.rows[1][1]=8;assert(b.rows[2][1]==.5);print('DECIMAL_IDENTITY_PASS')`),/DECIMAL_IDENTITY_PASS/);
});
