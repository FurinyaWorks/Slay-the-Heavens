"""Render the Lua Host/native mock projection. The client texture and font engines are separate."""
import json
import math
import os
import re
import sys
from functools import lru_cache
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

FONT = os.environ.get("ABYSS_CAPTURE_FONT", "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc")
STAGE = (1280, 720)
RECT, OVAL, TRIANGLE, DIAMOND = range(100001, 100005)


@lru_cache(maxsize=96)
def font(size):
    return ImageFont.truetype(FONT, max(1, round(size)))


def rgba(value, opacity=1):
    raw = tuple(bytes.fromhex((value or "#FFFFFF").lstrip("#")))
    alpha = raw[3] if len(raw) == 4 else 255
    return (*raw[:3], round(alpha * opacity))


def points(control, path):
    theta = math.radians(control["rotation"])
    cs, sn = math.cos(theta), math.sin(theta)
    for u, v in path:
        x = (u - control["pivot"][0]) * control["w"] * control["sx"]
        y = (v - control["pivot"][1]) * control["h"] * control["sy"]
        # The native rotations apply before any anisotropic ancestor scale.
        px, py = control["px"], control["py"]
        yield control["x"] + x * cs - y * sn * px / py, control["y"] - x * sn * py / px - y * cs


def paint_image(image, control, missing):
    ident = control.get("image")
    colour = rgba(control.get("colour"), control["opacity"])
    if not colour[3]:
        return
    shape = [(0, 0), (1, 0), (1, 1), (0, 1)]
    known = True
    if ident == TRIANGLE:
        shape = [(.5, 0), (1, 0), (.5, 1)] if control.get("fill") else [(0, 0), (1, 0), (.5, 1)]
    elif ident in (OVAL, 106025, 106029, 106057, 106095):
        shape = [(.5 + .5 * math.cos(i * math.tau / 40), .5 + .5 * math.sin(i * math.tau / 40)) for i in range(40)]
        if ident in (106057, 106095):
            colour = (*colour[:3], round(colour[3] * .24))
    elif ident == DIAMOND:
        shape = [(.5, 0), (1, .5), (.5, 1), (0, .5)]
    elif ident != RECT:
        missing.add(ident)
        # Show only small, otherwise invisible texture footprints (potions,
        # navigation icons). Large unavailable assets are left transparent.
        if not 9 < control["w"] <= 85 or not 9 < control["h"] <= 85:
            return
        known = False
    outline = list(points(control, shape))
    if known and colour[3] == 255:
        ImageDraw.Draw(image).polygon(outline, fill=colour)
        return
    left = math.floor(min(x for x, y in outline))
    top = math.floor(min(y for x, y in outline))
    right = math.ceil(max(x for x, y in outline)) + 1
    bottom = math.ceil(max(y for x, y in outline)) + 1
    tile = Image.new("RGBA", (right - left, bottom - top))
    local = [(x-left, y-top) for x, y in outline]
    if known:
        ImageDraw.Draw(tile).polygon(local, fill=colour)
    else:
        ImageDraw.Draw(tile).polygon(local, outline=(*colour[:3], min(135, colour[3])), width=2)
    image.alpha_composite(tile, (left, top))


def paragraphs(text, typeface, width):
    lines = []
    for paragraph in text.splitlines() or [""]:
        line = ""
        for char in paragraph:
            if line and typeface.getlength(line + char) > width:
                lines.append(line)
                line = ""
            line += char
        lines.append(line)
    return lines


def paint_text(image, control):
    raw = control.get("text") or ""
    plain = re.sub(r"<[^>]+>", "", raw)
    if not plain or not control.get("font"):
        return False
    sx, sy = abs(control["sx"]), abs(control["sy"])
    w, h = control["w"] * sx, control["h"] * sy
    size = round(control["font"] * min(sx, sy))
    minimum = round((control.get("minFont") or control["font"]) * min(sx, sy))
    lines = paragraphs(plain, font(size), w)
    while control.get("autoSize") and size > minimum and size * 1.25 * len(lines) > h:
        size -= 1
        lines = paragraphs(plain, font(size), w)
    if h <= 0 or w <= 0:
        return True
    tile = Image.new("RGBA", (math.ceil(w), math.ceil(h)))
    draw = ImageDraw.Draw(tile)
    typeface = font(size)
    line_height = size * 1.25
    overflow = line_height * len(lines) > h + 1
    valign = control.get("valign")
    top = 0 if valign == "top" else max(0, (h - len(lines) * line_height) / 2)
    colours = [control.get("ink")]
    glyphs = []
    for part in re.split(r"(<color=#[0-9A-Fa-f]+>|</color>)", raw):
        if part.startswith("<color="):
            colours.append(part[7:-1])
        elif part == "</color>" and len(colours) > 1:
            colours.pop()
        else:
            glyphs.extend((c, colours[-1]) for c in re.sub(r"<[^>]+>", "", part) if c != "\n")
    offset = 0
    for line in lines:
        extent = typeface.getlength(line)
        align = control.get("align")
        left = 0 if align == "left" else (w - extent if align == "right" else (w - extent) / 2)
        if line:
            last_colour = None
            run_start = 0
            line_glyphs = glyphs[offset:offset + len(line)]
            for index, colour in enumerate([value for _, value in line_glyphs] + [None]):
                if index and (colour != last_colour or index == len(line_glyphs)):
                    draw.text((left + typeface.getlength(line[:run_start]), top), line[run_start:index],
                              font=typeface, fill=rgba(last_colour), anchor="lt",
                              stroke_width=1 if control.get("outline") else 0,
                              stroke_fill=rgba(control.get("outline")))
                    run_start = index
                last_colour = colour
        offset += len(line)
        top += line_height
    image.alpha_composite(tile, (round(control["x"] - w / 2), round(control["y"] - h / 2)))
    return overflow


def render(directory):
    report = {}
    for scene in json.loads((directory / "scenes.json").read_text()):
        width, height = scene["width"], scene["height"]
        k = min(width / STAGE[0], height / STAGE[1])
        inset = (width - STAGE[0] * k) / 2
        image = Image.new("RGBA", (width, height), "#101218")
        missing, overflows, geometry = set(), [], {}
        for control in scene["controls"]:
            if control["w"] <= 0 or control["h"] <= 0:
                continue
            path = control["path"]
            kind = control["kind"]
            if kind == "image":
                paint_image(image, control, missing)
            elif kind == "text" and paint_text(image, control):
                overflows.append(path)
            if kind == "hit" or path.endswith(("/steel", "/paperCore", "/stsNeowText", "/page", "/title", "/bossDescription")):
                w = control["w"] * abs(control.get("sx", 1))
                h = control["h"] * abs(control.get("sy", 1))
                geometry[path] = [round(n, 3) for n in (control["x"] - w / 2, control["y"] - h / 2, w, h)]
        # The client crops the game to the scaled stage, with dark scene bleed outside.
        draw = ImageDraw.Draw(image)
        if inset:
            draw.rectangle((0, 0, round(inset) - 1, height), fill="#101218")
            draw.rectangle((width - round(inset), 0, width, height), fill="#101218")
        image.convert("RGB").save(directory / (scene["name"] + ".png"), optimize=True)
        report[scene["name"]] = {"viewport": [width, height], "stage": [inset, 0, width-2*inset, height],
                                 "controls": geometry, "unresolvedTextureIds": sorted(str(n) for n in missing),
                                 "projectionTextOverflows": overflows}
    (directory / "bounds.json").write_text(json.dumps(report, ensure_ascii=False, indent=2)+"\n")


for argument in sys.argv[1:]:
    render(Path(argument))
