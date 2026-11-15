"""Bounded offline evidence validation, not an engine/device test."""
import importlib.util
import json
from pathlib import Path
import hashlib
P=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('experiment',P/'run.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
for name in m.NAMES:
    image,source=m.source(name)
    previous=None
    for budget in m.BUDGETS:
        pack=json.loads((P/f'{name}-{budget}.json').read_text())
        rows=pack['rectangles']
        assert len(rows)==pack['primitiveCount']<=budget
        assert pack['sourceSha256']==m.digest(source)
        assert all(len(row)==18 and row[-1]>=8 and all(0<=v<=255 for v in row[-4:]) for row in rows)
        reconstructed=m.render(rows)
        assert m.error(image,reconstructed)==pack['premultipliedRgbaMAE']
        assert reconstructed.getpixel((0,0))[3]==0
        assert previous is None or pack['premultipliedRgbaMAE']<=previous
        previous=pack['premultipliedRgbaMAE']
        regenerated,_=m.MODULE.rectangles(image,tuple(pack['grid']),(106,106),True)
        assert rows==regenerated
        print(name,budget,'PASS provenance/budget/geometry/alpha/reproducibility')
# Evidence identity validates the actual checked-in generator, not only prose.
receipt=json.loads((P/'receipt.json').read_text())
assert receipt['experimentSha256']==m.digest(P/'run.py')
assert receipt['generatorSha256']==m.digest(m.ROOT/'scripts/art/build-performance-pack.py')
print('6/6 candidate contracts passed; device/native/production UNVERIFIED')
