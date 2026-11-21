"""Keep triangular surfaces in the foreground: local TASK-94 shape candidates."""
import argparse,copy,json,runpy
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw
from shapely.affinity import translate
import refine

def proposals(m,cues,ref):
 fitter,placement=m['load'](m['root']/'scripts/art/segment-lowpoly.py','segment'),m['load'](m['root']/'scripts/art/native-triangle-placement.py','placement').place
 G=refine.G;result=[]
 for _,cx,cy,rx,ry in cues:
  x1,y1=max(0,int((cx-rx)*G)),max(0,int((cy-ry)*G))
  x2,y2=min(G,int((cx+rx)*G)),min(G,int((cy+ry)*G))
  crop=ref[y1:y2,x1:x2].astype(np.uint8)
  for colors in (5,9):
   parts=[(translate(p,xoff=x1,yoff=y1),c) for p,c in fitter.regions(crop,colors,minimum_area=6,spatial=3,color_range=20)]
   for eps in (2.0,4.8):
    result.extend(fitter.geometry(parts,eps,G,G,placement))
 unique={}
 for shape in result:
  s=copy.deepcopy(shape);scale=refine.SIDE/refine.G
  if s['type']=='rect':s['box']=[float(v*scale) for v in s['box']]
  else:
   s['points']=[[float(x*scale),float(y*scale)] for x,y in s['points']]
   if s.get('placement'):
    for k in ('cx','cy','w','h'):s['placement'][k]*=scale
  unique[json.dumps(s,sort_keys=True)]=s
 return list(unique.values())

def masks(shapes,ref,weights):
 n=refine.G
 result=[]
 for s in shapes:
  im=Image.new('1',(n,n));d=ImageDraw.Draw(im);z=n/refine.SIDE
  if s['type']=='rect':
   x,y,w,h=s['box'];d.rectangle((x*z,y*z,(x+w)*z,(y+h)*z),fill=1)
  else:d.polygon([(x*z,y*z) for x,y in s['points']],fill=1)
  i=np.flatnonzero(np.asarray(im).reshape(-1))
  if len(i)<5:continue
  c=np.array([int(s['colour'][1:3],16),int(s['colour'][3:5],16),int(s['colour'][5:7],16)])
  error=np.sum((c-ref.reshape(-1,3)[i])**2,axis=1)*weights.reshape(-1)[i]
  result.append((s,i,c,error.sum()))
 return result

def augment(seed,ref,weights,props):
 used=sum(s['cost'] for s in seed)
 out=list(seed)
 image=np.asarray(refine.raster(out)).reshape(-1,3).astype(float)
 target=ref.reshape(-1,3)
 w=weights.reshape(-1)
 err=np.sum((image-target)**2,axis=1)*w
 while used<60:
  options=[(float(err[i].sum()-new)/s['cost'] if s['cost']<=60-used else 0,j) for j,(s,i,c,new) in enumerate(props)]
  if not options:break
  score,j=max(options)
  if score<=0:break
  s,i,c,_=props[j];out.append(s);used+=s['cost']
  image[i]=c;err[i]=np.sum((c-target[i])**2,axis=1)*w[i]
 return out

def run(a):
 m=runpy.run_path(str(a.fitter))
 m['root']=a.repo
 m['cv2'].setNumThreads(1)
 G=refine.G;S=refine.SIDE
 yy,xx=np.mgrid[0:G,0:G]/(G-1)
 report={}
 for key,cues in refine.CUES.items():
  pack=json.loads((a.base/key/'fit.json').read_text())
  src=Image.open(a.sources/(key+'.png')).convert('RGB')
  ref=np.asarray(src.resize((G,G),Image.Resampling.LANCZOS)).astype(float)
  mask=np.maximum.reduce([np.exp(-2*((xx-x)**2/rx**2+(yy-y)**2/ry**2)) for _,x,y,rx,ry in cues])
  base=pack['tiers']['60'];original=refine.stats(ref,np.asarray(refine.raster(base['shapes'])).astype(float),mask)
  best=(original['cueMae'],original['mae'],base['shapes'],original,'retained-baseline')
  candidates=proposals(m,cues,ref)
  for priority in (2,6):
   weights=1+priority*mask
   props=masks(candidates,ref,weights)
   for src_tier,n in (('32',32),('60',43),('60',51),('60',57)):
    seed=list(pack['tiers'][src_tier]['shapes'])
    if pack['tiers'][src_tier]['method']['method']=='repo-TASK94-contour-native':
     while sum(s['cost'] for s in seed)>n:seed.pop()
    fitted=augment(seed,ref,weights,props)
    metrics=refine.stats(ref,np.asarray(refine.raster(fitted)).astype(float),mask)
    if metrics['mae']<=original['mae']*1.02 and (metrics['cueMae'],metrics['mae'])<best[:2]:
     best=metrics['cueMae'],metrics['mae'],fitted,metrics,f'{src_tier}/{n}/p{priority}'
  _,_,shapes,metrics,variant=best
  n=sum(s['cost'] for s in shapes);assert n<=60
  pack['tiers']['60']={**base,'geometry':len(shapes),'projectedImageControls':n,'shapes':shapes,
   'method':{'method':'cue-prioritized-TASK94-local-contours','variant':variant},
   'maeAt144':metrics['mae'],'edgeWeightedMaeAt144':metrics['edgeMae']}
  dest=a.out/key;dest.mkdir(parents=True,exist_ok=True)
  (dest/'fit.json').write_text(json.dumps(pack,separators=(',',':'))+'\n')
  refine.raster(base['shapes'],S).save(dest/'base.png')
  refine.raster(shapes,S).save(dest/'refined.png')
  src.resize((S,S),Image.Resampling.LANCZOS).save(dest/'source.png')
  report[key]={'variant':variant,'baseline':original,'variantMetrics':metrics,'totalControlsBefore':base['projectedImageControls']+1,'totalControlsAfter':n+1}
  print(key,report[key],flush=True)
 a.metrics.write_text(json.dumps(report,indent=2)+'\n')
if __name__=='__main__':
 p=argparse.ArgumentParser()
 for name in ('repo','fitter','base','sources','out','metrics'):p.add_argument(name,type=Path)
 run(p.parse_args())
