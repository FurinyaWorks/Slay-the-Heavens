import assert from 'node:assert/strict';

// Preserve the original 38 battle/shop/picker hosts and the twelve release
// starter-deck faces, ten combat-choice faces, and the #940 deck detail face.
// Expected paths are independent of the production walker.
const cards=(prefix,count,suffix='')=>Array.from({length:count},(_,i)=>`SlayTheAbyss/stage/${prefix}${i+1}${suffix}`);
export const expectedReadyCardChoiceHosts=cards('choicePanel/card',10,'/face');
export const expectedReadyCardGameHosts=[
 ...cards('battlePanel/card',10),...cards('nodePanel/shopView/card',7),
 ...cards('nodePanel/pickerView/card',6),
 ...['before','after','target'].map(name=>`SlayTheAbyss/stage/nodePanel/pickerView/${name}`),
 ...cards('nodePanel/pickerView/forgeGrid/card',12),
 ...cards('characterPanel/deckView/deckCard',12,'/face'),
 ...expectedReadyCardChoiceHosts,
 'SlayTheAbyss/stage/deckPanel/cardFocus/face',
];
export function readyCardHolderPaths(tree){
 const paths=[];
 function visit(node,parent=[]){
  const path=[...parent,node.name];
  if(node.name==='artSamples')paths.push(parent.join('/'));
  for(const child of node.children??node.controls??[])visit(child,path);
 }
 visit(tree);return paths;
}

export function assertReadyCardGameHosts(tree,{enabled=true,staged=true}={}){
 const expected=enabled?expectedReadyCardGameHosts.map(path=>staged?path:path.replace('/stage/','/')):[];
 assert.deepEqual(readyCardHolderPaths(tree).sort(),[...expected].sort(),
  'retain exact 38 original, 12 starter-deck, 10 combat-choice and one deck detail host only when enabled');
 function visit(node){
  if(node.name==='artSamples'){
   assert.deepEqual(node.children,[],'runtime holders must remain empty');
   assert.equal(node.visible,false,'runtime holders must remain dormant');
  }
  for(const child of node.children??node.controls??[])visit(child);
 }
 visit(tree);
}
