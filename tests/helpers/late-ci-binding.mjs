// Fixed successor trust leaf; excluded from its own archive.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
export const lateCiBytes=readFileSync(new URL('./late-ci-source.json.gz',import.meta.url));
assert.equal(createHash('sha256').update(lateCiBytes).digest('hex'),"db12156aac2e4deb928bcb798d74788cedde792c2ad03dce9b7ee552997b959a",'complete late CI continuation');
