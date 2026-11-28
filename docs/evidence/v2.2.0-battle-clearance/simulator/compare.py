from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json
import sys

BEFORE, AFTER, OUTPUT = (Path(a) for a in sys.argv[1:4])
OUTPUT.mkdir(parents=True, exist_ok=True)
FONT=Path('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc')
BOLD=Path('/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc')
BACKGROUND='#12141C'
PANEL='#222633'
INK='#EFF1F6'
MUTED='#A8ADBE'
ACCENT='#E6BC62'

def font(size, bold=False):
    return ImageFont.truetype(BOLD if bold else FONT, size)

def fit(path, width, crop=None):
    image=Image.open(path).convert('RGB')
    if crop:
        x0,y0,x1,y1=crop
        scale=image.height/720
        cx=image.width/2
        cy=image.height/2
        image=image.crop((round(cx+x0*scale),round(cy-y1*scale),round(cx+x1*scale),round(cy-y0*scale)))
    return image.resize((width, round(image.height*width/image.width)),Image.Resampling.LANCZOS)

def decorate(title, subtitle, rows, footer, filename):
    margin,gap,image_width=48,22,790
    board_width=2*margin+2*image_width+gap
    left=margin
    right=margin+image_width+gap
    head=168
    height=head+sum(66+r[2].height for r in rows)+56
    board=Image.new('RGB',(board_width,height),BACKGROUND)
    d=ImageDraw.Draw(board)
    d.text((left,34),title,font=font(45,True),fill=INK)
    d.text((left,95),subtitle,font=font(25),fill=MUTED)
    d.line((left,144,board_width-margin,144),fill=PANEL,width=2)
    y=head
    for label, subtitle, before, after in rows:
        d.text((left,y),label,font=font(27,True),fill=INK)
        d.text((left+326,y+3),subtitle,font=font(22),fill=MUTED)
        d.text((right+image_width,y+3),'修复后',font=font(22,True),fill=ACCENT,anchor='ra')
        y+=42
        board.paste(before,(left,y))
        board.paste(after,(right,y))
        y+=before.height+24
    d.text((left,y+4),footer,font=font(18),fill=MUTED)
    board.save(OUTPUT/filename,quality=87,method=6)

def pair(name, crop=None):
    return [fit(path/'png'/(name+'.png'),790,crop) for path in (BEFORE,AFTER)]

base=json.loads((BEFORE/'measurements.json').read_text())
after=json.loads((AFTER/'measurements.json').read_text())

def status_gap(data,key):
    power=next(iter(data[key]['powers'].values()))
    return min(power[name]['firstPixelTopClearance'] for name in ('icon','countLine'))
def clearance(key):
    return f"可见区垂直净距 {status_gap(base,key):+.1f} → {status_gap(after,key):+.1f} 舞台单位"

rows=[('PC · 攻击姿态',clearance('pc-offense'),*pair('pc-offense',(105,-275,490,-102))),
      ('移动 · 攻击姿态',clearance('mobile-offense'),*pair('mobile-offense',(105,-275,490,-102))),
      ('移动 · 防御姿态',clearance('mobile-defense'),*pair('mobile-defense',(105,-275,490,-102)))]
decorate('深渊守卫 · 五张常态手牌','左为 Release 基线，右为修复候选。裁切范围在各组内一致。',rows,
         '正式 Release GameUI 控件由 Beyond Simulator 0.5.2 渲染。PC 1600×900，移动 1560×720。','guardian-layout-ab.webp')
rows=[('移动 · 十张手牌','五只史莱姆组合',*pair('mobile-lots-of-slimes-ten')),
      ('PC · 悬停第 4 张牌','保留临时上抬',*pair('pc-offense-hover'))]
decorate('宽手牌与悬停 · 布局对照','左为 Release 基线，右为修复候选。使用同一输入与战斗状态。',rows,
         '正式 Release GameUI 控件由 Beyond Simulator 0.5.2 渲染。实际设备与官方客户端待验证。','hand-layout-ab.webp')
