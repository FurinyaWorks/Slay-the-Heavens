import pathlib,subprocess,re,json
root=pathlib.Path('.')
old=subprocess.check_output(['git','show','ad6fe84:tests/release-selection-map-source.test.mjs']).decode();new=(root/'tests/release-selection-map-source.test.mjs').read_text()
def bodies(s):
 out={}
 for m in re.finditer(r"^(?:test|pointerTest)\('([^']+)',[^\n]*\n",s,re.M):
  a=s[m.end():];e=re.search(r'^\}\);',a,re.M);out[m[1]]=a[:e.start()]
 return out
A=bodies(old);B=bodies(new)
selected=set(re.findall(r"^pointerTest\('([^']+)'",new,re.M));B={n:b for n,b in B.items() if n in selected}
changed=[];exact=[]
for n,b in B.items():
 if n not in A:continue
 if A[n]==b:exact.append(n);continue
 if 'isolated production' in n:
  expected=A[n].replace('assert.deepEqual(copied.sourceEpoch.proof,inspectionSourceEpoch.proof);','assert.deepEqual(copied.pointerBeforePotionEpoch.proof,inspectionSourceEpoch.proof);assert.deepEqual(copied.sourceEpoch.proof,activePost697Epoch.proof);');assert b==expected,n
 elif 'CI trust leaf rejects' in n:
  a=A[n];start=b.index("Buffer.from(broken.replace(");end=b.index(".toString('base64')",start)
  reduced=b[:start]+"Buffer.from(broken)"+b[end:];assert reduced==a,n
 else:raise AssertionError('unreviewed original body change: '+n)
 changed.append(n)
assert len(exact)==10 and len(changed)==4,(len(exact),len(changed))
base=subprocess.check_output(['git','show','2d64949:tests/release-selection-map-source.test.mjs']).decode();assert new.startswith(base),'old seven tests changed'
assert 'finally{active=false;}' in new and '(active?prior:publicPointerRead)' in new
print(json.dumps({'PASS':True,'exactOriginalBodies':exact,'reviewedStrictCopyAndImportAdaptations':changed,'oldSevenUnchanged':True},indent=2))
import gzip,hashlib
oldPacket=json.loads(gzip.decompress(subprocess.check_output(['git','show','2d64949:tests/helpers/potion-pointer-ci-union.json.gz'])))
newPacket=json.loads(gzip.decompress((root/'tests/helpers/potion-pointer-ci-union.json.gz').read_bytes()))
assert len(newPacket['files'])==len(oldPacket['files'])==201
changes={'tests/release-selection-map-source.test.mjs','tests/helpers/potion-pointer-ci-copy-closure.json','tests/helpers/copy-integration-source-closure.mjs'}
for p,row in oldPacket['files'].items():
 if p not in changes:assert newPacket['files'][p]==row,p
 assert set(newPacket['files'][p]['views'])==set(row['views'])
 for k,v in row['views'].items():
  a=newPacket['files'][p]['views'][k];assert a['sha256']==v['sha256']
  if 'source' in v:assert a['source']==v['source']
for p in changes:assert hashlib.sha256((root/p).read_bytes()).hexdigest()==newPacket['files'][p]['current']['sha256']
print('PASS 201 unchanged inventory; only exact three current rows changed; all original parent identities/source retained')
