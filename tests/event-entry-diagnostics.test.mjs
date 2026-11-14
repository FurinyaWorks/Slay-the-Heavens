import test from 'node:test';
import assert from 'node:assert/strict';
import {runLua} from '../scripts/test-lua.mjs';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const hash=value=>createHash('sha256').update(value).digest('hex');
test('event entry failures preserve original rejection and expose detached post-rollback diagnostics',()=>{
 const result=runLua('tests/lua/event_entry_diagnostics.lua');
 assert.equal(result.status,0,result.stdout+result.stderr);
 assert.match(result.stdout,/EVENT_ENTRY_DIAGNOSTICS_PASS direct, mapping, eligibility, prepare, rollback, detached, logs, success, nested/);
 const json=result.stdout.split(/\r?\n/).find(line=>line.startsWith('EVENT_ENTRY_DIAGNOSTIC_RECEIPT '))?.slice('EVENT_ENTRY_DIAGNOSTIC_RECEIPT '.length);
 const receipt=JSON.parse(json);
 assert.equal(receipt.reason,'event_not_implemented');assert.equal(receipt.phase,'after_rollback');
 const sources=['src/lua/abyss_nodes.lua','src/lua/abyss_nodes_entry.lua','src/lua/abyss_event_entry_diagnostics.lua',
  'src/lua/abyss_run.lua','src/lua/abyss_event_pool.lua','src/lua/abyss_sts_random.lua',
  'tests/lua/event_entry_diagnostics.lua','tests/event-entry-diagnostics.test.mjs','data/rules.json'];
 mkdirSync('build/event-entry-diagnostics',{recursive:true});
 writeFileSync('build/event-entry-diagnostics/evidence.json',JSON.stringify({schemaVersion:1,
  boundary:'Controlled public Nodes entry with real RNG and rollback; not native/device evidence',
  sourceNormalization:'UTF-8 text with CRLF normalized to LF',
  sources:Object.fromEntries(sources.map(path=>[path,hash(readFileSync(path,'utf8').replaceAll('\r\n','\n'))])),
  receipt,receiptSha256:hash(json),stdoutSha256:hash(result.stdout),
  logLines:result.stdout.split(/\r?\n/).filter(line=>line.startsWith('ABYSS_EVENT_ENTRY_FAILURE ')),status:result.status},null,2)+'\n');
});
