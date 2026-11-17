import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,rmSync,symlinkSync,linkSync,existsSync,readdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {copyIntegrationCiClosure,copyIntegrationSourceClosure} from '../../../../tests/helpers/copy-integration-source-closure.mjs';
import {potionPointerCiUnionPacket as packet} from '../../../../tests/helpers/potion-pointer-ci-union.mjs';
import {sourceEpoch} from '../../../../tests/helpers/closeout-source-epoch.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex'),temp=mkdtempSync(join(tmpdir(),'union-ci-copy-'));
const fresh=n=>{const p=join(temp,n);mkdirSync(p);return p;};let checks=0;
const execute=(root,code)=>execFileSync(process.execPath,['--input-type=module','-e',code],{cwd:root,encoding:'utf8'});
try{
 const root=fresh('root');assert.equal(copyIntegrationCiClosure(root),258);checks++;
 execute(root,"const m=await import('./tests/helpers/integrated-ci-source.mjs');if(m.integratedCiProof.schemaVersion!==1)throw Error('wrong copied CI proof');await import('./tests/helpers/copy-integration-source-closure.mjs');await import('./tests/helpers/battle-pointer-ci-source.mjs');console.log('isolated CI imports PASS');");checks++;
 const next=fresh('next');assert.equal(copyIntegrationCiClosure(next,{sourceRoot:root}),258);checks++;
 execute(next,"await import('./tests/helpers/integrated-ci-source.mjs');console.log('copy from copy PASS');");checks++;
 // The copied entry point itself must work from the copied filesystem.
 const third=fresh('third');execute(root,`const {copyIntegrationCiClosure}=await import('./tests/helpers/copy-integration-source-closure.mjs');if(copyIntegrationCiClosure(${JSON.stringify(third)})!==258)throw Error('count');`);checks++;
 const specials=['copy-integration-source-closure.mjs','potion-pointer-ci-union.mjs','potion-pointer-ci-union.json.gz','potion-pointer-ci-copy-closure.json','potion-pointer-ci-before-copy.json.gz'];
 for(const name of specials){const path=join(root,'tests/helpers',name),bytes=readFileSync(path);
  for(const mode of ['missing','empty','drift']){if(mode==='missing')rmSync(path);else writeFileSync(path,mode==='empty'?Buffer.alloc(0):Buffer.concat([bytes,Buffer.from('\n')]));const target=fresh(`bad-${checks}`);assert.throws(()=>copyIntegrationCiClosure(target,{sourceRoot:root}));assert.deepEqual(readdirSync(target),[],'bad source cannot partially copy');checks++;writeFileSync(path,bytes);}
 }
 const manifest=JSON.parse(readFileSync('tests/helpers/potion-pointer-ci-copy-closure.json','utf8'));
 for(const path of Object.keys(manifest.files))assert.equal(hash(readFileSync(join(root,path))),manifest.files[path]);checks++;
 assert.throws(()=>copyIntegrationCiClosure(root,{sourceRoot:root}),/isolated CI/);checks++;
 const outside=fresh('outside');for(const kind of ['external','internal','dangling','hardlink']){
  const target=fresh(kind),path=join(target,'tests/helpers/integrated-ci-source.mjs');mkdirSync(dirname(path),{recursive:true});
  const source=join(root,'tests/helpers/integrated-ci-source.mjs'),before=readFileSync(source);
  if(kind==='hardlink')linkSync(source,path);else if(kind==='external')symlinkSync(source,path);else if(kind==='dangling')symlinkSync(join(outside,'missing'),path);else{writeFileSync(join(target,'inside'),before);symlinkSync(join(target,'inside'),path);}
  assert.throws(()=>copyIntegrationCiClosure(target,{sourceRoot:root}),/symlink|single-link/);assert.deepEqual(readFileSync(source),before,'source unchanged');assert(!existsSync(join(outside,'missing')));checks++;
 }
 const escaped=fresh('escaped');mkdirSync(join(escaped,'tests'));symlinkSync(outside,join(escaped,'tests/helpers'));assert.throws(()=>copyIntegrationCiClosure(escaped,{sourceRoot:root}),/parent is symlink/);checks++;
 const sourcePath=join(root,'tests/helpers/integrated-ci-source.mjs'),saved=readFileSync(sourcePath),escapePath=join(outside,'source');writeFileSync(escapePath,saved);rmSync(sourcePath);symlinkSync(escapePath,sourcePath);assert.throws(()=>copyIntegrationCiClosure(fresh('source-escape'),{sourceRoot:root}),/source escaped/);rmSync(sourcePath);writeFileSync(sourcePath,saved);checks++;
 // Explicit current fixtures are not supplied by the helper-only API.
 const fixturePaths=new Set([...Object.entries(sourceEpoch.proof.current).filter(([,v])=>v!==null).map(([p])=>p),...Object.keys(packet.files)]);
 let explicit=0;
 for(const path of fixturePaths){if(path.startsWith('tests/helpers/')||path.startsWith('tests/fixtures/')){assert(existsSync(join(root,path)),'helper closure missing '+path);continue;}mkdirSync(dirname(join(root,path)),{recursive:true});writeFileSync(join(root,path),readFileSync(path));explicit++;}
 execute(root,"const m=await import('./tests/helpers/potion-pointer-ci-union.mjs');m.assertPotionPointerCiUnionCurrent();console.log('isolated full fresh identity PASS');");checks++;
 execute(root,"const {readFileSync}=await import('node:fs');const {withPotionPointerCiUnionValidation}=await import('./tests/helpers/potion-pointer-ci-union.mjs');const {assertBattlePointerSparseCiCurrent,battlePointerSparseCiValidationRead}=await import('./tests/helpers/battle-pointer-sparse-ci-source.mjs');const {assertBattlePointerCiCurrent}=await import('./tests/helpers/battle-pointer-ci-source.mjs');withPotionPointerCiUnionValidation('pointer',readFileSync,read=>{assertBattlePointerSparseCiCurrent(read);assertBattlePointerCiCurrent(battlePointerSparseCiValidationRead(read));});console.log('isolated pointer validators PASS');");checks++;
 const owner=join(root,'src/lua/abyss_battle_card_gestures.lua'),bytes=readFileSync(owner);writeFileSync(owner,Buffer.concat([bytes,Buffer.from('\n')]));assert.throws(()=>execute(root,"const m=await import('./tests/helpers/potion-pointer-ci-union.mjs');m.assertPotionPointerCiUnionCurrent();"),/fresh union owner/);writeFileSync(owner,bytes);checks++;
 // CRLF sources normalize; binary gzip witnesses remain exact.
 for(const path of [...Object.keys(manifest.files),...specials.map(n=>'tests/helpers/'+n)].filter(p=>p.endsWith('.mjs'))){const p=join(root,path);writeFileSync(p,readFileSync(p,'utf8').replaceAll('\n','\r\n'));}
 assert.equal(copyIntegrationCiClosure(fresh('crlf'),{sourceRoot:root}),258);checks++;
 const product=fresh('product');copyIntegrationSourceClosure(product);assert(!existsSync(join(product,'tests/helpers/potion-pointer-ci-union.mjs')));checks++;
 console.log(JSON.stringify({status:'PASS',checks,copiedHelpers:258,manifestHelpers:254,explicitCurrentFixtureFiles:explicit,authenticatedInputs:Object.keys(packet.files).length,scope:'helper-copy and explicit offline fixtures only; pointer behavior supports explicit fixtures only; no other CI assertion suites run; no Full/device acceptance'}));
}finally{rmSync(temp,{recursive:true,force:true});}
