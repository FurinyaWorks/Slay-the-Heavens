// Fixed successor trust leaf; excluded from its own archive.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
export const dependencyCiBytes=readFileSync(new URL('./dependency-ci-source.json.gz',import.meta.url));
assert.equal(createHash('sha256').update(dependencyCiBytes).digest('hex'),"293c36c61a5b14eb3bc069d2a6ae8e9357cba730e4b053ee0323b058aa279cbe",'complete dependency/BGM CI successor');
