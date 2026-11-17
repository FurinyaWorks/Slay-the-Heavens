import pathlib,subprocess,gzip,json,hashlib
r=pathlib.Path('.')
def git(p,ref):return subprocess.check_output(['git','show',ref+':'+p])
base='0985e7928cc63fa84bc642ef7e86663ad8b2c53d';pointer='ad6fe84dbcc11e28e8a82258f889a6841b46c8c6'
paths=['tests/helpers/'+n+'.'+ext for n in ['battle-pointer-ci-source','battle-pointer-sparse-ci-source','battle-pointer-inspection-ci-source'] for ext in ['mjs','json.gz']]
for p in paths:
 expected=git(p,pointer)
 if p.endswith('inspection-ci-source.mjs'):expected=expected.replace(b"import {sourceEpoch}",b"import {pointerBeforePotionEpoch as sourceEpoch}")
 assert (r/p).read_bytes()==expected,p
old=json.loads(gzip.decompress(git('tests/helpers/potion-pointer-ci-union.json.gz',base)));new=json.loads(gzip.decompress((r/'tests/helpers/potion-pointer-ci-union.json.gz').read_bytes()))
assert len(old['files'])==195 and len(new['files'])==201
changes=set(paths+['tests/ci-complete-calibration.test.mjs','tests/helpers/copy-integration-source-closure.mjs','tests/helpers/potion-pointer-ci-copy-closure.json'])
for p,row in old['files'].items():
 if p not in changes: assert new['files'][p]==row,p
 assert set(new['files'][p]['views'])==set(row['views']),p
 for k,v in row['views'].items():
  a=new['files'][p]['views'][k];assert a['sha256']==v['sha256'],p
  if 'source' in v:assert a['source']==v['source'],p
for p in changes:assert hashlib.sha256((r/p).read_bytes()).hexdigest()==new['files'][p]['current']['sha256'],p
assert (r/'tests/helpers/potion-pointer-ci-before-pointer.json.gz').read_bytes()==git('tests/helpers/potion-pointer-ci-union.json.gz',base)
assert (r/'tests/ci-complete-calibration.test.mjs').read_bytes().startswith(git('tests/ci-complete-calibration.test.mjs',base))
print('PASS: 5 exact files + sole explicit epoch alias; old 78 tests intact; 201 input identities, inherited views and complete prior packet')
