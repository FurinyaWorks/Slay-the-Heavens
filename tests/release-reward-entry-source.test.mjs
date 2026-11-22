import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {beforeEnergyReferenceSource,assertEnergyReferenceCurrent} from './helpers/energy-reference-source.mjs';

test('faster reward entry preserves the exact historical feedback and rejects drift',()=>{
 const path='src/lua/abyss_feedback.lua',source=readFileSync(path,'utf8');
 assert.doesNotThrow(()=>assertEnergyReferenceCurrent(path,source));
 const prior=beforeEnergyReferenceSource(path,source);
 assert.notEqual(prior,source);
 assert.throws(()=>assertEnergyReferenceCurrent(path,prior),/fresh energy reference source/);
 assert.equal(beforeEnergyReferenceSource(path,source+'-- unknown'),source+'-- unknown');
 assert.throws(()=>beforeEnergyReferenceSource(path,source,()=>source+'-- changed'),/linked owner identity/);
});
