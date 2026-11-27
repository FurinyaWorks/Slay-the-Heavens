import assert from 'node:assert/strict';
import {restoreExactFixtureHunks} from './exact-fixture-hunks.mjs';
import {exactSourceMatches} from './source-fingerprint.mjs';
import {beforeReleaseMetadata} from './release-metadata-source.mjs';
import {beforeReleaseDeckPointer} from './release-deck-pointer-source.mjs';

export const selectionRawEntranceReplay=Object.freeze({
 "current": {
  "sha256": "8e559a827f7b38a40082b5788c46d368497edfbd29dbcbfdc75aa5ba35f2fc35",
  "gitBlob": "9ac20430030fdf2966f8de291c2f01213028f98d"
 },
 "previous": {
  "sha256": "5cd7ad3d5a728418bb89cb8dbf0d4fea7fa199fb005b399b71772e63e0ec2851",
  "gitBlob": "2128fceb1bff074e04d02f911264194e2415037f"
 },
 "hunks": [
  {
   "at": 13,
   "before": "import {checkedSelectionEntranceRead,selectionNodeNoticePath} from './ui-selection-current-source.mjs';\nimport {stsStylePriorRuntime} from './sts-style-prior-runtime.mjs';",
   "after": "import {checkedSelectionEntranceRead,selectionNodeNoticePath} from './ui-selection-current-source.mjs';\nimport {releaseEntranceOwns} from './release-entrance-owner-source.mjs';\nimport {stsStylePriorRuntime} from './sts-style-prior-runtime.mjs';"
  },
  {
   "at": 32,
   "before": "  const source=Buffer.isBuffer(raw)?raw.toString('utf8'):raw;\n  if(productionReadingBackflowOwns(path)||path===selectionNodeNoticePath||beforeOfficialCharacterBackflow(path,source)!==source)return raw;\n  return beforeMasterBackflowSource(path,raw);",
   "after": "  const source=Buffer.isBuffer(raw)?raw.toString('utf8'):raw;\n  // The Selection reader authenticates the entire release entrance cohort from raw checkout bytes.\n  if(releaseEntranceOwns(path)||productionReadingBackflowOwns(path)||path===selectionNodeNoticePath||beforeOfficialCharacterBackflow(path,source)!==source)return raw;\n  return beforeMasterBackflowSource(path,raw);"
  },
  {
   "at": 124,
   "before": "  assert.equal(hash(readFileSync(target)),original.sha256,'unaltered complete historical assertions');\n  if(useArchivedOfficialInputs){",
   "after": "  assert.equal(hash(readFileSync(target)),original.sha256,'unaltered complete historical assertions');\n  if(script==='tests/sts-character-reference.test.mjs'){\n   // The reviewed fixture counts virtual frames, so use a fixed clock for its\n   // readiness scenario. The original assertions and frame limit still run.\n   const vm=join(directory,'tests/helpers/portrait-runtime-vm.mjs');\n   const source=norm(readFileSync(vm,'utf8'));\n   assert.equal(hash(source),'f1b3d4c5168a77c95300ac09b327399563ddd03d1c24e118ecb4d00e3828988f','exact archived portrait VM');\n   const hook='  if(before)run(before);';\n   const clock=\"  if(code.includes(\\\"'hidden selection held battle readiness'\\\"))run('local elapsed=0;os.clock=function()elapsed=elapsed+.001;return elapsed end');\";\n   assert.equal(source.split(hook).length,2,'one archived portrait VM setup hook');\n   writeFileSync(vm,source.replace(hook,hook+'\\n'+clock));\n  }\n  if(useArchivedOfficialInputs){"
  }
 ]
});

// Current Host checks exercise production. Historical Host and CI replays
// preserve the exact earlier test sources from the production backflow.
const fixtures=Object.freeze({
 "tests/integration-source-epoch.test.mjs": {
  "current": {
   "sha256": "c01c05a38b05b9a405f009da808c1af295f48bf3653d70fbeb8346ec1d8feaf2",
   "gitBlob": "95629736179479ea8c9319150c6beafc95360037"
  },
  "previous": {
   "sha256": "fd0cb659920b58cb0354c37acba7344028847c06211bb0339cc0deb38bbc2a8b",
   "gitBlob": "8ec5fab8e038c2b0a3e1201a353283a28f02293f"
  },
  "hunks": [
   {
    "at": 22,
    "before": "import {readHistoricalReleaseCheckpoint} from './helpers/release-historical-source-checkpoints.mjs';\nimport {beforeCurrentSelectionProductionSource,readReviewedSelectionSource,readSelectionProductionOwners} from './helpers/replay-reviewed-selection.mjs';\nimport {reviewedSelectionRead,reviewedStsStyleInventory} from './helpers/reviewed-selection-current-source.mjs';\nimport {beforeShopPurchaseOwner,shopPurchaseOwner} from './helpers/shop-deck-purchase-source.mjs';\nimport {readBeforeMasterBackflowSource} from './helpers/master-backflow-source.mjs';\nconst sandbox=process.cwd();\nconst {sourceEpoch}=await import('./helpers/combined-epoch/source-epoch.mjs');\nconst proof=sourceEpoch.proof,raw=p=>proof.current[p]?.source??null;",
    "after": "import {readHistoricalReleaseCheckpoint} from './helpers/release-historical-source-checkpoints.mjs';\nimport {beforeCurrentSelectionProductionSource,readReviewedSelectionSource,readSelectionProductionOwners} from './helpers/replay-reviewed-selection.mjs';\nimport {reviewedSelectionRead,reviewedStsStyleInventory} from './helpers/reviewed-selection-current-source.mjs';\nimport {shopPurchaseOwner} from './helpers/shop-deck-purchase-source.mjs';\nimport {productionReadingBackflowOwns,readBeforeMasterBackflowSource} from './helpers/master-backflow-source.mjs';\nconst sandbox=process.cwd();\nconst {sourceEpoch}=await import('./helpers/combined-epoch/source-epoch.mjs');\nconst proof=sourceEpoch.proof,raw=p=>proof.current[p]?.source??null;"
   },
   {
    "at": 31,
    "before": "const shopDeckPaths=['src/lua/abyss_deck_ui.lua','src/lua/abyss_merchant.lua','src/lua/abyss_game_ui_input.lua','src/lua/abyss_node_ui_feedback.lua','src/lua/abyss_potion_discard_ui.lua'];\nfunction readShopDeckFixture(path){\n if(path!==shopPurchaseOwner)return Object.hasOwn(proof.current,path)?readReviewedSelectionSource(path):readFileSync(path,'utf8');\n const read=(owner,encoding='utf8')=>beforeShopPurchaseOwner(owner,readFileSync(owner,encoding));\n const reviewed=reviewedSelectionRead(read);\n const source=beforeCurrentSelectionProductionSource(path,readSelectionProductionOwners(read,reviewed),reviewed);\n assert.equal(digest(source.replaceAll('\\r\\n','\\n')),proof.current[path].sha256,'exact historical purchase owner');",
    "after": "const shopDeckPaths=['src/lua/abyss_deck_ui.lua','src/lua/abyss_merchant.lua','src/lua/abyss_game_ui_input.lua','src/lua/abyss_node_ui_feedback.lua','src/lua/abyss_potion_discard_ui.lua'];\nfunction readShopDeckFixture(path){\n if(path!==shopPurchaseOwner)return Object.hasOwn(proof.current,path)?readReviewedSelectionSource(path):readFileSync(path,'utf8');\n const read=(owner,encoding='utf8')=>readFileSync(owner,encoding);\n const reviewed=reviewedSelectionRead(read);\n const source=beforeCurrentSelectionProductionSource(path,readSelectionProductionOwners(read,reviewed),reviewed);\n assert.equal(digest(source.replaceAll('\\r\\n','\\n')),proof.current[path].sha256,'exact historical purchase owner');"
   },
   {
    "at": 52,
    "before": "\nfunction integrationProductionReaders(read=readFileSync){\n const readOwner=reviewedSelectionRead(read);\n const readSelection=readSelectionProductionOwners(read,readOwner);\n const current=path=>beforeShopPurchaseOwner(path,readSelection(path));\n // The earlier entrance receipt checks its original linked owners after the\n // audited chapter and periphery projections have authenticated their inputs.\n const entrance=path=>beforeBattlePeriphery(path,beforeChapterBattleScene(path,current(path)));\n return {current,entrance,readOwner};\n}\n",
    "after": "\nfunction integrationProductionReaders(read=readFileSync){\n const readOwner=reviewedSelectionRead(read);\n const current=readSelectionProductionOwners(read,readOwner);\n // The earlier entrance receipt checks its original linked owners after the\n // audited chapter and periphery projections have authenticated their inputs.\n const entrance=path=>productionReadingBackflowOwns(path)||['src/lua/abyss_battle_card_layout.lua','src/lua/abyss_viewport.lua'].includes(path)\n  ?readOwner(path):beforeBattlePeriphery(path,beforeChapterBattleScene(path,current(path)));\n return {current,entrance,readOwner};\n}\n"
   },
   {
    "at": 317,
    "before": " const incomplete=live.filter(path=>!addedEntranceModules.includes(path));\n assert.throws(()=>entranceInventory(incomplete,read),/complete entrance module inventory/);\n assert.throws(()=>entranceInventory([...live,addedEntranceModules[0]],read),/complete entrance module inventory/);\n assert.throws(()=>assertActorFocusInventory(incomplete.filter(path=>path!==config),read),/complete entrance module inventory/);\n const project=input=>entrancePredecessor(config,source,input).source;\n assert.equal(project(read),prior);\n for(const changedPath of changed){",
    "after": " const incomplete=live.filter(path=>!addedEntranceModules.includes(path));\n assert.throws(()=>entranceInventory(incomplete,read),/complete entrance module inventory/);\n assert.throws(()=>entranceInventory([...live,addedEntranceModules[0]],read),/complete entrance module inventory/);\n assert.throws(()=>assertActorFocusInventory(incomplete.filter(path=>path!==config)),/complete entrance module inventory/);\n const project=input=>entrancePredecessor(config,source,input).source;\n assert.equal(project(read),prior);\n for(const changedPath of changed){"
   },
   {
    "at": 355,
    "before": "});\ntest('current PC13 facade rejects every exact immediate predecessor before older views or reads',()=>{\n const disk=path=>readFileSync(path,'utf8');\n const live=readSelectionProductionOwners(disk,reviewedSelectionRead(disk));\n const read=beforeInputRetirementReader(readBeforeMasterBackflowSource(disk));\n const readMapPrior=owner=>beforeSts1MapSource(owner,beforeRebasedCi(owner,read(owner)));\n const readPc13Prior=owner=>pc13RewardCoverSourcePaths.includes(owner)",
    "after": "});\ntest('current PC13 facade rejects every exact immediate predecessor before older views or reads',()=>{\n const disk=path=>readFileSync(path,'utf8');\n const reviewed=reviewedSelectionRead(disk);\n const live=readSelectionProductionOwners(disk,reviewed);\n const read=beforeInputRetirementReader(readBeforeMasterBackflowSource(disk));\n const readMapPrior=owner=>beforeSts1MapSource(owner,beforeRebasedCi(owner,read(owner)));\n const readPc13Prior=owner=>pc13RewardCoverSourcePaths.includes(owner)"
   },
   {
    "at": 382,
    "before": "   /combined linked owner identity/,path);\n }\n const unrelated='src/lua/abyss_battle_ui.lua';\n assert.equal(beforeCurrentProductionSource(unrelated,live(unrelated),live).replaceAll('\\r\\n','\\n'),raw(unrelated));\n});\nconst cases=[\n ['m7-core-final','preM7FinalSource','develop','abyss_original_v4'],",
    "after": "   /combined linked owner identity/,path);\n }\n const unrelated='src/lua/abyss_battle_ui.lua';\n assert.equal(beforeCurrentSelectionProductionSource(unrelated,live,reviewed).replaceAll('\\r\\n','\\n'),raw(unrelated));\n});\nconst cases=[\n ['m7-core-final','preM7FinalSource','develop','abyss_original_v4'],"
   }
  ]
 },
 "tests/defect-utility-planning.test.mjs": {
  "current": {
   "sha256": "14f647fae87f83b72919ce2e77f70503b6726e656b7283af75092dde5ba55be4",
   "gitBlob": "e20a63120443b83a177bbd75a2809cdd4ece2b09"
  },
  "previous": {
   "sha256": "d7b64a1189fce508eab45275d33dbbf442a46f085d0c2c3fe10c6c2caccab6ab",
   "gitBlob": "ba92ddb97178c4ccf977c5148db23d69f06b4485"
  },
  "hunks": [
   {
    "at": 0,
    "before": "import {pointerInputPath,readRetiredController,retiredControllerPath} from './helpers/input-retirement-source.mjs';\nimport {currentProductionRereads} from './helpers/current-production-source-reads.mjs';\nimport {preDefectActorSource,defectActorEpoch} from './helpers/defect-actor-source-epoch.mjs';",
    "after": "import {pointerInputPath,readRetiredController,retiredControllerPath} from './helpers/input-retirement-source.mjs';\nimport {currentProductionRereads,releaseArchitectureReadTrace} from './helpers/current-production-source-reads.mjs';\nimport {preDefectActorSource,defectActorEpoch} from './helpers/defect-actor-source-epoch.mjs';"
   },
   {
    "at": 41,
    "before": " const admittedReads=[...reads];\n const entranceBytes=readFileSync('tests/fixtures/ui-entrance-source.json.gz');",
    "after": " const admittedReads=[...reads];\n assert.equal(admittedReads[0],config,'outer Actor reads its input before admission');\n const releaseReads=admittedReads.slice(1);\n assert.equal(releaseReads.length,releaseArchitectureReadTrace.count);\n assert.equal(createHash('sha256').update(JSON.stringify(releaseReads)).digest('hex'),\n  releaseArchitectureReadTrace.sha256,'exact current Actor admission order');\n // These indexed rereads were added to the shared release architecture closure.\n const releaseRereads=new Set([4,5,10,11,17,19,20,21,22,23,31,32,116,222,223,224,368,369,370]);\n const priorReads=admittedReads.filter((_path,position)=>!releaseRereads.has(position));\n const entranceBytes=readFileSync('tests/fixtures/ui-entrance-source.json.gz');"
   },
   {
    "at": 54,
    "before": " assert.equal(entranceOwners.length,20);\n assert.deepEqual(admittedReads.slice(1,21),entranceOwners,'complete fresh entrance owner admission');\n const additionalProductionReads=new Map([",
    "after": " assert.equal(entranceOwners.length,20);\n assert.deepEqual(priorReads.slice(1,21),entranceOwners,'complete fresh entrance owner admission');\n const additionalProductionReads=new Map(["
   },
   {
    "at": 63,
    "before": " ]);\n for(const [position,path] of additionalProductionReads)assert.equal(admittedReads[position],path,'exact production reread');\n const originalReads=admittedReads.filter((_path,position)=>!additionalProductionReads.has(position));\n assert.equal(admittedReads.length,487);\n assert.equal(createHash('sha256').update(JSON.stringify(admittedReads)).digest('hex'),\n  '639281271a32cb71112b038ccd040873109bb6f24ac51f79597445e706ff4abb','complete production Actor admission order');",
    "after": " ]);\n for(const [position,path] of additionalProductionReads)assert.equal(priorReads[position],path,'exact production reread');\n const originalReads=priorReads.filter((_path,position)=>!additionalProductionReads.has(position));\n assert.equal(priorReads.length,487);\n assert.equal(createHash('sha256').update(JSON.stringify(priorReads)).digest('hex'),\n  '639281271a32cb71112b038ccd040873109bb6f24ac51f79597445e706ff4abb','complete production Actor admission order');"
   }
  ]
 },
 "tests/competition-roster-config-composition.test.mjs": {
  "current": {
   "sha256": "2d56bc47a7ce372633f6b46c91cb42f01b0ef099236ec2f28e30bf1c8da60c06",
   "gitBlob": "0b526cd747cb341d2d7b6321fc2a8796b34b1ea3"
  },
  "previous": {
   "sha256": "283322cb20de02801a59baef9e44452592c70692eb6a4b71640ac476abeaa4db",
   "gitBlob": "8c4d42dd8eec34a62b940d321ef8cdcf5f9f6b7b"
  },
  "hunks": [
   {
    "at": 0,
    "before": "import {currentProductionRereads} from './helpers/current-production-source-reads.mjs';\nimport {beforeInputRetirementReader,retiredControllerPath} from './helpers/input-retirement-source.mjs';",
    "after": "import {currentProductionRereads,releaseArchitectureReadTrace} from './helpers/current-production-source-reads.mjs';\nimport {beforeReleaseClosureFixture} from './helpers/release-closure-fixture-source.mjs';\nimport {beforeInputRetirementReader,retiredControllerPath} from './helpers/input-retirement-source.mjs';"
   },
   {
    "at": 34,
    "before": "  const raw=binding.existing?readInput(path):Buffer.from(binding.source);\n  const source=path.endsWith('.gz')?raw:Buffer.from(raw.toString('utf8').replaceAll('\\r\\n','\\n'));\n  assert.equal(hash(source),binding.sha256,'original complete Roster chain bytes: '+path);",
    "after": "  const raw=binding.existing?readInput(path):Buffer.from(binding.source);\n  const continued=path==='tests/helpers/approved-ui-inverse.mjs'||path==='tests/support/formal-entry-source-inverse.mjs';\n  const original=binding.existing&&continued?beforeReleaseClosureFixture(path,raw):raw;\n  const source=path.endsWith('.gz')?original:Buffer.from(original.toString('utf8').replaceAll('\\r\\n','\\n'));\n  assert.equal(hash(source),binding.sha256,'original complete Roster chain bytes: '+path);"
   },
   {
    "at": 210,
    "before": " const admittedReads=[...reads];\n assert.equal(admittedReads.length,480,'complete raw owner admission');\n assert.equal(hash(JSON.stringify(admittedReads)),'ad1c81a8f757224fa6520ca74d2a9b682f24925d2689141bc4b2eb1066d6a7fd','complete raw owner admission in order');\n let position=-1;",
    "after": " const admittedReads=[...reads];\n assert.equal(admittedReads.length,releaseArchitectureReadTrace.count,'complete release raw owner admission');\n assert.equal(hash(JSON.stringify(admittedReads)),releaseArchitectureReadTrace.sha256,'complete release raw owner admission in order');\n const addedRereads=new Set([3,4,9,10,16,18,19,20,21,22,30,31,90,115,155,156,221,222,223,317,367,368,369,415,479]);\n const originalReads=admittedReads.filter((_owner,position)=>!addedRereads.has(position));\n assert.equal(originalReads.length,480,'complete original raw owner admission');\n assert.equal(hash(JSON.stringify(originalReads)),'ad1c81a8f757224fa6520ca74d2a9b682f24925d2689141bc4b2eb1066d6a7fd',\n  'complete original raw owner admission in order');\n let position=-1;"
   }
  ]
 },
 "tests/support/formal-entry-source-inverse.mjs": {
  "current": {
   "sha256": "951deb2fc8dc598cad29a47601e15782c3468ae5bb7a68dab2ef8c07de084425",
   "gitBlob": "13093e19470d5b524122f6727e252eeb00ac5ee7"
  },
  "previous": {
   "sha256": "ffab54c9d7b2cf877ef759c8894027ac0e6fd71d8e0d236a166d1bdb5b89ebb1",
   "gitBlob": "20a2f75ec4365fab7e239dfb241ebe91954cf402"
  },
  "hunks": [
   {
    "at": 0,
    "before": "import {preCurrentSource} from '../helpers/task77-current-source-layers.mjs';\nimport assert from 'node:assert/strict';",
    "after": "import {preCurrentSource} from '../helpers/task77-current-source-layers.mjs';\nimport {readCloseoutLuaVocabularyReceipt} from '../helpers/closeout-lua-vocabulary-source.mjs';\nimport assert from 'node:assert/strict';"
   },
   {
    "at": 13,
    "before": "export function preFormalEntrySource(path, source) {\n  const text = preCurrentSource(path,source);\n  let binding = formalEntryInverses[path];\n  // Compose the same immutable launch hunks with the two reviewed relic glyphs.",
    "after": "export function preFormalEntrySource(path, source) {\n  let text = preCurrentSource(path,source);\n  let binding = formalEntryInverses[path];\n  // The sealed elite fixture still uses the pre-#951 encounter name.\n  // Authenticate the current file before restoring that exact Git input.\n  if(path==='tests/lua/elite_relic_reward_ui.lua' && ![binding.beforeSha256,binding.afterSha256].includes(hash(text)))\n    text=readCloseoutLuaVocabularyReceipt(path,binding.afterSha256,()=>source)??text;\n  // Compose the same immutable launch hunks with the two reviewed relic glyphs."
   }
  ]
 },
 "tests/seven-refactor-source-epoch.test.mjs": {
  "current": {
   "sha256": "fec46a900fac83aa67ce2975bb4f93dd3a633f0ed30c5251e7bcc27705386803",
   "gitBlob": "5c6e73f8335fd05a346e0b615d96bee81e47bfc1"
  },
  "previous": {
   "sha256": "62d1daad52fd3ba42896b65b200b42edfbc90d24d25d87940d7815cfaabe5a1f",
   "gitBlob": "4c932fa42d6b9b0f4c85167fe3fe5bfd29007d65"
  },
  "hunks": [
   {
    "at": 427,
    "before": "  assert.equal(run(source),'{}\\n');assert.equal(reads,2);\n  // Entrance admission parses every input afresh; only the pure layout matcher memoizes.\n  assert.equal(parses,2,'two exact input calls each retain the fresh entrance syntax gate');\n  const layout='{ \"cacheFreshness\" : 1 }\\n';\n  const beforeLayout=parses;\n  assert.equal(run(layout),'{}\\n');assert.equal(parses-beforeLayout,2,'fresh entrance plus first pure layout calculation');assert.equal(reads,3);\n  const beforeWarmLayout=parses;\n  assert.equal(run(layout),'{}\\n');assert.equal(parses-beforeWarmLayout,1,'warm calculation still runs fresh entrance admission');assert.equal(reads,4);\n  actual=source.replace('1','2');assert.throws(()=>run(layout),/linked owner identity/);assert.equal(reads,5);",
    "after": "  assert.equal(run(source),'{}\\n');assert.equal(reads,2);\n  // Exact bytes need no layout parse. A new layout is syntax-checked before\n  // its pure token comparison is cached, while every admitted call reads owners.\n  assert.equal(parses,0,'exact input uses its verified byte identity');\n  const layout='{ \"cacheFreshness\" : 1 }\\n';\n  const beforeLayout=parses;\n  assert.equal(run(layout),'{}\\n');assert.equal(parses-beforeLayout,1,'first layout calculation verifies syntax');assert.equal(reads,3);\n  const beforeWarmLayout=parses;\n  assert.equal(run(layout),'{}\\n');assert.equal(parses-beforeWarmLayout,0,'warm layout skips only pure syntax and token calculations');assert.equal(reads,4);\n  actual=source.replace('1','2');assert.throws(()=>run(layout),/linked owner identity/);assert.equal(reads,5);"
   },
   {
    "at": 440,
    "before": "  const foreign=layout.replace('1','2'),beforeForeign=parses;assert.equal(run(foreign),foreign);assert.equal(reads,7);\n  assert.equal(parses-beforeForeign,2,'foreign input runs entrance syntax and its first pure calculation');\n  const beforeWarmForeign=parses;\n  assert.equal(run(foreign),foreign);assert.equal(reads,7);assert.equal(parses-beforeWarmForeign,1,'foreign warm calculation is cached without caching admission');\n }finally{crypto.createHash=originalHash;JSON.parse=originalParse;syncBuiltinESMExports();}",
    "after": "  const foreign=layout.replace('1','2'),beforeForeign=parses;assert.equal(run(foreign),foreign);assert.equal(reads,7);\n  assert.equal(parses-beforeForeign,1,'foreign layout is parsed before its first token comparison');\n  const beforeWarmForeign=parses;\n  assert.equal(run(foreign),foreign);assert.equal(reads,7);assert.equal(parses-beforeWarmForeign,0,'foreign pure calculation is reused while its result stays rejected');\n }finally{crypto.createHash=originalHash;JSON.parse=originalParse;syncBuiltinESMExports();}"
   }
  ]
 },
 "tests/helpers/defect-actor-vm.mjs": {
  "current": {
   "sha256": "1ee4632b34f37909c22431a10faeacedf36f67969081dffe051e8f7cfffcc94e",
   "gitBlob": "431b87417402ad5f1d01dbda2d78b4f7dbac2b49"
  },
  "previous": {
   "sha256": "79a7794c38e508a0f5318cdfd55dc36980e038f2601ea92989b85a75618a6226",
   "gitBlob": "e1584962006501dba0fd87173e757382f8299642"
  },
  "hunks": [
   {
    "at": 5,
    "before": "import {luaString} from '../../scripts/build-lua-data.mjs';\nconst require=createRequire(import.meta.url);",
    "after": "import {luaString} from '../../scripts/build-lua-data.mjs';\nimport {beforeCurrentProductionSource} from './character-preparation-source.mjs';\nimport {beforePreflightSource} from './fork-preflight-source.mjs';\nimport {beforeInputRetirementReader,retiredControllerPath} from './input-retirement-source.mjs';\nimport {reviewedRenamedStsStyleRead,reviewedStsStyleRead} from './reviewed-selection-current-source.mjs';\n\nconst preStyleRawOwners=new Set(['config/architecture.json',...[\n 'actor','battle_enemy_view','card_display','character_select_view','choice_ui','game_ui_lifecycle','game_ui_navigation',\n 'game_ui_overlays','game_ui_run','node_ui','node_ui_faces','node_ui_feedback','node_ui_input','node_ui_lifecycle',\n 'node_ui_shop','page_reveal','shop_ui','traveler_portraits','ui',\n].map(name=>'src/lua/abyss_'+name+'.lua')]);\nconst guideInputs=new Set(['game_ui','game_ui_input','game_ui_view'].map(name=>'src/lua/abyss_'+name+'.lua'));\nconst guideOwners=new Set(['game_ui_navigation','game_ui_navigation_view','game_ui_overlays'].map(name=>'src/lua/abyss_'+name+'.lua'));\nconst reviewedReaders=new Set(['battle_intent_view','character_profiles'].map(name=>'src/lua/abyss_'+name+'.lua'));\n// Retain the pre-style bytes via the owning Release receipts. The entrance and\n// Guide checks still get the precise raw or restored view each one authenticates.\nexport function actorFocusPreStyleReader(readLive){\n const readRenamed=reviewedRenamedStsStyleRead(readLive);\n const readReviewed=reviewedStsStyleRead(readLive);\n const readRetired=beforeInputRetirementReader(readReviewed);\n return (path,expected)=>{\n  const reviewed=path===retiredControllerPath?readRetired(path):readReviewed(path);\n  if(reviewed===expected)return reviewed;\n  if(path==='src/lua/abyss_game_ui_navigation_view.lua'){\n   return beforePreflightSource(path,readLive(path),'prior',readLive).replaceAll('\\r\\n','\\n');\n  }\n  if(guideInputs.has(path)){\n   const readGuide=owner=>guideOwners.has(owner)?readReviewed(owner):readRenamed(owner);\n   return beforeCurrentProductionSource(path,readLive(path),readGuide).replaceAll('\\r\\n','\\n');\n  }\n  if(preStyleRawOwners.has(path))return beforeCurrentProductionSource(path,readLive(path),readRenamed).replaceAll('\\r\\n','\\n');\n  const readOwner=reviewedReaders.has(path)?readReviewed:owner=>owner===path?readReviewed(owner):readRenamed(owner);\n  return beforeCurrentProductionSource(path,reviewed,readOwner).replaceAll('\\r\\n','\\n');\n };\n}\n\nconst require=createRequire(import.meta.url);"
   }
  ]
 },
 "tests/helpers/joint-ui-ci-source-inverse.mjs": {
  "current": {
   "sha256": "f4fe1b28a6bb40d00ab80159bd2ac42ce31ff96f61649bf0f442796125ad37f7",
   "gitBlob": "70bde1f89dae6f812c9336aee03d6eabf1bff947"
  },
  "previous": {
   "sha256": "e181a8f4a343c5ea6b2b8fdd3d7b039624b506aadfefcf9b6975ba770b3b53c3",
   "gitBlob": "be55b3fd5e197c805e2575486b21213000144ea7"
  },
  "hunks": [
   {
    "at": 8,
    "before": "import {preNoncombatCiSource,noncombatPriorInventory} from './noncombat-ci-source-inverse.mjs';\nimport assert from 'node:assert/strict';",
    "after": "import {preNoncombatCiSource,noncombatPriorInventory} from './noncombat-ci-source-inverse.mjs';\nimport {formationFloorReceiptSource} from './encounter-formation-ci-source-inverse.mjs';\nimport assert from 'node:assert/strict';"
   },
   {
    "at": 75,
    "before": "export function jointCiMatches(path,source,target){\n source=preCloseoutCiSource(path,source,'pr620');",
    "after": "export function jointCiMatches(path,source,target){\n if(target==='formationReceipt'&&formationFloorReceiptSource(path,source)!==null)return true;\n source=preCloseoutCiSource(path,source,'pr620');"
   },
   {
    "at": 87,
    "before": "export function jointCiSourceAt(path,source,target){\n const original=source;",
    "after": "export function jointCiSourceAt(path,source,target){\n const formation=target==='formationReceipt'?formationFloorReceiptSource(path,source):null;\n if(formation!==null)return formation;\n const original=source;"
   }
  ]
 },
 "tests/forethought-selection.test.mjs": {
  "current": {
   "sha256": "5483a9c9cc1dbdbc17809103821564f7838d1c63e431f953c29548a3b2d5fb42",
   "gitBlob": "9db7e17c76f3d4eb0d8d605657a2948d98429c2c"
  },
  "previous": {
   "sha256": "efe0d72d48c9c281f9af7f77fe432cdb2c6cb0edca8ee508f0897ea447a7ffab",
   "gitBlob": "4bb817f80d9bd2b81305cae20590b4130085a51b"
  },
  "hunks": [
   {
    "at": 42,
    "before": "  const read = path => readFileSync(path, 'utf8');\n  const hash = value => createHash('sha256').update(value).digest('hex');\n  const priorLua = beforeMapDeckSource(lua, read(lua), read);",
    "after": "  const read = path => readFileSync(path, 'utf8');\n  const lf = value => value.replaceAll('\\r\\n', '\\n');\n  const hash = value => createHash('sha256').update(lf(value)).digest('hex');\n  const priorLua = beforeMapDeckSource(lua, read(lua), read);"
   },
   {
    "at": 48,
    "before": "  assert.equal(hash(priorLayout), 'f43c5472a1afacf23e8b2a908fa7eb5082e561314c90abbb65d7ccd7ca799d85');\n  const crlf = source => source.replaceAll('\\n', '\\r\\n');\n  assert.equal(beforeMapDeckSource(lua, crlf(read(lua)), path => crlf(read(path))), crlf(priorLua));",
    "after": "  assert.equal(hash(priorLayout), 'f43c5472a1afacf23e8b2a908fa7eb5082e561314c90abbb65d7ccd7ca799d85');\n  const crlf = source => lf(source).replaceAll('\\n', '\\r\\n');\n  assert.equal(beforeMapDeckSource(lua, crlf(read(lua)), path => crlf(read(path))), crlf(priorLua));"
   }
  ]
 },
 "tests/defect-actor-boundary.test.mjs": {
  "current": {
   "sha256": "a73f32bd0a1702a2c4b6461433b173d0f4ac3cb382d1f55807ae480dd64fe3d7",
   "gitBlob": "fe9e70589091324fd406113a57feb18eb684c3c8"
  },
  "previous": {
   "sha256": "8c6018ed92a5783613bdf73c6b73cb48c77bb6b22d7d28debef82ca3a1c5dbc8",
   "gitBlob": "2e931db893975ea9b8d13cc6eaf3a39213a9ff77"
  },
  "hunks": [
   {
    "at": 4,
    "before": "import {createRequire} from 'node:module';\nimport {baseline,defectVm} from './helpers/defect-actor-vm.mjs';\nimport {analyzeSources} from '../scripts/check-architecture.mjs';",
    "after": "import {createRequire} from 'node:module';\nimport {actorFocusPreStyleReader,baseline,defectVm} from './helpers/defect-actor-vm.mjs';\nimport {analyzeSources} from '../scripts/check-architecture.mjs';"
   },
   {
    "at": 10,
    "before": "import {sourceEpoch,ciRepairSourceEpoch} from './helpers/closeout-source-epoch.mjs';\nimport {beforeCurrentProductionSource} from './helpers/character-preparation-source.mjs';\nimport {entranceInventory} from './helpers/ui-entrance-source.mjs';\nimport {actorFocusAdded,assertActorFocusInventory,deckPagesAdded,stasisUpgradeAddedPaths} from './helpers/develop-release-backflow-source.mjs';\nimport {beforeCombatEvents,beforeInputRetirementReader,pointerInputPath,retiredControllerPath} from './helpers/input-retirement-source.mjs';\nconst require=createRequire(import.meta.url),luaparse=require('luaparse');",
    "after": "import {sourceEpoch,ciRepairSourceEpoch} from './helpers/closeout-source-epoch.mjs';\nimport {entranceInventory} from './helpers/ui-entrance-source.mjs';\nimport {reviewedRenamedStsStyleRead,reviewedStsStyleInventory} from './helpers/reviewed-selection-current-source.mjs';\nimport {actorFocusAdded,assertActorFocusInventory,deckPagesAdded,stasisUpgradeAddedPaths} from './helpers/develop-release-backflow-source.mjs';\nimport {beforeCombatEvents,pointerInputPath,retiredControllerPath} from './helpers/input-retirement-source.mjs';\nconst require=createRequire(import.meta.url),luaparse=require('luaparse');"
   },
   {
    "at": 25,
    "before": " const readLive=path=>Object.hasOwn(live,path)?live[path]:read(path);\n const expected=[...Object.keys(proof.current),...actorFocusAdded,...stasisUpgradeAddedPaths,...deckPagesAdded];\n assert(expected.includes(retiredControllerPath),'preStyle inventory includes the historical controller');\n assert.deepEqual(entranceInventory(Object.keys(live).sort(),readLive),[...expected.filter(path=>path!==retiredControllerPath),pointerInputPath].sort(),'complete live source inventory before preStyle');\n assertActorFocusInventory(Object.keys(raw),readLive);\n const historicalRead=beforeInputRetirementReader(readLive);\n for(const [path,binding]of Object.entries(proof.current)){\n  const source=path===retiredControllerPath?historicalRead(path):live[path];\n  assert.equal(beforeCurrentProductionSource(path,source,readLive).replaceAll('\\r\\n','\\n'),binding.source,'live preStyle input identity: '+path);\n }",
    "after": " const readLive=path=>Object.hasOwn(live,path)?live[path]:read(path);\n const liveInventory=reviewedStsStyleInventory(Object.keys(live),readLive);\n const readRenamed=reviewedRenamedStsStyleRead(readLive);\n const expected=[...Object.keys(proof.current),...actorFocusAdded,...stasisUpgradeAddedPaths,...deckPagesAdded];\n assert(expected.includes(retiredControllerPath),'preStyle inventory includes the historical controller');\n assert.deepEqual(entranceInventory(liveInventory,readRenamed),[...expected.filter(path=>path!==retiredControllerPath),pointerInputPath].sort(),'complete live source inventory before preStyle');\n assertActorFocusInventory(Object.keys(raw),readLive);\n const readPreStyle=actorFocusPreStyleReader(readLive);\n for(const [path,binding]of Object.entries(proof.current)){\n  assert.equal(readPreStyle(path,binding.source),binding.source,'live preStyle input identity: '+path);\n }"
   },
   {
    "at": 114,
    "before": " const reverted={...discoverSources(),[updated]:sourceEpoch.proof.current[updated].source};\n assert.throws(()=>capabilityPreStyle(reverted),{message:'fresh current production owner: '+updated},'frozen predecessor bytes cannot pass as current input');\n});",
    "after": " const reverted={...discoverSources(),[updated]:sourceEpoch.proof.current[updated].source};\n assert.throws(()=>capabilityPreStyle(reverted),{message:'fresh master backflow source: '+updated},'frozen predecessor bytes cannot pass as current input');\n});"
   }
  ]
 },
 "tests/defect-final-source-epoch.test.mjs": {
  "current": {
   "sha256": "9add24ff9569f96789d1c894161254e18229c906a5909021b200252136f4c118",
   "gitBlob": "381b9f064ae7544fc2a2e9a13f6910dfd4b8b002"
  },
  "previous": {
   "sha256": "32c51cb3f6a4ec49aa2169a0f872733195497e90925b9a6ad0896d73379e8999",
   "gitBlob": "64403b49fb222f057746ad6ef8a32ba9571d6355"
  },
  "hunks": [
   {
    "at": 1,
    "before": "import {readRetiredController,retiredControllerPath} from './helpers/input-retirement-source.mjs';\nimport {currentProductionRereads} from './helpers/current-production-source-reads.mjs';\nimport {closeoutPriorEpoch,ciRepairSourceEpoch,stsStyleEpoch,menuRedEpoch} from './helpers/closeout-source-epoch.mjs';",
    "after": "import {readRetiredController,retiredControllerPath} from './helpers/input-retirement-source.mjs';\nimport {currentProductionRereads,releaseArchitectureReadTrace} from './helpers/current-production-source-reads.mjs';\nimport {closeoutPriorEpoch,ciRepairSourceEpoch,stsStyleEpoch,menuRedEpoch} from './helpers/closeout-source-epoch.mjs';"
   },
   {
    "at": 194,
    "before": " const admittedReads=[...reads];\n assert.equal(admittedReads.length,480);\n assert.equal(createHash('sha256').update(JSON.stringify(admittedReads)).digest('hex'),\n  'ad1c81a8f757224fa6520ca74d2a9b682f24925d2689141bc4b2eb1066d6a7fd','exact current owner read order');\n let prior=-1;",
    "after": " const admittedReads=[...reads];\n assert.equal(admittedReads.length,releaseArchitectureReadTrace.count);\n assert.equal(createHash('sha256').update(JSON.stringify(admittedReads)).digest('hex'),\n  releaseArchitectureReadTrace.sha256,'exact current owner read order');\n let prior=-1;"
   }
  ]
 },
 "tests/watcher-actor-boundary.test.mjs": {
  "current": {
   "sha256": "adb0dce04f7f675bb34fb08ae9409bcb740007d40cd2457f13361f3920b8fc4a",
   "gitBlob": "9cf2f4beb97038b213edfc6f5488e353dc4ceb90"
  },
  "previous": {
   "sha256": "3d98a36a8a1550ca19214a9c0aa6e3772427332bb2c7fa8af4608565459366ad",
   "gitBlob": "e9c2e16553f0d5cefc73a7ebd9d72e6b8460069d"
  },
  "hunks": [
   {
    "at": 11,
    "before": "import {ciRepairSourceEpoch} from './helpers/closeout-source-epoch.mjs';\nimport {beforeInputRetirementReader,pointerInputPath,retiredControllerPath} from './helpers/input-retirement-source.mjs';\nimport {beforeCurrentProductionSource} from './helpers/character-preparation-source.mjs';\nimport {addedEntranceModules,entranceInventory} from './helpers/ui-entrance-source.mjs';",
    "after": "import {ciRepairSourceEpoch} from './helpers/closeout-source-epoch.mjs';\nimport {pointerInputPath,retiredControllerPath} from './helpers/input-retirement-source.mjs';\nimport {actorFocusPreStyleReader} from './helpers/defect-actor-vm.mjs';\nimport {reviewedRenamedStsStyleRead,reviewedStsStyleInventory} from './helpers/reviewed-selection-current-source.mjs';\nimport {addedEntranceModules,entranceInventory} from './helpers/ui-entrance-source.mjs';"
   },
   {
    "at": 65,
    "before": " assertActorFocusInventory(Object.keys(raw),read);\n const historicalRead=beforeInputRetirementReader(read);\n const historical=Object.fromEntries(entranceInventory(Object.keys(raw),read).map(path=>[path,raw[path]]));\n historical[retiredControllerPath]=historicalRead(retiredControllerPath);\n delete historical[pointerInputPath];\n const prior=Object.keys(ciRepairSourceEpoch.proof.current).filter(p=>p.startsWith('src/lua/')).sort();\n const added=Object.keys(historical).filter(p=>!Object.hasOwn(ciRepairSourceEpoch.proof.current,p)).sort();\n const uiAdded=['game_ui_navigation','game_ui_navigation_view','lowcost_art','merchant_pages','page_reveal'].map(name=>'src/lua/abyss_'+name+'.lua');",
    "after": " assertActorFocusInventory(Object.keys(raw),read);\n const readRenamed=reviewedRenamedStsStyleRead(read);\n const releaseInventory=reviewedStsStyleInventory(Object.keys(raw),read);\n const historical=[...entranceInventory(releaseInventory,readRenamed).filter(path=>path!==pointerInputPath),retiredControllerPath];\n const prior=Object.keys(ciRepairSourceEpoch.proof.current).filter(p=>p.startsWith('src/lua/')).sort();\n const added=historical.filter(p=>!Object.hasOwn(ciRepairSourceEpoch.proof.current,p)).sort();\n const uiAdded=['game_ui_navigation','game_ui_navigation_view','lowcost_art','merchant_pages','page_reveal'].map(name=>'src/lua/abyss_'+name+'.lua');"
   },
   {
    "at": 73,
    "before": " assert.deepEqual(added,[...uiAdded,...coreAdded,...deckPagesAdded].sort());\n assert.deepEqual(Object.keys(historical).filter(p=>!added.includes(p)).sort(),prior,'complete original 346-module corpus retained');\n const recorded=Object.keys(currentEpoch.proof.current).filter(p=>p.startsWith('src/lua/'));\n assert.equal(recorded.length,352,'complete predecessor inventory');\n assert.deepEqual(Object.keys(historical).sort(),[...recorded,...stasisUpgradeAddedPaths,...actorFocusAdded,...deckPagesAdded].sort());\n assert.equal(Object.keys(raw).length,357+addedEntranceModules.length,'complete raw current inventory');\n for(const [path,source]of Object.entries(historical)){\n  if(deckPagesAdded.includes(path))continue; // Authenticated by the exact live inventory above.\n  if(actorFocusAdded.includes(path)){\n   assertDevelopBackflowCurrent(path,source);",
    "after": " assert.deepEqual(added,[...uiAdded,...coreAdded,...deckPagesAdded].sort());\n assert.deepEqual(historical.filter(p=>!added.includes(p)).sort(),prior,'complete original 346-module corpus retained');\n const recorded=Object.keys(currentEpoch.proof.current).filter(p=>p.startsWith('src/lua/'));\n assert.equal(recorded.length,352,'complete predecessor inventory');\n assert.deepEqual([...historical].sort(),[...recorded,...stasisUpgradeAddedPaths,...actorFocusAdded,...deckPagesAdded].sort());\n assert.equal(releaseInventory.length,357+addedEntranceModules.length,'complete pre-release inventory');\n assert.equal(Object.keys(raw).length,releaseInventory.length+10,'complete raw current inventory');\n const readPreStyle=actorFocusPreStyleReader(read);\n for(const path of historical){\n  if(deckPagesAdded.includes(path))continue; // Authenticated by the exact live inventory above.\n  if(actorFocusAdded.includes(path)){\n   const source=read(path);\n   assertDevelopBackflowCurrent(path,source);"
   },
   {
    "at": 89,
    "before": "  if(stasisUpgradeAddedPaths.includes(path)){\n   assertStasisUpgradeAdded(path,source);",
    "after": "  if(stasisUpgradeAddedPaths.includes(path)){\n   const source=read(path);\n   assertStasisUpgradeAdded(path,source);"
   },
   {
    "at": 94,
    "before": "  }\n  assert.equal(beforeCurrentProductionSource(path,source,read).replaceAll('\\r\\n','\\n'),currentEpoch.proof.current[path].source,path);\n }",
    "after": "  }\n  const expected=currentEpoch.proof.current[path].source;\n  assert.equal(readPreStyle(path,expected),expected,path);\n }"
   }
  ]
 },
 "tests/art-feature-source-inverse.test.mjs": {
  "current": {
   "sha256": "2821f960879767a9873017673beb98faa24d98d396349643d40e81a9037d0c55",
   "gitBlob": "64ac818d7086c34a111ef6973e73143e0841061a"
  },
  "previous": {
   "sha256": "68979368cc5ec145d2c43e4cc00b7ee095bea8b34e74e8f81ee9979e1b3499de",
   "gitBlob": "cca668dbbbf44d826db7f99f4045fdb138582858"
  },
  "hunks": [
   {
    "at": 19,
    "before": "import {beforeCharacterPreparationSource} from './helpers/character-preparation-source.mjs';\nimport {pointerInputPath,readRetiredController,retiredControllerPath} from './helpers/input-retirement-source.mjs';",
    "after": "import {beforeCharacterPreparationSource} from './helpers/character-preparation-source.mjs';\nimport {reviewedStsStyleRead} from './helpers/reviewed-selection-current-source.mjs';\nimport {pointerInputPath,readRetiredController,retiredControllerPath} from './helpers/input-retirement-source.mjs';"
   },
   {
    "at": 309,
    "before": "test('current feature entries preserve unsupported input bytes and never use unknown input to authorize raw reads',()=>{\n for(const [path,intermediate]of Object.entries(currentTargets)){\n  const source=readFileSync(path,'utf8').replaceAll('\\r\\n','\\n');\n  const binding=sourceEpoch.proof.current[path],epochSource=beforeCharacterPreparationSource(path,source);\n  assert.equal(epochSource,binding.source,'exact approved current source: '+path);",
    "after": "test('current feature entries preserve unsupported input bytes and never use unknown input to authorize raw reads',()=>{\n const read=path=>readFileSync(path,'utf8');\n const reviewed=reviewedStsStyleRead(read);\n const guideOwners=new Set(['navigation','navigation_view','overlays'].map(name=>'src/lua/abyss_game_ui_'+name+'.lua'));\n const readOwner=path=>guideOwners.has(path)?reviewed(path):read(path);\n for(const [path,intermediate]of Object.entries(currentTargets)){\n  const source=readFileSync(path,'utf8').replaceAll('\\r\\n','\\n');\n  const binding=sourceEpoch.proof.current[path],epochSource=beforeCharacterPreparationSource(path,source,readOwner);\n  assert.equal(epochSource,binding.source,'exact approved current source: '+path);"
   },
   {
    "at": 340,
    "before": " // The outer admits only a complete known current source, never foreign drift.\n const readSource=path=>preComponentUiCiSource(path,readFileSync(path,'utf8'));\n const featurePath='scripts/art/ready-card-runtime.mjs',featureOwner='scripts/native-script-batch.mjs';",
    "after": " // The outer admits only a complete known current source, never foreign drift.\n const readSource=path=>{\n  const raw=readFileSync(path,'utf8');\n  return path.startsWith('src/lua/')||path==='config/architecture.json'?raw:preComponentUiCiSource(path,raw);\n };\n const featurePath='scripts/art/ready-card-runtime.mjs',featureOwner='scripts/native-script-batch.mjs';"
   }
  ]
 },
 "tests/readable-unit-typography-inverse.test.mjs": {
  "current": {
   "sha256": "fe863ccfc674a8a75cb72f15087dcd3d1ffa3d8d7875709a6f038596ab8453d9",
   "gitBlob": "e5405717d71997343f7f20c1c1ff7c5ad800d0db"
  },
  "previous": {
   "sha256": "f473af0f47d9f4bfe07a44c11b45d5f94a76f9e20b988fed11d7df6aa8bda39d",
   "gitBlob": "4f748ed6d56a505267a352af0f891e8d9af401d1"
  },
  "hunks": [
   {
    "at": 2,
    "before": "import {createHash} from 'node:crypto';\nimport {enemyUnitTemplate,battleLayout} from '../scripts/ui-layout.mjs';\nimport {preReadableUnitTypography} from './helpers/readable-unit-typography-inverse.mjs';",
    "after": "import {createHash} from 'node:crypto';\nimport {enemyUnitTemplate,battleLayout,theme} from '../scripts/ui-layout.mjs';\nimport {preReadableUnitTypography} from './helpers/readable-unit-typography-inverse.mjs';"
   },
   {
    "at": 21,
    "before": "   restoreRetiredHitFocus(old,hero?['hit']:['intentHit','hit']);\n   if(hero)restoreRetiredHitFocus(old.children.find(n=>n.name==='statusRow'),['hit',...Array.from({length:10},(_,i)=>'hit'+(i+1))]);\n   else{\n    old.children=old.children.filter(n=>!['intentVfxBehind','intentVfxAfter'].includes(n.name));",
    "after": "   restoreRetiredHitFocus(old,hero?['hit']:['intentHit','hit']);\n   if(hero){\n    const row=old.children.find(n=>n.name==='statusRow');\n    const {statusIcon,nativeText}=theme.layout;\n    // #887 widened the count boxes to the native line-height minimum.\n    for(const count of row.children.filter(n=>/^count\\d+$/.test(n.name))){\n     assert.deepEqual(count.size,[Math.max(statusIcon.size,nativeText.lineHeight),nativeText.lineHeight]);\n     count.size[0]=statusIcon.size;\n    }\n    restoreRetiredHitFocus(row,['hit',...Array.from({length:10},(_,i)=>'hit'+(i+1))]);\n   }else{\n    // #897 adds a pointer-only HP hit and makes the actor block the cursor.\n    assert.equal(old.blockCursor,true,'exact enemy cursor blocking');\n    delete old.blockCursor;\n    const hpHitIndex=old.children.findIndex(n=>n.name==='hpHit');\n    assert.deepEqual(old.children[hpHitIndex],{name:'hpHit',kind:'cursorArea',size:theme.layout.hpBar.size,visible:false},'exact enemy HP hit');\n    old.children.splice(hpHitIndex,1);\n    old.children=old.children.filter(n=>!['intentVfxBehind','intentVfxAfter'].includes(n.name));"
   }
  ]
 },
 "tests/golden-idol-source-epoch.test.mjs": {
  "current": {
   "sha256": "bb4ef50dafe8406968193ad974f12bdae0b3af3d3cd3600485070f327655e328",
   "gitBlob": "bb33ded4964b8a5d2f5d1fde228e4b3c21e012f9"
  },
  "previous": {
   "sha256": "0597f48fb68fd5b98e1170e4f78f4ba50a25ccec6a163b1d3d056bc4409a6c52",
   "gitBlob": "9cf7adc438249202c97f8d1053c82565bffe845a"
  },
  "hunks": [
   {
    "at": 0,
    "before": "import {beforeCharacterPreparationSource,beforeCurrentProductionSource} from './helpers/character-preparation-source.mjs';\nimport {pointerInputPath,readRetiredController,retiredControllerPath} from './helpers/input-retirement-source.mjs';\nimport {sourceSlice} from './helpers/closeout-source-epoch.mjs';\nimport {beforePc13ThenV2UiHudSource} from './helpers/pc13-reward-cover-source.mjs';",
    "after": "import {beforeCharacterPreparationSource} from './helpers/character-preparation-source.mjs';\nimport {pointerInputPath,readRetiredController,retiredControllerPath} from './helpers/input-retirement-source.mjs';\nimport {closeoutRead} from './helpers/closeout-ci-source.mjs';\nimport {beforePc13ThenV2UiHudSource} from './helpers/pc13-reward-cover-source.mjs';"
   },
   {
    "at": 15,
    "before": "function goldenReader(read){\n const admitted=file=>{\n  if(file===retiredControllerPath){",
    "after": "function goldenReader(read){\n const replay=closeoutRead('pr614',read);\n return file=>{\n  if(file===retiredControllerPath){"
   },
   {
    "at": 20,
    "before": "   assert(restored,'current Controller must be retired');\n   return beforeCharacterPreparationSource(file,source,read);\n  }\n  return beforeCurrentProductionSource(file,read(file),read);\n };\n return file=>beforePc13ThenV2UiHudSource(file,sourceSlice(file,admitted(file),'pr614',admitted),read);\n}",
    "after": "   assert(restored,'current Controller must be retired');\n   return beforePc13ThenV2UiHudSource(file,beforeCharacterPreparationSource(file,source,read),read);\n  }\n  return beforePc13ThenV2UiHudSource(file,replay(file,'utf8'),read);\n };\n}"
   }
  ]
 },
 "tests/room-ui-source-epoch.test.mjs": {
  "current": {
   "sha256": "12e2d53c852dcae8444d87b3e87e0070a0e0f29f2675973b99ac99bcb0dc29d8",
   "gitBlob": "20ab4de5860cf013f1c63f8d379707b9c7894d9d"
  },
  "previous": {
   "sha256": "0b5f8200d62fc590ea3b8fe75c18394c68ab033eb4b4e15c8f3f848c266f589f",
   "gitBlob": "e5f428bf4f4c4ff0c9ceb4ad1a34ff5be0f21a35"
  },
  "hunks": [
   {
    "at": 0,
    "before": "import {sourceEpoch as combinedCurrent,sourceSlice,ciRepairSourceEpoch} from './helpers/closeout-source-epoch.mjs';\nimport test from 'node:test';\nimport {entranceInventory} from './helpers/ui-entrance-source.mjs';\nimport assert from 'node:assert/strict';",
    "after": "import {sourceEpoch as combinedCurrent,sourceSlice,ciRepairSourceEpoch} from './helpers/closeout-source-epoch.mjs';\nimport {closeoutRead} from './helpers/closeout-ci-source.mjs';\nimport test from 'node:test';\nimport {entranceInventory} from './helpers/ui-entrance-source.mjs';\nimport {reviewedRenamedStsStyleRead,reviewedStsStyleInventory} from './helpers/reviewed-selection-current-source.mjs';\nimport {actorFocusPreStyleReader} from './helpers/defect-actor-vm.mjs';\nimport assert from 'node:assert/strict';"
   },
   {
    "at": 31,
    "before": "function joustReader(read){\n const admitted=path=>admittedRaw(path,read);\n return path=>{\n  try{return sourceSlice(path,admitted(path),'pr612',admitted).replaceAll('\\r\\n','\\n');}\n  catch(error){if(error.code==='ENOENT')return null;throw error;}\n };",
    "after": "function joustReader(read){\n const replay=closeoutRead('pr612',reviewedRenamedStsStyleRead(read));\n const preStyle=actorFocusPreStyleReader(read);\n return path=>{\n  try{\n   const source=path===retiredControllerPath?sourceSlice(path,readRetiredController(read).source,'pr612',read):replay(path,'utf8');\n   const normalized=source.replaceAll('\\r\\n','\\n');\n   const expected=current.proof.current[path]?.source;\n   if(expected&&normalized!==expected){\n    const prior=preStyle(path,expected);\n    if(prior===expected)return prior;\n   }\n   return normalized;\n  }catch(error){if(error.code==='ENOENT')return null;throw error;}\n };"
   },
   {
    "at": 79,
    "before": " const historicalPaths=Object.keys(combinedCurrent.proof.current);\n assert.deepEqual(entranceInventory(['config/architecture.json',...liveLua],currentRaw).sort(),\n  [...historicalPaths.filter(p=>p!==retiredControllerPath),...activeAdditions].sort(),'complete live production inventory');",
    "after": " const historicalPaths=Object.keys(combinedCurrent.proof.current);\n const reviewed=reviewedStsStyleInventory(['config/architecture.json',...liveLua],currentRaw);\n assert.deepEqual(entranceInventory(reviewed,currentRaw).sort(),\n  [...historicalPaths.filter(p=>p!==retiredControllerPath),...activeAdditions].sort(),'complete live production inventory');"
   },
   {
    "at": 87,
    "before": " combinedCurrent.preCombinedSource('config/architecture.json',currentRaw('config/architecture.json'),{target:'stsStylePrior',readSource:currentRaw});\n for(const p of styleAdded){\n  assert.equal(combinedCurrent.proof.targets.stsStylePrior.files[p],null,'complete original absence must remain explicit');\n  assert.equal(admittedRaw(p).replaceAll('\\r\\n','\\n'),combinedCurrent.proof.current[p].source,'new module retains complete current source');\n  assert(combinedCurrent.proof.owners.includes(p),'new module is an authenticated current owner');",
    "after": " combinedCurrent.preCombinedSource('config/architecture.json',currentRaw('config/architecture.json'),{target:'stsStylePrior',readSource:currentRaw});\n const preStyle=actorFocusPreStyleReader(currentRaw);\n for(const p of styleAdded){\n  assert.equal(combinedCurrent.proof.targets.stsStylePrior.files[p],null,'complete original absence must remain explicit');\n  const expected=combinedCurrent.proof.current[p].source;\n  assert.equal(preStyle(p,expected),expected,'new module retains complete current source: '+p);\n  assert(combinedCurrent.proof.owners.includes(p),'new module is an authenticated current owner');"
   }
  ]
 },
 "scripts/verify-delivery.mjs": {
   "current": {
     "sha256": "0cc36bf1fc188d5a0cf40163fbeb9fbbd227d1d62d98b991036b83b7d2dbd818",
     "gitBlob": "70c27b3b02de90afe52a2800b1569181d5d5eb3d"
   },
   "previous": {
     "sha256": "ca30e7b350cb4a2a532177d205541fdec9445a72a744f1f48d9f5312c7da6e03",
     "gitBlob": "7627104b9c447b4bdd6979754ea34653fdb84816"
   },
   "hunks": [
     {
       "at": 2,
       "before": "import { randomUUID, createHash } from 'node:crypto';\nimport {inflateRawSync} from 'node:zlib';\nimport {tmpdir} from 'node:os';",
       "after": "import { randomUUID, createHash } from 'node:crypto';\nimport {readVerifiedArtifactZip} from './verified-artifact-zip.mjs';\nimport {tmpdir} from 'node:os';"
     },
     {
       "at": 9,
       "before": "import {projectRepositoryId,currentProjectRepository,projectRepositoryMatches,collectIdentityWitness,identityWitnessValid} from './repository-identity.mjs';\nimport {prFastErrors,collectFastCheckout} from './pr-quality-evidence.mjs';\nimport {syncBacklogCloseout} from './backlog-closeout.mjs';",
       "after": "import {projectRepositoryId,currentProjectRepository,projectRepositoryMatches,collectIdentityWitness,identityWitnessValid} from './repository-identity.mjs';\nimport {prFastErrors,collectFastCheckout,qualityPendingStatusJob,qualityPendingStatusJobErrors} from './pr-quality-evidence.mjs';\nimport {syncBacklogCloseout} from './backlog-closeout.mjs';"
     },
     {
       "at": 36,
       "before": "}\nfunction qualityErrors(jobs,{attempt,runId,head,schemaVersion,allowRunningAggregate=false}) {\n  // Collect filter=all, not one attempt: reruns preserve GITHUB_SHA/GITHUB_REF",
       "after": "}\nfunction qualityErrors(jobs,{attempt,runId,head,schemaVersion,allowRunningAggregate=false,run}) {\n  // Collect filter=all, not one attempt: reruns preserve GITHUB_SHA/GITHUB_REF"
     },
     {
       "at": 49,
       "before": "    const identity=`${job?.name}:${job?.run_attempt}`;\n    if(!expectedJobs.includes(job?.name)||!positiveId(job?.id)||ids.has(job.id)||identities.has(identity)||\n      !positiveId(job?.run_attempt)||job.run_attempt>attempt||job.run_id!==runId||job.head_sha!==head)",
       "after": "    const identity=`${job?.name}:${job?.run_attempt}`;\n    if((!expectedJobs.includes(job?.name)&&!(schemaVersion===3&&job?.name===qualityPendingStatusJob))||!positiveId(job?.id)||ids.has(job.id)||identities.has(identity)||\n      !positiveId(job?.run_attempt)||job.run_attempt>attempt||job.run_id!==runId||job.head_sha!==head)"
     },
     {
       "at": 63,
       "before": "  }\n  return errors;",
       "after": "  }\n  if(schemaVersion===3)errors.push(...qualityPendingStatusJobErrors(jobs,run));\n  return errors;"
     },
     {
       "at": 213,
       "before": "  if(!Array.isArray(e.run?.pull_requests)||!e.run.pull_requests.some(pr=>pr?.number===e.prNumber))errors.push('Quality run does not belong to this PR');\n  errors.push(...runErrors(e.run,{head:e.head,event:e.event,runId:e.runId,attempt:e.attempt,repo:e.repo}),...qualityErrors(e.jobs,{attempt:e.attempt,runId:e.runId,head:e.head,schemaVersion:e.schemaVersion}));\n  errors.push(...runErrors(e.currentRun,{head:e.head,event:e.event,runId:e.runId,attempt:e.attempt,repo:e.repo}));",
       "after": "  if(!Array.isArray(e.run?.pull_requests)||!e.run.pull_requests.some(pr=>pr?.number===e.prNumber))errors.push('Quality run does not belong to this PR');\n  errors.push(...runErrors(e.run,{head:e.head,event:e.event,runId:e.runId,attempt:e.attempt,repo:e.repo}),...qualityErrors(e.jobs,{attempt:e.attempt,runId:e.runId,head:e.head,schemaVersion:e.schemaVersion,run:e.run}));\n  errors.push(...runErrors(e.currentRun,{head:e.head,event:e.event,runId:e.runId,attempt:e.attempt,repo:e.repo}));"
     },
     {
       "at": 256,
       "before": "  errors.push(...runErrors(e.currentRun,{head:e.commit?.sha,event:'push',runId:e.run?.id,attempt:e.run?.run_attempt,branch:preflight.baseRef,repo:e.repo}));\n  errors.push(...qualityErrors(e.jobs,{attempt:e.run?.run_attempt,runId:e.run?.id,head:e.commit?.sha,schemaVersion:e.schemaVersion}));\n  errors.push(...receiptErrors(e.checkout,e.checkoutArtifact,e.jobs,e.run,e.schemaVersion));",
       "after": "  errors.push(...runErrors(e.currentRun,{head:e.commit?.sha,event:'push',runId:e.run?.id,attempt:e.run?.run_attempt,branch:preflight.baseRef,repo:e.repo}));\n  errors.push(...qualityErrors(e.jobs,{attempt:e.run?.run_attempt,runId:e.run?.id,head:e.commit?.sha,schemaVersion:e.schemaVersion,run:e.run}));\n  errors.push(...receiptErrors(e.checkout,e.checkoutArtifact,e.jobs,e.run,e.schemaVersion));"
     },
     {
       "at": 277,
       "before": "    ...runErrors(e.currentRun,{head:arm.head,event:'pull_request',runId:run.id,attempt:run.run_attempt,repo}),\n    ...qualityErrors(e.jobs,{attempt:run.run_attempt,runId:run.id,head:arm.head,schemaVersion:3}),\n    ...receiptErrors(checkout,e.checkoutArtifact,e.jobs,run,3));",
       "after": "    ...runErrors(e.currentRun,{head:arm.head,event:'pull_request',runId:run.id,attempt:run.run_attempt,repo}),\n    ...qualityErrors(e.jobs,{attempt:run.run_attempt,runId:run.id,head:arm.head,schemaVersion:3,run}),\n    ...receiptErrors(checkout,e.checkoutArtifact,e.jobs,run,3));"
     },
     {
       "at": 298,
       "before": "    ...runErrors(e.currentRun,{head:mergedSha,event:'merge_group',runId:run.id,attempt:run.run_attempt,repo:arm.repo}),\n    ...qualityErrors(e.jobs,{attempt:run.run_attempt,runId:run.id,head:mergedSha,schemaVersion:3}),\n    ...receiptErrors(e.checkout,e.checkoutArtifact,e.jobs,run,3));",
       "after": "    ...runErrors(e.currentRun,{head:mergedSha,event:'merge_group',runId:run.id,attempt:run.run_attempt,repo:arm.repo}),\n    ...qualityErrors(e.jobs,{attempt:run.run_attempt,runId:run.id,head:mergedSha,schemaVersion:3,run}),\n    ...receiptErrors(e.checkout,e.checkoutArtifact,e.jobs,run,3));"
     },
     {
       "at": 388,
       "before": "function nativeProofZip(bytes,artifact){\n  if(!Buffer.isBuffer(bytes)&&!(bytes instanceof Uint8Array))throw Error('Native proof adapter must return original ZIP bytes');\n  bytes=Buffer.from(bytes);\n  if(artifact.digest!=='sha256:'+createHash('sha256').update(bytes).digest('hex'))throw Error('Native proof ZIP digest differs from immutable artifact');\n  const end=bytes.lastIndexOf(Buffer.from([80,75,5,6]));\n  if(end<0||end+22>bytes.length||bytes.readUInt16LE(end+10)!==1)throw Error('Native proof artifact must contain exactly one JSON file');\n  const offset=bytes.readUInt32LE(end+16);\n  if(offset+46>end||bytes.readUInt32LE(offset)!==0x02014b50)throw Error('Malformed native proof ZIP directory');\n  const method=bytes.readUInt16LE(offset+10),size=bytes.readUInt32LE(offset+24),compressed=bytes.readUInt32LE(offset+20);\n  const nameSize=bytes.readUInt16LE(offset+28),local=bytes.readUInt32LE(offset+42);\n  const name=bytes.subarray(offset+46,offset+46+nameSize).toString('utf8');\n  if(name!=='native-ai-review-proof.json'||bytes.readUInt16LE(offset+8)&1||![0,8].includes(method)||size>32*1024*1024||\n    local+30>offset||bytes.readUInt32LE(local)!==0x04034b50||bytes.readUInt16LE(local+8)!==method)\n    throw Error('Unexpected native proof ZIP entry');\n  const localName=bytes.readUInt16LE(local+26),start=local+30+localName+bytes.readUInt16LE(local+28);\n  if(bytes.subarray(local+30,local+30+localName).toString('utf8')!==name||start+compressed>offset)\n    throw Error('Native proof ZIP entry differs from its directory');\n  const data=method===0?bytes.subarray(start,start+compressed):inflateRawSync(bytes.subarray(start,start+compressed),{maxOutputLength:size});\n  if(data.length!==size)throw Error('Native proof ZIP JSON size differs');\n  return data;\n}",
       "after": "function nativeProofZip(bytes,artifact){\n const name='native-ai-review-proof.json';\n return readVerifiedArtifactZip(bytes,artifact,[name],32*1024*1024)[name];\n}"
     },
     {
       "at": 479,
       "before": "export function checkoutReceipt(repo,run,jobs,dir,query=gh,schemaVersion=deliverySchemaVersion,{allowRunningAggregate=false}={}) {\n  const errors=qualityErrors(jobs,{attempt:run.run_attempt,runId:run.id,head:run.head_sha,schemaVersion,allowRunningAggregate});\n  if(errors.length)throw new Error(errors.join('\\n'));",
       "after": "export function checkoutReceipt(repo,run,jobs,dir,query=gh,schemaVersion=deliverySchemaVersion,{allowRunningAggregate=false}={}) {\n  const errors=qualityErrors(jobs,{attempt:run.run_attempt,runId:run.id,head:run.head_sha,schemaVersion,allowRunningAggregate,run});\n  if(errors.length)throw new Error(errors.join('\\n'));"
     }
   ]
 },
 "scripts/official-assets-campaign.lua": {
   "current": {
     "sha256": "d9cff929ad0202d0ed46459f10b1a6a9351ae3c6820810cfa1323525d347258b",
     "gitBlob": "6ef8fa20569b1616bc4ce12b8efb578d59e1df5e"
   },
   "previous": {
     "sha256": "a29124ebd50b80d9d8332039a84a351a4175d8dee6b1d9d2dd8f365a29cd942c",
     "gitBlob": "0230e9fa3c2ade86df06588cb8bcc9ef621b3b95"
   },
   "hunks": [
     {
       "at": 20,
       "before": "local EventCards=dofile('scripts/m3-event-card-policy.lua')\nlocal Pending=require('abyss_relic_pending')",
       "after": "local EventCards=dofile('scripts/m3-event-card-policy.lua')\nlocal settleShop=dofile('tests/lua/support/shop_timeline.lua')\nlocal Pending=require('abyss_relic_pending')"
     },
     {
       "at": 37,
       "before": "local run,map=h.run,h.map\nlocal coverage,done,bossWins={},{},{};local actions,rooms=0,0\nlocal function checkpoint(label)",
       "after": "local run,map=h.run,h.map\nlocal coverage,done,bossWins,bossChests={},{},{},{};local actions,rooms=0,0\nlocal function checkpoint(label)"
     },
     {
       "at": 53,
       "before": "checkpoint('start')\nlocal function drain()",
       "after": "checkpoint('start')\nlocal function recordRoom()\n assert(run.floor==rooms+1,'continuous route skipped or duplicated a floor')\n rooms=rooms+1;coverage[run.nodeFlow.type]=true;done={}\n checkpoint('room');print('CAMPAIGN_ROOM '..rooms..' floor='..run.floor..' type='..run.nodeFlow.type..' hp='..run.hp)\nend\nlocal function drain()"
     },
     {
       "at": 141,
       "before": "  elseif r.stolenGold and not r.stolenGold.claimed then click('stolenGold')\n  else click('continue')end\n elseif h.mode=='node' and h.nodeUI:holding() then press('confirm')",
       "after": "  elseif r.stolenGold and not r.stolenGold.claimed then click('stolenGold')\n  else\n   local boss=run.nodeFlow.type=='boss'\n   click('continue')\n   if boss then\n    assert(run.nodeFlow.roomKind=='boss_treasure' and h.mode=='node' and not bossChests[run.act],\n      'boss victory did not open its unique mandatory treasure room')\n    assert(run.floor==17*run.act,'boss treasure must occupy the act end floor')\n    bossChests[run.act]=true\n    recordRoom()\n   end\n  end\n elseif h.mode=='node' and h.nodeUI:holding() then press('confirm')"
     },
     {
       "at": 175,
       "before": "  else\n   if flow.type=='shop' and not h.nodeUI.shopOpen then press('merchant/talk') end\n   local plan=assert(Policy.suggestNodeAction(run,map,coverage,done),'no node plan')",
       "after": "  else\n   if flow.type=='shop' and not h.nodeUI.shopOpen then\n    press('merchant/talk');settleShop(h.nodeUI)\n    assert(h.nodeUI.shopOpen and not h.nodeUI.shopBusy,'shop shelf did not finish its native opening')\n   end\n   local plan=assert(Policy.suggestNodeAction(run,map,coverage,done),'no node plan')"
     },
     {
       "at": 186,
       "before": "   elseif plan.method=='removeCard'then press('shopView/removal');selectUID(plan.uid)\n   elseif plan.method=='leaveShop'then press('back')\n   elseif plan.method=='buyPotion'then press('shopView/potion'..plan.slot);press('confirm')",
       "after": "   elseif plan.method=='removeCard'then press('shopView/removal');selectUID(plan.uid)\n   elseif plan.method=='leaveShop'then\n    assert(h.nodeUI.shopOpen,'shop shelf must be open before closing')\n    press('back')\n    assert(not h.nodeUI.shopOpen and not run.nodeFlow.complete,'closing the shelf must not leave the room')\n    settleShop(h.nodeUI)\n    press('back')\n    assert(run.nodeFlow.complete,'leaving the shop room did not complete the node')\n   elseif plan.method=='buyPotion'then press('shopView/potion'..plan.slot);press('confirm')"
     },
     {
       "at": 201,
       "before": "  action('enter:'..node.id,function()return h.mapUI:choose(node.id)end)\n  rooms=rooms+1;coverage[run.nodeFlow.type]=true;done={}\n  assert(run.floor==rooms,'continuous route skipped a floor');checkpoint('room');print('CAMPAIGN_ROOM '..rooms..' floor='..run.floor..' type='..run.nodeFlow.type..' hp='..run.hp)\n end",
       "after": "  action('enter:'..node.id,function()return h.mapUI:choose(node.id)end)\n  recordRoom()\n end"
     },
     {
       "at": 206,
       "before": "assert(run.phase=='victory'and run.ending=='two_act_complete'and run.floor==34)\nassert(rooms==34 and bossWins[1]and bossWins[2],'both natural boss victories are required')\ncheckpoint('victory');capture('victory')",
       "after": "assert(run.phase=='victory'and run.ending=='two_act_complete'and run.floor==34)\nassert(rooms==34 and bossWins[1] and bossWins[2] and bossChests[1] and bossChests[2],\n 'both natural boss victories and consecutive treasure floors are required')\ncheckpoint('victory');capture('victory')"
     }
   ]
 },
 "tests/act1-choice-responsibilities.test.mjs": {
   "current": {
     "sha256": "485c0e068be1bc34aad4b698f0944fd49b1ce5d2e398da6a89939572d9772dcc",
     "gitBlob": "af59b5dac5f065de3bbc6ca303bd92625926abf9"
   },
   "previous": {
     "sha256": "6378c8df20c4cff729438be831af842a0fde9a70213a6cb74f55c2f5343ebedc",
     "gitBlob": "26a085852562046ff4f5dfa7b87c9bf23f1b77f8"
   },
   "hunks": [
     {
       "at": 23,
       "before": "import {gunzipSync} from 'node:zlib';\nimport {act1ChoiceBefore as before,preAct1ChoiceSource,act1ChoiceReader} from './helpers/act1-choice-source-inverse.mjs';\nimport {copyCurrentSourceFixture} from './helpers/isolated-current-source.mjs';",
       "after": "import {gunzipSync} from 'node:zlib';\nimport {act1ChoiceBefore as before,preAct1ChoiceSource,act1ChoiceReader} from './helpers/epochs/act1/tests/helpers/act1-choice-source-inverse.mjs';\nimport {beforeReleaseVocabulary} from './helpers/develop-release-vocabulary-source.mjs';\nimport {act1ChoiceReader as currentAct1ChoiceReader} from './helpers/act1-choice-source-inverse.mjs';\nimport {copyCurrentSourceFixture} from './helpers/isolated-current-source.mjs';"
     },
     {
       "at": 78,
       "before": "test('Act1 source inverse authenticates fresh current bytes with exact LF and Git identity',()=>{\n const current=read(file);let live=current,reads=0;const raw=p=>{assert.equal(p,file);reads++;return live;};\n const reader=act1ChoiceReader(raw);assert.equal(act1ChoiceReader(reader),reader);\n assert.equal(preAct1ChoiceSource(file,current,{readSource:reader}),before);assert.equal(reads,1);\n assert.equal(preAct1ChoiceSource(file,current.replaceAll('\\n','\\r\\n'),{readSource:raw}),before);\n for(live of [current+'\\n',before,null,undefined])assert.throws(()=>preAct1ChoiceSource(file,current,{readSource:reader}),/linked owner/);\n assert.throws(()=>preAct1ChoiceSource(file,current,{readSource(){throw Error('missing');}}),/linked owner missing/);\n assert.throws(()=>preAct1ChoiceSource(file,current,{readSource:null}),/linked reader/);\n reads=0;for(const unknown of [null,undefined,'',current+'\\n',before])assert.equal(preAct1ChoiceSource(file,unknown,{readSource:raw}),unknown);",
       "after": "test('Act1 source inverse authenticates fresh current bytes with exact LF and Git identity',()=>{\n const current=read(file),projected=beforeReleaseVocabulary(file,current);\n assert.notEqual(projected,current,'approved Release copy has distinct bytes');\n let live=current,reads=0;\n const raw=p=>{assert.equal(p,file);reads++;const prior=beforeReleaseVocabulary(p,live);return prior===live?null:prior;};\n const reader=act1ChoiceReader(raw);assert.equal(act1ChoiceReader(reader),reader);\n assert.equal(preAct1ChoiceSource(file,projected,{readSource:reader}),before);assert.equal(reads,1);\n assert.equal(preAct1ChoiceSource(file,beforeReleaseVocabulary(file,current.replaceAll('\\n','\\r\\n')),{readSource:raw}),before);\n for(live of [current+'\\n',projected,before,null,undefined])assert.throws(()=>preAct1ChoiceSource(file,projected,{readSource:reader}),/linked owner/);\n assert.throws(()=>preAct1ChoiceSource(file,projected,{readSource(){throw Error('missing');}}),/linked owner missing/);\n assert.throws(()=>preAct1ChoiceSource(file,projected,{readSource:null}),/linked reader/);\n reads=0;for(const unknown of [null,undefined,'',current+'\\n',before])assert.equal(preAct1ChoiceSource(file,unknown,{readSource:raw}),unknown);"
     },
     {
       "at": 120,
       "before": "  const readSource=copyCurrentSourceFixture(dir,{crlf:true});\n  const module=await import(pathToFileURL(join(dir,'tests/helpers/act1-choice-source-inverse.mjs')).href);\n  assert.equal(module.act1ChoiceBefore,before);\n  const source=readSource(file);\n  assert.equal(module.preAct1ChoiceSource(file,source,{readSource}),before);\n  writeFileSync(join(dir,file),source+'\\r\\n');\n  assert.throws(()=>module.preAct1ChoiceSource(file,source,{readSource}),/linked owner/);\n  rmSync(join(dir,file));\n  assert.throws(()=>module.preAct1ChoiceSource(file,source,{readSource}),/linked owner missing/);\n }finally{rmSync(dir,{recursive:true,force:true});}",
       "after": "  const readSource=copyCurrentSourceFixture(dir,{crlf:true});\n  const helper='tests/helpers/epochs/act1/tests/helpers/act1-choice-source-inverse.mjs';\n  const module=await import(pathToFileURL(join(dir,helper)).href);\n  assert.equal(module.act1ChoiceBefore,before);\n  const source=readSource(file),projected=beforeReleaseVocabulary(file,source);\n  const readOwner=path=>{const raw=readSource(path),prior=beforeReleaseVocabulary(path,raw);return prior===raw?null:prior;};\n  assert.notEqual(projected,source,'current CRLF bytes need the reviewed copy predecessor');\n  assert.equal(module.preAct1ChoiceSource(file,projected,{readSource:readOwner}),before);\n  writeFileSync(join(dir,file),source+'\\r\\n');\n  assert.throws(()=>module.preAct1ChoiceSource(file,projected,{readSource:readOwner}),/linked owner/);\n  rmSync(join(dir,file));\n  assert.throws(()=>module.preAct1ChoiceSource(file,projected,{readSource:readOwner}),/linked owner missing/);\n }finally{rmSync(dir,{recursive:true,force:true});}"
     },
     {
       "at": 166,
       "before": "  }\n  const source=target.files[file].source;assert.equal(source,read(file));\n  for(const path of [file,'config/architecture.json']){",
       "after": "  }\n  const source=target.files[file].source,liveSource=read(file);\n  assert.notEqual(liveSource,source,'the Release copy has its own exact identity');\n  assert.equal(beforeReleaseVocabulary(file,liveSource),source);\n  assert.equal(beforeReleaseVocabulary(file,liveSource+'\\n'),liveSource+'\\n');\n  for(const path of [file,'config/architecture.json']){"
     },
     {
       "at": 215,
       "before": "  if(!admittedReads){\n   // Keep the complete current trace and the ordered original contract.\n   assert.equal(reads.length,466);\n   assert.equal(createHash('sha256').update(JSON.stringify(reads)).digest('hex'),'049af1e21af40d804c1201c01f79da465c7ee0a2b1c4a2544a0c4c3cd1da0500');\n   const entranceBytes=readFileSync('tests/fixtures/ui-entrance-source.json.gz');",
       "after": "  if(!admittedReads){\n   // The Release adds fresh portrait, Prologue and battle-feedback reads.\n   // All 466 reads from #912 remain in their original order.\n   assert.equal(reads.length,543);\n   const traceDigest=trace=>createHash('sha256').update(JSON.stringify(trace)).digest('hex');\n   assert.equal(traceDigest(reads),'4fce5e9a9dc7a2c45cb0973b8a88c3cc6964f9983f99f4f0ab8ee488b77c4fa2');\n   const releaseReads=[\n    [4,6],[10,12],[17,18],[19,24],[31,33],[76,77],\n    [101,104],[143,145],[157,159],[160,162],[163,165],[166,168],\n    [209,212],[213,216],[223,226],[262,264],[265,267],[268,270],\n    [311,313],[327,328],[338,340],[341,343],[344,346],[347,349],\n    [378,381],[382,385],[391,394],[408,410],[411,413],[414,416],\n    [445,446],[473,474],[476,478],[479,484],[517,518],\n   ];\n   const originalReads=reads.filter((_,index)=>!releaseReads.some(([from,to])=>index>=from&&index<to));\n   assert.equal(originalReads.length,466);\n   assert.equal(traceDigest(originalReads),'049af1e21af40d804c1201c01f79da465c7ee0a2b1c4a2544a0c4c3cd1da0500');\n   const entranceBytes=readFileSync('tests/fixtures/ui-entrance-source.json.gz');"
     },
     {
       "at": 235,
       "before": "   assert.equal(entranceOwners.length,20);\n   assert.deepEqual(reads.slice(1,21),entranceOwners,'complete current entrance cohort');\n   assert.equal(createHash('sha256').update(JSON.stringify([reads[0],...reads.slice(21)])).digest('hex'),\n    '5dad58d855f93d4169fa5877eff635d77f2c0b99af76f12e8f5cb68a4d659a4f','unchanged complete original Act1 order');",
       "after": "   assert.equal(entranceOwners.length,20);\n   assert.deepEqual(originalReads.slice(1,21),entranceOwners,'complete original entrance cohort');\n   assert.equal(traceDigest([originalReads[0],...originalReads.slice(21)]),\n    '5dad58d855f93d4169fa5877eff635d77f2c0b99af76f12e8f5cb68a4d659a4f','unchanged complete original Act1 order');"
     },
     {
       "at": 247,
       "before": "  for(const owner of owners.filter(owner=>owner!==retiredControllerPath))for(replacement of [read(owner)+'\\n',null,undefined]){\n   changed=owner;reads=[];assert.throws(()=>preRelicQuerySource(file,source,{readSource}),/combined linked owner identity/);\n   assert.deepEqual(reads,admittedReads.slice(0,admittedReads.indexOf(owner)+1),'fresh reads stop at the actual bad owner: '+owner);",
       "after": "  for(const owner of owners.filter(owner=>owner!==retiredControllerPath))for(replacement of [read(owner)+'\\n',null,undefined]){\n   changed=owner;reads=[];\n   assert.throws(()=>preRelicQuerySource(file,source,{readSource}),error=>\n    /combined linked owner (identity|missing)|fresh (Selection portrait|prologue button) owner/.test(error.message)&&error.message.includes(owner));\n   assert.deepEqual(reads,admittedReads.slice(0,admittedReads.indexOf(owner)+1),'fresh reads stop at the actual bad owner: '+owner);"
     },
     {
       "at": 271,
       "before": " // Accepting it would silently combine #546 architecture with the current tree.\n const act1Reader=act1ChoiceReader(read);\n assert.equal(act1Reader('config/architecture.json'),sourceEpoch.proof.targets.act1.files['config/architecture.json'].source);",
       "after": " // Accepting it would silently combine #546 architecture with the current tree.\n const act1Reader=currentAct1ChoiceReader(read);\n assert.equal(act1Reader('config/architecture.json'),sourceEpoch.proof.targets.act1.files['config/architecture.json'].source);"
     }
   ]
 },
 "tests/lua/nemesis_ui.lua": {
  "current": {
   "sha256": "34cd648ad0346bcfff547b83dc7c1c64a657efea34c3356cfe3962de4667b7c3",
   "gitBlob": "24567abeed8017331b039d0fc23b3c18fa849986"
  },
  "previous": {
   "sha256": "4c3655ba6d08705d742e307aa56d6d2fadfb67c5379df2462e0a04792ebee4d7",
   "gitBlob": "02fc4d2e206fe7447fc8e8a186494603faa25b66"
  },
  "hunks": [
   {
    "at": 16,
    "before": "tap('enemy1',91)\nlocal text=inspectDetails(host.battleUI,panel)\nassert(text:find('3',1,true)and text:find(r.combat.catalog.cards.burn.name,1,true)and text:find('弃牌堆',1,true),text)\nassert(not text:find('未知',1,true),text)\nassert(N.Run.endTurn(r));N.force(r.combat,'fire');host:refresh()",
    "after": "tap('enemy1',91)\nassert(host.battleUI.info and host.battleUI.info.powerTips,'enemy tap must use the original compact tooltip')\nlocal text=inspectDetails(host.battleUI,panel)\neq(text,'<color=#F5D78A>策略</color>\\n这名敌人将要对你施加一种负面效果。')\n-- The compact tooltip shows the approved category. The detailed projection\n-- still exposes the exact pending Burn count, card and destination.\nlocal intent=require('abyss_battle_intent_view').intentView(r.combat,1)\neq(intent.tooltipEnum,'DEBUFF')\neq(intent.text,'将 3 张「'..r.combat.catalog.cards.burn.name..'」放入你的弃牌堆')\nassert(N.Run.endTurn(r));N.force(r.combat,'fire');host:refresh()"
   },
   {
    "at": 27,
    "before": "dofile('tests/lua/support/monster_power_control_fixture.lua')(box,'nemesis_intangible'):GetChild('hit').click({touchId=92})\nlocal info=panel:GetChild('statusInfo');assert(info.visible)\nlocal shown=false\nfor i=1,F.Theme.layout.statusInfo.rows do\n local name=info:GetChild('name'..i)\n if name.visible and name.text:find('无实体',1,true)then shown=true end\nend\nassert(shown,'monster Intangible must be named in the existing status panel')\nprint('NEMESIS_UI 1 groups; 0 failed')",
    "after": "dofile('tests/lua/support/monster_power_control_fixture.lua')(box,'nemesis_intangible'):GetChild('hit').click({touchId=92})\nlocal power=inspectDetails(host.battleUI,panel)\nassert(power:find('无实体',1,true) and power:find('最多为1',1,true),power)\nprint('NEMESIS_UI 1 groups; 0 failed')"
   }
  ]
 },
 "tests/session-menu-navigation.test.mjs": {
  "current": {
   "sha256": "26b72dbb78c945d991a18e00ce6c73653b41676f2855f05ae3e08856c778ebde",
   "gitBlob": "0af89cb251f99e534a2c17c4a4e863c673314a23"
  },
  "previous": {
   "sha256": "bd957b1c65c16d2b60f2f4a1853b73655a5ed913d2eaff1f48a391ccf160ab9e",
   "gitBlob": "394b8024a5e4a0860e455adb7cc8b75b6530ca04"
  },
  "hunks": [
   {
    "at": 3,
    "before": "import {entranceInventory} from './helpers/ui-entrance-source.mjs';\nimport {beforeInputRetirementReader,pointerInputPath,retiredControllerPath} from './helpers/input-retirement-source.mjs';",
    "after": "import {entranceInventory} from './helpers/ui-entrance-source.mjs';\nimport {actorFocusPreStyleReader} from './helpers/defect-actor-vm.mjs';\nimport {reviewedRenamedStsStyleRead,reviewedStsStyleInventory} from './helpers/reviewed-selection-current-source.mjs';\nimport {beforeInputRetirementReader,pointerInputPath,retiredControllerPath} from './helpers/input-retirement-source.mjs';"
   },
   {
    "at": 21,
    "before": "const neowFeedbackPath='src/lua/abyss_node_ui_feedback.lua';\nconst readCurrentMenuPrior=liveEpoch.combinedReader(readLive,'v2RunMenuPrior');\nfunction readHistoricalMenu(path){",
    "after": "const neowFeedbackPath='src/lua/abyss_node_ui_feedback.lua';\nconst readCurrentMenuPrior=liveEpoch.combinedReader(reviewedRenamedStsStyleRead(readLive),'v2RunMenuPrior');\nconst readPreStyle=actorFocusPreStyleReader(readLive);\nfunction readHistoricalMenu(path){"
   },
   {
    "at": 143,
    "before": "test('menu source continuation retains the complete release corpus and rejects new owner drift',()=>{\n const read=p=>readHistoricalMenu(p).replaceAll('\\r\\n','\\n');\n const luaPaths=readdirSync('src/lua').filter(p=>p.endsWith('.lua')).map(p=>'src/lua/'+p).sort();",
    "after": "test('menu source continuation retains the complete release corpus and rejects new owner drift',()=>{\n const read=p=>{\n  const prior=readHistoricalMenu(p).replaceAll('\\r\\n','\\n');\n  const expected=sourceEpoch.proof.current[p]?.source;\n  return expected&&prior!==expected?readPreStyle(p,expected):prior;\n };\n const luaPaths=readdirSync('src/lua').filter(p=>p.endsWith('.lua')).map(p=>'src/lua/'+p).sort();"
   },
   {
    "at": 153,
    "before": " const later=['src/lua/abyss_power_membership.lua',...stasisUpgradeAddedPaths,...actorFocusAdded,...deckPagesAdded,pointerInputPath];\n assert.deepEqual(entranceInventory(['config/architecture.json',...luaPaths].sort(),readLive),[...paths.filter(path=>path!==retiredControllerPath),...later].sort());\n assert.throws(()=>readLive(retiredControllerPath),{code:'ENOENT'});",
    "after": " const later=['src/lua/abyss_power_membership.lua',...stasisUpgradeAddedPaths,...actorFocusAdded,...deckPagesAdded,pointerInputPath];\n const reviewed=reviewedStsStyleInventory(['config/architecture.json',...luaPaths],readLive);\n assert.deepEqual(entranceInventory(reviewed,readLive),[...paths.filter(path=>path!==retiredControllerPath),...later].sort());\n assert.throws(()=>readLive(retiredControllerPath),{code:'ENOENT'});"
   },
   {
    "at": 166,
    "before": " assert.deepEqual(added,['src/lua/abyss_game_ui_navigation.lua','src/lua/abyss_game_ui_navigation_view.lua']);\n for(const p of paths)assert.equal(beforeCharacterPreparationSource(p,read(p)),sourceEpoch.proof.current[p].source,p);\n for(const p of added){",
    "after": " assert.deepEqual(added,['src/lua/abyss_game_ui_navigation.lua','src/lua/abyss_game_ui_navigation_view.lua']);\n for(const p of paths)assert.equal(read(p),sourceEpoch.proof.current[p].source,p);\n for(const p of added){"
   },
   {
    "at": 183,
    "before": "  const raw=readLive(path);\n  assert.equal(beforeCharacterPreparationSource(path,raw,readLive).replaceAll('\\r\\n','\\n'),liveEpoch.proof.current[path].source);\n  assert.equal(liveEpoch.preCombinedSource(path,raw,{target:'v2RunMenuPrior',readSource:readLive}),sourceEpoch.proof.current[path].source);",
    "after": "  const raw=readLive(path);\n  const current=liveEpoch.proof.current[path].source;\n  assert.equal(readPreStyle(path,current),current,path);\n  assert.equal(liveEpoch.preCombinedSource(path,raw,{target:'v2RunMenuPrior',readSource:readLive}),sourceEpoch.proof.current[path].source);"
   }
  ]
 },
 "tests/sts-selection-fade.test.mjs": {
  "current": {
   "sha256": "125fbb29aaa658c84f1858ed81fc30985c656d65aa03a396b5b4b76382f0e9fd",
   "gitBlob": "23ba59d0554eaf924f1c8c003b5d242820bbe928"
  },
  "previous": {
   "sha256": "5a581dce3b17bffef0e1e736efbe14186d5c4eca2a3d25017b0842d97c859e97",
   "gitBlob": "46b1d44cef4a25a32713d2defee2dda9e6fb377b"
  },
  "hunks": [
   {
    "at": 94,
    "before": " const prior=beforeV220SelectionFadeSource(path,lf);\n const read=owner=>beforeV220SelectionFadeSource(owner,readFileSync(owner,'utf8'));\n assert.equal(beforeStsSelectionFade(path,prior),files[path].before);",
    "after": " const prior=beforeV220SelectionFadeSource(path,lf);\n // The entrance and fade validators read current owners at different stages.\n // Only the legacy bootstrap remains outside their current entrance cohort.\n const read=owner=>{\n  const raw=readFileSync(owner,'utf8');\n  return owner==='src/lua/abyss_ui.lua'?beforeV220SelectionFadeSource(owner,raw):raw;\n };\n assert.equal(beforeStsSelectionFade(path,prior),files[path].before);"
   },
   {
    "at": 217,
    "before": " const source=readFileSync(new URL('./fixtures/page-reveal-pr839.lua',import.meta.url),'utf8');",
    "after": " const source=readFileSync(new URL('./fixtures/page-reveal-pr839.lua',import.meta.url),'utf8').replaceAll('\\r\\n','\\n');"
   }
  ]
 },
 "tests/official-background-build.test.mjs": {
  "current": {
   "sha256": "f6d2b6fd7f7edfdabc1c0ef26fb7a9d74b9f47d7aca1cee9e32fd068754cb47b",
   "gitBlob": "10389b49bea6610b53e57ac4d48ab29ebd0254f0"
  },
  "previous": {
   "sha256": "bff7e52298b5187766692a8153814b7f249057ccc8b82c9c5a72713d5b86afda",
   "gitBlob": "1c1c859f0cfc54976821346688d8dc7862fdcea3"
  },
  "hunks": [
   {
    "at": 1,
    "before": "import assert from 'node:assert/strict';\nimport {mkdtempSync, readFileSync, rmSync} from 'node:fs';",
    "after": "import assert from 'node:assert/strict';\nimport {createHash} from 'node:crypto';\nimport {mkdtempSync, readFileSync, rmSync} from 'node:fs';"
   },
   {
    "at": 7,
    "before": "import {gameLayout} from '../scripts/game-ui-layout.mjs';\nimport {buildUI} from '../scripts/build-ui.mjs';",
    "after": "import {gameLayout} from '../scripts/game-ui-layout.mjs';\nimport {anchorBattlePeriphery} from '../scripts/viewport-layout.mjs';\nimport {buildUI} from '../scripts/build-ui.mjs';"
   },
   {
    "at": 14,
    "before": "import {createOptInArtFixture} from './helpers/opt-in-art-fixture.mjs';\n",
    "after": "import {createOptInArtFixture} from './helpers/opt-in-art-fixture.mjs';\n\nconst digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');\n"
   },
   {
    "at": 46,
    "before": " const actor=templates.find(n=>n.name==='AbyssMonsterActor');assert(actor);\n assert.equal(descendants(actor).length,647);assert.equal(actor.children[0].name,'monsterArt');\n assert.equal(actor.visible,false);assert.equal(actor.children[0].visible,false);",
    "after": " const actor=templates.find(n=>n.name==='AbyssMonsterActor');assert(actor);\n assert.equal(descendants(actor).length,648);assert.equal(actor.children[0].name,'monsterArt');\n // #897 added one initially hidden, read-only HP tooltip receiver; #902\n // removed the former focusable field. Keep the legacy 647-control check.\n const priorActor=structuredClone(actor), hpHit=priorActor.children.findIndex(c=>c.name==='hpHit');\n assert.equal(hpHit,26);\n assert.equal(priorActor.children[hpHit-1].name,'floating');\n assert.equal(priorActor.children[hpHit+1].name,'intentVfxBehind');\n assert.deepEqual(priorActor.children.splice(hpHit,1),\n  [{name:'hpHit',kind:'cursorArea',size:[106.66666666666667,12],visible:false}]);\n assert.equal(descendants(priorActor).length,647);\n assert.equal(digest(priorActor),'d3ab4b09ff6ea44730a05eb45f16e76dc48ac3f07bd2fa0abafa92207c69a690');\n assert.equal(digest(actor),'5cc75124b391761cb86793ea17e9fec2e0e96b6aaf4a9e1563314cf5bfaf2b95');\n assert.equal(actor.visible,false);assert.equal(actor.children[0].visible,false);"
   },
   {
    "at": 78,
    "before": " for(const name of ['confirm','cancel'])character.children.find(n=>n.name===name).visible=false;\n const assertControls=controls=>assert.ok(isDeepStrictEqual(controls,approved),'approved controls/input and entrance groups remain exact apart from explicit empty artwork hosts');",
    "after": " for(const name of ['confirm','cancel'])character.children.find(n=>n.name===name).visible=false;\n // #1007 is the only change between the original authored oracle and the\n // current control tree. Pin both independent full-tree identities so using\n // the production transform does not let regressions change both sides.\n assert.equal(digest(approved),'1ceab50aded5e448e38de47cba984f74c9bedc8eaa1213ce943968165d082983');\n anchorBattlePeriphery({children:approved},1280,false);\n assert.equal(digest(approved),'c127761d9ef7021f65f8f91528c60ae87e918b1419cbc01fb351c659468a0d13');\n const assertControls=controls=>assert.ok(isDeepStrictEqual(controls,approved),'approved controls/input and entrance groups remain exact apart from explicit empty artwork hosts');"
   },
   {
    "at": 102,
    "before": " for(const mutate of [c=>{menuOf(c).size[0]++;},c=>{menuOf(c).raycastTarget=true;},\n  c=>{c.find(n=>n.name==='nodePanel').children.find(n=>n.name==='shopView').children.find(n=>n.name==='goods').raycastTarget=true;},",
    "after": " for(const mutate of [c=>{menuOf(c).size[0]++;},c=>{menuOf(c).raycastTarget=true;},\n  c=>{c.find(n=>n.name==='battlePanel').children.find(n=>n.name==='draw').position[0]++;},\n  c=>{c.find(n=>n.name==='nodePanel').children.find(n=>n.name==='shopView').children.find(n=>n.name==='goods').raycastTarget=true;},"
   }
  ]
 },
 "tests/helpers/integrated-ci-source.mjs": {
  "current": {
   "sha256": "9c84837be60110e8d91ed0c7ddf8df465cff11b23295fec04d71b1cf0dd6cbcf",
   "gitBlob": "04548b60bcde99259cd999c6f1a8cf838ad11e2d"
  },
  "previous": {
   "sha256": "857848b99d1f3c21055d3bb9a39773770abb4ef82932154dda3835b1a414171b",
   "gitBlob": "308cb4abd297aec27f6ccc66d8c31db4f26ecbb3"
  },
  "hunks": [
   {
    "at": 59,
    "before": "const integratedEvidenceSuccessors=Object.freeze({\n // #1010 changes the live relic inventory reader; the sealed integration view remains byte-exact.",
    "after": "const integratedEvidenceSuccessors=Object.freeze({\n // #1047 replaced the legacy artifact handoff with the unified GIL workflow.\n 'scripts/verify-delivery.mjs':{\n  sha256:'0cc36bf1fc188d5a0cf40163fbeb9fbbd227d1d62d98b991036b83b7d2dbd818',gitBlob:'70c27b3b02de90afe52a2800b1569181d5d5eb3d',\n },\n // The verified Master backflow reads the v2.0.0 predecessor of #1038.\n // The exact original integration witness still identifies v1.0.0.\n '.release-please-manifest.json':{\n  sha256:'9e38a481f52b5af8537babca8f5d13d5a0ab72473e1deba2e1aeb71e05dcd5b9',gitBlob:'895bf0e35e87e52e09aff04e9d35f554e99ae4b4',\n },\n // #1010 changes the live relic inventory reader; the sealed integration view remains byte-exact."
   },
   {
    "at": 141,
    "before": " if(!exactSourceMatches(source,binding))return false;\n if(path!==relicCloseoutOwner)return true;\n const lf=norm(source);",
    "after": " if(!exactSourceMatches(source,binding))return false;\n if(path!==relicCloseoutOwner&&path!=='.release-please-manifest.json'&&path!=='scripts/verify-delivery.mjs')return true;\n const lf=norm(source);"
   }
  ]
 },
 "tests/molten-egg-source.test.mjs": {
  "current": {
   "sha256": "a524f6e0d27813b0f6b723c603f931d2d82e9e3d89605d203daacf809467bdfe",
   "gitBlob": "76ca0e342018cdf2f2678ebc39a23abc36ec91fb"
  },
  "previous": {
   "sha256": "ba608486940a5b7374742324bb4e8d085f470cd0fbd924db050dddbb63910527",
   "gitBlob": "9571494f3b25371d7c0ffaedd073619d7fc3c239"
  },
  "hunks": [
   {
    "at": 3,
    "before": "import {requireRelicCompletionSource,preRelicCompletionSource} from './helpers/relic-completion-inverse.mjs';\nimport {closeoutRead} from './helpers/closeout-ci-source.mjs';\nconst read=path=>JSON.parse(readFileSync(path,'utf8'));",
    "after": "import {requireRelicCompletionSource,preRelicCompletionSource} from './helpers/relic-completion-inverse.mjs';\nimport {withHistoricalBaseline} from './helpers/historical-baseline-inputs.mjs';\nconst read=path=>JSON.parse(readFileSync(path,'utf8'));"
   },
   {
    "at": 36,
    "before": " // today's production identity checks above still read the complete pool.\n const current=closeoutRead('pr620')('data/relics.json','utf8');\n requireRelicCompletionSource('data/relics.json',current);\n const historical=JSON.parse(preRelicCompletionSource('data/relics.json',current));\n for(const id of ['question_card','busted_crown','singing_bowl'])assert.ok(!historical.relics.some(r=>r.id===id));",
    "after": " // today's production identity checks above still read the complete pool.\n const historical=withHistoricalBaseline(()=>{\n  const path='data/relics.json',source=readFileSync(path,'utf8');\n  requireRelicCompletionSource(path,source);\n  return JSON.parse(preRelicCompletionSource(path,source));\n });\n for(const id of ['question_card','busted_crown','singing_bowl'])assert.ok(!historical.relics.some(r=>r.id===id));"
   }
  ]
 },
 "tests/ruby-recall.test.mjs": {
  "current": {
   "sha256": "8d69c82bcbeb6a8b0b5bd2c18776c6df4d9bf5177b6e32b640e65ee897910a44",
   "gitBlob": "a6554f017663d5e3eb571887b5ef51c822276d12"
  },
  "previous": {
   "sha256": "ec4a275d02b2aa07a91f652251815e7949430712fa6a854abe08f49ece9f4df4",
   "gitBlob": "292255294546a7e2889c36ad0b67ff0e036085bc"
  },
  "hunks": [
   {
    "at": 4,
    "before": "import { runLua } from '../scripts/test-lua.mjs';\nimport { readBeforeMobileQaSource } from './helpers/mobile-qa-source-inverse.mjs';",
    "after": "import { runLua } from '../scripts/test-lua.mjs';\nimport { historicalTest } from './helpers/historical-baseline-inputs.mjs';\nimport { readBeforeMobileQaSource } from './helpers/mobile-qa-source-inverse.mjs';"
   },
   {
    "at": 92,
    "before": "\ntest('three original camp commands retain frozen bodies around the reviewed Toxic Egg adapter',()=>{\n  const code=readBeforeMobileQaSource('src/lua/abyss_nodes.lua').replaceAll('\\r\\n','\\n');",
    "after": "\nhistoricalTest('three original camp commands retain frozen bodies around the reviewed Toxic Egg adapter',()=>{\n  const code=readBeforeMobileQaSource('src/lua/abyss_nodes.lua').replaceAll('\\r\\n','\\n');"
   }
  ]
 },
 'tests/helpers/replay-reviewed-selection.mjs':selectionRawEntranceReplay,
 "tests/encounter-formation-source-epoch.test.mjs": {
   "current": {
     "sha256": "b272d2bed86eea32b1db4e0627990b57f2497e940a0094ac65cbd63b29fd5f0d",
     "gitBlob": "1680aa396a2188621c444bbdfb3891e9a8555eae"
   },
   "previous": {
     "sha256": "1eb67ff503600165775494ca783b843f3355f61db89c1ff15e6fc9c6fe113643",
     "gitBlob": "755eb1807c0b7a737d719fc6789a91a5d942f757"
   },
   "hunks": [
     {
       "at": 0,
       "before": "import {beforeDevelopUiBackflows,readRetiredController,retiredControllerPath} from './helpers/input-retirement-source.mjs';\nimport {beforeCharacterPreparationSource,beforeCurrentProductionSource} from './helpers/character-preparation-source.mjs';\nimport {currentProductionRereads} from './helpers/current-production-source-reads.mjs';\nimport {beforePc13ThenV2UiHudSource} from './helpers/pc13-reward-cover-source.mjs';",
       "after": "import {retiredControllerPath} from './helpers/input-retirement-source.mjs';\nimport {currentProductionRereads,releaseArchitectureReadTrace} from './helpers/current-production-source-reads.mjs';\nimport {beforePc13ThenV2UiHudSource} from './helpers/pc13-reward-cover-source.mjs';"
     },
     {
       "at": 204,
       "before": "test('official repair adds exact complete-file identities without rewriting the battle predecessor',()=>{\n const files=officialUiRepairProof.files,pileChrome='scripts/official-battle-pile-chrome.mjs';\n const pileChromeAfter={sha256:'1a7d9023534a02d57af4e6b9749bb0ce2b5fd7a388a616379ff0614175c37683',\n  gitBlob:'e06cdaca1d6c23efd3931270b925866ca480c03f'};\n const fromNativeButtons=(file,encoding)=>{\n  const source=diskReadFileSync(file,encoding);\n  if(file!==pileChrome)return source;\n  assert(exactSourceMatches(beforeDevelopUiBackflows(file,source),pileChromeAfter),'fresh Native Buttons pile-chrome source');\n  return closeoutCiProof.records[closeoutCiProof.current[file]];\n };",
       "after": "test('official repair adds exact complete-file identities without rewriting the battle predecessor',()=>{\n const files=officialUiRepairProof.files;\n // These committed Release owners have newer HUD, deck, viewport or test code.\n // Authenticate their raw bytes before selecting the sealed repair inputs.\n const releaseRepairOwners={\n  'scripts/official-battle-hud.mjs':{sha256:'af6ffdb50e11d77cf9c2046931f3e455d3bc780fcde9b265fd003d33b1c07a9b',\n   gitBlob:'9956f4ded7b99023522ffc3f59b49b11b1916e85'},\n  'scripts/official-battle-pile-chrome.mjs':{sha256:'7bdc6045f843dfcc049cb9fab2a299a35f6253b08a0e61dcd93bb1cd2eb82d20',\n   gitBlob:'8c9de93f2313806ea5e9ba11ac9eb32df0a6fb50'},\n  'src/lua/abyss_battle_card_view.lua':{sha256:'a754a1c70a92ee789fa8c8266ee0ede46f22427b271ab464b85b8ce17d59e158',\n   gitBlob:'1affa0043815bb45816077e74bd723abb8a4e8ac'},\n  'src/lua/abyss_deck_ui.lua':{sha256:'1bfaa0cff56eea75e2173e90393fb76e23c8ce7a18fb336ffb394e50557df2af',\n   gitBlob:'379cf49278f2cc79c892f6109c96dc2cede98b91'},\n  'tests/runtime-ui-hotpaths.test.mjs':{sha256:'0db4dc2f24c5d58f3c04833576e6f8f050662c5558dc5d503918a8ebdfef0b3c',\n   gitBlob:'6c19ed17128fbebb4d505bcf5567eaac135b9c5a'},\n };\n function authenticateReleaseOwner(file){\n  if(!Object.hasOwn(releaseRepairOwners,file))return false;\n  const raw=rawCurrent(file),lf=raw.replaceAll('\\r\\n','\\n');\n  assert((raw===lf||raw===lf.replaceAll('\\n','\\r\\n'))&&exactSourceMatches(lf,releaseRepairOwners[file]),\n   'fresh Release repair replay owner: '+file);\n  return true;\n }\n const readRepairOwner=(file,encoding)=>{\n  if(!authenticateReleaseOwner(file))return diskReadFileSync(file,encoding);\n  return closeoutCiProof.records[files[file].current.sha256];\n };"
     },
     {
       "at": 233,
       "before": "  if(!frozen)return null;\n  const live=file===retiredControllerPath?readRetiredController(rawCurrent):null;\n  if(live)assert(live.restored,'exact pointer successor for the retired Controller');\n  const source=live?beforeCharacterPreparationSource(file,live.source,rawCurrent)\n   :beforeCurrentProductionSource(file,rawCurrent(file),rawCurrent);\n  assert.equal(source.replaceAll('\\r\\n','\\n'),frozen.source,'fresh official repair replay owner: '+file);\n  return source;\n };\n const repairRead=closeoutRead('pr629',fromNativeButtons,{readRuntime});\n for(const [file,row]of Object.entries(files)){",
       "after": "  if(!frozen)return null;\n  authenticateReleaseOwner(file);\n  // The repair predates the current runtime cohort, which is read below in its own case.\n  return frozen.source;\n };\n const repairRead=closeoutRead('pr629',readRepairOwner,{readRuntime});\n for(const [file,row]of Object.entries(files)){"
     },
     {
       "at": 304,
       "before": " assert.equal(currentSourceEpoch.preCombinedSource(file,input,{target,readSource:record}),expected);\n assert.equal(admittedReads.length,480,'complete live owner read trace');\n assert.equal(createHash('sha256').update(JSON.stringify(admittedReads)).digest('hex'),\n  'ad1c81a8f757224fa6520ca74d2a9b682f24925d2689141bc4b2eb1066d6a7fd','ordered Develop owner read trace');\n let position=-1;",
       "after": " assert.equal(currentSourceEpoch.preCombinedSource(file,input,{target,readSource:record}),expected);\n const digest=reads=>createHash('sha256').update(JSON.stringify(reads)).digest('hex');\n assert.equal(admittedReads.length,releaseArchitectureReadTrace.count,'complete live owner read trace');\n assert.equal(digest(admittedReads),releaseArchitectureReadTrace.sha256,'ordered Release owner read trace');\n const added=[[3,5],[9,11],[16,17],[18,23],[30,32],[90,91],[115,116],\n  [155,157],[221,224],[317,318],[367,370],[413,414],[479,480]];\n const original=admittedReads.filter((_,index)=>!added.some(([start,end])=>index>=start&&index<end));\n assert.equal(original.length,480);\n assert.equal(digest(original),'ad1c81a8f757224fa6520ca74d2a9b682f24925d2689141bc4b2eb1066d6a7fd','ordered Develop owner read trace');\n let position=-1;"
     }
   ]
 },
 "tests/silent-final-source-epoch.test.mjs": {
   "current": {
     "sha256": "04836e2a405797c90636725642db44ed7b3e197c43b498cdf859fd2941e7b29a",
     "gitBlob": "507d0fd36cfbea810829c2a2d9dd303da170c0fb"
   },
   "previous": {
     "sha256": "dea883654c05fd3d244dafdd16326853db282b17e63bf7288affb85ebd869314",
     "gitBlob": "a5c724ddb461951bb3b9e0bb7a8be64d2ed0db16"
   },
   "hunks": [
     {
       "at": 13,
       "before": "import {createHash} from 'node:crypto';\n// These original49-owner contracts authenticate the pre-component Silent epoch;",
       "after": "import {createHash} from 'node:crypto';\nimport {releaseArchitectureReadTrace} from './helpers/current-production-source-reads.mjs';\n// These original49-owner contracts authenticate the pre-component Silent epoch;"
     },
     {
       "at": 121,
       "before": "   assert.equal(currentEpoch.preCombinedSource(config,input,{target:'actor',readSource:live}),expected);\n   assert.equal(seen.length,480);\n   assert.equal(createHash('sha256').update(JSON.stringify(seen)).digest('hex'),\n    'ad1c81a8f757224fa6520ca74d2a9b682f24925d2689141bc4b2eb1066d6a7fd');\n   for(const owner of proof.owners)assert(seen.includes(owner),'retained Silent owner: '+owner);",
       "after": "   assert.equal(currentEpoch.preCombinedSource(config,input,{target:'actor',readSource:live}),expected);\n   const digest=reads=>createHash('sha256').update(JSON.stringify(reads)).digest('hex');\n   assert.equal(seen.length,releaseArchitectureReadTrace.count);\n   assert.equal(digest(seen),releaseArchitectureReadTrace.sha256);\n   // Release owner rereads are interleaved with the original 480 observations.\n   const added=[[3,5],[9,11],[16,17],[18,23],[30,32],[90,91],[115,116],\n    [155,157],[221,224],[317,318],[367,370],[413,414],[479,480]];\n   const original=seen.filter((_,index)=>!added.some(([start,end])=>index>=start&&index<end));\n   assert.equal(original.length,480);\n   assert.equal(digest(original),'ad1c81a8f757224fa6520ca74d2a9b682f24925d2689141bc4b2eb1066d6a7fd');\n   for(const owner of proof.owners)assert(seen.includes(owner),'retained Silent owner: '+owner);"
     }
   ]
 },
 "tests/lore-v2.test.mjs": {
  "current": {
   "sha256": "7e5fe50774f35af13df83ac4206bb7f4356f56bc7e745ce891caa0395d70248b",
   "gitBlob": "5a2da5a37f0cd4a43dc571f8d15cceeb695aac79"
  },
  "previous": {
   "sha256": "2291dec3b039b914d31e64b366fe9718913636b1095f60005becab39c1823fb8",
   "gitBlob": "f242663a52c58bf7b3583cc96158f0f6196034fa"
  },
  "hunks": [
   {
    "at": 35,
    "before": "    eventCopy:{...support.eventCopy,living_wall:livingWallCopy}});\n  for(const [path,before,after]of travelerNames){",
    "after": "    eventCopy:{...support.eventCopy,living_wall:livingWallCopy}});\n  // #951 b2f74d99 changed the runtime key without rewriting the archived prose.\n  assert.equal(typeof expected.combatIntros.cultist, 'string', 'archived Cultist introduction');\n  assert.ok(!Object.hasOwn(expected.combatIntros, 'raven_adept'), 'archived key must be unambiguous');\n  expected.combatIntros.raven_adept = expected.combatIntros.cultist;\n  delete expected.combatIntros.cultist;\n  for(const [path,before,after]of travelerNames){"
   },
   {
    "at": 115,
    "before": "  }\n});",
    "after": "  }\n  const alias = structuredClone(copy);\n  alias.combatIntros.cultist = alias.combatIntros.raven_adept;\n  assert.throws(() => assertNarrativeCopy(alias, core, support), { code: 'ERR_ASSERTION' });\n  delete alias.combatIntros.raven_adept;\n  assert.throws(() => assertNarrativeCopy(alias, core, support), { code: 'ERR_ASSERTION' });\n  const migratedArchive = structuredClone(support);\n  migratedArchive.combatIntros.raven_adept = migratedArchive.combatIntros.cultist;\n  delete migratedArchive.combatIntros.cultist;\n  assert.throws(() => assertNarrativeCopy(copy, core, migratedArchive), /archived Cultist introduction/);\n});"
   }
  ]
 },
 "tests/pure-source-projection-cache.test.mjs": {
   "current": {
     "sha256": "cc16f5cf88410959e9f5f3115fb3581c770023effb7a65bd77012eb00da68944",
     "gitBlob": "fa7825e62efe0af39d73c913f4e913b15c50ddde"
   },
   "previous": {
     "sha256": "675787f6a8d65ceec7c244471b13d244e3f959df978c277667d85dea69588c04",
     "gitBlob": "985518841dfc5e2aace89985e77324d8061388b3"
   },
   "hunks": [
     {
       "at": 3,
       "before": "import {readFileSync} from 'node:fs';\nimport {createHash} from 'node:crypto';",
       "after": "import {readFileSync} from 'node:fs';\nimport {reviewedRenamedStsStyleRead} from './helpers/reviewed-selection-current-source.mjs';\nimport {createHash} from 'node:crypto';"
     },
     {
       "at": 17,
       "before": "import {addedEntranceModules} from './helpers/ui-entrance-source.mjs';\nconst hash=source=>createHash('sha256').update(source).digest('hex');",
       "after": "import {addedEntranceModules} from './helpers/ui-entrance-source.mjs';\nimport {beforeCurrentReplayFixes} from './helpers/current-replay-fix-sources.mjs';\nimport {beforeKnownMasterBackflowSource} from './helpers/master-backflow-source.mjs';\nimport {beforeChapterBattleScene} from './helpers/chapter-battle-scene-source.mjs';\nconst hash=source=>createHash('sha256').update(source).digest('hex');"
     },
     {
       "at": 98,
       "before": " const paths=[...Object.keys(sourceEpoch.proof.current),...added].filter(p=>p!==retiredControllerPath);\n const current=Object.fromEntries(paths.map(p=>[p,live(p)]));\n const owners=[...new Set([...sourceEpoch.proof.owners,...added])];",
       "after": " const paths=[...Object.keys(sourceEpoch.proof.current),...added].filter(p=>p!==retiredControllerPath);\n const replayInput=reviewedRenamedStsStyleRead(live);\n const current=Object.fromEntries(paths.map(p=>[p,replayInput(p)]));\n const owners=[...new Set([...sourceEpoch.proof.owners,...added])];"
     },
     {
       "at": 141,
       "before": "\ntest('exact production length rejection preserves full byte checks and fresh owner admission',async()=>{\n const {beforeCurrentReplayFixes}=await import('./helpers/current-replay-fix-sources.mjs');\n const {authenticateUiEntrance}=await import('./helpers/ui-entrance-source.mjs');",
       "after": "\nconst replayCurrentEntranceSource=(path,source)=>\n beforeCurrentReplayFixes(path,beforeChapterBattleScene(path,beforeKnownMasterBackflowSource(path,source)));\nfunction assertCurrentEntranceReads(reads){\n assert.equal(reads.length,32);\n assert.equal(hash(JSON.stringify(reads)),'2d497af031c556a9bb98696393e95f63dce03b9d43d5229926bd3a0af159d2ba');\n // Preserve all 20 original observations, with the linked portrait and Prologue rereads interleaved.\n const additionalReads=new Set([3,4,9,10,16,18,19,20,21,22,30,31]);\n const originalReads=reads.filter((_,index)=>!additionalReads.has(index));\n assert.equal(hash(JSON.stringify(originalReads)),'8752e6ec0e000516387d48cf7a098cf5ffeba61d3db3b17d6d8af78c0396b35c');\n}\n\ntest('exact production length rejection preserves full byte checks and fresh owner admission',async()=>{\n const {authenticateUiEntrance}=await import('./helpers/ui-entrance-source.mjs');"
     },
     {
       "at": 162,
       "before": "  const source=readFileSync(path,'utf8').replaceAll('\\r\\n','\\n');\n  const prior=beforeCurrentReplayFixes(path,source);assert.notEqual(prior,source);assert.equal(hash(prior),expected);\n  const crlf=source.replaceAll('\\n','\\r\\n');\n  assert.equal(beforeCurrentReplayFixes(path,crlf),prior.replaceAll('\\n','\\r\\n'));\n  const sameLength=source.slice(0,-1)+'!';assert.equal(sameLength.length,source.length);\n  for(const unknown of [source.slice(1),source+'\\n',sameLength,source.replaceAll('\\n','\\r\\r\\n')])\n   assert.equal(beforeCurrentReplayFixes(path,unknown),unknown,'unknown complete bytes cannot project');\n  const bytes=Buffer.from(source);assert.equal(beforeCurrentReplayFixes(path,bytes),bytes,'Buffer inputs remain outside this string-only inverse');\n  assert.equal(beforeCurrentReplayFixes('foreign/'+path,source),source,'path remains part of the exact identity');\n  assert.equal(beforeCurrentReplayFixes(path,source),prior,'unknown inputs do not alter the exact projection');\n }",
       "after": "  const source=readFileSync(path,'utf8').replaceAll('\\r\\n','\\n');\n  const prior=replayCurrentEntranceSource(path,source);assert.notEqual(prior,source);assert.equal(hash(prior),expected);\n  const crlf=source.replaceAll('\\n','\\r\\n');\n  assert.equal(replayCurrentEntranceSource(path,crlf),prior.replaceAll('\\n','\\r\\n'));\n  const sameLength=source.slice(0,-1)+'!';assert.equal(sameLength.length,source.length);\n  for(const unknown of [source.slice(1),source+'\\n',sameLength,source.replaceAll('\\n','\\r\\r\\n')])\n   assert.equal(replayCurrentEntranceSource(path,unknown),unknown,'unknown complete bytes cannot project');\n  const bytes=Buffer.from(source);assert.equal(beforeCurrentReplayFixes(path,bytes),bytes,'Buffer inputs remain outside this string-only inverse');\n  assert.equal(replayCurrentEntranceSource('foreign/'+path,source),source,'path remains part of the exact identity');\n  assert.equal(replayCurrentEntranceSource(path,source),prior,'unknown inputs do not alter the exact projection');\n }"
     },
     {
       "at": 174,
       "before": " const read=path=>{reads.push(path);const source=readFileSync(path,'utf8');return path===bad?source.replaceAll('\\r\\n','\\n').slice(0,-1)+'!':source;};\n authenticateUiEntrance(read);const first=[...reads];assert.equal(first.length,20);\n reads=[];authenticateUiEntrance(read);assert.deepEqual(reads,first,'warm calls retain every linked read');",
       "after": " const read=path=>{reads.push(path);const source=readFileSync(path,'utf8');return path===bad?source.replaceAll('\\r\\n','\\n').slice(0,-1)+'!':source;};\n authenticateUiEntrance(read);const first=[...reads];assertCurrentEntranceReads(first);\n reads=[];authenticateUiEntrance(read);assert.deepEqual(reads,first,'warm calls retain every linked read');"
     },
     {
       "at": 184,
       "before": "test('current view successor requires fresh raw owner bytes before historical projection',async()=>{\n const {beforeCurrentReplayFixes}=await import('./helpers/current-replay-fix-sources.mjs');\n const {authenticateUiEntrance,beforeUiEntrance}=await import('./helpers/ui-entrance-source.mjs');\n const path='src/lua/abyss_game_ui_view.lua',source=readFileSync(path,'utf8').replaceAll('\\r\\n','\\n');\n const prior=beforeCurrentReplayFixes(path,source);\n assert.notEqual(prior,source);assert.equal(hash(prior),'84d9fb22584a5978d5c04170f3b3b145c26ff71865acf53b36b2496f01489ed1');",
       "after": "test('current view successor requires fresh raw owner bytes before historical projection',async()=>{\n const {authenticateUiEntrance,beforeUiEntrance}=await import('./helpers/ui-entrance-source.mjs');\n const path='src/lua/abyss_game_ui_view.lua',source=readFileSync(path,'utf8').replaceAll('\\r\\n','\\n');\n const prior=replayCurrentEntranceSource(path,source);\n assert.notEqual(prior,source);assert.equal(hash(prior),'84d9fb22584a5978d5c04170f3b3b145c26ff71865acf53b36b2496f01489ed1');"
     },
     {
       "at": 195,
       "before": " const read=p=>{reads.push(p);return p===path&&bad!==undefined?bad:readFileSync(p,'utf8');};\n authenticateUiEntrance(read);const first=[...reads];assert.equal(first.length,20);\n reads=[];authenticateUiEntrance(read);assert.deepEqual(reads,first);",
       "after": " const read=p=>{reads.push(p);return p===path&&bad!==undefined?bad:readFileSync(p,'utf8');};\n authenticateUiEntrance(read);const first=[...reads];assertCurrentEntranceReads(first);\n reads=[];authenticateUiEntrance(read);assert.deepEqual(reads,first);"
     },
     {
       "at": 202,
       "before": " const crlf=source.replaceAll('\\n','\\r\\n');\n assert.equal(beforeCurrentReplayFixes(path,crlf),prior.replaceAll('\\n','\\r\\n'));\n authenticateUiEntrance(p=>p===path?crlf:readFileSync(p,'utf8'));\n for(const drift of [source+'\\n',source.replaceAll('\\n','\\r\\r\\n')])assert.equal(beforeCurrentReplayFixes(path,drift),drift);\n});",
       "after": " const crlf=source.replaceAll('\\n','\\r\\n');\n assert.equal(replayCurrentEntranceSource(path,crlf),prior.replaceAll('\\n','\\r\\n'));\n authenticateUiEntrance(p=>p===path?crlf:readFileSync(p,'utf8'));\n for(const drift of [source+'\\n',source.replaceAll('\\n','\\r\\r\\n')])assert.equal(replayCurrentEntranceSource(path,drift),drift);\n});"
     }
   ]
 },
 "tests/round3-catalog-source-inverse.test.mjs": {
  "current": {
   "sha256": "494eb862189a110755b2167dabe594f754f17b2d7e2197e0a97483c2aa57f720",
   "gitBlob": "904b37457efecb0debe87e989e7bb9a99a1b076c"
  },
  "previous": {
   "sha256": "9a611b2e46643cfbb6032dccac3b4b272feb9ddbe67569dbfc0e449d889aaa5f",
   "gitBlob": "012e333482eb8cc6d1d8119753a2b4b2b94599f3"
  },
  "hunks": [
   {
    "at": 5,
    "before": "import {readFileSync,mkdtempSync,mkdirSync,writeFileSync,existsSync,rmSync,symlinkSync,renameSync} from 'node:fs';",
    "after": "import {readFileSync,mkdtempSync,mkdirSync,writeFileSync,existsSync,rmSync,symlinkSync,renameSync} from 'node:fs';\nimport {reviewedRenamedStsStyleRead} from './helpers/reviewed-selection-current-source.mjs';"
   },
   {
    "at": 139,
    "before": " const current=Object.fromEntries(paths.map(path=>[path,readLive(path)]));",
    "after": " const replayInput=reviewedRenamedStsStyleRead(readLive);\n const current=Object.fromEntries(paths.map(path=>[path,replayInput(path)]));"
   }
  ]
 },
 "tests/colorless-catalog-source.test.mjs": {
  "current": {
   "sha256": "da577b404aeca08d7ee98580da6186204589a1c429b71e7b4ef945f874555d17",
   "gitBlob": "6c1da94453ea96f4513d0a785758e445d0614185"
  },
  "previous": {
   "sha256": "1f2fc5bff24370b718aee29cdd4ef744f1096f7a2088a7691b401c7de86ebe50",
   "gitBlob": "ad97516e45aa9e76b2f71a0f9882a5535e020849"
  },
  "hunks": [
   {
    "at": 76,
    "before": " const directory=mkdtempSync(join(tmpdir(),'colorless-retirement-')),target=join(directory,leaf);\n try{\n  mkdirSync(join(directory,'src/lua'),{recursive:true});writeFileSync(target,read(leaf));\n  const cleanup=retire(directory);assert(existsSync(target));writeFileSync(target,read(leaf)+'\\n');assert.throws(cleanup,/unreviewed/);assert(existsSync(target));\n  writeFileSync(target,read(leaf));retire(directory)();assert(!existsSync(target));assert(existsSync(leaf));\n  try{symlinkSync(join(process.cwd(),leaf),target);}catch(error){if(['EPERM','EACCES','ENOTSUP'].includes(error.code)){t.skip('file symlink unavailable: '+error.code);return;}throw error;}\n  assert.throws(()=>retire(directory),/aliases live source/);assert(existsSync(leaf));",
    "after": " const directory=mkdtempSync(join(tmpdir(),'colorless-retirement-')),target=join(directory,leaf);\n try{\n  const historicalLeaf=historicalRead(leaf);\n  mkdirSync(join(directory,'src/lua'),{recursive:true});writeFileSync(target,historicalLeaf);\n  const cleanup=retire(directory);assert(existsSync(target));writeFileSync(target,historicalLeaf+'\\n');assert.throws(cleanup,/unreviewed/);assert(existsSync(target));\n  writeFileSync(target,historicalLeaf);retire(directory)();assert(!existsSync(target));assert(existsSync(leaf));\n  try{symlinkSync(join(process.cwd(),leaf),target);}catch(error){if(['EPERM','EACCES','ENOTSUP'].includes(error.code)){t.skip('file symlink unavailable: '+error.code);return;}throw error;}\n  assert.throws(()=>retire(directory),/aliases live source/);assert(existsSync(leaf));"
   }
  ]
 },
 "tests/effects-target-group.test.mjs": {
  "current": {
   "sha256": "87d3e6492f57997a968c226a1c0cee7a1da8e7e5c1c1235b0321832241f463a8",
   "gitBlob": "277ff86e5ff5eec7abdc0858651f2539ac2748ee"
  },
  "previous": {
   "sha256": "b3db9b0c634f130e9ff0bca3693b31725b985bec56c718c09657c5bba035e08e",
   "gitBlob": "7b4773f37c4c7258bea5533326c347d8388b44ca"
  },
  "hunks": [
   {
    "at": 20,
    "before": " assert.equal(before.path,file);assert.equal(hash(before.source),before.sha256);\n assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(before.source)}\\0`).update(before.source).digest('hex'),before.gitBlob);\n const [a,b]=span(before.source),[c,d]=span(source);\n assert.equal(source.slice(0,c),before.source.slice(0,a));\n const queueItems=source.indexOf('-- Queue preparation can split ordinary effects.',d);\n const requiresQueue=source.indexOf('function M.requiresQueue(effects)',queueItems);",
    "after": " assert.equal(before.path,file);assert.equal(hash(before.source),before.sha256);\n assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(before.source)}\\0`).update(before.source).digest('hex'),before.gitBlob);\n // #951 renamed these two production actions after the original comparison.\n assert.equal(source.match(/\\bcalculatedExchange\\b/g)?.length,2);\n assert.equal(source.match(/\\bdaggerExpenditure\\b/g)?.length,2);\n const historicalNames=text=>text.replace(/\\bcalculatedExchange\\b/g,'calculatedGamble')\n  .replace(/\\bdaggerExpenditure\\b/g,'daggerSacrifice');\n const [a,b]=span(before.source),[c,d]=span(source);\n assert.equal(historicalNames(source.slice(0,c)),before.source.slice(0,a));\n const queueItems=source.indexOf('-- Queue preparation can split ordinary effects.',d);\n const requiresQueue=source.indexOf('function M.requiresQueue(effects)',queueItems);"
   },
   {
    "at": 33,
    "before": " assert.deepEqual(extension.body.map(n=>[n.type,n.identifier?.base?.name,n.identifier?.identifier?.name]),\n  [['FunctionDeclaration','M','queueItems']]);\n assert.equal(source.slice(d,queueItems)+source.slice(requiresQueue),before.source.slice(b));\n const ast=luaparse.parse(source.slice(c,d),{luaVersion:'5.3'});\n assert.deepEqual(ast.body.map(n=>n.identifier.name),names);assert(ast.body.every(n=>n.isLocal));",
    "after": " assert.deepEqual(extension.body.map(n=>[n.type,n.identifier?.base?.name,n.identifier?.identifier?.name]),\n  [['FunctionDeclaration','M','queueItems']]);\n assert.equal(historicalNames(source.slice(d,queueItems)+source.slice(requiresQueue)),before.source.slice(b));\n const ast=luaparse.parse(source.slice(c,d),{luaVersion:'5.3'});\n assert.deepEqual(ast.body.map(n=>n.identifier.name),names);assert(ast.body.every(n=>n.isLocal));"
   }
  ]
 },
 "tests/build-ui-input-protection.test.mjs": {
  "current": {
   "sha256": "2fda21ffb5f97cbe443583982cb80982e65e6d1feed295d2643f065197ef0cf8",
   "gitBlob": "07f3d2518f8bae7aad4822838bf4dda7334337ab"
  },
  "previous": {
   "sha256": "acbeaea9178374dd3d90ac52fa216921ba80d9dccf5153d5d5ccda8195ae741a",
   "gitBlob": "8b45d4c01b0a126acafb56fb47954ae151416398"
  },
  "hunks": [
   {
    "at": 13,
    "before": "  'presentation/native-monster-art.json', 'presentation/ui_theme.json', 'presentation/traveler.zh-CN.json', 'presentation/narrative.zh-CN.json'];\nconst outputs = ['abyss_theme.lua', 'map-ui.json', 'abyss_map_layout.lua', 'abyss_map_controls.lua',\n  'abyss_narrative.lua', 'abyss_presentation.lua', 'battle-ui.json', 'game-ui.json', 'abyss_ui_layout.lua',",
    "after": "  'presentation/native-monster-art.json', 'presentation/ui_theme.json', 'presentation/traveler.zh-CN.json', 'presentation/narrative.zh-CN.json'];\nconst outputs = ['abyss_theme.lua', 'abyss_chapter_battle_scene_data.lua', 'map-ui.json', 'abyss_map_layout.lua', 'abyss_map_controls.lua',\n  'abyss_narrative.lua', 'abyss_presentation.lua', 'battle-ui.json', 'game-ui.json', 'abyss_ui_layout.lua',"
   },
   {
    "at": 17,
    "before": "  'abyss_ready_card_binding.lua','abyss_ready_card_assets.lua','abyss_traveler_portrait_assets.lua','abyss_monster_art_data.lua','abyss_art_features.lua','abyss_monster_actor_binding.lua',\n  'abyss_component_binding.lua','abyss_deck_browser_binding.lua','abyss_v25_card_assets.lua','art-render-v2.json'];\n// Every fixture gets a fresh copy of the same validated repository inputs.",
    "after": "  'abyss_ready_card_binding.lua','abyss_ready_card_assets.lua','abyss_traveler_portrait_assets.lua','abyss_monster_art_data.lua','abyss_art_features.lua','abyss_monster_actor_binding.lua',\n  'abyss_component_binding.lua','abyss_v25_card_assets.lua','art-render-v2.json'];\n// Every fixture gets a fresh copy of the same validated repository inputs."
   }
  ]
 },
 "tests/lua/full_source_campaign_entry.lua": {
  "current": {
   "sha256": "3c035a17c7e3e6beb91d33c8240c7116ca392fb511546d1165e2228bfcfc1709",
   "gitBlob": "f486b0f7484cf8c71979b2ee6bf1da962ae68814"
  },
  "previous": {
   "sha256": "6eb5e8016625dd7d3586d81872814c5d28021371e2d9c4ce78f4741a5f9ea3b3",
   "gitBlob": "7d9f18b6c5c63d4cf18593f7811fab0334b2d769"
  },
  "hunks": [
   {
    "at": 5,
    "before": "local Map,Run=require('abyss_map'),require('abyss_run')\nlocal function awaitNativePage(host)\n    for _=1,80 do\n        if not host.starting and not(host.prologue and host.prologue:covering())",
    "after": "local Map,Run=require('abyss_map'),require('abyss_run')\nlocal function awaitNativePage(host,maxTicks)\n    for _=1,maxTicks or 80 do\n        if not host.starting and not(host.prologue and host.prologue:covering())"
   },
   {
    "at": 85,
    "before": "    assert(accepted and state=='selection_pending' and host.mode=='map' and host.run.phase=='map')\n    awaitNativePage(host)\n    assert(host.map.currentNodeId==nextNode.id and host.mode=='battle' and host.run.phase=='combat')",
    "after": "    assert(accepted and state=='selection_pending' and host.mode=='map' and host.run.phase=='map')\n    -- Match the formal campaign fixture's budget for the Guardian narration and fades.\n    local guardianEntry=host.run.act==1 and nextNode.type=='boss'\n    awaitNativePage(host,guardianEntry and 140 or nil)\n    assert(host.map.currentNodeId==nextNode.id and host.mode=='battle' and host.run.phase=='combat')"
   }
  ]
 },
 "tests/pr259-fixture-budget.test.mjs": {
  "current": {
   "sha256": "331d476e181da95c13a62640c2d47fd35540664d3295e7a86a519c3e14da3bff",
   "gitBlob": "21ce6350ba113814d3a7d3660ec42a639ada7415"
  },
  "previous": {
   "sha256": "f7abc7f0803d3f6a98568f22a8bb7c2758a7bf96290c18ec3982ccca0987ea75",
   "gitBlob": "abaa76880ba51ac1cfd0510ef114fcc87a47c894"
  },
  "hunks": [
   {
    "at": 29,
    "before": "  .replace(\"assert(F.changedRewardActions(false,selected)==5,'five original held changes per slice')\",'F.changedRewardActions(false)')),frozen.held);\n const helper=read(lua+'support/looter_potion_ui_fixture.lua');assert.equal(sha(restoreHelper(helper)),frozen.helper);\n const original=read(lua+rollback[0]);assert.ok(original.includes(rollbackHeader));assert.equal(sha(restoreRollback(original)),frozen.rollback);\n const releasedSource=read(lua+released[0]);",
    "after": "  .replace(\"assert(F.changedRewardActions(false,selected)==5,'five original held changes per slice')\",'F.changedRewardActions(false)')),frozen.held);\n const liveHelper=read(lua+'support/looter_potion_ui_fixture.lua');\n const currentEncounter=\" assert(Run.startCombat(h.run,'raven_adept_solo'))\\n\";\n const priorEncounter=\" assert(Run.startCombat(h.run,'cultist_solo'))\\n\";\n assert.equal(liveHelper.split(currentEncounter).length,2,'one current seed-42 encounter binding');\n const helper=liveHelper.replace(currentEncounter,priorEncounter);\n assert.equal(sha(restoreHelper(helper)),frozen.helper);\n const liveRollback=read(lua+rollback[0]);\n const currentComment=\"-- the source Raven Adept's52 HP, energy costs and random streams are unchanged.\";\n const priorComment=\"-- the source Cultist's52 HP, energy costs and random streams are unchanged.\";\n assert.equal(liveRollback.split(currentComment).length,2,'one reviewed encounter comment');\n const original=liveRollback.replace(currentComment,priorComment);\n assert.ok(original.includes(rollbackHeader));assert.equal(sha(restoreRollback(original)),frozen.rollback);\n const releasedSource=read(lua+released[0]);"
   }
  ]
 },
 "tests/toxic-egg-source.test.mjs": {
  "current": {
   "sha256": "dcb4d18fc3a6186812ee7dbe5cbd3ee1f1da5bb0dbdd7db0cb61cda2ecae3005",
   "gitBlob": "012308fc57639e9e731a9251ec6f00c9c347f2ed"
  },
  "previous": {
   "sha256": "e5f9064c2cc01e3e02cf51b223a0b203ee67470af20a2fb50794f31ccfe1b6e8",
   "gitBlob": "d0476b47466e166102ab7f036e483d6b3fb3be0e"
  },
  "hunks": [
   {
    "at": 3,
    "before": "import {requireRelicCompletionSource,preRelicCompletionSource} from './helpers/relic-completion-inverse.mjs';\nimport {closeoutRead} from './helpers/closeout-ci-source.mjs';\nconst read=path=>JSON.parse(readFileSync(path,'utf8'));",
    "after": "import {requireRelicCompletionSource,preRelicCompletionSource} from './helpers/relic-completion-inverse.mjs';\nimport {withHistoricalBaseline} from './helpers/historical-baseline-inputs.mjs';\nconst read=path=>JSON.parse(readFileSync(path,'utf8'));"
   },
   {
    "at": 36,
    "before": " // historical boundary without applying it to today's complete production pool.\n const current=closeoutRead('pr620')('data/relics.json','utf8');\n requireRelicCompletionSource('data/relics.json',current);\n const historical=JSON.parse(preRelicCompletionSource('data/relics.json',current));\n for(const id of ['question_card','busted_crown','singing_bowl'])assert.ok(!historical.relics.some(r=>r.id===id));",
    "after": " // historical boundary without applying it to today's complete production pool.\n const historical=withHistoricalBaseline(()=>{\n  const path='data/relics.json',source=readFileSync(path,'utf8');\n  requireRelicCompletionSource(path,source);\n  return JSON.parse(preRelicCompletionSource(path,source));\n });\n for(const id of ['question_card','busted_crown','singing_bowl'])assert.ok(!historical.relics.some(r=>r.id===id));"
   }
  ]
 },
 "tests/gil-candidate.test.mjs": {
  "current": {
   "sha256": "d5ec827fa24b3ad3ff33b304723efddc4205599dbc8e8c28141aa3d22d99c1c6",
   "gitBlob": "0e38620640049ad1f0e0a7a8a4c9a82b1f0a629b"
  },
  "previous": {
   "sha256": "430a5a3396c4318c91e8bcf2c9a0cf74e1b03a52edf817bfd9a5aaafc15a6588",
   "gitBlob": "8c2d8cbfeb2fb8f2c495a955965bfa989db1090e"
  },
  "hunks": [
   {
    "at": 1,
    "before": "import { spawnSync } from 'node:child_process';\nimport { createHash } from 'node:crypto';\nimport { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';\nimport { tmpdir } from 'node:os';\nimport { join } from 'node:path';\nimport { test } from 'node:test';\nimport { verifyDownloadedArtifact, verifyReceipts } from '../scripts/gil-candidate.mjs';\nimport { api, approvedRequest, candidateTarget, encoderSha256, findArtifact, verifySource } from '../scripts/gil-candidate-preflight.mjs';\nimport { fileRecord } from '../scripts/evidence-files.mjs';\nimport { hostedCandidatePath, verifiedPayloadInputs } from '../scripts/hosted-gil-receipt.mjs';\n\nconst sourceSha = '1'.repeat(40);",
    "after": "import { spawnSync } from 'node:child_process';\nimport { createHash } from 'node:crypto';\nimport { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';\nimport { tmpdir } from 'node:os';\nimport { join } from 'node:path';\nimport { test } from 'node:test';\nimport { verifyDownloadedArtifact, verifyPublishedRebase, verifyReceipts } from '../scripts/gil-candidate.mjs';\nimport { api, approvedRequest, buildOnlyRequest, candidateTarget, encoderSha256, findArtifact, validationTarget, verifySource } from '../scripts/gil-candidate-preflight.mjs';\nimport { fileRecord } from '../scripts/evidence-files.mjs';\nimport { hostedCandidatePath, verifiedPayloadInputs } from '../scripts/hosted-gil-receipt.mjs';\nimport { downloadLegacyGilArchive, legacyGilArchive, supportsPublishedGilSeed } from '../scripts/runtime-baseline/published-baseline.mjs';\n\nconst sourceSha = '1'.repeat(40);"
   },
   {
    "at": 167,
    "before": "});\n\ntest('reject missing protected base URL before downloads', () => {\n  const result = spawnSync(process.execPath, ['scripts/gil-candidate.mjs', 'base'], {",
    "after": "});\n\ntest('automatic build pushes are scoped to primary develop and the diagnostic branch in the known fork', () => {\n  const workflow = readFileSync(new URL('../.github/workflows/gil-build.yml', import.meta.url), 'utf8').replaceAll('\\r\\n', '\\n');\n  const fork = '1460133275';\n  const testRef = 'refs/heads/ci/full/gil-build/v2.2.0-closure-20261127';\n  assert.deepEqual(validationTarget('1429751262', 'refs/heads/develop', sourceSha), { branch: 'develop' });\n  assert.deepEqual(validationTarget(fork, testRef, sourceSha), { branch: testRef.slice(11) });\n  assert.throws(() => validationTarget(fork, 'refs/heads/develop', sourceSha), /assigned Fork B/);\n  assert.throws(() => validationTarget('1429751262', testRef, sourceSha), /assigned Fork B/);\n  assert.throws(() => validationTarget('3', testRef, sourceSha), /assigned Fork B/);\n  assert.match(workflow, /push:\\n    branches: \\[develop, 'ci\\/full\\/gil-build\\/\\*\\*'\\]/);\n  assert.match(workflow, /PUBLISH_ARTIFACT: 'false'/);\n  assert.match(workflow, /path: source\\/build\\/gil-artifact\\/manifest\\.json\\n/);\n  assert.doesNotMatch(workflow, /secrets\\.|environment:/);\n  const buildSteps = workflow.slice(workflow.indexOf('      - name: Fetch and verify the published project GIL'));\n  assert.equal(buildSteps.match(/^      - (?:name|uses):/gm)?.length, 9);\n  assert.equal(buildSteps.match(/^        if: steps\\.candidate\\.outputs\\.build == 'true'$/gm)?.length, 9);\n  const archive = readFileSync(new URL('../.github/workflows/gil-candidate.yml', import.meta.url), 'utf8');\n  const usedActions = [...workflow.matchAll(/^\\s*- uses: (actions\\/[a-z-]+@[0-9a-f]+)\\b/gm)];\n  assert.equal(usedActions.length, 6);\n  for (const [, action] of usedActions) assert(archive.includes(`uses: ${action} `), `Build action must use the archive pin: ${action}`);\n});\n\ntest('unattended build selects the pinned public source and a local metadata key', () => {\n  const target = validationTarget('1429751262', 'refs/heads/develop', sourceSha);\n  const policy = { controllerSha: sourceSha };\n  const approval = { sourceSha, sourceBranch: 'develop', baseSha256: legacyGilArchive.sha256, workKey,\n    reference: 'owner/42', baseProcessingApproved: true, publicArtifactApproved: true };\n  const build = buildOnlyRequest(sourceSha, policy, target);\n  assert.equal(build.archive, false);\n  assert.equal(build.baseSha256, legacyGilArchive.sha256);\n  assert.equal(build.configuration.releaseCandidate, false);\n  assert.equal(build.configuration.workKey, 'offline-candidate');\n  assert.throws(() => approvedRequest(JSON.stringify({ ...approval, workKey: build.configuration.workKey }), sourceSha, policy), /Approval must cover/);\n  assert.notEqual(build.id, approvedRequest(JSON.stringify(approval), sourceSha, policy).id);\n});\n\ntest('the published GIL seed permits only strictly newer source versions', () => {\n  for (const version of ['2.0.0', '2.1.0', '2.1.1']) assert.equal(supportsPublishedGilSeed(version), false);\n  for (const version of ['2.1.2', '2.2.0', '3.0.0']) assert.equal(supportsPublishedGilSeed(version), true);\n  assert.throws(() => supportsPublishedGilSeed('2.2.0-preview'), /Engineering SemVer/);\n});\n\ntest('the published archive download validates the exact pointer and bounds transfer retries', async t => {\n  const dir = mkdtempSync(join(tmpdir(), 'gil-published-download-'));\n  t.after(() => rmSync(dir, { recursive: true, force: true }));\n  const output = join(dir, 'base.gil');\n  const { path, archiveCommit, bytes, sha256 } = legacyGilArchive;\n  const pointer = `version https://git-lfs.github.com/spec/v1\\noid sha256:${sha256}\\nsize ${bytes}\\n`;\n  const request = (content = pointer) => async uri => {\n    assert.equal(uri, `/repos/FurinyaWorks/Slay-the-Heavens/contents/${path}?ref=${archiveCommit}`);\n    return { type: 'file', path, size: bytes, encoding: 'base64', content: Buffer.from(content).toString('base64') };\n  };\n  await assert.rejects(downloadLegacyGilArchive(output, request(pointer.replace(sha256, '0'.repeat(64))),\n    () => assert.fail('downloaded from an unverified pointer')), /pointer differs/);\n  let calls = 0;\n  await assert.rejects(downloadLegacyGilArchive(output, request(), async (url, options) => {\n    assert.equal(url, `https://media.githubusercontent.com/media/FurinyaWorks/Slay-the-Heavens/${archiveCommit}/${path}`);\n    assert.equal(options.redirect, 'error');\n    calls++;\n    throw Error('fixture network failure');\n  }), /after two attempts/);\n  assert.equal(calls, 2);\n  await assert.rejects(downloadLegacyGilArchive(output, request(), async () => new Response('truncated')),\n    /differs from the pinned size/);\n  assert.equal(existsSync(output), false);\n});\n\ntest('a published seed rebuild can only change UI and signals, graph, and Lua sections', () => {\n  const raw = (id, value) => ({ id, wire: 0, raw: Buffer.from([value]) });\n  const base = Buffer.alloc(24);\n  const final = Buffer.alloc(24, 0);\n  const input = [raw(4, 1), raw(9, 2), raw(10, 3), raw(50, 4)];\n  let output = [raw(4, 1), raw(9, 5), raw(10, 6), raw(50, 7)];\n  const wire = { container: bytes => bytes === base ? input : output, fields: rows => rows };\n  assert.deepEqual(verifyPublishedRebase(base, final, wire), [9, 10, 50]);\n  output[0] = raw(4, 8);\n  assert.throws(() => verifyPublishedRebase(base, final, wire), /scene data changed in section 4/);\n  output = [raw(9, 5), raw(4, 1), raw(10, 6), raw(50, 7)];\n  assert.throws(() => verifyPublishedRebase(base, final, wire), /section layout changed/);\n  final[4] = 1;\n  assert.throws(() => verifyPublishedRebase(base, final, wire), /container structure changed/);\n});\n\ntest('reject missing protected base URL before downloads', () => {\n  const result = spawnSync(process.execPath, ['scripts/gil-candidate.mjs', 'base'], {"
   }
  ]
 },
 "tests/helpers/boss_source_fixture.lua": {
  "current": {
   "sha256": "5a8ceb27bad90905ba9187fb1c58bac9bd4078a42170272e5b619180cbbdfa65",
   "gitBlob": "abcdb951344ec216be0f7be1ef4c82b79973840c"
  },
  "previous": {
   "sha256": "6f35551709233fb30c9c80ca9e8819397e0c8fe9b975c632a11e7cbdc08b2ebf",
   "gitBlob": "5e786116d86cf3a26886a65de2eecbd20cc00965"
  },
  "hunks": [
   {
    "at": 16,
    "before": "end\nfunction M.supportedChoices(run)\n M.stageQueue(run,{'Black Blood','SlaversCollar','Sozu'})\nend\nfunction M.definition(run,id)",
    "after": "end\nfunction M.supportedChoices(run)\n M.stageQueue(run,{'Black Blood','ArenaCollar','Sozu'})\nend\nfunction M.definition(run,id)"
   }
  ]
 },
 "tests/helpers/effects-target-group-scenarios.lua": {
  "current": {
   "sha256": "94727fdf40da7c736dc5b3728d93c6f6a7725efd19eba0d2a82ebb93f93be6af",
   "gitBlob": "0cec5b9e45de8322ce5ebe11533f0706545a1e0b"
  },
  "previous": {
   "sha256": "472d7477b74e25d5a7f24e2849bb1c15d951963c0a57fa16cc56331dc965441b",
   "gitBlob": "ce3458a30367360f397ae23120c029b35090e31e"
  },
  "hunks": [
   {
    "at": 10,
    "before": "  local combat={outcome=function() trace[#trace+1]='outcome';return nil end}\n  if entry=='apply' and (label=='valid' or label=='unmarked-partial') then\n   combat=require('abyss_combat');state=combat.new(require('abyss_data'),{seed=42,deck={'strike'},enemies={'cultist','cultist'}})\n  end\n  local f=entry=='private' and GROUP_TARGET or entry=='supported' and GROUP_EFFECTS.supported or function(v)",
    "after": "  local combat={outcome=function() trace[#trace+1]='outcome';return nil end}\n  if entry=='apply' and (label=='valid' or label=='unmarked-partial') then\n   combat=require('abyss_combat');state=combat.new(require('abyss_data'),{seed=42,deck={'strike'},enemies={'raven_adept','raven_adept'}})\n  end\n  local f=entry=='private' and GROUP_TARGET or entry=='supported' and GROUP_EFFECTS.supported or function(v)"
   }
  ]
 },
 "tests/intent-visibility-cache.test.mjs": {
  "current": {
   "sha256": "f06867480117cd768d2eb072af89f3e2faaabfdc395023eab053fa7b08b2cbf1",
   "gitBlob": "acf7d9073e4ec212c498933ed668debc75d2b67a"
  },
  "previous": {
   "sha256": "d736e6e7ed0fd83805dd5e95a782a5bcd48cfdc4bea20ef0034fa2e97194cb53",
   "gitBlob": "18528ea21b274bf466fdb7b54779b3eb3080c05d"
  },
  "hunks": [
   {
    "at": 14,
    "before": " ['rejected write','accepted~=false and ownsWrite then intentVisibilities','ownsWrite then intentVisibilities','rejected visibility write cached'],\n ['overlap','accepted~=false and ownsWrite then intentVisibilities','accepted~=false then intentVisibilities','overlapping visibility cached'],\n ['escape post-clear','local ok,why=pcall(control.SetVisible,control,false)\\n            intentVisibilities[control]=nil','local ok,why=pcall(control.SetVisible,control,false)','escape writer retained nested visibility promise'],\n ['no cache','saved and saved.binding','false and saved and saved.binding','unchanged visibility resubmitted'],\n])for(const [format,newline] of [['LF','\\n'],['CRLF','\\r\\n']])test(`visibility negative control (${format}): ${name}`,()=>{",
    "after": " ['rejected write','accepted~=false and ownsWrite then intentVisibilities','ownsWrite then intentVisibilities','rejected visibility write cached'],\n ['overlap','accepted~=false and ownsWrite then intentVisibilities','accepted~=false then intentVisibilities','overlapping visibility cached'],\n ['escape post-clear','local ok,why=pcall(control.SetVisible,control,false)\\n        intentVisibilities[control]=nil','local ok,why=pcall(control.SetVisible,control,false)','escape writer retained nested visibility promise'],\n ['no cache','saved and saved.binding','false and saved and saved.binding','unchanged visibility resubmitted'],\n])for(const [format,newline] of [['LF','\\n'],['CRLF','\\r\\n']])test(`visibility negative control (${format}): ${name}`,()=>{"
   }
  ]
 },
 "tests/lua/act3_orb_walker.lua": {
  "current": {
   "sha256": "816189819dfab34244bd1e354a74690b234b35eae094585f5fe1e6557f3a4082",
   "gitBlob": "d029d82265d714d1f27b0557e44d216dea86cbf7"
  },
  "previous": {
   "sha256": "d076ae112155a9f798d306695417bb2e66b0d5f2854598c34594af4d5eb4223d",
   "gitBlob": "9afda70901168e1e96b9d7631aec701bbe736672"
  },
  "hunks": [
   {
    "at": 199,
    "before": " local H=dofile('tests/lua/support/battle_action_fixture.lua')\n local inspectDetails=dofile('tests/lua/support/status_detail_fixture.lua')\n local F=H.F\n local root=F.Viewport.apply(F.control({children=F.Layout}),1280,720)",
    "after": " local H=dofile('tests/lua/support/battle_action_fixture.lua')\n local inspectDetails=dofile('tests/lua/support/status_detail_fixture.lua')\n local readPowers=dofile('tests/lua/support/power_tip_fixture.lua')\n local F=H.F\n local root=F.Viewport.apply(F.control({children=F.Layout}),1280,720)"
   },
   {
    "at": 215,
    "before": " dofile('tests/lua/support/intent_face_assertion.lua')(box,require('abyss_battle_intent_view').intentView(r.combat,1))\n tap('enemy1',91)\n local detail=inspectDetails(ui,panel)\n assert(detail:find(r.combat.catalog.cards.burn.name,1,true)and detail:find('抽牌堆',1,true)and detail:find('弃牌堆',1,true),detail)",
    "after": " dofile('tests/lua/support/intent_face_assertion.lua')(box,require('abyss_battle_intent_view').intentView(r.combat,1))\n tap('enemy1',91)\n assert(ui.info.powerTips and ui.info.index==1 and ui.info.id==e.id)\n local compact,rows=readPowers(panel)\n assert(#rows==2 and rows[1]:find('对你施加负面效果并攻击造成 10 点伤害',1,true),compact)\n assert(rows[2]:find('成长 3',1,true) and not compact:find(r.combat.catalog.cards.burn.name,1,true)\n  and not compact:find('抽牌堆',1,true) and not compact:find('弃牌堆',1,true),compact)\n panel:GetChild('statusDismiss').click({touchId=91})\n assert(not ui.info and ui:showStatus(1) and not ui.info.powerTips)\n local detail=inspectDetails(ui,panel)\n assert(detail:find(r.combat.catalog.cards.burn.name,1,true)and detail:find('抽牌堆',1,true)and detail:find('弃牌堆',1,true),detail)"
   },
   {
    "at": 227,
    "before": " dofile('tests/lua/support/monster_power_control_fixture.lua')(box,'generic_strength_up'):GetChild('hit').click({touchId=92})\n assert(panel:GetChild('statusInfo').visible and ui.info.id==e.id and ui.info.index==1)\n local names={};for i=1,H.F.Theme.layout.statusInfo.rows do\n  local part=panel:GetChild('statusInfo'):GetChild('name'..i)\n  if part.visible then names[#names+1]=part.text end\n end\n assert(table.concat(names,' '):find('成长 3',1,true),'Growth amount remains readable')\nend)\n",
    "after": " dofile('tests/lua/support/monster_power_control_fixture.lua')(box,'generic_strength_up'):GetChild('hit').click({touchId=92})\n assert(panel:GetChild('statusInfo').visible and ui.info.id==e.id and ui.info.index==1)\n local status,statusRows=readPowers(panel)\n assert(#statusRows==1 and status:find('成长 3',1,true)\n  and not status:find('10 点伤害',1,true),'Growth amount remains readable without the upcoming attack')\nend)\n"
   }
  ]
 },
 "tests/lua/act3_shapes.lua": {
  "current": {
   "sha256": "ef847476ffbd51e582fbb7addaffac614e8c5a4db5321b111a5528756fc9e301",
   "gitBlob": "38dba85c5b7b6f77660b825b609bfa4b22aa5bf4"
  },
  "previous": {
   "sha256": "5c6d2832d4236ba885475cfe7bb943b899b50d2dede113fdcd0a685c53507d56",
   "gitBlob": "8af749238fd8b2d8f4e8b368d29cb57bbe670b6b"
  },
  "hunks": [
   {
    "at": 212,
    "before": " local H=dofile('tests/lua/support/battle_action_fixture.lua');local F=H.F\n local inspectDetails=dofile('tests/lua/support/status_detail_fixture.lua')\n local root=F.Viewport.apply(F.control({children=F.Layout}),1280,720)\n local host=F.GameUI.new(root,D,F.Presentation,'click',{seed=1,campaign=true,prologue=false,",
    "after": " local H=dofile('tests/lua/support/battle_action_fixture.lua');local F=H.F\n local inspectDetails=dofile('tests/lua/support/status_detail_fixture.lua')\n local readPowers=dofile('tests/lua/support/power_tip_fixture.lua')\n local root=F.Viewport.apply(F.control({children=F.Layout}),1280,720)\n local host=F.GameUI.new(root,D,F.Presentation,'click',{seed=1,campaign=true,prologue=false,"
   },
   {
    "at": 225,
    "before": " end\n assert(not monsterControl(panel,'enemy5'))\n tap('enemy1',71);local text=inspectDetails(ui,panel)\n assert(text:find(r.combat.catalog.cards.dazed.name,1,true)and text:find('抽牌堆',1,true)and text:find('2',1,true),text)\n assert(not text:find('未知',1,true),text)",
    "after": " end\n assert(not monsterControl(panel,'enemy5'))\n tap('enemy1',71)\n assert(ui.info.powerTips and ui.info.index==1 and ui.info.id==r.combat.enemies[1].id)\n local compact,rows=readPowers(panel)\n assert(#rows==1 and compact:find('对你施加一种负面效果',1,true)\n  and not compact:find(r.combat.catalog.cards.dazed.name,1,true)\n  and not compact:find('抽牌堆',1,true),compact)\n panel:GetChild('statusDismiss').click({touchId=71})\n assert(not ui.info and ui:showStatus(1) and not ui.info.powerTips)\n local text=inspectDetails(ui,panel)\n assert(text:find(r.combat.catalog.cards.dazed.name,1,true)and text:find('抽牌堆',1,true)and text:find('2',1,true),text)\n assert(not text:find('未知',1,true),text)"
   },
   {
    "at": 241,
    "before": "  local hit=dofile('tests/lua/support/monster_power_control_fixture.lua')(monsterControl(panel,'enemy3'),'explosive'):GetChild('hit')\n  hit.click({touchId=80+turn});eq(ui.info.id,e.id);eq(ui.info.index,3)\n  local info=panel:GetChild('statusInfo');assert(info.visible)\n  local names,details={},{}\n  for i=1,F.Theme.layout.statusInfo.rows do\n   local name=info:GetChild('name'..i);if name.visible then names[#names+1]=name.text end\n   local line=info:GetChild('text'..i);if line.visible then details[#details+1]=line.text end\n  end\n  assert(table.concat(names,' '):find('自爆 '..(3-turn),1,true))\n  assert(table.concat(details,' '):find('30',1,true))\n  info:GetChild('hit').click({touchId=90+turn})\n end\n eq(intent(r.combat.enemies[3]),'wait')",
    "after": "  local hit=dofile('tests/lua/support/monster_power_control_fixture.lua')(monsterControl(panel,'enemy3'),'explosive'):GetChild('hit')\n  hit.click({touchId=80+turn});eq(ui.info.id,e.id);eq(ui.info.index,3)\n  local status,statusRows=readPowers(panel)\n  assert(#statusRows==1 and status:find('自爆 '..(3-turn),1,true),status)\n  assert(status:find('30',1,true),status)\n  panel:GetChild('statusDismiss').click({touchId=90+turn})\n  assert(not ui.info)\n end\n eq(intent(r.combat.enemies[3]),'wait')"
   }
  ]
 },
 "tests/lua/detail_latency.lua": {
  "current": {
   "sha256": "262b0422269bddf3237c10338ce7521e5128639df93bb926741c3b29ece009a2",
   "gitBlob": "d37a0126b9bf0f443ea770c1e8135582789a1db8"
  },
  "previous": {
   "sha256": "0d886fb386da8f6c7b938138bd8dafc935f96abf9a48f608ad89f6f810709654",
   "gitBlob": "7b2a025c5005a90919de2d1239e38187dcc14565"
  },
  "hunks": [
   {
    "at": 92,
    "before": " assert(ui:showStatus(0));assert(not ui.info and not panel:GetChild('statusInfo').visible)\nend)\n-- Down closes the explicit actor reader and consumes its Click.\nlocal beforeHand=#host.run.combat.hand\nassert(ui:showStatus(0))\nlocal hit=panel:GetChild('card1'):GetChild('hit')\nhit.listeners.down({touchId=71})\nassert(not ui.info,'new Down must close explicit details')\nif hit.listeners.up then hit.listeners.up({touchId=71}) end\nhit.listeners.click({touchId=71})\nassert(#host.run.combat.hand==beforeHand and not ui.selected,'close click passed through')\n-- Content is re-read, never cached by mutable actor identity.\nhost.run.combat.player.hp=17",
    "after": " assert(ui:showStatus(0));assert(not ui.info and not panel:GetChild('statusInfo').visible)\nend)\n-- An empty-space click dismisses the actor reader without selecting a card.\nlocal beforeHand=#host.run.combat.hand\nassert(ui:showStatus(0))\nlocal dismiss=panel:GetChild('statusDismiss')\nassert(dismiss.visible and event('statusDismiss','click',71),'empty-space click must be consumed')\nassert(not ui.info and not dismiss.visible and not ui.gesture and not ui.selected and #host.run.combat.hand==beforeHand,\n 'empty-space dismissal changed the hand or its input state')\n-- A click directly on an exposed card closes the reader and selects that card without playing it.\nassert(ui:showStatus(0))\nlocal cardUid=host.run.combat.hand[hand.bash].uid\nevent(card(hand.bash),'down',72)\nassert(not ui.info and not dismiss.visible and ui.gesture and ui.gesture.uid==cardUid and not ui.swallow,\n 'direct card press must dismiss the reader and capture the pressed card')\nevent(card(hand.bash),'up',72)\nevent(card(hand.bash),'click',72)\nassert(ui.selected==cardUid and #host.run.combat.hand==beforeHand,'direct card click must select without playing')\nassert(ui:cancelAim() and not ui.selected)\n-- Content is re-read, never cached by mutable actor identity.\nhost.run.combat.player.hp=17"
   }
  ]
 },
 "tests/lua/formal_campaign_entry.lua": {
  "current": {
   "sha256": "9f5bbe7cff40a944824e679bcead551f5b5b79d6e166c4180157eb8bfadb4c53",
   "gitBlob": "e59f2ccf1b27d59927bcfbb7f888c0f934e66641"
  },
  "previous": {
   "sha256": "49fee1c35afe656d1f4c45f4765486722558f6265cfce71f453a125aea55b7ca",
   "gitBlob": "225e9d3df66d8e109faef7029ffa1ad25f09eeba"
  },
  "hunks": [
   {
    "at": 16,
    "before": "    assert(host.mapUI:focusCurrent())\nend\nlocal function awaitNativePage(host)\n    for _=1,80 do\n        if not host.starting and not(host.prologue and host.prologue:covering())\n            and not(host.pageReveal and host.pageReveal:covered())then assert(not host.disabled);return end",
    "after": "    assert(host.mapUI:focusCurrent())\nend\nlocal function awaitNativePage(host,maxTicks)\n    for _=1,maxTicks or 80 do\n        if not host.starting and not(host.prologue and host.prologue:covering())\n            and not(host.pageReveal and host.pageReveal:covered())then assert(not host.disabled);return end"
   },
   {
    "at": 163,
    "before": "    local accepted,state=host.mapUI:choose(nextNode.id)\n    assert(accepted and state=='selection_pending' and host.mode=='map' and host.run.phase=='map')\n    awaitNativePage(host)\n    assert(host.map.currentNodeId==nextNode.id and host.mode=='battle' and host.run.phase=='combat')\n    return nextNode",
    "after": "    local accepted,state=host.mapUI:choose(nextNode.id)\n    assert(accepted and state=='selection_pending' and host.mode=='map' and host.run.phase=='map')\n    -- The Act 1 Guardian's narration and two scene fades take about six seconds.\n    local guardianEntry=host.run.act==1 and nextNode.type=='boss'\n    awaitNativePage(host,guardianEntry and 140 or nil)\n    assert(host.map.currentNodeId==nextNode.id and host.mode=='battle' and host.run.phase=='combat')\n    return nextNode"
   }
  ]
 },
 "tests/lua/game_ui_boss_treasure.lua": {
  "current": {
   "sha256": "1afa38323838de0a3c08e62f3b7664229515d745644bb1e92f4e70ae6f4a6d11",
   "gitBlob": "fa95f0032815623ed769fbb17597b753d332f8eb"
  },
  "previous": {
   "sha256": "bc1bc871121a584586aee74e4096f841fcc09d52608b0c299f3bf3c3e3953340",
   "gitBlob": "97c68881af268e34fcc7641aa7f4cd8b2c88730e"
  },
  "hunks": [
   {
    "at": 124,
    "before": "    assert(get(root,\"nodePanel/treasureView/rewardItem1\").visible)\n    assert(get(root,\"nodePanel/treasureView/rewardItem1\").visible and not get(root,\"nodePanel/treasureView/rewardItem1/disabled\").visible)\n    assert(get(root,\"nodePanel/treasureView/page\").text=='宝箱奖励 · 3 项')\n    local gold=ui.run.gold\n    assert(ui.nodeUI:press(\"treasureView/rewardItem1\") and ui.mode==\"victory\" and ui.run.gold==gold)",
    "after": "    assert(get(root,\"nodePanel/treasureView/rewardItem1\").visible)\n    assert(get(root,\"nodePanel/treasureView/rewardItem1\").visible and not get(root,\"nodePanel/treasureView/rewardItem1/disabled\").visible)\n    assert(get(root,\"nodePanel/treasureView/page\").text=='首领宝箱奖励 · 3 项')\n    local gold=ui.run.gold\n    assert(ui.nodeUI:press(\"treasureView/rewardItem1\") and ui.mode==\"victory\" and ui.run.gold==gold)"
   }
  ]
 },
 "tests/lua/game_ui_prologue_readiness.lua": {
  "current": {
   "sha256": "2ac7d82ac274e8ede9d3858fbd7a012ef8c5d1589be76d0f2fa3089a40e86893",
   "gitBlob": "0e943bbc8711b565196879554ea78163d57e79ff"
  },
  "previous": {
   "sha256": "7f6dd189490b895dabf014c6a633374a8b87920d653cd33643a83c908f63c2bf",
   "gitBlob": "e872dc23c6c7006d1f7d092eac250ef1acfebf29"
  },
  "hunks": [
   {
    "at": 18,
    "before": "owner.mode='battle';before=visits;assert(progress()==6 and visits==before)\nprint('LUA_OPENING_NATIVE_READINESS_PASS')",
    "after": "owner.mode='battle';before=visits;assert(progress()==6 and visits==before)\nprint('LUA_OPENING_NATIVE_READINESS_PASS')\n\nlocal F=dofile('tests/lua/support/game_ui_fixture.lua')\nlocal cursors={CursorDown='down',CursorUp='up',CursorEnter='enter',CursorExit='exit',CursorEndDrag='endDrag'}\n\nlocal function wrappedIntro(id,touchId)\n    local canvas=F.control({children=F.Layout})\n    local root=F.Viewport.apply(canvas,1280,720)\n    local eventView=root:GetChild('nodePanel'):GetChild('eventView')\n    local getChild=eventView.GetChild\n    local option=getChild(eventView,'option1')\n    option.id=id\n    local wrapper={__index=option,__newindex=option,__eq=function(a,b)\n        return rawequal(rawget(a,'native') or a,rawget(b,'native') or b)\n    end}\n    function eventView:GetChild(name)\n        if name=='option1' then return setmetatable({native=option},wrapper) end\n        return getChild(self,name)\n    end\n    local a,b=eventView:GetChild('option1'),eventView:GetChild('option1')\n    assert(a==b and not rawequal(a,b),'test must use different Lua wrappers for the same live native control')\n    local ui=F.GameUI.new(root,F.Data,F.Presentation,'click',{\n        seed=42,prologue=true,campaign=true,campaignProfile='competition-two-act',\n        characterProfile='production',imageSource='static',cursorEvents=cursors,\n        color=function(r,g,b,a)return {r=r,g=g,b=b,a=a}end,\n    })\n    root.ui=ui\n    local function startIntro()\n        assert(F.start(ui))\n        for _=1,80 do if not ui.prologue:covering() then break end;ui:update(.05)end\n        assert(ui.nodeUI.visible and not ui.prologue:covering())\n        assert(ui.run.nodeFlow.event.stage=='neow_intro')\n    end\n    local hit=option:GetChild('hit')\n    local function emit(name,x)\n        return assert(hit.listeners[name])({touchId=touchId,GetUIPos=function()return x or 414,84 end})\n    end\n    local function continueIntro()\n        emit('down');emit('up')\n        local ok,reason=emit('click')\n        assert(ok,'fresh opening pointer must advance: '..tostring(reason))\n        assert(ui.run.nodeFlow.event.stage=='neow_blessing')\n    end\n    startIntro()\n    emit('down');emit('exit',4);emit('up',4)\n    assert(not emit('click') and ui.run.nodeFlow.event.stage=='neow_intro','dragging out must cancel')\n    continueIntro()\n    assert(not emit('click') and ui.run.nodeFlow.event.stage=='neow_blessing','duplicated click changed the blessing')\n    assert(ui:openMenu() and ui:requestNavigation('abandon') and ui:confirmNavigation())\n    startIntro()\n    assert(not emit('click') and ui.run.nodeFlow.event.stage=='neow_intro','old click advanced a new run')\n    continueIntro()\nend\n\nwrappedIntro('neow-option-1')\nwrappedIntro(101,7)\nprint('LUA_OPENING_NATIVE_ALIAS_PASS mouse=yes touch=yes drag_out=yes reentry=yes')"
   }
  ]
 },
 "tests/lua/intent_visibility_cache.lua": {
  "current": {
   "sha256": "7386d3c7c1020873c6e6509b7d3aff64626a815583bf7d73fcefe56b61478a1a",
   "gitBlob": "e0bf2971bdc44dc4363ab0b929e39ab328924e06"
  },
  "previous": {
   "sha256": "08d666638364c0b539342136d2c8f3a35077defc8105f46a2f9e4087e5d0a66b",
   "gitBlob": "d9f6313dce57b9a9c4196c58c56cfae4d8399a8c"
  },
  "hunks": [
   {
    "at": 91,
    "before": "  api.renderEnemyIntent(box,{kind='attack',value='6'},100,{intentX=1,intentY=2,intentWidth=3},true,1)\n end\n return handles,draw,function()hide(box,'enemy')end\nend\nfor _,failure in ipairs({'success','false','throw'})do",
    "after": "  api.renderEnemyIntent(box,{kind='attack',value='6'},100,{intentX=1,intentY=2,intentWidth=3},true,1)\n end\n return handles,draw,function()hide(owner,box,'enemy')end\nend\nfor _,failure in ipairs({'success','false','throw'})do"
   }
  ]
 },
 "tests/native-candidate.test.mjs": {
  "current": {
   "sha256": "7da2872cfbf8ebbeffb397f2c1438d7f53364be6c6246b514f10a0047f6c117e",
   "gitBlob": "648a0038c40a641e431a090dff3e7d183f536eae"
  },
  "previous": {
   "sha256": "ca0f758acf0d3d053b91182eabe1e1fb5b3f5bdaeb3e5bf13ef9b5e47e224238",
   "gitBlob": "07cb62783fe2221d7ed8df4f7634796613e5fbaa"
  },
  "hunks": [
   {
    "at": 142,
    "before": "  writeFileSync(join(generated,'abyss_component_binding.lua'),'return {schemaVersion=1,enabled=false}');\n  writeFileSync(join(generated,'abyss_v25_card_assets.lua'),'return {enabled=false}');\n  for(const name of ['abyss_ui_profile','abyss_art_features','abyss_monster_actor_binding','abyss_monster_art_data', 'abyss_data','abyss_original_v4_data','abyss_map_layout','abyss_narrative','abyss_presentation','abyss_theme','abyss_menu_background_asset', 'abyss_ready_card_binding', 'abyss_ready_card_assets', 'abyss_traveler_portrait_assets'])\n    writeFileSync(join(generated,name+'.lua'),'return {}');",
    "after": "  writeFileSync(join(generated,'abyss_component_binding.lua'),'return {schemaVersion=1,enabled=false}');\n  writeFileSync(join(generated,'abyss_v25_card_assets.lua'),'return {enabled=false}');\n  writeFileSync(join(generated,'abyss_chapter_battle_scene_data.lua'),'return {enabled=false}');\n  for(const name of ['abyss_ui_profile','abyss_art_features','abyss_monster_actor_binding','abyss_monster_art_data', 'abyss_data','abyss_original_v4_data','abyss_map_layout','abyss_narrative','abyss_presentation','abyss_theme','abyss_menu_background_asset', 'abyss_ready_card_binding', 'abyss_ready_card_assets', 'abyss_traveler_portrait_assets'])\n    writeFileSync(join(generated,name+'.lua'),'return {}');"
   }
  ]
 },
 "tests/native-monster-catalog.test.mjs": {
  "current": {
   "sha256": "c434649fbc126bb01b5a9be0689e7b8cc2ad76edd37dd984d82dc0468ba70df3",
   "gitBlob": "49adaffe228113c9a605d6735db29ea0e075a070"
  },
  "previous": {
   "sha256": "57ac15906c3f3532f7d035909226acaff819785f14686df81450de4c569f20f4",
   "gitBlob": "3a65895cb135c09066825dda8753c4f33b2fd832"
  },
  "hunks": [
   {
    "at": 20,
    "before": " const actor=monsterActorTemplate(production);assertNativeUiCapacity(actor);\n // Two source intent-particle layers surround the icon and precede damage text.\n assert.equal(walk(actor).length,647);assert.equal(actor.visible,false);\n const names=actor.children.map(child=>child.name);\n assert(names.indexOf('intentVfxBehind')>=0&&names.indexOf('intentVfxBehind')<names.indexOf('intentIcon'));",
    "after": " const actor=monsterActorTemplate(production);assertNativeUiCapacity(actor);\n // Two source intent-particle layers surround the icon and precede damage text.\n assert.equal(walk(actor).length,648);assert.equal(actor.visible,false);\n assert.equal(actor.blockCursor,true);\n assert.deepEqual(actor.children.filter(child=>child.name==='hpHit'),[\n  {name:'hpHit',kind:'cursorArea',size:[106.66666666666667,12],visible:false},\n ]);\n const names=actor.children.map(child=>child.name);\n assert(names.indexOf('intentVfxBehind')>=0&&names.indexOf('intentVfxBehind')<names.indexOf('intentIcon'));"
   }
  ]
 },
 "tests/native-monster-power-template.test.mjs": {
  "current": {
   "sha256": "015ce5c992dc0be722fa83aadaad8a401bbacb582b52917471e51dba362d8646",
   "gitBlob": "c69215a30fd6b3ffaace0c80f58baab67c4a52d8"
  },
  "previous": {
   "sha256": "b22ee2349d7f2b185d1a5f56043263ab2b074308c290ec15210d84d38e89a1ad",
   "gitBlob": "373d53c307dd3ea180ae3d453749e6ffd07fc80d"
  },
  "hunks": [
   {
    "at": 20,
    "before": " const hero=preReadableUnitTypography(all(battleLayout()).find(n=>n.name==='hero'),{hero:true});\n const statusRow=hero.children.find(node=>node.name==='statusRow');\n const statusHits=['hit',...Array.from({length:10},(_,index)=>`hit${index+1}`)];\n // Reconstruct only #899's retired focus metadata for the original byte check.",
    "after": " const hero=preReadableUnitTypography(all(battleLayout()).find(n=>n.name==='hero'),{hero:true});\n const statusRow=hero.children.find(node=>node.name==='statusRow');\n // Compare the predecessor only after checking all ten live count bounds.\n for(let index=1;index<=10;index++){\n  const count=statusRow.children.find(node=>node.name===`count${index}`);\n  assert.deepEqual(count.size,[40,40],count.name);\n  count.size[0]=21.333333333333332;\n }\n const statusHits=['hit',...Array.from({length:10},(_,index)=>`hit${index+1}`)];\n // Reconstruct only #899's retired focus metadata for the original byte check."
   }
  ]
 },
 "tests/effects-target-group-source-epoch.test.mjs": {
  "current": {
   "sha256": "1fbb7806d1b82e30503b293bccdd8204a3cad9a90510f240e2bff58bdfd7ee74",
   "gitBlob": "96c959143da635827e3589b976eedcaae619e511"
  },
  "previous": {
   "sha256": "582c8e56f9679233aeee5ea9c26a3270fe7178bb4d68e5b9f61f57322c1e12b8",
   "gitBlob": "233f0cd0bf61ac50538f2fb81e3273f148ab8625"
  },
  "hunks": [
   {
    "at": 9,
    "before": "import {copyIntegrationSourceClosure} from './helpers/copy-integration-source-closure.mjs';\nconst path='src/lua/abyss_effects.lua',proof=sourceEpoch.proof,prior=preEffectsTargetGroupEpoch.proof;\nconst raw=p=>proof.current[p]?.source??null;\ntest('Effects target group outer epoch preserves every prior binding and exact frozen production byte',()=>{",
    "after": "import {copyIntegrationSourceClosure} from './helpers/copy-integration-source-closure.mjs';\nimport {exactSourceMatches} from './helpers/source-fingerprint.mjs';\nconst path='src/lua/abyss_effects.lua',proof=sourceEpoch.proof,prior=preEffectsTargetGroupEpoch.proof;\nconst raw=p=>proof.current[p]?.source??null;\n// #951 renamed two operations after the frozen Effects witness was recorded.\nconst currentVocabulary={sha256:'8e0ceac15d72a48a9c029a08916ad24232f8ebcfe8441eb1a401a2b5bc38db4f',gitBlob:'8c03e96f336842650e2035f4961b0deba749467e'};\nconst priorVocabulary={sha256:'f220d8b82875bde72e4f1442bb25743f72a53ece84d8bfe2b4ad278625f16181',gitBlob:'f669759d766698e39088b840b6ac5df7e3b020c2'};\nconst live=file=>{\n const source=readFileSync(file,'utf8');\n if(file!==path)return source;\n const lf=source.replaceAll('\\r\\n','\\n');\n assert(source===lf||source===lf.replaceAll('\\n','\\r\\n'),'uniform live Effects owner');\n assert(exactSourceMatches(source,currentVocabulary),'exact current Effects vocabulary owner');\n const previous=source.replaceAll('calculatedExchange','calculatedGamble').replaceAll('daggerExpenditure','daggerSacrifice');\n assert(exactSourceMatches(previous,priorVocabulary),'exact pre-vocabulary Effects owner');\n return previous;\n};\ntest('Effects target group outer epoch preserves every prior binding and exact frozen production byte',()=>{"
   },
   {
    "at": 32,
    "before": " assert.equal(proof.effectsTargetGroupSourceTree,'ef6ff1bd7ce4fe466ea52752bee6c9fd9eb5fc65');\n const live=file=>readFileSync(file,'utf8');\n assertDevelopBackflowCurrent(path,live(path));",
    "after": " assert.equal(proof.effectsTargetGroupSourceTree,'ef6ff1bd7ce4fe466ea52752bee6c9fd9eb5fc65');\n assertDevelopBackflowCurrent(path,live(path));"
   },
   {
    "at": 123,
    "before": "  assert.deepEqual(proof.current[file],standalone.proof.current[file]);\n  const read=path=>readFileSync(path,'utf8'), live=read(file);\n  if(file===changed[0])assertDevelopBackflowCurrent(file,live);\n  assert.equal(raw(file),authenticateDevelopBackflow(file,live,read).replaceAll('\\r\\n','\\n'));\n }",
    "after": "  assert.deepEqual(proof.current[file],standalone.proof.current[file]);\n  const source=live(file);\n  if(file===changed[0]||file===path)assertDevelopBackflowCurrent(file,source);\n  assert.equal(raw(file),authenticateDevelopBackflow(file,source,live).replaceAll('\\r\\n','\\n'));\n }"
   }
  ]
 },
 "tests/noncombat-v25-layout.test.mjs": {
  "current": {
   "sha256": "c97ed0609e04042432caaaf06c66cc1955cce9a2d9da17417fdf0aab8ca290c9",
   "gitBlob": "22332dafe5fbd4cbbc14aeaef90d833ce10a112a"
  },
  "previous": {
   "sha256": "84f7d6670686ae06dd6d97290e010882b9c6433104eae365e501b738d39d5cf4",
   "gitBlob": "4a1c82e57689e2bc8b9a7bf25f63bc23f5758b1a"
  },
  "hunks": [
   {
    "at": 263,
    "before": "Color={FromRGBA=function(...)return {...}end}\nlocal methods={}\nfunction methods:SetVisible(value)self.visible=value end\nfunction methods:SetActive(value)self.active=value end\nfunction methods:SetImage(source,id)self.imageId=id end\nfor _,name in ipairs({'SetAnchorMin','SetAnchorMax','SetPivot','SetSizeDelta','SetLocalScale','SetLocalRotation','SetAnchoredPosition','SetAsLastSibling','SetFillHorizontal','SetFillUnused'})do methods[name]=function()end end\nlocal function install(control)\n control.SetActive=methods.SetActive",
    "after": "Color={FromRGBA=function(...)return {...}end}\nlocal methods={}\nlocal active=setmetatable({},{__mode='k'})\nfunction methods:SetVisible(value)self.visible=value end\nfunction methods:SetActive(value)active[self]=value;F.setEngineActive(self,value)end\nfunction methods:SetImage(source,id)self.imageId=id end\nfor _,name in ipairs({'SetAnchorMin','SetAnchorMax','SetPivot','SetSizeDelta','SetLocalScale','SetLocalRotation','SetAnchoredPosition','SetAsLastSibling','SetFillHorizontal','SetFillUnused'})do methods[name]=function()end end\nlocal rootMeta=getmetatable(root)\nlocal readRoot,writeRoot=rootMeta.__index,rootMeta.__newindex\nrootMeta.__index=function(control,key)\n if key=='active' then return active[control]~=false end\n return readRoot(control,key)\nend\nrootMeta.__newindex=function(control,key,value)\n assert(key~='active','native active is read-only')\n writeRoot(control,key,value)\nend\nlocal cloneMeta={__index=function(control,key)\n if key=='active' then return active[control]~=false end\n return methods[key]\nend,__newindex=function(control,key,value)\n assert(key~='active','native active is read-only')\n rawset(control,key,value)\nend}\nlocal function install(control)\n control.SetActive=methods.SetActive"
   },
   {
    "at": 294,
    "before": " assert(index==41 or index==73 or index==99)\n if rejectCreation then return nil end\n created=created+1;return setmetatable({parent=parent,alive=true},{__index=methods})\nend,DestroyClientUIControl=function()destroyed=destroyed+1 end}\nlocal portraits=require('abyss_traveler_portraits').new(root,nil,{selectionAvatar=true,battlePortrait=true})",
    "after": " assert(index==41 or index==73 or index==99)\n if rejectCreation then return nil end\n created=created+1;return setmetatable({parent=parent,alive=true},cloneMeta)\nend,DestroyClientUIControl=function()destroyed=destroyed+1 end}\nlocal portraits=require('abyss_traveler_portraits').new(root,nil,{selectionAvatar=true,battlePortrait=true})"
   }
  ]
 },
 "tests/official-assets-runtime.test.mjs": {
  "current": {
   "sha256": "93fbc38723db2007e0709c368eb3bf89e0f08fd124dad36c52c9c5cd3b089292",
   "gitBlob": "68fe3c7d8a5d215c0ad1e907b67eed0ab5a53e7f"
  },
  "previous": {
   "sha256": "475d4772d0224ee4690cb5215d2536ac4961efe8a1415a40c3219dcc70fd4cde",
   "gitBlob": "4ab27d84b1640b8ee6c48daaecc3c6aae1b416c8"
  },
  "hunks": [
   {
    "at": 185,
    "before": "for i=3,26 do host.run.relics[i]='burning_blood' end\nhost:refresh()\nlocal overflow=bar:GetChild('slot25'):GetChild('more')\nassert(overflow.visible and overflow.text=='+4','wide relic count must preserve the exact overflow count')\nhost.run.relics,host.run.relicCounters=relics,counters\nlocal first=assert(F.Nodes.available(host.run,host.map)[1])",
    "after": "for i=3,26 do host.run.relics[i]='burning_blood' end\nhost:refresh()\nlocal previous,nextPage=bar:GetChild('previous'),bar:GetChild('next')\nlocal function visibleRelicCount()\n local count=0\n for i=1,25 do\n  local slot=bar:GetChild('slot'..i)\n  if slot.visible then count=count+1 end\n  assert(not slot:GetChild('more').visible,'owned relic pages must not replace relics with an overflow label')\n end\n return count\nend\nassert(visibleRelicCount()==23 and not previous.visible and nextPage.visible)\nassert(nextPage:GetChild('hit').click() and visibleRelicCount()==3 and previous.visible and not nextPage.visible)\nassert(previous:GetChild('hit').click() and visibleRelicCount()==23,'wide counter paging preserves every owned relic')\nhost.run.relics,host.run.relicCounters=relics,counters\nlocal first=assert(F.Nodes.available(host.run,host.map)[1])"
   },
   {
    "at": 1100,
    "before": "local button=assert(page:GetChild('back'))\nlocal label=assert(button:GetChild('label'))\nlocal function ink(expected)\n assert(label.fontColor.r==expected.r and label.fontColor.g==expected.g and label.fontColor.b==expected.b,'official dark button ink was overwritten by light-button ink')\nend\nassert(button.visible and label.text=='离开' and not page:GetChild('confirm').visible)\nink(Theme.officialAssets.buttonInk)\nlocal hit=button:GetChild('hit')",
    "after": "local button=assert(page:GetChild('back'))\nlocal label=assert(button:GetChild('label'))\nlocal shelf=assert(page:GetChild('shopView'))\nlocal advanceShop=dofile('tests/lua/support/shop_timeline.lua')\nlocal function tapControl(box,id)\n local listeners=box:GetChild('hit').listeners\n listeners.down({touchId=id});listeners.up({touchId=id});return listeners.click({touchId=id})\nend\nassert(button.visible and label.text=='离开' and not page:GetChild('confirm').visible)\nassert(tapControl(page:GetChild('merchant'):GetChild('talk'),799))\nadvanceShop(host.nodeUI)\nassert(shelf.visible and host.nodeUI.shopOpen and not host.nodeUI.shopBusy and label.text=='关闭')\nlocal function ink(expected)\n assert(label.fontColor.r==expected.r and label.fontColor.g==expected.g and label.fontColor.b==expected.b,'official dark button ink was overwritten by light-button ink')\nend\nink(Theme.officialAssets.buttonInk)\nlocal hit=button:GetChild('hit')"
   },
   {
    "at": 1133,
    "before": "host:refresh();ink(Theme.officialAssets.buttonInk)\nassert(shelf.visible and button.visible,'map preview must return to the same shelf')\nassert(tapControl(button,804) and host.nodeUI.shopBusy,'visible leave control starts the close animation')\nassert(not host.run.nodeFlow.complete,'leave must not commit before the shelf closes')\nassert(not hit.listeners.click({touchId=804}),'duplicate leave click accepted')\nadvanceShop(host)\nassert(host.run.nodeFlow.complete and not shelf.visible,'leaving through the visible control must finish the shop')\n`, 'OFFICIAL_SHOP_ROUTE_INK_PASS');\n});",
    "after": "host:refresh();ink(Theme.officialAssets.buttonInk)\nassert(shelf.visible and button.visible,'map preview must return to the same shelf')\nassert(tapControl(button,804) and not host.nodeUI.shopOpen and not shelf.visible,\n 'visible close control starts the shelf close animation')\nassert(not host.run.nodeFlow.complete,'closing the shelf must leave the shop room active')\nassert(not hit.listeners.click({touchId=804}),'duplicate close click accepted')\nadvanceShop(host.nodeUI)\nassert(not host.run.nodeFlow.complete and not shelf.visible and label.text=='离开')\nassert(tapControl(button,805) and host.run.nodeFlow.complete,'leaving through the room control must finish the shop')\n`, 'OFFICIAL_SHOP_ROUTE_INK_PASS');\n});"
   }
  ]
 },
 "tests/official-assets.test.mjs": {
  "current": {
   "sha256": "17fc945582ab9bda9c0fcba7d20396f3c02f089c18ab2b9be2913e35ddb595a6",
   "gitBlob": "5b36083005174b20625b20f8c097faf5500cb5c5"
  },
  "previous": {
   "sha256": "1984d8c172e465583f45d45821837733aa2befbe809e066025f0042784cb0ec5",
   "gitBlob": "8e9b3f1d7559067512d96f7a545bf037277846f7"
  },
  "hunks": [
   {
    "at": 414,
    "before": " const layout=gameLayout(),theme=officialAssetsTheme(nativeTheme);\n const before=new Map(paths(layout).filter(([,node])=>node.kind==='image').map(([path,node])=>[path,node.image]));\n applyOfficialAssets([layout],theme);\n const battle=child(layout,'battlePanel'),turn=child(battle,'endTurn');",
    "after": " const layout=gameLayout(),theme=officialAssetsTheme(nativeTheme);\n const before=new Map(paths(layout).filter(([,node])=>node.kind==='image').map(([path,node])=>[path,node.image]));\n const replacements=new Map([\n  ['/SlayTheAbyss/nodePanel/eventView/art',theme.icon.eventArt.default],\n  ['/SlayTheAbyss/battlePanel/topBar/battleRoute/icon',theme.icon.map],\n  ['/SlayTheAbyss/mapPanel/mapRoute/icon',theme.icon.map],\n  ['/SlayTheAbyss/nodePanel/runRoute/icon',theme.icon.map],\n ]);\n applyOfficialAssets([layout],theme);\n const battle=child(layout,'battlePanel'),turn=child(battle,'endTurn');"
   },
   {
    "at": 429,
    "before": "  }\n for(const [path,node]of paths(layout))if(/\\/(portrait|intentIcon|intentBadge|intentExtra|hpIcon|goldIcon|blockedLock|art|art_attack|art_skill|art_power|icon)$/.test(path)&&node.kind==='image'){\n  const expected=path==='/SlayTheAbyss/nodePanel/eventView/art'?theme.icon.eventArt.default:\n   before.get(path)??(/^\\/SlayTheAbyss\\/relicBar\\/slot(?:1[3-9]|2[0-5])\\/icon$/.test(path)?before.get('/SlayTheAbyss/relicBar/slot1/icon'):undefined);\n  assert.equal(node.image,expected,path);\n }\n assert.equal(child(child(layout,'menuPanel'),'backdrop').image,nativeTheme.image.officialBackdrops.title);\n const menu=child(layout,'menuPanel'),result=child(menu,'result');",
    "after": "  }\n for(const [path,node]of paths(layout))if(/\\/(portrait|intentIcon|intentBadge|intentExtra|hpIcon|goldIcon|blockedLock|art|art_attack|art_skill|art_power|icon)$/.test(path)&&node.kind==='image'){\n  const expected=replacements.get(path)??before.get(path)??\n   (/^\\/SlayTheAbyss\\/relicBar\\/slot(?:1[3-9]|2[0-5])\\/icon$/.test(path)?before.get('/SlayTheAbyss/relicBar/slot1/icon'):undefined);\n  assert.equal(node.image,expected,path);\n  replacements.delete(path);\n }\n assert.deepEqual([...replacements.keys()],[],'every substituted semantic icon must be present');\n assert.equal(child(child(layout,'menuPanel'),'backdrop').image,nativeTheme.image.officialBackdrops.title);\n const menu=child(layout,'menuPanel'),result=child(menu,'result');"
   }
  ]
 },
 "tests/official-backdrop-assets.test.mjs": {
  "current": {
   "sha256": "67aa31111e7a7c62171b3211503cc6e75478e32c53e204ec5966483a51abd334",
   "gitBlob": "c8d24926639a162fc4f047853f2c9448fe6abe64"
  },
  "previous": {
   "sha256": "680c4dd9e1189e50d8e5e39fdab5526381a3866f439103c80907970912dfca79",
   "gitBlob": "c4c14b43f8d745d0f13810ddd71d6205372aeb20"
  },
  "hunks": [
   {
    "at": 3,
    "before": "import {gameLayout} from '../scripts/game-ui-layout.mjs';\nimport {assertNativeUiCapacity} from '../scripts/build-ui.mjs';\ntest('solid title and readable official selection/battle pictures retain their approved bindings',()=>{\n const ids=nativeTheme.image.officialBackdrops;\n assert.deepEqual(ids,{title:100001,selection:107050,act1_1:107106,act1_2:107107,act1_3:107110,\n  act2_1:107108,act2_2:107109,act2_3:107105,boss1:107280,boss2:107279});\n assert.equal(new Set(Object.values(ids)).size,10);\n const layout=gameLayout();assertNativeUiCapacity(layout);\n const menu=layout.controls.find(c=>c.name==='menuPanel');",
    "after": "import {gameLayout} from '../scripts/game-ui-layout.mjs';\nimport {assertNativeUiCapacity} from '../scripts/build-ui.mjs';\nimport {officialAssetsTheme} from '../scripts/official-assets-layout.mjs';\nimport {applyOfficialNoncombatLayout} from '../scripts/noncombat-v25-layout.mjs';\ntest('solid title and readable official selection/battle pictures retain their approved bindings',()=>{\n const ids=nativeTheme.image.officialBackdrops;\n assert.deepEqual(ids,{title:100001,selectionFallback:107271,selection:107050,act1_1:107106,act1_2:107107,act1_3:107110,\n  act2_1:107108,act2_2:107109,act2_3:107105,boss1:107280,boss2:107279});\n assert.equal(new Set(Object.values(ids)).size,11);\n const layout=gameLayout();assertNativeUiCapacity(layout);\n const menu=layout.controls.find(c=>c.name==='menuPanel');"
   },
   {
    "at": 37,
    "before": " }\n assert(!JSON.stringify(layout).includes('officialVista_'));\n});",
    "after": " }\n assert(!JSON.stringify(layout).includes('officialVista_'));\n applyOfficialNoncombatLayout(layout,officialAssetsTheme(nativeTheme));\n const landscape=selection.children.find(c=>c.name==='v25Background').children.find(c=>c.name==='landscape');\n assert.equal(landscape.image,107271,'official selection retains the approved loading landscape');\n});"
   }
  ]
 },
 "tests/pr250-budget-coverage.test.mjs": {
  "current": {
   "sha256": "418cd7a775d445a4512ac9b9810c5ff397494d8ca33fcbd560f8a3ddc575cf71",
   "gitBlob": "2d99d52070a32fc50bd06721c932ffd6833718f8"
  },
  "previous": {
   "sha256": "c9eadbc1572d4d16cc6b93104eb6fcd888e781b524527332fde9cc765ed19a27",
   "gitBlob": "25532173e1b11cb2a31ee4c3696ef76e531fb61e"
  },
  "hunks": [
   {
    "at": 7,
    "before": "const discovered=readdirSync('tests/lua').filter(file=>file.endsWith('.lua')).map(file=>`tests/lua/${file}`).sort();\n\ntest('reward partitions retain the frozen real-victory body and cover all72 original reward targets once',()=>{\n assert.equal(p.base,'a0eedf8c8cdfb3bbab292060b3d3e81103cec9de');assert.equal(p.timeoutMilliseconds,30000);\n assert.deepEqual(p.rewardHelper,{path:'tests/lua/support/warrior75_reward_cases.lua',sha256LF:'7c6e2c485274bfc7bf06abf876116956986fccf0d70526da2ff331c68b14de07'});\n assert.equal(sha(read(p.rewardHelper.path)),p.rewardHelper.sha256LF);\n assert.deepEqual(p.rewardCounts,{common:20,uncommon:36,rare:16});\n assert.equal(p.maximumRewardTargetsPerFixture,5);",
    "after": "const discovered=readdirSync('tests/lua').filter(file=>file.endsWith('.lua')).map(file=>`tests/lua/${file}`).sort();\n\nfunction beforeProductionEncounterRename(source, expectedCount) {\n // #951 renamed only these Run.startCombat encounter IDs. Reconstruct the\n // predecessor for the byte checks while the Lua tests use the current IDs.\n const calls=/(Run\\.startCombat\\((?:run|candidate|r),)(['\"])raven_adept_solo\\2\\)/g;\n assert.equal([...source.matchAll(calls)].length,expectedCount);\n return source.replace(calls,'$1$2cultist_solo$2)');\n}\n\ntest('reward partitions retain the frozen real-victory body and cover all72 original reward targets once',()=>{\n assert.equal(p.base,'a0eedf8c8cdfb3bbab292060b3d3e81103cec9de');assert.equal(p.timeoutMilliseconds,30000);\n assert.deepEqual(p.rewardHelper,{path:'tests/lua/support/warrior75_reward_cases.lua',sha256LF:'7c6e2c485274bfc7bf06abf876116956986fccf0d70526da2ff331c68b14de07'});\n assert.equal(sha(beforeProductionEncounterRename(read(p.rewardHelper.path),2)),p.rewardHelper.sha256LF);\n assert.deepEqual(p.rewardCounts,{common:20,uncommon:36,rare:16});\n assert.equal(p.maximumRewardTargetsPerFixture,5);"
   },
   {
    "at": 66,
    "before": "  original=original.slice(prefix.length,-footer.length);\n  for(const replacement of replacements){assert.equal(original.split(replacement.after).length,2);original=original.replace(replacement.after,replacement.before);}\n  assert.equal(sha(original),known.sha);const bytes=Buffer.from(original);assert.equal(bytes.length,known.bytes);\n  assert.equal(createHash('sha1').update(`blob ${bytes.length}\\0`).update(bytes).digest('hex'),known.blob);",
    "after": "  original=original.slice(prefix.length,-footer.length);\n  for(const replacement of replacements){assert.equal(original.split(replacement.after).length,2);original=original.replace(replacement.after,replacement.before);}\n  original=beforeProductionEncounterRename(original,index===0?3:1);\n  assert.equal(sha(original),known.sha);const bytes=Buffer.from(original);assert.equal(bytes.length,known.bytes);\n  assert.equal(createHash('sha1').update(`blob ${bytes.length}\\0`).update(bytes).digest('hex'),known.blob);"
   }
  ]
 },
 "tests/relic-view-layout.test.mjs": {
  "current": {
   "sha256": "675ad02b90db9f8832c2e597e7a80226718bf8c583c7cd630ad131fcff6691ef",
   "gitBlob": "369c0051207682a909e0ffab661ac3b3c7c5c1dd"
  },
  "previous": {
   "sha256": "54bc111e4cf0ece7368d1b5b20fefc70b5f74d7645459bbd1f07d37cb34075a2",
   "gitBlob": "98de41613e65eb73b7adfdf22a46b8204ed45c6f"
  },
  "hunks": [
   {
    "at": 29,
    "before": "});\nfunction assertBarGeometry(t) {\n  const [bar] = relicViewControls(t), [tray, ...slots] = bar.children;\n  const obstacles = Object.values(t.layout.nativeNode.topBar);\n  // Final battle controls use a different top-row height from node/map HUDs.",
    "after": "});\nfunction assertBarGeometry(t) {\n  const [bar] = relicViewControls(t), [tray] = bar.children;\n  const slots = bar.children.slice(1, -2);\n  const obstacles = Object.values(t.layout.nativeNode.topBar);\n  // Final battle controls use a different top-row height from node/map HUDs."
   },
   {
    "at": 61,
    "before": "  const [bar, panel] = relicViewControls(theme), v = theme.layout.relicView;\n  assert.equal(bar.name, 'relicBar');\n  const [tray, ...slots] = bar.children;\n  assert.equal(tray.name, 'tray');\n  assert.equal(slots.length, v.bar.count);\n  // Relics now occupy a second row; preserve separation in both axes, not X alone.\n  assert.equal(slots.length, 12);\n  assertBarGeometry(theme);\n  slots.forEach((slot, i) => {",
    "after": "  const [bar, panel] = relicViewControls(theme), v = theme.layout.relicView;\n  assert.equal(bar.name, 'relicBar');\n  const [tray] = bar.children;\n  const slots = bar.children.slice(1, -2);\n  const arrows = bar.children.slice(-2);\n  assert.equal(tray.name, 'tray');\n  assert.equal(slots.length, v.bar.count);\n  // Relics now occupy a second row; preserve separation in both axes, not X alone.\n  assert.equal(slots.length, 12);\n  assert.deepEqual(arrows.map(arrow => [arrow.name, arrow.position, arrow.size]), [\n    ['previous', [-624, 292], [32, 44]], ['next', [610, 292], [32, 44]],\n  ]);\n  for (const arrow of arrows) {\n    assert.equal(arrow.visible, false);\n    const hit = arrow.children.find(control => control.name === 'hit');\n    assert.equal(hit.kind, 'presetButton');\n    assert.deepEqual(hit.size, arrow.size);\n  }\n  assertBarGeometry(theme);\n  slots.forEach((slot, i) => {"
   }
  ]
 },
 "tests/responsibility-complexity.test.mjs": {
  "current": {
   "sha256": "eca9f64158443c5b8a112cde2be1289b0faec9364308b7e8447ca7e2ff6de7d6",
   "gitBlob": "c3618edc3133a492745a6a25b5b0b51922f3d950"
  },
  "previous": {
   "sha256": "a67da6f3394c5411d753c72dc8211a5cbe711846c105be3fead1d6e2f8b52be2",
   "gitBlob": "b9ef7467331c0e259c64fd07d2f58c5c44a07b9c"
  },
  "hunks": [
   {
    "at": 86,
    "before": "    'choiceActions.dualWield','M.applyChoice','commitMultipleChoice','toggleChoice',\n    'chooseMultiple','containsUid','chooseSingle','M.choose','applyDrainedAction','refreshDrainedHand','M.drain',\n    ...['writhingRoll','writhingParasite','giantHeadSlow','timeEater','reptomancerSuicide',\n      'enemyAction','staticRetaliation','classPotion','silentFinal','discover','colorless','originalV4',\n      'relicUpgradeRandomHand','playTop','darklingAction','heartBeat','spireDeathRemove',",
    "after": "    'choiceActions.dualWield','M.applyChoice','commitMultipleChoice','toggleChoice',\n    'chooseMultiple','containsUid','chooseSingle','M.choose','applyDrainedAction','refreshDrainedHand','M.drain',\n    ...['writhingRoll','writhingParasite','giantHeadSlow','timeEater','reptomancerDismissal',\n      'enemyAction','staticRetaliation','classPotion','silentFinal','discover','colorless','originalV4',\n      'relicUpgradeRandomHand','playTop','darklingAction','heartBeat','spireDeathRemove',"
   }
  ]
 },
 "tests/v25-portrait-profile.test.mjs": {
  "current": {
   "sha256": "bbd878eba6f75c900babf2385bc430d79916799e5f2b3f159c627220c9050727",
   "gitBlob": "75843c981e5d2b1b30e2d2e98460972a9f271d58"
  },
  "previous": {
   "sha256": "fc32b41101518439c78dc3505914ddafeb75d3d79d3dbc22f97865267ce99dd2",
   "gitBlob": "eb98b02e7f264fe9dc38fc0cf01a9889b03a48f8"
  },
  "hunks": [
   {
    "at": 109,
    "before": "});\n\ntest('combined native page readiness waits for the complete 1600 background and ignores the hidden legacy avatar',()=>{\n withPortraitVm(`\nlocal selectionHost=tree();stage.children.characterPanel.children.lumineSelectionBackground=selectionHost",
    "after": "});\n\ntest('native page readiness allows staged selection art and ignores the hidden legacy avatar',()=>{\n withPortraitVm(`\nlocal selectionHost=tree();stage.children.characterPanel.children.lumineSelectionBackground=selectionHost"
   },
   {
    "at": 118,
    "before": "local a=Portraits.new(stage,nil,{selectionAvatar=true,battlePortrait=true})\nassert(a:sync('menu',true,false,'ironclad'))\nassert(not a:readyForPage('menu',true,'ironclad','characterPanel'),'partial background passed readiness')\nfor _=1,1000 do a:tick();if a:status().selection.phase=='ready' then break end end\nassert(a:status().selection.total==1600 and a:status().selection.phase=='ready')\nassert(a:status().avatar.owned==0 and a:readyForPage('menu',true,'ironclad','characterPanel'),",
    "after": "local a=Portraits.new(stage,nil,{selectionAvatar=true,battlePortrait=true})\nassert(a:sync('menu',true,false,'ironclad'))\nassert(a:readyForPage('menu',true,'ironclad','characterPanel'),'selection art delayed page input')\nassert(a:status().selection.phase=='building' and not selectionHost.visible,'cold selection published an incomplete group')\nlocal partial=false\nfor _=1,1000 do\n a:tick()\n local state=a:status().selection\n if state.phase=='ready' then break end\n if selectionHost.visible then\n  assert(state.revealIndex>2,'selection published before its first two complete groups')\n  partial=true\n end\nend\nassert(partial,'selection waited for all 1600 images before publishing its first groups')\nassert(a:status().selection.total==1600 and a:status().selection.phase=='ready')\nassert(a:status().avatar.owned==0 and a:readyForPage('menu',true,'ironclad','characterPanel'),"
   },
   {
    "at": 200,
    "before": "end\nlocal backing=tree();backing:SetVisible(true);panel.children.v25Background=backing\npanel.children.details=tree({})\ntraveler:SetVisible(false)\nlocal rows={}",
    "after": "end\nlocal backing=tree();backing:SetVisible(true);panel.children.v25Background=backing\nlocal note=tree();note.text=''\npanel.children.details=tree({portraitNote=note})\ntraveler:SetVisible(false)\nlocal rows={}"
   },
   {
    "at": 261,
    "before": "selectionHost:SetVisible(false);panel.children.lumineSelectionBackground=selectionHost\nlocal backing=tree();backing:SetVisible(true);panel.children.v25Background=backing\npanel.children.details=tree({})\ntraveler:SetVisible(false)\nlocal a=Portraits.new(stage,nil,{selectionAvatar=true})",
    "after": "selectionHost:SetVisible(false);panel.children.lumineSelectionBackground=selectionHost\nlocal backing=tree();backing:SetVisible(true);panel.children.v25Background=backing\nlocal note=tree();note.text=''\npanel.children.details=tree({portraitNote=note})\ntraveler:SetVisible(false)\nlocal a=Portraits.new(stage,nil,{selectionAvatar=true})"
   },
   {
    "at": 278,
    "before": " 'the queued same-role refresh stranded a completed but hidden portrait')\nassert(a:release() and LiveCount()==0)\n`,{runtimeV2:true,officialAssets:true});\n});",
    "after": " 'the queued same-role refresh stranded a completed but hidden portrait')\nassert(a:release() and LiveCount()==0)\nselectionHost.SetSizeDelta=function(self,...)\n a:sync('menu',true,false,nil)\n return resize(self,...)\nend\nassert(a:sync('menu',true,false,'ironclad'))\nfor _=1,120 do a:tick(1/60)end\nassert(not selectionHost.visible and backing.visible and LiveCount()==0,\n 'a newer empty selection was discarded during native configuration')\nassert(a:release())\n`,{runtimeV2:true,officialAssets:true});\n});"
   }
  ]
 },
 "tests/end-turn-responsibilities.test.mjs": {
  "current": {
   "sha256": "65ca362c7b22d24f88c2df37c3d108d222caf011a60e4796e2ec671e76d6744c",
   "gitBlob": "2f99866b37ed40d7a619f737bf50f62be3f5a39b"
  },
  "previous": {
   "sha256": "8aeaa7ad14f1c5ef274a544e59380ec10b6d450bca1ff197523d31e5becf26cc",
   "gitBlob": "5ac7ac2e9dc8d8d15c5e27fdb5edf323fa1294df"
  },
  "hunks": [
   {
    "at": 101,
    "before": " assert.equal(preRelicQuerySource(file,current),old);assert.equal(wrapped(file),old);\n const outerReadCount=466;\n let validReads;",
    "after": " assert.equal(preRelicQuerySource(file,current),old);assert.equal(wrapped(file),old);\n const outerReadCount=543;\n let validReads;"
   },
   {
    "at": 106,
    "before": "  if(!validReads){\n   // Current replay cohorts add fresh linked reads around the original owner sequence.\n   // Bind the complete live trace after normalizing Windows checkout endings.\n   assert.equal(reads.length,9898);\n   assert.equal(hash(JSON.stringify(reads)),'79bf86a4544d87721356dea6a0e668a4cb1ffbd076b8c97ba227107540d6b8e0');\n   const entranceBytes=readFileSync('tests/fixtures/ui-entrance-source.json.gz');\n   assert.equal(hash(entranceBytes),'7ac3f53b242819cdb569c0a1ebf60de0605b72297a1072ea612bfeb11b0597c9');\n   const entranceOwners=Object.keys(JSON.parse(gunzipSync(entranceBytes)).files),priorReads=[];\n   let entranceGroups=0;\n   for(let i=0;i<reads.length;){\n    if(JSON.stringify(reads.slice(i,i+entranceOwners.length))===JSON.stringify(entranceOwners)){\n     entranceGroups++;i+=entranceOwners.length;\n    }else priorReads.push(reads[i++]);\n   }\n   assert.equal(entranceGroups,22,'all complete fresh entrance cohorts remain observed');\n   assert.equal(priorReads.length,9458);\n   assert.equal(hash(JSON.stringify(priorReads)),'fcf5e049f6c8f284fa248ebe012c2f7a5620546e453ebc8766fea8c1d14bd749','unchanged complete prior admission sequence');\n   let position=-1;",
    "after": "  if(!validReads){\n   // Linked current entrance owners now reread their own complete Release cohorts.\n   assert.equal(reads.length,14190);\n   assert.equal(hash(JSON.stringify(reads)),'1f62d6113d65b19d114057a30d8ad7dee5935e8d72ca187e4505d41c17bd499d');\n   const entranceBytes=readFileSync('tests/fixtures/ui-entrance-source.json.gz');\n   assert.equal(hash(entranceBytes),'7ac3f53b242819cdb569c0a1ebf60de0605b72297a1072ea612bfeb11b0597c9');\n   const entranceOwners=Object.keys(JSON.parse(gunzipSync(entranceBytes)).files);\n   const select='src/lua/abyss_character_select_view.lua', lifecycle='src/lua/abyss_game_ui_lifecycle.lua';\n   const portraits='src/lua/abyss_traveler_portraits.lua', feedback='src/lua/abyss_node_ui_feedback.lua';\n   const input='src/lua/abyss_node_ui_input.lua', camp='src/lua/abyss_node_ui_camp_actions.lua';\n   const treasure='src/lua/abyss_node_ui_treasure.lua';\n   const linkedReads=new Map([\n    [select,[lifecycle,portraits]], [lifecycle,[select,portraits]], [portraits,[select,lifecycle]],\n    [feedback,[camp,input,treasure]], [input,[camp,feedback,treasure]],\n   ]);\n   const entranceReads=entranceOwners.flatMap(owner=>[owner,...(linkedReads.get(owner)??[])]);\n   const outsideEntranceReads=[];\n   let entranceGroups=0;\n   for(let i=0;i<reads.length;){\n    if(entranceReads.every((owner,index)=>reads[i+index]===owner)){\n     entranceGroups++;i+=entranceReads.length;\n    }else outsideEntranceReads.push(reads[i++]);\n   }\n   assert.equal(entranceGroups,27,'all complete fresh entrance cohorts retain their original owner order');\n   assert.equal(outsideEntranceReads.length,13326);\n   assert.equal(hash(JSON.stringify(outsideEntranceReads)),'4b6a77ead601fbe70a160dd283b26a1bb65843c29afa8956f23b767790fd6179',\n    'exact Release admission sequence outside the entrance cohorts');\n   let position=-1;"
   },
   {
    "at": 164,
    "before": " assert.throws(()=>preRelicQuerySource(file,current,{readSource:p=>p===config?JSON.stringify(JSON.parse(read(p))):read(p)}),{message:configDrift});\n // The first 466 observations include the new complete entrance cohort.\n // Mutate the first config observation from the wrapped N35 projector.\n const firstInnerConfig=validReads.indexOf(config,outerReadCount);\n assert.equal(firstInnerConfig,468);\n const innerOccurrence=validReads.slice(0,firstInnerConfig+1).filter(path=>path===config).length;",
    "after": " assert.throws(()=>preRelicQuerySource(file,current,{readSource:p=>p===config?JSON.stringify(JSON.parse(read(p))):read(p)}),{message:configDrift});\n // The outer observations include the complete current entrance cohort.\n // Mutate the first config observation from the wrapped N35 projector.\n const firstInnerConfig=validReads.indexOf(config,outerReadCount);\n assert.equal(firstInnerConfig,545);\n const innerOccurrence=validReads.slice(0,firstInnerConfig+1).filter(path=>path===config).length;"
   }
  ]
 },
 // Max HP historical archives still execute the original approved-UI helper.
 "tests/helpers/approved-ui-inverse.mjs": {
  "current": {
   "sha256": "515cc86198104355318e98e8d17aa614a6600cd3f6fa7f6b19b817f81a77d354",
   "gitBlob": "3648a38052cc1f5ad1cb0a9299722d5b687cf733"
  },
  "previous": {
   "sha256": "5d6fab1429f81bf072cfa72e63d520b1e5d0dc1cf8faf9d8353c6bae3b1b15c8",
   "gitBlob": "ef2b465dd6de4c3225312f08b80fb794e8aed341"
  },
  "hunks": [
   {
    "at": 6,
    "before": "import {preIntegratedNodeUiSource} from './approved-node-ui-refactor.mjs';\nimport assert from 'node:assert/strict';",
    "after": "import {preIntegratedNodeUiSource} from './approved-node-ui-refactor.mjs';\nimport {beforeReleaseClosureFixture} from './release-closure-fixture-source.mjs';\nimport {restoreExactFixtureHunks} from './exact-fixture-hunks.mjs';\nimport {exactSourceMatches} from './source-fingerprint.mjs';\nimport assert from 'node:assert/strict';"
   },
   {
    "at": 33,
    "before": "}\n// One additional test-only layer, never a replacement for PR302's frozen 26",
    "after": "}\n// #391 adds native monster control selectors after the exact #313 fixture.\n// Compose its successor solely for this earlier approved-UI witness.\nconst nemesisControlFixture=Object.freeze({\n \"path\": \"tests/lua/nemesis_ui.lua\",\n \"beforeSha256\": \"736a67ba3158850ad67d716b7ec62fe8ac6629d0b24ff673b1b7e975ddd340d9\",\n \"beforeBlob\": \"b615f3f06cc8fad9a78c7aa88360bea1c1df08b0\",\n \"afterSha256\": \"4c3655ba6d08705d742e307aa56d6d2fadfb67c5379df2462e0a04792ebee4d7\",\n \"afterBlob\": \"02fc4d2e206fe7447fc8e8a186494603faa25b66\",\n \"hunks\": [\n  {\n   \"at\": 0,\n   \"before\": \"local testStart=dofile('tests/lua/support/game_ui_fixture.lua').start\",\n   \"after\": \"local monsterControl=dofile('tests/lua/support/monster_control_fixture.lua')\\nlocal testStart=dofile('tests/lua/support/game_ui_fixture.lua').start\"\n  },\n  {\n   \"at\": 13,\n   \"before\": \"assert(N.Run.startRoomCombat(r,'elite'));N.force(r.combat,'burn');host:refresh()\\nlocal panel=root:GetChild('battlePanel');local box=panel:GetChild('enemy1');local _,tap=H.controls(panel)\\neq(box:GetChild('name').text,'天罚');eq(box:GetChild('hp').text,'185/185')\",\n   \"after\": \"assert(N.Run.startRoomCombat(r,'elite'));N.force(r.combat,'burn');host:refresh()\\nlocal panel=root:GetChild('battlePanel');local box=monsterControl(panel,'enemy1');local _,tap=H.controls(panel)\\neq(box:GetChild('name').text,'天罚');eq(box:GetChild('hp').text,'185/185')\"\n  },\n  {\n   \"at\": 20,\n   \"before\": \"assert(N.Run.endTurn(r));N.force(r.combat,'fire');host:refresh()\\neq(box:GetChild('intent').text,'6×3')\\nbox:GetChild('statusRow'):GetChild('hit').click({touchId=92})\\nlocal info=panel:GetChild('statusInfo');assert(info.visible)\",\n   \"after\": \"assert(N.Run.endTurn(r));N.force(r.combat,'fire');host:refresh()\\neq(box:GetChild('intent').text,'6x3')\\ndofile('tests/lua/support/monster_power_control_fixture.lua')(box,'nemesis_intangible'):GetChild('hit').click({touchId=92})\\nlocal info=panel:GetChild('statusInfo');assert(info.visible)\"\n  }\n ]\n});\nfunction preNemesisControlFixture(path,source){\n if(path!==nemesisControlFixture.path||typeof source!=='string')return source;\n const lf=source.replaceAll('\\r\\n','\\n');\n if(source!==lf&&source!==lf.replaceAll('\\n','\\r\\n'))return source;\n const current=beforeReleaseClosureFixture(path,source);\n if(!exactSourceMatches(current,{sha256:nemesisControlFixture.afterSha256,gitBlob:nemesisControlFixture.afterBlob}))return current;\n assert.equal(approvedUi.files[path].afterSha256,nemesisControlFixture.beforeSha256,'exact approved Nemesis control predecessor binding');\n const prior=restoreExactFixtureHunks(nemesisControlFixture,path,current);\n assert(exactSourceMatches(prior,{sha256:nemesisControlFixture.beforeSha256,gitBlob:nemesisControlFixture.beforeBlob}),\n  'exact approved Nemesis control predecessor');\n return source===lf?prior:prior.replaceAll('\\n','\\r\\n');\n}\n// One additional test-only layer, never a replacement for PR302's frozen 26"
   },
   {
    "at": 74,
    "before": "export function preApprovedUiOuterSource(path,source){\n source=preBattleLifeSource(path,source);\n return approvedUi.files[path]?preEventProductionSource(path,preRelicViewUiSource(path,preHeroVisualSource(path,source))):source;",
    "after": "export function preApprovedUiOuterSource(path,source){\n source=preNemesisControlFixture(path,preBattleLifeSource(path,source));\n return approvedUi.files[path]?preEventProductionSource(path,preRelicViewUiSource(path,preHeroVisualSource(path,source))):source;"
   }
  ]
 },
 "tests/run-max-hp-config-inverse.test.mjs": {
  "current": {
   "sha256": "e3aecc0c958104e847c88df5415eeafa84456718c99b1a934ba4ee93d05f1d69",
   "gitBlob": "c49f02335fba887f334a8495c11d8a4f527a228b"
  },
  "previous": {
   "sha256": "a40879d35601e22bfbd5622fce1604d0a9ee7a2222d15525f66d7e82b862928f",
   "gitBlob": "408137bf30fd65836eb8a0eaba40de3a3902bdd5"
  },
  "hunks": [
   {
    "at": 0,
    "before": "import {currentProductionRereads} from './helpers/current-production-source-reads.mjs';\nimport {beforeInputRetirementReader,pointerInputPath,retiredControllerPath} from './helpers/input-retirement-source.mjs';",
    "after": "import {currentProductionRereads,releaseArchitectureReadTrace} from './helpers/current-production-source-reads.mjs';\nimport {beforeInputRetirementReader,pointerInputPath,retiredControllerPath} from './helpers/input-retirement-source.mjs';"
   },
   {
    "at": 9,
    "before": "import {createHash} from 'node:crypto';\nimport {analyzeSources} from '../scripts/check-architecture.mjs';",
    "after": "import {createHash} from 'node:crypto';\nimport {beforeReleaseClosureFixture} from './helpers/release-closure-fixture-source.mjs';\nimport {analyzeSources} from '../scripts/check-architecture.mjs';"
   },
   {
    "at": 28,
    "before": "  const raw=binding.existing?readInput(path):Buffer.from(binding.source);\n  const source=path.endsWith('.gz')?raw:Buffer.from(raw.toString('utf8').replaceAll('\\r\\n','\\n'));\n  assert.equal(hash(source),binding.sha256,'original complete Run and Nodes chain bytes: '+path);",
    "after": "  const raw=binding.existing?readInput(path):Buffer.from(binding.source);\n  const original=binding.existing&&path==='tests/helpers/approved-ui-inverse.mjs'?beforeReleaseClosureFixture(path,raw):raw;\n  const source=path.endsWith('.gz')?original:Buffer.from(original.toString('utf8').replaceAll('\\r\\n','\\n'));\n  assert.equal(hash(source),binding.sha256,'original complete Run and Nodes chain bytes: '+path);"
   },
   {
    "at": 190,
    "before": " assert.notEqual(hash(accepted),expected.combined,'current develop target is not the ancient Run target');\n // Battle periphery adds six raw reads while retaining the entire prior closure.\n const admittedReads=[...reads];\n const battlePeripheryReads=new Map([\n  [78,'src/lua/abyss_battle_enemy_view.lua'],\n  [142,'src/lua/abyss_feedback.lua'],\n  [143,'src/lua/abyss_feedback_actor_painter.lua'],\n  [301,'src/lua/abyss_feedback.lua'],\n  [396,'src/lua/abyss_feedback.lua'],\n  [460,'src/lua/abyss_feedback.lua'],\n ]);\n for(const [position,owner]of battlePeripheryReads)assert.equal(admittedReads[position],owner,'exact battle periphery read');\n assert.equal(admittedReads.length,486,'complete fresh raw closure size');\n assert.equal(hash(JSON.stringify(admittedReads)),'266836ee07bb2c4145aba3c488f17109029f614d38793fe54a295ef6eb3e495b',\n  'complete fresh raw closure in admission order on the current Develop sources');\n const originalReads=admittedReads.filter((_owner,position)=>!battlePeripheryReads.has(position));\n assert.equal(originalReads.length,480,'the prior owner closure was retained');",
    "after": " assert.notEqual(hash(accepted),expected.combined,'current develop target is not the ancient Run target');\n // The release adds nineteen raw reads and retains the prior periphery trace.\n const admittedReads=[...reads];\n assert.equal(admittedReads.length,releaseArchitectureReadTrace.count,'complete fresh raw closure size');\n assert.equal(hash(JSON.stringify(admittedReads)),releaseArchitectureReadTrace.sha256,\n  'complete fresh raw closure in admission order on the current Release sources');\n const releaseReadPositions=new Set([3,4,9,10,16,18,19,20,21,22,30,31,115,221,222,223,367,368,369]);\n const battlePeripheryReads=new Map([\n  [90,'src/lua/abyss_battle_enemy_view.lua'],\n  [155,'src/lua/abyss_feedback.lua'],\n  [156,'src/lua/abyss_feedback_actor_painter.lua'],\n  [317,'src/lua/abyss_feedback.lua'],\n  [415,'src/lua/abyss_feedback.lua'],\n  [479,'src/lua/abyss_feedback.lua'],\n ]);\n for(const [position,owner]of battlePeripheryReads)assert.equal(admittedReads[position],owner,'exact battle periphery read');\n const priorReads=admittedReads.filter((_owner,position)=>!releaseReadPositions.has(position));\n assert.equal(priorReads.length,486,'the complete battle periphery trace is retained');\n assert.equal(hash(JSON.stringify(priorReads)),'266836ee07bb2c4145aba3c488f17109029f614d38793fe54a295ef6eb3e495b',\n  'exact prior battle periphery admission order');\n const originalReads=admittedReads.filter((_owner,position)=>!releaseReadPositions.has(position)&&!battlePeripheryReads.has(position));\n assert.equal(originalReads.length,480,'the prior owner closure was retained');"
   }
  ]
 },
 "tests/v25-map-layout.test.mjs": {
  "current": {
   "sha256": "00dd0b2a7c03c35ee2410952030afd5b7818f0b92688815aa988255988c4990b",
   "gitBlob": "8a51496ab15aae494f32a11da371bcfbe85599f2"
  },
  "previous": {
   "sha256": "24976b84103484e73cf8f646c42a30cc9dbeb1bb7a99c6449e01e61674cad2b4",
   "gitBlob": "a4c4760723d4f7f2b8e474df3519353f461e525c"
  },
  "hunks": [
   {
    "at": 128,
    "before": "import {gunzipSync} from 'node:zlib';\nimport {beforeAuthenticatedRecordingStage} from './helpers/release-ui-restore-source.mjs';\nimport {beforeCurrentReplayFixes} from './helpers/current-replay-fix-sources.mjs';\ntest('recording historical continuation accepts exact owners and rejects stale, drifted or mixed reads',()=>{\n const {files}=JSON.parse(gunzipSync(readFileSync('tests/helpers/recording-0401-source.json.gz')));",
    "after": "import {gunzipSync} from 'node:zlib';\nimport {beforeAuthenticatedRecordingStage} from './helpers/release-ui-restore-source.mjs';\nimport {beforeUiEntrance} from './helpers/ui-entrance-source.mjs';\ntest('recording historical continuation accepts exact owners and rejects stale, drifted or mixed reads',()=>{\n const {files}=JSON.parse(gunzipSync(readFileSync('tests/helpers/recording-0401-source.json.gz')));"
   },
   {
    "at": 145,
    "before": " const expectedLf=expected.replaceAll('\\r\\n','\\n');\n for(const owner of ['src/lua/abyss_game_ui.lua','src/lua/abyss_node_ui_faces.lua','src/lua/abyss_game_ui_run.lua']){\n  const raw=readFileSync(owner,'utf8'),stale=beforeCurrentReplayFixes(owner,raw);\n  assert.notEqual(stale,raw,'negative control must change production bytes');\n  for(const bad of [stale,raw+'\\n-- unreviewed drift\\n']){",
    "after": " const expectedLf=expected.replaceAll('\\r\\n','\\n');\n for(const owner of ['src/lua/abyss_game_ui.lua','src/lua/abyss_node_ui_faces.lua','src/lua/abyss_game_ui_run.lua']){\n  const raw=readFileSync(owner,'utf8'),stale=beforeUiEntrance(owner,raw);\n  assert.notEqual(stale,raw,'negative control must change production bytes');\n  for(const bad of [stale,raw+'\\n-- unreviewed drift\\n']){"
   }
  ]
 }
});

// The unified build retains the exact pre-unification GIL test for older replay views.
const unifiedGilFixture={
 "current": {
  "sha256": "a031bf41ba5383976a8ce3f15b70798042f363920fb8d03a14a108cf58952ec4",
  "gitBlob": "47cdb8b71e60a22ef0398172744fec302c7237d8"
 },
 "previous": {
  "sha256": "d5ec827fa24b3ad3ff33b304723efddc4205599dbc8e8c28141aa3d22d99c1c6",
  "gitBlob": "0e38620640049ad1f0e0a7a8a4c9a82b1f0a629b"
 },
 "hunks": [
  {
   "at": 6,
   "before": "import { test } from 'node:test';\nimport { verifyDownloadedArtifact, verifyPublishedRebase, verifyReceipts } from '../scripts/gil-candidate.mjs';\nimport { api, approvedRequest, buildOnlyRequest, candidateTarget, encoderSha256, findArtifact, validationTarget, verifySource } from '../scripts/gil-candidate-preflight.mjs';\nimport { fileRecord } from '../scripts/evidence-files.mjs';\nimport { hostedCandidatePath, verifiedPayloadInputs } from '../scripts/hosted-gil-receipt.mjs';",
   "after": "import { test } from 'node:test';\nimport { verifyDownloadedArtifact, verifyPublishedRebase, verifyReceipts } from '../scripts/gil-candidate.mjs';\nimport { api, approvedRequest, buildOnlyRequest, candidateTarget, encoderSha256, findArtifact, releaseBuildRequest, releaseBuildTarget, validationTarget, verifySource } from '../scripts/gil-candidate-preflight.mjs';\nimport { fileRecord } from '../scripts/evidence-files.mjs';\nimport { hostedCandidatePath, verifiedPayloadInputs } from '../scripts/hosted-gil-receipt.mjs';"
  },
  {
   "at": 22,
   "before": "const hotfix = candidateTarget(branch, sourceSha);\n\ntest('trusted develop owns protection, while audit receives the bound build context', () => {\n  const workflow = readFileSync(new URL('../.github/workflows/gil-candidate.yml', import.meta.url), 'utf8').replaceAll('\\r\\n', '\\n');\n  assert.match(workflow, /^    if: github\\.event_name == 'workflow_dispatch' && github\\.repository_id == '1429751262' && github\\.ref == 'refs\\/heads\\/develop'$/m);\n  assert.match(workflow, /^          GIL_BASE_URL: \\$\\{\\{ secrets\\.GIL_BASE_URL \\}\\}$/m);\n  assert.equal(workflow.match(/secrets\\./g).length, 1);\n  const sourceCheckout = workflow.slice(workflow.indexOf('          path: source\\n'), workflow.indexOf('          path: miliastra-mcp\\n'));\n  const sparse = sourceCheckout.match(/^          sparse-checkout: \\|\\n((?: {12}\\S+\\n)+)/m)?.[1];\n  assert.deepEqual(sparse?.trim().split('\\n').map(path => path.trim()), [\n    'scripts', 'src/lua', 'data', 'config', 'tools', 'art/characters/traveler-geo/portraits',\n    'art/lowpoly-select', 'art/performance', 'experiments/lumine-native-fit/fit-hybrid-final',\n  ]);\n  const audit = workflow.slice(workflow.indexOf('- name: Audit the final GIL'), workflow.indexOf('- uses: actions/upload-artifact'));\n  for (const [name, expression] of Object.entries({\n    SOURCE_REF: 'inputs.source_ref', SOURCE_SHA: 'inputs.source_sha', WORK_KEY: 'steps.candidate.outputs.work_key',\n    BASE_SHA256: 'steps.candidate.outputs.base_sha256', REQUEST_ID: 'steps.candidate.outputs.request_id',\n    RELEASE_VERSION: 'steps.candidate.outputs.release_version', QUALITY_RUN: 'steps.candidate.outputs.quality_run',\n    QUALITY_ATTEMPT: 'steps.candidate.outputs.quality_attempt', QUALITY_CHECKOUT_ARTIFACT: 'steps.candidate.outputs.quality_checkout_artifact',\n    LICENSES_RUN: 'steps.candidate.outputs.licenses_run',",
   "after": "const hotfix = candidateTarget(branch, sourceSha);\n\ntest('only the unified workflow builds, audits and publishes a gated release download', () => {\n  const path = new URL('../.github/workflows/gil-build.yml', import.meta.url);\n  const workflow = readFileSync(path, 'utf8').replaceAll('\\r\\n', '\\n');\n  assert.equal(existsSync(new URL('../.github/workflows/gil-candidate.yml', import.meta.url)), false);\n  assert.match(workflow, /workflows: \\[Quality, Licenses\\]/);\n  assert.match(workflow, /github\\.event\\.workflow_run\\.event == 'workflow_dispatch'/);\n  assert.match(workflow, /GIL_PRODUCTION_WORK_KEY: \\$\\{\\{ vars\\.GIL_PRODUCTION_WORK_KEY \\}\\}/);\n  assert.match(workflow, /ref: \\$\\{\\{ env\\.SOURCE_SHA \\}\\}/);\n  assert.doesNotMatch(workflow, /release:\\n|secrets\\.|environment:|contents: write|attach-release:/);\n  const sourceCheckout = workflow.slice(workflow.indexOf('          path: source\\n'), workflow.indexOf('          path: miliastra-mcp\\n'));\n  const sparse = sourceCheckout.match(/^          sparse-checkout: \\|\\n((?: {12}\\S+\\n)+)/m)?.[1];\n  assert.deepEqual(sparse?.trim().split('\\n').map(path => path.trim()), [\n    '.github/workflows', 'scripts', 'src/lua', 'data', 'config', 'tools', 'art/characters/traveler-geo/portraits',\n    'art/lowpoly-select', 'art/performance', 'experiments/lumine-native-fit/fit-hybrid-final',\n  ]);\n  const audit = workflow.slice(workflow.indexOf('- name: Audit the final GIL'), workflow.indexOf('- uses: actions/upload-artifact'));\n  for (const [name, expression] of Object.entries({\n    WORK_KEY: 'steps.candidate.outputs.work_key', BASE_SHA256: 'steps.candidate.outputs.base_sha256',\n    REQUEST_ID: 'steps.candidate.outputs.request_id', RELEASE_VERSION: 'steps.candidate.outputs.release_version',\n    GIL_RELEASE_ARTIFACT: 'steps.candidate.outputs.archive', QUALITY_RUN: 'steps.candidate.outputs.quality_run',\n    QUALITY_ATTEMPT: 'steps.candidate.outputs.quality_attempt', QUALITY_CHECKOUT_ARTIFACT: 'steps.candidate.outputs.quality_checkout_artifact',\n    LICENSES_RUN: 'steps.candidate.outputs.licenses_run',"
  },
  {
   "at": 171,
   "before": "});\n\ntest('automatic build pushes are scoped to primary develop and the diagnostic branch in the known fork', () => {\n  const workflow = readFileSync(new URL('../.github/workflows/gil-build.yml', import.meta.url), 'utf8').replaceAll('\\r\\n', '\\n');\n  const fork = '1460133275';\n  const testRef = 'refs/heads/ci/full/gil-build/v2.2.0-closure-20261127';\n  assert.deepEqual(validationTarget('1429751262', 'refs/heads/develop', sourceSha), { branch: 'develop' });\n  assert.deepEqual(validationTarget(fork, testRef, sourceSha), { branch: testRef.slice(11) });\n  assert.throws(() => validationTarget(fork, 'refs/heads/develop', sourceSha), /assigned Fork B/);\n  assert.throws(() => validationTarget('1429751262', testRef, sourceSha), /assigned Fork B/);\n  assert.throws(() => validationTarget('3', testRef, sourceSha), /assigned Fork B/);\n  assert.match(workflow, /push:\\n    branches: \\[develop, 'ci\\/full\\/gil-build\\/\\*\\*'\\]/);\n  assert.match(workflow, /PUBLISH_ARTIFACT: 'false'/);\n  assert.match(workflow, /path: source\\/build\\/gil-artifact\\/manifest\\.json\\n/);\n  assert.doesNotMatch(workflow, /secrets\\.|environment:/);\n  const buildSteps = workflow.slice(workflow.indexOf('      - name: Fetch and verify the published project GIL'));\n  assert.equal(buildSteps.match(/^      - (?:name|uses):/gm)?.length, 9);\n  assert.equal(buildSteps.match(/^        if: steps\\.candidate\\.outputs\\.build == 'true'$/gm)?.length, 9);\n  const archive = readFileSync(new URL('../.github/workflows/gil-candidate.yml', import.meta.url), 'utf8');\n  const usedActions = [...workflow.matchAll(/^\\s*- uses: (actions\\/[a-z-]+@[0-9a-f]+)\\b/gm)];\n  assert.equal(usedActions.length, 6);\n  for (const [, action] of usedActions) assert(archive.includes(`uses: ${action} `), `Build action must use the archive pin: ${action}`);\n});\n",
   "after": "});\n\ntest('diagnostic refs only upload a manifest and do not trigger tag rebuilds', () => {\n  const workflow = readFileSync(new URL('../.github/workflows/gil-build.yml', import.meta.url), 'utf8').replaceAll('\\r\\n', '\\n');\n  const fork = '1460133275';\n  const testRef = 'refs/heads/ci/full/gil-build/v2.2.0-closure-20261127';\n  for (const branch of ['develop', 'master', 'test/gil-build/probe']) {\n    assert.deepEqual(validationTarget('1429751262', 'refs/heads/' + branch, sourceSha), { branch });\n  }\n  assert.deepEqual(validationTarget(fork, testRef, sourceSha), { branch: testRef.slice(11) });\n  assert.throws(() => validationTarget(fork, 'refs/heads/develop', sourceSha), /assigned Fork B/);\n  assert.throws(() => validationTarget('1429751262', testRef, sourceSha), /assigned Fork B/);\n  assert.throws(() => validationTarget('3', testRef, sourceSha), /assigned Fork B/);\n  assert.throws(() => validationTarget('1429751262', 'refs/tags/engine-v2.2.0', sourceSha), /enabled primary ref/);\n  assert.match(workflow, /path: source\\/build\\/gil-artifact\\/manifest\\.json\\n/);\n  assert.match(workflow, /outputs\\.build == 'true' && steps\\.candidate\\.outputs\\.archive != 'true'/);\n  assert.match(workflow, /outputs\\.build == 'true' && steps\\.candidate\\.outputs\\.archive == 'true'/);\n  assert.match(workflow, /group: gil-build-.*head_branch.*head_sha/);\n});\n\ntest('unified build admits exact primary release events and never a PR, foreign run or tag', () => {\n  const release = { repoId: String(repo.id), ref: 'refs/heads/' + branch, controllerSha: sourceSha,\n    source: sourceSha, branch, event: 'workflow_dispatch' };\n  assert.deepEqual(releaseBuildTarget(release), hotfix);\n  assert.deepEqual(releaseBuildTarget({...release, event:'push'}), hotfix);\n  for (const changes of [{event:'release'}, {ref:'refs/tags/engine-v2.1.1'}, {repoId:'3'}, {controllerSha:'3'.repeat(40)}]) {\n    assert.throws(() => releaseBuildTarget({...release, ...changes}), /formal GIL|Release GIL input/);\n  }\n  const upstream = {repository:repo, head_repository:repo, event:'workflow_dispatch', status:'completed', conclusion:'success',\n    path:'.github/workflows/quality.yml', head_branch:branch, head_sha:sourceSha};\n  const automatic = {...release, event:'workflow_run', ref:'refs/heads/develop', controllerSha:policy.controllerSha, upstream};\n  assert.deepEqual(releaseBuildTarget(automatic), hotfix);\n  assert.deepEqual(releaseBuildTarget({...automatic, upstream:{...upstream, path:'.github/workflows/licenses.yml'}}), hotfix);\n  for (const changes of [{event:'pull_request'}, {conclusion:'failure'}, {head_repository:{id:3}}, {head_sha:'3'.repeat(40)},\n    {head_branch:'develop'}, {path:'.github/workflows/arbitrary.yml'}]) {\n    assert.throws(() => releaseBuildTarget({...automatic, upstream:{...upstream, ...changes}}), /successful primary/);\n  }\n});\n\ntest('equivalent triggers share one artifact request but changed Full, license or build policy gets a new candidate', () => {\n  const checks = {quality:7, qualityAttempt:1, qualityCheckoutArtifact:8, licenses:9};\n  const request = (key=workKey, evidence=checks, files=policy.checkedFiles) => releaseBuildRequest(key, sourceSha, hotfix, evidence, files);\n  assert.equal(request().baseSha256, legacyGilArchive.sha256);\n  assert.equal(request().custody, 'gil-build-v1');\n  assert.equal(request().id, request().id);\n  const defaultRequest = releaseBuildRequest(undefined, sourceSha, hotfix, checks, policy.checkedFiles);\n  assert.equal(defaultRequest.configuration.workKey, 'offline-candidate');\n  assert.equal(defaultRequest.id, request('').id);\n  assert.equal(defaultRequest.id, request('offline-candidate').id);\n  assert.notEqual(defaultRequest.id, request().id);\n  for (const key of ['alpha-test', 'offline-performance', 'bad label', 99]) {\n    assert.throws(() => request(key), /GIL_PRODUCTION_WORK_KEY/);\n  }\n  assert.throws(() => request(workKey, {...checks, licenses:0}), /exact Full/);\n  assert.notEqual(request().id, request(workKey, {...checks, qualityAttempt:2}).id);\n  assert.notEqual(request().id, request(workKey, {...checks, licenses:10}).id);\n  assert.notEqual(request().id, request(workKey, checks, ['3'.repeat(64)]).id);\n});\n"
  }
 ]
};

// The current legacy browser fixture exercises warm detail reuse and genuine
// generation retirement. Historical replays still read the exact former case.
const permanentDeckRuntimeFixture=Object.freeze({
 "previous": {
  "sha256": "327cea26d0022ebddbc04f833568b9ada9e608ea9872b526b4af91de84c1057e",
  "gitBlob": "58f48f1073c6d39710aee68e9a055dbddaf7a0f8"
 },
 "current": {
  "sha256": "608f5e266b4b1ab48b762f74088d1e018b7ee8aa0864546a75745356e3a082c7",
  "gitBlob": "12d5666dc00a9a432141e3bc4ad6d8ccc54e23fb"
 },
 "hunks": [
  {
   "at": 1312,
   "before": "`;\n\ntest('official permanent browser handles 0/1/5/6/17 cards, deferred index origins, detail return and recycled late callbacks',t=>{\n runOfficial(t,officialDeckBrowserSetup+`\nfor _,origin in ipairs({0,1})do",
   "after": "`;\n\ntest('official permanent browser handles 0/1/5/6/17 cards, deferred index origins, warm detail return and retired callbacks',t=>{\n runOfficial(t,officialDeckBrowserSetup+`\nfor _,origin in ipairs({0,1})do"
  },
  {
   "at": 1329,
   "before": " if amount==0 then assert(not deck.pending and not deck.calibrating and not deck.pendingGrid,'empty browser retained readiness work')end\n grid:flush();deck:update();grid:flush()\n if amount>0 then warmed=true end\n assert(grid.itemCount==amount and grid.scrollProgress==0)",
   "after": " if amount==0 then assert(not deck.pending and not deck.calibrating and not deck.pendingGrid,'empty browser retained readiness work')end\n grid:flush();deck:update();grid:flush()\n if amount==17 then\n  -- The legacy fixture flushes at most 12 cells; this viewport also\n  -- intersects a third row and still needs indices 12 through 14.\n  assert(deck.pendingGrid,'partial third row was accepted as ready')\n  for i=12,14 do grid:recycle(i,origin+i)end\n end\n assert(not deck.pendingGrid,'complete visible grid remained pending')\n if amount>0 then warmed=true end\n assert(grid.itemCount==amount and grid.scrollProgress==0)"
  },
  {
   "at": 1345,
   "before": "  assert(uid==201 and not first:GetChild('uid').visible)\n  calibration(first,origin);assert(not deck.pending and deck.bindings[first].uid==uid)\n  local late=grid.refreshCallback;local hit=first:GetChild('hit')\n  grid.scrollProgress=.45\n  assert(hit.listeners.drag==nil and hit.listeners.endDrag==nil)",
   "after": "  assert(uid==201 and not first:GetChild('uid').visible)\n  calibration(first,origin);assert(not deck.pending and deck.bindings[first].uid==uid)\n  local current=grid.refreshCallback;local hit=first:GetChild('hit')\n  grid.scrollProgress=.45\n  assert(hit.listeners.drag==nil and hit.listeners.endDrag==nil)"
  },
  {
   "at": 1353,
   "before": "  assert(panel:GetChild('cardFocus').visible and panel:GetChild('pileReturn').visible)\n  assert(not hit.click(),'hidden list receiver replaced the active detail')\n  assert(panel:GetChild('pileReturn'):GetChild('hit').click());deck:update();grid:flush()\n  assert(not deck.cardDetail and grid.visible and grid.scrollProgress==.45)\n  local fresh=grid.items[0];local freshUid=deck.bindings[fresh].uid\n  late(fresh,origin+amount-1)\n  assert(deck.bindings[fresh].uid==freshUid,'late list callback rebound the returned detail list')\n  assert(first.alive==false and not deck.bindings[first] and not hit.click(),'retired detail receiver remained live')\n  if amount==17 then\n   grid.deferRefresh,grid.destroyOnRefresh=false,false\n   local reused=grid:recycle(0,origin+16)",
   "after": "  assert(panel:GetChild('cardFocus').visible and panel:GetChild('pileReturn').visible)\n  assert(not hit.click(),'hidden list receiver replaced the active detail')\n  current(first,origin+amount);assert(first.visible and deck.bindings[first].uid==uid,\n   'hidden list refresh mutated the active card')\n  assert(panel:GetChild('pileReturn'):GetChild('hit').click());deck:update()\n  assert(not deck.cardDetail and grid.visible and grid.scrollProgress==.45)\n  assert(grid.refreshCallback==current and grid.items[0]==first and first.alive~=false and deck.bindings[first].uid==uid,\n   'warm detail return replaced the live list receiver')\n  assert(hit.click() and deck.cardDetail.instance.uid==uid,'warm receiver did not reopen the same card')\n  assert(panel:GetChild('pileReturn'):GetChild('hit').click());deck:update()\n  if amount==17 then\n   assert(deck:setSort('original'));grid:flush()\n   for i=12,14 do grid:recycle(i,origin+i)end\n   assert(not deck.pendingGrid)\n   local fresh=grid.items[0]\n   assert(grid.refreshCallback~=current and fresh~=first and deck.bindings[fresh].uid==uid,\n    'new list generation did not install its own receiver')\n   current(fresh,origin+16)\n   assert(deck.bindings[fresh].uid==uid,'obsolete refresh rebound a current cell')\n   assert(first.alive==false and not deck.bindings[first] and not hit.click(),'retired refresh receiver remained live')\n   grid.deferRefresh,grid.destroyOnRefresh=false,false\n   local reused=grid:recycle(0,origin+16)"
  },
  {
   "at": 1382,
   "before": "  end\n end\n local late=grid.refreshCallback;local old=grid.items[0]\n assert(panel:GetChild('pileReturn'):GetChild('hit').click())\n if old then late(old,origin)end\n assert(not deck.visible and not grid.visible and grid.itemCount==0 and not panel:GetChild('pileChrome').visible)\n unchanged(host.run,before,'permanent browsing changed Run or RNG')",
   "after": "  end\n end\n local late=grid.refreshCallback;local old=grid.items[0];local oldHit=old and old:GetChild('hit')\n assert(panel:GetChild('pileReturn'):GetChild('hit').click())\n if old then late(old,origin);assert(not oldHit.click() and not deck.cardDetail,'closed list accepted a stale click')end\n assert(not deck.visible and not grid.visible and grid.itemCount==0 and not panel:GetChild('pileChrome').visible)\n unchanged(host.run,before,'permanent browsing changed Run or RNG')"
  }
 ]
});

export function beforeReleaseClosureFixture(path,raw,{reviewedBuild=false}={}){
 // Current integration authenticates the live delivery owner through its own archive.
 if(path==='scripts/verify-delivery.mjs'&&!reviewedBuild)return raw;
 raw=beforeReleaseMetadata(path,raw);
 if(!Object.hasOwn(fixtures,path))return beforeReleaseDeckPointer(path,raw);
 let source=Buffer.isBuffer(raw)?raw.toString('utf8'):raw;
 if(typeof source!=='string'||Buffer.isBuffer(raw)&&!Buffer.from(source).equals(raw))return raw;
 const normalized=source.replaceAll('\r\n','\n');
 if(normalized.includes('\r')||source!==normalized&&source!==normalized.replaceAll('\n','\r\n'))return raw;
 if(path==='tests/official-assets-runtime.test.mjs'&&exactSourceMatches(source,permanentDeckRuntimeFixture.current)){
  const {current,previous,hunks}=permanentDeckRuntimeFixture;
  const predecessor=restoreExactFixtureHunks({path,beforeSha256:previous.sha256,afterSha256:current.sha256,hunks},path,source);
  assert(exactSourceMatches(predecessor,previous),'exact prior permanent browser runtime fixture');
  source=source===normalized?predecessor:predecessor.replaceAll('\n','\r\n');
  // The immediately preceding fixture may itself have no older authorized
  // projection in this adapter, but its authenticated bytes still carry forward.
  raw=Buffer.isBuffer(raw)?Buffer.from(source):source;
 }
 if(path==='tests/official-assets-runtime.test.mjs'){
  source=beforeReleaseDeckPointer(path,source);
  raw=Buffer.isBuffer(raw)?Buffer.from(source):source;
 }
 if(path==='tests/gil-candidate.test.mjs'&&exactSourceMatches(source,unifiedGilFixture.current)){
  const {current,previous,hunks}=unifiedGilFixture;
  const predecessor=restoreExactFixtureHunks({path,beforeSha256:previous.sha256,afterSha256:current.sha256,hunks},path,source);
  assert(exactSourceMatches(predecessor,previous),'exact pre-unification GIL test fixture');
  source=source.includes('\r\n')?predecessor.replaceAll('\n','\r\n'):predecessor;
 }
 const {current,previous,hunks}=fixtures[path];
 if(!exactSourceMatches(source,current))return raw;
 const prior=restoreExactFixtureHunks({path,beforeSha256:previous.sha256,afterSha256:current.sha256,hunks},path,source);
 assert(exactSourceMatches(prior,previous),'exact release test fixture predecessor: '+path);
 const restored=source.includes('\r\n')?prior.replaceAll('\n','\r\n'):prior;
 return Buffer.isBuffer(raw)?Buffer.from(restored):restored;
}
