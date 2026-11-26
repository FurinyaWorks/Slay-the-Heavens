"""Save matched pixel views of the game's offline projected canvas."""
import json
import sys
from pathlib import Path
from PIL import Image, ImageDraw

# Reuse the checked-in projection at the same source path in both worktrees.
original = Path(sys.argv[1])
scene_file, layout_file, output = map(Path, sys.argv[2:])
source, _ = original.read_text().split('\noutput = Path(sys.argv[1])', maxsplit=1)
namespace = {}
exec(compile(source, str(original), 'exec'), namespace)
draw_text_native = namespace['draw_text']
stage_width, stage_height, supersampling = (namespace[k] for k in ('WIDTH','HEIGHT','SCALE'))

def draw_text_scaled(draw, node, pose, style):
    a, b, c, d, _, _ = pose
    # The original projection reports geometry and draws unscaled labels.
    # Preserve the transformed glyph box for the audited button label only.
    if node['name'] != 'label' or abs(a - d) < 1e-6 or abs(b) > 1e-6 or abs(c) > 1e-6 or a <= 0 or d <= 0:
        return draw_text_native(draw, node, pose, style)
    template = Image.new('RGBA', (stage_width * supersampling, stage_height * supersampling))
    identity = (1, 0, 0, 1, 0, 0)
    draw_text_native(ImageDraw.Draw(template), node, identity, style)
    bounds = template.getbbox()
    if bounds is None:
        return
    glyphs = template.crop(bounds)
    glyphs = glyphs.resize((max(1, round(glyphs.width * a)), max(1, round(glyphs.height * d))), Image.Resampling.LANCZOS)
    raw_anchor_x, raw_anchor_y = namespace['project'](identity)
    anchor_x, anchor_y = namespace['project'](pose)
    x = round(anchor_x + (bounds[0] - raw_anchor_x) * a)
    y = round(anchor_y + (bounds[1] - raw_anchor_y) * d)
    draw._image.paste(glyphs, (x, y), glyphs)

namespace['draw_text'] = draw_text_scaled
scene = json.loads(scene_file.read_text())
layout = json.loads(layout_file.read_text())
stage = next(node for node in layout['controls'] if node['name'] == 'stage')
output.mkdir(parents=True, exist_ok=True)
namespace['render'](scene, output, stage)
stage_raster = output / 'runtime-abandon.png'
with Image.open(stage_raster) as base:
    for device, (w, h) in {'16x9': (1280, 720), 'iphone14pro-landscape': (2556,1179)}.items():
        scale = min(w / stage_width, h / stage_height)
        content = base.resize((round(scale * stage_width), round(scale * stage_height)), Image.Resampling.LANCZOS)
        host = Image.new('RGB', (w,h), '#0F1117')
        host.paste(content, ((w-content.width)//2, (h-content.height)//2))
        host.save(output / f'abandon-{device}.png')
stage_raster.unlink()
