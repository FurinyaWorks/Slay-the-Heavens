// Fixed trust leaf, excluded from its archive.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
export const navigationCiBytes=readFileSync(new URL('./navigation-ci-source.json.gz',import.meta.url));
assert.equal(createHash('sha256').update(navigationCiBytes).digest('hex'),'bbde44a0a3055096786ba2c18f444bbba4b1971520fb315d66b57e8fc3ac707b','complete navigation CI continuation');
