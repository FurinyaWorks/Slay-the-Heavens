"""Reproduce the 33 relic icon contact sheets from the native registry.

Offline projection only; uses the same recipe rasterizer as the potion sheets.
"""
import argparse
import hashlib
import importlib.util
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("potion_preview", ROOT / "scripts/potion-art-preview.py")
preview = importlib.util.module_from_spec(spec)
spec.loader.exec_module(preview)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default="build/relic-icon-preview")
    args = parser.parse_args()
    evidence = ROOT / "docs/evidence/relic-semantic-icons-20261115"
    selection = json.loads((evidence / "extra-assets.json").read_text(encoding="utf-8"))
    registry = json.loads((ROOT / "data/presentation/lowcost-relic-art.json").read_text(encoding="utf-8"))
    audit = json.loads((evidence / "audit.json").read_text(encoding="utf-8"))
    assets = {id: registry["assets"][id] for id in selection["assets"]}
    if assets != selection["assets"]:
        raise ValueError("Registered recipes differ from the reviewed 33-item selection")
    output = Path(args.output)
    output.mkdir(parents=True, exist_ok=True)
    files = []
    for size in (24, 32):
        for mode in ("colour", "gray", "neutral"):
            image = Image.new("RGB", (7 * (size + 20), 5 * (size + 20)), "#17232D")
            for index, asset in enumerate(assets.values()):
                tile = preview.icon(asset, size, mode == "neutral")
                if mode == "gray":
                    tile = Image.merge("RGBA", (*([ImageOps.grayscale(tile)] * 3), tile.getchannel("A")))
                image.paste(tile, ((index % 7) * (size + 20) + 10, (index // 7) * (size + 20) + 10), tile)
            path = output / f"relics-{size}px-{mode}.png"
            image.save(path)
            files.append(path)
    image = Image.new("RGB", (7 * 192, 5 * 128), "#17232D")
    draw = ImageDraw.Draw(image)
    font = ImageFont.truetype("C:/Windows/Fonts/msyh.ttc", 16)
    small = ImageFont.truetype("C:/Windows/Fonts/msyh.ttc", 12)
    for index, (id, asset) in enumerate(assets.items()):
        x, y = (index % 7) * 192, (index // 7) * 128
        tile = preview.icon(asset, 64)
        image.paste(tile, (x + 64, y + 2), tile)
        draw.text((x + 96, y + 68), asset["name"], font=font, fill="#F9F4DE", anchor="mt")
        draw.text((x + 96, y + 92), audit["semantics"][id]["motif"], font=small, fill="#D8C69B", anchor="mt")
    path = output / "relics-named-64px.png"
    image.save(path)
    files.append(path)
    receipt = {"scope": "offline same-recipe projection; no SDK/device acceptance", "files": [{"file": p.name, "sha256": hashlib.sha256(p.read_bytes()).hexdigest()} for p in files]}
    (output / "receipt.json").write_text(json.dumps(receipt, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(receipt))


if __name__ == "__main__":
    main()
