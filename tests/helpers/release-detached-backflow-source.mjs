import assert from 'node:assert/strict';
import {restoreExactFixtureHunks} from './exact-fixture-hunks.mjs';
import {exactSourceMatches} from './source-fingerprint.mjs';

// The detached copy continues to execute its frozen Develop and Map Deck
// helpers; the normal test process uses the current Release readers.
const owners=Object.freeze({
 "tests/helpers/develop-release-backflow-source.mjs": {
  "current": {
   "sha256": "52fdda1e1a111ada443b4a1d1109906e99f98d107e92025fbf9e7f0c4f76a851",
   "gitBlob": "679b97f6b1b89be92155afe66f648f57e699b691"
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
    "at": 337,
    "before": "export function assertDevelopBackflowCurrent(path,source){\n if(path===libraryEventPath){",
    "after": "export function assertDevelopBackflowCurrent(path,source){\n if(path===deckPath)source=beforeReleaseDeckPointer(path,source);\n if(path===libraryEventPath){"
   },
   {
    "at": 342,
    "before": " }\n source=beforeLinkedBackflow(path,beforeBattleInputHistory(path,beforeMapRoomBattleActions(path,source)));",
    "after": " }\n if(actorFocusOwners.includes(path))source=beforeVocabularyOwner(path,source);\n source=beforeLinkedBackflow(path,beforeBattleInputHistory(path,beforeMapRoomBattleActions(path,source)));"
   },
   {
    "at": 374,
    "before": "export function assertActorFocusInventory(paths,read=path=>readFileSync(path,'utf8')){\n paths=entranceInventory(paths,read);",
    "after": "export function assertActorFocusInventory(paths,read=path=>readFileSync(path,'utf8')){\n const inventoryError='complete current Actor/Focus Lua module inventory';\n assert.equal(new Set(paths).size,paths.length,inventoryError);\n const releaseInventory=hasReviewedStsStyleModules(paths);\n const readDeck=releaseInventory?reviewedStsStyleRead(read):read;\n if(releaseInventory)paths=reviewedStsStyleInventory(paths,read);\n paths=entranceInventory(paths,read);"
   },
   {
    "at": 382,
    "before": " assert(expected.includes(retiredControllerPath),'exact controller predecessor in Actor/Focus Lua inventory');\n assert.deepEqual([...paths].sort(),[...expected.filter(path=>path!==retiredControllerPath),pointerInputPath].sort(),'complete current Actor/Focus Lua module inventory');\n assertPointerInputSource(read(pointerInputPath));\n for(const path of deckPagesAdded){\n  const source=read(path);\n  assertDevelopBackflowCurrent(path,source);",
    "after": " assert(expected.includes(retiredControllerPath),'exact controller predecessor in Actor/Focus Lua inventory');\n assert.deepEqual([...paths].sort(),[...expected.filter(path=>path!==retiredControllerPath),pointerInputPath].sort(),inventoryError);\n assertPointerInputSource(read(pointerInputPath));\n for(const path of deckPagesAdded){\n  const source=readDeck(path);\n  assertDevelopBackflowCurrent(path,source);"
   },
   {
    "at": 415,
    "before": "export function beforeCurrentDeckEntranceOwner(path,source){\n if(!uiEntranceOwns(path)||!uniformSource(source))return source;",
    "after": "export function beforeCurrentDeckEntranceOwner(path,source){\n if(path===deckPath)source=beforeReleaseDeckPointer(path,source);\n if(!uiEntranceOwns(path)||!uniformSource(source))return source;"
   },
   {
    "at": 426,
    "before": "  const raw=readReleaseEntrancePredecessor(path,read(path),underlyingEntranceReader(read));\n  const source=beforeArchitectureOwner(path,path===deckLayoutPath?beforeRunHudDeckLabel(raw):raw);\n  const vocabulary=releaseVocabularyOwns(path);",
    "after": "  const raw=readReleaseEntrancePredecessor(path,read(path),underlyingEntranceReader(read));\n  const source=beforeArchitectureOwner(path,path===deckLayoutPath?beforeRunHudDeckLabel(raw):\n   path===deckPath?beforeReleaseDeckPointer(path,raw):raw);\n  const vocabulary=releaseVocabularyOwns(path);"
   },
   {
    "at": 496,
    "before": "   // before the linked Develop reader enters its older source epoch.\n   const readLive=beforeResponsiveHand(path,current)!==current?read:readOwner;\n   return authenticateDevelopBackflowWithReaders(path,current,readLive,readOwner,options);",
    "after": "   // before the linked Develop reader enters its older source epoch.\n   const releaseDeck=path===deckPath&&beforeReleaseDeckPointer(path,current)!==current;\n   const readLive=releaseDeck||beforeResponsiveHand(path,current)!==current?read:readOwner;\n   return authenticateDevelopBackflowWithReaders(path,current,readLive,readOwner,options);"
   },
   {
    "at": 502,
    "before": "}\nfunction beforePriorDevelopBackflow(path,source){\n source=beforeVocabularyOwner(path,beforeMatchEventRepair(path,source));\n return layers.reduce((prior,layer)=>predecessor(layer,path,prior),source);\n}",
    "after": "}\nfunction beforePriorLayers(path,source){\n return layers.reduce((prior,layer)=>predecessor(layer,path,prior),source);\n}\nfunction beforePriorDevelopBackflow(path,source){\n return beforePriorLayers(path,beforeVocabularyOwner(path,beforeMatchEventRepair(path,source)));\n}"
   },
   {
    "at": 513,
    "before": " const matchSuccessor=repaired!==source;\n source=repaired;\n const prior=beforePriorDevelopBackflow(path,source);\n if(prior===source)return source;\n const row=layers.find(layer=>Object.hasOwn(layer,path)&&matches(source,layer[path].after))[path];\n const actorOwner=Object.hasOwn(actorFocus.files,path)&&row===actorFocus.files[path];",
    "after": " const matchSuccessor=repaired!==source;\n const vocabularyPrior=beforeVocabularyOwner(path,repaired);\n const prior=beforePriorLayers(path,vocabularyPrior);\n const vocabularySuccessor=vocabularyPrior!==repaired;\n const checkVocabulary=live=>{\n  assert(uniformSource(live)&&live.replaceAll('\\r\\n','\\n')===repaired.replaceAll('\\r\\n','\\n'),\n   'combined linked owner identity: '+path+' changed during Develop vocabulary validation');\n  return beforeVocabularyOwner(path,live);\n };\n if(prior===vocabularyPrior){\n  if(vocabularySuccessor)checkVocabulary(beforeMatchEventRepair(path,readBackflowOwner(read,path)));\n  return vocabularyPrior;\n }\n const row=layers.find(layer=>Object.hasOwn(layer,path)&&matches(vocabularyPrior,layer[path].after))[path];\n const actorOwner=Object.hasOwn(actorFocus.files,path)&&row===actorFocus.files[path];"
   },
   {
    "at": 539,
    "before": "  }\n  const expected=owner===path?row.after:stasisOwner?(priorCurrent(owner)?.after??stasisCurrent[owner]):priorCurrent(owner).after;",
    "after": "  }\n  if(owner===path&&vocabularySuccessor)live=checkVocabulary(live);\n  const expected=owner===path?row.after:stasisOwner?(priorCurrent(owner)?.after??stasisCurrent[owner]):priorCurrent(owner).after;"
   },
   {
    "at": 560,
    "before": "export function beforeDevelopBackflow(path,source,options){\n source=beforeReleaseEntranceOwner(path,source);\n if(path==='src/lua/abyss_potion_discard_ui.lua')source=beforeKnownMasterBackflowSource(path,source);",
    "after": "export function beforeDevelopBackflow(path,source,options){\n if(path===deckPath)source=beforeReleaseDeckPointer(path,source);\n if(path===deckLayoutPath)source=beforeLinkedBackflow(path,beforeRunHudDeckLabel(source));\n source=beforeReleaseEntranceOwner(path,source);\n if(actorFocusOwners.includes(path))source=beforeVocabularyOwner(path,source);\n if(path==='src/lua/abyss_potion_discard_ui.lua')source=beforeKnownMasterBackflowSource(path,source);"
   },
   {
    "at": 587,
    "before": "function authenticateDevelopBackflowWithReaders(path,source,readLive,readLinked,options){\n const libraryPrior=beforeLibraryReadPrompt(path,source);",
    "after": "function authenticateDevelopBackflowWithReaders(path,source,readLive,readLinked,options){\n if(path===deckPath){\n  const prior=beforeReleaseDeckPointer(path,source);\n  if(prior!==source){\n   const live=readBackflowOwner(readLive,path);\n   const lf=value=>value.replaceAll('\\r\\n','\\n');\n   const livePrior=beforeReleaseDeckPointer(path,live);\n   assert(livePrior!==live&&lf(livePrior)===lf(prior),'fresh Release deck pointer owner');\n   source=prior;\n  }\n }\n const rawLive=readLive;\n readLive=owner=>owner===deckPath?beforeReleaseDeckPointer(owner,rawLive(owner)):rawLive(owner);\n if(path===deckPath||path===deckLayoutPath){\n  const deckPrior=(owner,value)=>beforeLinkedBackflow(owner,owner===deckLayoutPath?beforeRunHudDeckLabel(value):value);\n  const prior=deckPrior(path,source);\n  if(prior!==source){\n   const live=readBackflowOwner(readLive,path);\n   assert(uniformSource(live)&&live.replaceAll('\\r\\n','\\n')===source.replaceAll('\\r\\n','\\n'),\n    'combined linked owner identity: '+path+' during deck backflow validation');\n   source=prior;\n   const beforeDeck=readLive;\n   readLive=owner=>owner===path?deckPrior(owner,beforeDeck(owner)):beforeDeck(owner);\n  }\n }\n const libraryPrior=beforeLibraryReadPrompt(path,source);"
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

export function beforeDetachedReleaseBackflow(path,raw){
 if(!Object.hasOwn(owners,path))return raw;
 const source=raw.toString('utf8'),lf=source.replaceAll('\r\n','\n');
 const {current,previous,hunks}=owners[path];
 if(!exactSourceMatches(lf,current))return raw;
 assert(raw.equals(Buffer.from(source))&&(source===lf||source===lf.replaceAll('\n','\r\n')),
  'uniform detached Release backflow owner: '+path);
 const prior=restoreExactFixtureHunks({path,beforeSha256:previous.sha256,afterSha256:current.sha256,hunks},path,lf);
 assert(exactSourceMatches(prior,previous),'exact detached Release backflow predecessor: '+path);
 return Buffer.from(prior);
}
