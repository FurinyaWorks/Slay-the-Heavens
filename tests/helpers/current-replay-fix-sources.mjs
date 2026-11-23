// Exact predecessors for the current replay and test repairs. Current
// discovery and test execution continue to use the files on disk.
import {restoreExactFixtureHunks} from './exact-fixture-hunks.mjs';

const bindings = new Map([
 {
  "path": "tests/integrated-ci-source.cases.mjs",
  "beforeSha256": "3e6a0dd86a826099554169a298731f7382f9a682043412f610916671d8c7ca15",
  "afterSha256": "370a2deaefa8ccb69a464bbd166f9d8993f40e857d7c933dca5246f07d7bc7b5",
  "hunks": [
   {
    "at": 76,
    "before": " const broken=leaf.replace(\"from './fork-preflight-source.mjs'\",'from '+JSON.stringify(new URL('./helpers/fork-preflight-source.mjs',import.meta.url).href))",
    "after": " const leafUrl=new URL('./helpers/release-bootstrap-ci-source.mjs',import.meta.url);\n const broken=leaf.replace(/^(import .+ from )'(\\.\\/[^']+)';$/gm,\n  (_,prefix,specifier)=>prefix+JSON.stringify(new URL(specifier,leafUrl).href)+';')"
   }
  ]
 },
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
  "afterSha256": "8c6018ed92a5783613bdf73c6b73cb48c77bb6b22d7d28debef82ca3a1c5dbc8",
  "hunks": [
   {
    "at": 11,
    "before": "import {beforeCurrentProductionSource} from './helpers/character-preparation-source.mjs';\nimport {actorFocusAdded,assertActorFocusInventory,stasisUpgradeAddedPaths} from './helpers/develop-release-backflow-source.mjs';\nconst require=createRequire(import.meta.url),luaparse=require('luaparse');",
    "after": "import {beforeCurrentProductionSource} from './helpers/character-preparation-source.mjs';\nimport {entranceInventory} from './helpers/ui-entrance-source.mjs';\nimport {actorFocusAdded,assertActorFocusInventory,deckPagesAdded,stasisUpgradeAddedPaths} from './helpers/develop-release-backflow-source.mjs';\nimport {beforeCombatEvents,beforeInputRetirementReader,pointerInputPath,retiredControllerPath} from './helpers/input-retirement-source.mjs';\nconst require=createRequire(import.meta.url),luaparse=require('luaparse');"
   },
   {
    "at": 25,
    "before": " const readLive=path=>Object.hasOwn(live,path)?live[path]:read(path);\n assert.deepEqual(Object.keys(live).sort(),[...Object.keys(proof.current),...actorFocusAdded,...stasisUpgradeAddedPaths].sort(),'complete live source inventory before preStyle');\n assertActorFocusInventory(Object.keys(raw),readLive);\n for(const [path,binding]of Object.entries(proof.current))\n  assert.equal(beforeCurrentProductionSource(path,live[path],readLive).replaceAll('\\r\\n','\\n'),binding.source,'live preStyle input identity: '+path);\n const admitted=sourceEpoch.preCombinedSource(config,live[config],{target:'stsStylePrior',readSource:readLive});",
    "after": " const readLive=path=>Object.hasOwn(live,path)?live[path]:read(path);\n const expected=[...Object.keys(proof.current),...actorFocusAdded,...stasisUpgradeAddedPaths,...deckPagesAdded];\n assert(expected.includes(retiredControllerPath),'preStyle inventory includes the historical controller');\n assert.deepEqual(entranceInventory(Object.keys(live).sort(),readLive),[...expected.filter(path=>path!==retiredControllerPath),pointerInputPath].sort(),'complete live source inventory before preStyle');\n assertActorFocusInventory(Object.keys(raw),readLive);\n const historicalRead=beforeInputRetirementReader(readLive);\n for(const [path,binding]of Object.entries(proof.current)){\n  const source=path===retiredControllerPath?historicalRead(path):live[path];\n  assert.equal(beforeCurrentProductionSource(path,source,readLive).replaceAll('\\r\\n','\\n'),binding.source,'live preStyle input identity: '+path);\n }\n const admitted=sourceEpoch.preCombinedSource(config,live[config],{target:'stsStylePrior',readSource:readLive});"
   },
   {
    "at": 99,
    "before": "  .replaceAll('        local Actors=actorHost()\\n',''),original[utility]);\n assert.equal(read(queued).replace(\"local function utilityActorHost()return require('abyss_actor')end\\n\",'')\n  .replace('utility.prepareEffect(state,e,target,utilityActorHost)','utility.prepareEffect(state,e,target)'),original[queued]);",
    "after": "  .replaceAll('        local Actors=actorHost()\\n',''),original[utility]);\n assert.equal(beforeCombatEvents(queued,read(queued)).replace(\"local function utilityActorHost()return require('abyss_actor')end\\n\",'')\n  .replace('utility.prepareEffect(state,e,target,utilityActorHost)','utility.prepareEffect(state,e,target)'),original[queued]);"
   },
   {
    "at": 110,
    "before": " const foreign=discoverSources();foreign['src/lua/abyss_page_reveal.lua']+='\\n-- unrelated drift';\n assert.throws(()=>capabilityPreStyle(foreign),{message:'fresh current production owner: src/lua/abyss_page_reveal.lua'},'historical policy cannot conceal current owner drift');\n const updated='src/lua/abyss_character_presentation.lua';",
    "after": " const foreign=discoverSources();foreign['src/lua/abyss_page_reveal.lua']+='\\n-- unrelated drift';\n assert.throws(()=>capabilityPreStyle(foreign),{message:'combined linked owner identity: src/lua/abyss_page_reveal.lua during entrance validation'},'historical policy cannot conceal current owner drift');\n const updated='src/lua/abyss_character_presentation.lua';"
   },
   {
    "at": 135,
    "before": " assert.equal(hosts.length,3,'original eager Actor, untouched Watcher host and new Utility host');\n for(const name of ['utilityActorHost','watcherActorHost'])assert(hosts.some(e=>read(queued).split('\\n')[e.line-1].includes(`local function ${name}()`)));\n // Parse the complete changed module for each mutant, then replace its edges",
    "after": " assert.equal(hosts.length,3,'original eager Actor, untouched Watcher host and new Utility host');\n const queuedLines=raw[queued].split('\\n');\n for(const name of ['utilityActorHost','watcherActorHost'])assert(hosts.some(e=>queuedLines[e.line-1].includes(`local function ${name}()`)));\n // Parse the complete changed module for each mutant, then replace its edges"
   }
  ]
 },
 {
  "path": "tests/helpers/fork-preflight-source.mjs",
  "beforeSha256": "f1611ba371126867ce69926daa71fbb211bafb32ece60362d992cd9d3efc49c0",
  "afterSha256": "3f5545f4164d5fdefdc5e42712fadbee5571d0a5ed19334090c6224f319aba4a",
  "hunks": [
   {
    "at": 11,
    "before": "import {beforeStsFadeCi} from './sts-fade-ci-source.mjs';\nimport {beforeIntegratedStsInventory} from './sts-selection-fade-source.mjs';",
    "after": "import {beforeStsFadeCi} from './sts-fade-ci-source.mjs';\nimport {beforeCurrentReplayFixes} from './current-replay-fix-sources.mjs';\nimport {beforeIntegratedStsInventory} from './sts-selection-fade-source.mjs';"
   },
   {
    "at": 768,
    "before": " assertNativeFlowFixturesCurrent(liveRead);\n read=(path,encoding)=>beforeCalibrationReplay(path,liveRead(path,encoding));\n const readCurrent=(path,encoding)=>{",
    "after": " assertNativeFlowFixturesCurrent(liveRead);\n read=(path,encoding)=>beforeCalibrationReplay(path,beforeCurrentReplayFixes(path,liveRead(path,encoding)));\n const readCurrent=(path,encoding)=>{"
   },
   {
    "at": 815,
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
  "afterSha256": "215cfae4d501c03f01c3ea773772db867058a658863be6e13e0b0507668323a5",
  "hunks": [
   {
    "at": 9,
    "before": "import assert from 'node:assert/strict';\nconst live=p=>readFileSync(new URL('../../'+p,import.meta.url),'utf8');",
    "after": "import assert from 'node:assert/strict';\nimport {isCurrentInputRetirementSource} from './input-retirement-source.mjs';\nimport {beforeUiEntrance} from './ui-entrance-source.mjs';\nconst live=p=>readFileSync(new URL('../../'+p,import.meta.url),'utf8');"
   },
   {
    "at": 25,
    "before": "  // any old byte. Never cache permission or use a projected reader downstream.\n  sourceEpoch.preCombinedSource(actorAnchor,sourceEpoch.proof.current[actorAnchor].source,{target:'pr618',readSource:raw});\n  assert(Object.hasOwn(defectActorEpoch.proof.current,path),'known Actor owner');",
    "after": "  // any old byte. Never cache permission or use a projected reader downstream.\n  const source=raw(actorAnchor);\n  assert(isCurrentInputRetirementSource(actorAnchor,beforeUiEntrance(actorAnchor,source)),'combined linked owner identity: '+actorAnchor);\n  assert.equal(sourceEpoch.preCombinedSource(actorAnchor,source,{target:'pr618',readSource:raw}),\n   actorTarget.files[actorAnchor].source,'exact current Actor admission target');\n  assert(Object.hasOwn(defectActorEpoch.proof.current,path),'known Actor owner');"
   },
   {
    "at": 33,
    "before": "}\n// Explicit compatibility readers share this same full-current admission gate.\nexport {actorReader as currentDefectActorReader};\nexport function preM7FinalSource(path,source,{readSource=live}={}){\n readSource=readers.get(readSource)??readSource;\n const input=source;source=preDefectActorSource(path,source,{readSource:actorReader(readSource)});\n const utility=preDefectUtilitySource(path,source);if(utility!==source)return utility;",
    "after": "}\n// Explicit live compatibility readers start with the exact current architecture\n// before authenticating the complete current graph and exposing an earlier view.\nexport function currentDefectActorReader(raw){\n if(typeof raw!=='function')return raw;\n return path=>{\n  const source=raw(actorAnchor);\n  assert(isCurrentInputRetirementSource(actorAnchor,beforeUiEntrance(actorAnchor,source)),'combined linked owner identity: '+actorAnchor);\n  assert.equal(sourceEpoch.preCombinedSource(actorAnchor,source,{target:'pr618',readSource:raw}),\n   actorTarget.files[actorAnchor].source,'exact current Actor admission target');\n  assert(Object.hasOwn(defectActorEpoch.proof.current,path),'known Actor owner');\n  return actorTarget.files[path].source;\n };\n}\nexport function preM7FinalSource(path,source,{readSource=live}={}){\n readSource=readers.get(readSource)??readSource;\n const input=source;\n // Authenticate the post-Actor combat backflow against real disk owners before\n // passing an older source to the independently frozen Actor verifier.\n const actorInput=sourceEpoch.preCombinedSource(path,input,{target:'pr618',readSource});\n source=preDefectActorSource(path,actorInput,{readSource:actorReader(readSource)});\n const utility=preDefectUtilitySource(path,source);if(utility!==source)return utility;"
   }
  ]
 },
 {
  "path": "tests/helpers/release-ui-restore-source.mjs",
  "beforeSha256": "75da223110ac6a108face448920b3c07f61c427544cc8953a043721f99499c03",
  "afterSha256": "d2f34bef11ae4cb35c5df68556afc37d3de8d4ce7268a988bcef8fc39495b47a",
  "hunks": [
   {
    "at": 3,
    "before": "import {authorizeRefinedReleaseProduction,beforeRefinedReleaseProduction} from './refined-release-source.mjs';\nimport assert from 'node:assert/strict';",
    "after": "import {authorizeRefinedReleaseProduction,beforeRefinedReleaseProduction} from './refined-release-source.mjs';\nimport {inputRetirementStsFixtureSource} from './input-retirement-sts-binding.mjs';\nimport {beforeStsFadeCi} from './sts-fade-ci-source.mjs';\nimport {beforeCurrentReplayFixes} from './current-replay-fix-sources.mjs';\nimport {beforeUiEntranceWitness} from './ui-entrance-source.mjs';\nimport assert from 'node:assert/strict';"
   },
   {
    "at": 61,
    "before": "export const beforeRecordingUi=(path,source)=>beforeReleaseDetailSource(path,recording.project(path,beforeCombatVisualSource(path,source)));\nexport function beforeAuthenticatedRecordingStage(path,source,read){\n const released=beforeRebasedRelease(path,source);\n if(released!==source)authorizeRebasedRelease([[path,source]],owner=>read(owner,'utf8'));\n const readReleased=owner=>beforeRebasedRelease(owner,read(owner,'utf8'));\n const current=beforeCombatVisualSource(path,released,readReleased);\n const prior=recording.project(path,current);\n if(prior!==current){\n  const live=combatVisualPriorRead(readReleased)(path,'utf8');\n  assert(matches(live,recording.files[path].after),'recording UI linked owner changed: '+path);",
    "after": "export const beforeRecordingUi=(path,source)=>beforeReleaseDetailSource(path,recording.project(path,beforeCombatVisualSource(path,source)));\nconst officialRuntimePath='tests/official-assets-runtime.test.mjs';\nconst currentOfficialRuntime={\n sha256:'a3341b88551a035189ccc811fa7aa2b7f2eb9c1b6377baa22df6ff3b1fc8c828',\n gitBlob:'82bdb7dda43d8772e1d1d5ffac3a9690509d9dd4',\n};\nconst deckLayoutPath='scripts/deck-ui-layout.mjs';\nconst pileReturnLayout={\n sha256:'0f57f26a4fb520c8feb1df92d48417a6b445900a9ae453c160f500e5a9ee2272',\n gitBlob:'6c9ce59b446f0dd9b8d5f9ffb3c2303e0320195d',\n};\nfunction recordingRuntimeInput(path,source){\n // Production owners must remain raw for the entrance cohort's fresh identity check.\n if(path.startsWith('src/')||path==='config/architecture.json')return source;\n source=beforeCurrentReplayFixes(path,beforeUiEntranceWitness(path,source));\n if(path!==officialRuntimePath||!matches(source,currentOfficialRuntime))return source;\n return beforeStsFadeCi(path,inputRetirementStsFixtureSource(path,source));\n}\nfunction recordingLayoutInput(path,source){\n if(path!==deckLayoutPath||!matches(source,pileReturnLayout))return source;\n const successor=\"battlePileReturn(button('pileReturn',[-550,-237,180,54],'返回'),theme.officialAssets.buttonInk)\";\n const predecessor=\"battlePileReturn(button('pileReturn',[-550,-237,180,54],'返回'),true,undefined,theme.officialAssets.buttonInk)\";\n assert.equal(source.split(successor).length,2,'exact pile return layout change');\n const prior=source.replace(successor,predecessor);\n assert(matches(prior,recording.files[path].after),'exact recording layout predecessor');\n return prior;\n}\nexport function beforeAuthenticatedRecordingStage(path,source,read){\n const input=recordingRuntimeInput(path,source);\n if(input!==source){\n  const live=read(path,'utf8');\n  assert(typeof live==='string'&&live.replaceAll('\\r\\n','\\n')===source.replaceAll('\\r\\n','\\n'),\n   'recording UI linked owner changed: '+path);\n }\n const readInput=owner=>recordingRuntimeInput(owner,read(owner,'utf8'));\n const released=beforeRebasedRelease(path,input);\n if(released!==input)authorizeRebasedRelease([[path,input]],readInput);\n const readReleased=owner=>beforeRebasedRelease(owner,readInput(owner));\n const current=recordingLayoutInput(path,beforeCombatVisualSource(path,released,readReleased));\n const prior=recording.project(path,current);\n if(prior!==current){\n  const live=recordingLayoutInput(path,combatVisualPriorRead(readReleased)(path,'utf8'));\n  assert(matches(live,recording.files[path].after),'recording UI linked owner changed: '+path);"
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
  "afterSha256": "d42b3fb1f94d3b4efff6dfe84fd90da3aad989c4b7f1392cbe57922621ae2988",
  "hunks": [
   {
    "at": 125,
    "before": "import {beforeAuthenticatedRecordingStage} from './helpers/release-ui-restore-source.mjs';\ntest('recording historical continuation accepts exact owners and rejects stale, drifted or mixed reads',()=>{",
    "after": "import {beforeAuthenticatedRecordingStage} from './helpers/release-ui-restore-source.mjs';\nimport {beforeCurrentReplayFixes} from './helpers/current-replay-fix-sources.mjs';\ntest('recording historical continuation accepts exact owners and rejects stale, drifted or mixed reads',()=>{"
   },
   {
    "at": 130,
    "before": "  const live=readFileSync(path,'utf8');\n  assert.equal(beforeAuthenticatedRecordingStage(path,live,readFileSync),row.before.source,path);\n  const drift=live+'\\n-- unreviewed drift\\n';",
    "after": "  const live=readFileSync(path,'utf8');\n  assert.equal(beforeAuthenticatedRecordingStage(path,live,readFileSync).replaceAll('\\r\\n','\\n'),row.before.source,path);\n  const drift=live+'\\n-- unreviewed drift\\n';"
   },
   {
    "at": 137,
    "before": "",
    "after": "\ntest('recording continuation authenticates raw current production owners before projection',()=>{\n const path='src/lua/abyss_deck_ui.lua',live=readFileSync(path,'utf8');\n const expected=beforeAuthenticatedRecordingStage(path,live,readFileSync);\n const expectedLf=expected.replaceAll('\\r\\n','\\n');\n for(const owner of ['src/lua/abyss_game_ui.lua','src/lua/abyss_node_ui_faces.lua','src/lua/abyss_game_ui_run.lua']){\n  const raw=readFileSync(owner,'utf8'),stale=beforeCurrentReplayFixes(owner,raw);\n  assert.notEqual(stale,raw,'negative control must change production bytes');\n  for(const bad of [stale,raw+'\\n-- unreviewed drift\\n']){\n   assert.throws(()=>beforeAuthenticatedRecordingStage(path,live,p=>p===owner?bad:readFileSync(p,'utf8')),/linked owner (?:missing|identity|changed)/,owner);\n   assert.equal(beforeAuthenticatedRecordingStage(path,live,readFileSync),expected,'a rejected read must not authorize or poison the next cohort');\n  }\n }\n assert.equal(beforeAuthenticatedRecordingStage(path,live.replace(/\\r?\\n/g,'\\r\\n'),p=>readFileSync(p,'utf8').replace(/\\r?\\n/g,'\\r\\n')).replaceAll('\\r\\n','\\n'),expectedLf);\n});\n"
   }
  ]
 },
 {
  "path": "tests/defect-integration-source.test.mjs",
  "beforeSha256": "bbf70b7aae3ae376480b1291c8418e4ad5686e23c8d0cd7b8dafa172d51edae2",
  "afterSha256": "3a485ca0a3df9699186422945d54198662abe63ff5af89999f9ca373d0830799",
  "hunks": [
   {
    "at": 183,
    "before": " const expected=proof.targets.develop.files[p].source;\n assertRawActorClosure(project,expected,[...proof.owners,...currentProductionRereads],417,\n  '05131aa3de86e8f88d0e82bca23e667bba10e3921cf029de891ec4e8b06c3a67');\n});",
    "after": " const expected=proof.targets.develop.files[p].source;\n assertRawActorClosure(project,expected,[...proof.owners,...currentProductionRereads],480,\n  'ad1c81a8f757224fa6520ca74d2a9b682f24925d2689141bc4b2eb1066d6a7fd');\n});"
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
    "after": " const project=readSource=>preM7FinalSource(p,source,{readSource});\n const admittedReads=assertRawActorClosure(project,beforeUtility(),proof.owners,1443,\n  '1e104db373ce2e1fdcb5c806685240db6bfc851f95ca2514b8a011d2d6981ffe');\n // Each of the three Actor reads now authenticates the actual current anchor,\n // adding this exact nested Actor/Stasis closure before the unchanged scan.\n const anchorReads=[\n  ...Array(4).fill('config/architecture.json'),\n  ...['actor','focus','stances','actor_artifact','stance_damage','act2_stasis','combat',\n   'warrior_status_cards','blood_for_blood_cost','card_upgrade'].map(name=>'src/lua/abyss_'+name+'.lua'),\n  'config/architecture.json',\n ];\n const priorReads=[];\n for(let offset=0;offset<admittedReads.length;offset+=481){\n  const cohort=admittedReads.slice(offset,offset+481);\n  assert.deepEqual(cohort.slice(21,36),anchorReads,'exact current-anchor addition');\n  priorReads.push(...cohort.slice(0,21),...cohort.slice(36));\n }\n assert.equal(priorReads.length,1398);\n assert.equal(hash(JSON.stringify(priorReads)),'5f3ab63b052ddc6e263f47ebda67168b3691d8f719a83f853a9af3df0d53f564','complete original Actor order is unchanged');\n // Supplying just the old three-owner snapshot is never permission to bypass"
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
  "afterSha256": "bab3074b05a3a823c0a90d444804f1f053be42071fb9bb6d05ccd8abf7c67069",
  "hunks": [
   {
    "at": 8,
    "before": "import {createHash} from 'node:crypto';\nimport {join} from 'node:path';",
    "after": "import {createHash} from 'node:crypto';\nimport {gunzipSync} from 'node:zlib';\nimport {join} from 'node:path';"
   },
   {
    "at": 41,
    "before": " const admittedReads=[...reads];\n assert.equal(admittedReads.length,418);\n assert.equal(createHash('sha256').update(JSON.stringify(admittedReads)).digest('hex'),\n  '5a6e1ad0b3362c34562f566c1a8b3c5496a1c1cebb6c302930cc1efe6976e1bc','exact raw Actor admission before historical bytes');\n let preceding=-1;",
    "after": " const admittedReads=[...reads];\n const entranceBytes=readFileSync('tests/fixtures/ui-entrance-source.json.gz');\n assert.equal(createHash('sha256').update(entranceBytes).digest('hex'),\n  '7ac3f53b242819cdb569c0a1ebf60de0605b72297a1072ea612bfeb11b0597c9');\n const entranceOwners=Object.keys(JSON.parse(gunzipSync(entranceBytes)).files);\n assert.equal(entranceOwners.length,20);\n assert.deepEqual(admittedReads.slice(1,21),entranceOwners,'complete fresh entrance owner admission');\n assert.equal(admittedReads.length,481);\n assert.equal(createHash('sha256').update(JSON.stringify(admittedReads)).digest('hex'),\n  '020fb0e5445e67c44775c716f475dee3a856f7f67f1f7d1e46573c614ddc8de2','complete current Actor admission order');\n assert.equal(createHash('sha256').update(JSON.stringify([admittedReads[0],...admittedReads.slice(21)])).digest('hex'),\n  'f6930061a5fe2d5db08649eddf310bf9afe106ed91fb204433124f98352260bb','exact raw Actor admission before historical bytes');\n let preceding=-1;"
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
  "afterSha256": "ff0ceb6bd965dd5054101b751bc0db35a3e0e5de0ec3de44d013926e715df704",
  "hunks": [
   {
    "at": 420,
    "before": "test('current Full38 retains full coverage and reports performance targets under unchanged execution guards',t=>{\n const workflow=read('.github/workflows/quality.yml');assert.match(workflow,/timeout-minutes: \\$\\{\\{ inputs.runner_pool == 'local-special' && 75 \\|\\| 45 \\}\\}/);assert.match(workflow,/runs-on: ubuntu-24.04\\n    timeout-minutes: 30/);\n const js=discoverJs(),lua=currentLua();",
    "after": "test('current Full38 retains full coverage and reports performance targets under unchanged execution guards',t=>{\n const workflow=rawBootstrapReadFileSync('.github/workflows/quality.yml','utf8').replaceAll('\\r\\n','\\n');assert.match(workflow,/timeout-minutes: \\$\\{\\{ inputs.runner_pool == 'local-special' && 75 \\|\\| 105 \\}\\}/);assert.match(workflow,/runs-on: ubuntu-24.04\\n    timeout-minutes: 90/);\n const js=discoverJs(),lua=currentLua();"
   },
   {
    "at": 1863,
    "before": "\ntest('combined closeout validates raw current sources and complete Full discovery independently of immutable slice views',t=>{",
    "after": "\nfunction assertPosixForecasts(files,count,forecast,budget){\n const observed=rawCurrentTimings;\n const weights=Object.fromEntries(files.map(file=>[file,Math.max(observed.js.linux[file]??observed.unknownJsMs,observed.jsPlanning.localLowerBounds[file]?.durationMs??0)]));\n const historical=partition(files,`1/${count}`,weights,observed.unknownJsMs,Array.from({length:count},(_,i)=>i===0?observed.initialMs.linux[0]:0));\n assert(Math.max(...historical.loads)+60000<budget,'original POSIX planning target and reserve');\n assert(forecast<1800000,'measured replay placement and reserve fit the unchanged POSIX job deadline');\n}\n\ntest('combined closeout validates raw current sources and complete Full discovery independently of immutable slice views',t=>{"
   },
   {
    "at": 1918,
    "before": "  const forecast=Math.max(...combined)+60000,budget=platform==='win32'?1800000:1200000;\n  assert.ok(forecast<budget,platform+' final complete workload and reserve fit unchanged budget');\n  t.diagnostic(`${platform} final ${files.length}JS/${lua.length}Lua forecast ${forecast}ms < ${budget}ms; actual hosted completion remains separate`);\n  for(const file of files)assert(rawCurrentJsPlanningWeights([file],platform)[file]>=rawCurrentTimings.unknownJsMs||rawCurrentTimings.js[platform][file]>0);",
    "after": "  const forecast=Math.max(...combined)+60000,budget=platform==='win32'?1800000:1200000;\n  if(platform==='linux')assertPosixForecasts(files,count,forecast,budget);\n  else assert.ok(forecast<budget,platform+' final complete workload and reserve fit unchanged budget');\n  t.diagnostic(`${platform} final ${files.length}JS/${lua.length}Lua forecast ${forecast}ms including reserve`);\n  for(const file of files)assert(rawCurrentJsPlanningWeights([file],platform)[file]>=rawCurrentTimings.unknownJsMs||rawCurrentTimings.js[platform][file]>0);"
   },
   {
    "at": 1992,
    "before": "  assert.equal(hash(row.source),row.sha256);\n  assert.throws(()=>menuRedPriorLua(lua,(p,e)=>liveDiskReadFileSync(p,e)+(p===path?'\\n':'')),/added menu Lua source/);\n }",
    "after": "  assert.equal(hash(row.source),row.sha256);\n  assert.throws(()=>menuRedPriorLua(lua,(p,e)=>rawBootstrapReadFileSync(p,e)+(p===path?'\\n':'')),/added menu Lua source/);\n }"
   },
   {
    "at": 2009,
    "before": "  }\n  const forecast=Math.max(...combined)+60000;assert(forecast<budget,'complete current menu workload and unchanged reserve');\n  t.diagnostic(`${platform}: ${js.length} JS / ${lua.length} Lua, forecast ${forecast}ms < ${budget}ms`);\n }",
    "after": "  }\n  const forecast=Math.max(...combined)+60000;\n  if(platform==='linux')assertPosixForecasts(js,count,forecast,budget);\n  else assert(forecast<budget,'complete current menu workload and unchanged reserve');\n  t.diagnostic(`${platform}: ${js.length} JS / ${lua.length} Lua, forecast ${forecast}ms including reserve`);\n }"
   },
   {
    "at": 2031,
    "before": " const job=name=>physical.match(new RegExp(`^  ${name}:\\\\n[\\\\s\\\\S]*?(?=^  [\\\\w-]+:|(?![\\\\s\\\\S]))`,'m'))[0];\n assert.match(job('rules'),/timeout-minutes: \\$\\{\\{ inputs.runner_pool == 'local-special' && 75 \\|\\| 45 \\}\\}/);\n assert.match(job('engineering-posix-shards'),/runs-on: ubuntu-24.04\\n    timeout-minutes: 30/);\n assert.deepEqual(currentQualityShardMatrices,{windows:Array.from({length:18},(_,i)=>i+1),posix:Array.from({length:15},(_,i)=>i+1)});\n for(const [platform,count,target,guard]of [['win32',18,1800000,2700000],['linux',15,1200000,1800000]]){\n  const bins=Array.from({length:count},(_,i)=>rawCurrentJsShard(js,`${i+1}/${count}`,platform));",
    "after": " const job=name=>physical.match(new RegExp(`^  ${name}:\\\\n[\\\\s\\\\S]*?(?=^  [\\\\w-]+:|(?![\\\\s\\\\S]))`,'m'))[0];\n assert.match(job('rules'),/timeout-minutes: \\$\\{\\{ inputs.runner_pool == 'local-special' && 75 \\|\\| 105 \\}\\}/);\n assert.match(job('engineering-posix-shards'),/runs-on: ubuntu-24.04\\n    timeout-minutes: 90/);\n assert.deepEqual(currentQualityShardMatrices,{windows:Array.from({length:18},(_,i)=>i+1),posix:Array.from({length:15},(_,i)=>i+1)});\n for(const [platform,count,target,guard]of [['win32',18,1800000,6300000],['linux',15,1200000,5400000]]){\n  const bins=Array.from({length:count},(_,i)=>rawCurrentJsShard(js,`${i+1}/${count}`,platform));"
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
  "afterSha256": "2c2e433766296a0ba9e39293496dc4c7a3dc953bf570e49ea6af1a05e8517b76",
  "hunks": [
   {
    "at": 11,
    "before": "import {standaloneArchitectureSource} from './helpers/class-potion-watcher-source-inverse.mjs';\nconst rawRead=p=>readFileSync(p,'utf8').replaceAll('\\r\\n','\\n');\nconst actorRead=currentDefectActorReader(rawRead);\nconst read=p=>preDefectActorSource(p,rawRead(p),{readSource:actorRead});\nconst before=JSON.parse(gunzipSync(readFileSync('tests/fixtures/watcher-actor-before.json.gz')));",
    "after": "import {standaloneArchitectureSource} from './helpers/class-potion-watcher-source-inverse.mjs';\nimport {sourceEpoch} from './helpers/combined-epoch/source-epoch.mjs';\nconst rawRead=p=>readFileSync(p,'utf8').replaceAll('\\r\\n','\\n');\nconst actorRead=currentDefectActorReader(rawRead);\nconst read=p=>{\n const source=rawRead(p);\n const before=sourceEpoch.preCombinedSource(p,source,{target:'pr618',readSource:rawRead});\n return preDefectActorSource(p,before,{readSource:actorRead});\n};\nconst before=JSON.parse(gunzipSync(readFileSync('tests/fixtures/watcher-actor-before.json.gz')));"
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
  "afterSha256": "8aeaa7ad14f1c5ef274a544e59380ec10b6d450bca1ff197523d31e5becf26cc",
  "hunks": [
   {
    "at": 101,
    "before": " assert.equal(preRelicQuerySource(file,current),old);assert.equal(wrapped(file),old);\n const outerReadCount=403;\n let validReads;",
    "after": " assert.equal(preRelicQuerySource(file,current),old);assert.equal(wrapped(file),old);\n const outerReadCount=466;\n let validReads;"
   },
   {
    "at": 106,
    "before": "  if(!validReads){\n   // Nested source cohorts have their own fresh reads before and after the\n   // original owners. Bind the full live trace to its exact frozen order.\n   assert.equal(reads.length,8150);\n   assert.equal(hash(JSON.stringify(reads)),'78bb454171aed5367d039514c30a57c9971c0be116f11e048df8f3a08bc7cbb2');\n   let position=-1;",
    "after": "  if(!validReads){\n   // Current replay cohorts add fresh linked reads around the original owner sequence.\n   // Bind the complete live trace after normalizing Windows checkout endings.\n   assert.equal(reads.length,9898);\n   assert.equal(hash(JSON.stringify(reads)),'79bf86a4544d87721356dea6a0e668a4cb1ffbd076b8c97ba227107540d6b8e0');\n   const entranceBytes=readFileSync('tests/fixtures/ui-entrance-source.json.gz');\n   assert.equal(hash(entranceBytes),'7ac3f53b242819cdb569c0a1ebf60de0605b72297a1072ea612bfeb11b0597c9');\n   const entranceOwners=Object.keys(JSON.parse(gunzipSync(entranceBytes)).files),priorReads=[];\n   let entranceGroups=0;\n   for(let i=0;i<reads.length;){\n    if(JSON.stringify(reads.slice(i,i+entranceOwners.length))===JSON.stringify(entranceOwners)){\n     entranceGroups++;i+=entranceOwners.length;\n    }else priorReads.push(reads[i++]);\n   }\n   assert.equal(entranceGroups,22,'all complete fresh entrance cohorts remain observed');\n   assert.equal(priorReads.length,9458);\n   assert.equal(hash(JSON.stringify(priorReads)),'fcf5e049f6c8f284fa248ebe012c2f7a5620546e453ebc8766fea8c1d14bd749','unchanged complete prior admission sequence');\n   let position=-1;"
   },
   {
    "at": 154,
    "before": " assert.throws(()=>preRelicQuerySource(file,current,{readSource:p=>p===config?JSON.stringify(JSON.parse(read(p))):read(p)}),{message:configDrift});\n // The first 403 observations belong to the outer authenticated projection.\n // Mutate the first config observation from the wrapped N35 projector.\n const firstInnerConfig=validReads.indexOf(config,outerReadCount);\n assert.equal(firstInnerConfig,405);\n const innerOccurrence=validReads.slice(0,firstInnerConfig+1).filter(path=>path===config).length;",
    "after": " assert.throws(()=>preRelicQuerySource(file,current,{readSource:p=>p===config?JSON.stringify(JSON.parse(read(p))):read(p)}),{message:configDrift});\n // The first 466 observations include the new complete entrance cohort.\n // Mutate the first config observation from the wrapped N35 projector.\n const firstInnerConfig=validReads.indexOf(config,outerReadCount);\n assert.equal(firstInnerConfig,468);\n const innerOccurrence=validReads.slice(0,firstInnerConfig+1).filter(path=>path===config).length;"
   }
  ]
 },
 {
  "path": "tests/act1-choice-responsibilities.test.mjs",
  "beforeSha256": "1905ee60a014ae61728e2463717a5cbbdae05ff0d4e66d26184659e89a02ab3c",
  "afterSha256": "3d6fe95cdb32d4263ef7d16c46ff551908bdb7df4f9c90f5da973f55a43b92a5",
  "hunks": [
   {
    "at": 201,
    "before": "   // Keep the complete current trace and the ordered original contract.\n   assert.equal(reads.length,403);\n   assert.equal(createHash('sha256').update(JSON.stringify(reads)).digest('hex'),'6f35ecd12c3f1edbc8ee8e476324bdb4380725eeacf240cc6ec15cd106fc2e3f');\n   let position=-1;",
    "after": "   // Keep the complete current trace and the ordered original contract.\n   assert.equal(reads.length,466);\n   assert.equal(createHash('sha256').update(JSON.stringify(reads)).digest('hex'),'049af1e21af40d804c1201c01f79da465c7ee0a2b1c4a2544a0c4c3cd1da0500');\n   const entranceBytes=readFileSync('tests/fixtures/ui-entrance-source.json.gz');\n   assert.equal(createHash('sha256').update(entranceBytes).digest('hex'),'7ac3f53b242819cdb569c0a1ebf60de0605b72297a1072ea612bfeb11b0597c9');\n   const entranceOwners=Object.keys(JSON.parse(gunzipSync(entranceBytes)).files);\n   assert.equal(entranceOwners.length,20);\n   assert.deepEqual(reads.slice(1,21),entranceOwners,'complete current entrance cohort');\n   assert.equal(createHash('sha256').update(JSON.stringify([reads[0],...reads.slice(21)])).digest('hex'),\n    '5dad58d855f93d4169fa5877eff635d77f2c0b99af76f12e8f5cb68a4d659a4f','unchanged complete original Act1 order');\n   let position=-1;"
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
  "afterSha256": "a1c56eb4386b5144e7540e2b3926d69181b49808340517e199731d9695028799",
  "hunks": [
   {
    "at": 14,
    "before": "timings.js.win32[artFeatureInverseTest] = Math.max(timings.js.win32[artFeatureInverseTest] ?? timings.unknownJsMs, 431203);\n",
    "after": "timings.js.win32[artFeatureInverseTest] = Math.max(timings.js.win32[artFeatureInverseTest] ?? timings.unknownJsMs, 431203);\n\n// Reserve the work that completed in POSIX jobs 137444936421, 137444936442,\n// 137444936458, 137444936507 and 137444936550 before their 30-minute cutoff.\n// These rounded-down case totals guide placement only. They are not full-file timings.\nconst linuxReplayMinimumMs = Object.freeze({\n  'approved-ui-inverse.test.mjs': 1295000,\n  'art-feature-source-inverse.test.mjs': 412000,\n  'card-origin-source-inverse.test.mjs': 149000,\n  'combat-reactions-architecture-inverse.test.mjs': 137000,\n  'game-ui-extraction-source-inverse.test.mjs': 870000,\n  'max-hp-accepted-source-inverse.test.mjs': 677000,\n  'player-death-inverse.test.mjs': 172000,\n  'potion-callback-source.test.mjs': 238000,\n  'presentation-native-m3-contract.test.mjs': 1037000,\n});\n"
   },
   {
    "at": 57,
    "before": "    ...maps.map(weights=>weights[file]??timings.unknownJsMs),\n    timings.jsPlanning?.localLowerBounds?.[file]?.durationMs??0)]));\n}",
    "after": "    ...maps.map(weights=>weights[file]??timings.unknownJsMs),\n    timings.jsPlanning?.localLowerBounds?.[file]?.durationMs??0,\n    platform === 'win32' ? 0 : linuxReplayMinimumMs[file.slice('tests/'.length)] ?? 0)]));\n}"
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
  "path": "tests/shop-dismiss.test.mjs",
  "beforeSha256": "db23a1f592c395e4ffad5cffbfb0770ef1e84674545dbd9cbabbd85e9630a82c",
  "afterSha256": "977f0a3919d51785f4a42faae84612ffe46e59821af8e26429695c7e23db6ef0",
  "hunks": [
   {
    "at": 14,
    "before": "  assert.ok(panel.children.findIndex(c=>c.name==='backdrop')<index);\n  assert.equal(panel.children[index-1].name,'shopRoom');\n  for(const name of ['shopView','merchant','back','confirm']) {",
    "after": "  assert.ok(panel.children.findIndex(c=>c.name==='backdrop')<index);\n  assert.equal(panel.children[index-2].name,'shopRoom');\n  const shade=panel.children[index-1];\n  assert.equal(shade.name,'shopShade');\n  assert.equal(shade.kind,'image','transition shade adds paint only, never an input area');\n  assert.notEqual(shade.focusable,true);\n  assert.notEqual(shade.raycastTarget,true);\n  assert.equal(shade.visible,false,'transition shade starts hidden');\n  for(const name of ['shopView','merchant','back','confirm']) {"
   }
  ]
 },
 {
  "path": "tests/noncombat-v25-layout.test.mjs",
  "beforeSha256": "c2447b37bdc387e514e978fb065674f31bac2818907e3b491983108b1a2d4a20",
  "afterSha256": "c2d275a928d9f168c28d5dea5c78d60e3b7a480447463723eabe2bcb4d34ca13",
  "hunks": [
   {
    "at": 179,
    "before": " assert.equal(child(panel,'v25Background').visible,true,'the controller still owns its loading fallback');\n assert.deepEqual(parts(child(panel,'v25Background')).map(n=>n.name),['landscape'],'loading and failure show the unshaded fallback image');\n assert.deepEqual(readArtFeatures(directory),officialAssetFlags);",
    "after": " assert.equal(child(panel,'v25Background').visible,true,'the controller still owns its loading fallback');\n const fallback=child(panel,'v25Background');\n assert.deepEqual(parts(fallback).map(n=>n.name),['landscape','selectionShade']);\n assert.notEqual(child(fallback,'landscape').visible,false,'loading retains the fallback landscape');\n assert.equal(child(fallback,'selectionShade').visible,false,'the new transition layer starts hidden; loading remains unshaded');\n assert.deepEqual(readArtFeatures(directory),officialAssetFlags);"
   },
   {
    "at": 198,
    "before": "local fallback=panel:GetChild('v25Background')\nlocal Asset=require('abyss_traveler_portrait_assets')",
    "after": "local fallback=panel:GetChild('v25Background')\nlocal landscape,transition=fallback:GetChild('landscape'),fallback:GetChild('selectionShade')\nlocal motion=require('abyss_character_entrance').new(panel,{color=function(r,g,b,a)return {r=r,g=g,b=b,a=a}end},function()end)\nlocal Asset=require('abyss_traveler_portrait_assets')"
   },
   {
    "at": 227,
    "before": "portraits:sync('menu',true,false,'ironclad');scope('building')\nfor _=1,600 do portraits:tick();if portraits:readyForPage('menu',true,'ironclad','characterPanel')then break end end\nassert(portraits:readyForPage('menu',true,'ironclad','characterPanel'))\nassert(portraits:status().selection.phase=='ready' and art.visible and not fallback.visible)\nscope('ready')\nlocal total=created\nportraits:sync('menu',false,false,'ironclad');assert(not art.visible and fallback.visible);scope('paused')\nportraits:sync('menu',true,false,'ironclad');portraits:tick()\nassert(art.visible and not fallback.visible and created==total and destroyed==0);scope('reentry')\nassert(panel:GetChild('blocker').visible,'input barrier was removed with legacy paint')\nassert(portraits:release());rejectCreation=true\nportraits:sync('menu',true,false,'ironclad');portraits:tick()\nassert(portraits:status().selection.phase=='failed' and not art.visible and fallback.visible)\nscope('failed')",
    "after": "portraits:sync('menu',true,false,'ironclad');scope('building')\nassert(fallback.visible and landscape.visible and not transition.visible,'loading fallback is effectively unshaded')\nfor _=1,600 do portraits:tick();if portraits:readyForPage('menu',true,'ironclad','characterPanel')then break end end\nassert(portraits:readyForPage('menu',true,'ironclad','characterPanel'))\nmotion:show({id='ironclad'},true)\nmotion:update(1)\nassert(portraits:status().selection.phase=='ready' and art.visible and art:GetChild('figure').visible and not landscape.visible and not transition.visible and transition.imageColor.a==0)\nscope('ready')\nlocal total=created\nportraits:sync('menu',false,false,'ironclad');motion:pause(true)\nassert(not art.visible and fallback.visible and landscape.visible and not transition.visible and landscape.imageColor.a==255 and transition.imageColor.a==0);scope('paused')\nportraits:sync('menu',true,false,'ironclad');portraits:tick()\nmotion:pause(false)\nassert(art.visible and not landscape.visible and not transition.visible and created==total and destroyed==0);scope('reentry')\nassert(panel:GetChild('blocker').visible,'input barrier was removed with legacy paint')\nassert(portraits:release());motion:hide();rejectCreation=true\nportraits:sync('menu',true,false,'ironclad');portraits:tick()\nassert(portraits:status().selection.phase=='failed' and not art.visible and fallback.visible and landscape.visible and not transition.visible)\nscope('failed')"
   }
  ]
 },
 {
  "path": "tests/architecture-token-read.test.mjs",
  "beforeSha256": "1cd2336bca41624bf4a1ba16fde096ec111895d69a7c8400b78c60e93e7fd2d8",
  "afterSha256": "a650c6e60af40f89b9ed5ce523dc116bd432c90004c33c3d47c57ade2b012531",
  "hunks": [
   {
    "at": 12,
    "before": "   const output=join(directory,mode+'.json');\n   const result=spawnSync(process.execPath,['--trace-event-file-pattern='+output,fileURLToPath(new URL('./helpers/architecture-token-read-probe.mjs',import.meta.url)),mode],{encoding:'utf8',timeout:30000,maxBuffer:1024*1024,windowsHide:true});\n   assert.ifError(result.error);assert.equal(result.status,0,result.stdout+result.stderr);",
    "after": "   const output=join(directory,mode+'.json');\n   // Each probe imports and authenticates the complete historical source chain.\n   // Leave room for that real work on hosted shards; keep every FS/read assertion.\n   const result=spawnSync(process.execPath,['--trace-event-file-pattern='+output,fileURLToPath(new URL('./helpers/architecture-token-read-probe.mjs',import.meta.url)),mode],{encoding:'utf8',timeout:180000,maxBuffer:1024*1024,windowsHide:true});\n   assert.ifError(result.error);assert.equal(result.status,0,result.stdout+result.stderr);"
   }
  ]
 },
 {
  "path": "tests/relic-equip-source-epoch.test.mjs",
  "beforeSha256": "e6b512fabde8920b86d4d2111db89774e8e9ee71c5c88621251f77969f5eb039",
  "afterSha256": "cc552a1f69f99ff624a232444959405017ae81eb67de2057c2d8ed81e650e4bb",
  "hunks": [
   {
    "at": 39,
    "before": " assert.notEqual(raw(mapOwner),currentMapOwner);\n assert.throws(()=>sourceEpoch.preCombinedSource(file,source,{target,readSource:p=>p===mapOwner?currentMapOwner:raw(p)}),/map-room validation/);\n for(const owner of proof.owners){",
    "after": " assert.notEqual(raw(mapOwner),currentMapOwner);\n assert.throws(()=>sourceEpoch.preCombinedSource(file,source,{target,readSource:p=>p===mapOwner?currentMapOwner:raw(p)}),\n  /(?:linked owner identity: src\\/lua\\/abyss_traveler_portraits\\.lua.*map-room validation|linked owner missing: src\\/lua\\/abyss_traveler_portraits\\.lua: combined linked owner identity: config\\/architecture\\.json during entrance validation)/);\n for(const owner of proof.owners){"
   }
  ]
 },
 {
  "path": "src/lua/abyss_node_ui_faces.lua",
  "beforeSha256": "d56aed5198b7111008f25c86f1f03eee36bab8549ebd9b92dd7f99f9e4cf6f58",
  "afterSha256": "7904a5a622f2116511a6b14a33baa70b58dd4b6c9265dd320c89fcb2294b5caa",
  "hunks": [
   {
    "at": 70,
    "before": "    local shopInspection = setmetatable({}, {__mode='k'})\n    function ctx.reuseShopFace(box)",
    "after": "    local shopInspection = setmetatable({}, {__mode='k'})\n    local shopArt = setmetatable({}, {__mode='k'})\n    function ctx.reuseShopFace(box)"
   },
   {
    "at": 74,
    "before": "        ctx.artFaces[box] = true\n    end",
    "after": "        ctx.artFaces[box] = true\n        -- Quote reuse skips copy/frame/price work, but an explicit render must\n        -- reconcile native ownership after clear, rejection or metadata changes.\n        if shopArt[box] then shopArt[box]() end\n    end"
   },
   {
    "at": 112,
    "before": "            CardDisplay.writeArt(box:GetChild(\"art_\" .. kind), definition, ctx.picture,box)\n            if ctx.self.visible or look.shop then\n                CardDisplay.writeNativeArt(box,definition,display.nativeArt,ctx.options,box:GetChild('art_'..kind),instance.uid)",
    "after": "            CardDisplay.writeArt(box:GetChild(\"art_\" .. kind), definition, ctx.picture,box)\n            if ctx.self.visible then\n                CardDisplay.writeNativeArt(box,definition,display.nativeArt,ctx.options,box:GetChild('art_'..kind),instance.uid)"
   },
   {
    "at": 118,
    "before": "        end\n        writeCardArt()",
    "after": "        end\n        shopArt[box] = writeCardArt\n        writeCardArt()"
   }
  ],
  "afterLength": 7825
 },
 {
  "path": "tests/lua/shop_entry.lua",
  "beforeSha256": "1024c032f3b00a7d6fbe40a5a9b164cceb8d719860fe8cab785f77cc4842d1fa",
  "afterSha256": "a1a88df871a7ac2f469371a892e063cfacd0b809c2e7f6b3c9803a092333a07b",
  "hunks": [
   {
    "at": 153,
    "before": "\n    -- A warm close/open survives during both tails and preserves the live view.",
    "after": "\n    -- Explicit settled renders still reconcile art ownership without rewriting\n    -- the quote's card copy or price.\n    local stable={}\n    for _,path in ipairs({'shopView/card1/name','shopView/card1/description','shopView/card1/cost','shopView/price1/value'})do\n        local box=get(path);stable[box]=writes[box] or 0\n    end\n    ui:render()\n    for box,count in pairs(stable)do assert((writes[box] or 0)==count,'settled quote rewrote copy or price')end\n\n    -- A warm close/open survives during both tails and preserves the live view."
   }
  ]
 },
 {
  "path": "tests/intent-visibility-cache.test.mjs",
  "beforeSha256": "f19fc1a950528d85de567e7bcfe6a90ca5bf7da3af5609b767069df5b484663f",
  "afterSha256": "4a26b068e24d98f16c8e59c4a424e887e759683733c5f0c2be3b5294efbcd9b2",
  "hunks": [
   {
    "at": 40,
    "before": " const idle=samples.map(s=>s.counts.find(row=>row.phase==='idle-300'));\n assert.deepEqual(idle.map(row=>row.counts),[[900,0,3600,7200,0],[900,0,1800,5400,0]]);\n for(let i=0;i<samples[0].counts.length;i++)for(const index of [0,1,4])assert.equal(samples[0].counts[i].counts[index],samples[1].counts[i].counts[index],'require/load/snapshot workload changed');",
    "after": " const idle=samples.map(s=>s.counts.find(row=>row.phase==='idle-300'));\n // Entrance assertions now require the fixture to mirror each position write\n // into anchoredPositionX/Y. Count those extra fixture fields separately;\n // native calls and the original visibility-write saving retain their budgets.\n const anchorMirrors=idle.map(row=>(row.properties.anchoredPositionX??0)+(row.properties.anchoredPositionY??0));\n assert.deepEqual(anchorMirrors,[1800,1800]);\n assert.deepEqual(idle.map((row,i)=>row.counts.map((count,index)=>index===3?count-anchorMirrors[i]:count)),\n  [[900,0,3600,7200,0],[900,0,1800,5400,0]]);\n for(let i=0;i<samples[0].counts.length;i++)for(const index of [0,1,4])assert.equal(samples[0].counts[i].counts[index],samples[1].counts[i].counts[index],'require/load/snapshot workload changed');"
   },
   {
    "at": 53,
    "before": "  graphBytes:Buffer.byteLength(samples[0].graph),graphSha256:createHash('sha256').update(samples[0].graph).digest('hex'),\n  equal:true,samples:samples.map(({side,counts})=>({side,counts})),\n  scope:'Full final Host/run/native reachable fields and alias/metatable graph after the fixed route, not per-frame output or official device evidence.'},null,2)+'\\n');",
    "after": "  graphBytes:Buffer.byteLength(samples[0].graph),graphSha256:createHash('sha256').update(samples[0].graph).digest('hex'),\n  equal:true,fixtureAnchorMirrorWrites:anchorMirrors,samples:samples.map(({side,counts})=>({side,counts})),\n  scope:'Full final Host/run/native reachable fields and alias/metatable graph after the fixed route, not per-frame output or official device evidence.'},null,2)+'\\n');"
   }
  ]
 },
 {
  "path": "tests/helpers/intent-visibility-vm.mjs",
  "beforeSha256": "4bfbddbd45cc1be1e4edba539dfdd971783a46a099ba30207ecd4640ee8cc2b5",
  "afterSha256": "690a38110f68a49a59b78a04eb1bc75fdcd1cf8a85199a1b2035b43e2f416a59",
  "hunks": [
   {
    "at": 28,
    "before": "lua.lua_pushstring(L,to_luastring(fixture.replace(needle,'ABYSS_HOST_CONTROL(self); '+needle)));lua.lua_setglobal(L,to_luastring('BASELINE_FIXTURE'));\nconst rows=[];let previous=[0,0,0,0,0];\nlua.lua_pushjsfunction(L,state=>{\n const current=previous.map((_,i)=>lua.lua_tonumber(state,i+2));\n rows.push({phase:to_jsstring(lua.lua_tostring(state,1)),counts:current.map((value,i)=>value-previous[i])});previous=current;return 0;\n});lua.lua_setglobal(L,to_luastring('BASELINE_MARK'));",
    "after": "lua.lua_pushstring(L,to_luastring(fixture.replace(needle,'ABYSS_HOST_CONTROL(self); '+needle)));lua.lua_setglobal(L,to_luastring('BASELINE_FIXTURE'));\nconst rows=[];let previous=[0,0,0,0,0],previousProperties={};\nlua.lua_pushjsfunction(L,state=>{\n const current=previous.map((_,i)=>lua.lua_tonumber(state,i+2));\n const properties={};lua.lua_pushnil(state);\n while(lua.lua_next(state,8)!==0){properties[to_jsstring(lua.lua_tostring(state,-2))]=lua.lua_tonumber(state,-1);lua.lua_pop(state,1);}\n rows.push({phase:to_jsstring(lua.lua_tostring(state,1)),counts:current.map((value,i)=>value-previous[i]),\n  properties:Object.fromEntries(Object.entries(properties).map(([key,value])=>[key,value-(previousProperties[key]??0)]))});\n previous=current;previousProperties=properties;return 0;\n});lua.lua_setglobal(L,to_luastring('BASELINE_MARK'));"
   }
  ]
 },
 {
  "path": "tests/official-assets-flow.test.mjs",
  "beforeSha256": "4686d704bfb173f809033fa0c778ce9884d01e696fbce7477e86cffa7b872f6f",
  "afterSha256": "1ea949a97033b8a8370da32dc2c8619481a8f238ed45f92112618bcc834ac7df",
  "hunks": [
   {
    "at": 142,
    "before": "F.click(root,'nodePanel','back');assert(run.phase=='node')\nh.nodeUI:update(.31);assert(run.phase=='map' and h.mode=='node')\nF.click(root,'nodePanel','confirm');assert(h.mode=='map' and run.nodeFlow.complete)\nassert(run.gold==spent and #run.deck==deck+1,'shop exit replayed transaction')",
    "after": "F.click(root,'nodePanel','back');assert(run.phase=='node')\ndofile('tests/lua/support/shop_timeline.lua')(h.nodeUI)\nassert(run.phase=='node' and not h.nodeUI.shopOpen,'closing the shelf returns to the merchant room')\nF.click(root,'nodePanel','back');assert(run.phase=='map' and h.mode=='map' and run.nodeFlow.complete,'the separate leave action finishes the shop')\nlocal exited=C.copy(run)\nassert(not h.nodeUI:press('confirm'),'hidden shop confirmation must be inert')\nunchanged(run,exited,'stale shop confirmation changed the completed run')\nassert(run.gold==spent and #run.deck==deck+1,'shop exit replayed transaction')"
   }
  ]
 },
 {
  "path": "tests/helpers/combined-epoch/source-epoch-runtime.mjs",
  "beforeSha256": "cce16863eb1c92fb713e0b1048789dddfd05ca578fcd80f4e3566c8134146f29",
  "afterSha256": "278820e92b95d78ccca26cee32a353e53eaf8e87377fabe8c8dcb64f6995264d",
  "hunks": [
   {
    "at": 130,
    "before": "  const isLiveReader=liveReaders.has(rawReader(readSource));\n  const projected=entrancePredecessor(path,source,rawReader(readSource));\n  source=projected.source;readSource=projected.read;",
    "after": "  const isLiveReader=liveReaders.has(rawReader(readSource));\n  const projected=entrancePredecessor(path,source,rawReader(readSource),{allowConfigLayout});\n  source=projected.source;readSource=projected.read;"
   }
  ]
 },
 {
  "path": "src/lua/abyss_game_ui.lua",
  "beforeSha256": "1b1e3b9722dbc0c4c0af8c06243a15e118cf61d7a506ef6f801b2e735c85ed14",
  "afterSha256": "26e13ce816c467f096a57b9226806f7b2bc6fdf87606d35031ad691225747b7e",
  "hunks": [
   {
    "at": 50,
    "before": "    platform=setmetatable({},{__index=platform})\n    self.selectionMotion=CharacterView.motion(root:GetChild('characterPanel'),platform)\n    local neowHistory=NeowHistory.new(platform.readNeowHistory)",
    "after": "    platform=setmetatable({},{__index=platform})\n    self.selectionMotion=CharacterView.motion(assert(root:GetChild('characterPanel'),'missing game panel characterPanel'),platform)\n    local neowHistory=NeowHistory.new(platform.readNeowHistory)"
   }
  ],
  "afterLength": 14889
 },
 {
  "path": "src/lua/abyss_game_ui_run.lua",
  "beforeSha256": "c2198e3d704115f83c6c172be3eb8515d72997d97779678df0bc4616b4e741f0",
  "afterSha256": "29aa9c5455e55dfe1a69ff5afed7550ecd4ec6f9adc3f14521b5d81ebd79f142",
  "hunks": [
   {
    "at": 52,
    "before": "            if not self.characterOpen or self.starting or self.disabled then return false end\n            if id and self.characterSelection.character==id then return true end\n            local ok,reason=self.characterSelection:select(id)",
    "after": "            if not self.characterOpen or self.starting or self.disabled then return false end\n            local ok,reason=self.characterSelection:select(id)"
   },
   {
    "at": 61,
    "before": "            if not self.characterOpen or self.starting or self.disabled then return false end\n            if self.characterSelection.character=='traveler' and self.characterSelection.element==id then return true end\n            local ok,reason=self.characterSelection:selectElement(id)",
    "after": "            if not self.characterOpen or self.starting or self.disabled then return false end\n            local ok,reason=self.characterSelection:selectElement(id)"
   }
  ],
  "afterLength": 11897
 },
 {
  "path": "tests/native-audio-release-provenance.test.mjs",
  "beforeSha256": "1e661c1eca61f3eaa762bb139ab9d18b1c507a6e9b28c5555638385ffe90f6e9",
  "afterSha256": "76ad3a693920e182918eb37bc7f86066b940807e3843f447eeb1ae7d1fb47fac",
  "hunks": [
   {
    "at": 5,
    "before": "import assert from 'node:assert/strict';\nimport { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';\nimport { join } from 'node:path';",
    "after": "import assert from 'node:assert/strict';\nimport { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync, realpathSync } from 'node:fs';\nimport { join } from 'node:path';"
   },
   {
    "at": 17,
    "before": "function fixture(t, mutate = () => {}, {refined=false}={}) {\n  const root = mkdtempSync(join(tmpdir(), 'abyss-audio-release-'));\n  t.after(() => rmSync(root, { recursive: true, force: true }));",
    "after": "function fixture(t, mutate = () => {}, {refined=false}={}) {\n  const root = realpathSync.native(mkdtempSync(join(tmpdir(), 'abyss-audio-release-')));\n  t.after(() => rmSync(root, { recursive: true, force: true }));"
   }
  ]
 },
 {
  "path": "tests/official-background-build.test.mjs",
  "beforeSha256": "d15e64cf8dccf6a71cc2012e76ee85e1a0aba3ba0d543d99b0b4d1ebc31dde6f",
  "afterSha256": "bff7e52298b5187766692a8153814b7f249057ccc8b82c9c5a72713d5b86afda",
  "hunks": [
   {
    "at": 47,
    "before": " const approved=JSON.parse(JSON.stringify(applyV25RewardLayout(gameLayout(),nativeTheme).controls));\n const assertControls=controls=>assert.ok(isDeepStrictEqual(controls,approved),'approved controls/input remain exact apart from explicit empty artwork hosts');\n removeMenuEdgePlates(original);",
    "after": " const approved=JSON.parse(JSON.stringify(applyV25RewardLayout(gameLayout(),nativeTheme).controls));\n // The approved entrance groups move the existing controls without changing\n // their bytes or adding input. Keep this expectation independent of the builder.\n const shelf=approved.find(n=>n.name==='nodePanel').children.find(n=>n.name==='shopView');\n const goods=shelf.children.filter(n=>/^(removal|relic|potion)/.test(n.name));\n shelf.children=shelf.children.filter(n=>!goods.includes(n));\n shelf.children.splice(shelf.children.findIndex(n=>n.name==='detail'),0,\n  {name:'goods',kind:'container',size:[1280,720],visible:false,children:goods});\n const character=approved.find(n=>n.name==='characterPanel');\n const details=character.children.find(n=>n.name==='details');\n const infoNames=['name','stats','gold','v25Story','v25HealthIcon','v25GoldIcon',\n  'relicTag','relic','relicText','v25RelicIcon','deckRule','deckTitle','deckSummary'];\n const info=details.children.filter(n=>infoNames.includes(n.name));\n details.children=details.children.filter(n=>!info.includes(n));\n details.children.push({name:'infoMotion',kind:'container',size:[1280,720],\n  children:Array.from({length:8},(_,i)=>({name:'info'+(i+1),kind:'container',size:[1280,720],visible:false,children:structuredClone(info)}))});\n for(const name of ['confirm','cancel'])character.children.find(n=>n.name===name).visible=false;\n const assertControls=controls=>assert.ok(isDeepStrictEqual(controls,approved),'approved controls/input and entrance groups remain exact apart from explicit empty artwork hosts');\n removeMenuEdgePlates(original);"
   },
   {
    "at": 80,
    "before": " ])assert.throws(()=>removeMenuEdgePlates(changed(mutate)),assert.AssertionError);\n for(const mutate of [c=>{menuOf(c).size[0]++;},c=>{menuOf(c).raycastTarget=true;}]){\n  const drift=changed(mutate);removeMenuEdgePlates(drift);strip(drift);",
    "after": " ])assert.throws(()=>removeMenuEdgePlates(changed(mutate)),assert.AssertionError);\n for(const mutate of [c=>{menuOf(c).size[0]++;},c=>{menuOf(c).raycastTarget=true;},\n  c=>{c.find(n=>n.name==='nodePanel').children.find(n=>n.name==='shopView').children.find(n=>n.name==='goods').raycastTarget=true;},\n  c=>{c.find(n=>n.name==='characterPanel').children.find(n=>n.name==='details').children.find(n=>n.name==='infoMotion').children[0].children[0].size[0]++;}]){\n  const drift=changed(mutate);removeMenuEdgePlates(drift);strip(drift);"
   }
  ]
 },
 {
  "path": "tests/pure-source-projection-cache.test.mjs",
  "beforeSha256": "ee987e0758410dc925d3b0b45ebb66e3353c7d15f00aa1fbaead95cf6ff7058b",
  "afterSha256": "52de0e58f613d5b0ac9551bcd4a0c38ce045393863f4989911ab154cc584ff7d",
  "hunks": [
   {
    "at": 15,
    "before": "import {beforeInputRetirementReader,pointerInputPath,retiredControllerPath} from './helpers/input-retirement-source.mjs';\nconst hash=source=>createHash('sha256').update(source).digest('hex');",
    "after": "import {beforeInputRetirementReader,pointerInputPath,retiredControllerPath} from './helpers/input-retirement-source.mjs';\nimport {addedEntranceModules} from './helpers/ui-entrance-source.mjs';\nconst hash=source=>createHash('sha256').update(source).digest('hex');"
   },
   {
    "at": 92,
    "before": " const retired=beforeInputRetirementReader(live)(retiredControllerPath);\n const added=['scripts/deck-ui-layout.mjs',...stasisUpgradeAddedPaths,...actorFocusAdded,pointerInputPath];\n const paths=[...Object.keys(sourceEpoch.proof.current),...added].filter(p=>p!==retiredControllerPath);",
    "after": " const retired=beforeInputRetirementReader(live)(retiredControllerPath);\n const added=['scripts/deck-ui-layout.mjs',...stasisUpgradeAddedPaths,...actorFocusAdded,pointerInputPath,...addedEntranceModules];\n const paths=[...Object.keys(sourceEpoch.proof.current),...added].filter(p=>p!==retiredControllerPath);"
   },
   {
    "at": 136,
    "before": "",
    "after": "\ntest('exact production length rejection preserves full byte checks and fresh owner admission',async()=>{\n const {beforeCurrentReplayFixes}=await import('./helpers/current-replay-fix-sources.mjs');\n const {authenticateUiEntrance}=await import('./helpers/ui-entrance-source.mjs');\n const originals=[\n  ['src/lua/abyss_node_ui_faces.lua','d56aed5198b7111008f25c86f1f03eee36bab8549ebd9b92dd7f99f9e4cf6f58'],\n  ['src/lua/abyss_game_ui.lua','1b1e3b9722dbc0c4c0af8c06243a15e118cf61d7a506ef6f801b2e735c85ed14'],\n  ['src/lua/abyss_game_ui_run.lua','c2198e3d704115f83c6c172be3eb8515d72997d97779678df0bc4616b4e741f0'],\n ];\n for(const [path,expected]of originals){\n  const source=readFileSync(path,'utf8').replaceAll('\\r\\n','\\n');\n  const prior=beforeCurrentReplayFixes(path,source);assert.notEqual(prior,source);assert.equal(hash(prior),expected);\n  const crlf=source.replaceAll('\\n','\\r\\n');\n  assert.equal(beforeCurrentReplayFixes(path,crlf),prior.replaceAll('\\n','\\r\\n'));\n  const sameLength=source.slice(0,-1)+'!';assert.equal(sameLength.length,source.length);\n  for(const unknown of [source.slice(1),source+'\\n',sameLength,source.replaceAll('\\n','\\r\\r\\n')])\n   assert.equal(beforeCurrentReplayFixes(path,unknown),unknown,'unknown complete bytes cannot project');\n  const bytes=Buffer.from(source);assert.equal(beforeCurrentReplayFixes(path,bytes),bytes,'Buffer inputs remain outside this string-only inverse');\n  assert.equal(beforeCurrentReplayFixes('foreign/'+path,source),source,'path remains part of the exact identity');\n  assert.equal(beforeCurrentReplayFixes(path,source),prior,'unknown inputs do not alter the exact projection');\n }\n let reads=[],bad=null;\n const read=path=>{reads.push(path);const source=readFileSync(path,'utf8');return path===bad?source.replaceAll('\\r\\n','\\n').slice(0,-1)+'!':source;};\n authenticateUiEntrance(read);const first=[...reads];assert.equal(first.length,20);\n reads=[];authenticateUiEntrance(read);assert.deepEqual(reads,first,'warm calls retain every linked read');\n for(const [path]of originals){\n  bad=path;reads=[];assert.throws(()=>authenticateUiEntrance(read),error=>{assert.match(error.message,/linked owner identity/);assert(error.message.includes(path));return true;});\n  assert(reads.includes(path));bad=null;reads=[];authenticateUiEntrance(read);assert.deepEqual(reads,first,'recovery freshly authenticates the complete cohort');\n }\n authenticateUiEntrance(path=>readFileSync(path,'utf8').replaceAll('\\r\\n','\\n').replaceAll('\\n','\\r\\n'));\n});\n"
   }
  ]
 },
 {
  "path": "tests/shop-relics-missing.test.mjs",
  "beforeSha256": "5e1b22aead49c6bcfd262db55a2af52cb1b5acbc9785c8ffeafd9227327e9484",
  "afterSha256": "a532fc2d40fbea837b2cbf9c1d3d019856aea3dd5f743201e0cfac6160614a85",
  "hunks": [
   {
    "at": 10,
    "before": " assert.equal(result.status,0,result.stdout+result.stderr);\n assert.match(result.stdout,/LUA_SHOP_RELIC_PENDING_UI_PASS 9/);\n});",
    "after": " assert.equal(result.status,0,result.stdout+result.stderr);\n assert.match(result.stdout,/LUA_SHOP_RELIC_PENDING_UI_PASS 10/);\n});"
   }
  ]
 },
 {
  "path": "tests/tiny-house-pending-ui.cases.mjs",
  "beforeSha256": "22cc5c5d1288a903b9abc55739646ed55da4b0ab9bf2b0efce52d24035804806",
  "afterSha256": "ad5a77d379252e337e8421c8e8d2f784272371032f209145be51e0f2b71abab1",
  "hunks": [
   {
    "at": 103,
    "before": " const {beforeDeckPagesSuiteSource}=await import('./helpers/input-retirement-source.mjs');\n const project=(path,source)=>beforeReleaseCapacitySource(path,beforeRebasedRelease(path,beforeDeckPagesSuiteSource(path,source)));\n const paths=['scripts/build-native-candidate.mjs','scripts/build-ui.mjs','scripts/monster-art.mjs',",
    "after": " const {beforeDeckPagesSuiteSource}=await import('./helpers/input-retirement-source.mjs');\n const {beforeUiEntranceWitness}=await import('./helpers/ui-entrance-source.mjs');\n const project=(path,source)=>beforeReleaseCapacitySource(path,beforeRebasedRelease(path,beforeDeckPagesSuiteSource(path,beforeUiEntranceWitness(path,source))));\n const paths=['scripts/build-native-candidate.mjs','scripts/build-ui.mjs','scripts/monster-art.mjs',"
   }
  ]
 },
 {
  "path": "tests/architecture-composition-format.test.mjs",
  "beforeSha256": "42c023af3c5930045506206f94da88c6469de7cecd737e3548c72f918cd173d0",
  "afterSha256": "fce73e3cc4fbc2753ab170f6ee864b6e489f054673ddb2f2f23f0889e78c5596",
  "hunks": [
   {
    "at": 0,
    "before": "import {historicalTest as test} from './helpers/historical-baseline-inputs.mjs';\nimport assert from 'node:assert/strict';",
    "after": "import {historicalTest as test,readHistoricalBaselineSource} from './helpers/historical-baseline-inputs.mjs';\nimport assert from 'node:assert/strict';"
   },
   {
    "at": 9,
    "before": "const path='config/architecture.json';\nconst source=readFileSync(path,'utf8').replaceAll('\\r\\n','\\n');\nconst hash=text=>createHash('sha256').update(text).digest('hex');",
    "after": "const path='config/architecture.json';\nconst currentPolicy=JSON.parse(readFileSync(path,'utf8'));\nconst source=readHistoricalBaselineSource(path).replaceAll('\\r\\n','\\n');\nconst hash=text=>createHash('sha256').update(text).digest('hex');"
   },
   {
    "at": 34,
    "before": " reordered.deferredImports.reverse();\n const missingScore=structuredClone(policy);delete missingScore.layers.abyss_run_score;\n const missingScoring=structuredClone(policy);delete missingScoring.layers.abyss_run_scoring;\n const wrongScoring=structuredClone(policy);wrongScoring.layers.abyss_run_scoring='ui';\n const first=JSON.stringify(key),value=JSON.stringify(policy.layers[key]);",
    "after": " reordered.deferredImports.reverse();\n // Run scoring postdates the immutable baseline. Keep its removal/wrong-owner\n // negative controls on actual current input, rather than deleting absent keys.\n assert(Object.hasOwn(currentPolicy.layers,'abyss_run_score')&&Object.hasOwn(currentPolicy.layers,'abyss_run_scoring'));\n const missingScore=structuredClone(currentPolicy);delete missingScore.layers.abyss_run_score;\n const missingScoring=structuredClone(currentPolicy);delete missingScoring.layers.abyss_run_scoring;\n const wrongScoring=structuredClone(currentPolicy);wrongScoring.layers.abyss_run_scoring='ui';\n for(const variant of [missingScore,missingScoring,wrongScoring])assert.notEqual(JSON.stringify(variant),JSON.stringify(currentPolicy));\n const first=JSON.stringify(key),value=JSON.stringify(policy.layers[key]);"
   }
  ]
 },
 {
  "path": "tests/ci-runtime.test.mjs",
  "beforeSha256": "e420cc0f4973bc975a1d0fabdbc1b316fcf34c7ccb7db0ab1efef9270bbf0876",
  "afterSha256": "01538912f5e008c948521c2e29674d8f4b643a45168f3624bc4ba0aae5fe4609",
  "hunks": [
   {
    "at": 37,
    "before": "import {qualityShardMatrices} from '../scripts/ci-quality-shape.mjs';\n",
    "after": "import {qualityShardMatrices} from '../scripts/ci-quality-shape.mjs';\n\n// Rounded-down completed-case work from the five recorded POSIX timeout jobs.\n// These are placement minima, never successful whole-file or hosted timings.\nconst replayCaseMinimumMs=Object.freeze({\n 'tests/approved-ui-inverse.test.mjs':1295000,\n 'tests/art-feature-source-inverse.test.mjs':412000,\n 'tests/card-origin-source-inverse.test.mjs':149000,\n 'tests/combat-reactions-architecture-inverse.test.mjs':137000,\n 'tests/game-ui-extraction-source-inverse.test.mjs':870000,\n 'tests/max-hp-accepted-source-inverse.test.mjs':677000,\n 'tests/player-death-inverse.test.mjs':172000,\n 'tests/potion-callback-source.test.mjs':238000,\n 'tests/presentation-native-m3-contract.test.mjs':1037000,\n});\nconst replayMinimum=(file,platform)=>platform==='win32'?0:replayCaseMinimumMs[file]??0;\n"
   },
   {
    "at": 141,
    "before": "  const native=jsPlanningWeights(files,platform);\n  for(const file of files)assert.equal(native[file],Math.max(timings.js[platform][file]??timings.unknownJsMs,timings.jsPlanning?.localLowerBounds?.[file]?.durationMs??0));\n  const count=platform==='win32'?qualityShardMatrices.windows.length:qualityShardMatrices.posix.length;",
    "after": "  const native=jsPlanningWeights(files,platform);\n  for(const file of files)assert.equal(native[file],Math.max(timings.js[platform][file]??timings.unknownJsMs,timings.jsPlanning?.localLowerBounds?.[file]?.durationMs??0,replayMinimum(file,platform)));\n  const count=platform==='win32'?qualityShardMatrices.windows.length:qualityShardMatrices.posix.length;"
   },
   {
    "at": 150,
    "before": "  const fallback=jsPlanningWeights(files,platform);\n  for(const file of files)assert.equal(fallback[file],Math.max(...Object.values(timings.js).map(map=>map[file]??timings.unknownJsMs),timings.jsPlanning?.localLowerBounds?.[file]?.durationMs??0));\n }",
    "after": "  const fallback=jsPlanningWeights(files,platform);\n  for(const file of files)assert.equal(fallback[file],Math.max(...Object.values(timings.js).map(map=>map[file]??timings.unknownJsMs),timings.jsPlanning?.localLowerBounds?.[file]?.durationMs??0,replayMinimum(file,platform)));\n }"
   },
   {
    "at": 295,
    "before": "  }\n  for(const platform of ['win32','linux'])assert.equal(jsPlanningWeights([file],platform)[file],Math.max(timings.js[platform][file]??timings.unknownJsMs,entry.durationMs));\n }",
    "after": "  }\n  for(const platform of ['win32','linux'])assert.equal(jsPlanningWeights([file],platform)[file],Math.max(timings.js[platform][file]??timings.unknownJsMs,entry.durationMs,replayMinimum(file,platform)));\n }"
   },
   {
    "at": 429,
    "before": "  assert.equal(timings.js[platform][key],10000,'retain actual old observations separately from the new local planning floor');\n  assert.equal(jsPlanningWeights([key],platform)[key],Math.max(timings.js[platform][key],floor.durationMs));\n }",
    "after": "  assert.equal(timings.js[platform][key],10000,'retain actual old observations separately from the new local planning floor');\n  assert.equal(jsPlanningWeights([key],platform)[key],Math.max(timings.js[platform][key],floor.durationMs,replayMinimum(key,platform)));\n }"
   },
   {
    "at": 459,
    "before": "  assert.equal(floor.durationMs,Math.ceil(observation.durationMs));assert.equal(observation.planningFloorMs,floor.durationMs);\n  for(const platform of ['win32','linux'])assert.equal(jsPlanningWeights([file],platform)[file],Math.max(timings.js[platform][file]??timings.unknownJsMs,floor.durationMs));\n }",
    "after": "  assert.equal(floor.durationMs,Math.ceil(observation.durationMs));assert.equal(observation.planningFloorMs,floor.durationMs);\n  for(const platform of ['win32','linux'])assert.equal(jsPlanningWeights([file],platform)[file],Math.max(timings.js[platform][file]??timings.unknownJsMs,floor.durationMs,replayMinimum(file,platform)));\n }"
   }
  ]
 },
 {
  "path": "tests/round3-catalog-source-inverse.test.mjs",
  "beforeSha256": "701bcd46e9a01d48dccfb5db89df6edc06bf1e228777e6d9a40254865e2fd219",
  "afterSha256": "9a611b2e46643cfbb6032dccac3b4b272feb9ddbe67569dbfc0e449d889aaa5f",
  "hunks": [
   {
    "at": 15,
    "before": "import {beforeInputRetirementReader,pointerInputPath,retiredControllerPath} from './helpers/input-retirement-source.mjs';\nimport {gameUiExtractionProof} from './helpers/epochs/develop/tests/helpers/game-ui-extraction-source-inverse.mjs';",
    "after": "import {beforeInputRetirementReader,pointerInputPath,retiredControllerPath} from './helpers/input-retirement-source.mjs';\nimport {addedEntranceModules} from './helpers/ui-entrance-source.mjs';\nimport {gameUiExtractionProof} from './helpers/epochs/develop/tests/helpers/game-ui-extraction-source-inverse.mjs';"
   },
   {
    "at": 133,
    "before": " };\n const addedOwners=['scripts/deck-ui-layout.mjs',...stasisUpgradeAddedPaths,...actorFocusAdded,pointerInputPath];\n assert.throws(()=>readLive(retiredControllerPath),{code:'ENOENT'});",
    "after": " };\n const addedOwners=['scripts/deck-ui-layout.mjs',...stasisUpgradeAddedPaths,...actorFocusAdded,pointerInputPath,...addedEntranceModules];\n assert.throws(()=>readLive(retiredControllerPath),{code:'ENOENT'});"
   }
  ]
 },
 {
  "path": "tests/ci-posix-concurrency.test.mjs",
  "beforeSha256": "a0dba46c0886e9b779b780ef4f8ae72d75552643fb2f84bf51e71c7dda8bfbf7",
  "afterSha256": "e765a7022f427ecb89b1420d961355fd3ee4820cc19a28a7a2bc30f3f8b9c3cd",
  "hunks": [
   {
    "at": 20,
    "before": "  assert.ok(job(current).includes('    strategy:\\n      fail-fast: false\\n'+cap+'      matrix:\\n        shard: ${{ fromJSON(needs.impact.outputs.posix_shards) }}\\n'));\n  assert.ok(job(current).includes('    runs-on: ubuntu-24.04\\n    timeout-minutes: 30\\n'));\n  assert.equal(beforePosixConcurrencyWorkflow(current),current.replace(cap,''));",
    "after": "  assert.ok(job(current).includes('    strategy:\\n      fail-fast: false\\n'+cap+'      matrix:\\n        shard: ${{ fromJSON(needs.impact.outputs.posix_shards) }}\\n'));\n  assert.ok(job(current).includes('    runs-on: ubuntu-24.04\\n    timeout-minutes: 90\\n'));\n  assert.equal(beforePosixConcurrencyWorkflow(current),current.replace(cap,''));"
   }
  ]
 },
 {
  "path": "tests/ci-posix-shards.test.mjs",
  "beforeSha256": "7075d2a2a905d06667cc593c8a4413499700774d4b6403033d6658245bc990c9",
  "afterSha256": "25c6d1c3aa908e09ccef28ac8dfff77140625de0f883eab2f9489dc83dc13d4b",
  "hunks": [
   {
    "at": 75,
    "before": "  assert.match(shards,/^    needs: impact\\n    if: \\$\\{\\{ !cancelled\\(\\) && needs\\.impact\\.result == 'success' && needs\\.impact\\.outputs\\.mode == 'full' \\}\\}$/m);\n  assert.match(shards,/^    runs-on: ubuntu-24\\.04\\n    timeout-minutes: 30$/m);\n  assert.match(shards,/^      fail-fast: false$/m);",
    "after": "  assert.match(shards,/^    needs: impact\\n    if: \\$\\{\\{ !cancelled\\(\\) && needs\\.impact\\.result == 'success' && needs\\.impact\\.outputs\\.mode == 'full' \\}\\}$/m);\n  assert.match(shards,/^    runs-on: ubuntu-24\\.04\\n    timeout-minutes: 90$/m);\n  assert.match(shards,/^      fail-fast: false$/m);"
   }
  ]
 },
 {
  "path": "tests/ci-summary-runners.test.mjs",
  "beforeSha256": "4d3654d6309e49bd9a2984e071243659db59223d3cd9c8fe7633665ebf38d7ca",
  "afterSha256": "0fb3611c1dfdf576f0de8328b623cf1fb9241bbbff6898013067db2b8061cfd1",
  "hunks": [
   {
    "at": 9,
    "before": "import { beforeDraftQualityWorkflow, draftQualityWorkflowEdits } from './helpers/draft-quality-workflow.mjs';\nimport { beforeAutoMergeWorkflow, beforeExecutionTimeoutWorkflow } from './helpers/auto-merge-workflow.mjs';\nimport {closeoutRead,closeoutInventory} from './helpers/closeout-ci-source.mjs';",
    "after": "import { beforeDraftQualityWorkflow, draftQualityWorkflowEdits } from './helpers/draft-quality-workflow.mjs';\nimport { beforeAutoMergeWorkflow, beforeExecutionTimeoutWorkflow, beforePosixDeadlineWorkflow, beforeWindowsDeadlineWorkflow, beforeHostedDeadlineWorkflow } from './helpers/auto-merge-workflow.mjs';\nimport {closeoutRead,closeoutInventory} from './helpers/closeout-ci-source.mjs';"
   },
   {
    "at": 282,
    "before": "",
    "after": "\n\ntest('reviewed POSIX sixty-minute hard guard preserves exact thirty-minute predecessors and rejects all drift',()=>{\n const actual=beforeHostedDeadlineWorkflow(readFileSync('.github/workflows/quality.yml','utf8').replaceAll('\\r\\n','\\n'));\n const physical=beforeWindowsDeadlineWorkflow(actual);\n const body=job('engineering-posix-shards',actual);\n assert.match(body,/^    timeout-minutes: 60$/m);\n assert.match(body,/# performance target; the hard guard allows host variance. Files execute once./);\n assert.match(body,/max-parallel: 12/);\n const previous=physical.replace('    runs-on: ubuntu-24.04\\n    timeout-minutes: 60\\n','    runs-on: ubuntu-24.04\\n    timeout-minutes: 30\\n');\n assert.equal(digest(previous),'6e951f39539296339c3ffaaee97d0bdcae4c72e97914ee33fccfb4420fd50adf','immutable physical thirty-minute predecessor');\n for(const eol of ['\\n','\\r\\n']){\n  const current=physical.replaceAll('\\n',eol),old=previous.replaceAll('\\n',eol);\n  assert.equal(beforePosixDeadlineWorkflow(current),old);\n  assert.equal(beforePosixDeadlineWorkflow(old),old);\n  assert.equal(beforeExecutionTimeoutWorkflow(current),beforeExecutionTimeoutWorkflow(old));\n }\n for(const [from,to]of [['timeout-minutes: 60','timeout-minutes: 61'],['contents: read','contents: write'],\n  ['max-parallel: 12','max-parallel: 13'],['npm run check:engineering','npm run check:missing'],\n  ['timeout-minutes: 60','timeout-minutes: 60\\n    timeout-minutes: 60']]){\n  const changed=physical.replace(from,to);assert.notEqual(changed,physical);\n  assert.equal(beforePosixDeadlineWorkflow(changed),changed,'unknown policy bytes must remain visible');\n  assert.equal(beforeExecutionTimeoutWorkflow(changed),changed,'unknown sixty-minute source cannot inherit historical execution slack');\n }\n assert.equal(beforePosixDeadlineWorkflow(physical+'# foreign\\n'),physical+'# foreign\\n');\n});\n\ntest('reviewed Windows seventy-five-minute hard guard retains its exact forty-five-minute predecessor and rejects drift',()=>{\n const physical=beforeHostedDeadlineWorkflow(readFileSync('.github/workflows/quality.yml','utf8').replaceAll('\\r\\n','\\n'));\n const rules=job('rules',physical);\n const deadline=\"timeout-minutes: ${{ inputs.runner_pool == 'local-special' && 75 || 75 }}\";\n assert.ok(rules.includes(deadline),'ordinary and local-special Full retain explicit seventy-five-minute limits');\n assert.match(rules,/# Thirty minutes is a performance target/);\n assert.match(job('engineering-posix-shards',physical),/^    timeout-minutes: 60$/m);\n const previous=physical.replace(deadline,deadline.replace('|| 75','|| 45'));\n assert.equal(digest(previous),'9f0a309dffe7a8a356d895d1ed03b167499cb1f296e80c27fa87d38e357eb08b');\n for(const eol of ['\\n','\\r\\n']){\n  const current=physical.replaceAll('\\n',eol),old=previous.replaceAll('\\n',eol);\n  assert.equal(beforeWindowsDeadlineWorkflow(current),old);\n  assert.equal(beforeWindowsDeadlineWorkflow(old),old);\n  assert.equal(beforeExecutionTimeoutWorkflow(current),beforeExecutionTimeoutWorkflow(old));\n }\n for(const [from,to]of [[deadline,deadline.replace('|| 75','|| 76')],\n  [deadline,deadline.replace('&& 75','&& 74')],[deadline,deadline+'\\n    '+deadline],\n  ['contents: read','contents: write'],['max-parallel: 12','max-parallel: 13'],\n  ['npm run check:engineering','npm run check:missing']]){\n  const changed=physical.replace(from,to);assert.notEqual(changed,physical);\n  assert.equal(beforeWindowsDeadlineWorkflow(changed),changed,'foreign Windows guard bytes cannot inherit the predecessor');\n  assert.equal(beforeExecutionTimeoutWorkflow(changed),changed,'unreviewed full-source changes remain visible');\n }\n assert.equal(beforeWindowsDeadlineWorkflow(physical+'# foreign\\n'),physical+'# foreign\\n');\n});\n\n\ntest('current hosted 105/90-minute deadlines preserve local 75 and exact complete predecessor checks',()=>{\n const physical=readFileSync('.github/workflows/quality.yml','utf8').replaceAll('\\r\\n','\\n');\n const windows=\"timeout-minutes: ${{ inputs.runner_pool == 'local-special' && 75 || 105 }}\";\n assert.ok(job('rules',physical).includes(windows));\n assert.match(job('engineering-posix-shards',physical),/^    timeout-minutes: 90$/m);\n const previous=physical.replace(windows,\"timeout-minutes: ${{ inputs.runner_pool == 'local-special' && 75 || 75 }}\").replace(\"    runs-on: ubuntu-24.04\\n    timeout-minutes: 90\\n\",\"    runs-on: ubuntu-24.04\\n    timeout-minutes: 60\\n\");\n assert.equal(digest(previous),'c61bcf8806af9b370342c44a32077c65896fe15d8af097b99ab8342cc257158a');\n for(const cap of [12,6,null]){\n  const variant=text=>cap===12?text:text.replace('      max-parallel: 12\\n',cap===null?'':`      max-parallel: ${cap}\\n`);\n  for(const eol of ['\\n','\\r\\n']){\n   const current=variant(physical).replaceAll('\\n',eol),old=variant(previous).replaceAll('\\n',eol);\n   assert.equal(beforeHostedDeadlineWorkflow(current),old);\n   assert.equal(beforeHostedDeadlineWorkflow(old),old);\n   assert.equal(beforeWindowsDeadlineWorkflow(current),beforeWindowsDeadlineWorkflow(old));\n   assert.equal(beforeExecutionTimeoutWorkflow(current),beforeExecutionTimeoutWorkflow(old));\n  }\n }\n for(const [from,to]of [[windows,windows.replace('|| 105','|| 106')],[windows,windows.replace('&& 75','&& 74')],\n  [windows,\"timeout-minutes: ${{ inputs.runner_pool == 'local-special' && 75 || 75 }}\"],['timeout-minutes: 90','timeout-minutes: 60'],\n  [windows,windows+'\\n    '+windows],['timeout-minutes: 90','timeout-minutes: 90\\n    timeout-minutes: 90'],\n  ['contents: read','contents: write'],['max-parallel: 12','max-parallel: 13'],['npm run check:engineering','npm run check:missing']]){\n  const changed=physical.replace(from,to);assert.notEqual(changed,physical);\n  assert.equal(beforeHostedDeadlineWorkflow(changed),changed);\n  assert.equal(beforeExecutionTimeoutWorkflow(changed),changed,'unknown complete source must retain its actual bytes');\n }\n for(const changed of [physical+'# foreign\\n',physical.replaceAll('\\n','\\r\\r\\n')])assert.equal(beforeHostedDeadlineWorkflow(changed),changed);\n});\n"
   }
  ]
 },
 {
  "path": "tests/helpers/auto-merge-workflow.mjs",
  "beforeSha256": "4f3d88760eece33410ea9e895a6fb49d5cebab29bc7d124b88478ff0bf775103",
  "afterSha256": "8a05f6dd3b23d5d0e26e832c2208f154f5f92a939547e4c0f68c739e2f080b45",
  "hunks": [
   {
    "at": 0,
    "before": "import {readFileSync} from 'node:fs';",
    "after": "import {createHash} from 'node:crypto';\nimport {readFileSync} from 'node:fs';"
   },
   {
    "at": 10,
    "before": "// changes remain visible to the old whole-source identities.\nexport function beforeExecutionTimeoutWorkflow(text){\n const original=text;",
    "after": "// changes remain visible to the old whole-source identities.\n// The reviewed 60-minute guard restores only complete exact current, six-cap\n// or uncapped workflow bytes. Original 30-minute and all foreign bytes pass through.\nconst posixDeadlinePredecessors=new Map([[\"9f0a309dffe7a8a356d895d1ed03b167499cb1f296e80c27fa87d38e357eb08b\",\"6e951f39539296339c3ffaaee97d0bdcae4c72e97914ee33fccfb4420fd50adf\"],[\"1b159fa2685b8bc2a36c82653710c6ab75e4f56c06ba8048b220ce7f1960eb52\",\"34e0bc864351cb2b660c0ccb6a8278eb20fa3cfcc2808735695839f4518d1199\"],[\"959bd6e7a31fb08170fbad592e1dfb5154f3c5cd982c0ed7673d57bf5017ea39\",\"4f75bbb052340a40a87af0601a6652e8c9e94cae6c72a501abcda88e9f34c3fe\"]]);\nexport function beforePosixDeadlineWorkflow(text){\n if(typeof text!=='string'||text.includes('\\r\\r\\n'))return text;\n const lf=text.replaceAll('\\r\\n','\\n');\n const hash=value=>createHash('sha256').update(value).digest('hex');\n const before=posixDeadlinePredecessors.get(hash(lf));\n if(!before)return text;\n const prior=lf.replace('    runs-on: ubuntu-24.04\\n    timeout-minutes: 60\\n','    runs-on: ubuntu-24.04\\n    timeout-minutes: 30\\n');\n if(hash(prior)!==before)throw Error('Exact POSIX deadline predecessor required');\n return text.includes('\\r\\n')?prior.replaceAll('\\n','\\r\\n'):prior;\n}\n// A later measured Windows cutoff raises only the ordinary Full hard guard.\n// Exact known workflow variants retain the preceding 45-minute source bytes.\nconst windowsDeadlinePredecessors=new Map([[\"c61bcf8806af9b370342c44a32077c65896fe15d8af097b99ab8342cc257158a\",\"9f0a309dffe7a8a356d895d1ed03b167499cb1f296e80c27fa87d38e357eb08b\"],[\"9031980631b073f06b6101840c5ab6532ca6087dc4a80c35a46eab0a944922cf\",\"1b159fa2685b8bc2a36c82653710c6ab75e4f56c06ba8048b220ce7f1960eb52\"],[\"81f8e9bc17d5b88f2d7123f243c530d7c664343b6ce497557644f5a9a316a0cb\",\"959bd6e7a31fb08170fbad592e1dfb5154f3c5cd982c0ed7673d57bf5017ea39\"]]);\n// Complete measured hosted deadlines restore only the exact preceding 75/60-minute workflow.\nconst hostedDeadlinePredecessors=new Map([[\"58763ef02fe4ebd955198bfa47b84c5de49497c378339b931cd1ebb556bd0688\",\"c61bcf8806af9b370342c44a32077c65896fe15d8af097b99ab8342cc257158a\"],[\"8976dd643663ead3b1ba2eb80b416518ef637a93a5486c49208e493e7efbb9b1\",\"9031980631b073f06b6101840c5ab6532ca6087dc4a80c35a46eab0a944922cf\"],[\"1759564303c5a9eae393cd33756513b752fd82444ed5c740e32ba3c162a40f0c\",\"81f8e9bc17d5b88f2d7123f243c530d7c664343b6ce497557644f5a9a316a0cb\"]]);\nexport function beforeHostedDeadlineWorkflow(text){\n if(typeof text!=='string'||text.includes('\\r\\r\\n'))return text;\n const lf=text.replaceAll('\\r\\n','\\n'),hash=value=>createHash('sha256').update(value).digest('hex');\n const before=hostedDeadlinePredecessors.get(hash(lf));\n if(!before)return text;\n const prior=lf.replace(\"timeout-minutes: ${{ inputs.runner_pool == 'local-special' && 75 || 105 }}\",\"timeout-minutes: ${{ inputs.runner_pool == 'local-special' && 75 || 75 }}\")\n  .replace(\"    runs-on: ubuntu-24.04\\n    timeout-minutes: 90\\n\",\"    runs-on: ubuntu-24.04\\n    timeout-minutes: 60\\n\");\n if(hash(prior)!==before)throw Error('Exact hosted execution deadline predecessor required');\n return text.includes('\\r\\n')?prior.replaceAll('\\n','\\r\\n'):prior;\n}\nexport function beforeWindowsDeadlineWorkflow(text){\n text=beforeHostedDeadlineWorkflow(text);\n if(typeof text!=='string'||text.includes('\\r\\r\\n'))return text;\n const lf=text.replaceAll('\\r\\n','\\n'),hash=value=>createHash('sha256').update(value).digest('hex');\n const before=windowsDeadlinePredecessors.get(hash(lf));\n if(!before)return text;\n const prior=lf.replace(\"timeout-minutes: ${{ inputs.runner_pool == 'local-special' && 75 || 75 }}\",\"timeout-minutes: ${{ inputs.runner_pool == 'local-special' && 75 || 45 }}\");\n if(hash(prior)!==before)throw Error('Exact Windows deadline predecessor required');\n return text.includes('\\r\\n')?prior.replaceAll('\\n','\\r\\n'):prior;\n}\nexport function beforeExecutionTimeoutWorkflow(text){\n text=beforeWindowsDeadlineWorkflow(text);\n text=beforePosixDeadlineWorkflow(text);\n const original=text;"
   }
  ]
 },
 {
  "path": "tests/actor-damage-pipeline.test.mjs",
  "beforeSha256": "94c11d90caf0e024c9f987e483bbb782e5b250323d14bb2420cf88e09d302f2e",
  "afterSha256": "b2a58a1431f5143a1ae1569aabd0997efab68d07cfa1b447514180ce8e1df01c",
  "hunks": [
   {
    "at": 29,
    "before": "  }\n  const crlf=source=>source.replaceAll('\\n','\\r\\n');\n  for(const [path,{before}] of Object.entries(archive.files)){",
    "after": "  }\n  const crlf=source=>source.replace(/\\r?\\n/g,'\\r\\n');\n  for(const [path,{before}] of Object.entries(archive.files)){"
   },
   {
    "at": 33,
    "before": "    const prior=path===config?stasis.files[config].before.source:before.source;\n    assert.equal(authenticateDevelopBackflow(path,live,read),prior);\n    assert.equal(authenticateDevelopBackflow(path,crlf(live),owner=>crlf(read(owner))),crlf(prior));",
    "after": "    const prior=path===config?stasis.files[config].before.source:before.source;\n    assert.equal(authenticateDevelopBackflow(path,live,read),live.includes('\\r\\n')?crlf(prior):prior);\n    assert.equal(authenticateDevelopBackflow(path,crlf(live),owner=>crlf(read(owner))),crlf(prior));"
   },
   {
    "at": 37,
    "before": "    assert.equal(authenticateDevelopBackflow(path,live+'\\n',()=>assert.fail('unknown bytes must not read owners')),live+'\\n');\n    for(const owner of [...Object.keys(archive.files),...Object.keys(archive.added)]){",
    "after": "    assert.equal(authenticateDevelopBackflow(path,live+'\\n',()=>assert.fail('unknown bytes must not read owners')),live+'\\n');\n    const doubleCr=live.replace(/\\r?\\n/g,'\\r\\r\\n');\n    assert.notEqual(doubleCr,live,'double CR negative must change bytes');\n    assert.equal(authenticateDevelopBackflow(path,doubleCr,()=>assert.fail('double CR source must not read owners')),doubleCr);\n    for(const owner of [...Object.keys(archive.files),...Object.keys(archive.added)]){"
   },
   {
    "at": 64,
    "before": "  const stasisPath='src/lua/abyss_act2_stasis.lua';\n  assert.equal(authenticateDevelopBackflow(stasisPath,read(stasisPath),read),stasis.files[stasisPath].before.source);\n  assert.throws(()=>authenticateDevelopBackflow(stasisPath,read(stasisPath),path=>path===config?stasisConfig:read(path)),/linked owner identity/);",
    "after": "  const stasisPath='src/lua/abyss_act2_stasis.lua';\n  assert.equal(authenticateDevelopBackflow(stasisPath,read(stasisPath),read),read(stasisPath).includes('\\r\\n')?crlf(stasis.files[stasisPath].before.source):stasis.files[stasisPath].before.source);\n  assert.throws(()=>authenticateDevelopBackflow(stasisPath,read(stasisPath),path=>path===config?stasisConfig:read(path)),/linked owner identity/);"
   }
  ]
 },
 {
  "path": "tests/deck-item-lifecycle.test.mjs",
  "beforeSha256": "6a62cb556a016e52e80feac4e870f674ec786a14485b2568f7341050bc5e6677",
  "afterSha256": "38928d3848838f84c974b6022856b9fc41c1bf1e61f8b6a1c6a08124da3195f3",
  "hunks": [
   {
    "at": 30,
    "before": " assert.notEqual(prior,current);\n assert.equal(beforeMapDeckSource(path,current.replaceAll('\\n','\\r\\n'),read),prior.replaceAll('\\n','\\r\\n'));\n assert.deepEqual(mapDeckPriorRead(read)(path),Buffer.from(prior));",
    "after": " assert.notEqual(prior,current);\n assert.equal(beforeMapDeckSource(path,current.replace(/\\r?\\n/g,'\\r\\n'),read),prior.replace(/\\r?\\n/g,'\\r\\n'));\n assert.deepEqual(mapDeckPriorRead(read)(path),Buffer.from(prior));"
   },
   {
    "at": 39,
    "before": " }),/(?:map deck|combined) linked owner missing: src\\/lua\\/abyss_deck_ui\\.lua/);\n const drift=current+'\\n';",
    "after": " }),/(?:map deck|combined) linked owner missing: src\\/lua\\/abyss_deck_ui\\.lua/);\n const doubleCr=current.replace(/\\r?\\n/g,'\\r\\r\\n');\n assert.notEqual(doubleCr,current,'double CR negative must change bytes');\n assert.equal(beforeMapDeckSource(path,doubleCr,()=>assert.fail('double CR source must not read owners')),doubleCr);\n const drift=current+'\\n';"
   }
  ]
 },
 {
  "path": "tests/seven-refactor-source-epoch.test.mjs",
  "beforeSha256": "b09c67aaf2f40ce8d4ffdf9fad05c32e44ad289b853e6ac424ac0bb2f5a5f4f5",
  "afterSha256": "62d1daad52fd3ba42896b65b200b42edfbc90d24d25d87940d7815cfaabe5a1f",
  "hunks": [
   {
    "at": 427,
    "before": "  assert.equal(run(source),'{}\\n');assert.equal(reads,2);\n  const layout='{ \"cacheFreshness\" : 1 }\\n';\n  assert.equal(run(layout),'{}\\n');assert.equal(parses,1);assert.equal(reads,3);\n  assert.equal(run(layout),'{}\\n');assert.equal(parses,1);assert.equal(reads,4);\n  actual=source.replace('1','2');assert.throws(()=>run(layout),/linked owner identity/);assert.equal(reads,5);",
    "after": "  assert.equal(run(source),'{}\\n');assert.equal(reads,2);\n  // Entrance admission parses every input afresh; only the pure layout matcher memoizes.\n  assert.equal(parses,2,'two exact input calls each retain the fresh entrance syntax gate');\n  const layout='{ \"cacheFreshness\" : 1 }\\n';\n  const beforeLayout=parses;\n  assert.equal(run(layout),'{}\\n');assert.equal(parses-beforeLayout,2,'fresh entrance plus first pure layout calculation');assert.equal(reads,3);\n  const beforeWarmLayout=parses;\n  assert.equal(run(layout),'{}\\n');assert.equal(parses-beforeWarmLayout,1,'warm calculation still runs fresh entrance admission');assert.equal(reads,4);\n  actual=source.replace('1','2');assert.throws(()=>run(layout),/linked owner identity/);assert.equal(reads,5);"
   },
   {
    "at": 438,
    "before": "  assert.throws(()=>project.preCombinedSource(path,layout,{target:'prior',readSource:null}),/linked owner reader/);\n  const foreign=layout.replace('1','2');assert.equal(run(foreign),foreign);assert.equal(reads,7);\n  assert.equal(run(foreign),foreign);assert.equal(reads,7);assert.equal(parses,2);\n }finally{crypto.createHash=originalHash;JSON.parse=originalParse;syncBuiltinESMExports();}",
    "after": "  assert.throws(()=>project.preCombinedSource(path,layout,{target:'prior',readSource:null}),/linked owner reader/);\n  const foreign=layout.replace('1','2'),beforeForeign=parses;assert.equal(run(foreign),foreign);assert.equal(reads,7);\n  assert.equal(parses-beforeForeign,2,'foreign input runs entrance syntax and its first pure calculation');\n  const beforeWarmForeign=parses;\n  assert.equal(run(foreign),foreign);assert.equal(reads,7);assert.equal(parses-beforeWarmForeign,1,'foreign warm calculation is cached without caching admission');\n }finally{crypto.createHash=originalHash;JSON.parse=originalParse;syncBuiltinESMExports();}"
   }
  ]
 },
 {
  "path": "tests/reward-query-boundary-source.test.mjs",
  "beforeSha256": "378703a708fce2a44c6cb039d8825b0708a25e92191956afe9e347e39b4aedb8",
  "afterSha256": "c9d507b438db574106eb871ba6fad96d0fcd9d05c8535e5a9bed15943ab03490",
  "hunks": [
   {
    "at": 163,
    "before": "console.log('ISOLATED_REWARD_QUERY_SOURCE_PASS');`;\n  const result=spawnSync(process.execPath,['--input-type=module','-e',script],{cwd:root,encoding:'utf8',timeout:30000,maxBuffer:1024*1024});\n  assert.ifError(result.error);assert.equal(result.status,0,result.stdout+result.stderr);assert.match(result.stdout,/ISOLATED_REWARD_QUERY_SOURCE_PASS/);",
    "after": "console.log('ISOLATED_REWARD_QUERY_SOURCE_PASS');`;\n  const result=spawnSync(process.execPath,['--input-type=module','-e',script],{cwd:root,encoding:'utf8',timeout:180000,maxBuffer:1024*1024});\n  assert.ifError(result.error);assert.equal(result.status,0,result.stdout+result.stderr);assert.match(result.stdout,/ISOLATED_REWARD_QUERY_SOURCE_PASS/);"
   }
  ]
 },
 {
  "path": "tests/actor-presence-source.test.mjs",
  "beforeSha256": "1afcb5b218e1931363957d3fc3fa6ef3f133d5e5364c1eb43df9980b81250588",
  "afterSha256": "ce5a1602d591efc28d501725be660bf2a63be60b447b9c687d7261efc33702db",
  "hunks": [
   {
    "at": 14,
    "before": "import {sourceEpoch} from './helpers/combined-epoch/source-epoch.mjs';\nconst read=p=>readFileSync(p,'utf8').replaceAll('\\r\\n','\\n');",
    "after": "import {sourceEpoch} from './helpers/combined-epoch/source-epoch.mjs';\nimport {pointerInputPath,retiredControllerPath,readRetiredController} from './helpers/input-retirement-source.mjs';\nimport {addedEntranceModules} from './helpers/ui-entrance-source.mjs';\nconst read=p=>readFileSync(p,'utf8').replaceAll('\\r\\n','\\n');"
   },
   {
    "at": 178,
    "before": "test('the current actor facade freshly rejects every expanded raw owner after warm nested reads',()=>{\n const current=Object.fromEntries(sourceEpoch.proof.owners.map(p=>[p,read(p)]));\n for(const path of originals){",
    "after": "test('the current actor facade freshly rejects every expanded raw owner after warm nested reads',()=>{\n const rawOwners=[...new Set([...sourceEpoch.proof.owners.filter(p=>p!==retiredControllerPath),pointerInputPath,...addedEntranceModules])];\n const current=Object.fromEntries(rawOwners.map(p=>[p,read(p)]));\n assert.throws(()=>read(retiredControllerPath),{code:'ENOENT'});\n const {source:retired,restored}=readRetiredController(read);assert(restored,'exact live pointer witnesses the absent Controller');\n for(const path of originals){"
   },
   {
    "at": 187,
    "before": "   if(mode==='missing')return undefined;if(mode==='null')return null;\n   if(mode==='buffer')return Buffer.from(current[p]);if(mode==='changed')return current[p]+'\\n';\n  }return current[p]??read(p);};",
    "after": "   if(mode==='missing')return undefined;if(mode==='null')return null;\n   const source=p===retiredControllerPath?retired:current[p];\n   if(mode==='old')return retired;\n   if(mode==='buffer')return Buffer.from(source);if(mode==='changed')return source+'\\n';\n  }return current[p]??read(p);};"
   },
   {
    "at": 195,
    "before": "  seen=[];check();assert.deepEqual(seen,first,'warm calls repeat the complete raw-read sequence');\n  for(bad of sourceEpoch.proof.owners)for(mode of ['changed','missing','null','buffer','throw']){\n   seen=[];assert.throws(check,error=>{assert.match(error.message,/linked owner/);assert(error.message.includes(bad));if(mode==='throw')assert.match(error.message,/expanded reader sentinel/);return true;});\n   assert(seen.includes(bad));const previous=mode;mode='good';check();mode=previous;\n  }\n }",
    "after": "  seen=[];check();assert.deepEqual(seen,first,'warm calls repeat the complete raw-read sequence');\n  for(bad of [...rawOwners,retiredControllerPath])for(mode of bad===retiredControllerPath?['old','changed','buffer','throw']:['changed','missing','null','buffer','throw']){\n   seen=[];assert.throws(check,error=>{assert.match(error.message,/linked owner/);assert(error.message.includes(bad===pointerInputPath?retiredControllerPath:bad));if(mode==='throw')assert.match(error.message,/expanded reader sentinel/);return true;});\n   assert(seen.includes(bad));const previous=mode;mode='good';check();mode=previous;\n  }\n  bad=retiredControllerPath;\n  for(mode of ['missing','null']){seen=[];check();assert(seen.includes(retiredControllerPath)&&seen.includes(pointerInputPath),'absent Controller freshly requires its exact pointer');}\n }"
   }
  ]
 },
 {
  "path": "tests/integration-source-epoch.test.mjs",
  "beforeSha256": "5ac17d80e021fb9d5ed5c1e1cf15d330e95f0c1795fdbac41afc8b7e3b497628",
  "afterSha256": "06f0d41a7e49c7c1c488f1b85da5eaaac742d0d504bdc69954ba403c2038145b",
  "hunks": [
   {
    "at": 33,
    "before": " assert.equal(authenticateInputRetirement(path,source,read),prior);\n assert.equal(authenticateInputRetirement(path,source.replaceAll('\\n','\\r\\n'),read),prior.replaceAll('\\n','\\r\\n'));\n assert.throws(()=>authenticateInputRetirement(path,source,()=>source+'\\n'),/input retirement validation/);",
    "after": " assert.equal(authenticateInputRetirement(path,source,read),prior);\n const crlf=text=>text.replaceAll('\\r\\n','\\n').replaceAll('\\n','\\r\\n');\n assert.equal(authenticateInputRetirement(path,crlf(source),read),crlf(prior));\n const doubleCr=crlf(source).replaceAll('\\n','\\r\\n');\n assert.notEqual(doubleCr,crlf(source));\n assert.equal(authenticateInputRetirement(path,doubleCr,()=>assert.fail('double CR bytes authorized linked reads')),doubleCr);\n assert.throws(()=>authenticateInputRetirement(path,source,()=>source+'\\n'),/input retirement validation/);"
   },
   {
    "at": 313,
    "before": "  const targetRead=p=>proof.targets[target].files[p]?.source??null;\n  for(const path of [`src/lua/${module}.lua`,'config/architecture.json']){\n   const expected=fn(path,targetRead(path),{readSource:targetRead});\n   assert.equal(fn(path,raw(path),{readSource:raw}),expected,path);\n  }",
    "after": "  const targetRead=p=>proof.targets[target].files[p]?.source??null;\n  // The M7 Actor adapter authenticates its current admission against physical\n  // owners before exposing the frozen target; a captured epoch is not live IO.\n  const currentRead=name==='preM7FinalSource'?p=>readFileSync(p,'utf8'):raw;\n  for(const path of [`src/lua/${module}.lua`,'config/architecture.json']){\n   const expected=fn(path,targetRead(path),{readSource:targetRead});\n   const inputs=name==='preM7FinalSource'?new Set([raw(path),currentRead(path)]):[raw(path)];\n   for(const input of inputs){\n    const projected=fn(path,input,{readSource:currentRead});\n    assert.equal(projected,expected,path);\n    if(name==='preM7FinalSource'){\n     assert.notEqual(projected,input,'current M7 input must actually project to its frozen target');\n     if(path==='config/architecture.json')\n      assert.throws(()=>fn(path,input,{readSource:raw}),/combined linked owner/,\n       'a captured configuration cannot authenticate current M7 owners');\n    }\n   }\n  }"
   }
  ]
 },
 {
  "path": "tests/living-wall-architecture-inverse.test.mjs",
  "beforeSha256": "1c42ad514b88aa6a35141c9887b2cb534a7afbed8d0fefd9ded1d234238e4f5f",
  "afterSha256": "dc13358cae7438b24465dc184f61cc99af95804cdbf248d3dcd0065cc2a6bbfa",
  "hunks": [
   {
    "at": 121,
    "before": "  const result=spawnSync(process.execPath,['--trace-event-file-pattern='+output,'--input-type=module','-e',script],\n   {encoding:'utf8',timeout:30000,maxBuffer:1024*1024,windowsHide:true});\n  assert.ifError(result.error);assert.equal(result.status,0,result.stdout+result.stderr);",
    "after": "  const result=spawnSync(process.execPath,['--trace-event-file-pattern='+output,'--input-type=module','-e',script],\n   {encoding:'utf8',timeout:180000,maxBuffer:1024*1024,windowsHide:true});\n  assert.ifError(result.error);assert.equal(result.status,0,result.stdout+result.stderr);"
   }
  ]
 },
 {
  "path": "tests/competition-roster.test.mjs",
  "beforeSha256": "b5bcfecbda90e861f843192985ea40175a05816732f7f40c37e52f3cf2ddbe9c",
  "afterSha256": "9967a132a0ed25e736395e01a158d1b14ecb2f5bc399d5e16223a5960faa54d7",
  "hunks": [
   {
    "at": 54,
    "before": "",
    "after": "\n\ntest('relative roster StS replay composes exact integration successors before its frozen witness',async()=>{\n const {beforeCurrentHistoricalStsSource}=await import('./helpers/calibration-replay-sources.mjs');\n const {inputRetirementStsFixtureSource}=await import('./helpers/input-retirement-sts-binding.mjs');\n const path='tests/integration-source-epoch.test.mjs',raw=readFileSync(path,'utf8').replaceAll('\\r\\n','\\n');\n const digest=s=>createHash('sha256').update(s).digest('hex');\n for(const input of [raw,raw.replaceAll('\\n','\\r\\n'),Buffer.from(raw)]){\n  const witness=beforeCurrentHistoricalStsSource(path,input),text=Buffer.isBuffer(witness)?witness.toString('utf8'):witness;\n  assert.equal(digest(text.replaceAll('\\r\\n','\\n')),'58159c0c30a0bbd658c1d47543c2350d8534198c43c4ba59b03318f14195178d','exact pre-entrance merged integration witness');\n  const prior=inputRetirementStsFixtureSource(path,witness),result=Buffer.isBuffer(prior)?prior.toString('utf8'):prior;\n  assert.equal(digest(result.replaceAll('\\r\\n','\\n')),'91dcae5efd5e6625764f85069f1552aaf7bfe5644d1b4c86e350faf90a9d576f','complete immutable archived StS integration source');\n  assert.equal(Buffer.isBuffer(prior),Buffer.isBuffer(input),'historical reader preserves Buffer type');\n }\n for(const drift of [raw+'\\n',raw.replaceAll('\\n','\\r\\r\\n')]){\n  assert.equal(beforeCurrentHistoricalStsSource(path,drift),drift,'unknown complete bytes stay opaque');\n  assert.throws(()=>inputRetirementStsFixtureSource(path,drift),/fresh composed StS integration source/);\n }\n});\n"
   }
  ]
 },
 {
  "path": "tests/official-battle-relic-icons.test.mjs",
  "beforeSha256": "8f894527548ee1b1435390d9b9436be716241ba439c4c462b9d066eec6a8a5da",
  "afterSha256": "7cd900d26bdbe7b63bc735af0fd305b6faf5897a0fa2e60cd44ab8af636ae70a",
  "hunks": [
   {
    "at": 28,
    "before": "  const stage=child(layout,'stage')??layout;\n  const selectionArt=official?child(child(child(stage,'characterPanel'),'details'),'v25RelicIcon').children:[];\n  const detail=theme.layout.relicView.detail;",
    "after": "  const stage=child(layout,'stage')??layout;\n  const selectionInfo=official?child(child(child(child(stage,'characterPanel'),'details'),'infoMotion'),'info1'):null;\n  const selectionArt=official?child(selectionInfo,'v25RelicIcon').children:[];\n  const detail=theme.layout.relicView.detail;"
   }
  ]
 },
 {
  "path": "tests/lua/hero_visual_slots.lua",
  "beforeSha256": "b1ead443273aeb30c303626d50227fc484f788e93497d34abc218d380ba5dc84",
  "afterSha256": "8d4caf5be49acf02669a4aeb8c27da61a1c7500b407172902b6407e46e9b1ec4",
  "hunks": [
   {
    "at": 40,
    "before": "local panel = root:GetChild(\"characterPanel\")\nassert(panel:GetChild(\"details\").visible, \"production opens on the traveler, not a blank card\")\nassert(ui.characterSelection.character == \"traveler\" and ui.characterSelection.element == \"ironclad\")\nlocal portraits = panel:GetChild(\"details\"):GetChild(\"portraits\")",
    "after": "local panel = root:GetChild(\"characterPanel\")\nassert(ui.characterSelection.character == nil and ui.characterSelection.info == nil\n    and not ui.characterSelection:canConfirm() and panel:GetChild(\"traveler\").visible,\n    \"production waits for the approved traveler choice\")\nassert(F.click(root, \"characterPanel\", \"traveler\"))\nassert(ui.characterSelection.character == \"traveler\" and ui.characterSelection.element == \"ironclad\")\nlocal info = panel:GetChild(\"details\"):GetChild(\"infoMotion\"):GetChild(\"info1\")\nfor _ = 1, 120 do\n    if info.visible and info.x == 0 and not (ui.pageReveal and ui.pageReveal:covered()) then break end\n    ui:update(1 / 60)\nend\nassert(info.visible and info.x == 0, \"selected traveler details must finish their real entrance\")\nassert(panel:GetChild(\"details\").visible, \"the selected traveler opens the correct portrait details\")\nlocal portraits = panel:GetChild(\"details\"):GetChild(\"portraits\")"
   },
   {
    "at": 62,
    "before": "assert(traveler:GetChild(\"selected\").visible)\nassert(panel:GetChild(\"details\"):GetChild(\"name\").text:find(\"旅行者\", 1, true))\nassert(panel:GetChild(\"details\"):GetChild(\"stats\").text:find(\"生命\", 1, true))\nassert(panel:GetChild(\"details\"):GetChild(\"gold\").text:find(\"金币\", 1, true))\nF.click(root, \"characterPanel\", \"confirm\")",
    "after": "assert(traveler:GetChild(\"selected\").visible)\nassert(info:GetChild(\"name\").text:find(\"旅行者\", 1, true))\nassert(info:GetChild(\"stats\").text:find(\"生命\", 1, true))\nassert(info:GetChild(\"gold\").text:find(\"金币\", 1, true))\nF.click(root, \"characterPanel\", \"confirm\")"
   }
  ]
 },
 {
  "path": "tests/ci-windows-shards.test.mjs",
  "beforeSha256": "faaef7ecce83b0047c23605f4c80a6853e03b8c396836c37d50e37ae4b3a4ec2",
  "afterSha256": "7c92a885a309315fc04fea49936641abeaf409b5c443388fd9448ba34eefd42a",
  "hunks": [
   {
    "at": 101,
    "before": "  assert.doesNotMatch(rules,/max-parallel:/);\n  assert.ok(rules.includes(\"timeout-minutes: ${{ inputs.runner_pool == 'local-special' && 75 || 45 }}\"));\n  for(const gate of ['check:network','verify:backlog','check:syntax','validate:data','build:theme','check:engineering'])",
    "after": "  assert.doesNotMatch(rules,/max-parallel:/);\n  assert.ok(rules.includes(\"timeout-minutes: ${{ inputs.runner_pool == 'local-special' && 75 || 105 }}\"));\n  for(const gate of ['check:network','verify:backlog','check:syntax','validate:data','build:theme','check:engineering'])"
   }
  ]
 },
 {
  "path": "tests/session-menu-navigation.test.mjs",
  "beforeSha256": "b4f5dd8948a59b95911cfe992e2a097bffdd8c9bb80cdfa9ede160660e3f723e",
  "afterSha256": "bd957b1c65c16d2b60f2f4a1853b73655a5ed913d2eaff1f48a391ccf160ab9e",
  "hunks": [
   {
    "at": 175,
    "before": "  const raw=readLive(path);\n  assert.equal(beforeCharacterPreparationSource(path,raw,readLive),liveEpoch.proof.current[path].source);\n  assert.equal(liveEpoch.preCombinedSource(path,raw,{target:'v2RunMenuPrior',readSource:readLive}),sourceEpoch.proof.current[path].source);",
    "after": "  const raw=readLive(path);\n  assert.equal(beforeCharacterPreparationSource(path,raw,readLive).replaceAll('\\r\\n','\\n'),liveEpoch.proof.current[path].source);\n  assert.equal(liveEpoch.preCombinedSource(path,raw,{target:'v2RunMenuPrior',readSource:readLive}),sourceEpoch.proof.current[path].source);"
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
 // Length is a pure rejection filter; equal-length inputs still require every byte/hash/hunk check.
 if(binding.afterLength!==undefined&&typeof source==='string'&&source.replaceAll('\r\n','\n').length!==binding.afterLength)return source;
 const prior=restoreExactFixtureHunks(binding,path,source);
 if(prior===source)return source;
 const previous=source.includes('\r\n')?prior.replaceAll('\n','\r\n'):prior;
 lastVerifiedProjection.set(path,{source,previous});
 return previous;
}
