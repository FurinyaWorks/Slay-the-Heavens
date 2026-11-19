"""Isolated #744 input adapter: clip source and use the project's fitter + Image Editor."""
import argparse, hashlib, importlib.util, json, sys
from collections import Counter
from pathlib import Path
import cv2,numpy as np,shapely
from shapely.geometry import Polygon
from PIL import Image,ImageDraw
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--repo',type=Path,required=True)
parser.add_argument('--editor',type=Path,required=True)
parser.add_argument('--output',type=Path,required=True)
parser.add_argument('--medium',type=Path,required=True)
parser.add_argument('--level',type=int,choices=(4,5,6,7,8),default=6)
parser.add_argument('--budget',type=int,default=0)
parser.add_argument('--profile',choices=('balanced','fidelity','literal'),default='fidelity')
args=parser.parse_args()
root=args.repo.resolve()
expected_editor='103025f9095d8089e3f9bf097f4d0c5fe039d546'
import subprocess
assert subprocess.check_output(['git','-C',str(args.editor),'rev-parse','HEAD'],text=True).strip()==expected_editor
sys.path.insert(0,str(args.editor.resolve()/'backend'))
from app import main as editor
from app import lua_scene
def load(name):
    spec=importlib.util.spec_from_file_location(name,root/'scripts/art'/f'{name}.py')
    mod=importlib.util.module_from_spec(spec); spec.loader.exec_module(mod); return mod
fit=load('segment-lowpoly'); placement=load('native-triangle-placement')
args.picture=args.medium
referenceHash='bc9118f85b57b2ca70ec027c43a520c3bb2d0f403e4f0f6e167d4297c63a1ff5'
assert hashlib.sha256(args.picture.read_bytes()).hexdigest()==referenceHash
crop=(0,280,234,834); w,h=crop[2],crop[3]-crop[1]
raw=Image.open(args.picture).convert('RGB').crop(crop)
rgb=np.array(raw)
coarse=rgb.max(axis=2)>32
count, lab, stats,_=cv2.connectedComponentsWithStats(coarse.astype('uint8'),8)
mask=lab==int(1+np.argmax(stats[1:,cv2.CC_STAT_AREA]))
src=Image.fromarray(np.dstack([rgb,np.where(mask,255,0).astype('uint8')]))
def shape(s,idx):
    if s['type'] in ('rect','ellipse'):
        x,y,a,b=s['box']; v=dict(type='rectangle' if s['type']=='rect' else 'ellipse',x=x+a/2,y=y+b/2,width=a,height=b)
    else:
        t=s['placement']; v=dict(type='triangle',x=t['cx'],y=h-t['cy'],width=t['w'],height=t['h'],rotation=t['rz'],rotationX=t['rx'],rotationY=t['ry'])
    return dict(id=f'fit-{idx:04d}',name=f'Lumine {idx:04d}',zIndex=idx,color=s['colour'],**v)
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

def trace_facets(level):
    from medium_fit import mesh
    return mesh(rgb,mask,fit,solve_no_bleed,placement,args.profile)
def build(out, traced):
    out.mkdir(parents=True,exist_ok=False)
    shapes,groups=trace_facets(traced)
    untrimmed=len(shapes)
    from importlib import import_module
    shapes,groups,trim=import_module('trim-native').reduce_shapes(shapes,groups,rgb,mask,args.budget)
    stabilizers = [
      ('face', 'near eye highlight', (115.9,67.4,13.0,12.7), '#F7E9DE'),
      ('face', 'near eye amber rim', (118.1,67.0,8.35,12.35), '#CF733A'),
      ('face', 'near eye amber glint', (119.55,71.8,5.25,6.96), '#EE8E4C'),
      ('face', 'far eye light', (142.1,69.8,6.65,9.8), '#F5D9B9'),
      ('face', 'far eye amber', (143.0,69.6,4.36,9.3), '#C97945'),
      ('face', 'flower gold heart 1', (70.5,36.7,8.65,9.4), '#E1A85D'),
      ('face', 'flower gold heart 2', (87.5,46.9,8.2,8.8), '#D99B53'),
    ]
    for layer,name,box,c in stabilizers:
        shapes.append(dict(type='ellipse',box=box,colour=c));groups.append((layer,name))
    # Connected tapered lash on top of the few native ellipse surfaces.
    from pathlib import Path
    for line in Path(__file__).with_name('focal-facets.tsv').read_text().splitlines():
        layer,name,c,pts=line.split('|')
        poly=Polygon([tuple(map(float,t.split(','))) for t in pts.split()])
        def exact(points,h):
            return solve_no_bleed(points,h) or placement.place(points,h)
        exact.Unavailable=placement.PlacementUnavailable
        for zone in fit.polygons(shapely.make_valid(poly)):
            for row in fit.geometry([(zone,[int(c[i:i+2],16) for i in (1,3,5)])],.13,w,h,exact,keep_holes=True):
                if row['type']=='polygon':raise ValueError(name)
                shapes.append(row);groups.append((layer,name))
    fit_stats=dict(Counter(layer for layer,name in groups))
    display=133; scale=125/h
    elements=[]
    for i,s in enumerate(shapes):
        item=shape(s,i)
        item['x']=item['x']*scale+(display-w*scale)/2
        item['y']=item['y']*scale+(display-h*scale)/2
        item['width']*=scale;item['height']*=scale
        elements.append(item)
    doc=dict(canvas=dict(width=display,height=display,background='transparent',mask=dict(enabled=False)),elements=elements,meta=dict(sourceType='json',sourceName='Lumine owner-uploaded newest #744'))
    scene=editor.import_scene(editor.ImportRequest(sourceType='json',content=json.dumps(doc))).scene
    req=editor.ExportRequest(scene=scene,giaGroupName='Lumine_Battle_Fit_744')
    for f,export in [('editable.json',editor.export_json),('native.lua',editor.export_lua),('native.png',editor.export_png),('native.gia',editor.export_gia)]:
        b=export(req).body;(out/f).write_bytes(b)
    for mult in (1,4):
        source=Image.new('RGBA',(display*mult,display*mult))
        source.alpha_composite(src.resize((round(w*scale*mult),round(h*scale*mult)),Image.Resampling.LANCZOS),(round((display-w*scale)/2*mult),round((display-h*scale)/2*mult)))
        source.save(out/('source.png' if mult==1 else 'source-4x.png'))
    hr=scene.model_copy(update={
       'canvas':scene.canvas.model_copy(update={'width':532,'height':532}),
       'elements':[e.model_copy(update={k:getattr(e,k)*4 for k in ('x','y','width','height')}) for e in scene.elements]})
    (out/'native-4x.png').write_bytes(editor.export_png(editor.ExportRequest(scene=hr,giaGroupName='Lumine_Battle_Fit_744')).body)
    # Rendered by the same Editor with the same normalized transforms, but four times canvas resolution.
    outdata=json.loads((out/'editable.json').read_text()); data=(out/'native.lua').read_text()
    assert editor.parse_json_scene(json.dumps(outdata)).elements==scene.elements
    # Decode the actual Lua drawing bytes, with the editor snapshot omitted.
    assert data.count('-- 编辑器回导数据')==1
    runtime=data.split('-- 编辑器回导数据')[0].rstrip()+'\n'
    (out/'runtime.lua').write_text(runtime)
    native=lua_scene.read_drawing(runtime)
    (out/'literal-drawing.json').write_text(json.dumps(native,separators=(',',':'))+'\n')
    assert len(native['rows'])==len(elements) and not native.get('textboxes') and not native.get('prefabBindings')
    assert set(x[0] for x in native['rows'])<={100001,100002,100003}
    assert len(native.get('rotations',[]))==len(elements),native.keys()
    for row,xy,e in zip(native['rows'],native['rotations'],scene.elements):
        assert row[0]==editor.element_asset_id(e)
        assert abs(xy[0]-e.rotationX)<.02 and abs(xy[1]-e.rotationY)<.02
    receipt={'inputSHA256':referenceHash,'cropLTRB':crop,'maxRgbThreshold':32,
       'profile':args.profile,'untrimmed':untrimmed,'trim':trim,'fit':fit_stats,'nativeControls':len(elements),'assets':Counter(x[0] for x in native['rows']),'canvas':[display,display],'versions':{'opencv':cv2.__version__,'shapely':shapely.__version__,'numpy':np.__version__,'editor':'103025f9095d8089e3f9bf097f4d0c5fe039d546'},'files':{}}
    for p in sorted(out.iterdir()):
        receipt['files'][p.name]={'bytes':len(p.read_bytes()),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
    (out/'receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
    print(json.dumps(receipt),flush=True)
build(args.output,args.level)
