from pathlib import Path
import gzip,json,hashlib,subprocess,copy,re
root=Path('.');sha=lambda b:hashlib.sha256(b).hexdigest()
G=lambda *a:subprocess.check_output(['git',*a])
orig=json.loads(gzip.decompress(G('show','3f715049:tests/helpers/item-post697-ci-source.json.gz')));packet=copy.deepcopy(orig['packet'])
item='16cf4a2e862ccfa0eaed06c5cf11cb8546e6095f';release='33d71575c5f186a1b54f7bf3e4f1826c145aa1d9';product='249adac4baec43183e8c81fecda6047656b564c4'
packet['viewCommits']={'release':release,'item':item}
def row(raw):
 source=raw.decode().replace('\r\n','\n');data=source.encode();return {'source':source,'sha256':sha(data),'gitBlob':hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()}
paths=set(packet['files'])|{'tests/ci-reviewed-lfs.test.mjs','tests/helpers/item-post697-checkpoint-read.mjs'}
for name in ['release-item-title-shadow-bootstrap-source','release-item-ci-repair-source','release-item-title-shadow-ci-source','release-selection-map-ci-source']:
 p=json.loads(gzip.decompress(Path('tests/helpers/'+name+'.json.gz').read_bytes()));paths.update(k for k in p['files'] if not k.endswith('.gz'))
paths=sorted(paths)
packet['files']={}
for path in paths:
 views={}
 for view,commit in packet['viewCommits'].items():
  p=subprocess.run(['git','show',commit+':'+path],capture_output=True)
  views[view]=row(p.stdout) if p.returncode==0 else None
 packet['files'][path]={'current':row(Path(path).read_bytes()),'views':views}
packet['production']={}
for line in G('ls-tree','-r',product,'--','src/lua','config/architecture.json').decode().splitlines():
 meta,path=line.split('\t');mode,kind,oid=meta.split()
 if path.endswith('.lua')or path=='config/architecture.json':packet['production'][path]=oid
assert len(packet['production'])==352,len(packet['production'])
for kind,folder,ending in [('js','tests','.test.mjs'),('lua','tests/lua','.lua')]:packet['currentInventory'][kind]=sorted(str(p) for p in Path(folder).iterdir() if p.name.endswith(ending))
refs=json.loads(gzip.decompress(Path('docs/evidence/item-post697-wip-20261116/immutable-reuse-measure.json.gz').read_bytes()))['references']
archives={r['archive']:r['archiveSha256'] for r in refs.values()}
def collect(value,path,archive,archiveSha):
 if isinstance(value,str) and path and path[-1]=='source' and len(path)<=8:
  refs.setdefault(sha(value.encode()),{'kind':'archive-source','archive':archive,'archiveSha256':archiveSha,'jsonPath':path})
 elif isinstance(value,dict):
  for key,item in value.items():
   if key not in ['__proto__','constructor','prototype']:collect(item,path+[key],archive,archiveSha)
 elif isinstance(value,list):
  for i,item in enumerate(value):collect(item,path+[str(i)],archive,archiveSha)
for archive,archiveSha in archives.items():
 data=Path(archive).read_bytes();assert sha(data)==archiveSha;collect(json.loads(gzip.decompress(data)),[],archive,archiveSha)
# Only the six already measured immutable archives may supply atoms. Recheck all
# compressed identities and each selected complete string before encoding it.
resolved={};parsed={}
for key,ref in refs.items():
 if ref['archive'] not in parsed:
  data=Path(ref['archive']).read_bytes();assert sha(data)==ref['archiveSha256'];parsed[ref['archive']]=json.loads(gzip.decompress(data))
 v=parsed[ref['archive']]
 for part in ref['jsonPath']:v=v[int(part)] if isinstance(v,list) else v[part]
 assert isinstance(v,str)and sha(v.encode())==key;resolved[key]=v
sources={}
for path,r in packet['files'].items():
 for b in [r['current'],*r['views'].values()]:
  if b is None:continue
  source=b.pop('source');key=b['sha256'];b['sourceKey']=key
  if key in refs:assert source==resolved[key];sources[key]=refs[key]
  else:sources[key]=source
stored={'storageSchemaVersion':2,'codec':'sha256-exact-utf8-with-archive-sources','sourceTable':sources,'packet':packet}
data=gzip.compress((json.dumps(stored,ensure_ascii=False,separators=(',',':'))+'\n').encode(),compresslevel=9,mtime=0)
Path('tests/helpers/item-post697-ci-source.json.gz').write_bytes(data)
p=Path('tests/helpers/item-post697-ci-source.mjs');s=p.read_text();s,n=re.subn(r"assert.equal\(hash\(bytes\),'[a-f0-9]{64}','complete item post697 CI packet'",f"assert.equal(hash(bytes),'{sha(data)}','complete item post697 CI packet'",s);assert n==1
s=s.replace("item:'68a17f53dd4e8ebd72f6dc146ddc1652eb8b8cdd'",f"item:'{item}'")
p.write_text(s)
print(json.dumps({'bytes':len(data),'sha256':sha(data),'files':len(paths),'atoms':len(sources),'refs':sum(isinstance(v,dict)for v in sources.values()),'production':len(packet['production'])}))
