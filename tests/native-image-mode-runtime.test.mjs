import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,existsSync,rmSync,readdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {buildUI} from '../scripts/build-ui.mjs';
import {buildLuaData,luaString,toLua} from '../scripts/build-lua-data.mjs';
import {compileImageModes,verifyImageModes,imageModeCodeRecord} from '../scripts/native-image-modes.mjs';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);

test('compiler and writer identities retain only the existing optional BOM/CRLF normalization',()=>{
 const original=imageModeCodeRecord(Buffer.from('local mode="stretch"\nreturn mode\n'),'writer.lua');
 assert.deepEqual(imageModeCodeRecord(Buffer.from('\uFEFFlocal mode="stretch"\r\nreturn mode\r\n'),'writer.lua'),original);
 for(const changed of ['local mode="basic"\nreturn mode\n','local mode="stretch"\rreturn mode\n','local mode="stretch" \nreturn mode\n'])
  assert.notEqual(imageModeCodeRecord(Buffer.from(changed),'writer.lua').sha256,original.sha256);
});

test('generated official UI and Deck preserve every mode intent with explicit native lowering and runtime binding',t=>{
 const dir=mkdtempSync(join(tmpdir(),'image-modes-'));t.after(()=>rmSync(dir,{recursive:true,force:true}));
 buildUI(dir,undefined,{officialAssets:true});
 const source=JSON.parse(readFileSync(join(dir,'game-ui.json')));
 const templates=JSON.parse(readFileSync(join(dir,'game-ui-templates.json')));
 const all=node=>[node,...(node.children??[]).flatMap(all)];
 const requested=[...source.controls.flatMap(all),...templates.flatMap(all)].filter(n=>n.imageType!==undefined);
 assert(requested.length>1000,'real gallery requests must be present');
 assert(templates.find(t=>t.name==='AbyssDeckCard')&&requested.some(n=>n.imageType==='basic')&&requested.some(n=>n.imageType==='stretch'));
 assert(existsSync(join(dir,'abyss_image_mode_binding.lua')),'all generated gallery modes currently lack a startup/template runtime binding');
 assert(existsSync(join(dir,'native-image-mode-proof.json')),'missing auditable source/lowered/runtime provenance');
 const compiled=compileImageModes(source,templates);
 assert.equal(compiled.binding.static.length,1637);assert.equal(compiled.binding.templates.length,86);
 assert.deepEqual(compiled.binding.templates.reduce((a,row)=>(a[row.scope]=(a[row.scope]??0)+1,a),{}),{AbyssDeckCard:43,AbyssBattlePileCard:43});
 assert(verifyImageModes(source,templates,compiled));
 const mutations=[c=>c.binding.static.pop(),c=>c.binding.templates.pop(),c=>c.binding.static[0].mode=c.binding.static[0].mode==='basic'?'stretch':'basic',
  c=>c.layout.controls.pop(),c=>c.proof.writer.sha256='0'.repeat(64),c=>c.binding.static.push(c.binding.static[0])];
 for(const mutate of mutations){const bad=structuredClone(compiled);mutate(bad);assert.throws(()=>verifyImageModes(source,templates,bad));}
 assert.throws(()=>compileImageModes({controls:[{name:'bad',kind:'image',image:100001,imageType:'stretch'}]},[]),/gallery/);
 assert.throws(()=>compileImageModes({controls:[{name:'bad',kind:'image',image:106056,imageType:'unknown'}]},[]),/unknown/);
 const allLowered=[...compiled.layout.controls.flatMap(all),...compiled.templates.flatMap(all)];
 assert.equal(allLowered.filter(n=>Object.hasOwn(n,'imageType')).length,0);
 assert.equal(allLowered.length,[...source.controls.flatMap(all),...templates.flatMap(all)].length);
 buildLuaData('data',join(dir,'abyss_data.lua'));
 const modules=['abyss_data','abyss_presentation','abyss_ui_layout','abyss_ui_templates','abyss_theme','abyss_map_layout','abyss_narrative','abyss_image_mode_binding'];
 const body=`package.path=${luaString(dir.replaceAll('\\','/')+'/?.lua;src/lua/?.lua;')}
for _,n in ipairs(${toLua(modules)})do package.preload[n]=assert(loadfile(${luaString(dir.replaceAll('\\','/')+'/')}..n..'.lua'))end
dofile('tests/lua/native_image_modes.lua')`;
 const r=spawnSync(process.execPath,[require.resolve('fengari-node-cli/src/lua-cli.js'),'-e',body],{encoding:'utf8',timeout:30000,maxBuffer:2*1024*1024,windowsHide:true,env:{...process.env,LUA_INIT:'',LUA_INIT_5_3:''}});
 assert.equal(r.status,0,r.stdout+r.stderr+String(r.error??''));assert.match(r.stdout,/NATIVE_IMAGE_MODES_PASS/);t.diagnostic(r.stdout.trim());
});

test('actual native entry prepares modes before publication without a portrait owner',t=>{
 const dir=mkdtempSync(join(tmpdir(),'image-modes-startup-'));t.after(()=>rmSync(dir,{recursive:true,force:true}));
 buildUI(dir,undefined,{officialAssets:true});buildLuaData('data',join(dir,'abyss_data.lua'));
 const modules=readdirSync(dir).filter(n=>n.endsWith('.lua')).map(n=>n.slice(0,-4));
 const body=`package.path=${luaString(dir.replaceAll('\\','/')+'/?.lua;src/lua/?.lua;')}
for _,n in ipairs(${toLua(modules)})do package.preload[n]=assert(loadfile(${luaString(dir.replaceAll('\\','/')+'/')}..n..'.lua'))end
dofile('tests/lua/native_image_modes_startup.lua')`;
 const r=spawnSync(process.execPath,[require.resolve('fengari-node-cli/src/lua-cli.js'),'-e',body],{encoding:'utf8',timeout:30000,maxBuffer:2*1024*1024,windowsHide:true,env:{...process.env,LUA_INIT:'',LUA_INIT_5_3:''}});
 assert.equal(r.status,0,r.stdout+r.stderr+String(r.error??''));assert.match(r.stdout,/NATIVE_IMAGE_MODES_STARTUP_PASS/);t.diagnostic(r.stdout.trim());
});
