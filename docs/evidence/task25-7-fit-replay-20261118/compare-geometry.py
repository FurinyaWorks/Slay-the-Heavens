"""Source/fit geometry contact sheet. Does not render native placement matrices."""
import hashlib
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path.cwd()
evidence = Path('/workspace/work/monster-fit-evidence')
sources = Path('/workspace/work/monster-sources/art/monsters')
geometry = json.loads((evidence / 'geometry.json').read_text())
font_path = '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'
font = ImageFont.truetype(font_path, 20)
small = ImageFont.truetype(font_path, 16)
sheet = Image.new('RGB', (1440, 810), '#1A2734')
draw = ImageDraw.Draw(sheet)
draw.text((24, 12), 'TASK-25.7 · 旧源图 / 100 / 200 / 400 图元：本轮几何重放', font=font, fill='#F2E7D0')
draw.text((24, 48), '仅Python几何预览；未重放SDK材质/变换，不是官方画面。原图与拟合均按当前生产设计尺寸显示。', font=small, fill='#CFD5DE')
inputs = []
for enemy, top in [('jaw_worm', 94), ('hexaghost', 366)]:
    side = round(geometry[enemy]['portrait'])
    draw.text((24, top), f'{enemy} · {geometry[enemy]["portrait"]:.2f} 设计单位 · Owner尚未批准采用', font=small, fill='#F2E7D0')
    images = [Image.open(sources / enemy / 'source.png').convert('RGBA')]
    images.extend(Image.open(root / f'build/monster-low-budget/{enemy}/geometry-{budget}-256.png').convert('RGBA') for budget in [100, 200, 400])
    for i, image in enumerate(images):
        caption = '原始源图' if i == 0 else f'{[100, 200, 400][i - 1]} 图元预算'
        draw.text((i * 360 + 20, top + 30), caption, font=small, fill='#CFD5DE')
        image = image.resize((side, side), Image.Resampling.LANCZOS)
        sheet.paste(image, (i * 360 + (360 - side) // 2, top + 58), image)
    source = sources / enemy / 'source.png'
    inputs.append({'enemy': enemy, 'sourceSha256': hashlib.sha256(source.read_bytes()).hexdigest(), 'sidePixels': side})
draw.text((24, 754), '100/200档仍损失关键结构；400档仅供继续评审，不能作为正式采用或设备性能的通过凭据。', font=small, fill='#FFD08A')
target = evidence / 'geometry-comparison.png'
sheet.save(target)
(evidence / 'geometry-comparison.json').write_text(json.dumps({'scope': __doc__, 'imageSha256': hashlib.sha256(target.read_bytes()).hexdigest(), 'fontSha256': hashlib.sha256(Path(font_path).read_bytes()).hexdigest(), 'inputs': inputs}, indent=2) + '\n')
print(target)
