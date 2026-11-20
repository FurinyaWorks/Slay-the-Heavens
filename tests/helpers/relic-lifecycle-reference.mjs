import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {
 lifecycleHash,relicLifecycleArchiveSha256,relicLifecycleGeneratedBindings,relicLifecycleGroups,
 relicLifecycleRevision,runRelicLifecycle,
} from './relic-lifecycle-baseline.mjs';

// The frozen VM can load only the authenticated Lua corpus and generated
// modules. Include the executable JS and every file entered with dofile too.
const replayFiles=[
 'package-lock.json',
 'scripts/build-lua-data.mjs',
 'scripts/build-native-candidate.mjs',
 'tests/helpers/lua-graph-observer.mjs',
 'tests/helpers/relic-lifecycle-baseline.mjs',
 'tests/helpers/relic-lifecycle-baseline-vm.mjs',
 'tests/helpers/relic-lifecycle-baseline-fixtures.lua',
 'tests/helpers/relic-lifecycle-baseline-support.lua',
 'tests/lua/common_relic_equipment.lua',
 'tests/lua/rare_relics_hooks.lua',
 'tests/lua/relic_query_contract.lua',
 ...relicLifecycleGroups.map(group=>`tests/lua/relic_lifecycle_${group}.lua`),
];

export function relicLifecycleReplayInput(generated,read=path=>readFileSync(path,'utf8')){
 const sourceHashes=replayFiles.map(path=>[path,lifecycleHash(read(path).replaceAll('\r\n','\n'))]);
 const generatedHashes=Object.keys(generated).sort().map(name=>{
  const {path,sha256}=generated[name];
  return [name,path,sha256];
 });
 return lifecycleHash(JSON.stringify({
  nodeMajor:process.versions.node.split('.')[0],frozenArchive:relicLifecycleArchiveSha256,sourceHashes,generatedHashes,
 }));
}

export function lifecycleGeneratedIdentities(generated=relicLifecycleGeneratedBindings()){
 return Object.fromEntries(Object.entries(generated).map(([name,{path,sha256}])=>[name,{path,sha256}]));
}

export function verifyLifecycleTrace(result,group){
 const {checkpoints,traceBytes,traceSha256,registeredCases,executedCases,coverage}=result.manifest;
 assert.equal(result.status,0,`${group}: ${result.stdout}${result.stderr}`);
 assert.match(result.stdout,new RegExp(`RELIC_LIFECYCLE_PASS ${group} checkpoints=`));
 assert(checkpoints>0,'explicit trace must contain actual full checkpoints');
 assert.equal(lifecycleHash(result.graph),traceSha256,'read-back complete graph hash');
 assert.equal(Buffer.byteLength(result.graph),traceBytes,'complete graph byte count');
 const records=result.graph.trim().split('\n');
 assert.equal(records.length,checkpoints,'complete recorded checkpoint count');
 let hasTable=false;
 for(const line of records){
  const record=JSON.parse(line);
  hasTable||=record.graph.definitions.some(definition=>definition[0]==='table');
 }
 assert(hasTable,'actual table graph definitions');
 return lifecycleHash(JSON.stringify({
  checkpoints,traceBytes,traceSha256,registeredCases,executedCases,
  coverage:Object.entries(coverage).sort(),stdout:result.stdout,
 }));
}

export function verifyFrozenLifecycle(result,generated){
 const {manifest}=result;
 assert.equal(manifest.frozenRevision,relicLifecycleRevision);
 assert.equal(manifest.frozenArchiveSha256,relicLifecycleArchiveSha256);
 assert.equal(manifest.preloadedSources,329);
 assert(manifest.loadedFrozen.includes('abyss_run'));
 assert.deepEqual(manifest.generatedBindings,generated,'identical generated source input hashes');
}

// Reproduce the reference from full frozen VMs in a built checkout. CI uses
// the real replay whenever an input changes or RELIC_LIFECYCLE_REPLAY=1 is set.
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const generated=lifecycleGeneratedIdentities(),groups={};
 for(const group of relicLifecycleGroups){
  const result=runRelicLifecycle(group,{frozen:true});
  groups[group]=verifyLifecycleTrace(result,group);
  verifyFrozenLifecycle(result,generated);
 }
 console.log(JSON.stringify({schemaVersion:1,replayInput:relicLifecycleReplayInput(generated),groups},null,2));
}
