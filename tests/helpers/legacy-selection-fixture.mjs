import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {defaultReductionCiPacket} from './release-bootstrap-ci-source.mjs';
import {createOptInArtFixture} from './opt-in-art-fixture.mjs';

// Replay the already archived production generator, not an invented selection table.
// Only this isolated fixture receives the legacy output; current builds remain untouched.
export async function createLegacySelectionFixture() {
 const record=defaultReductionCiPacket.files['scripts/official-portraits.mjs'].before;
 assert.equal(createHash('sha256').update(record.source).digest('hex'),record.sha256);
 const base=new URL('../../scripts/official-portraits.mjs',import.meta.url);
 const source=record.source.replace(/from (['"])(\.\.?\/[^'"]+)\1/g,(_match,quote,path)=>
  `from ${quote}${new URL(path,base).href}${quote}`);
 const {writePortraitModule}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
 const fixture=createOptInArtFixture({bindTemplates:true});
 try {
  const generated=writePortraitModule(fixture.directory,{imageTemplateIndex:41,containerTemplateIndex:73});
  assert.match(generated,/^selection133=/m,'real predecessor must retain its fallback');
  return fixture;
 } catch(error) { fixture.dispose();throw error; }
}
