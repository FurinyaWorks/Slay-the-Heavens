// Fixed trust leaf; excluded from its own archive.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
export const integratedCiBytes=readFileSync(new URL('./integrated-ci-source.json.gz',import.meta.url));
assert.equal(createHash('sha256').update(integratedCiBytes).digest('hex'),"ed7f631311904dcacc155c434b9b37597e9a7fa1fda15c18d34687c2daf66be0",'complete reviewed integration CI sources');
