// Test-only exact projections for historical build and battle replay.
// Current build commands continue to read the source on disk.
import assert from 'node:assert/strict';
import {restoreExactFixtureHunks} from './exact-fixture-hunks.mjs';
import {exactSourceMatches} from './source-fingerprint.mjs';
import {beforeBossMapScroll,bossMapScrollIdentity} from './boss-map-scroll-source.mjs';
import {beforeProductionReadingBackflow,productionReadingBackflowOwns} from './master-backflow-source.mjs';

const projections = {
  "tests/official-assets-legibility.test.mjs": {
    "path": "tests/official-assets-legibility.test.mjs",
    "beforeSha256": "d6b4cf66162f06c43a1bf0854d39af6c822c0366d857da58bbd112632802d108",
    "afterSha256": "8eb179b9a3e0d288f66aca55754c39478c95563460aff189435fa4d106a536c3",
    "beforeBlob": "6fd825d1678ca65282b5159b983dae32ec86be8e",
    "afterBlob": "01e8e0075f8d682c9365e746d4d05f2d666587c9",
    "hunks": [
      {
        "at": 5,
        "before": "import {applyOfficialAssets,officialAssetsTheme} from '../scripts/official-assets-layout.mjs';\nimport {battleLayout} from '../scripts/ui-layout.mjs';\nimport {deckCardTemplate} from '../scripts/deck-ui-layout.mjs';\nimport {geoCardReferenceTokens,stsReferenceRuntimeGeometry} from '../scripts/sts-card-reference-profile.mjs';",
        "after": "import {applyOfficialAssets,officialAssetsTheme} from '../scripts/official-assets-layout.mjs';\nimport {battleLayout} from '../scripts/ui-layout.mjs';\nimport {chapterBattleScenes,chapterBattleSceneHost} from '../scripts/v220-chapter-battle-scenes.mjs';\nimport {deckCardTemplate} from '../scripts/deck-ui-layout.mjs';\nimport {geoCardReferenceTokens,stsReferenceRuntimeGeometry} from '../scripts/sts-card-reference-profile.mjs';"
      },
      {
        "at": 171,
        "before": " assert(child(foreground,'gate')&&child(foreground,'floor')&&child(foreground,'perspective'));\n});\ntest('measured type frames share one native pool and preserve original illustration identities',()=>{\n const layout=gameLayout(),theme=officialAssetsTheme(nativeTheme);applyOfficialAssets([layout],theme);",
        "after": " assert(child(foreground,'gate')&&child(foreground,'floor')&&child(foreground,'perspective'));\n});\ntest('chapter artwork publishes a single bounded pool for the official stage',()=>{\n const layout=gameLayout(),theme=officialAssetsTheme(nativeTheme);\n const plan=chapterBattleScenes(theme);\n applyOfficialAssets([layout],theme,{chapterScenes:plan});\n const stage=child(layout,'stage')??layout,battle=child(stage,'battlePanel');\n const scene=child(battle,chapterBattleSceneHost);\n assert.deepEqual(child(battle,'hero').position,[-324,-35]);\n assert.deepEqual(child(battle,'notice').position,theme.layout.battleNotice.position);\n assert.deepEqual(theme.layout.player.groundedStatusLane,[-168,42]);\n assert.equal(theme.layout.enemyRow.groundContact.feet.blue_guard,47/106);\n assert.equal(theme.layout.enemyRow.groundContact.feet.sentry,undefined);\n assert.equal(theme.layout.enemyRow.groundContact.feet.champ,48/106);\n assert.equal(Object.keys(theme.layout.enemyRow.groundContact.feet).length,33);\n assert(Object.values(theme.layout.enemyRow.groundContact.footprints).every(footprints=>footprints.length<=2));\n assert(!child(battle,'v25BattleScene')&&!child(battle,'lowpolyScene'));\n assert.equal(children(battle)[0],scene,'scene paints behind battle interaction');\n assert.equal(children(scene).length,5);\n assert(children(scene).every(batch=>children(batch).length<=60));\n assert.equal(all(scene).length,256);\n assert.deepEqual(plan.rows.map(rows=>rows.filter(Boolean).length),[229,249]);\n const slots=all(scene).filter(node=>node.kind==='image');\n assert.equal(slots.length,250);\n assert.equal(slots.filter(node=>node.visible===false).length,21);\n for(const rows of plan.rows)for(const [i,row]of rows.entries()){\n  if(row)assert.equal(row[0]>100006,slots[i].image>100006,'one renderer family per native slot');\n }\n});\ntest('measured type frames share one native pool and preserve original illustration identities',()=>{\n const layout=gameLayout(),theme=officialAssetsTheme(nativeTheme);applyOfficialAssets([layout],theme);"
      }
    ]
  },
  "config/architecture.json": {
    "path": "config/architecture.json",
    "beforeSha256": "7149b7878a8258a6de4b23d95742dc3c4e31d38bf558f80a35efe51aac401e00",
    "afterSha256": "a0c3fa73aa7095b8d4747ab03e894ad8b5988c6d2a1cad25c1f67ae37166d6ab",
    "beforeBlob": "4aa8367e9d694587c9b58202185524fe3376640a",
    "afterBlob": "c83552908531da8f7f9c224d2b1d2f7cc8f4dcb9",
    "hunks": [
      {
        "at": 2,
        "before": "    \"abyss_checkpoint_identities\": \"core\",\n    \"abyss_page_reveal\": \"ui\",\n    \"abyss_lowcost_art\": \"ui\",\n    \"abyss_game_ui_navigation\": \"ui\",",
        "after": "    \"abyss_checkpoint_identities\": \"core\",\n    \"abyss_page_reveal\": \"ui\",\n    \"abyss_chapter_battle_scene\": \"ui\",\n    \"abyss_chapter_battle_scene_data\": \"ui\",\n    \"abyss_lowcost_art\": \"ui\",\n    \"abyss_game_ui_navigation\": \"ui\","
      },
      {
        "at": 357,
        "before": "    \"abyss_v25_card_assets\": \"ui\",\n    \"abyss_monster_art\": \"ui\",\n    \"abyss_monster_source_geometry\": \"core\",\n    \"abyss_monster_source_positions\": \"core\",",
        "after": "    \"abyss_v25_card_assets\": \"ui\",\n    \"abyss_monster_art\": \"ui\",\n    \"abyss_byrd_ground_trial\": \"ui\",\n    \"abyss_monster_source_geometry\": \"core\",\n    \"abyss_monster_source_positions\": \"core\","
      }
    ]
  },
  "tests/helpers/integrated-ci-source.mjs": {
    "path": "tests/helpers/integrated-ci-source.mjs",
    "beforeSha256": "35c66b01602d1b6f956cda4863768f9c1fd7ecdd3f8965ffee6ebc597811b882",
    "afterSha256": "9c0f0d77c30692b4220fc3bf38f84c221c9409ca73e21567cd1ec6565ce09aa6",
    "beforeBlob": "d5bc70a847df670c100c9fd0809537fdcee725e1",
    "afterBlob": "2f628ab1013c999dc38c55b87537d573c4bbcd40",
    "hunks": [
      {
        "at": 8,
        "before": "import {releaseBootstrapCiSource,releaseBootstrapCiCheckedSource,assertReleaseBootstrapCiCurrent} from './release-bootstrap-ci-source.mjs';\nimport {exactSourceMatches} from './source-fingerprint.mjs';\nconst hash=s=>createHash('sha256').update(s).digest('hex'),norm=s=>s.replaceAll('\\r\\n','\\n');\nconst freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};",
        "after": "import {releaseBootstrapCiSource,releaseBootstrapCiCheckedSource,assertReleaseBootstrapCiCurrent} from './release-bootstrap-ci-source.mjs';\nimport {exactSourceMatches} from './source-fingerprint.mjs';\nimport {chapterBattleSceneReader} from './chapter-battle-scene-source.mjs';\nimport {beforeBattlePeriphery} from './battle-periphery-source.mjs';\nconst hash=s=>createHash('sha256').update(s).digest('hex'),norm=s=>s.replaceAll('\\r\\n','\\n');\nconst freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};"
      },
      {
        "at": 133,
        "before": " return path.startsWith('src/')||path==='config/architecture.json';\n}\nexport function integratedHistoricalInput(path,source){\n return linkedProductionOwner(path)?source:beforeIntegrationEvidence(path,source);\n}\nexport function integratedSource(path,source,target){\n source=beforePreflightSource(path,source);\n assert(Object.hasOwn(integratedCiProof.sources,target),'known integration input');\n if(linkedProductionOwner(path))return source;\n const row=Object.hasOwn(integratedCiProof.files,path)?integratedCiProof.files[path]:null;",
        "after": " return path.startsWith('src/')||path==='config/architecture.json';\n}\nconst chapterCurrentOwners=new Set(['config/architecture.json','src/lua/abyss_game_ui_view.lua']);\nexport function integratedHistoricalInput(path,source){\n return linkedProductionOwner(path)?source:beforeIntegrationEvidence(path,source);\n}\nexport function integratedSource(path,source,target){\n assert(Object.hasOwn(integratedCiProof.sources,target),'known integration input');\n // These owners reach the historic view with the authenticated bytes from\n // preflight. Only the current-source reader may reopen their live identity.\n if(chapterCurrentOwners.has(path))return source;\n source=beforePreflightSource(path,source);\n if(linkedProductionOwner(path))return source;\n const row=Object.hasOwn(integratedCiProof.files,path)?integratedCiProof.files[path]:null;"
      },
      {
        "at": 160,
        "before": "};}\nexport function assertIntegratedCurrent(read=readFileSync){\n assertReleaseBootstrapCiCurrent(read);\n const rawRead=read;\n read=preflightPriorRead(rawRead);\n for(const [path,row]of Object.entries(integratedCiProof.files)){\n  const binding=integratedEvidenceSuccessors[path];\n  const raw=binding?rawRead(path,'utf8'):read(path,'utf8');\n  const source=path==='package.json'?checkedActorAlphaBuildPredecessor(path,raw):raw;\n  if(binding)assert(exactSourceMatches(source,binding),'fresh complete integration source: '+path);\n  const prior=releaseBootstrapCiCheckedSource(path,beforeIntegrationEvidence(path,source),row.current);",
        "after": "};}\nexport function assertIntegratedCurrent(read=readFileSync){\n const rawRead=assertReleaseBootstrapCiCurrent(read);\n read=preflightPriorRead(rawRead);\n for(const [path,row]of Object.entries(integratedCiProof.files)){\n  const binding=integratedEvidenceSuccessors[path];\n  const raw=binding?rawRead(path,'utf8'):read(path,'utf8');\n  let source=path==='package.json'?checkedActorAlphaBuildPredecessor(path,raw):raw;\n  if(chapterCurrentOwners.has(path)){\n   const chapter=chapterBattleSceneReader(path,source,owner=>rawRead(owner,'utf8'));\n   assert.notEqual(chapter.source,source,'fresh complete integration source: '+path);\n   source=beforeBattlePeriphery(path,chapter.source,chapter.read);\n  }\n  if(binding)assert(exactSourceMatches(source,binding),'fresh complete integration source: '+path);\n  const prior=releaseBootstrapCiCheckedSource(path,beforeIntegrationEvidence(path,source),row.current);"
      }
    ]
  },
  "scripts/build-native-candidate.mjs": {
    "path": "scripts/build-native-candidate.mjs",
    "beforeSha256": "da36fc09e30e5c64e248dbe5a8e00e9d2cacbfbb93275f676d0aa7b0ee1e8aab",
    "afterSha256": "0bc1f946529220f49192df1c44a057c37a1631c9d9df68a9ef3f0e8291f5074c",
    "beforeBlob": "5d9a0c2a7efa71b1b547d9ada4b4bff374166b05",
    "afterBlob": "9196644e6218605e9c34183d264c481bc4fb138a",
    "hunks": [
      {
        "at": 37,
        "before": "  abyss_component_binding:'scripts/build-ui.mjs',\n  [v25CardModule]:'scripts/build-ui.mjs',",
        "after": "  abyss_component_binding:'scripts/build-ui.mjs',\n  abyss_chapter_battle_scene_data:'scripts/build-ui.mjs',\n  [v25CardModule]:'scripts/build-ui.mjs',"
      }
    ]
  },
  "scripts/build-ui.mjs": {
    "path": "scripts/build-ui.mjs",
    "beforeSha256": "54a06a5d5587d4be37050a8c0ef87cc71cef02b0ec205c27e1c5b0a8ed149aeb",
    "afterSha256": "fd387ceae0b70600cf3e58d82797b3b392261607e4967370e4cfe00358603d04",
    "beforeBlob": "6f75e050dcae41c30002fe60ca0e3994bdbb4037",
    "afterBlob": "cf43e6b718de84eea64d7b7513e0241a487012d1",
    "hunks": [
      {
        "at": 2,
        "before": "import {applyOfficialAssets,officialAssetsTheme} from './official-assets-layout.mjs';\nimport {assertOfficialRunContracts} from './official-run-layout.mjs';",
        "after": "import {applyOfficialAssets,officialAssetsTheme} from './official-assets-layout.mjs';\nimport {chapterBattleScenes} from './v220-chapter-battle-scenes.mjs';\nimport {assertOfficialRunContracts} from './official-run-layout.mjs';"
      },
      {
        "at": 100,
        "before": "    fileURLToPath(new URL('./official-assets-layout.mjs', import.meta.url)),\n    fileURLToPath(new URL('./art/lightweight-2d-assets.mjs', import.meta.url)), ...releaseInputPaths()];",
        "after": "    fileURLToPath(new URL('./official-assets-layout.mjs', import.meta.url)),\n    fileURLToPath(new URL('./v220-chapter-battle-scenes.mjs', import.meta.url)),\n    fileURLToPath(new URL('./v220-battle-scene-geometry.mjs', import.meta.url)),\n    fileURLToPath(new URL('./art/lightweight-2d-assets.mjs', import.meta.url)), ...releaseInputPaths()];"
      },
      {
        "at": 105,
        "before": "    stat: statSync(input, { bigint: true }) }));\n  const outputs = ['abyss_theme.lua', 'map-ui.json', 'abyss_map_layout.lua', 'abyss_map_controls.lua',\n    'abyss_narrative.lua', 'abyss_presentation.lua', 'battle-ui.json', 'game-ui.json', 'abyss_ui_layout.lua',",
        "after": "    stat: statSync(input, { bigint: true }) }));\n  const outputs = ['abyss_theme.lua', 'abyss_chapter_battle_scene_data.lua', 'map-ui.json', 'abyss_map_layout.lua', 'abyss_map_controls.lua',\n    'abyss_narrative.lua', 'abyss_presentation.lua', 'battle-ui.json', 'game-ui.json', 'abyss_ui_layout.lua',"
      },
      {
        "at": 200,
        "before": "  }\n  if(officialAssets){\n    applyOfficialAssets([battle,layout,...templates],theme);\n    templates.push(battlePileCardTemplate(layout,templates[0]));",
        "after": "  }\n  const chapterScenes = refined ? chapterBattleScenes(theme) : undefined;\n  if(officialAssets){\n    applyOfficialAssets([battle,layout,...templates],theme,{chapterScenes});\n    templates.push(battlePileCardTemplate(layout,templates[0]));"
      },
      {
        "at": 233,
        "before": "  writeV25CardBinding(outputDirectory);\n  writeFileSync(join(outputDirectory, deckBrowserBindingModule+'.lua'), deckBrowserBindingSource(0,browserParts));",
        "after": "  writeV25CardBinding(outputDirectory);\n  const {scene: _chapterSceneLayout, ...chapterSceneData} = chapterScenes ?? {};\n  writeFileSync(join(outputDirectory,'abyss_chapter_battle_scene_data.lua'),\n    'return '+toLua(chapterSceneData)+'\\n');\n  writeFileSync(join(outputDirectory, deckBrowserBindingModule+'.lua'), deckBrowserBindingSource(0,browserParts));"
      }
    ]
  },
  "scripts/official-assets-layout.mjs": {
    "path": "scripts/official-assets-layout.mjs",
    "beforeSha256": "f5a6b4187c5dda7f532b675a2cafa9ad9221420be4d9fb9a596df66496fe95f7",
    "afterSha256": "700e3ea142a525b2dceed7b793fef6e30751acf559f66ad65fddee90f501c83c",
    "beforeBlob": "72d0b6b14a1a7866a238b587af4bdea1ea9cd3f4",
    "afterBlob": "e8b8194424084504d7c64258c8d39db9843d911a",
    "hunks": [
      {
        "at": 2,
        "before": "import {applyV25BattleScene} from './v25-battle-scene.mjs';\nimport {applyV25BattleChrome} from './v25-battle-chrome.mjs';",
        "after": "import {applyV25BattleScene} from './v25-battle-scene.mjs';\nimport {applyChapterBattlePlacement,applyChapterBattleScene} from './v220-chapter-battle-scenes.mjs';\nimport {applyV25BattleChrome} from './v25-battle-chrome.mjs';"
      },
      {
        "at": 245,
        "before": "}\nexport function applyOfficialAssets(trees,theme){\n if(!Array.isArray(trees)||!trees.length)throw Error('Official assets require layout trees');",
        "after": "}\nexport function applyOfficialAssets(trees,theme,{chapterScenes}={}){\n if(!Array.isArray(trees)||!trees.length)throw Error('Official assets require layout trees');"
      },
      {
        "at": 250,
        "before": " preflightOfficialRoots(trees);\n let cardHosts=0,removedControls=0;",
        "after": " preflightOfficialRoots(trees);\n if(chapterScenes)applyChapterBattlePlacement(theme);\n let cardHosts=0,removedControls=0;"
      },
      {
        "at": 276,
        "before": "    applyV25TurnNoticeLayout(tree,theme);\n    applyV25BattleScene(tree,theme);\n    const battle=child(stage,'battlePanel')??stage;",
        "after": "    applyV25TurnNoticeLayout(tree,theme);\n    if(chapterScenes)applyChapterBattleScene(tree,chapterScenes,theme);\n    else applyV25BattleScene(tree,theme);\n    const battle=child(stage,'battlePanel')??stage;"
      }
    ]
  },
  "scripts/native-candidate-scripts.mjs": {
    "path": "scripts/native-candidate-scripts.mjs",
    "beforeSha256": "a46d9f45900fc8bfc15878fa980a44b2e358f0137dedaf0c6748a6bb7957e1e0",
    "afterSha256": "489ea9aa92ad9a186ef52e7fab0dbd8038107ae88662a053de465eb5d31f2765",
    "beforeBlob": "638bba60319a3710f05b3088c43c3855cf817556",
    "afterBlob": "e010cf1cc68a5952c9495e8fc241ec9b5a72616b",
    "hunks": [
      {
        "at": 5,
        "before": "// Lua into build/lua; discovering every .lua there ships test fixtures.\nexport const generatedModules = [deckBrowserBindingModule, 'abyss_component_binding','abyss_v25_card_assets','abyss_ui_profile','abyss_art_features','abyss_monster_actor_binding','abyss_monster_art_data', 'abyss_data', 'abyss_original_v4_data', 'abyss_map_layout', 'abyss_narrative', 'abyss_presentation', 'abyss_theme', 'abyss_menu_background_asset', 'abyss_ready_card_binding', 'abyss_ready_card_assets', 'abyss_traveler_portrait_assets'];\n// Legacy LCG is superseded by the StS RNG modules. Keep its source/tests;",
        "after": "// Lua into build/lua; discovering every .lua there ships test fixtures.\nexport const generatedModules = [deckBrowserBindingModule, 'abyss_chapter_battle_scene_data', 'abyss_component_binding','abyss_v25_card_assets','abyss_ui_profile','abyss_art_features','abyss_monster_actor_binding','abyss_monster_art_data', 'abyss_data', 'abyss_original_v4_data', 'abyss_map_layout', 'abyss_narrative', 'abyss_presentation', 'abyss_theme', 'abyss_menu_background_asset', 'abyss_ready_card_binding', 'abyss_ready_card_assets', 'abyss_traveler_portrait_assets'];\n// Legacy LCG is superseded by the StS RNG modules. Keep its source/tests;"
      }
    ]
  },
  "src/lua/abyss_battle_enemy_view.lua": {
    "path": "src/lua/abyss_battle_enemy_view.lua",
    "beforeSha256": "25894f61ea8084bf59db4f948d1a5ad9644c08e0d35ffb7cf651cbc335a171df",
    "afterSha256": "024ddf2ad51063f80ca90b2262a8dc6764192adbeb0669787fe0c7724fa2c6d6",
    "beforeBlob": "f2a059e90c2c35c2f5a93404460af7539a490476",
    "afterBlob": "25947c13e808d765da8d70c2e0e72050810a6117",
    "hunks": [
      {
        "at": 0,
        "before": "-- Screen slots are presentation only. Every entry retains its core index/ID.\nlocal Actors=require('abyss_actor')\nlocal SourceGeometry=require('abyss_monster_source_geometry')\nlocal Theme=require('abyss_theme')",
        "after": "-- Screen slots are presentation only. Every entry retains its core index/ID.\nlocal Actors=require('abyss_actor')\nlocal ByrdTrial=require('abyss_byrd_ground_trial')\nlocal SourceGeometry=require('abyss_monster_source_geometry')\nlocal Theme=require('abyss_theme')"
      },
      {
        "at": 69,
        "before": " return math.min(sy,math.max(1,ceiling-bottom)/math.max(source.width,source.height,source.hbY+source.height))\nend\nfunction M.geometry(actor)\n local source=SourceGeometry.resolve(actor)\n local sx,sy=Theme.canvas.base[1]/1920,Theme.canvas.base[2]/1080",
        "after": " return math.min(sy,math.max(1,ceiling-bottom)/math.max(source.width,source.height,source.hbY+source.height))\nend\nlocal function groundFoot(ground,actor,nativeArtEnabled)\n if not ground then return end\n if nativeArtEnabled~=false and ByrdTrial.isGrounded(actor) then\n  return ByrdTrial.foot,ByrdTrial.footprints,true\n end\n return ground.feet[actor.definitionId],ground.footprints[actor.definitionId]\nend\nlocal function touchBounds(source,bodyScale,portrait,compact)\n local width,height=source.width*bodyScale,source.height*bodyScale\n if not compact then return width,height,portrait/2 end\n return math.max(L.statusIcon.minimumTouch,portrait*ByrdTrial.touchWidth),\n  math.max(L.statusIcon.minimumTouch,portrait*(ByrdTrial.foot+ByrdTrial.crown)+Theme.space.s),\n  portrait*ByrdTrial.crown,width\nend\nfunction M.geometry(actor,nativeArtEnabled)\n local source=SourceGeometry.resolve(actor)\n local sx,sy=Theme.canvas.base[1]/1920,Theme.canvas.base[2]/1080"
      },
      {
        "at": 90,
        "before": " local bodyScale=presentationScale(source,bottom,sy)\n local portrait=math.max(source.width,source.height)*bodyScale\n local hitX,hitBottom=x+source.hbX*bodyScale,bottom+source.hbY*bodyScale\n local rootY=bottom+portrait/2\n return {x=x,y=rootY,portrait=portrait,\n  hitX=hitX,hitY=hitBottom+source.height*bodyScale/2,hitWidth=source.width*bodyScale,hitHeight=source.height*bodyScale,\n  statusWidth=source.width*sx,statusCountWidth=Theme.presentationProfile=='official-assets-first' and statusCountWidth(actor)or L.nativeText.lineHeight,\n  nameX=hitX-x,nameY=hitBottom-36*sy-rootY,sourceScale=sy,\n  healthX=hitX-x,healthY=hitBottom-18*sy-rootY,healthTextY=hitBottom-17*sy-rootY,healthHeight=20*sy,\n  blockX=hitX-source.width*bodyScale/2-14*sx-x,blockY=hitBottom-14*sy-rootY,blockTextY=hitBottom-16*sy-rootY,\n  blockWidth=64*sx,blockHeight=64*sy,\n  intentX=hitX-x+(actor.definitionId=='gremlin_nob' and -30*sx or 0),\n  -- Full-bleed native glyphs and their 40px text line must clear both art and hitbox.\n  intentY=math.max(portrait/2,hitBottom+source.height*bodyScale-rootY)+math.max(L.nativeText.lineHeight,L.intent.size)/2+Theme.space.xs,\n  intentWidth=128*sx,intentHeight=128*sy,\n  intentHitWidth=64*sx,intentHitHeight=64*sy}",
        "after": " local bodyScale=presentationScale(source,bottom,sy)\n local portrait=math.max(source.width,source.height)*bodyScale\n local ground=L.enemyRow.groundContact\n local foot,footprints,compactTarget=groundFoot(ground,actor,nativeArtEnabled)\n local contact=foot and ground.y+source.y*sy*ground.depth\n if contact then bottom=contact-portrait*(.5-foot) end\n -- Grounded art may have transparent padding under its feet. HUD and\n -- input use the contact plane while the portrait retains its native size.\n local hitOffset=source.hbY*bodyScale\n local hitX=x+source.hbX*bodyScale\n local hitBottom=(contact or bottom)+(contact and math.min(0,hitOffset) or hitOffset)\n local rootY=bottom+portrait/2\n local hudBottom=hitBottom-(contact and ground.healthGap or 0)\n local hitWidth,hitHeight,crown,healthWidth=touchBounds(source,bodyScale,portrait,compactTarget)\n return {x=x,y=rootY,portrait=portrait,groundY=contact and contact-rootY,\n  footprints=contact and footprints,compactTarget=compactTarget,\n  hitX=hitX,hitY=hitBottom+hitHeight/2,hitWidth=hitWidth,hitHeight=hitHeight,healthWidth=healthWidth,\n  statusWidth=source.width*sx,statusCountWidth=Theme.presentationProfile=='official-assets-first' and statusCountWidth(actor)or L.nativeText.lineHeight,\n  nameX=hitX-x,nameY=hudBottom-36*sy-rootY,sourceScale=sy,\n  healthX=hitX-x,healthY=hudBottom-18*sy-rootY,healthTextY=hudBottom-17*sy-rootY,healthHeight=20*sy,\n  blockX=hitX-source.width*bodyScale/2-14*sx-x,blockY=hudBottom-14*sy-rootY,blockTextY=hudBottom-16*sy-rootY,\n  blockWidth=64*sx,blockHeight=64*sy,\n  intentX=hitX-x+(actor.definitionId=='gremlin_nob' and -30*sx or 0),\n  -- Full-bleed native glyphs and their 40px text line must clear both art and hitbox.\n  intentY=math.max(crown,hitBottom+hitHeight-rootY)+math.max(L.nativeText.lineHeight,L.intent.size)/2+Theme.space.xs,\n  intentWidth=128*sx,intentHeight=128*sy,\n  intentHitWidth=64*sx,intentHitHeight=64*sy}"
      },
      {
        "at": 118,
        "before": "end\nfunction M.rowY(_,_,actor)return M.geometry(actor).y end\nfunction M.position(_,_,actor)\n local g=M.geometry(actor)\n return g.x,L.battleUnit.nameWidth,g.portrait,g.hitWidth,g.y\nend",
        "after": "end\nfunction M.rowY(_,_,actor)return M.geometry(actor).y end\nfunction M.position(_,_,actor,nativeArtEnabled)\n local g=M.geometry(actor,nativeArtEnabled)\n return g.x,L.battleUnit.nameWidth,g.portrait,g.hitWidth,g.y\nend"
      }
    ]
  },
  "src/lua/abyss_battle_unit_view.lua": {
    "path": "src/lua/abyss_battle_unit_view.lua",
    "beforeSha256": "7a8a3fd201bdbf9e72a7bc0859d4b8a92b7fbe7762ee09339c87381869c21b3b",
    "afterSha256": "1c5bb2540e6df1a4ca5e6efdc7369eaf5d3d9dad3d80d059f80cd9c44a126384",
    "beforeBlob": "24092e97bc6626c3fc0dcf7a9aae30ccb40b7381",
    "afterBlob": "77e3f90218476d0fda2e1b6a99e18b045578b18e",
    "hunks": [
      {
        "at": 4,
        "before": "local M = {}\nlocal C, L, S = Theme.color, Theme.layout, Theme.space\n\nfunction M.geometry(portrait,player)",
        "after": "local M = {}\nlocal C, L, S = Theme.color, Theme.layout, Theme.space\nlocal shadowSlots = {'plate','border'}\n\nlocal function paintShadow(owner,x,sx,alpha)\n    alpha=math.floor(alpha*125+.5)\n    for i,foot in ipairs(owner.feet) do\n        local px=math.floor((x+foot[1]*owner.scale*sx)*2+.5)/2\n        if owner.x[i]~=px then\n            owner.controls[i]:SetAnchoredPosition(px,owner.contactY)\n            owner.x[i]=px\n        end\n        if owner.alpha~=alpha then owner.tint(owner.controls[i],{r=19,g=15,b=21,a=alpha}) end\n    end\n    owner.alpha=alpha\nend\n\n-- The shadow remains on the floor when the existing hit or escape pose lifts\n-- the portrait. Scale of resting and lunging art pivots at the visible feet.\nlocal function poseGroundShadow(owner,x,y,sx,sy,alpha,motion)\n    if not owner then return y end\n    local resting=motion=='idle'\n    if not resting or not owner.atRest then\n        paintShadow(owner,resting and 0 or x,resting and 1 or sx,alpha)\n        owner.atRest=resting\n    end\n    if resting or motion=='action' then return y+owner.y*(1-sy) end\n    return y\nend\n\nlocal function configureShadow(box,owner,feet,scale,y,picture,tint,offsetY)\n    local contactY=y+(offsetY or 0)-1\n    if owner and owner.feet==feet and owner.scale==scale and owner.y==y and owner.contactY==contactY then return owner end\n    owner={feet=feet,scale=scale,y=y,contactY=contactY,x={},tint=tint,controls={},atRest=true}\n    for i,name in ipairs(shadowSlots) do\n        local control=box:GetChild(name)\n        local foot=feet[i]\n        if foot then\n            picture(control,Theme.image.discSoft)\n            local width=foot[2]*scale\n            control:SetSizeDelta(width+math.min(8,width*.3),math.min(11,(foot[3] or 7)*scale))\n            owner.controls[i]=control\n        end\n        control:SetVisible(foot~=nil)\n    end\n    paintShadow(owner,0,1,1)\n    return owner\nend\n\nlocal function prepareUnitGround(owners,box,portrait,selected,source,picture,tint)\n    if source and source.footprints then\n        owners.enemies[box]=configureShadow(box,owners.enemies[box],source.footprints,\n            portrait/L.enemyRow.groundContact.artSize,source.groundY,picture,tint)\n        return\n    end\n    local hero=box.name=='hero' and L.player.groundShadow\n    if hero then\n        -- Native GetChild returns a fresh proxy for the same authored hero.\n        -- The battle view owns this fixed slot for its entire lifetime.\n        owners.hero=configureShadow(box,owners.hero,hero.footprints,1,hero.y,picture,tint,hero.offsetY)\n        return\n    end\n    owners.enemies[box]=nil\n    for _,name in ipairs(shadowSlots) do\n        local delta=name=='border' and S.border*2 or 0\n        local control=box:GetChild(name)\n        control:SetSizeDelta(portrait+delta,portrait+delta)\n        control:SetVisible(false)\n    end\n    tint(box:GetChild('border'),selected and C.goldBright or C.line)\nend\n\nfunction M.geometry(portrait,player)"
      },
      {
        "at": 90,
        "before": "-- glyph height and the actual status touch surfaces contribute to clearance.\nfunction M.noticeLift(actor,portrait,baseY,player)\n    local entries,si=Combat.statusView(actor),L.statusIcon\n    local g=M.geometry(portrait,player)",
        "after": "-- glyph height and the actual status touch surfaces contribute to clearance.\nfunction M.noticeLift(actor,portrait,baseY,player)\n    -- The grounded profile positions notices above the battle and puts\n    -- status rows left of the portrait, outside the hand lane.\n    if player and L.player.groundedStatusLane then return 0 end\n    local entries,si=Combat.statusView(actor),L.statusIcon\n    local g=M.geometry(portrait,player)"
      },
      {
        "at": 109,
        "before": "    return not (box.name==\"hero\" and type(icon)=='table' and icon.status==\"placeholder\")\nend\nlocal function targetCornerPosition(corner,axis,x,y,portrait)\n    -- Each bar extends inward from the portrait corner to form an L.\n    local insetX=axis=='H' and corner.sizeDeltaX/2 or 0\n    local insetY=axis=='V' and corner.sizeDeltaY/2 or 0\n    return x*(portrait/2-insetX),y*(portrait/2-insetY)\nend\n\nfunction M.new(picture, tint, ink, statusKind)\n    local function portraitParts(box, actor, portrait, icon, width, selected, targetWidth)\n        for _, name in ipairs({\"plate\", \"border\", \"portrait\"}) do\n            local delta = name == \"border\" and S.border * 2 or 0\n            box:GetChild(name):SetSizeDelta(portrait + delta, portrait + delta)\n        end\n        box:GetChild(\"plate\"):SetVisible(false)\n        box:GetChild(\"border\"):SetVisible(false)\n        box:GetChild(\"hit\"):SetSizeDelta(math.min(portrait,targetWidth or portrait),portrait)\n        box:GetChild(\"impact\"):SetSizeDelta(portrait, portrait)",
        "after": "    return not (box.name==\"hero\" and type(icon)=='table' and icon.status==\"placeholder\")\nend\nlocal function targetCornerPosition(corner,axis,x,y,portrait,source)\n    -- Each bar extends inward from the portrait corner to form an L.\n    local insetX=axis=='H' and corner.sizeDeltaX/2 or 0\n    local insetY=axis=='V' and corner.sizeDeltaY/2 or 0\n    if source and source.compactTarget then\n        return source.hitX-source.x+x*(source.hitWidth/2-insetX),source.hitY-source.y+y*(source.hitHeight/2-insetY)\n    end\n    return x*(portrait/2-insetX),y*(portrait/2-insetY)\nend\n\nfunction M.new(picture, tint, ink, statusKind)\n    local owners={enemies=setmetatable({}, {__mode='k'})}\n    local function portraitParts(box, actor, portrait, icon, width, selected, targetWidth, source)\n        box:GetChild('portrait'):SetSizeDelta(portrait,portrait)\n        box:GetChild(\"hit\"):SetSizeDelta(math.min(portrait,targetWidth or portrait),portrait)\n        box:GetChild(\"impact\"):SetSizeDelta(portrait, portrait)"
      },
      {
        "at": 133,
        "before": "        -- The 105292 placeholder read as a stray stance arrow, so hide it (real art comes from battlePose).\n        box:GetChild(\"portrait\"):SetVisible(portraitVisible(box,icon))\n        tint(box:GetChild(\"border\"), selected and C.goldBright or C.line)\n        for _, x in ipairs({-1,1}) do for _, y in ipairs({-1,1}) do\n            for _, axis in ipairs({'H','V'}) do\n                local corner=box:GetChild('target'..axis..x..'_'..y)\n                corner:SetVisible(selected == true)\n                corner:SetAnchoredPosition(targetCornerPosition(corner,axis,x,y,portrait))\n            end\n        end end",
        "after": "        -- The 105292 placeholder read as a stray stance arrow, so hide it (real art comes from battlePose).\n        box:GetChild(\"portrait\"):SetVisible(portraitVisible(box,icon))\n        for _, x in ipairs({-1,1}) do for _, y in ipairs({-1,1}) do\n            for _, axis in ipairs({'H','V'}) do\n                local corner=box:GetChild('target'..axis..x..'_'..y)\n                corner:SetVisible(selected == true)\n                corner:SetAnchoredPosition(targetCornerPosition(corner,axis,x,y,portrait,source))\n            end\n        end end"
      },
      {
        "at": 246,
        "before": "        local slots = perRow * si.rows\n        local layout = {entries = entries, pitch = pitch, perRow = perRow, slots = slots, shown = math.min(#entries, slots)}\n        local firstY=M.geometry(portrait,box.name=='hero').firstStatusY\n        row:SetAnchoredPosition(0,firstY-(si.rows-1)*pitch/2)\n        local lines=math.ceil(layout.shown/perRow)\n        local target=row:GetChild(\"hit\")",
        "after": "        local slots = perRow * si.rows\n        local layout = {entries = entries, pitch = pitch, perRow = perRow, slots = slots, shown = math.min(#entries, slots)}\n        local player=box.name=='hero'\n        local firstY=M.geometry(portrait,player).firstStatusY\n        local lane=player and L.player.groundedStatusLane\n        row:SetAnchoredPosition(lane and lane[1] or 0,firstY+(lane and lane[2] or 0)-(si.rows-1)*pitch/2)\n        local lines=math.ceil(layout.shown/perRow)\n        local target=row:GetChild(\"hit\")"
      },
      {
        "at": 260,
        "before": "    end\n\n    return function(box, actor, portrait, icon, width, selected, targetWidth, source)\n        portraitParts(box, actor, portrait, icon, width, selected, targetWidth)\n        -- Widen the Block chip for native digits rather than shrinking its text.\n        local blocked = actor.block > 0\n        local chip = math.max(L.blockBadge.size, #number(actor.block) * Theme.font.body + L.blockBadge.padding * 2)\n        local geometry=M.geometry(portrait,box.name=='hero')\n        local barWidth,barX,y=source and source.hitWidth or geometry.healthWidth,source and source.healthX or 0,source and source.healthY or geometry.healthY\n        healthParts(box, actor, barWidth, barX, y, blocked, source)\n        blockParts(box, actor, barWidth, barX, y, blocked, chip, source)",
        "after": "    end\n\n    local function renderUnit(box, actor, portrait, icon, width, selected, targetWidth, source)\n        prepareUnitGround(owners,box,portrait,selected,source,picture,tint)\n        portraitParts(box, actor, portrait, icon, width, selected, targetWidth, source)\n        -- Widen the Block chip for native digits rather than shrinking its text.\n        local blocked = actor.block > 0\n        local chip = math.max(L.blockBadge.size, #number(actor.block) * Theme.font.body + L.blockBadge.padding * 2)\n        local geometry=M.geometry(portrait,box.name=='hero')\n        local barWidth,barX,y=source and (source.healthWidth or source.hitWidth) or geometry.healthWidth,source and source.healthX or 0,source and source.healthY or geometry.healthY\n        healthParts(box, actor, barWidth, barX, y, blocked, source)\n        blockParts(box, actor, barWidth, barX, y, blocked, chip, source)"
      },
      {
        "at": 273,
        "before": "        if source then box:GetChild(\"name\"):SetVisible(false)end\n    end\nend\n",
        "after": "        if source then box:GetChild(\"name\"):SetVisible(false)end\n    end\n    local function poseUnit(id,box,x,y,sx,sy,alpha,motion)\n        local owner=id=='player' and owners.hero or owners.enemies[box]\n        return poseGroundShadow(owner,x,y,sx,sy,alpha,motion)\n    end\n    local function retireUnit(box) owners.enemies[box]=nil end\n    return renderUnit,poseUnit,retireUnit\nend\n"
      }
    ]
  },
  "src/lua/abyss_feedback_actor_painter.lua": {
    "path": "src/lua/abyss_feedback_actor_painter.lua",
    "beforeSha256": "f5c2f153b988c685e949b10c3b022dae0921f51223cb494d5b05c2a07ad48e99",
    "afterSha256": "159b982eba8798bce6791fa1fc5708b8d8b321de25704009429e867fa8cea00e",
    "beforeBlob": "fc72c073930d7e1304c31404cd26ee27ad8f93fb",
    "afterBlob": "a4a487e2b59e6508e2cf67ec2deee41d8f5f0bdb",
    "hunks": [
      {
        "at": 284,
        "before": "    local posed = ctx.state.poses[id]\n    local motionState=ActorMotion.state(unit,posed,ctx.state.effects[id],ctx.state.dying[id],ctx.state.escaping[id])\n    local x,y,sx,sy=ActorMotion.idle(unit,id,ctx.state.idleClock or 0,motionState,T.actorIdle)\n    if posed then\n        posed.age = posed.age + dt",
        "after": "    local posed = ctx.state.poses[id]\n    local motionState=ActorMotion.state(unit,posed,ctx.state.effects[id],ctx.state.dying[id],ctx.state.escaping[id])\n    local x,y,sx,sy=ActorMotion.idle(unit,id,ctx.state.idleClock or 0,motionState,T.actorIdle,ctx.platform.nativeMonsterArtEnabled)\n    if posed then\n        posed.age = posed.age + dt"
      },
      {
        "at": 306,
        "before": "    local escaping=ctx.state.escaping[id]\n    if escaping then x,sx=Escape.pose(escaping,x,sx)end\n    local portrait = box:GetChild(\"portrait\")\n    portrait:SetAnchoredPosition(x, y)",
        "after": "    local escaping=ctx.state.escaping[id]\n    if escaping then x,sx=Escape.pose(escaping,x,sx)end\n    y=ctx.poseGroundShadow(id,box,x,y,sx,sy,alpha,motionState)\n    local portrait = box:GetChild(\"portrait\")\n    portrait:SetAnchoredPosition(x, y)"
      }
    ]
  },
  "src/lua/abyss_game_ui.lua": {
    "path": "src/lua/abyss_game_ui.lua",
    "beforeSha256": "ca6aa00df7180d5406bd503a546bbb84397588578cd47d3d3fae1afd2e576e52",
    "afterSha256": "c6fadf3a75da490c70ae8bf8f8ecd98829926a05c437f36a6d3dda84972c4a8e",
    "beforeBlob": "3b3373a2e38eec614561db291dddf4560ff33779",
    "afterBlob": "bba5abe42ea4e0806961ff4d7cfdfafcc7837d6f",
    "hunks": [
      {
        "at": 209,
        "before": "    local openingForeground = View.openingForeground(self,child,prologuePanel,runMenu,exitPanel)\n    local syncOfficialBattleScene = View.syncOfficialBattleScene(root,self)\n    self.refresh = View.refresh(self,finishRunFlow,syncOpening,selectMode,syncOfficialBattleScene,syncMenuContext,platform,syncCardChoice,closeStaleDeck,openCardChoice,canManagePotions,overlaysBlocked,syncRewardReturn,refreshUtilities,refreshPageVisibility,renderCurrentPage,bgm,present,refreshForeground,syncPortraits,openingForeground)",
        "after": "    local openingForeground = View.openingForeground(self,child,prologuePanel,runMenu,exitPanel)\n    local syncOfficialBattleScene = View.syncOfficialBattleScene(root,self,platform)\n    self.refresh = View.refresh(self,finishRunFlow,syncOpening,selectMode,syncOfficialBattleScene,syncMenuContext,platform,syncCardChoice,closeStaleDeck,openCardChoice,canManagePotions,overlaysBlocked,syncRewardReturn,refreshUtilities,refreshPageVisibility,renderCurrentPage,bgm,present,refreshForeground,syncPortraits,openingForeground)"
      }
    ]
  },
  "src/lua/abyss_game_ui_view.lua": {
    "path": "src/lua/abyss_game_ui_view.lua",
    "beforeSha256": "e01ca4da8d838b9ea38ef7663a097785e208c97fbac3f1d1df103c618d09957d",
    "afterSha256": "88ac8ce75d53b444f521313ab25dbdf02e46d382424f45f007f179c26fa3dc3c",
    "beforeBlob": "fa1578151eb2565798e81843bc30681e42bcbb70",
    "afterBlob": "ee4356a52b2c84586ee79111bb05c606f5a60a53",
    "hunks": [
      {
        "at": 12,
        "before": "local Acts=require('abyss_acts')\nlocal NativePages=require('abyss_native_pages')",
        "after": "local Acts=require('abyss_acts')\nlocal ChapterBattleScene=require('abyss_chapter_battle_scene')\nlocal NativePages=require('abyss_native_pages')"
      },
      {
        "at": 573,
        "before": "\nfunction M.syncOfficialBattleScene(root,self)\n    local lastBackdropVisible,lastBackdrop\n    return function(run)\n            local scenes=root:GetChild('officialBattleBackdrop')\n            if not scenes then return end\n            local visible=self.mode=='battle'\n            if visible~=lastBackdropVisible then scenes:SetVisible(visible);lastBackdropVisible=visible end",
        "after": "\nfunction M.syncOfficialBattleScene(root,self,platform)\n    local lastBackdropVisible,lastBackdrop\n    local battle=root:GetChild('battlePanel')\n    local chapterScene=ChapterBattleScene.bind(battle and battle:GetChild('chapterBattleScene'),platform)\n    return function(run)\n            local visible=self.mode=='battle'\n            if chapterScene then\n                if visible then\n                    local floor=math.max(1,run and run.floor or 1)\n                    local chapter=Acts.forFloor(floor)\n                    chapterScene(math.min(2,chapter))\n                end\n                return\n            end\n            local scenes=root:GetChild('officialBattleBackdrop')\n            if not scenes then return end\n            if visible~=lastBackdropVisible then scenes:SetVisible(visible);lastBackdropVisible=visible end"
      }
    ]
  },
  "src/lua/abyss_feedback.lua": {
    "path": "src/lua/abyss_feedback.lua",
    "beforeSha256": "775ba2b066a1aeae9e23863d5283f0482253110deae770dc73944ec126cac4aa",
    "afterSha256": "2afced1fee0980b92d72f9e271413f6396a8a267741c2f702727f051710973a6",
    "beforeBlob": "4c66dde58f821bdfda70b95ebdb7eb8f9f1b0fdf",
    "afterBlob": "3d9be32fd2eb04e4b3d0e3ec468c07b2eddfed0f",
    "hunks": [
      {
        "at": 167,
        "before": "end\n\nfunction M.new(stage, platform, present, complete, pileLayout)\n    local self = { busy = false, fastMode = false, effects = {}, deaths = {}, dying = {}, poses = {}, escaping = {}, escaped = {}, slotOwners = {}, tints = {} }\n    local overlay = stage:GetChild(\"feedback\")",
        "after": "end\n\nlocal function unchangedGroundY(_,_,_,y) return y end\nfunction M.new(stage, platform, present, complete, pileLayout, poseGroundShadow)\n    local self = { busy = false, fastMode = false, effects = {}, deaths = {}, dying = {}, poses = {}, escaping = {}, escaped = {}, slotOwners = {}, tints = {} }\n    local overlay = stage:GetChild(\"feedback\")"
      },
      {
        "at": 192,
        "before": "            local box=surfaces:find(id)\n            for _,entry in ipairs(self.shadow.enemies)do if entry.id==id then\n                local x,_,_,_,y=EnemyView.position(0,0,entry)\n                return entry,box,x,y\n            end end",
        "after": "            local box=surfaces:find(id)\n            for _,entry in ipairs(self.shadow.enemies)do if entry.id==id then\n                local x,_,_,_,y=EnemyView.position(0,0,entry,platform.nativeMonsterArtEnabled)\n                return entry,box,x,y\n            end end"
      },
      {
        "at": 198,
        "before": "        local rows=self.busy and self.enemyRows or EnemyView.slots(self.shadow,self)\n        for slot,entry in ipairs(rows)do if entry.id==id then\n            local x,_,_,_,y=EnemyView.position(#rows,slot,entry.actor)\n            return entry.actor,stage:GetChild('enemy'..slot),x,y\n        end end\n        for _,a in ipairs(self.shadow.enemies)do if a.id==id then return a end end\n    end\n    local painter = {state=self, actor=actor, platform=platform, surfaces=surfaces}\n    local function banner(text, danger)\n        local label = overlay:GetChild(\"banner\")",
        "after": "        local rows=self.busy and self.enemyRows or EnemyView.slots(self.shadow,self)\n        for slot,entry in ipairs(rows)do if entry.id==id then\n            local x,_,_,_,y=EnemyView.position(#rows,slot,entry.actor,platform.nativeMonsterArtEnabled)\n            return entry.actor,stage:GetChild('enemy'..slot),x,y\n        end end\n        for _,a in ipairs(self.shadow.enemies)do if a.id==id then return a end end\n    end\n    local painter = {state=self, actor=actor, platform=platform, surfaces=surfaces,\n        poseGroundShadow=poseGroundShadow or unchangedGroundY}\n    local function banner(text, danger)\n        local label = overlay:GetChild(\"banner\")"
      }
    ]
  },
  "src/lua/abyss_battle_ui.lua": {
    "path": "src/lua/abyss_battle_ui.lua",
    "beforeSha256": "e6dd6a73895940be4c74125299a56a48e4971b4ccb33a4b3da02407fad0f0cda",
    "afterSha256": "a102233efb9d5211db2fd6c22e1618d5a37f562f8a2918edba82143380f9be09",
    "beforeBlob": "19f7bf259b328a23c58d1c8aae9e95cd4d4ff4e6",
    "afterBlob": "96f8e67f0cc326051846a33bdd4e12e762eee959",
    "hunks": [
      {
        "at": 163,
        "before": "        cleanup(function()if host.monsterPowers then host.monsterPowers:release(box,engineDestroyed)end end)\n        cleanup(function()if host.monsterIntentParticles then host.monsterIntentParticles:release(box,engineDestroyed)end end)",
        "after": "        cleanup(function()if host.monsterPowers then host.monsterPowers:release(box,engineDestroyed)end end)\n        host.retireGroundShadow(box)\n        cleanup(function()if host.monsterIntentParticles then host.monsterIntentParticles:release(box,engineDestroyed)end end)"
      },
      {
        "at": 191,
        "before": "    end\n    host.unit = UnitView.new(services.picture, services.tint, services.ink, statusKind)\n    host.lines = InfoContent.lines",
        "after": "    end\n    local poseGroundShadow\n    host.unit,poseGroundShadow,host.retireGroundShadow = UnitView.new(services.picture, services.tint, services.ink, statusKind)\n    host.lines = InfoContent.lines"
      },
      {
        "at": 241,
        "before": "        if not refreshed then error(why)end\n    end, pileLayout)\n    -- An open detail panel owns the next pointer sequence: its Down closes the panel and",
        "after": "        if not refreshed then error(why)end\n    end,pileLayout,poseGroundShadow)\n    -- An open detail panel owns the next pointer sequence: its Down closes the panel and"
      }
    ]
  },
  "tests/helpers/release-bootstrap-ci-source.mjs": {
    "path": "tests/helpers/release-bootstrap-ci-source.mjs",
    "beforeSha256": "21ff83215e06ee5daf7da35e9d23dd121e6b9ee1d23eb53bfa8efb149fbfe275",
    "afterSha256": "660b4db5a1dbbcebbb663115debfe4e5c6ce631319d846ba585fa280a3bb6775",
    "beforeBlob": "1008911cc9aabe39a191b5ff07fd5745d2084bb3",
    "afterBlob": "1821006ecd262bcd4cac2d5f1832f9ee2a0d79b6",
    "hunks": [
      {
        "at": 138,
        "before": "}\nexport function assertReleaseBootstrapCiCurrent(read=readFileSync){\n assertIntegrationSuccessorsCurrent(read);\n for(const [path,row]of Object.entries(packet.files))\n  assert.equal(hash(norm(historicalSource(path,read(path,'utf8')))),row.current.sha256,'fresh complete integration source: bootstrap '+path);\n for(const [path,sha]of Object.entries(packet.immutableArchives))\n  assert.equal(hash(read(path)),sha,'retained complete immutable bootstrap predecessor: '+path);\n}\n",
        "after": "}\nexport function assertReleaseBootstrapCiCurrent(read=readFileSync){\n read=assertIntegrationSuccessorsCurrent(read);\n for(const [path,row]of Object.entries(packet.files))\n  assert.equal(hash(norm(historicalSource(path,read(path,'utf8')))),row.current.sha256,'fresh complete integration source: bootstrap '+path);\n for(const [path,sha]of Object.entries(packet.immutableArchives))\n  assert.equal(hash(read(path)),sha,'retained complete immutable bootstrap predecessor: '+path);\n return read;\n}\n"
      }
    ]
  },
  "src/lua/abyss_actor_motion.lua": {
    "path": "src/lua/abyss_actor_motion.lua",
    "beforeSha256": "d419baaa74debc99fb491d99fbc027703df52d895bcdc449f299f926a5e1450a",
    "afterSha256": "ca9d951710fc8d71cb5ae697ea8af6ede8e9525bf2b8ed57beab38dbd710fcab",
    "beforeBlob": "b391dc7cc6b7359852249aeb865a818d562c5d1e",
    "afterBlob": "af09f7d4cbb93681ab5ba6c58e2c459af7e571a4",
    "hunks": [
      {
        "at": 0,
        "before": "-- Presentation samples only. Existing feedback poses still own actions and death.\nlocal M = {}\nlocal TAU = math.pi * 2",
        "after": "-- Presentation samples only. Existing feedback poses still own actions and death.\nlocal ByrdTrial = require('abyss_byrd_ground_trial')\nlocal M = {}\nlocal TAU = math.pi * 2"
      },
      {
        "at": 36,
        "before": "-- Stable actor IDs replace the source's random starting animation track time.\n-- Four scalar returns avoid one transform allocation per actor per frame.\nfunction M.idle(actor,id,clock,state,config)\n    if state~='idle' then return 0,0,1,1 end\n    local definition=actor.definitionId or id\n    local wave=math.sin(clock/config.period*TAU+phase(id,definition))",
        "after": "-- Stable actor IDs replace the source's random starting animation track time.\n-- Four scalar returns avoid one transform allocation per actor per frame.\nfunction M.idle(actor,id,clock,state,config,nativeArtEnabled)\n    if state~='idle' or nativeArtEnabled~=false and ByrdTrial.isGrounded(actor) then return 0,0,1,1 end\n    local definition=actor.definitionId or id\n    local wave=math.sin(clock/config.period*TAU+phase(id,definition))"
      }
    ]
  },
  "src/lua/abyss_battle_render_actors.lua": {
    "path": "src/lua/abyss_battle_render_actors.lua",
    "beforeSha256": "0619545a1cda90b460d782b155a3969e188dd4abcbf4c390ca55be30293c412b",
    "afterSha256": "d2dba9b99c4b8335773bd3316e92bfc23d614ae0a0f338b0327c2350f206e8ad",
    "beforeBlob": "8111ad342cd6e3ac747628dc85b2ac48dbdf0fa2",
    "afterBlob": "1f538061f76a5f0ec6621463ae26c1dce3ba5f31",
    "hunks": [
      {
        "at": 110,
        "before": "    local intentTexts=setmetatable({},{__mode='k'})\n    local potionCaptions=setmetatable({},{__mode='k'})\n    local function intentPicture(control,id)\n        local image=type(id)=='table' and id.id or id",
        "after": "    local intentTexts=setmetatable({},{__mode='k'})\n    local potionCaptions=setmetatable({},{__mode='k'})\n    local function enemyGeometry(actor)\n        return EnemyView.geometry(actor,host.platform.nativeMonsterArtEnabled)\n    end\n    local function intentPicture(control,id)\n        local image=type(id)=='table' and id.id or id"
      },
      {
        "at": 240,
        "before": "        local loss = aim.losses and aim.losses[entry.index]\n        if aim.valid and not aim.target and loss and loss.loss > 0 then selected = true end\n        local geometry=EnemyView.geometry(enemy)\n        host.unit(box, enemy, portrait, enemyPortraitIcon(enemy), width, selected,step,geometry)\n        host.monsterPowers:render(box,entry.controlSlot,enemy,geometry)",
        "after": "        local loss = aim.losses and aim.losses[entry.index]\n        if aim.valid and not aim.target and loss and loss.loss > 0 then selected = true end\n        local geometry=enemyGeometry(enemy)\n        host.unit(box, enemy, portrait, enemyPortraitIcon(enemy), width, selected,step,geometry)\n        host.monsterPowers:render(box,entry.controlSlot,enemy,geometry)"
      },
      {
        "at": 265,
        "before": "            if box then\n            local face=enemyIntentFace({battle=battle,enemyPlayback=owner.feedback.busy},actor,entry.index)\n            local g=EnemyView.geometry(actor)\n            local dying,escaping=owner.feedback.dying[entry.id],owner.feedback.escaping[entry.id]\n            host.monsterIntentParticles:update(entry.id,dt,face,g,dying,escaping)",
        "after": "            if box then\n            local face=enemyIntentFace({battle=battle,enemyPlayback=owner.feedback.busy},actor,entry.index)\n            local g=enemyGeometry(actor)\n            local dying,escaping=owner.feedback.dying[entry.id],owner.feedback.escaping[entry.id]\n            host.monsterIntentParticles:update(entry.id,dt,face,g,dying,escaping)"
      },
      {
        "at": 295,
        "before": "            local state=ownership.nameStates[id] or {timer=0,alpha=0}\n            ownership.nameStates[id]=state\n            local g=EnemyView.geometry(actor)\n            local hovered=x and y and math.abs(x-g.hitX)<g.hitWidth/2 and math.abs(y-g.hitY)<g.hitHeight/2\n            local offset",
        "after": "            local state=ownership.nameStates[id] or {timer=0,alpha=0}\n            ownership.nameStates[id]=state\n            local g=enemyGeometry(actor)\n            local hovered=x and y and math.abs(x-g.hitX)<g.hitWidth/2 and math.abs(y-g.hitY)<g.hitHeight/2\n            local offset"
      }
    ]
  },
  "src/lua/abyss_battle_targeting.lua": {
    "path": "src/lua/abyss_battle_targeting.lua",
    "beforeSha256": "50922018fca25cbaf2ea7645b4ca9657b667c1f5e446edd52dd33b5103ae099f",
    "afterSha256": "579d81c813b29f5771e4503109447125956000f3f88098f0d0c5c2e0dae9a8da",
    "beforeBlob": "95c986a631bdf9cdb58073f150852c50f0ff1c8a",
    "afterBlob": "defcd6904d0e1fbe15cfa6b12d5573f966e5d622",
    "hunks": [
      {
        "at": 7,
        "before": "local L = Theme.layout\n-- Explicit ports preserve the approved implementation without a shared constructor closure.\nfunction M.install(owner, _ownership, _host, dependencies)\n    local D = L.cardDrag\n    local function enemySlot(count, i, enemy)\n        return EnemyView.position(count, i, enemy)\n    end\n    local function enemyPosition(battle,index)",
        "after": "local L = Theme.layout\n-- Explicit ports preserve the approved implementation without a shared constructor closure.\nfunction M.install(owner, _ownership, host, dependencies)\n    local D = L.cardDrag\n    local function nativeMonsterArtEnabled()\n        return not host.platform or host.platform.nativeMonsterArtEnabled~=false\n    end\n    local function enemySlot(count, i, enemy)\n        return EnemyView.position(count, i, enemy, nativeMonsterArtEnabled())\n    end\n    local function enemyPosition(battle,index)"
      },
      {
        "at": 43,
        "before": "        for _, entry in ipairs(rows) do\n            local enemy = entry.actor\n            local geometry=EnemyView.geometry(enemy)\n            if math.abs(g.x-geometry.hitX)<=geometry.hitWidth/2\n                and math.abs(g.y-geometry.hitY)<=geometry.hitHeight/2",
        "after": "        for _, entry in ipairs(rows) do\n            local enemy = entry.actor\n            local geometry=EnemyView.geometry(enemy,nativeMonsterArtEnabled())\n            if math.abs(g.x-geometry.hitX)<=geometry.hitWidth/2\n                and math.abs(g.y-geometry.hitY)<=geometry.hitHeight/2"
      },
      {
        "at": 60,
        "before": "        local rows=EnemyView.slots(aim.battle,owner.feedback)\n        for _,entry in ipairs(rows)do\n            local geometry=EnemyView.geometry(entry.actor)\n            if Actors.isActive(entry.actor) and math.abs(aim.x-geometry.hitX)<=geometry.hitWidth/2\n                and math.abs(aim.y-geometry.hitY)<=geometry.hitHeight/2 then",
        "after": "        local rows=EnemyView.slots(aim.battle,owner.feedback)\n        for _,entry in ipairs(rows)do\n            local geometry=EnemyView.geometry(entry.actor,nativeMonsterArtEnabled())\n            if Actors.isActive(entry.actor) and math.abs(aim.x-geometry.hitX)<=geometry.hitWidth/2\n                and math.abs(aim.y-geometry.hitY)<=geometry.hitHeight/2 then"
      }
    ]
  },
  "src/lua/abyss_monster_art.lua": {
    "path": "src/lua/abyss_monster_art.lua",
    "beforeSha256": "419eef3baaf65dff5f6f26a4bd860db0326c97b4c49b8261523b8d00025d80da",
    "afterSha256": "6098fca7fde600181cecf6d669ce59e89dd13d1e0a04663a674dd23fdf0379fd",
    "beforeBlob": "df859f39af246434e773b3fbf76c1bf6b98712b5",
    "afterBlob": "9916886ac852607ce544b74f5fe36509639e9e30",
    "hunks": [
      {
        "at": 0,
        "before": "-- Each drawable actor owns its source-art surface independently.\nlocal CardDisplay=require('abyss_card_display')\nlocal M={}\nlocal bindings=setmetatable({},{__mode='k'})",
        "after": "-- Each drawable actor owns its source-art surface independently.\nlocal CardDisplay=require('abyss_card_display')\nlocal ByrdTrial=require('abyss_byrd_ground_trial')\nlocal M={}\nlocal bindings=setmetatable({},{__mode='k'})"
      },
      {
        "at": 25,
        "before": " local state=bindings[box]\n if not state then return end\n state.poseState={x,y,sx,sy,colour,alpha}\n state.root:SetAnchoredPosition(state.x+x-state.origin[1],state.y+y-state.origin[2])",
        "after": " local state=bindings[box]\n if not state then return end\n local previous=state.poseState\n if state.asset.grounded and previous and previous[1]==x and previous[2]==y\n  and previous[3]==sx and previous[4]==sy and previous[6]==alpha then\n  previous[5]=colour\n  tint(state,colour,alpha)\n  return\n end\n state.poseState={x,y,sx,sy,colour,alpha}\n state.root:SetAnchoredPosition(state.x+x-state.origin[1],state.y+y-state.origin[2])"
      },
      {
        "at": 38,
        "before": " tint(state,colour,alpha)\nend\nlocal function assetFor(data,definitionId)\n local identity=data.bindings and data.bindings[definitionId]\n local legacy=data.asset\n return data.assets and data.assets[identity] or (legacy and definitionId==legacy.enemyId and legacy)\nend\nlocal function newPool(stage,platform,data,poolIndex,actorBox)\n local overlay=not actorBox and optionalChild(stage,'topBar')\n local view={root=actorBox and optionalChild(actorBox,'monsterArt') or overlay and optionalChild(overlay,poolIndex and poolIndex>1 and 'monsterArt'..poolIndex or 'monsterArt'),platform=platform,data=data,origin=actorBox and {0,0} or data.hostOrigin or {0,0}}\n view.host={GetChild=function(_,name)return view.root and view.root:GetChild(name=='artSamples' and 'monsterSamples' or name)end}\n function view:onEngineDestroy()\n  self.engineDestroyed=true\n  if self.box then bindings[self.box]=nil;owners[self.box]=nil end\n  self.box,self.asset,self.tone,self.actorId,self.selectedAsset,self.poseState=nil,nil,nil,nil,nil,nil\n  self.root=nil\n end\n function view:clear()",
        "after": " tint(state,colour,alpha)\nend\nlocal function assetFor(data,actor)\n local definitionId=actor.definitionId\n local identity=data.bindings and data.bindings[definitionId]\n local legacy=data.asset\n local asset=data.assets and data.assets[identity] or (legacy and definitionId==legacy.enemyId and legacy)\n if asset and ByrdTrial.isGrounded(actor,data)then return ByrdTrial.art(asset)end\n return asset\nend\nlocal function newPool(stage,platform,data,poolIndex,actorBox)\n local overlay=not actorBox and optionalChild(stage,'topBar')\n local view={root=actorBox and optionalChild(actorBox,'monsterArt') or overlay and optionalChild(overlay,poolIndex and poolIndex>1 and 'monsterArt'..poolIndex or 'monsterArt'),platform=platform,data=data,origin=actorBox and {0,0} or data.hostOrigin or {0,0}}\n view.host={GetChild=function(_,name)\n  if name=='artSamples' and view.samples then return view.samples end\n  return view.root and view.root:GetChild(name=='artSamples' and 'monsterSamples' or name)\n end}\n function view:onEngineDestroy()\n  self.engineDestroyed=true\n  if self.box then bindings[self.box]=nil;owners[self.box]=nil end\n  self.box,self.asset,self.tone,self.actorId,self.selectedAsset,self.poseState=nil,nil,nil,nil,nil,nil\n  self.root,self.samples,self.sampleScale=nil,nil,nil\n end\n function view:clear()"
      },
      {
        "at": 69,
        "before": "  self.root:SetVisible(false)\n  self.box,self.asset,self.tone,self.actorId,self.selectedAsset,self.poseState=nil,nil,nil,nil,nil,nil\n end\n function view:select(rows)",
        "after": "  self.root:SetVisible(false)\n  self.box,self.asset,self.tone,self.actorId,self.selectedAsset,self.poseState=nil,nil,nil,nil,nil,nil\n  self.samples,self.sampleScale=nil,nil\n end\n function view:select(rows)"
      },
      {
        "at": 76,
        "before": "  if self.root and self.data.enabled and self.platform.nativeMonsterArtEnabled~=false then\n   for slot,entry in ipairs(rows)do\n    local asset=assetFor(self.data,entry.actor.definitionId)\n    if asset and (not poolIndex or slot==poolIndex)then wanted,wantedId,wantedAsset=actorBox or stage:GetChild('enemy'..slot),entry.id,asset;break end\n   end\n  end\n  if wanted~=self.box or wantedId~=self.actorId or wantedAsset~=self.selectedAsset then self:clear();self.box,self.actorId=wanted,wantedId end\n  self.selectedAsset=wantedAsset\n  if wanted then owners[wanted]=self end",
        "after": "  if self.root and self.data.enabled and self.platform.nativeMonsterArtEnabled~=false then\n   for slot,entry in ipairs(rows)do\n    local asset=assetFor(self.data,entry.actor)\n    if asset and (not poolIndex or slot==poolIndex)then wanted,wantedId,wantedAsset=actorBox or stage:GetChild('enemy'..slot),entry.id,asset;break end\n   end\n  end\n  if wanted~=self.box or wantedId~=self.actorId or wantedAsset~=self.selectedAsset then\n   self:clear()\n   self.box,self.actorId=wanted,wantedId\n   -- Native child lookups can return fresh proxies. Use the existing pool as\n   -- one stable owner for each Byrd variant until retirement or replacement.\n   if wantedAsset and wantedAsset.enemyId=='byrd' and self.data.status=='refined-release'then\n    self.samples=assert(optionalChild(self.root,'monsterSamples'),'missing Byrd art pool')\n   end\n  end\n  self.selectedAsset=wantedAsset\n  if wanted then owners[wanted]=self end"
      },
      {
        "at": 100,
        "before": "  if not ok then bindings[box]=nil;self.root:SetVisible(false);return false end\n  self.x,self.y=actorBox and 0 or x,actorBox and 0 or y\n  local pool=self.root:GetChild('monsterSamples')\n  local scale=portrait/math.max(self.data.canvas[1],self.data.canvas[2])\n  pool:SetLocalScale(scale,scale,1)\n  bindings[box]=self\n  local pose=self.poseState",
        "after": "  if not ok then bindings[box]=nil;self.root:SetVisible(false);return false end\n  self.x,self.y=actorBox and 0 or x,actorBox and 0 or y\n  local pool=self.samples or self.root:GetChild('monsterSamples')\n  local scale=portrait/math.max(self.data.canvas[1],self.data.canvas[2])\n  if not self.samples or self.sampleScale~=scale then pool:SetLocalScale(scale,scale,1);self.sampleScale=scale end\n  bindings[box]=self\n  local pose=self.poseState"
      }
    ]
  }
};

// The current hand layout and enemy floor contacts enter after the composed chapter source.
const responsiveHandProjections = {
  "src/lua/abyss_monster_art.lua": {
    "path": "src/lua/abyss_monster_art.lua",
    "beforeSha256": "6098fca7fde600181cecf6d669ce59e89dd13d1e0a04663a674dd23fdf0379fd",
    "afterSha256": "7d5ff55a116dbb08f769cb6e5cc302ae653ade8be6e24f5557a88566f9506ff3",
    "beforeBlob": "9916886ac852607ce544b74f5fe36509639e9e30",
    "afterBlob": "9223e45bcd58c37b861c38d2d5421b1a35151010",
    "hunks": [
      {
        "at": 46,
        "before": " return asset\nend\nlocal function newPool(stage,platform,data,poolIndex,actorBox)\n local overlay=not actorBox and optionalChild(stage,'topBar')",
        "after": " return asset\nend\nlocal function retainByrdSamplePool(view,asset)\n if not asset or asset.enemyId~='byrd' or view.data.status~='refined-release'then return end\n -- Native child lookups can return fresh proxies. Keep one stable sample\n -- owner for each Byrd variant until retirement or replacement.\n view.samples=assert(optionalChild(view.root,'monsterSamples'),'missing Byrd art pool')\nend\nlocal function newPool(stage,platform,data,poolIndex,actorBox)\n local overlay=not actorBox and optionalChild(stage,'topBar')"
      },
      {
        "at": 89,
        "before": "   self:clear()\n   self.box,self.actorId=wanted,wantedId\n   -- Native child lookups can return fresh proxies. Use the existing pool as\n   -- one stable owner for each Byrd variant until retirement or replacement.\n   if wantedAsset and wantedAsset.enemyId=='byrd' and self.data.status=='refined-release'then\n    self.samples=assert(optionalChild(self.root,'monsterSamples'),'missing Byrd art pool')\n   end\n  end\n  self.selectedAsset=wantedAsset",
        "after": "   self:clear()\n   self.box,self.actorId=wanted,wantedId\n   retainByrdSamplePool(self,wantedAsset)\n  end\n  self.selectedAsset=wantedAsset"
      }
    ]
  },
  "src/lua/abyss_battle_unit_view.lua": {
    "path": "src/lua/abyss_battle_unit_view.lua",
    "beforeSha256": "1c5bb2540e6df1a4ca5e6efdc7369eaf5d3d9dad3d80d059f80cd9c44a126384",
    "afterSha256": "bf48b02a84d57ea209142d0fcd4b5043b8f0a305c15cd9d68a35931ea74b7989",
    "beforeBlob": "77e3f90218476d0fda2e1b6a99e18b045578b18e",
    "afterBlob": "c1b540475f4c33956dd609ffb240b1aa089e307e",
    "hunks": [
      {
        "at": 7,
        "before": "\nlocal function paintShadow(owner,x,sx,alpha)\n    alpha=math.floor(alpha*125+.5)\n    for i,foot in ipairs(owner.feet) do\n        local px=math.floor((x+foot[1]*owner.scale*sx)*2+.5)/2\n        if owner.x[i]~=px then\n            owner.controls[i]:SetAnchoredPosition(px,owner.contactY)",
        "after": "\nlocal function paintShadow(owner,x,sx,alpha)\n    alpha=math.floor(alpha*owner.opacity+.5)\n    for i,center in ipairs(owner.centers) do\n        local px=math.floor((x+center*sx)*2+.5)/2\n        if owner.x[i]~=px then\n            owner.controls[i]:SetAnchoredPosition(px,owner.contactY)"
      },
      {
        "at": 32,
        "before": "end\n\nlocal function configureShadow(box,owner,feet,scale,y,picture,tint,offsetY)\n    local contactY=y+(offsetY or 0)-1\n    if owner and owner.feet==feet and owner.scale==scale and owner.y==y and owner.contactY==contactY then return owner end\n    owner={feet=feet,scale=scale,y=y,contactY=contactY,x={},tint=tint,controls={},atRest=true}\n    for i,name in ipairs(shadowSlots) do\n        local control=box:GetChild(name)\n        local foot=feet[i]\n        if foot then\n            picture(control,Theme.image.discSoft)\n            local width=foot[2]*scale\n            control:SetSizeDelta(width+math.min(8,width*.3),math.min(11,(foot[3] or 7)*scale))\n            owner.controls[i]=control\n        end",
        "after": "end\n\nlocal function footprintShape(foot,feet,scale,spread)\n    local center,width=foot[1]*scale,foot[2]*scale\n    if not spread then\n        return center,width+math.min(8,width*.3),math.min(11,(foot[3] or 7)*scale)\n    end\n    if #feet==1 then\n        -- Give wide bodies with one weight-bearing sole a continuous floor contact.\n        return center*.78,math.max(width*1.38,52*scale),math.min(17,9*scale)\n    end\n    -- Two pads shade toward the weight between the feet. Keep the sole line above them.\n    local span=math.abs(feet[1][1]-feet[2][1])*scale\n    local middle=(feet[1][1]+feet[2][1])*scale/2\n    return middle+(center-middle)*.88,math.max(width*1.5,span*.83),math.min(14,8*scale)\nend\n\nlocal function configureShadow(box,owner,feet,scale,y,picture,tint,offsetY,spread)\n    local contactY=y+(offsetY or 0)-1\n    if owner and owner.feet==feet and owner.scale==scale and owner.y==y and owner.contactY==contactY then return owner end\n    owner={feet=feet,scale=scale,y=y,contactY=contactY,x={},tint=tint,controls={},atRest=true,\n        centers={},opacity=spread and (#feet==1 and 147 or 130) or 125}\n    for i,name in ipairs(shadowSlots) do\n        local control=box:GetChild(name)\n        local foot=feet[i]\n        if foot then\n            -- Native discSoft has an opaque face. The existing glow really feathers into the floor.\n            picture(control,spread and Theme.image.glow or Theme.image.discSoft)\n            local center,width,height=footprintShape(foot,feet,scale,spread)\n            owner.centers[i]=center\n            control:SetSizeDelta(width,height)\n            owner.controls[i]=control\n        end"
      },
      {
        "at": 72,
        "before": "    if source and source.footprints then\n        owners.enemies[box]=configureShadow(box,owners.enemies[box],source.footprints,\n            portrait/L.enemyRow.groundContact.artSize,source.groundY,picture,tint)\n        return\n    end",
        "after": "    if source and source.footprints then\n        owners.enemies[box]=configureShadow(box,owners.enemies[box],source.footprints,\n            portrait/L.enemyRow.groundContact.artSize,source.groundY,picture,tint,nil,not source.compactTarget)\n        return\n    end"
      }
    ]
  },
  "src/lua/abyss_battle_card_gestures.lua": {
    "path": "src/lua/abyss_battle_card_gestures.lua",
    "beforeSha256": "6a612f510bf24a4d8a31d69e05e095c265df71273be9d725ead43b7744c18a52",
    "afterSha256": "aae1eba631e297d6cc753f1e8cd30d6623843cfe044f13c1b7d27cc1d25fa158",
    "beforeBlob": "a7857ff11b7184738e4470b2dfd4f9dd376c70ac",
    "afterBlob": "2bec30e5609a77bb81e16d241805e337d77e4f4f",
    "hunks": [
      {
        "at": 187,
        "before": "    -- 不进入出牌拖拽；只有相对当前牌向上主导的位移才提起该牌。\n    local function nearestSlot(count, x)\n        local w = L.card.size[1]\n        local spacing = count <= 1 and 0 or math.max(L.hand.spacingMin, math.min(L.hand.spacingMax, (L.hand.maxWidth - w) / (count - 1)))\n        if spacing == 0 then return 1 end\n        local index = math.floor(x/spacing + (count-1)/2 + 0.5)",
        "after": "    -- 不进入出牌拖拽；只有相对当前牌向上主导的位移才提起该牌。\n    local function nearestSlot(count, x)\n        local spacing = Viewport.handSpacing(count, owner.handWidthExtra)\n        if spacing == 0 then return 1 end\n        local index = math.floor(x/spacing + (count-1)/2 + 0.5)"
      }
    ]
  },
  "src/lua/abyss_battle_card_layout.lua": {
    "path": "src/lua/abyss_battle_card_layout.lua",
    "beforeSha256": "ab2f0b1916a740efb2b7c1e89ede72a24e0ec45756e95cee27b2a5f2713595a2",
    "afterSha256": "e4cb0e92c35a637f8fe978837650848acb177e7b03ca55944bfa56bfd8535fc0",
    "beforeBlob": "4aed8bb19035a2e026dd62b438f8a75bf399b45d",
    "afterBlob": "90506c2db973983eb2ad0e583b37faa2a3554afb",
    "hunks": [
      {
        "at": 1,
        "before": "local Run = require(\"abyss_run\")\nlocal Theme = require(\"abyss_theme\")\nlocal M = {}\nlocal L = Theme.layout",
        "after": "local Run = require(\"abyss_run\")\nlocal Theme = require(\"abyss_theme\")\nlocal Viewport = require('abyss_viewport')\nlocal Actors = require('abyss_actor')\nlocal EnemyView = require('abyss_battle_enemy_view')\nlocal M = {}\nlocal L = Theme.layout"
      },
      {
        "at": 9,
        "before": "function M.install(owner, _ownership, host, _dependencies)\n    local R = L.rewardPick\n    local function placeHandHit(box, w, h, restAngle, baseY, y, scale, laneWidth)\n        local r = restAngle * math.pi / 180\n        local c,s = math.abs(math.cos(r)),math.abs(math.sin(r))\n        local restH,restW = (h*c+w*s)/2,(w*c+h*s)/2\n        local hotH = h*Theme.motion.hoverScale/2\n        local hotY = math.max(baseY+Theme.motion.hoverLift,-Theme.canvas.base[2]/2+Theme.canvas.safe.y+hotH)\n        local low = math.min(baseY-restH,hotY-hotH)\n        local high = math.max(baseY+restH,hotY+hotH)\n        local dy,a = (low+high)/2-y,box.localRotationZ*math.pi/180\n        local hit = box:GetChild('hit')\n        -- Inverse the card transform: one world-space hit rectangle covers both poses.\n        hit:SetAnchoredPosition(math.sin(a)*dy/scale,math.cos(a)*dy/scale)\n        local width=math.max(restW*2,w*Theme.motion.hoverScale)\n        -- Adjacent hand centres own disjoint horizontal lanes. Keeping a full\n        -- hover-width receiver here lets a later sibling steal the initial press.\n        hit:SetSizeDelta(math.min(width,laneWidth or width)/scale,(high-low)/scale)\n        hit:SetLocalScale(1,1,1)\n        hit.localRotationZ = -box.localRotationZ",
        "after": "function M.install(owner, _ownership, host, _dependencies)\n    local R = L.rewardPick\n    local health\n    local function prepareHandFocus(battle)\n        health = nil\n        if not battle or (owner.handWidthExtra or 0) <= 0 or Theme.presentationProfile ~= 'official-assets-first' then return end\n        health = {}\n        local platform = host and host.platform\n        for _, enemy in ipairs(battle.enemies) do\n            if Actors.isActive(enemy) then\n                local g = EnemyView.geometry(enemy, platform and platform.nativeMonsterArtEnabled)\n                local x = g.x + g.healthX\n                local halfWidth = (g.healthWidth or g.hitWidth) / 2 + Theme.space.border\n                -- Protect both the visible bar border and the native 1.2em health text.\n                local bottom = math.min(g.healthY - g.healthHeight / 2 - Theme.space.border,\n                    g.healthTextY - Theme.font.body * .6)\n                health[#health + 1] = {left = x - halfWidth, right = x + halfWidth,\n                    bottom = g.y + bottom - Theme.space.xs}\n            end\n        end\n    end\n    local function placeHandHit(box, w, h, restAngle, point, scale)\n        local r = restAngle * math.pi / 180\n        local c,s = math.abs(math.cos(r)),math.abs(math.sin(r))\n        local restH,restW = (h*c+w*s)/2,(w*c+h*s)/2\n        local hotH = h * point.focusScale / 2\n        local low = math.min(point.baseY-restH,point.focusY-hotH)\n        local high = math.max(point.baseY+restH,point.focusY+hotH)\n        local dy,a = (low+high)/2-point[2],box.localRotationZ*math.pi/180\n        local hit = box:GetChild('hit')\n        -- Inverse the card transform: one world-space hit rectangle covers both poses.\n        hit:SetAnchoredPosition(math.sin(a)*dy/scale,math.cos(a)*dy/scale)\n        local width=math.max(restW*2,w*point.focusScale)\n        -- Adjacent hand centres own disjoint horizontal lanes. Keeping a full\n        -- hover-width receiver here lets a later sibling steal the initial press.\n        hit:SetSizeDelta(math.min(width,point.hitWidth or width)/scale,(high-low)/scale)\n        hit:SetLocalScale(1,1,1)\n        hit.localRotationZ = -box.localRotationZ"
      },
      {
        "at": 48,
        "before": "    local function placeCard(box, count, index, selected, measureOnly)\n        local w, h = L.card.size[1], L.card.size[2]\n        local spacing = count <= 1 and 0 or math.max(L.hand.spacingMin, math.min(L.hand.spacingMax, (L.hand.maxWidth - w) / (count - 1)))\n        local distance = index - (count - 1) / 2\n        local angle = -distance * L.hand.arcDegrees\n        local radians = math.abs(angle) * math.pi / 180\n        local halfHeight = (h * math.cos(radians) + w * math.sin(radians)) / 2\n        local floor = -Theme.canvas.base[2] / 2 + Theme.canvas.safe.y + halfHeight - (L.hand.overhang or 0)\n        local baseY = math.max(floor,L.hand.y-math.abs(distance)*L.hand.arcDrop)\n        local hotY = math.max(baseY+Theme.motion.hoverLift,-Theme.canvas.base[2]/2+Theme.canvas.safe.y+h*Theme.motion.hoverScale/2)\n        local x, y = distance * spacing, selected and hotY or baseY\n        local laneWidth=count>1 and spacing or nil\n        local point={x, y, baseY=baseY,hitWidth=laneWidth}\n        if measureOnly then return point end\n        box:SetAnchoredPosition(x, y)\n        local scale = selected and Theme.motion.hoverScale or 1\n        box:SetLocalScale(scale, scale, 1)\n        box.localRotationZ = selected and 0 or angle\n        placeHandHit(box,w,h,angle,baseY,y,scale,laneWidth)\n        box:GetChild(\"glow\"):SetVisible(selected)\n        box:SetAsLastSibling()",
        "after": "    local function placeCard(box, count, index, selected, measureOnly)\n        local w, h = L.card.size[1], L.card.size[2]\n        local x, baseY, angle, spacing = Viewport.handSlot(count, index, owner.handWidthExtra)\n        local focusY,focusScale,ceiling = Viewport.handFocus(baseY, x, health)\n        local y = selected and focusY or baseY\n        local laneWidth=count>1 and spacing or nil\n        local point={x, y, baseY=baseY,hitWidth=laneWidth,focusY=focusY,focusScale=focusScale,ceiling=ceiling}\n        if measureOnly then return point end\n        box:SetAnchoredPosition(x, y)\n        local scale = selected and focusScale or 1\n        box:SetLocalScale(scale, scale, 1)\n        box.localRotationZ = selected and 0 or angle\n        placeHandHit(box,w,h,angle,point,scale)\n        box:GetChild(\"glow\"):SetVisible(selected)\n        box:SetAsLastSibling()"
      },
      {
        "at": 102,
        "before": "    end\n    return {\n        placeHandHit=placeHandHit, placeCard=placeCard, rewardTarget=rewardTarget, placeReward=placeReward, canHover=canHover\n    }\nend",
        "after": "    end\n    return {\n        prepareHandFocus=prepareHandFocus, placeCard=placeCard, rewardTarget=rewardTarget, placeReward=placeReward, canHover=canHover\n    }\nend"
      }
    ]
  },
  "src/lua/abyss_battle_card_view.lua": {
    "path": "src/lua/abyss_battle_card_view.lua",
    "beforeSha256": "654b59e0198773ca869d152011c41df2d563a386a4145d61852a0596baf64d74",
    "afterSha256": "e35d0e09a2df39a4fa4298499c053f3eae7eefa6df4c5da0e084bf0664ca0a5c",
    "beforeBlob": "62f66dfc247eb140d14eab0ff0fb7f4316f9fa05",
    "afterBlob": "023ea90a7e1e6917e7369d60b556692431926c43",
    "hunks": [
      {
        "at": 51,
        "before": "local function handTarget(count, index, hot, point)\n    local restAngle=-(index-(count-1)/2)*L.hand.arcDegrees\n    -- The safe-area clamp can lift the selected pose farther than hoverLift.\n    -- Keep the real idle anchor so hover cannot shift its world hit rectangle.\n    return {x=point[1],y=point[2],scale=hot and Theme.motion.hoverScale or 1,\n        angle=hot and 0 or restAngle,restAngle=restAngle,\n        baseY=point.baseY,hitWidth=point.hitWidth}\nend\n",
        "after": "local function handTarget(count, index, hot, point)\n    local restAngle=-(index-(count-1)/2)*L.hand.arcDegrees\n    local focusY,focusScale=point.focusY,point.focusScale\n    if not focusY then focusY,focusScale=Viewport.handFocus(point.baseY,point[1]) end\n    return {x=point[1],y=point[2],scale=hot and focusScale or 1,\n        angle=hot and 0 or restAngle,restAngle=restAngle,\n        baseY=point.baseY,hitWidth=point.hitWidth,focusY=focusY,focusScale=focusScale,ceiling=hot and point.ceiling}\nend\n"
      },
      {
        "at": 66,
        "before": "    local c,s=math.abs(math.cos(r)),math.abs(math.sin(r))\n    local restH,restW=(h*c+w*s)/2,(w*c+h*s)/2\n    local hotH=h*Theme.motion.hoverScale/2\n    local hotY=math.max(target.baseY+Theme.motion.hoverLift,-Theme.canvas.base[2]/2+Theme.canvas.safe.y+hotH)\n    local low=math.min(target.baseY-restH,hotY-hotH)\n    local high=math.max(target.baseY+restH,hotY+hotH)\n    local dy,a=(low+high)/2-pose.y,pose.angle*math.pi/180\n    local width=math.max(restW*2,w*Theme.motion.hoverScale)\n    return {pose.x,pose.y,pose.scale,pose.angle,\n        math.sin(a)*dy/pose.scale,math.cos(a)*dy/pose.scale,",
        "after": "    local c,s=math.abs(math.cos(r)),math.abs(math.sin(r))\n    local restH,restW=(h*c+w*s)/2,(w*c+h*s)/2\n    local hotH=h*target.focusScale/2\n    local hotY=target.focusY\n    local low=math.min(target.baseY-restH,hotY-hotH)\n    local high=math.max(target.baseY+restH,hotY+hotH)\n    local dy,a=(low+high)/2-pose.y,pose.angle*math.pi/180\n    local width=math.max(restW*2,w*target.focusScale)\n    return {pose.x,pose.y,pose.scale,pose.angle,\n        math.sin(a)*dy/pose.scale,math.cos(a)*dy/pose.scale,"
      },
      {
        "at": 117,
        "before": "    pose.scale=lerpSnap(pose.scale,target.scale,dt,7.5,0.003)\n    pose.angle=lerpSnap(pose.angle,target.angle,dt,12,0.003)\nend\n",
        "after": "    pose.scale=lerpSnap(pose.scale,target.scale,dt,7.5,0.003)\n    pose.angle=lerpSnap(pose.angle,target.angle,dt,12,0.003)\n    if target.ceiling then pose.y=Viewport.limitHandFocus(pose.y,pose.angle,pose.scale,target.ceiling) end\nend\n"
      },
      {
        "at": 294,
        "before": "    local handWidth,handHeight,handTurn,handCount,handTop,openingHand,eventTail\n    local recentDrawOrigins={}\n    local function syncHandViewport(current)\n        if current~=handBattle or view.canvasWidth~=handWidth or view.canvasHeight~=handHeight then\n            -- Resizing invalidates a captured drag. Its old display coordinates",
        "after": "    local handWidth,handHeight,handTurn,handCount,handTop,openingHand,eventTail\n    local recentDrawOrigins={}\n    local function syncHandLayout(current, battle, fighting)\n        if controls.prepareHandFocus then controls.prepareHandFocus(fighting and battle) end\n        if current~=handBattle or view.canvasWidth~=handWidth or view.canvasHeight~=handHeight then\n            -- Resizing invalidates a captured drag. Its old display coordinates"
      },
      {
        "at": 428,
        "before": "        local aimUid, aimTarget = currentAim(view,dragTarget)\n        local current=fighting and view.run and view.run.combat\n        syncHandViewport(current)\n        handTurn,handCount=handMetadata(current)\n        recentDrawOrigins,eventTail=reshuffledOrigins(fighting and battle,eventTail)",
        "after": "        local aimUid, aimTarget = currentAim(view,dragTarget)\n        local current=fighting and view.run and view.run.combat\n        syncHandLayout(current,battle,fighting)\n        handTurn,handCount=handMetadata(current)\n        recentDrawOrigins,eventTail=reshuffledOrigins(fighting and battle,eventTail)"
      }
    ]
  },
  "src/lua/abyss_battle_details.lua": {
    "path": "src/lua/abyss_battle_details.lua",
    "beforeSha256": "cf50bdc03024588a0610253404d7ab2a43eb387cf83eb02a8cfbba624b274c4a",
    "afterSha256": "5fc946a6f7b754a69034b489c21823d7dcba7ff9ba957f9613adec433b662daa",
    "beforeBlob": "32cc137301895a50469209389de92f2b0b6ebb02",
    "afterBlob": "e5b298bdfaafcdb91b1f0e4e19ebc4cb40f648a8",
    "hunks": [
      {
        "at": 53,
        "before": "            host.root:GetChild(\"backdrop\"):SetSizeDelta(width, height)\n        end\n        if cancelled then self:render() end\n    end\n    local function describeInfo(battle, info, actor)",
        "after": "            host.root:GetChild(\"backdrop\"):SetSizeDelta(width, height)\n        end\n        local handWidth = host.pileLayout.extraWidth()\n        local handChanged = handWidth ~= (self.handWidthExtra or 0)\n        self.handWidthExtra = handWidth\n        if cancelled or (handChanged and self.active and self.run and self.run.phase=='combat') then self:render() end\n    end\n    local function describeInfo(battle, info, actor)"
      }
    ]
  },
  "src/lua/abyss_battle_ui.lua": {
    "path": "src/lua/abyss_battle_ui.lua",
    "beforeSha256": "a102233efb9d5211db2fd6c22e1618d5a37f562f8a2918edba82143380f9be09",
    "afterSha256": "ae18353f3758e220f424127d821a65c7b3f94e3129c4d61a88d07a8415d260e6",
    "beforeBlob": "96f8e67f0cc326051846a33bdd4e12e762eee959",
    "afterBlob": "0e4f2a8ce53846cc66484ef55b95a377c305463d",
    "hunks": [
      {
        "at": 54,
        "before": "local function configureInputSurface(host, self)\n    host.stage = host.options.embedded and host.root or assert(host.root:GetChild(\"stage\"), \"missing stage\")\n    host.cursor = host.platform.cursorEvents\n    self.dragEnabled = host.cursor and host.cursor.CursorDown and host.cursor.CursorDrag and host.cursor.CursorUp and host.cursor.CursorEndDrag",
        "after": "local function configureInputSurface(host, self)\n    host.stage = host.options.embedded and host.root or assert(host.root:GetChild(\"stage\"), \"missing stage\")\n    host.pileLayout = require('abyss_viewport').pileLayout(host.stage)\n    host.cursor = host.platform.cursorEvents\n    self.dragEnabled = host.cursor and host.cursor.CursorDown and host.cursor.CursorDrag and host.cursor.CursorUp and host.cursor.CursorEndDrag"
      },
      {
        "at": 132,
        "before": "        picture=services.picture, tint=services.tint, ink=services.ink, child=services.child, enemyPosition=services.enemyPosition, renderEnemies=services.renderEnemies,\n        describeInfo=services.describeInfo, show=services.show, placeCard=services.placeCard, placeReward=services.placeReward, dragTarget=services.dragTarget,\n        dragPose=services.dragPose, notice=services.notice, refresh=services.refresh, bind=services.bind, cancelPotionAim=services.cancelPotionAim,\n        rewardScreen=services.rewardScreen, bindPotionControls=services.bindPotionControls, bindCardControls=services.bindCardControls, bindEnemyControl=services.bindEnemyControl, unbindEnemyControl=services.unbindEnemyControl,",
        "after": "        picture=services.picture, tint=services.tint, ink=services.ink, child=services.child, enemyPosition=services.enemyPosition, renderEnemies=services.renderEnemies,\n        describeInfo=services.describeInfo, show=services.show, placeCard=services.placeCard, placeReward=services.placeReward, dragTarget=services.dragTarget,\n        prepareHandFocus=services.prepareHandFocus,\n        dragPose=services.dragPose, notice=services.notice, refresh=services.refresh, bind=services.bind, cancelPotionAim=services.cancelPotionAim,\n        rewardScreen=services.rewardScreen, bindPotionControls=services.bindPotionControls, bindCardControls=services.bindCardControls, bindEnemyControl=services.bindEnemyControl, unbindEnemyControl=services.unbindEnemyControl,"
      },
      {
        "at": 206,
        "before": "    -- Hover/press only changes scale and a small lift, so a card's edge stays\n    -- under the pointer and neighbours never overlap (step > hover width).\n    local pileLayout=require('abyss_viewport').pileLayout(host.stage)\n    host.cardView = CardView.new(self, {\n        child = services.child, show = services.show, ink = services.ink, tint = services.tint, picture = services.picture, platform = host.platform,\n        placeCard = services.placeCard, placeReward = services.placeReward,\n        dragTarget = services.dragTarget, dragPose = services.dragPose, enemyPosition = services.enemyPosition,\n        renderAimActors = services.renderEnemies,\n        potionTarget = services.potionDragTarget,\n        pileLayout = pileLayout,\n    })\n    self.feedback = Feedback.new(host.stage, host.platform, function(battle, acting)",
        "after": "    -- Hover/press only changes scale and a small lift, so a card's edge stays\n    -- under the pointer and neighbours never overlap (step > hover width).\n    host.cardView = CardView.new(self, {\n        child = services.child, show = services.show, ink = services.ink, tint = services.tint, picture = services.picture, platform = host.platform,\n        placeCard = services.placeCard, placeReward = services.placeReward, prepareHandFocus=services.prepareHandFocus,\n        dragTarget = services.dragTarget, dragPose = services.dragPose, enemyPosition = services.enemyPosition,\n        renderAimActors = services.renderEnemies,\n        potionTarget = services.potionDragTarget,\n        pileLayout = host.pileLayout,\n    })\n    self.feedback = Feedback.new(host.stage, host.platform, function(battle, acting)"
      },
      {
        "at": 241,
        "before": "        end\n        if not refreshed then error(why)end\n    end,pileLayout,poseGroundShadow)\n    -- An open detail panel owns the next pointer sequence: its Down closes the panel and\n    -- the matching Click is swallowed, so no card, target or button acts underneath it.",
        "after": "        end\n        if not refreshed then error(why)end\n    end,host.pileLayout,poseGroundShadow)\n    -- An open detail panel owns the next pointer sequence: its Down closes the panel and\n    -- the matching Click is swallowed, so no card, target or button acts underneath it."
      }
    ]
  },
  "src/lua/abyss_card_flow.lua": {
    "path": "src/lua/abyss_card_flow.lua",
    "beforeSha256": "ba98442cefc690b9704ad2b157368e800e1683d0087e890b77ea11065f0ccc12",
    "afterSha256": "a1adf51449d53b1cbf5b932006d89d2c28fe837f44686e3b30f79626706ce9dd",
    "beforeBlob": "d8f8157f18ab2d3aff30ecd46bdad16ca52ff30c",
    "afterBlob": "e2de7025e53509409b0d4bb92905b6c9adb6d6c0",
    "hunks": [
      {
        "at": 16,
        "before": "    return found\nend\nlocal function handPoint(index,count)\n    local w,h=L.card.size[1],L.card.size[2]\n    local spacing=count<=1 and 0 or math.max(L.hand.spacingMin,math.min(L.hand.spacingMax,(L.hand.maxWidth-w)/(count-1)))\n    local distance=index-1-(count-1)/2\n    local radians=math.abs(distance*L.hand.arcDegrees)*math.pi/180\n    local halfHeight=(h*math.cos(radians)+w*math.sin(radians))/2\n    local floor=-Theme.canvas.base[2]/2+Theme.canvas.safe.y+halfHeight-(L.hand.overhang or 0)\n    return {distance*spacing,math.max(floor,L.hand.y-math.abs(distance)*L.hand.arcDrop)}\nend\nfunction M.new(stage,platform,pileLayout)\n    pileLayout=pileLayout or Viewport.pileLayout(stage)",
        "after": "    return found\nend\nfunction M.new(stage,platform,pileLayout)\n    pileLayout=pileLayout or Viewport.pileLayout(stage)"
      },
      {
        "at": 23,
        "before": "    local function colour(c,alpha)return platform.color(c.r,c.g,c.b,math.floor((c.a or 255)*alpha))end\n    local function box(slot)return overlay:GetChild('cardTrail'..slot)end\n    local function point(place)\n        if place.pile=='hand'or place.pile=='retain'then return handPoint(place.index,place.count)end\n        local x,y=pileLayout.point(place.pile,extra)\n        return x and {x,y} or L.player.position\n    end\n    local function retarget(entry)\n        local sx=pileLayout.point(entry.from,extra)\n        local tx=pileLayout.point(entry.to,extra)\n        if sx then entry.start[1]=sx end\n        if tx then entry.finish[1]=tx end",
        "after": "    local function colour(c,alpha)return platform.color(c.r,c.g,c.b,math.floor((c.a or 255)*alpha))end\n    local function box(slot)return overlay:GetChild('cardTrail'..slot)end\n    local function endpoint(pile,hand)\n        if hand then return Viewport.handSlot(hand.count,hand.index-1,extra)end\n        return pileLayout.point(pile,extra)\n    end\n    local function handSlot(place)\n        if place.pile=='hand'or place.pile=='retain'then return place end\n    end\n    local function point(place)\n        local x,y=endpoint(place.pile,handSlot(place))\n        return x and {x,y} or L.player.position\n    end\n    local function retarget(entry)\n        local sx=endpoint(entry.from,entry.startHand)\n        local tx=endpoint(entry.to,entry.finishHand)\n        if sx then entry.start[1]=sx end\n        if tx then entry.finish[1]=tx end"
      },
      {
        "at": 59,
        "before": "        self.waiting[#self.waiting+1]={uid=card.uid,cardId=card.cardId,from=from.pile,to=to.pile,\n            start={start[1],start[2]},finish={finish[1],finish[2]},age=0,label=label,\n            order=to.pile=='discard'and #self.waiting or 0}\n    end\n    local function settleInPlay(after)",
        "after": "        self.waiting[#self.waiting+1]={uid=card.uid,cardId=card.cardId,from=from.pile,to=to.pile,\n            start={start[1],start[2]},finish={finish[1],finish[2]},age=0,label=label,\n            order=to.pile=='discard'and #self.waiting or 0,startHand=handSlot(from),finishHand=handSlot(to)}\n    end\n    local function settleInPlay(after)"
      }
    ]
  },
  "src/lua/abyss_viewport.lua": {
    "path": "src/lua/abyss_viewport.lua",
    "beforeSha256": "42853940e8ac793611a593c553b47566f93bf1c631cdc7dcfd3e439c2271a7d0",
    "afterSha256": "b98dd4805adff9df17b22bf568d42d25a7bb360644a84f4ccc5afc75287977df",
    "beforeBlob": "22102f226e6bd3d8a0ce176bd6a1187958be15c9",
    "afterBlob": "41cb4484415609d3ebd016f140619a1f457c7b1c",
    "hunks": [
      {
        "at": 28,
        "before": "    local scale = M.scale(width, height)\n    return validX and (x - width / 2) / scale or nil, validY and (y - height / 2) / scale or nil, invalid\nend\n",
        "after": "    local scale = M.scale(width, height)\n    return validX and (x - width / 2) / scale or nil, validY and (y - height / 2) / scale or nil, invalid\nend\n\nlocal cardWidth, cardHeight = table.unpack(Theme.layout.card.size)\nlocal hand = Theme.layout.hand\nlocal card = Theme.layout.card\nlocal disc = card.costDisc\nlocal ring = math.max(disc + card.trim.costRing, Theme.layout.nativeText.lineHeight) / 2\nlocal cardLeft = math.max(cardWidth / 2, cardWidth / 2 - disc / 2 + card.trim.costOverhang + ring)\nlocal cardTop = math.max(cardHeight / 2, cardHeight / 2 - disc / 2 + card.trim.costOverhang + ring,\n    card.title.position[2] + math.max(card.nameBand, Theme.layout.nativeText.lineHeight) / 2) + Theme.space.border\n\nfunction M.handSpacing(count, extraWidth)\n    if count <= 1 then return 0 end\n    -- The side controls keep the remaining space as they move to the edges.\n    local width = hand.maxWidth + math.max(0, extraWidth or 0) / 2\n    return math.max(hand.spacingMin, math.min(hand.spacingMax, (width - cardWidth) / (count - 1)))\nend\n\nfunction M.handSlot(count, index, extraWidth)\n    local spacing = M.handSpacing(count, extraWidth)\n    local distance = index - (count - 1) / 2\n    local angle = -distance * hand.arcDegrees\n    local radians = math.abs(angle) * math.pi / 180\n    local halfHeight = (cardHeight * math.cos(radians) + cardWidth * math.sin(radians)) / 2\n    local floor = -baseHeight / 2 + Theme.canvas.safe.y + halfHeight - (hand.overhang or 0)\n    return distance * spacing, math.max(floor, hand.y - math.abs(distance) * hand.arcDrop), angle, spacing\nend\n\nfunction M.limitHandFocus(y, angle, scale, ceiling)\n    if not ceiling then return y end\n    local radians = math.abs(angle) * math.pi / 180\n    local top = cardTop * math.cos(radians) + cardLeft * math.sin(radians)\n    return math.min(y, ceiling - top * scale)\nend\n\nfunction M.handFocus(baseY, x, health)\n    local scale = Theme.motion.hoverScale\n    local y = math.max(baseY + Theme.motion.hoverLift, -baseHeight / 2 + Theme.canvas.safe.y + cardHeight * scale / 2)\n    if not health then return y, scale end\n    local ceiling\n    for _, bar in ipairs(health) do\n        if x + cardWidth * scale / 2 > bar.left and x - cardLeft * scale < bar.right then\n            ceiling = math.min(ceiling or bar.bottom, bar.bottom)\n        end\n    end\n    if ceiling and y + cardTop * scale > ceiling then\n        -- Keep the whole reading face on screen under the nearby enemy health.\n        local height = ceiling + baseHeight / 2 - Theme.canvas.safe.y\n        if height > 0 then\n            scale = math.min(scale, height / (cardTop + cardHeight / 2))\n            return M.limitHandFocus(y, 0, scale, ceiling), scale, ceiling\n        end\n    end\n    return y, scale\nend\n"
      }
    ]
  },
  "tests/lua/selected_hand_safe_area.lua": {
    "path": "tests/lua/selected_hand_safe_area.lua",
    "beforeSha256": "86f09a4cf742577f006d4b98a83907dba41eb496ab4ad32962fb537782640903",
    "afterSha256": "18461d210814d615391c24330cb9f698eb7e096fa05aafccf74f2854a940f8ca",
    "beforeBlob": "653b72eefcf0ef0866c3b0a528e12836d380a2b8",
    "afterBlob": "2302ee11367bf666d23cf817512d15c3c842042b",
    "hunks": [
      {
        "at": 43,
        "before": "print('ok selected hand safety '..cases..' actual Lua placements')\n",
        "after": "print('ok selected hand safety '..cases..' actual Lua placements')\n\nlocal Viewport=require('abyss_viewport')\nlocal x,baseY,angle=Viewport.handSlot(10,9,400)\nlocal ceiling=-152\nlocal health={{left=x-40,right=x+40,bottom=ceiling}}\nlocal y,scale,protectedY=Viewport.handFocus(baseY,x,health)\nlocal halfHeight=Theme.layout.card.size[2]*scale/2\nlocal floor=-Theme.canvas.base[2]/2+Theme.canvas.safe.y\nassert(protectedY==ceiling and scale<=Theme.motion.hoverScale)\nassert(y+halfHeight<ceiling and y-halfHeight>=floor-1e-8,'focused card exceeded health or safe bounds')\nassert(Viewport.limitHandFocus(y+15,angle,scale,ceiling)<y,'rotated focus tween crossed the health lane')\nlocal originalY,originalScale=Viewport.handFocus(baseY,-x)\nlocal clearY,clearScale=Viewport.handFocus(baseY,-x,health)\nassert(originalY==clearY and originalScale==clearScale,'a clear card slot changed its focus')\nlocal lowBar=-180\nlocal lowY,lowScale=Viewport.handFocus(baseY,x,{{left=x-40,right=x+40,bottom=lowBar}})\nlocal lowHalf=Theme.layout.card.size[2]*lowScale/2\nassert(lowY+lowHalf<lowBar and lowY-lowHalf>=floor-1e-8,'a low health bar pushed the settled card below the safe area')\nprint('ok wide selected hand preserves nearby health and the screen bottom')\n\ndo\n    local profile=Theme.presentationProfile\n    Theme.presentationProfile='official-assets-first'\n    local EnemyView=require('abyss_battle_enemy_view')\n    local measure=EnemyView.geometry\n    local observed=false\n    EnemyView.geometry=function(_,nativeArt)\n        assert(nativeArt==false,'hand focus ignored the enemy renderer fallback mode')\n        observed=true\n        return {x=x,y=0,healthX=0,healthY=-130,healthTextY=-130,healthHeight=12,hitWidth=80}\n    end\n    local wide=require('abyss_battle_card_layout').install({handWidthExtra=400},nil,{platform={nativeMonsterArtEnabled=false}})\n    wide.prepareHandFocus({enemies={{hp=1}}})\n    local focus=wide.placeCard(box(),10,9,true)\n    EnemyView.geometry=measure\n    Theme.presentationProfile=profile\n    assert(observed and focus.ceiling,'fallback health bounds did not reach wide focus')\n    print('ok wide selected hand shares enemy fallback art geometry')\nend\n"
      }
    ]
  }
};

function matches(source, binding) {
  if (typeof source !== 'string' || !binding) return false;
  if (source.includes('\r') && source.replaceAll('\r\n', '\n').replaceAll('\n', '\r\n') !== source) return false;
  return exactSourceMatches(source, binding);
}

const chapterPoolFixture = 'tests/lua/chapter_battle_scene.lua';
const chapterPoolFixtureIdentity = {
  sha256:'d548088469c407990ff338c68e267b07154ed94f80ff6b67645e0710b7065dd8',
  gitBlob:'d89ee91ad536bd85cf24a54212dbe9bf535ccc18',
};
export function beforeChapterPoolFixtureInventory(paths, read, required = false) {
  const count = paths.filter(path => path === chapterPoolFixture).length;
  if (!count && !required) return paths;
  assert.equal(count, 1, 'single current Lua pool fixture: ' + chapterPoolFixture);
  assert(matches(read(chapterPoolFixture,'utf8'), chapterPoolFixtureIdentity),
    'fresh current Lua pool fixture: ' + chapterPoolFixture);
  return paths.filter(path => path !== chapterPoolFixture);
}

// The retired behavior remains available only to fixed, historical test views.
const cardReadingScopeProjections = {
  "src/lua/abyss_battle_card_layout.lua": {
    "path": "src/lua/abyss_battle_card_layout.lua",
    "beforeSha256": "e4cb0e92c35a637f8fe978837650848acb177e7b03ca55944bfa56bfd8535fc0",
    "afterSha256": "6a33acc4b5113463f16cc992c439044bf1b1ebd0d8f75b8ee0601cd160cfbafa",
    "beforeBlob": "90506c2db973983eb2ad0e583b37faa2a3554afb",
    "afterBlob": "334d9960f7e04f861b7b1d508b6d40af810f225b",
    "hunks": [
      {
        "at": 2,
        "before": "local Theme = require(\"abyss_theme\")\nlocal Viewport = require('abyss_viewport')\nlocal Actors = require('abyss_actor')\nlocal EnemyView = require('abyss_battle_enemy_view')\nlocal M = {}\nlocal L = Theme.layout",
        "after": "local Theme = require(\"abyss_theme\")\nlocal Viewport = require('abyss_viewport')\nlocal M = {}\nlocal L = Theme.layout"
      },
      {
        "at": 7,
        "before": "function M.install(owner, _ownership, host, _dependencies)\n    local R = L.rewardPick\n    local health\n    local function prepareHandFocus(battle)\n        health = nil\n        if not battle or (owner.handWidthExtra or 0) <= 0 or Theme.presentationProfile ~= 'official-assets-first' then return end\n        health = {}\n        local platform = host and host.platform\n        for _, enemy in ipairs(battle.enemies) do\n            if Actors.isActive(enemy) then\n                local g = EnemyView.geometry(enemy, platform and platform.nativeMonsterArtEnabled)\n                local x = g.x + g.healthX\n                local halfWidth = (g.healthWidth or g.hitWidth) / 2 + Theme.space.border\n                -- Protect both the visible bar border and the native 1.2em health text.\n                local bottom = math.min(g.healthY - g.healthHeight / 2 - Theme.space.border,\n                    g.healthTextY - Theme.font.body * .6)\n                health[#health + 1] = {left = x - halfWidth, right = x + halfWidth,\n                    bottom = g.y + bottom - Theme.space.xs}\n            end\n        end\n    end\n    local function placeHandHit(box, w, h, restAngle, point, scale)\n        local r = restAngle * math.pi / 180\n        local c,s = math.abs(math.cos(r)),math.abs(math.sin(r))\n        local restH,restW = (h*c+w*s)/2,(w*c+h*s)/2\n        local hotH = h * point.focusScale / 2\n        local low = math.min(point.baseY-restH,point.focusY-hotH)\n        local high = math.max(point.baseY+restH,point.focusY+hotH)\n        local dy,a = (low+high)/2-point[2],box.localRotationZ*math.pi/180\n        local hit = box:GetChild('hit')\n        -- Inverse the card transform: one world-space hit rectangle covers both poses.\n        hit:SetAnchoredPosition(math.sin(a)*dy/scale,math.cos(a)*dy/scale)\n        local width=math.max(restW*2,w*point.focusScale)\n        -- Adjacent hand centres own disjoint horizontal lanes. Keeping a full\n        -- hover-width receiver here lets a later sibling steal the initial press.",
        "after": "function M.install(owner, _ownership, host, _dependencies)\n    local R = L.rewardPick\n    local function placeHandHit(box, w, h, restAngle, point, scale)\n        local r = restAngle * math.pi / 180\n        local c,s = math.abs(math.cos(r)),math.abs(math.sin(r))\n        local restH,restW = (h*c+w*s)/2,(w*c+h*s)/2\n        local hotH = h * Theme.motion.hoverScale / 2\n        local hotY = Viewport.handFocus(point.baseY)\n        local low = math.min(point.baseY-restH,hotY-hotH)\n        local high = math.max(point.baseY+restH,hotY+hotH)\n        local dy,a = (low+high)/2-point[2],box.localRotationZ*math.pi/180\n        local hit = box:GetChild('hit')\n        -- Inverse the card transform: one world-space hit rectangle covers both poses.\n        hit:SetAnchoredPosition(math.sin(a)*dy/scale,math.cos(a)*dy/scale)\n        local width=math.max(restW*2,w*Theme.motion.hoverScale)\n        -- Adjacent hand centres own disjoint horizontal lanes. Keeping a full\n        -- hover-width receiver here lets a later sibling steal the initial press."
      },
      {
        "at": 29,
        "before": "        local w, h = L.card.size[1], L.card.size[2]\n        local x, baseY, angle, spacing = Viewport.handSlot(count, index, owner.handWidthExtra)\n        local focusY,focusScale,ceiling = Viewport.handFocus(baseY, x, health)\n        local y = selected and focusY or baseY\n        local laneWidth=count>1 and spacing or nil\n        local point={x, y, baseY=baseY,hitWidth=laneWidth,focusY=focusY,focusScale=focusScale,ceiling=ceiling}\n        if measureOnly then return point end\n        box:SetAnchoredPosition(x, y)\n        local scale = selected and focusScale or 1\n        box:SetLocalScale(scale, scale, 1)\n        box.localRotationZ = selected and 0 or angle",
        "after": "        local w, h = L.card.size[1], L.card.size[2]\n        local x, baseY, angle, spacing = Viewport.handSlot(count, index, owner.handWidthExtra)\n        local y = selected and Viewport.handFocus(baseY) or baseY\n        local laneWidth=count>1 and spacing or nil\n        local point={x, y, baseY=baseY,hitWidth=laneWidth}\n        if measureOnly then return point end\n        box:SetAnchoredPosition(x, y)\n        local scale = selected and Theme.motion.hoverScale or 1\n        box:SetLocalScale(scale, scale, 1)\n        box.localRotationZ = selected and 0 or angle"
      },
      {
        "at": 81,
        "before": "    end\n    return {\n        prepareHandFocus=prepareHandFocus, placeCard=placeCard, rewardTarget=rewardTarget, placeReward=placeReward, canHover=canHover\n    }\nend",
        "after": "    end\n    return {\n        placeCard=placeCard, rewardTarget=rewardTarget, placeReward=placeReward, canHover=canHover\n    }\nend"
      }
    ]
  },
  "src/lua/abyss_battle_card_view.lua": {
    "path": "src/lua/abyss_battle_card_view.lua",
    "beforeSha256": "e35d0e09a2df39a4fa4298499c053f3eae7eefa6df4c5da0e084bf0664ca0a5c",
    "afterSha256": "2a061b3bb338b5fab6e17a7bd322690e39a4c9251f643e25d937fac208fb7c71",
    "beforeBlob": "023ea90a7e1e6917e7369d60b556692431926c43",
    "afterBlob": "cbde32e89d278e327c5327dcb7a1d448e2b1fe7c",
    "hunks": [
      {
        "at": 51,
        "before": "local function handTarget(count, index, hot, point)\n    local restAngle=-(index-(count-1)/2)*L.hand.arcDegrees\n    local focusY,focusScale=point.focusY,point.focusScale\n    if not focusY then focusY,focusScale=Viewport.handFocus(point.baseY,point[1]) end\n    return {x=point[1],y=point[2],scale=hot and focusScale or 1,\n        angle=hot and 0 or restAngle,restAngle=restAngle,\n        baseY=point.baseY,hitWidth=point.hitWidth,focusY=focusY,focusScale=focusScale,ceiling=hot and point.ceiling}\nend\n",
        "after": "local function handTarget(count, index, hot, point)\n    local restAngle=-(index-(count-1)/2)*L.hand.arcDegrees\n    -- The hit rectangle still covers the idle anchor when the card is raised.\n    return {x=point[1],y=point[2],scale=hot and Theme.motion.hoverScale or 1,\n        angle=hot and 0 or restAngle,restAngle=restAngle,\n        baseY=point.baseY,hitWidth=point.hitWidth}\nend\n"
      },
      {
        "at": 65,
        "before": "    local c,s=math.abs(math.cos(r)),math.abs(math.sin(r))\n    local restH,restW=(h*c+w*s)/2,(w*c+h*s)/2\n    local hotH=h*target.focusScale/2\n    local hotY=target.focusY\n    local low=math.min(target.baseY-restH,hotY-hotH)\n    local high=math.max(target.baseY+restH,hotY+hotH)\n    local dy,a=(low+high)/2-pose.y,pose.angle*math.pi/180\n    local width=math.max(restW*2,w*target.focusScale)\n    return {pose.x,pose.y,pose.scale,pose.angle,\n        math.sin(a)*dy/pose.scale,math.cos(a)*dy/pose.scale,",
        "after": "    local c,s=math.abs(math.cos(r)),math.abs(math.sin(r))\n    local restH,restW=(h*c+w*s)/2,(w*c+h*s)/2\n    local hotH=h*Theme.motion.hoverScale/2\n    local hotY=Viewport.handFocus(target.baseY)\n    local low=math.min(target.baseY-restH,hotY-hotH)\n    local high=math.max(target.baseY+restH,hotY+hotH)\n    local dy,a=(low+high)/2-pose.y,pose.angle*math.pi/180\n    local width=math.max(restW*2,w*Theme.motion.hoverScale)\n    return {pose.x,pose.y,pose.scale,pose.angle,\n        math.sin(a)*dy/pose.scale,math.cos(a)*dy/pose.scale,"
      },
      {
        "at": 116,
        "before": "    pose.scale=lerpSnap(pose.scale,target.scale,dt,7.5,0.003)\n    pose.angle=lerpSnap(pose.angle,target.angle,dt,12,0.003)\n    if target.ceiling then pose.y=Viewport.limitHandFocus(pose.y,pose.angle,pose.scale,target.ceiling) end\nend\n",
        "after": "    pose.scale=lerpSnap(pose.scale,target.scale,dt,7.5,0.003)\n    pose.angle=lerpSnap(pose.angle,target.angle,dt,12,0.003)\nend\n"
      },
      {
        "at": 292,
        "before": "    local handWidth,handHeight,handTurn,handCount,handTop,openingHand,eventTail\n    local recentDrawOrigins={}\n    local function syncHandLayout(current, battle, fighting)\n        if controls.prepareHandFocus then controls.prepareHandFocus(fighting and battle) end\n        if current~=handBattle or view.canvasWidth~=handWidth or view.canvasHeight~=handHeight then\n            -- Resizing invalidates a captured drag. Its old display coordinates",
        "after": "    local handWidth,handHeight,handTurn,handCount,handTop,openingHand,eventTail\n    local recentDrawOrigins={}\n    local function syncHandViewport(current)\n        if current~=handBattle or view.canvasWidth~=handWidth or view.canvasHeight~=handHeight then\n            -- Resizing invalidates a captured drag. Its old display coordinates"
      },
      {
        "at": 425,
        "before": "        local aimUid, aimTarget = currentAim(view,dragTarget)\n        local current=fighting and view.run and view.run.combat\n        syncHandLayout(current,battle,fighting)\n        handTurn,handCount=handMetadata(current)\n        recentDrawOrigins,eventTail=reshuffledOrigins(fighting and battle,eventTail)",
        "after": "        local aimUid, aimTarget = currentAim(view,dragTarget)\n        local current=fighting and view.run and view.run.combat\n        syncHandViewport(current)\n        handTurn,handCount=handMetadata(current)\n        recentDrawOrigins,eventTail=reshuffledOrigins(fighting and battle,eventTail)"
      }
    ]
  },
  "src/lua/abyss_battle_ui.lua": {
    "path": "src/lua/abyss_battle_ui.lua",
    "beforeSha256": "ae18353f3758e220f424127d821a65c7b3f94e3129c4d61a88d07a8415d260e6",
    "afterSha256": "f11e1b2a3ffe9accac309987070f4df68060f801a756c90f3bbf615de57bb182",
    "beforeBlob": "0e4f2a8ce53846cc66484ef55b95a377c305463d",
    "afterBlob": "3d25656b7664ec7f42c86fdf1ca7a89a0b769fd2",
    "hunks": [
      {
        "at": 132,
        "before": "        picture=services.picture, tint=services.tint, ink=services.ink, child=services.child, enemyPosition=services.enemyPosition, renderEnemies=services.renderEnemies,\n        describeInfo=services.describeInfo, show=services.show, placeCard=services.placeCard, placeReward=services.placeReward, dragTarget=services.dragTarget,\n        prepareHandFocus=services.prepareHandFocus,\n        dragPose=services.dragPose, notice=services.notice, refresh=services.refresh, bind=services.bind, cancelPotionAim=services.cancelPotionAim,\n        rewardScreen=services.rewardScreen, bindPotionControls=services.bindPotionControls, bindCardControls=services.bindCardControls, bindEnemyControl=services.bindEnemyControl, unbindEnemyControl=services.unbindEnemyControl,",
        "after": "        picture=services.picture, tint=services.tint, ink=services.ink, child=services.child, enemyPosition=services.enemyPosition, renderEnemies=services.renderEnemies,\n        describeInfo=services.describeInfo, show=services.show, placeCard=services.placeCard, placeReward=services.placeReward, dragTarget=services.dragTarget,\n        dragPose=services.dragPose, notice=services.notice, refresh=services.refresh, bind=services.bind, cancelPotionAim=services.cancelPotionAim,\n        rewardScreen=services.rewardScreen, bindPotionControls=services.bindPotionControls, bindCardControls=services.bindCardControls, bindEnemyControl=services.bindEnemyControl, unbindEnemyControl=services.unbindEnemyControl,"
      },
      {
        "at": 207,
        "before": "    host.cardView = CardView.new(self, {\n        child = services.child, show = services.show, ink = services.ink, tint = services.tint, picture = services.picture, platform = host.platform,\n        placeCard = services.placeCard, placeReward = services.placeReward, prepareHandFocus=services.prepareHandFocus,\n        dragTarget = services.dragTarget, dragPose = services.dragPose, enemyPosition = services.enemyPosition,\n        renderAimActors = services.renderEnemies,",
        "after": "    host.cardView = CardView.new(self, {\n        child = services.child, show = services.show, ink = services.ink, tint = services.tint, picture = services.picture, platform = host.platform,\n        placeCard = services.placeCard, placeReward = services.placeReward,\n        dragTarget = services.dragTarget, dragPose = services.dragPose, enemyPosition = services.enemyPosition,\n        renderAimActors = services.renderEnemies,"
      }
    ]
  },
  "src/lua/abyss_viewport.lua": {
    "path": "src/lua/abyss_viewport.lua",
    "beforeSha256": "b98dd4805adff9df17b22bf568d42d25a7bb360644a84f4ccc5afc75287977df",
    "afterSha256": "d9741c3f60f9fc72d8c87a386947a4a77373f22312ed8fe1da9b30c58b28c939",
    "beforeBlob": "41cb4484415609d3ebd016f140619a1f457c7b1c",
    "afterBlob": "4744e8a51084a0950f381a1213a8316762a26195",
    "hunks": [
      {
        "at": 32,
        "before": "local cardWidth, cardHeight = table.unpack(Theme.layout.card.size)\nlocal hand = Theme.layout.hand\nlocal card = Theme.layout.card\nlocal disc = card.costDisc\nlocal ring = math.max(disc + card.trim.costRing, Theme.layout.nativeText.lineHeight) / 2\nlocal cardLeft = math.max(cardWidth / 2, cardWidth / 2 - disc / 2 + card.trim.costOverhang + ring)\nlocal cardTop = math.max(cardHeight / 2, cardHeight / 2 - disc / 2 + card.trim.costOverhang + ring,\n    card.title.position[2] + math.max(card.nameBand, Theme.layout.nativeText.lineHeight) / 2) + Theme.space.border\n\nfunction M.handSpacing(count, extraWidth)",
        "after": "local cardWidth, cardHeight = table.unpack(Theme.layout.card.size)\nlocal hand = Theme.layout.hand\n\nfunction M.handSpacing(count, extraWidth)"
      },
      {
        "at": 50,
        "before": "end\n\nfunction M.limitHandFocus(y, angle, scale, ceiling)\n    if not ceiling then return y end\n    local radians = math.abs(angle) * math.pi / 180\n    local top = cardTop * math.cos(radians) + cardLeft * math.sin(radians)\n    return math.min(y, ceiling - top * scale)\nend\n\nfunction M.handFocus(baseY, x, health)\n    local scale = Theme.motion.hoverScale\n    local y = math.max(baseY + Theme.motion.hoverLift, -baseHeight / 2 + Theme.canvas.safe.y + cardHeight * scale / 2)\n    if not health then return y, scale end\n    local ceiling\n    for _, bar in ipairs(health) do\n        if x + cardWidth * scale / 2 > bar.left and x - cardLeft * scale < bar.right then\n            ceiling = math.min(ceiling or bar.bottom, bar.bottom)\n        end\n    end\n    if ceiling and y + cardTop * scale > ceiling then\n        -- Keep the whole reading face on screen under the nearby enemy health.\n        local height = ceiling + baseHeight / 2 - Theme.canvas.safe.y\n        if height > 0 then\n            scale = math.min(scale, height / (cardTop + cardHeight / 2))\n            return M.limitHandFocus(y, 0, scale, ceiling), scale, ceiling\n        end\n    end\n    return y, scale\nend\n",
        "after": "end\n\nfunction M.handFocus(baseY)\n    local floor = -baseHeight / 2 + Theme.canvas.safe.y + cardHeight * Theme.motion.hoverScale / 2\n    return math.max(baseY + Theme.motion.hoverLift, floor)\nend\n"
      }
    ]
  },
  "tests/lua/selected_hand_safe_area.lua": {
    "path": "tests/lua/selected_hand_safe_area.lua",
    "beforeSha256": "18461d210814d615391c24330cb9f698eb7e096fa05aafccf74f2854a940f8ca",
    "afterSha256": "caddb090bd8d3b39e50878fbae74a438d6cb4a5dfcdf271aedab1c49af19b0bd",
    "beforeBlob": "2302ee11367bf666d23cf817512d15c3c842042b",
    "afterBlob": "56937c059bcdf3958205c44f3076258400d8bb01",
    "hunks": [
      {
        "at": 43,
        "before": "print('ok selected hand safety '..cases..' actual Lua placements')\n\nlocal Viewport=require('abyss_viewport')\nlocal x,baseY,angle=Viewport.handSlot(10,9,400)\nlocal ceiling=-152\nlocal health={{left=x-40,right=x+40,bottom=ceiling}}\nlocal y,scale,protectedY=Viewport.handFocus(baseY,x,health)\nlocal halfHeight=Theme.layout.card.size[2]*scale/2\nlocal floor=-Theme.canvas.base[2]/2+Theme.canvas.safe.y\nassert(protectedY==ceiling and scale<=Theme.motion.hoverScale)\nassert(y+halfHeight<ceiling and y-halfHeight>=floor-1e-8,'focused card exceeded health or safe bounds')\nassert(Viewport.limitHandFocus(y+15,angle,scale,ceiling)<y,'rotated focus tween crossed the health lane')\nlocal originalY,originalScale=Viewport.handFocus(baseY,-x)\nlocal clearY,clearScale=Viewport.handFocus(baseY,-x,health)\nassert(originalY==clearY and originalScale==clearScale,'a clear card slot changed its focus')\nlocal lowBar=-180\nlocal lowY,lowScale=Viewport.handFocus(baseY,x,{{left=x-40,right=x+40,bottom=lowBar}})\nlocal lowHalf=Theme.layout.card.size[2]*lowScale/2\nassert(lowY+lowHalf<lowBar and lowY-lowHalf>=floor-1e-8,'a low health bar pushed the settled card below the safe area')\nprint('ok wide selected hand preserves nearby health and the screen bottom')\n\ndo\n    local profile=Theme.presentationProfile\n    Theme.presentationProfile='official-assets-first'\n    local EnemyView=require('abyss_battle_enemy_view')\n    local measure=EnemyView.geometry\n    local observed=false\n    EnemyView.geometry=function(_,nativeArt)\n        assert(nativeArt==false,'hand focus ignored the enemy renderer fallback mode')\n        observed=true\n        return {x=x,y=0,healthX=0,healthY=-130,healthTextY=-130,healthHeight=12,hitWidth=80}\n    end\n    local wide=require('abyss_battle_card_layout').install({handWidthExtra=400},nil,{platform={nativeMonsterArtEnabled=false}})\n    wide.prepareHandFocus({enemies={{hp=1}}})\n    local focus=wide.placeCard(box(),10,9,true)\n    EnemyView.geometry=measure\n    Theme.presentationProfile=profile\n    assert(observed and focus.ceiling,'fallback health bounds did not reach wide focus')\n    print('ok wide selected hand shares enemy fallback art geometry')\nend\n",
        "after": "print('ok selected hand safety '..cases..' actual Lua placements')\n\ndo\n    local H=dofile('tests/lua/support/battle_gesture_fixture.lua')\n    local EnemyView=require('abyss_battle_enemy_view')\n    local measure=EnemyView.geometry\n    local barX,barY=460,-145\n    EnemyView.geometry=function(enemy,nativeArt)\n        local geometry=measure(enemy,nativeArt)\n        geometry.healthX=barX-geometry.x\n        geometry.healthY=barY-geometry.y\n        geometry.healthTextY=geometry.healthY\n        return geometry\n    end\n    local host,ui,panel,event,tap,_,_,stage=H.setup({'strike'},nil,{touchScreen=function()return false end})\n    local _,_,frame=H.F.Viewport.apply(stage.parent,1680,720)\n    host:resize(1680,720,frame)\n    host:update(10)\n    local card=panel:GetChild('card1')\n    local hit=card:GetChild('hit')\n    local enemy=H.F.actorControl(panel,'enemy1')\n    local hp=enemy:GetChild('hp')\n    local battle=host.run.combat\n    local idleY=card.y\n    local expectedY=math.max(idleY+Theme.motion.hoverLift,\n        -Theme.canvas.base[2]/2+Theme.canvas.safe.y+Theme.layout.card.size[2]*original/2)\n    local function pose()\n        return table.concat({card.x,card.y,card.localScaleX,card.localRotationZ,hit.x,hit.y,hit.sizeDeltaX,hit.sizeDeltaY},',')\n    end\n    assert(ui.handWidthExtra>0 and math.abs(enemy.x+hp.x-barX)<1e-8,'wide fixture did not draw the clear health label')\n    tap('card1',7)\n    host:update(10)\n    assert(ui.selected==battle.hand[1].uid,'tap did not select the card')\n    assert(math.abs(card.y-expectedY)<1e-8 and math.abs(card.localScaleX-original)<1e-8 and card.localRotationZ==0)\n    local clear=pose()\n    for _,y in ipairs({-145,-180}) do\n        barX,barY=card.x,y\n        host:refresh()\n        host:update(1/60)\n        assert(math.abs(enemy.x+hp.x-barX)<1e-8 and math.abs(enemy.y+hp.y-y)<1e-8,\n            'fixture did not move the rendered health label into the reading lane')\n        assert(pose()==clear,'enemy health changed the selected hand pose or hit area')\n        host:update(10)\n        assert(pose()==clear,'enemy health changed the settled hand pose or hit area')\n    end\n    tap('card1',7)\n    event('card1','exit',7)\n    host:update(10)\n    assert(not ui.selected and card.y==idleY and card.localScaleX==1 and #battle.hand==1 and battle.energy==3,\n        'same-card cancel did not restore the idle pose without playing the card')\n    EnemyView.geometry=measure\n    host:disable()\n    print('ok wide selected hand ignores enemy health geometry')\nend\n"
      }
    ]
  }
};

function uniformReadingSource(source) {
  return typeof source==='string' && (source===source.replaceAll('\r\n','\n') || !source.replaceAll('\r\n','').includes('\n'));
}

function readingScopeIdentity(path,source) {
  if (!Object.hasOwn(cardReadingScopeProjections,path) || !uniformReadingSource(source)) return;
  source=beforeProductionReadingBackflow(path,source);
  const row=cardReadingScopeProjections[path];
  if (matches(source,{sha256:row.afterSha256,gitBlob:row.afterBlob})) return 'current';
  if (matches(source,{sha256:row.beforeSha256,gitBlob:row.beforeBlob})) return 'historical';
}

export function assertCurrentCardReadingScope(path,source) {
  if (Object.hasOwn(cardReadingScopeProjections,path)) {
    if (productionReadingBackflowOwns(path)) {
      assert(beforeProductionReadingBackflow(path,source)!==source,'fresh complete integration source: ' + path);
    }
    assert(readingScopeIdentity(path,source)==='current','fresh complete integration source: ' + path);
  }
  return source;
}

export function beforeCardReadingScope(path,source) {
  if (readingScopeIdentity(path,source)!=='current') return source;
  source=beforeProductionReadingBackflow(path,source);
  const row=cardReadingScopeProjections[path];
  const lf=source.replaceAll('\r\n','\n');
  const prior=restoreExactFixtureHunks(row,path,lf);
  assert(matches(prior,{sha256:row.beforeSha256,gitBlob:row.beforeBlob}),'exact card reading predecessor: '+path);
  return source!==lf?prior.replaceAll('\n','\r\n'):prior;
}

export function beforeResponsiveHand(path, source) {
  source=beforeCardReadingScope(path,source);
  if (!Object.hasOwn(responsiveHandProjections, path)) return source;
  const row = responsiveHandProjections[path];
  if (!matches(source, {sha256: row.afterSha256, gitBlob: row.afterBlob})) return source;
  const before = restoreExactFixtureHunks(row, path, source);
  assert(matches(before, {sha256: row.beforeSha256, gitBlob: row.beforeBlob}),
    'exact responsive hand predecessor: ' + path);
  return source.includes('\r\n') ? before.replaceAll('\n', '\r\n') : before;
}

export function beforeChapterBattleScene(path, source) {
  if(path==='scripts/build-ui.mjs')source=beforeBossMapScroll(path,source);
  source = beforeResponsiveHand(path, source);
  if (!Object.hasOwn(projections, path)) return source;
  const change = projections[path];
  if (!matches(source, {sha256: change.afterSha256, gitBlob: change.afterBlob})) return source;
  const before = restoreExactFixtureHunks(change, path, source);
  assert(matches(before, {sha256: change.beforeSha256, gitBlob: change.beforeBlob}),
    'exact chapter scene predecessor: ' + path);
  return source.includes('\r\n') ? before.replaceAll('\n', '\r\n') : before;
}

const chapterCurrentOwners = [
  'config/architecture.json',
  'src/lua/abyss_game_ui.lua',
  'src/lua/abyss_game_ui_view.lua',
  'tests/helpers/integrated-ci-source.mjs',
];
export function chapterSceneCurrentRead(read, copier) {
  const bindings = new Map([...chapterCurrentOwners.map(path => [path, projections[path]]),
    ...Object.entries(responsiveHandProjections), ...Object.entries(cardReadingScopeProjections)]);
  if (copier) bindings.set(copier.path,copier);
  function current(path, ...args) {
    const raw = read(path, ...args);
    const binding = bindings.get(path);
    if (binding) {
      const source = Buffer.isBuffer(raw) ? raw.toString('utf8') : raw;
      const {afterSha256:sha256, afterBlob:gitBlob} = binding;
      assertCurrentCardReadingScope(path,source);
      assert(matches(beforeProductionReadingBackflow(path,source),{sha256,gitBlob}), 'fresh complete integration source: ' + path);
    }
    return raw;
  }
  for (const path of bindings.keys()) current(path,'utf8');
  return current;
}

export function chapterBattleSceneReader(path, source, read) {
  const handSource = beforeResponsiveHand(path, source);
  const hand = handSource !== source ? responsiveHandProjections[path] : undefined;
  const layoutPath='src/lua/abyss_battle_card_layout.lua';
  const readingScope = readingScopeIdentity(path,source) ?? (hand && readingScopeIdentity(layoutPath,read(layoutPath,'utf8')));
  if (hand) assert(readingScope,'combined linked owner identity: ' + layoutPath + ' changed during card reading validation');
  const before = beforeChapterBattleScene(path, source);
  const row = Object.hasOwn(projections, path) ? projections[path] : undefined;
  const candidate = row && {sha256: row.afterSha256, gitBlob: row.afterBlob};
  const predecessor = row && {sha256: row.beforeSha256, gitBlob: row.beforeBlob};
  const bossMaskSource=path==='scripts/build-ui.mjs'&&beforeBossMapScroll(path,source)!==source;
  const expected = bossMaskSource ? bossMapScrollIdentity(path)
    : hand ? {sha256: hand.afterSha256, gitBlob: hand.afterBlob}
    : before !== handSource ? candidate : matches(handSource, predecessor) ? predecessor : undefined;
  const assertReadingScope = (owner,live) => {
    assert(readingScopeIdentity(owner,live)===readingScope,
      'combined linked owner identity: ' + owner + ' changed during card reading validation');
  };
  function readOwner(owner, ...args) {
    const live = read(owner, ...args);
    const linkedHand = hand && Object.hasOwn(responsiveHandProjections, owner) && responsiveHandProjections[owner];
    const linkedScope = Object.hasOwn(cardReadingScopeProjections,owner);
    if (readingScope && linkedScope) assertReadingScope(owner,live);
    if (linkedHand && !linkedScope) assert(matches(live, {sha256: linkedHand.afterSha256, gitBlob: linkedHand.afterBlob}),
      'combined linked owner identity: ' + owner + ' changed during responsive hand validation');
    const prior = beforeChapterBattleScene(owner, live);
    if (owner === path && !readingScope && (expected || prior !== live)) {
      assert(matches(live, expected),
        'combined linked owner identity: ' + path + ' changed during chapter scene validation');
    }
    return prior;
  }
  if (readingScope==='historical') {
    for (const owner of Object.keys(cardReadingScopeProjections)) assertReadingScope(owner,read(owner,'utf8'));
  }
  if (expected) readOwner(path);
  return {source: before, read: readOwner};
}
