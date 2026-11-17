import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readFileSync,writeFileSync} from 'node:fs';
import {gzipSync,gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
const source='79a8b59e5d89bf97e521093d03b29e2808293c40';
const hash=b=>createHash('sha256').update(b).digest('hex');
const rows=[];
for(const name of ['fixture-recheck-default.log','fixture-recheck-red.log']){
 const path='docs/evidence/hand-enemy-integration-20261116/'+name;
 const r=spawnSync('git',['show',source+':'+path]);assert.equal(r.status,0);
 const bytes=r.stdout,archive='retained-'+name+'.gz',packed=gzipSync(bytes,{level:9});
 assert.deepEqual(gunzipSync(packed),bytes);writeFileSync(new URL(archive,import.meta.url),packed);
 const fs=readFileSync(path),fsArchive='retained-fs-'+name+'.gz';
 if(!fs.equals(bytes))writeFileSync(new URL(fsArchive,import.meta.url),gzipSync(fs,{level:9}));
 rows.push({path,sourceCommit:source,gitBlob:createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex'),bytes:bytes.length,sha256:hash(bytes),archive,archiveSha256:hash(packed),filesystem:{bytes:fs.length,sha256:hash(fs),archive:fs.equals(bytes)?archive:fsArchive}});
}
writeFileSync(new URL('retained-log-identities.json',import.meta.url),JSON.stringify({reason:'Preserve exact historical Git and filesystem raw output before removing only trailing whitespace/blank EOF from display logs for the unchanged CI whitespace gate.',rows},null,2)+'\n');
console.log('RETAINED_RAW_LOGS_PASS '+rows.length);
