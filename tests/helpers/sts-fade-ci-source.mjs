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
// The current shop fixture drives its real shelf preparation. Historical views
// still admit only the exact official runtime test in their pinned receipts.
const officialRuntimeTest='tests/official-assets-runtime.test.mjs';
const gitBlob=s=>createHash('sha1').update(`blob ${Buffer.byteLength(s)}\0`).update(s).digest('hex');
function beforeOfficialShopRuntime(path,source){
 if(path!==officialRuntimeTest||typeof source!=='string'||source.includes('\r\r\n'))return source;
 const lf=source.replaceAll('\r\n','\n');
 if(hash(lf)!=='29402f4869984cad29c71ca9b0c37faa71c87d79d6d90cb4ca5183776e56f42d'||gitBlob(lf)!=='2518f69ff9c3d75cced1fbb718dd6545e7f2105e')return source;
 const rewrites=[
  ["local button=assert(page:GetChild('back'))\nlocal label=assert(button:GetChild('label'))", "local button,label=page:GetChild('confirm'),page:GetChild('confirm'):GetChild('label')"],
  ["assert(button.visible and label.text=='离开' and not page:GetChild('confirm').visible)\nink(Theme.officialAssets.buttonInk)", "assert(label.text=='离开商店');ink(Theme.officialAssets.buttonInk)"],
  ["dofile('tests/lua/support/shop_timeline.lua')(host.nodeUI)\nassert(host.nodeUI.shopOpen and not host.nodeUI.shopBusy and shopView.visible,'the real shop shelf must finish preparing and sliding')", "host.nodeUI:update(.31)"]
 ];
 let prior=lf;
 for(const [current,before]of rewrites){
  assert.equal(prior.split(current).length,2,'exact official shop test edit');
  prior=prior.replace(current,()=>before);
 }
 assert.equal(hash(prior),'e3fad25452dce11cc8c13c6e3bec71afbb039db22bed45519ef77e35cf47d66a','exact official shop test predecessor');
 assert.equal(gitBlob(prior),'d40bd556f7c3f50f7efb4d04b383b421ac28bb95','exact official shop test predecessor blob');
 return source.includes('\r\n')?prior.replaceAll('\n','\r\n'):prior;
}
export function beforeStsFadeCi(path,source){
 source=beforeOfficialShopRuntime(path,source);
 source=fromCloseout(path,source);
 const row=Object.hasOwn(files,path)?files[path]:null;
 if(!row||typeof source!=='string'||source.includes('\r\r\n')||hash(source.replaceAll('\r\n','\n'))!==row.after)return source;
 return source.includes('\r\n')?row.before.replaceAll('\n','\r\n'):row.before;
}
