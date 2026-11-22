import {roundedButtonState} from './native-rounded-button.mjs';

// Frozen V25 battle.js deck-shell/deck-back + sts-battle-restore.css:105-108.
// Separate decoration only: the native scroller clones the live hand template.
export function battlePileChrome(theme){
 const image=(name,position,size,colour)=>({name,kind:'image',position,size,image:100001,colour});
 return {name:'pileChrome',kind:'container',size:[...theme.canvas.base],visible:false,children:[
  image('shade',[0,-22],[1280,676],'#000000'),
  {...image('vignette',[0,-123],[1160,700],'#101614'),image:106057,imageType:'basic',opacity:.9},
  {name:'empty',kind:'text',position:[0,30],size:[900,56],text:{content:'这里没有卡牌。',fontSize:26,minFontSize:26,align:'centre',valign:'middle',colour:'#B4AFA2'}},
  {name:'heading',kind:'text',position:[-143,282],size:[570,56],text:{content:'',fontSize:26,minFontSize:26,align:'left',valign:'middle',colour:'#E9DDB6'}},
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
