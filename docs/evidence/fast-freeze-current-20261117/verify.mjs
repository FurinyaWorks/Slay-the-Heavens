import assert from 'node:assert/strict';import{readFileSync}from'node:fs';import{execFileSync}from'node:child_process';import{createHash}from'node:crypto';
import{assertReleaseSelectionMapCiCurrent as verify}from'../../../tests/helpers/release-selection-map-ci-source.mjs';
const h=b=>createHash('sha256').update(b).digest('hex'),packet=JSON.parse(readFileSync('tests/helpers/release-fast-freeze-eol-continuation.json'));
const path='tests/helpers/release-ci.cases.mjs',row=packet.files[path];let n=0;const check=(name,fn)=>{fn();console.log('PASS '+(++n)+' '+name);};
check('exact before Git source',()=>assert.equal(row.before.source,execFileSync('git',['show',packet.priorParents[0]+':'+path],{encoding:'utf8'})));
check('exact current Git source',()=>assert.equal(row.current.source,execFileSync('git',['show',packet.parents[0]+':'+path],{encoding:'utf8'})));
check('current identity',()=>verify());
for(const mode of ['before','changed','missing','empty','null','malformed'])check(mode+' current consumer rejected',()=>assert.throws(()=>verify((p,e)=>{
 if(p!==path)return readFileSync(p,e);if(mode==='missing')throw Error('missing');if(mode==='null')return null;
 const s=mode==='before'?row.before.source:mode==='empty'?'':mode==='malformed'?row.current.source.replaceAll('\n','\r\r\n'):row.current.source+'\n';return e?s:Buffer.from(s);
})));
check('CRLF accepted',()=>verify((p,e)=>p===path?(e?row.current.source.replaceAll('\n','\r\n'):Buffer.from(row.current.source.replaceAll('\n','\r\n'))):readFileSync(p,e)));
check('changed continuation archive rejected',()=>assert.throws(()=>verify((p,e)=>p==='tests/helpers/release-fast-freeze-eol-continuation.json'?Buffer.from('foreign'):readFileSync(p,e))));
check('restored current',()=>verify());console.log('TOTAL '+n+' passed');
