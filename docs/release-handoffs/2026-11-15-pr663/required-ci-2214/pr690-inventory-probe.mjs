import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {integratedCiBytes} from './integrated-ci-binding.mjs';
import {releaseNavigationPriorInventory,assertReleaseNavigationRawInventory} from './release-navigation-ci-source.mjs';
import {releaseMergeRead,assertReleaseMergeCurrent} from './release-bootstrap-merge-ci-source.mjs';
const repo='../wake-1314/merge-rehearsal',sha='672aadeb5c66e713e5474e5ab71f3eb35dc698d4';
const git=(...a)=>execFileSync('git',['-C',repo,...a],{maxBuffer:32*1024*1024});
const cache=new Map();
const physical=(p,e)=>{if(!cache.has(p)){
 let b=git('show',sha+':'+p),m=b.toString().match(/^version https:\/\/git-lfs.github.com\/spec\/v1\noid sha256:([a-f0-9]+)\nsize (\d+)\n$/);
 if(m){let found=false;for(const root of [repo,'../wake-2045-player-smoke/repo','../pr684-on-release-1cc-1949/repo']){if(!existsSync(root+'/'+p))continue;let c=readFileSync(root+'/'+p);if(c.length===+m[2]&&createHash('sha256').update(c).digest('hex')===m[1]){b=c;found=true;break;}}assert(found,'missing exact LFS object '+p);}
 cache.set(p,b);
}const b=cache.get(p);return e?b.toString(e):b;};
const rows=git('ls-tree','-r','--name-only',sha,'tests').toString().trim().split('\n');
const js=rows.filter(p=>/^tests\/[^/]+\.test\.mjs$/.test(p)).sort();
const lua=rows.filter(p=>/^tests\/lua\/[^/]+\.lua$/.test(p)).sort();
const proof=JSON.parse(gunzipSync(integratedCiBytes));
console.log('EXACT HOSTED MERGE',sha,'tree',git('rev-parse',sha+'^{tree}').toString().trim());
assert.throws(()=>assert.deepEqual(js,proof.inventory));
console.log('RED original inventory equality; additions',js.filter(p=>!proof.inventory.includes(p)));
assertReleaseMergeCurrent(physical);
console.log('PASS actual Release composition source/archive guard against exact Git blobs');
const read=releaseMergeRead('slicePrior',physical);
for(const [kind,current,prior] of [['js',js,proof.inventory],['lua',lua,proof.luaInventory]]) {
 assertReleaseNavigationRawInventory(current,kind);
 assert.deepEqual(releaseNavigationPriorInventory(current,kind,read),prior);
 const added=current.filter(p=>!prior.includes(p));
 assert.throws(()=>{const missing=current.filter(p=>p!==added[0]);assertReleaseNavigationRawInventory(missing,kind);releaseNavigationPriorInventory(missing,kind,read);});
 assert.throws(()=>releaseNavigationPriorInventory([...current,current[0]],kind,read));
 assert.throws(()=>releaseNavigationPriorInventory(current,kind,(p,e)=>read(p,e)+(p===added[0]?'\n':'')));
 console.log('GREEN bounded mapping only',kind,current.length,'->',prior.length,'missing/duplicate/changed-added refused');
}
console.log('NOT_RUN original full test/file/suite; no production patch or frozen source rebinding');
