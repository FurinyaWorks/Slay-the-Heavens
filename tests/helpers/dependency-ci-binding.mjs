// Fixed successor trust leaf; excluded from its own archive.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
export const dependencyCiBytes=readFileSync(new URL('./dependency-ci-source.json.gz',import.meta.url));
assert.equal(createHash('sha256').update(dependencyCiBytes).digest('hex'),"499f0c0fd32f24178a8d7599d1f1167ff90a3899d791e13235484a47ba31595d",'complete dependency/BGM CI successor');
