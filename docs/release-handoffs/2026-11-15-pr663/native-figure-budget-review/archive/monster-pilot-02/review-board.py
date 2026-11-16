from pathlib import Path
import sys
from collections import deque
from PIL import Image,ImageDraw,ImageFont
p=Path(__file__).resolve().parent
native_only='--archive' in sys.argv
default='native-review.png' if native_only else '史莱姆第二批-官方参照.png'
out=next((Path(x) for x in sys.argv[1:] if x != '--archive'),p/default)
root=Image.new('RGB',(1250,1238),'#161e24');d=ImageDraw.Draw(root)
ink='#f1eee6';soft='#b7c8cf';gold='#fdcf8c'
font=lambda n,b:ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSansCJK-'+('Bold' if b else 'Regular')+'.ttc',n)
def t(x,y,s,n,c=ink,b=False):d.text((x,y),s,font=font(n,b),fill=c)
def get(f,crop=None):
 a=Image.open(p/f).convert('RGBA')
 if crop:
  a=a.crop(crop);w,h=a.size
  alpha=a.getchannel('A');raw=bytearray(alpha.tobytes())
  keep=[]
  for k in range(w*h):
   if not raw[k]:continue
   found=[k];raw[k]=0;q=deque([k])
   while q:
    j=q.popleft();x,y=j%w,j//w
    for g in ((j-1 if x else -1),(j+1 if x+1<w else -1),(j-w if y else -1),(j+w if y+1<h else -1)):
     if g>=0 and raw[g]:raw[g]=0;found.append(g);q.append(g)
   if len(found)>len(keep):keep=found
  src=alpha.tobytes();aout=bytearray(w*h)
  for k in keep:aout[k]=src[k]
  a.putalpha(Image.frombytes('L',(w,h),bytes(aout)))
 return a.crop(a.getbbox())
def put(x,y,w,h,a,sz,bg='#3a4851'):
 d.rounded_rectangle((x,y,x+w,y+h),12,fill=bg)
 a=a.copy();a.thumbnail((sz,sz),Image.Resampling.LANCZOS);root.paste(a,(x+(w-a.width)//2,y+(h-a.height)//2),a)
data=[
 ('小型酸液团','普通草史莱姆 · 右下姿','35 控件','短叶冠、低圆身体、暖色双眼','acid-small/official-reference.png',(627,397,857,647),'acid-small/native-reconstruction.png'),
 ('小型棘刺团','普通岩史莱姆 · 左下姿','44 控件','贴地宽扁、单侧发光眼、岩块','spike-small/source.png',(100,365,350,550),'spike-small/preview.png'),
 ('中型棘刺团','普通岩史莱姆 · 中央姿','44 控件','直立圆身、双长眼、双岩角','spike-medium/official.png',(345,135,615,412),'spike-medium/native-reconstruction.png')]
t(55,33,'怪物量产 02 · 史莱姆组',45,b=True)
t(58,106,'三只均在 44 总绘图控件以内，保留原型差异',23,soft)
t(395,159,'原生拟合' if native_only else 'HoYoWiki 图鉴',21,soft)
t(709,159,'127 px' if native_only else '原生拟合',21,gold)
if not native_only:t(1005,159,'127 px 新稿',21,soft)
for j,(enemy,ref,count,trait,src,crop,fit) in enumerate(data):
 y=206+255*j
 d.line((58,y-13,1189,y-13),fill='#4a5a65')
 t(61,y+21,enemy,32,b=True);t(62,y+76,ref,19,soft);t(63,y+115,trait,18,soft);t(63,y+162,count,29,gold,True)
 a=get(fit)
 put(365,y,289,216,a if native_only else get(src,crop),188)
 put(685,y,289,216,a,127 if native_only else 188)
 if not native_only:put(1003,y+26,175,165,a,127)
y=975
d.rounded_rectangle((57,y,1190,y+206),14,fill='#213039')
t(76,y+12,'五只同屏测试：小棘刺 × 3 + 小酸液 × 2',24,b=True)
for k in range(5):
 key=1 if k<3 else 0
 put(91+197*k,y+65,169,105,get(data[key][-1]),82,'#33454f')
t(110,y+172,'五只同屏为示意；实际战斗渲染在离线模拟里验证，未改正式资源池。',16,soft)
root.save(out,optimize=True)
