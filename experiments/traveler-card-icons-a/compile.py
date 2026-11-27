#!/usr/bin/env python3
"""Geo icon authoring, raster preflight and native input materialization."""
import argparse, json, re, math, hashlib
from pathlib import Path
from itertools import combinations
from PIL import Image, ImageDraw, ImageFont
from geometry import INK, parse, cross, tris

def compact(val):
 return json.dumps(val,sort_keys=True,separators=(',',':'),ensure_ascii=False)

def strict_keys(pairs):
 d={}
 for k,v in pairs:
  if k in d:raise ValueError(f"duplicate JSON key: {k}")
  d[k]=v
 return d

def canvas(obj, scale=4):
 im=Image.new('RGBA',(obj['width']*scale,obj['height']*scale));d=ImageDraw.Draw(im)
 for x in obj['shapes']:
  d.polygon([(a*scale,b*scale) for a,b in x['points']],fill=x['color'])
 return im

def emit(out, rows, catalogs):
 by={}
 for path in catalogs:
  for id,value in json.loads(path.read_text(),object_pairs_hook=strict_keys).items():
   if id in by:raise ValueError(f'duplicate authoring entry: {id}')
   by[id]=value
 roster_ids={x['id'] for x in rows}
 if not by.keys()<=roster_ids: raise ValueError('unknown cards: '+str(by.keys()-roster_ids))
 if by.keys()!=roster_ids: raise ValueError('missing cards: '+str(roster_ids-by.keys()))
 out.mkdir(parents=True,exist_ok=True)
 sem={}
 hashes={}
 for row in rows:
  id=row['id'];value=by[id]
  if not value.get('intent') or not value.get('reference'):raise ValueError(id+' missing source or design note')
  if 'approved' in value:
   f=Path(value['approved'])
   approved=(catalogs[0].parent/f).resolve()
   if approved.parent!=catalogs[0].parent.joinpath('approved').resolve() or approved.name!=id+'.json':raise ValueError('approved input must be locked to the exact ID: '+id)
   raw=approved.read_bytes()
   if hashlib.sha256(raw).hexdigest()!=value['approvedSha256']:raise ValueError('approved bytes drift: '+id)
   obj=json.loads(raw)
   if obj['cardId']!=id or (obj['width'],obj['height'])!=(120,82):raise ValueError('approved asset mismatch')
  else:
   shapes=[]
   for shade,coords in value['paths']:
    points=parse(coords)
    if not all(0<=x<120 and 0<=y<82 for x,y in points):raise ValueError(id+' contains out-of-canvas point')
    triangles=tris(points)
    if not triangles:raise ValueError(id+' contains empty polygon')
    edges=list(zip(points,points[1:]+points[:1]))
    if any(cross(a,b,c)*cross(a,b,d)<0 and cross(c,d,a)*cross(c,d,b)<0 for (a,b),(c,d) in combinations(edges,2)):
     raise ValueError(id+' contains a self-crossing polygon')
    area=abs(sum(a[0]*b[1]-a[1]*b[0] for a,b in edges))
    if sum(abs(cross(*tri)) for tri in triangles)!=area:
     raise ValueError(id+' triangulation changes the source fill area')
    for points in triangles: shapes.append({'type':'triangle','points':points,'color':INK[shade],'opacity':1})
   obj={'cardId':id,'width':120,'height':82,'shapes':shapes}
   raw=(compact(obj)+'\n').encode()
  assert 1<=len(obj['shapes'])<=60,id
  assert all(len(s['points'])==3 and cross(*s['points'])!=0 for s in obj['shapes']),id
  pic=canvas(obj)
  x,y,w,h=pic.getbbox()
  assert x>=1 and y>=1 and w<pic.width and h<pic.height and (w-x)/pic.width>=.40 and (h-y)/pic.height>=.42,(id,pic.getbbox())
  (out/(id+'.json')).write_bytes(raw)
  pic.save(out/(id+'.png'),optimize=True)
  hashes[id]=hashlib.sha256(raw).hexdigest()
  sem[id]={'cardId':id,'name':row['name'],'type':row['type'],'primaryMechanic':row['rules'],'iconCue':value['intent'],'sourceAnchors':[value['reference']],'reviewStatus':'owner-sample-accepted' if 'approved' in value else 'authored-pending-independent-review'}
 (out/'semantic.json').write_text(compact(sem)+'\n')
 (out/'hashes.json').write_text(compact(hashes)+'\n')
 return by

def sheets(out,rows):
 light='#FAEED4'
 c={'attack':'#551C24','skill':'#1A3042','power':'#30233D'}
 for ix in range(0,len(rows),15):
  f=ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',18)
  s=ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',13)
  page=Image.new('RGB',(1250,630),'#192124');d=ImageDraw.Draw(page)
  d.text((14,6),'岩旅图标 A · 120×82 插画窗 / 60×41 缩小对照 · 共享类型底色',font=f,fill=light)
  for i,row in enumerate(rows[ix:ix+15]):
   x,y=i%5*250+10,i//5*197+43
   col=c[row['type']]
   d.rounded_rectangle((x,y,x+234,y+181),radius=8,fill='#222D30',outline='#36454A')
   d.text((x+10,y+8),row['name'],font=f,fill=light)
   d.text((x+10,y+151),row['id'],font=s,fill='#ACC1BE')
   a=Image.open(out/(row['id']+'.png'))
   for w,h,dx,dy in [(120,82,10,41),(60,41,151,62)]:
    im=a.resize((w,h),Image.Resampling.LANCZOS);d.rectangle((x+dx,y+dy,x+dx+w-1,y+dy+h-1),fill=col);page.paste(im,(x+dx,y+dy),im)
  page.save(out/('sheet-%d.png'%(1+ix//15)),optimize=True)

def main():
 p=argparse.ArgumentParser();p.add_argument('roster',type=Path);p.add_argument('out',type=Path);p.add_argument('catalogs',nargs='+',type=Path);p.add_argument('--sheets',action='store_true');a=p.parse_args()
 raw=json.loads(a.roster.read_text())
 rows=raw['cards'] if isinstance(raw,dict) else raw
 rows=list(rows.values()) if isinstance(rows,dict) else rows
 if len(rows)!=75 or len({x['id'] for x in rows})!=75: raise ValueError('expected exactly 75 distinct cohort IDs')
 emit(a.out,rows,a.catalogs)
 if a.sheets:sheets(a.out,rows)
 print('75 icons with checked identity, bounds and approved hashes')
if __name__=='__main__':main()
