import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {exactSourceContinuation} from './exact-source-continuation.mjs';

const path='src/lua/abyss_potion_text.lua';
const hash=source=>createHash('sha256').update(source).digest('hex');
const archive=readFileSync(new URL('./component-ui-source-epoch.json.gz',import.meta.url));
assert.equal(hash(archive),'df2a27ff146ecbee4fb01054eb1071458ffe491ece1bb50fa6fb33d19df74d4a','complete component UI archive');
const before=JSON.parse(gunzipSync(archive)).current[path];
assert.equal(before.sha256,'8c2907f1102699c59ea2167919e43a39e1c1be188756b104d5f64bf228369d59');
assert.equal(before.gitBlob,'d47d46a381022e5003055fd796c942032a119a52');
assert.equal(hash(before.source),before.sha256,'exact potion text predecessor');
export const potionTextSourcePair=Object.freeze({path,before:Object.freeze(before),
 after:Object.freeze({sha256:'a1cef54ae846d56e27188002ad97c395fdbe04d915b0291cdc0be1069b8a4a82',
  gitBlob:'5bf927a7da108a40911db4465f1991e1699b1636'}),
});
export const {project:projectPotionTextSource,authorize:authorizePotionTextSource,
 predecessor:beforePotionTextSource}=exactSourceContinuation(potionTextSourcePair);
