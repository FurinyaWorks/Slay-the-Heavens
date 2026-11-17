import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {requireLuaTool} from '../scripts/setup-lua-static.mjs';
import {parseDiagnostics} from '../scripts/check-lua-static.mjs';
import {measureSources} from '../scripts/lua-quality-metrics.mjs';
const baseline=JSON.parse(gunzipSync(readFileSync('tests/fixtures/architecture-display-before.json.gz')));
for(const [file,old] of Object.entries(baseline.files))test(`display responsibility and extracted helpers stay within CC15: ${file}`,()=>{
 const source=readFileSync(file,'utf8');
 const dir=mkdtempSync(join(tmpdir(),'architecture-display-cc-'));
 try{
  const path=join(dir,'module.lua');writeFileSync(path,source);
  const r=spawnSync(requireLuaTool().file,[path,'--formatter','plain','--codes','--ranges','--no-color',
   '--max-cyclomatic-complexity','0','--only','561'],{encoding:'utf8',timeout:10000});
  assert.ifError(r.error);assert.ok([0,1].includes(r.status),r.stdout+r.stderr);
  const diagnostics=parseDiagnostics(r.stdout).map(d=>({...d,file}));
  const measured=measureSources({[file]:source},diagnostics);assert.deepEqual(measured.errors,[]);
  const functions=measured.modules[0].functions.filter(f=>!file.endsWith('abyss_colorless_cards.lua')||f.name==='M.describe'||!old.functions.includes(f.name));
  assert.ok(functions.length>=1);
  assert.deepEqual(functions.filter(f=>f.complexity>15).map(f=>({name:f.name,line:f.line,cc:f.complexity})),[]);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
