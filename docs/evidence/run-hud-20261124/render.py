"""Runtime tree geometry projection. Not an SDK/client screenshot."""
import json,math,re,sys
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
base=Path('/tmp/hud-review-a/projection')
fontpath='/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'
if not Path(fontpath).exists():fontpath='/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc'
def font(n):return ImageFont.truetype(fontpath,max(8,round(n)))
def color(s,op=1):
 s=s or '#FFFFFF'
 try:v=tuple(bytes.fromhex(s.lstrip('#')))
 except:v=(255,255,255)
 return (*v[:3],max(0,min(255,round((v[3]if len(v)==4 else 255)*op))))
def wrap(s,f,w):
 rows=[]
 for line in s.split('\n'):
  row=''
  for ch in line:
   if row and f.getlength(row+ch)>w:rows.append(row);row=''
   row+=ch
  rows.append(row)
 return rows
reports=[]
for side in sys.argv[1:]or['before','after']:
 out=base/side
 for scene in json.loads((out/'scenes.json').read_text()):
  W,H=scene['width'],scene['height'];banner=100
  im=Image.new('RGBA',(W,H+banner),'#151820');d=ImageDraw.Draw(im)
  report={'scene':scene['name'],'meta':scene['meta'],'unknownTextures':0,'textOverflows':[],'hits':[],'controlBounds':[]}
  for c in scene['rows']:
   x,y,w,h=c['x'],c['y']+banner,c['w'],c['h'];kind=c['kind'];path=c['path']
   if w<=0 or h<=0:continue
   box=(x-w/2,y-h/2,x+w/2,y+h/2)
   if kind=='image':
    rgba=color(c.get('colour'),c.get('opacity',1));layer=Image.new('RGBA',im.size,(0,0,0,0));q=ImageDraw.Draw(layer)
    if c.get('image')==100001:
     q.rectangle(box,fill=rgba)
    elif c.get('image')in[100002,100003,100004]:
     # Diagnostic primitives only; true native texture/alpha remains unverified.
     if c['image']==100003:q.polygon([(x,y-h/2),(x+w/2,y+h/2),(x-w/2,y+h/2)],fill=rgba)
     elif c['image']==100004:q.polygon([(x,y-h/2),(x+w/2,y),(x,y+h/2),(x-w/2,y)],fill=rgba)
     else:q.ellipse(box,fill=rgba)
    else:
     report['unknownTextures']+=1
     if w>4 and h>4:q.rectangle(box,outline=(*rgba[:3],min(120,rgba[3])))
     if w>50 and h>35:q.text((box[0]+2,box[1]+2),'?'+str(c.get('image')),font=font(12),fill=(150,160,170,200))
    # Axis-aligned frame captures geometry. No invented image/artwork replacement.
    im=Image.alpha_composite(im,layer)
   elif kind=='text':
    text=re.sub(r'</?color(?:=#[0-9A-Fa-f]{6,8})?>','',c.get('content',''));text=re.sub(r'<[^>]+>','',text)
    f=font(c['fontSize']);lines=wrap(text,f,max(1,w));lineH=c['fontSize']*1.25;textH=len(lines)*lineH
    if text and textH>h+2:report['textOverflows'].append({'path':path,'text':text,'textHeight':textH,'boxHeight':h})
    layer=Image.new('RGBA',im.size,(0,0,0,0));q=ImageDraw.Draw(layer)
    ty=box[1]+max(0,(h-textH)/2)
    for line in lines:
     tx=box[0]if c.get('align')=='left'else box[2]-f.getlength(line)if c.get('align')=='right'else x-f.getlength(line)/2
     q.text((tx,ty),line,font=f,fill=color(c.get('ink')),anchor='lt');ty+=lineH
    im=Image.alpha_composite(im,layer)
   if kind in ['cursorArea','presetButton']and c.get('raycast')is not False and c.get('receivesAtCenter')is True:report['hits'].append({'path':path,'box':box})
   if any(z in path for z in ['/officialRunBar/steel','/topBar/steel','/relicBar/slot','/eventView/name','/eventView/body','/shopView','/mapRoute/hit']):report['controlBounds'].append({'path':path,'box':box,'kind':kind})
  # Cyan outlines are observed live touch targets, shown only for HUD/modal.
  d=ImageDraw.Draw(im)
  for h in report['hits']:
   if any(z in h['path']for z in ['/relicBar/','/potionEntry/slot','/relicPanel/','/mapRoute/','/runRoute/','/deckEntry/','/exitEntry/']):d.rectangle(h['box'],outline=(70,225,255,220),width=2)
  d.rectangle((0,0,W,banner-1),fill='#352440')
  d.text((12,5),'OFFLINE · 非官方客户端 | '+scene['name'],font=font(26),fill='#FFFFFF')
  d.text((12,39),'真实 Lua Host + 正式生成树 + 运行时 sibling 顺序；青框=中心可接收的命中边界。',font=font(18),fill='#FFFFFF')
  d.text((12,68),'SDK纹理未知用边框标ID；字体/裁切/旋转/透明纹理非原生，不作真机验收。',font=font(18),fill='#DDD0E8')
  im.convert('RGB').save(out/(scene['name']+'.png'))
  reports.append(report)
(base/'diagnostics.json').write_text(json.dumps(reports,ensure_ascii=False,indent=2)+'\n')
print('Rendered',len(reports),'runtime geometry projections')
