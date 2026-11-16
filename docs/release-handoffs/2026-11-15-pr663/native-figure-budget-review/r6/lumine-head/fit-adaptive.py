from pathlib import Path
import sys,math,json,hashlib
from PIL import Image
import numpy as np
p=Path(__file__).resolve().parent
# Same source and exact registered crop as the fixed-palette test.
sys.argv=['fit-source.py','nothing','1','18','96','4','true','ignore']
# Import only source and coordinate functions (no CLI side effects).
ns={'__file__':str(p/'fit-source.py')}
exec((p/'fit-source.py').read_text().split("if mode=='fit':")[0],ns)
source=ns['source'];src=ns['src']
s=source.resize((133,122),Image.Resampling.LANCZOS)
a=np.asarray(s).copy()
h,w=a.shape[:2];raw=a[:,:,3]
# Round but do not throw away antialiased edge bits above the visibility threshold.
alpha=np.where(raw>=64,np.rint(np.rint(raw.astype(float)/51)*51),0).astype('uint8')
valid=alpha>0
tol=float(__import__('os').environ.get('TOL','23'))
name=__import__('os').environ.get('NAME',f'adaptive-{tol:g}')
region=(p/name);region.mkdir(exist_ok=True)
Y,X=np.indices((h,w))
crit=(((X>=73)&(X<=80)&(Y>=16)&(Y<=24))|((X>=63)&(X<=74)&(Y>=8)&(Y<=17)))
rects=[];rem=valid.copy()
for y in range(h):
 for x in range(w):
  if not rem[y,x]:continue
  maxw=w-x;best=(0,1,1)
  for y2 in range(y,min(h,y+16)):
   rr=(rem[y2,x:x+maxw] & (alpha[y2,x:x+maxw]==alpha[y,x]))
   ix=np.flatnonzero(~rr)
   if ix.size:maxw=min(maxw,int(ix[0]))
   if maxw==0:break
   for rw in range(maxw,0,-1):
    rh=y2-y+1
    if rw*rh<=best[0]:break
    zone=a[y:y+rh,x:x+rw,:3].astype(float);c=zone.mean(axis=(0,1))
    d=np.sqrt(np.mean((zone-c)**2,axis=2))
    allowed=np.where(crit[y:y+rh,x:x+rw],tol*.46,tol)
    if np.all(d<=allowed):
     best=(rw*rh,rw,rh); break
  _,rw,rh=best
  c=np.rint(a[y:y+rh,x:x+rw,:3].mean(axis=(0,1))).astype(int)
  rects.append((x,y,rw,rh,[*map(int,c),int(alpha[y,x])]))
  rem[y:y+rh,x:x+rw]=False
assert not rem.any()
rows=[];out=np.zeros_like(a)
for x,y,rw,rh,c in rects:
 rows.append([100001,x+rw/2-w/2,h/2-y-rh/2,rw,rh,.5,.5,.5,.5,.5,.5,1,1,0,*c,0,0,0])
 out[y:y+rh,x:x+rw]=c
count=len(rows);controllers=2+math.ceil(count/60)
tobytes=lambda rgba:np.asarray(Image.alpha_composite(Image.new('RGBA',(w,h),(42,53,68,255)),rgba).convert('RGB'),dtype=float)
e=np.abs(tobytes(s)-tobytes(Image.fromarray(out,'RGBA'))).mean(axis=2)
face=e[crit & valid].mean();body=e[~crit & valid].mean()
a1=a[:,:,3]>127;a2=out[:,:,3]>127
rec=dict(controls=count+controllers,images=count,containers=controllers,logicalSize=[w,h],tol=tol,protectedAreaMae=float(face),otherMae=float(body),silhouetteIou=float((a1&a2).sum()/(a1|a2).sum()),sourceSha256=hashlib.sha256(src.read_bytes()).hexdigest(),sourceCommit='1cc5479b713edab6fd26db4e20f8eb22b7401cb2')
print(json.dumps(rec))
(region/'native-layout.json').write_text(json.dumps({**rec,'rows':rows},separators=(',',':'))+'\n')
Image.fromarray(out,'RGBA').save(region/'candidate.png');s.save(region/'source-same-grid.png')
