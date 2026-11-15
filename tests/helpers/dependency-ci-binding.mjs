// Fixed successor trust leaf; excluded from its own archive.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
export const dependencyCiBytes=readFileSync(new URL('./dependency-ci-source.json.gz',import.meta.url));
assert.equal(createHash('sha256').update(dependencyCiBytes).digest('hex'),"2b30199066d45ddcd673d9af12fb550fb739aa04474439453b678382ace3db72",'complete dependency/BGM CI successor');
