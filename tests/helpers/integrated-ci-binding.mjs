// Fixed trust leaf; excluded from its own archive.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
export const integratedCiBytes=readFileSync(new URL('./integrated-ci-source.json.gz',import.meta.url));
assert.equal(createHash('sha256').update(integratedCiBytes).digest('hex'),"9f7ef2589d6dca76586ea67b9e1eb7868e7b958cb665ed6c2053cb315f7be124",'complete reviewed integration CI sources');
