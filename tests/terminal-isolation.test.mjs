import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {terminalParts,checkTerminalOutput,runTerminalParts} from './helpers/terminal-isolation.mjs';
const source=readFileSync('tests/lua/target_anonymous_terminal.lua','utf8');
const output=Array.from({length:7},(_,i)=>`TERMINAL_GROUP ${i+1}\nTARGET_ANONYMOUS_TERMINAL_PASS 1\n`).join('');
test('terminal partition preserves each original body and rejects source drift',()=>{
 const parts=terminalParts(source);assert.equal(parts.length,7);
 const original=source.replaceAll('\r\n','\n').split('\n');
 for(const part of parts)for(const line of original)if(!line.startsWith('local function test('))assert(part.includes(line));
 for(const bad of [source+'\n',source.replace('battle.energy==3','battle.energy==2')])assert.throws(()=>terminalParts(bad),/unreviewed/);
 assert.deepEqual(terminalParts(source.replaceAll('\n','\r\n')),parts);
});
test('terminal aggregate receipts reject missing duplicate and out-of-order groups',()=>{
 checkTerminalOutput(output);
 for(const bad of [output.replace('TERMINAL_GROUP 4\n',''),output+'TERMINAL_GROUP 7\n',output.replace('TERMINAL_GROUP 1','TERMINAL_GROUP 2'),output.replace('TARGET_ANONYMOUS_TERMINAL_PASS 1\n','')])assert.throws(()=>checkTerminalOutput(bad));
});
test('terminal aggregate propagates Lua assertion failure',async()=>{
 const r=await runTerminalParts(Array(7).fill("error('intentional terminal negative')"),{deadline:Date.now()+5000,maxBuffer:65536});assert.notEqual(r.status,0);assert.match(r.stderr,/intentional terminal negative/);
});
test('terminal aggregate enforces total deadline and does not renew per worker',async()=>{
 const r=await runTerminalParts(Array(7).fill('while true do end'),{deadline:Date.now()+300,maxBuffer:1024});assert.notEqual(r.status,0);assert.match(r.stderr,/deadline/);
 const across=await runTerminalParts(["local t=os.clock();while os.clock()-t<1.8 do end;print('FIRST_DONE')","local t=os.clock();while os.clock()-t<1.8 do end",...Array(5).fill('print(1)')],{deadline:Date.now()+3000,maxBuffer:1024});
 assert.match(across.stdout,/FIRST_DONE/);assert.notEqual(across.status,0);assert.match(across.stderr,/deadline/);
 const expired=await runTerminalParts(Array(7).fill('print(1)'),{deadline:Date.now()-1,maxBuffer:1024});assert.equal(expired.stdout,'');assert.notEqual(expired.status,0);
});
test('terminal aggregate rejects output overflow and invalid partitions',async()=>{
 const r=await runTerminalParts(Array(7).fill("print(string.rep('x',4096))"),{deadline:Date.now()+5000,maxBuffer:32});assert.notEqual(r.status,0);assert.match(r.stderr,/output budget/);
 await assert.rejects(runTerminalParts(['print(1)'],{deadline:Date.now()+5000,maxBuffer:1024}),/seven/);
});
