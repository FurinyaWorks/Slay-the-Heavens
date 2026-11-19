"""Direct color shapes from owner's Medium, no generative redraw. Native geometry from repo."""
import cv2
import numpy as np
import shapely
from shapely.geometry import Polygon
from shapely.ops import unary_union
from scipy.ndimage import distance_transform_edt

PROFILE={
'balanced':(17,35,3.0,5),
'fidelity':(26,19,2.25,3),
'literal':(38,12,1.5,1),
}
def get_regions(mask,geom,area=2):
    c,hi=cv2.findContours(np.ascontiguousarray(mask,dtype='uint8'),cv2.RETR_CCOMP,cv2.CHAIN_APPROX_SIMPLE)
    if hi is None:return
    for i,t in enumerate(c):
        if hi[0,i,3]!=-1 or len(t)<3:continue
        if cv2.contourArea(t)<area:continue
        holes=[];j=hi[0,i,2]
        while j>=0:
            if len(c[j])>=3 and cv2.contourArea(c[j])>=max(7,area):holes.append(c[j][:,0,:])
            j=hi[0,j,0]
        yield from geom.polygons(shapely.make_valid(Polygon(t[:,0,:],holes)))
def mesh(rgb,alpha,fitter,solve,placer,profile):
    w=rgb.shape[1];h=rgb.shape[0]
    K,area,eps,blur=PROFILE[profile]
    yy,xx=np.mgrid[:h,:w]
    head=yy<110
    edge_weight=np.ones((h,w),np.float32)
    near=distance_transform_edt(~alpha,return_distances=False,return_indices=True)
    # Extend only color to avoid treating black void as paint, then restore exact alpha.
    ext=rgb[tuple(near)]
    clean=cv2.medianBlur(ext,blur) if blur>1 else ext
    cv2.setRNGSeed(744)
    lab=cv2.cvtColor(clean,cv2.COLOR_RGB2LAB)
    _,_,pal=cv2.kmeans(lab[alpha][::2].astype('float32'),K,None,(cv2.TERM_CRITERIA_EPS+cv2.TERM_CRITERIA_MAX_ITER,55,.1),1,cv2.KMEANS_PP_CENTERS)
    dist=((lab[:,:,None,:]-pal[None,None,:,:])**2).sum(-1)
    labels=dist.argmin(-1)
    kept=np.zeros_like(alpha)
    for k in range(K):
        _,comp,stats,_=cv2.connectedComponentsWithStats(np.asarray((labels==k)&alpha,dtype='uint8'),8)
        ordinary=stats[:,cv2.CC_STAT_AREA]>=area; small=stats[:,cv2.CC_STAT_AREA]>=area*.55
        ordinary[0]=small[0]=False
        kept|=ordinary[comp]|(small[comp]&head)
    assert kept.any()
    idx=distance_transform_edt(~kept,return_distances=False,return_indices=True)
    labels=labels[tuple(idx)]
    sil_orig=unary_union(list(get_regions(alpha,fitter))).buffer(.35,join_style='mitre')
    sil=sil_orig.simplify(eps*.65,preserve_topology=True)
    # Underpaint only the character. Separate the major bright/warm/cool surfaces.
    bones=[]
    low=cv2.cvtColor(ext,cv2.COLOR_RGB2HSV)
    lowH=cv2.medianBlur(low[:,:,0],9);lowS=cv2.medianBlur(low[:,:,1],9)
    cat=np.where((lowH<=35)&(lowS>56),1,np.where((lowH>80)&(lowS>33),2,0))
    for k,c in enumerate([(231,220,220),(240,194,163),(150,159,182)]):
        for p in get_regions((cat==k)&alpha,fitter,16):
            for s in fitter.polygons(p.buffer(1.55,join_style='mitre').intersection(sil).simplify(2.8,preserve_topology=True)):
                if s.area>=9:bones.append(('underpaint',s,c,2.1))
    blocks=[]
    for k in range(K):
        cc=((labels==k)&alpha)
        for p in get_regions(cc,fitter,4):
            if p.area<4:continue
            x,y=p.centroid.coords[0]
            x0,y0,x1,y1=[int(v) for v in p.bounds]
            m=np.zeros((y1-y0+1,x1-x0+1),'uint8')
            cv2.fillPoly(m,[np.rint(np.asarray(p.exterior.coords)-[x0,y0]).astype('int32')],1)
            sel=(m!=0)&cc[y0:y1+1,x0:x1+1]
            if not sel.any():continue
            color=np.rint(np.median(rgb[y0:y1+1,x0:x1+1][sel],axis=0)).astype(int).tolist()
            zone='face' if y<108 else ('legs' if y>346 else 'outfit')
            # Touching regions overlap 1.8 source pixels before clipping the union;
            # this hides cracks from the renderer while preserving true negative space.
            out=p.buffer(.95,join_style='mitre').intersection(sil)
            for q in fitter.polygons(out):
                if q.area>=4:
                    blocks.append((zone,q,color,eps*(.54 if zone=='face' else .84 if y>=467 else 1)))
    shapes=[];groups=[]
    def place(points,height):
        pts=np.asarray(points,dtype=float)
        z=solve(pts,height)
        if z:return z
        # Using one native isosceles transformed by the repo solver or exact
        # right-triangle halves; no custom image, shape type or masks.
        lengths=[np.dot(pts[(i+1)%3]-pts[(i+2)%3],pts[(i+1)%3]-pts[(i+2)%3]) for i in range(3)]
        for i in sorted(range(3),key=lambda i:-lengths[i]):
            a,b,c=pts[[i,(i+1)%3,(i+2)%3]]
            v=c-b;t=float((a-b)@v/(v@v))
            for s in (t,.5,.25,.75):
                if not (.00001<s<.99999):continue
                m=b+s*v
                u=solve(np.array([a,b,m]),height);q=solve(np.array([a,m,c]),height)
                if u and q:return u+q
        return placer.place(pts,height)
    place.Unavailable=placer.PlacementUnavailable
    skipped=0
    for group,region,col,simpl in sorted(bones,key=lambda a:-a[1].area)+sorted(blocks,key=lambda a:-a[1].area):
        # Preserve internal negative space. Native fitting and placement are
        # held fixed across precision variants.
        simple=region.simplify(simpl,preserve_topology=True)
        for region in fitter.polygons(simple):
            rows=fitter.geometry([(region,col)],.08,w,h,place,keep_holes=True)
            for row in rows:
                if row['type']=='polygon':
                    # Tiny unrepresentable sections stay covered by underpaint.
                    skipped+=1;continue
                # Guard projected texture dimensions, even for skinny legal facets.
                t=row.get('placement')
                if t and max(t['w'],t['h'])>2100:
                    skipped+=1;continue
                shapes.append(row);groups.append((group,'direct-'+group))
    print('Unplaceable/oversized sections filled by underpaint:',skipped)
    return shapes,groups
