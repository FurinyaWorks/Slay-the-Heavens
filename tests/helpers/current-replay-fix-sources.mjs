// Exact predecessors for the current replay and test repairs. Current
// discovery and test execution continue to use the files on disk.
import {restoreExactFixtureHunks} from './exact-fixture-hunks.mjs';

const bindings = new Map([
 {
  "path": "tests/competition-roster-config-composition.test.mjs",
  "beforeSha256": "049459f6f6f652d83cc78230145279290fe3766782c7a316056e05f7539f33fd",
  "afterSha256": "6c0f04822d7b8b7950429c426c8be7085e1bc0594ca3926848e688f988a7db57",
  "hunks": [
   {
    "at": 0,
    "before": "import {currentProductionRereads} from './helpers/current-production-source-reads.mjs';\nimport nativeTest,{after} from 'node:test';",
    "after": "import {currentProductionRereads} from './helpers/current-production-source-reads.mjs';\nimport {beforeInputRetirementReader,retiredControllerPath} from './helpers/input-retirement-source.mjs';\nimport nativeTest,{after} from 'node:test';"
   },
   {
    "at": 194,
    "before": " const raw=readFileSync(path,'utf8').replaceAll('\\r\\n','\\n'),layers=JSON.parse(raw).layers,owners=sourceEpoch.proof.owners;\n const admittedReads=[...owners,...currentProductionRereads];\n for(const file of readdirSync('src/lua',{recursive:true}).filter(file=>file.endsWith('.lua')))",
    "after": " const raw=readFileSync(path,'utf8').replaceAll('\\r\\n','\\n'),layers=JSON.parse(raw).layers,owners=sourceEpoch.proof.owners;\n const priorReadOrder=[...owners,...currentProductionRereads];\n for(const file of readdirSync('src/lua',{recursive:true}).filter(file=>file.endsWith('.lua')))"
   },
   {
    "at": 205,
    "before": " const project=input=>sourceEpoch.preCombinedSource(path,input,{target:'develop',readSource:reader});\n const accepted=project(raw);assert.equal(hash(accepted),expected);assert.notEqual(accepted,raw);assert.deepEqual(reads,admittedReads,'complete raw owner admission in original order');\n reads=[];assert.equal(project(raw.replaceAll('\\n','\\r\\n')),accepted);assert.deepEqual(reads,admittedReads,'CRLF is not cached authorization');",
    "after": " const project=input=>sourceEpoch.preCombinedSource(path,input,{target:'develop',readSource:reader});\n const accepted=project(raw);assert.equal(hash(accepted),expected);assert.notEqual(accepted,raw);\n const admittedReads=[...reads];\n assert.equal(admittedReads.length,460,'complete raw owner admission');\n assert.equal(hash(JSON.stringify(admittedReads)),'6b72ef490e6f79b870b0a21d5b63ddb122f065aff81f837e8f6fa3bafbd40d51','complete raw owner admission in order');\n let position=-1;\n for(const owner of priorReadOrder){\n  position=admittedReads.indexOf(owner,position+1);\n  assert.notEqual(position,-1,'retained original Roster admission read: '+owner);\n }\n reads=[];assert.equal(project(raw.replaceAll('\\n','\\r\\n')),accepted);assert.deepEqual(reads,admittedReads,'CRLF is not cached authorization');"
   },
   {
    "at": 217,
    "before": "  changed=owner;\n  for(replacement of [readFileSync(owner,'utf8')+'\\n',null,new Error('missing current owner')]){\n   reads=[];assert.throws(()=>project(raw),/linked owner (identity|missing)/);\n   assert.deepEqual(reads,owners.slice(0,owners.indexOf(owner)+1),'stop at the first untrusted raw owner');\n  }",
    "after": "  changed=owner;\n  const missing=new Error('missing current owner');\n  const invalid=owner===retiredControllerPath?[beforeInputRetirementReader(p=>readFileSync(p,'utf8'))(owner),missing]:[readFileSync(owner,'utf8')+'\\n',null,missing];\n  for(replacement of invalid){\n   reads=[];assert.throws(()=>project(raw),/linked owner (identity|missing)/);\n   assert.deepEqual(reads,admittedReads.slice(0,admittedReads.indexOf(owner)+1),'stop at the first untrusted raw owner');\n  }"
   }
  ]
 },
 {
  "path": "tests/defect-actor-boundary.test.mjs",
  "beforeSha256": "8a0596438f603331d4e961f1887c68e5303ba8e920463bfde4973b22df17da0d",
  "afterSha256": "c2f7eca4ef113eaa612aefd7740581e97b95b366d46eb758516bec773e076fcd",
  "hunks": [
   {
    "at": 11,
    "before": "import {beforeCurrentProductionSource} from './helpers/character-preparation-source.mjs';\nimport {actorFocusAdded,assertActorFocusInventory,stasisUpgradeAddedPaths} from './helpers/develop-release-backflow-source.mjs';\nconst require=createRequire(import.meta.url),luaparse=require('luaparse');",
    "after": "import {beforeCurrentProductionSource} from './helpers/character-preparation-source.mjs';\nimport {actorFocusAdded,assertActorFocusInventory,deckPagesAdded,stasisUpgradeAddedPaths} from './helpers/develop-release-backflow-source.mjs';\nimport {beforeCombatEvents,beforeInputRetirementReader,pointerInputPath,retiredControllerPath} from './helpers/input-retirement-source.mjs';\nconst require=createRequire(import.meta.url),luaparse=require('luaparse');"
   },
   {
    "at": 24,
    "before": " const readLive=path=>Object.hasOwn(live,path)?live[path]:read(path);\n assert.deepEqual(Object.keys(live).sort(),[...Object.keys(proof.current),...actorFocusAdded,...stasisUpgradeAddedPaths].sort(),'complete live source inventory before preStyle');\n assertActorFocusInventory(Object.keys(raw),readLive);\n for(const [path,binding]of Object.entries(proof.current))\n  assert.equal(beforeCurrentProductionSource(path,live[path],readLive).replaceAll('\\r\\n','\\n'),binding.source,'live preStyle input identity: '+path);\n const admitted=sourceEpoch.preCombinedSource(config,live[config],{target:'stsStylePrior',readSource:readLive});",
    "after": " const readLive=path=>Object.hasOwn(live,path)?live[path]:read(path);\n const expected=[...Object.keys(proof.current),...actorFocusAdded,...stasisUpgradeAddedPaths,...deckPagesAdded];\n assert(expected.includes(retiredControllerPath),'preStyle inventory includes the historical controller');\n assert.deepEqual(Object.keys(live).sort(),[...expected.filter(path=>path!==retiredControllerPath),pointerInputPath].sort(),'complete live source inventory before preStyle');\n assertActorFocusInventory(Object.keys(raw),readLive);\n const historicalRead=beforeInputRetirementReader(readLive);\n for(const [path,binding]of Object.entries(proof.current)){\n  const source=path===retiredControllerPath?historicalRead(path):live[path];\n  assert.equal(beforeCurrentProductionSource(path,source,readLive).replaceAll('\\r\\n','\\n'),binding.source,'live preStyle input identity: '+path);\n }\n const admitted=sourceEpoch.preCombinedSource(config,live[config],{target:'stsStylePrior',readSource:readLive});"
   },
   {
    "at": 98,
    "before": "  .replaceAll('        local Actors=actorHost()\\n',''),original[utility]);\n assert.equal(read(queued).replace(\"local function utilityActorHost()return require('abyss_actor')end\\n\",'')\n  .replace('utility.prepareEffect(state,e,target,utilityActorHost)','utility.prepareEffect(state,e,target)'),original[queued]);",
    "after": "  .replaceAll('        local Actors=actorHost()\\n',''),original[utility]);\n assert.equal(beforeCombatEvents(queued,read(queued)).replace(\"local function utilityActorHost()return require('abyss_actor')end\\n\",'')\n  .replace('utility.prepareEffect(state,e,target,utilityActorHost)','utility.prepareEffect(state,e,target)'),original[queued]);"
   },
   {
    "at": 134,
    "before": " assert.equal(hosts.length,3,'original eager Actor, untouched Watcher host and new Utility host');\n for(const name of ['utilityActorHost','watcherActorHost'])assert(hosts.some(e=>read(queued).split('\\n')[e.line-1].includes(`local function ${name}()`)));\n // Parse the complete changed module for each mutant, then replace its edges",
    "after": " assert.equal(hosts.length,3,'original eager Actor, untouched Watcher host and new Utility host');\n const queuedLines=raw[queued].split('\\n');\n for(const name of ['utilityActorHost','watcherActorHost'])assert(hosts.some(e=>queuedLines[e.line-1].includes(`local function ${name}()`)));\n // Parse the complete changed module for each mutant, then replace its edges"
   }
  ]
 },
 {
  "path": "tests/helpers/fork-preflight-source.mjs",
  "beforeSha256": "f1611ba371126867ce69926daa71fbb211bafb32ece60362d992cd9d3efc49c0",
  "afterSha256": "3d693e7d95844a9bec8ffe43cc128dacddb8555b706b142563fb2f3ebf816d73",
  "hunks": [
   {
    "at": 3,
    "before": "import {assertDevelopBackflowCurrent,authenticateDevelopBackflow,beforeDevelopBackflow,developBackflowOwns} from './develop-release-backflow-source.mjs';\nimport {beforeCalibrationReplay} from './calibration-replay-sources.mjs';\nimport {beforeNativeHostReplay} from './native-host-replay-source.mjs';",
    "after": "import {assertDevelopBackflowCurrent,authenticateDevelopBackflow,beforeDevelopBackflow,developBackflowOwns} from './develop-release-backflow-source.mjs';\nimport {beforeCalibrationReplay,beforeCurrentReplayCopier} from './calibration-replay-sources.mjs';\nimport {beforeNativeHostReplay} from './native-host-replay-source.mjs';"
   },
   {
    "at": 11,
    "before": "import {beforeStsFadeCi} from './sts-fade-ci-source.mjs';\nimport {beforeIntegratedStsInventory} from './sts-selection-fade-source.mjs';",
    "after": "import {beforeStsFadeCi} from './sts-fade-ci-source.mjs';\nimport {beforeCurrentReplayFixes} from './current-replay-fix-sources.mjs';\nimport {beforeIntegratedStsInventory} from './sts-selection-fade-source.mjs';"
   },
   {
    "at": 324,
    "before": "function releaseHistoricalInput(path,source){\n return beforeRebasedCopier(path,source)!==source?historicalReleaseCopier(source):beforeRebasedRelease(path,source);",
    "after": "function releaseHistoricalInput(path,source){\n source=beforeCurrentReplayCopier(path,source);\n return beforeRebasedCopier(path,source)!==source?historicalReleaseCopier(source):beforeRebasedRelease(path,source);"
   },
   {
    "at": 754,
    "before": " const deck=beforeDeckPagesSuiteSource(path,production);\n const merged=beforeDevelopReplayMerge(path,deck);\n return beforeForkFirstCi(path,beforeReplayArchiveStorage(path,merged));",
    "after": " const deck=beforeDeckPagesSuiteSource(path,production);\n const merged=beforeDevelopReplayMerge(path,beforeCurrentReplayFixes(path,deck));\n return beforeForkFirstCi(path,beforeReplayArchiveStorage(path,merged));"
   },
   {
    "at": 769,
    "before": " assertNativeFlowFixturesCurrent(liveRead);\n read=(path,encoding)=>beforeCalibrationReplay(path,liveRead(path,encoding));\n const readCurrent=(path,encoding)=>{",
    "after": " assertNativeFlowFixturesCurrent(liveRead);\n read=(path,encoding)=>beforeCalibrationReplay(path,beforeCurrentReplayFixes(path,liveRead(path,encoding)));\n const readCurrent=(path,encoding)=>{"
   },
   {
    "at": 816,
    "before": "export function beforePreflightSource(path,source,view='prior'){\n source=beforeNativeFlowFixture(path,source);",
    "after": "export function beforePreflightSource(path,source,view='prior'){\n source=beforeCurrentReplayFixes(path,source);\n source=beforeNativeFlowFixture(path,source);"
   }
  ]
 },
 {
  "path": "tests/helpers/input-retirement-source.mjs",
  "beforeSha256": "7d849cfad2c62efc07b65bb4c845dfe6b54b2f3bf2d3bca560457a1eed631488",
  "afterSha256": "4d588c2a31f6fd9c6c03269ed310074dc13c865ae01b499d3e17f7bfb5dda624",
  "hunks": [
   {
    "at": 8,
    "before": "import {beforeNativeFlowFixture} from './native-flow-fixture-source.mjs';\nimport {exactSourceMatches as matches} from './source-fingerprint.mjs';",
    "after": "import {beforeNativeFlowFixture} from './native-flow-fixture-source.mjs';\nimport {beforeCurrentReplayFixes} from './current-replay-fix-sources.mjs';\nimport {exactSourceMatches as matches} from './source-fingerprint.mjs';"
   },
   {
    "at": 60,
    "before": "const browserBackflow=JSON.parse(gunzipSync(browserArchive));\nassert.equal(browserBackflow.base,'beba19bad25db7de71f96af521656c13b882909b');",
    "after": "const browserBackflow=JSON.parse(gunzipSync(browserArchive));\nconst deckChromePath='src/lua/abyss_deck_ui.lua';\nassert.equal(browserBackflow.base,'beba19bad25db7de71f96af521656c13b882909b');"
   },
   {
    "at": 68,
    "before": " const row=Object.hasOwn(browserBackflow.files,path)&&browserBackflow.files[path];\n if(!row||!matches(source,row.after))return source;",
    "after": " const row=Object.hasOwn(browserBackflow.files,path)&&browserBackflow.files[path];\n if(path===deckChromePath)source=beforeCurrentReplayFixes(path,source);\n if(!row||!matches(source,row.after))return source;"
   },
   {
    "at": 81,
    "before": "}\nexport function beforePotionBackflow(path,source){\n const row=Object.hasOwn(potionBackflow.files,path)&&potionBackflow.files[path];\n if(!row||!matches(source,row.after))return source;",
    "after": "}\nconst rewardsBackView='src/lua/abyss_game_ui_view.lua';\nconst rewardsBackViewSuccessor=Object.freeze({\n sha256:'9b4968a3fd23e0956ef565ef4da1d4dbc2a0c5b666308c59c963d02c8f15f0fb',\n gitBlob:'96f9fadefeabc3d3540e2797943c3b415605140d',\n});\nfunction beforeRewardsBackExtraction(path,source){\n if(path!==rewardsBackView||!matches(source,rewardsBackViewSuccessor))return source;\n const helper=`local function refreshRewardsBack(button,available)\n    button:SetVisible(available)\n    if button:GetChild('v25Face') then\n        require('abyss_v25_menu_view').button(button,available)\n    end\n    -- Route preview raises the map. Raise this sibling when navigation returns.\n    if available then button:SetAsLastSibling() end\nend\n\n`;\n const inline=`local rewardsBack=child(\"combatRewards\")\n            rewardsBack:SetVisible(returnAvailable)\n            if rewardsBack:GetChild('v25Face') then\n                require('abyss_v25_menu_view').button(rewardsBack,returnAvailable)\n            end\n            -- Route preview raises the full-page map. Restore this sibling above it\n            -- when returning to navigation; visibility alone leaves it occluded.\n            if returnAvailable then rewardsBack:SetAsLastSibling() end`;\n const text=normalize(source),call='refreshRewardsBack(child(\"combatRewards\"),returnAvailable)';\n assert.equal(text.split(helper).length,2,'exact rewards back helper extraction');\n assert.equal(text.split(call).length,2,'exact rewards back helper call');\n const prior=text.replace(helper,'').replace(call,inline);\n assert(matches(prior,potionBackflow.files[path].after),'exact rewards back predecessor');\n return source.includes('\\r\\n')?prior.replaceAll('\\n','\\r\\n'):prior;\n}\nexport function beforePotionBackflow(path,source){\n const row=Object.hasOwn(potionBackflow.files,path)&&potionBackflow.files[path];\n source=beforeRewardsBackExtraction(path,source);\n if(!row||!matches(source,row.after))return source;"
   },
   {
    "at": 123,
    "before": " if(!row)return;\n assert(matches(source,row.after),'fresh current production owner: '+path);\n let live;\n try{live=read(path);}catch(error){assert.fail('combined linked owner missing: '+path+': '+String(error?.message??error));}\n assert(matches(live,row.after),'combined linked owner identity: '+path+' during deck/potion backflow validation');\n}",
    "after": " if(!row)return;\n const expected=path===rewardsBackView?rewardsBackViewSuccessor:row.after;\n const isCurrent=value=>{\n  if(path!==deckChromePath)return matches(value,expected);\n  const prior=beforeCurrentReplayFixes(path,value);\n  return prior!==value&&matches(prior,expected);\n };\n assert(isCurrent(source),'fresh current production owner: '+path);\n let live;\n try{live=read(path);}catch(error){assert.fail('combined linked owner missing: '+path+': '+String(error?.message??error));}\n assert(isCurrent(live),'combined linked owner identity: '+path+' during deck/potion backflow validation');\n}"
   }
  ]
 },
 {
  "path": "tests/helpers/input-retirement-sts-binding.mjs",
  "beforeSha256": "21146df5c544deee55f2a2553c039727508b3c827d93ed4728bd960f0af0afd1",
  "afterSha256": "f6395a7c5e299738db3caf30f29d7d29724e7ac091af012a585c76b785697219",
  "hunks": [
   {
    "at": 102,
    "before": "\nexport function inputRetirementStsFixtureSource(path,raw){\n const buffered=Buffer.isBuffer(raw),source=buffered?raw.toString('utf8'):raw;\n const proof=runtimeFixtureSuccessors.find(row=>row.path===path);\n const original=proof?restoreExactFixtureHunks(proof,path,source):source;\n const projected=original!==source&&source.includes('\\r\\n')?original.replaceAll('\\n','\\r\\n'):original;\n const fixture=beforeNativeFlowFixture(path,beforeMapNodeVisualsLineEndings(path,projected),{requireCurrent:true});",
    "after": "\nexport function beforeStsRuntimeFixtureSuccessor(path,source){\n const proof=runtimeFixtureSuccessors.find(row=>row.path===path);\n const original=proof?restoreExactFixtureHunks(proof,path,source):source;\n return original!==source&&source.includes('\\r\\n')?original.replaceAll('\\n','\\r\\n'):original;\n}\n\nexport function inputRetirementStsFixtureSource(path,raw){\n const buffered=Buffer.isBuffer(raw),source=buffered?raw.toString('utf8'):raw;\n const projected=beforeStsRuntimeFixtureSuccessor(path,source);\n const fixture=beforeNativeFlowFixture(path,beforeMapNodeVisualsLineEndings(path,projected),{requireCurrent:true});"
   }
  ]
 },
 {
  "path": "tests/helpers/m7-core-final-source-inverse.mjs",
  "beforeSha256": "96eae58fe74ee798a8c87be865a3640508e983e43e98b55e0ccd8756516ba768",
  "afterSha256": "acd5d226aa7f1e4e843a2b6db3f6e4d97b36476df2319ad6b6176cfac1c0cf86",
  "hunks": [
   {
    "at": 9,
    "before": "import assert from 'node:assert/strict';\nconst live=p=>readFileSync(new URL('../../'+p,import.meta.url),'utf8');",
    "after": "import assert from 'node:assert/strict';\nimport {beforeCombatEvents,isCurrentInputRetirementSource} from './input-retirement-source.mjs';\nconst live=p=>readFileSync(new URL('../../'+p,import.meta.url),'utf8');"
   },
   {
    "at": 29,
    "before": "}\n// Explicit compatibility readers share this same full-current admission gate.\nexport {actorReader as currentDefectActorReader};\nexport function preM7FinalSource(path,source,{readSource=live}={}){\n readSource=readers.get(readSource)??readSource;\n const input=source;source=preDefectActorSource(path,source,{readSource:actorReader(readSource)});\n const utility=preDefectUtilitySource(path,source);if(utility!==source)return utility;",
    "after": "}\n// Explicit live compatibility readers start with the exact current architecture\n// before authenticating the complete current graph and exposing an earlier view.\nexport function currentDefectActorReader(raw){\n if(typeof raw!=='function')return raw;\n return path=>{\n  const source=raw(actorAnchor);\n  assert(isCurrentInputRetirementSource(actorAnchor,source),'combined linked owner identity: '+actorAnchor);\n  assert.equal(sourceEpoch.preCombinedSource(actorAnchor,source,{target:'pr618',readSource:raw}),\n   actorTarget.files[actorAnchor].source,'exact current Actor admission target');\n  assert(Object.hasOwn(defectActorEpoch.proof.current,path),'known Actor owner');\n  return actorTarget.files[path].source;\n };\n}\nexport function preM7FinalSource(path,source,{readSource=live}={}){\n readSource=readers.get(readSource)??readSource;\n const input=source;\n // Authenticate the post-Actor combat backflow against real disk owners before\n // passing an older source to the independently frozen Actor verifier.\n const actorInput=path==='src/lua/abyss_combat_queued_play.lua'&&beforeCombatEvents(path,input)!==input\n  ?sourceEpoch.preCombinedSource(path,input,{target:'pr618',readSource}):input;\n source=preDefectActorSource(path,actorInput,{readSource:actorReader(readSource)});\n const utility=preDefectUtilitySource(path,source);if(utility!==source)return utility;"
   }
  ]
 },
 {
  "path": "tests/helpers/release-ui-restore-source.mjs",
  "beforeSha256": "75da223110ac6a108face448920b3c07f61c427544cc8953a043721f99499c03",
  "afterSha256": "de6835c2a44271c50a20ea39cb18c68f3d5c84b04ce8959171c013b34efc4664",
  "hunks": [
   {
    "at": 3,
    "before": "import {authorizeRefinedReleaseProduction,beforeRefinedReleaseProduction} from './refined-release-source.mjs';\nimport assert from 'node:assert/strict';",
    "after": "import {authorizeRefinedReleaseProduction,beforeRefinedReleaseProduction} from './refined-release-source.mjs';\nimport {inputRetirementStsFixtureSource} from './input-retirement-sts-binding.mjs';\nimport {beforeStsFadeCi} from './sts-fade-ci-source.mjs';\nimport {beforeCurrentReplayFixes} from './current-replay-fix-sources.mjs';\nimport assert from 'node:assert/strict';"
   },
   {
    "at": 60,
    "before": "export const beforeRecordingUi=(path,source)=>beforeReleaseDetailSource(path,recording.project(path,beforeCombatVisualSource(path,source)));\nexport function beforeAuthenticatedRecordingStage(path,source,read){\n const released=beforeRebasedRelease(path,source);\n if(released!==source)authorizeRebasedRelease([[path,source]],owner=>read(owner,'utf8'));\n const readReleased=owner=>beforeRebasedRelease(owner,read(owner,'utf8'));\n const current=beforeCombatVisualSource(path,released,readReleased);\n const prior=recording.project(path,current);\n if(prior!==current){\n  const live=combatVisualPriorRead(readReleased)(path,'utf8');\n  assert(matches(live,recording.files[path].after),'recording UI linked owner changed: '+path);",
    "after": "export const beforeRecordingUi=(path,source)=>beforeReleaseDetailSource(path,recording.project(path,beforeCombatVisualSource(path,source)));\nconst officialRuntimePath='tests/official-assets-runtime.test.mjs';\nconst currentOfficialRuntime={\n sha256:'a3341b88551a035189ccc811fa7aa2b7f2eb9c1b6377baa22df6ff3b1fc8c828',\n gitBlob:'82bdb7dda43d8772e1d1d5ffac3a9690509d9dd4',\n};\nconst deckLayoutPath='scripts/deck-ui-layout.mjs';\nconst pileReturnLayout={\n sha256:'0f57f26a4fb520c8feb1df92d48417a6b445900a9ae453c160f500e5a9ee2272',\n gitBlob:'6c9ce59b446f0dd9b8d5f9ffb3c2303e0320195d',\n};\nfunction recordingRuntimeInput(path,source){\n source=beforeCurrentReplayFixes(path,source);\n if(path!==officialRuntimePath||!matches(source,currentOfficialRuntime))return source;\n return beforeStsFadeCi(path,inputRetirementStsFixtureSource(path,source));\n}\nfunction recordingLayoutInput(path,source){\n if(path!==deckLayoutPath||!matches(source,pileReturnLayout))return source;\n const successor=\"battlePileReturn(button('pileReturn',[-550,-237,180,54],'返回'),theme.officialAssets.buttonInk)\";\n const predecessor=\"battlePileReturn(button('pileReturn',[-550,-237,180,54],'返回'),true,undefined,theme.officialAssets.buttonInk)\";\n assert.equal(source.split(successor).length,2,'exact pile return layout change');\n const prior=source.replace(successor,predecessor);\n assert(matches(prior,recording.files[path].after),'exact recording layout predecessor');\n return prior;\n}\nexport function beforeAuthenticatedRecordingStage(path,source,read){\n const input=recordingRuntimeInput(path,source);\n if(input!==source){\n  const live=read(path,'utf8');\n  assert(typeof live==='string'&&live.replaceAll('\\r\\n','\\n')===source.replaceAll('\\r\\n','\\n'),\n   'recording UI linked owner changed: '+path);\n }\n const readInput=owner=>recordingRuntimeInput(owner,read(owner,'utf8'));\n const released=beforeRebasedRelease(path,input);\n if(released!==input)authorizeRebasedRelease([[path,input]],readInput);\n const readReleased=owner=>beforeRebasedRelease(owner,readInput(owner));\n const current=recordingLayoutInput(path,beforeCombatVisualSource(path,released,readReleased));\n const prior=recording.project(path,current);\n if(prior!==current){\n  const live=recordingLayoutInput(path,combatVisualPriorRead(readReleased)(path,'utf8'));\n  assert(matches(live,recording.files[path].after),'recording UI linked owner changed: '+path);"
   }
  ]
 },
 {
  "path": "tests/helpers/sts-style-ci-source.mjs",
  "beforeSha256": "054113396d3db48407c2aee4f5c9563e6c4f2e8a80d37c979c79b6b3afac423a",
  "afterSha256": "fa19097c79ce5c8395e27569188dc99ec7b10d7589e0b30d621ddf607f54f0ab",
  "hunks": [
   {
    "at": 7,
    "before": "import {extendFeedbackCiProof} from './sts-feedback-source-runtime.mjs';\nconst hash=s=>createHash('sha256').update(s).digest('hex'),norm=s=>s.replaceAll('\\r\\n','\\n');",
    "after": "import {extendFeedbackCiProof} from './sts-feedback-source-runtime.mjs';\nimport {beforeStsRuntimeFixtureSuccessor} from './input-retirement-sts-binding.mjs';\nconst hash=s=>createHash('sha256').update(s).digest('hex'),norm=s=>s.replaceAll('\\r\\n','\\n');"
   },
   {
    "at": 25,
    "before": "export function preStsStyleCiSource(path,source){\n source=integratedSource(path,source,'sts');\n const row=Object.hasOwn(stsStyleCiProof.files,path)?stsStyleCiProof.files[path]:null;",
    "after": "export function preStsStyleCiSource(path,source){\n source=integratedSource(path,beforeStsRuntimeFixtureSuccessor(path,source),'sts');\n const row=Object.hasOwn(stsStyleCiProof.files,path)?stsStyleCiProof.files[path]:null;"
   },
   {
    "at": 35,
    "before": " paths=integratedPriorInventory(paths,'sts','js',read);\n read=integratedRead('sts',{read});\n const proof=stsStyleCiProof;if(!proof.addedTests.some(path=>paths.includes(path)))return [...paths];\n assert.deepEqual([...paths].sort(),proof.afterInventory,'complete StS Full inventory');\n for(const p of proof.addedTests)assert.equal(hash(norm(read(p,'utf8'))),proof.files[p].after.sha256,'StS added inventory source: '+p);\n return [...proof.beforeInventory];\n}",
    "after": " paths=integratedPriorInventory(paths,'sts','js',read);\n const readCurrent=integratedRead('sts',{read:withStsRuntimePredecessors(read)});\n const proof=stsStyleCiProof;if(!proof.addedTests.some(path=>paths.includes(path)))return [...paths];\n assert.deepEqual([...paths].sort(),proof.afterInventory,'complete StS Full inventory');\n for(const p of proof.addedTests)assert.equal(hash(norm(readCurrent(p,'utf8'))),proof.files[p].after.sha256,'StS added inventory source: '+p);\n return [...proof.beforeInventory];\n}\nfunction withStsRuntimePredecessors(read){\n return (path,encoding)=>beforeStsRuntimeFixtureSuccessor(path,read(path,encoding));\n}"
   },
   {
    "at": 46,
    "before": " paths=integratedPriorInventory(paths,'sts','js',read);\n read=integratedRead('sts',{read});\n assert.deepEqual([...paths].sort(),stsStyleCiProof.afterInventory,'complete StS current Full inventory');",
    "after": " paths=integratedPriorInventory(paths,'sts','js',read);\n read=integratedRead('sts',{read:withStsRuntimePredecessors(read)});\n assert.deepEqual([...paths].sort(),stsStyleCiProof.afterInventory,'complete StS current Full inventory');"
   }
  ]
 },
 {
  "path": "tests/golden-idol-source-epoch.test.mjs",
  "beforeSha256": "390dd6acb1c9d822b77002bebb06c40d4c45e29f27d4cd74c93e3113d7dda7b8",
  "afterSha256": "0597f48fb68fd5b98e1170e4f78f4ba50a25ccec6a163b1d3d056bc4409a6c52",
  "hunks": [
   {
    "at": 0,
    "before": "import {sourceSlice} from './helpers/closeout-source-epoch.mjs';\nimport test from 'node:test';",
    "after": "import {beforeCharacterPreparationSource,beforeCurrentProductionSource} from './helpers/character-preparation-source.mjs';\nimport {pointerInputPath,readRetiredController,retiredControllerPath} from './helpers/input-retirement-source.mjs';\nimport {sourceSlice} from './helpers/closeout-source-epoch.mjs';\nimport {beforePc13ThenV2UiHudSource} from './helpers/pc13-reward-cover-source.mjs';\nimport test from 'node:test';"
   },
   {
    "at": 13,
    "before": "\nconst readFileSync=(file,encoding)=>{\n const value=nativeReadFileSync(file,encoding);\n if(file!=='config/architecture.json'&&!file.startsWith('src/lua/'))return value;\n const source=typeof value==='string'?value:value.toString('utf8'),prior=sourceSlice(file,source,'pr614');\n return typeof value==='string'?prior:prior===source?value:Buffer.from(prior);\n};",
    "after": "\nconst currentRaw=file=>nativeReadFileSync(file,'utf8');\nfunction goldenReader(read){\n const admitted=file=>{\n  if(file===retiredControllerPath){\n   const {source,restored}=readRetiredController(read);\n   assert(restored,'current Controller must be retired');\n   return beforeCharacterPreparationSource(file,source,read);\n  }\n  return beforeCurrentProductionSource(file,read(file),read);\n };\n return file=>beforePc13ThenV2UiHudSource(file,sourceSlice(file,admitted(file),'pr614',admitted),read);\n}\nconst liveGolden=goldenReader(currentRaw);\nconst readFileSync=(file,encoding)=>{\n if(file!=='config/architecture.json'&&!file.startsWith('src/lua/'))return nativeReadFileSync(file,encoding);\n const source=liveGolden(file);\n return encoding?source:Buffer.from(source);\n};"
   },
   {
    "at": 119,
    "before": "test('live LF and CRLF raw owner reads authenticate 80 current owners on every call',()=>{\n const config='config/architecture.json',input=readFileSync(config,'utf8'),expected=proof.targets.actor.files[config].source;\n for(const crlf of [false,true]){\n  const seen=[];let corrupt=null,missing=null;\n  const live=file=>{seen.push(file);if(file===missing)return null;const bytes=readFileSync(file,'utf8').replaceAll('\\r\\n','\\n');return file===corrupt?bytes+'\\n':crlf?bytes.replaceAll('\\n','\\r\\n'):bytes;};\n  for(let repeat=0;repeat<2;repeat++){seen.length=0;assert.equal(sourceEpoch.preCombinedSource(config,input,{target:'actor',readSource:live}),expected);assert.deepEqual(seen,proof.owners);}\n  for(const owner of proof.owners){\n   corrupt=owner;assert.throws(()=>sourceEpoch.preCombinedSource(config,input,{target:'actor',readSource:live}),/linked owner identity/,owner);corrupt=null;\n   missing=owner;assert.throws(()=>sourceEpoch.preCombinedSource(path,readFileSync(path,'utf8'),{target:'goldenIdolPrior',readSource:live}),/linked owner identity/,owner);missing=null;\n  }",
    "after": "test('live LF and CRLF raw owner reads authenticate 80 current owners on every call',()=>{\n const config='config/architecture.json',expected=proof.targets.actor.files[config].source;\n const stamped=new Map();\n const observe=file=>{\n  let raw;try{raw=currentRaw(file);}catch(error){if(file!==retiredControllerPath||error.code!=='ENOENT')throw error;raw=null;}\n  if(stamped.has(file))assert(raw===stamped.get(file),'fresh Golden Idol raw owner: '+file);\n  else stamped.set(file,raw);\n  return raw;\n };\n const readView=goldenReader(observe);\n const prior=new Map([...new Set([...proof.owners,path,config,pointerInputPath])].map(file=>[file,readView(file).replaceAll('\\r\\n','\\n')]));\n const confirm=()=>{for(const file of stamped.keys())observe(file);};\n for(const crlf of [false,true]){\n  const seen=[];let corrupt=null,missing=null;\n  const live=file=>{\n   seen.push(file);if(file===missing)return null;\n   assert(prior.has(file),'known Golden Idol historical owner: '+file);\n   observe(file);\n   const source=prior.get(file);\n   return file===corrupt?source+'\\n':crlf?source.replaceAll('\\n','\\r\\n'):source;\n  };\n  const project=(file,target)=>{\n   // Historical values are derived once for a fixed cohort. The physical\n   // inputs are checked again around every invocation and requested owner.\n   confirm();\n   try{return sourceEpoch.preCombinedSource(file,prior.get(file),{target,readSource:live});}\n   finally{confirm();}\n  };\n  for(let repeat=0;repeat<2;repeat++){seen.length=0;assert.equal(project(config,'actor'),expected);assert.deepEqual(seen,proof.owners);}\n  for(const owner of proof.owners){\n   corrupt=owner;assert.throws(()=>project(config,'actor'),/linked owner identity/,owner);corrupt=null;\n   missing=owner;assert.throws(()=>project(path,'goldenIdolPrior'),/linked owner identity/,owner);missing=null;\n  }"
   }
  ]
 },
 {
  "path": "tests/v25-map-layout.test.mjs",
  "beforeSha256": "5040690e1a91ed327826662e953b0ff7ecdc4ecb47d00eeb5e5c6dbb4984c292",
  "afterSha256": "1e672671a07a86720fe9ade094038e0f01efc7619fadee32275009c35222d428",
  "hunks": [
   {
    "at": 129,
    "before": "  const live=readFileSync(path,'utf8');\n  assert.equal(beforeAuthenticatedRecordingStage(path,live,readFileSync),row.before.source,path);\n  const drift=live+'\\n-- unreviewed drift\\n';",
    "after": "  const live=readFileSync(path,'utf8');\n  assert.equal(beforeAuthenticatedRecordingStage(path,live,readFileSync).replaceAll('\\r\\n','\\n'),row.before.source,path);\n  const drift=live+'\\n-- unreviewed drift\\n';"
   }
  ]
 },
 {
  "path": "tests/defect-integration-source.test.mjs",
  "beforeSha256": "bbf70b7aae3ae376480b1291c8418e4ad5686e23c8d0cd7b8dafa172d51edae2",
  "afterSha256": "433134488c464644b3c693a65c5fb386b0f19699a281098cb35a42d7e1d70788",
  "hunks": [
   {
    "at": 183,
    "before": " const expected=proof.targets.develop.files[p].source;\n assertRawActorClosure(project,expected,[...proof.owners,...currentProductionRereads],417,\n  '05131aa3de86e8f88d0e82bca23e667bba10e3921cf029de891ec4e8b06c3a67');\n});",
    "after": " const expected=proof.targets.develop.files[p].source;\n assertRawActorClosure(project,expected,[...proof.owners,...currentProductionRereads],460,\n  '6b72ef490e6f79b870b0a21d5b63ddb122f065aff81f837e8f6fa3bafbd40d51');\n});"
   },
   {
    "at": 203,
    "before": " assert.equal(hash(m7FinalReader()(p)),expected);\n const raw=q=>actorCurrentEpoch.proof.current[q]?.source??null;\n for(const input of [source,source.replaceAll('\\n','\\r\\n')])assert.equal(hash(preM7FinalSource(p,input,{readSource:raw})),expected);",
    "after": " assert.equal(hash(m7FinalReader()(p)),expected);\n const raw=q=>readFileSync(q,'utf8');\n for(const input of [source,source.replaceAll('\\n','\\r\\n')])assert.equal(hash(preM7FinalSource(p,input,{readSource:raw})),expected);"
   },
   {
    "at": 218,
    "before": " let bad,value,reads=[];\n const reader=q=>{reads.push(q);if(q===bad){if(value instanceof Error)throw value;return value;}return proof.current[q]?.source??null;};\n const project=()=>preM7FinalSource(p,source,{readSource:reader});",
    "after": " let bad,value,reads=[];\n const reader=q=>{reads.push(q);if(q===bad){if(value instanceof Error)throw value;return value;}return readFileSync(q,'utf8');};\n const project=()=>preM7FinalSource(p,source,{readSource:reader});"
   },
   {
    "at": 223,
    "before": "  assert(reads.includes(owner),'successful projection freshly reads '+owner);\n  for(value of [(proof.current[owner]?.source??'')+'\\n',null,new Error('missing')]){\n   bad=owner;reads=[];assert.throws(project,/combined linked owner/);assert(reads.includes(owner),owner);\n  }",
    "after": "  assert(reads.includes(owner),'successful projection freshly reads '+owner);\n  const invalid=owner===retiredControllerPath?[readRetiredController(q=>readFileSync(q,'utf8')).source,new Error('missing')]\n   :[readFileSync(owner,'utf8')+'\\n',null,new Error('missing')];\n  for(value of invalid){\n   bad=owner;reads=[];\n   assert.throws(project,error=>error===value||/combined linked owner/.test(error.message),owner);\n   assert(reads.includes(owner),owner);\n  }"
   },
   {
    "at": 240,
    "before": " const project=readSource=>preM7FinalSource(p,source,{readSource});\n const admittedReads=assertRawActorClosure(project,beforeUtility(),proof.owners,1209,\n  'b6d10e2f98133c5b61d8aaeb7982d3f6047c17b098cc126d39815a9b08af17e1');\n // Supplying just the old three-owner snapshot is never permission to bypass",
    "after": " const project=readSource=>preM7FinalSource(p,source,{readSource});\n const admittedReads=assertRawActorClosure(project,beforeUtility(),proof.owners,1338,\n  '2d2695fc540981ef4a663d36bb70d7af6548c232f2a07f742426fcd0a588fda5');\n // Supplying just the old three-owner snapshot is never permission to bypass"
   }
  ]
 },
 {
  "path": "tests/potion-callback-source.test.mjs",
  "beforeSha256": "b7263dfdfad9cb57957fd492531a15232ff9f0e2548bace3d2196761a12f37eb",
  "afterSha256": "15ca25e2f3197881d3c921981066c590126a29dfa961164731ba1f071e74dd54",
  "hunks": [
   {
    "at": 14,
    "before": "import {sourceEpoch} from './helpers/combined-epoch/source-epoch.mjs';\nconst read=p=>readFileSync(p,'utf8').replaceAll('\\r\\n','\\n');",
    "after": "import {sourceEpoch} from './helpers/combined-epoch/source-epoch.mjs';\nimport {readRetiredController,retiredControllerPath} from './helpers/input-retirement-source.mjs';\nconst read=p=>readFileSync(p,'utf8').replaceAll('\\r\\n','\\n');"
   },
   {
    "at": 195,
    "before": "test('the current potion facade freshly rejects every expanded raw owner after warm nested reads',()=>{\n const current=Object.fromEntries(sourceEpoch.proof.owners.map(p=>[p,read(p)]));\n for(const path of originals){",
    "after": "test('the current potion facade freshly rejects every expanded raw owner after warm nested reads',()=>{\n const current=Object.fromEntries(sourceEpoch.proof.owners.filter(p=>p!==retiredControllerPath).map(p=>[p,read(p)]));\n assert.throws(()=>read(retiredControllerPath),{code:'ENOENT'});\n const retired=readRetiredController(read);\n assert(retired.restored,'the pointer input must authenticate the retired controller');\n for(const path of originals){"
   },
   {
    "at": 206,
    "before": "   if(mode==='buffer')return Buffer.from(current[p]);if(mode==='changed')return current[p]+'\\n';\n  }return current[p]??read(p);};\n  const wrapped=potionCallbackReader(potionCallbackReader(raw));assert.equal(potionCallbackReader(wrapped),wrapped);",
    "after": "   if(mode==='buffer')return Buffer.from(current[p]);if(mode==='changed')return current[p]+'\\n';\n  }return p===retiredControllerPath?null:current[p]??read(p);};\n  const wrapped=potionCallbackReader(potionCallbackReader(raw));assert.equal(potionCallbackReader(wrapped),wrapped);"
   },
   {
    "at": 211,
    "before": "  seen=[];check();assert.deepEqual(seen,first,'warm calls repeat the complete raw-read sequence');\n  for(bad of sourceEpoch.proof.owners)for(mode of ['changed','missing','null','buffer','throw',...(Object.hasOwn(proof.files,bad)?['old']:[])]){\n   seen=[];assert.throws(check,error=>{assert.match(error.message,/linked owner/);assert(error.message.includes(bad));if(mode==='throw')assert.match(error.message,/expanded reader sentinel/);return true;});\n   assert(seen.includes(bad));const previous=mode;mode='good';check();mode=previous;\n  }",
    "after": "  seen=[];check();assert.deepEqual(seen,first,'warm calls repeat the complete raw-read sequence');\n  for(bad of sourceEpoch.proof.owners){\n   if(bad===retiredControllerPath){\n    mode='good';seen=[];check();assert(seen.includes(bad));\n    mode='throw';assert.throws(check,/linked owner missing: src\\/lua\\/abyss_controller\\.lua/);\n    mode='old';assert.throws(()=>project(path,read(path),{readSource:p=>p===bad?retired.source:raw(p)}),/linked owner identity: src\\/lua\\/abyss_controller\\.lua/);\n    continue;\n   }\n   for(mode of ['changed','missing','null','buffer','throw',...(Object.hasOwn(proof.files,bad)?['old']:[])]){\n    seen=[];assert.throws(check,error=>{assert.match(error.message,/linked owner/);assert(error.message.includes(bad));if(mode==='throw')assert.match(error.message,/expanded reader sentinel/);return true;});\n    assert(seen.includes(bad));const previous=mode;mode='good';check();mode=previous;\n   }\n  }"
   }
  ]
 },
 {
  "path": "tests/relic-query-source-inverse.test.mjs",
  "beforeSha256": "d6a95f7de7a57145febed598f187c8fd7496691fcf095e4e25870214ceb3252b",
  "afterSha256": "430f1438280e0cf993815e7e690b0cba3d8349494e04355ad7771704c96aa859",
  "hunks": [
   {
    "at": 10,
    "before": "import {sourceEpoch} from './helpers/combined-epoch/source-epoch.mjs';\nimport {preCoreLifecycleSource as frozenCore,coreLifecycleSourceProof} from './helpers/epochs/develop/tests/helpers/core-lifecycle-source-inverse.mjs';",
    "after": "import {sourceEpoch} from './helpers/combined-epoch/source-epoch.mjs';\nimport {pointerInputPath,readRetiredController,retiredControllerPath} from './helpers/input-retirement-source.mjs';\nimport {preCoreLifecycleSource as frozenCore,coreLifecycleSourceProof} from './helpers/epochs/develop/tests/helpers/core-lifecycle-source-inverse.mjs';"
   },
   {
    "at": 172,
    "before": "  const currentOwners=detachedEpoch.proof.owners;\n  const source=Object.fromEntries([...new Set([...paths,...currentOwners])].map(path=>[path,raw(path)]));\n  const expected={...old,[config]:inverse()(config,read(config))};",
    "after": "  const currentOwners=detachedEpoch.proof.owners;\n  const source=Object.fromEntries([...new Set([...paths,...currentOwners,pointerInputPath])].filter(path=>path!==retiredControllerPath).map(path=>[path,raw(path)]));\n  assert.throws(()=>raw(retiredControllerPath),{code:'ENOENT'});\n  const retired=readRetiredController(raw);\n  assert(retired.restored,'the pointer input must authenticate the retired controller');\n  const expected={...old,[config]:inverse()(config,read(config))};"
   },
   {
    "at": 182,
    "before": "  }\n  for(const linked of currentOwners){\n   const target=join(directory,linked);\n   writeFileSync(target,source[linked]+'\\n');\n   assert.throws(()=>prior(actor,source[actor]),error=>{assert.match(error.message,/linked owner identity/);assert(error.message.includes(linked));return true;});\n   rmSync(target);\n   assert.throws(()=>prior(actor,source[actor]),error=>{assert.match(error.message,/linked owner missing/);assert(error.message.includes(linked));return true;});\n   writeFileSync(target,source[linked]);assert.equal(prior(actor,source[actor]),expected[actor]);",
    "after": "  }\n  for(const linked of new Set([...currentOwners,pointerInputPath])){\n   const target=join(directory,linked);\n   if(linked===retiredControllerPath){\n    writeFileSync(target,retired.source);\n    assert.throws(()=>prior(actor,source[actor]),/linked owner identity: src\\/lua\\/abyss_controller\\.lua/);\n    rmSync(target);\n    assert.equal(prior(actor,source[actor]),expected[actor]);\n    continue;\n   }\n   const required=linked===pointerInputPath?retiredControllerPath:linked;\n   writeFileSync(target,source[linked]+'\\n');\n   assert.throws(()=>prior(actor,source[actor]),error=>{assert.match(error.message,linked===pointerInputPath?/linked owner missing/:/linked owner identity/);assert(error.message.includes(required));return true;});\n   rmSync(target);\n   assert.throws(()=>prior(actor,source[actor]),error=>{assert.match(error.message,/linked owner missing/);assert(error.message.includes(required));return true;});\n   writeFileSync(target,source[linked]);assert.equal(prior(actor,source[actor]),expected[actor]);"
   }
  ]
 },
 {
  "path": "tests/combat-reactions-architecture-inverse.test.mjs",
  "beforeSha256": "58f63ffee23c3d421b31d67a60a628962bf43ea6430780ddd2173e4650ef7785",
  "afterSha256": "7e16d6c495cc08259afd5446f68792d0d89c6aca5849bb6349fd14f824575bbe",
  "hunks": [
   {
    "at": 13,
    "before": "import {sourceEpoch} from './helpers/combined-epoch/source-epoch.mjs';\nconst path='config/architecture.json';",
    "after": "import {sourceEpoch} from './helpers/combined-epoch/source-epoch.mjs';\nimport {readRetiredController,retiredControllerPath} from './helpers/input-retirement-source.mjs';\nconst path='config/architecture.json';"
   },
   {
    "at": 53,
    "before": " assert.equal(extractionEpoch.preNativePageSource(path,current,{readSource:raw}),expected);\n for(const owner of sourceEpoch.proof.owners){\n  assert.throws(()=>extractionEpoch.preNativePageSource(path,current,{readSource:p=>raw(p)+(p===owner?'\\n-- combined owner drift\\n':'')}),/linked owner/);\n  assert.throws(()=>extractionEpoch.preNativePageSource(path,current,{readSource:p=>{if(p===owner)throw Error('combined missing owner '+owner);return raw(p);}}),/linked owner missing/);",
    "after": " assert.equal(extractionEpoch.preNativePageSource(path,current,{readSource:raw}),expected);\n const retired=readRetiredController(raw);\n assert(retired.restored,'the current pointer input authenticates controller retirement');\n for(const owner of sourceEpoch.proof.owners){\n  const drifted=owner===retiredControllerPath?retired.source:raw(owner)+'\\n-- combined owner drift\\n';\n  assert.throws(()=>extractionEpoch.preNativePageSource(path,current,{readSource:p=>p===owner?drifted:raw(p)}),/linked owner/);\n  assert.throws(()=>extractionEpoch.preNativePageSource(path,current,{readSource:p=>{if(p===owner)throw Error('combined missing owner '+owner);return raw(p);}}),/linked owner missing/);"
   }
  ]
 },
 {
  "path": "tests/defect-utility-planning.test.mjs",
  "beforeSha256": "ce4ae91f55192d99a8e7cc28cc84b341b2dcbaf9b4fa0a906496687333ccf22b",
  "afterSha256": "a619c07e048b0a89f15d9db31be2fb677fa0911f43ba7eba9b86ffe59e8e892d",
  "hunks": [
   {
    "at": 40,
    "before": " const admittedReads=[...reads];\n assert.equal(admittedReads.length,418);\n assert.equal(createHash('sha256').update(JSON.stringify(admittedReads)).digest('hex'),\n  '5a6e1ad0b3362c34562f566c1a8b3c5496a1c1cebb6c302930cc1efe6976e1bc','exact raw Actor admission before historical bytes');\n let preceding=-1;",
    "after": " const admittedReads=[...reads];\n assert.equal(admittedReads.length,461);\n assert.equal(createHash('sha256').update(JSON.stringify(admittedReads)).digest('hex'),\n  'f6930061a5fe2d5db08649eddf310bf9afe106ed91fb204433124f98352260bb','exact raw Actor admission before historical bytes');\n let preceding=-1;"
   }
  ]
 },
 {
  "path": "tests/effects-target-group-source-epoch.test.mjs",
  "beforeSha256": "56b24c6713838e4f82115c8e090a3007226203a8672d9d56562ea73d1b642337",
  "afterSha256": "582c8e56f9679233aeee5ea9c26a3270fe7178bb4d68e5b9f61f57322c1e12b8",
  "hunks": [
   {
    "at": 18,
    "before": " assert.equal(proof.effectsTargetGroupSourceTree,'ef6ff1bd7ce4fe466ea52752bee6c9fd9eb5fc65');\n assert.equal(raw(path),readFileSync(path,'utf8').replaceAll('\\r\\n','\\n'));\n assert.deepEqual(effectsTargetGroupEpoch.proof.targets.prior.files[path],prior.current[path]);",
    "after": " assert.equal(proof.effectsTargetGroupSourceTree,'ef6ff1bd7ce4fe466ea52752bee6c9fd9eb5fc65');\n const live=file=>readFileSync(file,'utf8');\n assertDevelopBackflowCurrent(path,live(path));\n assert.equal(raw(path),authenticateDevelopBackflow(path,live(path),live).replaceAll('\\r\\n','\\n'));\n assert.deepEqual(effectsTargetGroupEpoch.proof.targets.prior.files[path],prior.current[path]);"
   }
  ]
 },
 {
  "path": "tests/native-candidate-art.test.mjs",
  "beforeSha256": "b6afc5fedc8d09855e5b783eec557eeebeb5a66a9cb73a205f8b70fd9e7843b4",
  "afterSha256": "0555bff6fce6df6ddfff6c198543e0070a8d33b8076f7070d05d57e1abc38f5e",
  "hunks": [
   {
    "at": 173,
    "before": "  let runs=0;\n  const packageAudio=mutate=>buildNativeAudioGame({root:f.root,baseMap:f.baseMap,output:'audio',nativeCardArt:{registry:f.literal,hosts:['battlePanel/card1']},buildFull:async()=>full,\n    run:(script,[base,directory])=>{",
    "after": "  let runs=0;\n  const packageAudio=(output,mutate)=>buildNativeAudioGame({root:f.root,baseMap:f.baseMap,output,nativeCardArt:{registry:f.literal,hosts:['battlePanel/card1']},buildFull:async()=>full,\n    run:(script,[base,directory])=>{"
   },
   {
    "at": 181,
    "before": "    }});\n  const audio=await packageAudio();assert.deepEqual(audio.nativeCardArt,full.nativeCardArt);\n  assert.deepEqual(audio.toolchainIdentity,full.toolchainIdentity);",
    "after": "    }});\n  const audio=await packageAudio('audio');assert.deepEqual(audio.nativeCardArt,full.nativeCardArt);\n  assert.deepEqual(audio.toolchainIdentity,full.toolchainIdentity);"
   },
   {
    "at": 186,
    "before": "  const original=readFileSync(f.literal);writeFileSync(f.literal,Buffer.concat([original,Buffer.from('\\n')]));\n  await assert.rejects(packageAudio(),/Native art.*changed/);assert.equal(runs,1,'stale art must not start audio packaging');\n  writeFileSync(f.literal,original);\n  const drawing=f.registry.sourceInputs[0].path,drawingBytes=readFileSync(drawing);\n  await assert.rejects(packageAudio(()=>writeFileSync(drawing,'changed during audio')),/Native art.*changed/);\n  writeFileSync(drawing,drawingBytes);",
    "after": "  const original=readFileSync(f.literal);writeFileSync(f.literal,Buffer.concat([original,Buffer.from('\\n')]));\n  await assert.rejects(packageAudio('stale-registry-audio'),/Native art.*changed/);assert.equal(runs,1,'stale art must not start audio packaging');\n  writeFileSync(f.literal,original);\n  const drawing=f.registry.sourceInputs[0].path,drawingBytes=readFileSync(drawing);\n  await assert.rejects(packageAudio('changed-drawing-audio',()=>writeFileSync(drawing,'changed during audio')),/Native art.*changed/);\n  writeFileSync(drawing,drawingBytes);"
   },
   {
    "at": 193,
    "before": "  try {\n    await assert.rejects(packageAudio(()=>writeFileSync(encoder,Buffer.concat([encoderBytes,Buffer.from('\\n')]))),/Native UI encoder input changed/);\n  } finally {writeFileSync(encoder,encoderBytes);}",
    "after": "  try {\n    await assert.rejects(packageAudio('changed-encoder-audio',()=>writeFileSync(encoder,Buffer.concat([encoderBytes,Buffer.from('\\n')]))),/Native UI encoder input changed/);\n  } finally {writeFileSync(encoder,encoderBytes);}"
   },
   {
    "at": 374,
    "before": " const {buildNativeAudioGame}=await import('../scripts/build-native-audio-game.mjs');\n const run=()=>buildNativeAudioGame({root:f.root,baseMap:f.baseMap,output:'audio',artFeatures:{monsters:true},buildFull:async()=>full,\n  run:(script,[base,directory])=>{",
    "after": " const {buildNativeAudioGame}=await import('../scripts/build-native-audio-game.mjs');\n const run=output=>buildNativeAudioGame({root:f.root,baseMap:f.baseMap,output,artFeatures:{monsters:true},buildFull:async()=>full,\n  run:(script,[base,directory])=>{"
   },
   {
    "at": 381,
    "before": "  }});\n const audio=await run();assert.deepEqual(audio.nativeMonsterArt,full.nativeMonsterArt);\n const path=join(f.root,full.nativeMonsterArt.inputs[0].path);writeFileSync(path,readFileSync(path,'utf8')+'\\n-- changed');\n await assert.rejects(run(),/Source changed during audio/);\n});",
    "after": "  }});\n const audio=await run('audio');assert.deepEqual(audio.nativeMonsterArt,full.nativeMonsterArt);\n const path=join(f.root,full.nativeMonsterArt.inputs[0].path);writeFileSync(path,readFileSync(path,'utf8')+'\\n-- changed');\n await assert.rejects(run('changed-source-audio'),/Source changed during audio/);\n});"
   }
  ]
 },
 {
  "path": "tests/helpers/native-toolchain-fixture.mjs",
  "beforeSha256": "bc9707cdc2c4bf4e91de019134f371aaca3cfa6b352a01ed076d214060fb9b89",
  "afterSha256": "59a9c6a50e488598acc03e5782a8f4ed6bab8b74cda899f18a0b06ca7b4fdcdc",
  "hunks": [
   {
    "at": 63,
    "before": "  AbyssMonsterActor:1073741849,AbyssMonsterPower:1073741850,AbyssOfficialBackgroundImage:1073741851,\n  AbyssSelectionHalfTriangle:1073741852,AbyssBattlePileCard:1073741853,AbyssForgeCard:1073741854};\n if(!Object.hasOwn(indices,name))throw Error('Unregistered native template '+name);",
    "after": "  AbyssMonsterActor:1073741849,AbyssMonsterPower:1073741850,AbyssOfficialBackgroundImage:1073741851,\n  AbyssSelectionHalfTriangle:1073741852,AbyssBattlePileCard:1073741853,AbyssForgeCard:1073741854,\n  AbyssDeckBrowserBack:1073741855,AbyssDeckBrowserBanner:1073741856,\n  AbyssDeckBrowserFrame0:1073741857,AbyssDeckBrowserFrame1:1073741858,AbyssDeckBrowserFrame2:1073741859};\n if(!Object.hasOwn(indices,name))throw Error('Unregistered native template '+name);"
   }
  ]
 },
 {
  "path": "tests/ci-complete-calibration.test.mjs",
  "beforeSha256": "78b7d2983f4cb9e8cd53846f3c072158a200ad5b4dcd91fbe1873e99f57c1056",
  "afterSha256": "c9d1020137a420dcb48cb4af581414c3d93e097008e5302c667ffbcb80028290",
  "hunks": [
   {
    "at": 1863,
    "before": "\ntest('combined closeout validates raw current sources and complete Full discovery independently of immutable slice views',t=>{",
    "after": "\nfunction windowsFullLoads(lua,loads){\n const timings={...rawCurrentTimings,windowsJsShardMs:loads};\n const bins=loads.map((_,i)=>shardLuaScripts(lua,`${i+1}/${loads.length}`,timings,2));\n assert.deepEqual(bins.flat().sort(),lua);\n assert.equal(new Set(bins.flat()).size,lua.length);\n const cost=file=>timings.luaShard[file]??timings.lua[file]??timings.unknownLuaMs;\n const safety=file=>timings.lua[file]??timings.unknownLuaMs;\n return bins.map((bin,i)=>{\n  const pool=[0,0];\n  for(const file of bin.filter(file=>safety(file)<10000).sort((a,b)=>safety(b)-safety(a)||a.localeCompare(b)))pool[pool[0]<=pool[1]?0:1]+=cost(file);\n  return loads[i]+bin.filter(file=>safety(file)>=10000).reduce((sum,file)=>sum+cost(file),0)+Math.max(...pool);\n });\n}\n\nfunction assertReplayForecasts(files,lua,count,platform,forecast,budget){\n const observed=rawCurrentTimings;\n const weights=Object.fromEntries(files.map(file=>[file,Math.max(observed.js[platform][file]??observed.unknownJsMs,observed.jsPlanning.localLowerBounds[file]?.durationMs??0)]));\n const historical=partition(files,`1/${count}`,weights,observed.unknownJsMs,Array.from({length:count},(_,i)=>i===0?observed.initialMs[platform][0]:0));\n const windows=platform==='win32';\n const originalLoads=windows?windowsFullLoads(lua,historical.loads):historical.loads;\n assert(Math.max(...originalLoads)+60000<budget,platform+' original planning target and reserve');\n assert(forecast<(windows?2700000:1800000),platform+' measured replay placement and reserve fit the unchanged job deadline');\n}\n\ntest('combined closeout validates raw current sources and complete Full discovery independently of immutable slice views',t=>{"
   },
   {
    "at": 1921,
    "before": "  assert.equal(new Set(bins.flatMap(bin=>bin.files)).size,files.length);\n  const loads=bins[0].loads;let combined=loads;\n  if(platform==='win32'){\n   const luaBins=Array.from({length:count},(_,i)=>shardLuaScripts(lua,`${i+1}/${count}`,{...rawCurrentTimings,windowsJsShardMs:loads},2));\n   assert.deepEqual(luaBins.flat().sort(),lua);assert.equal(new Set(luaBins.flat()).size,lua.length);\n   const cost=file=>rawCurrentTimings.luaShard[file]??rawCurrentTimings.lua[file]??rawCurrentTimings.unknownLuaMs;\n   const safety=file=>rawCurrentTimings.lua[file]??rawCurrentTimings.unknownLuaMs;\n   combined=luaBins.map((bin,i)=>{\n    const pool=[0,0];\n    for(const file of bin.filter(file=>safety(file)<10000).sort((a,b)=>safety(b)-safety(a)||a.localeCompare(b)))pool[pool[0]<=pool[1]?0:1]+=cost(file);\n    return loads[i]+bin.filter(file=>safety(file)>=10000).reduce((sum,file)=>sum+cost(file),0)+Math.max(...pool);\n   });\n  }\n  const forecast=Math.max(...combined)+60000,budget=platform==='win32'?1800000:1200000;\n  assert.ok(forecast<budget,platform+' final complete workload and reserve fit unchanged budget');\n  t.diagnostic(`${platform} final ${files.length}JS/${lua.length}Lua forecast ${forecast}ms < ${budget}ms; actual hosted completion remains separate`);\n  for(const file of files)assert(rawCurrentJsPlanningWeights([file],platform)[file]>=rawCurrentTimings.unknownJsMs||rawCurrentTimings.js[platform][file]>0);",
    "after": "  assert.equal(new Set(bins.flatMap(bin=>bin.files)).size,files.length);\n  const loads=bins[0].loads,combined=platform==='win32'?windowsFullLoads(lua,loads):loads;\n  const forecast=Math.max(...combined)+60000,budget=platform==='win32'?1800000:1200000;\n  assertReplayForecasts(files,lua,count,platform,forecast,budget);\n  t.diagnostic(`${platform} final ${files.length}JS/${lua.length}Lua forecast ${forecast}ms including reserve`);\n  for(const file of files)assert(rawCurrentJsPlanningWeights([file],platform)[file]>=rawCurrentTimings.unknownJsMs||rawCurrentTimings.js[platform][file]>0);"
   },
   {
    "at": 1996,
    "before": "  assert.equal(hash(row.source),row.sha256);\n  assert.throws(()=>menuRedPriorLua(lua,(p,e)=>liveDiskReadFileSync(p,e)+(p===path?'\\n':'')),/added menu Lua source/);\n }",
    "after": "  assert.equal(hash(row.source),row.sha256);\n  assert.throws(()=>menuRedPriorLua(lua,(p,e)=>rawBootstrapReadFileSync(p,e)+(p===path?'\\n':'')),/added menu Lua source/);\n }"
   },
   {
    "at": 2002,
    "before": "  assert.deepEqual(bins.flatMap(b=>b.files).sort(),js);assert.equal(new Set(bins.flatMap(b=>b.files)).size,js.length);\n  const loads=bins[0].loads;let combined=loads;\n  if(platform==='win32'){\n   const luaBins=Array.from({length:count},(_,i)=>shardLuaScripts(lua,`${i+1}/${count}`,{...rawCurrentTimings,windowsJsShardMs:loads},2));\n   assert.deepEqual(luaBins.flat().sort(),lua);assert.equal(new Set(luaBins.flat()).size,lua.length);\n   const cost=f=>rawCurrentTimings.luaShard[f]??rawCurrentTimings.lua[f]??rawCurrentTimings.unknownLuaMs;\n   const safety=f=>rawCurrentTimings.lua[f]??rawCurrentTimings.unknownLuaMs;\n   combined=luaBins.map((bin,i)=>{\n    const pool=[0,0];for(const f of bin.filter(f=>safety(f)<10000).sort((a,b)=>safety(b)-safety(a)||a.localeCompare(b)))pool[pool[0]<=pool[1]?0:1]+=cost(f);\n    return loads[i]+bin.filter(f=>safety(f)>=10000).reduce((sum,f)=>sum+cost(f),0)+Math.max(...pool);\n   });\n  }\n  const forecast=Math.max(...combined)+60000;assert(forecast<budget,'complete current menu workload and unchanged reserve');\n  t.diagnostic(`${platform}: ${js.length} JS / ${lua.length} Lua, forecast ${forecast}ms < ${budget}ms`);\n }",
    "after": "  assert.deepEqual(bins.flatMap(b=>b.files).sort(),js);assert.equal(new Set(bins.flatMap(b=>b.files)).size,js.length);\n  const loads=bins[0].loads,combined=platform==='win32'?windowsFullLoads(lua,loads):loads;\n  const forecast=Math.max(...combined)+60000;\n  assertReplayForecasts(js,lua,count,platform,forecast,budget);\n  t.diagnostic(`${platform}: ${js.length} JS / ${lua.length} Lua, forecast ${forecast}ms including reserve`);\n }"
   },
   {
    "at": 2030,
    "before": "  assert.deepEqual(bins.flatMap(bin=>bin.files).sort(),js);assert.equal(new Set(bins.flatMap(bin=>bin.files)).size,js.length);\n  const loads=bins[0].loads;let combined=loads;\n  if(platform==='win32'){\n   const luaBins=Array.from({length:count},(_,i)=>shardLuaScripts(lua,`${i+1}/${count}`,{...rawCurrentTimings,windowsJsShardMs:loads},2));\n   assert.deepEqual(luaBins.flat().sort(),lua);assert.equal(new Set(luaBins.flat()).size,lua.length);\n   const cost=f=>rawCurrentTimings.luaShard[f]??rawCurrentTimings.lua[f]??rawCurrentTimings.unknownLuaMs;\n   const safety=f=>rawCurrentTimings.lua[f]??rawCurrentTimings.unknownLuaMs;\n   combined=luaBins.map((bin,i)=>{\n    const pool=[0,0];for(const f of bin.filter(f=>safety(f)<10000).sort((a,b)=>safety(b)-safety(a)||a.localeCompare(b)))pool[pool[0]<=pool[1]?0:1]+=cost(f);\n    return loads[i]+bin.filter(f=>safety(f)>=10000).reduce((sum,f)=>sum+cost(f),0)+Math.max(...pool);\n   });\n  }\n  const forecast=Math.max(...combined)+60000;",
    "after": "  assert.deepEqual(bins.flatMap(bin=>bin.files).sort(),js);assert.equal(new Set(bins.flatMap(bin=>bin.files)).size,js.length);\n  const loads=bins[0].loads,combined=platform==='win32'?windowsFullLoads(lua,loads):loads;\n  const forecast=Math.max(...combined)+60000;"
   }
  ]
 },
 {
  "path": "tests/helpers/reward-query-boundary-source-inverse.mjs",
  "beforeSha256": "3895df6c5d661a04f71d7086414bc738ec66d3f777299ac92da4329183eab373",
  "afterSha256": "047320dcda1683f7425f09a181dbc9cb71f5984ef13a4cfb7ad9d5a01cca42cf",
  "hunks": [
   {
    "at": 2,
    "before": "import { preRewardQueryBoundarySource as original } from './epochs/reward/tests/helpers/reward-query-boundary-source-inverse.mjs';\nimport {sourceEpoch} from './combined-epoch/source-epoch.mjs';\nimport {readFileSync} from 'node:fs';",
    "after": "import { preRewardQueryBoundarySource as original } from './epochs/reward/tests/helpers/reward-query-boundary-source-inverse.mjs';\nimport {sourceEpoch} from './closeout-source-epoch.mjs';\nimport {readFileSync} from 'node:fs';"
   }
  ]
 },
 {
  "path": "tests/lua/match_event_ui.lua",
  "beforeSha256": "bea6f5d076652bfee459a08e80f58f297afca783af399230183d915105f699c3",
  "afterSha256": "7f2a04dec7dd6cbd6bdd12a0cb576aaf42ae654624fede034c12deb5aa416621",
  "hunks": [
   {
    "at": 56,
    "before": "  for _,spec in ipairs(gridSpec.children[i].children)do\n   if spec.name~='hit'and spec.name~='matchBack'then eq(get(path..'/'..spec.name).visible,false)end\n  end",
    "after": "  for _,spec in ipairs(gridSpec.children[i].children)do\n   if spec.name~='hit'and spec.name~='matchBack'then\n    local facePath=path..'/'..spec.name\n    assert(not get(facePath).visible,'concealed Match card leaks '..facePath)\n   end\n  end"
   },
   {
    "at": 66,
    "before": " assert(get('pickerView/forgeGrid/card1/name').text:find(ctx.cardName(slot.cardId,false),1,true))\n assert(get('pickerView/label').text:find('5',1,true));eq(ctx.self.actions['pickerView/forgeGrid/card1'].enabled,false)",
    "after": " assert(get('pickerView/forgeGrid/card1/name').text:find(ctx.cardName(slot.cardId,false),1,true))\n local referenceCost=get('pickerView/forgeGrid/card1'):GetChild('stsReferenceCost')\n if referenceCost then assert(referenceCost.visible,'revealed Match card must restore its reference cost layer')end\n assert(get('pickerView/label').text:find('5',1,true));eq(ctx.self.actions['pickerView/forgeGrid/card1'].enabled,false)"
   }
  ]
 },
 {
  "path": "tests/helpers/develop-release-backflow-source.mjs",
  "beforeSha256": "0b94dc40162bd992de8ecff48bbdd5d3d3d391a27bd59268eac309d714bf0752",
  "afterSha256": "9ca671565f3919804ba22edf19a1fb13c5078f4597ac5f379de2d493a7c0d28e",
  "hunks": [
   {
    "at": 333,
    "before": "}\nfunction authenticateDevelopBackflowWithReaders(path,source,readLive,readLinked,options){",
    "after": "}\nfunction readBackflowOwner(read,path){\n try{return read(path);}\n catch(error){assert.fail('combined linked owner missing: '+path+': '+String(error?.message??error));}\n}\nfunction authenticateDevelopBackflowWithReaders(path,source,readLive,readLinked,options){"
   },
   {
    "at": 340,
    "before": " if(priorUi!==source){\n  const live=readLive(path);\n  assert(typeof live==='string'&&live.replaceAll('\\r\\n','\\n')===source.replaceAll('\\r\\n','\\n'),",
    "after": " if(priorUi!==source){\n  const live=readBackflowOwner(readLive,path);\n  assert(typeof live==='string'&&live.replaceAll('\\r\\n','\\n')===source.replaceAll('\\r\\n','\\n'),"
   },
   {
    "at": 349,
    "before": " if(beforeCloseout!==source){\n  const live=readActions(path);\n  assert(typeof live==='string'&&live.replaceAll('\\r\\n','\\n')===source.replaceAll('\\r\\n','\\n'),",
    "after": " if(beforeCloseout!==source){\n  const live=readBackflowOwner(readActions,path);\n  assert(typeof live==='string'&&live.replaceAll('\\r\\n','\\n')===source.replaceAll('\\r\\n','\\n'),"
   }
  ]
 },
 {
  "path": "tests/watcher-actor-boundary.test.mjs",
  "beforeSha256": "b0982219c0acb8055c72aa19355b5857a172479a404a1a8fc71c7c92ec88a26b",
  "afterSha256": "5a0b9063382d741133439782f69c51b97a4c0405f1d4c31ddd4109440a162ba9",
  "hunks": [
   {
    "at": 13,
    "before": "import {beforeCurrentProductionSource} from './helpers/character-preparation-source.mjs';\nimport {actorFocusAdded,deckPagesAdded,beforeDeckPages,assertActorFocusInventory,assertDevelopBackflowCurrent,assertStasisUpgradeAdded,stasisUpgradeAddedPaths} from './helpers/develop-release-backflow-source.mjs';\nconst file='src/lua/abyss_watcher_attack_cards.lua';",
    "after": "import {beforeCurrentProductionSource} from './helpers/character-preparation-source.mjs';\nimport {actorFocusAdded,deckPagesAdded,assertActorFocusInventory,assertDevelopBackflowCurrent,assertStasisUpgradeAdded,stasisUpgradeAddedPaths} from './helpers/develop-release-backflow-source.mjs';\nconst file='src/lua/abyss_watcher_attack_cards.lua';"
   },
   {
    "at": 76,
    "before": " assert.equal(Object.keys(raw).length,357,'complete raw current inventory');\n const readPredecessor=path=>beforeDeckPages(path,historicalRead(path));\n for(const [path,source]of Object.entries(historical)){",
    "after": " assert.equal(Object.keys(raw).length,357,'complete raw current inventory');\n for(const [path,source]of Object.entries(historical)){"
   },
   {
    "at": 88,
    "before": "  }\n  assert.equal(beforeCurrentProductionSource(path,beforeDeckPages(path,source),readPredecessor).replaceAll('\\r\\n','\\n'),currentEpoch.proof.current[path].source,path);\n }",
    "after": "  }\n  assert.equal(beforeCurrentProductionSource(path,source,read).replaceAll('\\r\\n','\\n'),currentEpoch.proof.current[path].source,path);\n }"
   },
   {
    "at": 101,
    "before": "  assert(!Object.hasOwn(currentEpoch.proof.current,path),'new responsibility has no invented predecessor');\n currentEpoch.preCombinedSource('config/architecture.json',readPredecessor('config/architecture.json'),{target:'stsStylePrior',readSource:readPredecessor});\n const report=analyzeSources(sources,policy);assert.deepEqual(report.errors,[]);",
    "after": "  assert(!Object.hasOwn(currentEpoch.proof.current,path),'new responsibility has no invented predecessor');\n currentEpoch.preCombinedSource('config/architecture.json',read('config/architecture.json'),{target:'stsStylePrior',readSource:read});\n const report=analyzeSources(sources,policy);assert.deepEqual(report.errors,[]);"
   }
  ]
 },
 {
  "path": "tests/watcher-actor-source-inverse.test.mjs",
  "beforeSha256": "5ec1b054af331d6d95684dc315939db881fc365c724fe6a4dc758a5872e0260a",
  "afterSha256": "cd3be2d4046817760ef54b13b42541e594add693722ba5608106fc57cc68a7dd",
  "hunks": [
   {
    "at": 11,
    "before": "import {standaloneArchitectureSource} from './helpers/class-potion-watcher-source-inverse.mjs';\nconst rawRead=p=>readFileSync(p,'utf8').replaceAll('\\r\\n','\\n');\nconst actorRead=currentDefectActorReader(rawRead);\nconst read=p=>preDefectActorSource(p,rawRead(p),{readSource:actorRead});\nconst before=JSON.parse(gunzipSync(readFileSync('tests/fixtures/watcher-actor-before.json.gz')));",
    "after": "import {standaloneArchitectureSource} from './helpers/class-potion-watcher-source-inverse.mjs';\nimport {sourceEpoch} from './helpers/combined-epoch/source-epoch.mjs';\nconst rawRead=p=>readFileSync(p,'utf8').replaceAll('\\r\\n','\\n');\nconst actorRead=currentDefectActorReader(rawRead);\nconst read=p=>{\n const source=rawRead(p);\n const before=p==='src/lua/abyss_combat_queued_play.lua'\n  ?sourceEpoch.preCombinedSource(p,source,{target:'pr618',readSource:rawRead}):source;\n return preDefectActorSource(p,before,{readSource:actorRead});\n};\nconst before=JSON.parse(gunzipSync(readFileSync('tests/fixtures/watcher-actor-before.json.gz')));"
   }
  ]
 },
 {
  "path": "tests/lua/support/modal_cover_setters.lua",
  "beforeSha256": "1607d0872125f71c99bb7c22c97d7c3db6b253e7d925100b5c0fee3e77358d82",
  "afterSha256": "995fc1bc11b435e91cf2b6445f302f8acff96d22f19448bb7e48b2f5a154abdc",
  "hunks": [
   {
    "at": 1,
    "before": "local Gate=require('abyss_page_reveal')\nlocal function fixture()",
    "after": "local Gate=require('abyss_page_reveal')\nlocal function blocker()\n return {SetAnchoredPosition=function()end,SetSizeDelta=function()end}\nend\nlocal function fixture()"
   },
   {
    "at": 17,
    "before": " end\n local cover={SetVisible=function(self,v)self.visible=v end,SetAsLastSibling=function()end,\n  GetChild=function(_,name)if name=='veil'then return veil end end}\n local frames={full={0,0,1280,720},deckPanel={0,28,1120,560}}",
    "after": " end\n local hitBlocker=blocker()\n local cover={SetVisible=function(self,v)self.visible=v end,SetAsLastSibling=function()end,\n  GetChild=function(_,name)if name=='veil'then return veil elseif name=='blocker'then return hitBlocker end end}\n local frames={full={0,0,1280,720},deckPanel={0,28,1120,560}}"
   },
   {
    "at": 67,
    "before": " function veil:SetSizeDelta()if hooks.size then hooks.size()end end\n local cover={SetVisible=function(self,v)self.visible=v end,SetAsLastSibling=function()end,\n  GetChild=function(_,name)if name=='veil'then return veil end end}\n local frames={full={0,0,1280,720},deckPanel={0,28,1120,560},potionPanel={0,0,500,400}}",
    "after": " function veil:SetSizeDelta()if hooks.size then hooks.size()end end\n local hitBlocker=blocker()\n local cover={SetVisible=function(self,v)self.visible=v end,SetAsLastSibling=function()end,\n  GetChild=function(_,name)if name=='veil'then return veil elseif name=='blocker'then return hitBlocker end end}\n local frames={full={0,0,1280,720},deckPanel={0,28,1120,560},potionPanel={0,0,500,400}}"
   }
  ]
 },
 {
  "path": "tests/runtime-ui-hotpaths.test.mjs",
  "beforeSha256": "54567cfd9f99a8f2197e305b4d3cb1475d0b3cd80a5f7fc905e4f0cda0533962",
  "afterSha256": "653e02f06216b597260dd819f23e4ada87dc6d8bf2f870ff22938a7d1c0796e7",
  "hunks": [
   {
    "at": 73,
    "before": "});\ntest('runtime UI negative control: deferred activation violates render ordering',()=>{\n const module='abyss_game_ui_view',source=readFileSync(`src/lua/${module}.lua`,'utf8');\n const anchor='suspendBattle(run,deckOpen,potionOpen))';assert.equal(source.split(anchor).length-1,1);\n const entry=join(tmpdir(),`gameui-render-mutant-${randomUUID()}.lua`);\n writeFileSync(entry,`package.preload[${luaString(module)}]=assert(load(${luaString(source.replace(anchor,'suspendBattle(run,deckOpen,potionOpen),true)'))},'@${module}-mutant'))\\ndofile('tests/lua/runtime_ui_hotpaths.lua')\\n`);\n try{const result=runLua(entry);assert.notEqual(result.status,0);assert.match(result.stdout+result.stderr,/GameUI refresh must preserve both observable render boundaries/);}finally{unlinkSync(entry);}",
    "after": "});\nconst activation='suspendBattle(run,deckOpen,potionOpen),self.mode==\\'battle\\' and deckOpen)';\ntest('runtime UI negative control: deferred activation violates render ordering',()=>{\n const module='abyss_game_ui_view',source=readFileSync(`src/lua/${module}.lua`,'utf8');\n assert.equal(source.split(activation).length-1,1);\n const entry=join(tmpdir(),`gameui-render-mutant-${randomUUID()}.lua`);\n writeFileSync(entry,`package.preload[${luaString(module)}]=assert(load(${luaString(source.replace(activation,'suspendBattle(run,deckOpen,potionOpen),true)'))},'@${module}-mutant'))\\ndofile('tests/lua/runtime_ui_hotpaths.lua')\\n`);\n try{const result=runLua(entry);assert.notEqual(result.status,0);assert.match(result.stdout+result.stderr,/GameUI refresh must preserve both observable render boundaries/);}finally{unlinkSync(entry);}"
   },
   {
    "at": 83,
    "before": " const module='abyss_game_ui_view';let source=readFileSync(`src/lua/${module}.lua`,'utf8').replaceAll('\\r\\n','\\n');\n const anchor='suspendBattle(run,deckOpen,potionOpen))';assert.equal(source.split(anchor).length-1,1);\n const final='        self.battleUI:render()\\n';assert.equal(source.split(final).length-1,1);",
    "after": " const module='abyss_game_ui_view';let source=readFileSync(`src/lua/${module}.lua`,'utf8').replaceAll('\\r\\n','\\n');\n assert.equal(source.split(activation).length-1,1);\n const final='        self.battleUI:render()\\n';assert.equal(source.split(final).length-1,1);"
   }
  ]
 },
 {
  "path": "tests/silent-final-source-epoch.test.mjs",
  "beforeSha256": "053fbce34fbca97b8fbdebf02e20abefa7d5f8e332075819f5b7c8f2dbf0cd6d",
  "afterSha256": "219c29d681c28882ff8fa0e43e7f33afca035fbbfbd7d1fc94c71ce28996438e",
  "hunks": [
   {
    "at": 10,
    "before": "import {sourceSlice} from './helpers/closeout-source-epoch.mjs';\n// These original49-owner contracts authenticate the pre-component Silent epoch;",
    "after": "import {sourceSlice} from './helpers/closeout-source-epoch.mjs';\nimport {sourceEpoch as currentEpoch} from './helpers/combined-epoch/source-epoch.mjs';\nimport {pointerInputPath,readRetiredController,retiredControllerPath} from './helpers/input-retirement-source.mjs';\nimport {createHash} from 'node:crypto';\n// These original49-owner contracts authenticate the pre-component Silent epoch;"
   },
   {
    "at": 103,
    "before": "\ntest('live LF and CRLF raw owner reads authenticate 49 current owners on every call',()=>{\n const config='config/architecture.json',input=readFileSync(config,'utf8'),expected=proof.targets.actor.files[config].source;\n for(const crlf of [false,true]){\n  const seen=[];let corrupt=null,missing=null;\n  const live=file=>{seen.push(file);if(file===missing)return null;const bytes=readFileSync(file,'utf8').replaceAll('\\r\\n','\\n');return file===corrupt?bytes+'\\n':crlf?bytes.replaceAll('\\n','\\r\\n'):bytes;};\n  for(let repeat=0;repeat<2;repeat++){seen.length=0;assert.equal(sourceEpoch.preCombinedSource(config,input,{target:'actor',readSource:live}),expected);assert.deepEqual(seen,proof.owners);}\n  for(const owner of proof.owners){\n   corrupt=owner;assert.throws(()=>sourceEpoch.preCombinedSource(config,input,{target:'actor',readSource:live}),/linked owner identity/,owner);corrupt=null;\n   missing=owner;assert.throws(()=>sourceEpoch.preCombinedSource(path,readFileSync(path,'utf8'),{target:'silentFinalPrior',readSource:live}),/linked owner identity/,owner);missing=null;\n  }",
    "after": "\ntest('live LF and CRLF raw owner reads authenticate the complete current closure on every call',()=>{\n const config='config/architecture.json',input=diskReadFileSync(config,'utf8'),expected=proof.targets.actor.files[config].source;\n const readLive=file=>diskReadFileSync(file,'utf8');\n const retired=readRetiredController(readLive);\n assert(retired.restored,'the live pointer owner authenticates controller retirement');\n for(const crlf of [false,true]){\n  const seen=[];let corrupt=null,missing=null;\n  const live=file=>{\n   seen.push(file);\n   if(file===missing)return null;\n   const bytes=(file===retiredControllerPath&&file===corrupt?retired.source:readLive(file)).replaceAll('\\r\\n','\\n');\n   if(file===corrupt&&file!==retiredControllerPath)return bytes+'\\n';\n   return crlf?bytes.replaceAll('\\n','\\r\\n'):bytes;\n  };\n  for(let repeat=0;repeat<2;repeat++){\n   seen.length=0;\n   assert.equal(currentEpoch.preCombinedSource(config,input,{target:'actor',readSource:live}),expected);\n   assert.equal(seen.length,460);\n   assert.equal(createHash('sha256').update(JSON.stringify(seen)).digest('hex'),\n    '6b72ef490e6f79b870b0a21d5b63ddb122f065aff81f837e8f6fa3bafbd40d51');\n   for(const owner of proof.owners)assert(seen.includes(owner),'retained Silent owner: '+owner);\n  }\n  for(const owner of proof.owners){\n   corrupt=owner;assert.throws(()=>currentEpoch.preCombinedSource(config,input,{target:'actor',readSource:live}),/linked owner identity/,owner);corrupt=null;\n   missing=owner===retiredControllerPath?pointerInputPath:owner;\n   assert.throws(()=>currentEpoch.preCombinedSource(path,readLive(path),{target:'silentFinalPrior',readSource:live}),/linked owner (?:identity|missing)/,owner);\n   missing=null;\n  }"
   }
  ]
 },
 {
  "path": "tests/sts-page-reveal.test.mjs",
  "beforeSha256": "28026050ac54563301c3168d7492f782a7345b6ccea059c5aee48c7d60c7fae0",
  "afterSha256": "d7000dc572d0c4988844c339ba60e3970e386b7a9017e4069c38e1bfcc83b5c4",
  "hunks": [
   {
    "at": 86,
    "before": "local veil={SetAnchoredPosition=function()end,SetSizeDelta=function()end}\nlocal cover={SetVisible=function(_,v)shown=v end,SetAsLastSibling=function()end,\n GetChild=function(_,name)if name=='veil'then return veil end end}\nlocal gate=Gate.new(cover,function()return true end,nil,{full={0,0,1280,720},choicePanel={5,10,1100,600},battlePanel={0,0,1100,600}})",
    "after": "local veil={SetAnchoredPosition=function()end,SetSizeDelta=function()end}\nlocal blocker={SetAnchoredPosition=function()end,SetSizeDelta=function()end}\nlocal cover={SetVisible=function(_,v)shown=v end,SetAsLastSibling=function()end,\n GetChild=function(_,name)if name=='veil'then return veil elseif name=='blocker'then return blocker end end}\nlocal gate=Gate.new(cover,function()return true end,nil,{full={0,0,1280,720},choicePanel={5,10,1100,600},battlePanel={0,0,1100,600}})"
   },
   {
    "at": 337,
    "before": " const read=path=>readFileSync(path,'utf8');\n const crlf=source=>source.replaceAll('\\n','\\r\\n');\n const priorLua=beforeDevelopBackflow(lua,read(lua));",
    "after": " const read=path=>readFileSync(path,'utf8');\n const crlf=source=>source.replace(/\\r?\\n/g,'\\r\\n');\n const priorLua=beforeDevelopBackflow(lua,read(lua));"
   }
  ]
 },
 {
  "path": "tests/sts1-menu-native.cases.mjs",
  "beforeSha256": "5a30f4553da5e3892ce819403cf3592c9d9236d83c8ca5f79f9cb798d04f8d09",
  "afterSha256": "cb934afa9e6982a388e37139086f900340c53168823200b6863b651a8c00e742",
  "hunks": [
   {
    "at": 41,
    "before": " assert.equal(project(path,null),null);\n assert.equal(project(path,source.replaceAll('\\n','\\r\\n')),prior.replaceAll('\\n','\\r\\n'));\n});",
    "after": " assert.equal(project(path,null),null);\n const toCrlf=value=>value.replace(/\\r?\\n/g,'\\r\\n');\n assert.equal(project(path,toCrlf(source)),toCrlf(prior));\n const malformed=toCrlf(source).replace('\\r\\n','\\r\\r\\n');\n assert.equal(project(path,malformed),malformed,'double CR must remain unrecognized');\n});"
   }
  ]
 },
 {
  "path": "src/lua/abyss_deck_ui.lua",
  "beforeSha256": "842929cfc09896bc87bb7bc6d56ed758199b655c8bcd54bb079a1461d18885a7",
  "afterSha256": "0f19a8b8835ac30741128da4e75e5de3889de8ae4788a4eb879c838d4a75c062",
  "hunks": [
   {
    "at": 205,
    "before": "        if self.browserShell then\n            local browserChrome=root:GetChild('pileChrome')\n            browserChrome:GetChild('heading'):SetVisible(self.detailPages~=nil)\n            browserChrome:GetChild('drawBadge'):SetVisible(active==true and self.pileKind=='draw')\n            browserChrome:GetChild('discardBadge'):SetVisible(active==true and self.pileKind=='discard')\n        end",
    "after": "        if self.browserShell then\n            local pileChrome=root:GetChild('pileChrome')\n            pileChrome:GetChild('heading'):SetVisible(self.detailPages~=nil)\n            pileChrome:GetChild('drawBadge'):SetVisible(active==true and self.pileKind=='draw')\n            pileChrome:GetChild('discardBadge'):SetVisible(active==true and self.pileKind=='discard')\n        end"
   }
  ]
 },
 {
  "path": "tests/art-feature-flags-runtime.test.mjs",
  "beforeSha256": "5fd7d8a4a86cc2e1129f1d11bbf4fffbb2adb71943009cd849d4f68f4f29bc1b",
  "afterSha256": "829838455b61faf4edd163a3db71a6816ef61c75c55489d32bd42fcccb4e4614",
  "hunks": [
   {
    "at": 19,
    "before": " modules={abyss_ui_profile={schemaVersion=1,nativePageLifecycle=false},abyss_monster_actor_binding={templateIndex=31,containerTemplateIndex=32,powerTemplateIndex=33,enabled=true},abyss_art_features=config,abyss_data={},abyss_presentation={},abyss_theme={sound={}},\n  -- This fixture substitutes GameUI itself; provide its page-intent boundary too.",
    "after": " modules={abyss_ui_profile={schemaVersion=1,nativePageLifecycle=false},abyss_monster_actor_binding={templateIndex=31,containerTemplateIndex=32,powerTemplateIndex=33,enabled=true},abyss_art_features=config,abyss_data={},abyss_presentation={},abyss_theme={sound={}},\n  -- The standard UI build emits this binding even when no browser template is installed.\n  abyss_deck_browser_binding={templateIndex=0,parts={}},\n  -- This fixture substitutes GameUI itself; provide its page-intent boundary too."
   },
   {
    "at": 50,
    "before": " assert(load(ENTRY))();OnStart();assert(updates and views==1,'art availability must not disable GameUI')\n assert(componentParams==1,'comparison switch must be read once with its registered default off')",
    "after": " assert(load(ENTRY))();OnStart();assert(updates and views==1,'art availability must not disable GameUI')\n assert(requested.abyss_deck_browser_binding==1 and options.deckBrowser==nil,\n  'the generated default binding must be loaded once without activating the native deck browser')\n assert(componentParams==1,'comparison switch must be read once with its registered default off')"
   },
   {
    "at": 98,
    "before": "end\n`));",
    "after": "end\n`));\ntest('missing mandatory deck browser binding fails closed before GameUI attaches',()=>vm(setup+`\nlocal messages={}\nprint=function(message)messages[#messages+1]=message end\nlocal ok=pcall(start,snapshot(),function(m)m.abyss_deck_browser_binding=nil end)\nassert(not ok and updates==false and views==0,'missing browser binding must not start GameUI')\nassert(requested.abyss_deck_browser_binding==1,'the missing binding must be consulted exactly once')\nassert(table.concat(messages,'|'):find('missing abyss_deck_browser_binding',1,true),'startup must report the missing module')\n`));"
   }
  ]
 },
 {
  "path": "tests/event-option-rim-clipping.test.mjs",
  "beforeSha256": "92cb2e2ba8bc2b9e5ee5ec39a7321a874368cb2f6aed167aa13d1b2d8f03b901",
  "afterSha256": "a354c46d56ac029cdb54ccb499ded7b2fc491f883c41842cd4636ecf15d25890",
  "hunks": [
   {
    "at": 3,
    "before": "import {nativeTheme} from '../scripts/native-ui-theme.mjs';\nimport {officialAssetsTheme} from '../scripts/official-assets-layout.mjs';",
    "after": "import {nativeTheme} from '../scripts/native-ui-theme.mjs';\nimport {v25Theme} from '../scripts/v25-layout.mjs';\nimport {officialAssetsTheme} from '../scripts/official-assets-layout.mjs';"
   },
   {
    "at": 12,
    "before": "test('shared event corner masks clip the complete option chrome before live copy and input',()=>{\n const theme=officialAssetsTheme(nativeTheme),layout=nodeLayout(theme),event=find(layout,'eventView');\n const hits=Array.from({length:4},(_,i)=>child(child(event,'option'+(i+1)),'hit'));",
    "after": "test('shared event corner masks clip the complete option chrome before live copy and input',()=>{\n const theme=v25Theme(nativeTheme),layout=nodeLayout(theme),event=find(layout,'eventView');\n const hits=Array.from({length:4},(_,i)=>child(child(event,'option'+(i+1)),'hit'));"
   },
   {
    "at": 19,
    "before": "  assert.equal(masks.length,4,'all ordinary event options retain the same four corner masks');\n  assert.deepEqual(row.size,[700,44]);\n  assert.equal(child(row,'hit'),hits[i-1],'corner repair cannot replace the input owner');\n  assert.deepEqual(child(row,'hit').size,row.size,'corner repair cannot shrink native input');\n  assert.deepEqual(child(chrome,'topStitch').size,[692,2],'the shared rim geometry is retained');\n  assert.deepEqual(child(chrome,'topStitch').position,[0,20]);\n  assert.equal(child(chrome,'lowerRim').opacity,0);",
    "after": "  assert.equal(masks.length,4,'all ordinary event options retain the same four corner masks');\n  assert.deepEqual(row.size,theme.layout.nativeNode.event.options.size);\n  assert.equal(child(row,'hit'),hits[i-1],'corner repair cannot replace the input owner');\n  assert.deepEqual(child(row,'hit').size,row.size,'corner repair cannot shrink native input');\n  assert.deepEqual(child(chrome,'topStitch').size,[row.size[0]-8,2],'the shared rim geometry is retained');\n  assert.deepEqual(child(chrome,'topStitch').position,[0,row.size[1]/2-2]);\n  assert.equal(child(chrome,'lowerRim').opacity,0);"
   },
   {
    "at": 36,
    "before": "",
    "after": "\ntest('official event choices use one responsive rim and fill beneath intact copy and input',()=>{\n const theme=officialAssetsTheme(nativeTheme),event=find(nodeLayout(theme),'eventView');\n const first=child(event,'option1'),hit=child(first,'hit'),title=child(first,'title');\n styleEvent(event,theme);\n assert.strictEqual(child(first,'hit'),hit);\n assert.strictEqual(child(first,'title'),title);\n for(let i=1;i<=4;i++){\n  const row=child(event,'option'+i),material=child(row,'roundedButton'),parts=children(row);\n  assert.deepEqual(row.size,[700,44]);\n  assert.deepEqual(child(row,'hit').size,row.size);\n  assert(!parts.some(part=>part.name.startsWith('v25Corner')));\n  assert.equal(child(row,'border').visible,false);\n  for(const name of ['title','description','hit'])assert(parts.indexOf(material)<parts.indexOf(child(row,name)),'material stays behind live '+name);\n  assert.deepEqual(material.anchor,{min:[0,0],max:[1,1]});\n  assert.deepEqual(child(material,'cloth').size,[-4,-4]);\n  assert.deepEqual(children(material).map(layer=>layer.name),['rim','cloth']);\n  for(const layer of children(material)){\n   const layerParts=children(layer);\n   assert.deepEqual(layerParts.map(part=>part.name).sort(),\n    ['corner-1_-1','corner-1_1','corner1_-1','corner1_1','horizontal','vertical']);\n   for(const part of layerParts){\n    assert.equal(part.image,part.name.startsWith('corner')?theme.image.disc:theme.image.rect,layer.name+'/'+part.name);\n    assert.equal(part.raycastTarget,false);\n   }\n  }\n }\n});\n"
   }
  ]
 },
 {
  "path": "tests/sts-style-source-epoch.test.mjs",
  "beforeSha256": "3b28f64febf618d28d413c7ffb063053a46f048068aa291d9901d216f10e7a99",
  "afterSha256": "adf7475283bbd7a93e24fe9b5148206e5c5e793baa333fb36db27a7cae081934",
  "hunks": [
   {
    "at": 0,
    "before": "import {actorFocusAdded,assertActorFocusInventory,stasisUpgradeAddedPaths} from './helpers/develop-release-backflow-source.mjs';\nimport {beforeCharacterPreparationSource} from './helpers/character-preparation-source.mjs';",
    "after": "import {actorFocusAdded,assertActorFocusInventory,deckPagesAdded,stasisUpgradeAddedPaths} from './helpers/develop-release-backflow-source.mjs';\nimport {pointerInputPath,readRetiredController,retiredControllerPath} from './helpers/input-retirement-source.mjs';\nimport {beforeCharacterPreparationSource} from './helpers/character-preparation-source.mjs';"
   },
   {
    "at": 17,
    "before": "const bind=source=>({source,sha256:hash(source)}),commit='c'.repeat(40);\nfunction fixture(){",
    "after": "const bind=source=>({source,sha256:hash(source)}),commit='c'.repeat(40);\nconst readProduction=path=>readFileSync(path,'utf8');\nconst readProductionHistory=path=>path===retiredControllerPath?readRetiredController(readProduction).source:readProduction(path);\nfunction fixture(){"
   },
   {
    "at": 111,
    "before": " const {sourceEpoch,ciRepairSourceEpoch,releaseSourceEpoch,prePowerMembershipEpoch}=await import('./helpers/closeout-source-epoch.mjs');\n const p=sourceEpoch.proof,before=ciRepairSourceEpoch.proof,read=path=>readFileSync(path,'utf8');\n assert.equal(Object.keys(before.current).length,347); // config plus all 346 prior Lua modules.",
    "after": " const {sourceEpoch,ciRepairSourceEpoch,releaseSourceEpoch,prePowerMembershipEpoch}=await import('./helpers/closeout-source-epoch.mjs');\n const p=sourceEpoch.proof,before=ciRepairSourceEpoch.proof,read=readProduction;\n assert.equal(Object.keys(before.current).length,347); // config plus all 346 prior Lua modules."
   },
   {
    "at": 117,
    "before": " const actual=['config/architecture.json',...readdirSync('src/lua').filter(n=>n.endsWith('.lua')).map(n=>'src/lua/'+n)].sort();\n assert.deepEqual([...Object.keys(p.current),...stasisUpgradeAddedPaths,...actorFocusAdded].sort(),actual);\n assertActorFocusInventory(actual.filter(path=>path!=='config/architecture.json'),read);",
    "after": " const actual=['config/architecture.json',...readdirSync('src/lua').filter(n=>n.endsWith('.lua')).map(n=>'src/lua/'+n)].sort();\n assert(Object.hasOwn(p.current,retiredControllerPath),'the archived controller must remain available to historical targets');\n const previous=Object.keys(p.current).filter(path=>path!==retiredControllerPath);\n assert.deepEqual([...previous,...stasisUpgradeAddedPaths,...actorFocusAdded,...deckPagesAdded,pointerInputPath].sort(),actual);\n assertActorFocusInventory(actual.filter(path=>path!=='config/architecture.json'),read);"
   },
   {
    "at": 123,
    "before": " for(const [name,target]of Object.entries(before.targets))for(const [path,row]of Object.entries(target.files))assert.deepEqual(p.targets[name].files[path],row,name+'/'+path);\n for(const path of Object.keys(p.current))assert.equal(beforeCharacterPreparationSource(path,read(path)).replaceAll('\\r\\n','\\n'),p.current[path].source,path+' raw complete current');\n const config='config/architecture.json',raw=read(config),prior=p.targets.stsStylePrior.files[config].source;\n assert.equal(sourceEpoch.preCombinedSource(config,raw,{target:'stsStylePrior',readSource:read}),prior);\n for(const owner of p.owners.filter(path=>!before.owners.includes(path)))for(const missing of [null,read(owner)+'\\n'])\n  assert.throws(()=>sourceEpoch.preCombinedSource(config,raw,{target:'stsStylePrior',readSource:path=>path===owner?missing:read(path)}),/linked owner identity/,owner);\n});",
    "after": " for(const [name,target]of Object.entries(before.targets))for(const [path,row]of Object.entries(target.files))assert.deepEqual(p.targets[name].files[path],row,name+'/'+path);\n for(const path of Object.keys(p.current))assert.equal(beforeCharacterPreparationSource(path,readProductionHistory(path)).replaceAll('\\r\\n','\\n'),p.current[path].source,path+' exact historical input');\n const config='config/architecture.json',raw=read(config),prior=p.targets.stsStylePrior.files[config].source;\n assert.equal(sourceEpoch.preCombinedSource(config,raw,{target:'stsStylePrior',readSource:read}),prior);\n for(const owner of p.owners.filter(path=>!before.owners.includes(path))){\n  const foreign=readProductionHistory(owner)+'\\n';\n  // The retired controller has an absence witness. Removing its live replacement must still fail.\n  const missing=owner===retiredControllerPath?pointerInputPath:owner;\n  for(const [changed,value] of [[missing,null],[owner,foreign]]){\n   assert.throws(()=>sourceEpoch.preCombinedSource(config,raw,{target:'stsStylePrior',readSource:path=>path===changed?value:read(path)}),/linked owner|pointer input/,changed);\n  }\n }\n});"
   },
   {
    "at": 246,
    "before": " }\n for(const [path,row]of Object.entries(p.current))assert.equal(beforeCharacterPreparationSource(path,readFileSync(path,'utf8')).replaceAll('\\r\\n','\\n'),row.source,path);\n const anchor=feedbackProductionPaths[0],raw=path=>readFileSync(path,'utf8');\n assert.equal(sourceEpoch.preCombinedSource(anchor,raw(anchor),{target:'stsFeedbackPrior',readSource:raw}),stsStyleEpoch.proof.current[anchor].source);",
    "after": " }\n for(const [path,row]of Object.entries(p.current))assert.equal(beforeCharacterPreparationSource(path,readProductionHistory(path)).replaceAll('\\r\\n','\\n'),row.source,path);\n const anchor=feedbackProductionPaths[0],raw=readProduction;\n assert.equal(sourceEpoch.preCombinedSource(anchor,raw(anchor),{target:'stsFeedbackPrior',readSource:raw}),stsStyleEpoch.proof.current[anchor].source);"
   }
  ]
 },
 {
  "path": "tests/end-turn-responsibilities.test.mjs",
  "beforeSha256": "b02e9290633bb79c94f6ce1b176a2ec6ca2fba5a4dce2c8fba573097493897f3",
  "afterSha256": "2b73f46ebb60947aceaa9637f0b2fec9bc5215d9ee00ed5f2dea5cf3363a812e",
  "hunks": [
   {
    "at": 101,
    "before": " assert.equal(preRelicQuerySource(file,current),old);assert.equal(wrapped(file),old);\n const outerReadCount=403;\n let validReads;",
    "after": " assert.equal(preRelicQuerySource(file,current),old);assert.equal(wrapped(file),old);\n const outerReadCount=446;\n let validReads;"
   },
   {
    "at": 106,
    "before": "  if(!validReads){\n   // Nested source cohorts have their own fresh reads before and after the\n   // original owners. Bind the full live trace to its exact frozen order.\n   assert.equal(reads.length,8150);\n   assert.equal(hash(JSON.stringify(reads)),'78bb454171aed5367d039514c30a57c9971c0be116f11e048df8f3a08bc7cbb2');\n   let position=-1;",
    "after": "  if(!validReads){\n   // Current replay cohorts add fresh linked reads around the original owner sequence.\n   // Bind the complete live trace after normalizing Windows checkout endings.\n   assert.equal(reads.length,9458);\n   assert.equal(hash(JSON.stringify(reads)),'fcf5e049f6c8f284fa248ebe012c2f7a5620546e453ebc8766fea8c1d14bd749');\n   let position=-1;"
   },
   {
    "at": 142,
    "before": " assert.throws(()=>preRelicQuerySource(file,current,{readSource:p=>p===config?JSON.stringify(JSON.parse(read(p))):read(p)}),{message:configDrift});\n // The first 403 observations belong to the outer authenticated projection.\n // Mutate the first config observation from the wrapped N35 projector.\n const firstInnerConfig=validReads.indexOf(config,outerReadCount);\n assert.equal(firstInnerConfig,405);\n const innerOccurrence=validReads.slice(0,firstInnerConfig+1).filter(path=>path===config).length;",
    "after": " assert.throws(()=>preRelicQuerySource(file,current,{readSource:p=>p===config?JSON.stringify(JSON.parse(read(p))):read(p)}),{message:configDrift});\n // The first 446 observations belong to the outer authenticated projection.\n // Mutate the first config observation from the wrapped N35 projector.\n const firstInnerConfig=validReads.indexOf(config,outerReadCount);\n assert.equal(firstInnerConfig,448);\n const innerOccurrence=validReads.slice(0,firstInnerConfig+1).filter(path=>path===config).length;"
   }
  ]
 },
 {
  "path": "tests/act1-choice-responsibilities.test.mjs",
  "beforeSha256": "1905ee60a014ae61728e2463717a5cbbdae05ff0d4e66d26184659e89a02ab3c",
  "afterSha256": "de4f375b53338158e10b08a56e9a2ff4f55ab0e0b9f36d34b396e1543dc48ef8",
  "hunks": [
   {
    "at": 201,
    "before": "   // Keep the complete current trace and the ordered original contract.\n   assert.equal(reads.length,403);\n   assert.equal(createHash('sha256').update(JSON.stringify(reads)).digest('hex'),'6f35ecd12c3f1edbc8ee8e476324bdb4380725eeacf240cc6ec15cd106fc2e3f');\n   let position=-1;",
    "after": "   // Keep the complete current trace and the ordered original contract.\n   assert.equal(reads.length,446);\n   assert.equal(createHash('sha256').update(JSON.stringify(reads)).digest('hex'),'5dad58d855f93d4169fa5877eff635d77f2c0b99af76f12e8f5cb68a4d659a4f');\n   let position=-1;"
   }
  ]
 },
 {
  "path": "tests/defect-final-source-epoch.test.mjs",
  "beforeSha256": "eb4ef25a274eabbf967b02022968e14f90448746816a88fc784e41b6b3b52e77",
  "afterSha256": "0eee0e80fef5972e8b5ce092e1ef29cd98c4b6a52542b7adfa88e054894e6656",
  "hunks": [
   {
    "at": 0,
    "before": "import {beforeCharacterPreparationSource} from './helpers/character-preparation-source.mjs';\nimport {pointerInputPath,readRetiredController,retiredControllerPath} from './helpers/input-retirement-source.mjs';\nimport {currentProductionRereads} from './helpers/current-production-source-reads.mjs';",
    "after": "import {beforeCharacterPreparationSource} from './helpers/character-preparation-source.mjs';\nimport {readRetiredController,retiredControllerPath} from './helpers/input-retirement-source.mjs';\nimport {currentProductionRereads} from './helpers/current-production-source-reads.mjs';"
   },
   {
    "at": 175,
    "before": "  changed=owner;reads=[];assert.throws(()=>project(source),/combined linked owner/);\n  const attempted=current.owners.slice(0,current.owners.indexOf(owner)+1);\n  if(owner===retiredControllerPath&&replacement===null)attempted.push(pointerInputPath);\n  assert.deepEqual(reads,attempted);\n  changed=undefined;reads=[];assert.equal(project(source),expected);assert.deepEqual(reads,current.owners);",
    "after": "  changed=owner;reads=[];assert.throws(()=>project(source),/combined linked owner/);\n  // The frozen owner set still requires its original controller bytes.\n  assert.deepEqual(reads,current.owners.slice(0,current.owners.indexOf(owner)+1));\n  changed=undefined;reads=[];assert.equal(project(source),expected);assert.deepEqual(reads,current.owners);"
   },
   {
    "at": 194,
    "before": " const admittedReads=[...reads];\n assert.equal(admittedReads.length,417);\n assert.equal(createHash('sha256').update(JSON.stringify(admittedReads)).digest('hex'),\n  '05131aa3de86e8f88d0e82bca23e667bba10e3921cf029de891ec4e8b06c3a67','exact current owner read order');\n let prior=-1;",
    "after": " const admittedReads=[...reads];\n assert.equal(admittedReads.length,460);\n assert.equal(createHash('sha256').update(JSON.stringify(admittedReads)).digest('hex'),\n  '6b72ef490e6f79b870b0a21d5b63ddb122f065aff81f837e8f6fa3bafbd40d51','exact current owner read order');\n let prior=-1;"
   }
  ]
 },
 {
  "path": "tests/art-feature-source-inverse.test.mjs",
  "beforeSha256": "8b6e9fe7734cb8b52180adb708ceb89a232e9e0b7ec7a6801037c5a9192eb02b",
  "afterSha256": "4b93c836f87883e6895e0bec7d449a2e721e586fa72acc332ef62e3764d11fdb",
  "hunks": [
   {
    "at": 18,
    "before": "import {beforeCharacterPreparationSource} from './helpers/character-preparation-source.mjs';\n",
    "after": "import {beforeCharacterPreparationSource} from './helpers/character-preparation-source.mjs';\nimport {pointerInputPath,readRetiredController,retiredControllerPath} from './helpers/input-retirement-source.mjs';\n"
   },
   {
    "at": 239,
    "before": "test('current feature and history entries authenticate supported intermediates and freshly read every raw owner',()=>{\n for(const [path,expected]of Object.entries(currentTargets)){\n  const current=readFileSync(path,'utf8').replaceAll('\\r\\n','\\n');\n  assert.notEqual(hash(expected),proof.files[path].beforeSha256,'a supported intermediate is not original feature history: '+path);",
    "after": "test('current feature and history entries authenticate supported intermediates and freshly read every raw owner',()=>{\n const disk=path=>readFileSync(path,'utf8');\n assert.throws(()=>disk(retiredControllerPath),{code:'ENOENT'});\n const retired=readRetiredController(disk).source;\n const owners=[...sourceEpoch.proof.owners,pointerInputPath];\n const inputs=new Map();\n const currentBytes=owner=>{\n  if(owner===retiredControllerPath)return undefined;\n  if(!inputs.has(owner))inputs.set(owner,disk(owner));\n  return inputs.get(owner);\n };\n for(const [path,expected]of Object.entries(currentTargets)){\n  const current=currentBytes(path).replaceAll('\\r\\n','\\n');\n  assert.notEqual(hash(expected),proof.files[path].beforeSha256,'a supported intermediate is not original feature history: '+path);"
   },
   {
    "at": 259,
    "before": "     if(mode==='missing')return undefined;if(mode==='null')return null;\n     if(mode==='buffer')return Buffer.from(readFileSync(owner));\n     if(mode==='changed')return readFileSync(owner,'utf8')+'\\n';\n    }\n    return readFileSync(owner,'utf8');\n   };",
    "after": "     if(mode==='missing')return undefined;if(mode==='null')return null;\n     const source=owner===retiredControllerPath?retired:currentBytes(owner);\n     if(mode==='present')return source;\n     if(mode==='buffer')return Buffer.from(source);\n     if(mode==='changed')return source+'\\n';\n    }\n    return currentBytes(owner);\n   };"
   },
   {
    "at": 268,
    "before": "   check();const first=[...seen];\n   for(const owner of sourceEpoch.proof.owners)assert(first.includes(owner),'complete dynamic current owner: '+owner);\n   seen.length=0;check();assert.deepEqual(seen,first,'warm calls repeat the entire raw read sequence');\n   assert.equal(project(path,current.replaceAll('\\n','\\r\\n'),{readSource}),expected,'current CRLF input');\n   for(const owner of sourceEpoch.proof.owners){\n    for(const fault of ['changed','missing','null','buffer','throw']){\n     seen.length=0;bad=owner;mode=fault;\n     for(let repeat=0;repeat<2;repeat++)assert.throws(check,error=>{\n      assert.equal(error.code,'ERR_ASSERTION');assert.match(error.message,/linked owner/);assert(error.message.includes(owner));\n      if(fault==='throw')assert.match(error.message,/feature raw reader sentinel/);return true;",
    "after": "   check();const first=[...seen];\n   for(const owner of owners)assert(first.includes(owner),'complete dynamic current owner: '+owner);\n   seen.length=0;check();assert.deepEqual(seen,first,'warm calls repeat the entire raw read sequence');\n   assert.equal(project(path,current.replaceAll('\\n','\\r\\n'),{readSource}),expected,'current CRLF input');\n   for(const owner of owners){\n    if(owner===retiredControllerPath)for(mode of ['missing','null']){\n     bad=owner;seen.length=0;check();assert.deepEqual(seen,first,'retired Controller remains absent');\n    }\n    const faults=owner===retiredControllerPath?['present','changed','buffer','throw']:['changed','missing','null','buffer','throw'];\n    for(const fault of faults){\n     seen.length=0;bad=owner;mode=fault;\n     for(let repeat=0;repeat<2;repeat++)assert.throws(check,error=>{\n      const reported=owner===pointerInputPath&&fault!=='throw'?retiredControllerPath:owner;\n      assert.equal(error.code,'ERR_ASSERTION');assert.match(error.message,/linked owner/);assert(error.message.includes(reported));\n      if(fault==='throw')assert.match(error.message,/feature raw reader sentinel/);return true;"
   }
  ]
 },
 {
  "path": "tests/game-ui-extraction-source-inverse.test.mjs",
  "beforeSha256": "6ca8445df8f38cee88937c6ccdc28384f9042d555c2b86f59761b4558ee50146",
  "afterSha256": "8a5c1a39066e89ba16efac49ff9c2a6088883d21704e7947cfcc0d2dcabb37e6",
  "hunks": [
   {
    "at": 14,
    "before": "import {beforeLumineSource} from './helpers/lumine-portrait-source.mjs';\n// Keep the existing two/four-owner contracts in their original source epochs.",
    "after": "import {beforeLumineSource} from './helpers/lumine-portrait-source.mjs';\nimport {pointerInputPath,readRetiredController,retiredControllerPath} from './helpers/input-retirement-source.mjs';\n// Keep the existing two/four-owner contracts in their original source epochs."
   },
   {
    "at": 21,
    "before": "const currentRaw=p=>readFileSync(p,'utf8');\nconst cursesPriorRead=p=>{\n const source=sourceSlice(p,currentRaw(p),'cursesPrior',currentRaw);\n return beforeLumineSource(p,beforePc13ThenV2UiHudSource(p,source,currentRaw),currentRaw);\n};\n// The new potion source witness reads these owners again after the frozen layer's owner scan.\nconst potionRereads=['src/lua/abyss_battle_card_gestures.lua','src/lua/abyss_battle_ui.lua'];\ntest('portrait demand layer authenticates fresh complete owners and rejects warm drift before entering the prior epoch',()=>{\n const sourceEpoch=portraitDemandEpoch;\n const path='src/lua/abyss_traveler_portraits.lua',raw=cursesPriorRead;\n const source=raw(path).replaceAll('\\r\\n','\\n'),target=sourceEpoch.proof.targets.noncombatDemandPrior;",
    "after": "const currentRaw=p=>readFileSync(p,'utf8');\nfunction cursesPriorReader(){\n const cohort=new Map();\n return p=>{\n  if(!cohort.has(p)){\n   const current=p===retiredControllerPath?readRetiredController(currentRaw).source:currentRaw(p);\n   const source=p===architecture?sourceEpoch.preCombinedSource(p,current,{target:'cursesPrior',readSource:currentRaw}):sourceSlice(p,current,'cursesPrior',currentRaw);\n   cohort.set(p,beforeLumineSource(p,beforePc13ThenV2UiHudSource(p,source,currentRaw),currentRaw));\n  }\n  return cohort.get(p);\n };\n}\n// The authenticated portrait continuation reads these linked owners after the frozen base scan.\nconst portraitRereads=['battle_info_content','battle_render_hud','battle_card_glow','battle_render_hud','battle_render_hud']\n .map(name=>'src/lua/abyss_'+name+'.lua');\ntest('portrait demand layer authenticates fresh complete owners and rejects warm drift before entering the prior epoch',()=>{\n const sourceEpoch=portraitDemandEpoch;\n const path='src/lua/abyss_traveler_portraits.lua',raw=cursesPriorReader();\n const source=raw(path).replaceAll('\\r\\n','\\n'),target=sourceEpoch.proof.targets.noncombatDemandPrior;"
   },
   {
    "at": 45,
    "before": "  reads=[];assert.equal(sourceEpoch.preCombinedSource(path,input,{target:'noncombatDemandPrior',readSource:reader}),target.files[path].source);\n  assert.deepEqual(reads,[...sourceEpoch.proof.owners,...potionRereads]);\n }",
    "after": "  reads=[];assert.equal(sourceEpoch.preCombinedSource(path,input,{target:'noncombatDemandPrior',readSource:reader}),target.files[path].source);\n  assert.deepEqual(reads,[...sourceEpoch.proof.owners,...portraitRereads]);\n }"
   },
   {
    "at": 53,
    "before": " for(const drift of [source+'\\n',null]){live=drift;assert.throws(()=>sourceEpoch.preCombinedSource(path,source,{target:'noncombatDemandPrior',readSource:mutable}),/combined linked owner identity/);}\n for(const owner of potionRereads){\n  let seen=0;\n  const late=p=>p===owner&&++seen===2?null:raw(p);\n  assert.throws(()=>sourceEpoch.preCombinedSource(path,source,{target:'noncombatDemandPrior',readSource:late}),\n   error=>error.message.includes('combined linked owner identity: '+owner+' changed during owner validation'));\n  assert.equal(seen,2);\n }",
    "after": " for(const drift of [source+'\\n',null]){live=drift;assert.throws(()=>sourceEpoch.preCombinedSource(path,source,{target:'noncombatDemandPrior',readSource:mutable}),/combined linked owner identity/);}\n for(const [index,owner] of portraitRereads.entries()){\n  const occurrence=[...sourceEpoch.proof.owners,...portraitRereads.slice(0,index+1)].filter(path=>path===owner).length;\n  let seen=0;\n  const late=p=>p===owner&&++seen===occurrence?null:raw(p);\n  assert.throws(()=>sourceEpoch.preCombinedSource(path,source,{target:'noncombatDemandPrior',readSource:late}),\n   error=>error.message.includes(owner)&&/linked owner/.test(error.message));\n  assert.equal(seen,occurrence);\n }"
   },
   {
    "at": 69,
    "before": " assert.equal(target.commit,'3a061a76b5eb917ac0f4213c01a9cbafd28d1824');\n const raw=cursesPriorRead;\n const live=p=>sourceEpoch.preCombinedSource(p,raw(p),{target:'noncombatDemandPrior',readSource:raw});",
    "after": " assert.equal(target.commit,'3a061a76b5eb917ac0f4213c01a9cbafd28d1824');\n const raw=cursesPriorReader();\n const live=p=>sourceEpoch.preCombinedSource(p,raw(p),{target:'noncombatDemandPrior',readSource:raw});"
   },
   {
    "at": 74,
    "before": "  assert.equal(epoch.preCombinedSource(path,source,{target:'noncombatPrior',readSource:p=>{fresh.push(p);return live(p);}}),target.files[path].source);\n  assert.deepEqual(fresh,[...epoch.proof.owners,...potionRereads],'every owner, including both potion rereads, is read freshly');\n  for(const input of [source+'\\n',source.slice(1),target.files[path].source,null,{}]){",
    "after": "  assert.equal(epoch.preCombinedSource(path,source,{target:'noncombatPrior',readSource:p=>{fresh.push(p);return live(p);}}),target.files[path].source);\n  assert.deepEqual(fresh,[...epoch.proof.owners,...portraitRereads],'every frozen owner and continuation is read freshly');\n  for(const input of [source+'\\n',source.slice(1),target.files[path].source,null,{}]){"
   },
   {
    "at": 277,
    "before": " const live=join(root,'combined-live'),destination=join(root,'combined-copy');\n for(const path of sourceEpoch.proof.owners){const target=join(live,path);mkdirSync(dirname(target),{recursive:true});copyFileSync(path,target);}\n for(const path of added){const target=join(destination,path);mkdirSync(dirname(target),{recursive:true});copyFileSync(path,target);}\n const retire=prepare(destination,{sourceRoot:live});\n for(const owner of sourceEpoch.proof.owners){\n  const file=join(live,owner),original=readFileSync(file,'utf8');",
    "after": " const live=join(root,'combined-live'),destination=join(root,'combined-copy');\n const visits=new Set();\n const readClosure=path=>{visits.add(path);return currentRaw(path);};\n for(const path of added){\n  const accepted=sourceEpoch.proof.targets.develop.files[path];\n  assert.equal(accepted.sha256,proof.files[path].afterSha256,'exact retirement predecessor identity: '+path);\n  const projected=sourceEpoch.preCombinedSource(path,currentRaw(path),{target:'develop',readSource:readClosure});\n  assert.equal(projected.replaceAll('\\r\\n','\\n'),accepted.source,'exact live retirement owner: '+path);\n }\n assert(sourceEpoch.proof.owners.every(path=>visits.has(path)),'complete current linked owner set');\n assert(visits.has(pointerInputPath),'complete live pointer replacement');\n const owners=[...visits].filter(path=>path!==retiredControllerPath);\n for(const path of owners){const target=join(live,path);mkdirSync(dirname(target),{recursive:true});copyFileSync(path,target);}\n for(const path of added){const target=join(destination,path);mkdirSync(dirname(target),{recursive:true});copyFileSync(path,target);}\n const retire=prepare(destination,{sourceRoot:live});\n const restoredController=join(live,retiredControllerPath);\n writeFileSync(restoredController,readRetiredController(currentRaw).source);\n assert.throws(retire,/retirement module/,'even an exact retired controller cannot be reintroduced');\n rmSync(restoredController);\n for(const owner of owners){\n  const file=join(live,owner),original=readFileSync(file,'utf8');"
   }
  ]
 },
 {
  "path": "tests/helpers/action-buttons-source.mjs",
  "beforeSha256": "fdb6c73f52cf92fededa3d48fded11f05e21356ec66864a43c54bdf51781d4cd",
  "afterSha256": "2ed23e99f0b72927215c24189b1a93752d9869b968cca0fc327a4b780900d4af",
  "hunks": [
   {
    "at": 14,
    "before": "export const actionButtonsOwns = path => Object.hasOwn(files, path);\n\nfunction matches(path, source) {\n  return actionButtonsOwns(path) && typeof source === 'string' && !source.includes('\\r\\r\\n')\n    && hash(normalize(source)) === files[path].afterSha;\n}",
    "after": "export const actionButtonsOwns = path => Object.hasOwn(files, path);\nconst lastVerifiedBytes = new Map();\n\nfunction matches(path, source) {\n  if (!actionButtonsOwns(path) || typeof source !== 'string') return false;\n  if (lastVerifiedBytes.get(path) === source) return true;\n  if (source.includes('\\r\\r\\n') || hash(normalize(source)) !== files[path].afterSha) return false;\n  lastVerifiedBytes.set(path, source);\n  return true;\n}"
   }
  ]
 },
 {
  "path": "scripts/ci-shards.mjs",
  "beforeSha256": "6becba66be6048f090cd0036c2e5292f180d9010bbe24aef181977dca18fdeb3",
  "afterSha256": "65b55e95f57347f503b4f2fe9264774061081b640db6a4f8fb801e1c37943a4d",
  "hunks": [
   {
    "at": 14,
    "before": "timings.js.win32[artFeatureInverseTest] = Math.max(timings.js.win32[artFeatureInverseTest] ?? timings.unknownJsMs, 431203);\n",
    "after": "timings.js.win32[artFeatureInverseTest] = Math.max(timings.js.win32[artFeatureInverseTest] ?? timings.unknownJsMs, 431203);\n\n// Reserve the work that completed in POSIX jobs 137444936421, 137444936442,\n// 137444936458, 137444936507 and 137444936550 before their 30-minute cutoff.\n// Jobs 137468791737, 137468791821, 137468791838, 137468791852 and\n// 137468791853 from the next attempt exposed underweighted replay files.\n// Completed cases and file observations guide placement only.\nconst linuxReplayMinimumMs = Object.freeze({\n  'act1-choice-responsibilities.test.mjs': 153000,\n  'actor-lifecycle.test.mjs': 98000,\n  'approved-node-ui-refactor.test.mjs': 526000,\n  'approved-ui-inverse.test.mjs': 1295000,\n  'architecture-composition-format.test.mjs': 420000,\n  'art-feature-source-inverse.test.mjs': 412000,\n  'battle-max-hp-config-inverse.test.mjs': 124000,\n  'boss-ui-fixture-composition.test.mjs': 64000,\n  'card-origin-source-inverse.test.mjs': 149000,\n  'combat-reactions-architecture-inverse.test.mjs': 137000,\n  'competition-roster.test.mjs': 505000,\n  'core-architecture-inverse.test.mjs': 362000,\n  'core-lifecycle-source-inverse.test.mjs': 713000,\n  'defect-integration-source.test.mjs': 153000,\n  'end-turn-responsibilities.test.mjs': 252000,\n  'event-production-source-inverse.test.mjs': 100000,\n  'final-integration-source.test.mjs': 318000,\n  'game-ui-extraction-source-inverse.test.mjs': 870000,\n  'game-ui-host-result.test.mjs': 188000,\n  'max-hp-accepted-source-inverse.test.mjs': 677000,\n  'mobile-qa-source-migration.test.mjs': 140000,\n  'native-enemy-theme-inverse.test.mjs': 54000,\n  'nodes-battle-max-hp-config-inverse.test.mjs': 90000,\n  'player-death-inverse.test.mjs': 172000,\n  'potion-callback-source.test.mjs': 238000,\n  'power-shop-boundaries.test.mjs': 486000,\n  'presentation-native-m3-contract.test.mjs': 1037000,\n  'relic-query-source-inverse.test.mjs': 123000,\n});\n\n// Completed replay cases in Windows jobs 137468791786, 137468791799,\n// 137468791818, 137468791860, 137468791861 and 137468791871.\nconst windowsReplayMinimumMs = Object.freeze({\n  'act1-choice-responsibilities.test.mjs': 195000,\n  'architecture-composition-format.test.mjs': 1190000,\n  'battle-max-hp-config-inverse.test.mjs': 681000,\n  'card-origin-source-inverse.test.mjs': 360000,\n  'colorless-catalog-source.test.mjs': 566000,\n  'compendium-source-inverse.test.mjs': 690000,\n  'competition-roster-config-composition.test.mjs': 287000,\n  'core-architecture-inverse.test.mjs': 321000,\n  // Job 137468791861 spent over half an hour on this file before cutoff.\n  'core-lifecycle-source-inverse.test.mjs': 800000,\n  'formal-campaign-entry.test.mjs': 233000,\n  'official-assets-runtime.test.mjs': 216000,\n  'potion-callback-source.test.mjs': 132000,\n  'power-shop-boundaries.test.mjs': 1364000,\n  'presentation-native-m3-contract.test.mjs': 791000,\n  'reward-query-boundary-source.test.mjs': 1440000,\n  'round3-catalog-source-inverse.test.mjs': 278000,\n  'run-architecture-inverse.test.mjs': 384000,\n});\n\nexport const replayPlanningMinimumMs = Object.freeze({ linux: linuxReplayMinimumMs, win32: windowsReplayMinimumMs });\n"
   },
   {
    "at": 101,
    "before": "  const maps=Object.hasOwn(timings.js,platform)?[timings.js[platform]]:Object.values(timings.js);\n  return Object.fromEntries(files.map(file=>[file,Math.max(\n    ...maps.map(weights=>weights[file]??timings.unknownJsMs),\n    timings.jsPlanning?.localLowerBounds?.[file]?.durationMs??0)]));\n}",
    "after": "  const maps=Object.hasOwn(timings.js,platform)?[timings.js[platform]]:Object.values(timings.js);\n  return Object.fromEntries(files.map(file=>{\n    const name=file.slice('tests/'.length);\n    return [file,Math.max(\n      ...maps.map(weights=>weights[file]??timings.unknownJsMs),\n      timings.jsPlanning?.localLowerBounds?.[file]?.durationMs??0,\n      platform !== 'win32' ? linuxReplayMinimumMs[name] ?? 0 : 0,\n      platform !== 'linux' ? windowsReplayMinimumMs[name] ?? 0 : 0)];\n  }));\n}"
   }
  ]
 },
 {
  "path": "tests/helpers/game-ui-extraction-source-inverse.mjs",
  "beforeSha256": "53382c07cd63cd010a8aa3c9b2dc12ba3a38ac628d3104cce8eb2ef3c8c33d8c",
  "afterSha256": "2289fc74eb6d0948182080709e12d0e1f497a9c7b845dcbdeb704b6bd191be1a",
  "hunks": [
   {
    "at": 18,
    "before": " }\n if(readSource===live&&(path==='config/architecture.json'||path==='src/lua/abyss_game_ui.lua'))\n  return sourceEpoch.withCombinedProjection(path,source,{target:'develop',readSource},\n   (projected,read)=>original(path,projected,{readSource:read}));\n const projected=sourceEpoch.preCombinedSource(path,source,{target:'develop',readSource});",
    "after": " }\n // The invocation rereads every observed owner before returning. Only the\n // projection of an already verified byte string is reused within the call.\n if(path==='config/architecture.json'||path==='src/lua/abyss_game_ui.lua')\n  return sourceEpoch.withCombinedProjection(path,source,{target:'develop',readSource},\n   (projected,read)=>original(path,projected,{readSource:projected===source&&readSource!==live\n    ?sourceEpoch.combinedReader(readSource,'develop'):read}));\n const projected=sourceEpoch.preCombinedSource(path,source,{target:'develop',readSource});"
   }
  ]
 },
 {
  "path": "tests/lua/relic_lifecycle_session.lua",
  "beforeSha256": "4e3395d25fe5066c0441ecf0861e479d6b65a7252498ba6b7e79b2f47b45dec4",
  "afterSha256": "7f713357225edc2ac58155ccbb03f8a7433bc7412e49c8bf4d9b9db51c02a0a8",
  "hunks": [
   {
    "at": 5,
    "before": " assert(R.obtainRelic(r,'empty_cage'));local uid=r.deck[1].uid\n F.call(root,'boss default adapter first selection',B.select,r,uid)\n F.call(root,'boss duplicate selection rejected',B.select,r,uid)\n F.call(root,'boss default adapter final selection',B.select,r,r.deck[2].uid)\n F.eq(r.pendingBossRelic,nil,'two selected cards removed')",
    "after": " assert(R.obtainRelic(r,'empty_cage'));local uid=r.deck[1].uid\n local called,accepted=F.call(root,'boss adapter first selection',B.select,r,uid,R)\n F.eq(called,true,'first selection runs');F.eq(accepted,true,'first selection accepted')\n called,accepted=F.call(root,'boss duplicate selection rejected',B.select,r,uid,R)\n F.eq(called,true,'duplicate selection runs');F.eq(accepted,false,'duplicate selection rejected')\n called,accepted=F.call(root,'boss adapter final selection',B.select,r,r.deck[2].uid,R)\n F.eq(called,true,'final selection runs');F.eq(accepted,true,'final selection accepted')\n F.eq(r.pendingBossRelic,nil,'two selected cards removed')"
   },
   {
    "at": 15,
    "before": " local r=R.new(F.D,42);assert(R.obtainRelic(r,'calling_bell'));local root=F.root(r)\n F.call(root,'boss reward default Run adapter',B.claim,r,'relic',1)\n F.call(root,'boss already claimed refuses',B.claimRelic,r,1)\n F.call(root,'boss finishes pending rewards',B.claim,r,'done')\nend",
    "after": " local r=R.new(F.D,42);assert(R.obtainRelic(r,'calling_bell'));local root=F.root(r)\n local called,accepted=F.call(root,'boss reward Run adapter',B.claim,r,'relic',1,R)\n F.eq(called,true,'claim runs');F.eq(accepted,true,'first claim accepted')\n called,accepted=F.call(root,'boss already claimed refuses',B.claimRelic,r,1,R)\n F.eq(called,true,'repeated claim runs');F.eq(accepted,false,'repeated claim rejected')\n called,accepted=F.call(root,'boss finishes pending rewards',B.claim,r,'done',nil,R)\n F.eq(called,true,'finish runs');F.eq(accepted,true,'finish accepted')\n F.eq(r.pendingBossRelic,nil,'finished boss rewards cleared')\nend"
   },
   {
    "at": 26,
    "before": " assert(R.obtainRelic(r,'dollys_mirror'));local root=F.root(r)\n F.call(root,'mirror ordinary public no-adapter selection',Shop.chooseMirror,r,original.uid)\n F.eq(r.deck[#r.deck].cardId,original.cardId,'mirror identity');assert(r.deck[#r.deck].uid~=original.uid)",
    "after": " assert(R.obtainRelic(r,'dollys_mirror'));local root=F.root(r)\n local called,accepted=F.call(root,'mirror ordinary public selection',Shop.chooseMirror,r,original.uid,R)\n F.eq(called,true,'mirror selection runs');F.eq(accepted,true,'mirror selection accepted')\n F.eq(r.deck[#r.deck].cardId,original.cardId,'mirror identity');assert(r.deck[#r.deck].uid~=original.uid)"
   }
  ]
 },
 {
  "path": "tests/tiny-house-pending-ui.cases.mjs",
  "beforeSha256": "38c4bbfa3b5ebb26248f56f9df9fe5f3736c978cc4e44c4f6fd49de85f87908c",
  "afterSha256": "2560d0f11773f6f0d7ba2a6111cb77cb686dbe8b53695ec35f373091eeb6beb6",
  "hunks": [
   {
    "at": 50,
    "before": " const expected=[...reads];\n assert.equal(expected.length,417,'complete fresh raw closure size');\n assert.equal(createHash('sha256').update(JSON.stringify(expected)).digest('hex'),\n  '05131aa3de86e8f88d0e82bca23e667bba10e3921cf029de891ec4e8b06c3a67','exact current admission order');\n let position=-1;",
    "after": " const expected=[...reads];\n assert.equal(expected.length,460,'complete fresh raw closure size');\n assert.equal(createHash('sha256').update(JSON.stringify(expected)).digest('hex'),\n  '6b72ef490e6f79b870b0a21d5b63ddb122f065aff81f837e8f6fa3bafbd40d51','exact current admission order');\n let position=-1;"
   },
   {
    "at": 59,
    "before": " eventReread=expected.lastIndexOf(event)+1;\n assert.equal(eventReread,417,'the event owner must be checked again after the initial scan');\n assert.notEqual(expected.indexOf(event)+1,eventReread,'the injected failure belongs to a fresh repeat read');",
    "after": " eventReread=expected.lastIndexOf(event)+1;\n assert.equal(eventReread,460,'the event owner must be checked again after the initial scan');\n assert.notEqual(expected.indexOf(event)+1,eventReread,'the injected failure belongs to a fresh repeat read');"
   }
  ]
 },
 {
  "path": "tests/approved-ui-inverse.test.mjs",
  "beforeSha256": "55ee7c59bd21d09ffc881f2eaf946685ab1b477473ec462b7e60a5eda7fc69a8",
  "afterSha256": "121bf3942a2c777cbc7639105406306d309d3000034a9030c89677e4f5e94a97",
  "hunks": [
   {
    "at": 2,
    "before": "import {preIntegratedNodeUiSource} from './helpers/approved-node-ui-refactor.mjs';\nimport {historicalTest as test} from './helpers/historical-baseline-inputs.mjs';\nimport assert from 'node:assert/strict';",
    "after": "import {preIntegratedNodeUiSource} from './helpers/approved-node-ui-refactor.mjs';\nimport test from 'node:test';\nimport {historicalTest} from './helpers/historical-baseline-inputs.mjs';\nimport assert from 'node:assert/strict';"
   },
   {
    "at": 7,
    "before": "import {join} from 'node:path';\nimport {tmpdir} from 'node:os';\nimport {createHash} from 'node:crypto';\nimport {approvedUi,preApprovedUiSource,preApprovedUiOuterSource} from './helpers/approved-ui-inverse.mjs';",
    "after": "import {join} from 'node:path';\nimport {availableParallelism,tmpdir} from 'node:os';\nimport {createHash} from 'node:crypto';\nimport {execFile} from 'node:child_process';\nimport {promisify} from 'node:util';\nimport {fileURLToPath} from 'node:url';\nimport {approvedUi,preApprovedUiSource,preApprovedUiOuterSource} from './helpers/approved-ui-inverse.mjs';"
   },
   {
    "at": 16,
    "before": "const read=p=>readBeforeMobileQaSource(p).replaceAll('\\r\\n','\\n');\nconst potionPath='tests/lua/battle_ui_potion_target_failures.lua';",
    "after": "const read=p=>readBeforeMobileQaSource(p).replaceAll('\\r\\n','\\n');\nconst cases=[];\nconst register=(name,body)=>cases.push([name,body]);\nconst potionPath='tests/lua/battle_ui_potion_target_failures.lua';"
   },
   {
    "at": 36,
    "before": "}\ntest('approved UI layer binds complete current sources and restores exactly the unchanged PR302 base',()=>{\n assert.equal(approvedUi.baseHead,'53fa164a9914dd8a7a5849ff741925dd3131f5e4');",
    "after": "}\nregister('approved UI layer binds complete current sources and restores exactly the unchanged PR302 base',()=>{\n assert.equal(approvedUi.baseHead,'53fa164a9914dd8a7a5849ff741925dd3131f5e4');"
   },
   {
    "at": 60,
    "before": "});\ntest('bounded potion registrar composes only its complete exact source before the unchanged frozen UI guard',()=>{\n const live=read(potionPath),original=originalPotionFailures(live),binding=approvedUi.files[potionPath];",
    "after": "});\nregister('bounded potion registrar composes only its complete exact source before the unchanged frozen UI guard',()=>{\n const live=read(potionPath),original=originalPotionFailures(live),binding=approvedUi.files[potionPath];"
   },
   {
    "at": 90,
    "before": "});\ntest('historical materialization consumes both all 26 original sources and every new UI consumer',()=>{\n for(const path of ['src/lua/abyss_card_display.lua','src/lua/abyss_card_skin.lua','src/lua/abyss_shop_ui.lua'])assert(approvedUi.files[path],path);",
    "after": "});\nregister('historical materialization consumes both all 26 original sources and every new UI consumer',()=>{\n for(const path of ['src/lua/abyss_card_display.lua','src/lua/abyss_card_skin.lua','src/lua/abyss_shop_ui.lua'])assert(approvedUi.files[path],path);"
   },
   {
    "at": 110,
    "before": "",
    "after": "\nconst workerFlag='--isolated-approved-ui-case';\nconst nameFilter=/(?:^|[\\s\"'])--test-(?:name|skip)-pattern(?=[=\\s\"']|$)/;\nconst hasNameFilter=process.execArgv.some(arg=>nameFilter.test(arg))\n ||nameFilter.test(process.env.NODE_OPTIONS??'');\nif(process.argv[2]===workerFlag){\n const selected=cases.find(([name])=>name===process.argv[3]);\n assert(selected,'registered approved UI replay case');\n historicalTest(...selected);\n}else if(availableParallelism()<2||hasNameFilter){\n for(const entry of cases)historicalTest(...entry);\n}else{\n // The historical harness changes cwd. Run the cases in separate processes\n // so each keeps its own verified inputs and isolated working directory.\n const execute=promisify(execFile),file=fileURLToPath(import.meta.url);\n test('approved UI historical replay',{concurrency:2},async context=>{\n  await Promise.all(cases.map(([name])=>context.test(name,async()=>{\n   const env={...process.env};\n   delete env.NODE_TEST_CONTEXT;\n   const {stdout}=await execute(process.execPath,['--test-reporter=tap',file,workerFlag,name],{env,maxBuffer:1024*1024,windowsHide:true})\n    .catch(error=>assert.fail([error.stdout,error.stderr,error.message].filter(Boolean).join('\\n')));\n   assert.match(stdout,/^# tests 1\\r?$/m,'the isolated process ran one registered case');\n   assert.match(stdout,/^# pass 1\\r?$/m,'the isolated historical case passed');\n  })));\n });\n}\n"
   }
  ]
 },
 {
  "path": "tests/actor-damage-pipeline.test.mjs",
  "beforeSha256": "94c11d90caf0e024c9f987e483bbb782e5b250323d14bb2420cf88e09d302f2e",
  "afterSha256": "a284f0061ed61b68c31cd29d07550580c2b11b455c425ff6f91c7d35c34234b8",
  "hunks": [
   {
    "at": 20,
    "before": "  const config='config/architecture.json';\n  const read=path=>readFileSync(path,'utf8');\n  const paths=readdirSync('src/lua').filter(path=>path.endsWith('.lua')).map(path=>'src/lua/'+path);",
    "after": "  const config='config/architecture.json';\n  const read=path=>readFileSync(path,'utf8').replaceAll('\\r\\n','\\n');\n  const paths=readdirSync('src/lua').filter(path=>path.endsWith('.lua')).map(path=>'src/lua/'+path);"
   }
  ]
 },
 {
  "path": "tests/deck-item-lifecycle.test.mjs",
  "beforeSha256": "6a62cb556a016e52e80feac4e870f674ec786a14485b2568f7341050bc5e6677",
  "afterSha256": "1b94c6f88d5a821c010f5fd978261d2c52e98b119aa91fc2d4bacbe084b78416",
  "hunks": [
   {
    "at": 30,
    "before": " assert.notEqual(prior,current);\n assert.equal(beforeMapDeckSource(path,current.replaceAll('\\n','\\r\\n'),read),prior.replaceAll('\\n','\\r\\n'));\n assert.deepEqual(mapDeckPriorRead(read)(path),Buffer.from(prior));",
    "after": " assert.notEqual(prior,current);\n const crlf=source=>source.replace(/\\r?\\n/g,'\\r\\n');\n assert.equal(beforeMapDeckSource(path,crlf(current),read),crlf(prior));\n assert.deepEqual(mapDeckPriorRead(read)(path),Buffer.from(prior));"
   }
  ]
 },
 {
  "path": "tests/integrated-ci-source.cases.mjs",
  "beforeSha256": "3e6a0dd86a826099554169a298731f7382f9a682043412f610916671d8c7ca15",
  "afterSha256": "7532d563f7e22f4e12d532887e12ace3bf8fa676044660825ac9470cb0ec1848",
  "hunks": [
   {
    "at": 75,
    "before": " assert.equal(leaf.split(marker).length,2);\n const broken=leaf.replace(\"from './fork-preflight-source.mjs'\",'from '+JSON.stringify(new URL('./helpers/fork-preflight-source.mjs',import.meta.url).href))\n  .replace(marker,`const bytes=Buffer.from(${JSON.stringify(bytes.subarray(0,bytes.length-1).toString('base64'))},'base64');`);",
    "after": " assert.equal(leaf.split(marker).length,2);\n const helperDirectory=new URL('./helpers/',import.meta.url);\n const broken=leaf.replace(/^(import [^\\r\\n]+ from )'(\\.\\/[^']+)'/gm,(_match,statement,specifier)=>\n  statement+JSON.stringify(new URL(specifier,helperDirectory).href))\n  .replace(marker,`const bytes=Buffer.from(${JSON.stringify(bytes.subarray(0,bytes.length-1).toString('base64'))},'base64');`);"
   }
  ]
 },
 {
  "path": "tests/helpers/combined-epoch/source-epoch-runtime.mjs",
  "beforeSha256": "4bf2e1c7038d0bbe0bffd85ec5be1c4685811b63bf79653f56756779b5463348",
  "afterSha256": "fb7228b5010fbb3f7638dd7d4d6eb72ac0ae2d3459432d5bbd56954cb06160e3",
  "hunks": [
   {
    "at": 105,
    "before": " assert.match(proof.currentCommit,/^[a-f0-9]{40}$/);\n assert(Array.isArray(proof.owners));assert.equal(new Set(proof.owners).size,proof.owners.length,'unique owners');\n for(const [path,binding]of Object.entries(proof.current)){assert(validPath(path),'source path');validateBinding(binding);}",
    "after": " assert.match(proof.currentCommit,/^[a-f0-9]{40}$/);\n assert(Array.isArray(proof.owners));\n const owners=new Set(proof.owners);assert.equal(owners.size,proof.owners.length,'unique owners');\n const currentPaths=Object.keys(proof.current).sort();\n for(const [path,binding]of Object.entries(proof.current)){assert(validPath(path),'source path');validateBinding(binding);}"
   },
   {
    "at": 112,
    "before": "  assert(/^[A-Za-z0-9_-]+$/.test(name),'target name');assert.match(target.commit,/^[a-f0-9]{40}$/);\n  assert.deepEqual(Object.keys(target.files).sort(),Object.keys(proof.current).sort(),'complete target path set');\n  for(const [path,binding]of Object.entries(target.files)){\n   validateBinding(binding);\n   if(binding?.sha256!==proof.current[path]?.sha256)assert(proof.owners.includes(path),'changed source closure');\n  }",
    "after": "  assert(/^[A-Za-z0-9_-]+$/.test(name),'target name');assert.match(target.commit,/^[a-f0-9]{40}$/);\n  assert.deepEqual(Object.keys(target.files).sort(),currentPaths,'complete target path set');\n  for(const [path,binding]of Object.entries(target.files)){\n   validateBinding(binding);\n   if(binding?.sha256!==proof.current[path]?.sha256)assert(owners.has(path),'changed source closure');\n  }"
   }
  ]
 },
 {
  "path": "tests/helpers/source-fingerprint.mjs",
  "beforeSha256": "82873d43045cd012a0ed817a27d88343bd0f092d755d49a04629f98b9bd72612",
  "afterSha256": "cf53dca53dfbbcf96d25a71e3076e09896c28aeff3fb1fd24c11ba794072ad4a",
  "hunks": [
   {
    "at": 7,
    "before": "export function exactSourceMatches(source,binding){\n if(typeof source!=='string'||source.includes('\\r\\r\\n'))return false;\n const text=source.replaceAll('\\r\\n','\\n');\n let fingerprint=fingerprints.get(text);\n if(!fingerprint){\n  fingerprint={sha256:createHash('sha256').update(text).digest('hex')};\n  if(text.length<=limit){\n   while(fingerprints.size>=512||retained+text.length>limit){\n    const first=fingerprints.keys().next().value;\n    fingerprints.delete(first);\n    retained-=first.length;\n   }\n   fingerprints.set(text,fingerprint);\n   retained+=text.length;\n  }",
    "after": "export function exactSourceMatches(source,binding){\n if(typeof source!=='string')return false;\n let fingerprint=fingerprints.get(source);\n if(!fingerprint){\n  if(source.includes('\\r\\r\\n'))return false;\n  const text=source.replaceAll('\\r\\n','\\n');\n  const length=text===source?source.length:source.length+text.length;\n  fingerprint={text,length,sha256:createHash('sha256').update(text).digest('hex')};\n  if(length<=limit){\n   while(fingerprints.size>=512||retained+length>limit){\n    const first=fingerprints.keys().next().value;\n    retained-=fingerprints.get(first).length;\n    fingerprints.delete(first);\n   }\n   fingerprints.set(source,fingerprint);\n   retained+=length;\n  }"
   },
   {
    "at": 25,
    "before": " if(fingerprint.sha256!==binding.sha256)return false;\n fingerprint.gitBlob??=createHash('sha1').update(`blob ${Buffer.byteLength(text)}\\0`).update(text).digest('hex');",
    "after": " if(fingerprint.sha256!==binding.sha256)return false;\n const {text}=fingerprint;\n fingerprint.gitBlob??=createHash('sha1').update(`blob ${Buffer.byteLength(text)}\\0`).update(text).digest('hex');"
   }
  ]
 },
 {
  "path": "tests/ci-runtime.test.mjs",
  "beforeSha256": "e420cc0f4973bc975a1d0fabdbc1b316fcf34c7ccb7db0ab1efef9270bbf0876",
  "afterSha256": "b17178f24a4ff222ab024c532a5ec5ffe869f989373f78fffd57b4205e1c2d38",
  "hunks": [
   {
    "at": 33,
    "before": "import {readBeforeMobileQaSource} from './helpers/mobile-qa-source-inverse.mjs';\nimport { partition, jsShard, jsPlanningWeights, discoverJs, timings } from '../scripts/ci-shards.mjs';\nimport { shardLuaScripts } from '../scripts/test-lua.mjs';",
    "after": "import {readBeforeMobileQaSource} from './helpers/mobile-qa-source-inverse.mjs';\nimport { partition, jsShard, jsPlanningWeights, discoverJs, timings, replayPlanningMinimumMs } from '../scripts/ci-shards.mjs';\nimport { shardLuaScripts } from '../scripts/test-lua.mjs';"
   },
   {
    "at": 117,
    "before": "\ntest('platform-native placement covers every current file once and unknown platforms retain the conservative fallback',()=>{\n const files=discoverJs();\n const asymmetric=files.find(file=>{\n  const floor=timings.jsPlanning?.localLowerBounds?.[file]?.durationMs??0;\n  return Math.max(timings.js.win32[file]??timings.unknownJsMs,floor)!==Math.max(timings.js.linux[file]??timings.unknownJsMs,floor);\n });\n assert.ok(asymmetric,'the observed platform maps contain distinct costs');",
    "after": "\nfunction expectedPlanningWeight(file,platform,floor=timings.jsPlanning?.localLowerBounds?.[file]?.durationMs??0){\n const native=Object.hasOwn(timings.js,platform)?[platform]:Object.keys(timings.js);\n return Math.max(floor,...native.flatMap(os=>[\n  timings.js[os][file]??timings.unknownJsMs,\n  replayPlanningMinimumMs[os]?.[file.slice('tests/'.length)]??0,\n ]));\n}\n\ntest('platform-native placement covers every current file once and unknown platforms retain the conservative fallback',()=>{\n const files=discoverJs();\n for(const floor of Object.values(replayPlanningMinimumMs))for(const [name,ms]of Object.entries(floor)){\n  assert(files.includes('tests/'+name),'measured replay placement has a current test: '+name);\n  assert(Number.isSafeInteger(ms)&&ms>0,'positive replay case duration: '+name);\n }\n const asymmetric=files.find(file=>expectedPlanningWeight(file,'win32')!==expectedPlanningWeight(file,'linux'));\n assert.ok(asymmetric,'the observed platform maps contain distinct costs');"
   },
   {
    "at": 135,
    "before": "  const native=jsPlanningWeights(files,platform);\n  for(const file of files)assert.equal(native[file],Math.max(timings.js[platform][file]??timings.unknownJsMs,timings.jsPlanning?.localLowerBounds?.[file]?.durationMs??0));\n  const count=platform==='win32'?qualityShardMatrices.windows.length:qualityShardMatrices.posix.length;",
    "after": "  const native=jsPlanningWeights(files,platform);\n  for(const file of files)assert.equal(native[file],expectedPlanningWeight(file,platform));\n  const count=platform==='win32'?qualityShardMatrices.windows.length:qualityShardMatrices.posix.length;"
   },
   {
    "at": 144,
    "before": "  const fallback=jsPlanningWeights(files,platform);\n  for(const file of files)assert.equal(fallback[file],Math.max(...Object.values(timings.js).map(map=>map[file]??timings.unknownJsMs),timings.jsPlanning?.localLowerBounds?.[file]?.durationMs??0));\n }",
    "after": "  const fallback=jsPlanningWeights(files,platform);\n  for(const file of files)assert.equal(fallback[file],expectedPlanningWeight(file,platform));\n }"
   },
   {
    "at": 289,
    "before": "  }\n  for(const platform of ['win32','linux'])assert.equal(jsPlanningWeights([file],platform)[file],Math.max(timings.js[platform][file]??timings.unknownJsMs,entry.durationMs));\n }",
    "after": "  }\n  for(const platform of ['win32','linux'])assert.equal(jsPlanningWeights([file],platform)[file],expectedPlanningWeight(file,platform,entry.durationMs));\n }"
   },
   {
    "at": 423,
    "before": "  assert.equal(timings.js[platform][key],10000,'retain actual old observations separately from the new local planning floor');\n  assert.equal(jsPlanningWeights([key],platform)[key],Math.max(timings.js[platform][key],floor.durationMs));\n }",
    "after": "  assert.equal(timings.js[platform][key],10000,'retain actual old observations separately from the new local planning floor');\n  assert.equal(jsPlanningWeights([key],platform)[key],expectedPlanningWeight(key,platform,floor.durationMs));\n }"
   },
   {
    "at": 453,
    "before": "  assert.equal(floor.durationMs,Math.ceil(observation.durationMs));assert.equal(observation.planningFloorMs,floor.durationMs);\n  for(const platform of ['win32','linux'])assert.equal(jsPlanningWeights([file],platform)[file],Math.max(timings.js[platform][file]??timings.unknownJsMs,floor.durationMs));\n }",
    "after": "  assert.equal(floor.durationMs,Math.ceil(observation.durationMs));assert.equal(observation.planningFloorMs,floor.durationMs);\n  for(const platform of ['win32','linux'])assert.equal(jsPlanningWeights([file],platform)[file],expectedPlanningWeight(file,platform,floor.durationMs));\n }"
   }
  ]
 },
 {
  "path": "tests/helpers/historical-drag-worker.mjs",
  "beforeSha256": "b7f9fdc9854ab6e8ebd80606ee4b5a44e2926a5fd9dac311307c23f9548c2fdf",
  "afterSha256": "eacffc2ccb806c0078b7d77938518be230add54685fe458d0598f4bd3b0063fd",
  "hunks": [
   {
    "at": 65,
    "before": "}\nprocess.on('message',message=>{if(message.type==='run')void run(message);else if(message.type==='close'){runtime?.close();runtime=undefined;process.disconnect();}});\nprocess.on('disconnect',()=>{child?.kill();runtime?.close();});process.send({type:'ready'});",
    "after": "}\nprocess.on('message',message=>{\n if(message.type==='run')void run(message);\n else if(message.type==='close'){\n  // The parent already owns this root and deletes it after the worker exits.\n  // Windows directory removal need not consume the worker's shutdown deadline.\n  runtime=undefined;\n  process.disconnect();\n }\n});\nprocess.on('disconnect',()=>{child?.kill();runtime?.close();});process.send({type:'ready'});"
   }
  ]
 },
 {
  "path": "tests/lua/game_ui_seed.lua",
  "beforeSha256": "fd74b7c87d599f5701fcdc29d054527ca70bf3b75d8835999f897835a9e7e7d8",
  "afterSha256": "b433399431f0ed51680d46f9644d319f52a8893197c038930b33873d12cf508a",
  "hunks": [
   {
    "at": 110,
    "before": "        assert(seen[i].run==nil, \"opening character selection must not allocate a run or seed\")\n        assert(F.confirmStart(seen[i],\"traveler\"))\n        for _=1,80 do\n            local host=seen[i]\n            if not host.starting and not(host.prologue and host.prologue:covering())",
    "after": "        assert(seen[i].run==nil, \"opening character selection must not allocate a run or seed\")\n        local host=seen[i]\n        assert(host:selectCharacter(\"traveler\"))\n        for _=1,80 do\n            if not host.pageReveal:covered() then break end\n            OnUpdate(0.05)\n        end\n        assert(host.run==nil,\"waiting for the selection page must not allocate a run or seed\")\n        assert(host:confirmCharacter())\n        for _=1,80 do\n            if not host.starting and not(host.prologue and host.prologue:covering())"
   }
  ]
 },
 {
  "path": "tests/lua/potion_remaining_inventory_ui.lua",
  "beforeSha256": "4f1db1dec3f11ba49ff9eb0413a03d9cd54c70ea7109e05d651c698defda7c9a",
  "afterSha256": "e3a7e8fda7f070bba58b6e04d58c3d5a9a7fb5cfce4b4b076d63745195e2711e",
  "hunks": [
   {
    "at": 1,
    "before": "local F=dofile('tests/lua/support/game_ui_fixture.lua')\nlocal Run,Shop=require('abyss_run'),require('abyss_shop')",
    "after": "local F=dofile('tests/lua/support/game_ui_fixture.lua')\nlocal advanceShop=dofile('tests/lua/support/shop_timeline.lua')\nlocal Run,Shop=require('abyss_run'),require('abyss_shop')"
   },
   {
    "at": 13,
    "before": "end\nlocal flow=Shop.prepare(h.run);flow.type='shop';flow.id='description-fixture';flow.floor=h.run.floor;h.run.nodeFlow=flow;h.run.phase='node'\nh.nodeUI.run,h.nodeUI.map=h.run,h.map;h.run.gold=10000\nfor offset=0,3,3 do\n for slot=1,3 do flow.potions[slot]={slot=slot,id=specs[offset+slot][1],price=50,rarity='common',sold=false,unavailable=false}end\n h.nodeUI:render()\n for slot=1,3 do",
    "after": "end\nh.run.gold=10000\nfor offset=0,3,3 do\n local flow=Shop.prepare(h.run);flow.type='shop';flow.id='description-fixture-'..offset;flow.floor=h.run.floor\n for slot=1,3 do flow.potions[slot]={slot=slot,id=specs[offset+slot][1],price=50,rarity='common',sold=false,unavailable=false}end\n h.run.nodeFlow=flow;h.run.phase='node';h:refresh()\n assert(F.click(root,'nodePanel','merchant/talk'));advanceShop(h)\n for slot=1,3 do"
   }
  ]
 },
 {
  "path": "tests/core-lifecycle-source-inverse.test.mjs",
  "beforeSha256": "3069d09db3b80d8e2ff1d67401b7b063884dadfe3e9d6586ee80757fd07610fd",
  "afterSha256": "e51c7b8a96101bd1f46eb408e4676a8c76a5347fed5ed4904ae72ce7484739ee",
  "hunks": [
   {
    "at": 71,
    "before": " const old=Object.fromEntries(paths.map(path=>[path,before(path)]));\n for(const consume of [prior,publicPrior])for(const host of paths)for(const linked of owners){\n  const source=read(host),expected=consume(host,source);let mode='good',reads=[];\n  const readSource=p=>{reads.push(p);if(p===linked){if(mode==='throw')throw Error('reader failed');if(mode==='missing')return undefined;if(mode==='drift')return read(p)+'\\n';if(mode==='old')return old[p];}return read(p);};\n  assert.equal(consume(host,source,{readSource}),expected);assert.deepEqual(reads.slice(0,4),owners);",
    "after": " const old=Object.fromEntries(paths.map(path=>[path,before(path)]));\n // Prepare the exact four-owner epoch once for the injected reader. That reader\n // still supplies every fresh success or fault to the unchanged historical guard.\n const sources=Object.fromEntries(owners.map(path=>[path,read(path)]));\n for(const consume of [prior,publicPrior])for(const host of paths)for(const linked of owners){\n  const source=sources[host],expected=consume(host,source);let mode='good',reads=[];\n  const readSource=p=>{reads.push(p);if(p===linked){if(mode==='throw')throw Error('reader failed');if(mode==='missing')return undefined;if(mode==='drift')return sources[p]+'\\n';if(mode==='old')return old[p];}return sources[p]??read(p);};\n  assert.equal(consume(host,source,{readSource}),expected);assert.deepEqual(reads.slice(0,4),owners);"
   }
  ]
 }
].map(row=>[row.path,row]));

// Retain at most one verified byte-for-byte projection per declared path.
const lastVerifiedProjection=new Map();
export function beforeCurrentReplayFixes(path, source){
 const binding=bindings.get(path);
 if(!binding)return source;
 const cached=lastVerifiedProjection.get(path);
 if(cached&&cached.source===source)return cached.previous;
 if(cached&&cached.previous===source)return source;
 const prior=restoreExactFixtureHunks(binding,path,source);
 if(prior===source)return source;
 const previous=source.includes('\r\n')?prior.replaceAll('\n','\r\n'):prior;
 lastVerifiedProjection.set(path,{source,previous});
 return previous;
}
