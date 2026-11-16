from pathlib import Path
import sys,importlib.util,math,json,itertools,hashlib
import numpy as np
from PIL import Image,ImageDraw,ImageFont
root=Path(sys.argv[1]).resolve(); here=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('placement',root/'scripts/art/native-triangle-placement.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
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
threshold=float(sys.argv[2]) if len(sys.argv)>2 else 0
def simplify(v,minimum):
 v=v.copy()
 while len(v)>3:
  val,i=min((abs(cross(v[i-1],p,v[(i+1)%len(v)])), i) for i,p in enumerate(v))
  if val>=minimum:break
  del v[i]
 return v
paths=[]
for line in (here/'planes.txt').read_text().splitlines():
 if line.startswith('#') or not line:continue
 g,n,c,*points=line.split()
 if "knuckle" in n or "toes" in n or n in {"rightupperlight","pelvisinner","leftshin","rightshin","rightthigh"}:continue
 poly=[tuple(map(float,x.split(','))) for x in points]
 if n=='leftwrist':poly=[(16,61),(25,64),(26,69),(13,66)]
 protected={'face','eyeline','iris','eyeglint','mouth','flowerA','flowerB','flowerGoldA','flowerGoldB','swordblade','swordgrip','swordguard','farhand','farglove','high','low','hightip','lowtip'}
 if threshold:
  if n in {'highshade','lowshade','backhairlight','skirtshade','frontbootshade','backbootshadow','skirtsplit','chestblue','belt','nearsleeveshade','farsleeveshadow','scarfhighlight','hairlight','sidehairback','swordguardlight'}:continue
  poly=simplify(poly,0 if n in {"shoulderrightband","shoulderleftcap","shoulderrightcap"} else 0 if n=="leftwrist" else 35 if n in {"leftfoot","rightfoot"} else threshold*(.35 if n in protected else 1))
 paths.append((g,n,c,poly))
receipts=[]
native={}
for group,name,color,points in paths:
 try: tris=list(triangulate(points))
 except ValueError as err: raise ValueError(name) from err
 for tri in tris:
  # Reuse repository placement solver; defer any mask fallback to the 
  # native path rather than silently omitting an authored facet.
  try:
   parts=m.place(np.asarray(tri)*5,600)
   if len(parts)>2:raise m.PlacementUnavailable()
  except m.PlacementUnavailable:
   vertices=np.asarray(tri)*5
   nativeVertices=vertices.copy();nativeVertices[:,1]=600-nativeVertices[:,1]
   a,b,c=max([(u,v,w) for u,v,w in itertools.permutations(nativeVertices)],key=lambda p:math.dist(p[1],p[2]))
   d=c-b;foot=b+np.dot(a-b,d)/np.dot(d,d)*d
   for end in [b,c]:
    v=end-foot;w,h=np.linalg.norm(v),np.linalg.norm(a-foot)
    if w<1e-7 or h<1e-7:continue
    sign=1 if v[0]*(a[1]-foot[1])-v[1]*(a[0]-foot[0])>0 else -1
    theta=math.atan2(v[1],v[0])
    # Match nativeShape's existing right-half mask and [0.5,0] pivot.
    rgb=tuple(bytes.fromhex(color[1:]))
    row=[100003,foot[0]-328,foot[1]-300,w*2,h,.5,0,.5,.5,.5,.5,1,sign,math.degrees(theta),*rgb,255,0,0,1]
    native.setdefault(group,[]).append(row)
    receipts.append((color,[(float(q[0]),float(600-q[1])) for q in [foot,end,a]]))
   continue
  for vertices,p in parts:
   rx,ry,rz=np.deg2rad([p['rx'],p['ry'],p['rz']])
   cx,sx,cy,sy,c,s=math.cos(rx),math.sin(rx),math.cos(ry),math.sin(ry),math.cos(rz),math.sin(rz)
   matrix=np.array([[cy*c+sy*sx*s,-cy*s+sy*sx*c],[cx*s,cx*c]])
   seen=np.array([[0,p['h']/2],[-p['w']/2,-p['h']/2],[p['w']/2,-p['h']/2]])@matrix.T+[p['cx'],p['cy']]
   want=np.asarray(vertices);want[:,1]=600-want[:,1]
   delta=min(np.max(np.linalg.norm(seen-want[list(indices)],axis=1)) for indices in itertools.permutations(range(3)))
   assert delta<1e-6 and (p['rx']==0 or p['ry']==0), (name,delta)
   rgb=tuple(bytes.fromhex(color[1:]))
   row=[100003,p['cx']-328,p['cy']-300,p['w'],p['h'],.5,.5,.5,.5,.5,.5,1,1,p['rz'],*rgb,255,p['rx'],p['ry'],0]
   native.setdefault(group,[]).append(row)
   receipts.append((color,[(float(x),float(600-y)) for x,y in seen.tolist()]))
# Actual native ellipses, inserted ahead of face compass spikes.
head=[]
for x,y,w,h,color in [(49,26,32,33,'#35251d'),(49,26,29,30,'#74503a'),(49,26,25,27,'#b3a17d'),(49,26,21,23,'#38271f'),(49,26,5,6,'#b45716'),(49,26,3.5,4.5,'#ffac30'),(49,26,2,2.8,'#fff080')]:
 rgb=list(bytes.fromhex(color[1:])); head.append([100002,x*5-328,300-y*5,w*5,h*5,.5,.5,.5,.5,.5,.5,1,1,0,*rgb,255,0,0,0])
for x,y,w,h,angle in [(9,82,4,5,35),(15,79,4,6,35),(21,81,3,5,35),(96,84,4,5,-40),(103,89,5,6,-40),(110,92,4,5,-40),(19,112,7,6,0),(29,112,7,7,0),(39,113,7,6,0),(95,112,7,6,0),(103,113,5,5,0),(110,113,4,4,0)]:
 native['body'].append([100001,x*5-328,300-y*5,w*5,h*5,.5,.5,.5,.5,.5,.5,1,1,angle,174,155,121,255,0,0,0])
native['head']=head+native['head']
num=sum(map(len,native.values()))
# One host, a static/motion owner per group and existing 60-child batch constraints.
batches=sum(math.ceil(len(rows)/60) for rows in native.values());containers=1+len(native)+batches
print({'planes':len(paths),'nativeImages':num,'containers':containers,'totalIncludingHost':num+containers,'groups':{n:len(v) for n,v in native.items()}})
out={'schemaVersion':1,'sourceCommit':'1cc5479b713edab6fd26db4e20f8eb22b7401cb2','conceptSha256':hashlib.sha256((here.parent/'source.png').read_bytes()).hexdigest(),
 'logicalSize':[656,600],'proposedContainers':containers,'measuredControllerExpected':num+containers+len(native),'threshold':threshold,'imageRows':native,'verification':'All triangle vertices reconstructed from native transforms within 1e-6; no platform build yet'}
(here/'native-layout.json').write_text(json.dumps(out,indent=2)+'\n')
im=Image.new('RGBA',(1312,1200));d=ImageDraw.Draw(im)
for color,pts in receipts:d.polygon([(x*2,y*2) for x,y in pts],fill=color)
im=im.resize((656,600),Image.Resampling.LANCZOS)
im.save(here/'native-reconstruction.png')


# Rasterize native primitive rows, including masks, rather than original polygons.
im=Image.new('RGBA',(1312,1200));d=ImageDraw.Draw(im)
for group,rows in native.items():
 for row in rows:
  typ,x,y,w,h,px,py,_,_,_,_,sx,sy,rz,r,g,b,a,rx,ry,half=row
  if typ==100002:
   d.ellipse(((x+328-w/2)*2,(300-y-h/2)*2,(x+328+w/2)*2,(300-y+h/2)*2),fill=(r,g,b,a));continue
  X,Y,Z=map(math.radians,[rx,ry,rz]);cx,cy,sn,cs=math.cos(X),math.cos(Y),math.sin(Z),math.cos(Z)
  M=np.array([[cy*cs+math.sin(Y)*math.sin(X)*sn,-cy*sn+math.sin(Y)*math.sin(X)*cs],[cx*sn,cx*cs]])
  pts=(np.array([[-w/2,0],[w/2,0],[w/2,h],[-w/2,h]]) if typ==100001 else np.array([[0,h],[-w/2,0],[w/2,0]])) if not half else np.array([[0,0],[w/2,0],[0,h]])
  if not half:pts[:,1]-=h*py
  pts*=np.array([sx,sy]);pts=pts@M.T;pts[:,0]+=x+328;pts[:,1]=300-y-pts[:,1]
  d.polygon([tuple(p*2) for p in pts],fill=(r,g,b,a))
im=im.resize((656,600),Image.Resampling.LANCZOS);im.save(here/'native-reconstruction.png')
im.resize((127,116),Image.Resampling.LANCZOS).save(here/'native-127.png')
