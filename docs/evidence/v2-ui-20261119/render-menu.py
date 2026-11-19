from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from math import cos, sin, radians
import json, sys
root=json.loads(Path(sys.argv[1]).read_text())
out=Path(sys.argv[2])
out.mkdir(exist_ok=True)
def children(n): return n.get('children', n.get('controls', []))
def child(n,name): return next((x for x in children(n) if x['name']==name),None)
def matrix(n):
    scale=n.get('scale',[1,1])
    angles=n.get('rotation',0)
    x,y,z=[radians(v) for v in angles] if isinstance(angles,list) else (0,0,radians(angles))
    px,py=n.get('position',[0,0])
    return (cos(y)*cos(z)*scale[0],-cos(y)*sin(z)*scale[1],
        cos(x)*sin(z)*scale[0],cos(x)*cos(z)*scale[1],px,py)
def chain(a,b):
    x,y,z,w,tx,ty=a
    h,i,j,k,ux,uy=b
    return (x*h+y*j,x*i+y*k,z*h+w*j,z*i+w*k,x*ux+y*uy+tx,z*ux+w*uy+ty)
def project(matrix,point):
    a,b,c,d,x,y=matrix
    px,py=point
    return ((a*px+b*py+x+640)*2,(360-(c*px+d*py+y))*2)
menu=child(child(root,'stage') or root,'menuPanel')
assert menu
for mode in ['normal','hover']:
    canvas=Image.new('RGB',(2560,1440),'#35151B')
    draw=ImageDraw.Draw(canvas,'RGBA')
    def draw_node(n,parent=(1,0,0,1,0,0),state=None):
        if n.get('visible') is False and n['name']!=state:return
        pose=chain(parent,matrix(n))
        w,h=n.get('size',[0,0])
        typ=n['kind']
        colour=n.get('colour','#F6DFC6')
        if typ=='image':
            if n['image']==100003: points=[(-w/2,-h/2),(w/2,-h/2),(0,h/2)]
            elif n['image']==100001: points=[(-w/2,-h/2),(w/2,-h/2),(w/2,h/2),(-w/2,h/2)]
            else: return
            draw.polygon([project(pose,p) for p in points],colour)
        elif typ=='text':
            t=n['text']
            font=ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc',int(t['fontSize']*2))
            draw.text(project(pose,(0,0)),t['content'],font=font,fill=t['colour'],anchor='mm')
        elif n['name']=='v25MenuFace':
            draw_node(child(n,state),pose,state)
        else:
            for c in children(n):draw_node(c,pose,state)
    for name in ['menuRuinsScene','v25MainMenu','start','titleQuit']:
        branch=child(menu,name)
        assert branch
        draw_node(branch,state=mode if name=='start' else 'normal')
    canvas.resize((1280,720),Image.Resampling.LANCZOS).save(out/f'menu-{mode}.png')
