// Fixed successor trust leaf; excluded from its own archive.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
export const dependencyCiBytes=readFileSync(new URL('./dependency-ci-source.json.gz',import.meta.url));
assert.equal(createHash('sha256').update(dependencyCiBytes).digest('hex'),"4ae52eab8886ca8730dfe7998a1b06f6032f3ec5ace612b56e144421618bccba",'complete dependency/BGM CI successor');
