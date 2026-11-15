// Fixed successor trust leaf; excluded from its own archive.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
export const dependencyCiBytes=readFileSync(new URL('./dependency-ci-source.json.gz',import.meta.url));
assert.equal(createHash('sha256').update(dependencyCiBytes).digest('hex'),"fde4c0aaf8934eea8a10377c3af0129d9f16c84278d0c63f2227d14236941624",'complete dependency/BGM CI successor');
