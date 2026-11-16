from pathlib import Path
import sys
from PIL import Image, ImageDraw, ImageFont
root = Path(__file__).resolve().parent
archive = '--archive' in sys.argv
board = Image.new('RGB', (1100, 756), '#1a242b')
d = ImageDraw.Draw(board)
def text(x,y,s,pt,colour='#f0eee6',bold=False):
    f=ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSansCJK-'+('Bold' if bold else 'Regular')+'.ttc',pt)
    d.text((x,y),s,font=f,fill=colour)
def render(x,y,w,h,file,px):
    d.rounded_rectangle((x,y,x+w,y+h),13,fill='#36444d')
    a=Image.open(root/file).convert('RGBA')
    a=a.crop(a.getbbox()); a.thumbnail((px,px),Image.Resampling.LANCZOS)
    board.paste(a,(x+(w-a.width)//2,y+(h-a.height)//2),a)
text(45,24,'怪物量产 04 · 对照试制',42,bold=True)
text(48,92,'剪影和识别特征优先，用大色块保留原型',21,'#a9c2ce')
roster=[
 ('looter','窃金客','盗宝团斥候','蒙面、斜肩带、抬手',117,'official.png'),
 ('fungi-beast','蕈甲兽','陆行水本真蕈','卷角、双眼、阔蕈盖',118,'official-reference.png'),
]
for x,s in ((365,'原生拟合' if archive else 'HoYoWiki 图鉴'),(645,'127 px' if archive else '原生拟合'),(902,'' if archive else '127 px')):
    text(x,141,s,20,'#b7c8cf')
for i,(slug,name,ref,anchors,budget,origin) in enumerate(roster):
    y=184+254*i
    d.line((48,y-13,1050,y-13),fill='#52616c')
    text(48,y+25,name,32,bold=True)
    text(49,y+80,'原型：'+ref,21,'#bacbd3')
    text(49,y+117,anchors,18,'#bacbd3')
    text(49,y+169,str(budget)+' 个绘图控件',23,'#ffd296',True)
    native=slug+'/native-reconstruction.png'
    render(342,y,248,224,native if archive else slug+'/'+origin,195)
    render(616,y,248,224,native,127 if archive else 195)
    if not archive: render(889,y+30,162,162,native,127)
text(48,708,'含图元与绘图容器。待视觉确认，未接入游戏。',17,'#b4c6cf')
out=root/('native-board.png' if archive else '第四批怪物-窃金客与蕈甲兽.png')
board.save(out,optimize=True)
