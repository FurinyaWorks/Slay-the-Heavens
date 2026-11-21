import {performance} from 'node:perf_hooks';
import {writeFileSync} from 'node:fs';
const root=process.argv[2],output=process.argv[3];
const t=performance.now();
const {menuRedScene}=await import(root+'/scripts/menu-red-scene.mjs');
const {applyApprovedNativeMenu}=await import(root+'/scripts/native-menu-approved-layout.mjs');
const {gameLayout}=await import(root+'/scripts/game-ui-layout.mjs');
const {applyV25MenuLayout}=await import(root+'/scripts/v25-menu-layout.mjs');
const {nativeTheme}=await import(root+'/scripts/native-ui-theme.mjs');
const importMs=performance.now()-t;
const kids=n=>n.controls??n.children??[],all=n=>[n,...kids(n).flatMap(all)];
let scene,menu;const timings=[];
global.gc?.();const heap=process.memoryUsage().heapUsed;
for(let i=0;i<21;i++){
 const t=performance.now();const layout=gameLayout();applyV25MenuLayout(layout,nativeTheme);
 menu=all(layout).find(n=>n.name==='menuPanel');applyApprovedNativeMenu(menu);scene=menuRedScene();
 timings.push(performance.now()-t);
}
global.gc?.();
const stats=n=>({controls:all(n).length,images:all(n).filter(n=>n.kind==='image').length,serializedBytes:Buffer.byteLength(JSON.stringify(n))});
writeFileSync(output,JSON.stringify({scope:'Node source layout allocation only; no GPU, client startup or device memory claim',node:process.version,importMs,firstBuildMs:timings[0],buildMedianMs:timings.sort((a,b)=>a-b)[10],heapRetainedBytes:process.memoryUsage().heapUsed-heap,background:stats(scene),menu:stats(menu)},null,2)+'\n');
