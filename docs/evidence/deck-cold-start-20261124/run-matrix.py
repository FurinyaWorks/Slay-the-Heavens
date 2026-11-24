"""Run paired source-only measurements from two worktrees using frozen baseline fixtures."""
import argparse
import collections
import csv
import math
import os
import subprocess
import sys
from pathlib import Path

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('baseline', type=Path, help='baseline checkout with fixture')
parser.add_argument('candidate', type=Path, help='checkout or snapshot containing src/lua')
parser.add_argument('baseline_generated', type=Path, help='baseline native-page Lua generation')
parser.add_argument('candidate_generated', type=Path, help='candidate native-page Lua generation')
parser.add_argument('--sessions', type=int, default=6)
parser.add_argument('--samples', type=int, default=6, help='fresh Hosts per arm and session')
parser.add_argument('--out', type=Path, required=True)
args = parser.parse_args()
probe = Path(__file__).resolve().with_name('probe.lua')
fields, resource_fields = [], []
samples, resources = [], []

def measure(arm, scenario, amount, session, count, synthetic_clock=0, cycles=0):
    source = (getattr(args, arm) / 'src/lua').resolve()
    run = subprocess.run(
        ['luatex', '--luaonly', str(probe)], cwd=args.baseline,
        env=dict(os.environ, DECK_GENERATED=str(getattr(args, arm+'_generated').resolve()), DECK_SOURCE=str(source),
                 DECK_AMOUNT=str(amount), DECK_SAMPLES=str(count),
                 DECK_SYNTHETIC_CLOCK=str(synthetic_clock), DECK_CYCLES=str(cycles)),
        text=True, capture_output=True)
    if run.returncode:
        raise RuntimeError(run.stdout + run.stderr)
    for line in run.stdout.splitlines():
        kind, *values = line.split('\t')
        if kind == 'FIELDS':
            fields[:] = values
        elif kind == 'RESOURCE_FIELDS':
            resource_fields[:] = values
        elif kind == 'ROW' and scenario != 'resource':
            data = dict(zip(fields, values, strict=True))
            assert data['progressive'] == ('true' if arm == 'candidate' else 'false')
            samples.append(dict(arm=arm, scenario=scenario, session=session, **data))
        elif kind == 'RESOURCE' and scenario == 'resource':
            resources.append(dict(arm=arm, **dict(zip(resource_fields, values, strict=True))))

def tsv(path, rows):
    with path.open('w') as stream:
        writer = csv.DictWriter(stream, fieldnames=list(rows[0]), delimiter='\t', lineterminator='\n')
        writer.writeheader()
        writer.writerows(rows)

for session in range(1, args.sessions+1):
    arms = ('baseline','candidate') if session % 2 else ('candidate','baseline')
    for scenario, amount, clock in [('normal', 10, 0), ('normal', 75, 0), ('budget-stress', 75, .0021)]:
        for arm in arms:
            measure(arm, scenario, amount, session, 1 if clock else args.samples, clock)
    print(f'session {session} complete', file=sys.stderr, flush=True)
for arm in ('baseline','candidate'):
    measure(arm, 'resource', 75, 0, 1, cycles=20)
args.out.mkdir(parents=True, exist_ok=True)
tsv(args.out/'timing.tsv', samples)
tsv(args.out/'resource.tsv', resources)

groups = collections.defaultdict(list)
for sample in samples:
    groups[(sample['scenario'], sample['amount'], sample['phase'], sample['arm'])].append(sample)

def statistics(values):
    values = sorted(map(float, values))
    return '/'.join(f'{values[math.ceil(q*len(values))-1]:.3f}' for q in (.5,.95,1))

metrics = ['callback_ms', 'shell_frame', 'uncovered_frame', 'first_complete_frame', 'ready_frame',
           'first_complete_cpu_ms', 'ready_cpu_ms', 'peak_update_ms', 'veil_frames', 'hint_frames']
print('\t'.join(['mode','amount','phase','arm','n',*metrics]))
for group, rows in sorted(groups.items()):
    print('\t'.join([*group, str(len(rows)), *(statistics(row[k] for row in rows) for k in metrics)]))
