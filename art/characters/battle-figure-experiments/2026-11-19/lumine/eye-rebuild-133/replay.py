"""Replay the reviewed native deltas on the exact prior edge-corrected scene."""
import argparse, hashlib, json, subprocess, sys
from pathlib import Path
p=argparse.ArgumentParser(description=__doc__)
for k in ('editor','baseline','output'): p.add_argument('--'+k,required=True,type=Path)
a=p.parse_args()
pin='103025f9095d8089e3f9bf097f4d0c5fe039d546'
assert subprocess.check_output(['git','-C',a.editor,'rev-parse','HEAD'],text=True).strip()==pin
sys.path.insert(0,str(a.editor/'backend'))
from app import main as ed, lua_scene
recipe=json.loads(Path(__file__).with_name('native-delta.json').read_text())
canon=lambda v:json.dumps(v,separators=(',',':'),sort_keys=True,ensure_ascii=False).encode()
source=json.loads(a.baseline.read_text())
assert hashlib.sha256(canon(source)).hexdigest()==recipe['baselineCanonicalSHA256']
by_id={v['id']:v for v in source['elements']}
assert len(by_id)==recipe['baselineShapes']
combined=[]
for i,(id,delta) in enumerate(recipe['layers']):
    merged={**by_id.get(id,{}),**delta,'id':id,'zIndex':i}
    combined.append(merged)
source['elements']=combined
doc=ed.parse_json_scene(json.dumps(source))
assert len(doc.elements)==recipe['targetShapes']
out=a.output
out.mkdir(parents=True,exist_ok=False)
req=ed.ExportRequest(scene=doc,giaGroupName='Lumine_Battle_Fit_744')
for f,m in [('editable.json',ed.export_json),('native.png',ed.export_png)]:
    (out/f).write_bytes(m(req).body)
big=doc.model_copy(update={'canvas':doc.canvas.model_copy(update={'width':532,'height':532}),
    'elements':[e.model_copy(update={k:getattr(e,k)*4 for k in ('x','y','width','height')}) for e in doc.elements]})
(out/'native-4x.png').write_bytes(ed.export_png(ed.ExportRequest(scene=big,giaGroupName='Lumine_Battle_Fit_744')).body)
lua=ed.export_lua(req).body.decode().split('-- 编辑器回导数据')[0].rstrip()+'\n'
drawing=lua_scene.read_drawing(lua)
assert len(drawing['rows'])==recipe['targetShapes'] and len(drawing['rotations'])==recipe['targetShapes']
(out/'literal-drawing.json').write_text(json.dumps(drawing,separators=(',',':'))+'\n')
for f,h in recipe['expectedExportsSHA256'].items():
    assert hashlib.sha256((out/f).read_bytes()).hexdigest()==h, f
