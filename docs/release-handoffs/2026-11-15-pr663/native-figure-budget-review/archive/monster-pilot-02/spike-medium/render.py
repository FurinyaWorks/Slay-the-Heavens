import ast, math, itertools, json, importlib.util, sys, hashlib
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw
here=Path(__file__).resolve().parent
root, history = map(Path,sys.argv[1:3])
parsed=ast.parse(history.read_text());ns={'math':math}
exec(compile(ast.Module(body=[n for n in parsed.body if isinstance(n,ast.FunctionDef) and n.name in ('cross','triangulate')],type_ignores=[]),'triangulate','exec'),ns)
spec=importlib.util.spec_from_file_location('geometry',root/'scripts/art/native-triangle-placement.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
scale=4; W=508; rows=[]; samples=[]; errors=[]
for line in (here/'planes.txt').read_text().splitlines():
 if not line or line.startswith('#'):continue
 token,*items=line.split(); rgb=list(bytes.fromhex(token.lstrip('@')))
 pts=[tuple(float(x)*scale for x in p.split(',')) for p in items]
 if token.startswith('@'):
  (x,y),(w,h)=pts
  rows.append([100002,x-W/2,W/2-y,w,h,.5,.5,.5,.5,.5,.5,1,1,0,*rgb,255,0,0,0])
  samples.append(('ellipse',rgb,[(x-w/2,y-h/2),(x+w/2,y+h/2)]));continue
 for t in ns['triangulate'](pts):
  vertices=np.array(t,dtype=float)
  native=vertices.copy();native[:,1]=W-native[:,1]
  opts=[m.solve(*p) for p in itertools.permutations(native)]; opts=[p for p in opts if p]
  if opts:
   p=min(opts,key=lambda p:max(p['rx'],p['ry']))
   rx,ry,rz=np.deg2rad([p['rx'],p['ry'],p['rz']]); cx,sx,cy,sy,c,s=math.cos(rx),math.sin(rx),math.cos(ry),math.sin(ry),math.cos(rz),math.sin(rz)
   M=np.array([[cy*c+sy*sx*s,-cy*s+sy*sx*c],[cx*s,cx*c]])
   seen=np.array([[0,p['h']/2],[-p['w']/2,-p['h']/2],[p['w']/2,-p['h']/2]])@M.T+[p['cx'],p['cy']]
   errors.append(min(np.max(np.linalg.norm(seen-native[list(i)],axis=1)) for i in itertools.permutations(range(3))))
   rows.append([100003,p['cx']-W/2,p['cy']-W/2,p['w'],p['h'],.5,.5,.5,.5,.5,.5,1,1,p['rz'],*rgb,255,p['rx'],p['ry'],0])
   samples.append(('polygon',rgb,[(x,W-y) for x,y in seen]));continue
  a,b,c=max(itertools.permutations(native),key=lambda v:math.dist(v[1],v[2]));d=c-b;foot=b+np.dot(a-b,d)/np.dot(d,d)*d
  for end in [b,c]:
   v=end-foot;w,h=np.linalg.norm(v),np.linalg.norm(a-foot)
   if min(w,h)<1e-8:continue
   sign=1 if v[0]*(a[1]-foot[1])-v[1]*(a[0]-foot[0])>0 else -1
   rows.append([100003,foot[0]-W/2,foot[1]-W/2,w*2,h,.5,0,.5,.5,.5,.5,1,sign,math.degrees(math.atan2(v[1],v[0])),*rgb,255,0,0,1])
   samples.append(('polygon',rgb,[(x,W-y) for x,y in [foot,end,a]]))
assert max(errors)<1e-6 and all(sum(abs(x)>1e-9 for x in r[18:20])<=1 for r in rows)
img=Image.new('RGBA',(W*3,W*3)); d=ImageDraw.Draw(img)
for typ,rgb,pts in samples:
 getattr(d,typ)([(x*3,y*3) for x,y in pts],fill=tuple(rgb+[255]))
img.resize((W,W),Image.Resampling.LANCZOS).save(here/'native-reconstruction.png')
(here/'native-layout.json').write_text(json.dumps(dict(width=W,height=W,rows=rows),separators=(',',':'))+'\n')
calculated=2+math.ceil(len(rows)/60)
report=dict(graphics=len(rows),containersPredicted=calculated,artControlsPredicted=len(rows)+calculated,sourceSHA256=hashlib.sha256((here/'official.png').read_bytes()).hexdigest(),exactTransformMaxError=max(errors),engineVerified=False)
(here/'report.json').write_text(json.dumps(report,indent=2)+'\n')
print(report)
