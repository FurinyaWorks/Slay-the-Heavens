from pathlib import Path
import json,sys
from PIL import Image,ImageDraw,ImageFont
p=Path(__file__).parent
native_only='--native-only' in sys.argv
out=next((Path(x) for x in sys.argv[1:] if not x.startswith('--')),p/'官方原型对照-怪物试制.png')
data=[('大型棘刺团','大型岩史莱姆','44','双岩角、岩壳、低矮圆身','geo-slime/official-reference.png','geo-slime/native-reconstruction.png'),
 ('大型酸液团','大型草史莱姆','44','三瓣冠、前叶、橙边双长眼','official/dendro/official.png','official/dendro/native-reconstruction.png')]
if (p/'mitachurl/official119/draft116.png').is_file():
 info=json.loads((p/'mitachurl/official119/runtime-result.json').read_text())
 data.append(('岩卫统领','岩盾丘丘暴徒',str(info['controls']),'巨岩盾、白骨面具、红角、窄站姿','mitachurl/official-reference/header.png','mitachurl/official119/draft116.png'))
st=294
finish=186+st*len(data)
im=Image.new('RGB',(1250,finish+58),'#141b20');d=ImageDraw.Draw(im)
def f(n,b=0):return ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSansCJK-'+('Bold' if b else 'Regular')+'.ttc',n)
def t(x,y,s,n,c='#f0f0e9',b=0):d.text((x,y),s,font=f(n,b),fill=c)
def put(x,y,w,h,path,sz):
 d.rounded_rectangle((x,y,x+w,y+h),12,fill='#242d35',outline='#38434d')
 i=Image.open(path).convert('RGBA');i=i.crop(i.getbbox());i.thumbnail((sz,sz),Image.Resampling.LANCZOS);im.paste(i,(x+(w-i.width)//2,y+(h-i.height)//2),i)
t(56,30,'怪物量产 · 官方原型版',47,b=1)
t(58,100,'实际敌人 → 原神图鉴原型 → 原生低图元',24,'#acbbc6')
t(369,151,'原生拟合' if native_only else 'HoYoWiki 图鉴',21,'#a8becc')
t(655,151,'127 px 战斗尺度' if native_only else '原生拟合',21,'#ffda93')
if not native_only:t(945,151,'127 px：图鉴 → 拟合',22,'#a8becc')
for j,(enemy,original,count,anchors,ref,fit) in enumerate(data):
 y=194+j*st
 d.line((56,y-12,1193,y-12),fill='#44505a')
 t(59,y+35,enemy,32,b=1)
 t(60,y+91,'原型：'+original,23,'#b6c9d4')
 t(60,y+135,anchors,17,'#cfd9dc')
 t(60,y+190,count+' 总绘图控件',25,'#ffda93',1)
 if native_only:
  put(347,y,270,262,p/fit,210);put(634,y,245,262,p/fit,127)
 else:
  put(347,y,270,262,p/ref,210);put(634,y,270,262,p/fit,210)
  put(916,y+52,133,158,p/ref,127);put(1062,y+52,133,158,p/fit,127)
t(58,finish+6,'统计包含图元 + 绘图容器。独立控制器 VM 实测，不含战斗 HUD 或正式怪物池。',17,'#a8becc')
im.save(out,optimize=True)
