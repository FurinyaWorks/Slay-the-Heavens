from pathlib import Path
import hashlib,json,gzip,base64
source=Path('F:/New folder/.worktrees/review-mobile-intent-v2-1115/build/review-intent')
destination=Path('docs/evidence/intent-post697-20261116');destination.mkdir(parents=True,exist_ok=True)
raw=(source/'independent-review.json').read_bytes();receipt=json.loads(raw)
assert receipt['reviewedHeadSha']=='f448a9df48054f49af792312cd866c03b53b0197'
assert receipt['conclusion']=='pass' and receipt['unresolved']==[]
(destination/'original-independent-review.json').write_bytes(raw)
bundle=dict(schemaVersion=1,source=str(source),reviewedHead=receipt['reviewedHeadSha'],reviewedBase=receipt['reviewedBaseSha'],files={})
for name,digest in receipt['evidence']['files'].items():
 data=(source/name).read_bytes();assert hashlib.sha256(data).hexdigest()==digest,name
 bundle['files'][name]=dict(sha256=digest,bytes=len(data),base64=base64.b64encode(data).decode())
assert len(bundle['files'])==6
packed=gzip.compress((json.dumps(bundle,separators=(',',':'))+'\n').encode(),mtime=0)
(destination/'original-review-files.json.gz').write_bytes(packed)
identities=dict(receiptSha256=hashlib.sha256(raw).hexdigest(),receiptBytes=len(raw),bundleSha256=hashlib.sha256(packed).hexdigest(),bundleBytes=len(packed),files={name:{k:v for k,v in row.items()if k!='base64'}for name,row in bundle['files'].items()})
(destination/'original-review-identities.json').write_text(json.dumps(identities,indent=2)+'\n',encoding='utf8')
print(json.dumps(identities))
