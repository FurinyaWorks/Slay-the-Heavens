// Resolve native single-image transforms offline, never during game layout.
import {readFileSync,writeFileSync} from 'node:fs';
import {flatTriangle} from '../../scripts/menu-flat-triangle.mjs';
for(const file of ['native-menu-sts1.json','native-menu-sts1-logo.json']){
 const path='data/presentation/'+file,pack=JSON.parse(readFileSync(path));
 pack.shapes=pack.shapes.map(s=>{
  if(s.type!=='polygon')return s;
  const points=s.points.map(([x,y])=>[x*1280/pack.width-640,360-y*720/pack.height]);
  const native=flatTriangle(points,'facet',s.colour);
  if(!native)throw Error('Offline native transform unavailable');
  const {position,size,rotation}=native;return {type:'nativeTriangle',position,size,rotation,colour:s.colour};
 });
 writeFileSync(path,JSON.stringify(pack)+'\n');
}
