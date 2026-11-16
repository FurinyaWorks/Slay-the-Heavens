from pathlib import Path
from PIL import Image,ImageDraw
import numpy as np,math,json,hashlib,sys
p=Path(__file__).resolve().parent
src=p.parent/'lumine-idle-concept-v1.png'
source=Image.open(src).convert('RGBA')
# Alpha-mask the HEAD by its seam with the neck/shoulder; source design remains untouched.
source=source.resize((1312,1200),Image.Resampling.LANCZOS)
mask=Image.new('L',source.size); d=ImageDraw.Draw(mask)
seam=[(43,0),(91,0),(91,39),(82,39),(78,33),(74,35),(65,39),(58,35),(43,34)]
d.polygon([(round(x*10),round(y*10)) for x,y in seam],fill=255)
alpha=np.asarray(source.getchannel('A')).astype('uint16')
source.putalpha(Image.fromarray((alpha*np.asarray(mask).astype('uint16')//255).astype('uint8')))
mode=sys.argv[1] if len(sys.argv)>1 else 'fit'
def solution(scale,colors,minA,levels,protect=False):
 W,H=round(133*scale),round(121.65*scale)
 w,h=W,H
 s=source.resize((w,h),Image.Resampling.LANCZOS)
 a=np.asarray(s).copy(); O=a.copy()
 fg=a[:,:,3]>=minA
 palInput=a[:,:,:3][fg]
 qu=Image.fromarray(palInput.reshape(-1,1,3)).quantize(colors=colors,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE)
 pal=np.asarray(qu.getpalette(),dtype='uint8').reshape(-1,3)[:colors]
 # Give the shaft of the silhouette subpixel antialiasing, except where in-game compositing is negligible.
 al=a[:,:,3].astype(int)
 al=(np.rint(al*(levels-1)/255)*255/(levels-1)).astype('uint8')
 rgb=pal[np.asarray(qu).ravel()]; a[:,:,:3][fg]=rgb
 if protect:
  # Constrain the major recognition landmarks to the original pixel grid instead of drawing new eyes.
  yy,xx=np.indices((h,w))
  X=xx/W*131.2;Y=yy/H*120
  roi=((X>72.5)&(X<79)&(Y>16.6)&(Y<21.8))|((X>62)&(X<74.5)&(Y>8)&(Y<17)|( (X>76)&(X<80.5)&(Y>21)&(Y<25.5) ))
  roi=roi&fg
  # Thin, fixed palettes preserve eyes, petal highlights, and the chin local contrast.
  orig=O[:,:,:3][roi]; r=Image.fromarray(orig.reshape(-1,1,3)).quantize(colors=12,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE)
  pp=np.asarray(r.getpalette(),dtype='uint8').reshape(-1,3)
  a[:,:,:3][roi]=pp[np.asarray(r).ravel()]
 a[:,:,3]=al; a[~fg]=0
 packed=(a[:,:,0].astype('uint64')<<24)|(a[:,:,1].astype('uint64')<<16)|(a[:,:,2].astype('uint64')<<8)|a[:,:,3]
 packed[a[:,:,3]==0]=0
 remain=packed.copy(); rects=[]
 for y in range(h):
  for x in range(w):
   c=remain[y,x]
   if not c:continue
   maxw=w-x;best=(0,0,0)
   for z in range(y,h):
    rr=remain[z,x:x+maxw]; invalid=np.flatnonzero(rr!=c)
    if invalid.size: maxw=min(maxw,int(invalid[0]))
    if maxw==0: break
    if maxw*(z-y+1)>best[0]:best=(maxw*(z-y+1),maxw,z-y+1)
   _,rw,rh=best
   rects.append((x,y,rw,rh,tuple(map(int,a[y,x]))));remain[y:y+rh,x:x+rw]=0
 assert not remain.any()
 # Subtree geometry same coordinate frame as reference raster, no texture binding whatsoever.
 rows=[]
 for x,y,rw,rh,c in rects:
  rows.append([100001,x+rw/2-w/2,h/2-y-rh/2,rw,rh,.5,.5,.5,.5,.5,.5,1,1,0,*c,0,0,0])
 count=len(rows); controls=count+2+math.ceil(count/60)
 out=Image.fromarray(a,'RGBA')
 def comp(im):
  canvas=Image.new('RGBA',im.size,(42,53,68,255));canvas.alpha_composite(im)
  return np.asarray(canvas.convert('RGB'),dtype=float)
 score=np.abs(comp(s)-comp(out))
 domain=O[:,:,3]>15
 a1=O[:,:,3]>127;a2=a[:,:,3]>127
 stat=dict(scale=scale,palette=colors,alphaLevels=levels,maskCutoff=minA,featureProtection=protect,images=count,containers=controls-count,controls=controls,
  foregroundMae=float(score[domain].mean()),silhouetteIou=float((a1&a2).sum()/(a1|a2).sum()),logicalSize=[w,h])
 return stat,rows,out,s
if mode=='fit':
 for scale in [.84,1,1.15,1.35,1.6,2]:
  for colors in [10,14,18,24]:
   for protect in (False,True):
    q,_,_,_=solution(scale,colors,112,3,protect)
    print(json.dumps(q))
else:
 scale,colors,minA,levels,pr=float(sys.argv[2]),int(sys.argv[3]),int(sys.argv[4]),int(sys.argv[5]),sys.argv[6]=='true'
 stat,rows,candidate,reference=solution(scale,colors,minA,levels,pr)
 variant=p/sys.argv[7];variant.mkdir(exist_ok=True)
 x={**stat,'sourceCommit':'1cc5479b713edab6fd26db4e20f8eb22b7401cb2','sourceSha256':hashlib.sha256(src.read_bytes()).hexdigest(),'rows':rows,
 'scope':'source-registered head only; no runtime PNG; rectangular native art primitives in painter order'}
 (variant/'native-layout.json').write_text(json.dumps(x,separators=(',',':'))+'\n')
 candidate.save(variant/'candidate.png');reference.save(variant/'source-same-grid.png')
 print(json.dumps(stat))
