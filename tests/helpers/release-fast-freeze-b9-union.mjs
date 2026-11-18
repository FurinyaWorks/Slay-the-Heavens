import {releasePreflightUnionSource,assertReleasePreflightUnionArchive} from './release-preflight-union-source.mjs';
import assert from 'node:assert/strict';import{readFileSync}from'node:fs';import{createHash}from'node:crypto';import{gunzipSync}from'node:zlib';
const SHA='8da919f08189a9a0bb2a5af8f8640ae84f5f9f816fd133d1817abe6924021824',hash=s=>createHash('sha256').update(s).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const bytes=readFileSync(new URL('./release-fast-freeze-b9-union.json.gz',import.meta.url));assert.equal(hash(bytes),SHA,'immutable Fast Freeze B9 union');
const packet=JSON.parse(gunzipSync(bytes));assert.deepEqual(packet.parents,{fast:'e2feae68c855214addce2b64a8722a7354e1260f',freeze:'f8acc21780b90712bffba383101e34fea3471bf8'});
for(const row of Object.values(packet.files))for(const view of Object.values(row.views))assert.equal(hash(view.source),view.sha256,'complete exact union predecessor');
export function assertFastFreezeB9UnionCurrent(read=readFileSync){
 assertReleasePreflightUnionArchive(read);
 assert.equal(hash(read('tests/helpers/release-fast-freeze-b9-union.json.gz')),SHA,'fresh union archive');
 for(const [p,row]of Object.entries(packet.files)){const s=releasePreflightUnionSource(p,read(p,'utf8'),'release');assert.equal(typeof s,'string');assert(!s.includes('\r\r\n'));assert.equal(hash(norm(s)),row.current,'fresh complete integration source: union input '+p);}
}
export function fastFreezeB9Source(path,source,target='fast',read=readFileSync){
 assert(Object.hasOwn(packet.parents,target));const row=Object.hasOwn(packet.files,path)?packet.files[path]:null;
 if(!row?.views[target])return source;
 source=releasePreflightUnionSource(path,source,'release');
 if(!row?.views[target]||typeof source!=='string'||source.includes('\r\r\n')||hash(norm(source))!==row.current)return source;
 assertFastFreezeB9UnionCurrent(read);return source.includes('\r\n')?row.views[target].source.replaceAll('\n','\r\n'):row.views[target].source;
}
