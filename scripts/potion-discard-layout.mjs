import { nativeControls, nativeTheme } from './native-ui-theme.mjs';
import { finishOfficialPotionFace } from './official-run-hud-components.mjs';
import { potionSlotVisual } from './potion-slot-visual.mjs';

// Existing node counter, modal, shop slots and four-state utility-button tokens.
export function potionDiscardControls(theme = nativeTheme) {
  const { plate, text }=nativeControls(theme);
  const {color:c,font:f,layout:l,space:s}=theme;
  // Button tiers: primary (gold), secondary (raised neutral), ghost (quiet close),
  // danger (destructive discard). Disabled ink stays >=4.5:1 on its sunken plate.
  const tiers={
    primary:{normal:[c.buttonPressedFill,c.buttonPressedText,c.gold],hover:[c.gold,c.textOnLight,c.goldBright]},
    secondary:{normal:[c.panelRaised,c.goldBright,c.goldDim],hover:[c.buttonHover,c.goldBright,c.goldBright]},
    ghost:{normal:[c.panel,c.text,c.line],hover:[c.panelRaised,c.goldBright,c.goldDim]},
    danger:{normal:[c.panelRaised,c.dangerText,c.danger],hover:[c.buttonHover,c.text,c.danger]},
  };
  const button=(name,frame,label,tier='secondary',font=f.label)=>{
    const size=frame.slice(2),variants={...tiers[tier],pressed:[c.buttonPressedFill,c.buttonPressedText,c.goldBright],
      disabled:[c.panelSunken,c.textDim,c.line]};
    return {name,kind:'container',position:frame.slice(0,2),size,children:[{
      name:'hit',kind:'presetButton',size,
      states:Object.fromEntries(Object.keys(variants).map(state=>[state,state])),
      children:Object.entries(variants).map(([state,[fill,ink,border]])=>({name:state,kind:'container',size,
        scale:state==='pressed'?[l.exitMenu.pressedScale,l.exitMenu.pressedScale]:[1,1],children:[
          plate('border',[0,0,...size],border),plate('plate',[0,0,...size.map(v=>v-s.border*2)],fill),
          text('label',[0,0,...size.map((v,i)=>v-l.exitMenu.buttonInset[i])],label,font,ink)]}))} ]};
  };
  const [w,h]=[560,450],entry=l.nativeNode.topBar.potions;
  const y=-h/2+s.l+l.exitMenu.cancel[3]/2;
  const slots=l.potionDiscard;
  const actionWidth=(w-s.xxl*2-s.m*2)/3, actionStep=actionWidth+s.m;
  // One unchanged management action; physical bottle silhouettes are not new
  // direct-use buttons. Runtime paints sparse inventory and actual 3/5 capacity.
  const open = button('open', [...entry], '药水 0/3');
  const visual = l.potionDiscard.entryVisual;
  const palette = { normal: c.mapHeader.menuNormal, hover: c.mapHeader.menuHover,
    pressed: c.mapHeader.menuPressed, disabled: { fill: c.panelSunken, ink: c.textMuted, border: c.line } };
  for (const state of open.children[0].children) {
    const colours = palette[state.name], label = state.children.find(control => control.name === 'label');
    label.visible = true;
    state.children = [plate('entryFace', [0, 0, ...entry.slice(2)], colours.fill), label, ...Array.from({ length: l.battlePotions.count }, (_, i) => {
      const children = potionSlotVisual(theme, {
        border: plate('border', [0, 0, ...visual.size], colours.border),
        plate: plate('plate', [0, 0, ...visual.size.map(value => value - visual.border * 2)], colours.fill),
        bottleSize: visual.bottleSize, ink: colours.ink,
      });
      children.find(control => control.name === 'bottle').visible = false;
      return { name: `slot${i + 1}`, kind: 'container', position: [visual.origin + visual.step * i, 0],
        size: [...visual.size], visible: i < 3, children };
    })];
  }
  return [
    {name:'potionEntry',kind:'container',size:[...theme.canvas.base],visible:false,children:[
      open]},
    {name:'potionPanel',kind:'container',size:[...theme.canvas.base],visible:false,children:[
      plate('veil',[0,0,...theme.canvas.base],c.backdropVeil),
      {name:'blocker',kind:'cursorArea',size:[...theme.canvas.base],focusable:false},
      {...plate('border',[0,0,w,h],c.goldDim),visible:false},{...plate('face',[0,0,w,h],c.panel),visible:false},
      text('title',[0,200,w,40],'药水',f.heading,c.goldBright),
      {...plate('rule',[0,174,120,2],c.goldDim),visible:false},
      text('hint',[0,54,w,40],'选择一瓶药水查看效果',f.label,c.textDim),
      ...Array.from({length:l.battlePotions.count},(_,i)=>{
        const slot=button(`slot${i+1}`,[(i-2)*92,120,72,80],'','secondary',f.body);
        for(const state of slot.children[0].children){
          const label=state.children.find(n=>n.name==='label');label.visible=false;
          state.children=[...potionSlotVisual(theme,{
            border:plate('border',[0,0,44,44],c.goldDim),
            plate:plate('plate',[0,0,42,42],c.panel),bottleSize:40,ink:c.text}),label];
          finishOfficialPotionFace(state);
        }
        return {...slot,visible:i<3};
      }),
      plate('detailWell',[0,-52,500,156],c.panel),
      text('detail',[0,-52,468,144],'',f.label,c.text),
      button('cancel',[-actionStep,y,actionWidth,l.exitMenu.cancel[3]],'关闭','ghost'),
      button('use',[0,y,actionWidth,l.exitMenu.confirm[3]],'使用药水','primary'),
      button('discard',[actionStep,y,actionWidth,l.exitMenu.confirm[3]],'确认丢弃','danger'),
    ]},
  ];
}
