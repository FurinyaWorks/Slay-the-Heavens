import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {ciSourceAtEpoch,componentUiCiSourceProof} from '../../../tests/helpers/component-ui-ci-source-inverse.mjs';
import {preRunHudCiSource,runHudPriorRead} from '../../../tests/helpers/run-hud-ci-source.mjs';
import {releaseCalibrationReaderSource} from '../../../tests/helpers/release-calibration-reader-source.mjs';
import {beforeReleaseFastB9Ci} from '../../../tests/helpers/release-fast-b9-ci-source.mjs';
const hash=s=>createHash('sha256').update(s).digest('hex');
const impact='tests/ci-impact.test.mjs',draft='tests/helpers/draft-quality-workflow.mjs';
test('component281 maps only the final complete impact source into its exact immutable epoch',()=>{
 const live=readFileSync(impact,'utf8').replaceAll('\r\n','\n');
 for(const eol of ['\n','\r\n']){
  const source=live.replaceAll('\n',eol);
  assert.equal(ciSourceAtEpoch(impact,source,'component281'),componentUiCiSourceProof.files[impact].afterSource);
  for(const foreign of [source+eol,source.slice(1),source.slice(0,-1),source.replaceAll(eol,'\r\r\n'),null,undefined,{},17])
   assert.strictEqual(ciSourceAtEpoch(impact,foreign,'component281'),foreign);
  for(const path of ['foreign/'+impact,'__proto__','constructor','src/lua/abyss_ui.lua'])
   assert.strictEqual(ciSourceAtEpoch(path,source,'component281'),source);
  for(const epoch of ['foundationFix','componentAliasFix','officialAssets','officialAssetsFlow'])
   assert.strictEqual(ciSourceAtEpoch(impact,source,epoch),source,'other epochs retain their source');
 }
 assert.throws(()=>ciSourceAtEpoch(impact,live,'foreign'),'unknown epoch is rejected');
});
test('native-closeout reads the exact Draft predecessor while byte drift and missing reads remain visible',()=>{
 const live=readFileSync(draft,'utf8').replaceAll('\r\n','\n');
 for(const eol of ['\n','\r\n']){
  const source=live.replaceAll('\n',eol),prior=preRunHudCiSource(draft,source);
  assert.equal(hash(prior),'5c3cc95c0371927db143c573c1500843b97ca8e138f67737aede03e558b1d986');
  assert.equal(runHudPriorRead(()=>source)(draft,'utf8'),prior);
  assert.deepEqual(runHudPriorRead(()=>Buffer.from(source))(draft),Buffer.from(prior));
  for(const foreign of [source+eol,source.slice(1),source.slice(0,-1),source.replaceAll(eol,'\r\r\n'),null,undefined,{},17])
   assert.strictEqual(preRunHudCiSource(draft,foreign),foreign);
  for(const path of ['foreign/'+draft,'__proto__','constructor','src/lua/abyss_ui.lua'])
   assert.strictEqual(preRunHudCiSource(path,source),source);
  const bad=Buffer.from(source+eol);assert.strictEqual(runHudPriorRead(()=>bad)(draft),bad);
 }
 assert.throws(()=>runHudPriorRead(()=>{throw Error('missing fresh source');})(draft,'utf8'),/missing fresh source/);
 const workflow=readFileSync('.github/workflows/quality.yml','utf8');
 assert.strictEqual(releaseCalibrationReaderSource('.github/workflows/quality.yml',workflow,'nativeCloseout'),workflow,'raw Release workflow is not projected by the new reader continuation');
 assert.strictEqual(releaseCalibrationReaderSource(draft,live,'component281'),live,'Draft helper maps only in nativeCloseout');
 assert.strictEqual(releaseCalibrationReaderSource(draft,live,'foreign'),live);
});
test('native-closeout preserves the complete component reader predecessor and rejects drift',()=>{
 const path='tests/helpers/component-ui-ci-source-inverse.mjs',live=readFileSync(path,'utf8').replaceAll('\r\n','\n');
 for(const eol of ['\n','\r\n']){
  const source=live.replaceAll('\n',eol);
  assert.equal(hash(preRunHudCiSource(path,source)),'7422a8f113fc3e592fa12574954a62d7e2c3a86f2a72da0d9d3f7b33b571a1d2');
  for(const foreign of [source+eol,source.slice(1),source.slice(0,-1),source.replaceAll(eol,'\r\r\n'),null,undefined,{},17])
   assert.strictEqual(preRunHudCiSource(path,foreign),foreign);
  assert.strictEqual(releaseCalibrationReaderSource(path,source,'component281'),source);
 }
});
test('integration reader authenticates complete changed helper predecessors without authorizing wrong descriptors',()=>{
 for(const path of ['tests/helpers/component-ui-ci-source-inverse.mjs','tests/helpers/run-hud-ci-source.mjs']){
  const live=readFileSync(path,'utf8').replaceAll('\r\n','\n');
  const expected=releaseCalibrationReaderSource(path,live,'releaseIntegration');assert.notEqual(expected,live);
  for(const eol of ['\n','\r\n']){
   const source=live.replaceAll('\n',eol);
   assert.equal(beforeReleaseFastB9Ci(path,source),expected);
   for(const before of [{},{sha256:'0'.repeat(64)}])assert.strictEqual(beforeReleaseFastB9Ci(path,source,before),source);
   for(const foreign of [source+eol,source.slice(1),source.slice(0,-1),source.replaceAll(eol,'\r\r\n'),null,undefined,{},17])
    assert.strictEqual(beforeReleaseFastB9Ci(path,foreign),foreign);
   assert.strictEqual(releaseCalibrationReaderSource('foreign/'+path,source,'releaseIntegration'),source);
  }
 }
});
