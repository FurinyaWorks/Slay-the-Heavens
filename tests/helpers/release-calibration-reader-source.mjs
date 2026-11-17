// Complete exact source views for the two immutable calibration readers.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const hash=s=>createHash('sha256').update(s).digest('hex');
const bytes=readFileSync(new URL('./release-calibration-reader-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'8507d1cd02470dbd522d9a2a922301386364818ab4f722fbbf0856d49a612e11','complete Release calibration reader continuation');
const packet=JSON.parse(gunzipSync(bytes));
assert.deepEqual(Object.keys(packet.views),['component281','nativeCloseout','releaseIntegration']);
for(const files of Object.values(packet.views))for(const row of Object.values(files))for(const side of ['current','before']){
 assert.equal(row[side].source.replaceAll('\r\n','\n'),row[side].source);
 assert.equal(hash(row[side].source),row[side].sha256,'complete calibration reader source');
}
export function releaseCalibrationReaderSource(path,source,target){
 const files=Object.hasOwn(packet.views,target)?packet.views[target]:null;
 const row=files&&Object.hasOwn(files,path)?files[path]:null;
 if(!row||typeof source!=='string'||source.includes('\r\r\n')||hash(source.replaceAll('\r\n','\n'))!==row.current.sha256)return source;
 return row.before.source;
}
