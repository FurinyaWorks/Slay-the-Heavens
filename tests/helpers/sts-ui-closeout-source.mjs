import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';

const hash=value=>createHash('sha256').update(value).digest('hex');
const archive=readFileSync(new URL('../fixtures/sts-ui-closeout-source.json',import.meta.url));
assert.equal(hash(archive),'c3415006f33840d3154a460684867f75810cb00eabcd0afa12f73fd423aca6d5','exact STS UI predecessor archive');
const {files}=JSON.parse(archive);
for(const record of Object.values(files))assert.equal(hash(record.before),record.sha256);

export function beforeStsUiCloseoutSource(path,source){
 const record=Object.hasOwn(files,path)&&files[path];
 if(!record||typeof source!=='string'||source.includes('\r\r\n')||hash(source.replaceAll('\r\n','\n'))!==record.after)return source;
 return source.includes('\r\n')?record.before.replaceAll('\n','\r\n'):record.before;
}
