import assert from 'node:assert/strict';
import {restoreExactFixtureHunks} from './exact-fixture-hunks.mjs';
import {exactSourceMatches} from './source-fingerprint.mjs';

// The detached copy continues to execute its frozen Develop and Map Deck
// helpers; the normal test process uses the current Release readers.
const owners=Object.freeze({
 "tests/helpers/develop-release-backflow-source.mjs": {
  "current": {
   "sha256": "34a26915b1db754b2ef20ee9f4897ce48fff36b06b74443c30bcbe6f355a1461",
   "gitBlob": "435b5f192a082e9e02054a462aba05a58115228b"
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
    "after": "export function beforeDevelopBackflow(path,source,options){\n if(path===deckPath)source=beforeReleaseDeckPointer(path,source);\n source=beforeReleaseEntranceOwner(path,source);\n if(actorFocusOwners.includes(path))source=beforeVocabularyOwner(path,source);\n if(path==='src/lua/abyss_potion_discard_ui.lua')source=beforeKnownMasterBackflowSource(path,source);"
   },
   {
    "at": 586,
    "before": "function authenticateDevelopBackflowWithReaders(path,source,readLive,readLinked,options){\n const libraryPrior=beforeLibraryReadPrompt(path,source);",
    "after": "function authenticateDevelopBackflowWithReaders(path,source,readLive,readLinked,options){\n if(path===deckPath){\n  const prior=beforeReleaseDeckPointer(path,source);\n  if(prior!==source){\n   const live=readBackflowOwner(readLive,path);\n   const lf=value=>value.replaceAll('\\r\\n','\\n');\n   const livePrior=beforeReleaseDeckPointer(path,live);\n   assert(livePrior!==live&&lf(livePrior)===lf(prior),'fresh Release deck pointer owner');\n   source=prior;\n  }\n }\n const rawLive=readLive;\n readLive=owner=>owner===deckPath?beforeReleaseDeckPointer(owner,rawLive(owner)):rawLive(owner);\n const libraryPrior=beforeLibraryReadPrompt(path,source);"
   }
  ]
 },
 "tests/helpers/release-map-deck-source.mjs": {
  "current": {
   "sha256": "6f12662593a70a404e726acf52264c8986db2080cb78fb126436066cbbbde1ad",
   "gitBlob": "6439fcb091ffa55f709f5fcffaedd29a044f6bd3"
  },
  "previous": {
   "sha256": "ddaf9067612caa2e279e4702e6c7bf94a70a4201c0b87b87466060ec7abaf79b",
   "gitBlob": "111ecb276fe90556f7c7702af4c6c4f1d825e013"
  },
  "hunks": [
   {
    "at": 9,
    "before": "import {beforeHotfixMapDeckHelperSource} from './hotfix-map-deck-helper-source.mjs';\n",
    "after": "import {beforeHotfixMapDeckHelperSource} from './hotfix-map-deck-helper-source.mjs';\nimport {beforeReleaseDeckPointer} from './release-deck-pointer-source.mjs';\n"
   },
   {
    "at": 177,
    "before": "export function beforeMapDeckSource(path,source,read){\n  assertProductionMapDeckOwners(path,source,read);",
    "after": "export function beforeMapDeckSource(path,source,read){\n const deckPath='src/lua/abyss_deck_ui.lua';\n const rawRead=read;\n source=path===deckPath?beforeReleaseDeckPointer(path,source):source;\n read=(owner,...args)=>owner===deckPath?beforeReleaseDeckPointer(owner,rawRead(owner,...args)):rawRead(owner,...args);\n  assertProductionMapDeckOwners(path,source,read);"
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
