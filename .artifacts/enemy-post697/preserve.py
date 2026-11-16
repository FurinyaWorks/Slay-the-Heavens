from pathlib import Path
import hashlib,json,gzip,base64
root=Path('F:/New folder');destination=Path('docs/evidence/enemy-post697-20261116');destination.mkdir(parents=True,exist_ok=True)
review=root/'.worktrees/review-enemy-geometry-v2-1115/build/review-geometry/independent-review.json'
receipt=json.loads(review.read_bytes());assert receipt['reviewedHeadSha']=='61bdf6c069f8e30e6aa3ff44d3ecddd25c159ee2' and receipt['conclusion']=='pass'
bundle=dict(schemaVersion=1,files={})
def keep(key,path,expected=None):
 raw=path.read_bytes();digest=hashlib.sha256(raw).hexdigest()
 if expected:assert digest==expected,key
 bundle['files'][key]=dict(source=str(path),sha256=digest,bytes=len(raw),base64=base64.b64encode(raw).decode())
keep('original-product-independent-review.json',review)
keep('original-actual13a-independent-review.json',root/'.artifacts/pr688-final-review.json')
for name,digest in receipt['evidence']['files'].items():keep('review/'+name,Path(receipt['evidence']['directory'])/name,digest)
author=receipt['evidence']['authorLogsAudited']
for name,digest in author['hashes'].items():keep('author-metrics/'+name,Path(author['directory'])/name,digest)
assert len(bundle['files'])==13
packed=gzip.compress((json.dumps(bundle,separators=(',',':'))+'\n').encode(),mtime=0)
(destination/'original-review-and-metrics.json.gz').write_bytes(packed)
manifest=dict(bundleSha256=hashlib.sha256(packed).hexdigest(),bundleBytes=len(packed),files={name:{k:v for k,v in row.items()if k!='base64'}for name,row in bundle['files'].items()})
(destination/'original-identities.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf8')
evidence=Path('.artifacts/enemy-post697');logs=[]
for name in ['source-first.log','consumer-green.log','gameui-final.log','module-preflight.log','module-import-only.log','audit.log']:
 raw=(evidence/name).read_bytes();target=evidence/(name+'.gz');target.write_bytes(gzip.compress(raw,mtime=0))
 assert gzip.decompress(target.read_bytes())==raw
 logs.append(dict(path=target.as_posix(),rawSha256=hashlib.sha256(raw).hexdigest(),rawBytes=len(raw)))
(evidence/'log-identities.json').write_text(json.dumps(logs,indent=2)+'\n',encoding='utf8')
print(json.dumps(dict(originalFiles=len(bundle['files']),bundleBytes=len(packed),rawLogs=len(logs))))
