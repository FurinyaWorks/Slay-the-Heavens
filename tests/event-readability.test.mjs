import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {buildUI} from '../scripts/build-ui.mjs';
import {buildLuaData, luaString, toLua} from '../scripts/build-lua-data.mjs';
import {nativeAudioBuildArgs} from '../scripts/build-native-audio-game.mjs';
import {nativeTheme} from '../scripts/native-ui-theme.mjs';
import {runLua} from '../scripts/test-lua.mjs';
import {capacityProblems, textConflicts, visibleText} from './helpers/ui-readability.mjs';

const fixture = 'tests/lua/support/event_readability.lua';
const option = /^\/nodePanel\/eventView\/option\d+\/title$/;
const story = /^\/nodePanel\/eventView\/(?:name|body)$/;
const board = /^\/nodePanel\/pickerView\/(?:page|label|hint|matchRetry\/label)$/;
const role = path => option.test(path) || story.test(path) || board.test(path) ? 'readable' : null;
const frames = output => output.split(/\r?\n/).filter(line => line.startsWith('UI_READABILITY\t')).map(line => {
  const [, name, raw] = line.split('\t');
  return {name, ...JSON.parse(raw)};
});
const readable = nodes => visibleText(nodes).filter(node => role(node.path))
  .map(node => ({...node, text: node.text.replace(/<color=#[0-9a-f]{6}>|<\/color>/gi, '')}));
const capacity = nodes => capacityProblems(nodes, nativeTheme.layout.nativeText.lineHeight);

test('formal event options retain their complete live copy in allocated native text frames', t => {
  const directory = mkdtempSync(join(tmpdir(), 'abyss-event-readability-'));
  t.after(() => rmSync(directory, {recursive: true, force: true}));
  const {options} = nativeAudioBuildArgs(['source.gil']);
  assert.equal(options.officialAssets && options.nativePageLifecycle, true);
  buildLuaData('data', join(directory, 'abyss_data.lua'));
  buildUI(directory, undefined, options);
  const modules = readdirSync(directory).filter(name => name.endsWith('.lua')).map(name => name.slice(0, -4));
  const entry = join(directory, 'readability.lua');
  const loader = `
local generated = ${luaString(directory.replaceAll('\\', '/'))}
for _, name in ipairs(${toLua(modules)}) do
    package.preload[name] = assert(loadfile(generated .. '/' .. name .. '.lua'))
end
`;
  const exercise = `dofile(${luaString(fixture)})\n`;
  writeFileSync(entry, loader + exercise);
  const result = runLua(entry);
  assert.equal(result.status, 0, result.stderr);
  const completed = /^EVENT_READABILITY_PASS (\d+)$/m.exec(result.stdout);
  assert.ok(completed, 'official event sweep did not complete');
  const cases = frames(result.stdout);
  const matchStates = ['intro', 'rules', 'concealed', 'one-revealed', 'resolving', 'retry', 'cleanup', 'result'];
  assert.deepEqual(cases.filter(s => s.name.startsWith('match/')).map(s => s.name.slice(6)), matchStates);
  assert.equal(new Set(cases.filter(s => s.name.startsWith('event/')).map(s => s.name)).size, Number(completed[1]));
  assert.deepEqual(cases.filter(s => s.name.startsWith('boundary/')).map(s => s.name),
    ['boundary/lab-four-choices', 'boundary/lab-full-belt', 'boundary/trade-disabled']);
  const failures = cases.flatMap(({name, nodes, meta}) => {
    const relevant = readable(nodes);
    assert.equal(relevant.filter(node => option.test(node.path)).length, meta.options, `${name}: every visible option must expose a caption`);
    if (meta.options === 0) {
      assert.equal(relevant.filter(node => board.test(node.path)).length, name === 'match/retry' ? 4 : 3,
        `${name}: missing board title, attempts, hint or retry action`);
    }
    for (const {path, rect: [x, y, w, h]} of relevant) {
      assert.ok(Math.abs(x) + w / 2 <= 640 && Math.abs(y) + h / 2 <= 360,
        `${name}: ${path} exceeds the authored viewport`);
    }
    return [...capacity(relevant), ...textConflicts(relevant, role)].map(problem => `${name}: ${problem}`);
  });
  assert.equal(failures.length, 0, failures.join('\n'));

  const source = readFileSync('src/lua/abyss_node_ui_events.lua', 'utf8');
  const anchor = 'o.title[3], h - compactPadding';
  assert.equal(source.split(anchor).length, 2);
  const mutant = join(directory, 'event-mutant.lua');
  writeFileSync(mutant, source.replace(anchor,
    "o.title[3], rows[i].title:find('药水换遗物', 1, true) and 36 or h - compactPadding"));
  writeFileSync(entry, loader +
    `package.preload.abyss_node_ui_events = assert(loadfile(${luaString(mutant.replaceAll('\\', '/'))}))\n` + exercise);
  const omission = runLua(entry, {caseName: 'ordinary-event-caption'});
  assert.equal(omission.status, 0, omission.stderr);
  const [trade] = frames(omission.stdout);
  assert.equal(trade?.name, 'event/we_meet_again');
  assert.deepEqual(capacity(readable(trade.nodes)).map(problem => problem.split(':')[0]), ['/nodePanel/eventView/option1/title'],
    'a regular event option that skips the shared capacity rule must be detected');
});
