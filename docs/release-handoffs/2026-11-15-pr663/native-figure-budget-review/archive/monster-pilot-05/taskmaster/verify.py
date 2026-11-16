import json,math,hashlib,subprocess,sys
from pathlib import Path
from PIL import Image
p=Path(__file__).parent
files=['native-layout.json','native-reconstruction.png','report.json']
before={f:hashlib.sha256((p/f).read_bytes()).hexdigest() for f in files}
subprocess.run([sys.executable,str(p/'render.py'),sys.argv[1]],check=True)
assert before=={f:hashlib.sha256((p/f).read_bytes()).hexdigest() for f in files}
a=json.loads((p/'native-layout.json').read_text());r=a['rows']
assert len(r)==115 and 2+math.ceil(len(r)/60)==4
assert len(r)+4<=119
assert all(len(v)==21 and all(math.isfinite(x) for x in v) for v in r)
assert all(v[0]==100003 and v[3]>0 and v[4]>0 for v in r)
assert all(sum(abs(x)>1e-9 for x in v[18:20])<=1 for v in r)
assert all(v[20]==0 for v in r)
report=json.loads((p/'report.json').read_text());assert report['exactTransformMaxError']<1e-6
Image.open(p/'native-reconstruction.png').resize((127,127),Image.Resampling.LANCZOS).save(p/'thumbnail-127.png')
result=dict(pass_=True,graphics=115,containers=4,total=119,rebuildByteExact=True,masks=0,maxTransformError=report['exactTransformMaxError'],scope='Offline geometric validation only; runtime and device NOT run')
(p/'verification.json').write_text(json.dumps(result,indent=2)+'\n');print(result)
