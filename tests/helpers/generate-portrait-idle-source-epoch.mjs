import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
const mode=process.argv[2]??'--check';assert(['--check','--write'].includes(mode));
const baseCommit='df2efb4225de667fa3daf4c71296198b0a579866',currentCommit='7b2b178b1d3bb045d0c74a7fcf86513723f334ae';
const path='src/lua/abyss_traveler_portraits.lua',packetPath='tests/helpers/portrait-idle-source-epoch.json.gz';
const hash=s=>createHash('sha256').update(s).digest('hex');
const git=(...args)=>execFileSync('git',args,{maxBuffer:8*1024*1024});
assert.equal(git('rev-parse',currentCommit+'^').toString().trim(),baseCommit,'actual one-owner producer parent');
const bind=revision=>{
 const bytes=git('show',revision+':'+path),source=bytes.toString();assert(!source.includes('\r'),'Git source must be LF');
 const gitBlob=git('rev-parse',revision+':'+path).toString().trim();
 assert.equal(createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex'),gitBlob);
 return {source,sha256:hash(bytes),gitBlob};
};
const predecessor='tests/helpers/mobile-ui-source-epoch.json.gz',priorBytes=git('show',baseCommit+':'+predecessor);
assert.equal(hash(priorBytes),'3af193f44e4194756a1ca1b60c3319d5d26f3a5bacce0534d5f9eb02dbd7c4b5');
assert.deepEqual(readFileSync(predecessor),priorBytes,'original seven-owner packet remains physically immutable');
const before=bind(baseCommit),current=bind(currentCommit);assert.notEqual(before.sha256,current.sha256);
assert.equal(before.gitBlob,'3046e3ba9443517d9254d8001b7b5acc6db8d847');
assert.equal(readFileSync(path,'utf8').replaceAll('\r\n','\n'),current.source,'live portrait equals frozen product producer');
const packet={schemaVersion:1,normalization:'LF',baseCommit,currentCommit,
 priorMobileUiPacketSha256:hash(priorBytes),before:{[path]:before},current:{[path]:current}};
const bytes=gzipSync(JSON.stringify(packet));bytes[9]=10;
if(mode==='--write')writeFileSync(packetPath,bytes);else assert.deepEqual(readFileSync(packetPath),bytes,'fresh eighth-owner portrait continuation');
console.log(JSON.stringify({owners:1,currentCommit,bytes:bytes.length,sha256:hash(bytes)}));
