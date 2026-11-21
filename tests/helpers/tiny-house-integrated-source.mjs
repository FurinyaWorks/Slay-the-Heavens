import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';

const hash=source=>createHash('sha256').update(source).digest('hex');
const normalize=source=>source.replaceAll('\r\n','\n');
// Exact mainline predecessors of the existing Tiny House CI replay.
const tinyHousePreviousBytes=readFileSync(new URL('./develop-tiny-house-predecessors.json.gz',import.meta.url));
assert.equal(hash(tinyHousePreviousBytes),'07c41cb6acb35fa7b7992f3289c88330c7f031f016f0950eaf1dbd2f4402fca6','exact Tiny House integration predecessor archive');
const tinyHousePrevious=JSON.parse(gunzipSync(tinyHousePreviousBytes));
assert.equal(tinyHousePrevious.before,'73fd14aab04c590037c39197364f725a767fed19');
assert.equal(tinyHousePrevious.after,'7e3f38fda4c17eb7b17eb9d0dc4eba8d79e9d02f');
for(const row of Object.values(tinyHousePrevious.files))assert.equal(hash(row.before),row.beforeSha);
export function beforeTinyHouseIntegratedSource(path,source){
 const row=Object.hasOwn(tinyHousePrevious.files,path)?tinyHousePrevious.files[path]:null;
 if(!row||typeof source!=='string'||source.includes('\r\r\n')||hash(normalize(source))!==row.afterSha)return source;
 return source.includes('\r\n')?row.before.replaceAll('\n','\r\n'):row.before;
}
// The live scheduler still discovers the tooltip test. Only older receipts
// remove that exact, verified addition from their historical inventory.
export function beforeTooltipLuaInventory(paths,read){
 const {path,sha}=tinyHousePrevious.luaAddition;
 if(!paths.includes(path))return paths;
 assert.equal(paths.filter(candidate=>candidate===path).length,1,'unique tooltip Lua source');
 const source=read(path,'utf8');
 assert(typeof source==='string'&&!source.includes('\r\r\n')&&hash(normalize(source))===sha,
   'fresh tooltip Lua source: '+path);
 return paths.filter(candidate=>candidate!==path);
}
