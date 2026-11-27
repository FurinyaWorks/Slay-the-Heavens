"""Negative checks against the actual 75-card package, not synthetic green data."""
import copy,sys
from pathlib import Path
from pack import read_json,take_uniq
from validate import check
d=read_json(Path(sys.argv[1]));roster=Path(sys.argv[2]);pin=d['sourceGit']; assert check(d,pin,roster)
def reject(label,edit,needle):
    a=copy.deepcopy(d);edit(a)
    try:check(a,pin,roster)
    except ValueError as e:assert needle in str(e), (label,str(e))
    else:raise AssertionError(label+' should have failed')
last=d['cards']['cleave']
def inactive(a):a['enabled']=True
def count(a):a['cards'].pop('bash')
def pinning(a):a['sourceGit']='0'*40
def stale_name(a):a['cards']['cleave']['name']='横扫'
def mask(a):a['cards']['cleave']['icon'][0][20]=2
def out_of_bounds(a):a['cards']['cleave']['icon'][0][1]=5000
def excessive(a):a['cards']['cleave']['icon']=(last['icon']*2)
def semantics(a):a['cards']['cleave']['semantic']['primaryMechanic']='对单体造成伤害'
def boast(a):a['stage']='verified-inputs'
for label,fn,needle in [
    ('activation',inactive,'remain disabled'),('count',count,'exact 75'),('commit',pinning,'stale roster'),
    ('stale title',stale_name,'runtime binding drift'),('mask',mask,'unsupported image or fill'),
    ('bounds',out_of_bounds,'projected primitive leaves'),('budget',excessive,'exceeds 60'),
    ('generic semantics',semantics,'exact runtime card rule')]:
    reject(label,fn,needle)
if d['stage']=='review-pending':reject('claim independent approval without evidence',boast,'does not match receipts')
try:take_uniq([('cleave',1),('cleave',2)])
except ValueError:pass
else:raise AssertionError('duplicate JSON key accepted')
print('Positive 75-card validation and all negative checks passed: activation, missing ID, duplicate ID, stale commit/name, invalid mask, bounds, budget, wrong semantics, premature approval when applicable.')
