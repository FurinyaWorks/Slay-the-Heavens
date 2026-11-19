"""Apply the exact local cheek and anatomical left iris changes to Batch 01."""
import hashlib
import json
import sys
from pathlib import Path

baseline, output = map(Path, sys.argv[1:3])
delta = json.loads(Path(__file__).with_name("native-delta.json").read_text())
sha = lambda b: hashlib.sha256(b).hexdigest()
canonical = lambda o: json.dumps(o, separators=(",", ":"), sort_keys=True, ensure_ascii=False).encode()
doc = json.loads(baseline.read_bytes())
assert sha(canonical(doc)) == delta["baselineCanonicalSHA256"]
assert len(doc["elements"]) == 482
for index, expected, target in delta["leftEyeRecolors"]:
    el = doc["elements"][index]
    assert el["color"] == expected
    el["color"] = target
i = delta["cheekInsertIndex"]
doc["elements"][i:i] = delta["cheekTriangles"]
for i, el in enumerate(doc["elements"]):
    el.update(id=f"fit-{i:04d}", name=f"Furina {i:04d}", zIndex=i)
b = canonical(doc)
assert len(doc["elements"]) == 488 and sha(b) == delta["newCanonicalSHA256"]
output.parent.mkdir(parents=True, exist_ok=True)
with output.open("xb") as f:
    f.write(b)
