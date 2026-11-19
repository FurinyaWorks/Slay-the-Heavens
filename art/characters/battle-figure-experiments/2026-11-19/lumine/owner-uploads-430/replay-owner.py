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
parser.add_argument('--facets',type=Path,default=Path(__file__).with_name('facets.tsv'))
parser.add_argument('--medium',type=Path,required=True)
parser.add_argument('--high',type=Path,required=True)
parser.add_argument('--low',type=Path,required=True)
parser.add_argument('--level',type=int,choices=(4,5,6,7,8),default=6)
parser.add_argument('--budget',type=int,default=0)
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
pose=root/'art/characters/battle-figure-reference/2026-11-19/pose-lineup.jpeg'
crop=(0,325,221,866); w,h=crop[2],crop[3]-crop[1]
allow=[(0,0),(191,0),(191,175),(190,198),(204,240),(202,260),(209,278),(205,326),(211,331),(220,370),(220,541),(0,541)]
assert hashlib.sha256(pose.read_bytes()).hexdigest()=='bc28cb3c2b2e34c2466af7d618100c411e1b9ef7d4b0d326e10309bd0bb67114'
allow=[[0, 0], [190, 0], [189, 160], [190, 199], [187, 225], [195, 242], [204, 268], [193, 281], [209, 302], [214, 327], [213, 367], [219, 400], [219, 541], [0, 541]]
references={'medium': '4ec799a2b3fa7ebfb494777598e05f2308d7e0173432e30c1d8285925e07db79', 'high': 'd3e7e5ec624988ad107da04882e23547acfecab03c799800808044158205cd22', 'low': '920e03c122a73a9aed39eb82065c8e4d0cc68049b3b69c8d723143bf49fac68e'}
repository_equivalent={
    'medium':'2e01270dffe694490a4632215f7cf382af213a11a23bd39a377201043df9a03a',
    'high':'d0f2615556a73e153540c6e498fc1f35f387041a3cd7784b5fa9da35d8b08da0',
    'low':'c00af2225a2d02dba87ae747828839dc0b01380d734f1dd5cbfc8f9336084d34',
}
actual_references={key:hashlib.sha256(getattr(args,key).read_bytes()).hexdigest() for key in references}
for k,v in actual_references.items():
    assert v in (references[k],repository_equivalent[k]),f'Unrecognized {k} reference bytes' 
raw=Image.open(args.medium).convert('RGB').crop(crop)
rgb=np.array(raw)
valid=Image.new('L',(w,h));ImageDraw.Draw(valid).polygon(allow,fill=1)
coarse=(rgb.max(axis=2)>32)&(np.asarray(valid)>0)
count, lab, stats,_=cv2.connectedComponentsWithStats(coarse.astype('uint8'),8)
mask=lab==int(1+np.argmax(stats[1:,cv2.CC_STAT_AREA]))
src=Image.fromarray(np.dstack([rgb,np.where(mask,255,0).astype('uint8')]))
def shape(s,idx):
    if s['type']=='rect':
        x,y,a,b=s['box']; v=dict(type='rectangle',x=x+a/2,y=y+b/2,width=a,height=b)
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
    shapes=[]; groups=[]
    polys=[]
    for line in args.facets.read_text().splitlines():
        if not line.strip() or line.startswith('#'):
            continue
        layer,name,c,pts=line.split('|'); c=c.lstrip('#')
        for p in fit.polygons(shapely.make_valid(Polygon([tuple(map(float,t.split(','))) for t in pts.split()]))):
            polys.append((layer,name,p,[int(c[i:i+2],16) for i in (0,2,4)]))
    for layer,name,region,colour in polys:
        eps={4:0.9,5:1.4,6:2.0,7:3.2,8:4.8}[level]
        if layer=='face':
            eps=min(eps,2.0) if region.area<250 else min(eps,3.0)
        elif layer in ('legs','sword'):
            eps=min(eps,2.4)
        if any(x in name for x in ('eye','flower','petal','lash','iris','crystal','chevron','diamond','teal','tie','cyan edge')):
            eps=min(eps,1.2)
        for row in fit.geometry([(region,colour)],eps,w,h,exact_place,keep_holes=True):
            if row['type']=='polygon':
                pts=np.asarray(row['points'])
                # Constrained triangle failed the stock solver: split its
                # edge in two and re-apply that same solver to each piece.
                placed=None
                for i in range(3):
                    a,b,c=pts[[i,(i+1)%3,(i+2)%3]]
                    for t in (.5,.38,.62,.2,.8):
                        m=b*(1-t)+c*t
                        try: placed=exact_place([a,b,m],h)+exact_place([a,m,c],h)
                        except placement.PlacementUnavailable: continue
                        break
                    if placed is not None: break
                if placed is None:
                    for k in (0.08,-0.08,.25,-.25,.55,-.55,1.0,-1.0,1.4,-1.4,2.0,-2.0,3.5,-3.5):
                        for i in range(3):
                            shifted=pts.copy(); shifted[i]+=[k,k*.53]
                            try: placed=exact_place(shifted,h)
                            except placement.PlacementUnavailable:continue
                            break
                        if placed is not None:break
                if placed is None:
                    raise ValueError(f'Unsupported triangle in {layer}/{name}: {pts.tolist()}')
                for points,t in placed:
                    shapes.append(dict(type='nativeTriangle',points=points,placement=t,colour=row['colour']))
                    groups.append((layer,name))
            else:
                shapes.append(row);groups.append((layer,name))
    return shapes,groups

def build(out, traced):
    out.mkdir(parents=True,exist_ok=False)
    shapes,groups=trace_facets(traced)
    untrimmed=len(shapes)
    from importlib import import_module
    shapes,groups,trim=import_module('trim-native').reduce_shapes(shapes,groups,rgb,mask,args.budget)
    fit_stats=dict(Counter(layer for layer,name in groups))
    display=133; scale=125/h
    elements=[]
    for i,s in enumerate(shapes):
        item=shape(s,i)
        item['x']=item['x']*scale+(display-w*scale)/2
        item['y']=item['y']*scale+(display-h*scale)/2
        item['width']*=scale;item['height']*=scale
        elements.append(item)
    doc=dict(canvas=dict(width=display,height=display,background='transparent',mask=dict(enabled=False)),elements=elements,meta=dict(sourceType='json',sourceName='Lumine owner-uploaded medium #744'))
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
    assert set(x[0] for x in native['rows'])<={100001,100003}
    assert len(native.get('rotations',[]))==len(elements),native.keys()
    for row,xy,e in zip(native['rows'],native['rotations'],scene.elements):
        assert row[0]==editor.element_asset_id(e)
        assert abs(xy[0]-e.rotationX)<.02 and abs(xy[1]-e.rotationY)<.02
    receipt={'inputSHA256':hashlib.sha256(pose.read_bytes()).hexdigest(),'cropLTRB':crop,'cropIsolationPolygon':allow,'maxRgbThreshold':32,
       'directReferences':references,'actualInputSHA256':actual_references,'facetSha256':hashlib.sha256(args.facets.read_bytes()).hexdigest(),'traceLevel':traced,'untrimmed':untrimmed,'trim':trim,'fit':fit_stats,'nativeControls':len(elements),'assets':Counter(x[0] for x in native['rows']),'canvas':[display,display],'versions':{'opencv':cv2.__version__,'shapely':shapely.__version__,'numpy':np.__version__,'editor':'103025f9095d8089e3f9bf097f4d0c5fe039d546'},'files':{}}
    for p in sorted(out.iterdir()):
        receipt['files'][p.name]={'bytes':len(p.read_bytes()),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
    (out/'receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
    print(json.dumps(receipt),flush=True)
build(args.output,args.level)
