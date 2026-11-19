"""Apply the source-traced facial geometry to the exact Batch 01 Furina scene."""
import hashlib
import json
import sys
from pathlib import Path

original, output = map(Path, sys.argv[1:3])
spec = json.loads(Path(__file__).with_name("native-delta.json").read_bytes())
canonical = lambda value: json.dumps(value, separators=(",", ":"), sort_keys=True, ensure_ascii=False).encode()
sha = lambda data: hashlib.sha256(data).hexdigest()
doc = json.loads(original.read_bytes())
assert sha(canonical(doc)) == spec["baselineCanonicalSHA256"]
assert len(doc["elements"]) == 482
doc["elements"] = doc["elements"][:spec["unchangedPrefix"]] + spec["faceElements"]
data = canonical(doc)
assert len(doc["elements"]) == 489 and sha(data) == spec["canonicalSHA256"]
output.parent.mkdir(parents=True, exist_ok=True)
with output.open("xb") as writer:
    writer.write(data)
