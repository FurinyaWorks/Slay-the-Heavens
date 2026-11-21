import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';

const hash=source=>createHash('sha256').update(source).digest('hex');
const bytes=readFileSync(new URL('./card-feedback-owner-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'0710facff10a22ddca512869df2b0f526189deb5ca3394369e45fba20bd0d4ec','exact card feedback owner predecessors');
const {before,after,files}=JSON.parse(gunzipSync(bytes));
assert.equal(before,'ff8b9baf67a965c45820914b3bbed273ffb3293c');
assert.equal(after,'0c6f5a036366230ccf7f777c471b923f9e4c03b5');
for(const row of Object.values(files))assert.equal(hash(row.before),row.beforeSha);
export function beforeCardFeedbackOwner(path,source){
 const row=Object.hasOwn(files,path)?files[path]:null;
 if(!row||typeof source!=='string'||source.includes('\r\r\n')||hash(source.replaceAll('\r\n','\n'))!==row.afterSha)return source;
 return source.includes('\r\n')?row.before.replaceAll('\n','\r\n'):row.before;
}
