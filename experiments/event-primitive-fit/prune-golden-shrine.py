from PIL import Image,ImageDraw
import numpy as np
import json
from pathlib import Path
import sys

p=Path(sys.argv[1])
data=json.loads((p/'geometry.json').read_text())
shapes=data['shapes']
N=330
ys,xs=np.mgrid[:N,:N]
def focus(x,y,rx,ry):return np.exp(-((xs-x)**2/rx**2+(ys-y)**2/ry**2))
weights=1+5*focus(166,100,72,72)+4*focus(161,207,80,25)+2*focus(260,148,36,92)+2*focus(64,151,36,51)
masks=[];colors=[]
for s in shapes:
 m=Image.new('1',(N,N));d=ImageDraw.Draw(m)
 if s['type']=='rect':
  x,y,w,h=s['box'];d.rectangle([x,y,x+w,y+h],fill=1)
 else:d.polygon([tuple(q) for q in s['points']],fill=1)
 masks.append(np.asarray(m))
 colors.append(np.array([int(s['colour'][k:k+2],16) for k in (1,3,5)],dtype=np.uint8))
def draw(indices):
 img=np.zeros((N,N,3),dtype=np.uint8)
 for i in indices:img[masks[i]]=colors[i]
 return img
all_ids=list(range(len(shapes)))
reference=draw(all_ids)
def err(ids):
 arr=draw(ids)
 return float(np.sum(np.abs(arr.astype(np.int16)-reference)*weights[:,:,None])/3/np.sum(weights))
def cost(ids): return sum(shapes[i]['cost'] for i in ids)
for target in (56,52,48):
 ids=all_ids.copy()
 while cost(ids)>target:
  remaining=cost(ids)-target
  choices=[(err([q for q in ids if q!=i]),i) for i in ids[1:] if shapes[i]['cost']<=remaining]
  _,drop=min(choices)
  ids.remove(drop)
 path=p/'candidates'/f'golden_shrine_{target}'
 path.mkdir(parents=True,exist_ok=True)
 chosen=[shapes[i] for i in ids]
 tier={'geometry':len(chosen),'shapes':chosen,'projectedImageControls':cost(ids),'method':{'method':'pruned-manual-TASK94','maxImages':target}}
 (path/'fit.json').write_text(json.dumps({'id':path.name,**{k:v for k,v in data.items() if k!='shapes'},'tiers':{60:tier}},separators=(',',':'))+'\n')
 Image.fromarray(draw(ids)).save(p/f'predicted_{target}.png')
 print(target,cost(ids),round(err(ids),4),[i for i in all_ids if i not in ids])
