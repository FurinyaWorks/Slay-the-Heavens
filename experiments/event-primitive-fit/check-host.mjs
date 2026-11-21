import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const [repo, catalog] = process.argv.slice(2).map(x=>resolve(x));
const fromRepo = name => import(pathToFileURL(join(repo, 'scripts', name)));
const {nodeLayout}=await fromRepo('node-ui-layout.mjs');
const {assertNativeUiCapacity}=await fromRepo('build-ui.mjs');
const {officialAssetsTheme}=await fromRepo('official-assets-layout.mjs');
const {styleEvent}=await fromRepo('v25-node-layout.mjs');
const {fits}=JSON.parse(readFileSync(catalog,'utf8'));
const sourceTheme=JSON.parse(readFileSync(join(repo,'data/presentation/ui_theme.json'),'utf8').replace(/^\uFEFF/,''));
const find=(root,name)=>root.name===name?root:(root.children??root.controls??[]).map(c=>find(c,name)).find(Boolean);
const official=officialAssetsTheme(sourceTheme);
const profiles={default:nodeLayout(),officialEventStyle:nodeLayout()};
styleEvent(find(profiles.officialEventStyle,'eventView'),official);

const result={stage:'offline static layout validation only',profiles:{}};
for (const [profile,node] of Object.entries(profiles)){
 const original=find(node,'eventView'),origArt=find(original,'art');
 assert.equal(origArt.kind,'image');
 assertNativeUiCapacity(node);
 const checks={baselineEventViewDirectChildren:original.children.length,slotSize:origArt.size,events:{}};
 for(const [id,fit] of Object.entries(fits)){
  const make=()=>find(structuredClone(node),'eventView');
  const panel=make(), art=find(panel,'art');
  const root={...fit.controlTree,name:'eventArtFit',position:art.position,size:art.size,visible:false};
  const n=panel.children.indexOf(art);
  panel.children.splice(n+1,0,root);
  assertNativeUiCapacity(panel);
  const flat=make();flat.children.push(...root.children);
  assert.throws(()=>assertNativeUiCapacity(flat),/direct children exceeds/);
  const nested=make();find(nested,'art').children=root.children;
  assert.throws(()=>assertNativeUiCapacity(nested),/only a container or presetButton/);
  if(root.children.length===60){
   const overflow=make();overflow.children.push({...root,children:[...root.children,{...root.children[0],name:'overflow',visible:false}]});
   assert.throws(()=>assertNativeUiCapacity(overflow),/61 direct children exceeds/);
  }
  checks.events[id]={eventViewDirectChildren:panel.children.length,fitRootDirectChildren:root.children.length,separateRoot:'PASS',flattened:'REJECTED_AS_EXPECTED',asImageChildren:'REJECTED_AS_EXPECTED',root61Direct:root.children.length===60?'REJECTED_AS_EXPECTED':'NOT_APPLICABLE'};
 }
 result.profiles[profile]=checks;
}
console.log(JSON.stringify(result,null,2));
