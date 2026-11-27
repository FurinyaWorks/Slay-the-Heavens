import assert from 'node:assert/strict';
import {restoreExactFixtureHunks} from './exact-fixture-hunks.mjs';
import {exactSourceMatches} from './source-fingerprint.mjs';

// #1041 changed the pointer and native pile chrome. Only historical readers
// project these exact Git predecessors. The live tests still use the new UI.
const owners=Object.freeze({
 "src/lua/abyss_deck_ui.lua": {
  "current": {
   "sha256": "1bfaa0cff56eea75e2173e90393fb76e23c8ce7a18fb336ffb394e50557df2af",
   "gitBlob": "379cf49278f2cc79c892f6109c96dc2cede98b91"
  },
  "previous": {
   "sha256": "336fe6d4612a719aec256b0dd1d9ece3799e40fc3b02d748a0a76653ed5a0436",
   "gitBlob": "7b6afe38cf1fbf7c64ec72037aa5276696a74c59"
  },
  "hunks": [
   {
    "at": 9,
    "before": "local Pointer = require('abyss_pointer_input')\nlocal Browser = require('abyss_deck_browser')",
    "after": "local Pointer = require('abyss_pointer_input')\nlocal RoundedButton = require('abyss_rounded_button')\nlocal Browser = require('abyss_deck_browser')"
   },
   {
    "at": 17,
    "before": "local typeNames = NativeGrid.typeNames\n-- ClientUIGridScrollerControl: current item size/spacing, top/bottom padding,",
    "after": "local typeNames = NativeGrid.typeNames\n\nlocal function bindPileReturn(deck, button, platform, cursor, clickEvent, revision)\n    local hit,art=button:GetChild('hit'),button:GetChild('art')\n    local chrome=art:GetChild('roundedButton')\n    local palette=Theme.officialAssets.pileReturnPalette\n    local held,released,observed,hovered\n    local painted='normal'\n    local function available()\n        return deck.visible and deck.browserShell and not deck.choiceToken and not deck.detailOnly\n    end\n    local function current(token)\n        return token and available() and token.generation==deck.generation and token.run==deck.run\n            and token.revision==revision()\n    end\n    local function paint(state)\n        if painted==state then return end\n        painted=state\n        RoundedButton.paint(chrome,palette[state],platform.color)\n        local scale=state=='pressed' and Theme.layout.deckView.pressedScale or 1\n        art:SetLocalScale(scale,scale,1)\n    end\n    local function reset()\n        held,released,hovered=nil,nil,nil\n        paint('normal')\n    end\n    local function touch(event) return event and event.touchId end\n    if cursor.CursorEnter then\n        hit:AddCursorEventListener(cursor.CursorEnter,function()\n            if not available() or Pointer.blocked(platform) then return end\n            hovered=true\n            if not held then paint('hover') end\n        end)\n    end\n    for _,kind in pairs({cursor.CursorExit,cursor.CursorEndDrag})do\n        hit:AddCursorEventListener(kind,function(event)\n            local owner=held or released\n            if not owner or not event or owner.touch==touch(event) then reset() end\n        end)\n    end\n    if cursor.CursorDown and cursor.CursorUp then\n        hit:AddCursorEventListener(cursor.CursorDown,function(event)\n            if current(held) and held.touch~=touch(event) then return end\n            observed,held,released=true,nil,nil\n            if not available() or Pointer.blocked(platform) then reset();return end\n            if touch(event)~=nil then hovered=nil end\n            held={generation=deck.generation,run=deck.run,revision=revision(),touch=touch(event)}\n            paint('pressed')\n        end)\n        hit:AddCursorEventListener(cursor.CursorUp,function(event)\n            if not held or held.touch~=touch(event) then return end\n            released,held=current(held) and held or nil,nil\n            paint(released and hovered and 'hover' or 'normal')\n        end)\n    end\n    hit:AddCursorEventListener(clickEvent,function(event)\n        if not available() or Pointer.blocked(platform) then return false end\n        if observed or cursor.CursorDown and cursor.CursorUp and touch(event)~=nil then\n            if not current(released) or released.touch~=touch(event) then return false end\n            released=nil\n        end\n        return deck:back()\n    end)\n    return reset\nend\n\n-- ClientUIGridScrollerControl: current item size/spacing, top/bottom padding,"
   },
   {
    "at": 240,
    "before": "    local returnRevision=0\n    local indexBases=setmetatable({},{__mode='k'})",
    "after": "    local returnRevision=0\n    local resetPileReturn\n    local indexBases=setmetatable({},{__mode='k'})"
   },
   {
    "at": 573,
    "before": "        returnRevision=returnRevision+1\n        invalidateDetailGrid()",
    "after": "        returnRevision=returnRevision+1\n        if resetPileReturn then resetPileReturn() end\n        invalidateDetailGrid()"
   },
   {
    "at": 837,
    "before": "        if self.visible then return false end\n        self.openSession=self.openSession+1",
    "after": "        if self.visible then return false end\n        if resetPileReturn then resetPileReturn() end\n        self.openSession=self.openSession+1"
   },
   {
    "at": 996,
    "before": "        if Theme.presentationProfile=='official-assets-first' then\n            for _,name in ipairs({'pileChrome','pileReturn'})do root:GetChild(name):SetVisible(false)end",
    "after": "        if Theme.presentationProfile=='official-assets-first' then\n            resetPileReturn()\n            for _,name in ipairs({'pileChrome','pileReturn'})do root:GetChild(name):SetVisible(false)end"
   },
   {
    "at": 1058,
    "before": "            returnRevision=returnRevision+1\n            local repaint=self.detailGridInvalidated",
    "after": "            returnRevision=returnRevision+1\n            if resetPileReturn then resetPileReturn() end\n            local repaint=self.detailGridInvalidated"
   },
   {
    "at": 1112,
    "before": "        end\n        local hit=root:GetChild('pileReturn'):GetChild('hit')\n        local held,released,observed\n        local function available()\n            return self.visible and self.browserShell and not self.choiceToken and not self.detailOnly\n        end\n        local function current(token)\n            return token and available() and token.generation==self.generation and token.run==self.run\n                and token.revision==returnRevision\n        end\n        if cursor.CursorDown and cursor.CursorUp then\n            hit:AddCursorEventListener(cursor.CursorDown,function(event)\n                observed=true;held,released=nil,nil\n                if available() then held={generation=self.generation,run=self.run,revision=returnRevision,touch=event and event.touchId}end\n            end)\n            hit:AddCursorEventListener(cursor.CursorUp,function(event)\n                if held and held.touch==(event and event.touchId)then released=current(held) and held or nil;held=nil end\n            end)\n            for _,kind in pairs({cursor.CursorExit,cursor.CursorEndDrag})do\n                hit:AddCursorEventListener(kind,function()held,released=nil,nil end)\n            end\n        end\n        hit:AddCursorEventListener(clickEvent,function(event)\n            if not available() or Pointer.blocked(platform)then return false end\n            if observed or cursor.CursorDown and cursor.CursorUp and event and event.touchId~=nil then\n                local token=released;released=nil\n                if not current(token) or token.touch~=(event and event.touchId)then return false end\n            end\n            return self:back()\n        end)\n    end",
    "after": "        end\n        resetPileReturn=bindPileReturn(self,pileReturn,platform,cursor,clickEvent,function()return returnRevision end)\n    end"
   }
  ]
 },
 "scripts/official-assets-layout.mjs": {
  "current": {
   "sha256": "b7cb54283affd8a34d3f7546f786a4d6c75c55d92674eab2307be19deefa9fc9",
   "gitBlob": "cd10043ee9d53afc06f956390e68337052caca49"
  },
  "previous": {
   "sha256": "c445695df9f70362da153f1eabccb8f1128573d36a59ce090c452dcbbc5502c1",
   "gitBlob": "308c33fbf953396464cdc1c50d1aebd7b2691db2"
  },
  "hunks": [
   {
    "at": 9,
    "before": "import {officialBattleCardChrome} from './official-battle-card-chrome.mjs';\nimport {installStsReferenceCardChrome,stsReferenceRuntimeGeometry,geoCardReferenceTokens} from './sts-card-reference-profile.mjs';",
    "after": "import {officialBattleCardChrome} from './official-battle-card-chrome.mjs';\nimport {battlePileReturnPalette} from './official-battle-pile-chrome.mjs';\nimport {installStsReferenceCardChrome,stsReferenceRuntimeGeometry,geoCardReferenceTokens} from './sts-card-reference-profile.mjs';"
   },
   {
    "at": 49,
    "before": " theme.presentationProfile='official-assets-first';\n theme.lowCostArt=loadLowCostArt();",
    "after": " theme.presentationProfile='official-assets-first';\n theme.officialAssets.pileReturnPalette=structuredClone(battlePileReturnPalette);\n theme.lowCostArt=loadLowCostArt();"
   }
  ]
 },
 "scripts/official-battle-pile-chrome.mjs": {
  "current": {
   "sha256": "7bdc6045f843dfcc049cb9fab2a299a35f6253b08a0e61dcd93bb1cd2eb82d20",
   "gitBlob": "8c9de93f2313806ea5e9ba11ac9eb32df0a6fb50"
  },
  "previous": {
   "sha256": "eba197b38526630e429ce83048751260ff1e9b89689899a384fa0967a5b37cbb",
   "gitBlob": "704d11c9ef9218165db97edc75b808e3f08143b9"
  },
  "hunks": [
   {
    "at": 16,
    "before": "\nexport function battlePileReturn(button, ink){\n button.position=[-550,-237];\n const palettes={\n  normal:['#BCA348','#8C3739'],hover:['#D9BE60','#A84D43'],\n  pressed:['#C6A858','#592A2B'],disabled:['#716650','#483332'],\n };\n for(const state of button.children[0].children){\n  roundedButtonState(state,button.size,palettes[state.name]);\n  const label=state.children.find(part=>part.name==='label');",
    "after": "\nexport const battlePileReturnPalette={\n normal:['#BCA348','#8C3739'],hover:['#D9BE60','#A84D43'],\n pressed:['#C6A858','#592A2B'],disabled:['#716650','#483332'],\n};\n\nexport function battlePileReturn(button, ink){\n button.position=[-550,-237];\n for(const state of button.children[0].children){\n  roundedButtonState(state,button.size,battlePileReturnPalette[state.name]);\n  const label=state.children.find(part=>part.name==='label');"
   }
  ]
 },
 "tests/official-assets-runtime.test.mjs": {
  "current": {
   "sha256": "b03e89fdac75b93be17d9076411ecdf595634802afda05f12b1e10b5cbaf6815",
   "gitBlob": "4050cd03aac491d356d260fb644259759cabb88c"
  },
  "previous": {
   "sha256": "8233feeee38cf2bd954cd9dfe5e6f2dee605d39cb9d3912d3ea5efc9bb92d182",
   "gitBlob": "57150fec3c3750bfaab2abaf6898d614a1dd0789"
  },
  "hunks": [
   {
    "at": 1173,
    "before": "local theme=require('abyss_theme')\nlocal palette=theme.officialAssets.roundedButtonPalettes.cancel\nlocal function state(expected)",
    "after": "local theme=require('abyss_theme')\nlocal palette=assert(theme.officialAssets.pileReturnPalette,'missing approved pile return colors')\nlocal function state(expected)"
   }
  ]
 }
});

// Keep the reviewed click-only potion and pile fixture epochs in order.
const officialRuntimePile=Object.freeze({
 "current": {
  "sha256": "327cea26d0022ebddbc04f833568b9ada9e608ea9872b526b4af91de84c1057e",
  "gitBlob": "58f48f1073c6d39710aee68e9a055dbddaf7a0f8"
 },
 "previous": {
  "sha256": "b03e89fdac75b93be17d9076411ecdf595634802afda05f12b1e10b5cbaf6815",
  "gitBlob": "4050cd03aac491d356d260fb644259759cabb88c"
 },
 "hunks": [
  {
   "at": 1491,
   "before": " assert(not panel:GetChild('title').visible and not panel:GetChild('browseTitle').visible)\n assert(panel:GetChild('pileChrome'):GetChild('discardBadge').visible)\n assert(panel:GetChild('browserDescription').text=='当抽牌堆被抽空时，这里的牌将会被洗牌并重新放入抽牌堆。')",
   "after": " assert(not panel:GetChild('title').visible and not panel:GetChild('browseTitle').visible)\n local chrome=panel:GetChild('pileChrome');local heading=chrome:GetChild('heading')\n assert(heading.visible and heading.text=='弃牌堆' and not chrome:GetChild('discardBadge'))\n assert(panel:GetChild('browserDescription').text=='当抽牌堆被抽空时，这里的牌将会被洗牌并重新放入抽牌堆。')"
  },
  {
   "at": 1508,
   "before": " local expected=require('abyss_card_display').combatText(F.Presentation[instance.cardId],definition,instance,preview,host.run.combat)\n assert(label.text==expected and label.text:find('提升2点伤害。',1,true)\n  and select(2,fit(label.text,{label.sizeDeltaX,label.sizeDeltaY})),",
   "after": " local expected=require('abyss_card_display').combatText(F.Presentation[instance.cardId],definition,instance,preview,host.run.combat)\n assert(label.text==expected and label.text:find('基础伤害增加2点。',1,true)\n  and select(2,fit(label.text,{label.sizeDeltaX,label.sizeDeltaY})),"
  }
 ]
});
const officialRuntimePotion=Object.freeze({
 "current": {
  "sha256": "8233feeee38cf2bd954cd9dfe5e6f2dee605d39cb9d3912d3ea5efc9bb92d182",
  "gitBlob": "57150fec3c3750bfaab2abaf6898d614a1dd0789"
 },
 "previous": {
  "sha256": "93fbc38723db2007e0709c368eb3bf89e0f08fd124dad36c52c9c5cd3b089292",
  "gitBlob": "68fe3c7d8a5d215c0ad1e907b67eed0ab5a53e7f"
 },
 "hunks": [
  {
   "at": 459,
   "before": "Damage.potionPreview=function()error('official potion aim simulated the whole battle')end\nlocal h,u,p,event,_,drain=H.setup({'strike','defend'},{'raven_adept'})\nh.run.potions={'fire_potion'};h:refresh()",
   "after": "Damage.potionPreview=function()error('official potion aim simulated the whole battle')end\nlocal h,u,p,event,tap,drain=H.setup({'strike','defend'},{'raven_adept'})\nh.run.potions={'fire_potion'};h:refresh()"
  },
  {
   "at": 464,
   "before": "event('potion1','down',7);event('potion1','drag',7,enemy.x,enemy.y)\nassert(u.potionAim and u.potionAim.moving)\nassert(p:GetChild('dragLayer'):GetChild('aim1').visible)\nassert(not enemy:GetChild('damagePreview').visible)\nassert(h.run.combat.enemies[1].hp==hp)\nevent('dragLayer','up',7,enemy.x,enemy.y);drain()\nassert(h.run.combat.enemies[1].hp==hp-20 and h.run.potions[1]==nil)\nevent('card1','down',8);event('card1','drag',8,enemy.x,enemy.y)\nassert(u.gesture and u.gesture.moving)\nassert(not enemy:GetChild('damagePreview').visible)",
   "after": "event('potion1','down',7);event('potion1','drag',7,enemy.x,enemy.y)\nevent('potion1','up',7,enemy.x,enemy.y);event('potion1','click',7,enemy.x,enemy.y)\nassert(not u.potionAim and not u.potionMenu,'dragged bottle cannot arm or open the menu')\nassert(h.run.potions[1]=='fire_potion' and h.run.combat.enemies[1].hp==hp)\ntap('potion1',8);assert(u.potionMenu and not u.potionAim)\nlocal use=p:GetChild('potionHelp'):GetChild('potionPopup'):GetChild('use')\nuse.listeners.down({touchId=9});use.listeners.up({touchId=9});assert(use.click({touchId=9}))\nassert(u.potionAim and not u.potionAim.moving and not u.potionMenu)\nassert(not p:GetChild('dragLayer').visible,'click-only potion aim must not render the drag arrow')\nassert(not enemy:GetChild('damagePreview').visible)\nassert(h.run.combat.enemies[1].hp==hp)\ntap('enemy1',10);drain()\nassert(h.run.combat.enemies[1].hp==hp-20 and h.run.potions[1]==nil)\nevent('enemy1','click',10)\nassert(h.run.combat.enemies[1].hp==hp-20,'late target click cannot apply potion damage twice')\nlocal strike\nfor index,card in ipairs(h.run.combat.hand)do if card.cardId=='strike'then strike='card'..index;break end end\nassert(strike,'missing actual attack in the hand')\nevent(strike,'down',11);event(strike,'drag',11,enemy.x,enemy.y)\nassert(u.gesture and u.gesture.moving)\nassert(p:GetChild('dragLayer'):GetChild('aim1').visible,'card targeting must retain the arrow')\nassert(not enemy:GetChild('damagePreview').visible)"
  },
  {
   "at": 918,
   "before": "\ntest('official three-bottle HUD renders metadata while popup, drag and use validate fresh core state',t=>{\n runOfficial(t,`",
   "after": "\ntest('official three-bottle HUD renders metadata while click-only use validates fresh core state',t=>{\n runOfficial(t,`"
  },
  {
   "at": 963,
   "before": "assert(not h.run.potions[3] and battle.player.block==12)\n-- In-place pending choice after Down is rejected by the actual drag validator.\nevent('potion1','down',8);battle.pendingChoice={}\ncount=#calls;event('potion1','drag',8,enemy.x,enemy.y)\nassert(#calls>count and not u.potionAim,'potion drag trusted stale metadata')\nassert(h.run.potions[1]=='fire_potion')\nbattle.pendingChoice=nil;event('potion1','up',8)\nCandidate.prepare=prepare",
   "after": "assert(not h.run.potions[3] and battle.player.block==12)\n-- A dragged bottle must remain inert and cannot become a late popup click.\nevent('potion1','down',8);count=#calls\nevent('potion1','drag',8,enemy.x,enemy.y)\nevent('potion1','up',8,enemy.x,enemy.y);event('potion1','click',8,enemy.x,enemy.y)\nassert(#calls==count and not u.potionAim and not u.potionMenu,'dragged bottle entered click-only use')\n-- Fresh action checks still apply when an in-place choice appears after Down.\ntap('potion1',9);assert(u.potionMenu and not u.potionAim)\nlocal use=popup:GetChild('use')\nuse.listeners.down({touchId=10});battle.pendingChoice={}\ncount=#calls;use.listeners.up({touchId=10})\nassert(use.click({touchId=10})==false and #calls>count and not u.potionAim,'Use trusted stale potion metadata')\nassert(u.potionMenu and h.run.potions[1]=='fire_potion','stale Use closed the popup or consumed the bottle')\nbattle.pendingChoice=nil\nlocal dismiss=popup:GetChild('dismiss')\ndismiss.listeners.down({touchId=11});dismiss.listeners.up({touchId=11});assert(dismiss.click({touchId=11}))\nCandidate.prepare=prepare"
  }
 ]
});
const runtimePath='tests/official-assets-runtime.test.mjs';
function previousText(path,source,{current,previous,hunks}){
 const lf=source.replaceAll('\r\n','\n');
 if(lf.includes('\r')||source!==lf&&source!==lf.replaceAll('\n','\r\n')||!exactSourceMatches(lf,current))return source;
 const prior=restoreExactFixtureHunks({path,beforeSha256:previous.sha256,afterSha256:current.sha256,hunks},path,lf);
 assert(exactSourceMatches(prior,previous),'exact deck pointer predecessor: '+path);
 return source===lf?prior:prior.replaceAll('\n','\r\n');
}

export function beforeReleaseDeckPointer(path,raw){
 if(!Object.hasOwn(owners,path))return raw;
 const source=Buffer.isBuffer(raw)?raw.toString('utf8'):raw;
 if(typeof source!=='string'||Buffer.isBuffer(raw)&&!Buffer.from(source).equals(raw))return raw;
 let previous=source;
 if(path===runtimePath)previous=previousText(path,previous,officialRuntimePile);
 previous=previousText(path,previous,owners[path]);
 if(path===runtimePath)previous=previousText(path,previous,officialRuntimePotion);
 return previous===source?raw:Buffer.isBuffer(raw)?Buffer.from(previous):previous;
}
