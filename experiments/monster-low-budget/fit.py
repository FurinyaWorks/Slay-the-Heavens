"""Transparent-monster adapter for the existing contour/placement fitter.

Uses segment-lowpoly.regions/geometry unchanged; no face ROI or opaque base plate.
Outputs are experimental, never registered as production monster artwork.
"""
import argparse
import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess
import time

import numpy as np
from PIL import Image, ImageDraw
import shapely

ROOT = Path(__file__).resolve().parents[2]


def load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def run(source_root, output):
    output.mkdir(parents=True, exist_ok=True)
    fitter_path = ROOT / 'scripts/art/segment-lowpoly.py'
    placement_path = ROOT / 'scripts/art/native-triangle-placement.py'
    fitter = load('existing_contour_fitter', fitter_path)
    placement = load('existing_native_placement', placement_path)
    head = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip()
    receipt = {'schemaVersion': 1, 'scope': 'Offline fitting only; no official/native runtime/device acceptance',
               'sourceRoot': str(source_root.resolve()), 'toolBaseSha': head,
               'fitScriptSha256': digest(Path(__file__)),
               'fitterSha256': digest(fitter_path), 'placementSha256': digest(placement_path),
               'parameters': {'width': 256, 'colors': 16, 'alphaThreshold': 16,
                              'spatial': 6, 'colorRange': 24, 'minimumArea': 5}, 'samples': []}
    registry = json.loads((ROOT / 'data/presentation/native-monster-art.json').read_text(encoding='utf8'))
    inventory = []
    for asset_path in sorted((ROOT / 'art/monsters').glob('*/asset.json')):
        asset = json.loads(asset_path.read_text(encoding='utf8'))
        review_path = asset_path.with_name('source-review.json')
        review = json.loads(review_path.read_text(encoding='utf8')) if review_path.exists() else {}
        enemy = asset.get('enemy_id', asset_path.parent.name)
        binding = registry.get('bindings', {}).get(enemy)
        selected = registry.get('candidateAssets')
        inventory.append({'enemy': enemy, 'sourceRole': asset.get('assetRole'),
                          'sourceSha256': asset.get('files', {}).get('source.png', {}).get('sha256'),
                          'review': review.get('verdict', 'UNREVIEWED'), 'approvals': review.get('approvals', {}),
                          'configuredNativeBinding': binding,
                          'nativeBindingInCurrentCandidate': bool(binding and (selected is None or binding in selected))})
    (output / 'source-inventory.json').write_text(json.dumps({'toolBaseSha': head, 'sources': inventory}, indent=2) + '\n')
    for enemy in ['jaw_worm', 'hexaghost']:
        started = time.perf_counter()
        source = source_root / 'art/monsters' / enemy / 'source.png'
        pointer = subprocess.check_output(['git', 'show', f'{head}:art/monsters/{enemy}/source.png'],
                                          cwd=ROOT, text=True).splitlines()
        expected = next(line.split(':', 1)[1] for line in pointer if line.startswith('oid sha256:'))
        assert digest(source) == expected, 'Actual source must match the checked-out Git LFS oid'
        asset = json.loads((ROOT / 'art/monsters' / enemy / 'asset.json').read_text(encoding='utf8'))
        review = json.loads((ROOT / 'art/monsters' / enemy / 'source-review.json').read_text(encoding='utf8'))
        assert expected == asset['files']['source.png']['sha256'] == review['sourceSha256']
        assert review['verdict'] == 'PASS_SOURCE_CANDIDATE_ONLY', 'Rejected identities are not eligible'
        source_image = Image.open(source).convert('RGBA')
        image = source_image.resize((256, 256), Image.Resampling.LANCZOS)
        rgb = np.asarray(image.convert('RGB'))
        mask = (np.asarray(image)[:, :, 3] > 16).astype('uint8') * 255
        alpha_parts = fitter.regions(np.repeat(mask[:, :, None], 3, axis=2), 2,
                                     minimum_area=2, spatial=1, color_range=1)
        silhouette = shapely.union_all([poly for poly, colour in alpha_parts if sum(colour) > 384])
        parts = []
        for polygon, colour in fitter.regions(rgb, 16, minimum_area=5, spatial=6, color_range=24):
            for part in fitter.polygons(shapely.make_valid(polygon.intersection(silhouette))):
                if part.area >= 2:
                    parts.append((part, colour))
        sample = {'enemy': enemy, 'sourceSha256': expected, 'sourceSize': list(source_image.size),
                  'sourceRole': asset['assetRole'], 'sourceReview': review['verdict'],
                  'sourceApprovals': review['approvals'], 'regions': len(parts), 'budgets': []}
        target = output / enemy
        target.mkdir(exist_ok=True)
        source_image.resize((127, 127), Image.Resampling.LANCZOS).save(target / 'reference-127.png')
        def choose(region_parts, allowance):
            lo, hi = .08, 400.0
            for _ in range(17):
                mid = (lo + hi) / 2
                shapes = fitter.geometry(region_parts, mid, 256, 256, placement.place, keep_holes=True)
                if sum(shape['cost'] for shape in shapes) > allowance:
                    lo = mid
                else:
                    hi = mid
            return fitter.geometry(region_parts, hi, 256, 256, placement.place, keep_holes=True), hi
        # The illustration fitter uses a full-canvas base. Here the base is the
        # same-source alpha silhouette, preserving the ring hole and clear gaps.
        base_colour = np.median(rgb[mask > 0], axis=0).astype(int).tolist()
        base_parts = [(poly, base_colour) for poly in fitter.polygons(silhouette)]
        for budget in [100, 200, 400]:
            base_shapes, base_epsilon = choose(base_parts, round(budget * .25))
            base_cost = sum(shape['cost'] for shape in base_shapes)
            shapes, hi = choose(parts, budget - base_cost)
            shapes = base_shapes + shapes
            count = sum(shape.pop('cost') for shape in shapes)
            assert 0 < count <= budget
            pack = {'schemaVersion': 1, 'enemy': enemy, 'sourceSha256': expected,
                    'width': 256, 'height': 256, 'budget': budget, 'nativeImages': count,
                    'epsilon': hi, 'silhouetteEpsilon': base_epsilon,
                    'silhouetteImages': base_cost, 'shapes': shapes, 'opaqueBackground': False,
                    'sourceAlphaThreshold': 16, 'fitterSha256': receipt['fitterSha256'],
                    'placementSha256': receipt['placementSha256']}
            (target / f'budget-{budget}.json').write_text(json.dumps(pack, separators=(',', ':')) + '\n')
            # Geometric preview is only an intermediate; actual SDK rendering is separate.
            preview = Image.new('RGBA', (256, 256))
            draw = ImageDraw.Draw(preview)
            for shape in shapes:
                if shape['type'] == 'rect':
                    x, y, w, h = shape['box']
                    draw.rectangle((x, y, x + w, y + h), fill=shape['colour'])
                else:
                    draw.polygon([tuple(point) for point in shape['points']], fill=shape['colour'])
            preview.resize((127, 127), Image.Resampling.LANCZOS).save(target / f'geometry-{budget}-127.png')
            preview.save(target / f'geometry-{budget}-256.png')
            sample['budgets'].append({'budget': budget, 'nativeImages': count,
                                      'shapes': len(shapes), 'epsilon': hi})
            print(json.dumps({'enemy': enemy, **sample['budgets'][-1]}), flush=True)
        sample['fitSeconds'] = time.perf_counter() - started
        receipt['samples'].append(sample)
    (output / 'fit-receipt.json').write_text(json.dumps(receipt, indent=2) + '\n')
    return receipt


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--source-root', type=Path, required=True)
    parser.add_argument('--output', type=Path, default=ROOT / 'build/monster-low-budget')
    args = parser.parse_args()
    run(args.source_root, args.output)
