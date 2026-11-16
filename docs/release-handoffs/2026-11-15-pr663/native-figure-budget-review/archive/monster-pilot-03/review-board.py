from pathlib import Path
import sys
from PIL import Image,ImageDraw,ImageFont
p=Path(__file__).resolve().parent
archive='--archive' in sys.argv
out=next((Path(x) for x in sys.argv[1:] if x!='--archive'),p/('native-board.png' if archive else '第三批怪物-开局小怪.png'))
im=Image.new('RGB',(1220,1210),'#1a242b')
d=ImageDraw.Draw(im)
def f(n,b):return ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSansCJK-'+('Bold' if b else 'Regular')+'.ttc',n)
def t(x,y,s,n,c='#f0eee6',b=0):d.text((x,y),s,font=f(n,b),fill=c)
def art(x,y,w,h,path,sz):
 d.rounded_rectangle((x,y,x+w,y+h),11,fill='#36444d')
 a=Image.open(path).convert('RGBA');a=a.crop(a.getbbox());a.thumbnail((sz,sz),Image.Resampling.LANCZOS)
 im.paste(a,(x+(w-a.width)//2,y+(h-a.height)//2),a)
def count(path):
 import json
 data=json.loads(path.read_text());r=data.get('rows',[])
 if not r:r=sum(data['imageRows'].values(),[])
 n=len(r)
 return n+2+(n+59)//60
roster=[
 ('cultist','祈火徒','草丘丘萨满','面具、叶扇、木杖','official.png'),
 ('jaw-worm','石颚兽','幼岩龙蜥','岩冠、蜷曲的身形、长尾','official.png'),
 ('red-louse','赤甲虫','伸缩火蕈兽','火色菌盖、长弯菌柄','official.png'),
 ('green-louse','青甲虫','伸缩岩蕈兽','岩色菌盖、金色岩片','official-reference.png')
]
t(58,30,'怪物量产 03 · 开局小怪',45,b=1)
t(60,99,'从原神图鉴造型取材，按战斗尺寸做原生拟合',23,'#b7c8cf')
t(398,154,'原生拟合' if archive else 'HoYoWiki 图鉴',20,'#a9c2ce')
t(681,154,'127 px' if archive else '原生拟合',20,'#ffd296')
if not archive:t(975,154,'127 px 新稿',20,'#a9c2ce')
for i,(k,name,ref,features,src) in enumerate(roster):
 y=192+235*i
 d.line((60,y-12,1158,y-12),fill='#52616c')
 t(61,y+15,name,32,b=1)
 t(62,y+66,'原型：'+ref,22,'#bacbd3')
 t(63,y+107,features,18,'#b7c8ce')
 path=p/k/'native-reconstruction.png'
 if not path.is_file():t(63,y+153,'暂未出稿',24,'#ffd296');continue
 n=count(p/k/'native-layout.json');t(63,y+153,str(n)+' 总绘图控件',24,'#ffd296',1)
 art(365,y,260,204,path if archive else p/k/src,181)
 art(656,y,260,204,path,127 if archive else 181)
 if not archive:art(954,y+26,174,152,path,127)
t(60,1167,'图元与绘图容器合计。画面待审，未接入游戏或发版。',17,'#b4c6cf')
im.save(out,optimize=True)
