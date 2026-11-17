import pathlib,subprocess,json,gzip,hashlib
r=pathlib.Path(__file__).resolve().parents[3]
def get(ref,p):
 try:return subprocess.check_output(['git','show',f'{ref}:{p}'],cwd=r,stderr=subprocess.DEVNULL).decode().replace('\r\n','\n')
 except:return None
paths=set(json.loads((r/'tests/helpers/release-picker-capacity-join.json').read_text())['files'])
for p in ['release-capacity-preflight-source','release-fast-freeze-b9-union']:
 paths.update(json.loads(gzip.decompress((r/f'tests/helpers/{p}.json.gz').read_bytes()))['files'])
proof=json.loads(gzip.decompress((r/'tests/helpers/integrated-ci-source.json.gz').read_bytes()))
paths.update(proof['files']);paths.update(proof['closure'])
rows={}
for p in sorted(p for p in paths if not p.endswith('.gz')):
 c=(r/p).read_text().replace('\r\n','\n'); a=get('af3ddb2e',p); b=get('af77fb24',p)
 if c is None or c==a==b: continue
 rows[p]={'currentSha256':hashlib.sha256(c.encode()).hexdigest(),'picker':a,'release':b}
f=r/'tests/helpers/release-picker-preflight-join.json'; generated=json.dumps({'parents':{'picker':'af3ddb2eef8969959454c432cb2743288917a086','release':'af77fb2461c548f0faf104761d107397f75dca08'},'files':rows},indent=2)+'\n'
assert f.read_text()==generated, 'packet differs from exact parent regeneration'
print(len(rows),hashlib.sha256(generated.encode()).hexdigest())
