import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,rmSync,lstatSync} from 'node:fs';
import {join,resolve,dirname} from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {exportPlaytest} from '../scripts/export-playtest.mjs';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
function fixture(t){
 const parent=resolve('.artifacts/test-tmp');mkdirSync(parent,{recursive:true});
 const dir=mkdtempSync(join(parent,'export-path-')),root=join(dir,'repo with spaces'),worktree=join(dir,'isolated worktree');
 mkdirSync(root);const git=args=>execFileSync('git',args,{cwd:root,stdio:'pipe'}).toString().trim();
 git(['init']);git(['-c','user.name=Fixture','-c','user.email=fixture@example.invalid','commit','--allow-empty','-m','fixture']);
 git(['worktree','add','--detach',worktree,'HEAD']);
 t.after(()=>{assert.equal(dirname(resolve(dir)),parent);rmSync(dir,{recursive:true,force:true});});
 const source=join(worktree,'候选 with spaces.gil'),receiptPath=join(worktree,'candidate.json');
 const make=value=>{const bytes=Buffer.from(value);writeFileSync(source,bytes);const receipt={mapPath:source,sha256:hash(bytes),sourceCommit:git(['rev-parse','HEAD']),sourceDirty:false,buildId:randomUUID()};writeFileSync(receiptPath,JSON.stringify(receipt));return receipt;};
 return {root,worktree,source,receiptPath,make};
}
test('worktree delivery uses one physical ASCII filename at the common root and preserves the prior candidate',t=>{
 const f=fixture(t),first=f.make('first candidate'),a=exportPlaytest(f.receiptPath,{cwd:f.worktree});
 assert.equal(a.path,join(f.root,'playtest','latest.gil'));
 assert.equal(lstatSync(a.path).isSymbolicLink(),false);assert.equal(hash(readFileSync(a.path)),first.sha256);
 const second=f.make('second candidate'),b=exportPlaytest(f.receiptPath,{cwd:f.worktree});
 assert.equal(b.path,a.path);assert.equal(hash(readFileSync(b.path)),second.sha256);
 assert.equal(hash(readFileSync(join(f.root,'playtest','archive',first.sha256+'.gil'))),first.sha256);
 assert.equal(JSON.parse(readFileSync(join(f.root,'playtest','latest.json'))).sha256,second.sha256);
});
test('stale receipt, missing file and pasted invisible characters cannot replace a working public candidate',t=>{
 const f=fixture(t);f.make('working');const published=exportPlaytest(f.receiptPath,{cwd:f.worktree}),before=readFileSync(published.path);
 writeFileSync(f.source,'changed after receipt');assert.throws(()=>exportPlaytest(f.receiptPath,{cwd:f.worktree}),/hash differs/);
 assert.throws(()=>exportPlaytest(f.receiptPath+'\u200b',{cwd:f.worktree}),/invisible/);
 rmSync(f.source);assert.throws(()=>exportPlaytest(f.receiptPath,{cwd:f.worktree}),/ENOENT/);
 assert.deepEqual(readFileSync(published.path),before);
});
