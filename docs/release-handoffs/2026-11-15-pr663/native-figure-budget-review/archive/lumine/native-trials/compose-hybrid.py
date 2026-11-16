from pathlib import Path
from PIL import Image, ImageDraw
import json, math, numpy as np
p=Path(__file__).resolve().parent
A=json.loads((p/'full-1-23/native-layout.json').read_text());B=json.loads((p/'full-0.78-29/native-layout.json').read_text())
assert A['sourceSha256']==B['sourceSha256']
W,H=A['logicalSize']; seam=43
variants=[(A,0,seam),(B,seam,H)]
out=[]
for layout,lo,hi in variants:
 w,h=layout['logicalSize']
 for r in layout['rows']:
  assert r[0]==100001 and r[13]==0 and r[20]==0
  x1=(r[1]+w/2-r[3]/2)*W/w; x2=(r[1]+w/2+r[3]/2)*W/w
  y1=max(lo,(h/2-r[2]-r[4]/2)*H/h); y2=min(hi,(h/2-r[2]+r[4]/2)*H/h)
  if y2-y1<=1e-7:continue
  out.append([r[0],(x1+x2)/2-W/2,H/2-(y1+y2)/2,x2-x1,y2-y1,*r[5:]])
n=len(out); c=2+math.ceil(n/60); d=p/'hybrid-head1-body78';d.mkdir(exist_ok=True)
q={**A,'logicalSize':[W,H],'rows':out,'images':n,'containers':c,'controls':n+c,'method':'head source-registered at 1x, body registered at .78x; both clipped in same frame at y=43'}
q.pop('protectedAreaMae',None);q.pop('otherMae',None);q.pop('silhouetteIou',None)
(d/'native-layout.json').write_text(json.dumps(q,separators=(',',':'))+'\n')
S=8
im=Image.new('RGBA',(W*S,H*S)); draw=ImageDraw.Draw(im)
for r in out:
 x1=(r[1]+W/2-r[3]/2)*S; y1=(H/2-r[2]-r[4]/2)*S
 x2=x1+r[3]*S; y2=y1+r[4]*S
 x1,y1,x2,y2=map(round,(x1,y1,x2,y2))
 if x2>x1 and y2>y1:draw.rectangle((x1,y1,x2-1,y2-1),fill=tuple(r[14:18]))
im.resize((W,H),Image.Resampling.BOX).save(d/'candidate.png')
print(n,c,n+c)
