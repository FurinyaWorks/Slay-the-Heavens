import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

base, pc, ultrawide, touch, out = map(Path, sys.argv[1:])
font = ImageFont.truetype("DejaVuSans.ttf", 25)
background = "#121820"
text_ink = "#e6edf6"
tile_width = 1120
gutter = 20
header = 42


def assemble(name, rows):
    tiles = []
    for left, right in rows:
        pair = []
        for root, frame, label in (left, right):
            with Image.open(root / (frame + ".png")) as shot:
                height = round(shot.height * tile_width / shot.width)
                pair.append((shot.convert("RGB").resize((tile_width, height), Image.Resampling.LANCZOS), label))
        tiles.append(pair)
    height = gutter + sum(max(shot.height for shot, _ in pair) + header + gutter for pair in tiles)
    canvas = Image.new("RGB", (2 * tile_width + 3 * gutter, height), background)
    draw = ImageDraw.Draw(canvas)
    y = gutter
    for pair in tiles:
        for index, (shot, label) in enumerate(pair):
            x = gutter + index * (tile_width + gutter)
            draw.text((x, y), label, fill=text_ink, font=font)
            canvas.paste(shot, (x, y + header))
        y += max(shot.height for shot, _ in pair) + header + gutter
    canvas.save(out / name, "WEBP", quality=86, method=4)


assemble("simulator-pc.webp", [
    ((base, "nest-hover", "Nest hover / release baseline"),
     (pc, "nest-hover", "Nest hover / fix")),
    ((pc, "forge-before-hover", "Apparition / before upgrade"),
     (pc, "forge-after-hover", "Apparition+ / after upgrade")),
    ((pc, "golden-idol-relic", "Golden Idol relic detail"),
     (pc, "golden-idol-option-1", "Injury curse card preview")),
    ((pc, "shop-edge-hover", "Shop / card center at 81.48% / opens left"),
     (ultrawide, "shop-edge-hover", "Shop / card center at 73.99% / opens right")),
])
assemble("simulator-touch.webp", [
    ((touch, "nest-long-press", "Nest / long press"),
     (touch, "nest-released", "Nest / release leaves the preview open")),
    ((touch, "forge-before-released", "Apparition / after releasing touch"),
     (touch, "forge-after-released", "Apparition+ / after releasing touch")),
])
