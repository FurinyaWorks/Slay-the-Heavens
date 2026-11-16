import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const {withPortraitVm}=await import(pathToFileURL(resolve('tests/helpers/portrait-runtime-vm.mjs')));
const {toLua}=await import(pathToFileURL(resolve('scripts/build-lua-data.mjs')));
const asset=JSON.parse(readFileSync(resolve(process.argv[2]),'utf8'));
const [width,height]=asset.logicalSize??[asset.width,asset.height];
const rows=asset.rows??asset.imageRows.wholeActor;
const n=rows.length;
const count=n+2+Math.ceil(n/60);
const data={renderProfile:'lowpoly-v1',width,height,count:n,rows:rows.map(r=>r[20]===0?r.slice(0,20):r),runtimeV2:true,cache:true};
withPortraitVm(`
Asset.selectionHalfImagePrefabId=4321
local root=game.InstantiateClientUIControl(5678,figure)
local c=Portraits.createController(root,${toLua(data)},127,Asset,{position={0,0}})
assert(c:begin())
for i=1,500 do c:step();if c:status().phase=='ready' then break end end
assert(c:status().phase=='ready',tostring(c:status().reason))
assert(#Images()==${n},tostring(#Images()))
assert(LiveCount()==${count},tostring(LiveCount()))
local before=0;for _,v in ipairs(Images())do before=before+#v.trace end
for i=1,120 do c:pose(0,0,1,1,1/60,'idle') end
local after=0;for _,v in ipairs(Images())do after=after+#v.trace end
assert(before==after and LiveCount()==${count})
assert(c:pause() and c:begin() and LiveCount()==${count})
assert(c:release() and LiveCount()==1)
game.DestroyClientUIControl(root)
assert(LiveCount()==0)
`,{runtimeV2:true});
console.log(JSON.stringify({images:n,containers:count-n,controls:count,staticPoseFrames:120,imageWrites:0,liveAfterRelease:0,scope:'Standalone production portrait controller under VM mocks; not monster actor pool or device',pass:true}));
