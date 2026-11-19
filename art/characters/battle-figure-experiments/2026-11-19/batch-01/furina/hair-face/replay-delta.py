"""Apply the source-selected head delta to the exact previous Furina scene."""
import hashlib
import json
import sys
from pathlib import Path

previous, output = map(Path, sys.argv[1:3])
spec = json.loads(Path(__file__).with_name("native-delta.json").read_bytes())
canonical = lambda value: json.dumps(value, separators=(",", ":"), sort_keys=True, ensure_ascii=False).encode()
sha = lambda data: hashlib.sha256(data).hexdigest()
doc = json.loads(previous.read_bytes())
assert sha(canonical(doc)) == spec["baselineCanonicalSHA256"]
original = doc["elements"]
rebuilt = []
for layer in spec["layers"]:
    if "retain" in layer:
        lo, hi = layer["retain"]
        rebuilt.extend(original[lo:hi])
    else:
        rebuilt.extend(layer["new"])
for i, obj in enumerate(rebuilt):
    obj.update(id=f"fit-{i:04d}", name=f"Furina {i:04d}", zIndex=i)
doc["elements"] = rebuilt
b = canonical(doc)
assert len(rebuilt) == 488 and sha(b) == spec["canonicalSHA256"]
output.parent.mkdir(parents=True, exist_ok=True)
with output.open("xb") as writer:
    writer.write(b)
