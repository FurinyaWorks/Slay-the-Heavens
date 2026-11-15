"""Render the exact native primitive recipes, without labels hiding small icons.

Offline contact sheets only: this is not an SDK texture or device acceptance.
Uses Pillow already present in the project environment; no downloaded artwork.
"""
import argparse
import hashlib
import json
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


def icon(asset, size, neutral=False):
    factor = 8
    canvas = Image.new("RGBA", (size * factor, size * factor))
    unit = size * factor / 100
    for shape in asset["shapes"]:
        colour = shape["colour"]
        if neutral and colour not in ("#20323B", "#D8C69B", "#A4794C", "#F9F4DE"):
            colour = "#D1D1D1"
        w, h = shape["w"] * unit, shape["h"] * unit
        # A padded local layer preserves rotation around the authored centre.
        extent = math.ceil(math.hypot(w, h)) + 8
        layer = Image.new("RGBA", (extent, extent))
        draw = ImageDraw.Draw(layer)
        cx = cy = extent / 2
        box = (cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2)
        if shape["image"] == 100001:
            draw.rectangle(box, fill=colour)
        elif shape["image"] == 100002:
            draw.ellipse(box, fill=colour)
        elif shape["image"] == 100003:
            draw.polygon([(cx, cy - h / 2), (cx - w / 2, cy + h / 2), (cx + w / 2, cy + h / 2)], fill=colour)
        else:
            raise ValueError("Unknown primitive")
        layer = layer.rotate(shape.get("rotation", 0), resample=Image.Resampling.BICUBIC)
        x = (50 + shape["x"]) * unit - extent / 2
        y = (50 - shape["y"]) * unit - extent / 2
        canvas.alpha_composite(layer, (round(x), round(y)))
    return canvas.resize((size, size), Image.Resampling.LANCZOS)


def gallery(assets, size, mode):
    gap, columns = 10, 7
    cell = size + gap * 2
    result = Image.new("RGB", (columns * cell, 6 * cell), "#17232D")
    for index, asset in enumerate(assets):
        tile = icon(asset, size, neutral=mode == "neutral")
        if mode == "gray":
            tile = Image.merge("RGBA", (*([ImageOps.grayscale(tile)] * 3), tile.getchannel("A")))
        result.paste(tile, ((index % columns) * cell + gap, (index // columns) * cell + gap), tile)
    return result


def named_gallery(assets):
    result = Image.new("RGB", (7 * 192, 6 * 128), "#17232D")
    draw = ImageDraw.Draw(result)
    font = ImageFont.truetype("C:/Windows/Fonts/msyh.ttc", 16)
    small = ImageFont.truetype("C:/Windows/Fonts/msyh.ttc", 12)
    for index, asset in enumerate(assets):
        x, y = (index % 7) * 192, (index // 7) * 128
        tile = icon(asset, 64)
        result.paste(tile, (x + 64, y + 2), tile)
        draw.text((x + 96, y + 68), asset["name"], font=font, fill="#F3E7CE", anchor="mt")
        draw.text((x + 96, y + 92), asset["motif"], font=small, fill="#B8C9CF", anchor="mt")
        if not asset["production"]:
            draw.text((x + 96, y + 110), "full-source / 非比赛池", font=small, fill="#ADB2C3", anchor="mt")
    return result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", default="data/presentation/lowcost-potion-art.json")
    parser.add_argument("--output", default="build/potion-art-preview")
    args = parser.parse_args()
    source = Path(args.source)
    registry = json.loads(source.read_text(encoding="utf-8"))
    assets = list(registry["assets"].values())
    if len(assets) != 42:
        raise ValueError("Expected all42")
    target = Path(args.output)
    target.mkdir(parents=True, exist_ok=True)
    files = []
    for size in (24, 32, 48, 64):
        for mode in ("colour", "gray", "neutral"):
            image = gallery(assets, size, mode)
            file = target / f"potions-{size}px-{mode}.png"
            image.save(file)
            files.append({"file": file.name, "iconPixels": size, "mode": mode, "width": image.width, "height": image.height, "sha256": hashlib.sha256(file.read_bytes()).hexdigest()})
    file = target / "potions-named-64px.png"
    named_gallery(assets).save(file)
    files.append({"file": file.name, "iconPixels": 64, "mode": "named", "sha256": hashlib.sha256(file.read_bytes()).hexdigest()})
    neutral = [icon(a, 24, True).tobytes() for a in assets]
    duplicates = [[i, j] for i in range(42) for j in range(i) if neutral[i] == neutral[j]]
    receipt = {"scope": "offline same-recipe primitive projection; no SDK texture/device claim", "sourceSha256": hashlib.sha256(source.read_bytes()).hexdigest(), "order": list(registry["assets"]), "files": files, "neutral24ExactDuplicatePairs": duplicates}
    (target / "receipt.json").write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"files": len(files), "neutral24ExactDuplicatePairs": duplicates}))


if __name__ == "__main__":
    main()
