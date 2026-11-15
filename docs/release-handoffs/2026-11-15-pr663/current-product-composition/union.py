from pathlib import Path
from collections import defaultdict
import hashlib,subprocess,json,tempfile
root=Path(__file__).resolve().parent
repo=root.parent/'wake-1314'/'merge-rehearsal'
def git(*a): return subprocess.check_output(['git','-C',str(repo),*a])
base='1cc5479b713edab6fd26db4e20f8eb22b7401cb2'
refs={678:'verification-pr678-1949',679:'verification-pr679-2028',684:'verification-pr684-2314',690:'verification-pr690-2314',695:'verification-pr695-2314',696:'verification-pr696-2314',697:'verification-pr697-2314',698:'verification-pr698-2314',699:'verification-pr699-2314'}
omitted={'scripts/test-lua.mjs','scripts/ci-test-timings.json'}
paths=defaultdict(list)
for pr,ref in refs.items():
 for p in git('diff','--name-only',f'{base}...{ref}','--','src','scripts','data').decode().splitlines():
  if p not in omitted:paths[p].append(pr)
def get(ref,p):
 r=subprocess.run(['git','-C',str(repo),'show',f'{ref}:{p}'],capture_output=True)
 return r.stdout if not r.returncode else None
sha=lambda b:hashlib.sha256(b).hexdigest() if b is not None else None
rows={}
for p,prs in sorted(paths.items()):
 anc=get(base,p); current=anc; conflict=False
 for pr in prs:
  nxt=get(refs[pr],p)
  if current==anc:current=nxt;continue
  if nxt==anc or nxt==current:continue
  assert all(v is not None for v in [anc,current,nxt]),p
  with tempfile.TemporaryDirectory() as t:
   f=[Path(t)/s for s in ['union','base','incoming']]
   for q,b in zip(f,[current,anc,nxt]):q.write_bytes(b)
   m=subprocess.run(['git','merge-file','--diff3','-p','-L','previous slices','-L','release base','-L',f'PR {pr}',*(str(x) for x in f)],capture_output=True)
   assert m.returncode>=0 and not m.stderr
   current=m.stdout
   if m.returncode:
    conflict=True
    break
 out=root/('conflicts' if conflict else 'product')/p
 assert current is not None
 out.parent.mkdir(parents=True,exist_ok=True);out.write_bytes(current)
 rows[p]={'PR':prs,'baseline':sha(anc),'sources':{pr:sha(get(refs[pr],p)) for pr in prs},'merge':None if conflict else sha(current),'conflict':conflict}
manifest={'release':base,'heads':{k:git('rev-parse',v).decode().strip() for k,v in refs.items()},'intentionalCIExclusions':sorted(omitted),'files':rows }
(root/'evidence/union.json').write_text(json.dumps(manifest,indent=2)+'\n')
for p,r in rows.items():
 if len(r['PR'])>1:print('CONFLICT' if r['conflict'] else 'DISJOINT',p,r['PR'])
print('Paths',len(rows),'conflict count',sum(v['conflict'] for v in rows.values()))
