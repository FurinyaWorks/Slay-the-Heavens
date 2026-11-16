import json, math, itertools, importlib.util, sys
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw
OUT=Path(__file__).parent; src=Path(sys.argv[2]).resolve()
spec=importlib.util.spec_from_file_location('placement',Path(sys.argv[1]).resolve()/'scripts/art/native-triangle-placement.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
def solve(t):
 candidates=[p for order in itertools.permutations(t) if (p:=m.solve(*order)) is not None]
 return min(candidates,key=lambda p:max(p['w'],p['h'])) if candidates else None
rows=[]; receipts=[]
def row(p,color):
 rows.append([100003,p['cx']-254,p['cy']-254,p['w'],p['h'],.5,.5,.5,.5,.5,.5,1,1,p['rz'],*bytes.fromhex(color[1:]),255,p['rx'],p['ry'],0])
for s in json.loads((src/'flat-prototype.json').read_text())['shapes']:
 if s['type']=='ellipse':
  x,y,w,h=[s[k]*4 for k in ('x','y','width','height')];rows.append([100002,x-254,254-y,w,h,.5,.5,.5,.5,.5,.5,1,1,0,*bytes.fromhex(s['color'][1:]),255,0,0,0])
 elif s['type']=='triangle':row(s['placement'],s['color'])
 elif s['half']==0:
  t=np.asarray(s['authoredTriangle'])*4;t[:,1]=508-t[:,1]; candidates=[]
  for a in range(3):
   b,c=(a+1)%3,(a+2)%3
   for f in np.linspace(.01,.99,99):
    q=t[b]+f*(t[c]-t[b]);p1=solve([t[a],t[b],q]);p2=solve([t[a],q,t[c]])
    if p1 and p2:candidates.append((max(p1['w'],p1['h'],p2['w'],p2['h']),p1,p2,f,a))
  if not candidates:raise RuntimeError(str(t))
  _,p1,p2,f,a=min(candidates,key=lambda v:v[0]);row(p1,s['color']);row(p2,s['color']);receipts.append(dict(original=s['authoredTriangle'],splitEdgeOpposite=a,fraction=float(f),placements=[p1,p2]))
assert len(rows)==41 and all(r[20]==0 for r in rows)
(OUT/'native-layout.json').write_text(json.dumps(dict(width=508,height=508,rows=rows),indent=2));(OUT/'conversion-receipts.json').write_text(json.dumps(receipts,indent=2))
im=Image.new('RGBA',(1016,1016));d=ImageDraw.Draw(im)
for r in rows:
 color=tuple(r[14:18]);x,y=r[1]+254,254-r[2];w,h=r[3:5]
 if r[0]==100002:d.ellipse(((x-w/2)*2,(y-h/2)*2,(x+w/2)*2,(y+h/2)*2),fill=color)
 else:
  rx,ry,rz=np.deg2rad([r[18],r[19],r[13]]);cx,sx,cy,sy,c,s=math.cos(rx),math.sin(rx),math.cos(ry),math.sin(ry),math.cos(rz),math.sin(rz);mat=np.array([[cy*c+sy*sx*s,-cy*s+sy*sx*c],[cx*s,cx*c]]);p=np.array([[0,h/2],[-w/2,-h/2],[w/2,-h/2]])@mat.T+[r[1]+254,r[2]+254];d.polygon([(px*2,(508-py)*2) for px,py in p],fill=color)
im.resize((508,508),Image.Resampling.LANCZOS).save(OUT/'native-reconstruction.png');print('41 images, 44 controls, zero mask; exact split geometry')
