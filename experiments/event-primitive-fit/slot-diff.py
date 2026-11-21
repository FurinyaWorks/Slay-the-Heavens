"""Quantify actual screenshots with only the art root visibility changed."""
import sys,json
from pathlib import Path
import numpy as np
from PIL import Image
d=Path(sys.argv[1]); cx,cy=map(int,sys.argv[2:4]) if len(sys.argv)==4 else (640,360)
data=json.loads((d/'capture.json').read_text())
for id,r in data.items():
    shown=np.asarray(Image.open(d/(id+'-shown.png')).convert('RGB'))
    hidden=np.asarray(Image.open(d/(id+'-hidden.png')).convert('RGB'))
    mask=(shown!=hidden).any(2)
    ys,xs=np.nonzero(mask)
    counts={}
    for name,(u,v) in {'slot':(165,165),'centeredWellEnvelope':(205,205)}.items():
        inside=np.zeros(mask.shape,bool)
        inside[cy-v:cy+v,cx-u:cx+u]=True
        counts[name]=int(np.count_nonzero(mask&~inside))
    bbox=[int(min(xs)),int(min(ys)),int(max(xs)+1),int(max(ys)+1)]
    margin=max(0,cx-165-bbox[0],cy-165-bbox[1],bbox[2]-cx-165,bbox[3]-cy-165)
    if (cx,cy)==(268,410):
        regions={'eventName':(50,127,670,187),'bodyAndOptionExtent':(515,212,1215,635),'conditionalBack':(0,569,181,621)}
        r['changedPixelsInProxyRects']={name:int(np.count_nonzero(mask[top:bottom,left:right]))
            for name,(left,top,right,bottom) in regions.items()}
    r.update(changedPixels=len(xs),offSlotPx=counts['slot'],offCenteredWellEnvelopePx=counts['centeredWellEnvelope'],bboxHalfOpen=bbox,maxDirectionalOvershoot=margin)
    print(id,counts,margin,bbox)
(d/'pixel-diff.json').write_text(json.dumps(data,indent=2)+'\n')
