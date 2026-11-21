// Borrow the final adopted character cancel material. Keep the GameUI's flat
// command, hit and live caption handles; its existing V25 writer owns states.
const parts=n=>n?.children??n?.controls??[];
const child=(n,name)=>parts(n).find(c=>c.name===name);
export function applyOfficialMapReturnControls(map,character,theme){
 const back=child(map,'previewBack'),source=child(character,'cancel');
 const label=child(back,'label'),hit=child(back,'hit'),states=parts(child(source,'hit'));
 const reference=child(states.find(s=>s.name==='normal'),'label'),caption=label.text.content;
 for(const node of parts(back))if(node!==label&&node!==hit)node.visible=false;
 back.size=[...source.size];hit.size=[...source.size];
 back.position[0]=Math.max(back.position[0],-theme.canvas.base[0]/2+theme.canvas.safe.x+back.size[0]/2);
 Object.assign(label,{position:[...reference.position],size:[...reference.size],text:{...reference.text,content:caption}});
 back.children.splice(back.children.indexOf(label),0,{name:'v25Face',kind:'container',size:[...source.size],
  children:states.map(state=>({name:state.name,kind:'container',size:[...state.size],scale:[...state.scale],
   visible:state.name==='normal',children:[structuredClone(child(state,'v25Flag'))]}))});
}
