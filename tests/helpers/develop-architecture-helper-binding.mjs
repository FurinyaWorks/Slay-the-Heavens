// Fixed trust leaf, excluded from its own source archive.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
export const architectureClosureBytes=readFileSync(new URL('./develop-architecture-helper-closure.json',import.meta.url));
assert.equal(createHash('sha256').update(architectureClosureBytes).digest('hex'),'1e36148f7371a00e29c5b7b5ed2b998dce44fdf015b8c506133e8a302ba16f4e','complete develop architecture helper continuation');
