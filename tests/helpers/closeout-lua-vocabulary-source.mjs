import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {restoreExactFixtureHunks} from './exact-fixture-hunks.mjs';
import {exactSourceMatches} from './source-fingerprint.mjs';
import {beforeReleaseClosureFixture} from './release-closure-fixture-source.mjs';

function readPacket(name,digest,base,head){
 const bytes=readFileSync(new URL(`../fixtures/${name}.json.gz`,import.meta.url));
 assert.equal(createHash('sha256').update(bytes).digest('hex'),digest,'exact closeout Lua source packet: '+name);
 const packet=JSON.parse(gunzipSync(bytes));
 assert.equal(packet.schemaVersion,1);
 assert.equal(packet.base,base);
 assert.equal(packet.head,head);
 return packet.files;
}

const vocabulary=readPacket('closeout-lua-vocabulary-source',
 'a9b4b58832c0822f591b3af44ecbb1395efdceca6bb30fa16034e393fd5b9d03',
 '7348ab8598c8607712d525bd732239f89bb52830','b2f74d99a3d80e60b99165b6380987cda8b4488d');
const backflow=readPacket('closeout-lua-backflow-source',
 'bad678221d980f80a774b2bfe7de1e988a6a9c1f6d9fcc61c3396059074a3939',
 '903bf2a31e91f10fb24763ab4cea23d586d0bb83','7228aaa83b0995e1dc6e36955cfd6e773c199f07');
const floorSources=readPacket('closeout-planning-floor-source',
 '64f1e0473854162933cf02650519ad07ce99306905344722baf5eea2b6f5da93',
 '1eb288472d7b33b7450eec97a624ca2ffa526f39','863c0983b4d8cad1c7a77391f860ba038e3cb6d4');

const portraitFixture='tests/lua/native_enemy_portraits.lua';
const portraitContinuation=Object.freeze({
 sha256:'28a5bd3b76a9e24e2c7259b3f5c2f33d9604906f0e775dd2cc3e6605e2e1e780',
 gitBlob:'d6431413b8cda3b13556fcd4aedacc0698ae5160',
});
const portraitPredecessor=Object.freeze({
 sha256:'0e24faa10719752a90f3f7e9ff04e69a986c05678722fa2107da5a68b4fab085',
 gitBlob:'8e2754ef7c5af543cdc49066441b0c340d6a6396',
});

// #1065 expands the live portrait fixture. Historical timing receipts only
// may read its exact #1064 predecessor; the current Lua suite runs live bytes.
function beforeGroundContactPortraitFixture(path,source,binding){
 if(path!==portraitFixture||binding.sha256!==portraitPredecessor.sha256||
    binding.gitBlob!==portraitPredecessor.gitBlob||!exactSourceMatches(source,portraitContinuation))return source;
 const lf=source.replaceAll('\r\n','\n');
 const crlf=source!==lf;
 assert(!crlf||source===lf.replaceAll('\n','\r\n'),'mixed closeout Lua receipt line endings: '+path);
 const archived=readFileSync(new URL('../fixtures/release-v220-native-enemy-portraits-prior.lua.txt',import.meta.url),'utf8');
 const prior=archived.replaceAll('\r\n','\n');
 assert(archived===prior||archived===prior.replaceAll('\n','\r\n'),'mixed archived portrait fixture line endings');
 assert(exactSourceMatches(prior,portraitPredecessor),'exact pre-ground-contact portrait fixture');
 return crlf?prior.replaceAll('\n','\r\n'):prior;
}

function receiptFor(files,path,digest){
 if(!Object.hasOwn(files,path))return;
 const row=files[path];
 if(digest===row.beforeSha256)return row;
 if(row.earlier&&digest===row.earlier.beforeSha256)return row;
}

function floorReceipt(path,digest){
 if(!Object.hasOwn(floorSources,path))return;
 const rows=floorSources[path];
 return Object.hasOwn(rows,digest)?rows[digest]:undefined;
}

// The backflow packet carries the reviewed live successor for paths that moved
// beyond #951 and wires the genuine merchant fixture rename to the old receipt.
// Formation and Golden Idol costs retain their own exact source inputs.
// Only an exact receipt digest and live Git identity authorize an older read.
export function readCloseoutLuaVocabularyReceipt(path,digest,readCurrent){
 const row=receiptFor(backflow,path,digest)??receiptFor(vocabulary,path,digest)??floorReceipt(path,digest);
 if(!row)return;
 const sourcePath=row.sourcePath??path;
 if(sourcePath!==path)assert.throws(()=>readCurrent(path,'utf8'),{code:'ENOENT'},'renamed closeout Lua receipt input reappeared: '+path);
 const current={sha256:row.afterSha256,gitBlob:row.afterBlob};
 const source=beforeGroundContactPortraitFixture(sourcePath,
  beforeReleaseClosureFixture(sourcePath,readCurrent(sourcePath,'utf8')),current);
 const continuation=row.continuation;
 const continued=continuation&&exactSourceMatches(source,continuation);
 assert(continued||exactSourceMatches(source,current),'current closeout Lua receipt input changed: '+path);
 const lf=source.replaceAll('\r\n','\n');
 assert(source===lf||source===lf.replaceAll('\n','\r\n'),'mixed closeout Lua receipt line endings: '+path);
 const predecessor=continued?restoreExactFixtureHunks({path,beforeSha256:current.sha256,
  afterSha256:continuation.sha256,hunks:continuation.hunks},path,lf):lf;
 assert(exactSourceMatches(predecessor,current),'exact closeout Lua continuation predecessor: '+path);
 const prior=restoreExactFixtureHunks({...row,path},path,predecessor);
 assert(exactSourceMatches(prior,{sha256:row.beforeSha256,gitBlob:row.beforeBlob}),
  'exact closeout Lua receipt predecessor: '+path);
 if(digest===row.beforeSha256)return prior;
 const earlier=row.earlier;
 assert(exactSourceMatches(prior,{sha256:earlier.afterSha256,gitBlob:earlier.afterBlob}),
  'exact intermediate closeout Lua receipt: '+path);
 const original=restoreExactFixtureHunks({...earlier,path},path,prior);
 assert(exactSourceMatches(original,{sha256:earlier.beforeSha256,gitBlob:earlier.beforeBlob}),
  'exact pre-Formation Lua receipt predecessor: '+path);
 return original;
}
