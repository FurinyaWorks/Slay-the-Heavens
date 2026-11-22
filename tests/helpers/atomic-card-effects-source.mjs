// Exact inverse of the card-effect hotfix for historical source replays.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

const hash=text=>createHash('sha256').update(text).digest('hex');
const normalize=text=>text.replaceAll('\r\n','\n');
const bindings={
 "src/lua/abyss_battle_actions.lua": {
  "current": "a2b1db101e8c13623f3aeb414a1cc4e4aa8eb1a186d6cc12c8eb45abee016b43",
  "prior": "1c087681aba872ef7744f31fab1b15c56aa4c1f303f3ac493dcf4a6e9df335a2",
  "restore": [
   [
    13,
    20,
    ""
   ],
   [
    57,
    58,
    "    local function perform(command, origin, clearPlayedSelection)\n"
   ],
   [
    74,
    78,
    "            if not called then print(\"ABYSS_FEEDBACK command_failed \" .. tostring(ok)) end\n"
   ],
   [
    200,
    201,
    "            Theme.presentationProfile=='official-assets-first')\n"
   ]
  ]
 },
 "src/lua/abyss_effects.lua": {
  "current": "f220d8b82875bde72e4f1442bb25743f72a53ece84d8bfe2b4ad278625f16181",
  "prior": "0856df7af9ce8c7c43e35a84301c2359b672887e6ca4ca4640578e4c9e562228",
  "restore": [
   [
    123,
    141,
    ""
   ]
  ]
 },
 "src/lua/abyss_combat_native_play.lua": {
  "current": "640bbd909794bd49a3df6395c38ad49819fc59df75545bfe0c6b70fe6b3c9592",
  "prior": "539c3a339016f9497b77f11daed7e0db0378f3e2fcb0923a2ebd39547881c6ec",
  "restore": [
   [
    5,
    6,
    ""
   ],
   [
    68,
    73,
    "    for i,effect in ipairs(card.effects)do\n        if not(effect.targetGroup and card.effects[i-1]and card.effects[i-1].targetGroup)then\n            local e=prepareEffect(combat,state,copy(effect),targetIndex,x,card,free)\n            if e.targetGroup then e={op='effectBatch',effects={e,copy(card.effects[i+1])}}end\n            if e.times=='X'then e.times=x+ShopRelicsQueries.xBonus(state);if e.times==0 then e=nil end end\n            if e then items[#items+1]=e end\n        end\n"
   ]
  ]
 },
 "src/lua/abyss_combat_queued_play.lua": {
  "current": "c62037dc50132b085aa5f97f5a75fde47f0478f7595864663dfce41c8d70713d",
  "prior": "30c181220820118b505bee3fe5c94eaaac3b0e542bc8bb519f05c8fff22fd728",
  "restore": [
   [
    163,
    170,
    "    for _,effect in ipairs(effects)do\n        for _,prepared in ipairs(require('abyss_watcher_attack_cards').prepareEffect(state,effect,watcherActorHost))do\n            appendEffect(actions,prepareQueued(combat,state,prepared,target,instance,uid))\n"
   ]
  ]
 }
};

export function beforeAtomicCardEffects(path,source){
 const binding=bindings[path];
 if(!binding||typeof source!=='string'||hash(normalize(source))!==binding.current)return source;
 const lines=normalize(source).match(/[^\n]*\n|[^\n]+$/g);
 for(const [start,end,old] of [...binding.restore].reverse())lines.splice(start,end-start,old);
 const prior=lines.join('');
 assert.equal(hash(prior),binding.prior,'exact card-effect hotfix predecessor: '+path);
 return source.includes('\r\n')?prior.replaceAll('\n','\r\n'):prior;
}

export function authenticateAtomicCardEffects(path,source,read){
 const prior=beforeAtomicCardEffects(path,source);
 if(prior!==source){
  const live=read(path);
  assert(typeof live==='string'&&normalize(live)===normalize(source),'combined linked owner identity: '+path+' during card-effect hotfix validation');
 }
 return prior;
}
