import { readFileSync, statSync, realpathSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { checkHostedSlice } from './check-pr-slice.mjs';
import { checkHostedUiReferences } from './check-ui-references.mjs';

const limits = {
  'AGENTS.md': { lines: 80, characters: 5000 },
  'CLAUDE.md': { lines: 16, characters: 1000 },
  '.cursor/rules/miliastra.mdc': { lines: 16, characters: 1000 },
};
const outside = path => path === '..' || path.startsWith('../') || path.startsWith('..\\') || isAbsolute(path);

function headingIds(source) {
  const ids = new Set();
  let fence;
  for (const line of source.split(/\r\n?|\n/)) {
    const [, marker, rest] = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line) ?? [];
    if (fence) {
      if (marker?.[0] === fence[0] && marker.length >= fence.length && /^[ \t]*$/.test(rest)) fence = undefined;
      continue;
    }
    if (marker && (marker[0] === '~' || !rest.includes('`'))) {
      fence = marker;
      continue;
    }
    const [, heading] = /^ {0,3}#{1,6}[ \t]+(.+?)(?:[ \t]+#+)?[ \t]*$/.exec(line) ?? [];
    if (heading === undefined) continue;
    const slug = heading.trim().toLowerCase().replace(/[^\p{L}\p{M}\p{N}_ \t-]/gu, '').replace(/[ \t]/g, '-');
    let id = slug;
    for (let suffix = 1; ids.has(id); suffix++) id = `${slug}-${suffix}`;
    ids.add(id);
  }
  return ids;
}

export function auditGuidance(root = '.') {
  root = realpathSync(root);
  const scripts = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')).scripts;
  const errors = [], metrics = [];
  for (const [file, limit] of Object.entries(limits)) {
    let source;
    try { source = readFileSync(resolve(root, file), 'utf8').replaceAll('\r\n', '\n'); }
    catch { errors.push(`${file}: missing guidance`); continue; }
    const lines = source.trimEnd().split('\n').length, characters = [...source].length;
    metrics.push({ file, lines, characters });
    if (lines > limit.lines || characters > limit.characters) errors.push(`${file}: budget exceeded (${lines}/${limit.lines} lines, ${characters}/${limit.characters} characters)`);
    let pointsToAgents = false;
    // Entry links use inline Markdown and plain ATX headings for local anchors.
    for (const [, raw] of source.matchAll(/\[[^\]\n]+\]\(([^)\n]+)\)/g)) {
      if (/^(?:https?:|mailto:|miliastra:|plugin:)/i.test(raw)) continue;
      try {
        const [path, anchor] = raw.split('#');
        const target = path ? resolve(root, dirname(file), decodeURIComponent(path)) : resolve(root, file);
        if (outside(relative(root, target)) || outside(relative(root, realpathSync(target))) || !statSync(target).isFile()) throw new Error('invalid');
        if (anchor && /\.mdc?$/i.test(target) && !headingIds(readFileSync(target, 'utf8')).has(decodeURIComponent(anchor))) {
          throw new Error('invalid heading');
        }
        if (relative(root, target) === 'AGENTS.md') pointsToAgents = true;
      } catch { errors.push(`${file}: invalid local link ${raw}`); }
    }
    for (const [, command] of source.matchAll(/\bnpm run ([\w:-]+)/g)) {
      if (!Object.hasOwn(scripts, command)) errors.push(`${file}: unknown npm script ${command}`);
    }
    if (file !== 'AGENTS.md') {
      if (!pointsToAgents) errors.push(`${file}: adapter must link AGENTS.md`);
      if (/^##\s/m.test(source)) errors.push(`${file}: adapter must not add policy sections`);
    }
  }
  return { errors, metrics };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const result = auditGuidance();
  console.log(JSON.stringify(result, null, 2));
  if (result.errors.length) process.exitCode = 1;
  else {
    try { checkHostedSlice(); checkHostedUiReferences(); }
    catch (error) { console.error(error.message); process.exitCode = 1; }
  }
}
