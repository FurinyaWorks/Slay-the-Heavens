// Fixed trust leaf; excluded from its own archive.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
export const integratedCiBytes=readFileSync(new URL('./integrated-ci-source.json.gz',import.meta.url));
assert.equal(createHash('sha256').update(integratedCiBytes).digest('hex'),"1e53c4b1ac4d3fd640b543f4957db4c5f51cebe5303d2c850c5c06f1f30c9d48",'complete reviewed integration CI sources');
