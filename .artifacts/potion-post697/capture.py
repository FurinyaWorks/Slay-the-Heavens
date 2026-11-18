from pathlib import Path
import gzip,hashlib,json,re,subprocess
git=lambda *a:subprocess.check_output(['git','-c','core.commitGraph=false','-c','core.quotePath=false',*a])
sha=lambda b:hashlib.sha256(b).hexdigest()
views=dict(potion='3e96a1589435f8b06645db095775a789f24b1350',selection='33d71575c5f186a1b54f7bf3e4f1826c145aa1d9');product='a9df9dff11779cb1d850dc97b715c711881cf9c6'
def record(raw):
 s=raw.decode().replace('\r\n','\n');b=s.encode();return dict(source=s,sha256=sha(b),gitBlob=hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest())
def inventory(paths):return dict(js=sorted(p for p in paths if re.fullmatch(r'tests/[^/]+\.test\.mjs',p)),lua=sorted(p for p in paths if re.fullmatch(r'tests/lua/[^/]+\.lua',p)))
files={name:set(git('ls-tree','-r','--name-only',commit).decode().splitlines())for name,commit in views.items()}
changed=set().union(*(set(git('diff','--name-only',commit,product).decode().splitlines())for commit in views.values()))|set(git('diff','--name-only',product).decode().splitlines())
changed|={p.as_posix()for p in Path('tests/helpers').glob('potion-post697*.mjs')}
changed|={'src/lua/abyss_battle_card_gestures.lua','src/lua/abyss_battle_potion_popup.lua','src/lua/abyss_battle_ui.lua'}
changed={p for p in changed if p.startswith(('src/','tests/','scripts/','config/')) and not p.endswith('.gz')}
changed.discard('tests/helpers/potion-post697-ci-source.mjs')
p=dict(schemaVersion=1,normalization='LF',viewCommits=views,productCommit=product,currentTreeCommitted=False,viewInventories={name:inventory(paths)for name,paths in files.items()},currentInventory=inventory([f.as_posix()for f in Path('tests').rglob('*')if f.is_file()]),files={},immutableArchives={})
for path in sorted(changed):p['files'][path]=dict(current=record(Path(path).read_bytes()),views={name:record(git('show',commit+':'+path))if path in files[name]else None for name,commit in views.items()})
common=Path(git('rev-parse','--git-common-dir').decode().strip()).resolve();restored=[]
for path in sorted(Path('tests/helpers').rglob('*.gz')):
 if path.as_posix()=='tests/helpers/potion-post697-ci-source.json.gz':continue
 raw=path.read_bytes()
 if raw.startswith(b'version https://git-lfs.github.com/spec/v1\n'):
  text=raw.decode();oid=re.search(r'oid sha256:([a-f0-9]{64})',text)[1];size=int(re.search(r'size (\d+)',text)[1]);raw=(common/'lfs'/'objects'/oid[:2]/oid[2:4]/oid).read_bytes();assert len(raw)==size and sha(raw)==oid;path.write_bytes(raw);restored.append(dict(path=path.as_posix(),oid=oid,size=size))
 p['immutableArchives'][path.as_posix()]=sha(raw)
data=gzip.compress((json.dumps(p,ensure_ascii=False,separators=(',',':'))+'\n').encode(),mtime=0);Path('tests/helpers/potion-post697-ci-source.json.gz').write_bytes(data)
leaf=Path('tests/helpers/potion-post697-ci-source.mjs');text=leaf.read_text(encoding='utf8');marker='POST697_CI_SHA'
if marker not in text:
 old=json.loads(Path('.artifacts/potion-post697/capture.json').read_text(encoding='utf8'))['sha256'];assert text.count(old)==1;text=text.replace(old,marker)
assert text.count(marker)==1;leaf.write_text(text.replace(marker,sha(data)),encoding='utf8',newline='\n')
receipt=dict(sha256=sha(data),bytes=len(data),bindings=len(p['files']),archives=len(p['immutableArchives']),currentInventory={k:len(v)for k,v in p['currentInventory'].items()},viewInventories={n:{k:len(v)for k,v in d.items()}for n,d in p['viewInventories'].items()},materialized=restored)
Path('.artifacts/potion-post697/capture.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt))
