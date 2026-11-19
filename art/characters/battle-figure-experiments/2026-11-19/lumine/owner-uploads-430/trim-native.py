"""Local experiment-only reduction; route chosen rows back through the pinned exporter."""
import cv2, numpy as np
def reduce_shapes(shapes, groups, rgb, mask, count, sharpness=1):
    if not count or len(shapes)<=count:return shapes,groups,{}
    h,w=mask.shape
    bg=np.array([37,44,55],dtype=np.int32)
    truth=np.where(mask[...,None],rgb,bg).astype(np.int32)
    yy,xx=np.mgrid[:h,:w]
    weight=np.ones((h,w),np.float32)
    weight[(yy<107)&(xx>104)&(xx<162)]*=3.0  # eyes, brow, jaw
    weight[(yy<65)&(xx>61)&(xx<114)]*=2.0  # characteristic white flower
    weight[(yy>480) | ((yy>330)&(yy<370))]*=1.22
    weight[~mask]*=1.25
    mats=[];colors=[]
    for s in shapes:
        if s['type']=='rect':
            x,y,u,v=s['box'];points=[(x,y),(x+u,y),(x+u,y+v),(x,y+v)]
        else:points=s['points']
        pix=np.asarray(points)
        lo=np.maximum(np.floor(pix.min(axis=0)).astype(int),0)
        hi=np.minimum(np.ceil(pix.max(axis=0)).astype(int)+1,(w,h))
        x,y=lo;x1,y1=hi
        tile=np.zeros((y1-y,x1-x),dtype=np.uint8)
        cv2.fillPoly(tile,[np.rint(16*(pix-lo)).astype('int32')],1,shift=4)
        iy,ix=np.where(tile!=0)
        mats.append((iy+y,ix+x))
        c=s['colour'][1:];colors.append(np.array([int(c[i:i+2],16) for i in (0,2,4)],dtype=np.int32))
    active=np.ones(len(shapes),bool)
    # Find true final visible contribution after all later layers. Remove small
    # batches and rescore so that several overlapping support facets are not removed together.
    removed=[]
    while int(active.sum())>count:
        top=np.full((h,w),-1,np.int32)
        for i, (y,x) in enumerate(mats):
            if active[i]:top[y,x]=i
        canvas=np.broadcast_to(bg,(h,w,3)).copy()
        candidates=[]
        for i,(y,x) in enumerate(mats):
            if not active[i]:continue
            vis=(top[y,x]==i)
            if vis.any():
                orig=truth[y[vis],x[vis]]
                under=canvas[y[vis],x[vis]]
                c=colors[i]
                gain=np.mean(np.abs(orig-under)-np.abs(orig-c),axis=-1)
                penalty=np.mean(np.abs(under-c),axis=-1)
                value=float(((gain+sharpness*.25*penalty)*weight[y[vis],x[vis]]).sum())
            else:value=-1e9
            layer,name=groups[i]
            if (vis.any() and any(k in name.lower() for k in ('upper lash','amber body','stocking crown white','diamond','teal inset','cyan edge','small mouth'))):
                value+=2000.
            candidates.append((value,i))
            canvas[y,x]=colors[i]
        n=min(6,int(active.sum())-count)
        for value,i in sorted(candidates)[:n]:
            active[i]=False;removed.append((i,value))
    kept=[s for s,b in zip(shapes,active) if b]; kept_groups=[g for g,b in zip(groups,active) if b]
    return kept,kept_groups,dict(requested=count,removed=len(removed),ordering='greedy visible loss vs pinned medium, rescore every six',visibleWorstScore=max(s[1] for s in removed))
