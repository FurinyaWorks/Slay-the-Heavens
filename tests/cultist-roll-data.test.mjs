import test from 'node:test';
import assert from 'node:assert/strict';
import { loadContent, validateContent } from '../scripts/validate-data.mjs';
const raven_adept = data => data.enemies.enemies.find(enemy => enemy.id === 'raven_adept');

test('Raven Adept primary roll range enters the validated runtime catalog', () => {
  const data = loadContent('data');
  assert.equal(raven_adept(data).ai.rollRange, 100);
  assert.deepEqual(validateContent(data), []);
});
for (const [name, value] of [
  ['missing', undefined], ['zero', 0], ['negative', -1],
  ['fractional', 99.5], ['too large', 65537], ['string', '100'],
]) test(`Raven Adept rejects ${name} primary roll range`, () => {
  const data = loadContent('data');
  if (value === undefined) delete raven_adept(data).ai.rollRange;
  else raven_adept(data).ai.rollRange = value;
  assert.ok(validateContent(data).some(error => error.includes('rollRange')));
});

test('Raven Adept valid roll range is not rejected as an unknown AI field', () => {
  const data = loadContent('data');
  raven_adept(data).ai.rollRange = 100;
  assert.deepEqual(validateContent(data), []);
});
