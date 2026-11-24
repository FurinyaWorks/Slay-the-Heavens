// Project this exact source change to develop c420b028 for historical replays.
import {restoreExactFixtureHunks} from './exact-fixture-hunks.mjs';

const bindings = new Map([
 {
  "path": "scripts/deck-ui-layout.mjs",
  "beforeSha256": "0391582d37aca48130349a57cc83fe0874bf89b8aec2b3389b5326f0be94a628",
  "afterSha256": "5a4691bb122c2657a1026de27f27598250d192bc81cb6b5eb9ff967e640f6d58",
  "hunks": [
   {
    "at": 29,
    "before": "    return {name,kind:'container',size:[...mount.size],position:[0,0],children};\n  });\n  const rim=atPath(template,['face','nativePlayableRim']);\n  if(rim.visible!==false)throw Error('A read-only card must not show a playable rim');",
    "after": "    return {name,kind:'container',size:[...mount.size],position:[0,0],children};\n  });\n  // A later card can be allocated under a visible pileGrid between scheduler turns.\n  template.visible=false;\n  const rim=atPath(template,['face','nativePlayableRim']);\n  if(rim.visible!==false)throw Error('A read-only card must not show a playable rim');"
   }
  ]
 },
 {
  "path": "scripts/write-ci-receipt.mjs",
  "beforeSha256": "909ac35ac7a7ec4eb960b32889347afdfaf9707c5cb536e74cd682dadba4aab5",
  "afterSha256": "64d4953f2c2031836532911c8bc437c8f631f37c2a967330edda91e6c123a36a",
  "hunks": [
   {
    "at": 5,
    "before": "const event=JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH,'utf8')),tested=git('rev-parse','HEAD');\nif(tested!==process.env.GITHUB_SHA)throw new Error('CI checkout SHA mismatch');\nconst receipt={schemaVersion:1,event:process.env.GITHUB_EVENT_NAME,runId:Number(process.env.GITHUB_RUN_ID),attempt:Number(process.env.GITHUB_RUN_ATTEMPT),\n  tested,head:event.pull_request?.head.sha??event.merge_group?.head_sha??tested,\n  base:event.pull_request?.base.sha??event.merge_group?.base_sha??(process.env.GITHUB_EVENT_NAME==='workflow_dispatch'&&process.env.PREFLIGHT_BASE_SHA||event.before),\n  prNumber:event.pull_request?.number,parents:git('show','-s','--format=%P','HEAD').split(' ')};\nmkdirSync('build',{recursive:true});writeFileSync('build/ci-checkout.json',JSON.stringify(receipt,null,2)+'\\n');",
    "after": "const event=JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH,'utf8')),tested=git('rev-parse','HEAD');\nif(tested!==process.env.GITHUB_SHA)throw new Error('CI checkout SHA mismatch');\nconst preflight = process.argv.includes('--preflight');\nif (preflight && !/^[a-f0-9]{40}$/.test(process.env.PREFLIGHT_BASE_SHA ?? '')) throw new Error('Exact preflight comparison BASE required');\nconst receipt={schemaVersion:1,event:process.env.GITHUB_EVENT_NAME,runId:Number(process.env.GITHUB_RUN_ID),attempt:Number(process.env.GITHUB_RUN_ATTEMPT),\n  tested,head:event.pull_request?.head.sha??event.merge_group?.head_sha??tested,\n  base:event.pull_request?.base.sha??event.merge_group?.base_sha??((preflight || process.env.GITHUB_EVENT_NAME==='workflow_dispatch')&&process.env.PREFLIGHT_BASE_SHA||event.before),\n  prNumber:event.pull_request?.number,parents:git('show','-s','--format=%P','HEAD').split(' ')};\nmkdirSync('build',{recursive:true});writeFileSync('build/ci-checkout.json',JSON.stringify(receipt,null,2)+'\\n');"
   }
  ]
 },
 {
  "path": "src/lua/abyss_deck_browser.lua",
  "beforeSha256": "ca0fe78afb9035b2b4ccfa0e2de86d21cb7789a6e28868033259cf89d4bd9d3e",
  "afterSha256": "ba2504abdbcf4b3bf924d1be6eabf5ed94458e7e1f0e1641c62d885419400d30",
  "hunks": [
   {
    "at": 113,
    "before": "    -- Track the allocation before child discovery so a failed bind can clean up.\n    pool.incomplete=entry\n    root:SetVisible(false)\n    entry.face=assert(root:GetChild('face'),'missing browser face')\n    entry.art=assert(entry.face:GetChild('art'),'missing browser artwork')",
    "after": "    -- Track the allocation before child discovery so a failed bind can clean up.\n    pool.incomplete=entry\n    assert(root:SetVisible(false)~=false,'deck browser initial visibility rejected')\n    entry.face=assert(root:GetChild('face'),'missing browser face')\n    entry.art=assert(entry.face:GetChild('art'),'missing browser artwork')"
   },
   {
    "at": 168,
    "before": "end\n\nlocal function prepare(pool,job)\n    local i=job.next",
    "after": "end\n\nlocal function showContainer(pool,job)\n    local container=pool.container\n    local accepted=container:SetVisible(true)\n    if not live(pool,job) then\n        -- A native callback can replace the job before the setter writes.\n        -- The replacement cannot step until this call unwinds.\n        if container.alive~=false and container.visible~=false then container:SetVisible(false) end\n        return false\n    end\n    assert(accepted~=false,'deck browser container visibility rejected')\n    return true\nend\n\nlocal function publishEntry(pool,job,entry,model)\n    local i=job.next\n    local x,y=((i-1)%columns-2)*stepX,pool.startY-math.floor((i-1)/columns)*stepY\n    if entry.position~=i then assert(entry.root:SetAnchoredPosition(x,y)~=false,'deck browser position rejected') end\n    if not live(pool,job) then return end\n    entry.position,entry.look,entry.instance=i,model.look,job.cards[i]\n    entry.hit.raycastTarget=true\n    if not live(pool,job) then return end\n    assert(entry.hit:SetVisible(true)~=false,'deck browser hit visibility rejected')\n    if not live(pool,job) then return end\n    assert(entry.root:SetVisible(true)~=false,'deck browser entry visibility rejected')\n    if not live(pool,job) then\n        if entry.root.alive~=false then hide(entry) end\n        return\n    end\n    if i==1 and pool.factory.progressive and not showContainer(pool,job) then return end\n    job.next=i+1\nend\n\nlocal function prepare(pool,job)\n    local i=job.next"
   },
   {
    "at": 213,
    "before": "    end\n    if i>#job.cards then\n        assert(pool.container:SetVisible(true)~=false,'deck browser container visibility rejected')\n        if not live(pool,job) then return end\n        job.ready=true\n        return\n    end",
    "after": "    end\n    if i>#job.cards then\n        if pool.factory.progressive or showContainer(pool,job) then job.ready=true end\n        return\n    end"
   },
   {
    "at": 234,
    "before": "    if not live(pool,job) then return end\n    assert(entryAlive(entry),'deck browser entry was destroyed while painting')\n    local x,y=((i-1)%columns-2)*stepX,pool.startY-math.floor((i-1)/columns)*stepY\n    if entry.position~=i then assert(entry.root:SetAnchoredPosition(x,y)~=false,'deck browser position rejected') end\n    if not live(pool,job) then return end\n    entry.position,entry.look,entry.instance=i,model.look,job.cards[i]\n    entry.hit.raycastTarget=true\n    if not live(pool,job) then return end\n    assert(entry.hit:SetVisible(true)~=false,'deck browser hit visibility rejected')\n    if not live(pool,job) then return end\n    assert(entry.root:SetVisible(true)~=false,'deck browser entry visibility rejected')\n    if not live(pool,job) then\n        if entry.root.alive~=false then hide(entry) end\n        return\n    end\n    job.next=i+1\nend\n",
    "after": "    if not live(pool,job) then return end\n    assert(entryAlive(entry),'deck browser entry was destroyed while painting')\n    publishEntry(pool,job,entry,model)\nend\n"
   }
  ]
 },
 {
  "path": "src/lua/abyss_deck_ui.lua",
  "beforeSha256": "0f19a8b8835ac30741128da4e75e5de3889de8ae4788a4eb879c838d4a75c062",
  "afterSha256": "b3a5efe6bc0420f8b35776437d17efb4059bbad0265c1b275b9fc6a75bbe1e33",
  "hunks": [
   {
    "at": 490,
    "before": "    end\n    if pileGrid and platform.deckBrowser then\n        local viewport=official and Theme.layout.deckView.pileViewport or Theme.layout.deckView.viewport\n        pool=Browser.new(pileGrid,platform.deckBrowser,platform,clickEvent,viewport[4]/2-123,browserModel,paintBrowser,",
    "after": "    end\n    if pileGrid and platform.deckBrowser then\n        self.progressiveBrowser=platform.deckBrowser.progressive==true\n        local viewport=official and Theme.layout.deckView.pileViewport or Theme.layout.deckView.viewport\n        pool=Browser.new(pileGrid,platform.deckBrowser,platform,clickEvent,viewport[4]/2-123,browserModel,paintBrowser,"
   }
  ]
 },
 {
  "path": "src/lua/abyss_game_ui.lua",
  "beforeSha256": "26e13ce816c467f096a57b9226806f7b2bc6fdf87606d35031ad691225747b7e",
  "afterSha256": "cfbecee0210a9c018f432f949ba123bf90600ca2cd2ea482301a72dc0b486c9d",
  "hunks": [
   {
    "at": 66,
    "before": "            local gate=self.pageReveal\n            return gate:covered() and (not self.exitOpen or self.routeOpen)\n                and not (self.deckUI and self.deckUI.paged and gate.intent and gate.intent.deckPaged\n                    and gate.localFrame and gate.state~='failed')\n        end\n        platform.pointerBlocked=self.pointerBlocked",
    "after": "            local gate=self.pageReveal\n            return gate:covered() and (not self.exitOpen or self.routeOpen)\n                and not (self.deckUI and self.deckUI.paged and gate:allowsDeckChrome())\n        end\n        platform.pointerBlocked=self.pointerBlocked"
   }
  ]
 },
 {
  "path": "src/lua/abyss_page_reveal.lua",
  "beforeSha256": "703a295922e14f9b786dfb647b53e25c3fb0ec82155d917511c617fb305bc243",
  "afterSha256": "7ab3cc183537787fc91b669b71a0d8b9da60d4b7b6622203948abe820e103ce4",
  "hunks": [
   {
    "at": 0,
    "before": "-- One publication boundary; preparation continues behind an opaque input cover.\nlocal M={}\nfunction M.registerSource(platform,page)",
    "after": "-- One input and readiness boundary, with local visual feedback during preparation.\nlocal M={}\nfunction M.registerSource(platform,page)"
   },
   {
    "at": 45,
    "before": "        overlayRevision=revision,details=details,detailPage=detailPage,overlayContent=content,\n        deckBrowser=page=='deckPanel' and owner.deckUI.browserShell==true and not details,\n        deckPaged=page=='deckPanel' and owner.deckUI.paged==true and not details}\nend\nlocal function sameOwner(a,b,except)",
    "after": "        overlayRevision=revision,details=details,detailPage=detailPage,overlayContent=content,\n        deckBrowser=page=='deckPanel' and owner.deckUI.browserShell==true and not details,\n        deckPaged=page=='deckPanel' and owner.deckUI.paged==true and not details,\n        deckProgressive=page=='deckPanel' and owner.deckUI.progressiveBrowser==true}\nend\nlocal function sameOwner(a,b,except)"
   },
   {
    "at": 205,
    "before": "        return gate.epoch==ticket\n    end\n    local function paintBlocker(frame)\n        local limited=gate.intent and gate.intent.deckPaged and gate.localFrame and gate.state~='failed'\n        local blockerFrame=limited and frame or frames.size or frames.full\n        local ticket=gate.epoch",
    "after": "        return gate.epoch==ticket\n    end\n    function gate:allowsDeckChrome()\n        return self.intent and self.intent.deckPaged and self.localFrame and self.state~='failed'\n    end\n    local function progressiveDeck()\n        return gate:allowsDeckChrome() and gate.intent.deckProgressive\n    end\n    local paintedVeilVisible=true\n    local function paintVeilVisibility()\n        local visible=not progressiveDeck()\n        if visible==paintedVeilVisible then return true end\n        local ticket=gate.epoch\n        local veil=cover:GetChild('veil')\n        if gate.epoch~=ticket then return false end\n        paintedVeilVisible=nil\n        local accepted=veil:SetVisible(visible)\n        if gate.epoch~=ticket then\n            paintedVeilVisible=nil -- the old setter can finish after the new owner's paint\n            return false\n        end\n        assert(accepted~=false,'page veil visibility rejected')\n        paintedVeilVisible=visible\n        return true\n    end\n    local function paintBlocker(frame)\n        local limited=gate:allowsDeckChrome()\n        local blockerFrame=limited and frame or frames.size or frames.full\n        local ticket=gate.epoch"
   },
   {
    "at": 243,
    "before": "        if not frames then return true end\n        local frame=gate.localFrame or frames.size or frames.full\n        if not paintBlocker(frame) then return false end\n        if frame==paintedFrame then return true end\n        paintToken=paintToken+1;local ticket,epoch=paintToken,gate.epoch",
    "after": "        if not frames then return true end\n        local frame=gate.localFrame or frames.size or frames.full\n        if not paintBlocker(frame) or not paintVeilVisibility() then return false end\n        if frame==paintedFrame then return true end\n        paintToken=paintToken+1;local ticket,epoch=paintToken,gate.epoch"
   },
   {
    "at": 404,
    "before": "        if self.epoch~=ticket then return false end\n        if message then\n            local show=failed or self.state=='preparing' and self.wait>=slowWait\n            local text=failed and '\u753b\u9762\u6682\u672a\u51c6\u5907\u5b8c\u6210\uff0c\u53ef\u8fd4\u56de\u3002' or '\u6b63\u5728\u51c6\u5907\u753b\u9762\u2026'\n            if message.visible~=show then message:SetVisible(show)end",
    "after": "        if self.epoch~=ticket then return false end\n        if message then\n            local show=failed or self.state=='preparing' and self.wait>=slowWait and not progressiveDeck()\n            local text=failed and '\u753b\u9762\u6682\u672a\u51c6\u5907\u5b8c\u6210\uff0c\u53ef\u8fd4\u56de\u3002' or '\u6b63\u5728\u51c6\u5907\u753b\u9762\u2026'\n            if message.visible~=show then message:SetVisible(show)end"
   }
  ]
 },
 {
  "path": "src/lua/abyss_ui.lua",
  "beforeSha256": "84fc9d11d047f3218bddf0bc0d09e4096623b0c0638c29f7c674d4810cdef722",
  "afterSha256": "339e76fbe0e7f2fe54a852c5f34a44b30de6f2e304e939feba7195588f66e165",
  "hunks": [
   {
    "at": 269,
    "before": "              characterProfile = (alpha or isTest and testPlay == true) and \"competition-candidate\" or \"production\",\n              deckBrowser=deckTemplateIndex>0 and {\n                  parts=deckBinding.parts,\n                  create=function(parent,part)return actorInstantiate(part and part.templateIndex or deckTemplateIndex,parent)end,\n                  destroy=actorDestroy,",
    "after": "              characterProfile = (alpha or isTest and testPlay == true) and \"competition-candidate\" or \"production\",\n              deckBrowser=deckTemplateIndex>0 and {\n                  -- Only the official static profile binds the segmented card templates.\n                  parts=deckBinding.parts,progressive=#deckBinding.parts>0,\n                  create=function(parent,part)return actorInstantiate(part and part.templateIndex or deckTemplateIndex,parent)end,\n                  destroy=actorDestroy,"
   }
  ]
 },
 {
  "path": "tests/deck-pages.test.mjs",
  "beforeSha256": "9bfc026623db8d2fc56d0b2122c46335bff5a06bc2ed90ba7a5edee0ee34a108",
  "afterSha256": "f200c0b6cde825aef66dc5cf31a15c8bbb35e322af8922691c993bf0e4bfa613",
  "hunks": [
   {
    "at": 14,
    "before": "  buildUI(generated, undefined, {officialAssets: true, nativePageLifecycle: true});\n  const layout = JSON.parse(readFileSync(join(generated, 'game-ui.json'), 'utf8'));\n  const panel = layout.controls.find(c => c.name === 'stage').children.find(c => c.name === 'deckPanel');\n  const find = name => panel.children.find(c => c.name === name);",
    "after": "  buildUI(generated, undefined, {officialAssets: true, nativePageLifecycle: true});\n  const layout = JSON.parse(readFileSync(join(generated, 'game-ui.json'), 'utf8'));\n  const templates = JSON.parse(readFileSync(join(generated, 'game-ui-templates.json'), 'utf8'));\n  const browser = templates.find(control => control.name === 'AbyssBattlePileCard');\n  assert.equal(browser?.visible, false, 'a new card shell must stay hidden in an already visible page');\n  const panel = layout.controls.find(c => c.name === 'stage').children.find(c => c.name === 'deckPanel');\n  const find = name => panel.children.find(c => c.name === name);"
   }
  ]
 },
 {
  "path": "tests/helpers/input-retirement-source.mjs",
  "beforeSha256": "50ed8e5e59062cc3c0f59dff740b550a17fddfaf817d2dd53b0d09c125ab5222",
  "afterSha256": "c155c3dd4ea1ad60474a01288eadd56a12c533dcaa5130f72f767ffe318fe85f",
  "hunks": [
   {
    "at": 7,
    "before": "import {beforeNativeHostInputRetirement} from './native-host-replay-source.mjs';\nimport {beforeNativeFlowFixture} from './native-flow-fixture-source.mjs';\nimport {beforeCurrentReplayFixes} from './current-replay-fix-sources.mjs';\nimport {exactSourceMatches as matches,sourceConfigLayoutMatches} from './source-fingerprint.mjs';",
    "after": "import {beforeNativeHostInputRetirement} from './native-host-replay-source.mjs';\nimport {beforeNativeFlowFixture} from './native-flow-fixture-source.mjs';\nimport {beforeDeckProgressive,deckProgressiveOwns} from './deck-progressive-source.mjs';\nimport {beforeCurrentReplayFixes} from './current-replay-fix-sources.mjs';\nimport {exactSourceMatches as matches,sourceConfigLayoutMatches} from './source-fingerprint.mjs';"
   },
   {
    "at": 67,
    "before": " const row=Object.hasOwn(browserBackflow.files,path)&&browserBackflow.files[path];\n if(path===deckChromePath)source=beforeCurrentReplayFixes(path,source);\n if(!row||!matches(source,row.after))return source;\n return source.includes('\\r\\n')?row.before.source.replaceAll('\\n','\\r\\n'):row.before.source;",
    "after": " const row=Object.hasOwn(browserBackflow.files,path)&&browserBackflow.files[path];\n if(path===deckChromePath)source=beforeCurrentReplayFixes(path,source);\n else if(row)source=beforeDeckProgressive(path,source);\n if(!row||!matches(source,row.after))return source;\n return source.includes('\\r\\n')?row.before.source.replaceAll('\\n','\\r\\n'):row.before.source;"
   },
   {
    "at": 147,
    "before": " const expected=path===rewardsBackView?rewardsBackViewSuccessor:row.after;\n const isCurrent=value=>{\n  if(path!==deckChromePath)return matches(value,expected);\n  const prior=beforeCurrentReplayFixes(path,value);\n  return prior!==value&&matches(prior,expected);",
    "after": " const expected=path===rewardsBackView?rewardsBackViewSuccessor:row.after;\n const isCurrent=value=>{\n  const before=beforeDeckProgressive(path,value);\n  if(deckProgressiveOwns(path)&&before===value)return false;\n  if(path!==deckChromePath)return matches(before,expected);\n  const prior=beforeCurrentReplayFixes(path,value);\n  return prior!==value&&matches(prior,expected);"
   },
   {
    "at": 160,
    "before": "\nexport function beforeDevelopUiBackflows(path,source){\n return beforeDeckBrowserBackflow(path,beforePotionBackflow(path,source));\n}\n",
    "after": "\nexport function beforeDevelopUiBackflows(path,source){\n const prior=Object.hasOwn(files,path)?beforeDeckProgressive(path,source):source;\n return beforeDeckBrowserBackflow(path,beforePotionBackflow(path,prior));\n}\n"
   },
   {
    "at": 249,
    "before": " }\n for(const [path,identity] of Object.entries(suite.deck.added)){\n  assert(names.delete(path)&&matches(suitePredecessor(path,read(path,'utf8'),files),identity),'fresh deck inventory source: '+path);\n }\n return {paths:[...names].sort(),read:(path,encoding)=>{",
    "after": " }\n for(const [path,identity] of Object.entries(suite.deck.added)){\n  assert(names.delete(path)&&matches(suitePredecessor(path,beforeDeckProgressive(path,read(path,'utf8')),files),identity),'fresh deck inventory source: '+path);\n }\n return {paths:[...names].sort(),read:(path,encoding)=>{"
   },
   {
    "at": 266,
    "before": "  if(![files,suite.deck.files,suite.earlier].some(layer=>Object.hasOwn(layer,path)))return raw;\n  const bytes=typeof raw==='string'?raw:raw.toString('utf8');\n  const source=suitePredecessor(path,suitePredecessor(path,suitePredecessor(path,bytes,files),suite.deck.files),suite.earlier);\n  return typeof raw==='string'?source:Buffer.from(source);\n }};",
    "after": "  if(![files,suite.deck.files,suite.earlier].some(layer=>Object.hasOwn(layer,path)))return raw;\n  const bytes=typeof raw==='string'?raw:raw.toString('utf8');\n  const source=suitePredecessor(path,suitePredecessor(path,suitePredecessor(path,beforeDeckProgressive(path,bytes),files),suite.deck.files),suite.earlier);\n  return typeof raw==='string'?source:Buffer.from(source);\n }};"
   }
  ]
 },
 {
  "path": "tests/helpers/ui-entrance-source.mjs",
  "beforeSha256": "55bbaca21af744a48dff1c5b445160b993bcf0862f813ce328a630408247e315",
  "afterSha256": "76b2ce70c74dbf4a9aeab066a61ec010595eed859c9d824f8043b4f3ec07b706",
  "hunks": [
   {
    "at": 6,
    "before": "import {exactSourceMatches as matches} from './source-fingerprint.mjs';\nimport {restoreExactFixtureHunks} from './exact-fixture-hunks.mjs';\nimport {beforeCurrentReplayFixes} from './current-replay-fix-sources.mjs';\n",
    "after": "import {exactSourceMatches as matches} from './source-fingerprint.mjs';\nimport {restoreExactFixtureHunks} from './exact-fixture-hunks.mjs';\nimport {beforeDeckProgressive,deckProgressiveOwns} from './deck-progressive-source.mjs';\nimport {beforeCurrentReplayFixes} from './current-replay-fix-sources.mjs';\n"
   },
   {
    "at": 26,
    "before": " 'tests/competition-roster-config-composition.test.mjs','tests/silent-final-source-epoch.test.mjs',\n 'tests/defect-integration-source.test.mjs','tests/defect-final-source-epoch.test.mjs'].includes(path)\n ?beforeCurrentReplayFixes(path,source):source;\nfunction currentMatches(path,source,expected){\n const normalized=currentInput(path,source);\n if(['src/lua/abyss_node_ui_faces.lua','src/lua/abyss_game_ui.lua','src/lua/abyss_game_ui_run.lua','src/lua/abyss_game_ui_view.lua'].includes(path)",
    "after": " 'tests/competition-roster-config-composition.test.mjs','tests/silent-final-source-epoch.test.mjs',\n 'tests/defect-integration-source.test.mjs','tests/defect-final-source-epoch.test.mjs'].includes(path)\n ?beforeCurrentReplayFixes(path,source):beforeDeckProgressive(path,source);\nfunction currentMatches(path,source,expected){\n if(deckProgressiveOwns(path)&&beforeDeckProgressive(path,source)===source)return false;\n const normalized=currentInput(path,source);\n if(['src/lua/abyss_node_ui_faces.lua','src/lua/abyss_game_ui.lua','src/lua/abyss_game_ui_run.lua','src/lua/abyss_game_ui_view.lua'].includes(path)"
   },
   {
    "at": 37,
    "before": "\nfunction project(path,source,row){\n if(row)source=currentInput(path,source);\n if(!row||!matches(source,row.after))return source;\n if(!row.before)return null;\n if(!predecessors.has(path)){",
    "after": "\nfunction project(path,source,row){\n if(!row)return source;\n source=currentInput(path,source);\n if(!matches(source,row.after))return source;\n if(!row.before)return null;\n if(!predecessors.has(path)){"
   }
  ]
 },
 {
  "path": "tests/lua/support/deck_browser_cases.lua",
  "beforeSha256": "58c9fbb67064c91933e55629cf6e5fe92d53d6aa82c978d1151c51fe6eeeadff",
  "afterSha256": "1dc21d114cb5239c158c8428d6992ab6980d7c2409026e15e2cf886754134729",
  "hunks": [
   {
    "at": 5,
    "before": "local host\nlocal factory=F.deckBrowser()\nlocal nativeCreate,nativeDestroy=factory.create,factory.destroy\nlocal created,destroyed,chunks,fail=0,0,0,false",
    "after": "local host\nlocal factory=F.deckBrowser()\nfactory.progressive=true\nlocal nativeCreate,nativeDestroy=factory.create,factory.destroy\nlocal created,destroyed,chunks,fail=0,0,0,false"
   },
   {
    "at": 29,
    "before": "local pool=panel:GetChild('pileGrid')\nlocal deck=host.deckUI\nlocal function tick()\n    host:update(1/60)\n    local changed,repaint=host.pageReveal:step(Gate.intent(host),1/60)\n    if changed and repaint~=false then host:refresh() end\n    host.pageReveal:paint(true)",
    "after": "local pool=panel:GetChild('pileGrid')\nlocal deck=host.deckUI\nlocal function tick(dt)\n    dt=dt or 1/60\n    host:update(dt)\n    local changed,repaint=host.pageReveal:step(Gate.intent(host),dt)\n    if changed and repaint~=false then host:refresh() end\n    host.pageReveal:paint(true)"
   },
   {
    "at": 81,
    "before": "assert(not previousHit.interactable and not previousHit.raycastTarget and not panel:GetChild('grid').visible)\nassert(tap(back,1) and not deck.visible and created==0)\nsettle();assert(host:openDeck());settle()\nlocal shown,count=cells()\nassert(count==10 and created==10 and chunks==50)",
    "after": "assert(not previousHit.interactable and not previousHit.raycastTarget and not panel:GetChild('grid').visible)\nassert(tap(back,1) and not deck.visible and created==0)\nsettle()\nlocal cover=root:GetChild('pageReveal')\nlocal veil,message=cover:GetChild('veil'),cover:GetChild('message')\nlocal clock=0\nfactory.clock=function()clock=clock+.005;return clock end\nassert(host:openDeck())\nassert(panel.visible and cover.visible and not veil.visible and not message.visible,\n    'the browser must submit its unobscured frame on the input turn')\nassert(cover:GetChild('blocker').click() and host.pageReveal:covered(),\n    'visual feedback must not release viewport input')\nfor _=1,30 do\n    if pool.visible then break end\n    tick(1/60)\nend\nlocal partial,partialCount=cells()\nassert(pool.visible and partialCount==1 and deck.pendingGrid and host.pageReveal:covered(),\n    'the first card must be shown before full-page readiness')\nlocal face=partial[1]:GetChild('face')\nassert(face:GetChild('name').text~='' and face:GetChild('label').text~='' and face:GetChild('art').visible)\nassert(not tap(partial[1]:GetChild('hit'),50) and not deck.cardDetail)\ntick(.5)\nassert(not veil.visible and not message.visible, 'slow progressive loading must not show the normal preparation screen')\nassert(tap(back,51) and not pool.visible and not deck.visible)\nassert(host:openDeck())\nassert(not pool.visible and not veil.visible and deck.pendingGrid, 'rapid reopen showed the retired page')\nassert(tap(nextHit,52) and page.text=='\u7b2c 2/2 \u9875 \u00b7 11 \u5f20')\nsettle()\nlocal last,lastCount=cells()\nassert(lastCount==1 and tap(last[1]:GetChild('hit'),53) and deck.cardDetail.instance.uid==1011)\nsettle();assert(deck:back());settle()\nassert(deck:setSort('type') and deck.pendingGrid and not pool.visible)\nassert(deck:setSort('original') and deck.pendingGrid and not pool.visible)\nfactory.clock=nil\nsettle()\nlocal shown,count=cells()\nassert(count==10 and created==10 and chunks==50)"
   },
   {
    "at": 175,
    "before": "assert(host:closeDeck());settle()\nassert(created==10 and chunks==50 and destroyed==0 and #pool:GetChildren()==10)\nlocal replacement=Run.new(F.Data,2)\nhost.run=replacement;host:refresh();settle()\nassert(destroyed==10 and #pool:GetChildren()==0)\n-- A real preparation budget may yield before reaching the failing native create.\nlocal previousClock=factory.clock",
    "after": "assert(host:closeDeck());settle()\nassert(created==10 and chunks==50 and destroyed==0 and #pool:GetChildren()==10)\nassert(host:openDeck('draw') and deck.pendingGrid)\nclock=0\nfactory.clock=function()clock=clock+.005;return clock end\nfor _=1,30 do\n    if pool.visible then break end\n    tick()\nend\nlocal retired,retiredCount=cells()\nassert(pool.visible and retiredCount==1 and deck.pendingGrid)\nlocal retiredHit=retired[1]:GetChild('hit')\nretiredHit.listeners.down({touchId=54})\nfactory.clock=nil\nlocal replacement=Run.new(F.Data,2)\nhost.run=replacement;host:refresh();settle()\nassert(destroyed==10 and #pool:GetChildren()==0 and not pool.visible and not deck.visible)\nassert(not retired[1].alive and not tap(retiredHit,54) and not deck.cardDetail)\n-- A real preparation budget may yield before reaching the failing native create.\nlocal previousClock=factory.clock"
   },
   {
    "at": 204,
    "before": "factory.clock=previousClock\nassert(host.pageReveal.state=='failed' and deck.prepareError)\nassert(host:recoverPage() and not deck.visible)\nsettle();assert(host:openDeck());settle()\nassert(not deck.prepareError and deck.pageIndex==1)\nlocal beforeDestroy=destroyed\nhost:onEngineDestroy()",
    "after": "factory.clock=previousClock\nassert(host.pageReveal.state=='failed' and deck.prepareError)\nassert(veil.visible and message.visible and cover:GetChild('cancel').visible)\nassert(host:recoverPage() and not deck.visible)\nsettle();assert(host:openDeck());settle()\nassert(not deck.prepareError and deck.pageIndex==1)\nassert(host:closeDeck());settle()\nlocal setPoolVisibility=pool.SetVisible\nlocal reopened=false\nfunction pool:SetVisible(value)\n    if value and not reopened then\n        reopened=true\n        assert(host:closeDeck() and host:openDeck())\n    end\n    setPoolVisibility(self,value)\nend\nassert(host:openDeck())\nfor _=1,30 do\n    if reopened then break end\n    tick()\nend\nlocal _,reopenedCount=cells()\nassert(reopened and deck.pendingGrid and not pool.visible and reopenedCount==0,\n    'a late container publication must not expose the new page before its first card')\npool.SetVisible=setPoolVisibility\nsettle()\nlocal beforeDestroy=destroyed\nhost:onEngineDestroy()"
   }
  ]
 },
 {
  "path": "tests/lua/support/modal_cover_setters.lua",
  "beforeSha256": "995fc1bc11b435e91cf2b6445f302f8acff96d22f19448bb7e48b2f5a154abdc",
  "afterSha256": "294b2c7952ad6a0efeeb4ca34239a37bf8cdafefc84dd1dbd107795d4d78d53b",
  "hunks": [
   {
    "at": 86,
    "before": " assert(not g:step(potion) and queries[#queries]=='potionPanel','replacement must use its own readiness')\nend\nprint('MODAL_COVER_SETTERS_PASS partial-failure/position-reentry/size-reentry/same-epoch-paint/step-reentry')\n",
    "after": " assert(not g:step(potion) and queries[#queries]=='potionPanel','replacement must use its own readiness')\nend\ndo\n local gate\n local map={page='mapPanel',mode='map',phase='map'}\n local deck={page='deckPanel',mode='map',phase='map',deckPaged=true,deckProgressive=true}\n local choice={page='choicePanel',mode='battle',phase='combat'}\n local veil={visible=true}\n local function setPosition()end\n veil.SetAnchoredPosition,veil.SetSizeDelta=setPosition,setPosition\n function veil:SetVisible(value)\n     if not value then assert(gate:request(choice), 'reentrant strict page request failed') end\n     self.visible=value\n end\n local blocker={SetAnchoredPosition=setPosition,SetSizeDelta=setPosition}\n local cover={GetChild=function(_,name)return name=='veil' and veil or name=='blocker' and blocker or nil end,\n     SetVisible=function(self,value)self.visible=value end,SetAsLastSibling=function()end}\n gate=Gate.new(cover,function(intent)return intent.page=='mapPanel'end,nil,{\n     full={0,0,1280,720},deckPaged={0,0,918,452},deckPanel={0,0,918,452},choicePanel={0,0,800,600}\n })\n assert(not gate:step(map));assert(gate:step(map));assert(not gate:covered())\n assert(not gate:request(deck) and gate.intent==choice and gate:covered())\n assert(gate:paint(true))\n assert(cover.visible and veil.visible,'strict choice screen was unintentionally left unmasked after the native visibility call changed owners')\nend\nprint('MODAL_COVER_SETTERS_PASS partial-failure/position-reentry/size-reentry/same-epoch-paint/step-reentry')\n"
   }
  ]
 }
].map(row=>[row.path,row]));

export const deckProgressiveOwns=path=>bindings.has(path);

export function beforeDeckProgressive(path,source){
 const binding=bindings.get(path);
 if(!binding)return source;
 const previous=restoreExactFixtureHunks(binding,path,source);
 return previous!==source&&source.includes('\r\n')?previous.replaceAll('\n','\r\n'):previous;
}
