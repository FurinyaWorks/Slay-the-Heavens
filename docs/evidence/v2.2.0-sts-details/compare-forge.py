import hashlib
import json
import sys
from pathlib import Path

from PIL import Image, ImageChops

baseline, candidate, out = map(Path, sys.argv[1:])
scenes = {
    "apparition": ("forge-pair.png", "forge-pair.png"),
    "strike": ("forge-strike-idle.png", "forge-strike-idle.png"),
}
# Crop each live face including its cost medallion and projecting title ribbon.
# Include separate, generous boundaries around both existing footer controls.
regions = {
    "before": (383, 196, 728, 620),
    "after": (861, 196, 1203, 620),
    "cancel": (62, 766, 315, 857),
    "confirm": (1275, 763, 1553, 859),
}
report = {}
for scene, (base_path, candidate_path) in scenes.items():
    with Image.open(baseline / base_path) as base, Image.open(candidate / candidate_path) as result:
        assert result.size == base.size == (1600, 900)
        report[scene] = []
        for name, bounds in regions.items():
            below, above = base.convert("RGB").crop(bounds), result.convert("RGB").crop(bounds)
            delta = ImageChops.difference(below, above)
            report[scene].append({
                "name": name, "bounds": bounds,
                "basePixelsSha256": hashlib.sha256(below.tobytes()).hexdigest(),
                "candidatePixelsSha256": hashlib.sha256(above.tobytes()).hexdigest(),
                "differenceBounds": delta.getbbox(),
                "pixelsChanged": sum(rgb != (0, 0, 0) for rgb in delta.get_flattened_data()),
            })
out.write_text(json.dumps(report, indent=2) + "\n")
if any(row["pixelsChanged"] for rows in report.values() for row in rows):
    raise SystemExit("Existing official forge appearance drifted. See pixel comparison JSON.")
print("8 OFFICIAL FORGE REGIONS PIXEL-IDENTICAL")
