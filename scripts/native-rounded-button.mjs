import {nativeRoundedMaterial} from './official-battle-card-chrome.mjs';

const child=(node,name)=>node.children.find(part=>part.name===name);

export function roundedButtonMaterial(name,[w,h],[rim,fill],{stretch=false}={}){
 const radius=Math.round(h/6),inset=2;
 const layer=(role,margin,r,ink)=>{
  const surface=nativeRoundedMaterial(role,w-2*margin,h-2*margin,r,ink,{raycastTarget:false});
  if(stretch){
   surface.anchor={min:[0,0],max:[1,1]};surface.size=[-2*margin,-2*margin];
   for(const part of surface.children){
    if(part.name==='vertical'||part.name==='horizontal'){
     part.anchor={min:[0,0],max:[1,1]};
     part.size=part.name==='vertical'?[-2*r,0]:[0,-2*r];
    }else{
     const [x,y]=part.position.map(Math.sign),corner=[(x+1)/2,(y+1)/2];
     part.anchor={min:corner,max:corner};part.position=[-x*r,-y*r];
    }
   }
  }
  return surface;
 };
 return {name,kind:'container',size:stretch?[0,0]:[w,h],
  ...(stretch&&{anchor:{min:[0,0],max:[1,1]}}),
  children:[layer('rim',0,radius,rim),layer('cloth',inset,radius-inset,fill)]};
}

export function roundedButtonState(state,size,colours,name='roundedButton'){
 const label=child(state,'label');
 const face=roundedButtonMaterial(name,size,colours);
 state.children=state.children.filter(part=>part.name!==name);
 for(const part of state.children){
  if(['officialButtonBacking','border','plate'].includes(part.name))part.visible=false;
 }
 state.children.splice(label?state.children.indexOf(label):0,0,face);
}

export function roundedPresetButton(button,theme,normal){
 const c=theme.color;
 const danger=normal===theme.officialAssets.flagButton.cancel;
 const colours={normal,hover:[c.goldBright,danger?'#A84D43':c.buttonHover],pressed:[c.goldBright,danger?'#592A2B':c.buttonPressedFill],
  disabled:[c.line,c.panelSunken]};
 for(const state of button.children){
  roundedButtonState(state,button.size,colours[state.name]);
 }
}

export function roundedFramedButton(button,theme,{stretch=false}={}){
 const base=button.children.findIndex(part=>part.name==='border');
 for(const part of button.children){
  if(['border','normal','hover','pressed','disabled','selected','officialButtonBacking',
   'v25BaseMaterial','v25StateChrome'].includes(part.name))part.visible=false;
 }
 const {gold,panelRaised}=theme.color;
 button.children.splice(base,0,roundedButtonMaterial('roundedButton',button.size,[gold,panelRaised],{stretch}));
}

// Static captions on route/help controls are edited by Lua outside the hit.
export function roundedCaptionButton(button,theme,palette){
 const hit=child(button,'hit'),label=child(button,'label');
 const names=['normal','hover','pressed','disabled'];
 Object.assign(hit,{kind:'presetButton',states:Object.fromEntries(names.map(name=>[name,name])),
  children:names.map(name=>({name,kind:'container',size:[...hit.size],children:[]}))});
 roundedPresetButton(hit,theme,palette);
 label.position=[0,0];
 button.children=[hit,label];
}
