import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readdirSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {buildUI} from '../scripts/build-ui.mjs';
import {buildLuaData,luaString,toLua} from '../scripts/build-lua-data.mjs';
import {officialAssetFlags} from '../scripts/official-assets-profile.mjs';
import {readArtFeatures} from '../scripts/art-features.mjs';
const require=createRequire(import.meta.url),directory=mkdtempSync(join(tmpdir(),'selection-overlay-'));
after(()=>rmSync(directory,{recursive:true,force:true}));
buildLuaData('data',join(directory,'abyss_data.lua'));
buildUI(directory,undefined,{officialAssets:true,nativePageLifecycle:true});
const parts=n=>n.children??n.controls??[],child=(n,name)=>parts(n).find(c=>c.name===name);
const layout=JSON.parse(readFileSync(join(directory,'game-ui.json'),'utf8'));
const panel=child(child(layout,'stage'),'characterPanel');

test('official generated selection retires the legacy full-screen shade above its approved artwork',()=>{
 const background=child(panel,'lumineSelectionBackground'),shade=child(panel,'officialBackdropVeil');
 assert(parts(panel).indexOf(shade)>parts(panel).indexOf(background),'exercise the inherited foreground shade');
 assert.deepEqual(shade.size,[1280,720]);
 assert.equal(shade.visible,false,'ready artwork must not inherit the old full-screen backdrop shade');
 assert.equal(child(panel,'blocker').kind,'cursorArea','retire paint only; retain the selection input barrier');
 assert.equal(child(panel,'v25Background').visible,true,'the controller still owns its loading fallback');
 assert.equal(child(child(panel,'v25Background'),'veil').opacity,.35);
 assert.deepEqual(readArtFeatures(directory),officialAssetFlags);
});

test('official native portrait ready, pause and reentry cannot restore the retired full-screen shade',t=>{
 const modules=readdirSync(directory).filter(n=>n.endsWith('.lua')).map(n=>n.slice(0,-4));
 const script=`
local generated=${luaString(directory.replaceAll('\\','/'))}
package.path=generated..'/?.lua;src/lua/?.lua'
for _,name in ipairs(${toLua(modules)})do package.preload[name]=assert(loadfile(generated..'/'..name..'.lua'))end
local F=dofile('tests/lua/support/game_ui_fixture.lua')
local root=F.Viewport.apply(F.control({children=F.Layout}),1280,720)
local panel=root:GetChild('characterPanel');panel:SetVisible(true)
local art=panel:GetChild('lumineSelectionBackground')
local legacy=panel:GetChild('officialBackdropVeil')
local fallback=panel:GetChild('v25Background')
local Asset=require('abyss_traveler_portrait_assets')
Asset.imagePrefabId,Asset.containerPrefabId,Asset.selectionHalfImagePrefabId=41,73,99
Enum={ImageSource={StaticReference='static'},ImageType={Stretch=23},ImageFillHorizontalType={Right=1}}
Color={FromRGBA=function(...)return {...}end}
local methods={}
function methods:SetVisible(value)self.visible=value end
function methods:SetActive(value)self.active=value end
function methods:SetImage(source,id)self.imageId=id end
for _,name in ipairs({'SetAnchorMin','SetAnchorMax','SetPivot','SetSizeDelta','SetLocalScale','SetLocalRotation','SetAnchoredPosition','SetAsLastSibling','SetFillHorizontal','SetFillUnused'})do methods[name]=function()end end
local function install(control)
 control.SetActive=methods.SetActive
 for _,c in pairs(control.children)do install(c)end
end
install(root)
local created,destroyed,rejectCreation=0,0,false
game={InstantiateClientUIControl=function(index,parent)
 assert(index==41 or index==73 or index==99)
 if rejectCreation then return nil end
 created=created+1;return setmetatable({parent=parent,alive=true},{__index=methods})
end,DestroyClientUIControl=function()destroyed=destroyed+1 end}
local portraits=require('abyss_traveler_portraits').new(root,nil,{selectionAvatar=true,battlePortrait=true})
local covered={}
local function scope(label)
 print('SELECTION_SCOPE '..label..' legacy='..tostring(legacy.visible)..' fallback='..tostring(fallback.visible)..' art='..tostring(art.visible)..' phase='..portraits:status().selection.phase)
 if legacy.visible then covered[#covered+1]=label end
end
portraits:sync('menu',true,false,'ironclad');scope('building')
for _=1,600 do portraits:tick();if portraits:readyForPage('menu',true,'ironclad','characterPanel')then break end end
assert(portraits:readyForPage('menu',true,'ironclad','characterPanel'))
assert(portraits:status().selection.phase=='ready' and art.visible and not fallback.visible)
scope('ready')
local total=created
portraits:sync('menu',false,false,'ironclad');assert(not art.visible and fallback.visible);scope('paused')
portraits:sync('menu',true,false,'ironclad');portraits:tick()
assert(art.visible and not fallback.visible and created==total and destroyed==0);scope('reentry')
assert(panel:GetChild('blocker').visible,'input barrier was removed with legacy paint')
assert(portraits:release());rejectCreation=true
portraits:sync('menu',true,false,'ironclad');portraits:tick()
assert(portraits:status().selection.phase=='failed' and not art.visible and fallback.visible)
scope('failed')
portraits:onEngineDestroy();portraits:tick();scope('destroyed')
assert(#covered==0,'inherited full-screen shade covers the approved selection art: '..table.concat(covered,','))
print('SELECTION_OVERLAY_SCOPE_PASS created='..created)
`;
 const result=spawnSync(process.execPath,[require.resolve('fengari-node-cli/src/lua-cli.js'),'-e',script],{
  encoding:'utf8',timeout:30000,maxBuffer:2*1024*1024,env:{...process.env,LUA_INIT:'',LUA_INIT_5_3:''}});
 assert.equal(result.status,0,result.stdout+result.stderr+String(result.error??''));
 assert.match(result.stdout,/SELECTION_OVERLAY_SCOPE_PASS/);
 t.diagnostic(result.stdout);
});

test('default opt-out retains its existing backdrop shade and no approved native selection host',()=>{
 const output=join(directory,'default');buildUI(output);
 const tree=JSON.parse(readFileSync(join(output,'game-ui.json'),'utf8'));
 const selection=child(child(tree,'stage'),'characterPanel');
 assert.notEqual(child(selection,'officialBackdropVeil').visible,false);
 assert.equal(child(selection,'lumineSelectionBackground'),undefined);
 assert.equal(child(selection,'veil').opacity,1);
});
