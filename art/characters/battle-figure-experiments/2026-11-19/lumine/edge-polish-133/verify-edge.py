import argparse,json
from pathlib import Path
import cv2, numpy as np
from PIL import Image
p=argparse.ArgumentParser()
p.add_argument('before',type=Path);p.add_argument('after',type=Path);p.add_argument('source',type=Path);p.add_argument('out',type=Path)
q=p.parse_args()
results={'method':{'color':'dark composite: (32,38,48)','referenceThreshold':100,'candidateAlphaThreshold':127,'onePixelInnerHoles':'a zero-alpha center with all eight native neighbors filled and source alpha >=128','attachedContourBumps':'filled native center, removed by 3×3 cross opening, with ≥1 native 8-neighbor, reference alpha <64 and center contrast to dark background >=75 average RGB levels','internalColorSpeckles':'opaque center + all eight neighbors foreground, maximum-channel median residual >64, with source residual <=20','faceLockedLTRBLogical':[62,15,75.5,27]}}
for m in [1,4]:
 f=('' if m==1 else '-4x')+'.png'
 load=lambda p:np.asarray(Image.open(p).convert('RGBA'),dtype=np.uint8)
 S=load(q.source/f'source{f}'); A=load(q.before/f'native{f}');B=load(q.after/f'native{f}')
 yy,xx=np.mgrid[:133*m,:133*m]/m
 face=(xx>=62)&(xx<75.5)&(yy>=15)&(yy<27)
 assert np.array_equal(A[face],B[face]), int(((A!=B).any(-1)&face).sum())
 alpha=S[...,3].astype(np.float32)/255
 bg=np.array([32,38,48],dtype=np.float32)
 comp=lambda x: np.rint(x[:,:,:3]*(x[:,:,3,None]/255)+bg*(1-x[:,:,3,None]/255)).astype(np.int16)
 model=comp(S); sam=alpha>=100/255
 ribbon=cv2.morphologyEx(sam.astype(np.uint8),cv2.MORPH_GRADIENT,np.ones((3 if m==1 else 5,)*2,np.uint8))>0
 result={}
 for name,x in [('before',A),('after',B)]:
  on=x[...,3]>127
  eight=cv2.filter2D(on.astype(np.uint8),-1,np.ones((3,3),np.uint8),borderType=cv2.BORDER_CONSTANT)-on
  under=x[...,3]==0
  patch=comp(x)
  residual=np.abs(patch-cv2.medianBlur(patch,3)).max(2)
  sr=np.abs(model-cv2.medianBlur(model,3)).max(2)
  specks=(eight==8)&on&(residual>64)&(sr<=20)&(alpha>=.5)
  errors=np.abs(patch-model)
  contrast=np.abs(x[:,:,:3].astype(np.int16)-bg).mean(2)
  opened=cv2.morphologyEx(on.astype(np.uint8),cv2.MORPH_OPEN,cv2.getStructuringElement(cv2.MORPH_CROSS,(3,3)))>0
  holes=under&(eight==8)&(alpha>=.5)
  bumps=on&~opened&(eight>=1)&(alpha<64/255)&(contrast>=75)
  ou=sam|on
  result[name]={'edgeLogicalMAE' if m==1 else 'edgeZoomMAE':round(float(errors[ribbon].mean()),4),'bodyMAE':round(float(errors[32*m:][ou[32*m:]].mean()),4),'referenceAlphaIoU':round(float((on&sam).sum()/ou.sum()),6),'onePixelInnerHoles':int(holes.sum()),'attachedContourBumps':int(bumps.sum()),'internalColorSpeckles':int(specks.sum()),'headOnePixelInnerHoles':int(holes[:32*m].sum()),'headAttachedContourBumps':int(bumps[:32*m].sum()),'headInternalColorSpeckles':int(specks[:32*m].sum())}
 result['lockedFacePixelsChanged']=0
 result['fullHeadRGBAPixelsChanged']=int((A[:32*m]!=B[:32*m]).any(-1).sum())
 result['semiTransparentPixels']=int(((B[...,3]>0)&(B[...,3]<255)).sum())
 results[str(133*m)]=result
q.out.write_text(json.dumps(results,indent=2,sort_keys=True)+'\n')
print(json.dumps(results,indent=2))
