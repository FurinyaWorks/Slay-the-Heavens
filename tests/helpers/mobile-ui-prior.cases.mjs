import test from 'node:test';
import assert from 'node:assert/strict';
import {gunzipSync} from 'node:zlib';
import {integratedCiProof,originalMobileUiCiArchive,originalPortraitIdleCiArchive} from './integrated-ci-source.mjs';
import {replayMobileUiPrior} from './replay-mobile-ui-prior.mjs';
test('the complete original P0 CI archive is reconstructed from retained views and rejects any changed field',()=>{
 const original=JSON.parse(gunzipSync(originalMobileUiCiArchive()));
 assert.deepEqual(original.inventory,integratedCiProof.inventories.mobileUiPrior.js);
 assert.deepEqual(original.luaInventory,integratedCiProof.inventories.mobileUiPrior.lua);
 for(const [path,row]of Object.entries(original.files)){
  assert.deepEqual(row.current,integratedCiProof.files[path].views.mobileUiPrior);
  for(const [name,view]of Object.entries(row.views))assert.deepEqual(view,integratedCiProof.files[path].views[name]);
 }
 for(const mutate of [p=>p.files['tests/official-choice-pagination.test.mjs'].views.mobileUiPrior.source+='\n',
  p=>p.priorArchive.body.inventory.pop(),p=>p.priorArchive.fileOrder.pop(),p=>p.priorArchive.gzipOs=3]){
  const invalid=structuredClone(integratedCiProof);mutate(invalid);assert.throws(()=>originalMobileUiCiArchive(invalid));
 }
});
test('the complete seven-owner CI predecessor reconstructs every original view and rejects changes',()=>{
 const original=JSON.parse(gunzipSync(originalPortraitIdleCiArchive()));
 assert.deepEqual(original.inventory,integratedCiProof.inventories.portraitIdlePrior.js);
 assert.deepEqual(original.luaInventory,integratedCiProof.inventories.portraitIdlePrior.lua);
 for(const [path,row]of Object.entries(original.files)){
  assert.deepEqual(row.current,integratedCiProof.files[path].views.portraitIdlePrior);
  for(const [name,view]of Object.entries(row.views))assert.deepEqual(view,integratedCiProof.files[path].views[name]);
 }
 for(const mutate of [p=>p.files['tests/session-menu-navigation.test.mjs'].views.portraitIdlePrior.source+='\n',
  p=>p.portraitIdlePriorArchive.body.inventory.pop(),p=>p.portraitIdlePriorArchive.fileOrder.pop(),p=>p.portraitIdlePriorArchive.gzipOs=3]){
  const invalid=structuredClone(integratedCiProof);mutate(invalid);
  assert.throws(()=>originalPortraitIdleCiArchive(invalid));
 }
});

test('complete original P0 contracts replay: four whole scripts with fresh authorization per child',t=>{
 const outputs=replayMobileUiPrior(['tests/official-choice-pagination.test.mjs','tests/official-assets.test.mjs',
  'tests/official-assets-legibility.test.mjs','tests/game-ui.test.mjs']);
 for(const [path,output]of Object.entries(outputs))t.diagnostic(path+' '+output.match(/^# tests \d+$/m)[0]+'; all original assertions passed');
});
