import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { sha256 } from '../scripts/evidence-files.mjs';
import { indexPath, tablePath, renderTable } from '../scripts/render-ui-reference-table.mjs';

const guidance = fileURLToPath(new URL('../scripts/check-ui-references.mjs', import.meta.url));
const menu = 'scripts/menu-layout.mjs', map = 'scripts/map-layout.mjs';
const target = 'docs/design/targets/menu.png', old = 'docs/evidence/old-menu.png';
const candidate = 'docs/design/targets/new-menu.png';
const ref = (path, text) => ({path, sha256:sha256(text)});
const row = (codePath,state,revision,status,reference,supersedes=[]) =>
  ({codePath,targetVersion:'v2.0.0',state,revision,status,backlogTask:'TASK-103',reference,supersedes});

test('required guidance rejects UI design regressions and passes restored or unrelated sources', t => {
  const root = mkdtempSync(join(tmpdir(), 'abyss-reference-gate-'));
  t.after(() => rmSync(root, {recursive:true, force:true}));
  function put(path,text) {
    mkdirSync(dirname(join(root,path)), {recursive:true});
    writeFileSync(join(root,path), text);
  }
  function git(...args) {
    const result = spawnSync('git',args,{cwd:root,encoding:'utf8'});
    assert.equal(result.status,0,result.stderr);
    return result.stdout.trim();
  }
  const normal = row(menu,'menuPanel','current','APPROVED',ref(target,'menu pixels'),['old']);
  const inactive = row(menu,'menuPanel','old','SUPERSEDED',ref(old,'old pixels'));
  const pending = row(map,'mapPanel','develop','NEEDS_REF',null);
  const baseline = [normal,inactive,pending];
  function index(references) {
    put(indexPath,JSON.stringify({references}));
    put(tablePath,renderTable(references));
  }
  function commit() {
    git('add','-A');
    git('commit','--quiet','--allow-empty','-m','candidate');
  }
  git('init','--quiet','-b','develop');
  git('config','user.name','Fixture');
  git('config','user.email','fixture@example.org');
  put('AGENTS.md','# Guidance\n');
  put('CLAUDE.md','[Instructions](AGENTS.md)\n');
  put('.cursor/rules/miliastra.mdc','[Instructions](../../AGENTS.md)\n');
  put('package.json','{"scripts":{}}');
  put(menu,'export const layout = { size: [10,10] };\n');
  put(map,'export const layout = { size: [10,10] };\n');
  put(target,'menu pixels');
  put(old,'old pixels');
  index(baseline);
  commit();
  const base = git('rev-parse','HEAD');
  const eventPath = join(root,'.git','event.json');
  const run = (kind,event) => {
    writeFileSync(eventPath,JSON.stringify(event));
    return spawnSync(process.execPath,[guidance,'--hosted'],{cwd:root,encoding:'utf8',env:{...process.env,
      GITHUB_ACTIONS:'true',GITHUB_EVENT_NAME:kind,GITHUB_EVENT_PATH:eventPath,GITHUB_SHA:git('rev-parse','HEAD')}});
  };
  function check(name,change,failure) {
    git('reset','--hard',base);
    change();
    commit();
    const result = run('merge_group',{merge_group:{base_sha:base}});
    assert.equal(result.status,failure ? 1 : 0,result.stderr);
    if (failure) assert.match(result.stderr,failure);
    console.log((failure ? 'RED ' : 'GREEN ') + name + (failure ? ': ' + result.stderr.trim() : ''));
  }
  check('reference bytes changed',() => put(target,'drift'),/SHA-256 mismatch/);
  check('reference deleted',() => rmSync(join(root,target)),/Missing or invalid UI reference/);
  check('duplicate approvals',() => index([...baseline,{...normal,revision:'second'}]),/Multiple APPROVED/);
  check('in-place replacement',() => {
    put(candidate,'new pixels');
    index([{...normal,reference:ref(candidate,'new pixels')},inactive,pending]);
  },/removed or replaced in place/);
  check('approval dropped from index',() => index([inactive,pending]),/removed or replaced in place/);
  check('stale link in active guidance',() => put('docs/design/review.md','[menu](../evidence/old-menu.png)'),/New reference to SUPERSEDED/);
  check('renamed copy of retired target',() => {
    put(candidate,'old pixels');
    index([{...normal,reference:ref(candidate,'old pixels')},inactive,pending]);
  },/Retired UI reference reused/);
  check('map visual without a baseline',() => put(map,'export const layout = { size: [20,10] };\n'),/no effective UI reference/);
  check('restored target',() => put(target,'menu pixels'));
  check('ordinary controller fix',() => put(map,'export const layout = { size: [10,10] };\nexport const controllerFix = true;\n'));
  check('historical comparison evidence',() => put('docs/evidence/compare.md','[previous](old-menu.png)'));
  check('explicit supersession',() => {
    put(candidate,'new pixels');
    index([{...normal,status:'SUPERSEDED'},
      row(menu,'menuPanel','next','APPROVED',ref(candidate,'new pixels'),['current']),inactive,pending]);
  });
  git('reset','--hard',base);
  git('switch','-c','feature');
  put(menu,'export const layout = { size: [20,10] };\n');
  commit();
  const head = git('rev-parse','HEAD');
  git('switch','develop');
  git('merge','--no-ff','--no-edit','feature');
  const pull = body => run('pull_request',{pull_request:{base:{ref:'develop',sha:base},head:{sha:head},body}});
  const [declared, unavailable, undeclared] = [
    'UI-Design: v2.0.0 scripts/menu-layout.mjs menuPanel current',
    'UI-Design: v2.0.0 scripts/map-layout.mjs mapPanel develop', ''];
  for (const [body,pattern] of [[unavailable,/identify an effective reference/],
    [undeclared,/matching UI-Design declaration/],
    [declared + '\nUse [this](docs/evidence/old-menu.png)',/New reference to SUPERSEDED/]]) {
    const result = pull(body);
    assert.equal(result.status,1,result.stderr);
    assert.match(result.stderr,pattern);
    console.log('RED ' + result.stderr.trim());
  }
  const accepted = pull(declared);
  assert.equal(accepted.status,0,accepted.stderr);
  console.log('GREEN same PR merge bound to the approved revision');
});
