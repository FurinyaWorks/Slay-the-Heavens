const parts=node=>node.children??node.controls??[];
const child=(node,name)=>parts(node).find(n=>n.name===name);
// Keep the node controller's original image states, label and cursor receiver.
// Only decoration is borrowed from the already adopted browser/flag controls.
function bindDecoration(button,source){
 const states=child(source,'hit').children,label=child(button,'label');
 const caption=label?.text.content;
 if(!label){
  button.children.splice(button.children.indexOf(child(button,'hit')),0,structuredClone(child(states[0],'label')));
 }else Object.assign(label,{position:[...child(states[0],'label').position],size:[...child(states[0],'label').size],
  text:{...child(states[0],'label').text,content:caption}});
 const icon=child(button,'icon');if(icon)icon.visible=false;
 for(const name of ['border','normal','hover','pressed','disabled','selected'])child(button,name).visible=false;
 button.size=[...source.size];child(button,'hit').size=[...source.size];
 button.children.splice(button.children.indexOf(child(button,'label')),0,{name:'sharedButtonChrome',kind:'container',
  size:[...source.size],children:states.map(state=>({...state,visible:state.name==='normal',
   children:state.children.filter(n=>n.name!=='label')}))});
}
export function pickerControlTheme(theme){
 const node=theme.layout.nativeNode,y=node.forge.previous[1];
 for(const name of ['previous','next']){
  const frame=[...theme.layout.deckView[name]];frame[1]=y;
  node.picker[name]=[...frame];node.forge[name]=[...frame];
 }
}
export function applyOfficialPickerControls(node,theme,deck,character){
 const picker=child(node,'pickerView');
 for(const [name,role] of [['back','cancel'],['confirm','confirm']]){
  const button=child(node,name),position=[...button.position];
  const source=structuredClone(child(character,role));
  bindDecoration(button,source);button.position=position;
  child(button,'label').text.minFontSize=theme.font.minimum;
 }
 for(const [name,direction] of [['previous','previous'],['next','next'],['forgePrevious','previous'],['forgeNext','next']]){
  const button=child(picker,name),frame=theme.layout.nativeNode.picker[direction];
  bindDecoration(button,structuredClone(child(deck,direction)));
  button.position=frame.slice(0,2);
 }
 const page=child(picker,'page');page.position=theme.layout.nativeNode.picker.page.slice(0,2);
}
