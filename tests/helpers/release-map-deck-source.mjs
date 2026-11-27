import {authenticateDevelopBackflow} from './develop-release-backflow-source.mjs';
import {authorizeRebasedRelease,beforeRebasedRelease} from './rebased-release-source.mjs';
import {beforeReconciledReleaseSource} from './release-integration-source.mjs';
import {beforeReleaseUiCloseoutSource,ownsReleaseUiCloseoutSource,releaseUiCloseoutPriorRead} from './release-ui-closeout-source.mjs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {beforeLoadingRecoverySource} from './loading-recovery-source.mjs';
import {beforeHotfixMapDeckHelperSource} from './hotfix-map-deck-helper-source.mjs';
import {beforeReleaseDeckPointer} from './release-deck-pointer-source.mjs';

const hash=(bytes,algorithm='sha256')=>createHash(algorithm).update(bytes).digest('hex');
const normalize=source=>source.replaceAll('\r\n','\n');
const blob=source=>hash('blob '+Buffer.byteLength(source)+'\0'+source,'sha1');
const roomArchive=readFileSync(new URL('./release-map-room-source.json.gz',import.meta.url));
assert.equal(hash(roomArchive),'834f71a1a70fe4858c4874497f8f7b46ae02a8f1949041aacc2d91353d190b13','exact map room source archive');
const {base:roomBase,files:roomFiles}=JSON.parse(gunzipSync(roomArchive));
assert.equal(roomBase,'4ac434d02f0479d92d96da75367f4cab98809a17');
for(const [path,{before}] of Object.entries(roomFiles)){
  assert.equal(hash(before.source),before.sha256,path+' room predecessor SHA256');
  assert.equal(blob(before.source),before.gitBlob,path+' room predecessor Git blob');
}
const archive=readFileSync(new URL('./release-map-deck-source.json.gz',import.meta.url));
assert.equal(hash(archive),'8e16866bcec2fdc7628cbc91f7a74f09c18b9f621c6e065b75b2c98a8172a2d4','exact map deck source archive');
const {base,candidate,files}=JSON.parse(gunzipSync(archive));
assert.equal(base,'8af3866714f12abe8d1322f0c2e3cffc623a808b');
assert.equal(candidate,'ac9dcec9f1d6818a340b35075771add6ba6656de');
for(const [path,{before,after}] of Object.entries(files)){
  assert.equal(hash(before.source),before.sha256,path+' predecessor SHA256');
  assert.equal(blob(before.source),before.gitBlob,path+' predecessor Git blob');
  assert.match(after.sha256,/^[a-f0-9]{64}$/);
  assert.match(after.gitBlob,/^[a-f0-9]{40}$/);
}

function current(source,binding){
  if(typeof source!=='string'||source.includes('\r\r\n'))return false;
  const text=normalize(source);
  return hash(text)===binding.sha256&&blob(text)===binding.gitBlob;
}

// Continue the archived map-deck replay across the later production UI changes.
const hotfixArchive=readFileSync(new URL('./release-map-deck-hotfix-source.json.gz',import.meta.url));
assert.equal(hash(hotfixArchive),'d7eb0367f9c7e44137da2d2b12b174867b54c86f9d3969e015bf85a0c5be33e4','exact hotfix map deck archive');
const {base:hotfixBase,current:hotfixHead,files:hotfixFiles}=JSON.parse(gunzipSync(hotfixArchive));
assert.equal(hotfixBase,'5a972c7371d0217ce4d9806df35ba1464c50f40f');
assert.equal(hotfixHead,'3a183740e22de90a01d809cca13f92bc1ee345c1');
const deckLayout='scripts/deck-ui-layout.mjs';
assert.deepEqual(Object.keys(hotfixFiles).sort(),[...Object.keys(files),deckLayout].sort());
for(const [path,{before}] of Object.entries(hotfixFiles))assert(current(before.source,before),'exact hotfix map deck predecessor: '+path);

function hotfixPriorRead(read){
  for(const [owner,{after}] of Object.entries(hotfixFiles)){
    let live;
    try{live=read(owner,'utf8');}catch{assert.fail('map deck linked owner missing: '+owner);}
    const source=Buffer.isBuffer(live)?live.toString('utf8'):live;
    const label=owner===deckLayout?'Forethought':'map deck';
    assert(current(source,after),label+' linked owner identity: '+owner);
  }
  return (path,encoding)=>{
    if(!Object.hasOwn(hotfixFiles,path))return read(path,encoding);
    const source=hotfixFiles[path].before.source;
    return encoding?source:Buffer.from(source);
  };
}

const forethoughtSources=Object.freeze({
  "src/lua/abyss_deck_ui.lua": {
    before: {"sha256": "f361dc43c095aa9e4497bda4e758c161a5110978c33b4c0a89792815859aaac2", "gitBlob": "04033812db991fe1e86c8becf1017f4a689033d8"},
    after: {"sha256": "07a324f7e75903a2ff6382b9b846f7ecd67f78871d90c30cdb1a369dbc7b50bf", "gitBlob": "b71aee53556b1ac44ab8c406b61fdfcf886cb1dc"},
    fragments: [
      ["local cardChoiceTitle=\"选择卡牌\"\n", ""],
      ["    local function updateForethoughtChoice(choice, token)\n        if not self.visible or self.choiceToken~=token or self.battle.pendingChoice~=choice or choice.token==token then\n            return false\n        end\n        self.choiceToken,self.choiceSelected=choice.token,choice.selected\n        root:GetChild('title').text=cardChoiceTitle..' · 已选'..#choice.selected\n        return true\n    end\n    local function isForethoughtToggle(choice)\n        local item=choice.item\n        return choice.multiple and choice.op=='colorless' and item and item.effect.kind=='forethought'\n    end\n    local function pickChoice(control,binding,repaint)\n        local callback,token,uid=self.onPick,self.choiceToken,binding.uid\n        local choice=self.battle.pendingChoice\n        if callback and isForethoughtToggle(choice) then\n            local ok,reason=callback(token,uid)\n            if updateForethoughtChoice(choice,token) and control.alive~=false then\n                repaint(control,binding.instance,self.catalog)\n            end\n            return ok,reason\n        end\n        self:close()\n        if callback then callback(token,uid) end\n    end\n", ""],
      ["                return pickChoice(control,b,fill)\n", "                local callback,token,uid=self.onPick,self.choiceToken,b.uid\n                self:close()\n                if callback then callback(token,uid) end\n"],
      ["colorless=cardChoiceTitle,exhaustChoose", "colorless='选择卡牌',exhaustChoose"],
    ],
  },
  "scripts/deck-ui-layout.mjs": {
    before: {"sha256": "f43c5472a1afacf23e8b2a908fa7eb5082e561314c90abbb65d7ccd7ca799d85", "gitBlob": "161be4cb01025636d544391d612e6170f081eba1"},
    after: {"sha256": "37919d2a0abf089e7d0b9c449b5168829eb0aba80d944f5fb7c55cb11815d101", "gitBlob": "bd59f85d8c3652a76d958530b6f34a45ac64d0ca"},
    fragments: [
      ["  const closeFrame = [...l.deckView.close];\n  closeFrame[2] = Math.max(closeFrame[2], 4 * f.label + 2 * s.s);\n", ""],
      ["      button('close', closeFrame, '关闭'),\n", "      button('close', l.deckView.close, '关闭'),\n"],
    ],
  },
});

function assertForethoughtOwners(owners,read,matches=current){
  for(const [owner,{after}] of Object.entries(owners)){
    let live;
    try{live=read(owner,'utf8');}catch{assert.fail('Forethought linked owner missing: '+owner);}
    assert(matches(live,after),'Forethought linked owner identity: '+owner);
  }
}

function restoreForethoughtSource(path,source,row){
  let prior=normalize(source);
  for(const [after,before] of row.fragments)prior=prior.replace(after,()=>before);
  assert(current(prior,row.before),'exact Forethought predecessor: '+path);
  return source.includes('\r\n')?prior.replaceAll('\n','\r\n'):prior;
}

function beforeForethoughtSource(path,source,read){
  const row=Object.hasOwn(forethoughtSources,path)&&forethoughtSources[path];
  if(!row||!current(source,row.after))return source;
  assertForethoughtOwners(forethoughtSources,read);
  return restoreForethoughtSource(path,source,row);
}

// The reviewed production return supersedes both Forethought owners. Its
// direct Release view still precedes the older Develop map/deck replay.
const productionForethoughtSources=Object.freeze({
  'src/lua/abyss_deck_ui.lua':{after:{
    sha256:'336fe6d4612a719aec256b0dd1d9ece3799e40fc3b02d748a0a76653ed5a0436',
    gitBlob:'7b6afe38cf1fbf7c64ec72037aa5276696a74c59',
  }},
  [deckLayout]:{after:{
    sha256:'fac26c8413f7aa98e7d20f44077fb2f05c984ce9bb5b2f82408795e7c8533325',
    gitBlob:'9a7f5a8d21fa581fa82d9bfa2c164f81eade02cd',
  }},
});
const productionMapDeckSources=Object.freeze({
  'src/lua/abyss_card_skin.lua':{after:{
    sha256:'6ed79b9a09a85782f448f0a20db9c38002ff6d83cd405f80e987e56753fbbf1a',
    gitBlob:'8f9592caff303a00226228b5c6b8a368ac94d5de',
  }},
  'src/lua/abyss_deck_ui.lua':productionForethoughtSources['src/lua/abyss_deck_ui.lua'],
  'src/lua/abyss_game_ui_view.lua':{after:{
    sha256:'b64cc28d1242af7fd219d1ccce46c9a043f42e3f602772e775896f3ea28fdf84',
    gitBlob:'d865b4d6b0d4e8b6043b9e84f6a595b2d7f78bc6',
  }},
  'src/lua/abyss_map_ui.lua':{after:{
    sha256:'645764d987cb57f2cf57db066eeb3e99de967d248b9efabbd3cf65269e7dd379',
    gitBlob:'12e42d8d0abe7607b8526d7b89b2e2fc80c92ced',
  }},
});
const restoredUpgradeLabel={sha256:'fb8ca6270444a5eaed5fff5ce797b469b01ff53e882a40c13c85374890921b06',
  gitBlob:'22359b12e6164a4fde5ae9302eef823b5df257dd'};
function uniformCurrent(source,binding){
  if(!current(source,binding))return false;
  const lf=normalize(source);
  return source===lf||source===lf.replaceAll('\n','\r\n');
}

function assertProductionMapDeckOwners(path,source,read){
  if(!Object.hasOwn(productionMapDeckSources,path)||!uniformCurrent(source,productionMapDeckSources[path].after))return;
  for(const [name,{after}] of Object.entries(productionMapDeckSources)){
    let live;
    try{live=read(name,'utf8');}catch{assert.fail('map deck linked owner missing: '+name);}
    assert(uniformCurrent(live,after),'map deck linked owner identity: '+name);
  }
  return true;
}

function beforeProductionForethought(path,source,read){
  const row=Object.hasOwn(productionForethoughtSources,path)&&productionForethoughtSources[path];
  if(!row||(!uniformCurrent(source,row.after)&&!(path===deckLayout&&uniformCurrent(source,restoredUpgradeLabel))))return source;
  assertForethoughtOwners(productionForethoughtSources,read,(live,binding)=>uniformCurrent(live,binding)
    ||(binding===productionForethoughtSources[deckLayout].after&&uniformCurrent(live,restoredUpgradeLabel)));
  let prior=files[path]?.before.source;
  if(path===deckLayout){
    const forethought=forethoughtSources[path];
    const released=hotfixFiles[path].before.source.replace(
      "battlePileReturn(button('pileReturn',[-550,-237,180,54],'返回'),theme.officialAssets.buttonInk)",
      "battlePileReturn(button('pileReturn',[-550,-237,180,54],'返回'),true,undefined,theme.officialAssets.buttonInk)",
    );
    assert(current(released,forethought.after),'exact published Forethought layout');
    prior=restoreForethoughtSource(path,released,forethought);
  }
  return source.includes('\r\n')?prior.replaceAll('\n','\r\n'):prior;
}

export function beforeMapRoomSource(path,source){
  const row=Object.hasOwn(roomFiles,path)?roomFiles[path]:null;
  if(!row||!current(source,row.after))return source;
  return source.includes('\r\n')?row.before.source.replaceAll('\n','\r\n'):row.before.source;
}

export function beforeMapDeckSource(path,source,read){
 const deckPath='src/lua/abyss_deck_ui.lua';
 const rawRead=read;
 source=path===deckPath?beforeReleaseDeckPointer(path,source):source;
 read=(owner,...args)=>owner===deckPath?beforeReleaseDeckPointer(owner,rawRead(owner,...args)):rawRead(owner,...args);
  if(assertProductionMapDeckOwners(path,source,read)&&path==='src/lua/abyss_map_ui.lua'){
    const prior=files[path].before.source;
    return source.includes('\r\n')?prior.replaceAll('\n','\r\n'):prior;
  }
  const forethoughtPrior=beforeProductionForethought(path,source,read);
  if(forethoughtPrior!==source)return forethoughtPrior;
  const readBackflow=read;
  source=authenticateDevelopBackflow(path,source,owner=>readBackflow(owner,'utf8'));
  read=(owner,encoding)=>authenticateDevelopBackflow(owner,readBackflow(owner,encoding),p=>readBackflow(p,'utf8'));
  const rebound=beforeRebasedRelease(path,source);
  if(rebound!==source)authorizeRebasedRelease([[path,source]],owner=>read(owner,'utf8'));
  source=beforeReconciledReleaseSource(path,rebound);
  const helper=beforeHotfixMapDeckHelperSource(path,source);
  if(helper!==source)return helper;
  if(Object.hasOwn(hotfixFiles,path)&&current(source,hotfixFiles[path].after)){
    const priorRead=hotfixPriorRead(read);
    const prior=beforeMapDeckSource(path,priorRead(path,'utf8'),priorRead);
    return source.includes('\r\n')?prior.replaceAll('\n','\r\n'):prior;
  }
  const closeout=beforeReleaseUiCloseoutSource(path,source,read);
  const currentCloseout=closeout!==source;
  const closeoutRead=releaseUiCloseoutPriorRead(read,currentCloseout?path:undefined);
  const forethought=Object.hasOwn(forethoughtSources,path)&&current(closeout,forethoughtSources[path].after);
  source=beforeMapRoomSource(path,beforeLoadingRecoverySource(path,beforeForethoughtSource(path,closeout,closeoutRead)));
  if(!Object.hasOwn(files,path)||!current(source,files[path].after))return source;
  for(const [owner,{after}] of Object.entries(files)){
    let live;
    try{live=read(owner,'utf8');}catch{assert.fail('map deck linked owner missing: '+owner);}
    const text=beforeReconciledReleaseSource(owner,beforeRebasedRelease(owner,typeof live==='string'?live:live?.toString('utf8')));
    const input=beforeReleaseUiCloseoutSource(owner,text,read,currentCloseout);
    if(forethought&&Object.hasOwn(forethoughtSources,owner))assert(current(input,forethoughtSources[owner].after),'fresh Forethought linked owner: '+owner);
    const prior=beforeMapRoomSource(owner,beforeLoadingRecoverySource(owner,beforeForethoughtSource(owner,input,closeoutRead)));
    assert(current(prior,after),'map deck linked owner identity: '+owner);
  }
  const prior=files[path].before.source;
  return source.includes('\r\n')?prior.replaceAll('\n','\r\n'):prior;
}

export function mapDeckPriorRead(read){
  return (path,encoding)=>{
    const value=read(path,encoding);
    if(typeof value==='string')return beforeMapDeckSource(path,value,read);
    if(!Buffer.isBuffer(value)||(!Object.hasOwn(files,path)&&!Object.hasOwn(roomFiles,path)&&!ownsReleaseUiCloseoutSource(path)&&!Object.hasOwn(forethoughtSources,path)))return value;
    const text=value.toString('utf8'),prior=beforeMapDeckSource(path,text,read);
    return prior===text?value:Buffer.from(prior);
  };
}
