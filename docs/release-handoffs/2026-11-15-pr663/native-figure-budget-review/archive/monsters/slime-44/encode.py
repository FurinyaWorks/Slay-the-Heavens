import json,math,itertools
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw
out=Path(__file__).parent;asset=json.loads((out/'flat-prototype.json').read_text());rows=[];receipts=[]
for sh in asset['shapes']:
 rgb=list(bytes.fromhex(sh['color'][1:]))
 if sh['type']=='ellipse':
  x,y,w,h=[sh[k]*4 for k in ('x','y','width','height')]
  rows.append([100002,x-254,254-y,w,h,.5,.5,.5,.5,.5,.5,1,1,0,*rgb,255,0,0,0]);receipts.append(('ellipse',sh['color'],[x,y,w,h]));continue
 if sh['type']=='triangle':
  p=sh['placement'];rx,ry,rz=np.deg2rad([p['rx'],p['ry'],p['rz']]);cx,sx,cy,sy,c,s=math.cos(rx),math.sin(rx),math.cos(ry),math.sin(ry),math.cos(rz),math.sin(rz)
  mat=np.array([[cy*c+sy*sx*s,-cy*s+sy*sx*c],[cx*s,cx*c]])
  seen=np.array([[0,p['h']/2],[-p['w']/2,-p['h']/2],[p['w']/2,-p['h']/2]])@mat.T+[p['cx'],p['cy']]
  assert p['rx']==0 or p['ry']==0
  rows.append([100003,p['cx']-254,p['cy']-254,p['w'],p['h'],.5,.5,.5,.5,.5,.5,1,1,p['rz'],*rgb,255,p['rx'],p['ry'],0]);receipts.append(('triangle',sh['color'],[(float(x),float(508-y))for x,y in seen]));continue
 if sh['half']==1:continue
 v=np.asarray(sh['authoredTriangle'])*4;v[:,1]=508-v[:,1]
 a,b,c=max(itertools.permutations(v),key=lambda p:math.dist(p[1],p[2]));d=c-b;foot=b+np.dot(a-b,d)/np.dot(d,d)*d
 for end in [b,c]:
  v=end-foot;w,h=np.linalg.norm(v),np.linalg.norm(a-foot);sign=1 if v[0]*(a[1]-foot[1])-v[1]*(a[0]-foot[0])>0 else -1;theta=math.atan2(v[1],v[0]);assert w>1e-7 and h>1e-7
  rows.append([100003,foot[0]-254,foot[1]-254,w*2,h,.5,0,.5,.5,.5,.5,1,sign,math.degrees(theta),*rgb,255,0,0,1]);receipts.append(('triangle',sh['color'],[(float(q[0]),float(508-q[1]))for q in [foot,end,a]]))
assert len(rows)==41
(out/'native-layout.json').write_text(json.dumps({'width':508,'height':508,'rows':rows},indent=2))
im=Image.new('RGBA',(1016,1016));d=ImageDraw.Draw(im)
for typ,color,v in receipts:
 if typ=='triangle':d.polygon([(x*2,y*2)for x,y in v],fill=color)
 else:
  x,y,w,h=v;d.ellipse(((x-w/2)*2,(y-h/2)*2,(x+w/2)*2,(y+h/2)*2),fill=color)
im.resize((508,508),Image.Resampling.LANCZOS).save(out/'native-reconstruction.png')
