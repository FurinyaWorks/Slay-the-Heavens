import {beforeReleaseUiCloseoutSource} from './release-ui-closeout-source.mjs';
// Exact full-source continuation. Unknown or modified bytes never project.
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import assert from 'node:assert/strict';
const hash=s=>createHash('sha256').update(s).digest('hex');
const bytes=readFileSync(new URL('./sts1-menu-prior.test.mjs.gz',import.meta.url));
assert.equal(hash(bytes),'b10cce10b072edcd45acc8204944ece9b604343699658543229999991ec94431');
const files=JSON.parse(gunzipSync(bytes));
for(const row of Object.values(files))assert.equal(hash(row.before),row.beforeSha256);
export function beforeSts1MenuCiSource(path,source){
 source=beforeReleaseUiCloseoutSource(path,source);
 const row=Object.hasOwn(files,path)?files[path]:null;
 if(!row||typeof source!=='string'||source.includes('\r\r\n')||hash(source.replaceAll('\r\n','\n'))!==row.afterSha256)return source;
 return source.includes('\r\n')?row.before.replaceAll('\n','\r\n'):row.before;
}
