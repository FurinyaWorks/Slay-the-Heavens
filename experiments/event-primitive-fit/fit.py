"""Batch candidate using TASK-94 contour/triangulation and performance-pack rectangle baseline."""
import argparse, concurrent.futures, hashlib, importlib.util, json, os, re, runpy, warnings
from pathlib import Path
import cv2
import numpy as np
import shapely
from PIL import Image, ImageDraw, ImageColor

SIDE = 330
GRID = 144
BUDGETS = (32, 60, 96)
def load(path, name):
    spec = importlib.util.spec_from_file_location(name, path)
    module=importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

def init(root):
    global fitter, placement, rectangles, hashes
    warnings.filterwarnings('ignore', category=DeprecationWarning)
    cv2.setNumThreads(1)
    src=root/'scripts/art'
    fitter=load(src/'segment-lowpoly.py','contours')
    placement=load(src/'native-triangle-placement.py','placement').place
    rectangles=runpy.run_path(str(src/'build-performance-pack.py'))['rectangles']
    hashes={name: hashlib.sha256((src/name).read_bytes()).hexdigest() for name in ('segment-lowpoly.py','native-triangle-placement.py','build-performance-pack.py')}

def render(shapes, size, total=SIDE, transparent=False):
    im=Image.new('RGBA' if transparent else 'RGB',(size,size))
    draw=ImageDraw.Draw(im)
    s=size/total
    for sh in shapes:
        color=(*ImageColor.getrgb(sh['colour']),round(sh.get('opacity',1)*255)) if transparent else sh['colour']
        if sh['type']=='rect':
            x,y,w,h=sh['box']; draw.rectangle((x*s,y*s,(x+w)*s,(y+h)*s),fill=color)
        else:
            draw.polygon([(x*s,y*s) for x,y in sh['points']],fill=color)
    return im

def fidelity(ref, out):
    a=np.asarray(ref,dtype=np.float32); b=np.asarray(out,dtype=np.float32)
    dif=np.abs(a-b).mean(axis=2)
    l=np.asarray(ref.convert('L'),dtype=np.float32)
    gx,gy=np.gradient(l)
    w=1+np.minimum(np.hypot(gx,gy)/35, 1.25)
    return float(dif.mean()),float((dif*w).sum()/w.sum())

def case(arg):
    path,out=map(Path,arg)
    original=Image.open(path); assert original.width==original.height
    transparent=original.mode=='RGBA'
    im=original.convert('RGBA' if transparent else 'RGB')
    ref=im.resize((GRID,GRID),Image.Resampling.LANCZOS)
    mattes=('#242126','#737079') if transparent else ()
    arr=np.asarray(ref)
    base='#'+''.join(f'{x:02X}' for x in np.median(arr.reshape(-1,3),axis=0).astype(int))
    best={}
    def consider(shapes, plan):
        shapes=[s for s in shapes if s['cost'] in (1,2)]
        for b in BUDGETS:
            n=0; used=[]
            for sh in shapes:
                if n+sh['cost']<=b:
                    used.append(sh)
                    n+=sh['cost']
            # Rectangle baseline is a complete canvas; never crop its shape pool.
            if not used or (plan['method']=='repo-rectangle-grid' and len(shapes)!=len(used)):continue
            candidate=render(used,GRID,transparent=transparent)
            if transparent:
                contrast=[fidelity(Image.alpha_composite(Image.new('RGBA',ref.size,c),ref).convert('RGB'),Image.alpha_composite(Image.new('RGBA',ref.size,c),candidate).convert('RGB')) for c in mattes]
                mae,edge=np.mean(contrast,axis=0)
            else:mae,edge=fidelity(ref,candidate)
            score=mae*.65+edge*.35
            key=(round(score,8),n)
            if b not in best or key<best[b][0]:
                best[b]=(key,used,n,mae,edge,plan)
    for cells in range(4,27 if transparent else 13):
        rows,_=rectangles(im,(cells,cells),(SIDE,SIDE),transparent)
        shapes=[]
        for row in rows:
            _,cx,cy,w,h,*_=row
            rgb=row[-4:-1]
            shapes.append({'type':'rect','box':[cx+(SIDE-w)/2,(SIDE-h)/2-cy,w,h],'colour':'#'+''.join(f'{v:02X}' for v in rgb),'cost':1,**({'opacity':row[-1]/255} if transparent else {})})
        consider(shapes,{'method':'repo-rectangle-grid','cells':cells})
    for colors in (() if transparent else (5,8,12)):
        parts=fitter.regions(arr,colors,minimum_area=16,spatial=5,color_range=25)
        for eps in (1.8,3.2,5.2,7.5,10,14,20):
            raw=fitter.geometry(parts,eps,GRID,GRID,placement)
            shapes=[{'type':'rect','box':[0,0,SIDE,SIDE],'colour':base,'cost':1}]
            scale=SIDE/GRID
            for sh in raw:
                if sh['type']=='rect':
                    sh['box']=[x*scale for x in sh['box']]
                else:
                    sh['points']=[[x*scale,y*scale] for x,y in sh['points']]
                    if sh.get('placement'):
                        tr=dict(sh['placement'])
                        for k in ('cx','cy','w','h'):tr[k]*=scale
                        sh['placement']=tr
                shapes.append(sh)
            consider(shapes,{'method':'repo-TASK94-contour-native','colors':colors,'epsilon':eps,'workCanvas':GRID,'minimumArea':16})
    ident=path.stem
    assert re.fullmatch(r'[a-z0-9_]+',ident)
    dest=out/ident;dest.mkdir(parents=True,exist_ok=True)
    result={'id':ident,'sourceSha256':hashlib.sha256(path.read_bytes()).hexdigest(),'sourceBytes':path.stat().st_size,'sourceSize':im.size,'sourceMode':original.mode,'alphaPreserved':transparent,'canvas':[SIDE,SIDE],'repoTools':hashes,'tiers':{}}
    for b,(_,shapes,n,mae,edge,plan) in best.items():
        fitted=render(shapes,SIDE,transparent=transparent)
        if transparent:
            fitted.save(dest/f'{b}-alpha.png');fitted=Image.alpha_composite(Image.new('RGBA',fitted.size,mattes[0]),fitted).convert('RGB')
        jpeg=dest/f'{b}.jpg';fitted.save(jpeg,quality=86,optimize=True,subsampling=0)
        result['tiers'][str(b)]={'geometry':len(shapes),'projectedImageControls':n,'maeAt144':round(mae,3),'edgeWeightedMaeAt144':round(edge,3),'method':plan,'shapes':shapes}
    assert set(result['tiers'])==set(map(str,BUDGETS))
    (dest/'fit.json').write_text(json.dumps(result,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8')
    return ident,[(b,info['projectedImageControls'],info['maeAt144'],info['method']['method']) for b,info in result['tiers'].items()]

if __name__=='__main__':
    ap=argparse.ArgumentParser(); ap.add_argument('repo',type=Path);ap.add_argument('sources',type=Path);ap.add_argument('out',type=Path);ap.add_argument('ids',nargs='*');ap.add_argument('--workers',type=int,default=4);args=ap.parse_args()
    files=sorted(args.sources.glob('*.png'))
    if args.ids:files=[p for p in files if p.stem in args.ids]
    assert files and (not args.ids or len(files)==len(set(args.ids)))
    with concurrent.futures.ProcessPoolExecutor(args.workers, initializer=init,initargs=(args.repo.resolve(),)) as executor:
        for x in executor.map(case,[(str(p),str(args.out)) for p in files]):
            print(json.dumps(x),flush=True)
