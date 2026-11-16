import json,math,itertools,importlib.util,sys
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw
out=Path(__file__).parent
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

spec=importlib.util.spec_from_file_location('p',root/'scripts/art/native-triangle-placement.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
rows=[]
def solve(t):
 v=[p for o in itertools.permutations(t) if (p:=m.solve(*o)) is not None];return min(v,key=lambda p:max(p['w'],p['h']))if v else None
def emit(p,c):rows.append([100003,p['cx']-254,p['cy']-254,p['w'],p['h'],.5,.5,.5,.5,.5,.5,1,1,p['rz'],*bytes.fromhex(c[1:]),255,p['rx'],p['ry'],0])
def poly(c,pts):
 for tri in triangulate(pts):
  t=np.array(tri)*4;t[:,1]=508-t[:,1];p=solve(t)
  if p:emit(p,c);continue
  candidates=[]
  for a in range(3):
   b,d=(a+1)%3,(a+2)%3
   for f in np.linspace(.05,.95,19):
    q=t[b]+f*(t[d]-t[b]);x,y=solve([t[a],t[b],q]),solve([t[a],q,t[d]])
    if x and y:candidates.append((max(x['w'],x['h'],y['w'],y['h']),x,y))
  assert candidates
  _,x,y=min(candidates,key=lambda z:z[0]);emit(x,c);emit(y,c)
def ellipse(c,x,y,w,h):rows.append([100002,x*4-254,254-y*4,w*4,h*4,.5,.5,.5,.5,.5,.5,1,1,0,*bytes.fromhex(c[1:]),255,0,0,0])
# Grounded Hydroshroom: curled crest, lobed gills, cream mask and heavy running legs.
poly('#087c9a',[(57,78),(45,98),(35,87),(29,90),(35,106),(43,106),(63,87)])
poly('#1bacc0',[(30,88),(41,96),(37,101)])
poly('#086d89',[(64,83),(77,84),(76,95),(66,111),(75,120),(62,120),(60,110)])
poly('#0f9ab2',[(67,92),(74,92),(64,114),(63,105)])
poly('#90d9cf',[(62,119),(75,120),(64,122)])
poly('#149db2',[(53,72),(73,70),(82,80),(73,94),(57,94),(48,85)])
poly('#075e82',[(59,76),(74,76),(72,88),(62,90),(56,82)])
# teal cap stalk curling clockwise, open center retained by concave silhouette
poly('#06b4bf',[(47,41),(46,24),(50,12),(60,6),(64,9),(57,15),(57,35)])
poly('#d8d386',[(59,7),(68,4),(76,10),(79,20),(74,26),(68,24),(65,17),(69,13),(72,16),(69,18),(71,22),(75,20),(73,13),(67,9)])
# broad frill silhouette and major layered gill lobes
poly('#20677d',[(24,48),(39,35),(58,44),(77,28),(94,35),(95,48),(83,61),(62,55),(35,68),(24,61)])
poly('#80bbc0',[(48,40),(40,36),(31,41),(26,48),(28,53),(39,56),(49,52),(57,46)])
poly('#62a2af',[(25,54),(36,58),(45,56),(51,52),(46,61),(35,66),(29,63)])
poly('#89c3c8',[(67,36),(77,29),(86,30),(93,36),(92,41),(83,46),(72,46),(64,42)])
poly('#67a7b3',[(73,47),(84,46),(94,41),(94,49),(89,56),(81,59),(70,52)])
poly('#adccc5',[(56,46),(46,57),(32,59)])
poly('#abc9c1',[(69,44),(88,50),(78,53)])
# head and long drooping cheek flaps
poly('#b8d6c7',[(55,52),(49,67),(35,72),(39,75),(57,63),(69,62),(85,72),(90,68),(73,52)])
poly('#e4e9cc',[(57,47),(68,46),(76,55),(71,63),(59,64),(52,57)])
# central upright petal overlaps head edge
poly('#236e83',[(48,33),(66,27),(72,28),(70,43),(60,50),(52,43)])
poly('#a1cdcb',[(49,34),(71,29),(68,43),(59,48),(54,42)])
# paired angry amber eyes on turquoise mask
poly('#1caeb7',[(54,55),(59,53),(64,54),(70,50),(73,50),(73,54),(68,57),(62,56),(57,58)])
ellipse('#db9b42',58,55,3.4,3.2);ellipse('#f7e7ae',58,55,1.5,2.2)
ellipse('#db9b42',70,53,3.1,3.7);ellipse('#f7e7ae',70,53,1.3,2.5)
# simple ruff and folded leaf arms
poly('#abdbce',[(58,63),(64,65),(70,62),(74,69),(67,72),(58,70),(54,67)])
poly('#128ba4',[(50,71),(65,74),(74,70),(79,77),(60,79)])
poly('#7ecbc6',[(54,77),(49,82),(43,79)])
poly('#99d2bf',[(77,81),(81,83),(85,89),(82,90),(77,87)])
assert len(rows)+2+math.ceil(len(rows)/60)<=119
(out/'native-layout.json').write_text(json.dumps(dict(width=508,height=508,rows=rows),indent=2))
im=Image.new('RGBA',(1016,1016));d=ImageDraw.Draw(im)
for r in rows:
 c=tuple(r[14:18]);x,y,w,h=r[1]+254,254-r[2],r[3],r[4]
 if r[0]==100002:d.ellipse(((x-w/2)*2,(y-h/2)*2,(x+w/2)*2,(y+h/2)*2),fill=c)
 else:
  rx,ry,rz=np.deg2rad([r[18],r[19],r[13]]);cx,sx,cy,sy,cs,sn=math.cos(rx),math.sin(rx),math.cos(ry),math.sin(ry),math.cos(rz),math.sin(rz);mat=np.array([[cy*cs+sy*sx*sn,-cy*sn+sy*sx*cs],[cx*sn,cx*cs]]);p=np.array([[0,h/2],[-w/2,-h/2],[w/2,-h/2]])@mat.T+[x,508-y];d.polygon([(px*2,(508-py)*2)for px,py in p],fill=c)
im.resize((508,508),Image.Resampling.LANCZOS).save(out/'native-reconstruction.png');print(len(rows),len(rows)+2+math.ceil(len(rows)/60))
