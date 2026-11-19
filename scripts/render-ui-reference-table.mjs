import { readFileSync, writeFileSync } from 'node:fs';
import { posix, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export function renderTable(rows) {
  const header = [
    '# UI 设计参考', '',
    '<!-- 由 docs/design/ui-references.json 生成。运行 node scripts/render-ui-reference-table.mjs。 -->', '',
    '从此表选择目标版本、代码组件和视觉状态。可点击图片打开原件。批准只涉及列出的设计范围，实施及官方设备验收见各任务和 UI 验收证据。', '',
    '| 目标版本 | 代码组件 · 视觉状态 | 设计修订 | 参考 | 设计状态 | Backlog | 取代修订 | 范围 |',
    '| --- | --- | --- | --- | --- | --- | --- | --- |',
  ];
  const link = path => posix.relative('docs/design', path).split('/').map(encodeURIComponent).join('/');
  const cell = value => value.replaceAll('|', '\\|').replace(/\r?\n/g, ' ');
  return [...header, ...rows.map(row => {
    const {codePath, state, targetVersion, revision, reference, status, backlogTask, supersedes, note, source} = row;
    const format = reference && /\.(png|gif|jpg|jpeg|webp|svg)$/i.test(reference.path) ? '打开图片' : '打开参考';
    const preview = reference ? `[${format}](${link(reference.path)})` : '待补';
    return '| ' + [targetVersion, `[${codePath}](${link(codePath)}) · \`${state}\``, revision,
      preview + (source ? ` · [来源](${source})` : ''), status, backlogTask, supersedes.join('、') || '—', note ?? '—']
      .map(cell).join(' | ') + ' |';
  }), ''].join('\n');
}

export const indexPath = 'docs/design/ui-references.json';
export const tablePath = 'docs/design/UI_REFERENCES.md';

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const { references } = JSON.parse(readFileSync(indexPath, 'utf8'));
  writeFileSync(tablePath, renderTable(references));
}
