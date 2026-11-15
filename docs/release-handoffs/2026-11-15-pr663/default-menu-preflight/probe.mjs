import assert from 'node:assert/strict';import {readFileSync,writeFileSync} from 'node:fs';import {createHash} from 'node:crypto';import {resolve} from 'node:path';import {pathToFileURL} from 'node:url';
const repo=resolve('profile-matrix-695-699/repo'),base=JSON.parse(readFileSync(repo+'/build/default/game-ui.json')),official=JSON.parse(readFileSync(repo+'/build/official/game-ui.json'));
const hash=x=>createHash('sha256').update(typeof x==='string'?x:JSON.stringify(x)).digest('hex');
const children=n=>n.children??n.controls??[],child=(n,name)=>children(n).find(x=>x.name===name),stage=x=>child(x,'stage'),menu=x=>child(stage(x),'menuPanel');
const oldMenu=menu(base),officialTitle=child(child(menu(official),'v25MainMenu'),'titleMark');
assert(officialTitle);assert(!child(oldMenu,'v25MainMenu'));assert(!child(oldMenu,'titleMark'));
let red=false;try{assert(child(oldMenu,'titleMark'),'PC01: intended static title missing from default output');}catch(e){red=true;console.log('EXPECTED RED:',e.message);}assert(red);
// Source-only export adapter. All function bodies and title asset bytes stay exact.
const source=readFileSync(repo+'/scripts/v25-menu-layout.mjs','utf8');
let adapter=source.replace('function titleMark(theme){','export function titleMark(theme){');
adapter=adapter.replace(/from '(\.\/[^']+)'/g,(_,p)=>`from '${pathToFileURL(resolve(repo,'scripts',p)).href}'`);
adapter=adapter.replace("new URL('../data/presentation/menu-title-mark.json',import.meta.url)",JSON.stringify(repo+'/data/presentation/menu-title-mark.json'));
const adapterFile=resolve('default-menu-pc01-2214/title-export-adapter.mjs');writeFileSync(adapterFile,adapter);
const {titleMark}=await import(pathToFileURL(adapterFile));const theme=JSON.parse(readFileSync(repo+'/data/presentation/ui_theme.json'));
const exact=titleMark(theme);assert.deepEqual(exact,officialTitle);
const nodeKinds={};let count=0;function walk(n){count++;nodeKinds[n.kind]=(nodeKinds[n.kind]??0)+1;assert(!['presetButton','cursorArea','button'].includes(n.kind));assert(!n.command);for(const c of children(n))walk(c);}walk(exact);
const candidate=structuredClone(base),candidateMenu=menu(candidate),startIndex=candidateMenu.children.findIndex(n=>n.name==='start');candidateMenu.children.splice(startIndex,0,exact);
for(const name of ['start','continueRun','titleQuit','settle','result','sessionHint','deathShade'])assert.deepEqual(child(candidateMenu,name),child(oldMenu,name));
const restored=structuredClone(candidate);menu(restored).children.splice(menu(restored).children.indexOf(child(menu(restored),'titleMark')),1);assert.deepEqual(restored,base);
assert.equal(candidateMenu.children.indexOf(exact)+1,candidateMenu.children.indexOf(child(candidateMenu,'start')));
// Explicit local-only state helper, NOT a production fix or gameplay/renderer test.
const prototypeState=mode=>({markVisible:mode==='menu',legacyTitleVisible:mode!=='menu'});
assert.deepEqual(['menu','defeat','victory','menu'].map(prototypeState),[{markVisible:true,legacyTitleVisible:false},{markVisible:false,legacyTitleVisible:true},{markVisible:false,legacyTitleVisible:true},{markVisible:true,legacyTitleVisible:false}]);
const report={sourceHead:'73da2626d37fb52f90e71cd65838c08a1b9cae7c',sourceFileSha256:hash(source),titleAssetSha256:hash(readFileSync(repo+'/data/presentation/menu-title-mark.json','utf8')),defaultUiSha256:hash(readFileSync(repo+'/build/default/game-ui.json','utf8')),exactTitleSha256:hash(exact),nodeCount:count,nodeKinds,sourceOnlyExport:true,matchedOfficialGeometry:true,allExistingNodesPreserved:true,defaultRedReproduced:red,modeHelperOnly:true,noProductionPatch:true,noPixelDeviceApproval:true};
writeFileSync('default-menu-pc01-2214/proof.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
