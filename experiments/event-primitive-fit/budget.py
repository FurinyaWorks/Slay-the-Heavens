"""Drop whole shape groups from reviewed fit, keeping render and native counts separate."""
import argparse,json,copy
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw
from refine import CUES,stats,G,SIDE

REVIEWED={'cleric':'contour','purifier':'contour','goop':'contour','upgrade_shrine':'contour',
          'golden_wing':'base','shining_light':'base'}
LIMITS=(48,52,56)
def layer(shape):
    im=Image.new('1',(G,G));d=ImageDraw.Draw(im);s=G/SIDE
    if shape['type']=='rect':
        x,y,w,h=shape['box'];d.rectangle((s*x,s*y,s*(x+w),s*(y+h)),fill=1)
    else:d.polygon([(s*x,s*y) for x,y in shape['points']],fill=1)
    assert shape.get('opacity',1)==1
    return np.asarray(im).reshape(-1)
def image(ids,coverage,colour):
    top=np.max(np.where(coverage[ids],np.asarray(ids)[:,None],-1),axis=0)
    return colour[top].reshape(G,G,3)
def prune(shapes,ref,masks):
    coverage=np.asarray([layer(s) for s in shapes])
    colour=np.asarray([[int(s['colour'][j:j+2],16) for j in (1,3,5)] for s in shapes]+[[0,0,0]],dtype=float)
    ids=list(range(len(shapes)));cost=sum(int(s['cost']) for s in shapes);original=image(ids,coverage,colour)
    # Score losing part of the trained fit more than losing exact background pixels.
    cue=np.maximum.reduce(masks)
    loss=lambda render: float(np.mean(np.abs(render-ref)*(1+3*cue[:,:,None]))+
                              .8*np.mean(np.abs(render-original)*(1+3*cue[:,:,None])))
    history={}
    while cost>=min(LIMITS):
        for n in LIMITS:
            if n not in history and cost<=n:history[n]=(ids.copy(),cost,image(ids,coverage,colour))
        if min(LIMITS) in history:break
        options=[((loss(image(ids[:i]+ids[i+1:],coverage,colour))-loss(image(ids,coverage,colour)))/shapes[idx]['cost'],i)
                 for i,idx in enumerate(ids) if cost-shapes[idx]['cost']>=min(LIMITS)]
        if not options:break
        _,i=min(options);cost-=shapes[ids.pop(i)]['cost']
    return original,history

def main():
    p=argparse.ArgumentParser()
    for k in ('base','contour','portraits','out'):p.add_argument(k,type=Path)
    a=p.parse_args();a.out.mkdir(parents=True,exist_ok=True)
    ys,xs=np.mgrid[0:G,0:G]/(G-1);results={}
    for id,mode in REVIEWED.items():
        pack=json.loads((getattr(a,mode)/id/'fit.json').read_text())
        full=pack['tiers']['60'];shapes=full['shapes'];ref=np.asarray(Image.open(a.portraits/(id+'.png')).convert('RGB').resize((G,G),Image.Resampling.LANCZOS)).astype(float)
        masks=[np.exp(-2*((xs-x)**2/rx**2+(ys-y)**2/ry**2)) for _,x,y,rx,ry in CUES[id]]
        original,reduced=prune(shapes,ref,masks)
        for label,(ids,actual,preview) in [*sorted(reduced.items()),('full',(list(range(len(shapes))),sum(s['cost'] for s in shapes),original))]:
            key=f'{id}_{label}'; new=copy.deepcopy(pack);new['id']=key;stage=new['tiers']['60']
            stage['shapes']=[shapes[i] for i in ids]; stage['geometry']=len(ids);stage['projectedImageControls']=actual
            mm=stats(ref,preview,np.maximum.reduce(masks));stage['maeAt144']=mm['mae']
            row={'event':id,'label':label,'basePreference':mode,'images':actual,'metrics':mm,
                 'deltaFromFullByCue':[round(float((np.abs(preview-original).mean(2)*m).sum()/m.sum()),3) for m in masks]}
            stage['method']={**stage['method'],'controlSweep':label}
            path=a.out/key;path.mkdir(exist_ok=True);(path/'fit.json').write_text(json.dumps(new,separators=(',',':'))+'\n')
            results[key]=row; print(key,row,flush=True)
    assert len(results)==24
    (a.out.parent/'budget-metrics.json').write_text(json.dumps(results,indent=2)+'\n')
if __name__=='__main__':main()
