from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
root=Path('experiments/monster-lowpoly-combat');font=ImageFont.truetype('C:/Windows/Fonts/msyh.ttc',20)
for enemy,budget in [('large-geo-slime',350),('ruin-guard',500)]:
    page=Image.new('RGB',(1600,1260),'#203244');d=ImageDraw.Draw(page)
    for x,title,file in [(100,'原源稿 / 仅参考',Path('F:/New folder/art/monster-benchmarks/genshin-v2')/enemy/'source.png'),(550,'压色源 / 未恢复重点',root/'results'/enemy/'simplified-source.png'),(1000,f'几何预览 / {budget}预算',root/'results'/enemy/f'geometry-{budget}.png')]:
        im=Image.open(file).convert('RGBA');im.thumbnail((280,280),Image.Resampling.LANCZOS);page.paste(im,(x,45),im);d.text((x,10),title,font=font,fill='#eee0c0')
    d.text((50,333),'下图：真实SDK原生控件软件渲染；106/127为宿主设计尺寸，旧新主体占用边界不同；非官方设备验收。',font=font,fill='#eee0c0')
    native=Image.open(root/'evidence/comparison'/f'{enemy}-native.png').convert('RGB');page.paste(native,(0,360));page.save(root/'evidence/comparison'/f'{enemy}-source-fit-native.png')
