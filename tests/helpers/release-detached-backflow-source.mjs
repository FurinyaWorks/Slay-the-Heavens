import assert from 'node:assert/strict';
import {restoreExactFixtureHunks} from './exact-fixture-hunks.mjs';
import {exactSourceMatches} from './source-fingerprint.mjs';
import {beforeBossMapScroll} from './boss-map-scroll-source.mjs';
import {beforeReleaseEnemyClearance} from './release-enemy-clearance-source.mjs';

// The detached copy continues to execute its frozen Develop and Map Deck
// helpers; the normal test process uses the current Release readers.
const owners=Object.freeze({
 "tests/helpers/combined-epoch/source-epoch-runtime.mjs": {
  "current": {
   "sha256": "1cf1f1d3c8e13caca6c8480da3c332b9283ce2fa074525359f685109ef6f9494",
   "gitBlob": "7a0803c2201b7d5ff25347708fc40dd5b3b17e88"
  },
  "previous": {
   "sha256": "96e78e422e9135f5d947f21999b7e5476d4ef3fca16e50b91c75330a011552cf",
   "gitBlob": "f04ceba33d70db52f2c845fd66fe8a46dcf0d4ff"
  },
  "hunks": [
   {
    "at": 108,
    "before": "}\n\nexport function createSourceEpochProjector(input,{root=process.cwd(),allowConfigLayout=false,reuseFrozenInput=false}={}){\n // Clone once to prevent the caller changing proof data after validation.",
    "after": "}\n\nexport function readReleaseLayoutOwners(readRawInput){\n if(typeof readRawInput!=='function')return readRawInput;\n  // Track the actual raw owner before applying any inverse. An exact live\n  // successor must not be swapped for its equally projectable predecessor\n  // while a single combined read is in progress.\n  const releaseObservations=new Map();\n  return owner=>{\n   const raw=readRawInput(owner);\n   if(!releaseRuntimeOwner(owner))return raw;\n   const uniform=typeof raw==='string'&&\n    (raw===normalize(raw)||raw===normalize(raw).replaceAll('\\n','\\r\\n'));\n   const observed=uniform?normalize(raw):raw;\n   if(releaseObservations.has(owner))\n    assert(observed===releaseObservations.get(owner),'combined linked owner identity: '+owner+' changed during Release replay');\n   else releaseObservations.set(owner,observed);\n   return beforeReleaseClosureFixture(owner,raw);\n  };\n}\n\nexport function createSourceEpochProjector(input,{root=process.cwd(),allowConfigLayout=false,reuseFrozenInput=false}={}){\n // Clone once to prevent the caller changing proof data after validation."
   },
   {
    "at": 156,
    "before": " function requireTarget(target){assert(Object.hasOwn(proof.targets,target),'unknown source target');return proof.targets[target];}\n function rawReader(reader){return readers.get(reader)?.raw??reader;}\n function preCombinedSource(path,source,{target,readSource=readLive}={}){\n  const destination=requireTarget(target);\n  const liveInput=source;\n  const isLiveReader=liveReaders.has(rawReader(readSource));\n  const readRawInput=rawReader(readSource);\n  // Track the actual raw owner before applying any inverse. An exact live\n  // successor must not be swapped for its equally projectable predecessor\n  // while a single combined read is in progress.\n  const releaseObservations=new Map();\n  const readReleaseOwner=owner=>{\n   const raw=readRawInput(owner);\n   if(!releaseRuntimeOwner(owner))return raw;\n   const uniform=typeof raw==='string'&&\n    (raw===normalize(raw)||raw===normalize(raw).replaceAll('\\n','\\r\\n'));\n   const observed=uniform?normalize(raw):raw;\n   if(releaseObservations.has(owner))\n    assert(observed===releaseObservations.get(owner),'combined linked owner identity: '+owner+' changed during Release replay');\n   else releaseObservations.set(owner,observed);\n   return beforeReleaseClosureFixture(owner,raw);\n  };\n  const projected=entrancePredecessor(path,source,readReleaseOwner,{allowConfigLayout});\n  source=projected.source;readSource=projected.read;\n  const rawInput=source,backflow=beforeDevelopBackflow(path,source,{allowConfigLayout}),rebased=beforeRebasedCi(path,backflow);",
    "after": " function requireTarget(target){assert(Object.hasOwn(proof.targets,target),'unknown source target');return proof.targets[target];}\n function rawReader(reader){return readers.get(reader)?.raw??reader;}\n function preCombinedSource(path,source,{target,readSource=readLive,releaseLayoutsAlreadyProjected=false}={}){\n  const destination=requireTarget(target);\n  const liveInput=source;\n  const isLiveReader=liveReaders.has(rawReader(readSource));\n  const readRawInput=rawReader(readSource);\n  const projected=entrancePredecessor(path,source,\n   releaseLayoutsAlreadyProjected?readRawInput:readReleaseLayoutOwners(readRawInput),{allowConfigLayout});\n  source=projected.source;readSource=projected.read;\n  const rawInput=source,backflow=beforeDevelopBackflow(path,source,{allowConfigLayout}),rebased=beforeRebasedCi(path,backflow);"
   }
  ]
 },
 "tests/helpers/closeout-source-epoch.mjs": {
  "current": {
   "sha256": "193e27b3e02e4afca1d2d6fcf6b78e64d18c3853b11f96d631538c5623e2e35b",
   "gitBlob": "8523062f30c400de9c3e618df45174edb13d78e3"
  },
  "previous": {
   "sha256": "38bc8f4c7353c6af1d312298e01e06281b880fbbd56807c0ad55f3c57903e11d",
   "gitBlob": "95dadcebe0e7ba4ff3df2a79922c3bc96b3872d0"
  },
  "hunks": [
   {
    "at": 5,
    "before": "import {createHash} from 'node:crypto';\nimport {gunzipSync} from 'node:zlib';\nimport {createSourceEpochProjector} from './combined-epoch/source-epoch-runtime.mjs';\nimport {extendStsStyleEpoch} from './sts-style-source-epoch-runtime.mjs';\nimport {stsStylePatch} from './sts-style-source-proof.mjs';",
    "after": "import {createHash} from 'node:crypto';\nimport {gunzipSync} from 'node:zlib';\nimport {createSourceEpochProjector,readReleaseLayoutOwners} from './combined-epoch/source-epoch-runtime.mjs';\nimport {extendStsStyleEpoch} from './sts-style-source-epoch-runtime.mjs';\nimport {stsStylePatch} from './sts-style-source-proof.mjs';"
   },
   {
    "at": 62,
    "before": "// per invocation; neither live reads nor authorization are cached.\nexport function sourceSlice(path,source,target,readSource=p=>readFileSync(p,'utf8')){\n const rewardLayout='src/lua/abyss_battle_reward_layout.lua';\n const readCurrent=readSource;\n readSource=owner=>{\n  const current=readCurrent(owner);\n  return owner===rewardLayout?beforeReleaseClosureFixture(owner,current):current;\n };\n if(path===rewardLayout){\n  const previous=beforeReleaseClosureFixture(path,source);\n  if(previous!==source)assert.equal(readCurrent(path),source,'fresh reward banner layout source');\n  source=previous;\n }",
    "after": "// per invocation; neither live reads nor authorization are cached.\nexport function sourceSlice(path,source,target,readSource=p=>readFileSync(p,'utf8')){\n const releaseLayouts=new Set(['src/lua/abyss_battle_reward_layout.lua','src/lua/abyss_map_ui.lua']);\n const readCurrent=readSource;\n readSource=readReleaseLayoutOwners(readCurrent);\n if(releaseLayouts.has(path)){\n  const previous=beforeReleaseClosureFixture(path,source);\n  if(previous!==source)assert.equal(readCurrent(path),source,'fresh release layout source: '+path);\n  source=previous;\n }"
   },
   {
    "at": 77,
    "before": " // Keep configuration strict here and let the projector authenticate exact Lua continuations.\n if(path==='config/architecture.json'&&hash(source.replaceAll('\\r\\n','\\n'))!==row.sha256)return source;\n const projected=sourceEpoch.preCombinedSource(path,source,{target,readSource});\n if(projected!==source)return projected;\n if(beforeRewardTransitionSource(path,source)===source)return source;",
    "after": " // Keep configuration strict here and let the projector authenticate exact Lua continuations.\n if(path==='config/architecture.json'&&hash(source.replaceAll('\\r\\n','\\n'))!==row.sha256)return source;\n const projected=sourceEpoch.preCombinedSource(path,source,{target,readSource,releaseLayoutsAlreadyProjected:true});\n if(projected!==source)return projected;\n if(beforeRewardTransitionSource(path,source)===source)return source;"
   }
  ]
 },
 "tests/helpers/relic-query-source-inverse.mjs": {
  "current": {
   "sha256": "b727def31d0e68c56d82472d9fa076cebc731f93b44210e7446b4f026d0942f6",
   "gitBlob": "c03bf2d83e1221a7a3b6d5a453d7b41f60dcd84d"
  },
  "previous": {
   "sha256": "ba7525e0fd153e59f59538114ecace70c6475ab65f578dea2f4fc29fb9e71a20",
   "gitBlob": "0afc8b837b67689fc7c077029cb47bfba5a989c9"
  },
  "hunks": [
   {
    "at": 7,
    "before": "const live=p=>readFileSync(new URL('../../'+p,import.meta.url),'utf8');\nexport function preRelicQuerySource(path,source,{readSource=live}={}){\n readSource=readers.get(readSource)??readSource;\n const replay=currentRewardReplay(path,source,readSource);\n source=replay.source;\n readSource=replay.read;\n const entranceRead=typeof readSource==='function'?owner=>beforeCurrentDeckEntranceOwner(owner,readSource(owner)):readSource;\n const input=beforeCurrentDeckEntranceOwner(path,source);\n const projected=sourceEpoch.preCombinedSource(path,input,{target:'develop',readSource:entranceRead});",
    "after": "import {beforeReleaseClosureFixture} from './release-closure-fixture-source.mjs';\nconst releaseLayoutOwners=new Set(['src/lua/abyss_battle_reward_layout.lua','src/lua/abyss_map_ui.lua']);\nconst beforeReleaseLayout=(path,source)=>releaseLayoutOwners.has(path)?beforeReleaseClosureFixture(path,source):source;\nconst live=p=>readFileSync(new URL('../../'+p,import.meta.url),'utf8');\nexport function preRelicQuerySource(path,source,{readSource=live}={}){\n readSource=readers.get(readSource)??readSource;\n const replay=currentRewardReplay(path,source,readSource);\n source=replay.source;\n readSource=replay.read;\n const entranceRead=typeof readSource==='function'?owner=>beforeCurrentDeckEntranceOwner(owner,beforeReleaseLayout(owner,readSource(owner))):readSource;\n const input=beforeCurrentDeckEntranceOwner(path,beforeReleaseLayout(path,source));\n const projected=sourceEpoch.preCombinedSource(path,input,{target:'develop',readSource:entranceRead});"
   }
  ]
 },
 "tests/helpers/master-backflow-source.mjs": {
  "current": {
   "sha256": "73b8c380cae30d3dfca7bf91e9272e47ecbaaa5dca3a1abfce35a5c41e9d61cc",
   "gitBlob": "16549e4ba75b8016dadb88ac249698604c0e9685"
  },
  "previous": {
   "sha256": "308c6ef6ac8987b9becc4ead9f3a1efaa2c3c20ea8a697bdf26f6233fa71b8ac",
   "gitBlob": "c0558789e0465672ef86866b3ac1f4a4708f6412"
  },
  "hunks": [{
   "at": 40,
   "before": "  ['src/lua/abyss_game_ui_view.lua', ['b64cc28d1242af7fd219d1ccce46c9a043f42e3f602772e775896f3ea28fdf84', 'd865b4d6b0d4e8b6043b9e84f6a595b2d7f78bc6']],",
   "after": "  ['src/lua/abyss_game_ui_view.lua', ['817eb3428c3fc0bb081a11015212520f445f018368c2028a8c5e4216747eb178', '94addcbe13c7dd643469e0c1bf33062ed27a8a7a']],"
  }, {
   "at": 57,
   "before": "  ['tests/official-assets-legibility.test.mjs', ['ae2dbaa19e903e2e36374ffc92b0aede106bf8e4ce3afc055eedd3b70c7da844', '5a3a3b9b240f86244664b5f9a7b1fe26112c7f59']],",
   "after": "  ['tests/official-assets-legibility.test.mjs', ['0649464990d270f88312779533ac2eeb77507f970d19a8002c7a13f3e9b00bfb', 'f5e64d0859d806078369bcd2297052ea3a351fc4']],"
  }, {
   "at": 143,
   "before": "  if (exactSourceMatches(source, original)) return true;",
   "after": "  if (exactSourceMatches(source, original)) return true;\n  if (path === 'docs/legal/assets.json' && exactSourceMatches(source, {sha256:'a31ebb2c1d348da1fab24af5cbc07ad6c957867a15b3e32caf85c9fbe2e3ac46',gitBlob:'16fe8d2ffd88f40698f7161f7aad8adfe25d0855'})) return true;"
  }]
 },
 "tests/helpers/develop-release-backflow-source.mjs": {
  "current": {
   "sha256": "1ef1001a3f7473408dfe3f4f20933d87797612575179834ea271f2cfec7181f2",
   "gitBlob": "ee4d85d384d36c585216300dbcf4375d90646b17"
  },
  "previous": {
   "sha256": "53304733269a0314ca3e90832bb17b8dee23cc43e081ddbe5c4266da15d50609",
   "gitBlob": "fa82903bc4af3eaa14fee5945484733083f11101"
  },
  "hunks": [
   {
    "at": 16,
    "before": "import {beforeRunHudDeckLabel} from './run-hud-successors.mjs';\nimport {beforeReleaseEntranceOwner,readReleaseEntrancePredecessor} from './release-entrance-owner-source.mjs';\n",
    "after": "import {beforeRunHudDeckLabel} from './run-hud-successors.mjs';\nimport {beforeReleaseDeckPointer} from './release-deck-pointer-source.mjs';\nimport {beforeReleaseEntranceOwner,readReleaseEntrancePredecessor} from './release-entrance-owner-source.mjs';\nimport {hasReviewedStsStyleModules,reviewedStsStyleInventory,reviewedStsStyleRead} from './reviewed-selection-current-source.mjs';\n"
   },
   {
    "at": 183,
    "before": "}\nconst battleActionsPath='src/lua/abyss_battle_actions.lua';",
    "after": "}\nconst checkpointMapPath='src/lua/abyss_map.lua';\nconst checkpointMapCurrent={\n sha256:'f7d1efcab96f768ab5e9251c0c1d92d9d9f5ead058e1cbc9d023312dd6a58f12',\n gitBlob:'9b0a3730466cb5c2a2749f976a2b7271d09a7b83',\n};\n// The #951 checkpoint migration follows the frozen Map Room owner.\nfunction beforeMapRoomCheckpoint(path,source){\n if(path!==checkpointMapPath||!uniformSource(source)||!matches(source,checkpointMapCurrent))return source;\n const prior=source.replaceAll('\\r\\n','\\n')\n  .replace(\"local CheckpointIdentities=require('abyss_checkpoint_identities')\\n\",'')\n  .replace(/^local function migratedSignature\\(source\\)\\n[\\s\\S]*?^end\\n\\n/m,'')\n  .replace(/^    if snapshot\\.sourceSignature ~= map\\.sourceSignature then\\n[\\s\\S]*?(?=^    local jumps=\\{\\}\\n)/m,\n   '    if snapshot.sourceSignature ~= map.sourceSignature then return nil, \"configuration_mismatch\" end\\n');\n assert(matches(prior,roomEntry.files[path].after),'exact Map Room owner before checkpoint migration');\n return source.includes('\\r\\n')?prior.replaceAll('\\n','\\r\\n'):prior;\n}\nconst battleActionsPath='src/lua/abyss_battle_actions.lua';"
   },
   {
    "at": 336,
    "before": "export function beforeDeckPages(path,source,options){\n source=beforeLinkedBackflow(path,beforeBattleInputHistory(path,beforeMapRoomBattleActions(path,source)));",
    "after": "export function beforeDeckPages(path,source,options){\n source=beforeMapRoomCheckpoint(path,source);\n source=beforeLinkedBackflow(path,beforeBattleInputHistory(path,beforeMapRoomBattleActions(path,source)));"
   },
   {
    "at": 354,
    "before": "export function assertDevelopBackflowCurrent(path,source){\n if(path===libraryEventPath){",
    "after": "export function assertDevelopBackflowCurrent(path,source){\n if(path===deckPath)source=beforeReleaseDeckPointer(path,source);\n source=beforeMapRoomCheckpoint(path,source);\n if(path===libraryEventPath){"
   },
   {
    "at": 360,
    "before": " }\n source=beforeLinkedBackflow(path,beforeBattleInputHistory(path,beforeMapRoomBattleActions(path,source)));",
    "after": " }\n if(actorFocusOwners.includes(path))source=beforeVocabularyOwner(path,source);\n source=beforeLinkedBackflow(path,beforeBattleInputHistory(path,beforeMapRoomBattleActions(path,source)));"
   },
   {
    "at": 392,
    "before": "export function assertActorFocusInventory(paths,read=path=>readFileSync(path,'utf8')){\n paths=entranceInventory(paths,read);",
    "after": "export function assertActorFocusInventory(paths,read=path=>readFileSync(path,'utf8')){\n const inventoryError='complete current Actor/Focus Lua module inventory';\n assert.equal(new Set(paths).size,paths.length,inventoryError);\n const releaseInventory=hasReviewedStsStyleModules(paths);\n const readDeck=releaseInventory?reviewedStsStyleRead(read):read;\n if(releaseInventory)paths=reviewedStsStyleInventory(paths,read);\n paths=entranceInventory(paths,read);"
   },
   {
    "at": 400,
    "before": " assert(expected.includes(retiredControllerPath),'exact controller predecessor in Actor/Focus Lua inventory');\n assert.deepEqual([...paths].sort(),[...expected.filter(path=>path!==retiredControllerPath),pointerInputPath].sort(),'complete current Actor/Focus Lua module inventory');\n assertPointerInputSource(read(pointerInputPath));\n for(const path of deckPagesAdded){\n  const source=read(path);\n  assertDevelopBackflowCurrent(path,source);",
    "after": " assert(expected.includes(retiredControllerPath),'exact controller predecessor in Actor/Focus Lua inventory');\n assert.deepEqual([...paths].sort(),[...expected.filter(path=>path!==retiredControllerPath),pointerInputPath].sort(),inventoryError);\n assertPointerInputSource(read(pointerInputPath));\n for(const path of deckPagesAdded){\n  const source=readDeck(path);\n  assertDevelopBackflowCurrent(path,source);"
   },
   {
    "at": 433,
    "before": "export function beforeCurrentDeckEntranceOwner(path,source){\n if(!uiEntranceOwns(path)||!uniformSource(source))return source;",
    "after": "export function beforeCurrentDeckEntranceOwner(path,source){\n if(path===deckPath)source=beforeReleaseDeckPointer(path,source);\n if(!uiEntranceOwns(path)||!uniformSource(source))return source;"
   },
   {
    "at": 444,
    "before": "  const raw=readReleaseEntrancePredecessor(path,read(path),underlyingEntranceReader(read));\n  const source=beforeArchitectureOwner(path,path===deckLayoutPath?beforeRunHudDeckLabel(raw):raw);\n  const vocabulary=releaseVocabularyOwns(path);",
    "after": "  const raw=readReleaseEntrancePredecessor(path,read(path),underlyingEntranceReader(read));\n  const source=beforeArchitectureOwner(path,path===deckLayoutPath?beforeRunHudDeckLabel(raw):\n   path===deckPath?beforeReleaseDeckPointer(path,raw):raw);\n  const vocabulary=releaseVocabularyOwns(path);"
   },
   {
    "at": 514,
    "before": "   // before the linked Develop reader enters its older source epoch.\n   const readLive=beforeResponsiveHand(path,current)!==current?read:readOwner;\n   return authenticateDevelopBackflowWithReaders(path,current,readLive,readOwner,options);",
    "after": "   // before the linked Develop reader enters its older source epoch.\n   const releaseDeck=path===deckPath&&beforeReleaseDeckPointer(path,current)!==current;\n   const readLive=releaseDeck||beforeResponsiveHand(path,current)!==current?read:readOwner;\n   return authenticateDevelopBackflowWithReaders(path,current,readLive,readOwner,options);"
   },
   {
    "at": 520,
    "before": "}\nfunction beforePriorDevelopBackflow(path,source){\n source=beforeVocabularyOwner(path,beforeMatchEventRepair(path,source));\n return layers.reduce((prior,layer)=>predecessor(layer,path,prior),source);\n}",
    "after": "}\nfunction beforePriorLayers(path,source){\n return layers.reduce((prior,layer)=>predecessor(layer,path,prior),source);\n}\nfunction beforePriorDevelopBackflow(path,source){\n return beforePriorLayers(path,beforeVocabularyOwner(path,beforeMatchEventRepair(path,source)));\n}"
   },
   {
    "at": 531,
    "before": " const matchSuccessor=repaired!==source;\n source=repaired;\n const prior=beforePriorDevelopBackflow(path,source);\n if(prior===source)return source;\n const row=layers.find(layer=>Object.hasOwn(layer,path)&&matches(source,layer[path].after))[path];\n const actorOwner=Object.hasOwn(actorFocus.files,path)&&row===actorFocus.files[path];",
    "after": " const matchSuccessor=repaired!==source;\n const vocabularyPrior=beforeVocabularyOwner(path,repaired);\n const prior=beforePriorLayers(path,vocabularyPrior);\n const vocabularySuccessor=vocabularyPrior!==repaired;\n const checkVocabulary=live=>{\n  assert(uniformSource(live)&&live.replaceAll('\\r\\n','\\n')===repaired.replaceAll('\\r\\n','\\n'),\n   'combined linked owner identity: '+path+' changed during Develop vocabulary validation');\n  return beforeVocabularyOwner(path,live);\n };\n if(prior===vocabularyPrior){\n  if(vocabularySuccessor)checkVocabulary(beforeMatchEventRepair(path,readBackflowOwner(read,path)));\n  return vocabularyPrior;\n }\n const row=layers.find(layer=>Object.hasOwn(layer,path)&&matches(vocabularyPrior,layer[path].after))[path];\n const actorOwner=Object.hasOwn(actorFocus.files,path)&&row===actorFocus.files[path];"
   },
   {
    "at": 557,
    "before": "  }\n  const expected=owner===path?row.after:stasisOwner?(priorCurrent(owner)?.after??stasisCurrent[owner]):priorCurrent(owner).after;",
    "after": "  }\n  if(owner===path&&vocabularySuccessor)live=checkVocabulary(live);\n  const expected=owner===path?row.after:stasisOwner?(priorCurrent(owner)?.after??stasisCurrent[owner]):priorCurrent(owner).after;"
   },
   {
    "at": 578,
    "before": "export function beforeDevelopBackflow(path,source,options){\n source=beforeReleaseEntranceOwner(path,source);\n if(path==='src/lua/abyss_potion_discard_ui.lua')source=beforeKnownMasterBackflowSource(path,source);",
    "after": "export function beforeDevelopBackflow(path,source,options){\n if(path===deckPath)source=beforeReleaseDeckPointer(path,source);\n if(path===deckLayoutPath)source=beforeLinkedBackflow(path,beforeRunHudDeckLabel(source));\n source=beforeReleaseEntranceOwner(path,source);\n if(actorFocusOwners.includes(path))source=beforeVocabularyOwner(path,source);\n if(path==='src/lua/abyss_potion_discard_ui.lua')source=beforeKnownMasterBackflowSource(path,source);"
   },
   {
    "at": 605,
    "before": "function authenticateDevelopBackflowWithReaders(path,source,readLive,readLinked,options){\n const libraryPrior=beforeLibraryReadPrompt(path,source);",
    "after": "function authenticateDevelopBackflowWithReaders(path,source,readLive,readLinked,options){\n if(path===deckPath){\n  const prior=beforeReleaseDeckPointer(path,source);\n  if(prior!==source){\n   const live=readBackflowOwner(readLive,path);\n   const lf=value=>value.replaceAll('\\r\\n','\\n');\n   const livePrior=beforeReleaseDeckPointer(path,live);\n   assert(livePrior!==live&&lf(livePrior)===lf(prior),'fresh Release deck pointer owner');\n   source=prior;\n  }\n }\n const rawLive=readLive;\n readLive=owner=>owner===deckPath?beforeReleaseDeckPointer(owner,rawLive(owner)):rawLive(owner);\n if(path===deckPath||path===deckLayoutPath){\n  const deckPrior=(owner,value)=>beforeLinkedBackflow(owner,owner===deckLayoutPath?beforeRunHudDeckLabel(value):value);\n  const prior=deckPrior(path,source);\n  if(prior!==source){\n   const live=readBackflowOwner(readLive,path);\n   assert(uniformSource(live)&&live.replaceAll('\\r\\n','\\n')===source.replaceAll('\\r\\n','\\n'),\n    'combined linked owner identity: '+path+' during deck backflow validation');\n   source=prior;\n   const beforeDeck=readLive;\n   readLive=owner=>owner===path?deckPrior(owner,beforeDeck(owner)):beforeDeck(owner);\n  }\n }\n const libraryPrior=beforeLibraryReadPrompt(path,source);"
   },
   {
    "at": 667,
    "before": " source=deckPrior;\n const roomPrior=predecessor(roomEntry.files,path,source);\n if(roomPrior!==source){\n  let live;\n  try{live=readDeckLive(path);}catch(error){assert.fail('combined linked owner missing: '+path+': '+String(error?.message??error));}\n  assert(matches(live,roomEntry.files[path].after),mapRoomOwnerError(path));\n }\n const read=owner=>predecessor(roomEntry.files,owner,owner===path?readDeckLive(owner):deckPagesPrior(owner,readInputLinked(owner)));\n source=roomPrior;",
    "after": " source=deckPrior;\n const roomSource=beforeMapRoomCheckpoint(path,source);\n const roomPrior=predecessor(roomEntry.files,path,roomSource);\n if(roomPrior!==roomSource){\n  const live=readBackflowOwner(readDeckLive,path);\n  const expected=roomSource===source?roomEntry.files[path].after:checkpointMapCurrent;\n  assert(matches(live,expected)&&(roomSource===source||uniformSource(live)),mapRoomOwnerError(path));\n }\n const read=owner=>predecessor(roomEntry.files,owner,\n  beforeMapRoomCheckpoint(owner,owner===path?readDeckLive(owner):deckPagesPrior(owner,readInputLinked(owner))));\n source=roomPrior;"
   }
  ]
 },
 "tests/helpers/release-map-deck-source.mjs": {
  "current": {
   "sha256": "9086aca76fdf24939d374d94d6150dbebecc33da93bdfc300e4b2196a5936a45",
   "gitBlob": "f7a5e6f10bf5884f12fe039fda7bd350dce7a36e"
  },
  "previous": {
   "sha256": "ddaf9067612caa2e279e4702e6c7bf94a70a4201c0b87b87466060ec7abaf79b",
   "gitBlob": "111ecb276fe90556f7c7702af4c6c4f1d825e013"
  },
  "hunks": [
   {
    "at": 8,
    "before": "import {beforeLoadingRecoverySource} from './loading-recovery-source.mjs';\nimport {beforeHotfixMapDeckHelperSource} from './hotfix-map-deck-helper-source.mjs';\n\nconst hash=(bytes,algorithm='sha256')=>createHash(algorithm).update(bytes).digest('hex');",
    "after": "import {beforeLoadingRecoverySource} from './loading-recovery-source.mjs';\nimport {beforeHotfixMapDeckHelperSource} from './hotfix-map-deck-helper-source.mjs';\nimport {beforeReleaseDeckPointer} from './release-deck-pointer-source.mjs';\n\nconst hash=(bytes,algorithm='sha256')=>createHash(algorithm).update(bytes).digest('hex');"
   },
   {
    "at": 149,
    "before": "    assert(uniformCurrent(live,after),'map deck linked owner identity: '+name);\n  }\n}\n",
    "after": "    assert(uniformCurrent(live,after),'map deck linked owner identity: '+name);\n  }\n  return true;\n}\n"
   },
   {
    "at": 177,
    "before": "\nexport function beforeMapDeckSource(path,source,read){\n  assertProductionMapDeckOwners(path,source,read);\n  const forethoughtPrior=beforeProductionForethought(path,source,read);\n  if(forethoughtPrior!==source)return forethoughtPrior;",
    "after": "\nexport function beforeMapDeckSource(path,source,read){\n const deckPath='src/lua/abyss_deck_ui.lua';\n const rawRead=read;\n source=path===deckPath?beforeReleaseDeckPointer(path,source):source;\n read=(owner,...args)=>owner===deckPath?beforeReleaseDeckPointer(owner,rawRead(owner,...args)):rawRead(owner,...args);\n  if(assertProductionMapDeckOwners(path,source,read)&&path==='src/lua/abyss_map_ui.lua'){\n    const prior=files[path].before.source;\n    return source.includes('\\r\\n')?prior.replaceAll('\\n','\\r\\n'):prior;\n  }\n  const forethoughtPrior=beforeProductionForethought(path,source,read);\n  if(forethoughtPrior!==source)return forethoughtPrior;"
   }
  ]
 },
 "tests/helpers/ui-entrance-source.mjs": {
  "current": {
   "sha256": "134d5b8fa6f23226b47681a424fd7549660e61de033cec0f78cf5e48a6104935",
   "gitBlob": "a042622b88a9db6d4aef0d05b8c08d57fbec3bf4"
  },
  "previous": {
   "sha256": "c8a0b30c0c7013702719c7e13dedcc3d7753118d9f02d473e94f831f877377b7",
   "gitBlob": "3c3c094fbe33e3b783d1602256271e0d2c77dbc1"
  },
  "hunks": [
   {
    "at": 122,
    "before": "  if(sourceConfigLayoutMatches(source,'3924ed90aa88922ca9fc97df398cb67b7cf61892933901213ef911fc3b6f3e52')){\n   source=read(path);\n   assert(currentMatches(path,source,files[path].after),'combined linked owner identity: '+path+' during entrance validation');",
    "after": "  const releaseConfig={sha256:'cec427dcede62ac3efe295bfc976eb58cffb073a69bab7be12da02051de58dbe',\n   gitBlob:'fc35277cdbd7809afbe934cfdb63b6ee0828abe5'};\n  const releaseLayout=sourceConfigLayoutMatches(source,'8b379d37dce76982ae88bd20bca81058510426d6eb2972b48a90ff9c864ad8dc');\n  if(releaseLayout||sourceConfigLayoutMatches(source,'3924ed90aa88922ca9fc97df398cb67b7cf61892933901213ef911fc3b6f3e52')){\n   source=read(path);\n   assert(currentMatches(path,source,files[path].after)&&(!releaseLayout||matches(source,releaseConfig)),\n    'combined linked owner identity: '+path+' during entrance validation');"
   }
  ]
 },
 "tests/helpers/release-ui-restore-source.mjs": {
  "current": {
   "sha256": "9f56948b5d5f76f31c1780a27f6e1993d637a95de3ac2bafd19dacad2cbb0618",
   "gitBlob": "f4ed5ab66931fc3eb1ef758820a5e740716eee57"
  },
  "previous": {
   "sha256": "6e55f1df651dd08072160b73cd41deb46b530f29bd285a21f008fd7f3c8a105a",
   "gitBlob": "3a55a0f43c14a6f1290aebc886d7181ea19cd058"
  },
  "hunks": [
   {
    "at": 5,
    "before": "import {beforeStsFadeCi} from './sts-fade-ci-source.mjs';\nimport {beforeCurrentReplayFixes} from './current-replay-fix-sources.mjs';\nimport {beforeUiEntranceWitness} from './ui-entrance-source.mjs';\nimport assert from 'node:assert/strict';\nimport {createHash} from 'node:crypto';",
    "after": "import {beforeStsFadeCi} from './sts-fade-ci-source.mjs';\nimport {beforeCurrentReplayFixes} from './current-replay-fix-sources.mjs';\nimport {authenticateUiEntrance,beforeUiEntranceWitness} from './ui-entrance-source.mjs';\nimport {beforeReleaseDeckPointer} from './release-deck-pointer-source.mjs';\nimport {beforeKnownMasterBackflowSource} from './master-backflow-source.mjs';\nimport assert from 'node:assert/strict';\nimport {createHash} from 'node:crypto';"
   },
   {
    "at": 87,
    "before": " gitBlob:'82bdb7dda43d8772e1d1d5ffac3a9690509d9dd4',\n};\nconst deckLayoutPath='scripts/deck-ui-layout.mjs';\nconst pileReturnLayout={",
    "after": " gitBlob:'82bdb7dda43d8772e1d1d5ffac3a9690509d9dd4',\n};\nconst releaseOfficialRuntime={\n sha256:'fd43e53300bdb0f7f178a6887a0e8a5a7c329ad5d0075b7a99a5d343c6f390b7',\n gitBlob:'b7b75635e0ead0544e430a94f110315b5e81f2ea',\n};\nconst releaseRecordingSources=new Set([officialRuntimePath,'scripts/v25-map-layout.mjs',\n 'scripts/sts-reward-row-layout.mjs','tests/v25-map-layout.test.mjs']);\nconst deckLayoutPath='scripts/deck-ui-layout.mjs';\nconst pileReturnLayout={"
   },
   {
    "at": 101,
    "before": " // Production owners must remain raw for the entrance cohort's fresh identity check.\n if(path.startsWith('src/')||path==='config/architecture.json')return source;\n source=beforeCurrentReplayFixes(path,beforeUiEntranceWitness(path,source));\n if(path!==officialRuntimePath||!matches(source,currentOfficialRuntime))return source;\n return beforeStsFadeCi(path,inputRetirementStsFixtureSource(path,source));\n}",
    "after": " // Production owners must remain raw for the entrance cohort's fresh identity check.\n if(path.startsWith('src/')||path==='config/architecture.json')return source;\n if(releaseRecordingSources.has(path))source=beforeKnownMasterBackflowSource(path,source);\n source=beforeCurrentReplayFixes(path,beforeUiEntranceWitness(path,source));\n if(path!==officialRuntimePath||!matches(source,currentOfficialRuntime)&&!matches(source,releaseOfficialRuntime))return source;\n return beforeStsFadeCi(path,inputRetirementStsFixtureSource(path,source));\n}"
   },
   {
    "at": 116,
    "before": "}\nexport function beforeAuthenticatedRecordingStage(path,source,read){\n const input=recordingRuntimeInput(path,source);\n if(input!==source){",
    "after": "}\nexport function beforeAuthenticatedRecordingStage(path,source,read){\n if(path==='src/lua/abyss_deck_ui.lua'&&beforeReleaseDeckPointer(path,source)!==source)\n  authenticateUiEntrance(owner=>read(owner,'utf8'));\n const input=recordingRuntimeInput(path,source);\n if(input!==source){"
   }
  ]
 }
});

// The detached map reader first restores the exact pre-ink helper.
const collectorMapDeckHelper=Object.freeze({
 "current": {
  "sha256": "1942cd6f35dc83b27dd97b3b5f17f42bc9be54b110611150386199a08682dd7a",
  "gitBlob": "5469397d9ac31f736b354092ac98b15eeeaf9edf"
 },
 "previous": {
  "sha256": "708f462445b4dfbb7bbe827f783bcff7b0b35f79939f88bf1eadfbac2c03af70",
  "gitBlob": "7c2c418130317de9a8ad39fddf94146a33078a24"
 },
 "hunks": [
  {
   "at": 145,
   "before": "function assertProductionMapDeckOwners(path,source,read){",
   "after": "// #1065 only chooses the Collector throne for its encounter. Keep this exact\n// successor valid as a freshly read map/deck peer without reusing cached bytes.\nconst collectorSceneView=Object.freeze({\n  sha256:'817eb3428c3fc0bb081a11015212520f445f018368c2028a8c5e4216747eb178',\n  gitBlob:'94addcbe13c7dd643469e0c1bf33062ed27a8a7a',\n});\nfunction assertProductionMapDeckOwners(path,source,read){"
  },
  {
   "at": 156,
   "before": "    assert(uniformCurrent(live,after),'map deck linked owner identity: '+name);",
   "after": "    assert(uniformCurrent(live,after)||\n      (name==='src/lua/abyss_game_ui_view.lua'&&uniformCurrent(live,collectorSceneView)),\n      'map deck linked owner identity: '+name);"
  }
 ]
}
);

const bossMapDeckHelper=Object.freeze({
  "current": {
    "sha256": "708f462445b4dfbb7bbe827f783bcff7b0b35f79939f88bf1eadfbac2c03af70",
    "gitBlob": "7c2c418130317de9a8ad39fddf94146a33078a24"
  },
  "previous": {
    "sha256": "9086aca76fdf24939d374d94d6150dbebecc33da93bdfc300e4b2196a5936a45",
    "gitBlob": "f7a5e6f10bf5884f12fe039fda7bd350dce7a36e"
  },
  "hunks": [
    {
      "at": 8,
      "before": "import {beforeLoadingRecoverySource} from './loading-recovery-source.mjs';\nimport {beforeHotfixMapDeckHelperSource} from './hotfix-map-deck-helper-source.mjs';\nimport {beforeReleaseDeckPointer} from './release-deck-pointer-source.mjs';\n",
      "after": "import {beforeLoadingRecoverySource} from './loading-recovery-source.mjs';\nimport {beforeHotfixMapDeckHelperSource} from './hotfix-map-deck-helper-source.mjs';\nimport {beforeReleaseClosureFixture} from './release-closure-fixture-source.mjs';\nimport {beforeReleaseDeckPointer} from './release-deck-pointer-source.mjs';\n"
    },
    {
      "at": 180,
      "before": " const deckPath='src/lua/abyss_deck_ui.lua';\n const rawRead=read;\n source=path===deckPath?beforeReleaseDeckPointer(path,source):source;\n read=(owner,...args)=>owner===deckPath?beforeReleaseDeckPointer(owner,rawRead(owner,...args)):rawRead(owner,...args);\n  if(assertProductionMapDeckOwners(path,source,read)&&path==='src/lua/abyss_map_ui.lua'){\n    const prior=files[path].before.source;",
      "after": " const deckPath='src/lua/abyss_deck_ui.lua';\n const rawRead=read;\n const mapPath='src/lua/abyss_map_ui.lua';\n const beforeOwner=(owner,raw)=>owner===deckPath?beforeReleaseDeckPointer(owner,raw):\n  owner===mapPath?beforeReleaseClosureFixture(owner,raw):raw;\n const liveSource=source;\n source=beforeOwner(path,source);\n if(path===mapPath&&source!==liveSource){\n  const live=rawRead(path,'utf8');\n  assert(typeof live==='string'&&live.replaceAll('\\r\\n','\\n')===liveSource.replaceAll('\\r\\n','\\n')\n   &&beforeOwner(path,live)!==live,'map deck linked owner identity: '+path);\n }\n read=(owner,...args)=>beforeOwner(owner,rawRead(owner,...args));\n  if(assertProductionMapDeckOwners(path,source,read)&&path==='src/lua/abyss_map_ui.lua'){\n    const prior=files[path].before.source;"
    }
  ]
});

// The current detached caller keeps the complete reviewed entrance reader and its inputs.
const detachedInputsBeforeReplayGuard=Object.freeze({
 'tests/helpers/combined-epoch/source-epoch-runtime.mjs':'96e78e422e9135f5d947f21999b7e5476d4ef3fca16e50b91c75330a011552cf',
 'tests/fixtures/develop-release-vocabulary-prior.json.gz':'2b3d606fc142f2c8c5cfaaff386c70f6e1f741f24fbc1879b78399b7c477e914',
 'tests/fixtures/develop-release-vocabulary-source.json.gz':'9377ea3fc9aa22e1e1afed2df671413df0e11403e0862b955b929b06abc33dad',
 'tests/fixtures/selection-portrait-recovery-source.json.gz':'a24db4522db31669259bec007f6ab458419ea8b20abcd8a45dc37c29f3270e79',
 'tests/helpers/develop-release-backflow-source.mjs':'1ef1001a3f7473408dfe3f4f20933d87797612575179834ea271f2cfec7181f2',
 'tests/helpers/develop-release-vocabulary-source.mjs':'39c2ba9ecd776c5a7e3e485639c0d9a2acd1b9a8732e9621735fa99cd0466e56',
 'tests/helpers/master-backflow-source.mjs':'73b8c380cae30d3dfca7bf91e9272e47ecbaaa5dca3a1abfce35a5c41e9d61cc',
 'tests/helpers/release-closure-fixture-source.mjs':'2fc88ea6f7a27cea24e21a234a4ff7474083f5eb3ecea4b7179fc2b8dec08c80',
 'tests/helpers/release-deck-pointer-source.mjs':'a1cfebcea1c53c017315a9762ba2d9509d395218b358a500d7ca22fe565dec38',
 'tests/helpers/release-entrance-owner-source.mjs':'a74c303053062a39fa4731644758808026c8bce5024ff186c6017a016932f97b',
 'tests/helpers/release-metadata-source.mjs':'5897d9d479841a5fa7fe1f86925fa7daedd06a8facdc7277247f2ac376610cf8',
 'tests/helpers/relic-query-source-inverse.mjs':'b727def31d0e68c56d82472d9fa076cebc731f93b44210e7446b4f026d0942f6',
 'tests/helpers/reviewed-selection-current-source.json.gz':'ae2612caad5be7b4589812d9f0580b17bf99e775e53db38c093f79ff46c4cebb',
 'tests/helpers/reviewed-selection-current-source.mjs':'c98fb7605e578f1b909d51822729218fb9cbbf630db1f7b727c86ef5f6d24a64',
 'tests/helpers/run-hud-successors.mjs':'cbf8c1cc66b68d77dd981d7515d99f2fc975760bd9030bfd4a823cdaff71f64e',
 'tests/helpers/shop-deck-purchase-source.mjs':'11505a35f812f9632044724e91f94495455934ee67223f963e1c71c6d688716b',
 'tests/helpers/ui-entrance-source.mjs':'134d5b8fa6f23226b47681a424fd7549660e61de033cec0f78cf5e48a6104935',
 'tests/helpers/ui-selection-current-source.mjs':'2346febff5f5da7303491c41afae0191a797b0878d91e1fb9650589f87c983cf',
 'tests/helpers/visual-selection-source.mjs':'3066522a5ed048b3bff4bac6424c0368676955d2c458076a1093b323761119c1',
});

// Current detached callers use the complete reviewed successors. The
// historical copier still restores the original immutable helpers.
export const currentDetachedInputs=Object.freeze({
 ...detachedInputsBeforeReplayGuard,
 'tests/helpers/power-shop-source-inverse.mjs':'bcf4358902fff59dfb345420541b6c4ac1a71e99fda18adb500c9f7496f19424',
 'tests/helpers/release-enemy-clearance-source.mjs':'86e9557adf8f8e556ae1b577f575ff7b3a614cdce4a9c90019ff29e584344752',
 'tests/helpers/chapter-battle-scene-source.mjs':'799040ad7eef63281029b16094e95292b14df23692208a00639cd4ce7d8113e2',
 'tests/helpers/boss-map-scroll-source.mjs':'32086e0a0b75e11efba16ff7ac9de4151b9e6443448480fcd28859c7d01d0884',
 'tests/helpers/combined-epoch/source-epoch-runtime.mjs':'93d263928f8b024e6cd7557e7279220237e19aa119629dc1939549902653c49a',
 'tests/helpers/release-sts-detail-source.mjs':'0e06e04e77d3dd59f62502fd4a9611f99a17647d0589b18921fea98196e00539',
 'tests/fixtures/release-sts-detail-source.json.gz':'8f755b932e94da02b8ed36d85b52a7c663a7fb896e1a55670d1504dbb8b07bf8',
 'tests/helpers/closeout-source-epoch.mjs':'5622c6d85e9c80ed51a12a5c1cdadf0f00e2dfb33c2558e33c065bcc6b847688',
 'tests/helpers/release-closure-fixture-source.mjs':'289dbb0f64df673d88909d620f3e204cd92a96d448eb62acd6347f91f4e39b23',
});

const stsDetailRuntime=Object.freeze({
 current:{sha256:'93d263928f8b024e6cd7557e7279220237e19aa119629dc1939549902653c49a',gitBlob:'e83935e542ef13de6dfd4802edd6560bb0094d5c'},
 previous:{sha256:'1cf1f1d3c8e13caca6c8480da3c332b9283ce2fa074525359f685109ef6f9494',gitBlob:'7a0803c2201b7d5ff25347708fc40dd5b3b17e88'},
});
function beforeStsDetailRuntime(path,raw){
 if(path!=='tests/helpers/combined-epoch/source-epoch-runtime.mjs')return raw;
 const source=raw.toString('utf8'),lf=source.replaceAll('\r\n','\n');
 const {current,previous}=stsDetailRuntime;
 if(!raw.equals(Buffer.from(source))||lf.includes('\r')||source!==lf&&source!==lf.replaceAll('\n','\r\n')||!exactSourceMatches(lf,current))return raw;
 const hunks=[
  {at:0,before:"import {beforeReleaseClosureFixture} from '../release-closure-fixture-source.mjs';",
   after:"import {beforeReleaseClosureFixture} from '../release-closure-fixture-source.mjs';\nimport {beforeStsDetailSource,readStsDetailOwners} from '../release-sts-detail-source.mjs';"},
  {at:163,before:'  const readRawInput=rawReader(readSource);\n  const projected=entrancePredecessor(path,source,',
   after:'  const readRawInput=readStsDetailOwners(rawReader(readSource));\n  const projected=entrancePredecessor(path,beforeStsDetailSource(path,source),'},
 ];
 const prior=restoreExactFixtureHunks({path,beforeSha256:previous.sha256,afterSha256:current.sha256,hunks},path,lf);
 assert(exactSourceMatches(prior,previous),'exact pre-STS detail combined runtime');
 return Buffer.from(source===lf?prior:prior.replaceAll('\n','\r\n'));
}

export function isStsDetailRuntimeCurrent(source){
 if(typeof source!=='string')return false;
 const lf=source.replaceAll('\r\n','\n');
 return !lf.includes('\r')&&(source===lf||source===lf.replaceAll('\n','\r\n'))&&exactSourceMatches(lf,stsDetailRuntime.current);
}

const stsDetailCloseout=Object.freeze({
 "path": "tests/helpers/closeout-source-epoch.mjs",
 "beforeSha256": "193e27b3e02e4afca1d2d6fcf6b78e64d18c3853b11f96d631538c5623e2e35b",
 "afterSha256": "5622c6d85e9c80ed51a12a5c1cdadf0f00e2dfb33c2558e33c065bcc6b847688",
 "beforeBlob": "8523062f30c400de9c3e618df45174edb13d78e3",
 "afterBlob": "805676db8c919f667e5102fb48b9497a1aaba4a8",
 "hunks": [
  {
   "at": 1,
   "before": "import { entrancePredecessor } from './ui-entrance-source.mjs';",
   "after": "import { entrancePredecessor, underlyingEntranceReader } from './ui-entrance-source.mjs';"
  },
  {
   "at": 79,
   "before": " const projected=sourceEpoch.preCombinedSource(path,source,{target,readSource,releaseLayoutsAlreadyProjected:true});",
   "after": " // The Combined projector runs its own entrance admission. Its #1080 owner\n // wrapper needs the raw entrance reader, not an already projected cohort.\n const projected=sourceEpoch.preCombinedSource(path,source,{target,\n  readSource:underlyingEntranceReader(readSource),releaseLayoutsAlreadyProjected:true});"
  }
 ]
});
function beforeStsDetailCloseout(path,raw){
 if(path!==stsDetailCloseout.path)return raw;
 const source=raw.toString('utf8'),lf=source.replaceAll('\r\n','\n');
 if(!raw.equals(Buffer.from(source))||!isStsDetailCloseoutCurrent(source))return raw;
 const prior=restoreExactFixtureHunks(stsDetailCloseout,path,lf);
 assert(exactSourceMatches(prior,{sha256:stsDetailCloseout.beforeSha256,gitBlob:stsDetailCloseout.beforeBlob}),'exact pre-STS detail Closeout source');
 return Buffer.from(source===lf?prior:prior.replaceAll('\n','\r\n'));
}
export function isStsDetailCloseoutCurrent(source){
 if(typeof source!=='string')return false;
 const lf=source.replaceAll('\r\n','\n');
 const {afterSha256:sha256,afterBlob:gitBlob}=stsDetailCloseout;
 return !lf.includes('\r')&&(source===lf||source===lf.replaceAll('\n','\r\n'))&&exactSourceMatches(lf,{sha256,gitBlob});
}

const powerShopFacade = Object.freeze({
 "path": "tests/helpers/power-shop-source-inverse.mjs",
 "beforeSha256": "c6035aeea5b3f563160a582753b7357a9c4e0c2326c5302221788e6c0180678d",
 "beforeBlob": "91f9507ba5c965c81b7075720a5631306c7bd2c2",
 "afterSha256": "bcf4358902fff59dfb345420541b6c4ac1a71e99fda18adb500c9f7496f19424",
 "afterBlob": "807e7affad44fafe48127ac3e5308eaa05701d19",
 "hunks": [
  {
   "at": 4,
   "before": "import {readFileSync} from 'node:fs';\nconst live=p=>readFileSync(new URL('../../'+p,import.meta.url),'utf8');\nexport function prePowerShopSource(path,source,{readSource=live}={}){\n const projected=sourceEpoch.preCombinedSource(path,source,{target:'powerShop',readSource});\n return original(path,projected,{readSource:(typeof readSource==='function'?sourceEpoch.combinedReader(readSource,'powerShop'):readSource)});\n}",
   "after": "import {readFileSync} from 'node:fs';\nimport {beforeStsDetailSource} from './release-sts-detail-source.mjs';\nimport {configSourceTokens,sourceConfigLayoutMatches} from './source-fingerprint.mjs';\nimport {createHash} from 'node:crypto';\nconst live=p=>readFileSync(new URL('../../'+p,import.meta.url),'utf8');\nconst configPath='config/architecture.json';\nfunction normalizePrimaryConfig(path,source){\n // The original Power Shop contract admits config whitespace in a primary\n // input only. Anchor that token stream to the exact #1080 successor first.\n if(path!==configPath||typeof source!=='string'||beforeStsDetailSource(path,source)!==source)return source;\n const lf=source.replaceAll('\\r\\n','\\n');\n if(lf.includes('\\r')||source!==lf&&source!==lf.replaceAll('\\n','\\r\\n'))return source;\n const raw=live(configPath);\n if(beforeStsDetailSource(configPath,raw)===raw)return source;\n const tokens=createHash('sha256').update(configSourceTokens(raw)).digest('hex');\n return sourceConfigLayoutMatches(source,tokens)?raw:source;\n}\nexport function prePowerShopSource(path,source,{readSource=live}={}){\n const projected=sourceEpoch.preCombinedSource(path,normalizePrimaryConfig(path,source),{target:'powerShop',readSource});\n return original(path,projected,{readSource:(typeof readSource==='function'?sourceEpoch.combinedReader(readSource,'powerShop'):readSource)});\n}"
  }
 ]
});
function beforePowerShopFacade(path,raw){
 if(path!==powerShopFacade.path)return raw;
 const source=raw.toString('utf8'),lf=source.replaceAll('\r\n','\n');
 if(!raw.equals(Buffer.from(source))||lf.includes('\r')||
  source!==lf&&source!==lf.replaceAll('\n','\r\n')||
  !exactSourceMatches(lf,{sha256:powerShopFacade.afterSha256,gitBlob:powerShopFacade.afterBlob}))return raw;
 const prior=restoreExactFixtureHunks(powerShopFacade,path,lf);
 assert(exactSourceMatches(prior,{sha256:powerShopFacade.beforeSha256,gitBlob:powerShopFacade.beforeBlob}),
  'exact pre-STS Power Shop facade');
 return Buffer.from(source===lf?prior:prior.replaceAll('\n','\r\n'));
}

const colorlessFacade=Object.freeze({
 "path": "tests/helpers/colorless-catalog-source-inverse.mjs",
 "beforeSha256": "ca654dba3b490f2d5f857933931992d1b72b346df246165499631cca7f6f717d",
 "beforeBlob": "94c5af24ef7e9e76b53116e97fc55d25d353f482",
 "afterSha256": "b62d81b75333473aa9ffdef355389be0a6b8f332247c704a4f6ae210c94f3365",
 "afterBlob": "748bf85187b272846bff8e70cf195317dc31002d",
 "hunks": [
  {
   "at": 5,
   "before": "import {readFileSync} from 'node:fs';\nconst live=p=>readFileSync(new URL('../../'+p,import.meta.url),'utf8');\nconst descriptionPath='src/lua/abyss_colorless_cards.lua';\nexport function preColorlessCatalogSource(path,source,{readSource=live}={}){\n if(!Object.hasOwn(colorlessCatalogSourceProof.files[path]??{},'beforeSource'))return source;\n readSource=readers.get(readSource)??readSource;\n const projected=sourceEpoch.preCombinedSource(path,source,{target:'colorless',readSource});",
   "after": "import {readFileSync} from 'node:fs';\nimport assert from 'node:assert/strict';\nimport {beforeStsDetailSource} from './release-sts-detail-source.mjs';\nimport {architectureSourceFormat} from './architecture-source-format.mjs';\nconst live=p=>readFileSync(new URL('../../'+p,import.meta.url),'utf8');\nconst architecturePath='config/architecture.json';\nfunction normalizePrimaryConfig(path,source){\n // Preserve the original token-only primary-input allowance for the exact\n // #1080 release successor. Linked reads still authenticate raw owner bytes.\n if(path!==architecturePath||typeof source!=='string'||beforeStsDetailSource(path,source)!==source)return source;\n const lf=source.replaceAll('\\r\\n','\\n');\n if(lf.includes('\\r')||source!==lf&&source!==lf.replaceAll('\\n','\\r\\n'))return source;\n try{\n  const input=architectureSourceFormat(path,source);\n  if(!input.tokensEqual)return source;\n  const raw=live(path);\n  if(beforeStsDetailSource(path,raw)===raw)return source;\n  const custody=architectureSourceFormat(path,raw);\n  return custody.tokensEqual&&input.formatted===custody.formatted?raw:source;\n }catch{return source;}\n}\nconst descriptionPath='src/lua/abyss_colorless_cards.lua';\nexport function preColorlessCatalogSource(path,source,{readSource=live}={}){\n if(!Object.hasOwn(colorlessCatalogSourceProof.files[path]??{},'beforeSource'))return source;\n readSource=readers.get(readSource)??readSource;\n const input=normalizePrimaryConfig(path,source);\n if(input!==source&&typeof readSource==='function'){\n  const raw=readSource,current=input.replaceAll('\\r\\n','\\n');\n  const strictRead=owner=>{\n   const value=raw(owner);\n   if(owner===architecturePath)\n    assert(value===current||value===current.replaceAll('\\n','\\r\\n'),\n     'Colorless catalog linked owner identity: '+owner);\n   return value;\n  };\n  // Establish freshness even if a legacy reader does not request this path,\n  // and keep enforcing the same raw identity on every downstream reread.\n  strictRead(path);readSource=strictRead;\n }\n const projected=sourceEpoch.preCombinedSource(path,input,{target:'colorless',readSource});"
  }
 ]
});
function beforeColorlessFacade(path,raw){
 if(path!==colorlessFacade.path)return raw;
 const source=raw.toString('utf8'),lf=source.replaceAll('\r\n','\n');
 if(!raw.equals(Buffer.from(source))||lf.includes('\r')||
  source!==lf&&source!==lf.replaceAll('\n','\r\n')||
  !exactSourceMatches(lf,{sha256:colorlessFacade.afterSha256,gitBlob:colorlessFacade.afterBlob}))return raw;
 const prior=restoreExactFixtureHunks(colorlessFacade,path,lf);
 assert(exactSourceMatches(prior,{sha256:colorlessFacade.beforeSha256,gitBlob:colorlessFacade.beforeBlob}),
  'exact pre-STS Colorless facade');
 return Buffer.from(source===lf?prior:prior.replaceAll('\n','\r\n'));
}

const recordingReplay=Object.freeze({
 "path": "tests/helpers/release-ui-restore-source.mjs",
 "beforeSha256": "9f56948b5d5f76f31c1780a27f6e1993d637a95de3ac2bafd19dacad2cbb0618",
 "beforeBlob": "f4ed5ab66931fc3eb1ef758820a5e740716eee57",
 "afterSha256": "1567578ede7a5fca035e02f5fe25f4b375abf272b58afcac5ee92ce64c759fcf",
 "afterBlob": "153fda488337abd41b54374c6fbe13d3fc706e6d",
 "hunks": [
  {
   "at": 8,
   "before": "import {beforeReleaseDeckPointer} from './release-deck-pointer-source.mjs';",
   "after": "import {beforeReleaseDeckPointer} from './release-deck-pointer-source.mjs';\nimport {beforeStsDetailSource} from './release-sts-detail-source.mjs';"
  },
  {
   "at": 119,
   "before": " if(path==='src/lua/abyss_deck_ui.lua'&&beforeReleaseDeckPointer(path,source)!==source)\n  authenticateUiEntrance(owner=>read(owner,'utf8'));",
   "after": " const deckPath='src/lua/abyss_deck_ui.lua';\n const deck=path===deckPath?beforeStsDetailSource(path,source):source;\n const releasedDeck=path===deckPath&&beforeReleaseDeckPointer(path,deck)!==deck;\n const rawRead=read,observed=new Map();\n let entranceAuthenticated=false;\n // Keep raw reads stable across both cohort admission and legacy projection.\n const uniform=raw=>{\n  if(typeof raw!=='string')return false;\n  const lf=raw.replaceAll('\\r\\n','\\n');\n  return !lf.includes('\\r')&&(raw===lf||raw===lf.replaceAll('\\n','\\r\\n'));\n };\n const rawOwner=(owner,encoding)=>{\n  const raw=rawRead(owner,encoding);\n  if(typeof raw!=='string'||(!owner.startsWith('src/')&&owner!=='config/architecture.json'))return raw;\n  const stable=uniform(raw)?raw.replaceAll('\\r\\n','\\n'):raw;\n  if(observed.has(owner))assert.equal(stable,observed.get(owner),'recording UI linked owner changed: '+owner);\n  else observed.set(owner,stable);\n  return raw;\n };\n const authenticate=()=>{\n  if(entranceAuthenticated)return;\n  authenticateUiEntrance(owner=>{\n   const raw=rawOwner(owner,'utf8');\n   assert(uniform(raw),'recording UI linked owner identity: '+owner);\n   return raw;\n  });\n  entranceAuthenticated=true;\n };\n // Peel #1080 only for this deck owner, and only after checking the live\n // entrance cohort against unprojected reads.\n if(releasedDeck)authenticate();\n read=(owner,encoding)=>{\n  const raw=rawOwner(owner,encoding);\n  if(owner!==deckPath)return raw;\n  if(releasedDeck)assert(uniform(raw)&&\n   raw.replaceAll('\\r\\n','\\n')===source.replaceAll('\\r\\n','\\n'),'recording UI linked owner changed: '+owner);\n  if(beforeStsDetailSource(owner,raw)!==raw)authenticate();\n  // Map-deck owns this conversion; retain raw custody until its linked check.\n  return raw;\n };\n if(releasedDeck)read(path,'utf8');"
  }
 ]
});
function beforeRecordingReplay(path,raw){
 if(path!==recordingReplay.path)return raw;
 const source=raw.toString('utf8'),lf=source.replaceAll('\r\n','\n');
 if(!raw.equals(Buffer.from(source))||lf.includes('\r')||
  source!==lf&&source!==lf.replaceAll('\n','\r\n')||
  !exactSourceMatches(lf,{sha256:recordingReplay.afterSha256,gitBlob:recordingReplay.afterBlob}))return raw;
 const prior=restoreExactFixtureHunks(recordingReplay,path,lf);
 assert(exactSourceMatches(prior,{sha256:recordingReplay.beforeSha256,gitBlob:recordingReplay.beforeBlob}),
  'exact pre-recording replay helper');
 return Buffer.from(source===lf?prior:prior.replaceAll('\n','\r\n'));
}

const mapDeckDetailReplay=Object.freeze({
 "path": "tests/helpers/release-map-deck-source.mjs",
 "beforeSha256": "1942cd6f35dc83b27dd97b3b5f17f42bc9be54b110611150386199a08682dd7a",
 "beforeBlob": "5469397d9ac31f736b354092ac98b15eeeaf9edf",
 "afterSha256": "5380e5c41fe2aa8fe7f5c882ef168bd85bb2415216c906a6443455c5ee0d6e40",
 "afterBlob": "f3bbd0e8bb9ffa165e050c0b0d7463c8dc69cf99",
 "hunks": [
  {
   "at": 11,
   "before": "import {beforeReleaseDeckPointer} from './release-deck-pointer-source.mjs';",
   "after": "import {beforeReleaseDeckPointer} from './release-deck-pointer-source.mjs';\nimport {beforeStsDetailSource} from './release-sts-detail-source.mjs';"
  },
  {
   "at": 192,
   "before": " const beforeOwner=(owner,raw)=>owner===deckPath?beforeReleaseDeckPointer(owner,raw):",
   "after": " const beforeOwner=(owner,raw)=>owner===deckPath?beforeReleaseDeckPointer(owner,beforeStsDetailSource(owner,raw)):"
  },
  {
   "at": 193,
   "before": "  owner===mapPath?beforeReleaseClosureFixture(owner,raw):raw;",
   "after": "  owner===mapPath?beforeReleaseClosureFixture(owner,raw):raw;\n // Remember exact linked deck samples before either inverse. The reviewed\n // successor and its immediate predecessor must never be interchangeable reads.\n let deckObserved;"
  },
  {
   "at": 198,
   "before": " source=beforeOwner(path,source);",
   "after": " source=beforeOwner(path,source);\n const productionPrimary=Object.hasOwn(productionMapDeckSources,path)&&\n  uniformCurrent(source,productionMapDeckSources[path].after);\n const sampleOwner=(owner,...args)=>{\n  const raw=rawRead(owner,...args);\n  if(owner!==deckPath)return raw;\n  const lf=typeof raw==='string'?normalize(raw):raw;\n  const observation=typeof lf==='string'&&!lf.includes('\\r')&&\n   (raw===lf||raw===lf.replaceAll('\\n','\\r\\n'))?lf:raw;\n  if(deckObserved!==undefined)assert.equal(observation,deckObserved,'map deck linked owner identity: '+owner);\n  else deckObserved=observation;\n  // The unchanged card skin, view and map also occur in earlier complete\n  // inputs. A raw #1080 architecture distinguishes this live cohort.\n  if(productionPrimary&&beforeStsDetailSource(owner,raw)===raw&&\n   uniformCurrent(beforeReleaseDeckPointer(owner,raw),productionMapDeckSources[owner].after)){\n   const configPath='config/architecture.json';\n   const config=rawRead(configPath,'utf8');\n   assert(beforeStsDetailSource(configPath,config)===config,'map deck linked owner identity: '+owner);\n  }\n  return raw;\n };\n if(path===deckPath&&source!==liveSource){\n  const live=sampleOwner(path,'utf8');\n  assert(typeof live==='string'&&normalize(live)===normalize(liveSource)&&\n   (live===normalize(live)||live===normalize(live).replaceAll('\\n','\\r\\n')),\n   'map deck linked owner identity: '+path);\n }"
  },
  {
   "at": 230,
   "before": " read=(owner,...args)=>beforeOwner(owner,rawRead(owner,...args));",
   "after": " read=(owner,...args)=>beforeOwner(owner,sampleOwner(owner,...args));"
  }
 ]
});
function beforeMapDeckDetailReplay(path,raw){
 if(path!==mapDeckDetailReplay.path)return raw;
 const source=raw.toString('utf8'),lf=source.replaceAll('\r\n','\n');
 if(!raw.equals(Buffer.from(source))||lf.includes('\r')||
  source!==lf&&source!==lf.replaceAll('\n','\r\n')||
  !exactSourceMatches(lf,{sha256:mapDeckDetailReplay.afterSha256,gitBlob:mapDeckDetailReplay.afterBlob}))return raw;
 const prior=restoreExactFixtureHunks(mapDeckDetailReplay,path,lf);
 assert(exactSourceMatches(prior,{sha256:mapDeckDetailReplay.beforeSha256,gitBlob:mapDeckDetailReplay.beforeBlob}),
  'exact pre-STS map deck replay helper');
 return Buffer.from(source===lf?prior:prior.replaceAll('\n','\r\n'));
}

const combinedDetailInventory=Object.freeze({
 "path": "tests/integration-source-epoch.test.mjs",
 "beforeSha256": "c01c05a38b05b9a405f009da808c1af295f48bf3653d70fbeb8346ec1d8feaf2",
 "beforeBlob": "95629736179479ea8c9319150c6beafc95360037",
 "afterSha256": "414ac94797e5fd35e8fa1e18dc0973c8d475d92809022e30c218a11e047131ce",
 "afterBlob": "8f977698ebd95509371abade3aeb47138ff8b2e0",
 "hunks": [
  {
   "at": 265,
   "before": " }\n});\ntest('combined epoch authenticates the complete current production tree',()=>{\n const live=['config/architecture.json',...readdirSync('src/lua').filter(p=>p.endsWith('.lua')).map(p=>'src/lua/'+p)].sort();\n const files=reviewedStsStyleInventory(live);\n const recorded=Object.keys(proof.current).filter(path=>path!==retiredControllerPath&&proof.current[path]!==null).sort();\n const {current:read,entrance,readOwner}=integrationProductionReaders();",
   "after": " }\n});\n// The historical combined epoch predates only these three #1080 UI additions.\nconst releaseDetailInventoryOwners=Object.freeze({\n 'src/lua/abyss_card_browse_preview.lua':['e0d1d3262f93251bc47681cd25713a4532b2552d11f55cc6e3c2e8297d11c5bb','54c7d8fb78276b57017e91470f3129be02ad1e29'],\n 'src/lua/abyss_card_keyword_tip.lua':['291991d574c7056c675ee90f217d81c3b546da865b56fc71fdaed3cfd60a1a9a','fae7fb2fe4338beb16ef59180d0db7784e0d2a48'],\n 'src/lua/abyss_node_ui_card_inspection.lua':['51cc94804f4a33bdc43be23510a060e1c4acdaa222082e3ecafcc7fa268787ee','1bcdf13d9ca0f434c23cd9a0a874b5a33953dfb1'],\n});\nfunction beforeReleaseDetailInventory(paths,read=path=>readFileSync(path,'utf8')){\n for(const [path,[sha256,blob]] of Object.entries(releaseDetailInventoryOwners)){\n  assert.equal(paths.filter(owner=>owner===path).length,1,'complete Release detail UI inventory: '+path);\n  const text=read(path),lf=typeof text==='string'&&text.replaceAll('\\r\\n','\\n');\n  assert(typeof lf==='string'&&!lf.includes('\\r')&&(text===lf||text===lf.replaceAll('\\n','\\r\\n'))\n   &&digest(lf)===sha256&&createHash('sha1').update(`blob ${Buffer.byteLength(lf)}\\0`).update(lf).digest('hex')===blob,\n   'fresh Release detail UI inventory owner: '+path);\n }\n return paths.filter(owner=>!Object.hasOwn(releaseDetailInventoryOwners,owner));\n}\ntest('combined epoch authenticates the complete current production tree',()=>{\n const live=['config/architecture.json',...readdirSync('src/lua').filter(p=>p.endsWith('.lua')).map(p=>'src/lua/'+p)].sort();\n const preDetail=beforeReleaseDetailInventory(live);\n const files=reviewedStsStyleInventory(preDetail);\n const recorded=Object.keys(proof.current).filter(path=>path!==retiredControllerPath&&proof.current[path]!==null).sort();\n const {current:read,entrance,readOwner}=integrationProductionReaders();"
  },
  {
   "at": 322,
   "before": "   assert.throws(()=>beforeCurrentProductionSource(path,latest,changed),/fresh .*source|(?:combined|map deck) linked owner identity/,path);\n  }\n }\n});",
   "after": "   assert.throws(()=>beforeCurrentProductionSource(path,latest,changed),/fresh .*source|(?:combined|map deck) linked owner identity/,path);\n  }\n }\n});\ntest('Release detail inventory rejects missing, duplicate, and tampered current additions',()=>{\n const names=Object.keys(releaseDetailInventoryOwners);\n const foreign='src/lua/unknown_owner.lua';\n const live=[...names,foreign];\n const read=path=>readFileSync(path,'utf8');\n assert.deepEqual(beforeReleaseDetailInventory(live),[foreign],'unregistered owners remain visible to the original full inventory');\n for(const path of names){\n  assert.throws(()=>beforeReleaseDetailInventory(live.filter(owner=>owner!==path)),/complete Release detail UI inventory/);\n  assert.throws(()=>beforeReleaseDetailInventory([...live,path]),/complete Release detail UI inventory/);\n  const source=read(path).replaceAll('\\r\\n','\\n');\n  assert.deepEqual(beforeReleaseDetailInventory(live,owner=>owner===path?source.replaceAll('\\n','\\r\\n'):read(owner)),[foreign]);\n  for(const drift of [source+'\\n',source.replace('\\n','\\r\\n'),null])assert.throws(()=>beforeReleaseDetailInventory(live,owner=>owner===path?drift:read(owner)),{message:'fresh Release detail UI inventory owner: '+path});\n }\n});"
  }
 ]
});
export function beforeCombinedDetailInventory(path,source){
 if(path!==combinedDetailInventory.path||typeof source!=='string')return source;
 const lf=source.replaceAll('\r\n','\n');
 if(lf.includes('\r')||source!==lf&&source!==lf.replaceAll('\n','\r\n')||
  !exactSourceMatches(lf,{sha256:combinedDetailInventory.afterSha256,gitBlob:combinedDetailInventory.afterBlob}))return source;
 const prior=restoreExactFixtureHunks(combinedDetailInventory,path,lf);
 assert(exactSourceMatches(prior,{sha256:combinedDetailInventory.beforeSha256,gitBlob:combinedDetailInventory.beforeBlob}),
  'exact pre-detail combined inventory test');
 return source===lf?prior:prior.replaceAll('\n','\r\n');
}

export function beforeDetachedReleaseBackflow(path,raw){
 if(path===combinedDetailInventory.path){
  const source=raw.toString('utf8');
  if(!raw.equals(Buffer.from(source)))return raw;
  return Buffer.from(beforeCombinedDetailInventory(path,source));
 }
 raw=beforeColorlessFacade(path,beforeMapDeckDetailReplay(path,raw));
 raw=beforePowerShopFacade(path,beforeRecordingReplay(path,raw));
 raw=beforeStsDetailCloseout(path,beforeStsDetailRuntime(path,beforeReleaseEnemyClearance(path,raw)));
 if(path==='tests/helpers/chapter-battle-scene-source.mjs')return beforeBossMapScroll(path,raw);
 if(!Object.hasOwn(owners,path))return raw;
 let source=raw.toString('utf8'),lf=source.replaceAll('\r\n','\n');
 if(path==='tests/helpers/release-map-deck-source.mjs'&&exactSourceMatches(lf,collectorMapDeckHelper.current)){
  assert(raw.equals(Buffer.from(source))&&(source===lf||source===lf.replaceAll('\n','\r\n')),
   'uniform detached Collector map owner');
  const {current,previous,hunks}=collectorMapDeckHelper;
  const prior=restoreExactFixtureHunks({path,beforeSha256:previous.sha256,afterSha256:current.sha256,hunks},path,lf);
  assert(exactSourceMatches(prior,previous),'exact pre-Collector detached map deck helper');
  raw=Buffer.from(prior);source=lf=prior;
 }
 if(path==='tests/helpers/release-map-deck-source.mjs'&&exactSourceMatches(lf,bossMapDeckHelper.current)){
  assert(raw.equals(Buffer.from(source))&&(source===lf||source===lf.replaceAll('\n','\r\n')),
   'uniform detached Boss map owner');
  const {current,previous,hunks}=bossMapDeckHelper;
  const prior=restoreExactFixtureHunks({path,beforeSha256:previous.sha256,afterSha256:current.sha256,hunks},path,lf);
  assert(exactSourceMatches(prior,previous),'exact pre-ink detached map deck helper');
  raw=Buffer.from(prior);source=lf=prior;
 }
 const {current,previous,hunks}=owners[path];
 if(!exactSourceMatches(lf,current))return raw;
 assert(raw.equals(Buffer.from(source))&&(source===lf||source===lf.replaceAll('\n','\r\n')),
  'uniform detached Release backflow owner: '+path);
 const prior=restoreExactFixtureHunks({path,beforeSha256:previous.sha256,afterSha256:current.sha256,hunks},path,lf);
 assert(exactSourceMatches(prior,previous),'exact detached Release backflow predecessor: '+path);
 return Buffer.from(prior);
}

const sharedRuntimePath='tests/helpers/combined-epoch/source-epoch-runtime.mjs';
const sharedRuntimeReplay=Object.freeze({
  "current": {
   "sha256": "96e78e422e9135f5d947f21999b7e5476d4ef3fca16e50b91c75330a011552cf",
   "gitBlob": "f04ceba33d70db52f2c845fd66fe8a46dcf0d4ff"
  },
  "previous": {
   "sha256": "e4d3f37edd23a2040290b1091540d17776fe6f7f7a129f4c31e48e71a8f9a0c0",
   "gitBlob": "24d1f5ce20b53e3b657abf0e1a2eb568abb108a1"
  },
  "hunks": [
   {
    "at": 0,
    "before": "import { entrancePredecessor } from '../ui-entrance-source.mjs';",
    "after": "import {beforeReleaseClosureFixture} from '../release-closure-fixture-source.mjs';\nimport { entrancePredecessor } from '../ui-entrance-source.mjs';"
   },
   {
    "at": 55,
    "before": "const validPath=p=>p==='config/architecture.json'||/^src\\/lua\\/[A-Za-z0-9_-]+\\.lua$/.test(p);",
    "after": "// Use the shared exact Release inverse only for the linked runtime owners\n// whose v2.2 presentation successors postdate the frozen combined epoch.\nconst releaseRuntimeOwner=path=>path==='src/lua/abyss_battle_reward_layout.lua'||path==='src/lua/abyss_map_ui.lua';\nconst validPath=p=>p==='config/architecture.json'||/^src\\/lua\\/[A-Za-z0-9_-]+\\.lua$/.test(p);"
   },
   {
    "at": 143,
    "before": "  const projected=entrancePredecessor(path,source,rawReader(readSource),{allowConfigLayout});",
    "after": "  const readRawInput=rawReader(readSource);\n  // Track the actual raw owner before applying any inverse. An exact live\n  // successor must not be swapped for its equally projectable predecessor\n  // while a single combined read is in progress.\n  const releaseObservations=new Map();\n  const readReleaseOwner=owner=>{\n   const raw=readRawInput(owner);\n   if(!releaseRuntimeOwner(owner))return raw;\n   const uniform=typeof raw==='string'&&\n    (raw===normalize(raw)||raw===normalize(raw).replaceAll('\\n','\\r\\n'));\n   const observed=uniform?normalize(raw):raw;\n   if(releaseObservations.has(owner))\n    assert(observed===releaseObservations.get(owner),'combined linked owner identity: '+owner+' changed during Release replay');\n   else releaseObservations.set(owner,observed);\n   return beforeReleaseClosureFixture(owner,raw);\n  };\n  const projected=entrancePredecessor(path,source,readReleaseOwner,{allowConfigLayout});"
   }
  ]
 });

// Detached helper copies and the integrated live cohort consume the same
// exact runtime predecessors, without importing one another's proof graph.
export function beforeSharedReleaseRuntimeReplay(path,raw){
 if(path!==sharedRuntimePath)return raw;
 const buffer=Buffer.isBuffer(raw),source=buffer?raw.toString('utf8'):raw;
 if(typeof source!=='string'||buffer&&!Buffer.from(source).equals(raw))return raw;
 const lf=source.replaceAll('\r\n','\n');
 if(lf.includes('\r')||(source!==lf&&source!==lf.replaceAll('\n','\r\n')))return raw;
 const current=beforeDetachedReleaseBackflow(path,Buffer.from(lf)).toString('utf8');
 const {current:binding,previous,hunks}=sharedRuntimeReplay;
 if(!exactSourceMatches(current,binding))return raw;
 const prior=restoreExactFixtureHunks({path,beforeSha256:previous.sha256,afterSha256:binding.sha256,hunks},path,current);
 assert(exactSourceMatches(prior,previous),'exact shared runtime helper predecessor');
 const restored=source===lf?prior:prior.replaceAll('\n','\r\n');
 return buffer?Buffer.from(restored):restored;
}
