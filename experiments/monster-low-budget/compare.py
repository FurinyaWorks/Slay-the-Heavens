"""Contact sheet: source images and actual SDK captures at unchanged pixel scale."""
import argparse
import hashlib
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

parser = argparse.ArgumentParser()
parser.add_argument('--source-root', type=Path, required=True)
parser.add_argument('--output', type=Path, default=Path('build/monster-low-budget'))
args = parser.parse_args()
sheet = Image.new('RGB', (1280, 1650), '#1A2734')
draw = ImageDraw.Draw(sheet)
font = ImageFont.truetype('C:/Windows/Fonts/msyh.ttc', 20)
small = ImageFont.truetype('C:/Windows/Fonts/msyh.ttc', 16)
draw.text((24, 12), 'TASK-25.7 旧源图 / 100 / 200 / 400：实际SDK原生控件软件重建', font=font, fill='#F2E7D0')
draw.text((24, 48), '不是官方客户端或实体手机；下面原生画面按1:1像素裁取，未放大美化。', font=small, fill='#D6DCE0')
for enemy, size, top, crop in [('jaw_worm', 173, 90, (0, 100, 1280, 510)),
                               ('hexaghost', 300, 740, (0, 100, 1280, 560))]:
    source = Image.open(args.source_root / 'art/monsters' / enemy / 'source.png').convert('RGBA')
    source.thumbnail((size, size), Image.Resampling.LANCZOS)
    draw.text((24, top), f'{enemy} 原始源图：{size}设计单位阅读参考，Owner未批准正式采用', font=small, fill='#F2E7D0')
    sheet.paste(source, (24, top + 28), source)
    native = Image.open(args.output / enemy / 'native-runtime.png').convert('RGB')
    # The source is only a reference preview; the four-column native capture is unchanged.
    y = top + max(size, 175) + 40
    sheet.paste(native.crop(crop), (0, y))
draw.text((24, 1600), '100/200档不建议采用；400档仍需身份细节、边缘与实际设备验证，不自动Go。', font=small, fill='#FFD08A')
sheet.save(args.output / 'comparison.png')
digest = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
receipt = {'schemaVersion': 1, 'scope': 'Technical source/SDK comparison only, no official or device acceptance',
           'compareScriptSha256': digest(Path(__file__)), 'pngSha256': digest(args.output / 'comparison.png'),
           'inputs': [{'enemy': enemy, 'sourceSha256': digest(args.source_root / 'art/monsters' / enemy / 'source.png'),
                       'runtimePngSha256': digest(args.output / enemy / 'native-runtime.png')}
                      for enemy in ['jaw_worm', 'hexaghost']]}
(args.output / 'comparison-receipt.json').write_text(json.dumps(receipt, indent=2) + '\n')
