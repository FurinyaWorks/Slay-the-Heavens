import math, itertools, json, importlib.util, sys
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw
here=Path(__file__).resolve().parent
root=Path(sys.argv[1]).resolve()

def cross(a,b,c):
 return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])

def triangulate(v):
 v=[p for i,p in enumerate(v) if abs(cross(v[i-1],p,v[(i+1)%len(v)]))>1e-7]
 if sum(a[0]*b[1]-a[1]*b[0] for a,b in zip(v,v[1:]+v[:1]))<0:v.reverse()
 while len(v)>3:
  choices=[]
  for i,b in enumerate(v):
   a,c=v[i-1],v[(i+1)%len(v)]
   if cross(a,b,c)<1e-7:continue
   if any(p not in (a,b,c) and min(cross(a,b,p),cross(b,c,p),cross(c,a,p))>=-1e-7 for p in v):continue
   choices.append((cross(a,b,c)/sum(math.dist(u,w)**2 for u,w in [(a,b),(b,c),(c,a)]),i,a,b,c))
  if not choices:raise ValueError(v)
  _,i,a,b,c=max(choices)
  yield [a,b,c]
  del v[i]
 if len(v)==3 and abs(cross(*v))>1e-7:yield v

spec=importlib.util.spec_from_file_location('geometry',root/'scripts/art/native-triangle-placement.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
def placeable(t):
 opts=[p for v in itertools.permutations(t) if (p:=m.solve(*v))]
 return opts

def triangles(t):
 if placeable(t): return [t]
 for a in range(3):
  b,c=(a+1)%3,(a+2)%3
  for f in np.linspace(.01,.99,99):
   q=t[b]+f*(t[c]-t[b]); x=np.array([t[a],t[b],q]); y=np.array([t[a],q,t[c]])
   if placeable(x) and placeable(y): return [x,y]
 raise ValueError(str(t))
scale=4; W=508; rows=[]; samples=[]; errors=[]
for line in (here/'planes.txt').read_text().splitlines():
 if not line or line.startswith('#'):continue
 token,*items=line.split(); rgb=list(bytes.fromhex(token.lstrip('@')))
 pts=[tuple(float(x)*scale for x in p.split(',')) for p in items]
 if token.startswith('@'):
  (x,y),(w,h)=pts
  rows.append([100002,x-W/2,W/2-y,w,h,.5,.5,.5,.5,.5,.5,1,1,0,*rgb,255,0,0,0])
  samples.append(('ellipse',rgb,[(x-w/2,y-h/2),(x+w/2,y+h/2)]));continue
 for t in [v for t0 in triangulate(pts) for v in triangles(np.array(t0,dtype=float)*[1,-1]+[0,W])]:
  vertices=np.array(t,dtype=float)
  native=vertices.copy()
  opts=[m.solve(*p) for p in itertools.permutations(native)]; opts=[p for p in opts if p]
  if opts:
   p=min(opts,key=lambda p:max(p['rx'],p['ry']))
   rx,ry,rz=np.deg2rad([p['rx'],p['ry'],p['rz']]); cx,sx,cy,sy,c,s=math.cos(rx),math.sin(rx),math.cos(ry),math.sin(ry),math.cos(rz),math.sin(rz)
   M=np.array([[cy*c+sy*sx*s,-cy*s+sy*sx*c],[cx*s,cx*c]])
   seen=np.array([[0,p['h']/2],[-p['w']/2,-p['h']/2],[p['w']/2,-p['h']/2]])@M.T+[p['cx'],p['cy']]
   errors.append(min(np.max(np.linalg.norm(seen-native[list(i)],axis=1)) for i in itertools.permutations(range(3))))
   rows.append([100003,p['cx']-W/2,p['cy']-W/2,p['w'],p['h'],.5,.5,.5,.5,.5,.5,1,1,p['rz'],*rgb,255,p['rx'],p['ry'],0])
   samples.append(('polygon',rgb,[(x,W-y) for x,y in seen]));continue
  raise AssertionError('No mask fallback permitted')
assert max(errors)<1e-6 and all(sum(abs(x)>1e-9 for x in r[18:20])<=1 for r in rows)
img=Image.new('RGBA',(W*3,W*3)); d=ImageDraw.Draw(img)
for typ,rgb,pts in samples:
 getattr(d,typ)([(x*3,y*3) for x,y in pts],fill=tuple(rgb+[255]))
img.resize((W,W),Image.Resampling.LANCZOS).save(here/'native-reconstruction.png')
(here/'native-layout.json').write_text(json.dumps(dict(width=W,height=W,rows=rows),separators=(',',':'))+'\n')
calculated=2+math.ceil(len(rows)/60)
report=dict(graphics=len(rows),containersPredicted=calculated,artControlsPredicted=len(rows)+calculated,sourceSHA256=json.loads((here/'source.json').read_text())['sourceSHA256'],exactTransformMaxError=max(errors),engineVerified=False)
(here/'report.json').write_text(json.dumps(report,indent=2)+'\n')
print(report)
