import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const {withPortraitVm}=await import(pathToFileURL(resolve('tests/helpers/portrait-runtime-vm.mjs')));
const {toLua}=await import(pathToFileURL(resolve('scripts/build-lua-data.mjs')));
const asset=JSON.parse(readFileSync(new URL('./native-layout.json',import.meta.url)));
const sizes=Object.fromEntries(Object.entries(asset.imageRows).map(([name,rows])=>[name,rows.length]));
const data=(name)=>({renderProfile:'lowpoly-v1',width:656,height:600,count:sizes[name],rows:asset.imageRows[name].map(r=>r[20]===0?r.slice(0,20):r),runtimeV2:true,cache:true});
withPortraitVm(`
Asset.selectionHalfImagePrefabId=4321
local root=game.InstantiateClientUIControl(5678,figure)
local ribbon=game.InstantiateClientUIControl(5678,root)
local body=game.InstantiateClientUIControl(5678,root)
local r=Portraits.createController(ribbon,${toLua(data('ribbon'))},133,Asset,{position={0,0}})
local b=Portraits.createController(body,${toLua(data('body'))},133,Asset,{position={0,0}})
for _,c in ipairs({r,b})do
 assert(c:begin())
 for i=1,500 do c:step();if c:status().phase=='ready' then break end end
 local status=c:status();assert(status.phase=='ready',tostring(status.reason))
end
assert(LiveCount()==${asset.measuredControllerExpected},tostring(LiveCount()))
assert(#Images()==${sizes.body+sizes.ribbon})
local imageBefore=0
for _,v in ipairs(Images())do imageBefore=imageBefore+#v.trace end
local count,rstart,bstart=LiveCount(),#ribbon.trace,#body.trace
for i=1,120 do
  r:pose(math.sin(i/20)*.3,math.sin(i/20)*.6,1,1,1/60,'idle')
end
local imageAfter=0
for _,v in ipairs(Images())do imageAfter=imageAfter+#v.trace end
assert(LiveCount()==count and imageAfter==imageBefore and #body.trace==bstart and #ribbon.trace-rstart==240)
assert(r:pause() and b:pause() and LiveCount()==count)
assert(r:begin() and b:begin() and LiveCount()==count)
assert(r:release() and b:release() and LiveCount()==3)
for _,c in ipairs({ribbon,body,root})do game.DestroyClientUIControl(c)end
assert(LiveCount()==0)
`,{runtimeV2:true});
const containers=5+Object.values(sizes).reduce((total,count)=>total+Math.ceil(count/60),0);
assert.equal(asset.measuredControllerExpected,sizes.body+sizes.ribbon+containers);
assert(asset.measuredControllerExpected<200);
console.log(JSON.stringify({images:sizes.body+sizes.ribbon,containers,controls:asset.measuredControllerExpected,poseFrames:120,ribbonRootWrites:240,bodyRootWrites:0,imageWrites:0,controlRecreation:0,liveAfterRelease:0,pass:true}));
