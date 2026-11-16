import {readFileSync,writeFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {pathToFileURL} from 'node:url'
import assert from 'node:assert/strict'
import {execFileSync} from 'node:child_process'
import {testDrawings,rowsToSlots} from '../monster-pilot-02/formation-check/native-registry-probe.mjs'
const repo=resolve(process.argv[2]);
const expectedHead='33d71575c5f186a1b54f7bf3e4f1826c145aa1d9'
assert.equal(execFileSync('git',['-C',repo,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),expectedHead)
const module=await import(pathToFileURL(resolve(repo,'scripts/monster-art.mjs')))
const {toLua}=await import(pathToFileURL(resolve(repo,'scripts/build-lua-data.mjs')))
const {prepareMonsterArt,monsterActorTemplate,monsterActorInventory}=module
const reg=JSON.parse(readFileSync(resolve(repo,'data/presentation/native-monster-art.json')))
const defaults=prepareMonsterArt(reg)
const batch=resolve(new URL('../monster-pilot-02/',import.meta.url).pathname)
const newAssets=[
 ['acid_slime_s','pilot-acid-small',resolve(batch,'acid-small/native-layout.json')],
 ['spike_slime_s','pilot-spike-small',resolve(batch,'spike-small/native44.json')],
 ['spike_slime_m','pilot-spike-medium',resolve(batch,'spike-medium/native-layout.json')]
];
const add=structuredClone(reg);testDrawings(add,newAssets,toLua)
const trial=prepareMonsterArt(add)
const inactive=Object.keys(add.additionalAssets).find(id=>!add.candidateAssets.includes(id))
assert(inactive)
const bad=structuredClone(add);bad.additionalAssets[inactive].slots[0].mask=true
assert.throws(()=>prepareMonsterArt(bad),/Unexpected native art slot field/)

function measurement(art){
 const actor=monsterActorTemplate(art)
 return {...monsterActorInventory(actor),registryLuaBytes:Buffer.byteLength(toLua(art)),templateLuaBytes:Buffer.byteLength(toLua(actor)),
  retainedPool:art.poolCapacity,selectedSlots:Object.fromEntries(Object.entries(art.assets).map(([k,v])=>[k,v.slots.length])),
  visibleFive:2*(art.assets['pilot-acid-small']?.slots.length??0)+3*(art.assets['pilot-spike-small']?.slots.length??0)};
}
function reduceForControl(input){
 const r=structuredClone(input)
 // Diagnostic, not a replacement production registry. Explicitly validates
 // the full retained source before building a trimmed input with stock APIs.
 assert(prepareMonsterArt(r).assets.acid_slime_m)
 const chosen=new Set(r.candidateAssets)
 r.additionalAssets=Object.fromEntries(Object.entries(r.additionalAssets).filter(([id])=>chosen.has(id)))
 r.bindings=Object.fromEntries(Object.entries(r.bindings).filter(([,id])=>chosen.has(id)))
 return r
}
const trimmed=prepareMonsterArt(reduceForControl(add))
const props={baseline:expectedHead,inactiveInvalidSlotRejected:true,stockDefaultDiagnostic:measurement(defaults),currentRetainedFourArtDiagnostic:measurement(trial),trimmedButLegacyRequiredAnchorDiagnostic:measurement(trimmed),
scope:'Offline stock builder. Default formal monsters=false is not this test. Neither runtime source nor release is changed. Byte values are serialized Lua, not GIL/server/official import.'}
assert.equal(trial.poolCapacity,600);
assert.equal(trimmed.poolCapacity,597);
assert.equal(trial.assets.acid_slime_m.slots.length,597)
assert.equal(props.currentRetainedFourArtDiagnostic.visibleFive,187)
const probe=process.argv[3];if(probe){
 const r=structuredClone(add)
 const raw=readFileSync(probe,'utf8');const rows=rowsToSlots(JSON.parse(raw),106)
 assert(rows.length<=41);
 // Explicit experimental substitution to compare candidate budgets. Do not
 // use these source identifiers to issue product provenance or merge.
 r.asset.slots=rows
 const retained=prepareMonsterArt(r)
 const limited=prepareMonsterArt(reduceForControl(r))
 props.maskFreeAnchorRetained=measurement(retained)
 props.maskFreeAnchorTrimmed=measurement(limited)
 assert.equal(retained.poolCapacity,600)
 assert.equal(limited.poolCapacity,41)
 assert.deepEqual(Object.keys(limited.assets).sort(),Object.keys(trial.assets).sort())
}
const json=JSON.stringify(props,null,2)+'\n'
if(process.argv[4])writeFileSync(process.argv[4],json)
process.stdout.write(json)
