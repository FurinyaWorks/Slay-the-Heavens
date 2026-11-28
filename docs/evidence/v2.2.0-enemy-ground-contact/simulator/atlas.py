"""Compose lossless sheets from Beyond Simulator PNGs and verify the source inventory."""
import argparse
import hashlib
import json
import subprocess
from collections import Counter
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

BASE = '5ccff59e9df396849216fb3f790be8852974c769'
DARK = '#172024'
INK = '#F2F0EA'
MUTED = '#A8B4BC'
FOCUS = [
    ('act1-formations', ['double-red-louse', 'mixed-louse', 'gremlin-gang', 'small-slimes']),
    ('act2-summons', ['collector-before-summon', 'collector-summon', 'automaton-summon', 'leader-wizard-summon']),
    ('act2-byrd', ['byrd-01-flight', 'byrd-02-knockdown', 'byrd-03-headbutt-ready', 'byrd-04-relift']),
    ('priority-louse-collector', ['double-red-louse', 'collector-summon']),
]


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def read(path):
    return json.loads(path.read_text())


def load_receipts(root, group, expected):
    directory = root / group
    rows = read(directory / 'receipts.json')
    assert len(rows) == expected
    for row in rows:
        png = directory / (row['name'] + '.png')
        assert row['capture']['assetWarnings'] == []
        assert (row['capture']['pixelWidth'], row['capture']['pixelHeight']) == (1600, 900)
        variant = row['backgroundVariant']
        if variant == 3:
            assert row['encounterId'] == 'act2_collector' and row['act'] == 2 and row['floor'] == 33
            assert row['backgroundSlots'] == 249
        else:
            assert variant == row['act'] and row['backgroundSlots'] == {1: 229, 2: 249}[variant]
        assert digest(png) == row['sha256']
        row['path'] = png
    indexed = {row['name']: row for row in rows}
    assert len(indexed) == expected
    return indexed


def caption(draw, text, xy, font, fill=INK):
    draw.text(xy, text, fill=fill, font=font)


def focus(root, before, after, font, small):
    assert set(before) == set(after) == {name for _, names in FOCUS for name in names}
    outputs = []
    for file, names in FOCUS:
        width, height = (1056, 594) if file == 'priority-louse-collector' else (832, 468)
        tile_height = height + 35
        atlas = Image.new('RGB', (width * 2 + 22, tile_height * len(names) + 53), DARK)
        draw = ImageDraw.Draw(atlas)
        caption(draw, 'v2.2.0 BASE', (12, 13), font)
        caption(draw, 'v2.2.0 HOTFIX', (width + 16, 13), font)
        for row, name in enumerate(names):
            y = 44 + tile_height * row
            caption(draw, name, (12, y), small, MUTED)
            caption(draw, name, (width + 16, y), small, MUTED)
            for x, side in [(12, before), (width + 16, after)]:
                source = Image.open(side[name]['path']).convert('RGB')
                atlas.paste(source.resize((width, height), Image.Resampling.LANCZOS), (x, y + 25))
        path = root / (file + '.webp')
        atlas.save(path, lossless=True)
        outputs.append({'file': path.name, 'sha256': digest(path), 'scenes': names})
    return outputs


def crop_box(name, old, new):
    enemy_id = name.removeprefix('monster-')
    actor = next(e for e in new['enemies'] if e['id'] == enemy_id)
    old_actor = next(e for e in old['enemies'] if e['id'] == enemy_id)
    center = 800 + actor['x'] * 1.25
    left = max(0, min(1600 - 332, round(center - 166)))
    top = max(55, min(168, round(450 - 1.25 * max(actor['y'] + actor['intentY'],
                                                   old_actor['y'] + old_actor['intentY']) - 45)))
    return (left, top, left + 332, 640)


def gallery(root, before, after, font, small):
    assert set(before) == set(after)
    assert len({name.removeprefix('monster-') for name in before}) == 42
    classes = Counter()
    for name, row in after.items():
        target = next(e for e in row['enemies'] if e['id'] == name.removeprefix('monster-'))
        classes[target['classification']] += 1
    assert classes == {'grounded': 35, 'hovering': 5, 'flight': 1, 'perched': 1}

    names = list(after)
    assert sum(after[name]['act'] == 1 for name in names) == 25
    groups = [names[start:start+6] for start in range(0, len(names), 6)]
    outputs = []
    for number, group in enumerate(groups, 1):
        # Preserve source pixels at 1:1. Each adjacent pair uses the same source crop window.
        crop_width, tile_width, tile_height = 332, 678, 630
        rows = (len(group) + 1) // 2
        atlas = Image.new('RGB', (tile_width * 2 + 20, tile_height * rows + 16), DARK)
        draw = ImageDraw.Draw(atlas)
        for index, name in enumerate(group):
            x, y = (index % 2) * tile_width + 10, (index // 2) * tile_height + 7
            actor = next(e for e in after[name]['enemies'] if e['id'] == name.removeprefix('monster-'))
            title = f"{actor['id']}   /   {actor['classification']}"
            caption(draw, title, (x, y), font)
            caption(draw, 'BASE', (x, y + 27), small, MUTED)
            caption(draw, 'HOTFIX', (x + crop_width + 5, y + 27), small, MUTED)
            window = crop_box(name, before[name], after[name])
            for offset, side in [(0, before), (crop_width + 5, after)]:
                source = Image.open(side[name]['path']).convert('RGB')
                atlas.paste(source.crop(window), (x + offset, y + 49))
        path = root / f'official-monsters-{number:02}.webp'
        atlas.save(path, lossless=True)
        outputs.append({'file': path.name, 'sha256': digest(path), 'scenes': group})
    return outputs, dict(classes)


def relative_receipts(mapping):
    return [{k: v for k, v in row.items() if k != 'path'} for row in mapping.values()]


def generated_hashes(source):
    return {path.name: digest(path) for path in sorted((source / 'lua').glob('*.lua'))}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('before', type=Path)
    parser.add_argument('after', type=Path)
    parser.add_argument('output', type=Path)
    parser.add_argument('--focus-only', action='store_true')
    parser.add_argument('--repo', type=Path, default=Path.cwd())
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    font = ImageFont.truetype('DejaVuSans.ttf', 22)
    small = ImageFont.truetype('DejaVuSans.ttf', 17)
    old_focus, new_focus = [load_receipts(p, 'png', 12) for p in (args.before, args.after)]
    images = focus(args.output, old_focus, new_focus, font, small)
    if args.focus_only:
        return
    old_gallery, new_gallery = [load_receipts(p, 'gallery', 42) for p in (args.before, args.after)]
    gallery_images, classes = gallery(args.output, old_gallery, new_gallery, font, small)
    old_scenes, new_scenes = {**old_focus, **old_gallery}, {**new_focus, **new_gallery}
    collectors = {name for name, row in new_scenes.items() if row['backgroundVariant'] == 3}
    assert collectors == {'monster-collector', 'collector-before-summon', 'collector-summon'}
    for name in collectors:
        old, new = old_scenes[name], new_scenes[name]
        assert old['backgroundVariant'] == 2 and old['sha256'] != new['sha256']
        old_boss = next(actor for actor in old['enemies'] if actor['id'] == 'collector')
        new_boss = next(actor for actor in new['enemies'] if actor['id'] == 'collector')
        for field in ('x', 'y', 'portrait', 'hpY', 'hitY', 'hitHeight', 'hitWidth', 'intentY'):
            assert old_boss[field] == new_boss[field], (name, field)

    script_dir = Path(__file__).parent
    hashed_inputs = [
        'scripts/v220-chapter-battle-scenes.mjs',
        'scripts/v220-battle-scene-geometry.mjs',
        'src/lua/abyss_game_ui_view.lua',
        'src/lua/abyss_battle_enemy_view.lua',
        'src/lua/abyss_battle_unit_view.lua',
        'src/lua/abyss_byrd_ground_trial.lua',
        'src/lua/abyss_chapter_battle_scene.lua',
        'data/release/refined-monster-art.json',
    ]
    report = {
        'baselineCommit': BASE,
        'candidateCommit': subprocess.check_output(['git','-C',str(args.repo),'rev-parse','HEAD'], text=True).strip(),
        'candidateSourceSha256': {path: digest(args.repo / path) for path in hashed_inputs},
        'tool': 'beyond-simulator-mcp@0.5.2',
        'scope': 'Production Lua battle state and controls run under the Fengari native UI fixture. Beyond Simulator Host renders each captured production control snapshot at 1600x900. Simulator screenshots play static snapshots. No official GIL, device, or direct click evidence from the Simulator Host.',
        'display': '16:9, identical 1280x720 logical viewport and 1.25x scale. Atlas crop and lossless WebP only; focus sheets additionally rescale for side-by-side display.',
        'generatedLuaSha256': {'before': generated_hashes(args.before), 'after': generated_hashes(args.after)},
        'captureInputsSha256': {name: digest(script_dir / name) for name in ('capture.lua','render.mjs','atlas.py')},
        'coverage': {'officialMonsters': 42, 'capturePairs': 54, 'classes': classes},
        'pixelEquivalentPairs': [
            name for name, row in old_scenes.items() if row['sha256'] == new_scenes[name]['sha256']
        ],
        'pairedAtlasFiles': images + gallery_images,
        'before': relative_receipts({**old_focus, **old_gallery}),
        'after': relative_receipts({**new_focus, **new_gallery}),
    }
    (args.output/'simulator-manifest.json').write_text(json.dumps(report, indent=2)+'\n')
    print(json.dumps(report['coverage']))


if __name__ == '__main__':
    main()
