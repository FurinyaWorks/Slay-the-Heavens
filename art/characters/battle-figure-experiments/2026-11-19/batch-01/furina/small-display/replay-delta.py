"""Replay the multiscale geometric reduction on the exact prior Furina asset."""
import hashlib
import json
import sys
from pathlib import Path

baseline, output = map(Path, sys.argv[1:3])
delta = json.loads(Path(__file__).with_name("native-delta.json").read_bytes())
canon = lambda x: json.dumps(x, ensure_ascii=False, separators=(",", ":"), sort_keys=True).encode()
sha = lambda x: hashlib.sha256(x).hexdigest()
doc = json.loads(baseline.read_bytes())
assert sha(canon(doc)) == delta["baselineCanonicalSHA256"]
original = doc["elements"]
kept = []
for idx, color, opacity in delta["keepPalette"]:
    el = original[idx]
    el.update(color=color, opacity=opacity)
    kept.append(el)
kept.extend(delta["eyeLashes"])
for i, element in enumerate(kept):
    element["zIndex"] = i
doc["elements"] = kept
data = canon(doc)
assert len(kept) == 320 and sha(data) == delta["canonicalSHA256"]
output.parent.mkdir(parents=True, exist_ok=True)
with output.open("xb") as f:
    f.write(data)
