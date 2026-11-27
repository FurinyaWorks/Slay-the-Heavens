#!/usr/bin/env python3
"""Compile and verify a disabled Traveler icon pack from six-card or 75-card artwork."""
import argparse, hashlib, importlib.util, itertools, json, math, re, sys
from pathlib import Path

SOLVER_SHA='213ca42805a67623b58a4cebb5e27f75142374ca84bc1798534a22b157cb0002'
BASE={'attack':'#551C24','skill':'#1A3042','power':'#30233D'}
def require(v,m):
    if not v:raise ValueError(m)
def sha(s):return hashlib.sha256(s).hexdigest()
def nonblank(s):return isinstance(s,str) and bool(s.strip())
def num(v):return type(v) in (int,float) and math.isfinite(v)
def take_uniq(pairs):
    out={}
    for k,v in pairs:
        require(k not in out,'duplicate JSON key: '+k)
        out[k]=v
    return out
def read_json(p):return json.loads(p.read_bytes(),object_pairs_hook=take_uniq,parse_constant=lambda s: (_ for _ in ()).throw(ValueError('invalid number '+s)))
def dump(data):return json.dumps(data,ensure_ascii=False,allow_nan=False,separators=(',',':'))+'\n'
def xyz(v):return v if isinstance(v,list) else [0,0,v or 0]
def row(s):
    color=s.get('colour',s.get('color'))
    require(isinstance(color,str) and re.fullmatch(r'#[0-9A-Fa-f]{6}',color),'invalid exact six-digit colour')
    opacity=s.get('opacity',1)
    require(num(opacity) and 0<opacity<=1,'invalid opacity')
    r=[int(color[i:i+2],16) for i in (1,3,5)]
    p=s.get('pivot',[.5,.5]);scl=s.get('scale',[1,1]);rot=xyz(s.get('rotation'))
    require(len(p)==len(scl)==2 and len(rot)==3,'invalid art vector length')
    raw=[s['image'],*s['position'],*s['size'],*p,.5,.5,.5,.5,*scl,rot[2],*r,round(opacity*255),rot[0],rot[1],int(bool(s.get('half')))]
    require(len(raw)==21 and all(num(x) for x in raw),'nonfinite native row')
    return [round(x,6) if x%1 else int(x) for x in raw]

def polygon(native):
    image,x,y,w,h,p,q,_,_,_,_,sx,sy,z,*rgb,rx,ry,masked=native
    A,B,C=map(math.radians,(rx,ry,z))
    ax,bx=math.cos(A),math.sin(A);ay,by=math.cos(B),math.sin(B);az,bz=math.cos(C),math.sin(C)
    m,n,o,p2=ay*az+by*bx*bz,-ay*bz+by*bx*az,ax*bz,ax*az
    pts=[(w/2,0),(w,0),(w/2,h)] if masked else [(0,0),(w,0),(w/2,h)] if image==100003 else [(0,0),(w,0),(w,h),(0,h)]
    for a,b in pts:
        a=(a-p*w)*sx;b=(b-q*h)*sy
        yield x+m*a+n*b, y+o*a+p2*b

def check_row(native,kind):
    require(isinstance(native,list) and len(native)==21 and all(num(x) for x in native),'nonfinite/malformed native row')
    r=native
    require(r[3]>.02 and r[4]>.02 and r[3]<=200 and r[4]<=160,'invalid image dimensions')
    require(r[0] in (100001,100002,100003) and r[20] in (0,1) and (not r[20] or r[0]==100003),'unsupported image or fill')
    require((-180 <= r[13] <= 180) and abs(r[18])<=78 and abs(r[19])<=78 and r[18]*r[19]==0,'invalid single-axis transform')
    require(all(0<=v<=1 for v in r[5:11]) and all(v in (-1,1) for v in r[11:13]),'unsupported anchors, pivot or scale')
    require(all(type(v) is int and 0<=v<=255 for v in r[14:18]) and r[17]>0,'invalid native sRGB/opacity')
    require(all(abs(x)<=72.002 and abs(y)<=32.002 for x,y in polygon(r)),'projected primitive leaves 144×64 art canvas')
    if kind=='icon':require(r[17]>=245,'icon should be solid, not background lighting')

def build_rows(data,tpath):
    if 'A' in data:
        require(data.get('canvas')==[144,64],'native wrapper expected 144×64')
        require(isinstance(data['A'],list),'empty native list')
        return [row(x) for x in data['A']]
    require(isinstance(data.get('shapes'),list) and len(data['shapes'])>=1,'raw triangles list missing')
    w,h=data['width'],data['height']
    require(num(w) and num(h) and 10<=w<=2048 and 10<=h<=2048,'invalid authored canvas')
    spec=importlib.util.spec_from_file_location('native',tpath);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
    import numpy as np
    k=min(140/w,60/h); ret=[]
    for s in data['shapes']:
        pts=s['points'];color=s.get('color',s.get('colour'));opacity=s.get('opacity',1)
        require(s.get('type')=='triangle' and isinstance(pts,list) and len(pts)==3 and all(isinstance(p,list) and len(p)==2 and all(num(x) for x in p) and 0<=p[0]<=w and 0<=p[1]<=h for p in pts),'out-of-bounds / malformed triangle')
        q=np.array([[(x-w/2)*k,(h/2-y)*k] for x,y in pts]);v,u=q[1]-q[0],q[2]-q[0]
        require(abs(v[0]*u[1]-v[1]*u[0])>=.02,'degenerate authored triangle')
        placements=[]
        for i in itertools.permutations(range(3)):
            f=m.solve(*q[list(i)])
            if f and max(abs(f['rx']),abs(f['ry']))<=78 and .03<=min(f['w'],f['h']) and f['w']<=200 and f['h']<=160:
                placements.append(f)
        if placements:
            f=min(placements,key=lambda a: abs(a['rx'])+abs(a['ry']))
            f={key:float(val) for key,val in f.items()}
            ret.append(row(dict(image=100003, position=[f['cx'],f['cy']], size=[f['w'],f['h']], rotation=[f['rx'],f['ry'],f['rz']], colour=color, opacity=opacity)))
            continue
        sides=[float(np.sum((q[i]-q[(i+1)%3])**2)) for i in range(3)]
        idx=max(range(3),key=lambda i:sides[i]); b,c,a=q[idx],q[(idx+1)%3],q[(idx+2)%3]; v=c-b
        foot=b+np.dot(a-b,v)/np.dot(v,v)*v
        for e in (b,c):
            x,y=e-foot; u,z=a-foot; ww=math.hypot(x,y); hh=math.hypot(u,z)
            if ww<1e-7:continue
            require(ww*2>.02 and hh>.02,'fallback triangle below native numerical floor, needs refit')
            ret.append(row(dict(image=100003,position=foot.tolist(),size=[ww*2,hh],rotation=[0,0,math.degrees(math.atan2(y,x))],colour=color,opacity=opacity,pivot=[.5,0],scale=[1,1 if x*z-y*u>=0 else -1],half=True)))
    return ret

def manifest(p,pinned):
    d=read_json(p);rows=d['cards']; require(d.get('sourceGit')==pinned and d.get('enabled') is False and d.get('cardCount')==75,'roster lease or disabled flag mis-match')
    indexed={r['id']:r for r in rows}
    require(len(rows)==len(indexed)==75 and all(re.fullmatch(r'[a-z][a-z0-9_]+',i) for i in indexed),'invalid canonical roster IDs')
    return indexed

def semantics(d,id,canonical,allow_pending):
    require(isinstance(d,dict),'missing semantic review file '+id)
    require(d.get('cardId')==id and d.get('name')==canonical['name'],'stale/localized name mismatch in semantic report '+id)
    require(d.get('type',canonical['type'])==canonical['type'] and d.get('primaryMechanic')==canonical['rules'],'semantic record does not cite exact runtime card rule '+id)
    require(nonblank(d.get('iconCue')) and isinstance(d.get('sourceAnchors'),list) and d['sourceAnchors'] and all(nonblank(x) for x in d['sourceAnchors']),'empty visual/semantic evidence '+id)
    status=d.get('reviewStatus')
    require(status in ('pass','pending','owner-sample-accepted','authored-pending-independent-review'),'unknown review status '+str(status))
    require((status in ('pass','owner-sample-accepted') or allow_pending) and (status!='pass' or nonblank(d.get('reviewer'))),'missing independent acceptance '+id)
    return d

def decor():
    return [row(dict(image=100002,position=[0,0],size=[77,56],colour='#CCB982',opacity=.12)),
        *[row(dict(image=100001,position=[x,y],size=[5,5],rotation=[0,0,45],colour='#D9C994',opacity=.13)) for x in (-62,62) for y in (-24,24)],
        row(dict(image=100001,position=[0,0],size=[108,1],colour='#BEBCAC',opacity=.12))]

def main():
    p=argparse.ArgumentParser()
    p.add_argument('--roster',required=True,type=Path);p.add_argument('--pinned',required=True)
    p.add_argument('--tri-solver',type=Path,default=Path(__file__).with_name('title-native-triangle-placement.py'));p.add_argument('--art',required=True,action='append',type=Path)
    si=p.add_mutually_exclusive_group(required=True);si.add_argument('--semantic-dir',type=Path);si.add_argument('--semantic-index',type=Path)
    p.add_argument('--out',required=True,type=Path);p.add_argument('--native-overrides',type=Path)
    p.add_argument('--partial',action='store_true');p.add_argument('--allow-pending-review',action='store_true')
    args=p.parse_args()
    result={}; canonical=manifest(args.roster,args.pinned)
    require(args.tri_solver.is_file() and sha(args.tri_solver.read_bytes())==SOLVER_SHA,'geometry solver differs from the pinned project source')
    si=read_json(args.semantic_index) if args.semantic_index else None
    if si is not None:require(isinstance(si,dict) and set(si)<=set(canonical),'unknown entries in review index')
    paths={};counts={}
    for folder in args.art:
        for path in sorted(folder.glob('*.json')):
            if not isinstance((d:=read_json(path)),dict) or 'cardId' not in d: continue
            id=d['cardId']
            require(id in canonical and path.stem==id,'unexpected or misnamed card artwork '+str(id))
            require(id not in paths,'duplicate asset card ID '+id)
            paths[id]=path
    missing=sorted(set(canonical)-set(paths))
    require(paths and (args.partial or not missing),'missing art IDs: '+', '.join(missing))
    for id in sorted(paths):
        pth=paths[id]; c=canonical[id]
        try:
            psem=args.semantic_dir/(id+'.json') if args.semantic_dir else None
            sem=si.get(id) if si is not None else read_json(psem) if psem.is_file() else None
            sr=semantics(sem,id,c,args.allow_pending_review)
            authored_sha=sha(pth.read_bytes()); override=args.native_overrides/(id+'.json') if args.native_overrides else None
            supplied=read_json(pth)
            if override is not None and override.is_file():
                supplied=read_json(override)
                require(supplied.get('cardId')==id and supplied.get('sourceSha256')==authored_sha,'native override does not bind exact authored input')
            art=build_rows(supplied,args.tri_solver)
            require(1<=len(art)<=60,'verified icon exceeds 60 actual native controls: '+str(len(art)))
            mask=decor(); bg=[row(dict(image=100001,position=[0,0],size=[144,64],colour=BASE[c['type']]))]
            for kind,rows in [('icon',art),('decor',mask),('backing',bg)]:
                for r in rows:check_row(r,kind)
            result[id]=dict(id=id,name=c['name'],type=c['type'],cost=c['cost'],rules=c['rules'],upgradeRules=c['upgradeRules'],icon=art,decoration=mask,backing=bg,usesMask=any(r[20]!=0 for r in art),sourceAssetSha256=authored_sha,semantic=sr)
            counts[id]=dict(icon=len(art),A=len(art)+1,B=len(art)+7,masked=sum(r[20] for r in art))
        except (ValueError,KeyError,TypeError) as e:raise ValueError(f'{id}: {e}') from e
    data=dict(schemaVersion=1,feature='traveler-card-art-private-experiment',enabled=False,sourceGit=args.pinned,rosterSha256=sha(args.roster.read_bytes()),canvas=[144,64],cardCount=len(result),missing=missing,stage='partial' if missing else 'review-pending' if any(c['semantic']['reviewStatus'] not in ('pass','owner-sample-accepted') for c in result.values()) else 'verified-inputs',cards=result)
    args.out.parent.mkdir(parents=True,exist_ok=True); args.out.write_text(dump(data))
    summary=dict(counts=counts,cardCount=len(result),missing=missing,maxIcon=max(c['icon'] for c in counts.values()),bytes=args.out.stat().st_size,
        AImageCount=sum(c['A'] for c in counts.values()),BImageCount=sum(c['B'] for c in counts.values()),maskedControls=sum(c['masked'] for c in counts.values()))
    args.out.with_suffix('.report.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
    print(data['stage'],summary['cardCount'],summary['maxIcon'],summary['maskedControls'])
if __name__=='__main__':main()
