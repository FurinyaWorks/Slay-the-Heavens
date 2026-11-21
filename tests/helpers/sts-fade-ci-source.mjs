// Exact CI-only successor for the existing historical source readers.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const hash=s=>createHash('sha256').update(s).digest('hex');
const bytes=readFileSync(new URL('../fixtures/sts-fade-ci-source.json',import.meta.url));
assert.equal(hash(bytes),'e76376d352dbac965d9216f3d077f10d0ddbf1c7c5e4f0a221a50751215e3181');
const {base,files}=JSON.parse(bytes);
assert.equal(base,'345ba08398b6ca8e1361a126f2ce1de85210e634');
export function beforeStsFadeCi(path,source){
 const row=Object.hasOwn(files,path)?files[path]:null;
 if(!row||typeof source!=='string'||source.includes('\r\r\n')||hash(source.replaceAll('\r\n','\n'))!==row.after)return source;
 return source.includes('\r\n')?row.before.replaceAll('\n','\r\n'):row.before;
}
