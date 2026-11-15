import assert from 'node:assert/strict';
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {basename, join} from 'node:path';
import {sha256} from '../scripts/evidence-files.mjs';
import {requireStartupEvidence} from '../scripts/native-playtest-evidence.mjs';

const [, , probeLog, underlyingFaultLog] = process.argv;
assert(probeLog && underlyingFaultLog);
const runDir = mkdtempSync(join(tmpdir(),'abyss-startup-scope-'));
try {
  const runId = basename(runDir), buildId = 'simulated-startup-scope';
  const file = join(runDir,'log.fixture.json'), mapPath = join(runDir,'map.fixture.txt');
  writeFileSync(mapPath,'simulated candidate bytes; not a GIL');
  writeFileSync(join(runDir,'request.json'),JSON.stringify({runDir,mapPath,clientScriptLog:true}));
  const expected={runDir,runId,mapPath,buildId,candidateHash:sha256(readFileSync(mapPath)),startedAt:Date.now()-1000};
  const decodeLog=bytes=>({sourceHash:sha256(bytes),prints:JSON.parse(bytes),nextOffset:null});
  const check=(lines, marker=buildId)=>{
    // Raw format and startup identity are intentionally synthetic. Diagnostic
    // messages are actual Host fixture output, not official client logs.
    const prints=[`ABYSS_BUILD ${marker}`,...lines].map(text=>({text,clientScript:true}));
    writeFileSync(file,JSON.stringify(prints));
    return requireStartupEvidence({state:'succeeded',runId,runDir,steps:[{step:'log-subscribed',clientScripts:true}],log:{file,prints}},expected,{decodeLog,parserVersion:'fixture-json-v1'});
  };
  const events=path=>readFileSync(path,'utf8').split(/\r?\n/).filter(line=>line.startsWith('ABYSS_'));
  const fallback=events(probeLog);
  const ready=fallback.indexOf('ABYSS_UI ready');
  const failed=fallback.findIndex(line=>line.startsWith('ABYSS_PAGE_REVEAL failed page=characterPanel '));
  assert(ready>=0 && failed>ready);
  assert(!fallback.some(line=>line.startsWith('ABYSS_UI failed')));
  const accepted=check(fallback);
  assert.equal(accepted.status,'pass');
  assert.equal(accepted.scope,'startup only; gameplay and screenshot review remain required');
  console.log('PASS startup only: matching synthetic build + actual Host ready passes despite subsequent selection PAGE_REVEAL failed');
  assert.throws(()=>check(fallback,'other-build'),/never reached ready/);
  console.log('PASS negative: wrong candidate build was rejected');
  const fault=events(underlyingFaultLog);
  assert(fault.some(line=>line.startsWith('ABYSS_UI failed')));
  assert.throws(()=>check(fault),/runtime fault/);
  console.log('PASS negative: actual baseline Host ABYSS_UI failed was rejected');
} finally {
  rmSync(runDir,{recursive:true,force:true});
}
