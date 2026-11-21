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
export function applyOfficialNoncombatLayout(layout,theme){
 const stage=child(layout,'stage')??layout;
 const menu=child(stage,'menuPanel');
 if(!menu||!child(stage,'characterPanel')||child(child(menu,'v25MainMenu'),'approvedTitleLogo'))return layout;
 const start=child(child(stage,'menuPanel'),'start');
 if(!child(start,'officialResultLabel'))start.children.push({...structuredClone(child(start,'label')),name:'officialResultLabel',visible:false});
 applyV25MenuLayout(layout,theme);
 applyApprovedNativeMenu(child(stage,'menuPanel'));
 const characterTheme={...theme,v25Character:{...theme.v25Character,story:'使用岩元素护盾与结晶应对敌人。'}};
 applyV25CharacterLayout(layout,characterTheme);
 const panel=child(stage,'characterPanel'),selected=child(child(panel,'v25Roster'),'selected');
 // Preserve the Owner-approved #785 removal of the stationary selection shade.
 const oldVeil=child(panel,'officialBackdropVeil');if(oldVeil)oldVeil.visible=false;
 // The static exact-alpha constellation replaces the release initial placeholder.
 selected.children.splice(selected.children.indexOf(child(selected,'v25Constellation')),1,constellationGeometry(theme));
 const background=child(panel,'v25Background');
 background.visible=true; background.children=[{name:'landscape',kind:'image',position:[0,0],size:[1280,720],image:theme.image.officialBackdrops.title,colour:'#FFFFFF'}];
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
