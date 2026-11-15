import test from 'node:test';
import assert from 'node:assert/strict';
import {nativeTheme} from '../scripts/native-ui-theme.mjs';
import {officialAssetsTheme} from '../scripts/official-assets-layout.mjs';
import {experimentalCharacterControls} from '../scripts/character-ui-layout.mjs';
import {deckControls} from '../scripts/deck-ui-layout.mjs';

test('official forced choices have three unchanged full faces and an independent page label',()=>{
 const theme=officialAssetsTheme(nativeTheme);
 const panel=experimentalCharacterControls(theme).find(n=>n.name==='choicePanel');
 const cards=panel.children.filter(n=>/^card\d+$/.test(n.name));
 assert.equal(cards.length,3);
 assert.deepEqual(cards.map(n=>n.position),[[-216,0],[0,0],[216,0]]);
 for(const card of cards)assert.deepEqual(card.children.find(n=>n.name==='face').size,theme.layout.card.size);
 assert(panel.children.find(n=>n.name==='pageHint'));
});
test('pile sort direction is one native triangle per field, without font glyphs',()=>{
 const theme=officialAssetsTheme(nativeTheme),panel=deckControls(theme).find(n=>n.name==='deckPanel');
 const tools=panel.children.find(n=>n.name==='pileTools');
 for(const field of tools.children.filter(n=>n.name!=='plate')){
  const arrow=field.children.find(n=>n.name==='direction');
  assert(arrow);assert.equal(arrow.kind,'image');assert.equal(arrow.image,100003);
  assert(!/[▴▾]/.test(field.children.find(n=>n.name==='label').text.content));
  assert.deepEqual(field.children.find(n=>n.name==='hit').size,[150,44]);
 }
});
test('goop uses the already registered gold asset rather than generic event art',()=>{
 assert.equal(nativeTheme.icon.eventArt.goop,nativeTheme.icon.gold.id);
});
