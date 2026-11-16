from pathlib import Path
from PIL import Image,ImageDraw
import json,hashlib,subprocess,collections
import sys
p=Path(__file__).parent;repo=Path(sys.argv[1]).resolve();sha=subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo,text=True).strip();a=json.loads((p/'native-layout.json').read_text());rows=a['imageRows']['wholeActor']
for r in rows:r[1]+=28
assert len(rows)+3<=44
a.update(logicalSize=[600,600],sourceCommit=sha,imageRows={'wholeActor':rows},proposedContainers=3,measuredControllerExpected=44,notes='Actual Geo Slime not Large; left-bottom official reference pose. Three structural containers included, controller object not extra UI control. Design candidate.')
(p/'native44.json').write_text(json.dumps(a,indent=2))
im=Image.open(p/'source.png');print('sourceSize',im.size);crop=im.crop((100,365,350,550));crop.save(p/'reference-crop.png');draft=Image.open(p/'preview.png');out=Image.new('RGB',(800,580),'#d8d8d8');d=ImageDraw.Draw(out)
for j,(label,x) in enumerate([('Geo Slime / HoYoWiki2137 left-bottom',crop),('Small spike candidate / 44 controls',draft)]):
 sm=x.copy();sm.thumbnail((127,127),Image.Resampling.LANCZOS);out.paste(sm,(j*400+136,35),sm);lg=x.copy();lg.thumbnail((380,380),Image.Resampling.LANCZOS);out.paste(lg,(j*400+10,190),lg);d.text((j*400+8,12),label,fill='black')
out.save(p/'source-v-native44.png')
api=json.load(open(p/'entry2137.json'))['data']['page'];r={'enemyId':'spike_slime_s','displayName':'小型棘刺团','baselineCommit':sha,'referenceIdentity':api['name'],'officialPage':'https://wiki.hoyolab.com/pc/genshin/entry/2137?lang=en-us','api':'https://sg-wiki-api.hoyolab.com/hoyowiki/wapi/entry_page?entry_page_id=2137','referenceUrl':api['header_img_url'],'sourceSha256':hashlib.sha256((p/'source.png').read_bytes()).hexdigest(),'pose':'left-bottom compressed/grounded pose crop100,365,350,550; not center upright pose; small regular Geo Slime2137, not Large2127','images':len(rows),'containers':3,'total':44,'primitiveTypes':dict(collections.Counter(r[0] for r in rows)),'halfMaskedTriangles':sum(r[20]==1 for r in rows),'design':'Compact wide grounded brown-gray body, dominant rock caps, one side-visible glowing eye and small leaves; no dome-shaped yellow armored Large Geo Slime. Actual triangles/ellipses only, no runtime PNG.','limitations':'Simplified shapes and color fields; not exact reference pixels. Official HoYoWiki displayed image, CDN is UGC path; no independent studio-author or license certification. No production mutation/device performance claim.'};(p/'report.json').write_text(json.dumps(r,indent=2));print(r)
