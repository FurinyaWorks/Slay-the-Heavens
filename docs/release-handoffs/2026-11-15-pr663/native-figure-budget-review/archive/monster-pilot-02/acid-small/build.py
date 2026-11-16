import ast,math,itertools,json,importlib.util
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw
import sys
out=Path(__file__).parent;root=Path(sys.argv[1]).resolve()
# Reuse parent's generic ear triangulation only, no parent output mutations.
t=ast.parse(Path(sys.argv[2]).resolve().read_text());ns={'math':math};exec(compile(ast.Module(body=[n for n in t.body if isinstance(n,ast.FunctionDef) and n.name in ('cross','triangulate')],type_ignores=[]),'triangulate','exec'),ns)
spec=importlib.util.spec_from_file_location('p',root/'scripts/art/native-triangle-placement.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
im=Image.new('RGBA',(1016,1016));d=ImageDraw.Draw(im); shapes=[]
for x,y,w,h,c in [(63,87,70,47,'#789967'),(61,90,62,39,'#c6d0aa'),(62,77,58,27,'#8cb958')]:
 d.ellipse(((x-w/2)*8,(y-h/2)*8,(x+w/2)*8,(y+h/2)*8),fill=c);shapes.append(dict(type='ellipse',color=c,x=x,y=y,width=w,height=h))
for l in (out/'planes.txt').read_text().splitlines():
 if not l or l.startswith('# '):continue
 c,*pts=l.split();p=[tuple(map(float,v.split(','))) for v in pts];d.polygon([(x*8,y*8)for x,y in p],fill=c)
 for tr in ns['triangulate'](p):
  try:parts=m.place(np.asarray(tr)*4,508)
  except m.PlacementUnavailable: parts=[]
  if not parts:
   shapes.extend([{'type':'triangle-mask-fallback','color':c,'authoredTriangle':tr,'half':h,'needsRuntimeEncoding':True} for h in (0,1)])
  for vertices,placement in parts:shapes.append({'type':'triangle','color':c,'placement':placement})
# Eyes and characteristic body spots preserve source silhouette and eye identity.
ellipses=[(51,85,8,16,'#d9934b'),(51,85,6,13,'#ffca7a'),(51,85,4,11,'#fff9cc'),(76,85,8,16,'#d9934b'),(76,85,6,13,'#ffca7a'),(76,85,4,11,'#fff9cc'),(40,78,6,5,'#aad47a'),(55,74,5,4,'#aad47a')]
for x,y,w,h,c in ellipses:
 d.ellipse(((x-w/2)*8,(y-h/2)*8,(x+w/2)*8,(y+h/2)*8),fill=c);shapes.append(dict(type='ellipse',color=c,x=x,y=y,width=w,height=h))
im.resize((508,508),Image.Resampling.LANCZOS).save(out/'flat-prototype.png');N=len(shapes);containers=2+math.ceil(N/60)
(out/'flat-prototype.json').write_text(json.dumps(dict(images=N,artSurfaceContainers=containers,total=N+containers,shapes=shapes,scope='Manual source-traced art-only prototype; ellipse coords 127-space, triangle coords 508-space. Not ready runtime rows. Preview draws authored polygons, not native replay. Requires owner approval and native replay.'),indent=2));print(N,containers,N+containers)
