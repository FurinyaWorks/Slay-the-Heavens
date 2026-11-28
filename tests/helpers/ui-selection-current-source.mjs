import assert from 'node:assert/strict';
import {restoreExactFixtureHunks} from './exact-fixture-hunks.mjs';
import {exactSourceMatches} from './source-fingerprint.mjs';
import {uiEntranceOwns} from './ui-entrance-source.mjs';
import {beforeNodeNoticeSource} from './reward-current-source.mjs';
import {checkedReleaseEntranceOwner} from './release-entrance-owner-source.mjs';
import {beforeReleaseClosureFixture,rewardTitleSources,selectionRawEntranceReplay} from './release-closure-fixture-source.mjs';

// Replay the exact active fixture and copier predecessors without replacing prior receipts.
const receipts=Object.freeze({
 "tests/official-assets.test.mjs": {
  "current": {
   "sha256": "da41c85b22368e3ed4719a808b95548420959b2941af3a049c8231bc07adc5f4",
   "gitBlob": "be08d4f5085665c5ba12b35f611728edb4e0cc28"
  },
  "previous": {
   "sha256": "9033a9a6d33e4a133feb8db12fadcab03b6b96ec53d06c77e9fc22fadabba352",
   "gitBlob": "c794c0296c2b1cc06a6f9a63902d9577ab0143e1"
  },
  "hunks": [
   {
    "at": 106,
    "before": " const current=new Map([...paths(layout),...paths(template)]);\n const retiredDeckPrefix='/SlayTheAbyss/characterPanel/deckView/';\n const retiredStarterEntry=path=>/^\\/SlayTheAbyss\\/characterPanel\\/details\\/deck(?:Open|Title|Summary|Rule)(?:\\/|$)/.test(path);\n const retiredOverlay=path=>/^\\/SlayTheAbyss\\/(?:prologuePanel(?:\\/|$)|(?:exitPanel|runMenu)\\/(?:help|guide)(?:\\/|$)|potionPanel\\/)/.test(path);\n const retiredPickerChild=path=>/^\\/SlayTheAbyss\\/nodePanel\\/pickerView\\/card[4-6]\\//.test(path);\n const retiredChoice=path=>/^\\/SlayTheAbyss\\/choicePanel\\/card(?:[3-9]|10)(?:\\/|$)/.test(path);\n const retiredDeck=child(child(layout,'characterPanel'),'deckView');\n assert.equal(retiredDeck.visible,false);assert.deepEqual(retiredDeck.children,[],\n  'selection must use the shared deck browser instead of keeping twelve independent card slots');\n const merchant=new Map(paths(merchantControl(theme),'/SlayTheAbyss/nodePanel'));\n  for(const [path,node,before] of semantic){",
    "after": " const current=new Map([...paths(layout),...paths(template)]);\n const retiredDeckPrefix='/SlayTheAbyss/characterPanel/deckView/';\n const retiredStarterEntry=path=>/^\\/SlayTheAbyss\\/characterPanel\\/(?:deckView$|details\\/deck(?:Open|Rule|Title|Summary)(?:\\/|$))/.test(path);\n const retiredOverlay=path=>/^\\/SlayTheAbyss\\/(?:prologuePanel(?:\\/|$)|(?:exitPanel|runMenu)\\/(?:help|guide)(?:\\/|$)|potionPanel\\/)/.test(path);\n const retiredPickerChild=path=>/^\\/SlayTheAbyss\\/nodePanel\\/pickerView\\/card[4-6]\\//.test(path);\n const retiredChoice=path=>/^\\/SlayTheAbyss\\/choicePanel\\/card(?:[3-9]|10)(?:\\/|$)/.test(path);\n assert.equal(child(child(layout,'characterPanel'),'deckView'),undefined);\n const merchant=new Map(paths(merchantControl(theme),'/SlayTheAbyss/nodePanel'));\n  for(const [path,node,before] of semantic){"
   }
  ]
 },
 "tests/sts-character-browser.test.mjs": {
  "current": {
   "sha256": "f10724414fe7a44db6eead4007fbed882a69b6db090c10d017ee84b74f51c2a6",
   "gitBlob": "30d12b5dd4900db8a86ccb7e84cd9bee87402145"
  },
  "previous": {
   "sha256": "a8c371980710a7824aff8328cf5c041b06b1199eea548cb4e51b17668a7d40dc",
   "gitBlob": "be5b6ad2bc339cfc227818355a4505b94f88ddf9"
  },
  "hunks": [
   {
    "at": 76,
    "before": "assert(deck.browserShell and not deck.pileView and not deck.pileKind and not deck.choiceToken and not deck.battle)\nassert(deck.run.readOnlyPreview and #deck.cards==info.deckSize and deckPanel:GetChild('pileGrid').visible)\nassert(not panel.visible and not panel:GetChild('deckView').visible and #panel:GetChild('deckView'):GetChildren()==0)\nassert(host.pointerBlocked(),'preparation must keep preview input covered')\nassert(not host:openStarterDeck(),'covered/reentrant opening must fail')",
    "after": "assert(deck.browserShell and not deck.pileView and not deck.pileKind and not deck.choiceToken and not deck.battle)\nassert(deck.run.readOnlyPreview and #deck.cards==info.deckSize and deckPanel:GetChild('pileGrid').visible)\nassert(not panel.visible and not panel:GetChild('deckView'))\nassert(host.pointerBlocked(),'preparation must keep preview input covered')\nassert(not host:openStarterDeck(),'covered/reentrant opening must fail')"
   }
  ]
 },
 "tests/helpers/copy-integration-source-closure.mjs": {
  "current": {
   "sha256": "afa853afb92fccdd8c458cbe59c9e8e802facf422f9e3f460666c91eb6267bcf",
   "gitBlob": "4f42b1c3cca2582f88b9a6a03767e98e0c17cb7f"
  },
  "previous": {
   "sha256": "94a17264d5283f4e57edec8dd99d116e3b7ffd94543f1bc96e587cd8131d8157",
   "gitBlob": "3418cf344390eb729c5b5f012d76512a190750c2"
  },
  "hunks": [
   {
    "at": 349,
    "before": " 'tests/helpers/refined-release-source.mjs':'747f63088f1830dad97f7fa116df16f265c555639c9a01161ba9ba3b3b5ecc5c',\n 'tests/helpers/battle-periphery-source.mjs':'d436c48e4fb14039a53361fdf8464512f6a95226c81ff32ffe4d2930877db210',\n 'tests/helpers/rebased-release-source.mjs':'9c06103ee6926bb5def608470430784145880f69d4c3aee3fb35787c1309d509',\n 'tests/helpers/chapter-battle-scene-source.mjs':'1270c293d79c04ac4a5b15483dd4cc8f9c4279362e2f5c551f6e98c20c9ad293',\n 'tests/helpers/release-integration-source.mjs':'74093921a53a94ba842afac199e579a622b60fea5abf2519d416ede77bbfa1a7',",
    "after": " 'tests/helpers/refined-release-source.mjs':'747f63088f1830dad97f7fa116df16f265c555639c9a01161ba9ba3b3b5ecc5c',\n 'tests/helpers/battle-periphery-source.mjs':'d436c48e4fb14039a53361fdf8464512f6a95226c81ff32ffe4d2930877db210',\n 'tests/helpers/rebased-release-source.mjs':'b1e42ded7f05f580fb25ab0417ccd8db45832f5e9e50db83a38d6aaa2767dc20',\n 'tests/helpers/chapter-battle-scene-source.mjs':'1270c293d79c04ac4a5b15483dd4cc8f9c4279362e2f5c551f6e98c20c9ad293',\n 'tests/helpers/release-integration-source.mjs':'74093921a53a94ba842afac199e579a622b60fea5abf2519d416ede77bbfa1a7',"
   },
   {
    "at": 355,
    "before": " 'tests/helpers/m7-core-final-source-inverse.mjs':'c9d98969785466649e0e915df0d912f81b774d8b937b4fb63e74eed731635133',\n 'tests/helpers/release-ui-restore-source.mjs':'2ec5855476f1b4c8cf762ca1a7ee366028322841b07996a518af96fdd87259b9',\n 'tests/helpers/current-replay-fix-sources.mjs':'bfef80da2fc30501c3b2e82cd14bdb8130e4a089f2db231ff2587804fa83a08b',\n 'tests/helpers/character-preparation-source.mjs':'30f20a242e7b9e6f86570e58c0dfb6ba72776599d6428a263062c5b074be88ce',\n 'tests/helpers/develop-release-backflow-source.mjs':'2834679eef440cf54e64cfb2c144c2fc6dbb5dc7ed048c3767435c250827337f',\n 'tests/helpers/native-fixture-replay-source.mjs':'7dbd2ded60c5b155b958a5e6e2ff44537b2b62c15e113642aaf8f6194771832d',\n 'tests/helpers/native-flow-fixture-source.mjs':'8ad7157fd4f3973ffba4f17f9eba440731ddf952e859fee53970d6c3879968e3',\n 'tests/helpers/ui-entrance-source.mjs':'55bbaca21af744a48dff1c5b445160b993bcf0862f813ce328a630408247e315',\n 'tests/helpers/exact-fixture-hunks.mjs':'83f9cb15d9d745c86c555a77875b6b2bfc283a12ec380bcd2af518aa6526a935',\n 'tests/fixtures/ui-entrance-source.json.gz':'7ac3f53b242819cdb569c0a1ebf60de0605b72297a1072ea612bfeb11b0597c9',",
    "after": " 'tests/helpers/m7-core-final-source-inverse.mjs':'c9d98969785466649e0e915df0d912f81b774d8b937b4fb63e74eed731635133',\n 'tests/helpers/release-ui-restore-source.mjs':'2ec5855476f1b4c8cf762ca1a7ee366028322841b07996a518af96fdd87259b9',\n 'tests/helpers/current-replay-fix-sources.mjs':'cceed97f15f0f91ab37ea27d3bf6f5659d213c54dcf11225eaa0fed7adc8ccdf',\n 'tests/helpers/character-preparation-source.mjs':'b556363648dd13827dacb603038423caf4a1c2693e618747df58fc29da7be2fd',\n 'tests/helpers/develop-release-backflow-source.mjs':'2834679eef440cf54e64cfb2c144c2fc6dbb5dc7ed048c3767435c250827337f',\n 'tests/helpers/native-fixture-replay-source.mjs':'7dbd2ded60c5b155b958a5e6e2ff44537b2b62c15e113642aaf8f6194771832d',\n 'tests/helpers/native-flow-fixture-source.mjs':'8ad7157fd4f3973ffba4f17f9eba440731ddf952e859fee53970d6c3879968e3',\n 'tests/helpers/ui-entrance-source.mjs':'c64976a04e877f65315ad8553bd8f6380b6e50a5ab5fce60e3b37bbbb98825c1',\n 'tests/helpers/ui-entrance-approved-sources.mjs':'b5c903614eb19f512e365c8c4024e1c40c37f5ab5df790a016dbeecf7b0efdcb',\n 'tests/helpers/ui-entrance-approved-sources.json':'58ea26de5268bc427bce73ecfb1ff43930f54b987c97777f9843e74d3467fe6d',\n 'tests/helpers/exact-fixture-hunks.mjs':'83f9cb15d9d745c86c555a77875b6b2bfc283a12ec380bcd2af518aa6526a935',\n 'tests/fixtures/ui-entrance-source.json.gz':'7ac3f53b242819cdb569c0a1ebf60de0605b72297a1072ea612bfeb11b0597c9',"
   }
  ]
 },
 "tests/helpers/replay-reviewed-selection.mjs": {
  "current": {
   "sha256": "5f81f16e89b98fd6d8e3dfeb5c5df09be9f2c2131a077dcdb25b8cf84cf70ea7",
   "gitBlob": "50a103a6bcaa5b17e98ae5a1621ca4bcbfab1c29"
  },
  "previous": {
   "sha256": "f39d920bd284ab1e069eb15e3433334ad9a6e1a8c516e326033b34eaaa4cc4a2",
   "gitBlob": "0492c4b56af211ed50ab40377e957d363d8d9bac"
  },
  "hunks": [
   {
    "at": 8,
    "before": "import {beforeCurrentProductionSource,beforeCharacterPreparationSource} from './character-preparation-source.mjs';\nimport {exactReviewedBuildInput} from './rebased-release-source.mjs';\nimport {beforeReviewedBuildInput} from './fork-preflight-source.mjs';\nimport {reviewedSelectionRead} from './reviewed-selection-current-source.mjs';\nimport {stsStylePriorRuntime} from './sts-style-prior-runtime.mjs';\nimport {beforeDeckPagesSuiteSource,readRetiredController,retiredControllerPath} from './input-retirement-source.mjs';",
    "after": "import {beforeCurrentProductionSource,beforeCharacterPreparationSource} from './character-preparation-source.mjs';\nimport {exactReviewedBuildInput} from './rebased-release-source.mjs';\nimport {beforeReviewedBuildInput,chapterEvidenceCurrentRead} from './fork-preflight-source.mjs';\nimport {reviewedSelectionRead} from './reviewed-selection-current-source.mjs';\nimport {uiEntranceOwns} from './ui-entrance-source.mjs';\nimport {checkedSelectionEntranceRead} from './ui-selection-current-source.mjs';\nimport {stsStylePriorRuntime} from './sts-style-prior-runtime.mjs';\nimport {beforeDeckPagesSuiteSource,readRetiredController,retiredControllerPath} from './input-retirement-source.mjs';"
   },
   {
    "at": 28,
    "before": " assertIntegratedCurrent();\n const readOwner=reviewedSelectionRead();\n const retiredInput=readRetiredController(readOwner);\n assert(retiredInput.restored,'only the exact pointer successor can restore the retired input owner');\n for(const [path,row]of Object.entries(sourceEpoch.proof.current)){\n  const source=path===retiredControllerPath?beforeCharacterPreparationSource(path,retiredInput.source,readOwner)\n   :beforeCurrentProductionSource(path,readOwner(path),readOwner);\n  assert.equal(hash(norm(source)),row.sha256,'fresh current production owner: '+path);\n }",
    "after": " assertIntegratedCurrent();\n const readOwner=reviewedSelectionRead();\n // Entrance authentication consumes live owners. The archived build still uses Selection's reviewed inputs.\n const readEntrance=chapterEvidenceCurrentRead(checkedSelectionEntranceRead(readFileSync));\n const readProductionOwner=(path,encoding='utf8')=>uiEntranceOwns(path)?readEntrance(path,encoding):readOwner(path,encoding);\n const retiredInput=readRetiredController(readOwner);\n assert(retiredInput.restored,'only the exact pointer successor can restore the retired input owner');\n for(const [path,row]of Object.entries(sourceEpoch.proof.current)){\n  const source=path===retiredControllerPath?beforeCharacterPreparationSource(path,retiredInput.source,readProductionOwner)\n   :beforeCurrentProductionSource(path,readProductionOwner(path),readProductionOwner);\n  assert.equal(hash(norm(source)),row.sha256,'fresh current production owner: '+path);\n }"
   },
   {
    "at": 48,
    "before": "   assert(!isAbsolute(path)&&!path.split('/').includes('..'));const target=join(directory,path);mkdirSync(dirname(target),{recursive:true});\n   const input=useArchivedOfficialInputs?readReviewedOfficialAssetInput(path):undefined;\n   const predecessor=input??exactReviewedBuildInput(path,readOwner,{beforeReviewedInput:beforeReviewedBuildInput});\n   if(predecessor===undefined)copyFileSync(path,target);\n   else writeFileSync(target,predecessor);",
    "after": "   assert(!isAbsolute(path)&&!path.split('/').includes('..'));const target=join(directory,path);mkdirSync(dirname(target),{recursive:true});\n   const input=useArchivedOfficialInputs?readReviewedOfficialAssetInput(path):undefined;\n   const predecessor=input??exactReviewedBuildInput(path,readProductionOwner,{beforeReviewedInput:beforeReviewedBuildInput});\n   if(predecessor===undefined)copyFileSync(path,target);\n   else writeFileSync(target,predecessor);"
   }
  ]
 },
 "tests/noncombat-v25-layout.test.mjs": {
  "current": {
   "sha256": "5d59eddc142a51cce13130c3ab631869ff9ba45650eff93ea7c3178da930a633",
   "gitBlob": "b677949615f579e7b4275afd0e58cf0ae6f995c3"
  },
  "previous": {
   "sha256": "bc1691dbb767b37e9b941418d6cb5f74189d4befd199e52f4a7a29d00fe65954",
   "gitBlob": "9425a6af09d6b26dec0b9b7c941e04e2d1d057ba"
  },
  "hunks": [
   {
    "at": 307,
    "before": "});\n\ntest('selection replay authenticates the current source for both changed owners',async()=>{\n const {beforeOfficialCharacterBackflow}=await import('./helpers/current-replay-fix-sources.mjs');\n const {assertCurrentUiEntrance,authenticateUiEntrance,beforeUiEntrance}=await import('./helpers/ui-entrance-source.mjs');\n const read=path=>readFileSync(path,'utf8');\n authenticateUiEntrance(read);\n for(const path of ['src/lua/abyss_character_select_view.lua','src/lua/abyss_game_ui_input.lua']){",
    "after": "});\n\nasync function selectionEntranceFixtureRead(read=readFileSync){\n const {beforeBattlePeriphery}=await import('./helpers/battle-periphery-source.mjs');\n const {beforeChapterBattleScene}=await import('./helpers/chapter-battle-scene-source.mjs');\n const {chapterEvidenceCurrentRead}=await import('./helpers/fork-preflight-source.mjs');\n const {checkedSelectionEntranceRead}=await import('./helpers/ui-selection-current-source.mjs');\n const readCurrent=chapterEvidenceCurrentRead(checkedSelectionEntranceRead(read));\n return path=>beforeBattlePeriphery(path,beforeChapterBattleScene(path,readCurrent(path,'utf8')));\n}\n\ntest('selection replay authenticates the current source for both changed owners',async()=>{\n const {beforeOfficialCharacterBackflow}=await import('./helpers/current-replay-fix-sources.mjs');\n const {assertCurrentUiEntrance,authenticateUiEntrance,beforeUiEntrance}=await import('./helpers/ui-entrance-source.mjs');\n const read=await selectionEntranceFixtureRead();\n authenticateUiEntrance(read);\n for(const path of ['src/lua/abyss_character_select_view.lua','src/lua/abyss_game_ui_input.lua']){"
   },
   {
    "at": 333,
    "before": " const {beforeApprovedUiEntrance}=await import('./helpers/ui-entrance-approved-sources.mjs');\n const {authenticateUiEntrance,beforeUiEntrance}=await import('./helpers/ui-entrance-source.mjs');\n const read=path=>readFileSync(path,'utf8');\n authenticateUiEntrance(read);\n for(const path of ['config/architecture.json',...['game_ui','game_ui_lifecycle','game_ui_run','game_ui_view',",
    "after": " const {beforeApprovedUiEntrance}=await import('./helpers/ui-entrance-approved-sources.mjs');\n const {authenticateUiEntrance,beforeUiEntrance}=await import('./helpers/ui-entrance-source.mjs');\n const read=await selectionEntranceFixtureRead();\n authenticateUiEntrance(read);\n for(const path of ['config/architecture.json',...['game_ui','game_ui_lifecycle','game_ui_run','game_ui_view',"
   },
   {
    "at": 345,
    "before": "  }\n  authenticateUiEntrance(owner=>owner===path?current.replaceAll('\\r\\n','\\n').replaceAll('\\n','\\r\\n'):read(owner));\n }\n});",
    "after": "  }\n  authenticateUiEntrance(owner=>owner===path?current.replaceAll('\\r\\n','\\n').replaceAll('\\n','\\r\\n'):read(owner));\n }\n const owner='src/lua/abyss_node_ui.lua';\n const lf=readFileSync(owner,'utf8').replaceAll('\\r\\n','\\n'),crlf=lf.replaceAll('\\n','\\r\\n');\n for(const mixed of [lf.replace('\\n','\\r\\n'),crlf.replace('\\r\\n','\\n')]){\n  let reads=0;\n  const changing=await selectionEntranceFixtureRead((path,encoding)=>\n   path===owner&&++reads>1?mixed:readFileSync(path,encoding));\n  assert.equal(changing(owner),read(owner));\n  assert.throws(()=>changing(owner),{message:'uniform current Selection entrance source: '+owner});\n }\n});"
   }
  ]
 }
});
// Only the exact backflow combination may replay the approved develop fixtures.
const combinedReceipts=Object.freeze({
 "tests/official-assets.test.mjs": {
  "current": {
   "sha256": "1984d8c172e465583f45d45821837733aa2befbe809e066025f0042784cb0ec5",
   "gitBlob": "8e9b3f1d7559067512d96f7a545bf037277846f7"
  },
  "previous": {
   "sha256": "da41c85b22368e3ed4719a808b95548420959b2941af3a049c8231bc07adc5f4",
   "gitBlob": "be08d4f5085665c5ba12b35f611728edb4e0cc28"
  },
  "hunks": [
   {
    "at": 8,
    "before": "import {gameLayout} from '../scripts/game-ui-layout.mjs';\nimport {deckCardTemplate} from '../scripts/deck-ui-layout.mjs';",
    "after": "import {gameLayout} from '../scripts/game-ui-layout.mjs';\nimport {experimentalCharacterControls} from '../scripts/character-ui-layout.mjs';\nimport {deckCardTemplate} from '../scripts/deck-ui-layout.mjs';"
   },
   {
    "at": 87,
    "before": " const eventProjection=new Map(paths(expectedEvent,'/SlayTheAbyss/nodePanel'));\n // The approved minimal menu is an adopted component too. Bind every owned",
    "after": " const eventProjection=new Map(paths(expectedEvent,'/SlayTheAbyss/nodePanel'));\n const expectedChoice=experimentalCharacterControls(theme).find(node=>node.name==='choicePanel');\n const choiceProjection=new Map(paths(expectedChoice,'/SlayTheAbyss'));\n const choicePath=path=>path.replace(/^(\\/SlayTheAbyss\\/choicePanel\\/)card([12])(?=\\/|$)/,'$1option$2');\n // The approved minimal menu is an adopted component too. Bind every owned"
   },
   {
    "at": 114,
    "before": " const retiredPickerChild=path=>/^\\/SlayTheAbyss\\/nodePanel\\/pickerView\\/card[4-6]\\//.test(path);\n const retiredChoice=path=>/^\\/SlayTheAbyss\\/choicePanel\\/card(?:[3-9]|10)(?:\\/|$)/.test(path);\n assert.equal(child(child(layout,'characterPanel'),'deckView'),undefined);",
    "after": " const retiredPickerChild=path=>/^\\/SlayTheAbyss\\/nodePanel\\/pickerView\\/card[4-6]\\//.test(path);\n const retiredChoice=path=>/^\\/SlayTheAbyss\\/choicePanel\\/card\\d+(?:\\/|$)/.test(path)&&!choiceProjection.has(choicePath(path));\n assert.equal(child(child(layout,'characterPanel'),'deckView'),undefined);"
   },
   {
    "at": 142,
    "before": "   }\n   assert.equal(current.get(path),node,path);\n   if(menuProjection.has(path)){",
    "after": "   }\n   if(menuProjection.has(path)){"
   },
   {
    "at": 157,
    "before": "    assert.deepEqual(node,eventProjection.get(path),path+' shared event projection');continue;\n   }",
    "after": "    assert.deepEqual(node,eventProjection.get(path),path+' shared event projection');continue;\n   }\n   if(choiceProjection.has(choicePath(path))){\n    const expected=choiceProjection.get(choicePath(path));\n    assert.strictEqual(current.get(choicePath(path)),node,path+' choice receiver identity');\n    for(const key of ['kind','position','size','visible','states','focusable','interactable','raycastTarget'])\n     assert.deepEqual(node[key],expected[key],path+' choice '+key);\n    if(node.text){\n     const actualText={...node.text},expectedText={...expected.text};\n     delete actualText.colour;delete expectedText.colour;\n     if(expectedText.autoSize&&expectedText.minFontSize*1.45+4>expected.size[1])expectedText.minFontSize=theme.font.minimum;\n     assert.deepEqual(actualText,expectedText,path+' choice text');\n    }\n    continue;\n   }"
   },
   {
    "at": 207,
    "before": "   if(node.text){const actual={...node.text},expected={...before.text};delete actual.colour;delete expected.colour;\n    if(cardText.has(node))for(const key of ['outline','outlineColour','outlineOpacity']){",
    "after": "   if(node.text){const actual={...node.text},expected={...before.text};delete actual.colour;delete expected.colour;\n    if(/^\\/SlayTheAbyss\\/relicBar\\/slot\\d+\\/counter$/.test(path))expected.autoSize=false;\n    if(cardText.has(node))for(const key of ['outline','outlineColour','outlineOpacity']){"
   },
   {
    "at": 243,
    "before": "    for(const key of Object.keys(before))assert.deepEqual(node[key],menuProjection.get(path)[key],path+' approved menu '+key);\n    continue;",
    "after": "    for(const key of Object.keys(before))assert.deepEqual(node[key],menuProjection.get(path)[key],path+' approved menu '+key);\n    continue;\n   }\n   if(choiceProjection.has(choicePath(path))){\n    assert.equal(current.get(choicePath(path)),node,path+' choice receiver identity');\n    for(const key of Object.keys(before))assert.deepEqual(node[key],choiceProjection.get(choicePath(path))[key],path+' choice '+key);\n    continue;"
   },
   {
    "at": 288,
    "before": "    }\n    assert.deepEqual(node[key],key==='size'&&cardHosts.has(node)?theme.layout.card.size:expected[key],path+' '+key);",
    "after": "    }\n    if(key==='size'&&/^\\/SlayTheAbyss\\/deckEntry\\/open\\/hit\\/(?:normal|hover|pressed|disabled)$/.test(path)){\n     assert.deepEqual(node.size,[104,before.size[1]],path+' room for the fixed-size deck amount');continue;\n    }\n    assert.deepEqual(node[key],key==='size'&&cardHosts.has(node)?theme.layout.card.size:expected[key],path+' '+key);"
   },
   {
    "at": 301,
    "before": " assert.equal(retiredPickerCards.length,3,'only picker faces four through six are retired');\n assert.equal(retiredChoiceCards.length,8,'only choice faces three through ten are retired');\n const retiredCards=[...retiredDeckCards,...retiredPickerCards,...retiredChoiceCards];",
    "after": " assert.equal(retiredPickerCards.length,3,'only picker faces four through six are retired');\n assert.equal(retiredChoiceCards.length,10,'every static choice card face is retired');\n const choice=child(layout,'choicePanel');\n assert.deepEqual(child(choice,'cards'),child(expectedChoice,'cards'),'reusable native choice scroller');\n for(const name of ['confirm','before','after','option1','option2']){\n  const hit=child(child(choice,name),'hit');\n  for(const state of children(hit))assert.equal(child(state,'roundedButton').kind,'container');\n }\n const retiredCards=[...retiredDeckCards,...retiredPickerCards,...retiredChoiceCards];"
   },
   {
    "at": 312,
    "before": " const focusFacePath='/SlayTheAbyss/deckPanel/cardFocus/face';\n const originalCardPaths=nodes.filter(([path,node])=>path!==focusFacePath&&cardHosts.has(node)&&!retiredCards.includes(node)).map(([path])=>path).sort();\n const liveOriginalPaths=cardPaths.filter(([path])=>path!==focusFacePath).map(([path])=>path).sort();\n assert.equal(originalCardPaths.length,38,'retain the original 38 official card hosts');\n assert.deepEqual(liveOriginalPaths,originalCardPaths,'retain every original active card host path');\n const focusFaces=cardPaths.filter(([path])=>path===focusFacePath);",
    "after": " const focusFacePath='/SlayTheAbyss/deckPanel/cardFocus/face';\n const choiceFacePaths=['/SlayTheAbyss/choicePanel/card1/face','/SlayTheAbyss/choicePanel/card2/face'];\n const replacedChoiceFaces=nodes.filter(([path,node])=>choiceFacePaths.includes(path)&&retiredChoiceCards.includes(node));\n assert.deepEqual(replacedChoiceFaces.map(([path])=>path).sort(),choiceFacePaths,'the shared scroller supersedes the two former static choice hosts');\n const publishedOriginalPaths=nodes.filter(([path,node])=>path!==focusFacePath&&cardHosts.has(node)&&!retiredCards.includes(node)).map(([path])=>path).sort();\n assert.equal(publishedOriginalPaths.length+replacedChoiceFaces.length,38,'account for all 38 reviewed original official card hosts');\n assert.deepEqual(cardPaths.filter(([path])=>path!==focusFacePath).map(([path])=>path).sort(),publishedOriginalPaths,'retain every original active card host path outside the shared scroller');\n assert.equal(cards.length,37);\n const focusFaces=cardPaths.filter(([path])=>path===focusFacePath);"
   },
   {
    "at": 431,
    "before": " for(const key of ['floor','victories','time','deck']){\n  const stat=child(result,'stat_'+key);assert.equal(child(stat,'face').image,107311);\n  assert.equal(child(stat,'face').colour,'#FFFFFF');assert.equal(child(stat,'border').colour,nativeTheme.color.goldDim);\n }",
    "after": " for(const key of ['floor','victories','time','deck']){\n  const stat=child(result,'stat_'+key);assert.equal(child(stat,'face').image,nativeTheme.image.rect);\n  assert.equal(child(stat,'face').colour,nativeTheme.color.panel);assert.equal(child(stat,'border').colour,nativeTheme.color.goldDim);\n }"
   },
   {
    "at": 540,
    "before": " assert.equal(child(layout,'prologuePanel'),undefined);\n assert.deepEqual(children(cover).map(node=>node.name),['veil','blocker','message','cancel']);\n assert.equal(child(cover,'veil').colour,'#000000');",
    "after": " assert.equal(child(layout,'prologuePanel'),undefined);\n assert.deepEqual(children(cover).map(node=>node.name),['veil','blocker','subtitle','message','cancel']);\n const subtitle=child(cover,'subtitle');\n assert.equal(subtitle.visible,false,'the production boss subtitle starts hidden on ordinary fades');\n assert.equal(subtitle.raycastTarget,false,'the subtitle never replaces the original input barrier');\n assert.equal(child(cover,'veil').colour,'#000000');"
   }
  ]
 },
 "tests/sts-character-browser.test.mjs": {
  "current": {
   "sha256": "9002e0dc243f5066d44ef427b3d339b9bec0dce89ef3ef0aac2b1b2ccb982b76",
   "gitBlob": "1844bf41e423038edbaff69ce6174ffaf5d6e935"
  },
  "previous": {
   "sha256": "f10724414fe7a44db6eead4007fbed882a69b6db090c10d017ee84b74f51c2a6",
   "gitBlob": "30d12b5dd4900db8a86ccb7e84cd9bee87402145"
  },
  "hunks": [
   {
    "at": 56,
    "before": "end\nlocal F=dofile('tests/lua/support/game_ui_fixture.lua');local host,root=F.fixture(nil,function()return true end)\nlocal Gate=require('abyss_page_reveal');local Run=require('abyss_run');local created=0;local new=Run.new",
    "after": "end\nlocal F=dofile('tests/lua/support/game_ui_fixture.lua');local host,root=F.fixture(nil,function()return true end,nil,nil,nil,nil,nil,nil,F.deckBrowser())\nlocal Gate=require('abyss_page_reveal');local Run=require('abyss_run');local created=0;local new=Run.new"
   },
   {
    "at": 60,
    "before": "local function settle()\n for i=1,4 do host:update(1/60);host.pageReveal:step(Gate.intent(host));host:refresh()end\nend",
    "after": "local function settle()\n for i=1,40 do host:update(1/60);host.pageReveal:step(Gate.intent(host));host:refresh()end\nend"
   },
   {
    "at": 68,
    "before": "assert(panel.visible and not host.run and created==0)\nlocal Display=require('abyss_card_display');local write=Display.writeNativeArt;local painted=0\nDisplay.writeNativeArt=function(...)\n assert(sourcePage=='deckPanel','starter card wrote before its deck presentation owner');painted=painted+1;return write(...)",
    "after": "assert(panel.visible and not host.run and created==0)\nlocal Display=require('abyss_card_display');local write=Display.writeArt;local painted=0\nDisplay.writeArt=function(...)\n assert(sourcePage=='deckPanel','starter card wrote before its deck presentation owner');painted=painted+1;return write(...)"
   },
   {
    "at": 76,
    "before": "assert(deck.browserShell and not deck.pileView and not deck.pileKind and not deck.choiceToken and not deck.battle)\nassert(deck.run.readOnlyPreview and #deck.cards==info.deckSize and deckPanel:GetChild('pileGrid').visible)\nassert(not panel.visible and not panel:GetChild('deckView'))\nassert(host.pointerBlocked(),'preparation must keep preview input covered')\nassert(not host:openStarterDeck(),'covered/reentrant opening must fail')",
    "after": "assert(deck.browserShell and not deck.pileView and not deck.pileKind and not deck.choiceToken and not deck.battle)\nassert(deck.run.readOnlyPreview and deck.paged and #deck.cards==info.deckSize,'starter browser lost its paged read-only source')\nassert(not panel.visible and not panel:GetChild('deckView'),'retired selection shell was restored')\nassert(host.pageReveal.localFrame and not host.pointerBlocked(),'preview preparation must cover only the owned card area')\nlocal pendingGrid=deckPanel:GetChild('pileGrid')\nassert(not pendingGrid.visible,'unprepared cards must remain hidden under the local cover')\nfor _,cell in ipairs(pendingGrid:GetChildren())do\n assert(not cell:GetChild('hit').raycastTarget,'preparation enabled an unready card')\nend\nassert(not host:openStarterDeck(),'covered/reentrant opening must fail')"
   },
   {
    "at": 88,
    "before": "prepared=true;settle();assert(not host.pointerBlocked() and not host.pageReveal:covered() and painted>0)\nlocal cards=deckPanel:GetChild('pileGrid');assert(cards.itemCount==info.deckSize,'starter browser omitted cards')\nfor index=0,info.deckSize-1 do\n local cell=cards:recycle(0,index+cards.indexBase);local face=cell:GetChild('face')\n assert(face:GetChild('name').text~='' and face:GetChild('cost').text~='' and face:GetChild('label').text~='','starter card lost actual name/cost/rules')\nend\ncards:flush()\nassert(deckPanel:GetChild('pileReturn').visible)",
    "after": "prepared=true;settle();assert(not host.pointerBlocked() and not host.pageReveal:covered() and painted>0)\nlocal cards=deckPanel:GetChild('pileGrid')\nlocal visible=0\nfor _,cell in ipairs(cards:GetChildren())do\n if cell.visible then\n  visible=visible+1\n  local face=cell:GetChild('face')\n  assert(face:GetChild('name').text~='' and face:GetChild('cost').text~='' and face:GetChild('label').text~='','starter card lost actual name/cost/rules')\n end\nend\nassert(cards.visible and visible==math.min(10,info.deckSize),'starter browser omitted current-page cards')\nassert(painted>0,'visible starter cards did not paint')\nassert(deckPanel:GetChild('pileReturn').visible)"
   },
   {
    "at": 110,
    "before": "-- Closing preview restores the exact caller display source, not a preview copy.\nDisplay.writeNativeArt=write\nassert(F.confirmStart(host));settle();assert(created==1 and host.run)\nassert(host:openDeck());settle();assert(not deck.previewInfo and deck.browserShell and not deck.run.readOnlyPreview)",
    "after": "-- Closing preview restores the exact caller display source, not a preview copy.\nDisplay.writeArt=write\nassert(F.confirmStart(host));settle();assert(created==1 and #host.run.deck==10)\nassert(host:openDeck());settle();assert(not deck.previewInfo and deck.browserShell and not deck.run.readOnlyPreview)"
   },
   {
    "at": 136,
    "before": "\ntest('actual OnStart readiness reveals the preview while the hidden real selection portrait is still preparing',t=>{\n const out=temporary(t);buildLuaData('data',join(out,'abyss_data.lua'));buildUI(out,undefined,{officialAssets:true});\n const preloads=readdirSync(out).filter(n=>n.endsWith('.lua')).map(n=>",
    "after": "\ntest('actual OnStart warms after title admission and pauses selection workers beneath deck preview',t=>{\n const out=temporary(t);buildLuaData('data',join(out,'abyss_data.lua'));buildUI(out,undefined,{officialAssets:true,nativePageLifecycle:true,experimentalCharacters:false});\n const preloads=readdirSync(out).filter(n=>n.endsWith('.lua')).map(n=>"
   },
   {
    "at": 146,
    "before": "P.new=function(...)portrait=create(...);return portrait end\nG.new=function(root,data,presentation,event,p)platform=p;host=make(root,data,presentation,event,p);return host end\npackage.loaded.abyss_art_features={schemaVersion=2,flags={cards=false,menuBackground=true,selectionAvatar=true,battlePortrait=false,monsters=false}}",
    "after": "P.new=function(...)portrait=create(...);return portrait end\nG.new=function(root,data,presentation,event,p)\n local panel=root:GetChild('characterPanel');local details=panel:GetChild('details')\n local retired={deckTitle=true,deckSummary=true,deckRule=true,deckOpen=true,deckView=true}\n for _,control in ipairs({panel,details})do\n  local getChild=control.GetChild\n  control.GetChild=function(self,name)\n   assert(not retired[name],'official selection accessed retired control '..name)\n   return getChild(self,name)\n  end\n end\n platform=p;host=make(root,data,presentation,event,p);return host\nend\npackage.loaded.abyss_art_features={schemaVersion=2,flags={cards=false,menuBackground=true,selectionAvatar=true,battlePortrait=false,monsters=false}}"
   },
   {
    "at": 191,
    "before": "dofile('src/lua/abyss_ui.lua');OnStart();assert(enabled and host and portrait,'real OnStart did not create the production owners')\nfor i=1,60 do OnUpdate(1/60);if not host.pageReveal:covered()then break end end",
    "after": "dofile('src/lua/abyss_ui.lua');OnStart();assert(enabled and host and portrait,'real OnStart did not create the production owners')\nlocal before=portrait:status().selection\nassert(before.owned==0,'starting the title allocated a selection portrait')\nos.clock=function()return 0 end\nfor i=1,60 do OnUpdate(1/60);if not host.pageReveal:covered()then break end end"
   },
   {
    "at": 197,
    "before": "assert(host:start() and not host.characterSelection.info,'selection starts with no character chosen')\nassert(host:selectCharacter('traveler') and host.characterSelection.info,'choose the Geo traveler before checking its portrait')\nlocal Gate=require('abyss_page_reveal');local state=portrait:status().selection\nassert(state.phase=='building' and not platform.presentationReady(Gate.intent(host)),'real selection must wait for its incomplete portrait')\nassert(not portrait:readyForPage('menu',false,'ironclad'),'negative control requires a real paused menu-scene dependency')\nassert(not host:openStarterDeck(),'public covered input must stay blocked')\n-- Arrange an asynchronous page replacement without completing its old owner.\n-- The actual shared browser and actual entry readiness remain under test.\nplatform.presentationPage('deckPanel');assert(host.deckUI:openPreview(host.characterSelection.info))\nhost.characterSelection.deckOpen=true;host:refresh();assert(Gate.intent(host).page=='deckPanel')\nfor i=1,60 do",
    "after": "assert(host:start() and not host.characterSelection.info,'selection starts with no character chosen')\nfor _=1,4 do\n if not host.pageReveal:covered()then break end\n OnUpdate(1/60)\nend\nassert(not host.pageReveal:covered(),'selection fallback did not publish the roster')\nassert(host:selectCharacter('traveler') and host.characterSelection.info,'choose the Geo traveler before checking its portrait')\nlocal Gate=require('abyss_page_reveal');local state=portrait:status().selection\nassert(state.phase=='building' and platform.presentationReady(Gate.intent(host)),'decorative selection blocked real page readiness')\nlocal cover=host.root:GetChild('pageReveal')\nlocal veil=cover:GetChild('veil')\nassert(not cover.visible or veil.imageColor.a==0,'selection put up an opaque page cover')\nassert(not host.pageReveal:covered() or host.pageReveal:allowsCharacterEdit(),'transparent selection preparation blocked role edits')\nfor _=1,4 do\n if not host.pageReveal:covered()then break end\n OnUpdate(1/60)\nend\nstate=portrait:status().selection\nassert(not host.pageReveal:covered() and not cover.visible and state.phase=='building',\n 'selection fallback did not admit the page before the portrait was ready')\nlocal details=host.root:GetChild('characterPanel'):GetChild('details')\nlocal info=host.characterSelection.info\nlocal published=details\nlocal motion=details:GetChild('infoMotion')\nif motion then\n published=nil\n for _,box in ipairs(motion:GetChildren())do\n  local name=box:GetChild('name')\n  if box.visible and name and name.text==info.name then published=box;break end\n end\nend\nassert(published and details.visible and published:GetChild('name').text==info.name and info.deckSize==10,'click lost the real loadout')\nfor _,name in ipairs({'stats','gold','v25Story','relic','relicText'})do\n assert(published:GetChild(name).text~='',name)\nend\nassert(not portrait:readyForPage('menu',false,'ironclad'),'negative control requires a real paused menu-scene dependency')\nlocal progress=portrait:status().selection\nassert(host:openStarterDeck(),'decorative selection work blocked the public browser entry')\nassert(Gate.intent(host).page=='deckPanel')\nfor i=1,60 do"
   },
   {
    "at": 240,
    "before": "state=portrait:status().selection\nassert(state.phase=='building' or state.phase=='revealing','negative control accidentally completed the old portrait')\nassert(host.deckUI.visible and not host.deckUI.pending and not host.deckUI.calibrating)",
    "after": "state=portrait:status().selection\nassert(state.phase=='building' and state.nextIndex==progress.nextIndex,'covered selection kept constructing portrait controls')\nassert(host.deckUI.visible and not host.deckUI.pending and not host.deckUI.calibrating)"
   }
  ]
 },
 "tests/helpers/copy-integration-source-closure.mjs": {
  "current": {
   "sha256": "f919805dd64136193e50a8d6cf8b2d03dd5c2f8a4d842c73c7f7920c4439847a",
   "gitBlob": "ae9fa12c82d2a01d0e2f907f77b00d43871ed20d"
  },
  "previous": {
   "sha256": "8c234674a484ac9aba9e10eae21bdb0ce43372636a20b13e84d28c6a2f266bd4",
   "gitBlob": "46291e76636a7543686e62c0d893e02fc099c4a6"
  },
  "hunks": [
   {
    "at": 0,
    "before": "// Copies only immutable test helper dependencies; production owners remain explicit fixtures.\nimport assert from 'node:assert/strict';",
    "after": "import {beforeMasterBackflowSource} from './master-backflow-source.mjs';\nimport {exactSourceMatches} from './source-fingerprint.mjs';\n// Copies only immutable test helper dependencies; production owners remain explicit fixtures.\nimport assert from 'node:assert/strict';"
   },
   {
    "at": 377,
    "before": " 'tests/helpers/reward-current-source.json.gz':'a68d10abe6e6f3bd33a69f85326d34dce1250b34b6892543cb5c1314c01f3b9f',\n});\nconst inside=(root,path)=>{const r=relative(root,path);return r!==''&&!isAbsolute(r)&&r!=='..'&&!r.startsWith('../')&&!r.startsWith('..\\\\');};\nexport function copyIntegrationSourceClosure(directory,{sourceRoot=process.cwd()}={}){\n const destination=realpathSync.native(directory);\n assert.notEqual(destination,realpathSync.native(sourceRoot),'isolated helper copy destination');\n for(const [path,sha]of Object.entries(entranceFiles)){\n  assert((path.startsWith('tests/helpers/')||path.startsWith('tests/fixtures/'))&&!path.split('/').includes('..'),'fixed helper path');\n  const source=join(sourceRoot,path),raw=readFileSync(source),content=integrationClosureBytes(path,raw);\n  if(path==='tests/helpers/reward-current-source.mjs'&&!raw.equals(content))\n   assert(raw.equals(Buffer.from(content.toString('utf8').replaceAll('\\n','\\r\\n'))),'fresh helper copy identity: '+path);",
    "after": " 'tests/helpers/reward-current-source.json.gz':'a68d10abe6e6f3bd33a69f85326d34dce1250b34b6892543cb5c1314c01f3b9f',\n});\n// The live copier targets the approved #1022 helper closure. Other replay\n// readers continue to use their original Master backflow predecessor.\nconst reviewedCopySources=Object.freeze({\n \"tests/helpers/character-preparation-source.mjs\": {\n  \"current\": {\n   \"sha256\": \"59e4952da8df25d3c6808a03c05475f1799012f2838880be4f7d76c2d68f68b2\",\n   \"gitBlob\": \"59cb86a27add71e38a679cefc82a1c2f8b03b5d2\"\n  },\n  \"previous\": {\n   \"sha256\": \"b556363648dd13827dacb603038423caf4a1c2693e618747df58fc29da7be2fd\",\n   \"gitBlob\": \"b9262d101ea11eed7836cf1091bc44f94eb94ce3\"\n  },\n  \"edits\": [\n   {\n    \"at\": 0,\n    \"remove\": 3,\n    \"previous\": []\n   },\n   {\n    \"at\": 24,\n    \"remove\": 1,\n    \"previous\": []\n   },\n   {\n    \"at\": 45,\n    \"remove\": 1,\n    \"previous\": [\n     \"    const source = read(path);\"\n    ]\n   },\n   {\n    \"at\": 149,\n    \"remove\": 2,\n    \"previous\": []\n   },\n   {\n    \"at\": 189,\n    \"remove\": 13,\n    \"previous\": [\n     \"  if (pc13RewardCoverSourcePaths.includes(path)) {\"\n    ]\n   }\n  ]\n },\n \"tests/helpers/current-replay-fix-sources.mjs\": {\n  \"current\": {\n   \"sha256\": \"b09df63dd432eaa4796047bd4ba8f64a3d224963eeab15e1bc90f7732c8afae2\",\n   \"gitBlob\": \"bb8df89c3ca48e98c48c31ae961d53fd76231fcc\"\n  },\n  \"previous\": {\n   \"sha256\": \"cceed97f15f0f91ab37ea27d3bf6f5659d213c54dcf11225eaa0fed7adc8ccdf\",\n   \"gitBlob\": \"ac19a597d6be7427dd05816dc85dd580d6454c3a\"\n  },\n  \"edits\": [\n   {\n    \"at\": 3,\n    \"remove\": 1,\n    \"previous\": []\n   },\n   {\n    \"at\": 2499,\n    \"remove\": 216,\n    \"previous\": []\n   },\n   {\n    \"at\": 2716,\n    \"remove\": 1,\n    \"previous\": []\n   },\n   {\n    \"at\": 2726,\n    \"remove\": 1,\n    \"previous\": []\n   }\n  ]\n },\n \"tests/helpers/ui-entrance-source.mjs\": {\n  \"current\": {\n   \"sha256\": \"db68a4fbfb77de2972cea9a750e6df941fb492e74e95e666ee24ca1aca0c3834\",\n   \"gitBlob\": \"66a8db632e59f0e84f19a8f9d97e7eedbd2ef880\"\n  },\n  \"previous\": {\n   \"sha256\": \"c64976a04e877f65315ad8553bd8f6380b6e50a5ab5fce60e3b37bbbb98825c1\",\n   \"gitBlob\": \"2da2af0441e00d0893184b7f401a9848b491b9de\"\n  },\n  \"edits\": [\n   {\n    \"at\": 8,\n    \"remove\": 1,\n    \"previous\": [\n     \"import {beforeCurrentReplayFixes,beforeOfficialCharacterBackflow} from './current-replay-fix-sources.mjs';\"\n    ]\n   },\n   {\n    \"at\": 37,\n    \"remove\": 3,\n    \"previous\": [\n     \" if(!matchesApprovedUiEntranceOwner(path,source))return false;\"\n    ]\n   }\n  ]\n }\n});\nfunction beforeReviewedCopySource(path,raw){\n if(!Object.hasOwn(reviewedCopySources,path))return beforeMasterBackflowSource(path,raw);\n const {current,previous,edits}=reviewedCopySources[path];\n const source=raw.toString('utf8');\n const text=integrationClosureBytes(path,raw).toString('utf8');\n assert(source===text||source===text.replaceAll('\\n','\\r\\n'),'uniform current copy owner: '+path);\n assert(exactSourceMatches(text,current),'exact current copy owner: '+path);\n const lines=text.split('\\n');\n for(const {at,remove,previous:replacement} of [...edits].reverse())lines.splice(at,remove,...replacement);\n const prior=lines.join('\\n');\n assert(exactSourceMatches(prior,previous),'exact reviewed copy predecessor: '+path);\n return Buffer.from(prior);\n}\nconst inside=(root,path)=>{const r=relative(root,path);return r!==''&&!isAbsolute(r)&&r!=='..'&&!r.startsWith('../')&&!r.startsWith('..\\\\');};\nexport function copyIntegrationSourceClosure(directory,{sourceRoot=process.cwd()}={}){\n const destination=realpathSync.native(directory);\n const sourceDirectory=realpathSync.native(sourceRoot);\n assert.notEqual(destination,sourceDirectory,'isolated helper copy destination');\n const liveSource=sourceDirectory===realpathSync.native(new URL('../../',import.meta.url));\n for(const [path,sha]of Object.entries(entranceFiles)){\n  assert((path.startsWith('tests/helpers/')||path.startsWith('tests/fixtures/'))&&!path.split('/').includes('..'),'fixed helper path');\n  const source=join(sourceDirectory,path),raw=readFileSync(source);\n  let prior=raw;\n  if(liveSource){\n   try{prior=beforeReviewedCopySource(path,raw);}\n   catch(error){assert.fail('fresh helper copy identity: '+path+': '+error.message);}\n  }\n  const content=integrationClosureBytes(path,prior);\n  if(path==='tests/helpers/reward-current-source.mjs'&&!raw.equals(content))\n   assert(raw.equals(Buffer.from(content.toString('utf8').replaceAll('\\n','\\r\\n'))),'fresh helper copy identity: '+path);"
   }
  ]
 },
 "tests/helpers/replay-reviewed-selection.mjs": {
  "current": {
   "sha256": "eb72b7b7ecd1043e1ccbbe5429e4537f408adc90420e1ce255c6b64391eccd38",
   "gitBlob": "a3dad348a963fdda2f90c4cc7c301f43fe5aed43"
  },
  "previous": {
   "sha256": "5f81f16e89b98fd6d8e3dfeb5c5df09be9f2c2131a077dcdb25b8cf84cf70ea7",
   "gitBlob": "50a103a6bcaa5b17e98ae5a1621ca4bcbfab1c29"
  },
  "hunks": [
   {
    "at": 11,
    "before": "import {reviewedSelectionRead} from './reviewed-selection-current-source.mjs';\nimport {uiEntranceOwns} from './ui-entrance-source.mjs';\nimport {checkedSelectionEntranceRead} from './ui-selection-current-source.mjs';\nimport {stsStylePriorRuntime} from './sts-style-prior-runtime.mjs';\nimport {beforeDeckPagesSuiteSource,readRetiredController,retiredControllerPath} from './input-retirement-source.mjs';\nimport {readReviewedOfficialAssetInput,reviewedOfficialAssetInputPaths} from './reviewed-official-asset-inputs.mjs';\nconst hash=s=>createHash('sha256').update(s).digest('hex'),norm=s=>s.replaceAll('\\r\\n','\\n');",
    "after": "import {reviewedSelectionRead} from './reviewed-selection-current-source.mjs';\nimport {uiEntranceOwns} from './ui-entrance-source.mjs';\nimport {checkedSelectionEntranceRead,selectionNodeNoticePath} from './ui-selection-current-source.mjs';\nimport {stsStylePriorRuntime} from './sts-style-prior-runtime.mjs';\nimport {beforeDeckPagesSuiteSource,readRetiredController,retiredControllerPath} from './input-retirement-source.mjs';\nimport {beforeMasterBackflowSource,readBeforeMasterBackflowSource} from './master-backflow-source.mjs';\nimport {beforeOfficialCharacterBackflow} from './current-replay-fix-sources.mjs';\nimport {readReviewedOfficialAssetInput,reviewedOfficialAssetInputPaths} from './reviewed-official-asset-inputs.mjs';\nconst hash=s=>createHash('sha256').update(s).digest('hex'),norm=s=>s.replaceAll('\\r\\n','\\n');"
   },
   {
    "at": 25,
    "before": " [archivedOfficialAssets]:6,\n});\nexport function replayReviewedSelection(script='tests/sts-character-reference.test.mjs'){\n assert(Object.hasOwn(reviewedContracts,script),'exact reviewed selection contract');\n const expected=reviewedContracts[script],root=process.cwd();\n assertIntegratedCurrent();\n const readOwner=reviewedSelectionRead();\n // Entrance authentication consumes live owners. The archived build still uses Selection's reviewed inputs.\n const readEntrance=chapterEvidenceCurrentRead(checkedSelectionEntranceRead(readFileSync));\n const readProductionOwner=(path,encoding='utf8')=>uiEntranceOwns(path)?readEntrance(path,encoding):readOwner(path,encoding);\n const retiredInput=readRetiredController(readOwner);\n assert(retiredInput.restored,'only the exact pointer successor can restore the retired input owner');\n for(const [path,row]of Object.entries(sourceEpoch.proof.current)){\n  const source=path===retiredControllerPath?beforeCharacterPreparationSource(path,retiredInput.source,readProductionOwner)\n   :beforeCurrentProductionSource(path,readProductionOwner(path),readProductionOwner);\n  assert.equal(hash(norm(source)),row.sha256,'fresh current production owner: '+path);\n }",
    "after": " [archivedOfficialAssets]:6,\n});\nexport function readSelectionProductionOwners(read,readOwner){\n const readEntrance=chapterEvidenceCurrentRead(checkedSelectionEntranceRead((path,encoding)=>{\n  const raw=read(path,encoding);\n  const source=Buffer.isBuffer(raw)?raw.toString('utf8'):raw;\n  if(path===selectionNodeNoticePath||beforeOfficialCharacterBackflow(path,source)!==source)return raw;\n  return beforeMasterBackflowSource(path,raw);\n }));\n return (path,encoding='utf8')=>uiEntranceOwns(path)?readEntrance(path,encoding):readOwner(path,encoding);\n}\n// Selection's archived intent owner predates #875. Its original reviewed\n// reader must reauthenticate those exact bytes at the current-only seam.\nexport function beforeCurrentSelectionProductionSource(path,readCurrent,readReviewed){\n const read=path==='src/lua/abyss_battle_intent_view.lua'?readReviewed:readCurrent;\n return beforeCurrentProductionSource(path,read(path),read);\n}\nconst readLiveOwner=path=>readFileSync(path,'utf8');\nexport function readReviewedSelectionSource(path,read=readLiveOwner){\n assert(Object.hasOwn(sourceEpoch.proof.current,path),'registered historical selection owner: '+path);\n const row=sourceEpoch.proof.current[path];\n if(row===null)return null;\n const readOwner=reviewedSelectionRead(read);\n const retired=path===retiredControllerPath;\n const live=retired?readRetiredController(readOwner).source:read(path);\n assert(typeof live==='string'&&!live.includes('\\r\\r\\n')&&\n  (read===readLiveOwner||(!retired&&norm(live)===norm(readLiveOwner(path)))),\n  'fresh current production owner: '+path);\n const readCurrent=readSelectionProductionOwners(read,readOwner);\n const source=retired?beforeCharacterPreparationSource(path,live,readCurrent)\n  :beforeCurrentSelectionProductionSource(path,readCurrent,readOwner);\n assert.equal(hash(norm(source)),row.sha256,'fresh current production owner: '+path);\n return source;\n}\nexport function replayReviewedSelection(script='tests/sts-character-reference.test.mjs'){\n assert(Object.hasOwn(reviewedContracts,script),'exact reviewed selection contract');\n const expected=reviewedContracts[script],root=process.cwd();\n assertIntegratedCurrent();\n const readCurrent=readBeforeMasterBackflowSource(readFileSync);\n const readOwner=reviewedSelectionRead();\n const readProductionOwner=readSelectionProductionOwners(readFileSync,readOwner);\n const retiredInput=readRetiredController(readOwner);\n assert(retiredInput.restored,'only the exact pointer successor can restore the retired input owner');\n for(const [path,row]of Object.entries(sourceEpoch.proof.current)){\n  const source=path===retiredControllerPath?beforeCharacterPreparationSource(path,retiredInput.source,readProductionOwner)\n   :beforeCurrentSelectionProductionSource(path,readProductionOwner,readOwner);\n  assert.equal(hash(norm(source)),row.sha256,'fresh current production owner: '+path);\n }"
   },
   {
    "at": 80,
    "before": "  for(const path of paths){\n   assert(!isAbsolute(path)&&!path.split('/').includes('..'));const target=join(directory,path);mkdirSync(dirname(target),{recursive:true});\n   const input=useArchivedOfficialInputs?readReviewedOfficialAssetInput(path):undefined;\n   const predecessor=input??exactReviewedBuildInput(path,readProductionOwner,{beforeReviewedInput:beforeReviewedBuildInput});\n   if(predecessor===undefined)copyFileSync(path,target);",
    "after": "  for(const path of paths){\n   assert(!isAbsolute(path)&&!path.split('/').includes('..'));const target=join(directory,path);mkdirSync(dirname(target),{recursive:true});\n   const input=useArchivedOfficialInputs?readReviewedOfficialAssetInput(path,readCurrent):undefined;\n   const predecessor=input??exactReviewedBuildInput(path,readProductionOwner,{beforeReviewedInput:beforeReviewedBuildInput});\n   if(predecessor===undefined)copyFileSync(path,target);"
   },
   {
    "at": 122,
    "before": "  if(useArchivedOfficialInputs){\n   for(const path of reviewedOfficialAssetInputPaths){\n    const expected=readReviewedOfficialAssetInput(path);\n    assert.equal(norm(readFileSync(join(directory,path),'utf8')),norm(expected),'exact staged official-assets input: '+path);\n   }",
    "after": "  if(useArchivedOfficialInputs){\n   for(const path of reviewedOfficialAssetInputPaths){\n    const expected=readReviewedOfficialAssetInput(path,readCurrent);\n    assert.equal(norm(readFileSync(join(directory,path),'utf8')),norm(expected),'exact staged official-assets input: '+path);\n   }"
   }
  ]
 },
 "tests/noncombat-v25-layout.test.mjs": {
  "current": {
   "sha256": "4d92b9befdcee2a833928285535e9d0e2b168827f48178faec211effec901c48",
   "gitBlob": "7306cd717e2a34b87ee1925369ea5977136f3fde"
  },
  "previous": {
   "sha256": "5d59eddc142a51cce13130c3ab631869ff9ba45650eff93ea7c3178da930a633",
   "gitBlob": "b677949615f579e7b4275afd0e58cf0ae6f995c3"
  },
  "hunks": [
   {
    "at": 94,
    "before": " assert.equal(rows.length,1600);assert.equal(rows.filter(r=>r[15]===1).length,224);\n});",
    "after": " assert.equal(rows.length,1600);assert.equal(rows.filter(r=>r[15]===1).length,224);\n assert.deepEqual(background.revealWithNext.flatMap((together,index)=>together?[index+1]:[]),[17]);\n});"
   },
   {
    "at": 130,
    "before": "\ntest('official host uses direct inventory actions, read-only relic details and explicit run discard',async t=>{",
    "after": "\nfunction restorePriorMenuSurfaces(panel){\n if(panel.name==='menuPanel'){\n  for(const action of ['start','continueRun','titleQuit']){\n   const label=child(child(panel,action),'label');\n   assert.equal(label.text.outlineOpacity,1,action+' retains the shipped title outline');\n   delete label.text.outlineOpacity;\n  }\n  const backdrop=child(panel,'backdrop'),quit=child(panel,'titleQuit');\n  assert.equal(backdrop.image,100001,'retain the released title material');\n  backdrop.image=107271;\n  assert.deepEqual(quit.position,[-464,-170],'retain the released compact title spacing');\n  quit.position=[-464,-282];\n }\n const surfaces=panel.name==='menuPanel'?['floor','victories','time','deck'].map(name=>child(child(panel,'result'),'stat_'+name)):\n  panel.name==='exitPanel'?[panel]:[];\n for(const host of surfaces){\n  const face=child(host,'face');\n  assert.deepEqual([face.image,face.colour],[100001,'#1C1E27'],host.name+' retains the released flat surface');\n  Object.assign(face,{image:107311,colour:'#FFFFFF'});\n }\n}\n\ntest('official host uses direct inventory actions, read-only relic details and explicit run discard',async t=>{"
   },
   {
    "at": 178,
    "before": "  const prior=restorePriorMenuNavigation(panel,focusPaths);\n  if(name==='menuPanel')for(const action of ['start','continueRun','titleQuit']){\n   // #963 applied the shipped v2.1.1 outline to these three title labels.\n   const label=child(child(prior,action),'label');\n   assert.equal(label.text.outlineOpacity,1,action+' retains the shipped title outline');\n   delete label.text.outlineOpacity;\n  }\n  assert.equal(createHash('sha256').update(JSON.stringify(prior)).digest('hex'),sha,\n   'preserve the complete reviewed menu outside the pinned navigation and label edits: '+name);\n }",
    "after": "  const prior=restorePriorMenuNavigation(panel,focusPaths);\n  restorePriorMenuSurfaces(prior);\n  assert.equal(createHash('sha256').update(JSON.stringify(prior)).digest('hex'),sha,\n   'preserve the reviewed menu outside the explicit navigation and production surface edits: '+name);\n }"
   },
   {
    "at": 210,
    "before": " const selection=child(child(tree,'stage'),'characterPanel');\n const details=child(selection,'details');\n const motion=child(details,'infoMotion'),infoLayers=motion?parts(motion):[details];\n assert(infoLayers.length>0);\n for(const info of infoLayers)for(const name of ['name','stats','gold','v25Story','relic','relicText']){\n  assert.equal(child(info,name)?.kind,'text',name);\n }\n const retired=new Set(['deckTitle','deckSummary','deckRule','deckOpen','deckView']);",
    "after": " const selection=child(child(tree,'stage'),'characterPanel');\n const infoLayers=parts(child(child(selection,'details'),'infoMotion'));\n assert.equal(infoLayers.length,1);\n const retired=new Set(['deckTitle','deckSummary','deckRule','deckOpen','deckView']);"
   },
   {
    "at": 215,
    "before": " assert.deepEqual(found.map(node=>node.name),[],'obsolete starter deck controls in the official selection tree');\n for(const info of infoLayers){\n  const story=child(info,'v25Story'),{content,fontSize,minFontSize}=story.text;\n  const problems=capacityProblems([{path:'characterPanel/details/v25Story',kind:story.kind,visible:true,\n   text:content,size:story.size,font:fontSize,minimum:minFontSize}],nativeTheme.layout.nativeText.lineHeight);\n  assert.deepEqual(problems,[],'reserve both native lines for the mobile synopsis');\n  assert(story.size[1]>=nativeTheme.layout.nativeText.lineHeight*2,'reserve two lines for longer synopses');\n  assert.equal(content,'使用岩元素护盾与结晶应对敌人。');\n  assert.equal(minFontSize,fontSize,'retain the authored text size');\n  const stats=child(info,'stats'),relic=child(info,'relic');\n  assert(story.position[1]+story.size[1]/2<stats.position[1]-stats.size[1]/2,'story clears health');\n  assert(story.position[1]-story.size[1]/2>relic.position[1]+relic.size[1]/2,'story clears the relic title');\n }\n});",
    "after": " assert.deepEqual(found.map(node=>node.name),[],'obsolete starter deck controls in the official selection tree');\n const [details]=infoLayers;\n for(const name of ['name','stats','gold','v25Story','relic','relicText']){\n  assert.equal(child(details,name)?.kind,'text',name);\n }\n const story=child(details,'v25Story'),{content,fontSize,minFontSize}=story.text;\n const problems=capacityProblems([{path:'characterPanel/details/v25Story',kind:story.kind,visible:true,\n  text:content,size:story.size,font:fontSize,minimum:minFontSize}],nativeTheme.layout.nativeText.lineHeight);\n assert.deepEqual(problems,[],'reserve both native lines for the mobile synopsis');\n assert(story.size[1]>=nativeTheme.layout.nativeText.lineHeight*2,'reserve two lines for longer synopses');\n assert.equal(content,'使用岩元素护盾与结晶应对敌人。');\n assert.equal(minFontSize,fontSize,'retain the authored text size');\n const stats=child(details,'stats'),relic=child(details,'relic');\n assert(story.position[1]+story.size[1]/2<stats.position[1]-stats.size[1]/2,'story clears health');\n assert(story.position[1]-story.size[1]/2>relic.position[1]+relic.size[1]/2,'story clears the relic title');\n});"
   },
   {
    "at": 287,
    "before": "assert(fallback.visible and landscape.visible and not transition.visible,'loading fallback is effectively unshaded')\nfor _=1,600 do portraits:tick();if portraits:readyForPage('menu',true,'ironclad','characterPanel')then break end end\nassert(portraits:readyForPage('menu',true,'ironclad','characterPanel'))\nmotion:show({id='ironclad'},true)",
    "after": "assert(fallback.visible and landscape.visible and not transition.visible,'loading fallback is effectively unshaded')\nassert(portraits:readyForPage('menu',true,'ironclad','characterPanel'))\nfor _=1,600 do portraits:tick();if portraits:status().selection.phase=='ready'then break end end\nmotion:show({id='ironclad'},true)"
   },
   {
    "at": 327,
    "before": " const {beforeChapterBattleScene}=await import('./helpers/chapter-battle-scene-source.mjs');\n const {chapterEvidenceCurrentRead}=await import('./helpers/fork-preflight-source.mjs');\n const {checkedSelectionEntranceRead}=await import('./helpers/ui-selection-current-source.mjs');\n const readCurrent=chapterEvidenceCurrentRead(checkedSelectionEntranceRead(read));\n return path=>beforeBattlePeriphery(path,beforeChapterBattleScene(path,readCurrent(path,'utf8')));",
    "after": " const {beforeChapterBattleScene}=await import('./helpers/chapter-battle-scene-source.mjs');\n const {beforeOfficialCharacterBackflow}=await import('./helpers/current-replay-fix-sources.mjs');\n const {chapterEvidenceCurrentRead}=await import('./helpers/fork-preflight-source.mjs');\n const {beforeKnownMasterBackflowSource}=await import('./helpers/master-backflow-source.mjs');\n const {checkedSelectionEntranceRead}=await import('./helpers/ui-selection-current-source.mjs');\n const readLive=checkedSelectionEntranceRead(read);\n const readCurrent=chapterEvidenceCurrentRead(path=>{\n  const raw=readLive(path,'utf8');\n  if(beforeOfficialCharacterBackflow(path,raw)!==raw)return raw;\n  return beforeKnownMasterBackflowSource(path,raw);\n });\n return path=>beforeBattlePeriphery(path,beforeChapterBattleScene(path,readCurrent(path,'utf8')));"
   }
  ]
 }
});
const receipt=path=>Object.hasOwn(receipts,path)?receipts[path]:undefined;
const combinedReceipt=path=>Object.hasOwn(combinedReceipts,path)?combinedReceipts[path]:undefined;
export const selectionReceiptOwns=path=>Object.hasOwn(receipts,path);

function uniformSelectionSource(source){
 if(typeof source!=='string')return false;
 const lf=source.replaceAll('\r\n','\n');
 return !lf.includes('\r')&&(source===lf||source===lf.replaceAll('\n','\r\n'));
}

function decodedSelectionSource(raw){
 if(!Buffer.isBuffer(raw))return raw;
 const source=raw.toString('utf8');
 return Buffer.from(source).equals(raw)?source:undefined;
}

const copierPath='tests/helpers/copy-integration-source-closure.mjs';
const nodeNoticeCopier=Object.freeze({
 current:{"sha256":"8c234674a484ac9aba9e10eae21bdb0ce43372636a20b13e84d28c6a2f266bd4","gitBlob":"46291e76636a7543686e62c0d893e02fc099c4a6"},
 previous:receipts[copierPath].current,
 hunks:[
  {
   "at": 374,
   "before": " 'tests/helpers/reward-current-source.mjs':'3ef0c1268abbd8758655d4898b3d62edba8c877eab76fff2ad7e5406e4613dfd',",
   "after": " 'tests/helpers/reward-current-source.mjs':'3b67c5b2cce6c6ab8c76610da98d3ceb3c96e6ccfb8f0c3b58754ac7ea9ff641',"
  },
  {
   "at": 383,
   "before": "  const source=join(sourceRoot,path),content=integrationClosureBytes(path,readFileSync(source));assert.equal(hash(content),sha,'fresh helper copy identity: '+path);",
   "after": "  const source=join(sourceRoot,path),raw=readFileSync(source),content=integrationClosureBytes(path,raw);\n  if(path==='tests/helpers/reward-current-source.mjs'&&!raw.equals(content))\n   assert(raw.equals(Buffer.from(content.toString('utf8').replaceAll('\\n','\\r\\n'))),'fresh helper copy identity: '+path);\n  assert.equal(hash(content),sha,'fresh helper copy identity: '+path);"
  }
 ]
});
const deckArchitectureCopier=Object.freeze({
 current:{"sha256":"0da2ec6a92449ca27a616aeca4893bc37bf6bc935b2d143a94a89ac47837a744","gitBlob":"7962c1cba4561f905668ba5906b83fa735b5d44b"},
 previous:combinedReceipt(copierPath).current,
 hunks:[
 {
  "at": 355,
  "before": " 'tests/helpers/release-integration-source.mjs':'74093921a53a94ba842afac199e579a622b60fea5abf2519d416ede77bbfa1a7',\n 'tests/fixtures/release-lazy-monster-art-source.json.gz':'211c3588a53b1f97c98d9f9b905349d82b244a2e81a940d4ebe48022381ca92e',\n 'tests/helpers/m7-core-final-source-inverse.mjs':'c9d98969785466649e0e915df0d912f81b774d8b937b4fb63e74eed731635133',\n 'tests/helpers/release-ui-restore-source.mjs':'2ec5855476f1b4c8cf762ca1a7ee366028322841b07996a518af96fdd87259b9',\n 'tests/helpers/current-replay-fix-sources.mjs':'cceed97f15f0f91ab37ea27d3bf6f5659d213c54dcf11225eaa0fed7adc8ccdf',\n 'tests/helpers/character-preparation-source.mjs':'b556363648dd13827dacb603038423caf4a1c2693e618747df58fc29da7be2fd',\n 'tests/helpers/develop-release-backflow-source.mjs':'2834679eef440cf54e64cfb2c144c2fc6dbb5dc7ed048c3767435c250827337f',\n 'tests/helpers/native-fixture-replay-source.mjs':'7dbd2ded60c5b155b958a5e6e2ff44537b2b62c15e113642aaf8f6194771832d',\n 'tests/helpers/native-flow-fixture-source.mjs':'8ad7157fd4f3973ffba4f17f9eba440731ddf952e859fee53970d6c3879968e3',",
  "after": " 'tests/helpers/release-integration-source.mjs':'74093921a53a94ba842afac199e579a622b60fea5abf2519d416ede77bbfa1a7',\n 'tests/fixtures/release-lazy-monster-art-source.json.gz':'211c3588a53b1f97c98d9f9b905349d82b244a2e81a940d4ebe48022381ca92e',\n 'tests/helpers/m7-core-final-source-inverse.mjs':'f3c74ae48bc3d0f030caaf30c2a6140e096146316dab115a75ebfba87b1dcfe8',\n 'tests/helpers/release-ui-restore-source.mjs':'2ec5855476f1b4c8cf762ca1a7ee366028322841b07996a518af96fdd87259b9',\n 'tests/helpers/current-replay-fix-sources.mjs':'cceed97f15f0f91ab37ea27d3bf6f5659d213c54dcf11225eaa0fed7adc8ccdf',\n 'tests/helpers/character-preparation-source.mjs':'b556363648dd13827dacb603038423caf4a1c2693e618747df58fc29da7be2fd',\n 'tests/helpers/develop-release-backflow-source.mjs':'d9b04593b5ed2af93096091a53d0043361d9ae3019cdbc64c766100f5d694e39',\n 'tests/helpers/develop-release-vocabulary-source.mjs':'a70cfaf283d1c758fffa9a2035bec86e122afa871e4104c11e80ae7660c82727',\n 'tests/fixtures/develop-release-vocabulary-source.json.gz':'2b3d606fc142f2c8c5cfaaff386c70f6e1f741f24fbc1879b78399b7c477e914',\n 'tests/fixtures/map-room-battle-actions-source.json.gz':'45918da82006880941ab23f10ccc49b7fe11fc2c7978b4f1508f923216e142ec',\n 'tests/fixtures/develop-battle-input-source.json.gz':'ee0eeaf23242e8307a2b4f06a27319d89477c5d19d7507eddc54477dc878611e',\n 'tests/fixtures/develop-linked-backflow-source.json.gz':'7f803c657102e0f9a804ca68117af34f1067d32eabbc3b5fc0c99752b590d522',\n 'tests/fixtures/develop-architecture-linked-source.json.gz':'4e8500c1232bc5bcd5c19d08dbed21cea262be94a30f3a2e8195eeb04ebde859',\n 'tests/helpers/master-backflow-source.mjs':'ed257bdd35954a315e853478eb9d92584793a47af207e7e7da5fde96bd920219',\n 'tests/fixtures/master-backflow-predecessors.json.gz':'b16492b78553e53e675537d95d3f9ef24557d792f657ba41f0f280e43fab325f',\n 'tests/helpers/native-fixture-replay-source.mjs':'7dbd2ded60c5b155b958a5e6e2ff44537b2b62c15e113642aaf8f6194771832d',\n 'tests/helpers/native-flow-fixture-source.mjs':'8ad7157fd4f3973ffba4f17f9eba440731ddf952e859fee53970d6c3879968e3',"
 },
 {
  "at": 381,
  "before": " 'tests/fixtures/event-readability-source.json.gz':'1ccc3098014ebf726a776928f5d0b41c29b6a2a1cff21f096ee42a53b0da9cd5',\n 'tests/helpers/reward-query-boundary-source-inverse.mjs':'07d2abf826061305510cebfd60a4c13b2d07e86352d63a5db1868a40c9cc082c',\n 'tests/helpers/relic-query-source-inverse.mjs':'41b4cddcba283db2cbcdc4d9c19fdd8bb14321378bd1151fc76a74b7ec9b1120',\n 'tests/helpers/reward-current-source.mjs':'3b67c5b2cce6c6ab8c76610da98d3ceb3c96e6ccfb8f0c3b58754ac7ea9ff641',\n 'tests/helpers/reward-current-source.json.gz':'a68d10abe6e6f3bd33a69f85326d34dce1250b34b6892543cb5c1314c01f3b9f',",
  "after": " 'tests/fixtures/event-readability-source.json.gz':'1ccc3098014ebf726a776928f5d0b41c29b6a2a1cff21f096ee42a53b0da9cd5',\n 'tests/helpers/reward-query-boundary-source-inverse.mjs':'07d2abf826061305510cebfd60a4c13b2d07e86352d63a5db1868a40c9cc082c',\n 'tests/helpers/relic-query-source-inverse.mjs':'ba7525e0fd153e59f59538114ecace70c6475ab65f578dea2f4fc29fb9e71a20',\n 'tests/helpers/reward-current-source.mjs':'3b67c5b2cce6c6ab8c76610da98d3ceb3c96e6ccfb8f0c3b58754ac7ea9ff641',\n 'tests/helpers/reward-current-source.json.gz':'a68d10abe6e6f3bd33a69f85326d34dce1250b34b6892543cb5c1314c01f3b9f',"
 },
 {
  "at": 463,
  "before": " \"tests/helpers/ui-entrance-source.mjs\": {\n  \"current\": {\n   \"sha256\": \"db68a4fbfb77de2972cea9a750e6df941fb492e74e95e666ee24ca1aca0c3834\",\n   \"gitBlob\": \"66a8db632e59f0e84f19a8f9d97e7eedbd2ef880\"\n  },\n  \"previous\": {",
  "after": " \"tests/helpers/ui-entrance-source.mjs\": {\n  \"current\": {\n   \"sha256\": \"50851099aed8dca2d5e6da5a715df63ab939f51729b56edab0ca81bec6dee5c0\",\n   \"gitBlob\": \"343f6486ebb70ab190d8c28026c6049ff4d48d25\"\n  },\n  \"previous\": {"
 },
 {
  "at": 472,
  "before": "  \"edits\": [\n   {\n    \"at\": 8,\n    \"remove\": 1,\n    \"previous\": [\n     \"import {beforeCurrentReplayFixes,beforeOfficialCharacterBackflow} from './current-replay-fix-sources.mjs';\"\n    ]\n   },\n   {\n    \"at\": 37,\n    \"remove\": 3,\n    \"previous\": [\n     \" if(!matchesApprovedUiEntranceOwner(path,source))return false;\"\n    ]\n   }",
  "after": "  \"edits\": [\n   {\n    \"at\": 6,\n    \"remove\": 8,\n    \"previous\": [\n     \"import {exactSourceMatches as matches,sourceConfigLayoutMatches} from './source-fingerprint.mjs';\",\n     \"import {restoreExactFixtureHunks} from './exact-fixture-hunks.mjs';\",\n     \"import {beforeCurrentReplayFixes,beforeOfficialCharacterBackflow} from './current-replay-fix-sources.mjs';\",\n     \"import {beforeApprovedUiEntrance,matchesApprovedUiEntranceOwner} from './ui-entrance-approved-sources.mjs';\",\n     \"\",\n     \"const archive=readFileSync(new URL('../fixtures/ui-entrance-source.json.gz',import.meta.url));\"\n    ]\n   },\n   {\n    \"at\": 36,\n    \"remove\": 20,\n    \"previous\": [\n     \"const currentInput=(path,source)=>replaySources.includes(path)\",\n     \" ?beforeCurrentReplayFixes(path,source):beforeApprovedUiEntrance(path,source);\",\n     \"function currentMatches(path,source,expected){\",\n     \" if(!matchesApprovedUiEntranceOwner(path,source))return false;\",\n     \" const normalized=currentInput(path,source);\",\n     \" if(requiredCurrentOwners.includes(path)&&normalized===source)return false;\",\n     \" return matches(normalized,expected);\",\n     \"}\",\n     \"const predecessors=new Map();\",\n     \"\"\n    ]\n   },\n   {\n    \"at\": 70,\n    \"remove\": 7,\n    \"previous\": [\n     \"\",\n     \"export function beforeUiEntrance(path,source){\",\n     \" return project(path,source,binding(path));\",\n     \"}\",\n     \"\"\n    ]\n   }\n  ]\n },\n \"tests/helpers/input-retirement-sts-binding.mjs\": {\n  \"current\": {\n   \"sha256\": \"47a212bae11910c09e62b59cf291552e54954d5e710251eb6b263c3289461025\",\n   \"gitBlob\": \"9e65f5899089cbe95c937eecd8aa0a72e0f0c7c1\"\n  },\n  \"previous\": {\n   \"sha256\": \"f6395a7c5e299738db3caf30f29d7d29724e7ac091af012a585c76b785697219\",\n   \"gitBlob\": \"e3d66011ebc645d886944e71543701c3d313258c\"\n  },\n  \"edits\": [\n   {\n    \"at\": 101,\n    \"remove\": 126,\n    \"previous\": [\n     \"];\",\n     \"\",\n     \"export function beforeStsRuntimeFixtureSuccessor(path,source){\",\n     \" const proof=runtimeFixtureSuccessors.find(row=>row.path===path);\",\n     \" const original=proof?restoreExactFixtureHunks(proof,path,source):source;\"\n    ]\n   }\n  ]\n },\n \"tests/helpers/native-flow-fixture-source.mjs\": {\n  \"current\": {\n   \"sha256\": \"1ea4f6524ec42e6b9f907988f6e716b9560bff6a33a1a35117a050836f1723f1\",\n   \"gitBlob\": \"1a3c57078fa15b56609aa8fb4e1a73848e1d472b\"\n  },\n  \"previous\": {\n   \"sha256\": \"8ad7157fd4f3973ffba4f17f9eba440731ddf952e859fee53970d6c3879968e3\",\n   \"gitBlob\": \"ec07991f5d6b17bca5d5e40eed75f42b0110b7ae\"\n  },\n  \"edits\": [\n   {\n    \"at\": 30,\n    \"remove\": 8,\n    \"previous\": [\n     \"}\",\n     \"\",\n     \"// Approved release backflows #912, #940, #942 and #951 supersede these witnesses.\",\n     \"const releaseFixtures=Object.freeze({\",\n     \" 'tests/lua/support/native_monster_only_entry.lua':{\",\n     \"  sha256:'0c192425a730c27bab65e5ebc18fc340c9b2414e8558485922041e01fbaf00c1',gitBlob:'29e0bb8b789624f2128780c7711d122bb0687368',\",\n     \" },\",\n     \" 'tests/official-assets-runtime.test.mjs':{\"\n    ]\n   }"
 },
 {
  "at": 576,
  "before": "}\nconst inside=(root,path)=>{const r=relative(root,path);return r!==''&&!isAbsolute(r)&&r!=='..'&&!r.startsWith('../')&&!r.startsWith('..\\\\');};\nexport function copyIntegrationSourceClosure(directory,{sourceRoot=process.cwd()}={}){\n const destination=realpathSync.native(directory);\n const sourceDirectory=realpathSync.native(sourceRoot);\n assert.notEqual(destination,sourceDirectory,'isolated helper copy destination');\n const liveSource=sourceDirectory===realpathSync.native(new URL('../../',import.meta.url));\n for(const [path,sha]of Object.entries(entranceFiles)){\n  assert((path.startsWith('tests/helpers/')||path.startsWith('tests/fixtures/'))&&!path.split('/').includes('..'),'fixed helper path');\n  const source=join(sourceDirectory,path),raw=readFileSync(source);\n  let prior=raw;\n  if(liveSource){\n   try{prior=beforeReviewedCopySource(path,raw);}\n   catch(error){assert.fail('fresh helper copy identity: '+path+': '+error.message);}\n  }\n  const content=integrationClosureBytes(path,prior);\n  if(path==='tests/helpers/reward-current-source.mjs'&&!raw.equals(content))\n   assert(raw.equals(Buffer.from(content.toString('utf8').replaceAll('\\n','\\r\\n'))),'fresh helper copy identity: '+path);\n  assert.equal(hash(content),sha,'fresh helper copy identity: '+path);",
  "after": "}\nconst inside=(root,path)=>{const r=relative(root,path);return r!==''&&!isAbsolute(r)&&r!=='..'&&!r.startsWith('../')&&!r.startsWith('..\\\\');};\nconst currentEntranceHelpers=new Set(['tests/helpers/current-replay-fix-sources.mjs','tests/helpers/ui-entrance-source.mjs']);\nexport function copyIntegrationSourceClosure(directory,{sourceRoot=process.cwd(),currentProduction=false}={}){\n const destination=realpathSync.native(directory);\n const sourceDirectory=realpathSync.native(sourceRoot);\n assert.notEqual(destination,sourceDirectory,'isolated helper copy destination');\n const liveSource=sourceDirectory===realpathSync.native(new URL('../../',import.meta.url));\n for(const [path,previousSha]of Object.entries(entranceFiles)){\n  const exactCurrent=currentProduction&&currentEntranceHelpers.has(path);\n  const sha=exactCurrent?reviewedCopySources[path].current.sha256:previousSha;\n  assert((path.startsWith('tests/helpers/')||path.startsWith('tests/fixtures/'))&&!path.split('/').includes('..'),'fixed helper path');\n  const source=join(sourceDirectory,path),raw=readFileSync(source);\n  let prior=raw;\n  if(exactCurrent){\n   const current=integrationClosureBytes(path,raw);\n   const source=current.toString('utf8');\n   assert(raw.equals(current)||raw.equals(Buffer.from(source.replaceAll('\\n','\\r\\n'))),'uniform current copy owner: '+path);\n   assert(exactSourceMatches(source,reviewedCopySources[path].current),'exact current copy owner: '+path);\n  }else if(liveSource){\n   try{prior=beforeReviewedCopySource(path,raw);}\n   catch(error){assert.fail('fresh helper copy identity: '+path+': '+error.message);}\n  }\n  const content=integrationClosureBytes(path,prior);\n  if((path==='tests/helpers/reward-current-source.mjs'||path==='tests/helpers/develop-release-backflow-source.mjs'||\n      path==='tests/helpers/develop-release-vocabulary-source.mjs'||path==='tests/helpers/master-backflow-source.mjs'||\n      path==='tests/helpers/m7-core-final-source-inverse.mjs'||path==='tests/helpers/relic-query-source-inverse.mjs')&&!raw.equals(content))\n   assert(raw.equals(Buffer.from(content.toString('utf8').replaceAll('\\n','\\r\\n'))),'fresh helper copy identity: '+path);\n  assert.equal(hash(content),sha,'fresh helper copy identity: '+path);"
 }
],
});
const returnedCardReadingCopier=Object.freeze({
 current:{"sha256":"90b212e531f76421c9c65f879676c71c3050c74236bfc218b76cc875a1d26d58","gitBlob":"b31315368e89669113b60bbec20aeded6f814da7"},
 previous:deckArchitectureCopier.current,
 hunks:[
  {
    "at": 353,
    "before": " 'tests/helpers/rebased-release-source.mjs':'b1e42ded7f05f580fb25ab0417ccd8db45832f5e9e50db83a38d6aaa2767dc20',\n 'tests/helpers/chapter-battle-scene-source.mjs':'1270c293d79c04ac4a5b15483dd4cc8f9c4279362e2f5c551f6e98c20c9ad293',\n 'tests/helpers/release-integration-source.mjs':'74093921a53a94ba842afac199e579a622b60fea5abf2519d416ede77bbfa1a7',",
    "after": " 'tests/helpers/rebased-release-source.mjs':'b1e42ded7f05f580fb25ab0417ccd8db45832f5e9e50db83a38d6aaa2767dc20',\n 'tests/helpers/chapter-battle-scene-source.mjs':'7888616f2fbc3f59b3545eb5441069380b453b91c80a7a3d4513e59193fa5696',\n 'tests/helpers/release-integration-source.mjs':'74093921a53a94ba842afac199e579a622b60fea5abf2519d416ede77bbfa1a7',"
  },
  {
    "at": 367,
    "before": " 'tests/fixtures/develop-architecture-linked-source.json.gz':'4e8500c1232bc5bcd5c19d08dbed21cea262be94a30f3a2e8195eeb04ebde859',\n 'tests/helpers/master-backflow-source.mjs':'ed257bdd35954a315e853478eb9d92584793a47af207e7e7da5fde96bd920219',\n 'tests/fixtures/master-backflow-predecessors.json.gz':'b16492b78553e53e675537d95d3f9ef24557d792f657ba41f0f280e43fab325f',",
    "after": " 'tests/fixtures/develop-architecture-linked-source.json.gz':'4e8500c1232bc5bcd5c19d08dbed21cea262be94a30f3a2e8195eeb04ebde859',\n 'tests/helpers/master-backflow-source.mjs':'374935c2c76b47b65319202a3f3d60eb9884149f4224cd9c1dc432a81f523a7c',\n 'tests/fixtures/master-backflow-predecessors.json.gz':'b16492b78553e53e675537d95d3f9ef24557d792f657ba41f0f280e43fab325f',"
  }
],
});
const returnedReadingReplayPath='tests/helpers/replay-reviewed-selection.mjs';
const returnedReadingReplay=Object.freeze({
 current:{"sha256":"5cd7ad3d5a728418bb89cb8dbf0d4fea7fa199fb005b399b71772e63e0ec2851","gitBlob":"2128fceb1bff074e04d02f911264194e2415037f"},
 previous:combinedReceipt(returnedReadingReplayPath).current,
 hunks:[
  {
    "at": 15,
    "before": "import {beforeDeckPagesSuiteSource,readRetiredController,retiredControllerPath} from './input-retirement-source.mjs';\nimport {beforeMasterBackflowSource,readBeforeMasterBackflowSource} from './master-backflow-source.mjs';\nimport {beforeOfficialCharacterBackflow} from './current-replay-fix-sources.mjs';",
    "after": "import {beforeDeckPagesSuiteSource,readRetiredController,retiredControllerPath} from './input-retirement-source.mjs';\nimport {beforeMasterBackflowSource,readBeforeMasterBackflowSource,productionReadingBackflowOwns} from './master-backflow-source.mjs';\nimport {beforeOfficialCharacterBackflow} from './current-replay-fix-sources.mjs';"
  },
  {
    "at": 26,
    "before": "});\nexport function readSelectionProductionOwners(read,readOwner){",
    "after": "});\nconst readingOwner=path=>productionReadingBackflowOwns(path)||path==='src/lua/abyss_battle_card_layout.lua'||path==='src/lua/abyss_viewport.lua';\nexport function readSelectionProductionOwners(read,readOwner){"
  },
  {
    "at": 31,
    "before": "  const source=Buffer.isBuffer(raw)?raw.toString('utf8'):raw;\n  if(path===selectionNodeNoticePath||beforeOfficialCharacterBackflow(path,source)!==source)return raw;\n  return beforeMasterBackflowSource(path,raw);\n }));\n return (path,encoding='utf8')=>uiEntranceOwns(path)?readEntrance(path,encoding):readOwner(path,encoding);\n}",
    "after": "  const source=Buffer.isBuffer(raw)?raw.toString('utf8'):raw;\n  if(productionReadingBackflowOwns(path)||path===selectionNodeNoticePath||beforeOfficialCharacterBackflow(path,source)!==source)return raw;\n  return beforeMasterBackflowSource(path,raw);\n }));\n return (path,encoding='utf8')=>readingOwner(path)||uiEntranceOwns(path)?readEntrance(path,encoding):readOwner(path,encoding);\n}"
  },
  {
    "at": 39,
    "before": "export function beforeCurrentSelectionProductionSource(path,readCurrent,readReviewed){\n const read=path==='src/lua/abyss_battle_intent_view.lua'?readReviewed:readCurrent;\n return beforeCurrentProductionSource(path,read(path),read);",
    "after": "export function beforeCurrentSelectionProductionSource(path,readCurrent,readReviewed){\n const read=readingOwner(path)||path==='src/lua/abyss_battle_intent_view.lua'?readReviewed:readCurrent;\n return beforeCurrentProductionSource(path,read(path),read);"
  }
],
});
const selectionLayoutPath='tests/noncombat-v25-layout.test.mjs';
const selectionLayoutCurrent=Object.freeze({
 current:{"sha256":"84f7d6670686ae06dd6d97290e010882b9c6433104eae365e501b738d39d5cf4","gitBlob":"4a1c82e57689e2bc8b9a7bf25f63bc23f5758b1a"},
 previous:combinedReceipt(selectionLayoutPath).current,
 hunks:[
  {
    "at": 330,
    "before": " const {beforeKnownMasterBackflowSource}=await import('./helpers/master-backflow-source.mjs');",
    "after": " const {beforeKnownMasterBackflowSource,productionReadingBackflowOwns}=await import('./helpers/master-backflow-source.mjs');"
  },
  {
    "at": 335,
    "before": "  if(beforeOfficialCharacterBackflow(path,raw)!==raw)return raw;",
    "after": "  if(productionReadingBackflowOwns(path)||beforeOfficialCharacterBackflow(path,raw)!==raw)return raw;"
  }
],
});
const currentBackflowCopier=Object.freeze({
 current:{"sha256":"78c9f2e0b8c0d2cf146cd70940f492a69f86b4ea3381def77d547ebfb723a77d","gitBlob":"646d9415ce05e073f65c7ac77bface68516e680e"},
 previous:returnedCardReadingCopier.current,
 hunks:[
  {
    "at": 389,
    "before": "const reviewedCopySources=Object.freeze({",
    "after": "const reviewedCopySources=Object.freeze({\n \"tests/helpers/develop-release-backflow-source.mjs\": {\n  \"current\": {\n   \"sha256\": \"7989de2a06f877bf2dc2d0dcb991eef3a0cceda234adcd8724258b2ead1c26c2\",\n   \"gitBlob\": \"a0180aa40bdb51b02ebcb7445305265b5e421638\"\n  },\n  \"previous\": {\n   \"sha256\": \"d9b04593b5ed2af93096091a53d0043361d9ae3019cdbc64c766100f5d694e39\",\n   \"gitBlob\": \"66f1e5c43ff4247a562ad9091f543f598925e01e\"\n  },\n  \"edits\": [\n   {\n    \"at\": 0,\n    \"remove\": 1,\n    \"previous\": [\n     \"import {beforeChapterBattleScene,chapterBattleSceneReader} from './chapter-battle-scene-source.mjs';\"\n    ]\n   },\n   {\n    \"at\": 14,\n    \"remove\": 1,\n    \"previous\": [\n     \"import {beforeKnownMasterBackflowSource} from './master-backflow-source.mjs';\"\n    ]\n   },\n   {\n    \"at\": 16,\n    \"remove\": 1,\n    \"previous\": []\n   },\n   {\n    \"at\": 251,\n    \"remove\": 1,\n    \"previous\": [\n     \" const masterPrior=beforeKnownMasterBackflowSource(path,source);\"\n    ]\n   },\n   {\n    \"at\": 272,\n    \"remove\": 1,\n    \"previous\": []\n   },\n   {\n    \"at\": 276,\n    \"remove\": 2,\n    \"previous\": [\n     \" if(!matches(source,after)&&!matches(source,linkedSuccessors[path]??after))return source;\"\n    ]\n   },\n   {\n    \"at\": 294,\n    \"remove\": 2,\n    \"previous\": [\n     \" 'src/lua/abyss_battle_info_content.lua':{sha256:'0d96375df2bcdd3e323413c09e27e802e53b450d3053dadbc4eef3d8da715d57',\",\n     \"  gitBlob:'989f7129614b8c8637bf3e78167e98b33db3e9c4'},\"\n    ]\n   },\n   {\n    \"at\": 316,\n    \"remove\": 1,\n    \"previous\": []\n   },\n   {\n    \"at\": 415,\n    \"remove\": 2,\n    \"previous\": [\n     \"  const source=beforeArchitectureOwner(path,read(path));\"\n    ]\n   },\n   {\n    \"at\": 483,\n    \"remove\": 4,\n    \"previous\": [\n     \"   return authenticateDevelopBackflowWithReaders(path,current,readOwner,readOwner,options);\"\n    ]\n   },\n   {\n    \"at\": 538,\n    \"remove\": 1,\n    \"previous\": []\n   }\n  ]\n },\n \"tests/helpers/master-backflow-source.mjs\": {\n  \"current\": {\n   \"sha256\": \"c03fb1b5bf312b8834aeef53204030ea8544622761278b3ae626cdd1b8d842d5\",\n   \"gitBlob\": \"28124a00ba0ebe7d58b6b62e41c9061fddf007f5\"\n  },\n  \"previous\": {\n   \"sha256\": \"374935c2c76b47b65319202a3f3d60eb9884149f4224cd9c1dc432a81f523a7c\",\n   \"gitBlob\": \"99816ca5321f3664d7df4c834684a88703f0c533\"\n  },\n  \"edits\": [\n   {\n    \"at\": 30,\n    \"remove\": 1,\n    \"previous\": []\n   },\n   {\n    \"at\": 33,\n    \"remove\": 1,\n    \"previous\": [\n     \"  ['src/lua/abyss_battle_info_content.lua', ['0d96375df2bcdd3e323413c09e27e802e53b450d3053dadbc4eef3d8da715d57', '989f7129614b8c8637bf3e78167e98b33db3e9c4']],\"\n    ]\n   },\n   {\n    \"at\": 49,\n    \"remove\": 1,\n    \"previous\": [\n     \"  ['tests/helpers/release-map-deck-source.mjs', ['e825e98356085765d46166f6ee5994181ade9548569d0c28e6ee62f195fef5d7', '67ab3e7f739ccbe9e63f6e54235d1378b72f5983']],\"\n    ]\n   },\n   {\n    \"at\": 57,\n    \"remove\": 1,\n    \"previous\": []\n   }\n  ]\n },"
  },
  {
    "at": 720,
    "before": "      path==='tests/helpers/m7-core-final-source-inverse.mjs'||path==='tests/helpers/relic-query-source-inverse.mjs')&&!raw.equals(content))",
    "after": "      path==='tests/helpers/m7-core-final-source-inverse.mjs'||path==='tests/helpers/relic-query-source-inverse.mjs')&&\n     !Object.hasOwn(reviewedCopySources,path)&&!raw.equals(content))"
  }
],
});
const releaseSelectionOverlay=Object.freeze({
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
});
const releaseEntranceCopier=Object.freeze({
 "current": {
  "sha256": "edf64f732310e44e83ae8ee17d0d9f494073fc0257fdc1b44f1138827ae20c4c",
  "gitBlob": "804e700e80ada64cee4a92c5210fd890de42d4a8"
 },
 "previous": {
  "sha256": "78c9f2e0b8c0d2cf146cd70940f492a69f86b4ea3381def77d547ebfb723a77d",
  "gitBlob": "646d9415ce05e073f65c7ac77bface68516e680e"
 },
 "hunks": [
  {
   "at": 0,
   "before": "import {beforeMasterBackflowSource} from './master-backflow-source.mjs';\nimport {exactSourceMatches} from './source-fingerprint.mjs';\n// Copies only immutable test helper dependencies; production owners remain explicit fixtures.\nimport assert from 'node:assert/strict';",
   "after": "import {beforeMasterBackflowSource} from './master-backflow-source.mjs';\nimport {exactSourceMatches} from './source-fingerprint.mjs';\nimport {restoreExactFixtureHunks} from './exact-fixture-hunks.mjs';\n// Copies only immutable test helper dependencies; production owners remain explicit fixtures.\nimport assert from 'node:assert/strict';"
  },
  {
   "at": 681,
   "before": " }\n});\nfunction beforeReviewedCopySource(path,raw){\n if(!Object.hasOwn(reviewedCopySources,path))return beforeMasterBackflowSource(path,raw);",
   "after": " }\n});\n// Detached historical closures keep the last reviewed copier dependencies.\n// The live release readers add the separately authenticated entrance sources.\nconst releaseReplayReaders=Object.freeze({\n \"tests/helpers/master-backflow-source.mjs\": {\n  \"current\": {\n   \"sha256\": \"308c6ef6ac8987b9becc4ead9f3a1efaa2c3c20ea8a697bdf26f6233fa71b8ac\",\n   \"gitBlob\": \"c0558789e0465672ef86866b3ac1f4a4708f6412\"\n  },\n  \"previous\": {\n   \"sha256\": \"c03fb1b5bf312b8834aeef53204030ea8544622761278b3ae626cdd1b8d842d5\",\n   \"gitBlob\": \"28124a00ba0ebe7d58b6b62e41c9061fddf007f5\"\n  },\n  \"hunks\": [\n   {\n    \"at\": 4,\n    \"before\": \"import { exactSourceMatches } from './source-fingerprint.mjs';\\nimport { restoreExactFixtureHunks } from './exact-fixture-hunks.mjs';\\n\\nconst archive = readFileSync(new URL('../fixtures/master-backflow-predecessors.json.gz', import.meta.url));\",\n    \"after\": \"import { exactSourceMatches } from './source-fingerprint.mjs';\\nimport { restoreExactFixtureHunks } from './exact-fixture-hunks.mjs';\\nimport { beforeReleaseEntranceOwner } from './release-entrance-owner-source.mjs';\\nimport { beforeReleaseClosureFixture } from './release-closure-fixture-source.mjs';\\n\\nconst archive = readFileSync(new URL('../fixtures/master-backflow-predecessors.json.gz', import.meta.url));\"\n   },\n   {\n    \"at\": 148,\n    \"before\": \"\\nexport function beforeMasterBackflowSource(path, source) {\\n  if (!Object.hasOwn(files, path)) return source;\\n  const { before, after } = files[path];\",\n    \"after\": \"\\nexport function beforeMasterBackflowSource(path, source) {\\n  source = beforeReleaseClosureFixture(path, beforeReleaseEntranceOwner(path, source));\\n  if (!Object.hasOwn(files, path)) return source;\\n  const { before, after } = files[path];\"\n   },\n   {\n    \"at\": 166,\n    \"before\": \"\\nexport function beforeKnownMasterBackflowSource(path, source) {\\n  const scope = beforeProductionReadingBackflow(path, source);\\n  if (scope !== source) return scope;\",\n    \"after\": \"\\nexport function beforeKnownMasterBackflowSource(path, source) {\\n  source = beforeReleaseClosureFixture(path, beforeReleaseEntranceOwner(path, source));\\n  const scope = beforeProductionReadingBackflow(path, source);\\n  if (scope !== source) return scope;\"\n   }\n  ]\n },\n \"tests/helpers/ui-entrance-source.mjs\": {\n  \"current\": {\n   \"sha256\": \"c8a0b30c0c7013702719c7e13dedcc3d7753118d9f02d473e94f831f877377b7\",\n   \"gitBlob\": \"3c3c094fbe33e3b783d1602256271e0d2c77dbc1\"\n  },\n  \"previous\": {\n   \"sha256\": \"50851099aed8dca2d5e6da5a715df63ab939f51729b56edab0ca81bec6dee5c0\",\n   \"gitBlob\": \"343f6486ebb70ab190d8c28026c6049ff4d48d25\"\n  },\n  \"hunks\": [\n   {\n    \"at\": 10,\n    \"before\": \"import {beforeChapterBattleScene} from './chapter-battle-scene-source.mjs';\\nimport {beforeKnownMasterBackflowSource} from './master-backflow-source.mjs';\\n\\nconst archive=readFileSync(new URL('../fixtures/ui-entrance-source.json.gz',import.meta.url));\",\n    \"after\": \"import {beforeChapterBattleScene} from './chapter-battle-scene-source.mjs';\\nimport {beforeKnownMasterBackflowSource} from './master-backflow-source.mjs';\\nimport {beforeReleaseEntranceOwner,readReleaseEntrancePredecessor} from './release-entrance-owner-source.mjs';\\n\\nconst archive=readFileSync(new URL('../fixtures/ui-entrance-source.json.gz',import.meta.url));\"\n   },\n   {\n    \"at\": 46,\n    \"before\": \"}\\nfunction currentEntranceSource(path,source,expected){\\n if(matchesEntrance(path,source,expected))return source;\\n const masterPrior=beforeKnownMasterBackflowSource(path,source);\",\n    \"after\": \"}\\nfunction currentEntranceSource(path,source,expected){\\n source=beforeReleaseEntranceOwner(path,source);\\n if(matchesEntrance(path,source,expected))return source;\\n const masterPrior=beforeKnownMasterBackflowSource(path,source);\"\n   },\n   {\n    \"at\": 86,\n    \"before\": \"  let source;\\n  try{source=read(owner);}catch(error){assert.fail('combined linked owner missing: '+owner+': '+error.message);}\\n  assert(currentMatches(owner,source,files[owner].after),'combined linked owner identity: '+owner+' during entrance validation');\\n }\\n}\\n\\nexport function entranceReader(read,authenticated=false){\\n return owner=>{\\n  const source=read(owner);\\n  const row=binding(owner);\",\n    \"after\": \"  let source;\\n  try{source=read(owner);}catch(error){assert.fail('combined linked owner missing: '+owner+': '+error.message);}\\n  source=readReleaseEntrancePredecessor(owner,source,read);\\n  assert(currentMatches(owner,source,files[owner].after),'combined linked owner identity: '+owner+' during entrance validation');\\n }\\n}\\n\\nconst underlyingReaders=new WeakMap();\\nexport const underlyingEntranceReader=read=>underlyingReaders.get(read)??read;\\nexport function entranceReader(read,authenticated=false){\\n const reader=owner=>{\\n  const source=read(owner);\\n  const row=binding(owner);\"\n   },\n   {\n    \"at\": 106,\n    \"before\": \"  return prior;\\n };\\n}\\n\",\n    \"after\": \"  return prior;\\n };\\n underlyingReaders.set(reader,underlyingEntranceReader(read));\\n return reader;\\n}\\n\"\n   }\n  ]\n },\n \"tests/helpers/input-retirement-source.mjs\": {\n  \"current\": {\n   \"sha256\": \"e52b313959cd8834b1769546603f0d1212563d4b1c9d8592f970abf6f3afc4ba\",\n   \"gitBlob\": \"7aeedadf169523e27bc697d9db7aa44821847733\"\n  },\n  \"previous\": {\n   \"sha256\": \"45d451b3bd820d17f282d71d38ef974ad97a82d99e37679c22000af66d493296\",\n   \"gitBlob\": \"dc889017f62f554d063d3eae71103b82f810583b\"\n  },\n  \"hunks\": [\n   {\n    \"at\": 8,\n    \"before\": \"import {beforeNativeHostInputRetirement} from './native-host-replay-source.mjs';\\nimport {beforeNativeFlowFixture} from './native-flow-fixture-source.mjs';\\nimport {beforeCurrentReplayFixes} from './current-replay-fix-sources.mjs';\\nimport {exactSourceMatches as matches,sourceConfigLayoutMatches} from './source-fingerprint.mjs';\",\n    \"after\": \"import {beforeNativeHostInputRetirement} from './native-host-replay-source.mjs';\\nimport {beforeNativeFlowFixture} from './native-flow-fixture-source.mjs';\\nimport {beforeKnownMasterBackflowSource} from './master-backflow-source.mjs';\\nimport {beforeCurrentReplayFixes} from './current-replay-fix-sources.mjs';\\nimport {exactSourceMatches as matches,sourceConfigLayoutMatches} from './source-fingerprint.mjs';\"\n   },\n   {\n    \"at\": 171,\n    \"before\": \"\\nexport function beforeDevelopUiBackflows(path,source){\\n return beforeDeckBrowserBackflow(path,beforePotionBackflow(path,source));\\n}\",\n    \"after\": \"\\nexport function beforeDevelopUiBackflows(path,source){\\n if(path==='src/lua/abyss_choice_ui.lua')source=beforeKnownMasterBackflowSource(path,source);\\n return beforeDeckBrowserBackflow(path,beforePotionBackflow(path,source));\\n}\"\n   }\n  ]\n },\n \"tests/helpers/develop-release-backflow-source.mjs\": {\n  \"current\": {\n   \"sha256\": \"53304733269a0314ca3e90832bb17b8dee23cc43e081ddbe5c4266da15d50609\",\n   \"gitBlob\": \"fa82903bc4af3eaa14fee5945484733083f11101\"\n  },\n  \"previous\": {\n   \"sha256\": \"7989de2a06f877bf2dc2d0dcb991eef3a0cceda234adcd8724258b2ead1c26c2\",\n   \"gitBlob\": \"a0180aa40bdb51b02ebcb7445305265b5e421638\"\n  },\n  \"hunks\": [\n   {\n    \"at\": 0,\n    \"before\": \"import {beforeCardReadingScope,beforeChapterBattleScene,beforeResponsiveHand,chapterBattleSceneReader} from './chapter-battle-scene-source.mjs';\\nimport { beforeUiEntrance, entranceInventory, entrancePredecessor, entranceReader, uiEntranceOwns, assertCurrentUiEntrance } from './ui-entrance-source.mjs';\\nimport {battlePeripheryPredecessor,beforeBattlePeriphery} from './battle-periphery-source.mjs';\\n// Exact Develop predecessors for historical replay. Live builds read current sources.\",\n    \"after\": \"import {beforeCardReadingScope,beforeChapterBattleScene,beforeResponsiveHand,chapterBattleSceneReader} from './chapter-battle-scene-source.mjs';\\nimport { beforeUiEntrance, entranceInventory, entrancePredecessor, entranceReader, underlyingEntranceReader, uiEntranceOwns, assertCurrentUiEntrance } from './ui-entrance-source.mjs';\\nimport {battlePeripheryPredecessor,beforeBattlePeriphery} from './battle-periphery-source.mjs';\\n// Exact Develop predecessors for historical replay. Live builds read current sources.\"\n   },\n   {\n    \"at\": 15,\n    \"before\": \"import {beforeReleaseVocabulary,isReleaseVocabularyPredecessor,releaseVocabularyOwns} from './develop-release-vocabulary-source.mjs';\\nimport {beforeRunHudDeckLabel} from './run-hud-successors.mjs';\\n\\nconst hash=(bytes,algorithm='sha256')=>createHash(algorithm).update(bytes).digest('hex');\",\n    \"after\": \"import {beforeReleaseVocabulary,isReleaseVocabularyPredecessor,releaseVocabularyOwns} from './develop-release-vocabulary-source.mjs';\\nimport {beforeRunHudDeckLabel} from './run-hud-successors.mjs';\\nimport {beforeReleaseEntranceOwner,readReleaseEntrancePredecessor} from './release-entrance-owner-source.mjs';\\n\\nconst hash=(bytes,algorithm='sha256')=>createHash(algorithm).update(bytes).digest('hex');\"\n   },\n   {\n    \"at\": 414,\n    \"before\": \" let epoch;\\n const readEntrancePrior=entranceReader(path=>{\\n  const raw=read(path);\\n  const source=beforeArchitectureOwner(path,path===deckLayoutPath?beforeRunHudDeckLabel(raw):raw);\\n  const vocabulary=releaseVocabularyOwns(path);\",\n    \"after\": \" let epoch;\\n const readEntrancePrior=entranceReader(path=>{\\n  const raw=readReleaseEntrancePredecessor(path,read(path),underlyingEntranceReader(read));\\n  const source=beforeArchitectureOwner(path,path===deckLayoutPath?beforeRunHudDeckLabel(raw):raw);\\n  const vocabulary=releaseVocabularyOwns(path);\"\n   },\n   {\n    \"at\": 535,\n    \"before\": \"}\\nexport function beforeDevelopBackflow(path,source,options){\\n source=beforeLibraryReadPrompt(path,source);\\n source=beforeBattleInputHistory(path,beforeChapterEntranceOwner(path,beforeArchitectureOwner(path,source)));\",\n    \"after\": \"}\\nexport function beforeDevelopBackflow(path,source,options){\\n source=beforeReleaseEntranceOwner(path,source);\\n if(path==='src/lua/abyss_potion_discard_ui.lua')source=beforeKnownMasterBackflowSource(path,source);\\n source=beforeLibraryReadPrompt(path,source);\\n source=beforeBattleInputHistory(path,beforeChapterEntranceOwner(path,beforeArchitectureOwner(path,source)));\"\n   }\n  ]\n },\n \"tests/helpers/native-flow-fixture-source.mjs\": {\n  \"current\": {\n   \"sha256\": \"e525a238de6e83745a6deb6333238c81c7ec922fcb47b3253bb7527134c4e825\",\n   \"gitBlob\": \"45e63718e736173ef82ab3a3db3789734fcf60f0\"\n  },\n  \"previous\": {\n   \"sha256\": \"1ea4f6524ec42e6b9f907988f6e716b9560bff6a33a1a35117a050836f1723f1\",\n   \"gitBlob\": \"1a3c57078fa15b56609aa8fb4e1a73848e1d472b\"\n  },\n  \"hunks\": [\n   {\n    \"at\": 4,\n    \"before\": \"import {exactSourceMatches} from './source-fingerprint.mjs';\\nimport {beforeUiEntranceWitness} from './ui-entrance-source.mjs';\\n\\nconst archive=readFileSync(new URL('./native-flow-fixture-source.json.gz',import.meta.url));\",\n    \"after\": \"import {exactSourceMatches} from './source-fingerprint.mjs';\\nimport {beforeUiEntranceWitness} from './ui-entrance-source.mjs';\\nimport {beforeReleaseClosureFixture} from './release-closure-fixture-source.mjs';\\n\\nconst archive=readFileSync(new URL('./native-flow-fixture-source.json.gz',import.meta.url));\"\n   },\n   {\n    \"at\": 49,\n    \"before\": \"export function beforeNativeFlowFixture(path,source,{requireCurrent=false}={}){\\n if(!Object.hasOwn(files,path))return source;\\n source=beforeUiEntranceWitness(path,source);\\n const {before,after}=files[path];\\n const current=exactSourceMatches(source,after)||Object.hasOwn(releaseFixtures,path)&&exactSourceMatches(source,releaseFixtures[path]);\",\n    \"after\": \"export function beforeNativeFlowFixture(path,source,{requireCurrent=false}={}){\\n if(!Object.hasOwn(files,path))return source;\\n source=beforeUiEntranceWitness(path,beforeReleaseClosureFixture(path,source));\\n const {before,after}=files[path];\\n const current=exactSourceMatches(source,after)||Object.hasOwn(releaseFixtures,path)&&exactSourceMatches(source,releaseFixtures[path]);\"\n   },\n   {\n    \"at\": 59,\n    \"before\": \"export function assertNativeFlowFixturesCurrent(read){\\n for(const [path,{after}] of Object.entries(files)){\\n  const source=read(path,'utf8');\\n  assert(exactSourceMatches(source,releaseFixtures[path]??after),'fresh complete native flow fixture: '+path);\\n }\",\n    \"after\": \"export function assertNativeFlowFixturesCurrent(read){\\n for(const [path,{after}] of Object.entries(files)){\\n  const source=beforeReleaseClosureFixture(path,read(path,'utf8'));\\n  assert(exactSourceMatches(source,releaseFixtures[path]??after),'fresh complete native flow fixture: '+path);\\n }\"\n   }\n  ]\n },\n \"tests/helpers/input-retirement-sts-binding.mjs\": {\n  \"current\": {\n   \"sha256\": \"07c32745001b9cfc3cdaabfb61dae9e91fe399b4d7d4f3ac1bb033f251356103\",\n   \"gitBlob\": \"39de96157ea657ae964d5dc73f857152bc6ef8b6\"\n  },\n  \"previous\": {\n   \"sha256\": \"47a212bae11910c09e62b59cf291552e54954d5e710251eb6b263c3289461025\",\n   \"gitBlob\": \"9e65f5899089cbe95c937eecd8aa0a72e0f0c7c1\"\n  },\n  \"hunks\": [\n   {\n    \"at\": 8,\n    \"before\": \"import {beforeNativeFlowFixture} from './native-flow-fixture-source.mjs';\\nimport {beforeCurrentOfficialRuntimeFixture} from './sts-fade-ci-source.mjs';\\n\\nconst archive=readFileSync(new URL('./input-retirement-merged-sts-source.json.gz',import.meta.url));\",\n    \"after\": \"import {beforeNativeFlowFixture} from './native-flow-fixture-source.mjs';\\nimport {beforeCurrentOfficialRuntimeFixture} from './sts-fade-ci-source.mjs';\\nimport {beforeReleaseClosureFixture} from './release-closure-fixture-source.mjs';\\n\\nconst archive=readFileSync(new URL('./input-retirement-merged-sts-source.json.gz',import.meta.url));\"\n   },\n   {\n    \"at\": 223,\n    \"before\": \"\\nexport function beforeStsRuntimeFixtureSuccessor(path,source){\\n if(path===enemyStatusFixture)return beforeEnemyStatusFixture(path,source);\\n const proof=runtimeFixtureSuccessors.find(row=>row.path===path);\",\n    \"after\": \"\\nexport function beforeStsRuntimeFixtureSuccessor(path,source){\\n source=beforeReleaseClosureFixture(path,source);\\n if(path===enemyStatusFixture)return beforeEnemyStatusFixture(path,source);\\n const proof=runtimeFixtureSuccessors.find(row=>row.path===path);\"\n   }\n  ]\n },\n \"tests/helpers/native-fixture-replay-source.mjs\": {\n  \"current\": {\n   \"sha256\": \"4e48534c724b53f5b83d2709bc40308a94c3b52f885df26294ce690f581845e4\",\n   \"gitBlob\": \"4d34f00777392e492c5a1ea4047adc79cfb81f0e\"\n  },\n  \"previous\": {\n   \"sha256\": \"7dbd2ded60c5b155b958a5e6e2ff44537b2b62c15e113642aaf8f6194771832d\",\n   \"gitBlob\": \"f0a8a836812faa3ed49b274f55315b6cf5d70fb0\"\n  },\n  \"hunks\": [\n   {\n    \"at\": 3,\n    \"before\": \"import {gunzipSync} from 'node:zlib';\\nimport {beforeUiEntranceWitness} from './ui-entrance-source.mjs';\\n\\nconst sha256=source=>createHash('sha256').update(source).digest('hex');\",\n    \"after\": \"import {gunzipSync} from 'node:zlib';\\nimport {beforeUiEntranceWitness} from './ui-entrance-source.mjs';\\nimport {beforeReleaseClosureFixture} from './release-closure-fixture-source.mjs';\\n\\nconst sha256=source=>createHash('sha256').update(source).digest('hex');\"\n   },\n   {\n    \"at\": 58,\n    \"before\": \"\\nfunction fixtureMatches(path,source,after,{allowArchived=true}={}){\\n if(typeof source!=='string'||source.includes('\\\\r\\\\r\\\\n'))return false;\\n const normalized=source.replaceAll('\\\\r\\\\n','\\\\n'),archived=normalized===after.source;\",\n    \"after\": \"\\nfunction fixtureMatches(path,source,after,{allowArchived=true}={}){\\n source=beforeReleaseClosureFixture(path,source);\\n if(typeof source!=='string'||source.includes('\\\\r\\\\r\\\\n'))return false;\\n const normalized=source.replaceAll('\\\\r\\\\n','\\\\n'),archived=normalized===after.source;\"\n   }\n  ]\n },\n \"tests/helpers/colorless-catalog-source-inverse.mjs\": {\n  \"current\": {\n   \"sha256\": \"ca654dba3b490f2d5f857933931992d1b72b346df246165499631cca7f6f717d\",\n   \"gitBlob\": \"94c5af24ef7e9e76b53116e97fc55d25d353f482\"\n  },\n  \"previous\": {\n   \"sha256\": \"b624a090c35dbbb0b2a161092ad98628f5d34767f07d7aee9f5415f0c796726c\",\n   \"gitBlob\": \"051b1dcb5da240eec4c6b65cfa94b9b3775e8bd6\"\n  },\n  \"hunks\": [\n   {\n    \"at\": 0,\n    \"before\": \"// Proposal facade: the original epoch module and its oracle are byte-for-byte frozen.\\nexport * from './epochs/colorless/tests/helpers/colorless-catalog-source-inverse.mjs';\\nimport { preColorlessCatalogSource as original } from './epochs/colorless/tests/helpers/colorless-catalog-source-inverse.mjs';\\nimport {authenticateDevelopBackflow,beforeDevelopBackflow} from './develop-release-backflow-source.mjs';\\nimport {sourceEpoch} from './combined-epoch/source-epoch.mjs';\",\n    \"after\": \"// Proposal facade: the original epoch module and its oracle are byte-for-byte frozen.\\nexport * from './epochs/colorless/tests/helpers/colorless-catalog-source-inverse.mjs';\\nimport { preColorlessCatalogSource as original,colorlessCatalogSourceProof } from './epochs/colorless/tests/helpers/colorless-catalog-source-inverse.mjs';\\nimport {authenticateDevelopBackflow,beforeDevelopBackflow} from './develop-release-backflow-source.mjs';\\nimport {sourceEpoch} from './combined-epoch/source-epoch.mjs';\"\n   },\n   {\n    \"at\": 7,\n    \"before\": \"const descriptionPath='src/lua/abyss_colorless_cards.lua';\\nexport function preColorlessCatalogSource(path,source,{readSource=live}={}){\\n readSource=readers.get(readSource)??readSource;\\n const projected=sourceEpoch.preCombinedSource(path,source,{target:'colorless',readSource});\",\n    \"after\": \"const descriptionPath='src/lua/abyss_colorless_cards.lua';\\nexport function preColorlessCatalogSource(path,source,{readSource=live}={}){\\n if(!Object.hasOwn(colorlessCatalogSourceProof.files[path]??{},'beforeSource'))return source;\\n readSource=readers.get(readSource)??readSource;\\n const projected=sourceEpoch.preCombinedSource(path,source,{target:'colorless',readSource});\"\n   }\n  ]\n },\n \"tests/helpers/ui-entrance-approved-sources.mjs\": {\n  \"current\": {\n   \"sha256\": \"484c3a3e4f2aeb96fc84bbfc45a890576f6d615311a0c823bc63728bb7055d43\",\n   \"gitBlob\": \"b3ec751c07b240729b8454f05e19962060b6d3ce\"\n  },\n  \"previous\": {\n   \"sha256\": \"b5c903614eb19f512e365c8c4024e1c40c37f5ab5df790a016dbeecf7b0efdcb\",\n   \"gitBlob\": \"01d014fa21cf6ff4c88ef8fb99a55ae3d644802f\"\n  },\n  \"hunks\": [\n   {\n    \"at\": 2,\n    \"before\": \"import {readFileSync} from 'node:fs';\\nimport {restoreExactFixtureHunks} from './exact-fixture-hunks.mjs';\\n\\n// Invert only the approved changes on develop since the selection PR's base.\",\n    \"after\": \"import {readFileSync} from 'node:fs';\\nimport {restoreExactFixtureHunks} from './exact-fixture-hunks.mjs';\\nimport {exactSourceMatches} from './source-fingerprint.mjs';\\n\\n// Invert only the approved changes on develop since the selection PR's base.\"\n   },\n   {\n    \"at\": 13,\n    \"before\": \"\\nexport function beforeApprovedUiEntrance(path,source){\\n const row=bindings.get(path);\\n if(!row)return source;\",\n    \"after\": \"\\nexport function beforeApprovedUiEntrance(path,source){\\n source=beforeNativePrologueOwner(path,source);\\n const row=bindings.get(path);\\n if(!row)return source;\"\n   },\n   {\n    \"at\": 23,\n    \"before\": \" return !bindings.has(path)||beforeApprovedUiEntrance(path,source)!==source;\\n}\",\n    \"after\": \" return !bindings.has(path)||beforeApprovedUiEntrance(path,source)!==source;\\n}\\n\\n// #1035 changes the two archived entrance owners as a single native-button fix.\\nconst nativePrologueOwners=Object.freeze({\\n \\\"src/lua/abyss_node_ui_feedback.lua\\\": {\\n  \\\"previous\\\": {\\n   \\\"sha256\\\": \\\"b29f9b744bcc148990ee07c43abfef7edc33df38e8e47fab755bec13e8f08ff0\\\",\\n   \\\"gitBlob\\\": \\\"1b2cb6f0b0fd155e0e7b20716f9a9c4d4afcf55e\\\"\\n  },\\n  \\\"current\\\": {\\n   \\\"sha256\\\": \\\"c250e4151120fe75561cb8be053735bd199e377a2d3bcd15bb20c6acb9c46098\\\",\\n   \\\"gitBlob\\\": \\\"e3e57123fb2ff3fc20316bf88db04d5519fdb448\\\"\\n  },\\n  \\\"hunks\\\": [\\n   {\\n    \\\"at\\\": 87,\\n    \\\"before\\\": \\\"\\\\n-- Installs the feedback responsibility on one node UI instance.\\\\nfunction M.install(ctx)\\\\n    ctx.buttonLooks, ctx.buttonHover, ctx.buttonPress = {}, nil, nil\\\\n\\\\n    function ctx.paintButton(box)\\\\n        local look = ctx.buttonLooks[box]\\\\n        if not look then return end -- a never-shown view can still receive a late native exit\\\",\\n    \\\"after\\\": \\\"\\\\nlocal function nativeId(box) return box.id end\\\\n\\\\n-- Installs the feedback responsibility on one node UI instance.\\\\nfunction M.install(ctx)\\\\n    local buttonLooks = {}\\\\n    ctx.buttonHover, ctx.buttonPress = nil, nil\\\\n\\\\n    local function buttonKey(box)\\\\n        -- The native host can return a fresh Lua wrapper on each GetChild.\\\\n        local ok,id = pcall(nativeId,box)\\\\n        if ok and (type(id) == 'string' or (type(id) == 'number' and id == id)) then return id end\\\\n        return box\\\\n    end\\\\n\\\\n    function ctx.buttonLook(box)\\\\n        local look = buttonLooks[buttonKey(box)]\\\\n        if look and look.box == box then return look end\\\\n    end\\\\n\\\\n    function ctx.paintButton(box)\\\\n        local look = ctx.buttonLook(box)\\\\n        if not look then return end -- a never-shown view can still receive a late native exit\\\"\\n   },\\n   {\\n    \\\"at\\\": 178,\\n    \\\"before\\\": \\\"        for _, input in pairs(ctx.buttonInputs) do input.active, input.released = {}, nil end\\\\n        for box in pairs(ctx.buttonLooks) do ctx.paintButton(box) end\\\\n    end\\\",\\n    \\\"after\\\": \\\"        for _, input in pairs(ctx.buttonInputs) do input.active, input.released = {}, nil end\\\\n        for _, look in pairs(buttonLooks) do ctx.paintButton(look.box) end\\\\n    end\\\"\\n   },\\n   {\\n    \\\"at\\\": 182,\\n    \\\"before\\\": \\\"    function ctx.state(box, enabled, selected, primary)\\\\n        ctx.buttonLooks[box] = {enabled=enabled == true, selected=selected == true, primary=primary == true}\\\\n        ctx.paintButton(box)\\\",\\n    \\\"after\\\": \\\"    function ctx.state(box, enabled, selected, primary)\\\\n        buttonLooks[buttonKey(box)] = {box=box, enabled=enabled == true, selected=selected == true, primary=primary == true}\\\\n        ctx.paintButton(box)\\\"\\n   }\\n  ]\\n },\\n \\\"src/lua/abyss_node_ui_input.lua\\\": {\\n  \\\"previous\\\": {\\n   \\\"sha256\\\": \\\"57595d1bca4fb33eed373d36b51219cb6f5ca42f9dbfce2910e93f73323ae1f5\\\",\\n   \\\"gitBlob\\\": \\\"208140d36c0dd1ce990d25f691f9e63d3c8e28f5\\\"\\n  },\\n  \\\"current\\\": {\\n   \\\"sha256\\\": \\\"c2dd463393b5287f6ecfcb21203d12c1e9de55fbbeff63bd20e27ea3a3111d43\\\",\\n   \\\"gitBlob\\\": \\\"87809b902ae8a3fc6619c4ba15bf2f405e213db0\\\"\\n  },\\n  \\\"hunks\\\": [\\n   {\\n    \\\"at\\\": 167,\\n    \\\"before\\\": \\\"                    local function available()\\\\n                        local entry, look = visibleAction(), ctx.buttonLooks[box]\\\\n                        -- Guarded mandatory-picker cards have no framed-button look.\\\",\\n    \\\"after\\\": \\\"                    local function available()\\\\n                        local entry, look = visibleAction(), ctx.buttonLook(box)\\\\n                        -- Guarded mandatory-picker cards have no framed-button look.\\\"\\n   }\\n  ]\\n }\\n});\\nfunction beforeNativePrologueOwner(path,source){\\n if(!Object.hasOwn(nativePrologueOwners,path)||typeof source!=='string')return source;\\n const lf=source.replaceAll('\\\\r\\\\n','\\\\n');\\n if(lf.includes('\\\\r')||(source!==lf&&source!==lf.replaceAll('\\\\n','\\\\r\\\\n')))return source;\\n const owner=nativePrologueOwners[path];\\n if(!exactSourceMatches(lf,owner.current))return source;\\n const prior=restoreExactFixtureHunks({path,beforeSha256:owner.previous.sha256,afterSha256:owner.current.sha256,hunks:owner.hunks},path,lf);\\n assert(exactSourceMatches(prior,owner.previous),'exact Prologue entrance owner predecessor: '+path);\\n return source===lf?prior:prior.replaceAll('\\\\n','\\\\r\\\\n');\\n}\"\n   }\n  ]\n }\n});\nfunction beforeReleaseReplayReader(path,raw){\n if(!Object.hasOwn(releaseReplayReaders,path))return raw;\n const {current,previous,hunks}=releaseReplayReaders[path];\n const text=integrationClosureBytes(path,raw).toString('utf8');\n if(!exactSourceMatches(text,current))return raw;\n const crlf=text.replaceAll('\\n','\\r\\n');\n assert(raw.equals(Buffer.from(text))||raw.equals(Buffer.from(crlf)),'uniform release replay owner: '+path);\n const prior=restoreExactFixtureHunks({path,beforeSha256:previous.sha256,afterSha256:current.sha256,hunks},path,text);\n assert(exactSourceMatches(prior,previous),'exact release replay owner predecessor: '+path);\n return Buffer.from(prior);\n}\nfunction beforeReviewedCopySource(path,raw){\n if(!Object.hasOwn(reviewedCopySources,path))return beforeMasterBackflowSource(path,raw);"
  },
  {
   "at": 953,
   "before": "  const sha=exactCurrent?reviewedCopySources[path].current.sha256:previousSha;\n  assert((path.startsWith('tests/helpers/')||path.startsWith('tests/fixtures/'))&&!path.split('/').includes('..'),'fixed helper path');\n  const source=join(sourceDirectory,path),raw=readFileSync(source);\n  let prior=raw;\n  if(exactCurrent){",
   "after": "  const sha=exactCurrent?reviewedCopySources[path].current.sha256:previousSha;\n  assert((path.startsWith('tests/helpers/')||path.startsWith('tests/fixtures/'))&&!path.split('/').includes('..'),'fixed helper path');\n  const source=join(sourceDirectory,path),bytes=readFileSync(source);\n  const raw=liveSource?beforeReleaseReplayReader(path,bytes):bytes;\n  let prior=raw;\n  if(exactCurrent){"
  }
 ]
});
const mapRouteIconFixturePath='tests/official-assets.test.mjs';
const cardReadingCopier=Object.freeze({
 "current": {
  "sha256": "6601d0b9ff0c1e9633efdf3fa2e8a8d498599f3ded3d0fab007e6ce918cd70e3",
  "gitBlob": "8fea5e45c5e6d034a5d6807bf5546f396b0f78c9"
 },
 "previous": {
  "sha256": "8c234674a484ac9aba9e10eae21bdb0ce43372636a20b13e84d28c6a2f266bd4",
  "gitBlob": "46291e76636a7543686e62c0d893e02fc099c4a6"
 },
 "hunks": [
  {
   "at": 352,
   "before": " 'tests/helpers/chapter-battle-scene-source.mjs':'1270c293d79c04ac4a5b15483dd4cc8f9c4279362e2f5c551f6e98c20c9ad293',",
   "after": " 'tests/helpers/chapter-battle-scene-source.mjs':'28dcccf5f5e6f87b622f86e79676a18b0fcf8657f9084642782687e43cac4e87',"
  }
 ]
});
const prologueEntranceCopier=Object.freeze({
 "current": {
  "sha256": "4ee5561bd44b64e5e231356a856cb5c5c41b650c3c9b39cc6039f8c65f6ae973",
  "gitBlob": "f2dbae3d773c2d42f0b31d798638eb6a26129c0a"
 },
 "previous": {
  "sha256": "6601d0b9ff0c1e9633efdf3fa2e8a8d498599f3ded3d0fab007e6ce918cd70e3",
  "gitBlob": "8fea5e45c5e6d034a5d6807bf5546f396b0f78c9"
 },
 "hunks": [
  {
   "at": 8,
   "before": "import {createHash} from 'node:crypto';\nconst hash=b=>createHash('sha256').update(b).digest('hex');\n// Git source identities use LF; binary witnesses (especially gzip) retain",
   "after": "import {createHash} from 'node:crypto';\nimport {exactSourceMatches} from './source-fingerprint.mjs';\nconst hash=b=>createHash('sha256').update(b).digest('hex');\nconst approvedEntrancePath='tests/helpers/ui-entrance-approved-sources.mjs';\nconst approvedEntranceCurrent={sha256:'484c3a3e4f2aeb96fc84bbfc45a890576f6d615311a0c823bc63728bb7055d43',gitBlob:'b3ec751c07b240729b8454f05e19962060b6d3ce'};\nconst approvedEntrancePrevious={sha256:'b5c903614eb19f512e365c8c4024e1c40c37f5ab5df790a016dbeecf7b0efdcb',gitBlob:'01d014fa21cf6ff4c88ef8fb99a55ae3d644802f'};\n\nfunction beforePrologueEntranceHelper(path,text,lf){\n if(path!==approvedEntrancePath||!exactSourceMatches(lf,approvedEntranceCurrent))return lf;\n assert(text===lf||text===lf.replaceAll('\\n','\\r\\n'),'uniform live Prologue entrance helper: '+path);\n const parts=lf.split('\\n// #1035 changes the two archived entrance owners');\n assert.equal(parts.length,2,'exact Prologue entrance helper continuation');\n const prior=parts[0].replace(\"\\nimport {exactSourceMatches} from './source-fingerprint.mjs';\",'')\n  .replace('\\n source=beforeNativePrologueOwner(path,source);','');\n assert(exactSourceMatches(prior,approvedEntrancePrevious),'exact Prologue entrance helper predecessor');\n return prior;\n}\n// Git source identities use LF; binary witnesses (especially gzip) retain"
  },
  {
   "at": 31,
   "before": " assert(Buffer.from(text).equals(content),'helper source must be valid UTF-8: '+path);\n return Buffer.from(text.replaceAll('\\r\\n','\\n'));\n}",
   "after": " assert(Buffer.from(text).equals(content),'helper source must be valid UTF-8: '+path);\n return Buffer.from(beforePrologueEntranceHelper(path,text,text.replaceAll('\\r\\n','\\n')));\n}"
  }
 ]
});
// #1051 restores the exact vocabulary witness only in detached replays.
const releaseVocabularyCopier=Object.freeze({
 "current": {
  "sha256": "5eb4de29003a48b6640b16064585a962e34840de31c227f6b9e9a94f57eab606",
  "gitBlob": "fb1cbdf4223edc7e67d7ed7dbca217c2fcab7dfb"
 },
 "previous": {
  "sha256": "edf64f732310e44e83ae8ee17d0d9f494073fc0257fdc1b44f1138827ae20c4c",
  "gitBlob": "804e700e80ada64cee4a92c5210fd890de42d4a8"
 },
 "hunks": [
  {
   "at": 919,
   "before": "});\nfunction beforeReleaseReplayReader(path,raw){\n if(!Object.hasOwn(releaseReplayReaders,path))return raw;",
   "after": "});\n\nconst releaseVocabularyReplay=Object.freeze({\n \"current\": {\n  \"sha256\": \"39c2ba9ecd776c5a7e3e485639c0d9a2acd1b9a8732e9621735fa99cd0466e56\",\n  \"gitBlob\": \"ef85a7a0559170947d4810cb777287404ae424db\"\n },\n \"previous\": {\n  \"sha256\": \"a70cfaf283d1c758fffa9a2035bec86e122afa871e4104c11e80ae7660c82727\",\n  \"gitBlob\": \"0ca4f24023d2fe9ed5af4fdeaf0b25a0b73ebbaf\"\n },\n \"hunks\": [\n  {\n   \"at\": 8,\n   \"before\": \" '2b3d606fc142f2c8c5cfaaff386c70f6e1f741f24fbc1879b78399b7c477e914','exact Release vocabulary continuation');\",\n   \"after\": \" '9377ea3fc9aa22e1e1afed2df671413df0e11403e0862b955b929b06abc33dad','exact Release vocabulary continuation');\"\n  }\n ]\n});\nconst vocabularyReplayArchive='tests/fixtures/develop-release-vocabulary-source.json.gz';\nfunction beforeReleaseVocabularyReplay(path,raw){\n if(path===vocabularyReplayArchive){\n  if(hash(raw)!=='9377ea3fc9aa22e1e1afed2df671413df0e11403e0862b955b929b06abc33dad')return raw;\n  const before=readFileSync(new URL('../fixtures/develop-release-vocabulary-prior.json.gz',import.meta.url));\n  assert.equal(hash(before),'2b3d606fc142f2c8c5cfaaff386c70f6e1f741f24fbc1879b78399b7c477e914','exact prior vocabulary replay archive');\n  return before;\n }\n if(path!=='tests/helpers/develop-release-vocabulary-source.mjs')return raw;\n const text=integrationClosureBytes(path,raw).toString('utf8');\n if(!exactSourceMatches(text,releaseVocabularyReplay.current))return raw;\n assert(raw.equals(Buffer.from(text))||raw.equals(Buffer.from(text.replaceAll('\\n','\\r\\n'))),'uniform vocabulary replay owner');\n const prior=restoreExactFixtureHunks({path,beforeSha256:releaseVocabularyReplay.previous.sha256,\n  afterSha256:releaseVocabularyReplay.current.sha256,hunks:releaseVocabularyReplay.hunks},path,text);\n assert(exactSourceMatches(prior,releaseVocabularyReplay.previous),'exact vocabulary replay owner predecessor');\n return Buffer.from(prior);\n}\nfunction beforeReleaseReplayReader(path,raw){\n raw=beforeReleaseVocabularyReplay(path,raw);\n if(!Object.hasOwn(releaseReplayReaders,path))return raw;"
  }
 ]
});
const releaseDetachedBackflowCopier=Object.freeze({
 "current": {
  "sha256": "028abbf63774ab7cdfb6bc20f35b97817e87b4c773b1f64bdb6c5fd390291e17",
  "gitBlob": "37cb3814b5dd6c3f7eba01c00bda55f71aa989e6"
 },
 "previous": {
  "sha256": "5eb4de29003a48b6640b16064585a962e34840de31c227f6b9e9a94f57eab606",
  "gitBlob": "fb1cbdf4223edc7e67d7ed7dbca217c2fcab7dfb"
 },
 "hunks": [
  {
   "at": 2,
   "before": "import {restoreExactFixtureHunks} from './exact-fixture-hunks.mjs';\n// Copies only immutable test helper dependencies; production owners remain explicit fixtures.",
   "after": "import {restoreExactFixtureHunks} from './exact-fixture-hunks.mjs';\nimport {beforeDetachedReleaseBackflow} from './release-detached-backflow-source.mjs';\n// Copies only immutable test helper dependencies; production owners remain explicit fixtures."
  },
  {
   "at": 956,
   "before": "function beforeReleaseReplayReader(path,raw){\n raw=beforeReleaseVocabularyReplay(path,raw);\n if(!Object.hasOwn(releaseReplayReaders,path))return raw;",
   "after": "function beforeReleaseReplayReader(path,raw){\n raw=beforeReleaseVocabularyReplay(path,beforeDetachedReleaseBackflow(path,raw));\n if(!Object.hasOwn(releaseReplayReaders,path))return raw;"
  }
 ]
});
const tinyHouseTraceCopier=Object.freeze({
 "current": {
  "sha256": "943774e7b3ed3f69f23a75facd64e66bd6c9bbef3a5a4d321a53eff3d2caeab7",
  "gitBlob": "ec2a4796a957f036e3bcc504d40928f7f68a9d30"
 },
 "previous": {
  "sha256": "028abbf63774ab7cdfb6bc20f35b97817e87b4c773b1f64bdb6c5fd390291e17",
  "gitBlob": "37cb3814b5dd6c3f7eba01c00bda55f71aa989e6"
 },
 "hunks": [
  {
   "at": 955,
   "before": "}\nfunction beforeReleaseReplayReader(path,raw){\n raw=beforeReleaseVocabularyReplay(path,beforeDetachedReleaseBackflow(path,raw));\n if(!Object.hasOwn(releaseReplayReaders,path))return raw;",
   "after": "}\n// Keep the historical copier payload at the original helper identity.\nconst tinyHouseReplayHelper=Object.freeze({\n \"current\": {\n  \"sha256\": \"25c2c46d4ae3a6a4f9a4ef24fc2831f5a4f1f3b752b931e05f08cdf5e91f42a9\",\n  \"gitBlob\": \"23d879325a1ef0be02b0ad23b3836dfb8fd8b129\"\n },\n \"previous\": {\n  \"sha256\": \"b09df63dd432eaa4796047bd4ba8f64a3d224963eeab15e1bc90f7732c8afae2\",\n  \"gitBlob\": \"bb8df89c3ca48e98c48c31ae961d53fd76231fcc\"\n },\n \"hunks\": [\n  {\n   \"at\": 2722,\n   \"before\": \"\\n// Retain at most one verified byte-for-byte projection per declared path.\",\n   \"after\": \"\\n// The authoritative Tiny House trace and the capacity test share one fixture.\\nconst tinyHouseBackflowFixture=Object.freeze({\\n \\\"path\\\": \\\"tests/tiny-house-pending-ui.cases.mjs\\\",\\n \\\"beforeSha256\\\": \\\"ad5a77d379252e337e8421c8e8d2f784272371032f209145be51e0f2b71abab1\\\",\\n \\\"afterSha256\\\": \\\"24cbb7b9395d5c5e5666586ffb8a6cb476e62309af242c1077aa44eea3f0fd52\\\",\\n \\\"hunks\\\": [\\n  {\\n   \\\"at\\\": 32,\\n   \\\"before\\\": \\\" const {sourceEpoch}=await import('./helpers/closeout-source-epoch.mjs');\\\\n const {currentProductionRereads}=await import('./helpers/current-production-source-reads.mjs');\\\\n const {beforeTinyHouseUiSource}=await import('./helpers/tiny-house-ui-source.mjs');\\\",\\n   \\\"after\\\": \\\" const {sourceEpoch}=await import('./helpers/closeout-source-epoch.mjs');\\\\n const {currentProductionRereads,releaseArchitectureReadTrace}=await import('./helpers/current-production-source-reads.mjs');\\\\n const {beforeTinyHouseUiSource}=await import('./helpers/tiny-house-ui-source.mjs');\\\"\\n  },\\n  {\\n   \\\"at\\\": 50,\\n   \\\"before\\\": \\\" const expected=[...reads];\\\\n assert.equal(expected.length,480,'complete fresh raw closure size');\\\\n assert.equal(createHash('sha256').update(JSON.stringify(expected)).digest('hex'),\\\\n  'ad1c81a8f757224fa6520ca74d2a9b682f24925d2689141bc4b2eb1066d6a7fd','exact current admission order');\\\\n let position=-1;\\\",\\n   \\\"after\\\": \\\" const expected=[...reads];\\\\n assert.equal(expected.length,releaseArchitectureReadTrace.count,'complete fresh raw closure size');\\\\n assert.equal(createHash('sha256').update(JSON.stringify(expected)).digest('hex'),\\\\n  releaseArchitectureReadTrace.sha256,'exact current admission order');\\\\n let position=-1;\\\"\\n  },\\n  {\\n   \\\"at\\\": 59,\\n   \\\"before\\\": \\\" eventReread=expected.lastIndexOf(event)+1;\\\\n assert.equal(eventReread,480,'the event owner must be checked again after the initial scan');\\\\n assert.notEqual(expected.indexOf(event)+1,eventReread,'the injected failure belongs to a fresh repeat read');\\\",\\n   \\\"after\\\": \\\" eventReread=expected.lastIndexOf(event)+1;\\\\n assert.equal(eventReread,expected.length,'the event owner must be checked again after the initial scan');\\\\n assert.notEqual(expected.indexOf(event)+1,eventReread,'the injected failure belongs to a fresh repeat read');\\\"\\n  },\\n  {\\n   \\\"at\\\": 104,\\n   \\\"before\\\": \\\" const {beforeUiEntranceWitness}=await import('./helpers/ui-entrance-source.mjs');\\\\n const project=(path,source)=>beforeReleaseCapacitySource(path,beforeRebasedRelease(path,beforeDeckPagesSuiteSource(path,beforeUiEntranceWitness(path,source))));\\\\n const paths=['scripts/build-native-candidate.mjs','scripts/build-ui.mjs','scripts/monster-art.mjs',\\\",\\n   \\\"after\\\": \\\" const {beforeUiEntranceWitness}=await import('./helpers/ui-entrance-source.mjs');\\\\n const {beforeKnownMasterBackflowSource}=await import('./helpers/master-backflow-source.mjs');\\\\n const {beforeChapterBattleScene}=await import('./helpers/chapter-battle-scene-source.mjs');\\\\n const {beforeBattlePeriphery}=await import('./helpers/battle-periphery-source.mjs');\\\\n const project=(path,source)=>{\\\\n  const chapter=beforeBattlePeriphery(path,beforeChapterBattleScene(path,source));\\\\n  const backflow=beforeKnownMasterBackflowSource(path,chapter);\\\\n  const historical=beforeRebasedRelease(path,beforeDeckPagesSuiteSource(path,beforeUiEntranceWitness(path,backflow)));\\\\n  const prior=beforeReleaseCapacitySource(path,historical);\\\\n  return prior===historical?source:prior;\\\\n };\\\\n const paths=['scripts/build-native-candidate.mjs','scripts/build-ui.mjs','scripts/monster-art.mjs',\\\"\\n  }\\n ]\\n});\\n\\n// Retain at most one verified byte-for-byte projection per declared path.\"\n  },\n  {\n   \"at\": 2756,\n   \"before\": \" source=beforeOfficialCharacterBackflow(path,beforeApprovedUiEntrance(path,source));\\n const binding=bindings.get(path);\",\n   \"after\": \" source=beforeOfficialCharacterBackflow(path,beforeApprovedUiEntrance(path,source));\\n const tinyHousePrior=restoreExactFixtureHunks(tinyHouseBackflowFixture,path,source);\\n if(tinyHousePrior!==source)source=source.includes('\\\\r\\\\n')?tinyHousePrior.replaceAll('\\\\n','\\\\r\\\\n'):tinyHousePrior;\\n const binding=bindings.get(path);\"\n  }\n ]\n});\nfunction beforeReleaseReplayReader(path,raw){\n raw=beforeReleaseVocabularyReplay(path,beforeDetachedReleaseBackflow(path,raw));\n if(path==='tests/helpers/current-replay-fix-sources.mjs'){\n  const normalized=integrationClosureBytes(path,raw);\n  const source=normalized.toString('utf8');\n  const {current,previous,hunks}=tinyHouseReplayHelper;\n  if(exactSourceMatches(source,current)){\n   assert(raw.equals(normalized)||raw.equals(Buffer.from(source.replaceAll('\\n','\\r\\n'))),'uniform Tiny House replay helper');\n   const prior=restoreExactFixtureHunks({path,beforeSha256:previous.sha256,afterSha256:current.sha256,hunks},path,source);\n   assert(exactSourceMatches(prior,previous),'exact Tiny House replay helper predecessor');\n   raw=Buffer.from(prior);\n  }\n }\n if(!Object.hasOwn(releaseReplayReaders,path))return raw;"
  }
 ]
});
const currentDetachedCopier=Object.freeze({
 "current": {
  "sha256": "6b6b09d18f1705e4b1639b803dcb435c557be838e6220574ed1182cca0d9c4ed",
  "gitBlob": "96c2beb318819293663a4933658ecca15b21e60d"
 },
 "previous": {
  "sha256": "943774e7b3ed3f69f23a75facd64e66bd6c9bbef3a5a4d321a53eff3d2caeab7",
  "gitBlob": "ec2a4796a957f036e3bcc504d40928f7f68a9d30"
 },
 "hunks": [
  {
   "at": 2,
   "before": "import {restoreExactFixtureHunks} from './exact-fixture-hunks.mjs';\nimport {beforeDetachedReleaseBackflow} from './release-detached-backflow-source.mjs';\n// Copies only immutable test helper dependencies; production owners remain explicit fixtures.",
   "after": "import {restoreExactFixtureHunks} from './exact-fixture-hunks.mjs';\nimport {beforeDetachedReleaseBackflow,currentDetachedInputs} from './release-detached-backflow-source.mjs';\n// Copies only immutable test helper dependencies; production owners remain explicit fixtures."
  },
  {
   "at": 958,
   "before": " \"current\": {\n  \"sha256\": \"25c2c46d4ae3a6a4f9a4ef24fc2831f5a4f1f3b752b931e05f08cdf5e91f42a9\",\n  \"gitBlob\": \"23d879325a1ef0be02b0ad23b3836dfb8fd8b129\"\n },",
   "after": " \"current\": {\n  \"sha256\": \"2e8050508d63ccfeccec116268d56ec6d8dee9b01b82103135310c0f22d70470\",\n  \"gitBlob\": \"e427ffcab3ec496e7b691314116307eea68d104f\"\n },"
  },
  {
   "at": 969,
   "before": "   \"before\": \"\\n// Retain at most one verified byte-for-byte projection per declared path.\",\n   \"after\": \"\\n// The authoritative Tiny House trace and the capacity test share one fixture.\\nconst tinyHouseBackflowFixture=Object.freeze({\\n \\\"path\\\": \\\"tests/tiny-house-pending-ui.cases.mjs\\\",\\n \\\"beforeSha256\\\": \\\"ad5a77d379252e337e8421c8e8d2f784272371032f209145be51e0f2b71abab1\\\",\\n \\\"afterSha256\\\": \\\"24cbb7b9395d5c5e5666586ffb8a6cb476e62309af242c1077aa44eea3f0fd52\\\",\\n \\\"hunks\\\": [\\n  {\\n   \\\"at\\\": 32,\\n   \\\"before\\\": \\\" const {sourceEpoch}=await import('./helpers/closeout-source-epoch.mjs');\\\\n const {currentProductionRereads}=await import('./helpers/current-production-source-reads.mjs');\\\\n const {beforeTinyHouseUiSource}=await import('./helpers/tiny-house-ui-source.mjs');\\\",\\n   \\\"after\\\": \\\" const {sourceEpoch}=await import('./helpers/closeout-source-epoch.mjs');\\\\n const {currentProductionRereads,releaseArchitectureReadTrace}=await import('./helpers/current-production-source-reads.mjs');\\\\n const {beforeTinyHouseUiSource}=await import('./helpers/tiny-house-ui-source.mjs');\\\"\\n  },\\n  {\\n   \\\"at\\\": 50,\\n   \\\"before\\\": \\\" const expected=[...reads];\\\\n assert.equal(expected.length,480,'complete fresh raw closure size');\\\\n assert.equal(createHash('sha256').update(JSON.stringify(expected)).digest('hex'),\\\\n  'ad1c81a8f757224fa6520ca74d2a9b682f24925d2689141bc4b2eb1066d6a7fd','exact current admission order');\\\\n let position=-1;\\\",\\n   \\\"after\\\": \\\" const expected=[...reads];\\\\n assert.equal(expected.length,releaseArchitectureReadTrace.count,'complete fresh raw closure size');\\\\n assert.equal(createHash('sha256').update(JSON.stringify(expected)).digest('hex'),\\\\n  releaseArchitectureReadTrace.sha256,'exact current admission order');\\\\n let position=-1;\\\"\\n  },\\n  {\\n   \\\"at\\\": 59,\\n   \\\"before\\\": \\\" eventReread=expected.lastIndexOf(event)+1;\\\\n assert.equal(eventReread,480,'the event owner must be checked again after the initial scan');\\\\n assert.notEqual(expected.indexOf(event)+1,eventReread,'the injected failure belongs to a fresh repeat read');\\\",\\n   \\\"after\\\": \\\" eventReread=expected.lastIndexOf(event)+1;\\\\n assert.equal(eventReread,expected.length,'the event owner must be checked again after the initial scan');\\\\n assert.notEqual(expected.indexOf(event)+1,eventReread,'the injected failure belongs to a fresh repeat read');\\\"\\n  },\\n  {\\n   \\\"at\\\": 104,\\n   \\\"before\\\": \\\" const {beforeUiEntranceWitness}=await import('./helpers/ui-entrance-source.mjs');\\\\n const project=(path,source)=>beforeReleaseCapacitySource(path,beforeRebasedRelease(path,beforeDeckPagesSuiteSource(path,beforeUiEntranceWitness(path,source))));\\\\n const paths=['scripts/build-native-candidate.mjs','scripts/build-ui.mjs','scripts/monster-art.mjs',\\\",\\n   \\\"after\\\": \\\" const {beforeUiEntranceWitness}=await import('./helpers/ui-entrance-source.mjs');\\\\n const {beforeKnownMasterBackflowSource}=await import('./helpers/master-backflow-source.mjs');\\\\n const {beforeChapterBattleScene}=await import('./helpers/chapter-battle-scene-source.mjs');\\\\n const {beforeBattlePeriphery}=await import('./helpers/battle-periphery-source.mjs');\\\\n const project=(path,source)=>{\\\\n  const chapter=beforeBattlePeriphery(path,beforeChapterBattleScene(path,source));\\\\n  const backflow=beforeKnownMasterBackflowSource(path,chapter);\\\\n  const historical=beforeRebasedRelease(path,beforeDeckPagesSuiteSource(path,beforeUiEntranceWitness(path,backflow)));\\\\n  const prior=beforeReleaseCapacitySource(path,historical);\\\\n  return prior===historical?source:prior;\\\\n };\\\\n const paths=['scripts/build-native-candidate.mjs','scripts/build-ui.mjs','scripts/monster-art.mjs',\\\"\\n  }\\n ]\\n});\\n\\n// Retain at most one verified byte-for-byte projection per declared path.\"\n  },\n  {\n   \"at\": 2756,\n   \"before\": \" source=beforeOfficialCharacterBackflow(path,beforeApprovedUiEntrance(path,source));\\n const binding=bindings.get(path);\",\n   \"after\": \" source=beforeOfficialCharacterBackflow(path,beforeApprovedUiEntrance(path,source));\\n const tinyHousePrior=restoreExactFixtureHunks(tinyHouseBackflowFixture,path,source);\\n if(tinyHousePrior!==source)source=source.includes('\\\\r\\\\n')?tinyHousePrior.replaceAll('\\\\n','\\\\r\\\\n'):tinyHousePrior;\\n const binding=bindings.get(path);\"\n  }",
   "after": "   \"before\": \"\\n// Retain at most one verified byte-for-byte projection per declared path.\",\n   \"after\": \"\\n// The authoritative Tiny House trace and the capacity test share one fixture.\\nconst tinyHouseBackflowFixture=Object.freeze({\\n \\\"path\\\": \\\"tests/tiny-house-pending-ui.cases.mjs\\\",\\n \\\"beforeSha256\\\": \\\"ad5a77d379252e337e8421c8e8d2f784272371032f209145be51e0f2b71abab1\\\",\\n \\\"afterSha256\\\": \\\"24cbb7b9395d5c5e5666586ffb8a6cb476e62309af242c1077aa44eea3f0fd52\\\",\\n \\\"hunks\\\": [\\n  {\\n   \\\"at\\\": 32,\\n   \\\"before\\\": \\\" const {sourceEpoch}=await import('./helpers/closeout-source-epoch.mjs');\\\\n const {currentProductionRereads}=await import('./helpers/current-production-source-reads.mjs');\\\\n const {beforeTinyHouseUiSource}=await import('./helpers/tiny-house-ui-source.mjs');\\\",\\n   \\\"after\\\": \\\" const {sourceEpoch}=await import('./helpers/closeout-source-epoch.mjs');\\\\n const {currentProductionRereads,releaseArchitectureReadTrace}=await import('./helpers/current-production-source-reads.mjs');\\\\n const {beforeTinyHouseUiSource}=await import('./helpers/tiny-house-ui-source.mjs');\\\"\\n  },\\n  {\\n   \\\"at\\\": 50,\\n   \\\"before\\\": \\\" const expected=[...reads];\\\\n assert.equal(expected.length,480,'complete fresh raw closure size');\\\\n assert.equal(createHash('sha256').update(JSON.stringify(expected)).digest('hex'),\\\\n  'ad1c81a8f757224fa6520ca74d2a9b682f24925d2689141bc4b2eb1066d6a7fd','exact current admission order');\\\\n let position=-1;\\\",\\n   \\\"after\\\": \\\" const expected=[...reads];\\\\n assert.equal(expected.length,releaseArchitectureReadTrace.count,'complete fresh raw closure size');\\\\n assert.equal(createHash('sha256').update(JSON.stringify(expected)).digest('hex'),\\\\n  releaseArchitectureReadTrace.sha256,'exact current admission order');\\\\n let position=-1;\\\"\\n  },\\n  {\\n   \\\"at\\\": 59,\\n   \\\"before\\\": \\\" eventReread=expected.lastIndexOf(event)+1;\\\\n assert.equal(eventReread,480,'the event owner must be checked again after the initial scan');\\\\n assert.notEqual(expected.indexOf(event)+1,eventReread,'the injected failure belongs to a fresh repeat read');\\\",\\n   \\\"after\\\": \\\" eventReread=expected.lastIndexOf(event)+1;\\\\n assert.equal(eventReread,expected.length,'the event owner must be checked again after the initial scan');\\\\n assert.notEqual(expected.indexOf(event)+1,eventReread,'the injected failure belongs to a fresh repeat read');\\\"\\n  },\\n  {\\n   \\\"at\\\": 104,\\n   \\\"before\\\": \\\" const {beforeUiEntranceWitness}=await import('./helpers/ui-entrance-source.mjs');\\\\n const project=(path,source)=>beforeReleaseCapacitySource(path,beforeRebasedRelease(path,beforeDeckPagesSuiteSource(path,beforeUiEntranceWitness(path,source))));\\\\n const paths=['scripts/build-native-candidate.mjs','scripts/build-ui.mjs','scripts/monster-art.mjs',\\\",\\n   \\\"after\\\": \\\" const {beforeUiEntranceWitness}=await import('./helpers/ui-entrance-source.mjs');\\\\n const {beforeKnownMasterBackflowSource}=await import('./helpers/master-backflow-source.mjs');\\\\n const {beforeChapterBattleScene}=await import('./helpers/chapter-battle-scene-source.mjs');\\\\n const {beforeBattlePeriphery}=await import('./helpers/battle-periphery-source.mjs');\\\\n const project=(path,source)=>{\\\\n  const chapter=beforeBattlePeriphery(path,beforeChapterBattleScene(path,source));\\\\n  const backflow=beforeKnownMasterBackflowSource(path,chapter);\\\\n  const historical=beforeRebasedRelease(path,beforeDeckPagesSuiteSource(path,beforeUiEntranceWitness(path,backflow)));\\\\n  const prior=beforeReleaseCapacitySource(path,historical);\\\\n  return prior===historical?source:prior;\\\\n };\\\\n const paths=['scripts/build-native-candidate.mjs','scripts/build-ui.mjs','scripts/monster-art.mjs',\\\"\\n  }\\n ]\\n});\\n// Preserve the exact older planning receipt while the live portrait trace advances.\\nconst gameUiPortraitTrace={\\n \\\"path\\\": \\\"tests/game-ui-extraction-source-inverse.test.mjs\\\",\\n \\\"beforeSha256\\\": \\\"baff968d896e057cb66763e7ffdf3c08ff4ea37b2174b0e6bbbb73eede88e031\\\",\\n \\\"afterSha256\\\": \\\"1f34a6ccb4daed6a6da58aa8b2aa9384d11d1ebeb5c0c3ce713ad82c03aaf97e\\\",\\n \\\"hunks\\\": [\\n  {\\n   \\\"at\\\": 36,\\n   \\\"before\\\": \\\"// The authenticated portrait continuation reads these linked owners after the frozen base scan.\\\\nconst portraitRereads=['battle_info_content','battle_render_hud','battle_card_glow','battle_render_hud','battle_render_hud']\\\\n .map(name=>'src/lua/abyss_'+name+'.lua');\\\",\\n   \\\"after\\\": \\\"// The authenticated portrait continuation rereads glow once after the base scan.\\\\n// Info content and the battle HUD belong to that scan and still reject raw drift.\\\\nconst portraitRereads=['src/lua/abyss_battle_card_glow.lua'];\\\\nconst portraitLinkedOwners=new Set([...portraitRereads,\\\\n 'src/lua/abyss_battle_info_content.lua','src/lua/abyss_battle_render_hud.lua']);\\\"\\n  },\\n  {\\n   \\\"at\\\": 47,\\n   \\\"before\\\": \\\" assert.equal(target.files[path].source,preNoncombatDemandEpoch.proof.current[path].source);\\\",\\n   \\\"after\\\": \\\" assert.equal(target.files[path].source,preNoncombatDemandEpoch.proof.current[path].source);\\\\n const expectedReads=[...sourceEpoch.proof.owners,...portraitRereads];\\\"\\n  },\\n  {\\n   \\\"at\\\": 52,\\n   \\\"before\\\": \\\"  assert.deepEqual(reads,[...sourceEpoch.proof.owners,...portraitRereads]);\\\",\\n   \\\"after\\\": \\\"  assert.deepEqual(reads,expectedReads);\\\"\\n  },\\n  {\\n   \\\"at\\\": 60,\\n   \\\"before\\\": \\\" for(const [index,owner] of portraitRereads.entries()){\\\\n  const occurrence=[...sourceEpoch.proof.owners,...portraitRereads.slice(0,index+1)].filter(path=>path===owner).length;\\\",\\n   \\\"after\\\": \\\" for(const [index,owner] of expectedReads.entries()){\\\\n  if(!portraitLinkedOwners.has(owner))continue;\\\\n  const occurrence=expectedReads.slice(0,index+1).filter(path=>path===owner).length;\\\"\\n  }\\n ]\\n};\\nfunction beforeGameUiPortraitTrace(path,source){\\n if(path!==gameUiPortraitTrace.path||typeof source!=='string')return source;\\n const current=source.replaceAll('\\\\r\\\\n','\\\\n');\\n if(source!==current&&source!==current.replaceAll('\\\\n','\\\\r\\\\n'))return source;\\n if(!exactSourceMatches(source,{sha256:gameUiPortraitTrace.afterSha256,gitBlob:'5ce98641788d97fed5a2662888053cb8ddb4d096'}))return source;\\n const prior=restoreExactFixtureHunks(gameUiPortraitTrace,path,current);\\n if(!exactSourceMatches(prior,{sha256:gameUiPortraitTrace.beforeSha256,gitBlob:'6c10f026571af5f05197141bfa9426df54649a68'}))throw Error('Invalid portrait trace predecessor: '+path);\\n return source===current?prior:prior.replaceAll('\\\\n','\\\\r\\\\n');\\n}\\n\\n// Retain at most one verified byte-for-byte projection per declared path.\"\n  },\n  {\n   \"at\": 2791,\n   \"before\": \"export function beforeCurrentReplayFixes(path, source){\\n source=beforeCombinedCharacterBackflow(path,source);\\n source=beforeOfficialCharacterBackflow(path,beforeApprovedUiEntrance(path,source));\\n const binding=bindings.get(path);\",\n   \"after\": \"export function beforeCurrentReplayFixes(path, source){\\n source=beforeGameUiPortraitTrace(path,source);\\n source=beforeCombinedCharacterBackflow(path,source);\\n source=beforeOfficialCharacterBackflow(path,beforeApprovedUiEntrance(path,source));\\n const tinyHousePrior=restoreExactFixtureHunks(tinyHouseBackflowFixture,path,source);\\n if(tinyHousePrior!==source)source=source.includes('\\\\r\\\\n')?tinyHousePrior.replaceAll('\\\\n','\\\\r\\\\n'):tinyHousePrior;\\n const binding=bindings.get(path);\"\n  }"
  },
  {
   "at": 1021,
   "before": " const liveSource=sourceDirectory===realpathSync.native(new URL('../../',import.meta.url));\n for(const [path,previousSha]of Object.entries(entranceFiles)){\n  const exactCurrent=currentProduction&&currentEntranceHelpers.has(path);\n  const sha=exactCurrent?reviewedCopySources[path].current.sha256:previousSha;",
   "after": " const liveSource=sourceDirectory===realpathSync.native(new URL('../../',import.meta.url));\n for(const [path,previousSha]of Object.entries(currentProduction?{...entranceFiles,...currentDetachedInputs}:entranceFiles)){\n  const exactRelease=currentProduction&&Object.hasOwn(currentDetachedInputs,path);\n  const exactCurrent=currentProduction&&!exactRelease&&currentEntranceHelpers.has(path);\n  const sha=exactCurrent?reviewedCopySources[path].current.sha256:previousSha;"
  },
  {
   "at": 1027,
   "before": "  const source=join(sourceDirectory,path),bytes=readFileSync(source);\n  const raw=liveSource?beforeReleaseReplayReader(path,bytes):bytes;\n  let prior=raw;\n  if(exactCurrent){\n   const current=integrationClosureBytes(path,raw);",
   "after": "  const source=join(sourceDirectory,path),bytes=readFileSync(source);\n  const raw=liveSource&&!exactRelease?beforeReleaseReplayReader(path,bytes):bytes;\n  let prior=raw;\n  if(exactRelease){\n   const current=integrationClosureBytes(path,raw);\n   assert(raw.equals(current)||raw.equals(Buffer.from(current.toString('utf8').replaceAll('\\n','\\r\\n'))),\n    'uniform current detached owner: '+path);\n  }else if(exactCurrent){\n   const current=integrationClosureBytes(path,raw);"
  }
 ]
});
// The shared Reward/Map runtime continuation adds one exact copier replay owner.
const sharedRuntimeCopier=Object.freeze({
 "current": {
  "sha256": "363fec902cc0f096a3bd2b85db23dc46313ca8ac55065b592c76114af33e2709",
  "gitBlob": "26dbeb34768ac9e436a57516c873fcb1346e1a3f"
 },
 "previous": {
  "sha256": "6b6b09d18f1705e4b1639b803dcb435c557be838e6220574ed1182cca0d9c4ed",
  "gitBlob": "96c2beb318819293663a4933658ecca15b21e60d"
 },
 "hunks": [
  {
   "at": 687,
   "before": " \"tests/helpers/master-backflow-source.mjs\": {",
   "after": " \"tests/helpers/combined-epoch/source-epoch-runtime.mjs\": {\n  \"current\": {\n   \"sha256\": \"96e78e422e9135f5d947f21999b7e5476d4ef3fca16e50b91c75330a011552cf\",\n   \"gitBlob\": \"f04ceba33d70db52f2c845fd66fe8a46dcf0d4ff\"\n  },\n  \"previous\": {\n   \"sha256\": \"e4d3f37edd23a2040290b1091540d17776fe6f7f7a129f4c31e48e71a8f9a0c0\",\n   \"gitBlob\": \"24d1f5ce20b53e3b657abf0e1a2eb568abb108a1\"\n  },\n  \"hunks\": [\n   {\n    \"at\": 0,\n    \"before\": \"import { entrancePredecessor } from '../ui-entrance-source.mjs';\",\n    \"after\": \"import {beforeReleaseClosureFixture} from '../release-closure-fixture-source.mjs';\\nimport { entrancePredecessor } from '../ui-entrance-source.mjs';\"\n   },\n   {\n    \"at\": 55,\n    \"before\": \"const validPath=p=>p==='config/architecture.json'||/^src\\\\/lua\\\\/[A-Za-z0-9_-]+\\\\.lua$/.test(p);\",\n    \"after\": \"// Use the shared exact Release inverse only for the linked runtime owners\\n// whose v2.2 presentation successors postdate the frozen combined epoch.\\nconst releaseRuntimeOwner=path=>path==='src/lua/abyss_battle_reward_layout.lua'||path==='src/lua/abyss_map_ui.lua';\\nconst validPath=p=>p==='config/architecture.json'||/^src\\\\/lua\\\\/[A-Za-z0-9_-]+\\\\.lua$/.test(p);\"\n   },\n   {\n    \"at\": 143,\n    \"before\": \"  const projected=entrancePredecessor(path,source,rawReader(readSource),{allowConfigLayout});\",\n    \"after\": \"  const readRawInput=rawReader(readSource);\\n  // Track the actual raw owner before applying any inverse. An exact live\\n  // successor must not be swapped for its equally projectable predecessor\\n  // while a single combined read is in progress.\\n  const releaseObservations=new Map();\\n  const readReleaseOwner=owner=>{\\n   const raw=readRawInput(owner);\\n   if(!releaseRuntimeOwner(owner))return raw;\\n   const uniform=typeof raw==='string'&&\\n    (raw===normalize(raw)||raw===normalize(raw).replaceAll('\\\\n','\\\\r\\\\n'));\\n   const observed=uniform?normalize(raw):raw;\\n   if(releaseObservations.has(owner))\\n    assert(observed===releaseObservations.get(owner),'combined linked owner identity: '+owner+' changed during Release replay');\\n   else releaseObservations.set(owner,observed);\\n   return beforeReleaseClosureFixture(owner,raw);\\n  };\\n  const projected=entrancePredecessor(path,source,readReleaseOwner,{allowConfigLayout});\"\n   }\n  ]\n },\n \"tests/helpers/master-backflow-source.mjs\": {"
  }
 ]
});
const sharedRuntimeReuseCopier=Object.freeze({
 "current": {
  "sha256": "9474597b89473ac023f2ce0d0cccfa83f7a2e441bf62c0b08d5762293a424836",
  "gitBlob": "0f2a345d40c2e122b6cb08534f55777fb45a6aa9"
 },
 "previous": {
  "sha256": "363fec902cc0f096a3bd2b85db23dc46313ca8ac55065b592c76114af33e2709",
  "gitBlob": "26dbeb34768ac9e436a57516c873fcb1346e1a3f"
 },
 "hunks": [
  {
   "at": 3,
   "before": "import {beforeDetachedReleaseBackflow,currentDetachedInputs} from './release-detached-backflow-source.mjs';",
   "after": "import {beforeDetachedReleaseBackflow,beforeSharedReleaseRuntimeReplay,currentDetachedInputs} from './release-detached-backflow-source.mjs';"
  },
  {
   "at": 687,
   "before": " \"tests/helpers/combined-epoch/source-epoch-runtime.mjs\": {\n  \"current\": {\n   \"sha256\": \"96e78e422e9135f5d947f21999b7e5476d4ef3fca16e50b91c75330a011552cf\",\n   \"gitBlob\": \"f04ceba33d70db52f2c845fd66fe8a46dcf0d4ff\"\n  },\n  \"previous\": {\n   \"sha256\": \"e4d3f37edd23a2040290b1091540d17776fe6f7f7a129f4c31e48e71a8f9a0c0\",\n   \"gitBlob\": \"24d1f5ce20b53e3b657abf0e1a2eb568abb108a1\"\n  },\n  \"hunks\": [\n   {\n    \"at\": 0,\n    \"before\": \"import { entrancePredecessor } from '../ui-entrance-source.mjs';\",\n    \"after\": \"import {beforeReleaseClosureFixture} from '../release-closure-fixture-source.mjs';\\nimport { entrancePredecessor } from '../ui-entrance-source.mjs';\"\n   },\n   {\n    \"at\": 55,\n    \"before\": \"const validPath=p=>p==='config/architecture.json'||/^src\\\\/lua\\\\/[A-Za-z0-9_-]+\\\\.lua$/.test(p);\",\n    \"after\": \"// Use the shared exact Release inverse only for the linked runtime owners\\n// whose v2.2 presentation successors postdate the frozen combined epoch.\\nconst releaseRuntimeOwner=path=>path==='src/lua/abyss_battle_reward_layout.lua'||path==='src/lua/abyss_map_ui.lua';\\nconst validPath=p=>p==='config/architecture.json'||/^src\\\\/lua\\\\/[A-Za-z0-9_-]+\\\\.lua$/.test(p);\"\n   },\n   {\n    \"at\": 143,\n    \"before\": \"  const projected=entrancePredecessor(path,source,rawReader(readSource),{allowConfigLayout});\",\n    \"after\": \"  const readRawInput=rawReader(readSource);\\n  // Track the actual raw owner before applying any inverse. An exact live\\n  // successor must not be swapped for its equally projectable predecessor\\n  // while a single combined read is in progress.\\n  const releaseObservations=new Map();\\n  const readReleaseOwner=owner=>{\\n   const raw=readRawInput(owner);\\n   if(!releaseRuntimeOwner(owner))return raw;\\n   const uniform=typeof raw==='string'&&\\n    (raw===normalize(raw)||raw===normalize(raw).replaceAll('\\\\n','\\\\r\\\\n'));\\n   const observed=uniform?normalize(raw):raw;\\n   if(releaseObservations.has(owner))\\n    assert(observed===releaseObservations.get(owner),'combined linked owner identity: '+owner+' changed during Release replay');\\n   else releaseObservations.set(owner,observed);\\n   return beforeReleaseClosureFixture(owner,raw);\\n  };\\n  const projected=entrancePredecessor(path,source,readReleaseOwner,{allowConfigLayout});\"\n   }\n  ]\n },\n \"tests/helpers/master-backflow-source.mjs\": {",
   "after": " \"tests/helpers/master-backflow-source.mjs\": {"
  },
  {
   "at": 980,
   "before": " raw=beforeReleaseVocabularyReplay(path,beforeDetachedReleaseBackflow(path,raw));",
   "after": " if(path===runtime)return beforeSharedReleaseRuntimeReplay(path,raw);\n raw=beforeReleaseVocabularyReplay(path,beforeDetachedReleaseBackflow(path,raw));"
  }
 ]
});
function activeReceipt(path){
 if(path===mapRouteIconFixturePath)return rewardTitleSources[path];
 if(path===selectionLayoutPath)return releaseSelectionOverlay;
 if(path===copierPath)return sharedRuntimeReuseCopier;
 if(path===returnedReadingReplayPath)return selectionRawEntranceReplay;
 return combinedReceipt(path)??receipt(path);
}
const currentCopier=activeReceipt(copierPath).current;
export const selectionCopierReceipt=Object.freeze({path:copierPath,
 afterSha256:currentCopier.sha256,afterBlob:currentCopier.gitBlob});

function beforeReceipt(path,source,binding){
 if(!binding||!uniformSelectionSource(source)||!exactSourceMatches(source,binding.current))return source;
 const prior=restoreExactFixtureHunks({path,beforeSha256:binding.previous.sha256,
  afterSha256:binding.current.sha256,hunks:binding.hunks},path,source);
 assert(exactSourceMatches(prior,binding.previous),'exact selection receipt predecessor: '+path);
 return source.includes('\r\n')?prior.replaceAll('\r\n','\n').replaceAll('\n','\r\n'):prior;
}

export function beforeSelectionReceiptSource(path,source){
 if(path===mapRouteIconFixturePath)source=beforeReleaseClosureFixture(path,source);
 if(path===selectionLayoutPath)source=beforeReceipt(path,source,releaseSelectionOverlay);
 if(path===selectionLayoutPath)source=beforeReceipt(path,source,selectionLayoutCurrent);
 if(path===returnedReadingReplayPath)source=beforeReceipt(path,beforeReceipt(path,source,selectionRawEntranceReplay),returnedReadingReplay);
 if(path===copierPath)source=beforeReceipt(path,beforeReceipt(path,source,sharedRuntimeReuseCopier),sharedRuntimeCopier);
 if(path===copierPath)source=beforeReceipt(path,beforeReceipt(path,source,currentDetachedCopier),tinyHouseTraceCopier);
 if(path===copierPath)source=beforeReceipt(path,source,releaseDetachedBackflowCopier);
 if(path===copierPath)source=beforeReceipt(path,source,releaseVocabularyCopier);
 if(path===copierPath)source=beforeReceipt(path,source,releaseEntranceCopier);
 if(path===copierPath)source=beforeReceipt(path,source,currentBackflowCopier);
 if(path===copierPath)source=beforeReceipt(path,source,returnedCardReadingCopier);
 if(path===copierPath)source=beforeReceipt(path,source,prologueEntranceCopier);
 if(path===copierPath)source=beforeReceipt(path,source,cardReadingCopier);
 if(path===copierPath)source=beforeReceipt(path,source,deckArchitectureCopier);
 source=beforeReceipt(path,source,combinedReceipt(path));
 if(path===copierPath)source=beforeReceipt(path,source,nodeNoticeCopier);
 return beforeReceipt(path,source,receipt(path));
}

export function checkedSelectionReceiptRead(read){
 const checked=(path,encoding)=>{
  const raw=read(path,encoding),binding=activeReceipt(path);
  if(binding){
   const source=decodedSelectionSource(raw);
   assert(uniformSelectionSource(source)&&exactSourceMatches(source,binding.current),
    'fresh complete integration source: '+path);
  }
  return raw;
 };
 for(const path of Object.keys(receipts))checked(path,'utf8');
 return checked;
}

export const selectionNodeNoticePath='src/lua/abyss_node_ui.lua';
// Selection's linked notices use the #1023 stage before the older entrance
// inversion. The general Master replay can still read its original e483 view.
const combinedNodeNotice=Object.freeze({
 "current": {
  "sha256": "cebee495d15a561758bdc28b11e40a01eb9b7b2bb052bf872f72d77de993d12e",
  "gitBlob": "1fa5e7e6f78663362a8171d21186ffc9eb9575ab"
 },
 "previous": {
  "sha256": "72755f5190b5d98d40e668bcf033cc0ee3f2056e2494a94a7a147e60cd1d1cf1",
  "gitBlob": "f8b2b473121054b5c2207a608d926a9528476d16"
 },
 "hunks": [
  {
   "at": 30,
   "before": "    return layout.event.reference and node and node.type=='event' and not ctx.self.failed\n        and (ctx.self.notice=='' or message==ctx.child('eventView'):GetChild('body').text)\nend\nlocal function snapshotDeck(deck)",
   "after": "    return layout.event.reference and node and node.type=='event' and not ctx.self.failed\n        and (ctx.self.notice=='' or message==ctx.child('eventView'):GetChild('body').text)\nend\nlocal function positionNotice(control,screen,top)\n    -- The old position was hidden by the taller mobile chrome. Room notes\n    -- now sit in the content area, clear of the role-specific heading or choices.\n    if screen=='treasureView' then\n        control:SetAnchoredPosition(-366,top-36)\n        control:SetSizeDelta(460,64)\n    elseif screen=='eventView' then\n        control:SetAnchoredPosition(-365,-225)\n        control:SetSizeDelta(400,52)\n    elseif screen=='campView' then\n        control:SetAnchoredPosition(0,-305)\n        control:SetSizeDelta(760,52)\n    else\n        control:SetAnchoredPosition(0,top-30)\n        control:SetSizeDelta(760,52)\n    end\nend\nlocal function snapshotDeck(deck)"
  },
  {
   "at": 162,
   "before": "    end\n\n    function ctx.syncNodeIdentity(node)\n        if ctx.self.renderRun ~= ctx.self.run or ctx.self.renderMap ~= ctx.self.map or ctx.self.nodeId ~= (node and node.id) then",
   "after": "    end\n\n    function ctx.hostRendersEvent(node)\n        return ctx.options.hostRendersEvents and node and node.type == \"event\"\n    end\n\n    function ctx.hostLeavesForMap()\n        local self,owner=ctx.self,ctx.self.run\n        return ctx.options.hostRendersMap and ctx.onChange and owner and owner.phase=='map'\n            and owner.nodeFlow and owner.nodeFlow.complete and not self:holding()\n            and not require('abyss_relic_pending').owner(owner)\n    end\n\n    function ctx.syncNodeIdentity(node)\n        if ctx.self.renderRun ~= ctx.self.run or ctx.self.renderMap ~= ctx.self.map or ctx.self.nodeId ~= (node and node.id) then"
  },
  {
   "at": 197,
   "before": "    end\n\n    function ctx.renderNodePage(view,node,result,active)\n        local screen,hint=ctx.nodeScreen(view,node,result,active)\n        local recallSource,treasureSource\n        if screen ~= 'pickerView' or not ctx.enhancedForge(node) then\n            ctx.campUI:hide(active and node.type == 'camp')",
   "after": "    end\n\n    local function prepareNodePage(screen, node, active, matchBoard)\n        if screen ~= 'pickerView' or not ctx.enhancedForge(node) then\n            ctx.campUI:hide(active and node.type == 'camp')"
  },
  {
   "at": 203,
   "before": "        for _, name in ipairs({ \"campView\", \"pickerView\", \"eventView\", \"treasureView\" }) do ctx.show(ctx.child(name), name == screen) end\n        -- Reset shared card faces before the ordinary picker/camp renderer writes them.\n        local matchBoard = active and MatchUI.isBoard(node.event)\n        if not matchBoard then ctx.resetMatch() end\n        if matchBoard then hint=ctx.renderMatch(view,node)\n        elseif screen == \"shopView\" then hint = ctx.renderShop(view, node)",
   "after": "        for _, name in ipairs({ \"campView\", \"pickerView\", \"eventView\", \"treasureView\" }) do ctx.show(ctx.child(name), name == screen) end\n        -- Reset shared card faces before the ordinary picker/camp renderer writes them.\n        if not matchBoard then ctx.resetMatch() end\n    end\n\n    function ctx.renderNodePage(view,node,result,active)\n        local screen,hint=ctx.nodeScreen(view,node,result,active)\n        local recallSource,treasureSource\n        local matchBoard = active and MatchUI.isBoard(node.event)\n        prepareNodePage(screen,node,active,matchBoard)\n        if matchBoard then hint=ctx.renderMatch(view,node)\n        elseif screen == \"shopView\" then hint = ctx.renderShop(view, node)"
  },
  {
   "at": 227,
   "before": "    end\n\n    function ctx.refreshNodeNotice(node,active,hint,screen)\n        -- The merchant speaks in his own dialogue box; the notice keeps only shop facts.",
   "after": "    end\n\n    local function setRoomNoticePosition(notice,screen)\n        if ctx.options.mobileRunHud then positionNotice(notice,screen,ctx.options.mobileRunHud.contentTop) end\n    end\n    function ctx.refreshNodeNotice(node,active,hint,screen)\n        -- The merchant speaks in his own dialogue box; the notice keeps only shop facts."
  },
  {
   "at": 235,
   "before": "        local message=ctx.self.notice ~= \"\" and ctx.self.notice or hint or \"\"\n        local notice=ctx.child(\"notice\")\n        if screen == \"pickerView\" and not ctx.enhancedForge(node) and not MatchUI.isBoard(node.event) then\n            -- Keep prompts and errors in the same coordinate space as the paged cards.",
   "after": "        local message=ctx.self.notice ~= \"\" and ctx.self.notice or hint or \"\"\n        local notice=ctx.child(\"notice\")\n        setRoomNoticePosition(notice,screen)\n        if screen == \"pickerView\" and not ctx.enhancedForge(node) and not MatchUI.isBoard(node.event) then\n            -- Keep prompts and errors in the same coordinate space as the paged cards."
  },
  {
   "at": 258,
   "before": "    end\n\n    function ctx.resultFooter()\n        local confirmLabel,confirmOk,confirmFn\n        confirmLabel, confirmOk = \"继续\", true\n        confirmFn = function()\n            ctx.self.result, ctx.self.notice = nil, \"\"\n            ctx.self:render() if ctx.onChange then ctx.onChange(true, \"continue\", ctx.self) end\n            return true, \"continue\"\n        end",
   "after": "    end\n\n    function ctx.resultFooter(node)\n        local confirmLabel,confirmOk,confirmFn\n        confirmLabel, confirmOk = \"继续\", true\n        confirmFn = function()\n            ctx.self.result, ctx.self.notice = nil, \"\"\n            if not ctx.hostRendersEvent(node) and not ctx.hostLeavesForMap() then ctx.self:render() end\n            if ctx.onChange then ctx.onChange(true, \"continue\", ctx.self) end\n            return true, \"continue\"\n        end"
  },
  {
   "at": 275,
   "before": "            return EndingUI.footer(ctx.self,confirm,ctx.commit)\n        elseif result then\n            backLabel,confirmLabel,confirmOk,confirmFn,skipRestReward,recallObserve=ctx.resultFooter()\n        elseif node and node.complete then\n            backLabel,confirmLabel,confirmOk,confirmFn,skipRestReward,recallObserve=ctx.completedFooter(view)",
   "after": "            return EndingUI.footer(ctx.self,confirm,ctx.commit)\n        elseif result then\n            backLabel,confirmLabel,confirmOk,confirmFn,skipRestReward,recallObserve=ctx.resultFooter(node)\n        elseif node and node.complete then\n            backLabel,confirmLabel,confirmOk,confirmFn,skipRestReward,recallObserve=ctx.completedFooter(view)"
  },
  {
   "at": 326,
   "before": "    end\n\n    function ctx.self:render()\n        if not self.run then ctx.root:SetVisible(false);return false, \"node_unbound\" end",
   "after": "    end\n\n    local function projectNode(self)\n        local flow=self.run.nodeFlow\n        if ctx.hostRendersEvent(flow) or ctx.options.enhancedRooms and flow and self.run.phase=='node'\n            and (flow.type=='camp' or flow.type=='shop') then\n            return Nodes.roomView(self.run,self.map)\n        end\n        return Nodes.view(self.run,self.map)\n    end\n\n    function ctx.self:render()\n        if not self.run then ctx.root:SetVisible(false);return false, \"node_unbound\" end"
  },
  {
   "at": 341,
   "before": "        ctx.inspectCards={}\n        if ctx.renderRelicPending()then ctx.campUI:hide();ctx.clearUnusedNativeArt(previousArt);return true end\n        local view = Nodes.view(self.run, self.map)\n        local node = view.node\n        ctx.syncNodeIdentity(node)",
   "after": "        ctx.inspectCards={}\n        if ctx.renderRelicPending()then ctx.campUI:hide();ctx.clearUnusedNativeArt(previousArt);return true end\n        local view = projectNode(self)\n        local node = view.node\n        ctx.syncNodeIdentity(node)"
  }
 ]
});
export function beforeSelectionNodeNoticeSource(path,raw){
 if(path!==selectionNodeNoticePath)return raw;
 const source=decodedSelectionSource(raw);
 const prior=beforeReceipt(path,source,combinedNodeNotice);
 assert(prior!==source,'combined linked owner identity: '+path);
 return Buffer.isBuffer(raw)?Buffer.from(prior):prior;
}

export function checkedSelectionEntranceRead(read){
 return (path,encoding)=>{
  const raw=checkedReleaseEntranceOwner(path,read(path,encoding),read);
  if(!uiEntranceOwns(path))return raw;
  const source=decodedSelectionSource(raw);
  assert(uniformSelectionSource(source),'uniform current Selection entrance source: '+path);
  const prior=beforeNodeNoticeSource(path,beforeSelectionNodeNoticeSource(path,source));
  return prior===source?raw:Buffer.isBuffer(raw)?Buffer.from(prior):prior;
 };
}
