import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {assertCurrentCardReadingScope,beforeCardReadingScope} from './chapter-battle-scene-source.mjs';
import {restoreExactFixtureHunks} from './exact-fixture-hunks.mjs';
import {beforeRunHudDeckLabel,beforeRunHudMapIcon} from './run-hud-successors.mjs';
import {exactSourceMatches} from './source-fingerprint.mjs';
import {readReleaseEntrancePredecessor} from './release-entrance-owner-source.mjs';
import {beforeReleaseClosureFixture} from './release-closure-fixture-source.mjs';

const bytes=readFileSync(new URL('../fixtures/closeout-current-backflow-source.json.gz',import.meta.url));
assert.equal(createHash('sha256').update(bytes).digest('hex'),
 '41efa054e461b445024797ec8cef4dc66c5275e4cff02e5b6bf0bb50dbcd8bf4','exact current closeout backflow packet');
const {schemaVersion,base,head,files,owners,continuation,sessionRoute,anchorRefactor,actorDetail,tooling,pageReveal,independentFiles,preMasterRelicIcons,reviewedDeckBuild,runHudBuildInputs,toolingCatalogue}=JSON.parse(gunzipSync(bytes));
assert.equal(schemaVersion,1);
assert.equal(base,'903bf2a31e91f10fb24763ab4cea23d586d0bb83');
assert.equal(head,'7228aaa83b0995e1dc6e36955cfd6e773c199f07');
assert.equal(continuation.commit,'3c9837614568f0cd37d926167153727a3f25218e');
const sessionNavigation='src/lua/abyss_game_ui_navigation.lua';
const routePreviewView='src/lua/abyss_game_ui_view.lua';
assert.equal(sessionRoute[sessionNavigation].commit,'d6714eaa617005b3780938a10a9f7a36f22f6565');
assert.equal(sessionRoute[routePreviewView].commit,'4d5928646e0356c893f80e0883160db77f7edad7');
const battleDetailView='src/lua/abyss_battle_info_view.lua';
assert.equal(anchorRefactor.commit,'c7ea71bd084f27a8c5ace07ee8747e40f7e2ad35');
assert.deepEqual(anchorRefactor.before,owners[battleDetailView]);
assert.equal(actorDetail.commit,'cb85a291a83de761e6462d0b98e54c8fc85dc5b8');
const battleDetailContent='src/lua/abyss_battle_info_content.lua';
const splitTooltip={sha256:'e5be45b603c6a38f863d7589c9553ebb52a6c3ec9ab1be6d436cf7fceb1b409b',
 gitBlob:'57a59fac16323440d756b6ed771ef4d87207167d'};
const splitTooltipFixture={
 beforeSha256:actorDetail.owners[battleDetailContent].sha256,
 beforeBlob:actorDetail.owners[battleDetailContent].gitBlob,
 afterSha256:splitTooltip.sha256,afterBlob:splitTooltip.gitBlob,
 hunks:[{at:250,before:'            return M.intentTip(describe.displayedIntent(battle, actor.id))',
  after:[
   '            local enum, damage, times = describe.displayedIntent(battle, actor.id)',
   '            local tip = M.intentTip(enum, damage, times)',
   "            if enum == 'UNKNOWN' and actor.ai and actor.ai.splitEnemy then",
   '                local intent = Combat.intent(battle, info.index)',
   "                if intent and intent.kind == 'split' and intent.id == actor.ai.splitIntent then",
   '                    tip.body = projectedIntent(battle, info.index).text',
   '                end',
   '            end',
   '            return tip',
  ].join('\n')}],
};
const pageRevealPath='src/lua/abyss_page_reveal.lua';
assert.equal(pageReveal.commit,'a25784d9814d0a2daf07a506ba416015ac02ec11');
const cardLayoutPath='src/lua/abyss_battle_card_layout.lua';
const cardReadingOwners=new Set([cardLayoutPath,'src/lua/abyss_battle_card_view.lua','src/lua/abyss_battle_ui.lua']);
const cardReadingCompanions=['src/lua/abyss_viewport.lua','tests/lua/selected_hand_safe_area.lua'];
const relicIconsFixture='tests/official-battle-relic-icons.test.mjs';
assert.equal(preMasterRelicIcons.commit,'b2f74d99a3d80e60b99165b6380987cda8b4488d');
assert.equal(files[relicIconsFixture].successor.commit,
 'dfcc35416f127693b2f0323b8168b0e29590af7d');
assert.equal(tooling.commit,'e65d9b98fbec69442047650254238cd9244df805');
assert.equal(tooling.successor.commit,'73ae746609eef41c192d04e836dc474f0aa9b303');
assert.equal(toolingCatalogue.commit,'4fc24afde58c1def7bd5f61e5271abbbf7d82767');
const catalogueToolingBinding={sha256:toolingCatalogue.afterSha256,gitBlob:toolingCatalogue.afterBlob};

assert.equal(reviewedDeckBuild.reviewed,'637898cbdb81feb3feeda2123536fd1338518d5d');
assert.equal(reviewedDeckBuild.commit,'8d361c49834d3dd6d36cce8410df08d6441b0782');

// #1041: retain the raw Release owner, project only when the closeout receipt expects its exact predecessor.
const reviewedDeckReturn={
 "path": "src/lua/abyss_deck_ui.lua",
 "beforeSha256": "336fe6d4612a719aec256b0dd1d9ece3799e40fc3b02d748a0a76653ed5a0436",
 "beforeBlob": "7b6afe38cf1fbf7c64ec72037aa5276696a74c59",
 "afterSha256": "1bfaa0cff56eea75e2173e90393fb76e23c8ce7a18fb336ffb394e50557df2af",
 "afterBlob": "379cf49278f2cc79c892f6109c96dc2cede98b91",
 "hunks": [
  {
   "at": 8,
   "before": "local M = {}\nlocal Pointer = require('abyss_pointer_input')\nlocal Browser = require('abyss_deck_browser')\nlocal NativeArt = require('abyss_card_art_runtime')",
   "after": "local M = {}\nlocal Pointer = require('abyss_pointer_input')\nlocal RoundedButton = require('abyss_rounded_button')\nlocal Browser = require('abyss_deck_browser')\nlocal NativeArt = require('abyss_card_art_runtime')"
  },
  {
   "at": 16,
   "before": "local NativeGrid = require('abyss_deck_grid')\nlocal typeNames = NativeGrid.typeNames\n-- ClientUIGridScrollerControl: current item size/spacing, top/bottom padding,\n-- fixed columns and viewport determine visible rows, including clipped edges.",
   "after": "local NativeGrid = require('abyss_deck_grid')\nlocal typeNames = NativeGrid.typeNames\n\nlocal function bindPileReturn(deck, button, platform, cursor, clickEvent, revision)\n    local hit,art=button:GetChild('hit'),button:GetChild('art')\n    local chrome=art:GetChild('roundedButton')\n    local palette=Theme.officialAssets.pileReturnPalette\n    local held,released,observed,hovered\n    local painted='normal'\n    local function available()\n        return deck.visible and deck.browserShell and not deck.choiceToken and not deck.detailOnly\n    end\n    local function current(token)\n        return token and available() and token.generation==deck.generation and token.run==deck.run\n            and token.revision==revision()\n    end\n    local function paint(state)\n        if painted==state then return end\n        painted=state\n        RoundedButton.paint(chrome,palette[state],platform.color)\n        local scale=state=='pressed' and Theme.layout.deckView.pressedScale or 1\n        art:SetLocalScale(scale,scale,1)\n    end\n    local function reset()\n        held,released,hovered=nil,nil,nil\n        paint('normal')\n    end\n    local function touch(event) return event and event.touchId end\n    if cursor.CursorEnter then\n        hit:AddCursorEventListener(cursor.CursorEnter,function()\n            if not available() or Pointer.blocked(platform) then return end\n            hovered=true\n            if not held then paint('hover') end\n        end)\n    end\n    for _,kind in pairs({cursor.CursorExit,cursor.CursorEndDrag})do\n        hit:AddCursorEventListener(kind,function(event)\n            local owner=held or released\n            if not owner or not event or owner.touch==touch(event) then reset() end\n        end)\n    end\n    if cursor.CursorDown and cursor.CursorUp then\n        hit:AddCursorEventListener(cursor.CursorDown,function(event)\n            if current(held) and held.touch~=touch(event) then return end\n            observed,held,released=true,nil,nil\n            if not available() or Pointer.blocked(platform) then reset();return end\n            if touch(event)~=nil then hovered=nil end\n            held={generation=deck.generation,run=deck.run,revision=revision(),touch=touch(event)}\n            paint('pressed')\n        end)\n        hit:AddCursorEventListener(cursor.CursorUp,function(event)\n            if not held or held.touch~=touch(event) then return end\n            released,held=current(held) and held or nil,nil\n            paint(released and hovered and 'hover' or 'normal')\n        end)\n    end\n    hit:AddCursorEventListener(clickEvent,function(event)\n        if not available() or Pointer.blocked(platform) then return false end\n        if observed or cursor.CursorDown and cursor.CursorUp and touch(event)~=nil then\n            if not current(released) or released.touch~=touch(event) then return false end\n            released=nil\n        end\n        return deck:back()\n    end)\n    return reset\nend\n\n-- ClientUIGridScrollerControl: current item size/spacing, top/bottom padding,\n-- fixed columns and viewport determine visible rows, including clipped edges."
  },
  {
   "at": 239,
   "before": "    local titleControl=root:GetChild('title')\n    local returnRevision=0\n    local indexBases=setmetatable({},{__mode='k'})\n    self.browserWarmupPending=NativeGrid.canPrepare(official,platform,pileGrid)",
   "after": "    local titleControl=root:GetChild('title')\n    local returnRevision=0\n    local resetPileReturn\n    local indexBases=setmetatable({},{__mode='k'})\n    self.browserWarmupPending=NativeGrid.canPrepare(official,platform,pileGrid)"
  },
  {
   "at": 572,
   "before": "        self.cardDetail=context\n        returnRevision=returnRevision+1\n        invalidateDetailGrid()\n        details:SetAnchoredPosition(360,30);details:SetSizeDelta(noteWidth,noteHeight)",
   "after": "        self.cardDetail=context\n        returnRevision=returnRevision+1\n        if resetPileReturn then resetPileReturn() end\n        invalidateDetailGrid()\n        details:SetAnchoredPosition(360,30);details:SetSizeDelta(noteWidth,noteHeight)"
  },
  {
   "at": 836,
   "before": "    function self.open(_, run, choice, onPick, pileKind)\n        if self.visible then return false end\n        self.openSession=self.openSession+1\n        self.generation = self.generation + 1",
   "after": "    function self.open(_, run, choice, onPick, pileKind)\n        if self.visible then return false end\n        if resetPileReturn then resetPileReturn() end\n        self.openSession=self.openSession+1\n        self.generation = self.generation + 1"
  },
  {
   "at": 995,
   "before": "        root:GetChild('veil'):SetVisible(true)\n        if Theme.presentationProfile=='official-assets-first' then\n            for _,name in ipairs({'pileChrome','pileReturn'})do root:GetChild(name):SetVisible(false)end\n        end",
   "after": "        root:GetChild('veil'):SetVisible(true)\n        if Theme.presentationProfile=='official-assets-first' then\n            resetPileReturn()\n            for _,name in ipairs({'pileChrome','pileReturn'})do root:GetChild(name):SetVisible(false)end\n        end"
  },
  {
   "at": 1057,
   "before": "        if self.cardDetail then\n            returnRevision=returnRevision+1\n            local repaint=self.detailGridInvalidated\n            self.detailGridInvalidated=nil",
   "after": "        if self.cardDetail then\n            returnRevision=returnRevision+1\n            if resetPileReturn then resetPileReturn() end\n            local repaint=self.detailGridInvalidated\n            self.detailGridInvalidated=nil"
  },
  {
   "at": 1111,
   "before": "            end)\n        end\n        local hit=root:GetChild('pileReturn'):GetChild('hit')\n        local held,released,observed\n        local function available()\n            return self.visible and self.browserShell and not self.choiceToken and not self.detailOnly\n        end\n        local function current(token)\n            return token and available() and token.generation==self.generation and token.run==self.run\n                and token.revision==returnRevision\n        end\n        if cursor.CursorDown and cursor.CursorUp then\n            hit:AddCursorEventListener(cursor.CursorDown,function(event)\n                observed=true;held,released=nil,nil\n                if available() then held={generation=self.generation,run=self.run,revision=returnRevision,touch=event and event.touchId}end\n            end)\n            hit:AddCursorEventListener(cursor.CursorUp,function(event)\n                if held and held.touch==(event and event.touchId)then released=current(held) and held or nil;held=nil end\n            end)\n            for _,kind in pairs({cursor.CursorExit,cursor.CursorEndDrag})do\n                hit:AddCursorEventListener(kind,function()held,released=nil,nil end)\n            end\n        end\n        hit:AddCursorEventListener(clickEvent,function(event)\n            if not available() or Pointer.blocked(platform)then return false end\n            if observed or cursor.CursorDown and cursor.CursorUp and event and event.touchId~=nil then\n                local token=released;released=nil\n                if not current(token) or token.touch~=(event and event.touchId)then return false end\n            end\n            return self:back()\n        end)\n    end\n    bindOfficialBrowser()",
   "after": "            end)\n        end\n        resetPileReturn=bindPileReturn(self,pileReturn,platform,cursor,clickEvent,function()return returnRevision end)\n    end\n    bindOfficialBrowser()"
  }
 ]
};
// The runtime fixture has different immutable ancestors in Master and Closeout.
// Admit only its reviewed live Git bytes here; keep Master normalization intact.
const closeoutRuntimeFixture=Object.freeze({
 "path": "tests/official-assets-runtime.test.mjs",
 "beforeSha256": "475d4772d0224ee4690cb5215d2536ac4961efe8a1415a40c3219dcc70fd4cde",
 "beforeBlob": "4ab27d84b1640b8ee6c48daaecc3c6aae1b416c8",
 "afterSha256": "608f5e266b4b1ab48b762f74088d1e018b7ee8aa0864546a75745356e3a082c7",
 "afterBlob": "12d5666dc00a9a432141e3bc4ad6d8ccc54e23fb",
 "hunks": [
  {
   "at": 185,
   "before": "for i=3,26 do host.run.relics[i]='burning_blood' end\nhost:refresh()\nlocal overflow=bar:GetChild('slot25'):GetChild('more')\nassert(overflow.visible and overflow.text=='+4','wide relic count must preserve the exact overflow count')\nhost.run.relics,host.run.relicCounters=relics,counters\nlocal first=assert(F.Nodes.available(host.run,host.map)[1])",
   "after": "for i=3,26 do host.run.relics[i]='burning_blood' end\nhost:refresh()\nlocal previous,nextPage=bar:GetChild('previous'),bar:GetChild('next')\nlocal function visibleRelicCount()\n local count=0\n for i=1,25 do\n  local slot=bar:GetChild('slot'..i)\n  if slot.visible then count=count+1 end\n  assert(not slot:GetChild('more').visible,'owned relic pages must not replace relics with an overflow label')\n end\n return count\nend\nassert(visibleRelicCount()==23 and not previous.visible and nextPage.visible)\nassert(nextPage:GetChild('hit').click() and visibleRelicCount()==3 and previous.visible and not nextPage.visible)\nassert(previous:GetChild('hit').click() and visibleRelicCount()==23,'wide counter paging preserves every owned relic')\nhost.run.relics,host.run.relicCounters=relics,counters\nlocal first=assert(F.Nodes.available(host.run,host.map)[1])"
  },
  {
   "at": 458,
   "before": "Damage.preview=function()error('official card aim simulated the whole battle')end\nDamage.potionPreview=function()error('official potion aim simulated the whole battle')end\nlocal h,u,p,event,_,drain=H.setup({'strike','defend'},{'raven_adept'})\nh.run.potions={'fire_potion'};h:refresh()\nlocal enemy=assert(require('abyss_monster_surfaces').get(p):find(h.run.combat.enemies[1].id))\nlocal hp=h.run.combat.enemies[1].hp\nevent('potion1','down',7);event('potion1','drag',7,enemy.x,enemy.y)\nassert(u.potionAim and u.potionAim.moving)\nassert(p:GetChild('dragLayer'):GetChild('aim1').visible)\nassert(not enemy:GetChild('damagePreview').visible)\nassert(h.run.combat.enemies[1].hp==hp)\nevent('dragLayer','up',7,enemy.x,enemy.y);drain()\nassert(h.run.combat.enemies[1].hp==hp-20 and h.run.potions[1]==nil)\nevent('card1','down',8);event('card1','drag',8,enemy.x,enemy.y)\nassert(u.gesture and u.gesture.moving)\nassert(not enemy:GetChild('damagePreview').visible)\nassert(h.run.combat.enemies[1].hp==hp-20)",
   "after": "Damage.preview=function()error('official card aim simulated the whole battle')end\nDamage.potionPreview=function()error('official potion aim simulated the whole battle')end\nlocal h,u,p,event,tap,drain=H.setup({'strike','defend'},{'raven_adept'})\nh.run.potions={'fire_potion'};h:refresh()\nlocal enemy=assert(require('abyss_monster_surfaces').get(p):find(h.run.combat.enemies[1].id))\nlocal hp=h.run.combat.enemies[1].hp\nevent('potion1','down',7);event('potion1','drag',7,enemy.x,enemy.y)\nevent('potion1','up',7,enemy.x,enemy.y);event('potion1','click',7,enemy.x,enemy.y)\nassert(not u.potionAim and not u.potionMenu,'dragged bottle cannot arm or open the menu')\nassert(h.run.potions[1]=='fire_potion' and h.run.combat.enemies[1].hp==hp)\ntap('potion1',8);assert(u.potionMenu and not u.potionAim)\nlocal use=p:GetChild('potionHelp'):GetChild('potionPopup'):GetChild('use')\nuse.listeners.down({touchId=9});use.listeners.up({touchId=9});assert(use.click({touchId=9}))\nassert(u.potionAim and not u.potionAim.moving and not u.potionMenu)\nassert(not p:GetChild('dragLayer').visible,'click-only potion aim must not render the drag arrow')\nassert(not enemy:GetChild('damagePreview').visible)\nassert(h.run.combat.enemies[1].hp==hp)\ntap('enemy1',10);drain()\nassert(h.run.combat.enemies[1].hp==hp-20 and h.run.potions[1]==nil)\nevent('enemy1','click',10)\nassert(h.run.combat.enemies[1].hp==hp-20,'late target click cannot apply potion damage twice')\nlocal strike\nfor index,card in ipairs(h.run.combat.hand)do if card.cardId=='strike'then strike='card'..index;break end end\nassert(strike,'missing actual attack in the hand')\nevent(strike,'down',11);event(strike,'drag',11,enemy.x,enemy.y)\nassert(u.gesture and u.gesture.moving)\nassert(p:GetChild('dragLayer'):GetChild('aim1').visible,'card targeting must retain the arrow')\nassert(not enemy:GetChild('damagePreview').visible)\nassert(h.run.combat.enemies[1].hp==hp-20)"
  },
  {
   "at": 917,
   "before": "});\n\ntest('official three-bottle HUD renders metadata while popup, drag and use validate fresh core state',t=>{\n runOfficial(t,`\nlocal Run=require('abyss_run');local Candidate=require('abyss_run_potion_candidate')",
   "after": "});\n\ntest('official three-bottle HUD renders metadata while click-only use validates fresh core state',t=>{\n runOfficial(t,`\nlocal Run=require('abyss_run');local Candidate=require('abyss_run_potion_candidate')"
  },
  {
   "at": 962,
   "before": "for i=count+1,#calls do assert(calls[i]==3,'selected potion Use staged another inventory slot')end\nassert(not h.run.potions[3] and battle.player.block==12)\n-- In-place pending choice after Down is rejected by the actual drag validator.\nevent('potion1','down',8);battle.pendingChoice={}\ncount=#calls;event('potion1','drag',8,enemy.x,enemy.y)\nassert(#calls>count and not u.potionAim,'potion drag trusted stale metadata')\nassert(h.run.potions[1]=='fire_potion')\nbattle.pendingChoice=nil;event('potion1','up',8)\nCandidate.prepare=prepare\n-- Unknown stored IDs remain occupied physical slots, never fabricated vacancies.",
   "after": "for i=count+1,#calls do assert(calls[i]==3,'selected potion Use staged another inventory slot')end\nassert(not h.run.potions[3] and battle.player.block==12)\n-- A dragged bottle must remain inert and cannot become a late popup click.\nevent('potion1','down',8);count=#calls\nevent('potion1','drag',8,enemy.x,enemy.y)\nevent('potion1','up',8,enemy.x,enemy.y);event('potion1','click',8,enemy.x,enemy.y)\nassert(#calls==count and not u.potionAim and not u.potionMenu,'dragged bottle entered click-only use')\n-- Fresh action checks still apply when an in-place choice appears after Down.\ntap('potion1',9);assert(u.potionMenu and not u.potionAim)\nlocal use=popup:GetChild('use')\nuse.listeners.down({touchId=10});battle.pendingChoice={}\ncount=#calls;use.listeners.up({touchId=10})\nassert(use.click({touchId=10})==false and #calls>count and not u.potionAim,'Use trusted stale potion metadata')\nassert(u.potionMenu and h.run.potions[1]=='fire_potion','stale Use closed the popup or consumed the bottle')\nbattle.pendingChoice=nil\nlocal dismiss=popup:GetChild('dismiss')\ndismiss.listeners.down({touchId=11});dismiss.listeners.up({touchId=11});assert(dismiss.click({touchId=11}))\nCandidate.prepare=prepare\n-- Unknown stored IDs remain occupied physical slots, never fabricated vacancies."
  },
  {
   "at": 1121,
   "before": "local button=assert(page:GetChild('back'))\nlocal label=assert(button:GetChild('label'))\nlocal function ink(expected)\n assert(label.fontColor.r==expected.r and label.fontColor.g==expected.g and label.fontColor.b==expected.b,'official dark button ink was overwritten by light-button ink')\nend\nassert(button.visible and label.text=='离开' and not page:GetChild('confirm').visible)\nink(Theme.officialAssets.buttonInk)\nlocal hit=button:GetChild('hit')",
   "after": "local button=assert(page:GetChild('back'))\nlocal label=assert(button:GetChild('label'))\nlocal shelf=assert(page:GetChild('shopView'))\nlocal advanceShop=dofile('tests/lua/support/shop_timeline.lua')\nlocal function tapControl(box,id)\n local listeners=box:GetChild('hit').listeners\n listeners.down({touchId=id});listeners.up({touchId=id});return listeners.click({touchId=id})\nend\nassert(button.visible and label.text=='离开' and not page:GetChild('confirm').visible)\nassert(tapControl(page:GetChild('merchant'):GetChild('talk'),799))\nadvanceShop(host.nodeUI)\nassert(shelf.visible and host.nodeUI.shopOpen and not host.nodeUI.shopBusy and label.text=='关闭')\nlocal function ink(expected)\n assert(label.fontColor.r==expected.r and label.fontColor.g==expected.g and label.fontColor.b==expected.b,'official dark button ink was overwritten by light-button ink')\nend\nink(Theme.officialAssets.buttonInk)\nlocal hit=button:GetChild('hit')"
  },
  {
   "at": 1154,
   "before": "host:refresh();ink(Theme.officialAssets.buttonInk)\nassert(shelf.visible and button.visible,'map preview must return to the same shelf')\nassert(tapControl(button,804) and host.nodeUI.shopBusy,'visible leave control starts the close animation')\nassert(not host.run.nodeFlow.complete,'leave must not commit before the shelf closes')\nassert(not hit.listeners.click({touchId=804}),'duplicate leave click accepted')\nadvanceShop(host)\nassert(host.run.nodeFlow.complete and not shelf.visible,'leaving through the visible control must finish the shop')\n`, 'OFFICIAL_SHOP_ROUTE_INK_PASS');\n});",
   "after": "host:refresh();ink(Theme.officialAssets.buttonInk)\nassert(shelf.visible and button.visible,'map preview must return to the same shelf')\nassert(tapControl(button,804) and not host.nodeUI.shopOpen and not shelf.visible,\n 'visible close control starts the shelf close animation')\nassert(not host.run.nodeFlow.complete,'closing the shelf must leave the shop room active')\nassert(not hit.listeners.click({touchId=804}),'duplicate close click accepted')\nadvanceShop(host.nodeUI)\nassert(not host.run.nodeFlow.complete and not shelf.visible and label.text=='离开')\nassert(tapControl(button,805) and host.run.nodeFlow.complete,'leaving through the room control must finish the shop')\n`, 'OFFICIAL_SHOP_ROUTE_INK_PASS');\n});"
  },
  {
   "at": 1172,
   "before": "local chrome=art:GetChild('roundedButton')\nlocal theme=require('abyss_theme')\nlocal palette=theme.officialAssets.roundedButtonPalettes.cancel\nlocal function state(expected)\n for i,role in ipairs({'rim','cloth'})do",
   "after": "local chrome=art:GetChild('roundedButton')\nlocal theme=require('abyss_theme')\nlocal palette=assert(theme.officialAssets.pileReturnPalette,'missing approved pile return colors')\nlocal function state(expected)\n for i,role in ipairs({'rim','cloth'})do"
  },
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
  },
  {
   "at": 1508,
   "before": " assert(panel:GetChild('pileChrome').visible and not panel:GetChild('header').visible)\n assert(not panel:GetChild('title').visible and not panel:GetChild('browseTitle').visible)\n assert(panel:GetChild('pileChrome'):GetChild('discardBadge').visible)\n assert(panel:GetChild('browserDescription').text=='当抽牌堆被抽空时，这里的牌将会被洗牌并重新放入抽牌堆。')\n assert(not panel:GetChild('rarityTip').visible)",
   "after": " assert(panel:GetChild('pileChrome').visible and not panel:GetChild('header').visible)\n assert(not panel:GetChild('title').visible and not panel:GetChild('browseTitle').visible)\n local chrome=panel:GetChild('pileChrome');local heading=chrome:GetChild('heading')\n assert(heading.visible and heading.text=='弃牌堆' and not chrome:GetChild('discardBadge'))\n assert(panel:GetChild('browserDescription').text=='当抽牌堆被抽空时，这里的牌将会被洗牌并重新放入抽牌堆。')\n assert(not panel:GetChild('rarityTip').visible)"
  },
  {
   "at": 1525,
   "before": " local preview=C.cardPreview(host.run.combat,instance)\n local expected=require('abyss_card_display').combatText(F.Presentation[instance.cardId],definition,instance,preview,host.run.combat)\n assert(label.text==expected and label.text:find('提升2点伤害。',1,true)\n  and select(2,fit(label.text,{label.sizeDeltaX,label.sizeDeltaY})),\n  'component-bound pile face clipped its long body')",
   "after": " local preview=C.cardPreview(host.run.combat,instance)\n local expected=require('abyss_card_display').combatText(F.Presentation[instance.cardId],definition,instance,preview,host.run.combat)\n assert(label.text==expected and label.text:find('基础伤害增加2点。',1,true)\n  and select(2,fit(label.text,{label.sizeDeltaX,label.sizeDeltaY})),\n  'component-bound pile face clipped its long body')"
  }
 ]
});
function closeoutOwnerInput(path,raw,read){
 const source=readReleaseEntrancePredecessor(path,raw,read);
 if(path===closeoutRuntimeFixture.path&&exactSourceMatches(source,
  {sha256:closeoutRuntimeFixture.afterSha256,gitBlob:closeoutRuntimeFixture.afterBlob}))
  return beforeExactFixture(path,closeoutRuntimeFixture,source);
 return beforeReleaseClosureFixture(path,source);
}
function readExactOwner(path,binding,read,project){
 if(binding===null){
  assert.throws(()=>read(path,'utf8'),{code:'ENOENT'},'retired closeout owner reappeared: '+path);
  return;
 }
 const raw=read(path,'utf8');
 let source=closeoutOwnerInput(path,raw,read);
 if(path===reviewedDeckReturn.path&&binding.sha256===reviewedDeckReturn.beforeSha256
  &&binding.gitBlob===reviewedDeckReturn.beforeBlob&&exactSourceMatches(source,
   {sha256:reviewedDeckReturn.afterSha256,gitBlob:reviewedDeckReturn.afterBlob}))
  source=restoreExactFixtureHunks(reviewedDeckReturn,path,source);
 assert(exactSourceMatches(project?project(source):source,binding),'fresh current closeout owner: '+path);
 const lf=raw.replaceAll('\r\n','\n');
 assert(raw===lf||raw===lf.replaceAll('\n','\r\n'),'mixed closeout source line endings: '+path);
 return raw;
}

function restoreFixtureSuccessor(path,row,source){
 const prior=restoreExactFixtureHunks({
  path,beforeSha256:row.afterSha256,afterSha256:row.successor.sha256,hunks:row.successor.hunks,
 },path,source);
 assert(exactSourceMatches(prior,{sha256:row.afterSha256,gitBlob:row.afterBlob}),'exact closeout fixture predecessor: '+path);
 return prior;
}

export function beforeCloseoutHistoryTooling(path,source){
 if(path!==tooling.path)return source;
 const candidate=beforeExactFixture(path,toolingCatalogue,source);
 if(!exactSourceMatches(candidate,tooling.successor))return source;
 source=candidate;
 const lf=source.replaceAll('\r\n','\n');
 if(source!==lf&&source!==lf.replaceAll('\n','\r\n'))return source;
 const prior=restoreFixtureSuccessor(path,tooling,source);
 return source===lf?prior:prior.replaceAll('\n','\r\n');
}

function restoreFixturePredecessor(path,row,source){
 const prior=restoreExactFixtureHunks({...row,path},path,source);
 assert(exactSourceMatches(prior,{sha256:row.beforeSha256,gitBlob:row.beforeBlob}),'exact current closeout predecessor: '+path);
 return prior;
}

function beforeExactFixture(path,row,source){
 if(!exactSourceMatches(source,{sha256:row.afterSha256,gitBlob:row.afterBlob}))return source;
 const lf=source.replaceAll('\r\n','\n');
 if(source!==lf&&source!==lf.replaceAll('\n','\r\n'))return source;
 const prior=restoreFixturePredecessor(path,row,lf);
 return source===lf?prior:prior.replaceAll('\n','\r\n');
}

export function beforeCloseoutReviewedDeckBuild(path,source){
 return path===reviewedDeckBuild.path?beforeExactFixture(path,reviewedDeckBuild,source):source;
}

// The master backflow reader authenticates the live HUD build sources first.
export function beforeCloseoutRunHudBuild(path,source){
 return Object.hasOwn(runHudBuildInputs,path)?beforeExactFixture(path,runHudBuildInputs[path],source):source;
}

// The frozen Run HUD reader also feeds the Battle and Actor views. Reuse
// their authenticated Closeout-era fixtures solely when reading old slices.
export function beforeCloseoutRunHudFixture(path,source){
 let row;
 if(path===relicIconsFixture)row=preMasterRelicIcons;
 else if(path==='tests/helpers/m7-core-final-source-inverse.mjs')row=independentFiles[path];
 else return source;
 return beforeExactFixture(path,row,source);
}

// #1041 exported the identical palette while moving its definition.
const reviewedPileChrome={
 "path": "scripts/official-battle-pile-chrome.mjs",
 "beforeSha256": "eba197b38526630e429ce83048751260ff1e9b89689899a384fa0967a5b37cbb",
 "beforeBlob": "704d11c9ef9218165db97edc75b808e3f08143b9",
 "afterSha256": "7bdc6045f843dfcc049cb9fab2a299a35f6253b08a0e61dcd93bb1cd2eb82d20",
 "afterBlob": "8c9de93f2313806ea5e9ba11ac9eb32df0a6fb50",
 "hunks": [
  {
   "at": 16,
   "before": "\nexport function battlePileReturn(button, ink){\n button.position=[-550,-237];\n const palettes={\n  normal:['#BCA348','#8C3739'],hover:['#D9BE60','#A84D43'],\n  pressed:['#C6A858','#592A2B'],disabled:['#716650','#483332'],\n };\n for(const state of button.children[0].children){\n  roundedButtonState(state,button.size,palettes[state.name]);\n  const label=state.children.find(part=>part.name==='label');",
   "after": "\nexport const battlePileReturnPalette={\n normal:['#BCA348','#8C3739'],hover:['#D9BE60','#A84D43'],\n pressed:['#C6A858','#592A2B'],disabled:['#716650','#483332'],\n};\n\nexport function battlePileReturn(button, ink){\n button.position=[-550,-237];\n for(const state of button.children[0].children){\n  roundedButtonState(state,button.size,battlePileReturnPalette[state.name]);\n  const label=state.children.find(part=>part.name==='label');"
  }
 ]
};

function readCloseoutFixture(path,row,read){
 const fixture=read(path,'utf8');
 const reviewedFixture=closeoutOwnerInput(path,fixture,read);
 const successorFixture=row.successor;
 const predecessorBinding={sha256:row.afterSha256,gitBlob:row.afterBlob};
 const catalogue=path===tooling.path&&exactSourceMatches(reviewedFixture,catalogueToolingBinding);
 // Restore the reviewed predecessor before reading the original receipt.
 const project=path===battleDetailContent?source=>beforeExactFixture(path,splitTooltipFixture,source)
  :path===reviewedDeckBuild.path?beforeRunHudDeckLabel
  :path===reviewedPileChrome.path?source=>beforeExactFixture(path,reviewedPileChrome,source)
  :source=>beforeRunHudMapIcon(path,source);
 const candidate=catalogue?beforeExactFixture(path,toolingCatalogue,reviewedFixture):project(reviewedFixture);
 const updated=successorFixture!==undefined&&exactSourceMatches(candidate,successorFixture);
 const binding=catalogue?catalogueToolingBinding:updated?successorFixture:predecessorBinding;
 const source=readExactOwner(path,binding,read,project);
 assert.equal(source,fixture,'closeout owner changed during the receipt read: '+path);
 const previous=updated?restoreFixtureSuccessor(path,row,candidate):candidate;
 const prior=restoreFixturePredecessor(path,row,previous);
 return {source,prior};
}

// The immutable pr612 tooling view reads the exact predecessor of the
// current test fixture. Live Joust still executes the current test bytes.
export function beforeCloseoutJoustCiFixture(path,source){
 if(path!=='tests/joust-event.test.mjs')return source;
 const row=files[path];
 if(!exactSourceMatches(source,{sha256:row.afterSha256,gitBlob:row.afterBlob}))return source;
 const lf=source.replaceAll('\r\n','\n');
 if(source!==lf&&source!==lf.replaceAll('\n','\r\n'))return source;
 const prior=restoreExactFixtureHunks({...row,path},path,source);
 assert(exactSourceMatches(prior,{sha256:row.beforeSha256,gitBlob:row.beforeBlob}),'exact pr612 Joust fixture predecessor');
 return source===lf?prior:prior.replaceAll('\n','\r\n');
}

// These are reads of the original frozen Closeout hashes. Verify the live
// Joust projection's linked production cohort before reconstructing old bytes.
const officialLayoutReceipt={
 path:'scripts/official-assets-layout.mjs',
 release:{sha256:'b7cb54283affd8a34d3f7546f786a4d6c75c55d92674eab2307be19deefa9fc9',
  gitBlob:'cd10043ee9d53afc06f956390e68337052caca49'},
 beforePileReturn:{sha256:'c445695df9f70362da153f1eabccb8f1128573d36a59ce090c452dcbbc5502c1',
  gitBlob:'308c33fbf953396464cdc1c50d1aebd7b2691db2'},
 frozen:{sha256:'0b6e02f9f98ee6310f556091e416e10716756eb5efd39dc2242ea2012dd694ec',
  gitBlob:'0a51f14283165b1fb867dbb61b877e88473cca3e'},
};
function readOfficialLayoutReceipt(read){
 const {path,release,beforePileReturn,frozen}=officialLayoutReceipt;
 const raw=read(path,'utf8');
 const source=typeof raw==='string'&&raw.replaceAll('\r\n','\n');
 if(!exactSourceMatches(source,release)||
  (raw!==source&&raw!==source.replaceAll('\n','\r\n')))return;
 // #1041 contributes exactly these two lines. The immediate predecessor is
 // not the old Run HUD layout: use the existing immutable earlier witness.
 let prior=source;
 for(const line of [
  "import {battlePileReturnPalette} from './official-battle-pile-chrome.mjs';\n",
  ' theme.officialAssets.pileReturnPalette=structuredClone(battlePileReturnPalette);\n',
 ]){
  assert.equal(prior.split(line).length,2,'one reviewed #1041 layout line');
  prior=prior.replace(line,'');
 }
 assert(exactSourceMatches(prior,beforePileReturn),'exact pre-#1041 layout source');
 const archive=readFileSync(new URL('./run-hud-ci-source.json.gz',import.meta.url));
 assert.equal(createHash('sha256').update(archive).digest('hex'),
  '685bddcc6bed77545eadc456f82ed4de10a75402cfcf597533190eb1732cbe3b','immutable Run HUD layout receipt');
 const proof=JSON.parse(gunzipSync(archive));
 assert.equal(proof.base,'903bf2a31e91f10fb24763ab4cea23d586d0bb83');
 const row=proof.files[path].before;
 assert.equal(row.sha256,frozen.sha256);
 assert.equal(row.gitBlob,frozen.gitBlob);
 assert(exactSourceMatches(row.source,frozen),'exact frozen Closeout layout source');
 return row.source;
}

export function readCloseoutCurrentBackflowReceipt(path,digest,read){
 if(path===officialLayoutReceipt.path&&digest===officialLayoutReceipt.frozen.sha256)
  return readOfficialLayoutReceipt(read);
 // Test and tooling inputs have their own Git histories and complete byte proofs.
 const independent=path===tooling.path?tooling:Object.hasOwn(independentFiles,path)?independentFiles[path]:null;
 if(independent&&digest===independent.beforeSha256)return readCloseoutFixture(path,independent,read).prior;
 if(!Object.hasOwn(files,path)||files[path].beforeSha256!==digest)return;
 const row=files[path];
 const {source,prior}=readCloseoutFixture(path,row,read);
 // The Guardian subtitle advances five linked sources as one reviewed unit.
 // Its follow-up navigation and route owners advance together. Fresh owner
 // reads select one complete revision and reject mixed revisions.
 const successor=continuation.owners;
 const [markerPath,markerBinding]=Object.entries(successor)[0];
 const marker=read(markerPath,'utf8');
 const guardian=exactSourceMatches(marker,markerBinding);
 const navigation=guardian?read(sessionNavigation,'utf8'):null;
 const session=exactSourceMatches(navigation,sessionRoute[sessionNavigation]);
 const detail=session?read(battleDetailView,'utf8'):null;
 const current=session?{...successor,...sessionRoute}:guardian?successor:{};
 // Actor Detail follows the anchor refactor and advances all four owners.
 const actorRevision=exactSourceMatches(detail,actorDetail.owners[battleDetailView]);
 const content=actorRevision?read(battleDetailContent,'utf8'):null;
 if(actorRevision){
  Object.assign(current,actorDetail.owners);
  if(exactSourceMatches(content,splitTooltip))current[battleDetailContent]=splitTooltip;
 }else if(exactSourceMatches(detail,anchorRefactor.after))current[battleDetailView]=anchorRefactor.after;
 // Local map return was reviewed both with the anchor and with Actor Detail.
 const readPageReveal=Object.hasOwn(current,battleDetailView);
 const reveal=readPageReveal?read(pageRevealPath,'utf8'):null;
 if(exactSourceMatches(reveal,pageReveal.owner))current[pageRevealPath]=pageReveal.owner;
 // The reviewed wide-hand revision inherits the exact Closeout layout. Its
 // card view and battle UI also carry the authenticated production backflow.
 const layout=read(cardLayoutPath,'utf8');
 const priorLayout=beforeCardReadingScope(cardLayoutPath,layout);
 const cardReading=layout!==priorLayout&&exactSourceMatches(priorLayout,owners[cardLayoutPath]);
 if(cardReading){
  for(const companion of cardReadingCompanions)assertCurrentCardReadingScope(companion,read(companion,'utf8'));
 }
 for(const [owner,binding] of Object.entries(owners)){
  const live=cardReading&&cardReadingOwners.has(owner)
   ?assertCurrentCardReadingScope(owner,read(owner,'utf8')):readExactOwner(owner,current[owner]??binding,read);
  if(owner===path)assert.equal(live,source,'closeout owner changed during the receipt read: '+path);
  if(owner===markerPath)assert.equal(live,marker,'closeout owner changed during the receipt read: '+owner);
  if(owner===sessionNavigation&&guardian)assert.equal(live,navigation,'closeout owner changed during the receipt read: '+owner);
  if(owner===battleDetailView&&session)assert.equal(live,detail,'closeout owner changed during the receipt read: '+owner);
  if(owner===battleDetailContent&&actorRevision)assert.equal(live,content,'closeout owner changed during the receipt read: '+owner);
  if(owner===pageRevealPath&&readPageReveal)assert.equal(live,reveal,'closeout owner changed during the receipt read: '+owner);
  if(owner===cardLayoutPath)assert.equal(live,layout,'closeout owner changed during the receipt read: '+owner);
 }
 return prior;
}
