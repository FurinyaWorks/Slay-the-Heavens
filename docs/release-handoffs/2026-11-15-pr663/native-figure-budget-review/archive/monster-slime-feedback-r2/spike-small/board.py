from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from collections import deque
import sys
b=Path(__file__).resolve().parent
out=Path(sys.argv[1]);old=Path(sys.argv[2]);skip='--archive' in sys.argv
rich=Image.new('RGB',(1080,630),'#1c262c');d=ImageDraw.Draw(rich)
def font(n,b=False):return ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSansCJK-'+('Bold' if b else 'Regular')+'.ttc',n)
def t(x,y,s,n,c='#efece3',b=False):d.text((x,y),s,font=font(n,b),fill=c)
def crop(img):
 img=img.crop((596,355,810,535));w,h=img.size
 a=img.getchannel('A');src=a.tobytes();buf=bytearray(src);largest=[]
 for k in range(w*h):
  if not buf[k]:continue
  buf[k]=0;q=deque([k]);s=[k]
  while q:
   j=q.popleft();x,y=j%w,j//w
   for z in (j-1 if x else -1,j+1 if x+1<w else -1,j-w if y else -1,j+w if y+1<h else -1):
    if z>=0 and buf[z]:buf[z]=0;s.append(z);q.append(z)
  if len(s)>len(largest):largest=s
 a=bytearray(w*h)
 for i in largest:a[i]=src[i]
 img.putalpha(Image.frombytes('L',(w,h),bytes(a)));return img
pics=[] if skip else [('图鉴右下姿',crop(Image.open(b/'official.png').convert('RGBA')))]
pics+= [('旧稿 · 单眼（撤下）',Image.open(old).convert('RGBA')),('修订稿 · 双眼',Image.open(b/'native-reconstruction.png').convert('RGBA'))]
t(46,32,'小型棘刺团 · 双眼修订',42,b=True)
t(48,101,'仍为 41 图元＋3 容器，其他史莱姆不改。',22,'#b4c7cf')
cell=324 if not skip else 480
for k,(label,a) in enumerate(pics):
 x=43+cell*k
 d.rounded_rectangle((x,162,x+cell-16,538),14,fill='#34414a')
 t(x+18,181,label,22,'#ffd499' if k==len(pics)-1 else '#dce6e8',True)
 a=a.crop(a.getbbox())
 wide=a.copy();wide.thumbnail((245,173),Image.Resampling.LANCZOS);rich.paste(wide,(x+(cell-16-wide.width)//2,228),wide)
 small=a.copy();small.thumbnail((127,127),Image.Resampling.LANCZOS);rich.paste(small,(x+(cell-16-small.width)//2,418),small)
t(47,571,'上方为放大，下面是 127 px 尺度。新稿待审图，未接发版。',18,'#aebecc')
rich.save(out,optimize=True)
