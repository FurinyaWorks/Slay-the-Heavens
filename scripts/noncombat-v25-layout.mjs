import {applyApprovedNativeMenu} from './native-menu-approved-layout.mjs';
// Reuse the frozen V25 page layout and existing input paths. Native textures
// replace bounded decorative surfaces; no new page owner or image rasterizer.
import {relicTooltip} from './relic-view-layout.mjs';
import {stylePageReveal} from './cinematic-ui-layout.mjs';
import {applyV25MenuLayout} from './v25-menu-layout.mjs';
import {applyV25CharacterLayout} from './v25-character-layout.mjs';
import {constellationGeometry} from './constellation-geometry.mjs';
import {characterSelectionComposition,styleCharacterFlag} from './character-selection-composition.mjs';
const parts=n=>n?.controls??n?.children??[];
const child=(n,name)=>parts(n).find(c=>c.name===name);
function positionRunMenu(panel,theme){
 const layout=theme.layout.runMenu;
 for(const name of ['map','mainMenu','rule','abandon','quit','dismissHint']){
  child(panel,name).position=layout[name].slice(0,2);
 }
 for(const name of ['border','face','catch']){
  const part=child(panel,name),inset=name==='face'?theme.space.border*2:0;
  part.position=layout.panel.slice(0,2);
  part.size=layout.panel.slice(2).map(value=>value-inset);
 }
}

export function applyOfficialNoncombatLayout(layout,theme){
 const stage=child(layout,'stage')??layout;
 const menu=child(stage,'menuPanel');
 if(!menu||!child(stage,'characterPanel')||child(child(menu,'v25MainMenu'),'sts1TitleLogo'))return layout;
 const start=child(child(stage,'menuPanel'),'start');
 if(!child(start,'officialResultLabel'))start.children.push({...structuredClone(child(start,'label')),name:'officialResultLabel',visible:false});
 applyV25MenuLayout(layout,theme);
 applyApprovedNativeMenu(menu);
 // Preserve the user's released removal of the guide from both menus (#784).
 const retired=new Set(['help','guide']);
 for(const name of ['exitPanel','runMenu']){
  const panel=child(stage,name);
  panel.children=panel.children.filter(part=>!retired.has(part.name));
 }
 child(child(stage,'exitPanel'),'title').position[0]=0;
 positionRunMenu(child(stage,'runMenu'),theme);
 applyV25CharacterLayout(layout,theme);
 const panel=child(stage,'characterPanel'),selected=child(child(panel,'v25Roster'),'selected');
 // Preserve the Owner-approved #785 removal of the stationary selection shade.
 const oldVeil=child(panel,'officialBackdropVeil');if(oldVeil)oldVeil.visible=false;
 // The static exact-alpha constellation replaces the release initial placeholder.
 selected.children.splice(selected.children.indexOf(child(selected,'v25Constellation')),1,constellationGeometry(theme));
 const background=child(panel,'v25Background');
 background.visible=true;
 background.children=[{name:'fill',kind:'image',position:[0,0],size:[...theme.canvas.base],
  image:theme.image.rect,colour:theme.color.backdrop,raycastTarget:false}];
 // The native figure controller owns this host's readiness and presentation.
 // Preserve its established scale instead of enlarging a 133px raster 10x.
 const figure=child(child(panel,'details'),'officialSelectionFigure');
 if(figure){figure.position=[270,-20];figure.size=[133,133];figure.scale=[1,1];}
 child(child(panel,'details'),'portraitNote').visible=false;
 panel.children=panel.children.filter(n=>n.name!=='lumineSelectionBackground');
 characterSelectionComposition(panel,theme);
 const exit=child(child(stage,'runMenu'),'mainMenu');
 exit.size=[180,60];child(exit,'hit').size=[180,60];
 for(const state of parts(child(exit,'hit'))){
  state.size=[180,60];
  const label=child(state,'label');
  label.text.content='退出游戏';label.size=[160,52];
  label.text.colour=state.name==='disabled'?theme.color.textMuted:theme.officialAssets.buttonInk;
 }
 styleCharacterFlag(exit,'cancel',theme);
 const roots=parts(stage);
 const legacy=child(stage,'prologuePanel');
 if(legacy)roots.splice(roots.indexOf(legacy),1);
 stylePageReveal(child(stage,'pageReveal'));
 child(stage,'relicBar').children.push(relicTooltip(theme));
 return layout;
}
