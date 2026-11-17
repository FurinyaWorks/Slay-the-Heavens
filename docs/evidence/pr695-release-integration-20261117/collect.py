from pathlib import Path
import subprocess,json,gzip,hashlib,re
parents={'settings':'809130efa555fbd228a099efff7e4652f2295df7','release':'af77fb2461c548f0faf104761d107397f75dca08'}
paths=set(json.loads(Path('tests/helpers/settings-map-integration.json').read_text())['files'])
paths.update(json.loads(Path('tests/helpers/release-card-contact-integration.json').read_text())['files'])
paths.update(json.loads(gzip.decompress(Path('tests/helpers/release-capacity-preflight-source.json.gz').read_bytes()))['files'])
for line in subprocess.check_output(['git','diff','--name-only',parents['release'],'--','scripts','src','tests'],text=True).splitlines():
 if line.endswith(('.mjs','.lua','.json')):paths.add(line)
paths.update(['tests/helpers/settings-map-integration.mjs','tests/helpers/settings-release-integration.cases.mjs','tests/helpers/release-capacity-preflight-source.mjs','tests/helpers/settings-standalone-selection-ci.mjs'])
paths.discard('tests/helpers/settings-release-source.mjs')
def binding(b):
 s=b.decode().replace('\r\n','\n');return {'source':s,'sha256':hashlib.sha256(s.encode()).hexdigest()}
def names(ref):return subprocess.check_output(['git','ls-tree','-r','--name-only',ref,'tests'],text=True).splitlines()
def inv(ns):return {'js':sorted(p for p in ns if re.fullmatch(r'tests/[^/]+\.test\.mjs',p)),'lua':sorted(p for p in ns if re.fullmatch(r'tests/lua/[^/]+\.lua',p))}
packet={'schemaVersion':1,'normalization':'LF','parents':parents,'files':{},'inventory':inv([str(p) for p in Path('tests').glob('*.test.mjs')]+[str(p) for p in Path('tests/lua').glob('*.lua')]),'inventories':{k:inv(names(v)) for k,v in parents.items()}}
for p in sorted(paths):
 if not Path(p).is_file():continue
 row={'current':binding(Path(p).read_bytes()),'views':{}}
 for side,ref in parents.items():
  r=subprocess.run(['git','show',ref+':'+p],stdout=subprocess.PIPE,stderr=subprocess.DEVNULL)
  if r.returncode==0:row['views'][side]=binding(r.stdout)
 packet['files'][p]=row
b=gzip.compress(json.dumps(packet,ensure_ascii=False,separators=(',',':')).encode(),mtime=0);Path('tests/helpers/settings-release-source.json.gz').write_bytes(b)
sha=hashlib.sha256(b).hexdigest();leaf=Path('tests/helpers/settings-release-source.mjs');s=leaf.read_text();s=re.sub(r"const sha='[^']+';",'const sha='+repr(sha)+';',s);leaf.write_text(s)
print(json.dumps({'packetSha':sha,'bytes':len(b),'files':len(packet['files']),'raw':{k:len(v) for k,v in packet['inventory'].items()},'parents':{k:{t:len(p) for t,p in x.items()} for k,x in packet['inventories'].items()}}))
