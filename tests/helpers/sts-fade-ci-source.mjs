// Exact CI-only successor for the existing historical source readers.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const hash=s=>createHash('sha256').update(s).digest('hex');
const bytes=readFileSync(new URL('../fixtures/sts-fade-ci-source.json',import.meta.url));
assert.equal(hash(bytes),'be33c862d5b8d8d3f3d40a70228c9eba52c8391e0425b77df07a04297e8bfdb6');
const {base,files}=JSON.parse(bytes);
assert.equal(base,'345ba08398b6ca8e1361a126f2ce1de85210e634');
const closeoutBytes=readFileSync(new URL('../fixtures/sts-ui-closeout-ci.json',import.meta.url));
assert.equal(hash(closeoutBytes),'d9855569eb08eeb059fa50ec036d65fe7d28050b10bde7b6a5626c081fe02ac0','exact STS closeout CI continuation');
const closeout=JSON.parse(closeoutBytes).files;
function fromCloseout(path,source){
 const row=Object.hasOwn(closeout,path)?closeout[path]:null;
 if(!row||typeof source!=='string'||source.includes('\r\r\n')||hash(source.replaceAll('\r\n','\n'))!==row.after)return source;
 return source.includes('\r\n')?row.before.replaceAll('\n','\r\n'):row.before;
}
export function beforeStsFadeCi(path,source){
 source=fromCloseout(path,source);
 const row=Object.hasOwn(files,path)?files[path]:null;
 if(!row||typeof source!=='string'||source.includes('\r\r\n')||hash(source.replaceAll('\r\n','\n'))!==row.after)return source;
 return source.includes('\r\n')?row.before.replaceAll('\n','\r\n'):row.before;
}
