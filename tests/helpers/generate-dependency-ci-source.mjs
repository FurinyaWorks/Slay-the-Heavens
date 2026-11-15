// Bounded collection over the authorized baseline. Never refresh an old archive.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,existsSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gzipSync,gunzipSync} from 'node:zlib';
const mode=process.argv[2]??'--check';assert(['--check','--write'].includes(mode));
const hash=s=>createHash('sha256').update(s).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const bind=source=>({source,sha256:hash(source),gitBlob:createHash('sha1').update(`blob ${Buffer.byteLength(source)}\0`).update(source).digest('hex')});
const git=args=>execFileSync('git',args,{encoding:'utf8',maxBuffer:32*1024*1024});
const baseCommit=git(['rev-parse','c2409ad7^{commit}']).trim();
function output(path,value){if(mode==='--write')writeFileSync(path,value);else assert(readFileSync(path).equals(value),'reproducible exact successor: '+path);}
// Reuse only the one-owner complete source pair, byte-for-byte from its producer.
const fixture='tests/fixtures/fatal-bgm-e65-source.json.gz';
const fixtureBytes=execFileSync('git',['show','158c492a3f8a6e8d3bfc85b79634b06d2f4b3056:'+fixture],{maxBuffer:1024*1024});
assert.equal(hash(fixtureBytes),'3e560e461232785753f5a574732ec834b19c51cfd700f09cce212009dd4a22fb');output(fixture,fixtureBytes);
const prior=JSON.parse(gunzipSync(readFileSync('tests/helpers/integrated-ci-source.json.gz')));
const oldPaths=new Set(git(['ls-tree','-r','--name-only',baseCommit]).trim().split('\n'));
const paths=new Set([...git(['diff','--name-only',baseCommit,'--','scripts','src/lua','tests']).trim().split('\n'),...git(['ls-files','--others','--exclude-standard','tests']).trim().split('\n')]);
const files={},binary={},excluded=['tests/helpers/dependency-ci-binding.mjs','tests/helpers/dependency-ci-source.json.gz'];
for(const path of [...paths].sort()){
 if(!path||!existsSync(path)||excluded.includes(path))continue;
 const before=oldPaths.has(path)?execFileSync('git',['show',baseCommit+':'+path],{maxBuffer:32*1024*1024}):null,after=readFileSync(path);
 if(path.endsWith('.gz')){binary[path]={before:before===null?null:hash(before),after:hash(after)};continue;}
 if(!/\.(mjs|json|lua)$/.test(path))continue;
 files[path]={before:before===null?null:bind(norm(before.toString())),after:bind(norm(after.toString()))};
 if(files[path].before?.sha256===files[path].after.sha256)delete files[path];
 if(prior.files[path])assert.deepEqual(files[path]?.before??prior.files[path].current,prior.files[path].current,'exact archive/baseline predecessor: '+path);
}
// Reconstruct the actual original copy inventory before applying changed owners.
const base=JSON.parse(readFileSync('tests/helpers/closeout-source-closure.json','utf8'));
const feedback=JSON.parse(gunzipSync(readFileSync('tests/helpers/sts-feedback-ci.json.gz')));
for(const patch of [feedback.helperClosure,prior.closure])for(const [path,row]of Object.entries(patch)){assert.equal(base[path]??null,row.before);base[path]=row.after;}
const required=['tests/helpers/fatal-bgm-source-continuation.mjs','tests/helpers/fatal-bgm-source-epoch.mjs','tests/helpers/dependency-ci-source.mjs',fixture];
const helperClosure={};
for(const path of [...new Set([...Object.keys(base),...required])].sort()){
 const after=hash(path.endsWith('.gz')?readFileSync(path):norm(readFileSync(path,'utf8')));
 if(after!==(base[path]??null))helperClosure[path]={before:base[path]??null,after};
}
assert(Object.keys(helperClosure).length<20,'bounded changed helper closure; explain a larger dependency chain first');
const inventory=(dir,ext)=>readdirSync(dir).filter(p=>p.endsWith(ext)).map(p=>dir+'/'+p).sort();
const proof={schemaVersion:1,normalization:'LF',baseCommit,priorArchiveSha256:hash(readFileSync('tests/helpers/integrated-ci-source.json.gz')),
 files,binary,helperClosure,inventoryBefore:prior.inventory,inventoryAfter:inventory('tests','.test.mjs'),luaInventoryBefore:prior.luaInventory,luaInventoryAfter:inventory('tests/lua','.lua')};
// Retain the pinned Windows producer header, including on a POSIX check run.
const bytes=gzipSync(JSON.stringify(proof));bytes[9]=10;const sha=hash(bytes);
const leaf=`// Fixed successor trust leaf; excluded from its own archive.\nimport assert from 'node:assert/strict';\nimport {readFileSync} from 'node:fs';\nimport {createHash} from 'node:crypto';\nexport const dependencyCiBytes=readFileSync(new URL('./dependency-ci-source.json.gz',import.meta.url));\nassert.equal(createHash('sha256').update(dependencyCiBytes).digest('hex'),${JSON.stringify(sha)},'complete dependency/BGM CI successor');\n`;
output('tests/helpers/dependency-ci-source.json.gz',bytes);output('tests/helpers/dependency-ci-binding.mjs',Buffer.from(leaf));
console.log(JSON.stringify({files:Object.keys(files),helpers:Object.keys(helperClosure),bytes:bytes.length,sha256:sha,baseCommit,js:proof.inventoryAfter.length,lua:proof.luaInventoryAfter.length}));
