import { readdirSync, readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import lua from 'luaparse';

// Project policy for Release copy. The platform's filter is undisclosed.
const rules = [
  ['controlled substances', /激素|注射诱变剂|诱变剂|瘾君子|吸毒|毒品|贩毒|滥用药物|\b(?:recreational drug|illegal drug|anabolic steroid)s?\b/giu],
  ['gambling presentation', /赌博|赌徒|赌酿|赌局|赌注|赌场|下注|投注|押注|\b(?:place (?:a |your )?bet|sports betting|gambling den)\b/giu],
  ['trafficking', /奴隶贩子|奴隶买卖|贩卖人口|\b(?:slave trader|human trafficker)s?\b/giu],
  ['self-harm', /自杀|自残|割腕|服药自尽|\b(?:commit suicide|suicide attempt|self[- ]harm)\b/giu],
  ['graphic or coercive ritual imagery', /邪教|血祭|献祭|献血|掘尸|肢解|虐杀|\b(?:blood sacrifice|human sacrifice|dig up (?:a |the )?corpse)\b/giu],
  ['sexual or extremist content', /色情交易|强奸|儿童色情|恐怖主义宣扬|\b(?:child pornography|sexual assault|terrorist recruitment)\b/giu],
];

// Existing technical identities are useful leads for an official retest.
const technical = /suicid\w*|gambling[ _-]?chip|colosseum[ _-]?slavers|shed_blood/giu;
const retiredIdentities = [
  ['retired client identity', /drug[ _-]?dealer|cultist[ _-]?(?:mask|potion)|(?<![\p{L}\p{N}])addict(?![\p{L}\p{N}])/giu],
  ['retired client identity', /(?<=[a-z0-9])Addict(?![a-z0-9])/gu],
];
// The upstream potion oracle and historical CI timings are never shipped.
const identityReferences = new Set([
  'data/catalogs/sts1-ironclad-potions.json',
  'scripts/ci-test-timings.json',
  'tools/oracles/sts1_potion_pool.py',
]);
const textFile = /\.(?:lua|json|[cm]?js|ts|py|ya?ml|toml|ini|txt|csv|tsv|xml|svg|html|ps1)$/i;

function lineOffsets(source) {
  const offsets = [0];
  for (let at = source.indexOf('\n'); at !== -1; at = source.indexOf('\n', at + 1)) offsets.push(at + 1);
  return offsets;
}

function position(offsets, index) {
  let start = 0, end = offsets.length;
  while (start + 1 < end) {
    const middle = Math.floor((start + end) / 2);
    if (offsets[middle] <= index) start = middle;
    else end = middle;
  }
  return { line: start + 1, column: index - offsets[start] + 1 };
}

export function inspectReleaseText(path, source, { decodeLua = false, advisories = false, namesOnly = false } = {}) {
  const offsets = lineOffsets(source);
  const hits = [];
  const selected = [
    ...(namesOnly ? [] : rules),
    ...(identityReferences.has(path) ? [] : retiredIdentities),
    ...(advisories ? [['technical identity', technical]] : []),
  ];
  for (const [reason, pattern] of selected) {
    for (const match of source.matchAll(pattern)) {
      hits.push({ path, ...position(offsets, match.index), text: match[0], reason, decoded: false });
    }
  }
  if (!decodeLua || !source.includes('\\')) return hits;

  // Lua string escapes are already part of the normal JSON-to-Lua generator.
  // Inspect the literal value as UTF-8 without executing a client script.
  const bytes = Buffer.from(source).toString('latin1');
  const parser = lua.parse(bytes, { luaVersion: '5.3', encodingMode: 'pseudo-latin1', wait: true });
  let previousByte = 0, previousIndex = 0;
  for (let token = parser.lex(); token.type !== lua.tokenTypes.EOF; token = parser.lex()) {
    if (token.type !== lua.tokenTypes.StringLiteral) continue;
    const raw = bytes.slice(...token.range);
    if (!raw.includes('\\')) continue;
    const value = Buffer.from(token.value, 'latin1').toString('utf8');
    const rawText = Buffer.from(raw, 'latin1').toString('utf8');
    previousIndex += Buffer.from(bytes.slice(previousByte, token.range[0]), 'latin1').toString('utf8').length;
    previousByte = token.range[0];
    for (const [reason, pattern] of selected) {
      for (const match of value.matchAll(pattern)) {
        if (rawText.includes(match[0])) continue;
        hits.push({ path, ...position(offsets, previousIndex), text: match[0], reason, decoded: true });
      }
    }
  }
  return hits;
}

function assertClean(entries, options) {
  const hits = entries.flatMap(([path, source, names = []]) => [
    ...inspectReleaseText(path, source, options),
    ...names.flatMap(([label, name]) => inspectReleaseText(`${path} (${label})`, name, {namesOnly: true})),
  ]);
  const format = ({path, line, column, text, reason, decoded}) =>
    `${path}:${line}:${column}: ${reason}: ${JSON.stringify(text)}${decoded ? ' (decoded Lua literal)' : ''}`;
  const blocked = hits.filter(hit => hit.reason !== 'technical identity');
  const advisories = hits.filter(hit => hit.reason === 'technical identity');
  for (const hit of advisories) console.log(format(hit));
  if (blocked.length) throw new Error(`Release text check failed (${blocked.length}):\n${blocked.map(format).join('\n')}`);
  return { files: entries.length };
}

export function assertClientScriptText(scripts, location, options) {
  return assertClean(scripts.map(({ name, file, source }) => {
    if (typeof source !== 'string') throw new Error(`Missing Lua source: ${location}/${name}.lua`);
    const names = [['module name', name]];
    if (typeof file === 'string' && file !== `${name}.lua`) names.push(['serialized filename', file]);
    return [`${location}/${name}.lua`, source, names];
  }), { ...options, decodeLua: true });
}

function sourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return entry.name === 'vendor' ? [] : sourceFiles(path);
    return entry.isFile() && textFile.test(entry.name) ? [path] : [];
  });
}

export async function checkReleaseText({ root = process.cwd(), generated, advisories = false } = {}) {
  const paths = ['src', 'data', 'config', 'scripts', '.github', 'art', 'schemas', 'tools']
    .flatMap(name => sourceFiles(resolve(root, name)))
    .sort()
    .map(path => [relative(root, path).replaceAll('\\', '/'), path])
    // The project rule definitions, historical card inventory and authoring
    // prompts are audit references, not input to the client build.
    .filter(([path]) => path !== 'scripts/check-release-text.mjs'
      && path !== 'data/reference/warrior75.json' && !/^art\/.*\/prompt\.txt$/.test(path));
  const source = assertClean(paths.map(([path, file]) => [
    path,
    readFileSync(file, 'utf8'),
    identityReferences.has(path) ? [] : [['path', path]],
  ]), { advisories });
  console.log(`Release text: ${source.files} source files checked.`);
  if (!generated) return;

  const { candidateScriptFiles } = await import('./native-candidate-scripts.mjs');
  const modules = candidateScriptFiles(resolve(root, 'src/lua'), resolve(root, generated)).map(({ name, sourceFile }) =>
    ({ name, source: readFileSync(sourceFile, 'utf8').replace(/^\uFEFF/, '') }));
  assertClientScriptText(modules, 'generated-inputs', { advisories });
  console.log(`Release text: ${modules.length} Lua modules checked before candidate write.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const args = process.argv.slice(2);
  if (args.some(arg => arg !== '--advisories' && !arg.startsWith('--generated='))) {
    console.error('Usage: node scripts/check-release-text.mjs [--generated=build/lua] [--advisories]');
    process.exitCode = 1;
  } else {
    try {
      await checkReleaseText({ generated: args.find(arg => arg.startsWith('--generated='))?.slice(12), advisories: args.includes('--advisories') });
    } catch (error) {
      console.error(error.message);
      process.exitCode = 1;
    }
  }
}
