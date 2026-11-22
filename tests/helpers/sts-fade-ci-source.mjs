// Exact CI-only successor for the existing historical source readers.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const hash=s=>createHash('sha256').update(s).digest('hex');
const bytes=readFileSync(new URL('../fixtures/sts-fade-ci-source.json',import.meta.url));
assert.equal(hash(bytes),'be33c862d5b8d8d3f3d40a70228c9eba52c8391e0425b77df07a04297e8bfdb6');
const {base,files}=JSON.parse(bytes);
assert.equal(base,'345ba08398b6ca8e1361a126f2ce1de85210e634');
const closeoutBytes=readFileSync(new URL('../fixtures/sts-ui-closeout-ci.json',import.meta.url));
assert.equal(hash(closeoutBytes),'d9855569eb08eeb059fa50ec036d65fe7d28050b10bde7b6a5626c081fe02ac0','exact STS closeout CI continuation');
const closeout=JSON.parse(closeoutBytes).files;
function fromCloseout(path,source){
 const row=Object.hasOwn(closeout,path)?closeout[path]:null;
 if(!row||typeof source!=='string'||source.includes('\r\r\n')||hash(source.replaceAll('\r\n','\n'))!==row.after)return source;
 return source.includes('\r\n')?row.before.replaceAll('\n','\r\n'):row.before;
}
// Current fixtures exercise the real shop preparation and Neow retirement.
// Historical reads preserve the exact prior fixtures bound by their receipts.
const gitBlob=s=>createHash('sha1').update(`blob ${Buffer.byteLength(s)}\0`).update(s).digest('hex');
const officialFixtures=Object.freeze({
 'tests/official-assets-runtime.test.mjs':{
  after:'29402f4869984cad29c71ca9b0c37faa71c87d79d6d90cb4ca5183776e56f42d',afterBlob:'2518f69ff9c3d75cced1fbb718dd6545e7f2105e',
  before:'e3fad25452dce11cc8c13c6e3bec71afbb039db22bed45519ef77e35cf47d66a',beforeBlob:'d40bd556f7c3f50f7efb4d04b383b421ac28bb95',
  rewrites:[
  ["local button=assert(page:GetChild('back'))\nlocal label=assert(button:GetChild('label'))", "local button,label=page:GetChild('confirm'),page:GetChild('confirm'):GetChild('label')"],
  ["assert(button.visible and label.text=='离开' and not page:GetChild('confirm').visible)\nink(Theme.officialAssets.buttonInk)", "assert(label.text=='离开商店');ink(Theme.officialAssets.buttonInk)"],
  ["dofile('tests/lua/support/shop_timeline.lua')(host.nodeUI)\nassert(host.nodeUI.shopOpen and not host.nodeUI.shopBusy and shopView.visible,'the real shop shelf must finish preparing and sliding')", "host.nodeUI:update(.31)"]
  ],
 },
 'tests/official-assets-flow.test.mjs':{
  after:'4686d704bfb173f809033fa0c778ce9884d01e696fbce7477e86cffa7b872f6f',afterBlob:'2e59399f2edc2a3d9fa58c06eae3dae1dc983236',
  before:'0097a0c33630ce01495b99601c4220dc424295ca6dadade7967bbf9106be2ad8',beforeBlob:'5d1a4c8973a2212e821c4cbacc077dd0a2041c5b',
  rewrites:[["assert(F.click(root,'nodePanel','merchant/talk'))\ndofile('tests/lua/support/shop_timeline.lua')(h.nodeUI)\nassert(h.nodeUI.shopOpen and not h.nodeUI.shopBusy,'the real shop shelf must finish preparing and sliding')\n",'']],
 },
 'tests/lua/support/official_neow_navigation_retirement.lua':{
  after:'413bdd832625745176cb9cddc694c9715df46f14695dd5ac4a402c66faca2bb2',afterBlob:'3926e94fdb015477bcee2b4c770ff0a6ba889133',
  before:'4992e8f9af443dc554854bcc01e458ad635617d661fc66ea70a66c5b9fc074d1',beforeBlob:'2ca5a5fe979d95a9d1864445d86bad44daf73e76',
  rewrites:[
   ["  assert(runMenu:GetChild('help')==nil,'retired controls guide must be absent from the generated run menu')\n  for _,name in ipairs({'title','resume','map','abandon','quit','dismissHint','catch'})do", "  for _,name in ipairs({'title','resume','help','map','abandon','quit','dismissHint','catch'})do"],
   [" -- The official title's restart command first confirms abandonment. The\n -- default title uses a combined New command that opens selection on confirm.\n local retirement=OFFICIAL_NEOW_RETIREMENT and 'abandon' or action\n assert(host.navigationAction==retirement,'unexpected public retirement intent')", " assert(host.navigationAction==action)"],
   [" if retirement=='abandon'then\n  assert(host.mode=='menu' and not host.characterOpen)\n  assert(tap(hit(root,'menuPanel','start'),4))\n end", " if action=='abandon'then\n  assert(host.mode=='menu');assert(tap(hit(root,'menuPanel','start'),4))\n end"]
  ],
 },
});
function beforeOfficialFixture(path,source){
 const row=Object.hasOwn(officialFixtures,path)?officialFixtures[path]:null;
 if(!row||typeof source!=='string'||source.includes('\r\r\n'))return source;
 const lf=source.replaceAll('\r\n','\n');
 if(hash(lf)!==row.after||gitBlob(lf)!==row.afterBlob)return source;
 let prior=lf;
 for(const [current,before]of row.rewrites){
  assert.equal(prior.split(current).length,2,'exact official fixture edit: '+path);
  prior=prior.replace(current,()=>before);
 }
 assert.equal(hash(prior),row.before,'exact official fixture predecessor: '+path);
 assert.equal(gitBlob(prior),row.beforeBlob,'exact official fixture predecessor blob: '+path);
 return source.includes('\r\n')?prior.replaceAll('\n','\r\n'):prior;
}
export function beforeStsFadeCi(path,source){
 source=beforeOfficialFixture(path,source);
 source=fromCloseout(path,source);
 const row=Object.hasOwn(files,path)?files[path]:null;
 if(!row||typeof source!=='string'||source.includes('\r\r\n')||hash(source.replaceAll('\r\n','\n'))!==row.after)return source;
 return source.includes('\r\n')?row.before.replaceAll('\n','\r\n'):row.before;
}
