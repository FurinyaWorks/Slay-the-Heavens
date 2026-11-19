"""Re-export the exact fitted/editor scene through the pinned Image Editor in native batches."""
import hashlib
import json
import subprocess
import sys
from pathlib import Path

editor, candidate, output = (Path(p).resolve() for p in sys.argv[1:])
pin = '103025f9095d8089e3f9bf097f4d0c5fe039d546'
assert subprocess.check_output(['git','-C',editor,'rev-parse','HEAD'], text=True).strip() == pin
sys.path.insert(0, str(editor/'backend'))
from app import main as upstream, lua_scene

source = candidate/'editable.json'
literal = candidate/'literal-drawing.json'
expected = json.loads(literal.read_text())
scene = upstream.parse_json_scene(source.read_text())
assert len(scene.elements) == len(expected['rows']) == len(expected['rotations'])
output.mkdir(parents=True)
batches = []
for i in range(0, len(scene.elements), 60):
    name = f'LumineArtBatch{1+i//60:02d}'
    subset = scene.model_copy(update={'elements': scene.elements[i:i+60]})
    request = upstream.ExportRequest(scene=subset, giaGroupName='Lumine_Battle_Fit_744')
    rendered = upstream.export_lua(request).body.decode()
    script = rendered.split('-- 编辑器回导数据')[0].rstrip()+'\n'
    assert rendered.count('-- 编辑器回导数据') == script.count('local IMAGE_PREFAB_ID = 0') == 1
    drawing = lua_scene.read_drawing(script)
    assert drawing['rows'] == expected['rows'][i:i+60], name
    assert drawing['rotations'] == expected['rotations'][i:i+60], name
    assert drawing['root'] == expected['root'], name
    (output/f'{name}.lua').write_text(script)
    batches.append(dict(name=name, start=i, count=len(drawing['rows']),
                        sha256=hashlib.sha256(script.encode()).hexdigest()))
(output/'batches.json').write_text(json.dumps(dict(editor=pin, canvas=expected['root'][2:4], literalSha256=hashlib.sha256(literal.read_bytes()).hexdigest(),
    sceneSha256=hashlib.sha256(source.read_bytes()).hexdigest(), batches=batches), indent=2)+'\n')
print(json.dumps(batches))
