import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {normalizeCardOriginReleaseArchitecture,preCardOriginSource} from './helpers/card-origin-source-inverse.mjs';
const hash=s=>createHash('sha256').update(s).digest('hex');
test('card-origin projection recovers complete prior bytes and does not hide partial or unrelated edits',()=>{
 for(const [path,expected]of [
  ['config/architecture.json','640bb51f60c831ad2162de7907b5b7e6a241dfa6f50b15b8527234eb2da47b64'],
  ['src/lua/abyss_nodes.lua','7d9732ed7b574db7dc874c378cad49f11cd47839f8b8c6763a29dfa186b20637'],
 ]){
  const source=readFileSync(path,'utf8').replaceAll('\r\n','\n');
  assert.equal(hash(preCardOriginSource(path,source)),expected);
  assert.equal(hash(preCardOriginSource(path,source.replaceAll('\n','\r\n'))),expected);
  for(const changed of [source+'-- unrelated\n',source.replace('abyss_card_origin','abyss_card_origin_typo')])
   assert.equal(preCardOriginSource(path,changed),changed,'foreign bytes must remain exposed');
 }
 const nodes='src/lua/abyss_nodes.lua',lf=readFileSync(nodes,'utf8').replaceAll('\r\n','\n');
 const mixed=lf.replace('\n','\r\n');
 assert.equal(preCardOriginSource(nodes,mixed),mixed,'mixed line endings must not claim the exact reviewed bytes');
 assert.equal(preCardOriginSource('unregistered.lua',lf),lf,'only the registered Nodes owner may consume this view');
 assert.equal(preCardOriginSource('src/lua/abyss_nodes.lua',null),null);
});
test('architecture projection rejects removed registration, wrong owner, duplicate keys and order changes',()=>{
 const path='config/architecture.json',source=readFileSync(path,'utf8'),policy=JSON.parse(source);
 for(const key of ['abyss_card_origin','abyss_card_origin_view']){
  const missing=structuredClone(policy);delete missing.layers[key];
  const wrong=structuredClone(policy);wrong.layers[key]=wrong.layers[key]==='core'?'ui':'core';
  for(const variant of [JSON.stringify(missing),JSON.stringify(wrong),source.replace('"'+key+'":', '"'+key+'": "core", "'+key+'":')])
   assert.equal(preCardOriginSource(path,variant),variant);
 }
 for(const [key,value]of [['abyss_ui_profile','ui'],['abyss_native_pages','platform']]){
  const wrong=structuredClone(policy);wrong.layers[key]=value;
  const missing=structuredClone(policy);delete missing.layers[key];
  for(const changed of [JSON.stringify(wrong),JSON.stringify(missing),source.replace('"'+key+'":','"'+key+'": "core", "'+key+'":')])
   assert.equal(preCardOriginSource(path,changed),changed,'new registration mutation must remain exposed');
 }
 const reordered=structuredClone(policy);reordered.deferredImports.reverse();
 const variant=JSON.stringify(reordered);assert.equal(preCardOriginSource(path,variant),variant);
 // A duplicate with the same value parses to the same policy, as does a
 // reordered object. Neither is a layout-only change to the reviewed source.
 const duplicate=source.replace('"abyss_card_origin": "core",','"abyss_card_origin": "core", "abyss_card_origin": "core",');
 assert.notEqual(duplicate,source);
 assert.deepEqual(JSON.parse(duplicate),policy);
 assert.equal(preCardOriginSource(path,duplicate),duplicate);
 const reorderedLayers={...policy,layers:Object.fromEntries(Object.entries(policy.layers).reverse())};
 const reorderedLayout=JSON.stringify(reorderedLayers);
 assert.equal(preCardOriginSource(path,reorderedLayout),reorderedLayout);
 for(const variant of [JSON.stringify(policy),JSON.stringify(policy,null,'\t'),source+'\n\t ',
  JSON.stringify(policy,null,'\t').replaceAll('\n','\r\n')])
  assert.equal(hash(preCardOriginSource(path,variant)),'640bb51f60c831ad2162de7907b5b7e6a241dfa6f50b15b8527234eb2da47b64');
});

test('card-origin layout admission freshly authenticates the exact raw Release owner',()=>{
 const path='config/architecture.json',raw=readFileSync(path,'utf8').replaceAll('\r\n','\n');
 const compact=JSON.stringify(JSON.parse(raw));
 let supplied,reads=0;
 const read=p=>{assert.equal(p,path);reads++;return supplied;};
 const admit=()=>normalizeCardOriginReleaseArchitecture(path,compact,read);
 supplied=raw;assert.equal(admit(),raw);
 supplied=raw.replaceAll('\n','\r\n');assert.equal(admit(),supplied);
 supplied=raw.replace('\n','\r\n');assert.equal(admit(),compact,'mixed raw owner cannot lend canonical bytes');
 supplied=raw+'\n';assert.equal(admit(),compact,'layout-equivalent drift in raw owner remains unauthenticated');
 supplied=undefined;assert.equal(admit(),compact);
 supplied=raw;assert.equal(admit(),raw,'admission rereads restored raw owner');assert.equal(reads,6);
});
