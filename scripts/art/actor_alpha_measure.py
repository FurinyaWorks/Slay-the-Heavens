"""Check native artwork pixels against independently registered opacity masks."""

import argparse
import hashlib
import io
import json
import re
import sys
from pathlib import Path

from PIL import Image, ImageChops, ImageColor, ImageFilter


BACKDROPS = {"black": "#000000", "white": "#FFFFFF", "contrast": "#20F84D"}


def digest(data):
    return hashlib.sha256(data).hexdigest()


def read_capture(directory, entry, canvas):
    path = directory / entry["screenshot"]
    data = path.read_bytes()
    if digest(data) != entry["screenshotSha256"] or entry["assetWarnings"]:
        raise ValueError(f"Unverified Simulator screenshot {path}")
    with Image.open(io.BytesIO(data)) as image:
        if image.format != "PNG" or image.size != (canvas["width"], canvas["height"]):
            raise ValueError(f"Unexpected screenshot format or size {path}")
        return image.convert("RGB")


def infer_alpha(black, white, high_contrast, contrast_colour):
    if ImageChops.subtract(black, white).getbbox() is not None:
        raise ValueError("Black/white background pair does not describe one composited frame")
    first, second, third = ImageChops.subtract(white, black).split()
    lower = ImageChops.darker(first, second)
    higher = ImageChops.lighter(first, second)
    spread = ImageChops.subtract(ImageChops.lighter(higher, third), ImageChops.darker(lower, third))
    if spread.getextrema()[1] > 4:
        raise ValueError("Black/white background pair does not describe one composited frame")
    transmission = ImageChops.lighter(lower, ImageChops.darker(higher, third))
    contrast = Image.merge("RGB", tuple(transmission.point([round(level * colour / 255)
                          for level in range(256)]) for colour in contrast_colour))
    maximum = max(hi for _, hi in ImageChops.difference(ImageChops.add(black, contrast), high_contrast).getextrema())
    if maximum > 4:
        raise ValueError("Third background does not reproduce measured composition")
    return ImageChops.invert(transmission)


def assess(alpha, approved):
    if alpha.size != approved.size:
        raise ValueError("Approved mask is not registered to this Simulator pixel rectangle")
    opaque = approved.point([0] * 253 + [255] * 3).filter(ImageFilter.MinFilter(3))
    transparent = approved.point([255] * 3 + [0] * 253).filter(ImageFilter.MinFilter(3))
    count = lambda mask: mask.histogram()[255]
    opaque_pixels, transparent_pixels = count(opaque), count(transparent)
    if not opaque_pixels or not transparent_pixels:
        raise ValueError("Approved mask must show both opaque body and transparent space")
    leaking = count(ImageChops.multiply(opaque, alpha.point([255] * 253 + [0] * 3)))
    open_pixels = count(ImageChops.multiply(opaque, alpha.point([255] * 3 + [0] * 253)))
    spill = count(ImageChops.multiply(transparent, alpha.point([0] * 3 + [255] * 253)))
    return {
        "approvedOpaquePixels": opaque_pixels,
        "approvedTransparentPixels": transparent_pixels,
        "leakingPixels": leaking,
        "fullyOpenPixels": open_pixels,
        "unexpectedPaintPixels": spill,
        "status": "fail" if leaking or spill else "pass",
    }


def parse_mask(path, expected_digest, key):
    data = path.read_bytes()
    if digest(data) != expected_digest:
        raise ValueError(f"Approved mask hash differs: {key}")
    with Image.open(io.BytesIO(data)) as image:
        if image.format != "PNG":
            raise ValueError(f"Expected PNG approved mask: {key}")
        if image.mode == "L":
            return image.copy()
        if image.mode == "RGBA":
            return image.getchannel("A")
        raise ValueError(f"Expected grayscale or RGBA approved mask: {key}")


def registered_box(box):
    return (isinstance(box, list) and len(box) == 4 and all(type(n) is int for n in box)
            and min(box[:2]) >= 0 and min(box[2:]) > 0)


def approval_pins(inventory):
    manifest = inventory["approvals"]
    if manifest.get("schemaVersion") != 1 or manifest.get("profile") != inventory["profile"]:
        raise ValueError("Unknown committed original-alpha approval format or profile")
    actors = {row["id"]: row for row in inventory["actors"]}
    pins = {}
    for pin in manifest["actors"]:
        key = pin["id"]
        actor = actors.get(key)
        if not actor or key in pins or pin["geometry"] != actor["geometry"] or pin["productionSourceSha256"] != actor["productionSourceSha256"]:
            raise ValueError(f"Unknown, duplicate, or stale actor approval: {key}")
        original = pin.get("originalSha256", "")
        if (not re.fullmatch("[a-f0-9]{64}", original) or not re.fullmatch("[a-f0-9]{64}", pin.get("maskSha256", ""))
                or actor.get("approvedOriginalSha256", original) != original or not pin.get("approvalReference", "").strip()):
            raise ValueError(f"Invalid committed original or mask digest and review: {key}")
        registration = pin.get("registration", {})
        crop = pin.get("captureCrop")
        if (not registered_box(crop) or crop[2:] != [actor["width"]] * 2
                or not registered_box(registration.get("sourceCrop"))
                or not registered_box(registration.get("maskPlacement"))
                or any(sum(registration["maskPlacement"][axis::2]) > actor["width"] for axis in (0, 1))
                or registration.get("filter") not in {"nearest", "bilinear", "lanczos"}):
            raise ValueError(f"Invalid committed mask coordinate registration: {key}")
        pins[key] = pin
    return pins


def load_masks(path, inventory):
    manifest = json.loads(path.read_text())
    if manifest.get("schemaVersion") != 1:
        raise ValueError("Unknown mask locators")
    approved = approval_pins(inventory)
    masks = {}
    for entry in manifest["actors"]:
        if set(entry) != {"id", "path"}:
            raise ValueError("Mask locators accept only id and path. Approval comes from the committed review.")
        key = entry["id"]
        if key in masks or key not in approved:
            raise ValueError(f"Duplicate locator or missing committed mask approval: {key}")
        relative = Path(entry["path"])
        if relative.is_absolute():
            raise ValueError(f"Use a relative mask locator: {key}")
        pin = approved[key]
        masks[key] = (parse_mask(path.parent / relative, pin["maskSha256"], key), pin)
    return masks


def check_production_inventory(capture, inventory):
    if any(capture.get(field) != inventory[field] for field in ("sourceCommit", "profile", "scope")):
        raise ValueError("Capture must come from this checkout and the production Lua actor painters")
    if capture.get("releaseEvidence") != inventory.get("releaseEvidence"):
        raise ValueError("Actor alpha capture belongs to a different GIL or checkout configuration")
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
    return expected


def read_frame_triplet(page, capture, directory):
    entries = [page["captures"][key] for key in BACKDROPS]
    if len({(entry["frame"], entry["time"]) for entry in entries}) != 1:
        raise ValueError("Screenshots are not from the same frame")
    if len({entry["screenshotSha256"] for entry in entries}) != 3:
        raise ValueError("Black, white and contrast require distinct screenshot bytes")
    frames = [read_capture(directory, entry, capture["canvas"]) for entry in entries]
    width, height = frames[0].size
    corners = [(0, 0), (width - 1, 0), (0, height - 1), (width - 1, height - 1)]
    for (name, colour), frame in zip(BACKDROPS.items(), frames):
        if any(frame.getpixel(pixel) != ImageColor.getrgb(colour) for pixel in corners):
            raise ValueError(f"Screenshot blank corners do not show the required {name} background")
    return frames


def measure(capture_path, mask_path, inventory):
    data = capture_path.read_bytes()
    capture_sha = digest(data)
    if "expectedCaptureSha256" in inventory and capture_sha != inventory["expectedCaptureSha256"]:
        raise ValueError("Final capture bytes differ from independent approval")
    capture = json.loads(data)
    expected = check_production_inventory(capture, inventory)
    masks = load_masks(mask_path, inventory)
    if any(capture["backdrops"].get(key) != colour for key, colour in BACKDROPS.items()):
        raise ValueError("Capture requires exact black, white and high-contrast green backgrounds")
    actors = {}
    for page in capture["pages"]:
        frames = read_frame_triplet(page, capture, capture_path.parent)
        alpha = infer_alpha(*frames, ImageColor.getrgb(BACKDROPS["contrast"]))
        for actor in page["actors"]:
            key, width = actor["id"], actor["width"]
            x, y = actor["center"]
            left, top = x - width // 2, y - width // 2
            crop = [left, top, width, width]
            if not registered_box(crop) or left + width > alpha.width or top + width > alpha.height:
                raise ValueError(f"Invalid actor crop: {key}")
            result = {**actor, "crop": crop, "productionSourceSha256": expected[key]["productionSourceSha256"]}
            if key in masks:
                approved, pin = masks[key]
                if crop != pin["captureCrop"]:
                    raise ValueError(f"Mask crop differs from committed registration: {key}")
                result.update({field: pin[field] for field in ("maskSha256", "originalSha256", "approvalReference", "registration")})
                result.update(assess(alpha.crop((left, top, left + width, top + width)), approved))
            else:
                result.update(status="unverified", reason="approved independent registered opacity mask unavailable")
            actors[key] = result
    report = {"captureSha256": capture_sha, "sourceCommit": capture["sourceCommit"],
              "profile": capture["profile"], "approvalsSha256": inventory["approvalsSha256"], "actors": actors}
    if "releaseEvidence" in inventory:
        report["releaseEvidence"] = inventory["releaseEvidence"]
    if "releaseAuthority" in inventory:
        report["releaseAuthority"] = inventory["releaseAuthority"]
    return report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("capture", type=Path)
    parser.add_argument("masks", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    report = measure(args.capture, args.masks, json.load(sys.stdin))
    with args.output.open("x") as stream:
        json.dump(report, stream, indent=2)
        stream.write("\n")
    if any(row["status"] != "pass" for row in report["actors"].values()):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
