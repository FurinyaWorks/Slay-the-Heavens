import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {restoreExactFixtureHunks} from './exact-fixture-hunks.mjs';
import {exactSourceMatches} from './source-fingerprint.mjs';

// Invert only the approved changes on develop since the selection PR's base.
// The older entrance archive still authenticates the reconstructed owners.
const archive=readFileSync(new URL('./ui-entrance-approved-sources.json',import.meta.url),'utf8').replaceAll('\r\n','\n');
assert.equal(createHash('sha256').update(archive).digest('hex'),
 '58ea26de5268bc427bce73ecfb1ff43930f54b987c97777f9843e74d3467fe6d','approved entrance owner transformations');
const {owners}=JSON.parse(archive);
const bindings=new Map(owners.map(row=>[row.path,row]));

export function beforeApprovedUiEntrance(path,source){
 source=beforeNativePrologueOwner(path,source);
 const row=bindings.get(path);
 if(!row)return source;
 const prior=restoreExactFixtureHunks(row,path,source);
 return prior!==source&&source.includes('\r\n')?prior.replaceAll('\n','\r\n'):prior;
}

export function matchesApprovedUiEntranceOwner(path,source){
 return !bindings.has(path)||beforeApprovedUiEntrance(path,source)!==source;
}

// #1035 changes the two archived entrance owners as a single native-button fix.
const nativePrologueOwners=Object.freeze({
 "src/lua/abyss_node_ui_feedback.lua": {
  "previous": {
   "sha256": "b29f9b744bcc148990ee07c43abfef7edc33df38e8e47fab755bec13e8f08ff0",
   "gitBlob": "1b2cb6f0b0fd155e0e7b20716f9a9c4d4afcf55e"
  },
  "current": {
   "sha256": "c250e4151120fe75561cb8be053735bd199e377a2d3bcd15bb20c6acb9c46098",
   "gitBlob": "e3e57123fb2ff3fc20316bf88db04d5519fdb448"
  },
  "hunks": [
   {
    "at": 87,
    "before": "\n-- Installs the feedback responsibility on one node UI instance.\nfunction M.install(ctx)\n    ctx.buttonLooks, ctx.buttonHover, ctx.buttonPress = {}, nil, nil\n\n    function ctx.paintButton(box)\n        local look = ctx.buttonLooks[box]\n        if not look then return end -- a never-shown view can still receive a late native exit",
    "after": "\nlocal function nativeId(box) return box.id end\n\n-- Installs the feedback responsibility on one node UI instance.\nfunction M.install(ctx)\n    local buttonLooks = {}\n    ctx.buttonHover, ctx.buttonPress = nil, nil\n\n    local function buttonKey(box)\n        -- The native host can return a fresh Lua wrapper on each GetChild.\n        local ok,id = pcall(nativeId,box)\n        if ok and (type(id) == 'string' or (type(id) == 'number' and id == id)) then return id end\n        return box\n    end\n\n    function ctx.buttonLook(box)\n        local look = buttonLooks[buttonKey(box)]\n        if look and look.box == box then return look end\n    end\n\n    function ctx.paintButton(box)\n        local look = ctx.buttonLook(box)\n        if not look then return end -- a never-shown view can still receive a late native exit"
   },
   {
    "at": 178,
    "before": "        for _, input in pairs(ctx.buttonInputs) do input.active, input.released = {}, nil end\n        for box in pairs(ctx.buttonLooks) do ctx.paintButton(box) end\n    end",
    "after": "        for _, input in pairs(ctx.buttonInputs) do input.active, input.released = {}, nil end\n        for _, look in pairs(buttonLooks) do ctx.paintButton(look.box) end\n    end"
   },
   {
    "at": 182,
    "before": "    function ctx.state(box, enabled, selected, primary)\n        ctx.buttonLooks[box] = {enabled=enabled == true, selected=selected == true, primary=primary == true}\n        ctx.paintButton(box)",
    "after": "    function ctx.state(box, enabled, selected, primary)\n        buttonLooks[buttonKey(box)] = {box=box, enabled=enabled == true, selected=selected == true, primary=primary == true}\n        ctx.paintButton(box)"
   }
  ]
 },
 "src/lua/abyss_node_ui_input.lua": {
  "previous": {
   "sha256": "57595d1bca4fb33eed373d36b51219cb6f5ca42f9dbfce2910e93f73323ae1f5",
   "gitBlob": "208140d36c0dd1ce990d25f691f9e63d3c8e28f5"
  },
  "current": {
   "sha256": "c2dd463393b5287f6ecfcb21203d12c1e9de55fbbeff63bd20e27ea3a3111d43",
   "gitBlob": "87809b902ae8a3fc6619c4ba15bf2f405e213db0"
  },
  "hunks": [
   {
    "at": 167,
    "before": "                    local function available()\n                        local entry, look = visibleAction(), ctx.buttonLooks[box]\n                        -- Guarded mandatory-picker cards have no framed-button look.",
    "after": "                    local function available()\n                        local entry, look = visibleAction(), ctx.buttonLook(box)\n                        -- Guarded mandatory-picker cards have no framed-button look."
   }
  ]
 }
});
function beforeNativePrologueOwner(path,source){
 if(!Object.hasOwn(nativePrologueOwners,path)||typeof source!=='string')return source;
 const lf=source.replaceAll('\r\n','\n');
 if(lf.includes('\r')||(source!==lf&&source!==lf.replaceAll('\n','\r\n')))return source;
 const owner=nativePrologueOwners[path];
 if(!exactSourceMatches(lf,owner.current))return source;
 const prior=restoreExactFixtureHunks({path,beforeSha256:owner.previous.sha256,afterSha256:owner.current.sha256,hunks:owner.hunks},path,lf);
 assert(exactSourceMatches(prior,owner.previous),'exact Prologue entrance owner predecessor: '+path);
 return source===lf?prior:prior.replaceAll('\n','\r\n');
}
