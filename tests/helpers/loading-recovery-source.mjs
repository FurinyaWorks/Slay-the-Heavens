// Exact full-file continuation for historical receipts; live product tests use current code.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const hash=source=>createHash('sha256').update(source).digest('hex');
const sources={
  'src/lua/abyss_game_ui.lua':{
    after:'25f7e0e37ce96d8ac6ad21b05c14520116d9851b1db7cadd78be7e2c74e2be17',
    before:'47c173c61b6ce091cdb992f41b190330b0d016be5ad764de8591f0168a6dbbfc',
    edits:[
      ["        local function canRecover()return self.pageReveal.state=='failed' and not self.exitOpen end\n",''],
      ["            if not canRecover()then return false end","            if not self.pageReveal:covered() or self.exitOpen then return false end"],
      ["Controller.bind(controller,cancel,'pageReveal',leave,canRecover,1)","Controller.bind(controller,cancel,'pageReveal',leave,function()return self.pageReveal:covered() and not self.exitOpen end,1)"],
    ],
  },
  'src/lua/abyss_game_ui_view.lua':{
    after:'c0edb3b65548af181576e6269213574e9a9908207d6b1d18f3fb3a87328f6a7b',
    before:'d122d66ddf22b16da1ca060eb116aa9ed314476bb3ef0242c3c284c92a0fc3af',
    edits:[["then scope=self.pageReveal.state=='failed' and 'pageReveal' or 'blocked'","then scope='pageReveal'"]],
  },
  'src/lua/abyss_page_reveal.lua':{
    after:'d504bef0f261dbad9af7d269f33feba94b5d7157fe285fc1627010c646874c98',
    before:'11c445d81dc6687b06d6b8d617f524740ee3da92264d3400bb54019c0a8adc61',
    edits:[
      ["        local recovery=cover:GetChild('cancel')\n        if recovery then recovery:SetVisible(false)end\n",''],
      ["        local recovery=cover:GetChild('cancel')\n        if recovery then recovery:SetVisible(self.state=='failed')end\n",''],
      ["        self.error=nil\n        if value~=true",'        if value~=true'],
    ],
  },
  'tests/sts-page-reveal.test.mjs':{
    after:'561a52aaeef4b62accae0865fac674e3bded20652e9bfc81e94b54ac8093a34d',
    before:'594e4a40b4cfdb98178c15ff211a07457a8c18615379d524a722b22eb22c790c',
    edits:[
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
