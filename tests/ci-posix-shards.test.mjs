import { originalWorkflow } from './helpers/ci-runtime-workflow.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import {historicalTest} from './helpers/historical-baseline-inputs.mjs';
import {qualityShardMatrices} from '../scripts/ci-quality-shape.mjs';

const workflow = readFileSync('.github/workflows/quality.yml', 'utf8').replaceAll('\r\n', '\n');
const job = (name,source=workflow) => (source + '\n  end-of-workflow:\n')
  .match(new RegExp(`^  ${name}:\\n([\\s\\S]*?)(?=^  [\\w-]+:)`, 'm'))?.[1];
const shards = job('engineering-posix-shards');
const aggregate = job('engineering-posix');
const shardCommand = 'node --test --test-concurrency=1 --test-shard=${{ matrix.shard }}/${{ strategy.job-total }} tests/*.test.mjs';
const setup = `    name: engineering-posix (\${{ matrix.shard }}/\${{ strategy.job-total }})
    # Separate hosted VMs keep generated files isolated and retain the original
    # 20-minute budget. Node partitions every JS file once, serially per VM.
    strategy:
      fail-fast: false
      matrix:
        shard: [1, 2, 3, 4]
`;

const lfsShardStep = `      - name: Materialize reviewed PNGs for this shard\n        timeout-minutes: 2\n        env:\n          CI_LFS_TOKEN: \${{ github.token }}\n        run: node scripts/ci-reviewed-lfs.mjs --shard=\${{ matrix.shard }}/\${{ strategy.job-total }}\n`;

historicalTest('POSIX shards preserve the original job gates, toolchain and 20-minute budget', () => {
  const shards=job('engineering-posix-shards',originalWorkflow(readFileSync('.github/workflows/quality.yml','utf8').replaceAll('\r\n','\n')));
  assert.ok(shards?.startsWith(setup));
  assert.match(shards, /^    runs-on: ubuntu-24\.04\n    timeout-minutes: 20\n/m);
  assert.doesNotMatch(shards, /^    if:|continue-on-error:|self-hosted/m);
  const commands = shards.match(/      - name: POSIX JavaScript regression shard\n        run: \|\n((?:          .+\n)+)/)?.[1]
    .trim().split('\n').map(line => line.trim());
  assert.deepEqual(commands, ['npm run build:data', 'npm run build:ui', shardCommand]);
  const originalTest = JSON.parse(readFileSync('package.json', 'utf8')).scripts.test.split(' && ');
  assert.deepEqual(commands.map(line => line.replace(' --test-shard=${{ matrix.shard }}/${{ strategy.job-total }}', '')), originalTest);
  // Exact inverse of only the partitioning changes: the job in Git c78c59b,
  // including setup, all engineering gates, artifact contents and deadlines.
  // Strip only the exact new step immediately before the unchanged shard command.
  assert.ok(shards.includes('      - run: npm run check:engineering\n        if: matrix.shard == 1\n'));
  assert.match(shards, /actions\/upload-artifact@[^\n]+\n        if: matrix.shard == 1\n/);
  const beforeLfs = shards.replace(lfsShardStep + '      - name: POSIX JavaScript regression shard\n', '      - name: POSIX JavaScript regression shard\n')
    .replace('      - run: npm run check:engineering\n        if: matrix.shard == 1\n', '      - run: npm run check:engineering\n')
    .replace(/(      - uses: actions\/upload-artifact@[^\n]+\n)        if: matrix.shard == 1\n/, '$1');
  const restored = '  engineering-posix:\n' + beforeLfs.replace(setup, '')
    .replace('      - name: POSIX JavaScript regression shard\n        run: |\n          npm run build:data\n          npm run build:ui\n          ' + shardCommand + '\n', '      - run: npm test\n')
    .replace('name: engineering-${{ github.run_id }}-${{ github.run_attempt }}-${{ matrix.shard }}', 'name: engineering-${{ github.run_id }}-${{ github.run_attempt }}');
  assert.equal(createHash('sha256').update(restored).digest('hex'), 'ce93ae9253a5b7ee3b7082dc977f5dc8b09e765afa23097e47804d6d42874254');
});

historicalTest('original required engineering-posix aggregate runs always and rejects missing, skipped and cancelled shards', () => {
  const aggregate=job('engineering-posix',originalWorkflow(readFileSync('.github/workflows/quality.yml','utf8').replaceAll('\r\n','\n')));
  assert.match(aggregate, /^    needs: engineering-posix-shards$/m);
  assert.match(aggregate, /^    if: always\(\)$/m);
  assert.doesNotMatch(aggregate, /continue-on-error:|\|\| true/);
  assert.match(aggregate, /^          ENGINEERING_RESULT: \$\{\{ needs.engineering-posix-shards.result \}\}$/m);
  const command = aggregate.match(/^        run: (.+)$/m)?.[1];
  assert.equal(command, 'test "$ENGINEERING_RESULT" = success');
  // Execute the exact production shell predicate, including an absent value.
  const shell = process.platform === 'win32' ? join(process.env.ProgramFiles, 'Git', 'bin', 'bash.exe') : '/bin/sh';
  for (const result of [undefined, '', 'skipped', 'cancelled', 'failure', 'timed_out', 'success']) {
    const env = { ...process.env };
    delete env.ENGINEERING_RESULT;
    if (result !== undefined) env.ENGINEERING_RESULT = result;
    const actual = spawnSync(shell, ['-c', command], { env, encoding: 'utf8', windowsHide: true, timeout: 30000 });
    assert.ifError(actual.error);
    assert.equal(actual.status === 0, result === 'success', `aggregate result ${String(result)}: ${actual.stderr}`);
  }
});

test('current POSIX matrix consumes fifteen shared shards with serial full regression and the authorized execution guard',()=>{
  assert.deepEqual(qualityShardMatrices.posix,[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]);
  assert.ok(shards.includes('shard: ${{ fromJSON(needs.impact.outputs.posix_shards) }}'));
  assert.match(shards,/^    needs: impact\n    if: \$\{\{ !cancelled\(\) && needs\.impact\.result == 'success' && needs\.impact\.outputs\.mode == 'full' \}\}$/m);
  assert.match(shards,/^    runs-on: ubuntu-24\.04\n    timeout-minutes: 30$/m);
  assert.match(shards,/^      fail-fast: false$/m);
  assert.match(shards,/^      max-parallel: 12$/m);
  assert.match(workflow,/^permissions:\n  contents: read$/m);
  assert.match(shards,/node-version: '24\.18\.0'/);
  assert.ok(shards.includes('Pillow==12.3.0'));
  assert.ok(shards.includes('npm run setup:lua-static'));
  assert.doesNotMatch(shards,/continue-on-error:|self-hosted|--test-name-pattern|--test-skip-pattern/);
  for(const command of ['node scripts/ci-shards.mjs --prepare=','node scripts/ci-shards.mjs --shard='])
    assert.ok(shards.includes(command+'${{ matrix.shard }}/${{ strategy.job-total }}'));
  assert.ok(shards.includes('          npm run build:data\n          npm run build:ui\n          node scripts/ci-shards.mjs --shard='));
  assert.ok(shards.includes('      - run: npm run check:engineering\n        if: matrix.shard == 1\n'));
  assert.ok(shards.includes('        if: always() && matrix.shard == 1\n'));
  assert.match(aggregate,/^    needs: \[impact, engineering-posix-shards, fast\]\n    if: \$\{\{ !cancelled\(\) && \(github\.event_name != 'pull_request' \|\| github\.event\.pull_request\.draft == false\) \}\}$/m);
});
