import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';

const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const hex=(x,n)=>typeof x==='string' && (n===40?/^[a-f0-9]{40}$/:/^[a-f0-9]{64}$/).test(x);
const ranges=[
 ['stage/battlePanel',10], ['stage/nodePanel/shopView',7],
 ['stage/nodePanel/pickerView',6], ['stage/nodePanel/pickerView/forgeGrid',12],
 ['stage/choicePanel',10],
];
export const paths=[
 ...ranges.flatMap(([prefix, count])=>Array.from({length:count},(_,i)=>`${prefix}/card${i+1}/hit`)),
 'stage/battlePanel/endTurn','stage/nodePanel/merchant/talk/hit',
 'stage/nodePanel/confirm/hit','stage/choicePanel/confirm/hit',
];
export function checkReceipt(receipt,mapBytes,sourceCommit) {
 assert(hex(sourceCommit,40) && receipt?.sourceCommit===sourceCommit && receipt.sourceDirty===false,'exact clean source required');
 assert(/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(receipt.buildId ?? '') && hex(receipt.payloadDigest,64),'missing buildId or payloadDigest');
 assert(receipt.liveWriteEnabled===false && receipt.checked?.ok===true && receipt.checked.errors===0,'final audio pack/check receipt required');
 assert(hex(receipt.sourceReceipt?.sha256,64) && hex(receipt.baseSha256,64) && receipt.baseAfter===receipt.baseSha256,'full receipt linkage missing');
 const uiProfile={schemaVersion:1,nativePageLifecycle:false};
 assert.deepEqual(receipt.uiProfile,{...uiProfile,configSha256:digest(JSON.stringify(uiProfile))},'default native UI profile receipt required');
 const defaults={cards:false,menuBackground:true,selectionAvatar:true,battlePortrait:true,monsters:false};
 const art={schemaVersion:2,flags:defaults};
 assert(!receipt.officialAssetsProfile && !receipt.experimentalProfile && !receipt.experimentalBattleChrome,'default native profile required');
 assert.deepEqual(receipt.artFeatures,{...art,configSha256:digest(JSON.stringify(art))},'default native art flags required');
 assert(receipt.sha256===receipt?.candidate?.sha256 && digest(mapBytes)===receipt.sha256 && mapBytes.length===receipt.candidate.bytes,'final GIL bytes do not match candidate');
 assert(hex(receipt.toolchainIdentity?.sourceSha256,64),'missing encoder identity');
}

export function checkUi({interface:ui,ids,sameNames}={}) {
 assert(ui?.name==='SlayTheAbyss' && !(sameNames?.length),'wrong or ambiguous interface');
 const mount=ui.scripts?.map(s=>typeof s==='string'?s:s?.name) ?? [];
 assert(mount.filter(s=>s==='abyss_ui').length===1,'one abyss_ui root mount required');
 const seenIds=new Set(),rows=[];
 for (const path of paths) {
  let children=ui.controls,node,trail=[];
  for (const part of path.split('/')) {
   assert(Array.isArray(children),`missing physical path ${path}`);
   const found=children.filter(n=>n?.name===part);assert(found.length===1,`missing/duplicate physical path ${path}`);
   node=found[0]; trail.push(part);
   assert(node.kind!=='reference',`reference boundary at ${trail.join('/')}`);
   assert(Number.isSafeInteger(ids?.[trail.join('/')]) && ids[trail.join('/')]>0,`missing physical record id at ${trail.join('/')}`);
   children=node.children;
  }
  assert(['cursorArea','presetButton'].includes(node.kind) && Array.isArray(node.size) && node.size.length===2 && node.size.every(x=>Number.isFinite(x)&&x>0),`invalid input control at ${path}`);
  const id=ids[path];assert(!seenIds.has(id),`duplicate terminal id at ${path}`);seenIds.add(id);
  rows.push({path,id,kind:node.kind,size:node.size});
 }
 return rows;
}

export function checkEmbeddedScripts(receipt,{scripts}={}) {
 const expected=receipt.moduleDigests;
 assert(expected&&Object.keys(expected).length>0&&Array.isArray(scripts),'embedded module evidence missing');
 assert(scripts.length===Object.keys(expected).length,'module inventory size mismatch');
 const count=new Set();
 for(const module of scripts){
  assert(typeof module?.name==='string'&&!count.has(module.name)&&Object.hasOwn(expected,module.name),'unknown or repeated module');
  count.add(module.name);
  assert(typeof module.source==='string'&&digest(module.source)===expected[module.name],`embedded source mismatch: ${module.name}`);
 }
 const root=scripts.find(s=>s.name==='abyss_ui')?.source;
 assert(typeof root==='string'&&root.startsWith(`print("ABYSS_BUILD ${receipt.buildId}")\n`),'embedded build marker mismatch');
}

if(process.argv[1] && import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const [, , mapInput,receiptInput,toolRoot,sourceCommit]=process.argv;
 assert(mapInput&&receiptInput&&toolRoot&&sourceCommit&&process.argv.length===6,'Usage: node check-readback.mjs <GIL> <audio/candidate.json> <approved tool root> <expected source SHA>');
 const mapPath=resolve(mapInput),receipt=JSON.parse(readFileSync(receiptInput)),before=readFileSync(mapPath);
 checkReceipt(receipt,before,sourceCommit);
 const encoderPath=join(resolve(toolRoot),'src','scene-save.mjs');
 assert(digest(readFileSync(encoderPath))===receipt.toolchainIdentity.sourceSha256,'reader/encoder source identity mismatch');
 process.env.MILIASTRA_ALLOW_LIVE_WRITE='0';
 const codec=await import(pathToFileURL(encoderPath).href);
 const layout=codec.getClientUi({mapPath,ui:'SlayTheAbyss'});
 const ui=checkUi(layout);
 checkEmbeddedScripts(receipt,codec.listClientScripts({mapPath,includeSource:true}));
 assert(readFileSync(mapPath).equals(before),'readback altered candidate');
 console.log(JSON.stringify({sourceCommit,buildId:receipt.buildId,sha256:receipt.sha256,payloadDigest:receipt.payloadDigest,verifiedInputPaths:ui,
  result:'OFFLINE_ENCODED_READBACK_ONLY',officialImport:'NOT_TESTED',device:'NOT_TESTED'},null,2));
}
