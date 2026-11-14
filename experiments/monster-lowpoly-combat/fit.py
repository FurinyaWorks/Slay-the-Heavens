"""Transparent cel-shaded adapter over the shared contour and native-placement tools."""
import argparse, hashlib, importlib.util, json, time, subprocess
from pathlib import Path
import cv2
import numpy as np
from PIL import Image, ImageDraw
import shapely
ROOT=Path(__file__).resolve().parents[2]
def load(name,path):
    spec=importlib.util.spec_from_file_location(name,path); m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def run(source_root,out):
    out.mkdir(parents=True,exist_ok=True)
    fitter=load('contours',ROOT/'scripts/art/segment-lowpoly.py')
    placement=load('placement',ROOT/'scripts/art/native-triangle-placement.py')
    receipt={'scope':'source geometry only, not native renderer or device','fitScriptSha256':sha(Path(__file__)),'parameters':{'width':256,'paletteColors':8,'meanShiftSpatial':18,'meanShiftRange':48,'alphaThreshold':128,'silhouetteBudgetFraction':.22,'accentBudgetFraction':.20},'fitterSha256':sha(ROOT/'scripts/art/segment-lowpoly.py'),'placementSha256':sha(ROOT/'scripts/art/native-triangle-placement.py'),'samples':[]}
    for enemy,budgets in [('large-geo-slime',[100,200,350]),('ruin-guard',[200,350,500])]:
        started=time.perf_counter(); folder=source_root/'art/monster-benchmarks/genshin-v2'/enemy
        source=folder/'source.png'
        blob=subprocess.check_output(['git','show',f'HEAD:art/monster-benchmarks/genshin-v2/{enemy}/source.png'],cwd=ROOT)
        expected=next((line.split(b':',1)[1].decode()for line in blob.splitlines()if line.startswith(b'oid sha256:')),None) if blob.startswith(b'version https://git-lfs') else hashlib.sha256(blob).hexdigest()
        assert expected and sha(source)==expected,'Source pixels must match the retained Git/LFS identity'
        im=Image.open(source).convert('RGBA');width=256;height=round(im.height*width/im.width)
        image=im.resize((width,height),Image.Resampling.LANCZOS);rgb=np.asarray(image.convert('RGB'));alpha=np.asarray(image)[:,:,3]
        mask=(alpha>=128).astype('uint8')*255
        alpha_parts=fitter.regions(np.repeat(mask[:,:,None],3,axis=2),2,minimum_area=2,spatial=1,color_range=1)
        silhouette=shapely.union_all([p for p,c in alpha_parts if sum(c)>384])
        # Flatten the original palette before contouring: retain pose, armor and luminous eyes.
        filtered=cv2.pyrMeanShiftFiltering(rgb,18,48,maxLevel=1)
        flat=Image.fromarray(filtered).quantize(colors=8,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE).convert('RGB')
        flat_rgb=np.asarray(flat);parts=[];features=[]
        for p,c in fitter.regions(flat_rgb,8,minimum_area=5,spatial=1,color_range=1):
            for part in fitter.polygons(shapely.make_valid(p.intersection(silhouette))):
                if part.area>=2:
                    parts.append((part,c))
                    if c[0]>190 and c[1]>100 and c[0]>c[2]*1.6:features.append((part,c))
        # Restore only source-derived luminous eye/core pixels after global flattening.
        # Cropped regions use their own palette so orange cannot merge into armor.
        from shapely.affinity import translate
        features=[]
        rois=[(.23,.48,.34,.75),(.46,.49,.57,.76)] if enemy=='large-geo-slime' else [(.39,.185,.44,.245)]
        for x0,y0,x1,y1 in rois:
            left,top,right,bottom=round(x0*width),round(y0*height),round(x1*width),round(y1*height)
            for p,c in fitter.regions(rgb[top:bottom,left:right],8,minimum_area=1,spatial=1,color_range=8):
                if c[0]>190 and c[1]>85 and c[0]>c[2]*1.4:
                    features.append((translate(p,xoff=left,yoff=top),c))
        ellipses=[]
        # The old source's eye rings are near ellipses. Three nested source masks
        # replace jagged triangulated rings without inventing a new face.
        for x0,y0,x1,y1 in rois:
            left,top,right,bottom=round(x0*width),round(y0*height),round(x1*width),round(y1*height)
            crop=rgb[top:bottom,left:right]
            for red,green,blue in [(220,90,180),(235,155,180),(240,205,240)]:
                selected=(crop[:,:,0]>red)&(crop[:,:,1]>green)&(crop[:,:,2]<blue)
                yy,xx=np.where(selected)
                if len(xx)<3:continue
                colour=np.median(crop[selected],axis=0).astype(int)
                ellipses.append({'type':'ellipse','box':[float(left+xx.min()),float(top+yy.min()),float(xx.max()-xx.min()+1),float(yy.max()-yy.min()+1)],'colour':'#'+''.join(f'{v:02X}'for v in colour),'cost':1})
        features=[]
        if enemy=='ruin-guard':
            # Shoulder cylinders and waist are semantic identity blocks. Close
            # source texture gaps locally rather than spending budget on glyphs.
            for x0,y0,x1,y1 in [(.18,.04,.37,.24),(.69,.02,.89,.23),(.43,.50,.58,.70),(.29,.30,.62,.40)]:
                left,top,right,bottom=round(x0*width),round(y0*height),round(x1*width),round(y1*height)
                crop=rgb[top:bottom,left:right]
                warm=((crop[:,:,0]>120)&(crop[:,:,0]>crop[:,:,1]*1.35)&(crop[:,:,1]>crop[:,:,2]*1.35)).astype('uint8')*255
                warm=cv2.morphologyEx(warm,cv2.MORPH_CLOSE,np.ones((3,3),np.uint8))
                selected=crop[warm>0]
                if not len(selected):continue
                colour=np.median(selected,axis=0).astype(int).tolist()
                for p,c in fitter.regions(np.repeat(warm[:,:,None],3,axis=2),2,minimum_area=2,spatial=1,color_range=1):
                    if sum(c)>384:features.append((translate(p,xoff=left,yoff=top),colour))
        target=out/enemy;target.mkdir(exist_ok=True)
        simplified=flat.convert('RGBA');simplified.putalpha(Image.fromarray(alpha));simplified.save(target/'simplified-source.png')
        def choose(ps,allowance,keep_holes=False):
            lo,hi=.08,400.
            for _ in range(17):
                mid=(lo+hi)/2; shapes=fitter.geometry(ps,mid,width,height,placement.place,keep_holes=keep_holes)
                if sum(s['cost'] for s in shapes)>allowance:lo=mid
                else:hi=mid
            return fitter.geometry(ps,hi,width,height,placement.place,keep_holes=keep_holes),hi
        sample={'enemy':enemy,'sourceSha256':sha(source),'sourceSize':list(im.size),'budgets':[]}
        for budget in budgets:
            base,_=choose([(p,[52,43,36])for p in fitter.polygons(silhouette)],round(budget*.22),True)
            accent,_=choose(features,round(budget*.20))
            eyes=accent+[dict(s)for s in ellipses]
            detail,epsilon=choose(parts,budget-sum(s['cost']for s in base+eyes))
            shapes=base+detail+eyes;count=sum(s.pop('cost')for s in shapes);assert 0<count<=budget
            pack={'schemaVersion':1,'enemy':enemy,'sourceSha256':sha(source),'width':width,'height':height,'budget':budget,'nativeImages':count,'epsilon':epsilon,'opaqueBackground':False,'sourceAlphaThreshold':128,'shapes':shapes}
            (target/f'budget-{budget}.json').write_text(json.dumps(pack,separators=(',',':'))+'\n')
            preview=Image.new('RGBA',(width,height));draw=ImageDraw.Draw(preview)
            for s in shapes:
                if s['type'] in ['rect','ellipse']:
                    x,y,w,h=s['box'];getattr(draw,'ellipse' if s['type']=='ellipse' else 'rectangle')((x,y,x+w,y+h),fill=s['colour'])
                else:draw.polygon([tuple(p)for p in s['points']],fill=s['colour'])
            preview.save(target/f'geometry-{budget}.png')
            for size in [106,127]:
                preview.resize((size,round(height*size/width)),Image.Resampling.LANCZOS).save(target/f'geometry-{budget}-{size}.png')
            row={'budget':budget,'nativeImages':count,'packBytes':(target/f'budget-{budget}.json').stat().st_size};sample['budgets'].append(row);print(enemy,row,flush=True)
        sample['fitSeconds']=time.perf_counter()-started;receipt['samples'].append(sample)
    (out/'fit-receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--source-root',type=Path,required=True);p.add_argument('--output',type=Path,default=ROOT/'experiments/monster-lowpoly-combat/results');a=p.parse_args();run(a.source_root,a.output)
