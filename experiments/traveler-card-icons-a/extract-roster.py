#!/usr/bin/env python3
"""Export the exact 75-card Traveler roster from a pinned Slay-the-Heavens checkout."""
import argparse, hashlib, json, subprocess, sys
from pathlib import Path
p=argparse.ArgumentParser()
p.add_argument('repo',type=Path); p.add_argument('out',type=Path);p.add_argument('--commit',required=True)
a=p.parse_args();base=a.repo.resolve()
def require(v,m):
    if not v:raise ValueError(m)
def git(*args):return subprocess.check_output(['git','-C',str(base),*args])
sha=git('rev-parse','HEAD').decode().strip()
require(sha==a.commit,'unexpected repository commit: '+sha)
files=['data/cards.json','data/presentation/traveler.zh-CN.json','tools/render_traveler_cards.py','art/cards/traveler-geo/catalog.json','scripts/build-ui.mjs']
bs={}
for n in files:
    this=(base/n).read_bytes(); require(this==git('show',sha+':'+n),'source differs from pinned Git: '+n)
    bs[n]=this
d=json.loads(bs[files[0]]); cat=json.loads(bs[files[3]]);
draw={r['id']:r for r in d['cards']}; require(len(draw)==len(d['cards']),'source duplicate ID')
from_pool=[*dict.fromkeys(d['starter_deck']['cards']),*[x for key in ('common','uncommon','rare') for x in d['sourcePools']['src'][key]]]
art_ids=list(cat['cards'])+list(cat['candidates'])
require(len(from_pool)==len(set(from_pool))==75,'expected exactly 75 Traveler pool IDs')
require(len(art_ids)==len(set(art_ids))==75 and set(art_ids)==set(from_pool),'independent card art catalog disagrees with Traveler pool')
prod=json.loads(subprocess.check_output([sys.executable,str(base/files[2]),str(base/files[0]),str(base/files[1])]))
disp={r['id']:r for r in prod['cards']}; require(len(disp)==len(prod['cards']),'localized display duplicate ID')
rule_keys={'id','sts_name','name','type','rarity','cost','text','upgradeText','sourceId','target','effects','upgrade'}
out=[]
for i in from_pool:
    card, label = draw[i],disp[i]
    require(card['type'] in ('attack','skill','power'),'other class: '+i)
    require(label['name'].strip() and label['text'].strip() and label['upgradeText'].strip(),'empty runtime localized case: '+i)
    mechanics={k:v for k,v in card.items() if k not in rule_keys}
    upgrade=card.get('upgrade') or {}
    out.append(dict(id=i,name=label['name'],type=card['type'],rarity=card['rarity'],cost=label['cost'],
     rules=label['text'],upgradeRules=label['upgradeText'],combatRules=label.get('combatText',label['text']),upgradeCombatRules=label.get('upgradeCombatText',label['upgradeText']),
     sourceId=card.get('sourceId'),target=card.get('target'),effects=card.get('effects',[]),upgradeEffects=upgrade.get('effects',card.get('effects',[])),mechanicFields=mechanics,upgradedMechanicFields={k:v for k,v in upgrade.items() if k!='effects'},rawName=card['name'],
     sourceAsset=cat['cards'].get(i) or cat['candidates'][i]))
num={k:sum(x['type']==k for x in out) for k in ('attack','skill','power')}
report=dict(schemaVersion=1,sourceGit=sha,locale='zh-CN',cardCount=len(out),typeCounts=num,enabled=False,
 basis='starter deck unique + sourcePools.src rarity pools, cross-checked against checked-in Traveler Geo art catalog; names and text are output of the production build-UI localization renderer, NOT raw cards.json names',
 sourceHashes={n:hashlib.sha256(b).hexdigest() for n,b in bs.items()},cards=out)
a.out.parent.mkdir(parents=True,exist_ok=True)
a.out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(f'{len(out)} cards; {num}; runtime names differ from raw for {sum(x["rawName"]!=x["name"] for x in out)}')
