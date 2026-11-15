// Exact storage-only continuation; original full source/CI packets never advance.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const norm=s=>s.replaceAll('\r\n','\n'),hash=s=>createHash('sha256').update(s).digest('hex');
const pcBytes=readFileSync(new URL('./pc-final-ci-source.json.gz',import.meta.url));
assert.equal(hash(pcBytes),'ee99ca6ed0372689bdd45692bc55a3a8ccb09c958697388d40e40a39c9be1da9','immutable pre-storage PC CI packet');
const pc=JSON.parse(gunzipSync(pcBytes));
const originalBytes=readFileSync(new URL('./integrated-ci-source.json.gz',import.meta.url));
assert.equal(hash(originalBytes),'1e53c4b1ac4d3fd640b543f4957db4c5f51cebe5303d2c850c5c06f1f30c9d48','immutable original CI packet');
const original=JSON.parse(gunzipSync(originalBytes));
export const pcFinalStorageBindings=Object.freeze([
  {
    "path": ".gitattributes",
    "beforeSha256": "69fb2fbfc39696c11c654459cab841ad67aee9a74eed245d4dcb1a55bd7dcdd7",
    "afterSha256": "c46f8a83b6e18781192804e6abf6ed199fad04017eb9a7cfe6b9b2c946bc54d0"
  },
  {
    "path": "config/ci-media-lfs.json",
    "beforeSha256": "a744f84701e638657569cf3211443adbace935c28435b2742ebc28b2a666e89d",
    "afterSha256": "e4fe7f7afc5ab181b8fd1eb9208c92ec91656a691ff4f184cd5d3c87f577a982"
  },
  {
    "path": "scripts/ci-media-lfs.mjs",
    "beforeSha256": "be0c8314816b571cac4ebce29748d3a36a5d5ce0ca581f44172c09230a735d59",
    "afterSha256": "94a47cc66bd38b687ad70e3c6d9eedb52bbe242617db2c92bd4588359b736182"
  },
  {
    "path": "docs/legal/assets.json",
    "beforeSha256": "f56b56683045e475d22f143a1d8f5de9f5b019ed06bb05ef8a7c4e946982b2b9",
    "afterSha256": "c67f685c144275ede58bdc7bba21a14dd410aa26b6fcd6ef35b180321278ff22"
  },
  {
    "path": "tests/ci-reviewed-lfs.test.mjs",
    "beforeSha256": "cb95171d73899c7d388292e2e892ec2079d1f81e5762268ec4b0ec3f44cf47ee",
    "afterSha256": "26447a6c58eea33b79079d21887fcf55eeab20cdbdcf9c272fda9f5e93a43105"
  },
  {
    "path": "tests/pc-final-ci-source.test.mjs",
    "beforeSha256": "b042766343b4dc9869e540f3ec4f90417af8e8d58c3a5047b518907a855d4d29",
    "afterSha256": "7b25412cd7f3ca02713d2e588b2e887885852b5f0a4e663d3ec152808ab808d5"
  },
  {
    "path": "tests/integrated-ci-source.cases.mjs",
    "beforeSha256": "fbacc4577658ee582f1bc1efffed27aab0db13dcc2af231db08f5d5692fcbd97",
    "afterSha256": "e321d5fded8ab1011b2ec64716223b02947a28fc7056c6c515f4206427d1a4f9"
  }
].map(Object.freeze));
const rows=new Map(pcFinalStorageBindings.map(row=>{
 const before=pc.files[row.path]?.current??original.files[row.path]?.current;
 assert(before,'complete pre-storage source: '+row.path);
 assert.equal(hash(before.source),row.beforeSha256,'pre-storage complete source identity: '+row.path);
 return [row.path,{...row,before}];
}));
export function pcFinalStorageSource(path,source){
 const row=rows.get(path);
 if(!row||typeof source!=='string'||source.includes('\r\r\n'))return source;
 return hash(norm(source))===row.afterSha256?row.before.source:source;
}
