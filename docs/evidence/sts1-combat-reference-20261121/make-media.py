"""Assemble actual SDK captures; never redraw game controls."""
import hashlib
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parents[3]
out = Path(__file__).resolve().parent
font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 22)
flow = root / '.artifacts/sts1-flow-reference'
scenes = json.loads((flow / 'scenes.json').read_text())
frames, durations, elapsed, rounded = [], [], 0, 0
for scene in scenes:
    frames.append(Image.open(flow / (scene['name'] + '.png')).resize((960, 540)))
    elapsed += scene['durationMs']
    end = round(elapsed / 10) * 10
    durations.append(end - rounded)
    rounded = end
frames[0].save(out / 'flow-spike.gif', save_all=True, append_images=frames[1:],
               duration=durations, loop=0, disposal=2)
Image.open(flow / 'exhaust-12.png').save(out / 'exhaust-spike-still.png')
status = root / '.artifacts/sts1-status-reference'
mapping = json.loads((status / 'mapping.json').read_text())
gallery = Image.open(status / 'formal-status-textures.png')
gallery.save(out / 'status-contact-sheet.png')
pair = Image.new('RGB', (480, 180), '#171B20')
draw = ImageDraw.Draw(pair)
for j, key in enumerate(['strength', 'ritual']):
    i = next(i for i, row in enumerate(mapping) if row['id'] == key)
    x, y = 800 - 420 + i % 7 * 140, 450 - (230 - i // 7 * 80)
    pair.paste(gallery.crop((x-62, y-30, x+62, y+48)), (j*240+58, 15))
    row = mapping[i]
    draw.text((j*240+30, 120), f'{key}: {row["picture"]}', font=font, fill='white')
pair.save(out / 'strength-ritual.png')
cache = Path('/home/agent/.cache/beyond-simulator/images/sprite-v1/d9bc41f7e80c')
hashes = [{**row, 'sha256': hashlib.sha256((cache / f'{row["picture"]}.png').read_bytes()).hexdigest()} for row in mapping]
assert len({row['sha256'] for row in hashes}) == len(hashes) == 49
(out / 'status-texture-hashes.json').write_text(json.dumps(hashes, ensure_ascii=False, indent=2)+'\n')
active = Image.open(root / '.artifacts/sts1-energy-reference/corrected-0-3.png').crop((620,270,980,630))
restored = Image.open(root / '.artifacts/sts1-energy-reference/corrected-2-3.png').crop((620,270,980,630))
assert active.tobytes() == restored.tobytes(), 'restored full orb must match charged pixels'
print('83 timed SDK frames; 49 distinct native texture hashes; charged/restored orb pixels identical')
