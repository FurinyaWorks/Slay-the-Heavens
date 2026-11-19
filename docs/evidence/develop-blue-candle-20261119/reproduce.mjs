// Expected RED only: no product mutation, historical source projection or GUI.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdtempSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {dirname,join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath,pathToFileURL} from 'node:url';
const evidence=dirname(fileURLToPath(import.meta.url)),root=process.cwd();
const base='2ec45b9e52c870badc4d4888f6243a30556eecb4';
execFileSync('git',['diff','--exit-code',base,'--','src','scripts','data','tests','tools'],{stdio:'pipe'});
for(const item of JSON.parse(readFileSync(join(evidence,'assets.json'),'utf8'))){
 const content=readFileSync(join(root,item.path));assert.equal(content.length,item.bytes,item.path);
 assert.equal(createHash('sha256').update(content).digest('hex'),item.sha256,item.path);
}
const use=p=>import(pathToFileURL(resolve(root,p)).href);
const {buildUI}=await use('scripts/build-ui.mjs'),{buildLuaData,luaString}=await use('scripts/build-lua-data.mjs');
const {runLua}=await use('scripts/test-lua.mjs');
const out=mkdtempSync(join(tmpdir(),'blue-candle-current-develop-'));
buildLuaData('data',join(out,'abyss_data.lua'));buildUI(out,undefined,{officialAssets:true,nativePageLifecycle:true});
const entry=join(out,'entry.lua');writeFileSync(entry,`package.path=${luaString(out.replaceAll('\\','/')+'/?.lua;')}..package.path;dofile(${luaString(join(evidence,'reproduce.lua').replaceAll('\\','/'))})\n`);
const result=runLua(entry,{timeout:30000});writeFileSync(join(out,'red.txt'),result.stdout+'\n'+result.stderr);
process.stdout.write(result.stdout+result.stderr);
assert.equal(result.status,1,'This diagnostic expects the unfixed current Develop to fail');
assert.match(result.stderr,/BLUE_CANDLE_REWARD_IDENTITY_GAP/);
assert.match(result.stdout,/OWNED_BAR blue_candle recipe=7 fallbackVisible=false/);
assert.match(result.stdout,/OWNED_DETAIL blue_candle recipe=7 fallbackVisible=false/);
assert.match(result.stdout,/CLAIM_AND_RNG_PASS/);
for(const state of ['normal','hover','pressed','disabled'])assert(result.stdout.includes(`REWARD_STATE ${state} fallback=102028 pool=false`));
const report={sourceCommit:base,diagnosis:'REPRODUCED_NOT_FIXED',luaExit:result.status,officialProfile:true,deviceVerified:false,outputDirectory:out};
writeFileSync(join(out,'diagnosis.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
