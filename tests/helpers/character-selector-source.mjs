import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {exactSourceContinuation} from './exact-source-continuation.mjs';

const path='src/lua/abyss_character_select_view.lua';
const archive=readFileSync(new URL('../fixtures/develop-character-architecture-before.json.gz',import.meta.url));
const hash=source=>createHash('sha256').update(source).digest('hex');
assert.equal(hash(archive),'7a5ab46cd4e7d27fc414f05bebb1ffe06dcba742f990412205113f672b8db541','complete original character archive');
const {source,sha256}=JSON.parse(gunzipSync(archive)).sources[path];
assert.equal(sha256,'01b673f7d9a360e9ec2e42dc69ff8e75b746101cb5411e8ed4698a496679d447');
assert.equal(hash(source),sha256,'exact selector predecessor');
const gitBlob=createHash('sha1').update(`blob ${Buffer.byteLength(source)}\0`).update(source).digest('hex');
export const selectorSourcePair=Object.freeze({
 path,
 before:Object.freeze({source,sha256,gitBlob}),
 after:Object.freeze({sha256:'af861f27c0e3e8f832f21146a28de02ecba9e92219654911bddb201c8644b452',
  gitBlob:'53bc750e91c49c79c3ed1fcad4be1b8addd48074'}),
});
export const {project:projectSelectorSource,authorize:authorizeSelectorSource,predecessor:beforeSelectorSource}=exactSourceContinuation(selectorSourcePair);
