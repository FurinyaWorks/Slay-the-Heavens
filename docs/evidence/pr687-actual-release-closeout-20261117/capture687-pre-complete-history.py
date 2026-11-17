from pathlib import Path
import subprocess,json,gzip,hashlib,re
git=lambda *a:subprocess.check_output(['git','-c','core.quotePath=false',*a])
sha=lambda b:hashlib.sha256(b).hexdigest()
parents=dict(release='af77fb2461c548f0faf104761d107397f75dca08',intent='e1221ee0abc265a720cd71a87d01b9d109c51475')
def paths(c):return set(git('ls-tree','-r','--name-only',c).decode().splitlines())
files={n:paths(c)for n,c in parents.items()}
def inventory(names):return dict(js=sorted(p for p in names if re.fullmatch(r'tests/[^/]+\.test\.mjs',p)),lua=sorted(p for p in names if re.fullmatch(r'tests/lua/[^/]+\.lua',p)))
def binding(raw):
 b=raw.decode().replace('\r\n','\n').encode();return dict(source=b.decode(),sha256=sha(b),gitBlob=hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest())
changed=set(git('diff','--name-only',parents['release'],parents['intent']).decode().splitlines())
changed|=set(git('diff','--name-only',parents['release']).decode().splitlines())
changed|={p.as_posix()for p in Path('tests/helpers').glob('intent-*.mjs')}
changed|=set(git('ls-files','--others','--exclude-standard').decode().splitlines())
changed|={'config/architecture.json'}|{p.as_posix()for p in Path('src/lua').glob('*.lua')}
changed={p for p in changed if p.startswith(('src/','tests/','scripts/','config/','.github/')) and p.endswith(('.lua','.mjs','.json','.yml','.yaml')) and Path(p).exists()}
changed.discard('tests/helpers/intent-release-union.mjs')
packet=dict(schemaVersion=1,normalization='LF',parents=parents,currentTreeCommitted=False,files={},archives={},parentInventories={n:inventory(s)for n,s in files.items()},inventory=inventory({p.as_posix()for p in Path('tests').rglob('*')if p.is_file()}))
template=Path('tests/helpers/intent-release-union.mjs').read_text().replace('\r\n','\n');template=re.sub(r"const digest='(?:UNION_PACKET_SHA|[a-f0-9]{64})';","const digest='UNION_PACKET_SHA';",template,count=1);packet['leafTemplateSha']=sha(template.encode())
for p in sorted(changed):packet['files'][p]=dict(current=binding(Path(p).read_bytes()),parents={n:binding(git('show',c+':'+p))if p in files[n]else None for n,c in parents.items()})
for p in sorted(Path('tests/helpers').rglob('*.gz')):
 if p.as_posix()=='tests/helpers/intent-release-union.json.gz':continue
 raw=p.read_bytes();assert raw[:2]==b'\x1f\x8b',p
 packet['archives'][p.as_posix()]=sha(raw)
raw=gzip.compress((json.dumps(packet,ensure_ascii=False,separators=(',',':'))+'\n').encode(),mtime=0)
Path('tests/helpers/intent-release-union.json.gz').write_bytes(raw)
p=Path('tests/helpers/intent-release-union.mjs');s=p.read_text();s=re.sub(r"const digest='(?:UNION_PACKET_SHA|[a-f0-9]{64})';","const digest='"+sha(raw)+"';",s,count=1);p.write_text(s,newline='\n')
result=dict(sha256=sha(raw),size=len(raw),sources=len(packet['files']),production=len([p for p in packet['files']if p.startswith('src/')or p=='config/architecture.json']),archives=len(packet['archives']),inventory={k:len(v)for k,v in packet['inventory'].items()},parents={n:{k:len(v)for k,v in inv.items()}for n,inv in packet['parentInventories'].items()})
Path('/workspace/release-closeout-evidence/687-capture.json').write_text(json.dumps(result,indent=2)+'\n');print(result)
