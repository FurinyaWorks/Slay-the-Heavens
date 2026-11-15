import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { lstatSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Read-only preflight for the exact #663 d3783cd1 repair. No fetch, build or write.
const expected = [
 ['tests/helpers/closeout-ci-source.json.gz', 2848271, 'cfc72306af30d0d4b0b61398e3ed0eea36767d6e005c146eb215897fc431a8f8'],
 ['tests/helpers/release-source-epoch.json.gz', 2587324, '5e41bb3cf23863526a60f15ce164419221c123f6d88a8b2fb3da18c9806ab780'],
];
const root = resolve(process.argv[2] ?? '.');
const git = (...args) => execFileSync('git', ['-C', root, ...args], {encoding:'utf8',stdio:['ignore','pipe','pipe'],maxBuffer:4096});
function verify([path,size,sha]) {
 const ptr=`version https://git-lfs.github.com/spec/v1\noid sha256:${sha}\nsize ${size}\n`;
 if(git('show','HEAD:'+path)!==ptr) throw Error(`Unexpected HEAD pointer: ${path}; re-review the exact source revision before proceeding.`);
 const absolute=resolve(root,path), stat=lstatSync(absolute);
 if(!stat.isFile()) throw Error(`Expected a regular file: ${path}`);
 if(stat.size===ptr.length && readFileSync(absolute,'utf8')===ptr) throw Error(`Unmaterialized LFS pointer: ${path}; retrieve the committed object before generating.`);
 if(stat.size!==size) throw Error(`Incorrect object size: ${path}: expected ${size}, got ${stat.size}`);
 if(createHash('sha256').update(readFileSync(absolute)).digest('hex')!==sha) throw Error(`Incorrect SHA-256: ${path}`);
 return {path,size,sha256:sha};
}
try {
 const inputs=expected.map(verify);
 console.log(JSON.stringify({status:'ok',sourceHead:git('rev-parse','HEAD').trim(),inputs},null,2));
} catch(error) {
 console.error(error.message);
 process.exitCode=1;
}
