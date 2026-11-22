import {nativeRoundedMaterial} from './official-battle-card-chrome.mjs';
import {roundedButtonRadius,roundedPresetButton} from './native-rounded-button.mjs';
export const stsRewardRowNames=Object.freeze(['goldReward','stolenGold','relicReward1','relicReward2','emeraldKeyReward','claimPotion','cardReward']);
const children=n=>n?.children??n?.controls??[];
const find=(n,name)=>n?.name===name?n:children(n).map(c=>find(c,name)).find(Boolean);
const required=(n,name)=>{const part=find(n,name);if(!part)throw Error('Missing reward control '+name);return part;};
const id=value=>typeof value==='object'?value.id:value;
function iconFor(name,theme){
 if(name==='goldReward'||name==='stolenGold')return id(theme.icon.gold);
 if(name==='cardReward')return id(theme.icon.deck);
 if(name==='claimPotion')return theme.icon.potion.empty;
 if(name==='emeraldKeyReward')return id(theme.icon.lock);
 return id(theme.icon.node.treasure);
}
function rowFace(row,theme){
 const {rewardRows:token,actionButton}=theme.officialAssets;row.size=[...token.rowSize];
 for(const state of children(row)){
  const border=required(state,'border'),plate=required(state,'plate'),label=required(state,'label');
  for(const old of [border,plate]){old.visible=false;old.image=theme.image.rect;old.size=[...token.rowSize];}
  state.size=[...token.rowSize];state.scale=state.name==='pressed'?[actionButton.pressedScale,actionButton.pressedScale]:[1,1];
  const face=nativeRoundedMaterial('stsRewardFace',...token.rowSize,roundedButtonRadius(token.rowSize[1],actionButton),token[state.name]??token.normal);
  const icon={name:'rewardIcon',kind:'image',position:[token.iconX,0],size:[token.iconSize,token.iconSize],image:iconFor(row.name,theme)};
  label.position=[token.textX,0];label.size=[token.textWidth,token.rowSize[1]-theme.space.s];
  Object.assign(label.text,{fontSize:token.fontSize,minFontSize:theme.font.minimum,autoSize:true,align:'left',valign:'middle',colour:state.name==='disabled'?theme.color.textMuted:token.ink,outline:false});
  state.children=[border,plate,face,icon,label];
 }
}
export function proceedFlag(button,theme){
 roundedPresetButton(button,theme,'primary',{name:'v25Flag',size:[180,60],fontSize:24});
 for(const state of button.children){
  required(state,'label').size=[164,52];
  for(const node of children(state))if(node.kind==='image'){node.visible=false;node.image=theme.image.rect;}
 }
}
export function applyStsRewardRows(tree,theme){
 const token=theme.officialAssets.rewardRows;if(!token)throw Error('Missing measured reward row tokens');
 const battle=find(tree,'battlePanel')??tree;
 if(find(battle,'stsRewardFace'))throw Error('Reward rows already composed');
 for(const name of stsRewardRowNames)rowFace(required(battle,name),theme);
 const layout=theme.layout.battleRewards;layout.rowSize=[...token.rowSize];layout.rowStep=token.rowStep;layout.expanded.rowStep=token.rowStep;
 layout.rowOrigin=[...token.rowOrigin];layout.title[1]=token.titleY;layout.subtitle[1]=token.subtitleY;
 const list=required(battle,'rewardList'),panel=nativeRoundedMaterial('stsRewardPanel',...token.panelSize,token.cornerRadius,token.panel);
 const [width,height]=token.panelSize;
 for(const [name,y] of [['upperRoll',height/2],['lowerRoll',-height/2]]){
  panel.children.push({name,kind:'image',position:[0,y],size:[width+theme.space.l,theme.space.s],
   image:theme.image.rect,colour:token.normal});
 }
 for(const name of ['title','subtitle'])required(list,name).position=layout[name].slice(0,2).map((v,axis)=>v-layout.stage[axis]);
 const paper=find(list,'v25RewardPaper');if(paper)paper.position=layout.title.slice(0,2).map((v,axis)=>v-layout.stage[axis]);
 const heading=find(required(battle,'rewardStage'),'title');
 const title=required(list,'title');title.text.fontSize=heading.text.fontSize;title.text.minFontSize=theme.font.minimum;
 Object.assign(required(list,'subtitle').text,{fontSize:token.fontSize,minFontSize:theme.font.minimum});
 panel.position=token.panelPosition.map((value,axis)=>value-layout.stage[axis]);
 required(list,'border').visible=false;required(list,'plate').visible=false;
 const background=children(list).findIndex(n=>n.name==='v25RewardField');list.children.splice(background+1,0,panel);
 const proceed=required(battle,'continue');
 const position=[theme.layout.endTurn.position[0],layout.expanded.continue[1]];
 for(const page of [layout,layout.expanded])page.continue.splice(0,2,...position);
 proceed.position=position;
 proceedFlag(proceed,theme);
}
