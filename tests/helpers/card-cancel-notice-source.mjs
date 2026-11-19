import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {exactSourceContinuation} from './exact-source-continuation.mjs';

const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const archive = readFileSync(new URL('./card-cancel-notice-source.json.gz', import.meta.url));
assert.equal(hash(archive), '9f2c65a557e96d2cece4f568135d42521dbba88760af6acfeba5797ccd85fe1b', 'complete card cancellation source predecessor');
const {base, rows} = JSON.parse(gunzipSync(archive));
assert.equal(base, '2ec45b9e52c870badc4d4888f6243a30556eecb4');
const pairs = Object.entries(rows).map(([path, {before, after}]) => {
    assert.equal(hash(before.source), before.sha256, path);
    return exactSourceContinuation({path, before, after});
});

export function projectCardCancelSource(path, source, binding) {
    return pairs.reduce((projected, pair) => pair.project(path, projected, binding), source);
}

export function authorizeCardCancelSource(path, input, binding, samples, read) {
    for (const pair of pairs) pair.authorize(path, input, binding, samples, read);
}

export function beforeCardCancelSource(path, source, read) {
    return pairs.reduce((projected, pair) => pair.predecessor(path, projected, read), source);
}
