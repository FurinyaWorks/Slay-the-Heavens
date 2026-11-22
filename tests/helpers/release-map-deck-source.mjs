import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';

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

function beforeForethoughtSource(path,source,read){
  const row=Object.hasOwn(forethoughtSources,path) && forethoughtSources[path];
  if(!row || !current(source,row.after))return source;
  for(const [owner,binding] of Object.entries(forethoughtSources)){
    let live;
    try{live=read(owner,'utf8');}catch{assert.fail('Forethought linked owner missing: '+owner);}
    assert(current(live,binding.after),'Forethought linked owner identity: '+owner);
  }
  let prior=normalize(source);
  for(const [after,before] of row.fragments)prior=prior.replace(after,()=>before);
  assert(current(prior,row.before),'exact Forethought predecessor: '+path);
  return source.includes('\r\n')?prior.replaceAll('\n','\r\n'):prior;
}

export function beforeMapRoomSource(path,source){
  const row=roomFiles[path];
  if(!row||!current(source,row.after))return source;
  return source.includes('\r\n')?row.before.source.replaceAll('\n','\r\n'):row.before.source;
}

export function beforeMapDeckSource(path,source,read){
  source=beforeMapRoomSource(path,beforeForethoughtSource(path,source,read));
  if(!Object.hasOwn(files,path)||!current(source,files[path].after))return source;
  for(const [owner,{after}] of Object.entries(files)){
    let live;
    try{live=read(owner,'utf8');}catch{assert.fail('map deck linked owner missing: '+owner);}
    const text=typeof live==='string'?live:live?.toString('utf8');
    const prior=beforeMapRoomSource(owner,beforeForethoughtSource(owner,text,read));
    assert(current(prior,after),'map deck linked owner identity: '+owner);
  }
  const prior=files[path].before.source;
  return source.includes('\r\n')?prior.replaceAll('\n','\r\n'):prior;
}

export function mapDeckPriorRead(read){
  return (path,encoding)=>{
    const value=read(path,encoding);
    if(typeof value==='string')return beforeMapDeckSource(path,value,read);
    if(!Buffer.isBuffer(value)||(!Object.hasOwn(files,path)&&!Object.hasOwn(roomFiles,path)&&!Object.hasOwn(forethoughtSources,path)))return value;
    const text=value.toString('utf8'),prior=beforeMapDeckSource(path,text,read);
    return prior===text?value:Buffer.from(prior);
  };
}
