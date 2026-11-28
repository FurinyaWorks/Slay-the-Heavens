"""Regenerate approved native Boss map rows from the editable 96px geometry master."""
import argparse
import json
import runpy
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
MASTER = HERE / 'map-boss-ink-source.json'
OUTPUT = HERE.parents[1] / 'data/presentation/map-boss-ink.json'
SOLVE = runpy.run_path(str(HERE / 'native-triangle-placement.py'))['solve']
SCALE = 1.46
CAP = 20


def legal_pose(points):
    for i in range(3):
        a, b, c = (points[(i + j) % 3] for j in range(3))
        p = SOLVE(a, b, c) or SOLVE(a, c, b)
        if p:
            return p
    return None


def fit_pose(points, index):
    p = legal_pose(points)
    if p:
        return p
    # The approved master uses the nearest verified legal single-axis pose for
    # facets that the platform cannot represent verbatim with one triangle.
    rng = np.random.default_rng(104323 + index)
    best = None
    for delta in (.2, .5, 1, 2, 3, 4, 6):
        for drift in rng.normal(0, delta, (160, 3, 2)):
            points2 = points + drift
            for i in range(3):
                a, b, c = (points2[(i + j) % 3] for j in range(3))
                p = SOLVE(a, b, c) or SOLVE(a, c, b)
                if p and max(p['w'], p['h']) < 115:
                    cost = float((drift ** 2).sum()) + .001 * (p['rx'] + p['ry'])
                    if best is None or cost < best[0]:
                        best = (cost, p)
        if best and best[0] < delta ** 2 * 1.1:
            break
    if not best:
        raise ValueError('no legal fit within the design search envelope')
    return best[1]


def rounded(value):
    # Match JavaScript Math.round, including half ties toward +infinity.
    return float(np.floor(value * 100 + .5) / 100)


def row(shape, index):
    col = shape['c']
    if 'tri' in shape:
        points = np.array(shape['tri'], dtype=float)
        points[:, 1] = 96 - points[:, 1]
        p = fit_pose(points, index)
        image, x, y = 100003, p['cx'] - 48, p['cy'] - 48
        w, h, rx, ry, rz = [p[k] for k in ('w', 'h', 'rx', 'ry', 'rz')]
    else:
        ellipse = 'ell' in shape
        if ellipse:
            x, y, w, h, rotation = shape['ell']
        else:
            x, y, w, h = shape['rect']
            rotation = 0
        image, x, y = (100002 if ellipse else 100001), x - 48, 48 - y
        rx, ry, rz = 0, 0, -rotation
    return [image, col, *map(rounded, (x*SCALE, y*SCALE, w*SCALE, h*SCALE, rx, ry, rz))]


def main():
    args = argparse.ArgumentParser()
    args.add_argument('--write', action='store_true', help='replace the generated production JSON')
    options = args.parse_args()
    source = json.loads(MASTER.read_text())
    variants = {name: [row(s, i) for i, s in enumerate(shapes)] for name, shapes in source.items()}
    if any(not rows or len(rows) > CAP for rows in variants.values()):
        raise ValueError('native Boss shape budget exceeded')
    result = dict(schemaVersion=1, cap=CAP, size=140.16, palette=[[35,50,55],[217,196,156]], variants=variants)
    if not options.write:
        if json.loads(OUTPUT.read_text()) != result:
            raise SystemExit('Boss map geometry differs from the committed 20-slot production data')
        print('BOSS_MAP_INK_MASTER_MATCH: all six approved fits')
        return
    header = json.dumps(result, indent=2).split('  "variants":')[0]
    rows = ['    '+json.dumps(name)+': [\n'+',\n'.join('      '+json.dumps(r,separators=(',',':')) for r in cells)+'\n    ]'
            for name,cells in variants.items()]
    OUTPUT.write_text(header+'  "variants": {\n'+',\n'.join(rows)+'\n  }\n}\n')


if __name__ == '__main__':
    main()
