import sys,ast,json,math,itertools,importlib.util
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw
out=Path(__file__).parent
ns={'math':math};t=ast.parse(Path(sys.argv[2]).read_text());exec(compile(ast.Module(body=[n for n in t.body if isinstance(n,ast.FunctionDef) and n.name in ('cross','triangulate')],type_ignores=[]),'tri','exec'),ns)
spec=importlib.util.spec_from_file_location('p',Path(sys.argv[1])/'scripts/art/native-triangle-placement.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
rows=[]
def solve(t):
 v=[p for o in itertools.permutations(t) if (p:=m.solve(*o)) is not None];return min(v,key=lambda p:max(p['w'],p['h']))if v else None
def emit(p,c):rows.append([100003,p['cx']-254,p['cy']-254,p['w'],p['h'],.5,.5,.5,.5,.5,.5,1,1,p['rz'],*bytes.fromhex(c[1:]),255,p['rx'],p['ry'],0])
def poly(c,pts):
 for tri in ns['triangulate'](pts):
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
# Full front official 2732 silhouette: broad conical stone cap, slender peach stalk, paired amber eyes.
ellipse('#785b46',63,51,96,20)
ellipse('#bfa17f',63,52,81,14)
poly('#b3927b',[(53,50),(72,50),(67,77),(68,107),(73,117),(48,117),(53,104),(56,76)])
poly('#ebc5b5',[(58,57),(66,57),(62,81),(63,117),(54,117)])
# foot shading folded into stalk
# right foot silhouette retained in stalk
poly('#91705a',[(15,48),(18,34),(31,22),(48,13),(62,8),(79,14),(96,25),(108,40),(111,50),(100,55),(27,55)])
poly('#745340',[(22,40),(35,26),(61,11),(75,19),(59,23),(48,39)])
poly('#a7866c',[(26,48),(45,44),(54,30),(57,43),(98,48)])
poly('#efb73e',[(30,28),(39,18),(53,13),(47,19)])
poly('#dba035',[(70,12),(81,16),(95,26)])
poly('#b89578',[(70,24),(91,44),(80,30)])
poly('#b89578',[(68,39),(87,25),(79,34)])
ellipse('#ca6d31',59,55,5.4,8.5);ellipse('#ffe1a0',59,55,3.2,5.9)
ellipse('#ca6d31',66,55,5.1,8.1);ellipse('#ffe1a0',66,55,3,5.6)
poly('#b38c77',[(60,77),(63,82),(57,82)])
assert len(rows)<=41,len(rows)
(out/'native-layout.json').write_text(json.dumps(dict(width=508,height=508,rows=rows),indent=2))
im=Image.new('RGBA',(1016,1016));d=ImageDraw.Draw(im)
for r in rows:
 c=tuple(r[14:18]);x,y,w,h=r[1]+254,254-r[2],r[3],r[4]
 if r[0]==100002:d.ellipse(((x-w/2)*2,(y-h/2)*2,(x+w/2)*2,(y+h/2)*2),fill=c)
 else:
  rx,ry,rz=np.deg2rad([r[18],r[19],r[13]]);cx,sx,cy,sy,cs,sn=math.cos(rx),math.sin(rx),math.cos(ry),math.sin(ry),math.cos(rz),math.sin(rz);mat=np.array([[cy*cs+sy*sx*sn,-cy*sn+sy*sx*cs],[cx*sn,cx*cs]]);p=np.array([[0,h/2],[-w/2,-h/2],[w/2,-h/2]])@mat.T+[x,508-y];d.polygon([(px*2,(508-py)*2)for px,py in p],fill=c)
im.resize((508,508),Image.Resampling.LANCZOS).save(out/'native-reconstruction.png');print(len(rows),len(rows)+3)
