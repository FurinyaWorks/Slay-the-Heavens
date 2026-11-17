from pathlib import Path
import subprocess
paths=[Path('tests/helpers/draft-quality-workflow.mjs'),Path('tests/release-selection-map-source.test.mjs')]
saved={p:p.read_bytes() for p in paths}
try:
 for p,b in saved.items():
  crlf=b.replace(b'\r\n',b'\n').replace(b'\n',b'\r\n');p.write_bytes(crlf);assert b'\r\n' in p.read_bytes() and b'\r\r\n' not in p.read_bytes()
 result=subprocess.run(['node','--test','--test-name-pattern=Release CI repair maps','tests/ci-impact.test.mjs'],capture_output=True,text=True)
 print(result.stdout,result.stderr);assert result.returncode==0
finally:
 for p,b in saved.items():p.write_bytes(b);assert p.read_bytes()==b
 print('Restored exact original bytes for both real CRLF fixture targets.')
