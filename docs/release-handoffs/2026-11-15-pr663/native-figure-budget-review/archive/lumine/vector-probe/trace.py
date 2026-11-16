# Offline design experiment: per-source color contours, alpha is not an art color.
from PIL import Image
from scipy.ndimage import label, median_filter, binary_fill_holes,distance_transform_edt
from pathlib import Path
import numpy as np,sys,collections,math,re
w=328;h=300
folder=Path(__file__).resolve().parent
img=np.asarray(Image.open(folder.parent/'image(20261116-034213).png').convert('RGBA').resize((w,h),Image.Resampling.LANCZOS))
fg=img[:,:,3]>127
vals=img[:,:,:3][fg]; strip=Image.fromarray(vals.reshape(-1,1,3))
levels=int(sys.argv[1]); minArea=int(sys.argv[2]); tol=float(sys.argv[3])
# Pillow approximates palette only from actual foreground art.
strip=strip.quantize(colors=levels,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE)
palette=np.asarray(strip.getpalette(),dtype='uint8').reshape(-1,3)[:levels]
labs=np.full(fg.shape,255,dtype='int16');labs[fg]=np.asarray(strip).ravel()
dirs=[(1,0),(0,1),(-1,0),(0,-1)]
def boundary(mask):
 yy,xx=np.nonzero(mask); starts=collections.defaultdict(list)
 for x,y in zip(xx.tolist(),yy.tolist()):
  if not y or not mask[y-1,x]:starts[x,y].append(0)
  if x==w-1 or not mask[y,x+1]:starts[x+1,y].append(1)
  if y==h-1 or not mask[y+1,x]:starts[x+1,y+1].append(2)
  if not x or not mask[y,x-1]:starts[x,y+1].append(3)
 def take(v,before=None):
  ds=starts[v]
  k=min(ds) if before is None else next(d%4 for d in (before+1,before,before-1,before+2) if d%4 in ds)
  ds.remove(k)
  if not ds: del starts[v]
  return k
 routes=[]
 while starts:
  origin=min(starts);pt=origin; prev=None; run=[]
  while True:
   k=take(pt,prev);run.append(pt);dx,dy=dirs[k];pt=(pt[0]+dx,pt[1]+dy)
   if pt==origin:break
   prev=k
  ar=sum(a[0]*b[1]-a[1]*b[0] for a,b in zip(run,run[1:]+run[:1]))/2
  if ar>1:routes.append((ar,run))
 return sorted(routes,reverse=True)
def simp(path,eps):
 def dist(p,a,b):
  dx=b[0]-a[0];dy=b[1]-a[1]
  den=dx*dx+dy*dy
  if den==0: return math.dist(p,a)
  t=max(0,min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/den))
  return math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy)
 def rdp(pts):
  if len(pts)<=2:return pts
  d,k=max((dist(p,pts[0],pts[-1]),i) for i,p in enumerate(pts[1:-1],1))
  if d<=eps: return [pts[0],pts[-1]]
  return rdp(pts[:k+1])[:-1]+rdp(pts[k:])
 path=[p for i,p in enumerate(path) if p!=path[i-1]]
 k=max(range(1,len(path)),key=lambda i:math.dist(path[0],path[i]))
 return rdp(path[:k+1])[:-1]+rdp(path[k:]+path[:1])[:-1]
def process(mask):
 m,n=label(mask)
 objs=[]
 for i in range(1,n+1):
  reg=m==i
  a=np.sum(reg)
  if a<8:continue
  y,x=np.nonzero(reg); px=float(x.mean());py=float(y.mean())
  # Image-specific: preserve eyes/white flowers/face profile and sword edge.
  face=134<px<211 and 17<py<71
  blade=115<px<228 and 155<py<230
  if a<(minArea*.34 if face else minArea*.55 if blade else minArea):continue
  for area,path in boundary(reg):
   if area<max(8,a*.15):continue
   path=simp(path,tol*(.48 if face else .70 if blade else 1))
   if len(path)>=3:objs.append((a,path,np.median(img[:,:,:3][reg],0).astype('int')))
 return objs
# Fill areas from nearby major connected planes instead of painting holes grey.
seed=np.zeros(fg.shape,dtype='bool')
for i in range(levels):
 seg,n=label(labs==i)
 for j in range(1,n+1):
  ok=seg==j; y,x=np.nonzero(ok); cx,cy=float(x.mean()),float(y.mean())
  amount=minArea*(.18 if 134<cx<211 and 16<cy<71 else .45 if 115<cx<228 and 155<cy<230 else 1)
  if len(y)>=amount:seed|=ok
nearest=distance_transform_edt(~seed,return_distances=False,return_indices=True)
labs=np.where(fg,labs[tuple(nearest)],255)
components=[]
for i in range(levels):components.extend(process(labs==i))
# Use a silhouette underlay to fill tiny inter-region gaps without adding noisy tiles.
top=boundary(fg)[0][1]
pts=simp(top,tol*1.05); color=(217,199,185)
rows=[(pts,color)]+[(pts,col) for _,pts,col in sorted(components,key=lambda k:-k[0])]
with (folder/'planes.txt').open('w') as f:
 print('# Existing approved transparent sprite traced with alpha excluded; no raster is used as runtime asset.',file=f)
 for j,(pts,col) in enumerate(rows):
  print('body','area'+str(j),'#' + bytes(map(int,col)).hex(),*(f'{x/2.5:.1f},{y/2.5:.1f}' for x,y in pts),file=f)
print('palette',levels,'area',minArea,'eps',tol,'regions',len(rows),'semanticTriangles',sum(len(pts)-2 for pts,c in rows))
