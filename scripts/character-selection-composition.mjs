// Positions measured in the 1280x720 Slay the Spire character-screen reference.
// Data and input controls remain owned by the existing selection controller.
import {roundedButtonState} from './native-rounded-button.mjs';

const children=n=>n.children??n.controls??[];
const child=(n,name)=>children(n).find(c=>c.name===name);
const frame=(x,y,w,h)=>({position:[x+w/2-640,360-y-h/2],size:[w,h]});
function placeText(n,box,font,colour){
 Object.assign(n,frame(...box));
 Object.assign(n.text,{fontSize:font,minFontSize:font,colour,align:'left',valign:'middle',
  outline:true,outlineColour:'#171311',outlineOpacity:.9});
 n.size[1]=Math.max(n.size[1],font*2);
}
export function styleCharacterFlag(button,key,theme){
 const hit=child(button,'hit');
 const [rim,cloth]=theme.officialAssets.flagButton[key];
 for(const state of children(hit)){
  const label=child(state,'label');
  const factor=state.name==='hover'?1.17:state.name==='pressed'?.9:state.name==='disabled'?.6:1;
  const tint=hex=>'#'+hex.slice(1).match(/../g).map(v=>Math.min(255,Math.round(parseInt(v,16)*factor)).toString(16).padStart(2,'0')).join('');
  roundedButtonState(state,[180,60],[tint(rim),tint(cloth)],'v25Flag');
  label.position=[0,0];label.text.fontSize=24;label.text.minFontSize=24;
 }
}
export function characterSelectionComposition(panel,theme){
 const modal=child(panel,'deckView');modal.visible=false;modal.children=[];
 for(const name of ['title','v25HeadingEmblem','v25HeadingDivider','v25HeadingRule'])child(panel,name).visible=false;
 const details=child(panel,'details');
 const specs={name:[[115,216,505,60],48,'#E8C75C'],stats:[[145,280,145,30],18,'#F36C65'],gold:[[328,280,160,30],18,'#DFC552'],
  v25Story:[[115,326,475,48],17,'#F3EFDA'],relic:[[162,379,430,30],20,'#E7CA5A'],relicText:[[162,403,440,35],17,'#F3EFDA'],
  deckTitle:[[115,444,425,28],17,'#E7CA5A'],deckSummary:[[115,472,470,50],16,'#F3EFDA']};
 for(const [name,[box,font,colour]]of Object.entries(specs))placeText(child(details,name),box,font,colour);
 details.children=details.children.filter(n=>n.name!=='deckOpen');
 for(const name of ['relicTag','deckRule','portraitFrame','floorShadow','officialSelectionFigure']){const n=child(details,name);if(n)n.visible=false;}
 Object.assign(child(details,'v25HealthIcon'),frame(115,286,23,21));
 const bag=child(details,'v25GoldIcon');Object.assign(bag,frame(295,284,25,28));
 const relic=child(details,'v25RelicIcon');
 Object.assign(relic,frame(115,383,36,44),{visible:true});
 // Amber crystal facets for the rock Traveler's starter relic.
 relic.children=[
  [-9,-4,12,19,18,'#855434'],[9,-6,13,18,-23,'#B17945'],
  [0,9,21,22,0,'#D9A255'],[0,-8,21,12,180,'#9B5D39'],
  [-3,7,10,17,14,'#F2D58F'],[1,-5,9,10,176,'#D6A365'],
 ].map(([x,y,w,h,rotation,colour],index)=>({
  name:'facet'+index,kind:'image',position:[x,y],size:[w,h],
  image:100003,colour,rotation,raycastTarget:false,
 }));
 const roster=child(panel,'v25Roster');
 Object.assign(child(roster,'selected'),frame(360,533,124,124));
 for(let i=1;i<=3;i++)Object.assign(child(roster,'locked'+i),frame(510+(i-1)*147,544.5,101,101));
 for(const name of ['cancel','confirm'])styleCharacterFlag(child(panel,name),name,theme);
 // Same existing native portrait controller; a bottom-most, dedicated host.
 panel.children.unshift({name:'lumineSelectionBackground',kind:'container',position:[0,0],size:[1280,720],visible:false,children:[]});
}
