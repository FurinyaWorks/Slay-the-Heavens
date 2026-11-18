import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

const path = 'src/lua/abyss_ending_history.lua';
const digest = source => createHash('sha256').update(source).digest('hex');
const candidateSha = '63b94ebe69ab457b5237a908071d0647c3be9cb64e0831cfd6cf2f800158b66e';
const predecessorSha = '65c718fc07c01542e4aee1911d347d017e97b6ec3df4a789fcc3d8f09fb7ba9d';
// The reviewed e014cc844e3fa4615fee95f654d3d697259008c3 terminal split keeps the older receipt replay exact.
const predecessorTerminal = `local function terminal(run,map,entry)
 local flow,result=run.nodeFlow,run.lastResult
 if run.campaign~=true or run.act~=3 or run.floor~=51 or run.runSeed~=entry.seed
  or run.character~=entry.character or identity(run)~=entry.role or not entry.role then return false end
 if not plain(flow)or flow.type~='event'or flow.roomKind~='ending'or flow.complete~=true
  or flow.result~='normal_victory'or flow.floor~=51 or type(flow.id)~='string'then return false end
 if run.encounterTier~='boss'or type(run.encounterId)~='string'or not plain(result)
  or result.outcome~='victory'or result.encounterId~=run.encounterId or result.allEnemiesEscaped then return false end
 if not plain(map)or map.act~=3 or map.floor~=51 or map.runSeed~=entry.seed
  or type(map.sourceSignature)~='string'or map.sourceSignature==''or flow.mapSignature~=map.sourceSignature
  or flow.mapSeed~=entry.seed or map.currentNodeId~=flow.id or not plain(map.path)
  or map.path[#map.path]~=flow.id or not plain(map.nodes)then return false end
`;

export function beforeEndingTerminalSource(file, source, read) {
  if (file !== path || typeof source !== 'string' || source.includes('\r\r\n')) return source;
  const current = source.replaceAll('\r\n', '\n');
  if (digest(current) !== candidateSha) return source;

  const fresh = read(path);
  assert(typeof fresh === 'string' && !fresh.includes('\r\r\n') &&
    digest(fresh.replaceAll('\r\n', '\n')) === candidateSha, 'fresh ending terminal source');
  const start = current.indexOf('local function terminalIdentity(');
  const middle = current.indexOf(' local matches=0', start);
  const after = current.indexOf('\n\nlocal function persist(', middle);
  assert(start >= 0 && middle > start && after > middle, 'exact ending terminal responsibility boundaries');
  const prior = current.slice(0, start) + predecessorTerminal + current.slice(middle, after) + current.slice(after + 1);
  assert.equal(digest(prior), predecessorSha, 'exact ending terminal predecessor');
  return prior;
}
