"""Protect the face exactly; rank body controls using the pinned Image Editor's pixel coverage."""
import argparse, hashlib, io, json, subprocess, sys
from collections import Counter
from pathlib import Path
from PIL import Image
import numpy as np
p=argparse.ArgumentParser(description=__doc__)
for k in ('editor','baseline','comparison','output'): p.add_argument('--'+k,required=True,type=Path)
p.add_argument('--target',default=490,type=int)
a=p.parse_args()
pin='103025f9095d8089e3f9bf097f4d0c5fe039d546'
assert subprocess.check_output(['git','-C',a.editor,'rev-parse','HEAD'],text=True).strip()==pin
sys.path.insert(0,str(a.editor/'backend'))
from app import main as ed, lua_scene
baseline=a.baseline
doc=ed.parse_json_scene((baseline/'editable.json').read_text())
assert len(doc.elements)==598
canvas=doc.canvas
def scaled(scene,m):
    if m==1:return scene
    return scene.model_copy(update={'canvas':canvas.model_copy(update={'width':133*m,'height':133*m}),'elements':[
        e.model_copy(update={k:getattr(e,k)*m for k in ('x','y','width','height')}) for e in scene.elements]})
def pixels(p):return np.asarray(Image.open(p).convert('RGBA'),dtype=np.int32)
def rgb(rgbstr):return [int(rgbstr[i:i+2],16) for i in (1,3,5)]
modes=[]
locked=np.zeros(598,dtype=bool)
alpha_truth=[]
for m in (1,4):
    n=133*m;s=scaled(doc,m)
    c=s.canvas
    pix=[]
    for i,e in enumerate(s.elements):
        assert e.opacity==1
        b=ed.scene_to_png_bytes(s.model_copy(update={'elements':[e]}))
        rendered=pixels(io.BytesIO(b))
        # For native geom this encodes the exact PIL coverage of the pinned Image Editor.
        q=np.flatnonzero(rendered[:,:,3].ravel()==255)
        pix.append(q)
        if (q//n<32*m).any(): locked[i]=True
    suff='' if m==1 else '-4x'
    ref=pixels(a.comparison/f'source{suff}.png').reshape(-1,4)
    current=pixels(baseline/f'native{suff}.png').reshape(-1,4)
    backgrounds=np.array([32,38,48])
    blend=lambda p0:np.rint(p0[:,:3]*(p0[:,3:]/255)+backgrounds*(1-p0[:,3:]/255)).astype(np.int32)
    real=blend(ref); before=blend(current)
    colors=np.array([backgrounds,*[rgb(e.color) for e in s.elements]])
    y,x=np.mgrid[:n,:n]/m
    w=np.ones((n,n))
    w[((y>56)&(y<96)&(x>59)&(x<78))]*=1.4
    w[((y>100)&(x>71)&(x<84))|((y>57)&(x<59)&(x>49))]*=1.5
    w[((y>39)&(y<53)&(x>64)&(x<74))]*=4
    w[((y>67)&(y<119)&(x>(.37*y+28))&(x<(.37*y+37)))]*=3
    w=w.ravel()/m**2
    modes.append((n,pix,real,before,colors,w,current))
active=np.ones(598,dtype=bool);removed=[]
while active.sum()>a.target:
    losses=np.zeros(598)
    protected=np.zeros(598,dtype=bool)
    for n,regions,ref,before,colors,weight,original in modes:
        top=np.zeros(n*n,dtype=np.int16)
        for i,r in enumerate(regions):
            if active[i]: top[r]=i+1
        previous=np.zeros_like(top)
        if not removed:
            assert np.array_equal(top>0,original[:,3]>0)
            assert (colors[top][top>0]==original[top>0,:3]).all()
        for i,r in enumerate(regions):
            if not active[i]:continue
            visible=r[top[r]==i+1]
            if visible.size:
                protected[i]|=(visible//n<32*(n//133)).any()
                prev=previous[visible]
                v=colors[prev]
                prior=colors[i+1]
                truth=ref[visible]
                old=before[visible]
                raw_loss=(abs(v-truth)-abs(prior-truth)).mean(-1)
                drift=(abs(v-old)-abs(prior-old)).mean(-1)
                silhouette=(prev==0)*(120000 if n==133 else 18000)
                losses[i]=losses[i]+((.28*raw_loss+.72*drift+silhouette)*weight[visible]).sum()
            previous[r]=i+1
    safe=np.where(active&~protected)[0]
    i=min(safe,key=lambda j:(losses[j],j))
    active[i]=False;removed.append(int(i))
a.output.mkdir(parents=True,exist_ok=False)
state=doc.model_copy(update={'elements':[e.model_copy(update={'zIndex':i}) for i,e in enumerate(e for i,e in enumerate(doc.elements) if active[i])]})
req=ed.ExportRequest(scene=state,giaGroupName='Lumine_Battle_Fit_744')
for f,method in [('editable.json',ed.export_json),('native.png',ed.export_png),('native.lua',ed.export_lua)]:
    (a.output/f).write_bytes(method(req).body)
(a.output/'native-4x.png').write_bytes(ed.export_png(ed.ExportRequest(scene=scaled(state,4),giaGroupName='Lumine_Battle_Fit_744')).body)
raw=(a.output/'native.lua').read_text().split('-- 编辑器回导数据')[0].rstrip()+'\n'
d=lua_scene.read_drawing(raw)
prev=json.loads((baseline/'literal-drawing.json').read_text())
for k in ('rows','rotations'):
    assert d[k]==[v for i,v in enumerate(prev[k]) if active[i]]
assert state.elements==ed.parse_json_scene((a.output/'editable.json').read_text()).elements
(a.output/'literal-drawing.json').write_text(json.dumps(d,separators=(',',':'))+'\n')
proof={}
for m in (1,4):
    suffix='' if m==1 else '-4x'
    A=pixels(baseline/f'native{suffix}.png');B=pixels(a.output/f'native{suffix}.png');R=pixels(a.comparison/f'source{suffix}.png')
    assert (A[:32*m]==B[:32*m]).all()
    L=(A[:,:,3]>0)|(B[:,:,3]>0)
    diff=(A!=B).any(-1)
    proof[str(133*m)]=dict(headChangedPixels=int(diff[:32*m].sum()),characterPixels=int(L.sum()),
       nonHeadChangedPixels=int(diff[32*m:].sum()),silhouetteChangedPixels=int((A[:,:,3]!=B[:,:,3]).sum()),
       coverageIoU=float(((A[:,:,3]>0)&(B[:,:,3]>0)).sum()/L.sum()),
       referenceChannelMAEBefore=float(abs(A[L,:3]-R[L,:3]).mean()),
       referenceChannelMAEAfter=float(abs(B[L,:3]-R[L,:3]).mean()))
data=dict(editor=pin,shapes=len(d['rows']),assetCounts=Counter(v[0] for v in d['rows']),groups=(len(d['rows'])+59)//60,host=1,
    lockedHeadControls=int(locked.sum()),removedIndicesZeroBased=removed,renderProof=proof)
(a.output/'budget-proof.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(data))
