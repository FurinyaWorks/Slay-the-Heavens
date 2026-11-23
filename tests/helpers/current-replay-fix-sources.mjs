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
  "afterSha256": "50ed8e5e59062cc3c0f59dff740b550a17fddfaf817d2dd53b0d09c125ab5222",
  "hunks": [
   {
    "at": 8,
    "before": "import {beforeNativeFlowFixture} from './native-flow-fixture-source.mjs';\nimport {exactSourceMatches as matches} from './source-fingerprint.mjs';\n",
    "after": "import {beforeNativeFlowFixture} from './native-flow-fixture-source.mjs';\nimport {beforeCurrentReplayFixes} from './current-replay-fix-sources.mjs';\nimport {exactSourceMatches as matches,sourceConfigLayoutMatches} from './source-fingerprint.mjs';\nimport {restoreExactFixtureHunks} from './exact-fixture-hunks.mjs';\n"
   },
   {
    "at": 37,
    "before": "function configLayoutMatches(source,expected,{allowConfigLayout=false}={}){\n if(!allowConfigLayout||!expected.tokensSha256||typeof source!=='string'||source.includes('\\r\\r\\n'))return false;\n const tokens=source.replace(/\"(?:\\\\.|[^\"\\\\])*\"|[ \\t\\r\\n]+/g,token=>token.startsWith('\"')?token:'');\n if(hash(tokens)!==expected.tokensSha256)return false;\n try{JSON.parse(source);return true;}catch{return false;}\n}",
    "after": "function configLayoutMatches(source,expected,{allowConfigLayout=false}={}){\n return allowConfigLayout&&sourceConfigLayoutMatches(source,expected.tokensSha256);\n}"
   },
   {
    "at": 58,
    "before": "const browserBackflow=JSON.parse(gunzipSync(browserArchive));\nassert.equal(browserBackflow.base,'beba19bad25db7de71f96af521656c13b882909b');",
    "after": "const browserBackflow=JSON.parse(gunzipSync(browserArchive));\nconst deckChromePath='src/lua/abyss_deck_ui.lua';\nassert.equal(browserBackflow.base,'beba19bad25db7de71f96af521656c13b882909b');"
   },
   {
    "at": 66,
    "before": " const row=Object.hasOwn(browserBackflow.files,path)&&browserBackflow.files[path];\n if(!row||!matches(source,row.after))return source;",
    "after": " const row=Object.hasOwn(browserBackflow.files,path)&&browserBackflow.files[path];\n if(path===deckChromePath)source=beforeCurrentReplayFixes(path,source);\n if(!row||!matches(source,row.after))return source;"
   },
   {
    "at": 79,
    "before": "}\nexport function beforePotionBackflow(path,source){\n const row=Object.hasOwn(potionBackflow.files,path)&&potionBackflow.files[path];\n if(!row||!matches(source,row.after))return source;",
    "after": "}\nconst rewardsBackView='src/lua/abyss_game_ui_view.lua';\nconst rewardsBackViewBeforeCover=Object.freeze({\n sha256:'9b4968a3fd23e0956ef565ef4da1d4dbc2a0c5b666308c59c963d02c8f15f0fb',\n gitBlob:'96f9fadefeabc3d3540e2797943c3b415605140d',\n});\nconst rewardsBackViewSuccessor=Object.freeze({\n sha256:'1256a76bfc2c6fa408c2bc09f46f8c3619e4140039f726ab3ceddea35ef39e4e',\n gitBlob:'00c1c49b6de96d7186f3bc635642c45cdbb786c8',\n});\nconst coveredBattleReplay=Object.freeze({\n path:rewardsBackView,beforeSha256:rewardsBackViewBeforeCover.sha256,afterSha256:rewardsBackViewSuccessor.sha256,\n hunks:[\n  {\"at\":263,\"before\":\"    local syncNative=nativePageLifecycle==true and NativePages.new(child,self) or nil\\n    local coveredMapRun\\n    local function refreshMapVisibility(run,deckOpen,blocked)\",\"after\":\"    local syncNative=nativePageLifecycle==true and NativePages.new(child,self) or nil\\n    local coveredMapRun,coveredDeckBattle\\n    local visibilityPass=0\\n    local function refreshMapVisibility(run,deckOpen,blocked)\"},\n  {\"at\":274,\"before\":\"    end\\n    return function(run,inMenu,deckOpen,potionOpen,blocked)\\n            if syncNative then syncNative(run) end\\n            menu:SetVisible(inMenu and not self.characterOpen and not self.easterEggOpen)\\n            -- A deck open still commits one battle render below (input retirement,\\n            -- art ownership and suspension), after the host's visibility writes.\\n            self.battleUI:setActive(self.mode == \\\"battle\\\" and not deckOpen and not potionOpen and not blocked,\\n                suspendBattle(run,deckOpen,potionOpen),self.mode=='battle' and deckOpen)\\n            child(\\\"battlePanel\\\"):SetVisible(self.mode == \\\"battle\\\")\",\"after\":\"    end\\n    local function coveredPaintCheck(run,battle,pass)\\n        if not self.pageReveal or not battle or run.phase~='combat' or self.battleUI.busy then return end\\n        local events,epoch=battle.events,self.pageReveal.epoch\\n        local eventCount=#events\\n        -- Inventory and the health cap can change without a combat event.\\n        local potionInventory,maxHp=battle.potionInventory,run.maxHp\\n        return function()\\n            return visibilityPass==pass and self.run==run and run.phase=='combat' and run.combat==battle\\n                and self.deckUI.visible and not self.battleUI.active and not self.battleUI.busy\\n                and self.pageReveal.epoch==epoch and battle.events==events and #events==eventCount\\n                and battle.potionInventory==potionInventory and run.maxHp==maxHp\\n        end\\n    end\\n    local function refreshBattleVisibility(run,deckOpen,potionOpen,blocked,pass)\\n        -- Reuse a cover only after its eager render has committed suspension.\\n        -- The active flag changes before the native setter and can survive failure.\\n        local deckBattle=self.mode=='battle' and deckOpen and run and run.combat or nil\\n        local deferDeckRender=deckBattle~=nil and coveredDeckBattle==deckBattle\\n        local coveredPaint\\n        if not deferDeckRender then\\n            coveredDeckBattle=nil\\n            coveredPaint=coveredPaintCheck(run,deckBattle,pass)\\n        end\\n        self.battleUI:setActive(self.mode == \\\"battle\\\" and not deckOpen and not potionOpen and not blocked,\\n            suspendBattle(run,deckOpen,potionOpen),deferDeckRender)\\n        if visibilityPass==pass then coveredDeckBattle=deckBattle end\\n        return coveredPaint\\n    end\\n    return function(run,inMenu,deckOpen,potionOpen,blocked)\\n            visibilityPass=visibilityPass+1\\n            local pass=visibilityPass\\n            if syncNative then syncNative(run) end\\n            menu:SetVisible(inMenu and not self.characterOpen and not self.easterEggOpen)\\n            local coveredPaint=refreshBattleVisibility(run,deckOpen,potionOpen,blocked,pass)\\n            child(\\\"battlePanel\\\"):SetVisible(self.mode == \\\"battle\\\")\"},\n  {\"at\":312,\"before\":\"            child(\\\"nodePanel\\\"):SetVisible(self.mode == \\\"node\\\")\\n        end\",\"after\":\"            child(\\\"nodePanel\\\"):SetVisible(self.mode == \\\"node\\\")\\n            return coveredPaint\\n        end\"},\n  {\"at\":317,\"before\":\"function M.renderBattlePage(self,child)\\n    return function(run)\\n            self.battleUI:render()\\n            if run.phase == \\\"combat\\\" and self.presentedBattle ~= run.combat then\",\"after\":\"function M.renderBattlePage(self,child)\\n    return function(run,coveredPaint)\\n            -- Page readiness can reuse the eager deck cover, unless a native\\n            -- callback advanced the page or the combat after that paint.\\n            if not (coveredPaint and coveredPaint()) then\\n                self.battleUI:render()\\n            end\\n            if run.phase == \\\"combat\\\" and self.presentedBattle ~= run.combat then\"},\n  {\"at\":370,\"before\":\"function M.renderCurrentPage(self,renderBattlePage,renderMapPage,platform)\\n    return function(run,deckOpen,potionOpen,blocked,covering)\\n            local entry=self.nodeEntry\",\"after\":\"function M.renderCurrentPage(self,renderBattlePage,renderMapPage,platform)\\n    return function(run,deckOpen,potionOpen,blocked,covering,coveredPaint)\\n            local entry=self.nodeEntry\"},\n  {\"at\":375,\"before\":\"            if self.mode == \\\"battle\\\" then\\n                renderBattlePage(run)\\n            elseif self.mode == \\\"map\\\" then\",\"after\":\"            if self.mode == \\\"battle\\\" then\\n                renderBattlePage(run,coveredPaint)\\n            elseif self.mode == \\\"map\\\" then\"},\n  {\"at\":659,\"before\":\"            refreshUtilities(run,inMenu,deckOpen,potionOpen,blocked,returnAvailable)\\n            refreshPageVisibility(run,inMenu,deckOpen,potionOpen,blocked)\\n            renderCurrentPage(run,deckOpen,potionOpen,blocked,covering)\\n            bgm:update(self.settlementRequested and \\\"stop\\\" or Bgm.scene(self.mode, run, self.battleUI.busy, bgm.cue))\",\"after\":\"            refreshUtilities(run,inMenu,deckOpen,potionOpen,blocked,returnAvailable)\\n            local coveredPaint=refreshPageVisibility(run,inMenu,deckOpen,potionOpen,blocked)\\n            renderCurrentPage(run,deckOpen,potionOpen,blocked,covering,coveredPaint)\\n            bgm:update(self.settlementRequested and \\\"stop\\\" or Bgm.scene(self.mode, run, self.battleUI.busy, bgm.cue))\"},\n ],\n});\nfunction beforeRewardsBackExtraction(path,source){\n if(path!==rewardsBackView)return source;\n const current=matches(source,rewardsBackViewSuccessor);\n if(!current&&!matches(source,rewardsBackViewBeforeCover))return source;\n let text=normalize(source);\n if(current){\n  text=restoreExactFixtureHunks(coveredBattleReplay,path,text);\n  assert(matches(text,rewardsBackViewBeforeCover),'exact first-cover render predecessor');\n }\n const helper=`local function refreshRewardsBack(button,available)\n    button:SetVisible(available)\n    if button:GetChild('v25Face') then\n        require('abyss_v25_menu_view').button(button,available)\n    end\n    -- Route preview raises the map. Raise this sibling when navigation returns.\n    if available then button:SetAsLastSibling() end\nend\n\n`;\n const inline=`local rewardsBack=child(\"combatRewards\")\n            rewardsBack:SetVisible(returnAvailable)\n            if rewardsBack:GetChild('v25Face') then\n                require('abyss_v25_menu_view').button(rewardsBack,returnAvailable)\n            end\n            -- Route preview raises the full-page map. Restore this sibling above it\n            -- when returning to navigation; visibility alone leaves it occluded.\n            if returnAvailable then rewardsBack:SetAsLastSibling() end`;\n const call='refreshRewardsBack(child(\"combatRewards\"),returnAvailable)';\n assert.equal(text.split(helper).length,2,'exact rewards back helper extraction');\n assert.equal(text.split(call).length,2,'exact rewards back helper call');\n const prior=text.replace(helper,'').replace(call,inline);\n assert(matches(prior,potionBackflow.files[path].after),'exact rewards back predecessor');\n return source.includes('\\r\\n')?prior.replaceAll('\\n','\\r\\n'):prior;\n}\nexport function beforePotionBackflow(path,source){\n const row=Object.hasOwn(potionBackflow.files,path)&&potionBackflow.files[path];\n source=beforeRewardsBackExtraction(path,source);\n if(!row||!matches(source,row.after))return source;"
   },
   {
    "at": 144,
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
  "afterSha256": "70f6053e3992f7c2d32583555e6d87b59a249a184965253be08c5a626a3d9cea",
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
    "at": 1994,
    "before": " for(const [path,row]of Object.entries(menuRedCiProof.addedLua)){\n  assert.equal(liveDiskReadFileSync(path,'utf8').replaceAll('\\r\\n','\\n'),row.source);\n  assert.equal(hash(row.source),row.sha256);\n  assert.throws(()=>menuRedPriorLua(lua,(p,e)=>liveDiskReadFileSync(p,e)+(p===path?'\\n':'')),/added menu Lua source/);\n }",
    "after": " for(const [path,row]of Object.entries(menuRedCiProof.addedLua)){\n  assert.equal(replayInput(path,row.sha256,()=>liveDiskReadFileSync(path,'utf8').replaceAll('\\r\\n','\\n')),row.source);\n  assert.equal(hash(row.source),row.sha256);\n  assert.throws(()=>menuRedPriorLua(lua,(p,e)=>rawBootstrapReadFileSync(p,e)+(p===path?'\\n':'')),/added menu Lua source/);\n }"
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
  "afterSha256": "9e3606266f404f4992c32eb168b8924314deaf129ecbe2ac09c8fd2641efc954",
  "hunks": [
   {
    "at": 4,
    "before": "import {gunzipSync} from 'node:zlib';\nimport {exactSourceMatches as matches} from './source-fingerprint.mjs';\nimport {authenticateInputRetirement,beforeInputRetirement,beforeInputRetirementReader,inputRetirementOwns,isCurrentInputRetirementSource,beforeCombatEvents,combatEventsOwns,beforeDevelopUiBackflows,assertPointerInputSource,pointerInputPath,retiredControllerPath,readRetiredController} from './input-retirement-source.mjs';",
    "after": "import {gunzipSync} from 'node:zlib';\nimport {exactSourceMatches as matches,sourceConfigLayoutMatches} from './source-fingerprint.mjs';\nimport {authenticateInputRetirement,beforeInputRetirement,beforeInputRetirementReader,inputRetirementOwns,isCurrentInputRetirementSource,beforeCombatEvents,combatEventsOwns,beforeDevelopUiBackflows,assertPointerInputSource,pointerInputPath,retiredControllerPath,readRetiredController} from './input-retirement-source.mjs';"
   },
   {
    "at": 305,
    "before": "\nexport const configSourceTokens=source=>source.replace(/\"(?:\\\\.|[^\"\\\\])*\"|[ \\t\\r\\n]+/g,token=>token.startsWith('\"')?token:'');\nexport function isSessionRelicSuccessor(path,source,{allowConfigLayout=false}={}){",
    "after": "\nexport {configSourceTokens} from './source-fingerprint.mjs';\nexport function isSessionRelicSuccessor(path,source,{allowConfigLayout=false}={}){"
   },
   {
    "at": 311,
    "before": " if(matches(source,expected))return true;\n if(!allowConfigLayout||!expected.tokensSha256||typeof source!=='string'||source.includes('\\r\\r\\n'))return false;\n if(hash(configSourceTokens(source))!==expected.tokensSha256)return false;\n try{JSON.parse(source);return true;}catch{return false;}\n}",
    "after": " if(matches(source,expected))return true;\n return allowConfigLayout&&sourceConfigLayoutMatches(source,expected.tokensSha256);\n}"
   },
   {
    "at": 331,
    "before": "}\nfunction authenticateDevelopBackflowWithReaders(path,source,readLive,readLinked,options){",
    "after": "}\nfunction readBackflowOwner(read,path){\n try{return read(path);}\n catch(error){assert.fail('combined linked owner missing: '+path+': '+String(error?.message??error));}\n}\nfunction authenticateDevelopBackflowWithReaders(path,source,readLive,readLinked,options){"
   },
   {
    "at": 338,
    "before": " if(priorUi!==source){\n  const live=readLive(path);\n  assert(typeof live==='string'&&live.replaceAll('\\r\\n','\\n')===source.replaceAll('\\r\\n','\\n'),",
    "after": " if(priorUi!==source){\n  const live=readBackflowOwner(readLive,path);\n  assert(typeof live==='string'&&live.replaceAll('\\r\\n','\\n')===source.replaceAll('\\r\\n','\\n'),"
   },
   {
    "at": 347,
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
  "afterSha256": "51199b387822e3f4c0c1e7a81fbd36c9bf5e4b7f13a381af3957685d475cf887",
  "hunks": [
   {
    "at": 73,
    "before": "});\ntest('runtime UI negative control: deferred activation violates render ordering',()=>{\n const module='abyss_game_ui_view',source=readFileSync(`src/lua/${module}.lua`,'utf8');\n const anchor='suspendBattle(run,deckOpen,potionOpen))';assert.equal(source.split(anchor).length-1,1);\n const entry=join(tmpdir(),`gameui-render-mutant-${randomUUID()}.lua`);\n writeFileSync(entry,`package.preload[${luaString(module)}]=assert(load(${luaString(source.replace(anchor,'suspendBattle(run,deckOpen,potionOpen),true)'))},'@${module}-mutant'))\\ndofile('tests/lua/runtime_ui_hotpaths.lua')\\n`);\n try{const result=runLua(entry);assert.notEqual(result.status,0);assert.match(result.stdout+result.stderr,/GameUI refresh must preserve both observable render boundaries/);}finally{unlinkSync(entry);}",
    "after": "});\nconst activation='suspendBattle(run,deckOpen,potionOpen),deferDeckRender)';\ntest('runtime UI negative control: deferred activation violates render ordering',()=>{\n const module='abyss_game_ui_view',source=readFileSync(`src/lua/${module}.lua`,'utf8');\n assert.equal(source.split(activation).length-1,1);\n const entry=join(tmpdir(),`gameui-render-mutant-${randomUUID()}.lua`);\n writeFileSync(entry,`package.preload[${luaString(module)}]=assert(load(${luaString(source.replace(activation,'suspendBattle(run,deckOpen,potionOpen),true)'))},'@${module}-mutant'))\\ndofile('tests/lua/runtime_ui_hotpaths.lua')\\n`);\n try{const result=runLua(entry);assert.notEqual(result.status,0);assert.match(result.stdout+result.stderr,/GameUI refresh must preserve both observable render boundaries/);}finally{unlinkSync(entry);}"
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
  "afterSha256": "68979368cc5ec145d2c43e4cc00b7ee095bea8b34e74e8f81ee9979e1b3499de",
  "hunks": [
   {
    "at": 6,
    "before": "import {fileURLToPath,pathToFileURL} from 'node:url';\nimport {tmpdir} from 'node:os';\nimport {preArtFeatureSource as currentFeature,preHistoricalArtFeatureSource as currentHistory} from './helpers/art-feature-source-inverse.mjs';",
    "after": "import {fileURLToPath,pathToFileURL} from 'node:url';\nimport {availableParallelism,tmpdir} from 'node:os';\nimport {hasTestNameFilter,runIsolatedTest} from './helpers/isolated-historical-cases.mjs';\nimport {preArtFeatureSource as currentFeature,preHistoricalArtFeatureSource as currentHistory} from './helpers/art-feature-source-inverse.mjs';"
   },
   {
    "at": 19,
    "before": "import {beforeCharacterPreparationSource} from './helpers/character-preparation-source.mjs';\n",
    "after": "import {beforeCharacterPreparationSource} from './helpers/character-preparation-source.mjs';\nimport {pointerInputPath,readRetiredController,retiredControllerPath} from './helpers/input-retirement-source.mjs';\n"
   },
   {
    "at": 239,
    "before": "]);\ntest('current feature and history entries authenticate supported intermediates and freshly read every raw owner',()=>{\n for(const [path,expected]of Object.entries(currentTargets)){\n  const current=readFileSync(path,'utf8').replaceAll('\\r\\n','\\n');\n  assert.notEqual(hash(expected),proof.files[path].beforeSha256,'a supported intermediate is not original feature history: '+path);",
    "after": "]);\nconst liveOwnerCase='current feature and history entries authenticate supported intermediates and freshly read every raw owner';\nconst liveOwnerWorker='--art-feature-owner-slice';\ntest(liveOwnerCase,async()=>{\n const targets=Object.entries(currentTargets);\n assert.equal(targets.length,4,'the feature oracle binds four present-day hosts');\n let selected=targets;\n if(process.argv[2]===liveOwnerWorker){\n  const index=Number(process.argv[3]);assert(index===0||index===1);\n  selected=targets.filter((_,position)=>position%2===index);\n }else if(availableParallelism()>=2&&!hasTestNameFilter()){\n  const outcomes=await Promise.allSettled([0,1].map(index=>runIsolatedTest(import.meta.url,\n   [liveOwnerWorker,String(index)],[`--test-name-pattern=^${liveOwnerCase}$`])));\n  for(const result of outcomes)if(result.status==='rejected')throw result.reason;\n  return;\n }\n const disk=path=>readFileSync(path,'utf8');\n assert.throws(()=>disk(retiredControllerPath),{code:'ENOENT'});\n const retired=readRetiredController(disk).source;\n const owners=[...sourceEpoch.proof.owners,pointerInputPath];\n const inputs=new Map();\n const currentBytes=owner=>{\n  if(owner===retiredControllerPath)return undefined;\n  if(!inputs.has(owner))inputs.set(owner,disk(owner));\n  return inputs.get(owner);\n };\n for(const [path,expected]of selected){\n  const current=currentBytes(path).replaceAll('\\r\\n','\\n');\n  assert.notEqual(hash(expected),proof.files[path].beforeSha256,'a supported intermediate is not original feature history: '+path);"
   },
   {
    "at": 274,
    "before": "     if(mode==='missing')return undefined;if(mode==='null')return null;\n     if(mode==='buffer')return Buffer.from(readFileSync(owner));\n     if(mode==='changed')return readFileSync(owner,'utf8')+'\\n';\n    }\n    return readFileSync(owner,'utf8');\n   };",
    "after": "     if(mode==='missing')return undefined;if(mode==='null')return null;\n     const source=owner===retiredControllerPath?retired:currentBytes(owner);\n     if(mode==='present')return source;\n     if(mode==='buffer')return Buffer.from(source);\n     if(mode==='changed')return source+'\\n';\n    }\n    return currentBytes(owner);\n   };"
   },
   {
    "at": 283,
    "before": "   check();const first=[...seen];\n   for(const owner of sourceEpoch.proof.owners)assert(first.includes(owner),'complete dynamic current owner: '+owner);\n   seen.length=0;check();assert.deepEqual(seen,first,'warm calls repeat the entire raw read sequence');\n   assert.equal(project(path,current.replaceAll('\\n','\\r\\n'),{readSource}),expected,'current CRLF input');\n   for(const owner of sourceEpoch.proof.owners){\n    for(const fault of ['changed','missing','null','buffer','throw']){\n     seen.length=0;bad=owner;mode=fault;\n     for(let repeat=0;repeat<2;repeat++)assert.throws(check,error=>{\n      assert.equal(error.code,'ERR_ASSERTION');assert.match(error.message,/linked owner/);assert(error.message.includes(owner));\n      if(fault==='throw')assert.match(error.message,/feature raw reader sentinel/);return true;",
    "after": "   check();const first=[...seen];\n   for(const owner of owners)assert(first.includes(owner),'complete dynamic current owner: '+owner);\n   seen.length=0;check();assert.deepEqual(seen,first,'warm calls repeat the entire raw read sequence');\n   assert.equal(project(path,current.replaceAll('\\n','\\r\\n'),{readSource}),expected,'current CRLF input');\n   for(const owner of owners){\n    if(owner===retiredControllerPath)for(mode of ['missing','null']){\n     bad=owner;seen.length=0;check();assert.deepEqual(seen,first,'retired Controller remains absent');\n    }\n    const faults=owner===retiredControllerPath?['present','changed','buffer','throw']:['changed','missing','null','buffer','throw'];\n    for(const fault of faults){\n     seen.length=0;bad=owner;mode=fault;\n     for(let repeat=0;repeat<2;repeat++)assert.throws(check,error=>{\n      const reported=owner===pointerInputPath&&fault!=='throw'?retiredControllerPath:owner;\n      assert.equal(error.code,'ERR_ASSERTION');assert.match(error.message,/linked owner/);assert(error.message.includes(reported));\n      if(fault==='throw')assert.match(error.message,/feature raw reader sentinel/);return true;"
   }
  ]
 },
 {
  "path": "tests/game-ui-extraction-source-inverse.test.mjs",
  "beforeSha256": "6ca8445df8f38cee88937c6ccdc28384f9042d555c2b86f59761b4558ee50146",
  "afterSha256": "baff968d896e057cb66763e7ffdf3c08ff4ea37b2174b0e6bbbb73eede88e031",
  "hunks": [
   {
    "at": 0,
    "before": "import {copyIntegrationSourceClosure} from './helpers/copy-integration-source-closure.mjs';\nimport test from 'node:test';\nimport assert from 'node:assert/strict';",
    "after": "import {copyIntegrationSourceClosure} from './helpers/copy-integration-source-closure.mjs';\nimport nodeTest from 'node:test';\nimport assert from 'node:assert/strict';"
   },
   {
    "at": 4,
    "before": "import {join,dirname,resolve,relative,isAbsolute} from 'node:path';\nimport {tmpdir} from 'node:os';\nimport {pathToFileURL} from 'node:url';",
    "after": "import {join,dirname,resolve,relative,isAbsolute} from 'node:path';\nimport {availableParallelism,tmpdir} from 'node:os';\nimport {hasTestNameFilter,runIsolatedTest} from './helpers/isolated-historical-cases.mjs';\nimport {pathToFileURL} from 'node:url';"
   },
   {
    "at": 15,
    "before": "import {beforeLumineSource} from './helpers/lumine-portrait-source.mjs';\n// Keep the existing two/four-owner contracts in their original source epochs.",
    "after": "import {beforeLumineSource} from './helpers/lumine-portrait-source.mjs';\nimport {pointerInputPath,readRetiredController,retiredControllerPath} from './helpers/input-retirement-source.mjs';\nconst cases=[];\nconst test=(name,body)=>cases.push([name,body]);\n// Keep the existing two/four-owner contracts in their original source epochs."
   },
   {
    "at": 24,
    "before": "const currentRaw=p=>readFileSync(p,'utf8');\nconst cursesPriorRead=p=>{\n const source=sourceSlice(p,currentRaw(p),'cursesPrior',currentRaw);\n return beforeLumineSource(p,beforePc13ThenV2UiHudSource(p,source,currentRaw),currentRaw);\n};\n// The new potion source witness reads these owners again after the frozen layer's owner scan.\nconst potionRereads=['src/lua/abyss_battle_card_gestures.lua','src/lua/abyss_battle_ui.lua'];\ntest('portrait demand layer authenticates fresh complete owners and rejects warm drift before entering the prior epoch',()=>{\n const sourceEpoch=portraitDemandEpoch;\n const path='src/lua/abyss_traveler_portraits.lua',raw=cursesPriorRead;\n const source=raw(path).replaceAll('\\r\\n','\\n'),target=sourceEpoch.proof.targets.noncombatDemandPrior;",
    "after": "const currentRaw=p=>readFileSync(p,'utf8');\nfunction cursesPriorReader(){\n const cohort=new Map();\n return p=>{\n  if(!cohort.has(p)){\n   const current=p===retiredControllerPath?readRetiredController(currentRaw).source:currentRaw(p);\n   const source=p===architecture?sourceEpoch.preCombinedSource(p,current,{target:'cursesPrior',readSource:currentRaw}):sourceSlice(p,current,'cursesPrior',currentRaw);\n   cohort.set(p,beforeLumineSource(p,beforePc13ThenV2UiHudSource(p,source,currentRaw),currentRaw));\n  }\n  return cohort.get(p);\n };\n}\n// The authenticated portrait continuation reads these linked owners after the frozen base scan.\nconst portraitRereads=['battle_info_content','battle_render_hud','battle_card_glow','battle_render_hud','battle_render_hud']\n .map(name=>'src/lua/abyss_'+name+'.lua');\ntest('portrait demand layer authenticates fresh complete owners and rejects warm drift before entering the prior epoch',()=>{\n const sourceEpoch=portraitDemandEpoch;\n const path='src/lua/abyss_traveler_portraits.lua',raw=cursesPriorReader();\n const source=raw(path).replaceAll('\\r\\n','\\n'),target=sourceEpoch.proof.targets.noncombatDemandPrior;"
   },
   {
    "at": 48,
    "before": "  reads=[];assert.equal(sourceEpoch.preCombinedSource(path,input,{target:'noncombatDemandPrior',readSource:reader}),target.files[path].source);\n  assert.deepEqual(reads,[...sourceEpoch.proof.owners,...potionRereads]);\n }",
    "after": "  reads=[];assert.equal(sourceEpoch.preCombinedSource(path,input,{target:'noncombatDemandPrior',readSource:reader}),target.files[path].source);\n  assert.deepEqual(reads,[...sourceEpoch.proof.owners,...portraitRereads]);\n }"
   },
   {
    "at": 56,
    "before": " for(const drift of [source+'\\n',null]){live=drift;assert.throws(()=>sourceEpoch.preCombinedSource(path,source,{target:'noncombatDemandPrior',readSource:mutable}),/combined linked owner identity/);}\n for(const owner of potionRereads){\n  let seen=0;\n  const late=p=>p===owner&&++seen===2?null:raw(p);\n  assert.throws(()=>sourceEpoch.preCombinedSource(path,source,{target:'noncombatDemandPrior',readSource:late}),\n   error=>error.message.includes('combined linked owner identity: '+owner+' changed during owner validation'));\n  assert.equal(seen,2);\n }",
    "after": " for(const drift of [source+'\\n',null]){live=drift;assert.throws(()=>sourceEpoch.preCombinedSource(path,source,{target:'noncombatDemandPrior',readSource:mutable}),/combined linked owner identity/);}\n for(const [index,owner] of portraitRereads.entries()){\n  const occurrence=[...sourceEpoch.proof.owners,...portraitRereads.slice(0,index+1)].filter(path=>path===owner).length;\n  let seen=0;\n  const late=p=>p===owner&&++seen===occurrence?null:raw(p);\n  assert.throws(()=>sourceEpoch.preCombinedSource(path,source,{target:'noncombatDemandPrior',readSource:late}),\n   error=>error.message.includes(owner)&&/linked owner/.test(error.message));\n  assert.equal(seen,occurrence);\n }"
   },
   {
    "at": 72,
    "before": " assert.equal(target.commit,'3a061a76b5eb917ac0f4213c01a9cbafd28d1824');\n const raw=cursesPriorRead;\n const live=p=>sourceEpoch.preCombinedSource(p,raw(p),{target:'noncombatDemandPrior',readSource:raw});",
    "after": " assert.equal(target.commit,'3a061a76b5eb917ac0f4213c01a9cbafd28d1824');\n const raw=cursesPriorReader();\n const live=p=>sourceEpoch.preCombinedSource(p,raw(p),{target:'noncombatDemandPrior',readSource:raw});"
   },
   {
    "at": 77,
    "before": "  assert.equal(epoch.preCombinedSource(path,source,{target:'noncombatPrior',readSource:p=>{fresh.push(p);return live(p);}}),target.files[path].source);\n  assert.deepEqual(fresh,[...epoch.proof.owners,...potionRereads],'every owner, including both potion rereads, is read freshly');\n  for(const input of [source+'\\n',source.slice(1),target.files[path].source,null,{}]){",
    "after": "  assert.equal(epoch.preCombinedSource(path,source,{target:'noncombatPrior',readSource:p=>{fresh.push(p);return live(p);}}),target.files[path].source);\n  assert.deepEqual(fresh,[...epoch.proof.owners,...portraitRereads],'every frozen owner and continuation is read freshly');\n  for(const input of [source+'\\n',source.slice(1),target.files[path].source,null,{}]){"
   },
   {
    "at": 280,
    "before": " const live=join(root,'combined-live'),destination=join(root,'combined-copy');\n for(const path of sourceEpoch.proof.owners){const target=join(live,path);mkdirSync(dirname(target),{recursive:true});copyFileSync(path,target);}\n for(const path of added){const target=join(destination,path);mkdirSync(dirname(target),{recursive:true});copyFileSync(path,target);}\n const retire=prepare(destination,{sourceRoot:live});\n for(const owner of sourceEpoch.proof.owners){\n  const file=join(live,owner),original=readFileSync(file,'utf8');",
    "after": " const live=join(root,'combined-live'),destination=join(root,'combined-copy');\n const visits=new Set();\n const readClosure=path=>{visits.add(path);return currentRaw(path);};\n for(const path of added){\n  const accepted=sourceEpoch.proof.targets.develop.files[path];\n  assert.equal(accepted.sha256,proof.files[path].afterSha256,'exact retirement predecessor identity: '+path);\n  const projected=sourceEpoch.preCombinedSource(path,currentRaw(path),{target:'develop',readSource:readClosure});\n  assert.equal(projected.replaceAll('\\r\\n','\\n'),accepted.source,'exact live retirement owner: '+path);\n }\n assert(sourceEpoch.proof.owners.every(path=>visits.has(path)),'complete current linked owner set');\n assert(visits.has(pointerInputPath),'complete live pointer replacement');\n const owners=[...visits].filter(path=>path!==retiredControllerPath);\n for(const path of owners){const target=join(live,path);mkdirSync(dirname(target),{recursive:true});copyFileSync(path,target);}\n for(const path of added){const target=join(destination,path);mkdirSync(dirname(target),{recursive:true});copyFileSync(path,target);}\n const retire=prepare(destination,{sourceRoot:live});\n const restoredController=join(live,retiredControllerPath);\n writeFileSync(restoredController,readRetiredController(currentRaw).source);\n assert.throws(retire,/retirement module/,'even an exact retired controller cannot be reintroduced');\n rmSync(restoredController);\n for(const owner of owners){\n  const file=join(live,owner),original=readFileSync(file,'utf8');"
   },
   {
    "at": 387,
    "before": "",
    "after": "\n// Windows job 137561143801 spent almost 42 minutes in this one file. The\n// expensive cases and their independent filesystem fixtures can run in pairs.\nconst firstLane=new Set([\n 'actual current Host reaches every direct and transitive consumer with frozen historical results',\n 'one complete extraction restores immutable full Host/config and authenticates each fresh owner',\n 'portrait demand layer authenticates fresh complete owners and rejects warm drift before entering the prior epoch',\n 'retirement verifies the full isolated destination before deleting, and revalidates deferred cleanup',\n 'retirement rejects live Lua directories and source ancestors before any deletion',\n]);\nconst lanes=[cases.filter(([name])=>firstLane.has(name)),cases.filter(([name])=>!firstLane.has(name))];\nassert.equal(lanes[0].length,firstLane.size,'all first-lane cases are registered');\nassert.equal(new Set(cases.map(([name])=>name)).size,cases.length,'every registered case is unique');\nconst laneFlag='--isolated-game-ui-source-lane';\nif(process.argv[2]===laneFlag){\n const lane=lanes[Number(process.argv[3])];assert(lane,'registered GameUI source lane');\n for(const entry of lane)nodeTest(...entry);\n}else if(process.platform==='win32'&&process.env.GITHUB_ACTIONS==='true'&&process.env.RUNNER_ENVIRONMENT==='github-hosted'\n &&availableParallelism()>=2&&!hasTestNameFilter()){\n nodeTest('Windows GameUI source replays',async()=>{\n  const outcomes=await Promise.allSettled(lanes.map((lane,index)=>runIsolatedTest(import.meta.url,[laneFlag,String(index)],[],lane.length)));\n  for(const result of outcomes){\n   if(result.status==='rejected')throw result.reason;\n   process.stdout.write(result.value);\n  }\n });\n}else{\n for(const entry of cases)nodeTest(...entry);\n}\n"
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
  "afterSha256": "062eda6fd36554eb592ead5c9a19035a9ff48575167f5cc0c2bcf3c26235ea0e",
  "hunks": [
   {
    "at": 0,
    "before": "import { readFileSync, readdirSync } from 'node:fs';\nimport { spawnSync } from 'node:child_process';\nimport { resolve } from 'node:path';\nimport { pathToFileURL } from 'node:url';",
    "after": "import { constants, cpSync, lstatSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from 'node:fs';\nimport { spawn, spawnSync } from 'node:child_process';\nimport { availableParallelism, tmpdir } from 'node:os';\nimport { isAbsolute, join, relative, resolve, sep } from 'node:path';\nimport { pathToFileURL } from 'node:url';"
   },
   {
    "at": 14,
    "before": "const artFeatureInverseTest = ['tests', 'art-feature-source-inverse.test.mjs'].join('/');\ntimings.js.win32[artFeatureInverseTest] = Math.max(timings.js.win32[artFeatureInverseTest] ?? timings.unknownJsMs, 431203);\n",
    "after": "const artFeatureInverseTest = ['tests', 'art-feature-source-inverse.test.mjs'].join('/');\nconst hostLifecycleTest = ['tests', 'game-ui-host-lifecycle.test.mjs'].join('/');\nconst hostResultTest = ['tests', 'game-ui-host-result.test.mjs'].join('/');\nconst windowsPresentationReplays = ['colorless-catalog-source', 'presentation-m3-integration']\n  .map(name => ['tests', name + '.test.mjs'].join('/'));\ntimings.js.win32[artFeatureInverseTest] = Math.max(timings.js.win32[artFeatureInverseTest] ?? timings.unknownJsMs, 431203);\n\n// Reserve the work that completed in POSIX jobs 137444936421, 137444936442,\n// 137444936458, 137444936507 and 137444936550 before their 30-minute cutoff.\n// Jobs 137468791737, 137468791821, 137468791838, 137468791852 and\n// 137468791853 from the next attempt exposed underweighted replay files.\n// Completed cases and file observations guide placement only.\nconst linuxReplayMinimumMs = Object.freeze({\n  'act1-choice-responsibilities.test.mjs': 153000,\n  'actor-lifecycle.test.mjs': 98000,\n  'approved-node-ui-refactor.test.mjs': 526000,\n  'approved-ui-inverse.test.mjs': 1295000,\n  'architecture-composition-format.test.mjs': 420000,\n  'art-feature-source-inverse.test.mjs': 412000,\n  'battle-max-hp-config-inverse.test.mjs': 124000,\n  'boss-ui-fixture-composition.test.mjs': 64000,\n  'card-origin-source-inverse.test.mjs': 149000,\n  'combat-reactions-architecture-inverse.test.mjs': 137000,\n  'competition-roster.test.mjs': 505000,\n  'core-architecture-inverse.test.mjs': 362000,\n  'core-lifecycle-source-inverse.test.mjs': 713000,\n  'defect-integration-source.test.mjs': 153000,\n  'end-turn-responsibilities.test.mjs': 252000,\n  'event-production-source-inverse.test.mjs': 100000,\n  'final-integration-source.test.mjs': 318000,\n  'game-ui-extraction-source-inverse.test.mjs': 870000,\n  'game-ui-host-result.test.mjs': 188000,\n  'max-hp-accepted-source-inverse.test.mjs': 677000,\n  'mobile-qa-source-migration.test.mjs': 140000,\n  'native-enemy-theme-inverse.test.mjs': 54000,\n  'nodes-battle-max-hp-config-inverse.test.mjs': 90000,\n  'player-death-inverse.test.mjs': 172000,\n  'potion-callback-source.test.mjs': 238000,\n  'power-shop-boundaries.test.mjs': 486000,\n  'presentation-native-m3-contract.test.mjs': 1037000,\n  'relic-query-source-inverse.test.mjs': 123000,\n  // Job 137510449969 spent over 22 minutes in this file before cutoff.\n  'task77-current-source-layers.test.mjs': 1295000,\n});\n\n// Completed replay cases in Windows jobs 137468791786, 137468791799,\n// 137468791818, 137468791851, 137468791860, 137468791861, 137468791871\n// and 137468791996, and complete files from 137492433757, 137492433852\n// and 137492433888.\nconst windowsReplayMinimumMs = Object.freeze({\n  'act1-choice-responsibilities.test.mjs': 195000,\n  // Budget the longest completed case after isolating the three cases.\n  'approved-ui-inverse.test.mjs': 1455000,\n  'architecture-composition-format.test.mjs': 1190000,\n  // The 1786s live-owner case in job 137510449987 now runs in two workers.\n  'art-feature-source-inverse.test.mjs': 1000000,\n  'battle-max-hp-config-inverse.test.mjs': 681000,\n  'card-origin-source-inverse.test.mjs': 360000,\n  'colorless-catalog-source.test.mjs': 566000,\n  'compendium-source-inverse.test.mjs': 690000,\n  'competition-roster-config-composition.test.mjs': 287000,\n  'competition-roster.test.mjs': 735000,\n  'core-architecture-inverse.test.mjs': 321000,\n  // Job 137468791861 spent over half an hour on this file before cutoff.\n  'core-lifecycle-source-inverse.test.mjs': 800000,\n  'death-settlement-guard-inverse.test.mjs': 186000,\n  'defect-integration-source.test.mjs': 474000,\n  'formal-campaign-entry.test.mjs': 233000,\n  'game-ui-extraction-source-inverse.test.mjs': 2087000,\n  'living-wall-architecture-inverse.test.mjs': 1013000,\n  'native-candidate-art.test.mjs': 113000,\n  'official-assets-runtime.test.mjs': 216000,\n  'p0-presentation-inverse.test.mjs': 713000,\n  'potion-callback-source.test.mjs': 132000,\n  'power-shop-boundaries.test.mjs': 1364000,\n  'presentation-native-m3-contract.test.mjs': 791000,\n  // Job 137510450112 completed this file before its Lua phase reached cutoff.\n  'ready-art-source-inverse.test.mjs': 1166000,\n  'reward-query-boundary-source.test.mjs': 1440000,\n  'round3-catalog-source-inverse.test.mjs': 278000,\n  'run-architecture-inverse.test.mjs': 384000,\n});\n\nexport const replayPlanningMinimumMs = Object.freeze({ linux: linuxReplayMinimumMs, win32: windowsReplayMinimumMs });\n\n// Completed per-file observations from jobs 137561143750, 137561143756,\n// 137561143768 and 137593688616. Balance lanes without moving the Full inventory.\nconst hostedLaneMinimumMs = {\n  linux: {\n    'official-assets-runtime.test.mjs': 233000,\n    'power-shop-boundaries.test.mjs': 525000,\n    'reward-query-boundary-source.test.mjs': 1112000,\n  },\n  win32: {\n    'actor-presence-source.test.mjs': 573000,\n    'art-feature-source-inverse.test.mjs': 1537000,\n    'battle-drag-click-compatibility.test.mjs': 592000,\n    'colorless-catalog-source.test.mjs': 1068000,\n    'defect-final-execute.test.mjs': 126000,\n    'defect-plan-responsibilities.test.mjs': 53000,\n    'formal-campaign-entry.test.mjs': 367000,\n    'game-ui-host-lifecycle.test.mjs': 308000,\n    'game-ui-host-result.test.mjs': 222000,\n    'max-hp-accepted-source-inverse.test.mjs': 883000,\n    'mobile-qa-source-migration.test.mjs': 143000,\n    'native-monster-art.test.mjs': 77000,\n    'presentation-m3-integration.test.mjs': 1488000,\n    'pure-source-projection-cache.test.mjs': 463000,\n    'seven-refactor-source-epoch.test.mjs': 773000,\n    'task76-owner-composition.test.mjs': 105000,\n    'watcher-final-execution.test.mjs': 366000,\n  },\n};\n"
   },
   {
    "at": 152,
    "before": "  const maps=Object.hasOwn(timings.js,platform)?[timings.js[platform]]:Object.values(timings.js);\n  return Object.fromEntries(files.map(file=>[file,Math.max(\n    ...maps.map(weights=>weights[file]??timings.unknownJsMs),\n    timings.jsPlanning?.localLowerBounds?.[file]?.durationMs??0)]));\n}",
    "after": "  const maps=Object.hasOwn(timings.js,platform)?[timings.js[platform]]:Object.values(timings.js);\n  return Object.fromEntries(files.map(file=>{\n    const name=file.slice('tests/'.length);\n    return [file,Math.max(\n      ...maps.map(weights=>weights[file]??timings.unknownJsMs),\n      timings.jsPlanning?.localLowerBounds?.[file]?.durationMs??0,\n      platform !== 'win32' ? linuxReplayMinimumMs[name] ?? 0 : 0,\n      platform !== 'linux' ? windowsReplayMinimumMs[name] ?? 0 : 0)];\n  }));\n}"
   },
   {
    "at": 166,
    "before": "  const initial = timings.initialMs?.[platform];\n  const count = Number(String(value).split('/')[1]);\n  const loads = initial && Number.isSafeInteger(count) && count > 0 && count <= 64\n    ? Array.from({length:count},(_,index)=>index===0?initial[0]:0) : undefined;\n  return partition(files, value, jsPlanningWeights(files,platform), timings.unknownJsMs,\n    loads);\n}",
    "after": "  const initial = timings.initialMs?.[platform];\n  const [index, count] = String(value).split('/').map(Number);\n  const loads = initial && Number.isSafeInteger(count) && count > 0 && count <= 64\n    ? Array.from({length:count},(_,index)=>index===0?initial[0]:0) : undefined;\n  const weights = jsPlanningWeights(files, platform);\n  const plan = partition(files, value, weights, timings.unknownJsMs, loads);\n  if (platform !== 'win32' || count !== 18 || !Object.hasOwn(weights, hostResultTest)) return plan;\n  const first = index === 1 ? plan : partition(files, '1/18', weights, timings.unknownJsMs, loads);\n  if (!first.files.includes(hostResultTest) || !windowsPresentationReplays.every(file => first.files.includes(file))) return plan;\n\n  // Windows job 137668948404 passed both source replays, but four strict Host\n  // result VMs timed out during their overlap. Job 137668948532 (shard 8)\n  // completed both suites in under 24 minutes. Isolate the original Host\n  // streams on that VM and carry the transferred cost into the Lua plan.\n  const hostCost = weights[hostResultTest];\n  plan.loads[0] -= hostCost;\n  plan.loads[7] += hostCost;\n  if (index === 1) plan.files = plan.files.filter(file => file !== hostResultTest);\n  if (index === 8) plan.files = [...plan.files, hostResultTest].sort();\n  return plan;\n}"
   },
   {
    "at": 191,
    "before": "  return files;\n}",
    "after": "  return files;\n}\n\nconst timingReport = 'build/ci-js-timings.jsonl';\nconst nodeTestArgs = files => ['--test', '--test-concurrency=1', '--test-reporter=spec',\n  '--test-reporter=./scripts/ci-timing-reporter.mjs', '--test-reporter-destination=stdout',\n  `--test-reporter-destination=${timingReport}`, ...files];\n\nfunction runInCheckout(files, cwd, env) {\n  return new Promise((resolve, reject) => {\n    const child = spawn(process.execPath, nodeTestArgs(files), {\n      cwd, env: { ...env, GITHUB_WORKSPACE: cwd }, stdio: 'inherit', windowsHide: true,\n    });\n    child.once('error', reject);\n    child.once('close', status => resolve(status ?? 1));\n  });\n}\n\nasync function runHostedShard(files, root, env) {\n  if (!lstatSync(join(root, '.git'), { throwIfNoEntry: false })?.isDirectory()) {\n    throw new Error('Hosted execution requires physical checkout metadata');\n  }\n  // The two art workers overlapped the strict native Host VM timeouts in\n  // Windows job 137561143877. Keep those files in the same serial checkout.\n  const serial = [artFeatureInverseTest, hostLifecycleTest];\n  const together = process.platform === 'win32' && serial.every(file => files.includes(file));\n  if (together && files.length === serial.length) return runInCheckout(files, root, env);\n  const snapshot = realpathSync.native(mkdtempSync(join(env.RUNNER_TEMP || tmpdir(), 'slay-ci-shard-')));\n  try {\n    const location = relative(root, snapshot);\n    if (!location || !isAbsolute(location) && location !== '..' && !location.startsWith(`..${sep}`)) {\n      throw new Error('Hosted snapshot must be outside the checkout');\n    }\n    // Each test process still runs serially in its own checkout. Copy before\n    // starting either process to isolate Git metadata, build outputs and fixtures.\n    cpSync(root, snapshot, { recursive: true, verbatimSymlinks: true, mode: constants.COPYFILE_FICLONE });\n    const weights = jsPlanningWeights(files);\n    const laneMinimum = hostedLaneMinimumMs[process.platform];\n    for (const file of files) {\n      const name = file.slice('tests/'.length);\n      weights[file] = Math.max(weights[file], laneMinimum[name] ?? 0);\n    }\n    const remaining = together ? files.filter(file => !serial.includes(file)) : files;\n    const reserved = together ? [weights[serial[0]] + weights[serial[1]], 0] : undefined;\n    const original = partition(remaining, '1/2', weights, timings.unknownJsMs, reserved).files;\n    const copy = partition(remaining, '2/2', weights, timings.unknownJsMs, reserved).files;\n    if (together) {\n      original.push(...serial);\n      original.sort();\n    }\n    const results = await Promise.allSettled([\n      runInCheckout(original, root, env), runInCheckout(copy, snapshot, env),\n    ]);\n    const copyReport = join(snapshot, timingReport);\n    const originalReport = join(root, timingReport);\n    const status = results.find(result => result.status === 'rejected');\n    if (!status) {\n      writeFileSync(originalReport, readFileSync(copyReport), { flag: 'a' });\n    }\n    if (status) throw status.reason;\n    return results.find(result => result.value !== 0)?.value ?? 0;\n  } finally {\n    rmSync(snapshot, { recursive: true, force: true, maxRetries: 2 });\n  }\n}"
   },
   {
    "at": 272,
    "before": "  delete env.NODE_TEST_CONTEXT;\n  const result = spawnSync(process.execPath, ['--test', '--test-concurrency=1', '--test-reporter=spec',\n    '--test-reporter=./scripts/ci-timing-reporter.mjs', '--test-reporter-destination=stdout',\n    '--test-reporter-destination=build/ci-js-timings.jsonl', ...plan.files], { stdio: 'inherit', env, windowsHide: true });\n  if (result.error) throw result.error;",
    "after": "  delete env.NODE_TEST_CONTEXT;\n  const root = realpathSync.native('.'), hostedOS = { linux: 'Linux', win32: 'Windows' }[process.platform];\n  if (hostedOS && env.GITHUB_ACTIONS === 'true' && env.RUNNER_OS === hostedOS\n      && env.RUNNER_ENVIRONMENT === 'github-hosted' && env.GITHUB_WORKSPACE\n      && realpathSync.native(env.GITHUB_WORKSPACE) === root && availableParallelism() >= 2 && plan.files.length >= 2) {\n    return runHostedShard(plan.files, root, env).then(status => { process.exitCode = status; });\n  }\n  const result = spawnSync(process.execPath, nodeTestArgs(plan.files), { stdio: 'inherit', env, windowsHide: true });\n  if (result.error) throw result.error;"
   },
   {
    "at": 284,
    "before": "if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {\n  try { main(process.argv.slice(2)); } catch (error) { console.error(error.message); process.exitCode = 1; }\n}",
    "after": "if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {\n  try { await main(process.argv.slice(2)); } catch (error) { console.error(error.message); process.exitCode = 1; }\n}"
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
  "afterSha256": "ea3c55fdd3e48c414165c00e56f5518d5d0d6704f39b3743e9d52c4433ce5328",
  "hunks": [
   {
    "at": 2,
    "before": "import {preIntegratedNodeUiSource} from './helpers/approved-node-ui-refactor.mjs';\nimport {historicalTest as test} from './helpers/historical-baseline-inputs.mjs';\nimport assert from 'node:assert/strict';",
    "after": "import {preIntegratedNodeUiSource} from './helpers/approved-node-ui-refactor.mjs';\nimport {runHistoricalCases} from './helpers/isolated-historical-cases.mjs';\nimport assert from 'node:assert/strict';"
   },
   {
    "at": 12,
    "before": "const read=p=>readBeforeMobileQaSource(p).replaceAll('\\r\\n','\\n');\nconst potionPath='tests/lua/battle_ui_potion_target_failures.lua';",
    "after": "const read=p=>readBeforeMobileQaSource(p).replaceAll('\\r\\n','\\n');\nconst cases=[];\nconst register=(name,body)=>cases.push([name,body]);\nconst potionPath='tests/lua/battle_ui_potion_target_failures.lua';"
   },
   {
    "at": 32,
    "before": "}\ntest('approved UI layer binds complete current sources and restores exactly the unchanged PR302 base',()=>{\n assert.equal(approvedUi.baseHead,'53fa164a9914dd8a7a5849ff741925dd3131f5e4');",
    "after": "}\nregister('approved UI layer binds complete current sources and restores exactly the unchanged PR302 base',()=>{\n assert.equal(approvedUi.baseHead,'53fa164a9914dd8a7a5849ff741925dd3131f5e4');"
   },
   {
    "at": 56,
    "before": "});\ntest('bounded potion registrar composes only its complete exact source before the unchanged frozen UI guard',()=>{\n const live=read(potionPath),original=originalPotionFailures(live),binding=approvedUi.files[potionPath];",
    "after": "});\nregister('bounded potion registrar composes only its complete exact source before the unchanged frozen UI guard',()=>{\n const live=read(potionPath),original=originalPotionFailures(live),binding=approvedUi.files[potionPath];"
   },
   {
    "at": 86,
    "before": "});\ntest('historical materialization consumes both all 26 original sources and every new UI consumer',()=>{\n for(const path of ['src/lua/abyss_card_display.lua','src/lua/abyss_card_skin.lua','src/lua/abyss_shop_ui.lua'])assert(approvedUi.files[path],path);",
    "after": "});\nregister('historical materialization consumes both all 26 original sources and every new UI consumer',()=>{\n for(const path of ['src/lua/abyss_card_display.lua','src/lua/abyss_card_skin.lua','src/lua/abyss_shop_ui.lua'])assert(approvedUi.files[path],path);"
   },
   {
    "at": 106,
    "before": "",
    "after": "\nrunHistoricalCases(import.meta.url,'approved UI historical replay',cases);\n"
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
  "afterSha256": "a8afebef6e0f30862db595c59dfc5e2056e3ea52207b70644a0fa3a5ae1568db",
  "hunks": [
   {
    "at": 98,
    "before": "}\nexport function createSourceEpochProjector(input,{root=process.cwd(),allowConfigLayout=false,reuseFrozenInput=false}={}){",
    "after": "}\n// Composed epochs own their new containers and inherit immutable JSON records.\n// Keep those records shared while the constructor still validates the full graph.\nexport function createComposedSourceEpochProjector(proof){\n return createSourceEpochProjector(freeze(proof),{allowConfigLayout:true,reuseFrozenInput:true});\n}\n\nexport function createSourceEpochProjector(input,{root=process.cwd(),allowConfigLayout=false,reuseFrozenInput=false}={}){"
   },
   {
    "at": 111,
    "before": " assert.match(proof.currentCommit,/^[a-f0-9]{40}$/);\n assert(Array.isArray(proof.owners));assert.equal(new Set(proof.owners).size,proof.owners.length,'unique owners');\n for(const [path,binding]of Object.entries(proof.current)){assert(validPath(path),'source path');validateBinding(binding);}",
    "after": " assert.match(proof.currentCommit,/^[a-f0-9]{40}$/);\n assert(Array.isArray(proof.owners));\n const owners=new Set(proof.owners);assert.equal(owners.size,proof.owners.length,'unique owners');\n const currentPaths=Object.keys(proof.current).sort();\n for(const [path,binding]of Object.entries(proof.current)){assert(validPath(path),'source path');validateBinding(binding);}"
   },
   {
    "at": 118,
    "before": "  assert(/^[A-Za-z0-9_-]+$/.test(name),'target name');assert.match(target.commit,/^[a-f0-9]{40}$/);\n  assert.deepEqual(Object.keys(target.files).sort(),Object.keys(proof.current).sort(),'complete target path set');\n  for(const [path,binding]of Object.entries(target.files)){\n   validateBinding(binding);\n   if(binding?.sha256!==proof.current[path]?.sha256)assert(proof.owners.includes(path),'changed source closure');\n  }",
    "after": "  assert(/^[A-Za-z0-9_-]+$/.test(name),'target name');assert.match(target.commit,/^[a-f0-9]{40}$/);\n  assert.deepEqual(Object.keys(target.files).sort(),currentPaths,'complete target path set');\n  for(const [path,binding]of Object.entries(target.files)){\n   validateBinding(binding);\n   if(binding?.sha256!==proof.current[path]?.sha256)assert(owners.has(path),'changed source closure');\n  }"
   }
  ]
 },
 {
  "path": "tests/helpers/source-fingerprint.mjs",
  "beforeSha256": "82873d43045cd012a0ed817a27d88343bd0f092d755d49a04629f98b9bd72612",
  "afterSha256": "61602dc332625a797e6d316c4871de39b4d241aa722a3f0dab3db2435576cbfd",
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
   },
   {
    "at": 30,
    "before": "",
    "after": "\n// Cache only layout calculations for the exact text supplied by the caller.\n// This never skips a source read or validates identity on an owner's behalf.\nconst configLayouts=new Map(),configLimit=2*1024*1024;\nlet configRetained=0;\nfunction readConfigLayout(source){\n let layout=configLayouts.get(source);\n if(layout)return layout;\n const tokens=source.replace(/\"(?:\\\\.|[^\"\\\\])*\"|[ \\t\\r\\n]+/g,token=>token.startsWith('\"')?token:'');\n const length=source.length+tokens.length;\n layout={tokens,length};\n if(length<=configLimit){\n  while(configLayouts.size>=128||configRetained+length>configLimit){\n   const first=configLayouts.keys().next().value;\n   configRetained-=configLayouts.get(first).length;\n   configLayouts.delete(first);\n  }\n  configLayouts.set(source,layout);\n  configRetained+=length;\n }\n return layout;\n}\nexport const configSourceTokens=source=>readConfigLayout(source).tokens;\nexport function sourceConfigLayoutMatches(source,expectedSha256){\n if(!expectedSha256||typeof source!=='string'||source.includes('\\r\\r\\n'))return false;\n const layout=readConfigLayout(source);\n layout.sha256??=createHash('sha256').update(layout.tokens).digest('hex');\n if(layout.sha256!==expectedSha256)return false;\n if(layout.valid===undefined){\n  try{JSON.parse(source);layout.valid=true;}catch{layout.valid=false;}\n }\n return layout.valid;\n}\n"
   }
  ]
 },
 {
  "path": "tests/ci-runtime.test.mjs",
  "beforeSha256": "e420cc0f4973bc975a1d0fabdbc1b316fcf34c7ccb7db0ab1efef9270bbf0876",
  "afterSha256": "1f18eaa3c9df71ec2d20c83ad88300bc55ce6807f1247bd79ddd6527f8213cf3",
  "hunks": [
   {
    "at": 26,
    "before": "import {officialAssetsFlowPlanningFloors as officialAssetsPlanningFloors} from './helpers/official-assets-flow-ci-source-inverse.mjs';\nimport { tmpdir } from 'node:os';\nimport { resolve, join } from 'node:path';",
    "after": "import {officialAssetsFlowPlanningFloors as officialAssetsPlanningFloors} from './helpers/official-assets-flow-ci-source-inverse.mjs';\nimport { availableParallelism, tmpdir } from 'node:os';\nimport { resolve, join } from 'node:path';"
   },
   {
    "at": 33,
    "before": "import {readBeforeMobileQaSource} from './helpers/mobile-qa-source-inverse.mjs';\nimport { partition, jsShard, jsPlanningWeights, discoverJs, timings } from '../scripts/ci-shards.mjs';\nimport { shardLuaScripts } from '../scripts/test-lua.mjs';",
    "after": "import {readBeforeMobileQaSource} from './helpers/mobile-qa-source-inverse.mjs';\nimport { partition, jsShard, jsPlanningWeights, discoverJs, timings, replayPlanningMinimumMs } from '../scripts/ci-shards.mjs';\nimport { shardLuaScripts } from '../scripts/test-lua.mjs';"
   },
   {
    "at": 117,
    "before": "\ntest('platform-native placement covers every current file once and unknown platforms retain the conservative fallback',()=>{\n const files=discoverJs();\n const asymmetric=files.find(file=>{\n  const floor=timings.jsPlanning?.localLowerBounds?.[file]?.durationMs??0;\n  return Math.max(timings.js.win32[file]??timings.unknownJsMs,floor)!==Math.max(timings.js.linux[file]??timings.unknownJsMs,floor);\n });\n assert.ok(asymmetric,'the observed platform maps contain distinct costs');",
    "after": "\ntest('Windows runs strict Host result replay separately from the concurrent source replays', () => {\n  const files = discoverJs(), count = qualityShardMatrices.windows.length;\n  const host = 'tests/game-ui-host-result.test.mjs';\n  const sourceReplays = ['tests/colorless-catalog-source.test.mjs', 'tests/presentation-m3-integration.test.mjs'];\n  const bins = Array.from({length:count}, (_, index) => jsShard(files, `${index + 1}/${count}`, 'win32'));\n  const weights = jsPlanningWeights(files, 'win32');\n  assert.equal(bins.filter(bin => bin.files.includes(host)).length, 1);\n  assert.ok(sourceReplays.every(file => bins.some(bin => bin.files.includes(file) && !bin.files.includes(host))));\n  for (const [index, bin] of bins.entries()) {\n    const expectedLoad = bin.files.reduce((total, path) => total + weights[path], index === 0 ? timings.initialMs.win32[0] : 0);\n    assert.equal(bin.loads[index], expectedLoad, 'Lua receives the actual cost of each JS shard');\n  }\n});\n\nfunction expectedPlanningWeight(file,platform,floor=timings.jsPlanning?.localLowerBounds?.[file]?.durationMs??0){\n const native=Object.hasOwn(timings.js,platform)?[platform]:Object.keys(timings.js);\n return Math.max(floor,...native.flatMap(os=>[\n  timings.js[os][file]??timings.unknownJsMs,\n  replayPlanningMinimumMs[os]?.[file.slice('tests/'.length)]??0,\n ]));\n}\n\ntest('platform-native placement covers every current file once and unknown platforms retain the conservative fallback',()=>{\n const files=discoverJs();\n for(const floor of Object.values(replayPlanningMinimumMs))for(const [name,ms]of Object.entries(floor)){\n  assert(files.includes('tests/'+name),'measured replay placement has a current test: '+name);\n  assert(Number.isSafeInteger(ms)&&ms>0,'positive replay case duration: '+name);\n }\n const asymmetric=files.find(file=>expectedPlanningWeight(file,'win32')!==expectedPlanningWeight(file,'linux'));\n assert.ok(asymmetric,'the observed platform maps contain distinct costs');"
   },
   {
    "at": 149,
    "before": "  const native=jsPlanningWeights(files,platform);\n  for(const file of files)assert.equal(native[file],Math.max(timings.js[platform][file]??timings.unknownJsMs,timings.jsPlanning?.localLowerBounds?.[file]?.durationMs??0));\n  const count=platform==='win32'?qualityShardMatrices.windows.length:qualityShardMatrices.posix.length;",
    "after": "  const native=jsPlanningWeights(files,platform);\n  for(const file of files)assert.equal(native[file],expectedPlanningWeight(file,platform));\n  const count=platform==='win32'?qualityShardMatrices.windows.length:qualityShardMatrices.posix.length;"
   },
   {
    "at": 158,
    "before": "  const fallback=jsPlanningWeights(files,platform);\n  for(const file of files)assert.equal(fallback[file],Math.max(...Object.values(timings.js).map(map=>map[file]??timings.unknownJsMs),timings.jsPlanning?.localLowerBounds?.[file]?.durationMs??0));\n }",
    "after": "  const fallback=jsPlanningWeights(files,platform);\n  for(const file of files)assert.equal(fallback[file],expectedPlanningWeight(file,platform));\n }"
   },
   {
    "at": 163,
    "before": "\ntest('workflow uses the same balanced plan for materialization and execution without changing concurrency', () => {\n  const workflow = readFileSync('.github/workflows/quality.yml', 'utf8');",
    "after": "\ntest('workflow uses the same balanced shard for materialization and isolated test execution', () => {\n  const workflow = readFileSync('.github/workflows/quality.yml', 'utf8');"
   },
   {
    "at": 193,
    "before": "  assert.ok(records.every(record => Number.isFinite(record.durationMs) && record.durationMs > 0));\n});",
    "after": "  assert.ok(records.every(record => Number.isFinite(record.durationMs) && record.durationMs > 0));\n});\n\nconst hostedOS = { linux: 'Linux', win32: 'Windows' }[process.platform];\ntest('hosted execution isolates checkout writes and combines both timing reports', {\n  skip: !hostedOS || availableParallelism() < 2,\n}, t => {\n  const parent = mkdtempSync(join(tmpdir(), 'abyss-ci-posix-executor-'));\n  t.after(() => rmSync(parent, { recursive: true, force: true }));\n  const root = join(parent, 'checkout'), copyTemp = join(parent, 'scratch');\n  for (const dir of ['.git', 'tests', 'scripts', 'build']) mkdirSync(join(root, dir), { recursive: true });\n  mkdirSync(copyTemp);\n  copyFileSync('scripts/ci-timing-reporter.mjs', join(root, 'scripts/ci-timing-reporter.mjs'));\n  for (const label of ['a', 'b']) writeFileSync(join(root, `tests/${label}.test.mjs`), `\n    import assert from 'node:assert/strict';\n    import {realpathSync,writeFileSync} from 'node:fs';\n    import test from 'node:test';\n    test('${label}',()=>{\n      assert.equal(process.env.GITHUB_WORKSPACE,realpathSync.native('.'));\n      writeFileSync('build/checkpoint','${label}',{flag:'wx'});\n      ${label === 'b' ? \"throw Error('isolated failure');\" : ''}\n    });`);\n  const env = { ...process.env, GITHUB_ACTIONS: 'true', RUNNER_OS: hostedOS, RUNNER_ENVIRONMENT: 'github-hosted',\n    GITHUB_WORKSPACE: root, RUNNER_TEMP: copyTemp };\n  delete env.NODE_TEST_CONTEXT;\n  const result = spawnSync(process.execPath, [resolve('scripts/ci-shards.mjs'), '--shard=1/1'], {\n    cwd: root, env, encoding: 'utf8', timeout: 30000,\n  });\n  assert.ifError(result.error);\n  assert.notEqual(result.status, 0);\n  assert.match(result.stdout + result.stderr, /isolated failure/);\n  assert.equal(readFileSync(join(root, 'build/checkpoint'), 'utf8'), 'a');\n  assert.deepEqual(readdirSync(copyTemp), []);\n  const records = readFileSync(join(root, 'build/ci-js-timings.jsonl'), 'utf8').trim().split('\\n').map(JSON.parse);\n  assert.deepEqual(records.map(({file,success}) => [file,success]).sort(), [['tests/a.test.mjs',true],['tests/b.test.mjs',false]]);\n});"
   },
   {
    "at": 337,
    "before": "  }\n  for(const platform of ['win32','linux'])assert.equal(jsPlanningWeights([file],platform)[file],Math.max(timings.js[platform][file]??timings.unknownJsMs,entry.durationMs));\n }",
    "after": "  }\n  for(const platform of ['win32','linux'])assert.equal(jsPlanningWeights([file],platform)[file],expectedPlanningWeight(file,platform,entry.durationMs));\n }"
   },
   {
    "at": 471,
    "before": "  assert.equal(timings.js[platform][key],10000,'retain actual old observations separately from the new local planning floor');\n  assert.equal(jsPlanningWeights([key],platform)[key],Math.max(timings.js[platform][key],floor.durationMs));\n }",
    "after": "  assert.equal(timings.js[platform][key],10000,'retain actual old observations separately from the new local planning floor');\n  assert.equal(jsPlanningWeights([key],platform)[key],expectedPlanningWeight(key,platform,floor.durationMs));\n }"
   },
   {
    "at": 501,
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
  "path": "tests/actor-presence-source.test.mjs",
  "beforeSha256": "1afcb5b218e1931363957d3fc3fa6ef3f133d5e5364c1eb43df9980b81250588",
  "afterSha256": "5e5010693487fb7dfffa9b31a88cae85778c8d0dea94272b113e18fe53d687fe",
  "hunks": [
   {
    "at": 14,
    "before": "import {sourceEpoch} from './helpers/combined-epoch/source-epoch.mjs';\nconst read=p=>readFileSync(p,'utf8').replaceAll('\\r\\n','\\n');",
    "after": "import {sourceEpoch} from './helpers/combined-epoch/source-epoch.mjs';\nimport {readRetiredController,retiredControllerPath} from './helpers/input-retirement-source.mjs';\nconst read=p=>readFileSync(p,'utf8').replaceAll('\\r\\n','\\n');"
   },
   {
    "at": 177,
    "before": "test('the current actor facade freshly rejects every expanded raw owner after warm nested reads',()=>{\n const current=Object.fromEntries(sourceEpoch.proof.owners.map(p=>[p,read(p)]));\n for(const path of originals){\n  let bad=null,mode='good',seen=[];",
    "after": "test('the current actor facade freshly rejects every expanded raw owner after warm nested reads',()=>{\n const current=Object.fromEntries(sourceEpoch.proof.owners.filter(p=>p!==retiredControllerPath).map(p=>[p,read(p)]));\n assert.throws(()=>read(retiredControllerPath),{code:'ENOENT'});\n const retired=readRetiredController(read);\n assert(retired.restored,'the current pointer input authenticates the retired controller');\n for(const path of originals){\n  const source=read(path);\n  let bad=null,mode='good',seen=[];"
   },
   {
    "at": 187,
    "before": "   if(mode==='missing')return undefined;if(mode==='null')return null;\n   if(mode==='buffer')return Buffer.from(current[p]);if(mode==='changed')return current[p]+'\\n';\n  }return current[p]??read(p);};\n  const wrapped=actorPresenceReader(actorPresenceReader(raw));assert.equal(actorPresenceReader(wrapped),wrapped);\n  const check=()=>assert.equal(project(path,read(path),{readSource:wrapped}),proof.files[path].beforeSource);\n  check();const first=[...seen];for(const owner of sourceEpoch.proof.owners)assert(first.includes(owner),'fresh current owner: '+owner);\n  seen=[];check();assert.deepEqual(seen,first,'warm calls repeat the complete raw-read sequence');\n  for(bad of sourceEpoch.proof.owners)for(mode of ['changed','missing','null','buffer','throw']){\n   seen=[];assert.throws(check,error=>{assert.match(error.message,/linked owner/);assert(error.message.includes(bad));if(mode==='throw')assert.match(error.message,/expanded reader sentinel/);return true;});\n   assert(seen.includes(bad));const previous=mode;mode='good';check();mode=previous;\n  }",
    "after": "   if(mode==='missing')return undefined;if(mode==='null')return null;\n   const bytes=p===retiredControllerPath?retired.source:current[p];\n   if(mode==='present')return bytes;\n   if(mode==='buffer')return Buffer.from(bytes);if(mode==='changed')return bytes+'\\n';\n  }return p===retiredControllerPath?null:current[p]??read(p);};\n  const wrapped=actorPresenceReader(actorPresenceReader(raw));assert.equal(actorPresenceReader(wrapped),wrapped);\n  const check=()=>assert.equal(project(path,source,{readSource:wrapped}),proof.files[path].beforeSource);\n  check();const first=[...seen];for(const owner of sourceEpoch.proof.owners)assert(first.includes(owner),'fresh current owner: '+owner);\n  seen=[];check();assert.deepEqual(seen,first,'warm calls repeat the complete raw-read sequence');\n  for(bad of sourceEpoch.proof.owners){\n   const isRetired=bad===retiredControllerPath;\n   if(isRetired)for(mode of ['missing','null']){\n    seen=[];check();assert.deepEqual(seen,first,'retired controller still requires every current owner');\n   }\n   const modes=isRetired?['changed','present','buffer','throw']:['changed','missing','null','buffer','throw'];\n   for(mode of modes){\n    seen=[];assert.throws(check,error=>{assert.match(error.message,/linked owner/);assert(error.message.includes(bad));if(mode==='throw')assert.match(error.message,/expanded reader sentinel/);return true;});\n    assert(seen.includes(bad));const previous=mode;mode='good';check();mode=previous;\n   }\n  }"
   }
  ]
 },
 {
  "path": "tests/reward-query-boundary-source.test.mjs",
  "beforeSha256": "378703a708fce2a44c6cb039d8825b0708a25e92191956afe9e347e39b4aedb8",
  "afterSha256": "7bf078a323881c3b5b77dec581678dd68cb471a0dd320411f0eebbae57451aa9",
  "hunks": [
   {
    "at": 1,
    "before": "import assert from 'node:assert/strict';\nimport {readFileSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';\nimport {createHash} from 'node:crypto';\nimport {gunzipSync} from 'node:zlib';\nimport {spawnSync} from 'node:child_process';\nimport {join} from 'node:path';\nimport {tmpdir} from 'node:os';\nimport {rewardQueryBoundaryProof as proof,preRewardQueryBoundarySource as project,rewardQueryBoundaryReader as reader} from './helpers/reward-query-boundary-source-inverse.mjs';",
    "after": "import assert from 'node:assert/strict';\nimport {readFileSync,writeFileSync,mkdtempSync,mkdirSync,rmSync} from 'node:fs';\nimport {createHash} from 'node:crypto';\nimport {gunzipSync} from 'node:zlib';\nimport {execFile,spawnSync} from 'node:child_process';\nimport {join} from 'node:path';\nimport {availableParallelism,tmpdir} from 'node:os';\nimport {hasTestNameFilter,runIsolatedTest} from './helpers/isolated-historical-cases.mjs';\nimport {promisify} from 'node:util';\nimport {rewardQueryBoundaryProof as proof,preRewardQueryBoundarySource as project,rewardQueryBoundaryReader as reader} from './helpers/reward-query-boundary-source-inverse.mjs';"
   },
   {
    "at": 148,
    "before": "\ntest('an isolated copied helper has a complete closure and cannot borrow live owners after warm edits or deletion',()=>{\n const root=mkdtempSync(join(tmpdir(),'reward-query-source-'));\n try{\n  copyCurrentSourceFixture(root);\n  const script=`",
    "after": "\ntest('an isolated copied helper has a complete closure and cannot borrow live owners after warm edits or deletion',async()=>{\n const root=mkdtempSync(join(tmpdir(),'reward-query-source-'));\n try{\n  const copies=['first','second'].map(name=>{\n   const directory=join(root,name);mkdirSync(directory);copyCurrentSourceFixture(directory);return directory;\n  });\n  const script=`"
   },
   {
    "at": 159,
    "before": "const paths=Object.keys(proof.files),sources=Object.fromEntries(paths.map(p=>[p,readFileSync(p,'utf8')]));\nfor(const host of paths)for(const linked of paths){\n assert.equal(project(host,sources[host]),proof.files[host].beforeSource);",
    "after": "const paths=Object.keys(proof.files),sources=Object.fromEntries(paths.map(p=>[p,readFileSync(p,'utf8')]));\nassert.equal(paths.length,4,'the reviewed reward closure has four owners');\nconst index=Number(process.argv[1]),host=paths[index];assert(host,'registered host for detached verification');\nfor(const linked of paths){\n assert.equal(project(host,sources[host]),proof.files[host].beforeSource);"
   },
   {
    "at": 168,
    "before": "}\nconsole.log('ISOLATED_REWARD_QUERY_SOURCE_PASS');`;\n  const result=spawnSync(process.execPath,['--input-type=module','-e',script],{cwd:root,encoding:'utf8',timeout:30000,maxBuffer:1024*1024});\n  assert.ifError(result.error);assert.equal(result.status,0,result.stdout+result.stderr);assert.match(result.stdout,/ISOLATED_REWARD_QUERY_SOURCE_PASS/);\n  const proofPath=join(root,'tests/helpers/epochs/reward/tests/helpers/reward-query-boundary-before.json');\n  writeFileSync(proofPath,readFileSync(proofPath,'utf8').replace('d8a57cae','e8a57cae'));\n  const negative=spawnSync(process.execPath,['--input-type=module','-e',\"import './tests/helpers/reward-query-boundary-source-inverse.mjs'\"],{cwd:root,encoding:'utf8',timeout:30000,maxBuffer:1024*1024});\n  assert.ifError(negative.error);assert.notEqual(negative.status,0);assert.match(negative.stderr,/complete reward query boundary source proof/);",
    "after": "}\nconsole.log('ISOLATED_REWARD_QUERY_SOURCE_PASS '+index);`;\n  const execute=promisify(execFile),options={encoding:'utf8',timeout:30000,maxBuffer:1024*1024,windowsHide:true};\n  // Keep two independent copies and give each complete host check its own VM.\n  // Windows job 137593688380 reached the per-VM deadline with two hosts.\n  const outcomes=await Promise.allSettled(copies.map(async(cwd,lane)=>{\n   for(const index of [lane*2,lane*2+1]){\n    const {stdout}=await execute(process.execPath,['--input-type=module','-e',script,String(index)],{...options,cwd})\n     .catch(error=>assert.fail([`detached host ${index}`,error.code,error.signal,error.stdout,error.stderr,error.message].filter(Boolean).join('\\n')));\n    assert.match(stdout,new RegExp('^ISOLATED_REWARD_QUERY_SOURCE_PASS '+index+'\\\\r?$','m'));\n   }\n  }));\n  for(const result of outcomes)if(result.status==='rejected')throw result.reason;\n  const proofPath=join(copies[0],'tests/helpers/epochs/reward/tests/helpers/reward-query-boundary-before.json');\n  writeFileSync(proofPath,readFileSync(proofPath,'utf8').replace('d8a57cae','e8a57cae'));\n  const negative=spawnSync(process.execPath,['--input-type=module','-e',\"import './tests/helpers/reward-query-boundary-source-inverse.mjs'\"],{...options,cwd:copies[0]});\n  assert.ifError(negative.error);assert.notEqual(negative.status,0);assert.match(negative.stderr,/complete reward query boundary source proof/);"
   },
   {
    "at": 188,
    "before": "\ntest('current reward and M7 wrappers freshly reject every expanded owner and recover after each fault',()=>{\n const owners=[...sourceEpoch.proof.owners,pointerInputPath];",
    "after": "\nconst expandedOwnerCase='current reward and M7 wrappers freshly reject every expanded owner and recover after each fault';\nconst expandedOwnerLane='--reward-expanded-owner-lane';\ntest(expandedOwnerCase,async()=>{\n assert.equal(paths.length,4,'the expanded reward checks bind four hosts');\n let hosts=paths;\n if(process.argv[2]===expandedOwnerLane){\n  const index=Number(process.argv[3]);assert(index===0||index===1);\n  hosts=paths.filter((_,position)=>position%2===index);\n }else if(process.platform==='win32'&&process.env.GITHUB_ACTIONS==='true'&&process.env.RUNNER_ENVIRONMENT==='github-hosted'\n  &&availableParallelism()>=2&&!hasTestNameFilter()){\n  // This case alone used over 35 minutes in Windows job 137628123978.\n  const outcomes=await Promise.allSettled([0,1].map(index=>runIsolatedTest(import.meta.url,\n   [expandedOwnerLane,String(index)],[`--test-name-pattern=^${expandedOwnerCase}$`])));\n  for(const outcome of outcomes)if(outcome.status==='rejected')throw outcome.reason;\n  return;\n }\n const owners=[...sourceEpoch.proof.owners,pointerInputPath];"
   },
   {
    "at": 208,
    "before": " const sources=Object.fromEntries(owners.filter(path=>path!==retiredControllerPath).map(path=>[path,read(path)]));\n for(const [consume,wrap]of [[project,reader],[preM7FinalSource,m7FinalReader]])for(const host of paths){\n  let bad=null,mode='good',seen=[];",
    "after": " const sources=Object.fromEntries(owners.filter(path=>path!==retiredControllerPath).map(path=>[path,read(path)]));\n for(const [consume,wrap]of [[project,reader],[preM7FinalSource,m7FinalReader]])for(const host of hosts){\n  let bad=null,mode='good',seen=[];"
   }
  ]
 },
 {
  "path": "tests/lua/toxic_egg_ui.lua",
  "beforeSha256": "6811f52651059bd16017b51f73569751a02fb290a4bee6bcd8e3ff440669071f",
  "afterSha256": "178e932ca8566e93f02d32d6e1af94812f5ef5c604807660e1a5aba51370f3fe",
  "hunks": [
   {
    "at": 1,
    "before": "local U=dofile('tests/lua/support/game_ui_fixture.lua');local UI=require('abyss_node_ui')\nlocal function spec(list,name)for _,v in ipairs(list)do if v.name==name then return v end;local found=v.children and spec(v.children,name);if found then return found end end end",
    "after": "local U=dofile('tests/lua/support/game_ui_fixture.lua');local UI=require('abyss_node_ui')\nlocal advanceShop=dofile('tests/lua/support/shop_timeline.lua')\nlocal function spec(list,name)for _,v in ipairs(list)do if v.name==name then return v end;local found=v.children and spec(v.children,name);if found then return found end end end"
   },
   {
    "at": 11,
    "before": " local r=F.Run.new(F.D,42);assert(F.Run.obtainRelic(r,'Toxic Egg 2'));F.Run.gainGold(r,1000);local m=F.enter(r,'shop');local ui,get,p=bind(r,m)\n local c=r.nodeFlow.cards[3];assert(c.upgraded);assert(get('shopView/card3/name').text:find('＋',1,true))",
    "after": " local r=F.Run.new(F.D,42);assert(F.Run.obtainRelic(r,'Toxic Egg 2'));F.Run.gainGold(r,1000);local m=F.enter(r,'shop');local ui,get,p=bind(r,m)\n assert(ui:press('merchant/talk'));advanceShop(ui)\n local c=r.nodeFlow.cards[3];assert(c.upgraded);assert(get('shopView/card3/name').text:find('＋',1,true))"
   }
  ]
 },
 {
  "path": "tests/lua/card_art_binding.lua",
  "beforeSha256": "4cf06bcbeee0f43a30ee0f5c1612f18ee37ed5821503daabee9ac9fdb2d1c256",
  "afterSha256": "405cecf4ab43524de54f7a1f7fad365b60da08f495789fac11ea8b93368f01e1",
  "hunks": [
   {
    "at": 0,
    "before": "local H = dofile(\"tests/lua/support/battle_gesture_fixture.lua\")\nlocal Theme = require(\"abyss_theme\")",
    "after": "local H = dofile(\"tests/lua/support/battle_gesture_fixture.lua\")\nlocal advanceShop = dofile(\"tests/lua/support/shop_timeline.lua\")\nlocal Theme = require(\"abyss_theme\")"
   },
   {
    "at": 41,
    "before": "Theme.icon.cardPortraits[offer.id] = {id=102035,status=\"test-native-asset\",size={288,128}}\nhost.nodeUI.run,host.nodeUI.map = run,map\nhost.nodeUI:render()\nlocal shown = 0\nfor name,control in pairs(root:GetChild(\"nodePanel\"):GetChild(\"shopView\"):GetChild(\"card1\").children) do\n    if name:match(\"^art_\") and control.visible then",
    "after": "Theme.icon.cardPortraits[offer.id] = {id=102035,status=\"test-native-asset\",size={288,128}}\nlocal shopRoot = H.F.Viewport.apply(H.F.control({children=H.F.Layout}),1280,720)\nlocal shopPanel = shopRoot:GetChild(\"nodePanel\")\nlocal shopPresentation = require(\"abyss_character_presentation\").prepare(H.F.Presentation,run.data)\nlocal shopUI = require(\"abyss_node_ui\").new(shopPanel,run,map,shopPresentation,\"click\",nil,\n    {imageSource=\"static\",color=function(...) return {...} end})\nshopUI:setVisible(true)\nassert(shopUI:press(\"merchant/talk\"));advanceShop(shopUI)\nlocal shown = 0\nfor name,control in pairs(shopPanel:GetChild(\"shopView\"):GetChild(\"card1\").children) do\n    if name:match(\"^art_\") and control.visible then"
   }
  ]
 },
 {
  "path": "tests/lua/card_face_contexts.lua",
  "beforeSha256": "2cda25c77f24a7eab16f9375f3e40ad896526a2f6b03a333329108527a40f55d",
  "afterSha256": "70db9b533b3f2e9a8422cccd78e8b3cca0eda180157a36dfecf95cbd622d4cd6",
  "hunks": [
   {
    "at": 2,
    "before": "local F=dofile('tests/lua/support/game_ui_fixture.lua')\nlocal Run,Map,Nodes=require('abyss_run'),require('abyss_map'),require('abyss_nodes')",
    "after": "local F=dofile('tests/lua/support/game_ui_fixture.lua')\nlocal advanceShop=dofile('tests/lua/support/shop_timeline.lua')\nlocal Run,Map,Nodes=require('abyss_run'),require('abyss_map'),require('abyss_nodes')"
   },
   {
    "at": 45,
    "before": "local node=NodeUI.new(root:GetChild('nodePanel'),shopRun,map,presentation,'click',function()end,platform)\nnode:render()\nassertLong(root:GetChild('nodePanel'):GetChild('shopView'):GetChild('card1'),false,'shop')",
    "after": "local node=NodeUI.new(root:GetChild('nodePanel'),shopRun,map,presentation,'click',function()end,platform)\nnode:setVisible(true);assert(node:press('merchant/talk'));advanceShop(node)\nassertLong(root:GetChild('nodePanel'):GetChild('shopView'):GetChild('card1'),false,'shop')"
   }
  ]
 },
 {
  "path": "tests/lua/game_ui_potion_discard.lua",
  "beforeSha256": "ca97350d058d00e0e94ac00bedc6b7f534c976e9471edcdfa777992af3f49707",
  "afterSha256": "5aad6010a542a72f6d862be4439762e504c5d54562b689c25285426a2d570fe9",
  "hunks": [
   {
    "at": 0,
    "before": "local testStart=dofile('tests/lua/support/game_ui_fixture.lua').start\npackage.path='src/lua/?.lua;build/lua/?.lua;'..package.path",
    "after": "local testStart=dofile('tests/lua/support/game_ui_fixture.lua').start\nlocal advanceShop=dofile('tests/lua/support/shop_timeline.lua')\npackage.path='src/lua/?.lua;build/lua/?.lua;'..package.path"
   },
   {
    "at": 89,
    "before": "    h.run.gold=1000;h:refresh()\n    local offer",
    "after": "    h.run.gold=1000;h:refresh()\n    assert(F.click(r,'nodePanel','merchant/talk'));advanceShop(h)\n    local offer"
   }
  ]
 },
 {
  "path": "tests/task77-current-source-layers.test.mjs",
  "beforeSha256": "c16c80771ee301f3a26fa8b5607dfedf4f2764c1ea15d0787333e7c7fa1ef605",
  "afterSha256": "aac72bc0dee77a8e1a5ad4b9ad15ce18a4266bed981d5cbad8ca8d6c75143835",
  "hunks": [
   {
    "at": 1,
    "before": "import {preApprovedUiSource} from './helpers/approved-ui-inverse.mjs';\nimport test from 'node:test';\nimport {historicalTest} from './helpers/historical-baseline-inputs.mjs';\nimport assert from 'node:assert/strict';",
    "after": "import {preApprovedUiSource} from './helpers/approved-ui-inverse.mjs';\nimport {runHistoricalCases} from './helpers/isolated-historical-cases.mjs';\nimport assert from 'node:assert/strict';"
   },
   {
    "at": 11,
    "before": "const read=path=>preRosterSource(path,preAcceptedPr323Source(path,preTask77OuterSource(path,readFileSync(path,'utf8'))));\nfunction invert(source,binding){",
    "after": "const read=path=>preRosterSource(path,preAcceptedPr323Source(path,preTask77OuterSource(path,readFileSync(path,'utf8'))));\nconst cases=[];\nconst register=(name,body)=>cases.push([name,body]);\nfunction invert(source,binding){"
   },
   {
    "at": 20,
    "before": "\nhistoricalTest('current Task77 source reverses only its owned edits and preserves the complete accepted confirmation/UI base',()=>{\n assert.equal(layers.acceptedBase,'77c2d5e6850f1758b821e5e2d45be60e8b5ed8a4');",
    "after": "\nregister('current Task77 source reverses only its owned edits and preserves the complete accepted confirmation/UI base',()=>{\n assert.equal(layers.acceptedBase,'77c2d5e6850f1758b821e5e2d45be60e8b5ed8a4');"
   },
   {
    "at": 36,
    "before": "\nhistoricalTest('accepted UI source layers recover the original immutable formal bindings and reject incomplete or duplicated changes',()=>{\n assert.deepEqual(Object.keys(layers.acceptedUi),['data/presentation/ui_theme.json','scripts/character-ui-layout.mjs','scripts/game-ui-layout.mjs','src/lua/abyss_game_ui.lua']);",
    "after": "\nregister('accepted UI source layers recover the original immutable formal bindings and reject incomplete or duplicated changes',()=>{\n assert.deepEqual(Object.keys(layers.acceptedUi),['data/presentation/ui_theme.json','scripts/character-ui-layout.mjs','scripts/game-ui-layout.mjs','src/lua/abyss_game_ui.lua']);"
   },
   {
    "at": 51,
    "before": "\nhistoricalTest('Task77 owns complete current sources before its unchanged formal guards and rejects current drift',()=>{\n for(const path of Object.keys(layers.acceptedUi)){",
    "after": "\nregister('Task77 owns complete current sources before its unchanged formal guards and rejects current drift',()=>{\n for(const path of Object.keys(layers.acceptedUi)){"
   },
   {
    "at": 68,
    "before": "",
    "after": "\nrunHistoricalCases(import.meta.url,'Task77 historical source replay',cases);\n"
   }
  ]
 },
 {
  "path": "tests/integration-source-epoch.test.mjs",
  "beforeSha256": "58159c0c30a0bbd658c1d47543c2350d8534198c43c4ba59b03318f14195178d",
  "afterSha256": "857a72cbde0acc553ec440c953018f5a84f6e23fb7f9e62e616bd784116d5318",
  "hunks": [
   {
    "at": 32,
    "before": " assert.equal(authenticateInputRetirement(path,source,read),prior);\n assert.equal(authenticateInputRetirement(path,source.replaceAll('\\n','\\r\\n'),read),prior.replaceAll('\\n','\\r\\n'));\n assert.throws(()=>authenticateInputRetirement(path,source,()=>source+'\\n'),/input retirement validation/);",
    "after": " assert.equal(authenticateInputRetirement(path,source,read),prior);\n const crlf=text=>text.replace(/\\r?\\n/g,'\\r\\n');\n assert.equal(authenticateInputRetirement(path,crlf(source),read),crlf(prior));\n assert.throws(()=>authenticateInputRetirement(path,source,()=>source+'\\n'),/input retirement validation/);"
   }
  ]
 },
 {
  "path": "tests/session-menu-navigation.test.mjs",
  "beforeSha256": "c6ac9daefb1d675e8db07a854f029feca0042c1ca085a6e5b9486a8ed9975c05",
  "afterSha256": "a213e97200dcaa46b3edd6fb37bfb5b17edb221c5c3f425466414d08df49aadd",
  "hunks": [
   {
    "at": 174,
    "before": "  const raw=readLive(path);\n  assert.equal(beforeCharacterPreparationSource(path,raw,readLive),liveEpoch.proof.current[path].source);\n  assert.equal(liveEpoch.preCombinedSource(path,raw,{target:'v2RunMenuPrior',readSource:readLive}),sourceEpoch.proof.current[path].source);",
    "after": "  const raw=readLive(path);\n  assert.equal(beforeCharacterPreparationSource(path,raw,readLive).replaceAll('\\r\\n','\\n'),liveEpoch.proof.current[path].source);\n  assert.equal(liveEpoch.preCombinedSource(path,raw,{target:'v2RunMenuPrior',readSource:readLive}),sourceEpoch.proof.current[path].source);"
   }
  ]
 },
 {
  "path": "tests/lua/game_ui_visibility_failure.lua",
  "beforeSha256": "5e320fd632c309742cfa6ff309f5032e71e8c3d3c802dcaa6808a236ffa1a742",
  "afterSha256": "268cf664b495b45bb3800a484cfe5a54d64353ff2e4f67c1e59163a0b89f0047",
  "hunks": [
   {
    "at": 101,
    "before": "\n-- Two observable paints are required around arbitrary native callbacks. The",
    "after": "\n-- An activation setter can fail after the inactive flag changes, before hiding actors.\ndo\n local host,root,panel,actor=fixture();local setter=panel.SetVisible;local first,second={},{}\n panel.SetVisible=function(_,value)assert(value==false);error(first)end\n local ok,why=pcall(host.openDeck,host)\n assert(not ok and why==first and host.deckUI.visible and not host.battleUI.active)\n assert(actor.alive and actor.visible,'first failure never committed the cover render')\n panel.SetVisible=setter\n root:GetChild('mapPanel').SetVisible=function()error(second)end\n ok,why=pcall(host.refresh,host)\n assert(not ok and why==second and actor.alive and not actor.visible,'cover retry must render before the sibling failure')\n print('CASE uncommitted cover retry hides actor before sibling failure')\nend\n\n-- Two observable paints are required around arbitrary native callbacks. The"
   },
   {
    "at": 122,
    "before": " assert(host:openDeck());assert(count==2 and actor.alive and not actor.visible)\n count=0;assert(host:closeDeck());assert(count==2 and actor.alive and actor.visible)",
    "after": " assert(host:openDeck());assert(count==2 and actor.alive and not actor.visible)\n count=0;host:refresh();assert(count==1 and actor.alive and not actor.visible,'covered refresh should paint only once')\n count=0;assert(host:closeDeck());assert(count==2 and actor.alive and actor.visible)"
   }
  ]
 },
 {
  "path": "tests/lua/noncombat_v25_menu.lua",
  "beforeSha256": "ca7093be5b18e3c2dad934d8542ee434549a610cf5981766f5c107769c8b9670",
  "afterSha256": "2c871406eb2796713399ecdeca0ab6c646524c5dce597938bca6b1f7655e2eb5",
  "hunks": [
   {
    "at": 7,
    "before": " function n:GetChild(key)\n  if key=='stsCharacter' then return self.children[key]end\n  if not self.children[key]then self.children[key]=control(key)end",
    "after": " function n:GetChild(key)\n  if key=='stsCharacter' or key=='v25Face' then return self.children[key]end\n  if not self.children[key]then self.children[key]=control(key)end"
   }
  ]
 },
 {
  "path": "tests/lua/menu_hover_continuity.lua",
  "beforeSha256": "b27d47a2a08ddbc5014f56851149e7c9c65bd59a6a53eaf3c107b8032543032d",
  "afterSha256": "a1904b2beab947d120c67d57e5efc9c8ce20b5febb5458317f5474f578729532",
  "hunks": [
   {
    "at": 19,
    "before": "local start,quit=button(),button()\nlocal ctx={start=start,menu=control('menu'),owner={mode='menu',motion={}},platform={color=function(r,g,b,a)return {r=r,g=g,b=b,a=a}end}}\nctx.menu.children.titleQuit=quit",
    "after": "local start,quit=button(),button()\nlocal ctx={start=start,menu=control('menu'),owner={mode='menu',motion={},potionUI={visible=false}},platform={color=function(r,g,b,a)return {r=r,g=g,b=b,a=a}end}}\nctx.menu.children.titleQuit=quit"
   }
  ]
 },
 {
  "path": "tests/helpers/defect-final-source-epoch.mjs",
  "beforeSha256": "8088008202072d1ce22492383861fe5ccb2b57d2bd9d1b06abb6653f835c2137",
  "afterSha256": "d6dabee023a3a9f8a2620c3edd1dee0b8b359aa62aff8a17b63175e170ab8b04",
  "hunks": [
   {
    "at": 4,
    "before": "import {createHash} from 'node:crypto';\nimport {createSourceEpochProjector} from './combined-epoch/source-epoch-runtime.mjs';\nconst hash=b=>createHash('sha256').update(b).digest('hex');",
    "after": "import {createHash} from 'node:crypto';\nimport {createComposedSourceEpochProjector,createSourceEpochProjector} from './combined-epoch/source-epoch-runtime.mjs';\nconst hash=b=>createHash('sha256').update(b).digest('hex');"
   },
   {
    "at": 18,
    "before": "  targets:{...prior.targets,defectFinalPrior:{commit:outer.targets.prior.commit,files:prior.current}}};\n const current=createSourceEpochProjector(proof,{allowConfigLayout:true}),live=p=>readFileSync(p,'utf8'),readers=new WeakMap();\n function preCombinedSource(path,source,{target,readSource=live}={}){",
    "after": "  targets:{...prior.targets,defectFinalPrior:{commit:outer.targets.prior.commit,files:prior.current}}};\n const current=createComposedSourceEpochProjector(proof),live=p=>readFileSync(p,'utf8'),readers=new WeakMap();\n function preCombinedSource(path,source,{target,readSource=live}={}){"
   }
  ]
 },
 {
  "path": "tests/helpers/effects-target-group-source-epoch.mjs",
  "beforeSha256": "8affe1c65d7a096fc5546375bcb19bb404923be2c94528e3e443b4095ef7c488",
  "afterSha256": "c73c6b050ece8efd96775188c146e1d736561d068f61cd3e7081c74d937fc0af",
  "hunks": [
   {
    "at": 4,
    "before": "import {createHash} from 'node:crypto';\nimport {createSourceEpochProjector} from './combined-epoch/source-epoch-runtime.mjs';\nconst hash=b=>createHash('sha256').update(b).digest('hex');",
    "after": "import {createHash} from 'node:crypto';\nimport {createComposedSourceEpochProjector,createSourceEpochProjector} from './combined-epoch/source-epoch-runtime.mjs';\nconst hash=b=>createHash('sha256').update(b).digest('hex');"
   },
   {
    "at": 18,
    "before": "  targets:{...prior.targets,effectsTargetGroupPrior:{commit:outer.targets.prior.commit,files:prior.current}}};\n const current=createSourceEpochProjector(proof,{allowConfigLayout:true}),live=p=>readFileSync(p,'utf8'),readers=new WeakMap();\n function preCombinedSource(path,source,{target,readSource=live}={}){",
    "after": "  targets:{...prior.targets,effectsTargetGroupPrior:{commit:outer.targets.prior.commit,files:prior.current}}};\n const current=createComposedSourceEpochProjector(proof),live=p=>readFileSync(p,'utf8'),readers=new WeakMap();\n function preCombinedSource(path,source,{target,readSource=live}={}){"
   }
  ]
 },
 {
  "path": "tests/helpers/room-ui-source-epoch.mjs",
  "beforeSha256": "ddcb90da9fdaa1b93ccdc903cb348dd99c2ccaeaa2d5350bc2ed586631612500",
  "afterSha256": "ce50bd58037ea74976dae9e94515dfd16f91432c715ee880c00ae8080a73202e",
  "hunks": [
   {
    "at": 4,
    "before": "import {createHash} from 'node:crypto';\nimport {createSourceEpochProjector} from './combined-epoch/source-epoch-runtime.mjs';\nimport {componentUiSourceEpoch} from './component-ui-source-epoch.mjs';",
    "after": "import {createHash} from 'node:crypto';\nimport {createComposedSourceEpochProjector,createSourceEpochProjector} from './combined-epoch/source-epoch-runtime.mjs';\nimport {componentUiSourceEpoch} from './component-ui-source-epoch.mjs';"
   },
   {
    "at": 24,
    "before": "  targets:{...prior.targets,componentUiPrior:{commit:prior.currentCommit,files:prior.current}}};\n const current=createSourceEpochProjector(proof,{allowConfigLayout:true}),live=p=>{\n  try{return readFileSync(p,'utf8');}catch(error){if(error.code==='ENOENT')return null;throw error;}",
    "after": "  targets:{...prior.targets,componentUiPrior:{commit:prior.currentCommit,files:prior.current}}};\n const current=createComposedSourceEpochProjector(proof),live=p=>{\n  try{return readFileSync(p,'utf8');}catch(error){if(error.code==='ENOENT')return null;throw error;}"
   }
  ]
 },
 {
  "path": "tests/helpers/silent-final-source-epoch.mjs",
  "beforeSha256": "62621989d65db4db12a6b7251fc8216bbd5851b196c87d28f0cffd222d8a28b4",
  "afterSha256": "d31330033fd9e188d93001a55213e1c471546f6e57b3b6ec68f726c23468e35e",
  "hunks": [
   {
    "at": 4,
    "before": "import {createHash} from 'node:crypto';\nimport {createSourceEpochProjector} from './combined-epoch/source-epoch-runtime.mjs';\nconst hash=b=>createHash('sha256').update(b).digest('hex');",
    "after": "import {createHash} from 'node:crypto';\nimport {createComposedSourceEpochProjector,createSourceEpochProjector} from './combined-epoch/source-epoch-runtime.mjs';\nconst hash=b=>createHash('sha256').update(b).digest('hex');"
   },
   {
    "at": 18,
    "before": "  targets:{...prior.targets,silentFinalPrior:{commit:outer.targets.prior.commit,files:prior.current}}};\n const current=createSourceEpochProjector(proof,{allowConfigLayout:true}),live=p=>readFileSync(p,'utf8'),readers=new WeakMap();\n function preCombinedSource(path,source,{target,readSource=live}={}){",
    "after": "  targets:{...prior.targets,silentFinalPrior:{commit:outer.targets.prior.commit,files:prior.current}}};\n const current=createComposedSourceEpochProjector(proof),live=p=>readFileSync(p,'utf8'),readers=new WeakMap();\n function preCombinedSource(path,source,{target,readSource=live}={}){"
   }
  ]
 },
 {
  "path": "tests/helpers/silent-tactics-source-epoch.mjs",
  "beforeSha256": "1961b7399f1ec8ece9bfc598f9660f5fdc20c669cac3e967a2d4979296b597cf",
  "afterSha256": "decd2795a2b2a02ae717787dd5ae822f69191b1660464da905a641f8116930d1",
  "hunks": [
   {
    "at": 4,
    "before": "import {createHash} from 'node:crypto';\nimport {createSourceEpochProjector} from './combined-epoch/source-epoch-runtime.mjs';\nconst hash=b=>createHash('sha256').update(b).digest('hex');",
    "after": "import {createHash} from 'node:crypto';\nimport {createComposedSourceEpochProjector,createSourceEpochProjector} from './combined-epoch/source-epoch-runtime.mjs';\nconst hash=b=>createHash('sha256').update(b).digest('hex');"
   },
   {
    "at": 18,
    "before": "  targets:{...prior.targets,silentTacticsPrior:{commit:outer.targets.prior.commit,files:prior.current}}};\n const current=createSourceEpochProjector(proof,{allowConfigLayout:true}),live=p=>readFileSync(p,'utf8'),readers=new WeakMap();\n function preCombinedSource(path,source,{target,readSource=live}={}){",
    "after": "  targets:{...prior.targets,silentTacticsPrior:{commit:outer.targets.prior.commit,files:prior.current}}};\n const current=createComposedSourceEpochProjector(proof),live=p=>readFileSync(p,'utf8'),readers=new WeakMap();\n function preCombinedSource(path,source,{target,readSource=live}={}){"
   }
  ]
 },
 {
  "path": "tests/helpers/relic-equip-source-epoch.mjs",
  "beforeSha256": "ff648711e65a818f22a52d2d8b4d9dc1fab42bada42cc8372fbde06a76738a35",
  "afterSha256": "b768a3e8023f0286f4aa577d1300f932567b9d731b836038dac5959e9d67ce02",
  "hunks": [
   {
    "at": 4,
    "before": "import {createHash} from 'node:crypto';\nimport {createSourceEpochProjector} from './combined-epoch/source-epoch-runtime.mjs';\nconst hash=b=>createHash('sha256').update(b).digest('hex');",
    "after": "import {createHash} from 'node:crypto';\nimport {createComposedSourceEpochProjector,createSourceEpochProjector} from './combined-epoch/source-epoch-runtime.mjs';\nconst hash=b=>createHash('sha256').update(b).digest('hex');"
   },
   {
    "at": 18,
    "before": "  targets:{...prior.targets,relicEquipPrior:{commit:outer.targets.prior.commit,files:prior.current}}};\n const current=createSourceEpochProjector(proof,{allowConfigLayout:true}),live=p=>readFileSync(p,'utf8'),readers=new WeakMap();\n function preCombinedSource(path,source,{target,readSource=live}={}){",
    "after": "  targets:{...prior.targets,relicEquipPrior:{commit:outer.targets.prior.commit,files:prior.current}}};\n const current=createComposedSourceEpochProjector(proof),live=p=>readFileSync(p,'utf8'),readers=new WeakMap();\n function preCombinedSource(path,source,{target,readSource=live}={}){"
   }
  ]
 },
 {
  "path": "tests/helpers/encounter-formation-source-epoch.mjs",
  "beforeSha256": "1c654029938e0d5eb0864adb2f76333d3e4a1ed1fe95d73e2e0c21a8fb376436",
  "afterSha256": "a044c0830309415ea3858a6368f6d794440db1f2d68b6cf3742111b03cd047c5",
  "hunks": [
   {
    "at": 4,
    "before": "import {createHash} from 'node:crypto';\nimport {createSourceEpochProjector} from './combined-epoch/source-epoch-runtime.mjs';\nconst hash=b=>createHash('sha256').update(b).digest('hex');",
    "after": "import {createHash} from 'node:crypto';\nimport {createComposedSourceEpochProjector,createSourceEpochProjector} from './combined-epoch/source-epoch-runtime.mjs';\nconst hash=b=>createHash('sha256').update(b).digest('hex');"
   },
   {
    "at": 18,
    "before": "  targets:{...prior.targets,encounterFormationPrior:{commit:outer.targets.prior.commit,files:prior.current}}};\n const current=createSourceEpochProjector(proof,{allowConfigLayout:true}),live=p=>readFileSync(p,'utf8'),readers=new WeakMap();\n function preCombinedSource(path,source,{target,readSource=live}={}){",
    "after": "  targets:{...prior.targets,encounterFormationPrior:{commit:outer.targets.prior.commit,files:prior.current}}};\n const current=createComposedSourceEpochProjector(proof),live=p=>readFileSync(p,'utf8'),readers=new WeakMap();\n function preCombinedSource(path,source,{target,readSource=live}={}){"
   }
  ]
 },
 {
  "path": "tests/helpers/watcher-flow-source-epoch.mjs",
  "beforeSha256": "dad47d3abfb21ce4922a2482142ac2f702644aaa4775558c4c5b06458196cccd",
  "afterSha256": "def224824eedc945a1cb402dd0429861593f0ff08a822f1961a954bf467f3378",
  "hunks": [
   {
    "at": 4,
    "before": "import {createHash} from 'node:crypto';\nimport {createSourceEpochProjector} from './combined-epoch/source-epoch-runtime.mjs';\nconst hash=b=>createHash('sha256').update(b).digest('hex');",
    "after": "import {createHash} from 'node:crypto';\nimport {createComposedSourceEpochProjector,createSourceEpochProjector} from './combined-epoch/source-epoch-runtime.mjs';\nconst hash=b=>createHash('sha256').update(b).digest('hex');"
   },
   {
    "at": 18,
    "before": "  targets:{...prior.targets,watcherFlowPrior:{commit:outer.targets.prior.commit,files:prior.current}}};\n const current=createSourceEpochProjector(proof,{allowConfigLayout:true}),live=p=>readFileSync(p,'utf8'),readers=new WeakMap();\n function preCombinedSource(path,source,{target,readSource=live}={}){",
    "after": "  targets:{...prior.targets,watcherFlowPrior:{commit:outer.targets.prior.commit,files:prior.current}}};\n const current=createComposedSourceEpochProjector(proof),live=p=>readFileSync(p,'utf8'),readers=new WeakMap();\n function preCombinedSource(path,source,{target,readSource=live}={}){"
   }
  ]
 },
 {
  "path": "tests/helpers/noncombat-source-epoch.mjs",
  "beforeSha256": "6c012fe3e62431051d2ac6dbfe2af96c97fa1a7f617cda3413582ea50b6cbb50",
  "afterSha256": "4b8705f85cf1609b8e1c28253610b3ddc4ea8a1fa8dae4b054601c56fdd3c9b2",
  "hunks": [
   {
    "at": 5,
    "before": "import {createHash} from 'node:crypto';\nimport {createSourceEpochProjector} from './combined-epoch/source-epoch-runtime.mjs';\nconst hash=s=>createHash('sha256').update(s).digest('hex');",
    "after": "import {createHash} from 'node:crypto';\nimport {createComposedSourceEpochProjector} from './combined-epoch/source-epoch-runtime.mjs';\nconst hash=s=>createHash('sha256').update(s).digest('hex');"
   },
   {
    "at": 20,
    "before": " const owners=paths.filter(p=>Object.values(targets).some(t=>t.files[p]?.sha256!==current[p]?.sha256));\n return createSourceEpochProjector({...prior.proof,currentCommit:archive.afterCommit,\n  currentCommitRole:'committed complete noncombat production source slice',currentTreeCommitted:true,\n  current,targets,owners},{allowConfigLayout:true});\n}",
    "after": " const owners=paths.filter(p=>Object.values(targets).some(t=>t.files[p]?.sha256!==current[p]?.sha256));\n return createComposedSourceEpochProjector({...prior.proof,currentCommit:archive.afterCommit,\n  currentCommitRole:'committed complete noncombat production source slice',currentTreeCommitted:true,\n  current,targets,owners});\n}"
   }
  ]
 },
 {
  "path": "tests/architecture-token-read.test.mjs",
  "beforeSha256": "1cd2336bca41624bf4a1ba16fde096ec111895d69a7c8400b78c60e93e7fd2d8",
  "afterSha256": "e70beefba57e546d8aa638fd2a2193dbb6a44784ddf7e24e9ac0ac77dc275781",
  "hunks": [
   {
    "at": 13,
    "before": "   const result=spawnSync(process.execPath,['--trace-event-file-pattern='+output,fileURLToPath(new URL('./helpers/architecture-token-read-probe.mjs',import.meta.url)),mode],{encoding:'utf8',timeout:30000,maxBuffer:1024*1024,windowsHide:true});\n   assert.ifError(result.error);assert.equal(result.status,0,result.stdout+result.stderr);\n   const events=JSON.parse(readFileSync(output,'utf8')).traceEvents;",
    "after": "   const result=spawnSync(process.execPath,['--trace-event-file-pattern='+output,fileURLToPath(new URL('./helpers/architecture-token-read-probe.mjs',import.meta.url)),mode],{encoding:'utf8',timeout:30000,maxBuffer:1024*1024,windowsHide:true});\n   assert.equal(result.error,undefined,mode+': '+result.error?.message);\n   assert.equal(result.status,0,mode+': '+result.stdout+result.stderr);\n   const events=JSON.parse(readFileSync(output,'utf8')).traceEvents;"
   }
  ]
 },
 {
  "path": "tests/helpers/seven-refactor-source-epoch.mjs",
  "beforeSha256": "adee26f0be88462722cd374430150bf7e519c359df87f852f93708629b60b942",
  "afterSha256": "5944f7c74d61e93fa5870281b5cc45993535c2e96c4d0014a1d5fe24baa46341",
  "hunks": [
   {
    "at": 4,
    "before": "import {createHash} from 'node:crypto';\nimport {createSourceEpochProjector} from './combined-epoch/source-epoch-runtime.mjs';\nconst hash=b=>createHash('sha256').update(b).digest('hex');",
    "after": "import {createHash} from 'node:crypto';\nimport {createComposedSourceEpochProjector,createSourceEpochProjector} from './combined-epoch/source-epoch-runtime.mjs';\nconst hash=b=>createHash('sha256').update(b).digest('hex');"
   },
   {
    "at": 18,
    "before": "  targets:{...prior.targets,sevenPrior:{commit:outer.targets.prior.commit,files:prior.current}}};\n const current=createSourceEpochProjector(proof,{allowConfigLayout:true}),live=p=>readFileSync(p,'utf8'),readers=new WeakMap();\n function preCombinedSource(path,source,{target,readSource=live}={}){",
    "after": "  targets:{...prior.targets,sevenPrior:{commit:outer.targets.prior.commit,files:prior.current}}};\n const current=createComposedSourceEpochProjector(proof),live=p=>readFileSync(p,'utf8'),readers=new WeakMap();\n function preCombinedSource(path,source,{target,readSource=live}={}){"
   }
  ]
 },
 {
  "path": "tests/helpers/combined-epoch/pre-defect-source-epoch.mjs",
  "beforeSha256": "ee1631bc3e9e29ac7ef4f96b9c42769d75cb3bfe11881b2e07b868344c3e51fa",
  "afterSha256": "6199f290e0faf4770452de5e6481aa4d27e4d039bcd2d4b6673b96694726d6d0",
  "hunks": [
   {
    "at": 9,
    "before": "import {createHash} from 'node:crypto';\nimport {createSourceEpochProjector} from './source-epoch-runtime.mjs';\nconst hash=b=>createHash('sha256').update(b).digest('hex');",
    "after": "import {createHash} from 'node:crypto';\nimport {createComposedSourceEpochProjector} from './source-epoch-runtime.mjs';\nconst hash=b=>createHash('sha256').update(b).digest('hex');"
   },
   {
    "at": 23,
    "before": "// Standalone siblings retain their original exact 45/46-owner contracts.\nexport const preWatcherFlowEpoch=extendSevenRefactorEpoch(createSourceEpochProjector(proof,{allowConfigLayout:true}));\nexport const preSilentTacticsEpoch=preWatcherFlowEpoch;",
    "after": "// Standalone siblings retain their original exact 45/46-owner contracts.\nexport const preWatcherFlowEpoch=extendSevenRefactorEpoch(createComposedSourceEpochProjector(proof));\nexport const preSilentTacticsEpoch=preWatcherFlowEpoch;"
   }
  ]
 },
 {
  "path": "tests/lua/hero_visual_slots.lua",
  "beforeSha256": "b1ead443273aeb30c303626d50227fc484f788e93497d34abc218d380ba5dc84",
  "afterSha256": "15eddfa2f7b93269d9eb511d23e204af813703d8838145ec0bf632d110187b98",
  "hunks": [
   {
    "at": 40,
    "before": "local panel = root:GetChild(\"characterPanel\")\nassert(panel:GetChild(\"details\").visible, \"production opens on the traveler, not a blank card\")\nassert(ui.characterSelection.character == \"traveler\" and ui.characterSelection.element == \"ironclad\")",
    "after": "local panel = root:GetChild(\"characterPanel\")\nassert(not ui.characterSelection:canConfirm() and panel:GetChild(\"traveler\").visible,\n    \"production waits for the approved traveler choice\")\nassert(F.click(root, \"characterPanel\", \"traveler\"))\nassert(panel:GetChild(\"details\").visible, \"explicit traveler selection shows the portrait details\")\nassert(ui.characterSelection.character == \"traveler\" and ui.characterSelection.element == \"ironclad\")"
   }
  ]
 },
 {
  "path": "tests/helpers/menu-red-ci-source.mjs",
  "beforeSha256": "394646c52880cefde01a9a37cea15663303fa6513e3a05656c25892201c9be39",
  "afterSha256": "6cef51a2b49f821ab26d6dbd54b84907e2590b98cdf9a8fef1f3f5959950c895",
  "hunks": [
   {
    "at": 6,
    "before": "import {menuCiBytes} from './menu-red-ci-binding.mjs';\nconst hash=s=>createHash('sha256').update(s).digest('hex'),norm=s=>s.replaceAll('\\r\\n','\\n');",
    "after": "import {menuCiBytes} from './menu-red-ci-binding.mjs';\nimport {beforeCurrentReplayFixes} from './current-replay-fix-sources.mjs';\nconst hash=s=>createHash('sha256').update(s).digest('hex'),norm=s=>s.replaceAll('\\r\\n','\\n');"
   },
   {
    "at": 30,
    "before": " assert.deepEqual([...paths].sort(),menuRedCiProof.afterLua,'complete current menu Lua discovery');\n for(const [path,row]of Object.entries(menuRedCiProof.addedLua))assert.equal(hash(norm(read(path,'utf8'))),row.sha256,'complete added menu Lua source: '+path);\n return [...menuRedCiProof.beforeLua];",
    "after": " assert.deepEqual([...paths].sort(),menuRedCiProof.afterLua,'complete current menu Lua discovery');\n for(const [path,row]of Object.entries(menuRedCiProof.addedLua)){\n  const source=beforeCurrentReplayFixes(path,read(path,'utf8'));\n  assert.equal(hash(norm(source)),row.sha256,'complete added menu Lua source: '+path);\n }\n return [...menuRedCiProof.beforeLua];"
   }
  ]
 },
 {
  "path": "tests/deck-browser-reveal-reuse.test.mjs",
  "beforeSha256": "06051b73e8934663ec72e1ed6af3515ec02339d60c63d504ef44386669a9c9c1",
  "afterSha256": "426a4834dd07c3fd27a5b4feed6ba17ed1f65f6f0ba45f70bf106a9529ede7e5",
  "hunks": [
   {
    "at": 138,
    "before": "run.combat.draw={};assert(host:openDeck('draw'));settle();assert(#deck.cards==0 and not deck.pendingGrid and not deck.calibrating,'N to EMPTY left preparation pending')\n",
    "after": "run.combat.draw={};assert(host:openDeck('draw'));settle();assert(#deck.cards==0 and not deck.pendingGrid and not deck.calibrating,'N to EMPTY left preparation pending')\nassert(host:closeDeck());settle()\n-- Commands issued by a sibling native callback invalidate the eager cover paint.\nlocal Run=require('abyss_run')\nlocal function coveredCallback(change)\n local mapPanel=root:GetChild('mapPanel');local mapVisible=mapPanel.SetVisible\n local replayed,paints=false,0\n host.battleUI.render=function(self,...)paints=paints+1;return renderOriginal(self,...)end\n mapPanel.SetVisible=function(self,visible)\n  local result=mapVisible(self,visible)\n  if not replayed then replayed=true;change()end\n  return result\n end\n assert(host:openDeck('draw'));mapPanel.SetVisible=mapVisible;host.battleUI.render=renderOriginal\n assert(replayed and paints==2,'reentrant combat command must repaint the newly covered battle')\nend\ncoveredCallback(function()\n for _,candidate in ipairs(run.combat.hand)do\n  if F.Combat.canPlay(run.combat,candidate.uid,nil)then assert(Run.play(run,candidate.uid));return end\n end\n error('fixture hand requires a legal no-target card')\nend)\nassert(host:closeDeck());settle()\nassert(Run.obtainPotion(run,'fire_potion'));host:refresh();assert(host.battleUI.potionSlots[1])\nlocal function withoutEvents(change)\n local events=run.combat.events;local count=#events\n assert(change());assert(run.combat.events==events and #events==count)\nend\ncoveredCallback(function()withoutEvents(function()return Run.discardPotion(run,1)end)end)\nassert(not host.battleUI.potionSlots[1],'eventless discard left a stale potion control')\nassert(host:closeDeck());settle()\nlocal cap=run.maxHp\ncoveredCallback(function()withoutEvents(function()return Run.increaseMaxHp(run,1)end)end)\nassert(run.maxHp==cap+1 and root:GetChild('battlePanel'):GetChild('player').text:match('/'..(cap+1)..'$'),\n 'eventless max-health change left a stale HUD')\nassert(host:closeDeck());settle()\n"
   }
  ]
 },
 {
  "path": "tests/colorless-catalog-source.test.mjs",
  "beforeSha256": "7099f6c9f8572b220c45d463ed986c039076a5baefae08ce7608749da476188d",
  "afterSha256": "1f2fc5bff24370b718aee29cdd4ef744f1096f7a2088a7691b401c7de86ebe50",
  "hunks": [
   {
    "at": 2,
    "before": "import {readFileSync,mkdtempSync,mkdirSync,writeFileSync,existsSync,rmSync,symlinkSync} from 'node:fs';\nimport {join} from 'node:path';import {tmpdir} from 'node:os';\nimport {createHash} from 'node:crypto';",
    "after": "import {readFileSync,mkdtempSync,mkdirSync,writeFileSync,existsSync,rmSync,symlinkSync} from 'node:fs';\nimport {join} from 'node:path';import {availableParallelism,tmpdir} from 'node:os';\nimport {createHash} from 'node:crypto';"
   },
   {
    "at": 10,
    "before": "import {beforeInputRetirementReader,pointerInputPath,retiredControllerPath} from './helpers/input-retirement-source.mjs';\nconst read=p=>readFileSync(p,'utf8').replaceAll('\\r\\n','\\n');",
    "after": "import {beforeInputRetirementReader,pointerInputPath,retiredControllerPath} from './helpers/input-retirement-source.mjs';\nimport {hasTestNameFilter,runIsolatedTest} from './helpers/isolated-historical-cases.mjs';\nconst read=p=>readFileSync(p,'utf8').replaceAll('\\r\\n','\\n');"
   },
   {
    "at": 86,
    "before": "\ntest('every current Colorless entry freshly authenticates the full dynamic owner set through all reader forms',()=>{\n const currentOwners=[...sourceEpoch.proof.owners,pointerInputPath];",
    "after": "\nconst expandedColorlessCase='every current Colorless entry freshly authenticates the full dynamic owner set through all reader forms';\nconst expandedColorlessLane='--colorless-expanded-owner-lane';\ntest(expandedColorlessCase,async()=>{\n const wrappers=[r=>r,colorlessCatalogReader,r=>colorlessCatalogReader(colorlessCatalogReader(r))];\n const entries=originals.flatMap((path,pathIndex)=>wrappers.map((wrap,wrapperIndex)=>({\n  path,wrap,lane:(pathIndex+wrapperIndex)%2,\n })));\n assert.equal(entries.length,9,'every Colorless entry uses all three reader forms');\n let selected=entries;\n if(process.argv[2]===expandedColorlessLane){\n  const lane=Number(process.argv[3]);assert(lane===0||lane===1,'registered Colorless owner lane');\n  selected=entries.filter(entry=>entry.lane===lane);\n  assert.equal(selected.length,lane===0?5:4,'all entry and reader pairs for this lane');\n }else if(process.platform==='win32'&&process.env.GITHUB_ACTIONS==='true'&&process.env.RUNNER_ENVIRONMENT==='github-hosted'\n  &&availableParallelism()>=4&&!hasTestNameFilter()){\n  const outcomes=await Promise.allSettled([0,1].map(lane=>runIsolatedTest(import.meta.url,\n   [expandedColorlessLane,String(lane)],[`--test-name-pattern=^${expandedColorlessCase}$`])));\n  for(const result of outcomes){\n   if(result.status==='rejected')throw result.reason;\n   process.stdout.write(result.value);\n  }\n  return;\n }\n const currentOwners=[...sourceEpoch.proof.owners,pointerInputPath];"
   },
   {
    "at": 113,
    "before": " const current=Object.fromEntries(currentOwners.filter(path=>path!==retiredControllerPath).map(path=>[path,read(path)]));\n for(const path of originals)for(const wrap of [r=>r,colorlessCatalogReader,r=>colorlessCatalogReader(colorlessCatalogReader(r))]){\n  let bad=null,mode='good',seen=[];",
    "after": " const current=Object.fromEntries(currentOwners.filter(path=>path!==retiredControllerPath).map(path=>[path,read(path)]));\n for(const {path,wrap} of selected){\n  let bad=null,mode='good',seen=[];"
   }
  ]
 },
 {
  "path": "tests/presentation-m3-integration.test.mjs",
  "beforeSha256": "6e19dcf15657ae91f216c99aca9183e7db0471db21ce7da064a1a68c5e9441dc",
  "afterSha256": "896e12caa792d05f5f9272136858beb8655d83fa74d1b69a4ff790dd98f9d628",
  "hunks": [
   {
    "at": 5,
    "before": "import {spawnSync} from 'node:child_process';\nimport {runLua} from '../scripts/test-lua.mjs';",
    "after": "import {spawnSync} from 'node:child_process';\nimport {availableParallelism} from 'node:os';\nimport {runLua} from '../scripts/test-lua.mjs';"
   },
   {
    "at": 13,
    "before": "import {preMaxHpSource} from './helpers/max-hp-accepted-source-inverse.mjs';\n",
    "after": "import {preMaxHpSource} from './helpers/max-hp-accepted-source-inverse.mjs';\nimport {hasTestNameFilter,runIsolatedTest} from './helpers/isolated-historical-cases.mjs';\n\nconst cases=[];\nconst replay=(...args)=>cases.push([historicalTest,args]);\nconst check=(...args)=>cases.push([test,args]);\n"
   },
   {
    "at": 116,
    "before": "\nhistoricalTest('M3 frame and first UI batch retain every old native write except the explicitly reviewed visual delta',()=>{\n  assert.equal(proof.base,'4f5bf5bb30821f88f33467585abec3caba7e6005');",
    "after": "\nreplay('M3 frame and first UI batch retain every old native write except the explicitly reviewed visual delta',()=>{\n  assert.equal(proof.base,'4f5bf5bb30821f88f33467585abec3caba7e6005');"
   },
   {
    "at": 126,
    "before": "\ntest('visual proof rejects changed gameplay text, missing writes, reordered writes and broadened visual approval',()=>{\n  const wrong=[...proof.after];const position=wrong.findIndex(value=>value.includes('/hp,2=string:text,'));",
    "after": "\ncheck('visual proof rejects changed gameplay text, missing writes, reordered writes and broadened visual approval',()=>{\n  const wrong=[...proof.after];const position=wrong.findIndex(value=>value.includes('/hp,2=string:text,'));"
   },
   {
    "at": 141,
    "before": " [79757,1467902785,retirementSources.beforeSources],\n])historicalTest(`the accepted presentation sources still execute the original strict ${count}-write fixture`,()=>{\n  mkdirSync('build',{recursive:true});const directory=mkdtempSync(resolve('build/accepted-presentation-'));",
    "after": " [79757,1467902785,retirementSources.beforeSources],\n])replay(`the accepted presentation sources still execute the original strict ${count}-write fixture`,()=>{\n  mkdirSync('build',{recursive:true});const directory=mkdtempSync(resolve('build/accepted-presentation-'));"
   },
   {
    "at": 168,
    "before": "\nhistoricalTest('historical replay inputs bind every changed build, host and version source, including the deleted module',()=>{\n assert.deepEqual(retirementSources.trace,{before:[79757,1467902785],removed:68,after:[79689,2034622601]});",
    "after": "\nreplay('historical replay inputs bind every changed build, host and version source, including the deleted module',()=>{\n assert.deepEqual(retirementSources.trace,{before:[79757,1467902785],removed:68,after:[79689,2034622601]});"
   },
   {
    "at": 179,
    "before": "\nhistoricalTest('historical relic input is the complete frozen pre-Molten/Mushrooms source, not a reduced live dataset',()=>{\n const path='data/relics.json',live=readFileSync(path,'utf8').replaceAll('\\r\\n','\\n');",
    "after": "\nreplay('historical relic input is the complete frozen pre-Molten/Mushrooms source, not a reduced live dataset',()=>{\n const path='data/relics.json',live=readFileSync(path,'utf8').replaceAll('\\r\\n','\\n');"
   },
   {
    "at": 196,
    "before": "\nhistoricalTest('NodeUI refactor inverse preserves historical Mushrooms copy and rejects drift in every responsibility',()=>{\n const path='src/lua/abyss_node_ui.lua',source=readFileSync(path,'utf8').replaceAll('\\r\\n','\\n');",
    "after": "\nreplay('NodeUI refactor inverse preserves historical Mushrooms copy and rejects drift in every responsibility',()=>{\n const path='src/lua/abyss_node_ui.lua',source=readFileSync(path,'utf8').replaceAll('\\r\\n','\\n');"
   },
   {
    "at": 217,
    "before": "\ntest('historical announcement copy is independent of current player text but rejects archive tampering',()=>{\n const historical=retirementSources.beforeSources['CHANGELOG.md'];",
    "after": "\ncheck('historical announcement copy is independent of current player text but rejects archive tampering',()=>{\n const historical=retirementSources.beforeSources['CHANGELOG.md'];"
   },
   {
    "at": 232,
    "before": "",
    "after": "\n// Each Windows worker owns its historical checkout and keeps the original\n// fixture deadlines. Pair the 79757-write replay with the frame provenance\n// case and keep the other 79543-write replay with the remaining checks.\nconst firstLane=new Set([\n 'M3 frame and first UI batch retain every old native write except the explicitly reviewed visual delta',\n 'the accepted presentation sources still execute the original strict 79757-write fixture',\n]);\nconst lanes=[cases.filter(([, [name]])=>firstLane.has(name)),cases.filter(([, [name]])=>!firstLane.has(name))];\nassert.equal(lanes[0].length,firstLane.size,'all first-lane cases are registered');\nassert.equal(new Set(cases.map(([, [name]])=>name)).size,cases.length,'every registered case is unique');\nconst laneFlag='--isolated-presentation-m3-lane';\nif(process.argv[2]===laneFlag){\n const lane=lanes[Number(process.argv[3])];assert(lane,'registered M3 presentation lane');\n for(const [register,args] of lane)register(...args);\n}else if(process.platform==='win32'&&process.env.GITHUB_ACTIONS==='true'&&process.env.RUNNER_ENVIRONMENT==='github-hosted'\n &&availableParallelism()>=4&&!hasTestNameFilter()){\n test('Windows M3 presentation replays',async()=>{\n  const outcomes=await Promise.allSettled(lanes.map((lane,index)=>runIsolatedTest(import.meta.url,[laneFlag,String(index)],[],lane.length)));\n  for(const result of outcomes){\n   if(result.status==='rejected')throw result.reason;\n   process.stdout.write(result.value);\n  }\n });\n}else{\n for(const [register,args] of cases)register(...args);\n}\n"
   }
  ]
 },
 {
  "path": "tests/helpers/game-ui-host-equivalence.mjs",
  "beforeSha256": "8455091292b8742bdec9a639e2e841827465a2949fb969d9e3c8219cb5343d96",
  "afterSha256": "f03d734bc96cd9839ea4a114c1c488a3f6825e910ca2638a86cc85e674808c72",
  "hunks": [
   {
    "at": 30,
    "before": " fs.writeFileSync(f,text.replace(needle,'if ABYSS_HOST_CONTROL then ABYSS_HOST_CONTROL(self) end\\n    '+needle));\n return dir;",
    "after": " fs.writeFileSync(f,text.replace(needle,'if ABYSS_HOST_CONTROL then ABYSS_HOST_CONTROL(self) end\\n    '+needle));\n const trace=path.join(dir,'tests/lua/support/game_ui_host_trace.lua');\n const collector=fs.readFileSync(trace,'utf8'),pathStart=/^ local function path\\(\\)(\\r?\\n)/gm;\n assert.equal([...collector.matchAll(pathStart)].length,1);\n // The archived collector evaluates path() before record() can discard an\n // event outside the selected window. Avoid walking the parent chain for\n // those discarded events in both historical VMs.\n fs.writeFileSync(trace,collector.replace(pathStart,(_,eol)=>[\n  ' local function path()',\n  '  local nextCheckpoint=count+1',\n  '  if not ABYSS_HOST_FULL_TRACE or nextCheckpoint<(ABYSS_HOST_FROM or 1) or nextCheckpoint>(ABYSS_HOST_TO or 35) then return end',\n  '',\n ].join(eol)));\n return dir;"
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
