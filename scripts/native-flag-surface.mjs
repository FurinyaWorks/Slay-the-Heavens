// Continuous edges from the existing library triangle, not horizontal pixels.
// Reuse the scene tessellator and the menu's exact one-image placement where
// legal. Unsupported one-image poses retain the scene's two half triangles.
import {nativeShape} from './v25-battle-scene.mjs';
import {flatTriangle} from './menu-flat-triangle.mjs';
const distance=(p,a,b)=>{
 const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy)||0));
 return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy);
};
// Keep the original samples within .2 native pixels without quantizing x/y.
function simplify(points,extrema){
 let deviation=0,index=0;
 for(let i=1;i<points.length-1;i++){
  if(extrema.has(points[i])){deviation=Infinity;index=i;break;}
  const d=distance(points[i],points[0],points.at(-1));if(d>deviation){deviation=d;index=i;}
 }
 return deviation>.2?[...simplify(points.slice(0,index+1),extrema).slice(0,-1),...simplify(points.slice(index),extrema)]:[points[0],points.at(-1)];
}
export function nativeFlagSurface(name,outline,colour){
 const extrema=new Set([0,1].flatMap(axis=>[Math.min,Math.max].map(bound=>outline.find(p=>p[axis]===bound(...outline.map(p=>p[axis]))))));
 const points=simplify([...outline,outline[0]],extrema).slice(0,-1);
 const halves=nativeShape({name,type:'polygon',points,colour,opacity:1},{},{edgeBleed:0,earSelection:'balanced'});
 const items=[];
 const end=n=>{const a=n.rotation*Math.PI/180;return [n.position[0]+Math.cos(a)*n.size[0]/2,n.position[1]+Math.sin(a)*n.size[0]/2];};
 const tip=n=>{const a=n.rotation*Math.PI/180;return [n.position[0]-Math.sin(a)*n.size[1]*n.scale[1],n.position[1]+Math.cos(a)*n.size[1]*n.scale[1]];};
 const same=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1])<1e-6;
 for(let i=0;i<halves.length;){
  const n=halves[i],next=halves[i+1];
  // A right-angle ear may emit just one half. Never join unrelated ears.
  const paired=next&&same(n.position,next.position)&&same(tip(n),tip(next));
  const triangle=paired&&flatTriangle([end(n),end(next),tip(n)],name+'Tri'+i,colour);
  const count=paired?2:1;
  for(const image of triangle?[triangle]:halves.slice(i,i+count)){
   // Scene coordinates use a 1280x676 origin; flags use a local 180x60 box.
   image.position=[image.position[0]+550,image.position[1]-308];
   // Subpixel overlap hides shared texture AA seams without more controls.
   // Keep this below the existing scene's .45px bleed; device AA is unverified.
   image.size=image.size.map(v=>v+.2);
   image.colour=colour;items.push(image); // Preserve the requested token, no scene tone mapping.
  }
  i+=count;
 }
 // The measured flags have a rectangular interior between their straight top
 // and bottom runs. One opaque same-token plate covers long internal seams;
 // the triangle mesh still owns every curved outside edge.
 const [first,second]=outline,last=outline.at(-1),penultimate=outline.at(-2);
 const left=Math.max(Math.min(first[0],second[0]),Math.min(last[0],penultimate[0]));
 const right=Math.min(Math.max(first[0],second[0]),Math.max(last[0],penultimate[0]));
 if(first[1]===second[1]&&last[1]===penultimate[1]&&right>left){
  items.push({name:'interior',kind:'image',image:100001,colour,position:[(left+right)/2-90,30-(first[1]+last[1])/2],size:[right-left,Math.abs(last[1]-first[1])],rotation:0});
 }
 const group=(name,children)=>({name,kind:'container',position:[0,0],size:[180,60],children});
 const bounds=items.flatMap(n=>{
  const [w,h]=n.size,r=Array.isArray(n.rotation)?n.rotation:[0,0,n.rotation],rx=r[0]*Math.PI/180,z=r[2]*Math.PI/180;
  const points=n.fill?[[0,0],[w/2,0],[0,h]]:[[-w/2,-h/2],[w/2,-h/2],[0,h/2]];
  return points.map(([x,y])=>n.position[1]+(x*(n.scale?.[0]??1)*Math.sin(z)+y*(n.scale?.[1]??1)*Math.cos(z))*Math.cos(rx));
 });
 return {...group(name,items.length<=60?items:Array.from({length:Math.ceil(items.length/60)},(_,i)=>group('part'+i,items.slice(i*60,i*60+60)))),flagBounds:[Math.min(...bounds),Math.max(...bounds)]};
}
