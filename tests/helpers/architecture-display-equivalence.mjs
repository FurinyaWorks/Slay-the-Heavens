import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {runLua} from '../../scripts/test-lua.mjs';
import {luaString,toLua} from '../../scripts/build-lua-data.mjs';
const archiveBytes=readFileSync('tests/fixtures/architecture-display-before.json.gz');
assert.equal(createHash('sha256').update(archiveBytes).digest('hex'),'4189eecf6c0a8aa98d39207d8923845a0fc024c3787e3ae7135ea25875d9dafa');
const archive=JSON.parse(gunzipSync(archiveBytes));
assert.equal(archive.revision,'c2409ad750c15124b7b843c6bbfa5b222537cb75');
function replay(before){
 const dir=mkdtempSync(join(tmpdir(),'architecture-display-matrix-'));
 try{
  const preloads=before?Object.entries(archive.files).filter(([path])=>!path.endsWith('abyss_feedback.lua')).map(([path,binding])=>{
   assert.equal(createHash('sha256').update(binding.source).digest('hex'),binding.sha256);
   return `package.preload.${path.slice(8,-4)}=assert(load(${luaString(binding.source)},'@${path}'))`;
  }).join('\n'):'';
  const program="package.path='src/lua/?.lua;build/lua/?.lua;'..package.path\n"+preloads+'\n'
   +'DISPLAY_CARDS='+toLua(JSON.parse(readFileSync('data/original_v4/cards_v4.json')).cards)+'\n'
   +"dofile('tests/helpers/architecture-display-matrix.lua')\n";
  const path=join(dir,'matrix.lua');writeFileSync(path,program);
  return runLua(path,{maxBuffer:4*1024*1024});
 }finally{rmSync(dir,{recursive:true,force:true});}
}
test('independent old/current VMs preserve all display strings, rejects, Bark and slot contexts',t=>{
 const old=replay(true),current=replay(false);
 assert.equal(old.status,0,old.stdout+old.stderr);assert.equal(current.status,0,current.stdout+current.stderr);
 const count=Number(old.stdout.match(/ARCHITECTURE_DISPLAY_MATRIX (\d+)/)?.[1]);assert.ok(count>1000);
 if(current.stdout!==old.stdout){let i=0;while(i<old.stdout.length&&current.stdout[i]===old.stdout[i])i++;assert.fail('display trace differs at '+i+' before='+old.stdout.slice(i-80,i+180)+' current='+current.stdout.slice(i-80,i+180));}
 t.diagnostic(JSON.stringify({cases:count,bytes:Buffer.byteLength(old.stdout),sha256:createHash('sha256').update(old.stdout).digest('hex')}));
});
