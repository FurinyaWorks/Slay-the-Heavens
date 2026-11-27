import argparse,random,json
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
p=argparse.ArgumentParser();p.add_argument('art',type=Path);p.add_argument('out',type=Path);p.add_argument('--seed',type=int,default=7502);p.add_argument('--ids',nargs='*');a=p.parse_args()
ids=a.ids or sorted(x.stem for x in a.art.glob('*.png') if (a.art/(x.stem+'.json')).exists())
random.Random(a.seed).shuffle(ids);a.out.mkdir(exist_ok=True,parents=True)
f=ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',18)
for p in range(0,len(ids),15):
 im=Image.new('RGB',(1180,475),'#151B20');d=ImageDraw.Draw(im)
 d.text((12,6),'盲读 · 同底色，无名称/类型/效果 · 120×82，60×41',font=f,fill='#FAECDD')
 for i,id in enumerate(ids[p:p+15]):
  x=i%5*236; y=i//5*143+39
  d.text((x+9,y+3),str(i+p+1).zfill(2),font=f,fill='#FAECDD')
  g=Image.open(a.art/(id+'.png'))
  for w,h,u,v in [(120,82,9,31),(60,41,152,57)]:
   b=g.resize((w,h),Image.Resampling.LANCZOS);d.rectangle((x+u,y+v,x+u+w-1,y+v+h-1),fill='#263440');im.paste(b,(x+u,y+v),b)
 im.save(a.out/('blind-%02d.png'%(1+p//15)),optimize=True)
(a.out/'reveal-after-free-read.json').write_text(json.dumps(dict(enumerate(ids,1)),indent=2)+'\n')
