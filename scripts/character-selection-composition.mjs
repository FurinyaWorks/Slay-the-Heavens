// Positions measured in the 1280x720 Slay the Spire character-screen reference.
// Data and input controls remain owned by the existing selection controller.
import { flagButton } from './v25-character-layout.mjs';
const children=n=>n.children??n.controls??[];
const child=(n,name)=>children(n).find(c=>c.name===name);
const frame=(x,y,w,h)=>({position:[x+w/2-640,360-y-h/2],size:[w,h]});
function placeText(n,box,font,colour){
 Object.assign(n,frame(...box));
 Object.assign(n.text,{fontSize:font,minFontSize:font,colour,align:'left',valign:'middle'});
 n.size[1]=Math.max(n.size[1],font*2);
}
function surface(name,w,h,colour,theme){
 return {name,kind:'container',size:[w,h],children:[{name:'fill',kind:'image',position:[0,0],size:[w,h],image:theme.image.rect,colour}]};
}
export function styleCharacterFlag(button,key,theme){
 const position=button.position;
 const states=children(child(button,'hit'));
 const captions=states.map(state=>child(state,'label').text.content);
 flagButton(button,key,theme);
 button.position=position;
 for(const [index,state] of states.entries()){
  const backing=child(state,'officialButtonBacking');
  if(backing)backing.visible=false;
  child(state,'label').text.content=captions[index];
 }
}
export function characterSelectionComposition(panel,theme){
 const modal=child(panel,'deckView');modal.visible=false;modal.children=[];
 for(const name of ['title','v25HeadingEmblem','v25HeadingDivider','v25HeadingRule'])child(panel,name).visible=false;
 const details=child(panel,'details');
 const board=surface('informationBoard',536,344,'#10121D',theme);
 Object.assign(board,frame(96,184,536,344));
 child(board,'fill').opacity=.58;
 details.children.unshift(board);
 const specs={name:[[115,216,505,60],48,'#E8C75C'],stats:[[145,280,145,30],18,'#F36C65'],gold:[[328,280,160,30],18,'#DFC552'],
  v25Story:[[115,326,475,48],17,'#F3EFDA'],relic:[[162,379,430,30],20,'#E7CA5A'],relicText:[[162,403,440,35],17,'#F3EFDA'],
  deckTitle:[[115,444,425,28],17,'#E7CA5A'],deckSummary:[[115,472,470,50],16,'#F3EFDA']};
 for(const [name,[box,font,colour]]of Object.entries(specs))placeText(child(details,name),box,font,colour);
 // The integrated shared deck browser keeps its existing input owner. Place
 // that entry below the summary and beside the selected character card.
 const deck=child(details,'deckOpen');
 if(deck){
  Object.assign(deck,frame(190,532,160,36));
  const hit=child(deck,'hit');hit.size=[160,36];
  for(const state of children(hit)){
   state.size=[160,36];
   child(state,'border').size=[160,36];child(state,'plate').size=[156,32];
   const label=child(state,'label');label.position=[0,0];label.size=[160,36];
   label.text.fontSize=18;label.text.minFontSize=18;
  }
 }
 for(const name of ['relicTag','deckRule','portraitFrame','floorShadow','officialSelectionFigure']){const n=child(details,name);if(n)n.visible=false;}
 Object.assign(child(details,'v25HealthIcon'),frame(115,286,23,21));
 const bag=child(details,'v25GoldIcon');Object.assign(bag,frame(295,284,25,28));
 const relic=child(details,'v25RelicIcon');
 Object.assign(relic,frame(115,383,36,44));
 const relicImage=child(relic,'image');if(relicImage)relicImage.size=[36,36*90/83];
 const roster=child(panel,'v25Roster');
 Object.assign(child(roster,'selected'),frame(360,533,124,124));
 for(let i=1;i<=3;i++)Object.assign(child(roster,'locked'+i),frame(510+(i-1)*147,544.5,101,101));
 for(const name of ['cancel','confirm'])styleCharacterFlag(child(panel,name),name,theme);
 // Same existing native portrait controller; a bottom-most, dedicated host.
 panel.children.unshift({name:'lumineSelectionBackground',kind:'container',position:[0,0],size:[1280,720],visible:false,children:[]});
}
