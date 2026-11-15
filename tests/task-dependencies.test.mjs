import test from 'node:test';
import assert from 'node:assert/strict';
import {auditDependencies,dependencyReadiness,normalizeTaskId,readDependencies} from '../scripts/task-dependencies.mjs';
import {readTaskHeader} from '../scripts/backlog-metadata.mjs';

const task=(id,dependencies=[],extra={})=>({id,status:'To Do',dependencies,...extra});

test('structural audit accepts pending dependency DAGs and does not mutate records',()=>{
  const tasks=[task('TASK-1',['TASK-2','TASK-3']),task('TASK-2',['TASK-4']),task('TASK-3',['TASK-4'])];
  const completed=[task('TASK-4',[],{status:'Done'})],before=JSON.stringify({tasks,completed});
  assert.deepEqual(auditDependencies(tasks,completed),[]);
  assert.equal(JSON.stringify({tasks,completed}),before);
  assert.match(dependencyReadiness('TASK-1',tasks,completed).join('\n'),/TASK-1 -> TASK-2.*To Do/);
});
test('all reachable dependencies must be Done with no unchecked AC',()=>{
  const tasks=[task('TASK-1',['TASK-2'])];
  for(const status of ['To Do','Blocked','In Progress',undefined,'Archived','done']) {
    assert.match(dependencyReadiness('TASK-1',tasks,[task('TASK-2',[],{status})]).join('\n'),/TASK-1 -> TASK-2.*not Done/);
  }
  assert.deepEqual(dependencyReadiness('TASK-1',tasks,[task('TASK-2',[],{status:'Done'})]),[]);
  assert.match(dependencyReadiness('TASK-1',tasks,[task('TASK-2',[],{status:'Done',acCount:2,acCompleted:1})]).join('\n'),/unchecked AC/);
  assert.deepEqual(dependencyReadiness('TASK-1',tasks,[task('TASK-2',[],{status:'Done',acCount:2,acCompleted:2})]),[]);
});
test('missing and ambiguous dependencies include the full blocking chain',()=>{
  const tasks=[task('TASK-1',['TASK-2']),task('TASK-2',['TASK-3'],{status:'Done'})];
  assert.match(auditDependencies(tasks).join('\n'),/TASK-1 -> TASK-2 -> TASK-3.*missing/);
  const duplicates=[task('TASK-03',[],{status:'Done'}),task('task-3',[],{status:'Done'})];
  assert.match(auditDependencies(tasks,duplicates).join('\n'),/TASK-1 -> TASK-2 -> TASK-3.*ambiguous/);
  assert.match(dependencyReadiness('TASK-1',tasks,duplicates).join('\n'),/TASK-1 -> TASK-2 -> TASK-3.*ambiguous/);
});
test('identity normalization is case insensitive and exact for arbitrarily long numeric components',()=>{
  assert.equal(normalizeTaskId('task-00087.002'),'TASK-87.2');
  assert.equal(normalizeTaskId('TASK-0009007199254740993.00'),'TASK-9007199254740993.0');
  for(const id of ['87','TASK-x','TASK-1.','TASK--1','TASK-1\n',null,87])assert.equal(normalizeTaskId(id),null);
  assert.deepEqual(auditDependencies([task('task-01',['task-0002.03'])],[task('TASK-2.3')]),[]);
  assert.match(auditDependencies([task('TASK-1')],[task('task-01')]).join('\n'),/TASK-1.*ambiguous/);
});
test('self cycles and transitive cycles across tasks and completed are structural errors',()=>{
  assert.match(auditDependencies([task('TASK-1',['task-01'])]).join('\n'),/TASK-1 -> TASK-1.*cycle/);
  const tasks=[task('TASK-1',['TASK-2'])],completed=[task('TASK-2',['TASK-3']),task('TASK-3',['TASK-2'])];
  assert.match(auditDependencies(tasks,completed).join('\n'),/TASK-1 -> TASK-2 -> TASK-3 -> TASK-2.*cycle/);
});
test('intake only inspects the target closure while the audit checks all records',()=>{
  const tasks=[task('TASK-1'),task('TASK-2',['TASK-99'])];
  assert.deepEqual(dependencyReadiness('TASK-1',tasks),[]);
  assert.match(auditDependencies(tasks).join('\n'),/TASK-2 -> TASK-99.*missing/);
  assert.match(auditDependencies([task('bad id')]).join('\n'),/invalid task identity/);
  assert.deepEqual(auditDependencies([task('Feature-ABC'),task('BUG-52.1')]),[]);
});
test('absent and empty dependency lists remain compatible; malformed in-memory fields fail closed',()=>{
  assert.deepEqual(auditDependencies([{id:'TASK-1'}]),[]);
  for(const dependencies of [null,'TASK-2',{},[null],[2],[''],['TASK-2 # comment']]) {
    const tasks=[task('TASK-1',dependencies)];
    assert.match(auditDependencies(tasks).join('\n'),/TASK-1.*malformed dependencies/);
    assert.match(dependencyReadiness('TASK-1',tasks).join('\n'),/TASK-1.*malformed dependencies/);
  }
});
test('native dependency lists support quotes, comments, CRLF and normalized subtask IDs',()=>{
  for(const field of ['dependencies: []','dependencies: [TASK-02.3, \'task-4\', "TASK-5"] # note []',
    'dependencies:\n  - TASK-02.3\n  - \'task-4\' # note\n  - "TASK-5"']) {
    const source='\uFEFF'+`---\nid: TASK-1\nstatus: To Do\n${field}\n---\n`.replaceAll('\n','\r\n');
    const result=readDependencies(source);
    assert.deepEqual(result.dependencyErrors,[],field);
    assert.deepEqual(result.dependencies,field==='dependencies: []'?[]:['TASK-02.3','task-4','TASK-5']);
    assert.deepEqual(readTaskHeader(source).dependencies,result.dependencies);
  }
});
test('unsupported or malformed YAML cannot silently become an empty dependency list',()=>{
  for(const field of ['dependencies: TASK-2','dependencies:', 'dependencies: null','dependencies: {}',
    'dependencies: [TASK-2','dependencies: [TASK-2] trailing','dependencies: [TASK-2,,TASK-3]',
    'dependencies: [TASK-2 # comment]','dependencies: [TASK-2 # comment, TASK-3]',
    'dependencies: ["TASK-2\']','dependencies: [2]','dependencies: [null]',
    'dependencies:\n  - TASK-2\n    nested: TASK-3','dependencies:\n  - TASK-2\n  -',
    'dependencies: []\n  - TASK-2','dependencies: []\ndependencies: [TASK-2]',
    "'dependencies': [TASK-2]",'"dependencies": [TASK-2]','<<: {dependencies: [TASK-2]}',
    'dependencies: &deps [TASK-2]','dependencies: *deps','dependencies: |\n  TASK-2']) {
    const source=`---\nid: TASK-1\nstatus: To Do\n${field}\n---\n`;
    assert.ok(readDependencies(source).dependencyErrors.length,field);
    assert.match(auditDependencies([readTaskHeader(source)]).join('\n'),/TASK-1.*dependencies|TASK-1.*metadata/,field);
  }
});
