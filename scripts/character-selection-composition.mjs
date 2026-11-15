// Positions measured in the 1280x720 Slay the Spire character-screen reference.
// Data and input controls remain owned by the existing selection controller.
import {applyStsCharacterActions} from './sts-character-select-layout.mjs';
const children=n=>n.children??n.controls??[];
const child=(n,name)=>children(n).find(c=>c.name===name);
const frame=(x,y,w,h)=>({position:[x+w/2-640,360-y-h/2],size:[w,h]});
function placeText(n,box,font,colour){
 Object.assign(n,frame(...box));
 Object.assign(n.text,{fontSize:font,minFontSize:font,colour,align:'left',valign:'middle'});
 n.size[1]=Math.max(n.size[1],font*2);
}
export function characterSelectionComposition(panel,theme){
 const modal=child(panel,'deckView');modal.visible=false;modal.children=[];
 for(const name of ['title','v25HeadingEmblem','v25HeadingDivider','v25HeadingRule'])child(panel,name).visible=false;
 const details=child(panel,'details');
 const t=theme.layout.stsCharacter;
 for(const [name,rectangle,font,colour]of [
  ['name','name','name','name'],['stats','stats','stats','hp'],['gold','gold','stats','gold'],
  ['v25Story','story','story','text'],['relic','relic','relic','name'],['relicText','relicText','relicText','text'],
  ['deckTitle','deckTitle','deckTitle','text'],['deckSummary','deckSummary','deckSummary','text'],
 ])placeText(child(details,name),t.rectangles[rectangle],Math.max(t.font[font],theme.officialAssets.battleHud.numberSize),t.colour[colour]);
 for(const name of ['relicTag','deckRule','portraitFrame','floorShadow','officialSelectionFigure']){const n=child(details,name);if(n)n.visible=false;}
 Object.assign(child(details,'v25HealthIcon'),frame(...t.rectangles.hpIcon));
 const bag=child(details,'v25GoldIcon');Object.assign(bag,frame(...t.rectangles.goldIcon));
 const relic=child(details,'v25RelicIcon');
 Object.assign(relic,frame(...t.rectangles.relicIcon));
 const relicImage=child(relic,'image');if(relicImage)relicImage.size=[36,36*90/83];
 const roster=child(panel,'v25Roster');
 Object.assign(child(roster,'selected'),frame(360,533,124,124));
 for(let i=1;i<=3;i++)Object.assign(child(roster,'locked'+i),frame(510+(i-1)*147,544.5,101,101));
 applyStsCharacterActions(panel,theme);
 // Same existing native portrait controller; a bottom-most, dedicated host.
 panel.children.unshift({name:'lumineSelectionBackground',kind:'container',position:[0,0],size:[1280,720],visible:false,children:[]});
}
