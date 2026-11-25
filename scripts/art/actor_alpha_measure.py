"""Check rendered native artwork against a separately approved, registered alpha mask."""

import argparse
import hashlib
import io
import json
import re
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def read_capture(directory, entry, canvas):
    path = directory / entry["screenshot"]
    data = path.read_bytes()
    if hashlib.sha256(data).hexdigest() != entry["screenshotSha256"] or entry["assetWarnings"]:
        raise ValueError(f"Unverified Simulator screenshot {path}")
    with Image.open(io.BytesIO(data)) as image:
        if image.size != (canvas["width"], canvas["height"]):
            raise ValueError(f"Unexpected screenshot size {path}")
        return np.asarray(image.convert("RGB"), dtype=np.int16)


def infer_alpha(black, white, high_contrast, contrast_colour):
    transmission = white - black
    if (transmission < 0).any() or (np.ptp(transmission, axis=2) > 4).any():
        raise ValueError("Black/white background pair does not describe one composited frame")
    alpha = 255 - np.median(transmission, axis=2).astype(np.uint8)
    expected = black + np.rint(contrast_colour * (255 - alpha[:, :, None]) / 255)
    if (np.abs(expected - high_contrast) > 4).any():
        raise ValueError("Third background does not reproduce measured composition")
    return alpha


def interior(binary):
    mask = Image.fromarray(np.uint8(binary) * 255, "L")
    return np.asarray(mask.filter(ImageFilter.MinFilter(3))) != 0


def assess(alpha, approved):
    if alpha.shape != approved.shape:
        raise ValueError("Approved mask is not registered to this Simulator pixel rectangle")
    opaque = interior(approved >= 253)
    transparent = interior(approved <= 2)
    if not np.any(opaque) or not np.any(transparent):
        raise ValueError("Approved mask must show both opaque body and transparent space")
    missing = opaque & (alpha < 253)
    spill = transparent & (alpha > 2)
    return {
        "approvedOpaquePixels": int(np.count_nonzero(opaque)),
        "approvedTransparentPixels": int(np.count_nonzero(transparent)),
        "leakingPixels": int(np.count_nonzero(missing)),
        "fullyOpenPixels": int(np.count_nonzero(opaque & (alpha <= 2))),
        "unexpectedPaintPixels": int(np.count_nonzero(spill)),
        "status": "fail" if np.any(missing | spill) else "pass",
    }


def load_masks(path):
    manifest = json.loads(path.read_text())
    if manifest.get("schemaVersion") != 1:
        raise ValueError("Unknown mask manifest")
    records = {}
    for entry in manifest["actors"]:
        key = entry["id"]
        if entry["basis"] not in {"approved-original", "approved-fit-preview"}:
            raise ValueError(f"Unknown approved reference basis: {key}")
        if key in records or not entry["approvalReference"].strip():
            raise ValueError(f"Duplicate actor or missing approval reference: {key}")
        source = path.parent / entry["path"]
        data = source.read_bytes()
        if hashlib.sha256(data).hexdigest() != entry["sha256"]:
            raise ValueError(f"Approved mask hash differs: {key}")
        with Image.open(io.BytesIO(data)) as image:
            if image.mode == "L":
                alpha = image.copy()
            elif image.mode == "RGBA":
                alpha = image.getchannel("A")
            else:
                raise ValueError(f"Expected grayscale or RGBA approved mask: {key}")
        records[key] = (np.asarray(alpha), entry)
    return records


def check_production_inventory(capture, inventory):
    if any(capture.get(field) != inventory[field] for field in ("sourceCommit", "profile", "scope")):
        raise ValueError("Capture must come from this checkout and the production Lua actor painters")
    if "experiment" in capture:
        raise ValueError("Experimental capture cannot admit production art")
    expected = {actor["id"]: actor for actor in inventory["actors"]}
    seen = set()
    for page in capture["pages"]:
        if not page["actors"]:
            raise ValueError("Capture page contains no actors")
        for actor in page["actors"]:
            key = actor["id"]
            if key in seen or key not in expected:
                raise ValueError(f"Unexpected or duplicate production actor: {key}")
            if any(actor.get(field) != expected[key][field] for field in ("geometry", "width", "shapes")):
                raise ValueError(f"Production actor geometry, count or size differs: {key}")
            seen.add(key)
    missing = expected.keys() - seen
    if not expected or missing:
        raise ValueError(f"Incomplete production actor capture: {sorted(missing)}")


def check_production_mask_sources(masks, inventory):
    for actor in inventory["actors"]:
        key = actor["id"]
        if key not in masks:
            continue  # The normal measurement reports missing masks as unverified.
        _, entry = masks[key]
        source = entry.get("sourceSha256", "")
        if not re.fullmatch("[a-f0-9]{64}", source):
            raise ValueError(f"Missing registered original source digest: {key}")
        if actor.get("approvedSourceSha256", source) != source:
            raise ValueError(f"Approved original source digest differs: {key}")


def measure(capture_path, masks, inventory=None):
    data = capture_path.read_bytes()
    capture = json.loads(data)
    if inventory is not None:
        check_production_inventory(capture, inventory)
        check_production_mask_sources(masks, inventory)
    if capture["backdrops"]["black"] != "#000000" or capture["backdrops"]["white"] != "#FFFFFF":
        raise ValueError("Capture requires exact black and white backgrounds")
    contrast = capture["backdrops"]["contrast"]
    contrast_rgb = np.array([int(contrast[i:i + 2], 16) for i in (1, 3, 5)])
    directory = capture_path.parent
    actors = {}
    for page in capture["pages"]:
        entries = page["captures"]
        if len({(entry["frame"], entry["time"]) for entry in entries.values()}) != 1:
            raise ValueError("Screenshots are not from the same frame")
        frames = [read_capture(directory, entries[key], capture["canvas"]) for key in ("black", "white", "contrast")]
        alpha = infer_alpha(*frames, contrast_rgb)
        for actor in page["actors"]:
            key, width = actor["id"], actor["width"]
            x, y = actor["center"]
            left, top = x - width // 2, y - width // 2
            crop = [left, top, width, width]
            if key in actors or left < 0 or top < 0 or left + width > alpha.shape[1] or top + width > alpha.shape[0]:
                raise ValueError(f"Invalid or duplicate actor crop: {key}")
            result = {**actor, "crop": crop}
            if key in masks:
                approved, entry = masks[key]
                if crop != entry["crop"]:
                    raise ValueError(f"Mask crop differs from capture registration: {key}")
                result.update(maskSha256=entry["sha256"], approvalReference=entry["approvalReference"], basis=entry["basis"])
                if "sourceSha256" in entry:
                    result["maskSourceSha256"] = entry["sourceSha256"]
                result.update(assess(alpha[top:top + width, left:left + width], approved))
            else:
                result.update(status="unverified", reason="approved independent registered opacity mask unavailable")
            actors[key] = result
    if not actors:
        raise ValueError("Capture contains no actors")
    unknown = masks.keys() - actors.keys()
    if unknown:
        raise ValueError(f"Masks refer to assets absent from capture: {sorted(unknown)}")
    return {"captureSha256": hashlib.sha256(data).hexdigest(), "sourceCommit": capture["sourceCommit"],
            "profile": capture.get("profile"), "actors": actors}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("capture", type=Path)
    parser.add_argument("--masks", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--require-pass", action="store_true",
                        help="Fail if any actor leaks, spills, or has no independently approved mask")
    parser.add_argument("--production-inventory", action="store_true", help=argparse.SUPPRESS)
    args = parser.parse_args()
    inventory = json.load(sys.stdin) if args.production_inventory else None
    report = measure(args.capture, load_masks(args.masks) if args.masks else {}, inventory)
    with args.output.open("x") as stream:
        json.dump(report, stream, indent=2)
        stream.write("\n")
    if args.require_pass and any(row["status"] != "pass" or row.get("basis") != "approved-original"
                                 for row in report["actors"].values()):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
