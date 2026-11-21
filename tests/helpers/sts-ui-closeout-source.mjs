import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';

const hash=value=>createHash('sha256').update(value).digest('hex');
const archive=readFileSync(new URL('../fixtures/sts-ui-closeout-source.json',import.meta.url));
assert.equal(hash(archive),'1dc65f74fed1074e130b88549001f70aeefcc329613266d9b4938225e7b84f5a','exact STS UI predecessor archive');
const {files}=JSON.parse(archive);
for(const record of Object.values(files))assert.equal(hash(record.before),record.sha256);

export function beforeStsUiCloseoutSource(path,source){
 const record=Object.hasOwn(files,path)&&files[path];
 if(!record||typeof source!=='string'||source.includes('\r\r\n')||hash(source.replaceAll('\r\n','\n'))!==record.after)return source;
 return source.includes('\r\n')?record.before.replaceAll('\n','\r\n'):record.before;
}
