from pathlib import Path
import subprocess,json,gzip,hashlib,re,base64
r=Path('.');prior='2d64949ffe80ad11c83321af0e2440ebbc54339c';remote='80921cad5e545ce58b43a2fd8596a930fce71d51'
def blob(p,ref=prior):return subprocess.check_output(['git','show',ref+':'+p],stderr=subprocess.DEVNULL)
def sha(b):return hashlib.sha256(b).hexdigest()
assert subprocess.check_output(['git','rev-parse',prior+'^{tree}']).decode().strip()=='d2a6088c861e568560f2d3e263e592f9b6a3cd73'
old=blob('tests/helpers/potion-pointer-ci-union.json.gz');assert sha(old)=='59a9caa65c459476abd135caddd73a35ba4a69e7784207c089afd5084f555b52'
archive='tests/helpers/potion-pointer-ci-before-contracts.json.gz';(r/archive).write_bytes(old)
added=[]
m='tests/helpers/potion-pointer-ci-copy-closure.json';manifest=json.loads(blob(m))
for p in [archive,*added]:manifest['files'][p]=sha((r/p).read_bytes())
manifest['files']=dict(sorted(manifest['files'].items()));(r/m).write_text(json.dumps(manifest,indent=2)+'\n')
copier='tests/helpers/copy-integration-source-closure.mjs';(r/copier).write_text(blob(copier).decode().replace(sha(blob(m)),sha((r/m).read_bytes())))
packet=json.loads(gzip.decompress(old));packet['contractsPredecessorCommit']=remote;packet['contractsPredecessorSha256']=sha(old);packet['scope']='shared pointer contracts restored; validation result and Release integration remain separate'
for p in ['tests/release-selection-map-source.test.mjs',copier,m,*added]:
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
