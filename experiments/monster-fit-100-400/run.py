"""TASK-25.7 offline geometry experiment; never updates production registries.
Reuses the existing native rectangle generator, not a new image/art generator.
"""
import base64
import io
import hashlib
import importlib.util
import json
from pathlib import Path
import sys
import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location('existing_rectangles', ROOT / 'scripts/art/build-performance-pack.py')
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)
BUDGETS = (100, 200, 400)
NAMES = ('looter', 'bronze_orb')
SIZE = 106

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def source(name):
    path = ROOT / 'art/monsters' / name / 'source.png'
    manifest = json.loads(path.with_name('asset.json').read_text())
    assert digest(path) == manifest['files']['source.png']['sha256'], 'Source digest mismatch'
    image = Image.open(path).convert('RGBA')
    # Preserve whole source, with the existing source review's 6% per-side inset.
    image.thumbnail((94, 94), Image.Resampling.LANCZOS)
    canvas = Image.new('RGBA', (SIZE, SIZE))
    canvas.alpha_composite(image, ((SIZE-image.width)//2, (SIZE-image.height)//2))
    return canvas, path

def render(rows):
    image = Image.new('RGBA', (SIZE, SIZE))
    draw = ImageDraw.Draw(image)
    for row in rows:
        kind, x, y, w, h = row[:5]
        assert kind == 100001 and w > 0 and h > 0
        left, top = round(x+SIZE/2-w/2), round(SIZE/2-y-h/2)
        assert 0 <= left < left+w <= SIZE and 0 <= top < top+h <= SIZE
        draw.rectangle((left, top, left+w-1, top+h-1), fill=tuple(row[-4:]))
    return image

def error(reference, candidate):
    def premult(image):
        a=np.asarray(image,dtype=float)/255
        return np.concatenate((a[:,:,:3]*a[:,:,3:4],a[:,:,3:4]),axis=2)
    return round(float(np.abs(premult(reference)-premult(candidate)).mean())*255, 4)

def main():
    results=[]
    svg=['<svg xmlns="http://www.w3.org/2000/svg" width="680" height="620" viewBox="0 0 680 620"><rect width="680" height="620" fill="#171e24"/><g fill="white" font-family="sans-serif" font-size="11"><text x="12" y="18">Offline reconstruction: SOURCE | &lt;=100 | &lt;=200 | &lt;=400</text></g>']
    sheet=Image.new('RGB',(680,620),'#171e24')
    draw=ImageDraw.Draw(sheet)
    draw.text((12,8),'Offline native rectangles. SOURCE | <=100 | <=200 | <=400',fill='white')
    for ni,name in enumerate(NAMES):
        original,path=source(name)
        candidates=[]
        for grid in range(4,65):
            rows,_=MODULE.rectangles(original,(grid,grid),(SIZE,SIZE),True)
            if rows:
                rebuilt=render(rows)
                candidates.append((error(original,rebuilt),grid,rows,rebuilt))
        outputs=[original]
        for budget in BUDGETS:
            eligible=[c for c in candidates if len(c[2])<=budget]
            # A bounded sweep, not a monotonic-count assumption. Objective error is
            # explanatory only; never substitutes for visual/device acceptance.
            score,grid,rows,rebuilt=min(eligible,key=lambda c:(c[0],-c[1]))
            payload={'schemaVersion':1,'status':'OFFLINE_EXPERIMENT_NOT_REGISTERED',
                'enemyId':name,'source':str(path.relative_to(ROOT)),'sourceSha256':digest(path),
                'canvas':[SIZE,SIZE],'wholeSourceInsetPixels':6,'grid':[grid,grid],
                'budget':budget,'rectangles':rows,'primitiveCount':len(rows),
                'premultipliedRgbaMAE':score,'officialCapacity':'UNVERIFIED','devices':'UNVERIFIED'}
            dest=OUT/f'{name}-{budget}.json'
            dest.write_text(json.dumps(payload,separators=(',',':'))+'\n')
            results.append({k:payload[k] for k in ['enemyId','budget','grid','primitiveCount','premultipliedRgbaMAE']})
            outputs.append(rebuilt)
        y=34+ni*290
        draw.text((12,y),name,fill='white')
        svg.append(f'<text x="12" y="{y+10}" fill="white" font-family="sans-serif" font-size="11">{name}</text>')
        for index,img in enumerate(outputs):
            x=12+index*164
            sheet.paste(img,(x,y+22),img)
            buf=io.BytesIO(); img.save(buf,format='PNG')
            encoded=base64.b64encode(buf.getvalue()).decode()
            svg.append(f'<image x="{x}" y="{y+22}" width="106" height="106" href="data:image/png;base64,{encoded}"/>')
            # Nearest 1.4x enlargement separated from actual 106px first row.
            large=img.resize((148,148),Image.Resampling.NEAREST)
            sheet.paste(large,(x,y+132),large)
            buf=io.BytesIO(); large.save(buf,format='PNG')
            encoded=base64.b64encode(buf.getvalue()).decode()
            svg.append(f'<image x="{x}" y="{y+132}" width="148" height="148" href="data:image/png;base64,{encoded}"/>')
    sheet.save(OUT/'comparison.png')
    (OUT/'comparison.svg').write_text(''.join(svg)+'</svg>\n')
    receipt={'base':'e65d9b98fbec69442047650254238cd9244df805',
        'method':'existing build-performance-pack rectangles; sweep grids 4..64; alpha retained',
        'generatorSha256':digest(ROOT/'scripts/art/build-performance-pack.py'),
        'experimentSha256':digest(Path(__file__)), 'results':results,
        'limits':['Offline geometry reconstruction, not native engine screenshot.',
          'Six outputs are not production bindings. No masks, hosts, hit targets or animation are implemented.',
          'Primitive count is not official capacity, controls total, drawcalls or device performance.',
          'Source roles remain candidate-only; owner/native/device approvals absent.']}
    (OUT/'receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
    print(json.dumps(results,indent=2))

if __name__=='__main__':
    main()
