from pathlib import Path
from PIL import Image,ImageDraw
import json,hashlib
p=Path(__file__).parent;x=json.loads((p/'native-layout.json').read_text());rows=[r for rr in x['imageRows'].values() for r in rr]
for r in rows:r[1]+=28
assert len(rows)==112
x.update(logicalSize=[600,600],imageRows={'wholeActor':rows},proposedContainers=4,measuredControllerExpected=116,notes='Official HoYoWiki entry2139 displayed image is design reference. New source-following plane authoring, not old generated derivative. Actual112 native triangles, proposed4containers. Isolated design probe.')
(p/'native-layout-whole-116.json').write_text(json.dumps(x,indent=2))
ref=Image.open(p/'source.png').crop((320,60,1050,870));ref.save(p/'reference-crop.png');draft=Image.open(p/'native-reconstruction.png').crop((0,0,600,600));draft.save(p/'draft116.png')
out=Image.new('RGB',(900,640),'#d8d8d8');d=ImageDraw.Draw(out)
for j,(label,im) in enumerate([('HoYoWiki entry2139 actual reference',ref),('Official-reference draft:116 total',draft)]):
 sm=im.copy();sm.thumbnail((127,127),Image.Resampling.LANCZOS);out.paste(sm,(j*450+160,35),sm);lg=im.copy();lg.thumbnail((420,420),Image.Resampling.LANCZOS);out.paste(lg,(j*450+15,190),lg);d.text((j*450+12,12),label,fill='black')
out.save(p/'official-source-v-native116.png')
api=json.load(open(p.parent/'official-reference/entry.json'))['data']['page']
report={'identity':api['name'],'referencePage':'https://wiki.hoyolab.com/pc/genshin/entry/2139?lang=en-us','referenceAPI':'https://sg-wiki-api.hoyolab.com/hoyowiki/wapi/entry_page?entry_page_id=2139','referencePixelUrl':api['header_img_url'],'referenceSha256':hashlib.sha256((p/'source.png').read_bytes()).hexdigest(),'referenceAttribution':'Actual header pixels displayed by official HoYoWiki entry. CDN path is event-ugc-hoyowiki; original studio authorship and license not independently certified. Not old AI-generated repo source.','binding':'Release src/lua/abyss_act2_enemies.lua:12 centurion name 岩卫统领; :83 act2_centurion_mystic. Proposed shield-role visual candidate, no binding mutation.','images':112,'containers':4,'total':116,'fixedCap':119,'process':'New manual planes traced to official-reference positions; closer hand, narrower legs, large vertical shield. Simplify inner facets to retain limbs and bone mask. Same-cap refinement repaired feet/mask and added intrinsic shield slab seam.','limitations':'Large flat low-resource reinterpretation, not exact official pixel copy; simplified mane, horn curves, wraps, spiral engraving. No commercial license inference. No production monster pool change or device performance test.'}
(p/'report116.json').write_text(json.dumps(report,indent=2));print(report)
