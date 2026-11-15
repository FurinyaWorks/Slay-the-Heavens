// Collect current bytes only after product and source-wrapper owners freeze.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync,readdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {gzipSync,gunzipSync} from 'node:zlib';
const mode=process.argv[2]??'--check';assert(['--check','--write'].includes(mode));
const hash=s=>createHash('sha256').update(s).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const bind=source=>({source,sha256:hash(source),gitBlob:createHash('sha1').update(`blob ${Buffer.byteLength(source)}\0`).update(source).digest('hex')});
const git=args=>execFileSync('git',args,{encoding:'utf8',maxBuffer:16*1024*1024});
const baseCommit='e65d9b98fbec69442047650254238cd9244df805';
assert.equal(git(['rev-parse','--verify',baseCommit+'^{commit}']).trim(),baseCommit,'exact immutable late CI base commit');
const prior=JSON.parse(gunzipSync(readFileSync('tests/helpers/integrated-ci-source.json.gz')));
const oldPaths=new Set(git(['ls-tree','-r','--name-only',baseCommit]).trim().split('\n'));
const paths=new Set([...git(['diff','--name-only',baseCommit,'--','src/lua','tests']).trim().split('\n'),...git(['ls-files','--others','--exclude-standard','tests']).trim().split('\n')]);
const files={},binary={};
for(const path of [...paths].sort()){
 if(!path||!existsSync(path)||['tests/helpers/late-ci-binding.mjs','tests/helpers/late-ci-source.json.gz'].includes(path))continue;
 const before=oldPaths.has(path)?execFileSync('git',['show',baseCommit+':'+path],{maxBuffer:16*1024*1024}):null;
 const after=readFileSync(path);
 if(path.endsWith('.gz')){binary[path]={before:before===null?null:hash(before),after:hash(after)};continue;}
 if(!/\.(mjs|json|lua)$/.test(path))continue;
 files[path]={before:before===null?null:bind(norm(before.toString())),after:bind(norm(after.toString()))};
 if(files[path].before?.sha256===files[path].after.sha256)delete files[path];
}
const base=JSON.parse(readFileSync('tests/helpers/closeout-source-closure.json','utf8'));
const feedback=JSON.parse(gunzipSync(readFileSync('tests/helpers/sts-feedback-ci.json.gz')));
for(const [path,row]of Object.entries(feedback.helperClosure)){assert.equal(base[path]??null,row.before);base[path]=row.after;}
for(const [path,row]of Object.entries(prior.closure)){assert.equal(base[path]??null,row.before);base[path]=row.after;}
const added=['tests/helpers/late-source-continuation.mjs','tests/helpers/late-source-epoch.mjs','tests/helpers/fatal-bgm-stop-source-inverse.mjs','tests/helpers/battle-return-historical-source.mjs',
 'tests/fixtures/fatal-bgm-stop-before.lua','tests/fixtures/fatal-bgm-stop-after.lua','tests/fixtures/fatal-bgm-e65-source.json.gz',
 'tests/fixtures/battle-details-before.lua','tests/fixtures/battle-details-after.lua','tests/fixtures/battle-pile-before.lua','tests/fixtures/battle-pile-after.lua'];
const helperClosure={};
for(const path of [...new Set([...added,'tests/helpers/combined-epoch/source-epoch-runtime.mjs','tests/helpers/closeout-source-epoch.mjs'])].sort()){
 const after=hash(path.endsWith('.gz')?readFileSync(path):norm(readFileSync(path,'utf8')));
 helperClosure[path]={before:base[path]??null,after};
}
const inventory=directory=>readdirSync(directory).filter(p=>p.endsWith(directory==='tests'?'.test.mjs':'.lua')).map(p=>directory+'/'+p).sort();
const proof={schemaVersion:1,normalization:'LF',baseCommit,priorArchiveSha256:hash(readFileSync('tests/helpers/integrated-ci-source.json.gz')),
 files,binary,helperClosure,inventoryBefore:prior.inventory,inventoryAfter:inventory('tests'),luaInventoryBefore:prior.luaInventory,luaInventoryAfter:inventory('tests/lua')};
const bytes=gzipSync(JSON.stringify(proof)),sha=hash(bytes);
const leaf=`// Fixed successor trust leaf; excluded from its own archive.\nimport assert from 'node:assert/strict';\nimport {readFileSync} from 'node:fs';\nimport {createHash} from 'node:crypto';\nexport const lateCiBytes=readFileSync(new URL('./late-ci-source.json.gz',import.meta.url));\nassert.equal(createHash('sha256').update(lateCiBytes).digest('hex'),${JSON.stringify(sha)},'complete late CI continuation');\n`;
for(const [path,value]of [['tests/helpers/late-ci-source.json.gz',bytes],['tests/helpers/late-ci-binding.mjs',Buffer.from(leaf)]]){
 if(mode==='--write')writeFileSync(path,value);else assert(readFileSync(path).equals(value),'reproducible exact late CI: '+path);
}
console.log(JSON.stringify({files:Object.keys(files).length,helpers:Object.keys(helperClosure).length,bytes:bytes.length,sha256:sha,js:proof.inventoryAfter.length,lua:proof.luaInventoryAfter.length}));
