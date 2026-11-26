import {beforeCombatVisualSource,combatVisualPriorRead,assertCombatVisualCurrent} from './combat-visual-source.mjs';
import {beforeCurrentReplayFixes} from './current-replay-fix-sources.mjs';
// Historical-only continuation. Production builds and test discovery use live inputs.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';

const hash=(source,algorithm='sha256')=>createHash(algorithm).update(source).digest('hex');
const blob=source=>hash(`blob ${Buffer.byteLength(source)}\0${source}`,'sha1');
const normalize=source=>source.replaceAll('\r\n','\n');
const gzip=readFileSync(new URL('./refined-release-source.json.gz',import.meta.url));
assert.equal(hash(gzip),'6b9e66890ecfeac7f0b581ece462edaf41095f6d2937896cf6032e9e8ee9a9a3','exact refined Release source archive');
const {schemaVersion,base,normalization,files,addedJs}=JSON.parse(gunzipSync(gzip));
assert.equal(schemaVersion,1);assert.equal(normalization,'LF');
assert.equal(base,'7381cf7152ba7a726506f9a5b525e13cfbd2c87a');
const paths=Object.keys(files),owners=paths.filter(path=>path.startsWith('src/lua/'));
export const refinedReleaseProductionPaths=Object.freeze(owners);
assert.deepEqual(owners,['src/lua/abyss_monster_art.lua','src/lua/abyss_monster_surfaces.lua']);
for(const [path,{before,after}]of Object.entries(files)){
 assert.equal(normalize(before.source),before.source,path);
 assert.equal(hash(before.source),before.sha256,path);
 assert.equal(blob(before.source),before.gitBlob,path);
 assert.notEqual(before.sha256,after.sha256,path);
}
for(const {sha256,gitBlob} of [...Object.values(files).map(row=>row.after),...Object.values(addedJs)]){
 assert.match(sha256,/^[a-f0-9]{64}$/);assert.match(gitBlob,/^[a-f0-9]{40}$/);
}
function matches(source,binding){
 if(!binding||typeof source!=='string'||source.includes('\r\r\n'))return false;
 const lf=normalize(source);
 return hash(lf)===binding.sha256&&blob(lf)===binding.gitBlob;
}
// Preserve #951 text readback and #975 hosted evidence in live builds.
const reviewedPackingSources=Object.freeze({
 'scripts/build-native-bgm-candidate.mjs':{
  sha256:'5f15c4e781dae30aa15322cc3c4bc65540df632caabefcc2c1f3303a9e553dbd',
  gitBlob:'c5b82cbf75ed633f56d8849c0c3e91c63026bdbe',
  edits:[
   ['  let scriptText;\n',''],
   ["    const {assertClientScriptText}=await import('./check-release-text.mjs');\n    scriptText = assertClientScriptText(readback.scripts, 'audio/candidate.gil');\n",''],
   ['liveWriteEnabled: false, compiled, checked, scriptText,','liveWriteEnabled: false, compiled, checked,'],
  ],
 },
 'scripts/platform-load.mjs':{
  sha256:'ec53aafa9736a439097645448e43ffab28f0d27344e4ee50aa7e7d0cdc97d34d',
  gitBlob:'218c467c12a5142dec040bcb14498aa056e3a017',
  edits:[
   ["import { hostedCandidatePath, verifiedPayloadInputs } from './hosted-gil-receipt.mjs';\n",''],
   ['readFileSync(hostedCandidatePath(directory, receipt))','readFileSync(receipt.candidate.path)'],
   ['payloadDigest(verifiedPayloadInputs(process.cwd(), receipt, artOptions, sourceInputs))','payloadDigest(sourceInputs(process.cwd(),artOptions))'],
  ],
 },
 'tests/native-audio-release-provenance.test.mjs':{
  sha256:'4b60b47b85569674f9ef93b9c4c9d43a3d3af75296de885a29368e8382f406ac',
  gitBlob:'5551e91cfed55622e32e6298fc164909f102f950',
  prior:{sha256:'76ad3a693920e182918eb37bc7f86066b940807e3843f447eeb1ae7d1fb47fac',gitBlob:'b2434c7f4548f1de99f90599bab3cc4b3c01486b'},
  edits:[
   ["import {deckBrowserParts} from '../scripts/deck-ui-layout.mjs';\n",''],
   ['      deckBrowser:{templateIndex:1470123470,maxFaces:10,parts:deckBrowserParts.map((part,i)=>({...part,templateIndex:1470123471+i}))},\n',''],
   ["  assert.deepEqual(result.deckBrowser,f.full.deckBrowser,'final audio receipt retains candidate-local deck browser bindings');\n  assert.deepEqual(JSON.parse(readFileSync(result.receiptPath)).deckBrowser,f.full.deckBrowser);\n",''],
  ],
 },
});
export function assertRefinedReleasePackingCurrent(read){
 for(const [path,binding] of Object.entries(reviewedPackingSources))
  assert(matches(read(path,'utf8'),binding),'fresh current packing source: '+path);
}
function beforeReviewedPackingSource(path,source){
 if(!Object.hasOwn(reviewedPackingSources,path))return source;
 const binding=reviewedPackingSources[path];
 if(!matches(source,binding))return source;
 let prior=normalize(source);
 for(const [next,previous] of binding.edits){
  assert.equal(prior.split(next).length,2,'single approved packing source edit: '+path);
  prior=prior.replace(next,previous);
 }
 if(binding.prior){
  assert(matches(prior,binding.prior),'complete approved packing fixture predecessor: '+path);
  prior=beforeCurrentReplayFixes(path,prior);
 }
 assert(matches(prior,files[path].after),'exact packing source predecessor: '+path);
 return source.includes('\r\n')?prior.replaceAll('\n','\r\n'):prior;
}
function project(path,source){
 if(!Object.hasOwn(files,path)||!matches(source,files[path].after))return source;
 const prior=files[path].before.source;
 return source.includes('\r\n')?prior.replaceAll('\n','\r\n'):prior;
}
export function beforeRefinedReleaseCiSource(path,source,read){
 return owners.includes(path)?source:project(path,beforeCombatVisualSource(path,beforeReviewedPackingSource(path,source),read));
}
export function beforeRefinedReleaseProduction(path,source){
 source=beforeCombatVisualSource(path,source);
 return owners.includes(path)?project(path,source):source;
}
export function authorizeRefinedReleaseProduction(samples,read){
 if(!samples.some(([path,source])=>owners.includes(path)&&matches(source,files[path].after)))return;
 for(const [path,source]of samples){
  if(owners.includes(path))assert(matches(source,files[path].after),'mixed linked refined Release source: '+path);
 }
 for(const path of owners){
  let source;try{source=read(path);}catch(error){assert.fail('combined linked owner missing: '+path+': '+String(error?.message??error));}
  assert(matches(source,files[path].after),'combined linked owner identity: '+path+' changed during refined Release source validation');
 }
}
export function assertRefinedReleaseSourcesCurrent(read=readFileSync){
 for(const path of paths){
  const source=beforeReviewedPackingSource(path,read(path,'utf8'));
  assertCombatVisualCurrent(path,source,owner=>read(owner,'utf8'));
  assert(matches(beforeCombatVisualSource(path,source,owner=>read(owner,'utf8')),files[path].after),'fresh complete integration source: refined Release '+path);
 }
}
export function refinedReleaseHistoricalInput(path,read){
 read=combatVisualPriorRead(read);
 if(!Object.hasOwn(files,path)||owners.includes(path))return undefined;
 const source=beforeReviewedPackingSource(path,read(path,'utf8'));
 assert(matches(source,files[path].after),'fresh refined Release historical input: '+path);
 return project(path,source);
}
// Approved live tests keep their full newer assertions. Historical discovery
// may remove these paths only when the entire file has a known identity.
const addedJsSuccessors=Object.freeze({
 'tests/refined-monster-tiers.test.mjs':{
  sha256:'431434c82dc1d6a89c04ac9bb205290a48052cf90c7988517cd2bf931756614e',
  gitBlob:'5878a55bb1dd129cc4ca9256d09514a621f75671',
 },
 'tests/refined-release-monsters.test.mjs':{
  sha256:'3f684bd3ff2c78daef7cdb9a5085e1099a70e8798cf913ab755749fe659c5b5d',
  gitBlob:'13ebb939afc3338c7381873fbea444625b4800c4',
 },
});
export function beforeRefinedReleaseJsInventory(paths,preceding,read,required=false){
 const added=Object.keys(addedJs);
 if(!required&&!added.some(path=>paths.includes(path)))return paths;
 assert.deepEqual([...paths].sort(),[...preceding,...added].sort(),'complete current raw discovery inventory');
 for(const path of added){
  const source=read(path,'utf8');
  const successor=Object.hasOwn(addedJsSuccessors,path)?addedJsSuccessors[path]:null;
  const expected=required&&successor?successor:addedJs[path];
  assert(matches(source,expected)||!required&&matches(source,successor),'fresh added inventory source: '+path);
 }
 return paths.filter(path=>!Object.hasOwn(addedJs,path));
}
