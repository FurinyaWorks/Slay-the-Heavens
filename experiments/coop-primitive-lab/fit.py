"""Fit the same battle figure at three exact source-geometry counts."""
import hashlib
import importlib.util
import json
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw
import shapely


def load_tool(name):
    path = Path(__file__).resolve().parents[2] / 'scripts' / 'art' / (name + '.py')
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def fit(source, output):
    fitter = load_tool('segment-lowpoly')
    placement = load_tool('native-triangle-placement')
    image = Image.open(source).convert('RGBA')
    matte = '#182433'
    bounds = image.getbbox(alpha_only=True)
    crop = image.crop(bounds)
    image = Image.alpha_composite(Image.new('RGBA', crop.size, matte), crop).convert('RGB')
    width = 266
    height = round(image.height * width / image.width)
    reference = image.resize((width, height), Image.Resampling.LANCZOS)
    reference_rgb = np.asarray(reference, dtype='float32')
    foreground = np.asarray(crop.getchannel('A').resize(reference.size, Image.Resampling.LANCZOS)) >= 128
    params = dict(colors=12, minimum_area=3, spatial=5, color_range=18)
    parts = fitter.regions(np.asarray(reference), **params)
    output.mkdir(parents=True, exist_ok=False)
    reference.save(output / 'reference.png')
    common = dict(sourceSha256=hashlib.sha256(source.read_bytes()).hexdigest(),
                  width=width, height=height, matte=matte, sourceCrop=bounds, segmentation=params,
                  fitterSha256=hashlib.sha256(Path(fitter.__file__).read_bytes()).hexdigest(),
                  placementSha256=hashlib.sha256(Path(placement.__file__).read_bytes()).hexdigest(),
                  versions=dict(opencv=cv2.__version__, shapely=shapely.__version__,
                                numpy=np.__version__, pillow=Image.__version__))
    for budget in (300, 400, 600):
        # Reserve one fill for the matte. The existing fitter emits geometry
        # in descending region-area order. Trim the smallest tail if a
        # simplification step jumps over the exact requested count.
        lower, upper = .08, 400.
        shapes = fitter.geometry(parts, lower, width, height, placement.place)
        assert len(shapes) >= budget - 1, 'Source lacks enough fitted geometry'
        for _ in range(17):
            epsilon = (lower + upper) / 2
            candidate = fitter.geometry(parts, epsilon, width, height, placement.place)
            if len(candidate) >= budget - 1:
                lower, shapes = epsilon, candidate
            else:
                upper = epsilon
        retained = shapes[:budget - 1]
        retained.insert(0, dict(type='rect', box=[0, 0, width, height], colour=matte, cost=1))
        preview = Image.new('RGB', reference.size, matte)
        draw = ImageDraw.Draw(preview)
        for shape in retained:
            if shape['type'] == 'rect':
                x, y, w, h = shape['box']
                draw.rectangle((x, y, x + w, y + h), fill=shape['colour'])
            else:
                draw.polygon([tuple(point) for point in shape['points']], fill=shape['colour'])
        preview.save(output / f'geometry-{budget}.png')
        error = np.abs(np.asarray(preview, dtype='float32') - reference_rgb)
        pack = dict(**common, budget=budget, epsilon=lower, trimmed=len(shapes) - budget + 1,
                    nativeImages=sum(shape['cost'] for shape in retained),
                    rgbMeanAbsoluteError=float(error.mean()), foregroundRgbMeanAbsoluteError=float(error[foreground].mean()),
                    shapes=retained)
        (output / f'fit-{budget}.json').write_text(json.dumps(pack) + '\n', encoding='utf8')


if __name__ == '__main__':
    fit(Path(sys.argv[1]), Path(sys.argv[2]))
