import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const {withPortraitVm}=await import(pathToFileURL(resolve('tests/helpers/portrait-runtime-vm.mjs')));
const {toLua}=await import(pathToFileURL(resolve('scripts/build-lua-data.mjs')));
const asset=JSON.parse(readFileSync(new URL('./native-layout.json',import.meta.url)));
const data={renderProfile:'lowpoly-v1',width:508,height:508,count:asset.rows.length,rows:asset.rows.map(r=>r[20]===0?r.slice(0,20):r),runtimeV2:true,cache:true};
withPortraitVm(`
Asset.selectionHalfImagePrefabId=4321
local root=game.InstantiateClientUIControl(5678,figure)
local c=Portraits.createController(root,${toLua(data)},133,Asset,{position={0,0}})
assert(c:begin())
for i=1,500 do c:step();if c:status().phase=='ready' then break end end
assert(c:status().phase=='ready',tostring(c:status().reason))
assert(#Images()==63,tostring(#Images()))
assert(LiveCount()==67,tostring(LiveCount()))
local before=0;for _,v in ipairs(Images())do before=before+#v.trace end
local parentBefore=#root.trace
for i=1,120 do c:pose(0,0,1,1,1/60,'idle') end
local after=0;for _,v in ipairs(Images())do after=after+#v.trace end
assert(before==after and LiveCount()==67)
assert(c:pause() and c:begin() and LiveCount()==67)
assert(c:release() and LiveCount()==1)
game.DestroyClientUIControl(root)
assert(LiveCount()==0)
`,{runtimeV2:true});
console.log(JSON.stringify({images:63,containers:4,controls:67,staticPoseFrames:120,imageWrites:0,recreatedControls:0,liveAfterRelease:0,scope:'standalone actual controller mock, not production monster pool or device runtime',pass:true}));
