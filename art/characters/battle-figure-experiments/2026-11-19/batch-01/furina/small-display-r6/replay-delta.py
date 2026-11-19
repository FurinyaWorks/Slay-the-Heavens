"""Replay the exact R6 Furina geometry over R5, without the private source."""
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
old = {e["id"]: e for e in doc["elements"]}
rows = []
for row in delta["layerOrder"]:
    if row[0] == -1:
        element = {**delta["nativeDefaults"], **dict(zip(delta["nativeKeys"], row[1:], strict=True))}
    else:
        ident, color, opacity = row
        element = {**old[ident], "color": color, "opacity": opacity}

    rows.append({**element, "zIndex": len(rows)})
assert len(rows) == len({e["id"] for e in rows}) == 573
doc["elements"] = rows
data = canon(doc)
assert sha(data) == delta["canonicalSHA256"]
output.parent.mkdir(parents=True, exist_ok=True)
with output.open("xb") as f:
    f.write(data)
