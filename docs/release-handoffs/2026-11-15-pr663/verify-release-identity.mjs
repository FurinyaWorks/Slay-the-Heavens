import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {copyFileSync,mkdirSync,mkdtempSync,readFileSync,rmSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {tmpdir} from 'node:os';
import {resolve,join,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';

const exact = '36b9b157ee6f05b65eb9f1da7e2978647d36c210';
const input = resolve(process.argv[2]);
const root = mkdtempSync(join(tmpdir(), 'release-metadata-rehearsal-'));

const workKey = 'contest-2026';
const read = path => JSON.parse(readFileSync(join(root,path),'utf8'));
const json = (path, value) => writeFileSync(join(root,path), JSON.stringify(value,null,2)+'\n');
const git = (...argv) => execFileSync('git',['-C',root,...argv],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
try {
  const expected = {
    'package.json':'f1c69e02668db355081a7cd0b5d10ecfad65ea62489605fa148313f8faddee1e',
    'package-lock.json':'b3f3cbd334fee96bcebeb6645c909a9b64425d0d704fd179b4279b19e1cf2ed9',
    '.release-please-manifest.json':'2ae8018fa540b531f79940118826b9846a44a8e9db05eab71caa9923fdd04c56',
    'CHANGELOG.md':'d1927943b4298416d94e692f443d46781d6be08bd0599351426a2312fcb742c0',
    'data/release/publications.json':'b448ff69287035c7974e6f78db1057c83138089d33a63e251865038f2f33f1b7',
    'scripts/release-notes.mjs': 'f94f88a2255766cab680e0a1ec676798a7f11f4f310a931a9c725dce6d050f2f',
    'scripts/evidence-files.mjs': '33840d3a67043d5e90336475c4812fa104ccad625484c43d9a55b42bacaa283c',
  };
  for (const [path,hash] of Object.entries(expected)) {
    const source=join(input,path), dest=join(root,path);
    assert.equal(createHash('sha256').update(readFileSync(source)).digest('hex'),hash,path);
    mkdirSync(dirname(dest),{recursive:true});
    copyFileSync(source,dest);
  }
  const {loadReleaseNotes} = await import(pathToFileURL(join(root,'scripts/release-notes.mjs')).href);
  const pkg=read('package.json'), lock=read('package-lock.json'), manifest=read('.release-please-manifest.json');
  assert.deepEqual([pkg.version,lock.version,lock.packages[''].version,manifest['.']],Array(4).fill('1.0.0'));
  const original = {root,workKey,releaseCandidate:true,sourceIdentity:{sourceCommit:exact,sourceDirty:false}};
  assert.equal(loadReleaseNotes(original).build.version,'v1.0.0');
  console.log('PASS exact release loader still emits v1.0.0, not v2.0.0');

  json('package.json',{...pkg,version:'2.0.0'});
  assert.throws(()=>loadReleaseNotes(original),/manifest versions must match/);
  console.log('PASS package-only bump rejected');
  json('package-lock.json',{...lock,version:'2.0.0',packages:{...lock.packages,'':{...lock.packages[''],version:'2.0.0'}}});
  json('.release-please-manifest.json',{...manifest,'.':'2.0.0'});
  assert.throws(()=>loadReleaseNotes(original),/matching CHANGELOG notes: v2.0.0/);
  console.log('PASS aligned versions still require matching notes section');
  const old=readFileSync(join(root,'CHANGELOG.md'),'utf8');
  // Synthetic parser fixture only. Never copy to the real release changelog.
  const section='## v2.0.0 (2026-11-15)\n\n### 修复\n\n* 仅供离线测试。\n\n';
  writeFileSync(join(root,'CHANGELOG.md'),old.replace('## v1.0.0',section+'## v1.0.0'));
  git('init','-q'); git('add','.');git('-c','user.name=Local Test','-c','user.email=local@example.invalid','commit','-qm','Synthetic metadata rehearsal only');
  const isolated = {root,workKey,releaseCandidate:true};
  const report=loadReleaseNotes(isolated);
  assert.equal(report.build.version,'v2.0.0');
  assert.equal(report.currentNotice.version,'v2.0.0');
  assert.equal(report.build.sourceCommit,git('rev-parse','HEAD'));
  assert.equal(report.build.sourceDirty,false);
  assert.deepEqual(report.history,[]);
  console.log('PASS clean isolated v2.0.0 loads with exact synthetic identity and no publication history');
  writeFileSync(join(root,'CHANGELOG.md'),section+old+'\n');
  assert.throws(()=>loadReleaseNotes(isolated),/clean source checkout/);
  console.log('PASS uncommitted input rejected even with matching version fields');
} finally {rmSync(root,{recursive:true,force:true});}
