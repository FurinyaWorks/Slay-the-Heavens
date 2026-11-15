import {nativeControls} from './native-ui-theme.mjs';
import {deckCardTemplate} from './deck-ui-layout.mjs';

export function assertCompendiumDisplayOnly(node){
 if(!['container','image','text'].includes(node.kind))throw Error('Interactive control in compendium hover display: '+node.name);
 for(const child of node.children??[])assertCompendiumDisplayOnly(child);
}

export function compendiumIconTemplate(theme){
 const {text,hit}=nativeControls(theme),l=theme.layout.compendium;
 const heading=text('heading',[-120,2.6666666666666665,306.6666666666667,48],'',l.sectionFont,theme.color.goldBright);
 heading.text.align='left';
 return {name:'AbyssCompendiumIconRow',kind:'container',size:l.iconCell,children:[
  heading,
  ...Array.from({length:l.iconColumns},(_,i)=>({name:'slot'+(i+1),kind:'container',position:[l.iconStartX+i*l.iconSpacing,0],size:[48,48],children:[
   {name:'icon',kind:'image',size:[42.666666666666664,42.666666666666664],image:theme.image.rect,colour:'#FFFFFF'},hit([48,48])]}))]};
}
export function attachCompendium(layout,theme,templates){
 const stage=(layout.controls??[]).find(n=>n.name==='stage');
 if(!stage)throw Error('Compendium requires viewport stage');
 const {button,text,plate}=nativeControls(theme),l=theme.layout.compendium;
 const action=(name,rect,label)=>button(name,rect,label,{inset:[8,4],fontSize:theme.font.label});
 const entries={name:'compendiumEntries',kind:'container',size:[...theme.canvas.base],visible:false,children:
  ['卡牌图鉴','遗物图鉴','药水图鉴'].map((label,i)=>action(['cards','relics','potions'][i],l.entries[i],label))};
 const source=(templates?.find(t=>t.name==='AbyssDeckCard')??deckCardTemplate(theme));
 const face=structuredClone(source.children.find(n=>n.name==='face'));
 Object.assign(face,{position:[0,0],scale:[l.popupScale,l.popupScale]});
 face.children.find(node=>node.name==='label').text.valign='middle';
 const previewFace=structuredClone(source.children.find(n=>n.name==='face'));
 Object.assign(previewFace,{name:'previewFace',position:[316.6666666666667,170],scale:[16/15,16/15],visible:false});
 const tips=Array.from({length:4},(_,i)=>{
  const suffix=i?String(i+1):'';
  return [plate('keywordPlate'+suffix,[333.3333333333333,-120,l.tip.width,80],theme.color.panelSunken),
   text('keywordTitle'+suffix,[0,0,l.tip.bodyWidth,l.tip.headerHeight],'',l.tip.font,theme.color.goldBright),
   text('keywordText'+suffix,[0,0,l.tip.bodyWidth,32],'',l.tip.font)];
 }).flat();
 const popup={name:'popup',kind:'container',size:[...theme.canvas.base],visible:false,children:[
  plate('shade',[0,0,...theme.canvas.base],'#080B12E8'),
  {name:'dismiss',kind:'cursorArea',size:[...theme.canvas.base]},
  face,previewFace,{name:'cardHit',kind:'cursorArea',position:[0,0],size:[366.6666666666667,513.3333333333334]},
  {name:'relicIcon',kind:'image',position:l.relicPopup.icon.slice(0,2),size:l.relicPopup.icon.slice(2),image:theme.image.rect,colour:'#FFFFFF'},
  text('detailTitle',l.relicPopup.title,'',l.relicPopup.titleFont),text('detail',l.relicPopup.detail,'',l.relicPopup.bodyFont),
  text('rarity',l.relicPopup.rarity,'',l.relicPopup.rarityFont),
  ...tips,action('tipNext',[520,-316,160,48],'关键词翻页'),
  action('popupPrevious',[-266.6666666666667,0,64,64],'◀'),action('popupNext',[266.6666666666667,0,64,64],'▶'),
  action('popupClose',[-514,-316,200,52],'返回'),action('upgrade',[0,-316,200,52],'查看升级'),
  action('detailPrevious',[-250,-316,130,48],'上一段'),action('detailNext',[250,-316,130,48],'下一段'),text('detailCount',[0,-276,200,40],'',theme.font.label)]};
 const tooltip={name:'tooltip',kind:'container',position:[-433.3333333333333,160],size:[l.tip.width,80],visible:false,children:[
  plate('plate',[0,0,l.tip.width,80],theme.color.panelSunken),text('name',[0,0,l.tip.bodyWidth,l.tip.headerHeight],'',l.tip.font,theme.color.goldBright),
  text('body',[0,0,l.tip.bodyWidth,32],'',l.tip.font)]};
 const hoverFace=structuredClone(source.children.find(n=>n.name==='face'));
 Object.assign(hoverFace,{name:'hoverFace',position:[0,0],scale:[4/3,4/3]});
 const hoverHints={name:'hoverHints',kind:'container',size:[...theme.canvas.base],visible:false,
  children:[hoverFace,...structuredClone(tips),structuredClone(previewFace)]};
 assertCompendiumDisplayOnly(hoverHints);
 const children=[plate('backdrop',[0,0,...theme.canvas.base],theme.color.backdrop),
  {name:'blocker',kind:'cursorArea',size:[...theme.canvas.base]},text('title',l.title,'',theme.font.title),
  text('count',l.count,'',theme.font.label),action('close',l.close,'返回主菜单'),
  action('previous',l.previous,'上翻'),action('next',l.next,'下翻'),
  {name:'cardGrid',kind:'grid',position:l.list.slice(0,2),size:l.list.slice(2),itemTemplate:'AbyssDeckCard',grid:{columns:l.cardColumns,horizontal:false,itemSize:l.cardCell,spacing:l.cardSpacing,padding:[8,8,8,8],scrollbar:true}},
  {name:'iconGrid',kind:'grid',position:l.iconViewport.slice(0,2),size:l.iconViewport.slice(2),itemTemplate:'AbyssCompendiumIconRow',visible:false,grid:{columns:1,horizontal:false,itemSize:l.iconCell,spacing:[0,0],padding:[8,8,8,8],scrollbar:true}},
  ...['red','green','blue','purple','colorless','curse'].map((id,i)=>action('color'+id,[-326.6666666666667+i*132,283.2,126,48],['红色','绿色','蓝色','紫色','无色','诅咒'][i])),
  ...['rarity','type','cost'].map((id,i)=>action('sort'+id,[-353.3333333333333+i*150.66666666666666,235.2,140,48],['稀有度','类型','费用'][i])),
  action('viewUpgrade',[300,235.2,240,48],'查看升级'),hoverHints,tooltip,popup];
 for(const node of [popup.children.find(n=>n.name==='detail'),...tips.filter(n=>n.kind==='text'),tooltip.children.find(n=>n.name==='name'),tooltip.children.find(n=>n.name==='body')])Object.assign(node.text,{align:'left',valign:'top'});
 popup.children.find(n=>n.name==='detail').text.valign='middle';
 stage.children.push(entries,{name:'compendiumPanel',kind:'container',size:[...theme.canvas.base],visible:false,children});
 if(templates)templates.push(compendiumIconTemplate(theme));
 return layout;
}
