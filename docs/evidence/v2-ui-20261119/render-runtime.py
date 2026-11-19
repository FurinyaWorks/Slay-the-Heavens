"""Render geometry from the live Lua fixture as a 1280×720 offline projection."""
from functools import lru_cache
import json
import math
from pathlib import Path
import re
import sys

from PIL import Image, ImageDraw, ImageFont

WIDTH, HEIGHT, SCALE = 1280, 720, 2
FONT_PATH = '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'
RECT = [(-.5, -.5), (.5, -.5), (.5, .5), (-.5, .5)]
TRIANGLE = [(-.5, -.5), (.5, -.5), (0, .5)]
RIGHT_HALF_TRIANGLE = [(0, -.5), (.5, -.5), (0, .5)]
DISC = [(math.cos(i * math.tau / 32) / 2, math.sin(i * math.tau / 32) / 2) for i in range(32)]
SHAPES = {100001: RECT, 100002: DISC, 100003: TRIANGLE}

@lru_cache
def font(size):
    return ImageFont.truetype(FONT_PATH, max(1, size))

def tint(value, opacity):
    rgba = bytes.fromhex((value or '#FFFFFF').lstrip('#'))
    return (*rgba[:3], round((rgba[3] if len(rgba) == 4 else 255) * (opacity if opacity is not None else 1)))

def matrix(parent, position, scale, rotation, offset):
    a, b, c, d, x, y = parent
    dx, dy = position
    sx, sy = scale[:2]
    rx, ry, rz = map(math.radians, rotation if isinstance(rotation, list) else (0, 0, rotation))
    ax, ay = math.cos(ry) * math.cos(rz) * sx, -math.cos(ry) * math.sin(rz) * sy
    bx, by = math.cos(rx) * math.sin(rz) * sx, math.cos(rx) * math.cos(rz) * sy
    dx += ax * offset[0] + ay * offset[1]
    dy += bx * offset[0] + by * offset[1]
    return (a * ax + b * bx, a * ay + b * by, c * ax + d * bx,
            c * ay + d * by, a * dx + b * dy + x, c * dx + d * dy + y)

def project(pose, x=0, y=0):
    a, b, c, d, ox, oy = pose
    return (SCALE * (WIDTH / 2 + a * x + b * y + ox),
            SCALE * (HEIGHT / 2 - c * x - d * y - oy))

def draw_text(draw, node, pose, style):
    spec = node['text']
    if not spec.get('content'):
        return
    w, h = node['size']
    left = spec.get('align') == 'left'
    right = spec.get('align') == 'right'
    top = spec.get('valign') == 'top'
    baseline = font(round(SCALE * spec['fontSize']))
    content = re.sub(r'</?color(?:=#[0-9a-fA-F]{6})?>', '', spec['content'])
    lines = []
    for paragraph in content.splitlines():
        if w <= 0:
            lines.append(paragraph)
            continue
        line = ''
        for char in paragraph:
            if line and baseline.getlength(line + char) > SCALE * w:
                lines.append(line)
                line = ''
            line += char
        lines.append(line)
    outline = {}
    if style.get('outline') and style.get('outlineColour'):
        outline = {'stroke_width': SCALE, 'stroke_fill': tint(style['outlineColour'], style.get('outlineOpacity'))}
    draw.multiline_text(project(pose, -w / 2 if left else w / 2 if right else 0, h / 2 if top else 0),
                        '\n'.join(lines), tint(spec.get('colour'), 1), font=baseline,
                        anchor=('l' if left else 'r' if right else 'm') + ('a' if top else 'm'),
                        align='left' if left else 'right' if right else 'center', spacing=2, **outline)

def render(scene, output, layout):
    image = Image.new('RGB', (WIDTH * SCALE, HEIGHT * SCALE), '#151820')
    draw = ImageDraw.Draw(image, 'RGBA')
    def walk(node, parent, parent_size, spec):
        if node.get('visible') is False:
            return
        spec = {**spec, **node.get('native', {})}
        position = node.get('position', (0, 0))
        size = node.get('size', parent_size)
        anchor = spec.get('anchor', {})
        minimum, maximum = anchor.get('min', (.5, .5)), anchor.get('max', (.5, .5))
        pivot = spec.get('pivot', (.5, .5))
        size = [size[i] + parent_size[i] * (maximum[i] - minimum[i]) for i in range(2)]
        position = [position[i] + parent_size[i] * (minimum[i] - .5 + pivot[i] * (maximum[i] - minimum[i]))
                    for i in range(2)]
        offset = [size[i] * (.5 - pivot[i]) for i in range(2)]
        rotation = spec.get('rotation', 0)
        if not isinstance(rotation, list):
            rotation = node.get('rotation') or rotation
        pose = matrix(parent, position, node.get('scale') or spec.get('scale', (1, 1)), rotation, offset)
        if node.get('kind') == 'image':
            w, h = size
            shape = SHAPES.get(node.get('image'))
            if shape == TRIANGLE and spec.get('fill') == {'shape': 'horizontal', 'from': 'right', 'amount': .5}:
                shape = RIGHT_HALF_TRIANGLE
            if shape and w > 0 and h > 0:
                draw.polygon([project(pose, x * w, y * h) for x, y in shape],
                             tint(node.get('colour'), node.get('opacity')))
        if node.get('kind') in ('text', 'textWindow') and node.get('text'):
            draw_text(draw, {**node, 'size': size}, pose, spec.get('text', {}))
        children = {child['name']: child for child in spec.get('children', [])}
        for child in node.get('children') or ():
            walk(child, pose, size, children.get(child['name'], {}))
    walk(scene['tree'], (1, 0, 0, 1, 0, 0), (WIDTH, HEIGHT), layout)
    image.resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS).save(output / ('runtime-' + scene['name'] + '.png'))

output = Path(sys.argv[1])
layout = json.loads((output / 'generated/game-ui.json').read_text())
stage = next(node for node in layout['controls'] if node['name'] == 'stage')
for scene in json.loads((output / 'scenes.json').read_text()):
    render(scene, output, stage)
