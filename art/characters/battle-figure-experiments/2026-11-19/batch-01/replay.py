"""Re-export the frozen artist-reviewed geometry with the existing native editor."""
import argparse
import hashlib
import json
import subprocess
import sys
from pathlib import Path

p = argparse.ArgumentParser(description=__doc__)
for key in ("editor", "candidate", "output"):
    p.add_argument("--" + key, required=True, type=Path)
a = p.parse_args()
v = json.loads((a.candidate / "verification.json").read_bytes())
assert subprocess.check_output(["git", "-C", a.editor, "rev-parse", "HEAD"], text=True).strip() == v["imageEditor"]
sys.path.insert(0, str(a.editor / "backend"))
from app import main as ed, lua_scene

def sha(data):
    return hashlib.sha256(data).hexdigest()

def canonical(value):
    return json.dumps(value, separators=(",", ":"), sort_keys=True, ensure_ascii=False).encode()

scene = (a.candidate / "editable.json").read_bytes()
assert sha(scene) == v["archiveSceneSHA256"]
doc = ed.parse_json_scene(scene.decode())
assert len(doc.elements) == v["primitiveCount"]
assert (doc.canvas.width, doc.canvas.height) == (133, 133)
a.output.mkdir(parents=True, exist_ok=False)
req = ed.ExportRequest(scene=doc, giaGroupName=v["giaGroupName"])
big = doc.model_copy(update={
    "canvas": doc.canvas.model_copy(update={"width": 532, "height": 532}),
    "elements": [e.model_copy(update={k: getattr(e, k) * 4 for k in ("x", "y", "width", "height")})
                 for e in doc.elements]})
for name, request in (("native.png", req), ("native-4x.png", ed.ExportRequest(scene=big, giaGroupName=v["giaGroupName"]))):
    png = ed.export_png(request).body
    assert sha(png) == v["fit"]["files"][name]["sha256"], name
    (a.output / name).write_bytes(png)
lua = ed.export_lua(req).body.decode().split("-- 编辑器回导数据")[0].rstrip() + "\n"
drawing = lua_scene.read_drawing(lua)
assert len(drawing["rows"]) == len(drawing["rotations"]) == v["primitiveCount"]
assert sha(canonical(drawing)) == v["literalCanonicalSHA256"]
(a.output / "literal-drawing.json").write_text(json.dumps(drawing, separators=(",", ":")) + "\n")
(a.output / "editable.json").write_bytes(ed.export_json(req).body)
print(f"{a.candidate.name}: {v['primitiveCount']} primitives; {v['controls']} standalone controls")
