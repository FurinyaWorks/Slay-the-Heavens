"""Lumine face-only native refresh from traced owner-reference planes."""
import argparse, hashlib, importlib.util, json, sys
from collections import Counter
from pathlib import Path
from PIL import Image
import numpy as np
from shapely.geometry import Polygon
from shapely.validation import make_valid
p=argparse.ArgumentParser(description=__doc__)
for key in ('repo','editor','baseline','source','output'):
    p.add_argument('--'+key,required=True,type=Path)
a=p.parse_args()
assert hashlib.sha256(a.source.read_bytes()).hexdigest()=='bc9118f85b57b2ca70ec027c43a520c3bb2d0f403e4f0f6e167d4297c63a1ff5'
sys.path.insert(0,str(a.editor/'backend'))
from app import main as ed, lua_scene
def load(name):
    spec=importlib.util.spec_from_file_location(name,a.repo/'scripts/art'/f'{name}.py')
    m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
fit,placement=load('segment-lowpoly'),load('native-triangle-placement')
def solve_no_bleed(pts,height):
    pts=np.asarray(pts,dtype=float)
    native=pts.copy();native[:,1]=height-native[:,1]
    candidates=[]
    for a in range(3):
        for b,c in [((a+1)%3,(a+2)%3),((a+2)%3,(a+1)%3)]:
            r=placement.solve(*native[[a,b,c]])
            if r is not None: candidates.append(r)
    if candidates:
        return [(pts.tolist(),min(candidates,key=lambda x:abs(x['rx'])+abs(x['ry'])))]
    return None

def exact_place(points,height):
    pts=np.asarray(points,dtype=float)
    placed=solve_no_bleed(pts,height)
    if placed:return placed
    for i in range(3):
        a,b,c=pts[[i,(i+1)%3,(i+2)%3]]
        v=c-b
        if not (v@v):continue
        t0=float((a-b)@v/(v@v))
        proposals=[.5,.33,.67,.2,.8,t0,*(np.arange(1,16)/16)]
        for t in proposals:
            if t<=1e-4 or t>=1-1e-4:continue
            m=b+t*v
            left=solve_no_bleed([a,b,m],height)
            if left is None:continue
            right=solve_no_bleed([a,m,c],height)
            if right is not None:return left+right
    return placement.place(points,height)
exact_place.Unavailable=placement.PlacementUnavailable

a.output.mkdir(parents=True,exist_ok=False)
base=ed.parse_json_scene(a.baseline.read_text())
assert len(base.elements)==549
doc=json.loads(a.baseline.read_text())
retired={*range(530,535),*range(537,549)}
keep=[i for i in range(549) if i not in retired]
full=[doc['elements'][i] for i in keep]
for i,v in enumerate(full): v['zIndex']=i
h,w,S=554,234,125/554
table=Path(__file__).with_name('face.tsv')
tune=json.loads(table.with_name('face-tune.json').read_text())
for line in table.read_text().splitlines():
    name,color,points=line.split('|')
    dx,dy,color=tune[name]
    g=make_valid(Polygon([tuple(map(float,t.split(','))) for t in points.split()]))
    for poly in fit.polygons(g):
        for q in fit.geometry([(poly,[int(color[i:i+2],16) for i in (1,3,5)])],.12,w,h,exact_place,keep_holes=True):
            t=q['placement'];idx=len(full)
            full.append(dict(id=f'face-facet-{idx:04}',name=name,zIndex=idx,type='triangle',x=t['cx']*S+(133-w*S)/2+dx,y=(h-t['cy'])*S+4+dy,width=t['w']*S,height=t['h']*S,rotation=t['rz'],rotationX=t['rx'],rotationY=t['ry'],color=color))
doc['elements']=full
scene=ed.parse_json_scene(json.dumps(doc))
assert [e.model_dump(exclude={'zIndex'}) for e in scene.elements[:len(keep)]]==[base.elements[i].model_dump(exclude={'zIndex'}) for i in keep]
req=ed.ExportRequest(scene=scene,giaGroupName='Lumine_Battle_Fit_744')
for path,fn in [('editable.json',ed.export_json),('native.lua',ed.export_lua),('native.png',ed.export_png),('native.gia',ed.export_gia)]:
    (a.output/path).write_bytes(fn(req).body)
big=scene.model_copy(update={'canvas':scene.canvas.model_copy(update={'width':532,'height':532}),'elements':[e.model_copy(update={k:getattr(e,k)*4 for k in ('x','y','width','height')}) for e in scene.elements]})
(a.output/'native-4x.png').write_bytes(ed.export_png(ed.ExportRequest(scene=big,giaGroupName='Lumine_Battle_Fit_744')).body)
raw=(a.output/'native.lua').read_text().split('-- 编辑器回导数据')[0].rstrip()+'\n'
(a.output/'runtime.lua').write_text(raw)
drawing=lua_scene.read_drawing(raw)
assert len(drawing['rows'])==len(scene.elements) and not drawing.get('textboxes') and not drawing.get('prefabBindings')
assert ed.parse_json_scene((a.output/'editable.json').read_text()).elements==scene.elements
prev=json.loads((a.baseline.parent/'literal-drawing.json').read_text())
for key in ('rows','rotations'):
    assert [list(r) for r in drawing[key][:len(keep)]]==[prev[key][i] for i in keep]
(a.output/'literal-drawing.json').write_text(json.dumps(drawing,separators=(',',':'))+'\n')
print(len(scene.elements),Counter(x[0] for x in drawing['rows']))
