import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const { withPortraitVm } = await import(pathToFileURL(resolve('tests/helpers/portrait-runtime-vm.mjs')));
withPortraitVm(`
watchControl(figure)
local c=Portraits.createController(figure,Asset.battle133,400/3,Asset,{retryFailedOnPause=true})
assert(c:begin())
for i=1,10000 do c:step();if c:status().phase=='ready' then break end end
assert(c:status().phase=='ready')
local owned=LiveCount();local images=Images();local total=0
for _,v in ipairs(images)do total=total+#v.trace end
assert(owned==4389 and #images==4315)
local before=#figure.trace
for i=1,120 do c:pose(0,1,1,1,1/60,'idle')end
local imageAfter=0;for _,v in ipairs(images)do imageAfter=imageAfter+#v.trace end
assert(#figure.trace-before==240 and imageAfter==total and LiveCount()==owned)
print('DEFAULT_IDLE', 'images',#images,'owned',owned,'rootWrites120Frames',#figure.trace-before,'imageWrites',imageAfter-total)
assert(c:pause());local paused=#figure.trace
c:pose(0,1,1,1,1/60,'idle')
assert(#figure.trace-paused==2)
print('DIRECT_POSE_AFTER_PAUSE',#figure.trace-paused,'rootVisible',tostring(figure.visible))
assert(c:release());local released=#figure.trace;c:pose(0,1,1,1,1/60,'idle');assert(#figure.trace==released and LiveCount()==0)
print('RELEASED_NO_WRITES_PASS')
`,{runtimeV2:true});

console.log(JSON.stringify({base:'1cc5479b',profile:'default battle133 runtimeV2',images:4315,ownedControls:4389,frames:120,rootNativeWrites:240,imageNativeWrites:0,controlsRecreated:0,directPoseAfterPauseWrites:2,releaseWrites:0,assertions:'PASS'}));
