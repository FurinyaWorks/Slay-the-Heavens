import test from'node:test';
import assert from'node:assert/strict';
import{mkdtempSync,readFileSync,writeFileSync,rmSync,readdirSync,realpathSync}from'node:fs';
import{join,relative,isAbsolute}from'node:path';import{tmpdir}from'node:os';
import{spawnSync}from'node:child_process';import{createRequire}from'node:module';
import{buildUI}from'../scripts/build-ui.mjs';
import{buildLuaData,toLua,luaString}from'../scripts/build-lua-data.mjs';
import*as codec from'../scripts/native-image-modes.mjs';
const require=createRequire(import.meta.url);
test('mode dictionary rejects field loss, drift, invalid indices and cycles without changing small bindings',()=>{
 const binding={schemaVersion:1,static:[{scope:'static',path:['stage','pane','quote"\\\n中文'],image:106056,mode:'basic'},
  {scope:'static',path:['stage','pane','next'],image:106057,mode:'stretch'}],
 templates:[{scope:'Deck',path:['Deck','icon'],image:106056,mode:'basic'}],templateNames:['Deck','ZeroModeTemplate']};
 const packed=codec.packImageModes(binding);assert.deepEqual(codec.unpackImageModes(packed),binding);
 for(const mutate of[p=>p.static.pop(),p=>p.templates.pop(),p=>p.static.reverse(),p=>p.static[0][2]=2,
  p=>p.nodes[0][0]=1,p=>p.nodes[0][1]=0,p=>p.templates[0][0]=0,p=>p.static[0][1]=100001,p=>p.names[0]='changed',p=>p.extra=true]){
  const bad=structuredClone(packed);mutate(bad);assert.throws(()=>codec.verifyImageModeDictionary(bad,binding));
 }
 const empty={schemaVersion:1,static:[],templates:[],templateNames:[]};
 assert.equal(codec.renderImageModeBinding(empty,toLua),`-- Complete gallery intent; applied before page publication.\nreturn ${toLua(empty)}\n`);
 assert.throws(()=>codec.packImageModes({...binding,foreign:'must not disappear'}));
});
test('lossless dictionary emits the exact expanded1723 mode records and preserves real native lifecycle',t=>{
 assert.equal(typeof codec.renderImageModeBinding,'function','large current mode Lua has no lossless dictionary encoder');
 const temp=realpathSync.native(tmpdir()),dir=mkdtempSync(join(temp,'mode-dictionary-'));
 t.after(()=>{const actual=realpathSync.native(dir),within=relative(temp,actual);assert(!isAbsolute(within)&&within.startsWith('mode-dictionary-')&&!within.startsWith('..'));rmSync(actual,{recursive:true,force:true});});
 buildUI(dir,undefined,{officialAssets:true});buildLuaData('data',join(dir,'abyss_data.lua'));
 const original=codec.compileImageModes(JSON.parse(readFileSync(join(dir,'game-ui.json'))),JSON.parse(readFileSync(join(dir,'game-ui-templates.json')))).binding;
 const source=codec.renderImageModeBinding(original,toLua);
 const baseline=`-- Complete gallery intent; applied before page publication.\nreturn ${toLua(original)}\n`;
 assert.equal(original.static.length,1637);assert.equal(original.templates.length,86);
 assert(Buffer.byteLength(source)<Buffer.byteLength(baseline));
 writeFileSync(join(dir,'abyss_image_mode_binding.lua'),source);
 writeFileSync(join(dir,'expected-mode-binding.lua'),'return '+toLua(original)+'\n');
 const packed=codec.packImageModes(original),packedLiteral=toLua(packed);assert(source.includes(packedLiteral),'must exercise actual compact source');
 const corrupt=[];
 for(const mutate of[p=>p.schemaVersion=2,p=>p.nodes[0][0]=1,p=>p.static[0][2]=0,p=>p.templates[0][0]=0]){
  const bad=structuredClone(packed);mutate(bad);const name='corrupt-'+corrupt.length+'.lua';
  writeFileSync(join(dir,name),source.replace(packedLiteral,toLua(bad)));corrupt.push(name);
 }
 const modules=readdirSync(dir).filter(n=>n.endsWith('.lua')&&!n.startsWith('expected-')&&!n.startsWith('corrupt-')).map(n=>n.slice(0,-4));
 const prefix=`package.path=${luaString(dir.replaceAll('\\','/')+'/?.lua;src/lua/?.lua;')}
for _,n in ipairs(${toLua(modules)})do package.preload[n]=assert(loadfile(${luaString(dir.replaceAll('\\','/')+'/')}..n..'.lua'))end
local actual=require('abyss_image_mode_binding');local expected=assert(loadfile(${luaString(join(dir,'expected-mode-binding.lua').replaceAll('\\','/'))}))()
local function equal(a,b)
 assert(type(a)==type(b),'mode value type changed')
 if type(a)~='table'then assert(a==b,'mode value changed');return end
 local n,m=0,0;for k,v in pairs(a)do n=n+1;assert(b[k]~=nil,'extra mode field');equal(v,b[k])end
 for _ in pairs(b)do m=m+1 end;assert(n==m,'missing mode field')
end
equal(actual,expected);print('MODE_DICTIONARY_ALL_VALUES_PASS')
for _,name in ipairs(${toLua(corrupt)})do
 local chunk=assert(loadfile(${luaString(dir.replaceAll('\\','/')+'/')}..name));assert(not pcall(chunk),'damaged dictionary loaded')
end
`;
 for(const script of['tests/lua/native_image_modes.lua','tests/lua/native_image_modes_startup.lua']){
  const r=spawnSync(process.execPath,[require.resolve('fengari-node-cli/src/lua-cli.js'),'-e',prefix+`dofile(${luaString(script)})`],{encoding:'utf8',timeout:30000,maxBuffer:2*1024*1024,windowsHide:true,env:{...process.env,LUA_INIT:'',LUA_INIT_5_3:''}});
  assert.equal(r.status,0,r.stdout+r.stderr+String(r.error??''));assert.match(r.stdout,/MODE_DICTIONARY_ALL_VALUES_PASS/);t.diagnostic(r.stdout.trim());
 }
 t.diagnostic(JSON.stringify({before:Buffer.byteLength(baseline),after:Buffer.byteLength(source),saved:Buffer.byteLength(baseline)-Buffer.byteLength(source)}));
});
