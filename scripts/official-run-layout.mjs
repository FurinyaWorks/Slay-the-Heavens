// The official profile has one composition boundary. Pages own data and layout,
// never a second skin selected by phase. This module only uses pure layouts.
import {applyOfficialNoncombatLayout} from './noncombat-v25-layout.mjs';
import {applyOfficialNeowLayout} from './noncombat-neow-layout.mjs';
import {applyV25MapLayout} from './v25-map-layout.mjs';
import {applyOfficialMapReturnControls} from './official-map-return-controls.mjs';
import {applyV25RewardLayout,styleMerchant,styleEvent} from './v25-node-layout.mjs';
import {officialRunChrome} from './official-battle-hud.mjs';
import {roundedActionStates,roundedFramedButton,roundedPresetButton} from './native-rounded-button.mjs';
import {monsterActorTierNames,monsterActorTemplateName} from './monster-art.mjs';
import {applyStsRewardRows} from './sts-reward-row-layout.mjs';

const parts=node=>node?.children??node?.controls??[];
const child=(node,name)=>parts(node).find(part=>part.name===name);
const stage=tree=>child(tree,'stage')??tree;
const walk=(node,visit)=>{visit(node);for(const part of parts(node))walk(part,visit);};
const templates=new Set(['AbyssDeckCard','AbyssBattlePileCard','AbyssReadyCardGroup',
 'AbyssReadyCardImage',monsterActorTemplateName,'AbyssMonsterPower','AbyssSelectionHalfTriangle','AbyssForgeCard',
 ...monsterActorTierNames]);
const composed=new WeakSet();
const runRoles=['menuPanel','characterPanel','mapPanel','nodePanel','battlePanel',
 'deckPanel','potionEntry','relicBar','relicPanel'];
function required(node,name){
 const found=child(node,name);
 if(!found)throw Error(`Official run root ${node?.name} missing ${name}`);
 return found;
}
function rootKind(tree){
 if(tree?.name==='SlayTheAbyss')return 'run';
 if(tree?.name==='AbyssBattle')return 'battle';
 if(templates.has(tree?.name))return 'template';
 throw Error('Unregistered official root '+tree?.name);
}
function preflightCard(face){
 for(const role of ['roundFrame','roundShadow','roundBody','skin','costCore','costDisc',
  'roleRing','roleMark','nameBand','nameRule','name','cost','tagEdge','tagBody'])required(face,role);
 for(const role of ['attack','skill','power'])required(required(face,'skin'),role);
}
export function preflightOfficialRoots(trees){
 // Validate the entire batch before any host is changed.
 const roots=new Set();
 for(const tree of trees){
  if(roots.has(tree))throw Error('Duplicate official root '+tree.name);
  roots.add(tree);
  const kind=rootKind(tree),host=stage(tree);
  if(composed.has(tree))throw Error('Official composition already applied: '+tree.name);
  if(['AbyssDeckCard','AbyssBattlePileCard'].includes(tree.name))preflightCard(required(tree,'face'));
  if(kind==='run')for(const role of runRoles)required(host,role);
  if(kind!=='template'){
   const battle=kind==='run'?child(host,'battlePanel'):host;
   for(const role of ['topBar','card1','rewardStage','rewardList','endTurn'])required(battle,role);
   preflightCard(child(battle,'card1'));
  }
  walk(tree,node=>{
   if(['nativeCardBody','officialRunBar','v25MapPaper'].includes(node.name))
    throw Error('Official composition already applied: '+tree.name+'/'+node.name);
   if(child(node,'roundFrame')||child(node,'skin')||child(node,'costDisc'))preflightCard(node);
  });
 }
}
export function finishOfficialComposition(trees){
 assertOfficialRunContracts(trees);
 for(const tree of trees)composed.add(tree);
}
function roundRunActions(host,theme){
 const panels={
  deckPanel:{close:'secondary',upgradePreview:'secondary',previous:'secondary',next:'secondary',
   filterAll:'secondary',filterAttack:'secondary',filterSkill:'secondary',filterPower:'secondary',
   filterStatus:'secondary',filterCurse:'secondary',sortoriginal:'secondary',sorttype:'secondary',sortcost:'secondary'},
  choicePanel:{before:'secondary',after:'secondary',confirm:'primary'},
  relicPanel:{close:'secondary',previous:'secondary',next:'secondary'},
  runMenu:{resume:'primary',map:'secondary',abandon:'danger',quit:'danger'},
  exitPanel:{cancel:'secondary',confirm:'danger'},
 };
 for(const [panel,actions] of Object.entries(panels))for(const [name,role] of Object.entries(actions)){
  roundedPresetButton(required(required(required(host,panel),name),'hit'),theme,role);
 }
 const deck=required(host,'deckPanel');
 for(const [name,frame] of Object.entries(theme.layout.deckView.browser.footer)){
  const control=required(deck,name);
  control.position=frame.slice(0,2);control.size=frame.slice(2);
 }
 const grid=required(deck,'pileGrid'),viewport=theme.layout.deckView.pileViewport;
 grid.position=viewport.slice(0,2);grid.size=viewport.slice(2);
 const node=required(host,'nodePanel'),menu=required(host,'menuPanel'),treasure=required(node,'treasureView');
 const loot=theme.layout.nativeNode.rewardList.rows.map((_,i)=>required(treasure,'rewardItem'+(i+1)));
 for(const button of [required(node,'back'),required(node,'confirm'),required(treasure,'take'),...loot,
  required(required(node,'pickerView'),'matchRetry'),
  required(required(menu,'result'),'viewEasterEgg'),required(required(host,'victoryEasterEgg'),'close'),
  required(required(host,'pageReveal'),'cancel')]){
  roundedFramedButton(button,theme);
 }
 const settle=required(menu,'settle'),start=required(menu,'start');
 for(const [button,size,role] of [[settle,settle.size,'primary'],
  [start,theme.layout.nativeMenu.resultRestart.slice(2),'secondary']]){
  const face=roundedActionStates(size,theme,role);
  face.visible=button===settle;
  button.children.splice(button.children.indexOf(required(button,'label')),0,face);
 }
}
function roundBattleActions(battle,theme){
 const popup=required(required(battle,'potionHelp'),'potionPopup'),layout=theme.layout.potionPopup;
 const height=Math.max(layout.actionHeight,theme.layout.nativeText.lineHeight);
 roundedPresetButton(required(popup,'use'),theme,'primary',{size:[layout.width/2,height]});
 roundedPresetButton(required(popup,'discard'),theme,'secondary',{size:[layout.width/3-layout.padding,height]});
 roundedPresetButton(required(battle,'skip'),theme,'secondary');
 roundedPresetButton(required(battle,'start'),theme,'primary');
 roundedPresetButton(required(battle,'endTurn'),theme,'turn',{name:'v25Chrome'});
}

export function composeOfficialRun(tree,theme){
 const kind=rootKind(tree);
 if(kind==='run'){
  applyOfficialNoncombatLayout(tree,theme);
  styleEvent(required(child(stage(tree),'nodePanel'),'eventView'),theme);
  applyOfficialNeowLayout(tree,theme);
  const node=child(stage(tree),'nodePanel'),shop=child(node,'shopView');
  const merchant=required(node,'merchant');
  styleMerchant(merchant,theme);
  theme.layout.nativeNode.shop.columns.forEach((x,i)=>{
   required(shop,'card'+(i+1)).position[0]=x;
   required(shop,'price'+(i+1)).position[0]=x;
  });
  applyV25MapLayout(tree,theme);
  applyOfficialMapReturnControls(required(stage(tree),'mapPanel'),required(stage(tree),'combatRewards'),theme);
  roundRunActions(stage(tree),theme);
 }
 if(kind!=='template'){
  applyV25RewardLayout(tree,theme);
  applyStsRewardRows(tree,theme);
  roundBattleActions(kind==='run'?required(stage(tree),'battlePanel'):stage(tree),theme);
 }
 if(kind==='run')officialRunChrome(tree,theme);
}

const cardRoles=['nativeCardBody','nativeRibbon','nativeCostOrb','tagEdge','tagBody','stsReferenceBack','stsReferenceChrome','stsReferenceCost'];
function cardMaterial(face){
 return JSON.stringify(cardRoles.map(role=>required(face,role)));
}
export function assertOfficialRunContracts(trees){
 let cardReference;
 for(const tree of trees){
  const kind=rootKind(tree),host=stage(tree);
  if(['AbyssDeckCard','AbyssBattlePileCard'].includes(tree.name))required(required(tree,'face'),'nativeCardBody');
  walk(tree,node=>{
   if(!child(node,'roundFrame')&&!child(node,'nativeCardBody'))return;
   required(node,'costDisc');
   const material=cardMaterial(node);
   if(cardReference===undefined)cardReference=material;
   else if(material!==cardReference){const a=JSON.parse(material),b=JSON.parse(cardReference);throw Error('Shared card material drift: '+tree.name+'/'+node.name+' '+cardRoles.filter((_,i)=>JSON.stringify(a[i])!==JSON.stringify(b[i])).join(','));}
  });
  if(kind!=='run')continue;
  for(const role of runRoles)required(host,role);
  const battle=child(host,'battlePanel'),bar=required(battle,'topBar');
  const source=structuredClone(bar);source.name='officialRunBar';
  source.children=parts(source).filter(part=>!['battleRoute','floorIcon'].includes(part.name));
  walk(source,node=>{
   if(['cursorArea','presetButton'].includes(node.kind))throw Error('Shared run bar duplicates input ownership');
  });
  for(const role of ['mapPanel','nodePanel']){
   const page=child(host,role),bars=parts(page).filter(part=>part.name==='officialRunBar');
   if(bars.length!==1||JSON.stringify(bars[0])!==JSON.stringify(source))
    throw Error('Shared run bar drift: '+role);
   const index=parts(page).indexOf(bars[0]);
   const backdrop=role==='mapPanel'?'v25MapPaper':'backdrop';
   if(index<=parts(page).findIndex(part=>part.name===backdrop))
    throw Error('Shared run bar covered by background: '+role);
  }
  for(const role of ['relicPanel'])walk(required(host,role),node=>{
   if(node.kind==='image'&&node.image===107311&&node.visible!==false&&node.opacity!==0)
    throw Error('Shared relic surface replaced by catalog panel');
  });
 }
}
