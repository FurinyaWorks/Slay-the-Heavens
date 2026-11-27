"""Verify a promoted pack against canonical roster, art digests, geometry, and publication gate."""
import argparse, re
from pathlib import Path
from pack import BASE,check_row,decor,manifest,read_json,require,row,semantics,sha
def check(d,pinned,rosterpath,src=None):
    roster=manifest(rosterpath,pinned)
    require(d.get('sourceGit')==pinned and d.get('rosterSha256')==sha(rosterpath.read_bytes()),'stale roster or source pointer')
    require(d.get('enabled') is False and d.get('schemaVersion')==1 and d.get('feature')=='traveler-card-art-private-experiment' and d.get('canvas')==[144,64],'experiment must remain disabled with canonical viewport')
    require(d.get('missing')==[] and d.get('cardCount')==75 and set(d['cards'])==set(roster),'complete pack must match exact 75 bound IDs')
    final=True
    for id,c in d['cards'].items():
        r=roster[id]
        for field in ('id','name','type','cost','rules','upgradeRules'):
            require(c.get(field)==r.get(field),id+' runtime binding drift: '+field)
        semantics(c.get('semantic'),id,r,True)
        final=final and c['semantic']['reviewStatus'] in ('pass','owner-sample-accepted')
        if src is not None:
            require(sha((src/(id+'.json')).read_bytes())==c.get('sourceAssetSha256'),id+' art source hash mismatch')
        else:require(isinstance(c.get('sourceAssetSha256'),str) and re.fullmatch('[a-f0-9]{64}',c.get('sourceAssetSha256')),id+' invalid art source hash')
        require(isinstance(c.get('icon'),list) and 1<=len(c['icon'])<=60,id+' exceeds 60 actual icon images')
        require(c.get('decoration')==decor(),id+' B decorations altered')
        require(c.get('backing')==[row(dict(image=100001,position=[0,0],size=[144,64],colour=BASE[c['type']]))],id+' incorrect separate type backing')
        require(c.get('usesMask') is any(r[-1]==1 for r in c['icon']),id+' half-mask flag drift')
        for kind,rows in [('icon',c['icon']),('decor',c['decoration']),('backing',c['backing'])]:
            for r in rows:check_row(r,kind)
    require(d.get('stage')==('verified-inputs' if final else 'review-pending'),'independent visual approval does not match receipts')
    return True
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('pack',type=Path);p.add_argument('roster',type=Path);p.add_argument('--pinned',required=True);p.add_argument('--art',type=Path)
    a=p.parse_args();d=read_json(a.pack);check(d,a.pinned,a.roster,a.art)
    print('75/75 exact runtime bindings, valid controls, no activation; '+d['stage'])
