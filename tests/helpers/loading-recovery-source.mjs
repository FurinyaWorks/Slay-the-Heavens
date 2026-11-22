// Exact full-file continuation for historical receipts; live product tests use current code.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const hash=source=>createHash('sha256').update(source).digest('hex');
const sources={
  'src/lua/abyss_game_ui.lua':{
    after:'8ec5367dc26ea6dc4a916f873984629cba75b4d33b6ad6cbf0d0a0dc7f3f952f',
    before:'b0d51fcb3dc7e07bd1d50e75397741df277dd5bf9734ffdb9bc7e3c76c33eef1',
    edits:[
      ["        local function canRecover()return self.pageReveal.state=='failed' and not self.exitOpen end\n",''],
      ["            if not canRecover()then return false end","            if not self.pageReveal:covered() or self.exitOpen then return false end"],
      ["Controller.bind(controller,cancel,'pageReveal',leave,canRecover,1)","Controller.bind(controller,cancel,'pageReveal',leave,function()return self.pageReveal:covered() and not self.exitOpen end,1)"],
    ],
  },
  'src/lua/abyss_game_ui_view.lua':{
    after:'139eb5b671ede441215a09cd0a6cd1b44eb27703bc692db171d9b036383b41c1',
    before:'9d5bdaf3ec9a6b3cf8d62b4c6d57128215a38ab20c3d240022af3ca333a1da63',
    edits:[["then scope=self.pageReveal.state=='failed' and 'pageReveal' or 'blocked'","then scope='pageReveal'"]],
  },
  'src/lua/abyss_page_reveal.lua':{
    after:'af170c250864541ebcb2d3a672dc062777d963d2138d5e42b1e5170ab67fc699',
    before:'11c445d81dc6687b06d6b8d617f524740ee3da92264d3400bb54019c0a8adc61',
    edits:[
      ["        local recovery=cover:GetChild('cancel')\n        if self.epoch~=ticket then return false end\n        if recovery then recovery:SetVisible(false)end\n        if self.epoch~=ticket then return false end\n",''],
      ["            if self:request(intent) and reason then return reject(self,tostring(reason))end", "            self:request(intent)\n            if reason then return reject(self,tostring(reason))end"],
      ["    function gate:paint(raise)\n        local ticket=self.epoch\n", "    function gate:paint(raise)\n"],
      ["        local recovery=cover:GetChild('cancel')\n        if self.epoch~=ticket then return false end\n        if recovery then recovery:SetVisible(self.state=='failed')end\n",''],
      ["        self.error=nil\n        if value~=true",'        if value~=true'],
    ],
  },
  'tests/sts-page-reveal.test.mjs':{
    after:'36bb93baad36b0861c04859afaceec559a263b565885f65cf079e072e4e77a93',
    before:'594e4a40b4cfdb98178c15ff211a07457a8c18615379d524a722b22eb22c790c',
    edits:[
      ["\nfor _,operation in ipairs({'lookup','visibility'})do\n local nested,events,trigger=nil,{},true\n local replacement={page='mapPanel',run={}}\n local function reenter()\n  if not trigger then return end\n  trigger=false\n  assert(nested:request(replacement))\n end\n local recovery={SetVisible=function()if operation=='visibility'then reenter()end end}\n local native={SetVisible=function()end,SetAsLastSibling=function()end,GetChild=function(_,name)\n  if name~='cancel'then return end\n  if operation=='lookup'then reenter()end\n  return recovery\n end}\n nested=Gate.new(native,function()return false end,function(epoch)events[#events+1]=epoch end)\n assert(not nested:request({page='menuPanel',run={}}),'superseded request advanced after recovery '..operation)\n assert(nested.intent==replacement and #events==1 and events[1]==nested.epoch,'stale recovery request notified the newer epoch')\nend\n",''],
      [`

-- A failed in-place deck paint can be superseded while it hides recovery.
local oldRun={};local oldDeck={page='deckPanel',mode='map',run=oldRun,overlayContent=1}
local nextDeck={page='deckPanel',mode='map',run=oldRun,overlayContent=2}
local newMap={page='mapPanel',mode='map',run={}}
local handoff,triggerRecoveryWrite,failDeck
local armedRecovery={SetVisible=function()
 if not triggerRecoveryWrite then return end
 triggerRecoveryWrite=false
 assert(handoff:request(newMap))
end}
local reentrantCover={SetVisible=function()end,SetAsLastSibling=function()end,
 GetChild=function(_,name)if name=='cancel'then return armedRecovery end end}
handoff=Gate.new(reentrantCover,function()
 if failDeck then return false,'old deck failed' end
 return true
end)
assert(not handoff:step(oldDeck) and handoff:step(oldDeck))
assert(handoff:begin(nextDeck))
failDeck=true;triggerRecoveryWrite=true
assert(not handoff:finish(nextDeck))
assert(handoff.intent==newMap and handoff.state=='preparing' and handoff.error==nil,'obsolete deck paint marked the new map as failed')
`,''],
      ["local recovery=cover:GetChild('cancel');local cancel=recovery:GetChild('hit')\n",''],
      [`assert(not recovery.visible,'normal loading exposed the recovery menu button')
assert(not cancel.click()and not host.exitOpen,'normal loading accepted a stale recovery click')
controllerMode=true;host:syncController()
assert(not cancel.canControllerFocus and not cancel.navigationListeners.navConfirm(),'normal loading focused or activated the recovery menu')
assert(not host.controller.cancel()and not host.exitOpen,'controller Back opened a menu during normal loading')
controllerMode=false;host.controller:tick()
local intent=require('abyss_page_reveal').intent(host)
extraReady=function()return false,'asset rejected'end
assert(not reveal:step(intent)and reveal.state=='failed');host:refresh()
assert(recovery.visible,'failed preparation lost its recovery entry')
`,''],
      ["controllerMode=true;host:syncController()\nassert(focus==cancel", "controllerMode=true;host:syncController()\nlocal cancel=cover:GetChild('cancel'):GetChild('hit')\nassert(focus==cancel"],
      ["extraReady=nil\nhost:update(1/60)","local intent=require('abyss_page_reveal').intent(host)\nhost:update(1/60)"],
      [`host:refresh();assert(not recovery.visible and not cancel.click()and not host.exitOpen,'recovered pending page retained its error menu')
assert(cover:GetChild('message').text=='正在准备画面…','pending page retained the failure message')
prepared=true;assert(not reveal:step(intent)and cover.visible);host:refresh()
assert(not recovery.visible and not cancel.click(),'ready confirmation turn exposed recovery')
assert(reveal:step(intent));host:refresh()`,"prepared=true;assert(not reveal:step(intent)and cover.visible);assert(reveal:step(intent));host:refresh()"],
    ],
  },
};
export function beforeLoadingRecoverySource(path,source){
  const row=Object.hasOwn(sources,path)?sources[path]:null;
  if(!row||typeof source!=='string'||source.includes('\r\r\n'))return source;
  let prior=source.replaceAll('\r\n','\n');
  if(hash(prior)!==row.after)return source;
  for(const [after,before]of row.edits){
    assert.equal(prior.split(after).length,2,'one exact loading recovery change: '+path);
    prior=prior.replace(after,before);
  }
  assert.equal(hash(prior),row.before,'complete loading recovery predecessor: '+path);
  return source.includes('\r\n')?prior.replaceAll('\n','\r\n'):prior;
}
