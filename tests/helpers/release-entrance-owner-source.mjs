import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {restoreExactFixtureHunks} from './exact-fixture-hunks.mjs';
import {exactSourceMatches} from './source-fingerprint.mjs';

// #1035's actual merge onto #1008 changed all four native button owners.
// Live Selection reads bind that complete change before older inverses run.
const prologueButtonSources=Object.freeze({
 "src/lua/abyss_node_ui_camp_actions.lua": {
  "current": {
   "sha256": "b90a96f31530eac70d5b1e8398d911452b5fc6c76e9b46d7a43f3cb9087adca1",
   "gitBlob": "d9c99f32a67c6f364af710db59af55a4847b8c09"
  },
  "previous": {
   "sha256": "86aed75b3c81775560275deaa280f947f51413bcf1cdab633dc5e82c7c0d755d",
   "gitBlob": "8486ff03d67126738224f455c2bdc89a2b8bd897"
  },
  "hunks": [
   {
    "at": 162,
    "before": "            local attached = ctx.root:GetChild(\"confirm\") == confirm\n            local hostAttached = not ctx.rootParent or ctx.rootParent:GetChild(\"nodePanel\") == ctx.root\n            local look, parent = ctx.buttonLooks[confirm], confirm\n            if not attached or confirm.parent ~= ctx.root or not look or not look.enabled or look.selected then return false end\n            while parent do",
    "after": "            local attached = ctx.root:GetChild(\"confirm\") == confirm\n            local hostAttached = not ctx.rootParent or ctx.rootParent:GetChild(\"nodePanel\") == ctx.root\n            local look, parent = ctx.buttonLook(confirm), confirm\n            if not attached or confirm.parent ~= ctx.root or not look or not look.enabled or look.selected then return false end\n            while parent do"
   }
  ]
 },
 "src/lua/abyss_node_ui_feedback.lua": {
  "current": {
   "sha256": "0342c0449968775ec2ac95ea4b82323a7a11cdf0ae3757d22be5f09bce896a86",
   "gitBlob": "c882a9c47d1f58a5ce4b9f52883bdefeb1d35575"
  },
  "previous": {
   "sha256": "c039727c9b053f958e6fbfa22450e3e90d1214fc1e0262da812f0088861be797",
   "gitBlob": "664c377ce3fd492c93b9c9be35eacbe2b284bcf3"
  },
  "hunks": [
   {
    "at": 91,
    "before": "end\n\n-- Installs the feedback responsibility on one node UI instance.\nfunction M.install(ctx)\n    ctx.buttonLooks, ctx.buttonHover, ctx.buttonPress = {}, nil, nil\n\n    function ctx.paintButton(box)\n        local look = ctx.buttonLooks[box]\n        if not look then return end -- a never-shown view can still receive a late native exit\n        local enabled = look.enabled and not look.selected",
    "after": "end\n\nlocal function nativeId(box) return box.id end\n\n-- Installs the feedback responsibility on one node UI instance.\nfunction M.install(ctx)\n    local buttonLooks = {}\n    ctx.buttonHover, ctx.buttonPress = nil, nil\n\n    local function buttonKey(box)\n        -- The native host can return a fresh Lua wrapper on each GetChild.\n        local ok,id = pcall(nativeId,box)\n        if ok and (type(id) == 'string' or (type(id) == 'number' and id == id)) then return id end\n        return box\n    end\n\n    function ctx.buttonLook(box)\n        local look = buttonLooks[buttonKey(box)]\n        if look and look.box == box then return look end\n    end\n\n    function ctx.paintButton(box)\n        local look = ctx.buttonLook(box)\n        if not look then return end -- a never-shown view can still receive a late native exit\n        local enabled = look.enabled and not look.selected"
   },
   {
    "at": 182,
    "before": "        ctx.self.inspectPress=nil\n        for _, input in pairs(ctx.buttonInputs) do input.active, input.released = {}, nil end\n        for box in pairs(ctx.buttonLooks) do ctx.paintButton(box) end\n    end\n\n    function ctx.state(box, enabled, selected, primary)\n        ctx.buttonLooks[box] = {enabled=enabled == true, selected=selected == true, primary=primary == true}\n        ctx.paintButton(box)\n    end",
    "after": "        ctx.self.inspectPress=nil\n        for _, input in pairs(ctx.buttonInputs) do input.active, input.released = {}, nil end\n        for _, look in pairs(buttonLooks) do ctx.paintButton(look.box) end\n    end\n\n    function ctx.state(box, enabled, selected, primary)\n        buttonLooks[buttonKey(box)] = {box=box, enabled=enabled == true, selected=selected == true, primary=primary == true}\n        ctx.paintButton(box)\n    end"
   }
  ]
 },
 "src/lua/abyss_node_ui_input.lua": {
  "current": {
   "sha256": "c2dd463393b5287f6ecfcb21203d12c1e9de55fbbeff63bd20e27ea3a3111d43",
   "gitBlob": "87809b902ae8a3fc6619c4ba15bf2f405e213db0"
  },
  "previous": {
   "sha256": "57595d1bca4fb33eed373d36b51219cb6f5ca42f9dbfce2910e93f73323ae1f5",
   "gitBlob": "208140d36c0dd1ce990d25f691f9e63d3c8e28f5"
  },
  "hunks": [
   {
    "at": 166,
    "before": "                    end\n                    local function available()\n                        local entry, look = visibleAction(), ctx.buttonLooks[box]\n                        -- Guarded mandatory-picker cards have no framed-button look.\n                        -- Keep the legacy feedback path for all other controls unchanged.",
    "after": "                    end\n                    local function available()\n                        local entry, look = visibleAction(), ctx.buttonLook(box)\n                        -- Guarded mandatory-picker cards have no framed-button look.\n                        -- Keep the legacy feedback path for all other controls unchanged."
   }
  ]
 },
 "src/lua/abyss_node_ui_treasure.lua": {
  "current": {
   "sha256": "b9f7cc738c288cf387892e87338dc28aae48ed31653c37a99c104cf3636b87c3",
   "gitBlob": "56545e3fb92f6adc492f84bd1ad6327abedc05c5"
  },
  "previous": {
   "sha256": "5ddd6c906ec0822f80fefc13c8e044078935c72fe71226771d95987e3f7419b2",
   "gitBlob": "c1187e64f63121b925852c00e5483e166ca2fe6c"
  },
  "hunks": [
   {
    "at": 25,
    "before": "                    if not link.child or link.child.parent ~= link.owner then return false end\n                end\n                look, parent = ctx.buttonLooks[box], box\n                if control ~= box or box.parent ~= sourceParent or not look or not look.enabled or look.selected then return false end\n                while parent do",
    "after": "                    if not link.child or link.child.parent ~= link.owner then return false end\n                end\n                look, parent = ctx.buttonLook(box), box\n                if control ~= box or box.parent ~= sourceParent or not look or not look.enabled or look.selected then return false end\n                while parent do"
   }
  ]
 }
});

const portraitArchive=readFileSync(new URL('../fixtures/selection-portrait-recovery-source.json.gz',import.meta.url));
assert.equal(createHash('sha256').update(portraitArchive).digest('hex'),
 'a24db4522db31669259bec007f6ab458419ea8b20abcd8a45dc37c29f3270e79','exact Selection portrait recovery archive');
const {base:portraitBase,reviewedSource:portraitReview,files:portraitSources}=JSON.parse(gunzipSync(portraitArchive));
assert.equal(portraitBase,'da5eabf33899f4b8254a923b0a010f5aa870eb9e');
assert.equal(portraitReview,'fb7e44ca1c7ec880adfab8d05a6924c1bee3ee0e');

const ownerGroups=[
 {owners:prologueButtonSources,label:'prologue button'},
 {owners:portraitSources,label:'Selection portrait'},
];
const ownerGroup=path=>ownerGroups.find(({owners})=>Object.hasOwn(owners,path));
export const releaseEntranceOwns=path=>ownerGroup(path)!==undefined;

function uniformText(raw){
 const source=Buffer.isBuffer(raw)?raw.toString('utf8'):raw;
 if(typeof source!=='string'||Buffer.isBuffer(raw)&&!Buffer.from(source).equals(raw))return;
 const lf=source.replaceAll('\r\n','\n');
 if(!lf.includes('\r')&&(source===lf||source===lf.replaceAll('\n','\r\n')))return source;
}

export function beforeReleaseEntranceOwner(path,raw){
 const binding=ownerGroup(path)?.owners[path];
 if(!binding)return raw;
 const text=uniformText(raw);
 if(!exactSourceMatches(text,binding.current))return raw;
 const prior=restoreExactFixtureHunks({path,beforeSha256:binding.previous.sha256,
  afterSha256:binding.current.sha256,hunks:binding.hunks},path,text);
 assert(exactSourceMatches(prior,binding.previous),'exact release entrance predecessor: '+path);
 const previous=text.includes('\r\n')?prior.replaceAll('\n','\r\n'):prior;
 return Buffer.isBuffer(raw)?Buffer.from(previous):previous;
}

export function checkedReleaseEntranceOwner(path,raw,read){
 const group=ownerGroup(path);
 if(!group)return raw;
 for(const [owner,binding] of Object.entries(group.owners)){
  const source=uniformText(owner===path?raw:read(owner,'utf8'));
  assert(exactSourceMatches(source,binding.current),'fresh '+group.label+' owner: '+owner);
 }
 return beforeReleaseEntranceOwner(path,raw);
}

export function readReleaseEntrancePredecessor(path,raw,read){
 return beforeReleaseEntranceOwner(path,raw)===raw?raw:checkedReleaseEntranceOwner(path,raw,read);
}
