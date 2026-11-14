import {nativeControls} from './native-ui-theme.mjs';

// Detached, bounded browser. Reuses the existing panel/button/text primitives.
export function attachCompendium(layout,theme){
 const stage=(layout.controls??[]).find(n=>n.name==='stage');
 if(!stage)throw Error('Compendium requires viewport stage');
 const {button,text,plate}=nativeControls(theme),l=theme.layout.compendium;
 const action=(name,rect,label)=>button(name,rect,label,{inset:[8,4],fontSize:theme.font.label});
 const entries={name:'compendiumEntries',kind:'container',size:[...theme.canvas.base],visible:false,children:
  ['卡牌图鉴','遗物图鉴','药水图鉴'].map((label,i)=>action(['cards','relics','potions'][i],l.entries[i],label))};
 const children=[plate('backdrop',[0,0,...theme.canvas.base],theme.color.backdrop),
  {name:'blocker',kind:'cursorArea',size:[...theme.canvas.base]},
  plate('panel',l.panel,theme.color.panelSunken),text('title',l.title,'',theme.font.title),
  text('count',l.count,'',theme.font.label),action('close',l.close,'返回主菜单'),
  action('previous',l.previous,'上一页'),action('next',l.next,'下一页'),
  text('detailTitle',l.detailTitle,'',theme.font.title),text('detail',l.detail,'',theme.font.body),
  action('upgrade',l.upgrade,'升级预览'),action('detailPrevious',l.detailPrevious,'上一段'),
  action('detailNext',l.detailNext,'下一段'),text('detailCount',l.detailCount,'',theme.font.label)];
 for(let i=0;i<l.rows;i++)children.push(action('row'+(i+1),[l.list[0],l.list[1]-i*l.list[3],l.list[2],l.list[3]-8],''));
 for(const node of children)if(node.name==='detail')Object.assign(node.text,{align:'left',valign:'top'});
 stage.children.push(entries,{name:'compendiumPanel',kind:'container',size:[...theme.canvas.base],visible:false,children});
 return layout;
}
