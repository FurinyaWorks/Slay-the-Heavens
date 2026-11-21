"""Offline experiment: reserve shape budget for event recognition cues, not scenery."""
import argparse
import copy
import json
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw

# Center and extents in 0..1 of the separately reviewed square image.
# The ellipses are scoring masks, not extra rendering primitives.
CUES={
 'cleric': [('helmet and grin',.49,.27,.19,.16),('gold orb',.17,.62,.17,.23),('blue flame',.82,.56,.16,.24)],
 'purifier': [('amber symbol',.50,.15,.17,.17),('vertical core',.49,.42,.15,.24),('ember basin',.47,.75,.25,.10)],
 'goop': [('large bubble',.81,.64,.21,.20),('rim ellipse',.78,.77,.23,.12),('small bubbles',.51,.87,.23,.13)],
 'upgrade_shrine': [('orange shrine',.55,.28,.22,.25),('floating links',.57,.54,.13,.24),('base',.53,.82,.31,.12)],
 'golden_wing': [('cyan wing silhouette',.56,.46,.36,.40),('upper gold cluster',.56,.68,.13,.13),('floor coins',.56,.84,.22,.12)],
 'shining_light': [('radiant center',.74,.19,.25,.23),('traveler silhouette',.23,.72,.25,.27),('low rays',.61,.54,.33,.27)],
 'golden_shrine': [('gold emblem',.50,.27,.28,.24),('stone bowl and coins',.49,.66,.36,.19),('stone uprights',.73,.50,.20,.29)],
}
G=144
SIDE=330
def raster(shapes,size=G):
 im=Image.new('RGB',(size,size));d=ImageDraw.Draw(im);scale=size/SIDE
 for s in shapes:
  if s['type']=='rect':
   x,y,w,h=s['box'];d.rectangle((x*scale,y*scale,(x+w)*scale,(y+h)*scale),fill=s['colour'])
  else:d.polygon([(x*scale,y*scale) for x,y in s['points']],fill=s['colour'])
 return im

# Candidate rectangle paints are normal project type 100001, no masks, no grouping.
def grid():
 boxes=set()
 for n in (2,3,4,5,7,9,12,16,22,30,42):
  step=max(2,n//3)
  for width,height in ((n,n),(n,max(2,n//2)),(max(2,n//2),n)):
   for y in range(0,G-height+1,step):
    for x in range(0,G-width+1,step):
     boxes.add((x,y,x+width,y+height))
 return np.asarray(sorted(boxes),dtype=np.int32)

def integral(a):
 return np.pad(a,[(1,0),(1,0)]+[(0,0)]*(a.ndim-2)).cumsum(0).cumsum(1)

def buckets(a,b):
 x1,y1,x2,y2=b.T
 return a[y2,x2]-a[y1,x2]-a[y2,x1]+a[y1,x1]

def prepare(ref,weights,boxes):
 w=buckets(integral(weights),boxes)
 s=buckets(integral(ref*weights[:,:,None]),boxes)
 c=np.rint(s/w[:,None]).clip(0,255)
 target=buckets(integral(np.sum(ref**2,axis=2)*weights),boxes)
 error=target-2*np.sum(c*s,axis=1)+np.sum(c**2,axis=1)*w
 return c.astype(int),error

def stats(ref,fit,mask):
 d=np.abs(ref-fit).mean(2)
 dy,dx=np.gradient(ref.mean(2))
 edge=1+np.minimum(np.hypot(dx,dy)/35,1.25)
 return {'mae':round(float(d.mean()),3),
 'edgeMae':round(float((d*edge).sum()/edge.sum()),3),
 'cueMae':round(float((d*mask).sum()/mask.sum()),3)}

def augment(seed,ref,weights,boxes,colors,errors):
 shapes=copy.deepcopy(seed)
 used=sum(s['cost'] for s in shapes)
 current=np.asarray(raster(shapes)).astype(np.float64).copy()
 while used<60:
  sums=buckets(integral(np.sum((current-ref)**2,axis=2)*weights),boxes)
  x,y,x2,y2=boxes[np.argmax(sums-errors)]
  i=np.argmax(sums-errors)
  if (sums-errors)[i] <= 0:break
  color=colors[i]
  s=SIDE/G
  shapes.append({'type':'rect','colour':'#%02X%02X%02X'%tuple(color),
                 'box':[float(x*s),float(y*s),float((x2-x-.25)*s),float((y2-y-.25)*s)],'cost':1})
  current=np.asarray(raster(shapes)).astype(np.float64)
  used+=1
 return shapes

def run(args):
 boxes=grid()
 yy,xx=np.mgrid[0:G,0:G]/(G-1)
 result={}
 for key, cues in CUES.items():
  pack=json.loads((args.base/key/'fit.json').read_text())
  assert pack['sourceMode']=='RGB'
  src=Image.open(args.sources/(key+'.png')).convert('RGB')
  ref=np.asarray(src.resize((G,G),Image.Resampling.LANCZOS)).astype(np.float64)
  mask=np.maximum.reduce([np.exp(-2*((xx-x)**2/a**2+(yy-y)**2/b**2)) for _,x,y,a,b in cues])
  base=pack['tiers']['60']
  base_stats=stats(ref,np.asarray(raster(base['shapes'])).astype(float),mask)
  best=(base_stats['cueMae'],base_stats['mae'],base['shapes'],base_stats,'baseline')
  for priority in (2,6):
   weights=1+priority*mask
   colors,errors=prepare(ref,weights,boxes)
   for source,n in (('32',32),('60',43),('60',51),('60',57)):
    seed=copy.deepcopy(pack['tiers'][source]['shapes'])
    if pack['tiers'][source]['method']['method']=='repo-TASK94-contour-native':
     while sum(s['cost'] for s in seed)>n:seed.pop()
    fitted=augment(seed,ref,weights,boxes,colors,errors)
    m=stats(ref,np.asarray(raster(fitted)).astype(float),mask)
    if m['mae']<=base_stats['mae']*1.02 and (m['cueMae'],m['mae']) < best[:2]:
     best=(m['cueMae'],m['mae'],fitted,m,f'{source}/{n}/p{priority}')
  _,_,shapes,metrics,method=best
  n=sum(s['cost'] for s in shapes)
  assert n<=60
  pack['tiers']['60']={**base,'geometry':len(shapes),'projectedImageControls':n,
   'shapes':shapes,'method':{'method':'cue-weighted-residual-v1','variant':method},'maeAt144':metrics['mae'],'edgeWeightedMaeAt144':metrics['edgeMae']}
  dest=args.out/key;dest.mkdir(parents=True,exist_ok=True)
  (dest/'fit.json').write_text(json.dumps(pack,separators=(',',':'))+'\n')
  raster(base['shapes'],SIDE).save(dest/'base.png')
  raster(shapes,SIDE).save(dest/'refined.png')
  src.resize((SIDE,SIDE),Image.Resampling.LANCZOS).save(dest/'source.png')
  result[key]={'variant':method,'baseline':base_stats,'variantMetrics':metrics,
               'totalControlsBefore':base['projectedImageControls']+1,'totalControlsAfter':n+1,
               'cues':[c[0] for c in cues]}
  print(key,result[key],flush=True)
 (args.out/'metrics.json').write_text(json.dumps(result,indent=2)+'\n')
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('base',type=Path);p.add_argument('sources',type=Path);p.add_argument('out',type=Path);run(p.parse_args())
