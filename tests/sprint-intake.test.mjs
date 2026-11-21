import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {evaluateIntake,loadTask} from '../scripts/check-task-intake.mjs';

const policy={schemaVersion:1,blockedUntilOwnerApproval:['TASK-85','TASK-96','TASK-97','TASK-62','TASK-64']};
const check=(id,milestone,status='To Do',extra={})=>evaluateIntake({id,task:{id,milestone,status},policy,...extra});

test('an unclaimed engineering task needs no Sprint or current date',()=>assert.equal(check('TASK-74','m-7').decision,'ALLOW'));
test('milestone membership does not gate an otherwise eligible task',()=>{
  for(const milestone of ['m-7','m-8','m-9','m-5',null]) assert.equal(check('TASK-25',milestone).decision,'ALLOW',String(milestone));
});
test('past, future and absent calendar inputs cannot close task intake',()=>{
  for(const today of ['2026-11-02','2026-11-03','2026-11-10','2027-01-01',undefined]) {
    assert.equal(check('TASK-25','m-8','To Do',{today}).decision,'ALLOW',String(today));
  }
});
test('obsolete Sprint lanes and dates cannot restore an intake gate',()=>{
  const legacy={...policy,sprint:{id:'old',start:'2026-11-03',end:'2026-11-09',primaryMilestone:'m-7'},
    milestoneOrder:['m-7','m-8','m-9'],parallelTaskIds:[],historicalM8TaskIds:['TASK-4.9']};
  for(const [id,milestone] of [['TASK-25','m-8'],['TASK-99','m-9'],['TASK-4.9','m-5']]) {
    assert.equal(check(id,milestone,'To Do',{policy:legacy,today:'2026-11-10'}).decision,'ALLOW');
  }
});
test('explicit Owner approvals survive removal of Sprint gates',()=>{
  for(const id of ['TASK-85','TASK-96','TASK-97','TASK-62','TASK-64']) {
    const result=check(id,'m-8');
    assert.equal(result.decision,'HOLD',id);
    assert.ok(result.reasons.includes('explicit Owner approval required'),id);
  }
});
test('verification-only and fully checked tasks cannot be picked as new implementation',t=>{
  const root=fixture(t);
  for(const metadata of ['labels: [待验]\n','labels:\n  - 待验\n',
    'labels: ["delivery-verify"]\n','']) {
    const ac=metadata?'<!-- AC:BEGIN -->\n- [ ] #1 device check\n<!-- AC:END -->':
      '<!-- AC:BEGIN -->\n- [x] #1 delivered\n<!-- AC:END -->';
    writeRawTask(root,`---\nid: TASK-25\nstatus: To Do\n${metadata}---\n${ac}\n`);
    const result=evaluateIntake({id:'TASK-25',task:loadTask('TASK-25',root),policy});
    assert.equal(result.decision,'HOLD',metadata||'all AC checked');
    assert.match(result.reasons.join(' '),/verif|reconcil/i);
  }
});
test('active, blocked and completed work cannot be claimed again in any milestone',()=>{
  for(const milestone of ['m-7','m-8','m-9','m-5']) for(const status of ['In Progress','Blocked','Done',undefined,'']) {
    const result=evaluateIntake({id:'TASK-4.18',task:{id:'TASK-4.18',milestone,status},policy});
    assert.equal(result.decision,'HOLD',`${milestone}: ${status}`);
    assert.ok(result.reasons.some(reason=>reason.includes('instead of duplicating')));
  }
});
test('unknown tasks, mismatched records and invalid identities remain blocked',()=>{
  for(const candidate of [
    {id:'TASK-74',task:null},
    {id:'TASK-74',task:{id:'TASK-75',status:'To Do'}},
    ...['TASK-xyz','74','',undefined].map(id=>({id,task:{id,status:'To Do'}})),
  ]) assert.equal(evaluateIntake({...candidate,policy}).decision,'HOLD');
});
test('missing or malformed approval policy fails closed without throwing',()=>{
  for(const candidate of [null,{},[],{schemaVersion:1},{...policy,schemaVersion:2},
    {...policy,blockedUntilOwnerApproval:null},{...policy,blockedUntilOwnerApproval:'TASK-85'},
    {...policy,blockedUntilOwnerApproval:['not-a-task']},{...policy,blockedUntilOwnerApproval:[null]}]) {
    const result=check('TASK-85','m-8','To Do',{policy:candidate});
    assert.equal(result.decision,'HOLD');
    assert.ok(result.reasons.includes('task intake policy invalid'));
  }
});

function fixture(t) {
  const root=mkdtempSync(join(tmpdir(),'task-intake-'));
  t.after(()=>rmSync(root,{recursive:true,force:true}));
  for(const directory of ['config','backlog/tasks']) mkdirSync(join(root,directory),{recursive:true});
  writeFileSync(join(root,'config/task-intake.json'),JSON.stringify(policy));
  return root;
}
function writeTask(root,id,status='To Do',suffix='fixture') {
  writeFileSync(join(root,`backlog/tasks/${id.toLowerCase()} - ${suffix}.md`),`---\nid: ${id}\nstatus: ${status}\nmilestone: m-8\n---\n`);
}
function writeRawTask(root,source) {
  writeFileSync(join(root,'backlog/tasks/task-25 - fixture.md'),source);
}
test('task loading requires a complete frontmatter block at the start',t=>{
  const root=fixture(t);
  for(const source of [
    'id: TASK-25\nstatus: To Do\n',
    '---\nid: TASK-25\nstatus: To Do\n',
    '---\n---\nid: TASK-25\nstatus: To Do\n---\n',
    '# Notes\n---\nid: TASK-25\nstatus: To Do\n---\n',
    '---\ntitle: No identity\n---\nid: TASK-25\nstatus: To Do\n',
  ]) {
    writeRawTask(root,source);
    assert.equal(loadTask('TASK-25',root),null,source);
  }
});
test('duplicate intake fields cannot conceal active work or a different identity',t=>{
  const root=fixture(t);
  for(const duplicate of ['id: TASK-96','id: TASK-25',"'id': TASK-96",'"id": TASK-96',
    'status: In Progress','status: To Do',"'status': Done",'"status": Blocked','milestone: m-9','status : In Progress','id \t: TASK-96',
    '? status\n: In Progress','"\\x73tatus": In Progress','<<: {status: In Progress}']) {
    writeRawTask(root,`---\nid: TASK-25\nstatus: To Do\nmilestone: m-8\n${duplicate}\n---\n`);
    const task=loadTask('TASK-25',root);
    assert.equal(task,null,duplicate);
    assert.equal(evaluateIntake({id:'TASK-25',task,policy}).decision,'HOLD',duplicate);
  }
});
test('empty, multiline and mismatched quoted identity/status are not scalar claims',t=>{
  const root=fixture(t);
  for(const fields of [
    "id: 'TASK-25\"\nstatus: To Do", "id: TASK-25\nstatus: 'To Do\"",
    "id: TASK-25'\nstatus: To Do", 'id: TASK-25\nstatus: To Do"',
    'id:\nTASK-25\nstatus: To Do', 'id: TASK-25\nstatus:\nTo Do',
    'id: TASK-25\nstatus: To Do\n  In Progress',
    'id: TASK-25\nstatus: To Do\n\n # comment\n  In Progress',
    'id: TASK-25\n  extra identity\nstatus: To Do',
    'id: TASK-25\nstatus:', 'id:\nstatus: To Do',
  ]) {
    writeRawTask(root,`---\n${fields}\n---\n`);
    assert.equal(loadTask('TASK-25',root),null,fields);
  }
  writeRawTask(root,'---\nid: TASK-25\nstatus: To Do\n # comment\n\nlabels:\n  - example\n---\n');
  assert.deepEqual(loadTask('TASK-25',root),{id:'TASK-25',status:'To Do',milestone:null});
});
test('native scalar forms, BOM/CRLF and body examples retain their meaning',t=>{
  const root=fixture(t);
  for(const quote of ['',"'",'"']) for(const eol of ['\n','\r\n']) {
    writeRawTask(root,'\uFEFF'+`---\nid: ${quote}TASK-25${quote}\nstatus: ${quote}To Do${quote}\nmilestone: ${quote}m-8${quote}\n---\n# Example\n---\nid: TASK-96\nstatus: In Progress\n---\n`.replaceAll('\n',eol));
    assert.deepEqual(loadTask('TASK-25',root),{id:'TASK-25',status:'To Do',milestone:'m-8'});
  }
});
test('CLI holds ambiguous metadata without changing the task or policy',t=>{
  const root=fixture(t),script=fileURLToPath(new URL('../scripts/check-task-intake.mjs',import.meta.url));
  const source='---\nid: TASK-25\nstatus: To Do\nstatus: In Progress\n---\n';
  writeRawTask(root,source);
  const policyPath=join(root,'config/task-intake.json'),beforePolicy=readFileSync(policyPath,'utf8');
  const result=spawnSync(process.execPath,[script,'TASK-25'],{cwd:root,encoding:'utf8'});
  assert.ifError(result.error);
  assert.equal(result.status,1,result.stdout+result.stderr);
  assert.match(result.stdout,/^HOLD TASK-25\n/);
  assert.match(result.stderr,/task not found or identity mismatch/);
  assert.equal(readFileSync(join(root,'backlog/tasks/task-25 - fixture.md'),'utf8'),source);
  assert.equal(readFileSync(policyPath,'utf8'),beforePolicy);
});
test('task loading rejects missing and duplicate task files',t=>{
  const root=fixture(t);
  assert.equal(loadTask('TASK-25',root),null);
  writeTask(root,'TASK-25');
  assert.deepEqual(loadTask('TASK-25',root),{id:'TASK-25',status:'To Do',milestone:'m-8'});
  writeTask(root,'TASK-25','To Do','duplicate');
  assert.equal(loadTask('TASK-25',root),null);
});
test('CLI reads the non-calendar policy and remains read-only for ALLOW and HOLD',t=>{
  const root=fixture(t);
  writeTask(root,'TASK-25');
  writeTask(root,'TASK-85');
  writeTask(root,'TASK-4.18','In Progress');
  const script=fileURLToPath(new URL('../scripts/check-task-intake.mjs',import.meta.url));
  for(const [id,status] of [['TASK-25',0],['TASK-85',1],['TASK-4.18',1]]) {
    const path=join(root,`backlog/tasks/${id.toLowerCase()} - fixture.md`), before=readFileSync(path,'utf8');
    const result=spawnSync(process.execPath,[script,id],{cwd:root,encoding:'utf8'});
    assert.ifError(result.error);
    assert.equal(result.status,status,result.stdout+result.stderr);
    assert.match(result.stdout,new RegExp(`^${status?'HOLD':'ALLOW'} ${id.replaceAll('.','\\.')}\\n`));
    if(!status) assert.match(result.stdout,/does not claim the task/);
    assert.equal(readFileSync(path,'utf8'),before);
  }
});
test('closed research prerequisites never replace the separate rollout approval',()=>{
  const task={id:'TASK-97',status:'To Do',dependencies:['TASK-96','TASK-105']};
  const completed=['TASK-96','TASK-105'].map(id=>({id,status:'Done',acCount:1,acCompleted:1}));
  const result=evaluateIntake({id:task.id,task,policy,tasks:[task],completed});
  assert.equal(result.decision,'HOLD');
  assert.deepEqual(result.reasons,['explicit Owner approval required']);
});

test('CLI holds a real unfinished dependency chain without changing known To Do or Blocked records',t=>{
  const root=fixture(t),script=fileURLToPath(new URL('../scripts/check-task-intake.mjs',import.meta.url));
  writeRawTask(root,'---\nid: TASK-25\nstatus: To Do\ndependencies: [TASK-26]\n---\n');
  writeTask(root,'TASK-26','Done');
  const intermediate=join(root,'backlog/tasks/task-26 - fixture.md');
  writeFileSync(intermediate,'---\nid: TASK-26\nstatus: Done\ndependencies:\n  - TASK-27\n---\n');
  for(const status of ['To Do','Blocked']) {
    writeTask(root,'TASK-27',status);
    const path=join(root,'backlog/tasks/task-27 - fixture.md'),before=readFileSync(path,'utf8');
    const result=spawnSync(process.execPath,[script,'TASK-25'],{cwd:root,encoding:'utf8'});
    assert.ifError(result.error);
    assert.equal(result.status,1,result.stdout+result.stderr);
    assert.match(result.stdout,/^HOLD TASK-25\n/);
    assert.match(result.stderr,/TASK-25 -> TASK-26 -> TASK-27/);
    assert.ok(result.stderr.includes(status),result.stderr);
    assert.equal(readFileSync(path,'utf8'),before);
  }
});

test('CLI dependency readiness handles native lists, completed records, AC and structural errors',t=>{
  const script=fileURLToPath(new URL('../scripts/check-task-intake.mjs',import.meta.url));
  const cases=[
    {name:'satisfied',field:'dependencies: [task-00026]',depStatus:'Done',expected:0},
    {name:'completed satisfies',field:'dependencies:\n  - TASK-26',location:'completed',depStatus:'Done',expected:0},
    {name:'completed pending',field:'dependencies: [TASK-26]',location:'completed',depStatus:'To Do',reason:/not Done/},
    {name:'unchecked Done AC',field:'dependencies: [TASK-26]',depStatus:'Done',ac:'- [ ] #1 pending',reason:/unchecked AC/},
    {name:'checked Done AC',field:'dependencies: [TASK-26]',depStatus:'Done',ac:'- [x] #1 delivered',expected:0},
    {name:'missing',field:'dependencies: [TASK-26]',reason:/TASK-25 -> TASK-26.*missing/},
    {name:'archive not authoritative',field:'dependencies: [TASK-26]',location:'archive/tasks',depStatus:'Done',reason:/missing/},
    {name:'cross-directory duplicate',field:'dependencies: [TASK-26]',depStatus:'Done',duplicate:true,reason:/ambiguous/},
    {name:'malformed duplicate cannot hide its header identity',field:'dependencies: [TASK-26]',depStatus:'Done',
      duplicate:true,duplicateName:'task-99',duplicateStatus:'Done\nstatus: To Do',reason:/ambiguous/},
    {name:'self-cycle',field:'dependencies: [task-025]',reason:/TASK-25 -> TASK-25.*cycle/},
    {name:'transitive cycle',field:'dependencies: [TASK-26]',depStatus:'Done',depField:'dependencies: [TASK-25]',reason:/TASK-25 -> TASK-26 -> TASK-25.*cycle/},
    {name:'scalar dependency',field:'dependencies: TASK-26',reason:/malformed dependencies/},
    {name:'bad transitive field',field:'dependencies: [TASK-26]',depStatus:'Done',depField:'dependencies: null',reason:/TASK-25 -> TASK-26.*malformed dependencies/},
    {name:'untrusted dependency status',field:'dependencies: [TASK-26]',depStatus:'Done\n  Blocked',reason:/metadata/},
  ];
  for(const example of cases) {
    const root=fixture(t),snapshots=[];
    const save=(path,source)=>{writeFileSync(path,source);snapshots.push([path,source]);};
    save(join(root,'backlog/tasks/task-25 - fixture.md'),`---\nid: TASK-25\nstatus: To Do\n${example.field}\n---\n`);
    if(example.depStatus) {
      const dir=join(root,'backlog',example.location??'tasks');
      mkdirSync(dir,{recursive:true});
      save(join(dir,'task-26 - fixture.md'),`---\nid: TASK-26\nstatus: ${example.depStatus}\n${example.depField??''}\n---\n${example.ac?'<!-- AC:BEGIN -->\n'+example.ac+'\n<!-- AC:END -->':''}`);
    }
    if(example.duplicate) {
      const dir=join(root,'backlog/completed');mkdirSync(dir,{recursive:true});
      save(join(dir,`${example.duplicateName??'task-0026'} - duplicate.md`),`---\nid: task-0026\nstatus: ${example.duplicateStatus??'Done'}\n---\n`);
    }
    const result=spawnSync(process.execPath,[script,'TASK-25'],{cwd:root,encoding:'utf8'});
    assert.ifError(result.error);
    assert.equal(result.status,example.expected??1,example.name+'\n'+result.stdout+result.stderr);
    if(example.reason)assert.match(result.stderr,example.reason,example.name);
    for(const [path,source] of snapshots)assert.equal(readFileSync(path,'utf8'),source,example.name);
  }
});

test('normalized target identity cannot bypass approval or duplicate and location checks',t=>{
  const root=fixture(t),script=fileURLToPath(new URL('../scripts/check-task-intake.mjs',import.meta.url));
  writeTask(root,'TASK-25');writeTask(root,'TASK-85');
  for(const [id,expected,reason] of [['task-00025',0],['task-00085',1,/Owner approval/]]) {
    const result=spawnSync(process.execPath,[script,id],{cwd:root,encoding:'utf8'});
    assert.equal(result.status,expected,result.stdout+result.stderr);
    if(reason)assert.match(result.stderr,reason);
  }
  mkdirSync(join(root,'backlog/completed'),{recursive:true});
  writeFileSync(join(root,'backlog/completed/task-0025 - duplicate.md'),'---\nid: task-0025\nstatus: Done\n---\n');
  assert.equal(loadTask('TASK-25',root),null);
  const result=spawnSync(process.execPath,[script,'TASK-25'],{cwd:root,encoding:'utf8'});
  assert.equal(result.status,1,result.stdout+result.stderr);
  assert.match(result.stderr,/ambiguous/);
  writeFileSync(join(root,'backlog/completed/task-30 - fixture.md'),'---\nid: TASK-30\nstatus: To Do\n---\n');
  assert.equal(loadTask('TASK-30',root),null,'completed is dependency-only, even if its status claims To Do');
});

test('short-branch start holds blocked dependencies even with a valid plan',t=>{
  const root=fixture(t);
  writeRawTask(root,'---\nid: TASK-25\nstatus: To Do\ndependencies: [TASK-26]\n---\n');
  writeTask(root,'TASK-26','Blocked');
  const script=fileURLToPath(new URL('../scripts/check-pr-slice.mjs',import.meta.url));
  const run=()=>spawnSync(process.execPath,[script,'--start','TASK-25','--slice','Update one caller','--verify','npm run test:related'],{cwd:root,encoding:'utf8'});
  const held=run();
  assert.equal(held.status,1,held.stdout+held.stderr);
  assert.match(held.stdout,/^HOLD TASK-25\n/);
  assert.match(held.stderr,/TASK-25 -> TASK-26: dependency not Done \(Blocked\)/);
  writeTask(root,'TASK-26','Done');
  const allowed=run();
  assert.equal(allowed.status,0,allowed.stdout+allowed.stderr);
  assert.match(allowed.stdout,/^ALLOW TASK-25\n/);
});
