// Reuse the repository's exact GIL projection. Its standard-art template list
// predates all-art-disabled builds; adapt only that list for this experiment.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {registerHooks}from 'node:module';import {pathToFileURL}from 'node:url';
const target=pathToFileURL(path.resolve('scripts/native-candidate-preview.mjs')).href;
const anchor="const requiredTemplates=new Set(['AbyssDeckCard','AbyssMonsterActor','AbyssMonsterPower','AbyssReadyCardGroup','AbyssReadyCardImage']);";
registerHooks({load(url,context,next){const r=next(url,context);if(url!==target)return r;const source=Buffer.from(r.source).toString();assert.equal(source.split(anchor).length,2);return {...r,source:source.replace(anchor,"const requiredTemplates=new Set(['AbyssDeckCard','AbyssMonsterActor','AbyssMonsterPower','AbyssReadyCardGroup']);")};}});
process.argv[1]=path.resolve('scripts/native-candidate-preview.mjs');await import(target);
