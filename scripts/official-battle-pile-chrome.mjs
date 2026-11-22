import {roundedButtonState} from './native-rounded-button.mjs';

// Keep the live run HUD above the darkened scene without cloning its controls.
export function battlePileChrome(theme) {
 const [width,height]=theme.canvas.base;
 const {height:hudHeight}=theme.officialAssets.battleHud;
 const {browser}=theme.layout.deckView;
 const {text,goldBright,textDim}=theme.color;
 const image=(name,position,size,id,colour)=>({name,kind:'image',position,size,image:id,colour,raycastTarget:false});
 const label=(name,frame,content,fontSize,colour)=>({name,kind:'text',position:frame.slice(0,2),
  size:frame.slice(2),text:{content,fontSize,minFontSize:fontSize,align:'centre',valign:'middle',colour}});
 const badge=(kind,icon,caption)=>{
  const frame=browser[kind+'Badge'];
  return {name:kind+'Badge',kind:'container',position:frame.slice(0,2),size:frame.slice(2),visible:false,children:[
   {...image('plate',[0,0],frame.slice(2),100001,theme.color.panelRaised),opacity:.84},
   image('icon',[-56,0],[32,32],icon,goldBright),
   label('label',[15,0,128,38],caption,theme.font.label,text),
  ]};
 };
 return {name:'pileChrome',kind:'container',size:[width,height],visible:false,children:[
  {...image('shade',[0,-hudHeight/2],[width,height-hudHeight],100001,'#000000'),opacity:.85},
  label('empty',[0,30,900,56],'这里没有卡牌。',26,textDim),
  label('heading',[0,282,570,48],'',26,text),
  badge('draw',theme.icon.drawPile,'抽牌堆'),
  badge('discard',theme.icon.discardPile,'弃牌堆'),
 ]};
}

export function battlePileReturn(button, ink){
 button.position=[-550,-237];
 const palettes={
  normal:['#BCA348','#8C3739'],hover:['#D9BE60','#A84D43'],
  pressed:['#C6A858','#592A2B'],disabled:['#716650','#483332'],
 };
 for(const state of button.children[0].children){
  roundedButtonState(state,button.size,palettes[state.name]);
  const label=state.children.find(part=>part.name==='label');
  label.text.colour=state.name==='disabled'?'#AFA18C':ink;
  label.text.content='返回';
 }
 return button;
}
