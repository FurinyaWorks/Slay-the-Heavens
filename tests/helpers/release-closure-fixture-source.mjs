import assert from 'node:assert/strict';
import {restoreExactFixtureHunks} from './exact-fixture-hunks.mjs';
import {exactSourceMatches} from './source-fingerprint.mjs';
import {beforeReleaseMetadata} from './release-metadata-source.mjs';
import {beforeReleaseDeckPointer} from './release-deck-pointer-source.mjs';

export const selectionRawEntranceReplay=Object.freeze({
 current:{sha256:'af6b69b1543a688f9b23a8941381fd8534c95cc5dfe7f0f096a2a8b61328d188',gitBlob:'69a44aaa47230c0fd10cac2f8fe6c0e7e6a12d55'},
 previous:{sha256:'5cd7ad3d5a728418bb89cb8dbf0d4fea7fa199fb005b399b71772e63e0ec2851',gitBlob:'2128fceb1bff074e04d02f911264194e2415037f'},
 hunks:[
  {at:13,
   before:"import {checkedSelectionEntranceRead,selectionNodeNoticePath} from './ui-selection-current-source.mjs';",
   after:"import {checkedSelectionEntranceRead,selectionNodeNoticePath} from './ui-selection-current-source.mjs';\nimport {releaseEntranceOwns} from './release-entrance-owner-source.mjs';"},
  {at:33,
   before:'  if(productionReadingBackflowOwns(path)||path===selectionNodeNoticePath||beforeOfficialCharacterBackflow(path,source)!==source)return raw;',
   after:'  // The Selection reader authenticates the entire release entrance cohort from raw checkout bytes.\n  if(releaseEntranceOwns(path)||productionReadingBackflowOwns(path)||path===selectionNodeNoticePath||beforeOfficialCharacterBackflow(path,source)!==source)return raw;'},
 ],
});

// Current Host checks exercise production. Historical Host and CI replays
// preserve the exact earlier test sources from the production backflow.
const fixtures=Object.freeze({
 "tests/molten-egg-source.test.mjs": {
  "current": {
   "sha256": "a524f6e0d27813b0f6b723c603f931d2d82e9e3d89605d203daacf809467bdfe",
   "gitBlob": "76ca0e342018cdf2f2678ebc39a23abc36ec91fb"
  },
  "previous": {
   "sha256": "ba608486940a5b7374742324bb4e8d085f470cd0fbd924db050dddbb63910527",
   "gitBlob": "9571494f3b25371d7c0ffaedd073619d7fc3c239"
  },
  "hunks": [
   {
    "at": 3,
    "before": "import {requireRelicCompletionSource,preRelicCompletionSource} from './helpers/relic-completion-inverse.mjs';\nimport {closeoutRead} from './helpers/closeout-ci-source.mjs';\nconst read=path=>JSON.parse(readFileSync(path,'utf8'));",
    "after": "import {requireRelicCompletionSource,preRelicCompletionSource} from './helpers/relic-completion-inverse.mjs';\nimport {withHistoricalBaseline} from './helpers/historical-baseline-inputs.mjs';\nconst read=path=>JSON.parse(readFileSync(path,'utf8'));"
   },
   {
    "at": 36,
    "before": " // today's production identity checks above still read the complete pool.\n const current=closeoutRead('pr620')('data/relics.json','utf8');\n requireRelicCompletionSource('data/relics.json',current);\n const historical=JSON.parse(preRelicCompletionSource('data/relics.json',current));\n for(const id of ['question_card','busted_crown','singing_bowl'])assert.ok(!historical.relics.some(r=>r.id===id));",
    "after": " // today's production identity checks above still read the complete pool.\n const historical=withHistoricalBaseline(()=>{\n  const path='data/relics.json',source=readFileSync(path,'utf8');\n  requireRelicCompletionSource(path,source);\n  return JSON.parse(preRelicCompletionSource(path,source));\n });\n for(const id of ['question_card','busted_crown','singing_bowl'])assert.ok(!historical.relics.some(r=>r.id===id));"
   }
  ]
 },
 "tests/ruby-recall.test.mjs": {
  "current": {
   "sha256": "8d69c82bcbeb6a8b0b5bd2c18776c6df4d9bf5177b6e32b640e65ee897910a44",
   "gitBlob": "a6554f017663d5e3eb571887b5ef51c822276d12"
  },
  "previous": {
   "sha256": "ec4a275d02b2aa07a91f652251815e7949430712fa6a854abe08f49ece9f4df4",
   "gitBlob": "292255294546a7e2889c36ad0b67ff0e036085bc"
  },
  "hunks": [
   {
    "at": 4,
    "before": "import { runLua } from '../scripts/test-lua.mjs';\nimport { readBeforeMobileQaSource } from './helpers/mobile-qa-source-inverse.mjs';",
    "after": "import { runLua } from '../scripts/test-lua.mjs';\nimport { historicalTest } from './helpers/historical-baseline-inputs.mjs';\nimport { readBeforeMobileQaSource } from './helpers/mobile-qa-source-inverse.mjs';"
   },
   {
    "at": 92,
    "before": "\ntest('three original camp commands retain frozen bodies around the reviewed Toxic Egg adapter',()=>{\n  const code=readBeforeMobileQaSource('src/lua/abyss_nodes.lua').replaceAll('\\r\\n','\\n');",
    "after": "\nhistoricalTest('three original camp commands retain frozen bodies around the reviewed Toxic Egg adapter',()=>{\n  const code=readBeforeMobileQaSource('src/lua/abyss_nodes.lua').replaceAll('\\r\\n','\\n');"
   }
  ]
 },
 'tests/helpers/replay-reviewed-selection.mjs':selectionRawEntranceReplay,
 "tests/lore-v2.test.mjs": {
  "current": {
   "sha256": "75d8cc3adf030c2ff6aa09e664bd1abc5c7559eec33c50a0edd295350075c79b",
   "gitBlob": "20b8f34ca1e7cff2ea8d790edfc4fa262db28042"
  },
  "previous": {
   "sha256": "2291dec3b039b914d31e64b366fe9718913636b1095f60005becab39c1823fb8",
   "gitBlob": "f242663a52c58bf7b3583cc96158f0f6196034fa"
  },
  "hunks": [
   {
    "at": 35,
    "before": "    eventCopy:{...support.eventCopy,living_wall:livingWallCopy}});\n  for(const [path,before,after]of travelerNames){",
    "after": "    eventCopy:{...support.eventCopy,living_wall:livingWallCopy}});\n  // #951 b2f74d99 changed the runtime key without rewriting the archived prose.\n  assert.equal(typeof expected.combatIntros.cultist, 'string', 'archived Cultist introduction');\n  assert.ok(!Object.hasOwn(expected.combatIntros, 'raven_adept'), 'archived key must be unambiguous');\n  expected.combatIntros.raven_adept = expected.combatIntros.cultist;\n  delete expected.combatIntros.cultist;\n  for(const [path,before,after]of travelerNames){"
   },
   {
    "at": 115,
    "before": "  }\n});",
    "after": "  }\n  const alias = structuredClone(copy);\n  alias.combatIntros.cultist = alias.combatIntros.raven_adept;\n  assert.throws(() => assertNarrativeCopy(alias, core, support), { code: 'ERR_ASSERTION' });\n  delete alias.combatIntros.raven_adept;\n  assert.throws(() => assertNarrativeCopy(alias, core, support), { code: 'ERR_ASSERTION' });\n});"
   }
  ]
 },
 "tests/colorless-catalog-source.test.mjs": {
  "current": {
   "sha256": "da577b404aeca08d7ee98580da6186204589a1c429b71e7b4ef945f874555d17",
   "gitBlob": "6c1da94453ea96f4513d0a785758e445d0614185"
  },
  "previous": {
   "sha256": "1f2fc5bff24370b718aee29cdd4ef744f1096f7a2088a7691b401c7de86ebe50",
   "gitBlob": "ad97516e45aa9e76b2f71a0f9882a5535e020849"
  },
  "hunks": [
   {
    "at": 76,
    "before": " const directory=mkdtempSync(join(tmpdir(),'colorless-retirement-')),target=join(directory,leaf);\n try{\n  mkdirSync(join(directory,'src/lua'),{recursive:true});writeFileSync(target,read(leaf));\n  const cleanup=retire(directory);assert(existsSync(target));writeFileSync(target,read(leaf)+'\\n');assert.throws(cleanup,/unreviewed/);assert(existsSync(target));\n  writeFileSync(target,read(leaf));retire(directory)();assert(!existsSync(target));assert(existsSync(leaf));\n  try{symlinkSync(join(process.cwd(),leaf),target);}catch(error){if(['EPERM','EACCES','ENOTSUP'].includes(error.code)){t.skip('file symlink unavailable: '+error.code);return;}throw error;}\n  assert.throws(()=>retire(directory),/aliases live source/);assert(existsSync(leaf));",
    "after": " const directory=mkdtempSync(join(tmpdir(),'colorless-retirement-')),target=join(directory,leaf);\n try{\n  const historicalLeaf=historicalRead(leaf);\n  mkdirSync(join(directory,'src/lua'),{recursive:true});writeFileSync(target,historicalLeaf);\n  const cleanup=retire(directory);assert(existsSync(target));writeFileSync(target,historicalLeaf+'\\n');assert.throws(cleanup,/unreviewed/);assert(existsSync(target));\n  writeFileSync(target,historicalLeaf);retire(directory)();assert(!existsSync(target));assert(existsSync(leaf));\n  try{symlinkSync(join(process.cwd(),leaf),target);}catch(error){if(['EPERM','EACCES','ENOTSUP'].includes(error.code)){t.skip('file symlink unavailable: '+error.code);return;}throw error;}\n  assert.throws(()=>retire(directory),/aliases live source/);assert(existsSync(leaf));"
   }
  ]
 },
 "tests/effects-target-group.test.mjs": {
  "current": {
   "sha256": "87d3e6492f57997a968c226a1c0cee7a1da8e7e5c1c1235b0321832241f463a8",
   "gitBlob": "277ff86e5ff5eec7abdc0858651f2539ac2748ee"
  },
  "previous": {
   "sha256": "b3db9b0c634f130e9ff0bca3693b31725b985bec56c718c09657c5bba035e08e",
   "gitBlob": "7b4773f37c4c7258bea5533326c347d8388b44ca"
  },
  "hunks": [
   {
    "at": 20,
    "before": " assert.equal(before.path,file);assert.equal(hash(before.source),before.sha256);\n assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(before.source)}\\0`).update(before.source).digest('hex'),before.gitBlob);\n const [a,b]=span(before.source),[c,d]=span(source);\n assert.equal(source.slice(0,c),before.source.slice(0,a));\n const queueItems=source.indexOf('-- Queue preparation can split ordinary effects.',d);\n const requiresQueue=source.indexOf('function M.requiresQueue(effects)',queueItems);",
    "after": " assert.equal(before.path,file);assert.equal(hash(before.source),before.sha256);\n assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(before.source)}\\0`).update(before.source).digest('hex'),before.gitBlob);\n // #951 renamed these two production actions after the original comparison.\n assert.equal(source.match(/\\bcalculatedExchange\\b/g)?.length,2);\n assert.equal(source.match(/\\bdaggerExpenditure\\b/g)?.length,2);\n const historicalNames=text=>text.replace(/\\bcalculatedExchange\\b/g,'calculatedGamble')\n  .replace(/\\bdaggerExpenditure\\b/g,'daggerSacrifice');\n const [a,b]=span(before.source),[c,d]=span(source);\n assert.equal(historicalNames(source.slice(0,c)),before.source.slice(0,a));\n const queueItems=source.indexOf('-- Queue preparation can split ordinary effects.',d);\n const requiresQueue=source.indexOf('function M.requiresQueue(effects)',queueItems);"
   },
   {
    "at": 33,
    "before": " assert.deepEqual(extension.body.map(n=>[n.type,n.identifier?.base?.name,n.identifier?.identifier?.name]),\n  [['FunctionDeclaration','M','queueItems']]);\n assert.equal(source.slice(d,queueItems)+source.slice(requiresQueue),before.source.slice(b));\n const ast=luaparse.parse(source.slice(c,d),{luaVersion:'5.3'});\n assert.deepEqual(ast.body.map(n=>n.identifier.name),names);assert(ast.body.every(n=>n.isLocal));",
    "after": " assert.deepEqual(extension.body.map(n=>[n.type,n.identifier?.base?.name,n.identifier?.identifier?.name]),\n  [['FunctionDeclaration','M','queueItems']]);\n assert.equal(historicalNames(source.slice(d,queueItems)+source.slice(requiresQueue)),before.source.slice(b));\n const ast=luaparse.parse(source.slice(c,d),{luaVersion:'5.3'});\n assert.deepEqual(ast.body.map(n=>n.identifier.name),names);assert(ast.body.every(n=>n.isLocal));"
   }
  ]
 },
 "tests/gil-candidate.test.mjs": {
  "current": {
   "sha256": "d5ec827fa24b3ad3ff33b304723efddc4205599dbc8e8c28141aa3d22d99c1c6",
   "gitBlob": "0e38620640049ad1f0e0a7a8a4c9a82b1f0a629b"
  },
  "previous": {
   "sha256": "430a5a3396c4318c91e8bcf2c9a0cf74e1b03a52edf817bfd9a5aaafc15a6588",
   "gitBlob": "8c2d8cbfeb2fb8f2c495a955965bfa989db1090e"
  },
  "hunks": [
   {
    "at": 1,
    "before": "import { spawnSync } from 'node:child_process';\nimport { createHash } from 'node:crypto';\nimport { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';\nimport { tmpdir } from 'node:os';\nimport { join } from 'node:path';\nimport { test } from 'node:test';\nimport { verifyDownloadedArtifact, verifyReceipts } from '../scripts/gil-candidate.mjs';\nimport { api, approvedRequest, candidateTarget, encoderSha256, findArtifact, verifySource } from '../scripts/gil-candidate-preflight.mjs';\nimport { fileRecord } from '../scripts/evidence-files.mjs';\nimport { hostedCandidatePath, verifiedPayloadInputs } from '../scripts/hosted-gil-receipt.mjs';\n\nconst sourceSha = '1'.repeat(40);",
    "after": "import { spawnSync } from 'node:child_process';\nimport { createHash } from 'node:crypto';\nimport { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';\nimport { tmpdir } from 'node:os';\nimport { join } from 'node:path';\nimport { test } from 'node:test';\nimport { verifyDownloadedArtifact, verifyPublishedRebase, verifyReceipts } from '../scripts/gil-candidate.mjs';\nimport { api, approvedRequest, buildOnlyRequest, candidateTarget, encoderSha256, findArtifact, validationTarget, verifySource } from '../scripts/gil-candidate-preflight.mjs';\nimport { fileRecord } from '../scripts/evidence-files.mjs';\nimport { hostedCandidatePath, verifiedPayloadInputs } from '../scripts/hosted-gil-receipt.mjs';\nimport { downloadLegacyGilArchive, legacyGilArchive, supportsPublishedGilSeed } from '../scripts/runtime-baseline/published-baseline.mjs';\n\nconst sourceSha = '1'.repeat(40);"
   },
   {
    "at": 167,
    "before": "});\n\ntest('reject missing protected base URL before downloads', () => {\n  const result = spawnSync(process.execPath, ['scripts/gil-candidate.mjs', 'base'], {",
    "after": "});\n\ntest('automatic build pushes are scoped to primary develop and the diagnostic branch in the known fork', () => {\n  const workflow = readFileSync(new URL('../.github/workflows/gil-build.yml', import.meta.url), 'utf8').replaceAll('\\r\\n', '\\n');\n  const fork = '1460133275';\n  const testRef = 'refs/heads/ci/full/gil-build/v2.2.0-closure-20261127';\n  assert.deepEqual(validationTarget('1429751262', 'refs/heads/develop', sourceSha), { branch: 'develop' });\n  assert.deepEqual(validationTarget(fork, testRef, sourceSha), { branch: testRef.slice(11) });\n  assert.throws(() => validationTarget(fork, 'refs/heads/develop', sourceSha), /assigned Fork B/);\n  assert.throws(() => validationTarget('1429751262', testRef, sourceSha), /assigned Fork B/);\n  assert.throws(() => validationTarget('3', testRef, sourceSha), /assigned Fork B/);\n  assert.match(workflow, /push:\\n    branches: \\[develop, 'ci\\/full\\/gil-build\\/\\*\\*'\\]/);\n  assert.match(workflow, /PUBLISH_ARTIFACT: 'false'/);\n  assert.match(workflow, /path: source\\/build\\/gil-artifact\\/manifest\\.json\\n/);\n  assert.doesNotMatch(workflow, /secrets\\.|environment:/);\n  const buildSteps = workflow.slice(workflow.indexOf('      - name: Fetch and verify the published project GIL'));\n  assert.equal(buildSteps.match(/^      - (?:name|uses):/gm)?.length, 9);\n  assert.equal(buildSteps.match(/^        if: steps\\.candidate\\.outputs\\.build == 'true'$/gm)?.length, 9);\n  const archive = readFileSync(new URL('../.github/workflows/gil-candidate.yml', import.meta.url), 'utf8');\n  const usedActions = [...workflow.matchAll(/^\\s*- uses: (actions\\/[a-z-]+@[0-9a-f]+)\\b/gm)];\n  assert.equal(usedActions.length, 6);\n  for (const [, action] of usedActions) assert(archive.includes(`uses: ${action} `), `Build action must use the archive pin: ${action}`);\n});\n\ntest('unattended build selects the pinned public source and a local metadata key', () => {\n  const target = validationTarget('1429751262', 'refs/heads/develop', sourceSha);\n  const policy = { controllerSha: sourceSha };\n  const approval = { sourceSha, sourceBranch: 'develop', baseSha256: legacyGilArchive.sha256, workKey,\n    reference: 'owner/42', baseProcessingApproved: true, publicArtifactApproved: true };\n  const build = buildOnlyRequest(sourceSha, policy, target);\n  assert.equal(build.archive, false);\n  assert.equal(build.baseSha256, legacyGilArchive.sha256);\n  assert.equal(build.configuration.releaseCandidate, false);\n  assert.equal(build.configuration.workKey, 'offline-candidate');\n  assert.throws(() => approvedRequest(JSON.stringify({ ...approval, workKey: build.configuration.workKey }), sourceSha, policy), /Approval must cover/);\n  assert.notEqual(build.id, approvedRequest(JSON.stringify(approval), sourceSha, policy).id);\n});\n\ntest('the published GIL seed permits only strictly newer source versions', () => {\n  for (const version of ['2.0.0', '2.1.0', '2.1.1']) assert.equal(supportsPublishedGilSeed(version), false);\n  for (const version of ['2.1.2', '2.2.0', '3.0.0']) assert.equal(supportsPublishedGilSeed(version), true);\n  assert.throws(() => supportsPublishedGilSeed('2.2.0-preview'), /Engineering SemVer/);\n});\n\ntest('the published archive download validates the exact pointer and bounds transfer retries', async t => {\n  const dir = mkdtempSync(join(tmpdir(), 'gil-published-download-'));\n  t.after(() => rmSync(dir, { recursive: true, force: true }));\n  const output = join(dir, 'base.gil');\n  const { path, archiveCommit, bytes, sha256 } = legacyGilArchive;\n  const pointer = `version https://git-lfs.github.com/spec/v1\\noid sha256:${sha256}\\nsize ${bytes}\\n`;\n  const request = (content = pointer) => async uri => {\n    assert.equal(uri, `/repos/FurinyaWorks/Slay-the-Heavens/contents/${path}?ref=${archiveCommit}`);\n    return { type: 'file', path, size: bytes, encoding: 'base64', content: Buffer.from(content).toString('base64') };\n  };\n  await assert.rejects(downloadLegacyGilArchive(output, request(pointer.replace(sha256, '0'.repeat(64))),\n    () => assert.fail('downloaded from an unverified pointer')), /pointer differs/);\n  let calls = 0;\n  await assert.rejects(downloadLegacyGilArchive(output, request(), async (url, options) => {\n    assert.equal(url, `https://media.githubusercontent.com/media/FurinyaWorks/Slay-the-Heavens/${archiveCommit}/${path}`);\n    assert.equal(options.redirect, 'error');\n    calls++;\n    throw Error('fixture network failure');\n  }), /after two attempts/);\n  assert.equal(calls, 2);\n  await assert.rejects(downloadLegacyGilArchive(output, request(), async () => new Response('truncated')),\n    /differs from the pinned size/);\n  assert.equal(existsSync(output), false);\n});\n\ntest('a published seed rebuild can only change UI and signals, graph, and Lua sections', () => {\n  const raw = (id, value) => ({ id, wire: 0, raw: Buffer.from([value]) });\n  const base = Buffer.alloc(24);\n  const final = Buffer.alloc(24, 0);\n  const input = [raw(4, 1), raw(9, 2), raw(10, 3), raw(50, 4)];\n  let output = [raw(4, 1), raw(9, 5), raw(10, 6), raw(50, 7)];\n  const wire = { container: bytes => bytes === base ? input : output, fields: rows => rows };\n  assert.deepEqual(verifyPublishedRebase(base, final, wire), [9, 10, 50]);\n  output[0] = raw(4, 8);\n  assert.throws(() => verifyPublishedRebase(base, final, wire), /scene data changed in section 4/);\n  output = [raw(9, 5), raw(4, 1), raw(10, 6), raw(50, 7)];\n  assert.throws(() => verifyPublishedRebase(base, final, wire), /section layout changed/);\n  final[4] = 1;\n  assert.throws(() => verifyPublishedRebase(base, final, wire), /container structure changed/);\n});\n\ntest('reject missing protected base URL before downloads', () => {\n  const result = spawnSync(process.execPath, ['scripts/gil-candidate.mjs', 'base'], {"
   }
  ]
 },
 "tests/helpers/boss_source_fixture.lua": {
  "current": {
   "sha256": "5a8ceb27bad90905ba9187fb1c58bac9bd4078a42170272e5b619180cbbdfa65",
   "gitBlob": "abcdb951344ec216be0f7be1ef4c82b79973840c"
  },
  "previous": {
   "sha256": "6f35551709233fb30c9c80ca9e8819397e0c8fe9b975c632a11e7cbdc08b2ebf",
   "gitBlob": "5e786116d86cf3a26886a65de2eecbd20cc00965"
  },
  "hunks": [
   {
    "at": 16,
    "before": "end\nfunction M.supportedChoices(run)\n M.stageQueue(run,{'Black Blood','SlaversCollar','Sozu'})\nend\nfunction M.definition(run,id)",
    "after": "end\nfunction M.supportedChoices(run)\n M.stageQueue(run,{'Black Blood','ArenaCollar','Sozu'})\nend\nfunction M.definition(run,id)"
   }
  ]
 },
 "tests/helpers/effects-target-group-scenarios.lua": {
  "current": {
   "sha256": "94727fdf40da7c736dc5b3728d93c6f6a7725efd19eba0d2a82ebb93f93be6af",
   "gitBlob": "0cec5b9e45de8322ce5ebe11533f0706545a1e0b"
  },
  "previous": {
   "sha256": "472d7477b74e25d5a7f24e2849bb1c15d951963c0a57fa16cc56331dc965441b",
   "gitBlob": "ce3458a30367360f397ae23120c029b35090e31e"
  },
  "hunks": [
   {
    "at": 10,
    "before": "  local combat={outcome=function() trace[#trace+1]='outcome';return nil end}\n  if entry=='apply' and (label=='valid' or label=='unmarked-partial') then\n   combat=require('abyss_combat');state=combat.new(require('abyss_data'),{seed=42,deck={'strike'},enemies={'cultist','cultist'}})\n  end\n  local f=entry=='private' and GROUP_TARGET or entry=='supported' and GROUP_EFFECTS.supported or function(v)",
    "after": "  local combat={outcome=function() trace[#trace+1]='outcome';return nil end}\n  if entry=='apply' and (label=='valid' or label=='unmarked-partial') then\n   combat=require('abyss_combat');state=combat.new(require('abyss_data'),{seed=42,deck={'strike'},enemies={'raven_adept','raven_adept'}})\n  end\n  local f=entry=='private' and GROUP_TARGET or entry=='supported' and GROUP_EFFECTS.supported or function(v)"
   }
  ]
 },
 "tests/intent-visibility-cache.test.mjs": {
  "current": {
   "sha256": "f06867480117cd768d2eb072af89f3e2faaabfdc395023eab053fa7b08b2cbf1",
   "gitBlob": "acf7d9073e4ec212c498933ed668debc75d2b67a"
  },
  "previous": {
   "sha256": "d736e6e7ed0fd83805dd5e95a782a5bcd48cfdc4bea20ef0034fa2e97194cb53",
   "gitBlob": "18528ea21b274bf466fdb7b54779b3eb3080c05d"
  },
  "hunks": [
   {
    "at": 14,
    "before": " ['rejected write','accepted~=false and ownsWrite then intentVisibilities','ownsWrite then intentVisibilities','rejected visibility write cached'],\n ['overlap','accepted~=false and ownsWrite then intentVisibilities','accepted~=false then intentVisibilities','overlapping visibility cached'],\n ['escape post-clear','local ok,why=pcall(control.SetVisible,control,false)\\n            intentVisibilities[control]=nil','local ok,why=pcall(control.SetVisible,control,false)','escape writer retained nested visibility promise'],\n ['no cache','saved and saved.binding','false and saved and saved.binding','unchanged visibility resubmitted'],\n])for(const [format,newline] of [['LF','\\n'],['CRLF','\\r\\n']])test(`visibility negative control (${format}): ${name}`,()=>{",
    "after": " ['rejected write','accepted~=false and ownsWrite then intentVisibilities','ownsWrite then intentVisibilities','rejected visibility write cached'],\n ['overlap','accepted~=false and ownsWrite then intentVisibilities','accepted~=false then intentVisibilities','overlapping visibility cached'],\n ['escape post-clear','local ok,why=pcall(control.SetVisible,control,false)\\n        intentVisibilities[control]=nil','local ok,why=pcall(control.SetVisible,control,false)','escape writer retained nested visibility promise'],\n ['no cache','saved and saved.binding','false and saved and saved.binding','unchanged visibility resubmitted'],\n])for(const [format,newline] of [['LF','\\n'],['CRLF','\\r\\n']])test(`visibility negative control (${format}): ${name}`,()=>{"
   }
  ]
 },
 "tests/lua/act3_orb_walker.lua": {
  "current": {
   "sha256": "816189819dfab34244bd1e354a74690b234b35eae094585f5fe1e6557f3a4082",
   "gitBlob": "d029d82265d714d1f27b0557e44d216dea86cbf7"
  },
  "previous": {
   "sha256": "d076ae112155a9f798d306695417bb2e66b0d5f2854598c34594af4d5eb4223d",
   "gitBlob": "9afda70901168e1e96b9d7631aec701bbe736672"
  },
  "hunks": [
   {
    "at": 199,
    "before": " local H=dofile('tests/lua/support/battle_action_fixture.lua')\n local inspectDetails=dofile('tests/lua/support/status_detail_fixture.lua')\n local F=H.F\n local root=F.Viewport.apply(F.control({children=F.Layout}),1280,720)",
    "after": " local H=dofile('tests/lua/support/battle_action_fixture.lua')\n local inspectDetails=dofile('tests/lua/support/status_detail_fixture.lua')\n local readPowers=dofile('tests/lua/support/power_tip_fixture.lua')\n local F=H.F\n local root=F.Viewport.apply(F.control({children=F.Layout}),1280,720)"
   },
   {
    "at": 215,
    "before": " dofile('tests/lua/support/intent_face_assertion.lua')(box,require('abyss_battle_intent_view').intentView(r.combat,1))\n tap('enemy1',91)\n local detail=inspectDetails(ui,panel)\n assert(detail:find(r.combat.catalog.cards.burn.name,1,true)and detail:find('抽牌堆',1,true)and detail:find('弃牌堆',1,true),detail)",
    "after": " dofile('tests/lua/support/intent_face_assertion.lua')(box,require('abyss_battle_intent_view').intentView(r.combat,1))\n tap('enemy1',91)\n assert(ui.info.powerTips and ui.info.index==1 and ui.info.id==e.id)\n local compact,rows=readPowers(panel)\n assert(#rows==2 and rows[1]:find('对你施加负面效果并攻击造成 10 点伤害',1,true),compact)\n assert(rows[2]:find('成长 3',1,true) and not compact:find(r.combat.catalog.cards.burn.name,1,true)\n  and not compact:find('抽牌堆',1,true) and not compact:find('弃牌堆',1,true),compact)\n panel:GetChild('statusDismiss').click({touchId=91})\n assert(not ui.info and ui:showStatus(1) and not ui.info.powerTips)\n local detail=inspectDetails(ui,panel)\n assert(detail:find(r.combat.catalog.cards.burn.name,1,true)and detail:find('抽牌堆',1,true)and detail:find('弃牌堆',1,true),detail)"
   },
   {
    "at": 227,
    "before": " dofile('tests/lua/support/monster_power_control_fixture.lua')(box,'generic_strength_up'):GetChild('hit').click({touchId=92})\n assert(panel:GetChild('statusInfo').visible and ui.info.id==e.id and ui.info.index==1)\n local names={};for i=1,H.F.Theme.layout.statusInfo.rows do\n  local part=panel:GetChild('statusInfo'):GetChild('name'..i)\n  if part.visible then names[#names+1]=part.text end\n end\n assert(table.concat(names,' '):find('成长 3',1,true),'Growth amount remains readable')\nend)\n",
    "after": " dofile('tests/lua/support/monster_power_control_fixture.lua')(box,'generic_strength_up'):GetChild('hit').click({touchId=92})\n assert(panel:GetChild('statusInfo').visible and ui.info.id==e.id and ui.info.index==1)\n local status,statusRows=readPowers(panel)\n assert(#statusRows==1 and status:find('成长 3',1,true)\n  and not status:find('10 点伤害',1,true),'Growth amount remains readable without the upcoming attack')\nend)\n"
   }
  ]
 },
 "tests/lua/act3_shapes.lua": {
  "current": {
   "sha256": "ef847476ffbd51e582fbb7addaffac614e8c5a4db5321b111a5528756fc9e301",
   "gitBlob": "38dba85c5b7b6f77660b825b609bfa4b22aa5bf4"
  },
  "previous": {
   "sha256": "5c6d2832d4236ba885475cfe7bb943b899b50d2dede113fdcd0a685c53507d56",
   "gitBlob": "8af749238fd8b2d8f4e8b368d29cb57bbe670b6b"
  },
  "hunks": [
   {
    "at": 212,
    "before": " local H=dofile('tests/lua/support/battle_action_fixture.lua');local F=H.F\n local inspectDetails=dofile('tests/lua/support/status_detail_fixture.lua')\n local root=F.Viewport.apply(F.control({children=F.Layout}),1280,720)\n local host=F.GameUI.new(root,D,F.Presentation,'click',{seed=1,campaign=true,prologue=false,",
    "after": " local H=dofile('tests/lua/support/battle_action_fixture.lua');local F=H.F\n local inspectDetails=dofile('tests/lua/support/status_detail_fixture.lua')\n local readPowers=dofile('tests/lua/support/power_tip_fixture.lua')\n local root=F.Viewport.apply(F.control({children=F.Layout}),1280,720)\n local host=F.GameUI.new(root,D,F.Presentation,'click',{seed=1,campaign=true,prologue=false,"
   },
   {
    "at": 225,
    "before": " end\n assert(not monsterControl(panel,'enemy5'))\n tap('enemy1',71);local text=inspectDetails(ui,panel)\n assert(text:find(r.combat.catalog.cards.dazed.name,1,true)and text:find('抽牌堆',1,true)and text:find('2',1,true),text)\n assert(not text:find('未知',1,true),text)",
    "after": " end\n assert(not monsterControl(panel,'enemy5'))\n tap('enemy1',71)\n assert(ui.info.powerTips and ui.info.index==1 and ui.info.id==r.combat.enemies[1].id)\n local compact,rows=readPowers(panel)\n assert(#rows==1 and compact:find('对你施加一种负面效果',1,true)\n  and not compact:find(r.combat.catalog.cards.dazed.name,1,true)\n  and not compact:find('抽牌堆',1,true),compact)\n panel:GetChild('statusDismiss').click({touchId=71})\n assert(not ui.info and ui:showStatus(1) and not ui.info.powerTips)\n local text=inspectDetails(ui,panel)\n assert(text:find(r.combat.catalog.cards.dazed.name,1,true)and text:find('抽牌堆',1,true)and text:find('2',1,true),text)\n assert(not text:find('未知',1,true),text)"
   },
   {
    "at": 241,
    "before": "  local hit=dofile('tests/lua/support/monster_power_control_fixture.lua')(monsterControl(panel,'enemy3'),'explosive'):GetChild('hit')\n  hit.click({touchId=80+turn});eq(ui.info.id,e.id);eq(ui.info.index,3)\n  local info=panel:GetChild('statusInfo');assert(info.visible)\n  local names,details={},{}\n  for i=1,F.Theme.layout.statusInfo.rows do\n   local name=info:GetChild('name'..i);if name.visible then names[#names+1]=name.text end\n   local line=info:GetChild('text'..i);if line.visible then details[#details+1]=line.text end\n  end\n  assert(table.concat(names,' '):find('自爆 '..(3-turn),1,true))\n  assert(table.concat(details,' '):find('30',1,true))\n  info:GetChild('hit').click({touchId=90+turn})\n end\n eq(intent(r.combat.enemies[3]),'wait')",
    "after": "  local hit=dofile('tests/lua/support/monster_power_control_fixture.lua')(monsterControl(panel,'enemy3'),'explosive'):GetChild('hit')\n  hit.click({touchId=80+turn});eq(ui.info.id,e.id);eq(ui.info.index,3)\n  local status,statusRows=readPowers(panel)\n  assert(#statusRows==1 and status:find('自爆 '..(3-turn),1,true),status)\n  assert(status:find('30',1,true),status)\n  panel:GetChild('statusDismiss').click({touchId=90+turn})\n  assert(not ui.info)\n end\n eq(intent(r.combat.enemies[3]),'wait')"
   }
  ]
 },
 "tests/lua/detail_latency.lua": {
  "current": {
   "sha256": "262b0422269bddf3237c10338ce7521e5128639df93bb926741c3b29ece009a2",
   "gitBlob": "d37a0126b9bf0f443ea770c1e8135582789a1db8"
  },
  "previous": {
   "sha256": "0d886fb386da8f6c7b938138bd8dafc935f96abf9a48f608ad89f6f810709654",
   "gitBlob": "7b2a025c5005a90919de2d1239e38187dcc14565"
  },
  "hunks": [
   {
    "at": 92,
    "before": " assert(ui:showStatus(0));assert(not ui.info and not panel:GetChild('statusInfo').visible)\nend)\n-- Down closes the explicit actor reader and consumes its Click.\nlocal beforeHand=#host.run.combat.hand\nassert(ui:showStatus(0))\nlocal hit=panel:GetChild('card1'):GetChild('hit')\nhit.listeners.down({touchId=71})\nassert(not ui.info,'new Down must close explicit details')\nif hit.listeners.up then hit.listeners.up({touchId=71}) end\nhit.listeners.click({touchId=71})\nassert(#host.run.combat.hand==beforeHand and not ui.selected,'close click passed through')\n-- Content is re-read, never cached by mutable actor identity.\nhost.run.combat.player.hp=17",
    "after": " assert(ui:showStatus(0));assert(not ui.info and not panel:GetChild('statusInfo').visible)\nend)\n-- An empty-space click dismisses the actor reader without selecting a card.\nlocal beforeHand=#host.run.combat.hand\nassert(ui:showStatus(0))\nlocal dismiss=panel:GetChild('statusDismiss')\nassert(dismiss.visible and event('statusDismiss','click',71),'empty-space click must be consumed')\nassert(not ui.info and not dismiss.visible and not ui.gesture and not ui.selected and #host.run.combat.hand==beforeHand,\n 'empty-space dismissal changed the hand or its input state')\n-- A click directly on an exposed card closes the reader and selects that card without playing it.\nassert(ui:showStatus(0))\nlocal cardUid=host.run.combat.hand[hand.bash].uid\nevent(card(hand.bash),'down',72)\nassert(not ui.info and not dismiss.visible and ui.gesture and ui.gesture.uid==cardUid and not ui.swallow,\n 'direct card press must dismiss the reader and capture the pressed card')\nevent(card(hand.bash),'up',72)\nevent(card(hand.bash),'click',72)\nassert(ui.selected==cardUid and #host.run.combat.hand==beforeHand,'direct card click must select without playing')\nassert(ui:cancelAim() and not ui.selected)\n-- Content is re-read, never cached by mutable actor identity.\nhost.run.combat.player.hp=17"
   }
  ]
 },
 "tests/lua/formal_campaign_entry.lua": {
  "current": {
   "sha256": "9f5bbe7cff40a944824e679bcead551f5b5b79d6e166c4180157eb8bfadb4c53",
   "gitBlob": "e59f2ccf1b27d59927bcfbb7f888c0f934e66641"
  },
  "previous": {
   "sha256": "49fee1c35afe656d1f4c45f4765486722558f6265cfce71f453a125aea55b7ca",
   "gitBlob": "225e9d3df66d8e109faef7029ffa1ad25f09eeba"
  },
  "hunks": [
   {
    "at": 16,
    "before": "    assert(host.mapUI:focusCurrent())\nend\nlocal function awaitNativePage(host)\n    for _=1,80 do\n        if not host.starting and not(host.prologue and host.prologue:covering())\n            and not(host.pageReveal and host.pageReveal:covered())then assert(not host.disabled);return end",
    "after": "    assert(host.mapUI:focusCurrent())\nend\nlocal function awaitNativePage(host,maxTicks)\n    for _=1,maxTicks or 80 do\n        if not host.starting and not(host.prologue and host.prologue:covering())\n            and not(host.pageReveal and host.pageReveal:covered())then assert(not host.disabled);return end"
   },
   {
    "at": 163,
    "before": "    local accepted,state=host.mapUI:choose(nextNode.id)\n    assert(accepted and state=='selection_pending' and host.mode=='map' and host.run.phase=='map')\n    awaitNativePage(host)\n    assert(host.map.currentNodeId==nextNode.id and host.mode=='battle' and host.run.phase=='combat')\n    return nextNode",
    "after": "    local accepted,state=host.mapUI:choose(nextNode.id)\n    assert(accepted and state=='selection_pending' and host.mode=='map' and host.run.phase=='map')\n    -- The Act 1 Guardian's narration and two scene fades take about six seconds.\n    local guardianEntry=host.run.act==1 and nextNode.type=='boss'\n    awaitNativePage(host,guardianEntry and 140 or nil)\n    assert(host.map.currentNodeId==nextNode.id and host.mode=='battle' and host.run.phase=='combat')\n    return nextNode"
   }
  ]
 },
 "tests/lua/game_ui_boss_treasure.lua": {
  "current": {
   "sha256": "1afa38323838de0a3c08e62f3b7664229515d745644bb1e92f4e70ae6f4a6d11",
   "gitBlob": "fa95f0032815623ed769fbb17597b753d332f8eb"
  },
  "previous": {
   "sha256": "bc1bc871121a584586aee74e4096f841fcc09d52608b0c299f3bf3c3e3953340",
   "gitBlob": "97c68881af268e34fcc7641aa7f4cd8b2c88730e"
  },
  "hunks": [
   {
    "at": 124,
    "before": "    assert(get(root,\"nodePanel/treasureView/rewardItem1\").visible)\n    assert(get(root,\"nodePanel/treasureView/rewardItem1\").visible and not get(root,\"nodePanel/treasureView/rewardItem1/disabled\").visible)\n    assert(get(root,\"nodePanel/treasureView/page\").text=='宝箱奖励 · 3 项')\n    local gold=ui.run.gold\n    assert(ui.nodeUI:press(\"treasureView/rewardItem1\") and ui.mode==\"victory\" and ui.run.gold==gold)",
    "after": "    assert(get(root,\"nodePanel/treasureView/rewardItem1\").visible)\n    assert(get(root,\"nodePanel/treasureView/rewardItem1\").visible and not get(root,\"nodePanel/treasureView/rewardItem1/disabled\").visible)\n    assert(get(root,\"nodePanel/treasureView/page\").text=='首领宝箱奖励 · 3 项')\n    local gold=ui.run.gold\n    assert(ui.nodeUI:press(\"treasureView/rewardItem1\") and ui.mode==\"victory\" and ui.run.gold==gold)"
   }
  ]
 },
 "tests/lua/game_ui_prologue_readiness.lua": {
  "current": {
   "sha256": "2ac7d82ac274e8ede9d3858fbd7a012ef8c5d1589be76d0f2fa3089a40e86893",
   "gitBlob": "0e943bbc8711b565196879554ea78163d57e79ff"
  },
  "previous": {
   "sha256": "7f6dd189490b895dabf014c6a633374a8b87920d653cd33643a83c908f63c2bf",
   "gitBlob": "e872dc23c6c7006d1f7d092eac250ef1acfebf29"
  },
  "hunks": [
   {
    "at": 18,
    "before": "owner.mode='battle';before=visits;assert(progress()==6 and visits==before)\nprint('LUA_OPENING_NATIVE_READINESS_PASS')",
    "after": "owner.mode='battle';before=visits;assert(progress()==6 and visits==before)\nprint('LUA_OPENING_NATIVE_READINESS_PASS')\n\nlocal F=dofile('tests/lua/support/game_ui_fixture.lua')\nlocal cursors={CursorDown='down',CursorUp='up',CursorEnter='enter',CursorExit='exit',CursorEndDrag='endDrag'}\n\nlocal function wrappedIntro(id,touchId)\n    local canvas=F.control({children=F.Layout})\n    local root=F.Viewport.apply(canvas,1280,720)\n    local eventView=root:GetChild('nodePanel'):GetChild('eventView')\n    local getChild=eventView.GetChild\n    local option=getChild(eventView,'option1')\n    option.id=id\n    local wrapper={__index=option,__newindex=option,__eq=function(a,b)\n        return rawequal(rawget(a,'native') or a,rawget(b,'native') or b)\n    end}\n    function eventView:GetChild(name)\n        if name=='option1' then return setmetatable({native=option},wrapper) end\n        return getChild(self,name)\n    end\n    local a,b=eventView:GetChild('option1'),eventView:GetChild('option1')\n    assert(a==b and not rawequal(a,b),'test must use different Lua wrappers for the same live native control')\n    local ui=F.GameUI.new(root,F.Data,F.Presentation,'click',{\n        seed=42,prologue=true,campaign=true,campaignProfile='competition-two-act',\n        characterProfile='production',imageSource='static',cursorEvents=cursors,\n        color=function(r,g,b,a)return {r=r,g=g,b=b,a=a}end,\n    })\n    root.ui=ui\n    local function startIntro()\n        assert(F.start(ui))\n        for _=1,80 do if not ui.prologue:covering() then break end;ui:update(.05)end\n        assert(ui.nodeUI.visible and not ui.prologue:covering())\n        assert(ui.run.nodeFlow.event.stage=='neow_intro')\n    end\n    local hit=option:GetChild('hit')\n    local function emit(name,x)\n        return assert(hit.listeners[name])({touchId=touchId,GetUIPos=function()return x or 414,84 end})\n    end\n    local function continueIntro()\n        emit('down');emit('up')\n        local ok,reason=emit('click')\n        assert(ok,'fresh opening pointer must advance: '..tostring(reason))\n        assert(ui.run.nodeFlow.event.stage=='neow_blessing')\n    end\n    startIntro()\n    emit('down');emit('exit',4);emit('up',4)\n    assert(not emit('click') and ui.run.nodeFlow.event.stage=='neow_intro','dragging out must cancel')\n    continueIntro()\n    assert(not emit('click') and ui.run.nodeFlow.event.stage=='neow_blessing','duplicated click changed the blessing')\n    assert(ui:openMenu() and ui:requestNavigation('abandon') and ui:confirmNavigation())\n    startIntro()\n    assert(not emit('click') and ui.run.nodeFlow.event.stage=='neow_intro','old click advanced a new run')\n    continueIntro()\nend\n\nwrappedIntro('neow-option-1')\nwrappedIntro(101,7)\nprint('LUA_OPENING_NATIVE_ALIAS_PASS mouse=yes touch=yes drag_out=yes reentry=yes')"
   }
  ]
 },
 "tests/lua/intent_visibility_cache.lua": {
  "current": {
   "sha256": "7386d3c7c1020873c6e6509b7d3aff64626a815583bf7d73fcefe56b61478a1a",
   "gitBlob": "e0bf2971bdc44dc4363ab0b929e39ab328924e06"
  },
  "previous": {
   "sha256": "08d666638364c0b539342136d2c8f3a35077defc8105f46a2f9e4087e5d0a66b",
   "gitBlob": "d9f6313dce57b9a9c4196c58c56cfae4d8399a8c"
  },
  "hunks": [
   {
    "at": 91,
    "before": "  api.renderEnemyIntent(box,{kind='attack',value='6'},100,{intentX=1,intentY=2,intentWidth=3},true,1)\n end\n return handles,draw,function()hide(box,'enemy')end\nend\nfor _,failure in ipairs({'success','false','throw'})do",
    "after": "  api.renderEnemyIntent(box,{kind='attack',value='6'},100,{intentX=1,intentY=2,intentWidth=3},true,1)\n end\n return handles,draw,function()hide(owner,box,'enemy')end\nend\nfor _,failure in ipairs({'success','false','throw'})do"
   }
  ]
 },
 "tests/native-candidate.test.mjs": {
  "current": {
   "sha256": "7da2872cfbf8ebbeffb397f2c1438d7f53364be6c6246b514f10a0047f6c117e",
   "gitBlob": "648a0038c40a641e431a090dff3e7d183f536eae"
  },
  "previous": {
   "sha256": "ca0f758acf0d3d053b91182eabe1e1fb5b3f5bdaeb3e5bf13ef9b5e47e224238",
   "gitBlob": "07cb62783fe2221d7ed8df4f7634796613e5fbaa"
  },
  "hunks": [
   {
    "at": 142,
    "before": "  writeFileSync(join(generated,'abyss_component_binding.lua'),'return {schemaVersion=1,enabled=false}');\n  writeFileSync(join(generated,'abyss_v25_card_assets.lua'),'return {enabled=false}');\n  for(const name of ['abyss_ui_profile','abyss_art_features','abyss_monster_actor_binding','abyss_monster_art_data', 'abyss_data','abyss_original_v4_data','abyss_map_layout','abyss_narrative','abyss_presentation','abyss_theme','abyss_menu_background_asset', 'abyss_ready_card_binding', 'abyss_ready_card_assets', 'abyss_traveler_portrait_assets'])\n    writeFileSync(join(generated,name+'.lua'),'return {}');",
    "after": "  writeFileSync(join(generated,'abyss_component_binding.lua'),'return {schemaVersion=1,enabled=false}');\n  writeFileSync(join(generated,'abyss_v25_card_assets.lua'),'return {enabled=false}');\n  writeFileSync(join(generated,'abyss_chapter_battle_scene_data.lua'),'return {enabled=false}');\n  for(const name of ['abyss_ui_profile','abyss_art_features','abyss_monster_actor_binding','abyss_monster_art_data', 'abyss_data','abyss_original_v4_data','abyss_map_layout','abyss_narrative','abyss_presentation','abyss_theme','abyss_menu_background_asset', 'abyss_ready_card_binding', 'abyss_ready_card_assets', 'abyss_traveler_portrait_assets'])\n    writeFileSync(join(generated,name+'.lua'),'return {}');"
   }
  ]
 },
 "tests/native-monster-catalog.test.mjs": {
  "current": {
   "sha256": "c434649fbc126bb01b5a9be0689e7b8cc2ad76edd37dd984d82dc0468ba70df3",
   "gitBlob": "49adaffe228113c9a605d6735db29ea0e075a070"
  },
  "previous": {
   "sha256": "57ac15906c3f3532f7d035909226acaff819785f14686df81450de4c569f20f4",
   "gitBlob": "3a65895cb135c09066825dda8753c4f33b2fd832"
  },
  "hunks": [
   {
    "at": 20,
    "before": " const actor=monsterActorTemplate(production);assertNativeUiCapacity(actor);\n // Two source intent-particle layers surround the icon and precede damage text.\n assert.equal(walk(actor).length,647);assert.equal(actor.visible,false);\n const names=actor.children.map(child=>child.name);\n assert(names.indexOf('intentVfxBehind')>=0&&names.indexOf('intentVfxBehind')<names.indexOf('intentIcon'));",
    "after": " const actor=monsterActorTemplate(production);assertNativeUiCapacity(actor);\n // Two source intent-particle layers surround the icon and precede damage text.\n assert.equal(walk(actor).length,648);assert.equal(actor.visible,false);\n assert.equal(actor.blockCursor,true);\n assert.deepEqual(actor.children.filter(child=>child.name==='hpHit'),[\n  {name:'hpHit',kind:'cursorArea',size:[106.66666666666667,12],visible:false},\n ]);\n const names=actor.children.map(child=>child.name);\n assert(names.indexOf('intentVfxBehind')>=0&&names.indexOf('intentVfxBehind')<names.indexOf('intentIcon'));"
   }
  ]
 },
 "tests/native-monster-power-template.test.mjs": {
  "current": {
   "sha256": "015ce5c992dc0be722fa83aadaad8a401bbacb582b52917471e51dba362d8646",
   "gitBlob": "c69215a30fd6b3ffaace0c80f58baab67c4a52d8"
  },
  "previous": {
   "sha256": "b22ee2349d7f2b185d1a5f56043263ab2b074308c290ec15210d84d38e89a1ad",
   "gitBlob": "373d53c307dd3ea180ae3d453749e6ffd07fc80d"
  },
  "hunks": [
   {
    "at": 20,
    "before": " const hero=preReadableUnitTypography(all(battleLayout()).find(n=>n.name==='hero'),{hero:true});\n const statusRow=hero.children.find(node=>node.name==='statusRow');\n const statusHits=['hit',...Array.from({length:10},(_,index)=>`hit${index+1}`)];\n // Reconstruct only #899's retired focus metadata for the original byte check.",
    "after": " const hero=preReadableUnitTypography(all(battleLayout()).find(n=>n.name==='hero'),{hero:true});\n const statusRow=hero.children.find(node=>node.name==='statusRow');\n // Compare the predecessor only after checking all ten live count bounds.\n for(let index=1;index<=10;index++){\n  const count=statusRow.children.find(node=>node.name===`count${index}`);\n  assert.deepEqual(count.size,[40,40],count.name);\n  count.size[0]=21.333333333333332;\n }\n const statusHits=['hit',...Array.from({length:10},(_,index)=>`hit${index+1}`)];\n // Reconstruct only #899's retired focus metadata for the original byte check."
   }
  ]
 },
 "tests/noncombat-v25-layout.test.mjs": {
  "current": {
   "sha256": "c97ed0609e04042432caaaf06c66cc1955cce9a2d9da17417fdf0aab8ca290c9",
   "gitBlob": "22332dafe5fbd4cbbc14aeaef90d833ce10a112a"
  },
  "previous": {
   "sha256": "84f7d6670686ae06dd6d97290e010882b9c6433104eae365e501b738d39d5cf4",
   "gitBlob": "4a1c82e57689e2bc8b9a7bf25f63bc23f5758b1a"
  },
  "hunks": [
   {
    "at": 263,
    "before": "Color={FromRGBA=function(...)return {...}end}\nlocal methods={}\nfunction methods:SetVisible(value)self.visible=value end\nfunction methods:SetActive(value)self.active=value end\nfunction methods:SetImage(source,id)self.imageId=id end\nfor _,name in ipairs({'SetAnchorMin','SetAnchorMax','SetPivot','SetSizeDelta','SetLocalScale','SetLocalRotation','SetAnchoredPosition','SetAsLastSibling','SetFillHorizontal','SetFillUnused'})do methods[name]=function()end end\nlocal function install(control)\n control.SetActive=methods.SetActive",
    "after": "Color={FromRGBA=function(...)return {...}end}\nlocal methods={}\nlocal active=setmetatable({},{__mode='k'})\nfunction methods:SetVisible(value)self.visible=value end\nfunction methods:SetActive(value)active[self]=value;F.setEngineActive(self,value)end\nfunction methods:SetImage(source,id)self.imageId=id end\nfor _,name in ipairs({'SetAnchorMin','SetAnchorMax','SetPivot','SetSizeDelta','SetLocalScale','SetLocalRotation','SetAnchoredPosition','SetAsLastSibling','SetFillHorizontal','SetFillUnused'})do methods[name]=function()end end\nlocal rootMeta=getmetatable(root)\nlocal readRoot,writeRoot=rootMeta.__index,rootMeta.__newindex\nrootMeta.__index=function(control,key)\n if key=='active' then return active[control]~=false end\n return readRoot(control,key)\nend\nrootMeta.__newindex=function(control,key,value)\n assert(key~='active','native active is read-only')\n writeRoot(control,key,value)\nend\nlocal cloneMeta={__index=function(control,key)\n if key=='active' then return active[control]~=false end\n return methods[key]\nend,__newindex=function(control,key,value)\n assert(key~='active','native active is read-only')\n rawset(control,key,value)\nend}\nlocal function install(control)\n control.SetActive=methods.SetActive"
   },
   {
    "at": 294,
    "before": " assert(index==41 or index==73 or index==99)\n if rejectCreation then return nil end\n created=created+1;return setmetatable({parent=parent,alive=true},{__index=methods})\nend,DestroyClientUIControl=function()destroyed=destroyed+1 end}\nlocal portraits=require('abyss_traveler_portraits').new(root,nil,{selectionAvatar=true,battlePortrait=true})",
    "after": " assert(index==41 or index==73 or index==99)\n if rejectCreation then return nil end\n created=created+1;return setmetatable({parent=parent,alive=true},cloneMeta)\nend,DestroyClientUIControl=function()destroyed=destroyed+1 end}\nlocal portraits=require('abyss_traveler_portraits').new(root,nil,{selectionAvatar=true,battlePortrait=true})"
   }
  ]
 },
 "tests/official-assets-runtime.test.mjs": {
  "current": {
   "sha256": "93fbc38723db2007e0709c368eb3bf89e0f08fd124dad36c52c9c5cd3b089292",
   "gitBlob": "68fe3c7d8a5d215c0ad1e907b67eed0ab5a53e7f"
  },
  "previous": {
   "sha256": "475d4772d0224ee4690cb5215d2536ac4961efe8a1415a40c3219dcc70fd4cde",
   "gitBlob": "4ab27d84b1640b8ee6c48daaecc3c6aae1b416c8"
  },
  "hunks": [
   {
    "at": 185,
    "before": "for i=3,26 do host.run.relics[i]='burning_blood' end\nhost:refresh()\nlocal overflow=bar:GetChild('slot25'):GetChild('more')\nassert(overflow.visible and overflow.text=='+4','wide relic count must preserve the exact overflow count')\nhost.run.relics,host.run.relicCounters=relics,counters\nlocal first=assert(F.Nodes.available(host.run,host.map)[1])",
    "after": "for i=3,26 do host.run.relics[i]='burning_blood' end\nhost:refresh()\nlocal previous,nextPage=bar:GetChild('previous'),bar:GetChild('next')\nlocal function visibleRelicCount()\n local count=0\n for i=1,25 do\n  local slot=bar:GetChild('slot'..i)\n  if slot.visible then count=count+1 end\n  assert(not slot:GetChild('more').visible,'owned relic pages must not replace relics with an overflow label')\n end\n return count\nend\nassert(visibleRelicCount()==23 and not previous.visible and nextPage.visible)\nassert(nextPage:GetChild('hit').click() and visibleRelicCount()==3 and previous.visible and not nextPage.visible)\nassert(previous:GetChild('hit').click() and visibleRelicCount()==23,'wide counter paging preserves every owned relic')\nhost.run.relics,host.run.relicCounters=relics,counters\nlocal first=assert(F.Nodes.available(host.run,host.map)[1])"
   },
   {
    "at": 1100,
    "before": "local button=assert(page:GetChild('back'))\nlocal label=assert(button:GetChild('label'))\nlocal function ink(expected)\n assert(label.fontColor.r==expected.r and label.fontColor.g==expected.g and label.fontColor.b==expected.b,'official dark button ink was overwritten by light-button ink')\nend\nassert(button.visible and label.text=='离开' and not page:GetChild('confirm').visible)\nink(Theme.officialAssets.buttonInk)\nlocal hit=button:GetChild('hit')",
    "after": "local button=assert(page:GetChild('back'))\nlocal label=assert(button:GetChild('label'))\nlocal shelf=assert(page:GetChild('shopView'))\nlocal advanceShop=dofile('tests/lua/support/shop_timeline.lua')\nlocal function tapControl(box,id)\n local listeners=box:GetChild('hit').listeners\n listeners.down({touchId=id});listeners.up({touchId=id});return listeners.click({touchId=id})\nend\nassert(button.visible and label.text=='离开' and not page:GetChild('confirm').visible)\nassert(tapControl(page:GetChild('merchant'):GetChild('talk'),799))\nadvanceShop(host.nodeUI)\nassert(shelf.visible and host.nodeUI.shopOpen and not host.nodeUI.shopBusy and label.text=='关闭')\nlocal function ink(expected)\n assert(label.fontColor.r==expected.r and label.fontColor.g==expected.g and label.fontColor.b==expected.b,'official dark button ink was overwritten by light-button ink')\nend\nink(Theme.officialAssets.buttonInk)\nlocal hit=button:GetChild('hit')"
   },
   {
    "at": 1133,
    "before": "host:refresh();ink(Theme.officialAssets.buttonInk)\nassert(shelf.visible and button.visible,'map preview must return to the same shelf')\nassert(tapControl(button,804) and host.nodeUI.shopBusy,'visible leave control starts the close animation')\nassert(not host.run.nodeFlow.complete,'leave must not commit before the shelf closes')\nassert(not hit.listeners.click({touchId=804}),'duplicate leave click accepted')\nadvanceShop(host)\nassert(host.run.nodeFlow.complete and not shelf.visible,'leaving through the visible control must finish the shop')\n`, 'OFFICIAL_SHOP_ROUTE_INK_PASS');\n});",
    "after": "host:refresh();ink(Theme.officialAssets.buttonInk)\nassert(shelf.visible and button.visible,'map preview must return to the same shelf')\nassert(tapControl(button,804) and not host.nodeUI.shopOpen and not shelf.visible,\n 'visible close control starts the shelf close animation')\nassert(not host.run.nodeFlow.complete,'closing the shelf must leave the shop room active')\nassert(not hit.listeners.click({touchId=804}),'duplicate close click accepted')\nadvanceShop(host.nodeUI)\nassert(not host.run.nodeFlow.complete and not shelf.visible and label.text=='离开')\nassert(tapControl(button,805) and host.run.nodeFlow.complete,'leaving through the room control must finish the shop')\n`, 'OFFICIAL_SHOP_ROUTE_INK_PASS');\n});"
   }
  ]
 },
 "tests/official-assets.test.mjs": {
  "current": {
   "sha256": "17fc945582ab9bda9c0fcba7d20396f3c02f089c18ab2b9be2913e35ddb595a6",
   "gitBlob": "5b36083005174b20625b20f8c097faf5500cb5c5"
  },
  "previous": {
   "sha256": "1984d8c172e465583f45d45821837733aa2befbe809e066025f0042784cb0ec5",
   "gitBlob": "8e9b3f1d7559067512d96f7a545bf037277846f7"
  },
  "hunks": [
   {
    "at": 414,
    "before": " const layout=gameLayout(),theme=officialAssetsTheme(nativeTheme);\n const before=new Map(paths(layout).filter(([,node])=>node.kind==='image').map(([path,node])=>[path,node.image]));\n applyOfficialAssets([layout],theme);\n const battle=child(layout,'battlePanel'),turn=child(battle,'endTurn');",
    "after": " const layout=gameLayout(),theme=officialAssetsTheme(nativeTheme);\n const before=new Map(paths(layout).filter(([,node])=>node.kind==='image').map(([path,node])=>[path,node.image]));\n const replacements=new Map([\n  ['/SlayTheAbyss/nodePanel/eventView/art',theme.icon.eventArt.default],\n  ['/SlayTheAbyss/battlePanel/topBar/battleRoute/icon',theme.icon.map],\n  ['/SlayTheAbyss/mapPanel/mapRoute/icon',theme.icon.map],\n  ['/SlayTheAbyss/nodePanel/runRoute/icon',theme.icon.map],\n ]);\n applyOfficialAssets([layout],theme);\n const battle=child(layout,'battlePanel'),turn=child(battle,'endTurn');"
   },
   {
    "at": 429,
    "before": "  }\n for(const [path,node]of paths(layout))if(/\\/(portrait|intentIcon|intentBadge|intentExtra|hpIcon|goldIcon|blockedLock|art|art_attack|art_skill|art_power|icon)$/.test(path)&&node.kind==='image'){\n  const expected=path==='/SlayTheAbyss/nodePanel/eventView/art'?theme.icon.eventArt.default:\n   before.get(path)??(/^\\/SlayTheAbyss\\/relicBar\\/slot(?:1[3-9]|2[0-5])\\/icon$/.test(path)?before.get('/SlayTheAbyss/relicBar/slot1/icon'):undefined);\n  assert.equal(node.image,expected,path);\n }\n assert.equal(child(child(layout,'menuPanel'),'backdrop').image,nativeTheme.image.officialBackdrops.title);\n const menu=child(layout,'menuPanel'),result=child(menu,'result');",
    "after": "  }\n for(const [path,node]of paths(layout))if(/\\/(portrait|intentIcon|intentBadge|intentExtra|hpIcon|goldIcon|blockedLock|art|art_attack|art_skill|art_power|icon)$/.test(path)&&node.kind==='image'){\n  const expected=replacements.get(path)??before.get(path)??\n   (/^\\/SlayTheAbyss\\/relicBar\\/slot(?:1[3-9]|2[0-5])\\/icon$/.test(path)?before.get('/SlayTheAbyss/relicBar/slot1/icon'):undefined);\n  assert.equal(node.image,expected,path);\n  replacements.delete(path);\n }\n assert.deepEqual([...replacements.keys()],[],'every substituted semantic icon must be present');\n assert.equal(child(child(layout,'menuPanel'),'backdrop').image,nativeTheme.image.officialBackdrops.title);\n const menu=child(layout,'menuPanel'),result=child(menu,'result');"
   }
  ]
 },
 "tests/official-backdrop-assets.test.mjs": {
  "current": {
   "sha256": "67aa31111e7a7c62171b3211503cc6e75478e32c53e204ec5966483a51abd334",
   "gitBlob": "c8d24926639a162fc4f047853f2c9448fe6abe64"
  },
  "previous": {
   "sha256": "680c4dd9e1189e50d8e5e39fdab5526381a3866f439103c80907970912dfca79",
   "gitBlob": "c4c14b43f8d745d0f13810ddd71d6205372aeb20"
  },
  "hunks": [
   {
    "at": 3,
    "before": "import {gameLayout} from '../scripts/game-ui-layout.mjs';\nimport {assertNativeUiCapacity} from '../scripts/build-ui.mjs';\ntest('solid title and readable official selection/battle pictures retain their approved bindings',()=>{\n const ids=nativeTheme.image.officialBackdrops;\n assert.deepEqual(ids,{title:100001,selection:107050,act1_1:107106,act1_2:107107,act1_3:107110,\n  act2_1:107108,act2_2:107109,act2_3:107105,boss1:107280,boss2:107279});\n assert.equal(new Set(Object.values(ids)).size,10);\n const layout=gameLayout();assertNativeUiCapacity(layout);\n const menu=layout.controls.find(c=>c.name==='menuPanel');",
    "after": "import {gameLayout} from '../scripts/game-ui-layout.mjs';\nimport {assertNativeUiCapacity} from '../scripts/build-ui.mjs';\nimport {officialAssetsTheme} from '../scripts/official-assets-layout.mjs';\nimport {applyOfficialNoncombatLayout} from '../scripts/noncombat-v25-layout.mjs';\ntest('solid title and readable official selection/battle pictures retain their approved bindings',()=>{\n const ids=nativeTheme.image.officialBackdrops;\n assert.deepEqual(ids,{title:100001,selectionFallback:107271,selection:107050,act1_1:107106,act1_2:107107,act1_3:107110,\n  act2_1:107108,act2_2:107109,act2_3:107105,boss1:107280,boss2:107279});\n assert.equal(new Set(Object.values(ids)).size,11);\n const layout=gameLayout();assertNativeUiCapacity(layout);\n const menu=layout.controls.find(c=>c.name==='menuPanel');"
   },
   {
    "at": 37,
    "before": " }\n assert(!JSON.stringify(layout).includes('officialVista_'));\n});",
    "after": " }\n assert(!JSON.stringify(layout).includes('officialVista_'));\n applyOfficialNoncombatLayout(layout,officialAssetsTheme(nativeTheme));\n const landscape=selection.children.find(c=>c.name==='v25Background').children.find(c=>c.name==='landscape');\n assert.equal(landscape.image,107271,'official selection retains the approved loading landscape');\n});"
   }
  ]
 },
 "tests/pr250-budget-coverage.test.mjs": {
  "current": {
   "sha256": "418cd7a775d445a4512ac9b9810c5ff397494d8ca33fcbd560f8a3ddc575cf71",
   "gitBlob": "2d99d52070a32fc50bd06721c932ffd6833718f8"
  },
  "previous": {
   "sha256": "c9eadbc1572d4d16cc6b93104eb6fcd888e781b524527332fde9cc765ed19a27",
   "gitBlob": "25532173e1b11cb2a31ee4c3696ef76e531fb61e"
  },
  "hunks": [
   {
    "at": 7,
    "before": "const discovered=readdirSync('tests/lua').filter(file=>file.endsWith('.lua')).map(file=>`tests/lua/${file}`).sort();\n\ntest('reward partitions retain the frozen real-victory body and cover all72 original reward targets once',()=>{\n assert.equal(p.base,'a0eedf8c8cdfb3bbab292060b3d3e81103cec9de');assert.equal(p.timeoutMilliseconds,30000);\n assert.deepEqual(p.rewardHelper,{path:'tests/lua/support/warrior75_reward_cases.lua',sha256LF:'7c6e2c485274bfc7bf06abf876116956986fccf0d70526da2ff331c68b14de07'});\n assert.equal(sha(read(p.rewardHelper.path)),p.rewardHelper.sha256LF);\n assert.deepEqual(p.rewardCounts,{common:20,uncommon:36,rare:16});\n assert.equal(p.maximumRewardTargetsPerFixture,5);",
    "after": "const discovered=readdirSync('tests/lua').filter(file=>file.endsWith('.lua')).map(file=>`tests/lua/${file}`).sort();\n\nfunction beforeProductionEncounterRename(source, expectedCount) {\n // #951 renamed only these Run.startCombat encounter IDs. Reconstruct the\n // predecessor for the byte checks while the Lua tests use the current IDs.\n const calls=/(Run\\.startCombat\\((?:run|candidate|r),)(['\"])raven_adept_solo\\2\\)/g;\n assert.equal([...source.matchAll(calls)].length,expectedCount);\n return source.replace(calls,'$1$2cultist_solo$2)');\n}\n\ntest('reward partitions retain the frozen real-victory body and cover all72 original reward targets once',()=>{\n assert.equal(p.base,'a0eedf8c8cdfb3bbab292060b3d3e81103cec9de');assert.equal(p.timeoutMilliseconds,30000);\n assert.deepEqual(p.rewardHelper,{path:'tests/lua/support/warrior75_reward_cases.lua',sha256LF:'7c6e2c485274bfc7bf06abf876116956986fccf0d70526da2ff331c68b14de07'});\n assert.equal(sha(beforeProductionEncounterRename(read(p.rewardHelper.path),2)),p.rewardHelper.sha256LF);\n assert.deepEqual(p.rewardCounts,{common:20,uncommon:36,rare:16});\n assert.equal(p.maximumRewardTargetsPerFixture,5);"
   },
   {
    "at": 66,
    "before": "  original=original.slice(prefix.length,-footer.length);\n  for(const replacement of replacements){assert.equal(original.split(replacement.after).length,2);original=original.replace(replacement.after,replacement.before);}\n  assert.equal(sha(original),known.sha);const bytes=Buffer.from(original);assert.equal(bytes.length,known.bytes);\n  assert.equal(createHash('sha1').update(`blob ${bytes.length}\\0`).update(bytes).digest('hex'),known.blob);",
    "after": "  original=original.slice(prefix.length,-footer.length);\n  for(const replacement of replacements){assert.equal(original.split(replacement.after).length,2);original=original.replace(replacement.after,replacement.before);}\n  original=beforeProductionEncounterRename(original,index===0?3:1);\n  assert.equal(sha(original),known.sha);const bytes=Buffer.from(original);assert.equal(bytes.length,known.bytes);\n  assert.equal(createHash('sha1').update(`blob ${bytes.length}\\0`).update(bytes).digest('hex'),known.blob);"
   }
  ]
 },
 "tests/relic-view-layout.test.mjs": {
  "current": {
   "sha256": "675ad02b90db9f8832c2e597e7a80226718bf8c583c7cd630ad131fcff6691ef",
   "gitBlob": "369c0051207682a909e0ffab661ac3b3c7c5c1dd"
  },
  "previous": {
   "sha256": "54bc111e4cf0ece7368d1b5b20fefc70b5f74d7645459bbd1f07d37cb34075a2",
   "gitBlob": "98de41613e65eb73b7adfdf22a46b8204ed45c6f"
  },
  "hunks": [
   {
    "at": 29,
    "before": "});\nfunction assertBarGeometry(t) {\n  const [bar] = relicViewControls(t), [tray, ...slots] = bar.children;\n  const obstacles = Object.values(t.layout.nativeNode.topBar);\n  // Final battle controls use a different top-row height from node/map HUDs.",
    "after": "});\nfunction assertBarGeometry(t) {\n  const [bar] = relicViewControls(t), [tray] = bar.children;\n  const slots = bar.children.slice(1, -2);\n  const obstacles = Object.values(t.layout.nativeNode.topBar);\n  // Final battle controls use a different top-row height from node/map HUDs."
   },
   {
    "at": 61,
    "before": "  const [bar, panel] = relicViewControls(theme), v = theme.layout.relicView;\n  assert.equal(bar.name, 'relicBar');\n  const [tray, ...slots] = bar.children;\n  assert.equal(tray.name, 'tray');\n  assert.equal(slots.length, v.bar.count);\n  // Relics now occupy a second row; preserve separation in both axes, not X alone.\n  assert.equal(slots.length, 12);\n  assertBarGeometry(theme);\n  slots.forEach((slot, i) => {",
    "after": "  const [bar, panel] = relicViewControls(theme), v = theme.layout.relicView;\n  assert.equal(bar.name, 'relicBar');\n  const [tray] = bar.children;\n  const slots = bar.children.slice(1, -2);\n  const arrows = bar.children.slice(-2);\n  assert.equal(tray.name, 'tray');\n  assert.equal(slots.length, v.bar.count);\n  // Relics now occupy a second row; preserve separation in both axes, not X alone.\n  assert.equal(slots.length, 12);\n  assert.deepEqual(arrows.map(arrow => [arrow.name, arrow.position, arrow.size]), [\n    ['previous', [-624, 292], [32, 44]], ['next', [610, 292], [32, 44]],\n  ]);\n  for (const arrow of arrows) {\n    assert.equal(arrow.visible, false);\n    const hit = arrow.children.find(control => control.name === 'hit');\n    assert.equal(hit.kind, 'presetButton');\n    assert.deepEqual(hit.size, arrow.size);\n  }\n  assertBarGeometry(theme);\n  slots.forEach((slot, i) => {"
   }
  ]
 },
 "tests/responsibility-complexity.test.mjs": {
  "current": {
   "sha256": "eca9f64158443c5b8a112cde2be1289b0faec9364308b7e8447ca7e2ff6de7d6",
   "gitBlob": "c3618edc3133a492745a6a25b5b0b51922f3d950"
  },
  "previous": {
   "sha256": "a67da6f3394c5411d753c72dc8211a5cbe711846c105be3fead1d6e2f8b52be2",
   "gitBlob": "b9ef7467331c0e259c64fd07d2f58c5c44a07b9c"
  },
  "hunks": [
   {
    "at": 86,
    "before": "    'choiceActions.dualWield','M.applyChoice','commitMultipleChoice','toggleChoice',\n    'chooseMultiple','containsUid','chooseSingle','M.choose','applyDrainedAction','refreshDrainedHand','M.drain',\n    ...['writhingRoll','writhingParasite','giantHeadSlow','timeEater','reptomancerSuicide',\n      'enemyAction','staticRetaliation','classPotion','silentFinal','discover','colorless','originalV4',\n      'relicUpgradeRandomHand','playTop','darklingAction','heartBeat','spireDeathRemove',",
    "after": "    'choiceActions.dualWield','M.applyChoice','commitMultipleChoice','toggleChoice',\n    'chooseMultiple','containsUid','chooseSingle','M.choose','applyDrainedAction','refreshDrainedHand','M.drain',\n    ...['writhingRoll','writhingParasite','giantHeadSlow','timeEater','reptomancerDismissal',\n      'enemyAction','staticRetaliation','classPotion','silentFinal','discover','colorless','originalV4',\n      'relicUpgradeRandomHand','playTop','darklingAction','heartBeat','spireDeathRemove',"
   }
  ]
 },
 "tests/v25-portrait-profile.test.mjs": {
  "current": {
   "sha256": "bbd878eba6f75c900babf2385bc430d79916799e5f2b3f159c627220c9050727",
   "gitBlob": "75843c981e5d2b1b30e2d2e98460972a9f271d58"
  },
  "previous": {
   "sha256": "fc32b41101518439c78dc3505914ddafeb75d3d79d3dbc22f97865267ce99dd2",
   "gitBlob": "eb98b02e7f264fe9dc38fc0cf01a9889b03a48f8"
  },
  "hunks": [
   {
    "at": 109,
    "before": "});\n\ntest('combined native page readiness waits for the complete 1600 background and ignores the hidden legacy avatar',()=>{\n withPortraitVm(`\nlocal selectionHost=tree();stage.children.characterPanel.children.lumineSelectionBackground=selectionHost",
    "after": "});\n\ntest('native page readiness allows staged selection art and ignores the hidden legacy avatar',()=>{\n withPortraitVm(`\nlocal selectionHost=tree();stage.children.characterPanel.children.lumineSelectionBackground=selectionHost"
   },
   {
    "at": 118,
    "before": "local a=Portraits.new(stage,nil,{selectionAvatar=true,battlePortrait=true})\nassert(a:sync('menu',true,false,'ironclad'))\nassert(not a:readyForPage('menu',true,'ironclad','characterPanel'),'partial background passed readiness')\nfor _=1,1000 do a:tick();if a:status().selection.phase=='ready' then break end end\nassert(a:status().selection.total==1600 and a:status().selection.phase=='ready')\nassert(a:status().avatar.owned==0 and a:readyForPage('menu',true,'ironclad','characterPanel'),",
    "after": "local a=Portraits.new(stage,nil,{selectionAvatar=true,battlePortrait=true})\nassert(a:sync('menu',true,false,'ironclad'))\nassert(a:readyForPage('menu',true,'ironclad','characterPanel'),'selection art delayed page input')\nassert(a:status().selection.phase=='building' and not selectionHost.visible,'cold selection published an incomplete group')\nlocal partial=false\nfor _=1,1000 do\n a:tick()\n local state=a:status().selection\n if state.phase=='ready' then break end\n if selectionHost.visible then\n  assert(state.revealIndex>2,'selection published before its first two complete groups')\n  partial=true\n end\nend\nassert(partial,'selection waited for all 1600 images before publishing its first groups')\nassert(a:status().selection.total==1600 and a:status().selection.phase=='ready')\nassert(a:status().avatar.owned==0 and a:readyForPage('menu',true,'ironclad','characterPanel'),"
   },
   {
    "at": 200,
    "before": "end\nlocal backing=tree();backing:SetVisible(true);panel.children.v25Background=backing\npanel.children.details=tree({})\ntraveler:SetVisible(false)\nlocal rows={}",
    "after": "end\nlocal backing=tree();backing:SetVisible(true);panel.children.v25Background=backing\nlocal note=tree();note.text=''\npanel.children.details=tree({portraitNote=note})\ntraveler:SetVisible(false)\nlocal rows={}"
   },
   {
    "at": 261,
    "before": "selectionHost:SetVisible(false);panel.children.lumineSelectionBackground=selectionHost\nlocal backing=tree();backing:SetVisible(true);panel.children.v25Background=backing\npanel.children.details=tree({})\ntraveler:SetVisible(false)\nlocal a=Portraits.new(stage,nil,{selectionAvatar=true})",
    "after": "selectionHost:SetVisible(false);panel.children.lumineSelectionBackground=selectionHost\nlocal backing=tree();backing:SetVisible(true);panel.children.v25Background=backing\nlocal note=tree();note.text=''\npanel.children.details=tree({portraitNote=note})\ntraveler:SetVisible(false)\nlocal a=Portraits.new(stage,nil,{selectionAvatar=true})"
   },
   {
    "at": 278,
    "before": " 'the queued same-role refresh stranded a completed but hidden portrait')\nassert(a:release() and LiveCount()==0)\n`,{runtimeV2:true,officialAssets:true});\n});",
    "after": " 'the queued same-role refresh stranded a completed but hidden portrait')\nassert(a:release() and LiveCount()==0)\nselectionHost.SetSizeDelta=function(self,...)\n a:sync('menu',true,false,nil)\n return resize(self,...)\nend\nassert(a:sync('menu',true,false,'ironclad'))\nfor _=1,120 do a:tick(1/60)end\nassert(not selectionHost.visible and backing.visible and LiveCount()==0,\n 'a newer empty selection was discarded during native configuration')\nassert(a:release())\n`,{runtimeV2:true,officialAssets:true});\n});"
   }
  ]
 }
});

// The unified build retains the exact pre-unification GIL test for older replay views.
const unifiedGilFixture={
 "current": {
  "sha256": "a031bf41ba5383976a8ce3f15b70798042f363920fb8d03a14a108cf58952ec4",
  "gitBlob": "47cdb8b71e60a22ef0398172744fec302c7237d8"
 },
 "previous": {
  "sha256": "d5ec827fa24b3ad3ff33b304723efddc4205599dbc8e8c28141aa3d22d99c1c6",
  "gitBlob": "0e38620640049ad1f0e0a7a8a4c9a82b1f0a629b"
 },
 "hunks": [
  {
   "at": 6,
   "before": "import { test } from 'node:test';\nimport { verifyDownloadedArtifact, verifyPublishedRebase, verifyReceipts } from '../scripts/gil-candidate.mjs';\nimport { api, approvedRequest, buildOnlyRequest, candidateTarget, encoderSha256, findArtifact, validationTarget, verifySource } from '../scripts/gil-candidate-preflight.mjs';\nimport { fileRecord } from '../scripts/evidence-files.mjs';\nimport { hostedCandidatePath, verifiedPayloadInputs } from '../scripts/hosted-gil-receipt.mjs';",
   "after": "import { test } from 'node:test';\nimport { verifyDownloadedArtifact, verifyPublishedRebase, verifyReceipts } from '../scripts/gil-candidate.mjs';\nimport { api, approvedRequest, buildOnlyRequest, candidateTarget, encoderSha256, findArtifact, releaseBuildRequest, releaseBuildTarget, validationTarget, verifySource } from '../scripts/gil-candidate-preflight.mjs';\nimport { fileRecord } from '../scripts/evidence-files.mjs';\nimport { hostedCandidatePath, verifiedPayloadInputs } from '../scripts/hosted-gil-receipt.mjs';"
  },
  {
   "at": 22,
   "before": "const hotfix = candidateTarget(branch, sourceSha);\n\ntest('trusted develop owns protection, while audit receives the bound build context', () => {\n  const workflow = readFileSync(new URL('../.github/workflows/gil-candidate.yml', import.meta.url), 'utf8').replaceAll('\\r\\n', '\\n');\n  assert.match(workflow, /^    if: github\\.event_name == 'workflow_dispatch' && github\\.repository_id == '1429751262' && github\\.ref == 'refs\\/heads\\/develop'$/m);\n  assert.match(workflow, /^          GIL_BASE_URL: \\$\\{\\{ secrets\\.GIL_BASE_URL \\}\\}$/m);\n  assert.equal(workflow.match(/secrets\\./g).length, 1);\n  const sourceCheckout = workflow.slice(workflow.indexOf('          path: source\\n'), workflow.indexOf('          path: miliastra-mcp\\n'));\n  const sparse = sourceCheckout.match(/^          sparse-checkout: \\|\\n((?: {12}\\S+\\n)+)/m)?.[1];\n  assert.deepEqual(sparse?.trim().split('\\n').map(path => path.trim()), [\n    'scripts', 'src/lua', 'data', 'config', 'tools', 'art/characters/traveler-geo/portraits',\n    'art/lowpoly-select', 'art/performance', 'experiments/lumine-native-fit/fit-hybrid-final',\n  ]);\n  const audit = workflow.slice(workflow.indexOf('- name: Audit the final GIL'), workflow.indexOf('- uses: actions/upload-artifact'));\n  for (const [name, expression] of Object.entries({\n    SOURCE_REF: 'inputs.source_ref', SOURCE_SHA: 'inputs.source_sha', WORK_KEY: 'steps.candidate.outputs.work_key',\n    BASE_SHA256: 'steps.candidate.outputs.base_sha256', REQUEST_ID: 'steps.candidate.outputs.request_id',\n    RELEASE_VERSION: 'steps.candidate.outputs.release_version', QUALITY_RUN: 'steps.candidate.outputs.quality_run',\n    QUALITY_ATTEMPT: 'steps.candidate.outputs.quality_attempt', QUALITY_CHECKOUT_ARTIFACT: 'steps.candidate.outputs.quality_checkout_artifact',\n    LICENSES_RUN: 'steps.candidate.outputs.licenses_run',",
   "after": "const hotfix = candidateTarget(branch, sourceSha);\n\ntest('only the unified workflow builds, audits and publishes a gated release download', () => {\n  const path = new URL('../.github/workflows/gil-build.yml', import.meta.url);\n  const workflow = readFileSync(path, 'utf8').replaceAll('\\r\\n', '\\n');\n  assert.equal(existsSync(new URL('../.github/workflows/gil-candidate.yml', import.meta.url)), false);\n  assert.match(workflow, /workflows: \\[Quality, Licenses\\]/);\n  assert.match(workflow, /github\\.event\\.workflow_run\\.event == 'workflow_dispatch'/);\n  assert.match(workflow, /GIL_PRODUCTION_WORK_KEY: \\$\\{\\{ vars\\.GIL_PRODUCTION_WORK_KEY \\}\\}/);\n  assert.match(workflow, /ref: \\$\\{\\{ env\\.SOURCE_SHA \\}\\}/);\n  assert.doesNotMatch(workflow, /release:\\n|secrets\\.|environment:|contents: write|attach-release:/);\n  const sourceCheckout = workflow.slice(workflow.indexOf('          path: source\\n'), workflow.indexOf('          path: miliastra-mcp\\n'));\n  const sparse = sourceCheckout.match(/^          sparse-checkout: \\|\\n((?: {12}\\S+\\n)+)/m)?.[1];\n  assert.deepEqual(sparse?.trim().split('\\n').map(path => path.trim()), [\n    '.github/workflows', 'scripts', 'src/lua', 'data', 'config', 'tools', 'art/characters/traveler-geo/portraits',\n    'art/lowpoly-select', 'art/performance', 'experiments/lumine-native-fit/fit-hybrid-final',\n  ]);\n  const audit = workflow.slice(workflow.indexOf('- name: Audit the final GIL'), workflow.indexOf('- uses: actions/upload-artifact'));\n  for (const [name, expression] of Object.entries({\n    WORK_KEY: 'steps.candidate.outputs.work_key', BASE_SHA256: 'steps.candidate.outputs.base_sha256',\n    REQUEST_ID: 'steps.candidate.outputs.request_id', RELEASE_VERSION: 'steps.candidate.outputs.release_version',\n    GIL_RELEASE_ARTIFACT: 'steps.candidate.outputs.archive', QUALITY_RUN: 'steps.candidate.outputs.quality_run',\n    QUALITY_ATTEMPT: 'steps.candidate.outputs.quality_attempt', QUALITY_CHECKOUT_ARTIFACT: 'steps.candidate.outputs.quality_checkout_artifact',\n    LICENSES_RUN: 'steps.candidate.outputs.licenses_run',"
  },
  {
   "at": 171,
   "before": "});\n\ntest('automatic build pushes are scoped to primary develop and the diagnostic branch in the known fork', () => {\n  const workflow = readFileSync(new URL('../.github/workflows/gil-build.yml', import.meta.url), 'utf8').replaceAll('\\r\\n', '\\n');\n  const fork = '1460133275';\n  const testRef = 'refs/heads/ci/full/gil-build/v2.2.0-closure-20261127';\n  assert.deepEqual(validationTarget('1429751262', 'refs/heads/develop', sourceSha), { branch: 'develop' });\n  assert.deepEqual(validationTarget(fork, testRef, sourceSha), { branch: testRef.slice(11) });\n  assert.throws(() => validationTarget(fork, 'refs/heads/develop', sourceSha), /assigned Fork B/);\n  assert.throws(() => validationTarget('1429751262', testRef, sourceSha), /assigned Fork B/);\n  assert.throws(() => validationTarget('3', testRef, sourceSha), /assigned Fork B/);\n  assert.match(workflow, /push:\\n    branches: \\[develop, 'ci\\/full\\/gil-build\\/\\*\\*'\\]/);\n  assert.match(workflow, /PUBLISH_ARTIFACT: 'false'/);\n  assert.match(workflow, /path: source\\/build\\/gil-artifact\\/manifest\\.json\\n/);\n  assert.doesNotMatch(workflow, /secrets\\.|environment:/);\n  const buildSteps = workflow.slice(workflow.indexOf('      - name: Fetch and verify the published project GIL'));\n  assert.equal(buildSteps.match(/^      - (?:name|uses):/gm)?.length, 9);\n  assert.equal(buildSteps.match(/^        if: steps\\.candidate\\.outputs\\.build == 'true'$/gm)?.length, 9);\n  const archive = readFileSync(new URL('../.github/workflows/gil-candidate.yml', import.meta.url), 'utf8');\n  const usedActions = [...workflow.matchAll(/^\\s*- uses: (actions\\/[a-z-]+@[0-9a-f]+)\\b/gm)];\n  assert.equal(usedActions.length, 6);\n  for (const [, action] of usedActions) assert(archive.includes(`uses: ${action} `), `Build action must use the archive pin: ${action}`);\n});\n",
   "after": "});\n\ntest('diagnostic refs only upload a manifest and do not trigger tag rebuilds', () => {\n  const workflow = readFileSync(new URL('../.github/workflows/gil-build.yml', import.meta.url), 'utf8').replaceAll('\\r\\n', '\\n');\n  const fork = '1460133275';\n  const testRef = 'refs/heads/ci/full/gil-build/v2.2.0-closure-20261127';\n  for (const branch of ['develop', 'master', 'test/gil-build/probe']) {\n    assert.deepEqual(validationTarget('1429751262', 'refs/heads/' + branch, sourceSha), { branch });\n  }\n  assert.deepEqual(validationTarget(fork, testRef, sourceSha), { branch: testRef.slice(11) });\n  assert.throws(() => validationTarget(fork, 'refs/heads/develop', sourceSha), /assigned Fork B/);\n  assert.throws(() => validationTarget('1429751262', testRef, sourceSha), /assigned Fork B/);\n  assert.throws(() => validationTarget('3', testRef, sourceSha), /assigned Fork B/);\n  assert.throws(() => validationTarget('1429751262', 'refs/tags/engine-v2.2.0', sourceSha), /enabled primary ref/);\n  assert.match(workflow, /path: source\\/build\\/gil-artifact\\/manifest\\.json\\n/);\n  assert.match(workflow, /outputs\\.build == 'true' && steps\\.candidate\\.outputs\\.archive != 'true'/);\n  assert.match(workflow, /outputs\\.build == 'true' && steps\\.candidate\\.outputs\\.archive == 'true'/);\n  assert.match(workflow, /group: gil-build-.*head_branch.*head_sha/);\n});\n\ntest('unified build admits exact primary release events and never a PR, foreign run or tag', () => {\n  const release = { repoId: String(repo.id), ref: 'refs/heads/' + branch, controllerSha: sourceSha,\n    source: sourceSha, branch, event: 'workflow_dispatch' };\n  assert.deepEqual(releaseBuildTarget(release), hotfix);\n  assert.deepEqual(releaseBuildTarget({...release, event:'push'}), hotfix);\n  for (const changes of [{event:'release'}, {ref:'refs/tags/engine-v2.1.1'}, {repoId:'3'}, {controllerSha:'3'.repeat(40)}]) {\n    assert.throws(() => releaseBuildTarget({...release, ...changes}), /formal GIL|Release GIL input/);\n  }\n  const upstream = {repository:repo, head_repository:repo, event:'workflow_dispatch', status:'completed', conclusion:'success',\n    path:'.github/workflows/quality.yml', head_branch:branch, head_sha:sourceSha};\n  const automatic = {...release, event:'workflow_run', ref:'refs/heads/develop', controllerSha:policy.controllerSha, upstream};\n  assert.deepEqual(releaseBuildTarget(automatic), hotfix);\n  assert.deepEqual(releaseBuildTarget({...automatic, upstream:{...upstream, path:'.github/workflows/licenses.yml'}}), hotfix);\n  for (const changes of [{event:'pull_request'}, {conclusion:'failure'}, {head_repository:{id:3}}, {head_sha:'3'.repeat(40)},\n    {head_branch:'develop'}, {path:'.github/workflows/arbitrary.yml'}]) {\n    assert.throws(() => releaseBuildTarget({...automatic, upstream:{...upstream, ...changes}}), /successful primary/);\n  }\n});\n\ntest('equivalent triggers share one artifact request but changed Full, license or build policy gets a new candidate', () => {\n  const checks = {quality:7, qualityAttempt:1, qualityCheckoutArtifact:8, licenses:9};\n  const request = (key=workKey, evidence=checks, files=policy.checkedFiles) => releaseBuildRequest(key, sourceSha, hotfix, evidence, files);\n  assert.equal(request().baseSha256, legacyGilArchive.sha256);\n  assert.equal(request().custody, 'gil-build-v1');\n  assert.equal(request().id, request().id);\n  const defaultRequest = releaseBuildRequest(undefined, sourceSha, hotfix, checks, policy.checkedFiles);\n  assert.equal(defaultRequest.configuration.workKey, 'offline-candidate');\n  assert.equal(defaultRequest.id, request('').id);\n  assert.equal(defaultRequest.id, request('offline-candidate').id);\n  assert.notEqual(defaultRequest.id, request().id);\n  for (const key of ['alpha-test', 'offline-performance', 'bad label', 99]) {\n    assert.throws(() => request(key), /GIL_PRODUCTION_WORK_KEY/);\n  }\n  assert.throws(() => request(workKey, {...checks, licenses:0}), /exact Full/);\n  assert.notEqual(request().id, request(workKey, {...checks, qualityAttempt:2}).id);\n  assert.notEqual(request().id, request(workKey, {...checks, licenses:10}).id);\n  assert.notEqual(request().id, request(workKey, checks, ['3'.repeat(64)]).id);\n});\n"
  }
 ]
};

// The current legacy browser fixture exercises warm detail reuse and genuine
// generation retirement. Historical replays still read the exact former case.
const permanentDeckRuntimeFixture=Object.freeze({
 "previous": {
  "sha256": "327cea26d0022ebddbc04f833568b9ada9e608ea9872b526b4af91de84c1057e",
  "gitBlob": "58f48f1073c6d39710aee68e9a055dbddaf7a0f8"
 },
 "current": {
  "sha256": "608f5e266b4b1ab48b762f74088d1e018b7ee8aa0864546a75745356e3a082c7",
  "gitBlob": "12d5666dc00a9a432141e3bc4ad6d8ccc54e23fb"
 },
 "hunks": [
  {
   "at": 1312,
   "before": "`;\n\ntest('official permanent browser handles 0/1/5/6/17 cards, deferred index origins, detail return and recycled late callbacks',t=>{\n runOfficial(t,officialDeckBrowserSetup+`\nfor _,origin in ipairs({0,1})do",
   "after": "`;\n\ntest('official permanent browser handles 0/1/5/6/17 cards, deferred index origins, warm detail return and retired callbacks',t=>{\n runOfficial(t,officialDeckBrowserSetup+`\nfor _,origin in ipairs({0,1})do"
  },
  {
   "at": 1329,
   "before": " if amount==0 then assert(not deck.pending and not deck.calibrating and not deck.pendingGrid,'empty browser retained readiness work')end\n grid:flush();deck:update();grid:flush()\n if amount>0 then warmed=true end\n assert(grid.itemCount==amount and grid.scrollProgress==0)",
   "after": " if amount==0 then assert(not deck.pending and not deck.calibrating and not deck.pendingGrid,'empty browser retained readiness work')end\n grid:flush();deck:update();grid:flush()\n if amount==17 then\n  -- The legacy fixture flushes at most 12 cells; this viewport also\n  -- intersects a third row and still needs indices 12 through 14.\n  assert(deck.pendingGrid,'partial third row was accepted as ready')\n  for i=12,14 do grid:recycle(i,origin+i)end\n end\n assert(not deck.pendingGrid,'complete visible grid remained pending')\n if amount>0 then warmed=true end\n assert(grid.itemCount==amount and grid.scrollProgress==0)"
  },
  {
   "at": 1345,
   "before": "  assert(uid==201 and not first:GetChild('uid').visible)\n  calibration(first,origin);assert(not deck.pending and deck.bindings[first].uid==uid)\n  local late=grid.refreshCallback;local hit=first:GetChild('hit')\n  grid.scrollProgress=.45\n  assert(hit.listeners.drag==nil and hit.listeners.endDrag==nil)",
   "after": "  assert(uid==201 and not first:GetChild('uid').visible)\n  calibration(first,origin);assert(not deck.pending and deck.bindings[first].uid==uid)\n  local current=grid.refreshCallback;local hit=first:GetChild('hit')\n  grid.scrollProgress=.45\n  assert(hit.listeners.drag==nil and hit.listeners.endDrag==nil)"
  },
  {
   "at": 1353,
   "before": "  assert(panel:GetChild('cardFocus').visible and panel:GetChild('pileReturn').visible)\n  assert(not hit.click(),'hidden list receiver replaced the active detail')\n  assert(panel:GetChild('pileReturn'):GetChild('hit').click());deck:update();grid:flush()\n  assert(not deck.cardDetail and grid.visible and grid.scrollProgress==.45)\n  local fresh=grid.items[0];local freshUid=deck.bindings[fresh].uid\n  late(fresh,origin+amount-1)\n  assert(deck.bindings[fresh].uid==freshUid,'late list callback rebound the returned detail list')\n  assert(first.alive==false and not deck.bindings[first] and not hit.click(),'retired detail receiver remained live')\n  if amount==17 then\n   grid.deferRefresh,grid.destroyOnRefresh=false,false\n   local reused=grid:recycle(0,origin+16)",
   "after": "  assert(panel:GetChild('cardFocus').visible and panel:GetChild('pileReturn').visible)\n  assert(not hit.click(),'hidden list receiver replaced the active detail')\n  current(first,origin+amount);assert(first.visible and deck.bindings[first].uid==uid,\n   'hidden list refresh mutated the active card')\n  assert(panel:GetChild('pileReturn'):GetChild('hit').click());deck:update()\n  assert(not deck.cardDetail and grid.visible and grid.scrollProgress==.45)\n  assert(grid.refreshCallback==current and grid.items[0]==first and first.alive~=false and deck.bindings[first].uid==uid,\n   'warm detail return replaced the live list receiver')\n  assert(hit.click() and deck.cardDetail.instance.uid==uid,'warm receiver did not reopen the same card')\n  assert(panel:GetChild('pileReturn'):GetChild('hit').click());deck:update()\n  if amount==17 then\n   assert(deck:setSort('original'));grid:flush()\n   for i=12,14 do grid:recycle(i,origin+i)end\n   assert(not deck.pendingGrid)\n   local fresh=grid.items[0]\n   assert(grid.refreshCallback~=current and fresh~=first and deck.bindings[fresh].uid==uid,\n    'new list generation did not install its own receiver')\n   current(fresh,origin+16)\n   assert(deck.bindings[fresh].uid==uid,'obsolete refresh rebound a current cell')\n   assert(first.alive==false and not deck.bindings[first] and not hit.click(),'retired refresh receiver remained live')\n   grid.deferRefresh,grid.destroyOnRefresh=false,false\n   local reused=grid:recycle(0,origin+16)"
  },
  {
   "at": 1382,
   "before": "  end\n end\n local late=grid.refreshCallback;local old=grid.items[0]\n assert(panel:GetChild('pileReturn'):GetChild('hit').click())\n if old then late(old,origin)end\n assert(not deck.visible and not grid.visible and grid.itemCount==0 and not panel:GetChild('pileChrome').visible)\n unchanged(host.run,before,'permanent browsing changed Run or RNG')",
   "after": "  end\n end\n local late=grid.refreshCallback;local old=grid.items[0];local oldHit=old and old:GetChild('hit')\n assert(panel:GetChild('pileReturn'):GetChild('hit').click())\n if old then late(old,origin);assert(not oldHit.click() and not deck.cardDetail,'closed list accepted a stale click')end\n assert(not deck.visible and not grid.visible and grid.itemCount==0 and not panel:GetChild('pileChrome').visible)\n unchanged(host.run,before,'permanent browsing changed Run or RNG')"
  }
 ]
});

export function beforeReleaseClosureFixture(path,raw){
 raw=beforeReleaseMetadata(path,raw);
 if(!Object.hasOwn(fixtures,path))return beforeReleaseDeckPointer(path,raw);
 let source=Buffer.isBuffer(raw)?raw.toString('utf8'):raw;
 if(typeof source!=='string'||Buffer.isBuffer(raw)&&!Buffer.from(source).equals(raw))return raw;
 const normalized=source.replaceAll('\r\n','\n');
 if(normalized.includes('\r')||source!==normalized&&source!==normalized.replaceAll('\n','\r\n'))return raw;
 if(path==='tests/official-assets-runtime.test.mjs'&&exactSourceMatches(source,permanentDeckRuntimeFixture.current)){
  const {current,previous,hunks}=permanentDeckRuntimeFixture;
  const predecessor=restoreExactFixtureHunks({path,beforeSha256:previous.sha256,afterSha256:current.sha256,hunks},path,source);
  assert(exactSourceMatches(predecessor,previous),'exact prior permanent browser runtime fixture');
  source=source===normalized?predecessor:predecessor.replaceAll('\n','\r\n');
  // The immediately preceding fixture may itself have no older authorized
  // projection in this adapter, but its authenticated bytes still carry forward.
  raw=Buffer.isBuffer(raw)?Buffer.from(source):source;
 }
 if(path==='tests/official-assets-runtime.test.mjs'){
  source=beforeReleaseDeckPointer(path,source);
  raw=Buffer.isBuffer(raw)?Buffer.from(source):source;
 }
 if(path==='tests/gil-candidate.test.mjs'&&exactSourceMatches(source,unifiedGilFixture.current)){
  const {current,previous,hunks}=unifiedGilFixture;
  const predecessor=restoreExactFixtureHunks({path,beforeSha256:previous.sha256,afterSha256:current.sha256,hunks},path,source);
  assert(exactSourceMatches(predecessor,previous),'exact pre-unification GIL test fixture');
  source=source.includes('\r\n')?predecessor.replaceAll('\n','\r\n'):predecessor;
 }
 const {current,previous,hunks}=fixtures[path];
 if(!exactSourceMatches(source,current))return raw;
 const prior=restoreExactFixtureHunks({path,beforeSha256:previous.sha256,afterSha256:current.sha256,hunks},path,source);
 assert(exactSourceMatches(prior,previous),'exact release test fixture predecessor: '+path);
 const restored=source.includes('\r\n')?prior.replaceAll('\n','\r\n'):prior;
 return Buffer.isBuffer(raw)?Buffer.from(restored):restored;
}
