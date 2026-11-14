import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync,unlinkSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash,randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
import {performance} from 'node:perf_hooks';
import {runLua} from '../../scripts/test-lua.mjs';
import {toLua} from '../../scripts/build-lua-data.mjs';
import {merchantControl} from '../../scripts/cinematic-ui-layout.mjs';
import {officialAssetsTheme} from '../../scripts/official-assets-layout.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const out=resolve(root,'build/merchant-dialogue-review');
const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8'});
const hash=value=>createHash('sha256').update(value).digest('hex');
const before=git('rev-parse','9f2f44e4^{commit}').trim();
const after=git('rev-parse','119d62f9^{commit}').trim();
const blob=(sha,path)=>git('show',`${sha}:${path}`);
const merchantPath='src/lua/abyss_merchant.lua';
const sharedPaths=['src/lua/abyss_prologue.lua','data/presentation/narrative.zh-CN.json','data/presentation/ui_theme.json',
 'scripts/cinematic-ui-layout.mjs','scripts/native-ui-theme.mjs','scripts/official-assets-layout.mjs'];
const shared=Object.fromEntries(sharedPaths.map(path=>{
 const source=blob(before,path);
 assert.equal(blob(after,path),source,`${path} changed across the comparison`);
 assert.equal(readFileSync(resolve(root,path),'utf8').replaceAll('\r\n','\n'),source.replaceAll('\r\n','\n'),`${path} differs from frozen input`);
 return [path,source];
}));
const theme=JSON.parse(shared[sharedPaths[2]]),narrative=JSON.parse(shared[sharedPaths[1]]);
const profiles=[['general',theme],['official-projection',officialAssetsTheme(structuredClone(theme))]].map(([label,profileTheme])=>{
 const control=merchantControl(profileTheme),line=control.children.find(c=>c.name==='line');
 return {label,budget:profileTheme.layout.merchant.pageCharacters,geometry:{size:line.size,position:line.position,text:line.text},theme:profileTheme};
});
const versions=[{label:'before',sha:before,source:blob(before,merchantPath)},
 {label:'after',sha:after,source:blob(after,merchantPath)}];
const input={theme,narrative,profiles,versions,prologue:shared[sharedPaths[0]]};
mkdirSync(out,{recursive:true});
const temporary=resolve(out,`capture-${randomUUID()}.lua`);
let run;
const start=performance.now();
try {
 writeFileSync(temporary,`INPUT=${toLua(input)}\n${readFileSync(new URL('./capture.lua',import.meta.url),'utf8')}`);
 run=runLua(temporary,{cwd:root});
} finally {unlinkSync(temporary);}
assert.equal(run.status,0,run.stdout+run.stderr);
const lines=run.stdout.trim().split(/\r?\n/);
assert.equal(lines.length,1,'unexpected production output');
assert.ok(lines[0].startsWith('MERCHANT_REVIEW '));
const samples=JSON.parse(lines[0].slice('MERCHANT_REVIEW '.length));
assert.equal(samples.length,48);
const copyKey={encounter:'encounter',greet:'greet',buy:'purchaseSuccess',poor:'insufficientGold',leave:'leave',idle:'originHint'};
for(const sample of samples){
 const copy=narrative.merchant[copyKey[sample.kind]];
 const expected=sample.kind==='encounter'?copy:`「${copy}」`;
 assert.equal(sample.pages.map(page=>page.text).join(''),expected,`text changed: ${sample.version}/${sample.profile}/${sample.kind}/${sample.path}`);
 const budget=profiles.find(p=>p.label===sample.profile).budget;
 assert.ok(sample.pages.every(page=>[...page.text].length<=budget),'page exceeds frozen budget');
 const counterpart=samples.find(s=>s.version===sample.version&&s.profile===sample.profile&&s.kind===sample.kind&&s.path!==sample.path);
 assert.deepEqual(sample.pages.map(p=>p.text),counterpart.pages.map(p=>p.text),'tap/auto page text differs');
}
const receipt={schemaVersion:1,generatedAt:new Date().toISOString(),boundary:'Fengari offline presentation capture; not official import, ready, device rendering or user acceptance',
 wallMilliseconds:performance.now()-start,simulation:{stepSeconds:.025,tapIntervalSeconds:.25,timeMeaning:'simulated update time, not wall-clock or device performance'},
 versions:versions.map(({label,sha,source})=>({label,sha,path:merchantPath,sha256:hash(source)})),
 shared:sharedPaths.map(path=>({path,sha:before,sha256:hash(shared[path])})),
 toolSources:['generate.mjs','capture.lua','review.html'].map(name=>({path:`experiments/merchant-dialogue-review/${name}`,sha256:hash(readFileSync(new URL(name,import.meta.url)))})),
 profiles:profiles.map(({theme,...profile})=>profile),copy:narrative.merchant,samples};
const json=JSON.stringify(receipt,null,2)+'\n';
writeFileSync(resolve(out,'receipt.json'),json);
const template=readFileSync(new URL('./review.html',import.meta.url),'utf8');
assert.equal(template.split('__RECEIPT__').length,2);
writeFileSync(resolve(out,'index.html'),template.replace('__RECEIPT__',JSON.stringify(receipt).replaceAll('<','\\u003c')));
console.log(JSON.stringify({status:'PASS',samples:samples.length,comparisons:24,output:out,receiptSha256:hash(json),wallMilliseconds:receipt.wallMilliseconds},null,2));
