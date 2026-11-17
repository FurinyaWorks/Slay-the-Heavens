from pathlib import Path
import subprocess,json,gzip,hashlib,re
parents={'fast':'e2feae68c855214addce2b64a8722a7354e1260f','freeze':'f8acc21780b90712bffba383101e34fea3471bf8'}
paths=['.github/workflows/quality.yml','tests/helpers/release-selection-map-ci-source.mjs','tests/release-selection-map-source.test.mjs','tests/helpers/release-fast-b9-ci-source.mjs','tests/helpers/release-ci.cases.mjs']
paths+=['tests/helpers/release-card-contact-integration.mjs','tests/ci-posix-concurrency.test.mjs','tests/pr-history.test.mjs','scripts/check-release-scope.mjs','tests/ci-summary-runners.test.mjs','tests/ci-windows-shape-expansion.test.mjs','tests/engineering-quality.test.mjs','tests/full-quality.test.mjs']
rows={}
for p in paths:
 b=Path(p).read_bytes();rows[p]={'current':hashlib.sha256(b).hexdigest(),'views':{}}
 for name,ref in parents.items():
  try:before=subprocess.check_output(['git','show',ref+':'+p],stderr=subprocess.DEVNULL)
  except subprocess.CalledProcessError:continue
  rows[p]['views'][name]={'source':before.decode(),'sha256':hashlib.sha256(before).hexdigest()}
packet={'parents':parents,'files':rows};b=gzip.compress((json.dumps(packet,separators=(',',':'))+'\n').encode(),mtime=0);Path('tests/helpers/release-fast-freeze-b9-union.json.gz').write_bytes(b)
p=Path('tests/helpers/release-fast-freeze-b9-union.mjs');s=p.read_text();s=re.sub("const SHA='[^']*'", "const SHA='"+hashlib.sha256(b).hexdigest()+"'",s);p.write_text(s)
