"""Offline semantic-region fit of the painted STS1 menu. Never loaded by game."""
import hashlib, json, time
from pathlib import Path
import cv2
import numpy as np
from PIL import Image, ImageDraw
import shapely
from shapely.geometry import Polygon
import importlib.util

ROOT=Path(__file__).resolve().parents[2]
ART=ROOT/'docs/design/reference-assets/v2.0.0/sts1-main-menu-20261121'
OUT=ROOT/'data/presentation'
spec=importlib.util.spec_from_file_location('regions',ROOT/'experiments/menu-red-fit/fit.py')
old=importlib.util.module_from_spec(spec);spec.loader.exec_module(old)
W,H=836,470

def contour_parts(mask, colour):
    contours, hierarchy=cv2.findContours(mask.astype('uint8'),cv2.RETR_CCOMP,cv2.CHAIN_APPROX_SIMPLE)
    result=[]
    if hierarchy is None:return result
    for i,c in enumerate(contours):
        if hierarchy[0][i][3]!=-1 or len(c)<3:continue
        holes=[];child=hierarchy[0][i][2]
        while child!=-1:
            if len(contours[child])>=3:holes.append(contours[child][:,0,:])
            child=hierarchy[0][child][0]
        for p in old.polygons(shapely.make_valid(Polygon(c[:,0,:],holes))):
            if p.area>=2:result.append((p,colour))
    return result

def triangles(parts, epsilon):
    shapes=[]
    for p,c in sorted(parts,key=lambda pc:pc[0].area,reverse=True):
        if p.area < max(2,epsilon*epsilon*.35):continue
        simple=p.simplify(epsilon,preserve_topology=True)
        for tri in shapely.constrained_delaunay_triangles(simple).geoms:
            shapes.append({'type':'polygon','points':[[round(x,2),round(y,2)] for x,y in list(tri.exterior.coords)[:-1]],'colour':'#'+''.join(f'{int(v):02X}' for v in c)})
    return shapes

def choose(parts,budget):
    lo,hi=.25,60
    for _ in range(14):
        mid=(lo+hi)/2
        if len(triangles(parts,mid))>budget:lo=mid
        else:hi=mid
    result=triangles(parts,hi)
    assert len(result)<=budget
    return result,round(hi,3)

def pack(shapes,source,regions):
    return {'width':W,'height':H,'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'nativeMode':'single-axis-static-xyz','regions':regions,'shapes':shapes}

def preview(shapes,path):
    im=Image.new('RGB',(W,H),'#677F7C');d=ImageDraw.Draw(im)
    for s in shapes:
        if s['type']=='rect':d.rectangle((0,0,W,H),fill=s['colour'])
        else:d.polygon([tuple(p) for p in s['points']],fill=s['colour'])
    im.save(path)

started=time.perf_counter()
source=ART/'background-hd.png'
im=np.asarray(Image.open(source).convert('RGB').resize((W,H),Image.Resampling.LANCZOS))
parts=old.regions(im,56,minimum_area=14,spatial=4)
# Disjoint semantic ownership, independently simplified: sky broad/low cost;
# tower and cloud edges receive the budget. No whole-image triangle mesh.
groups={k:[] for k in ['sky','tower','ceiling','diagonalCloud','foregroundCloud']}
for p,c in parts:
    x,y=p.representative_point().coords[0];r,g,b=c
    if g>r and g>b*.95:key='sky'
    elif x<W*.205 and r>g*1.2 and r>b*1.3:key='tower'
    elif y<H*.30:key='ceiling'
    elif y<H*.63:key='diagonalCloud'
    else:key='foregroundCloud'
    groups[key].append((Polygon(p.exterior),c))
# Stable hand-traced major silhouettes from the painting at 836x470.
# These broad underpaint regions prevent simplification gaps from breaking clouds.
underpaint={
 'sky':[],
 'glow':[(Polygon([(0,36),(60,21),(110,20),(150,21),(190,28),(220,45),(280,58),(260,87),(222,100),(195,87),(175,79),(150,77),(105,75),(71,94),(28,108),(0,104)]),[167,87,37])],
 'tower':[(Polygon([(116,48),(149,55),(154,156),(162,230),(158,272),(174,272),(160,301),(163,470),(104,470),(108,358),(106,279),(109,208)]),[91,52,37])],
 'ceiling':[(Polygon([(0,0),(836,0),(836,101),(791,95),(737,99),(674,87),(607,88),(555,77),(509,61),(478,70),(432,88),(392,97),(353,85),(309,62),(278,88),(243,114),(206,113),(168,97),(127,81),(169,74),(207,60),(178,36),(113,26),(60,40),(0,67)]),[57,43,53])],
 'diagonalCloud':[(Polygon([(359,112),(395,94),(427,97),(452,114),(477,121),(522,121),(569,108),(609,92),(652,77),(686,70),(735,51),(716,75),(679,97),(655,113),(608,131),(560,139),(515,136),(478,131),(435,123),(407,109),(388,108)]),[98,64,74]),(Polygon([(186,282),(239,265),(269,249),(297,247),(326,255),(366,248),(406,231),(442,224),(484,206),(529,188),(582,181),(560,207),(606,187),(638,168),(665,141),(694,132),(714,121),(739,124),(791,110),(836,105),(836,139),(801,153),(762,174),(732,180),(707,195),(660,216),(625,234),(603,261),(551,270),(515,282),(452,292),(409,298),(371,287),(330,292),(287,283),(246,285)]),[86,60,72]),(Polygon([(0,101),(42,88),(66,71),(103,71),(119,69),(100,85),(84,99),(51,112),(24,117),(0,119)]),[96,61,71]),(Polygon([(0,172),(25,167),(48,174),(80,172),(106,169),(127,183),(151,198),(134,204),(104,200),(81,211),(58,223),(29,227),(0,219)]),[54,39,54]),(Polygon([(7,260),(46,249),(81,247),(110,237),(135,243),(159,240),(173,243),(210,239),(235,247),(208,252),(188,262),(151,267),(125,274),(99,269),(70,268),(48,264)]),[57,42,56])],
 'foregroundCloud':[(Polygon([(0,303),(26,299),(49,291),(75,291),(102,284),(131,290),(155,287),(181,300),(209,300),(229,308),(265,309),(294,318),(322,319),(348,320),(372,317),(397,322),(440,324),(409,333),(386,335),(352,345),(310,352),(279,359),(266,372),(226,373),(198,361),(178,354),(149,355),(124,345),(98,340),(73,332),(50,329),(23,329),(0,325)]),[50,37,51]),(Polygon([(176,398),(216,391),(253,378),(289,366),(318,359),(346,364),(376,365),(397,356),(416,341),(444,338),(466,350),(487,365),(509,369),(522,384),(540,396),(567,397),(594,402),(627,390),(660,391),(687,395),(705,393),(675,406),(640,412),(601,421),(563,428),(517,431),(484,437),(448,432),(407,443),(367,451),(306,451),(344,436),(370,426),(328,416),(292,411),(257,407),(217,409)]),[79,55,67]),(Polygon([(724,416),(754,403),(778,403),(804,389),(836,381),(836,416),(798,420),(760,418)]),[80,58,70])]
}
base={'type':'rect','box':[0,0,W,H],'colour':'#677F7C'}
def mesh_region(poly, spacing, fallback=None):
    # Local mesh inside a semantic silhouette, never a global screen mesh.
    from shapely.geometry import MultiPoint, Point
    points=list(poly.exterior.coords)[:-1]
    x0,y0,x1,y1=poly.bounds
    for yy in np.arange(y0+spacing/2,y1,spacing):
        for xx in np.arange(x0+spacing/2,x1,spacing):
            px=xx+spacing*.22*np.sin(xx*.31+yy*.17);py=yy+spacing*.22*np.cos(xx*.19-yy*.23)
            if poly.contains(Point(px,py)):points.append((px,py))
    shapes=[]
    for cell in shapely.delaunay_triangles(MultiPoint(points)).geoms:
        for clipped in old.polygons(cell.intersection(poly)):
            for tri in shapely.constrained_delaunay_triangles(clipped).geoms:
                vertices=list(tri.exterior.coords)[:-1]
                mask=np.zeros((H,W),'uint8');cv2.fillPoly(mask,[np.array(vertices,dtype='int32')],1)
                samples=im[mask!=0]
                if fallback=='sky':samples=samples[(samples[:,1]>samples[:,0])&(samples[:,1]>samples[:,2]*.95)]
                colour=np.median(samples,axis=0).astype(int) if len(samples) else np.array([103,127,124])
                shapes.append({'type':'polygon','points':[[round(x,2),round(y,2)] for x,y in vertices],'colour':'#'+''.join(f'{v:02X}' for v in colour)})
    return shapes
for level,multiplier in [('low',1.6),('medium',1)]:
    shapes=[base];stats={}
    sky=mesh_region(Polygon([(0,0),(W,0),(W,H),(0,H)]),90*multiplier,'sky');shapes+=sky
    stats['sky']={'images':len(sky),'spacing':90*multiplier}
    for name,ps in list(underpaint.items())[1:]:
        spacing={'glow':23,'tower':15,'ceiling':43,'diagonalCloud':23,'foregroundCloud':27}[name]*multiplier
        fitted=[]
        for poly,_ in ps:fitted+=mesh_region(poly,spacing)
        shapes+=fitted;stats[name]={'images':len(fitted),'spacing':spacing}
    # Source-local tower fissures: retain small warm lights discarded by median cells.
    yy,xx=np.indices((H,W));rr,gg,bb=im[:,:,0],im[:,:,1],im[:,:,2]
    fire=(xx>W*.12)&(xx<W*.20)&(yy>H*.72)&(rr>175)&(gg>60)&(bb<85)&(rr.astype(float)>gg*1.5)
    flames,_=choose(contour_parts(fire,[246,111,30]),48)
    shapes+=flames;stats['fissures']={'images':len(flames),'budget':48}
    data=pack(shapes,source,stats)
    (ART/f'background-{level}.json').write_text(json.dumps(data,separators=(',',':'))+'\n')
    preview(shapes,ART/f'background-{level}.png')
    if level=='medium':(OUT/'native-menu-sts1.json').write_text(json.dumps(data,separators=(',',':'))+'\n')
# Gold lettering: separate source-connected colour contours with true counters.
logo=np.asarray(Image.open(ART/'design-hd.png').convert('RGB').resize((W,H),Image.Resampling.LANCZOS))
r,g,b=logo[:,:,0].astype(float),logo[:,:,1].astype(float),logo[:,:,2].astype(float)
y,x=np.indices((H,W));mask=(x>W*.30)&(x<W*.67)&(y>H*.25)&(y<H*.67)&(r>140)&(g>105)&(b<155)&(r>b*1.5)&(g>b*1.3)
shadow=cv2.dilate(mask.astype('uint8'),np.ones((7,7),'uint8'))
shadow_parts=contour_parts(shadow,[40,35,38]);shadows,_=choose(shadow_parts,180)
quant=Image.fromarray(logo[mask].reshape(-1,1,3)).quantize(colors=12,dither=Image.Dither.NONE)
palette=np.asarray(quant.getpalette()).reshape(-1,3)[:12]
labels=np.argmin(((logo.astype(float)[:,:,None,:]-palette.astype(float)[None,None,:,:])**2).sum(axis=3),axis=2)
letters=[]
for label in np.unique(labels[mask]):letters+=contour_parts((labels==label)&mask,palette[label])
body,_=choose(contour_parts(mask,[255,205,48]),240)
highlights,e=choose(letters,240)
gold=body+highlights
logo_pack=pack(shadows+gold,ART/'design-hd.png',{'shadow':len(shadows),'gold':len(gold),'epsilon':e})
(OUT/'native-menu-sts1-logo.json').write_text(json.dumps(logo_pack,separators=(',',':'))+'\n')
(ART/'fit-receipt.json').write_text(json.dumps({'seconds':time.perf_counter()-started,'background':data['regions'],'logo':logo_pack['regions'],'backgroundImages':len(data['shapes']),'logoImages':len(logo_pack['shapes']),'method':'hand-traced semantic silhouettes; per-region local meshes and source median colours; gold mask with counters'},indent=2)+'\n')
print((ART/'fit-receipt.json').read_text())

import subprocess
subprocess.run(["node","experiments/sts1-menu-fit/compile.mjs"],cwd=ROOT,check=True)
