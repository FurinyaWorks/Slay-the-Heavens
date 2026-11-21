import {readFileSync} from 'node:fs';
import {menuRedBackground} from './menu-red-scene.mjs';
const logo=JSON.parse(readFileSync(new URL('../data/presentation/native-menu-sts1-logo.json',import.meta.url),'utf8'));
const controls=node=>node.children??node.controls;
const find=(node,name)=>controls(node).find(child=>child.name===name);
// STS1 PC reference: x=6% text edge; first/last original menu positions.
// Keep native transaction handles, shared result start and session resume logic.
export const nativeMenuFrames={start:[-464,-114,208,48],quit:[-464,-282,208,48]};
const rect=(name,x,w,colour,opacity)=>({name,kind:'image',position:[x,0],size:[w,42],image:100001,colour,opacity});
function styleButton(button,frame){
 button.position=frame.slice(0,2);button.size=frame.slice(2);
 find(button,'hit').size=frame.slice(2);
 const label=find(button,'label');
 if(button.name==='start')label.text.content='开始游戏';
 label.position=[0,0];label.size=[218,48];
 Object.assign(label.text,{align:'left',valign:'middle',fontSize:24,minFontSize:24,colour:'#F3EACF',outline:true,outlineColour:'#282328',autoSize:false});
 button.children=button.children.filter(child=>child.name!=='menuAccent');
 const fills={hover:['#FFF09A',.85],pressed:['#D7AA47',.7],disabled:['#3D3A3D',.4]};
 for(const state of controls(find(button,'v25MenuFace'))){
  state.children=[];
  if(state.name==='normal')continue;
  const [colour,opacity]=fills[state.name];
  // STS1's horizontal warm glow: strong at the text edge, fading right.
  state.children=Array.from({length:24},(_,i)=>rect('glow'+i,-97+i*9,9,colour,opacity*(1-i/24)));
 }
}
export function applyApprovedNativeMenu(menu){
 const title=menuRedBackground(logo,true);title.name='sts1TitleLogo';
 find(menu,'v25MainMenu').children=[title];
 styleButton(find(menu,'start'),nativeMenuFrames.start);
 styleButton(find(menu,'titleQuit'),nativeMenuFrames.quit);
 styleButton(find(menu,'continueRun'),[-464,-58,208,48]);
}
