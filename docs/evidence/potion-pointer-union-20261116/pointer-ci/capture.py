from pathlib import Path
import subprocess,json,gzip,hashlib,re,base64
r=Path('.');prior='0985e7928cc63fa84bc642ef7e86663ad8b2c53d';remote='0780e604323bc78139e0fcf3fc68f1b9d78e6ca8'
def blob(p,ref=prior):return subprocess.check_output(['git','show',ref+':'+p],stderr=subprocess.DEVNULL)
def sha(b):return hashlib.sha256(b).hexdigest()
assert subprocess.check_output(['git','rev-parse',prior+'^{tree}']).decode().strip()=='0e935f03cd5bfb42fb01417a52b13e63232b4a47'
old=blob('tests/helpers/potion-pointer-ci-union.json.gz');assert sha(old)=='d5654ff207845a19b5a3221b9e7e8ec27319d865a556c525f40972c1e0d99255'
archive='tests/helpers/potion-pointer-ci-before-pointer.json.gz';(r/archive).write_bytes(old)
added=['tests/helpers/'+name+'.'+ext for name in ['battle-pointer-ci-source','battle-pointer-sparse-ci-source','battle-pointer-inspection-ci-source'] for ext in ['mjs','json.gz']]
m='tests/helpers/potion-pointer-ci-copy-closure.json';manifest=json.loads(blob(m))
for p in [archive,*added]:manifest['files'][p]=sha((r/p).read_bytes())
manifest['files']=dict(sorted(manifest['files'].items()));(r/m).write_text(json.dumps(manifest,indent=2)+'\n')
copier='tests/helpers/copy-integration-source-closure.mjs';(r/copier).write_text(blob(copier).decode().replace(sha(blob(m)),sha((r/m).read_bytes())))
packet=json.loads(gzip.decompress(old));packet['pointerCiPredecessorCommit']=remote;packet['pointerCiPredecessorSha256']=sha(old);packet['scope']='pointer CI helper and original raw inventory assertions restored; other shared pointer CI assertions pending'
for p in ['tests/ci-complete-calibration.test.mjs',copier,m,*added]:
 row=packet['files'].get(p,{'views':{}});data=(r/p).read_bytes();binary=p.endswith('.gz');row['current']={'sha256':sha(data),'encoding':'base64' if binary else 'utf8'}
 for target,ref in packet['viewCommits'].items():
  try:before=blob(p,ref)
  except subprocess.CalledProcessError:continue
  view=row['views'].setdefault(target,{'sha256':sha(before)});assert view['sha256']==sha(before)
  if sha(before)!=sha(data):view['source']=base64.b64encode(before).decode() if binary else before.decode()
 packet['files'][p]=row
packet['files']=dict(sorted(packet['files'].items()));data=gzip.compress((json.dumps(packet,ensure_ascii=False,separators=(',',':'))+'\n').encode(),mtime=0)
(r/'tests/helpers/potion-pointer-ci-union.json.gz').write_bytes(data)
p=r/'tests/helpers/potion-pointer-ci-union.mjs';s=p.read_text();s=re.sub(r"const PACKET_SHA='[a-f0-9]*'", "const PACKET_SHA='"+sha(data)+"'",s);p.write_text(s)
print('bound',len(packet['files']),'inputs; helper closure',len(manifest['files'])+4,'files; packet',sha(data))
