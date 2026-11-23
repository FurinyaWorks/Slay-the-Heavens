import test from 'node:test';
import assert from 'node:assert/strict';
import { nativeBgmGraphSource, nativeBgmSignals, loadNativeBgmConfig } from '../scripts/native-bgm-graph.mjs';

function harness() {
  const handlers = {}, variables = {}, calls = [];
  const source = nativeBgmGraphSource({ id: 123, name: 'BGM candidate' });
  const graph = { onSignal(name, fn) { handlers[name] = fn; return this; } };
  const g = { server(spec) { Object.assign(variables, spec.variables); return graph; } };
  Function('g', source.replace(/^import .*\n/gm, ''))(g);
  const f = { get: key => variables[key], set: (key, value) => { variables[key] = value; },
    getListOfPlayerEntitiesOnTheField: () => ['player'], printString() {},
    modifyPlayerBackgroundMusic: (...args) => calls.push(['modify', ...args]),
    startPausePlayerBackgroundMusic: (...args) => calls.push(['pause', ...args]) };
  return { handlers, f, calls };
}

test('native graph replaces each cue once, uses catalog length and keeps result tracks non-looping', () => {
  const { handlers, f, calls } = harness();
  const config = loadNativeBgmConfig();
  for (const [cue, signal] of Object.entries(nativeBgmSignals)) {
    if (cue === 'stop') continue;
    handlers[signal]({}, f); handlers[signal]({}, f);
    const track = config.cues[cue];
    assert.deepEqual(calls.at(-2), ['modify', 'player', BigInt(track.id), 0, track.seconds,
      BigInt(track.volume), track.loop, 0, 1, true]);
    assert.deepEqual(calls.at(-1), ['pause', 'player', true], 'explicitly recover after an earlier menu/settlement pause');
  }
  assert.equal(calls.length, 14);
  handlers[nativeBgmSignals.stop]({}, f); handlers[nativeBgmSignals.stop]({}, f);
  assert.deepEqual(calls.at(-1), ['pause', 'player', false]);
  handlers[nativeBgmSignals.map]({}, f);
  assert.equal(calls.length, 17, 'a cue after stop must start and recover again');
});

test('platform Retry has independent graph state and switches from settlement to the title cue', () => {
  for (let i = 0; i < 2; i++) {
    const { handlers, f, calls } = harness();
    handlers[nativeBgmSignals.menu]({}, f);
    handlers[nativeBgmSignals.menu]({}, f);
    handlers[nativeBgmSignals.stop]({}, f);
    handlers[nativeBgmSignals.menu]({}, f);
    assert.deepEqual(calls.filter(([kind]) => kind === 'modify').map(([, , id]) => id), [10041n, 10041n]);
    assert.deepEqual(calls.filter(([kind]) => kind === 'pause').map(([, , start]) => start), [true, false, true]);
  }
});

test('generator fails closed on unsafe metadata, missing scenes and unreviewed numeric ranges', () => {
  for (const id of [undefined, 0, -1, '4', 1.5]) assert.throws(() => nativeBgmGraphSource({ id, name: 'BGM' }));
  assert.throws(() => nativeBgmGraphSource({ id: 1, name: '' }));
  const incomplete = structuredClone(loadNativeBgmConfig()); delete incomplete.cues.defeat;
  assert.throws(() => nativeBgmGraphSource({ id: 1, name: 'BGM', config: incomplete }));
  for (const patch of [{ volume: 101 }, { seconds: 0 }, { id: '10040' }, { loop: 'true' }]) {
    const config = structuredClone(loadNativeBgmConfig()); Object.assign(config.cues.map, patch);
    assert.throws(() => nativeBgmGraphSource({ id: 1, name: 'BGM', config }));
  }
});
