// Fixed trust leaf; excluded from its own archive.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
export const integratedCiBytes=readFileSync(new URL('./integrated-ci-source.json.gz',import.meta.url));
assert.equal(createHash('sha256').update(integratedCiBytes).digest('hex'),"f0b7137f7d0462dff36b78e39a39aab8804ba9a097b1b72bdf6686cf10f15c35",'complete reviewed integration CI sources');
