"""Read-only exact-parent boundary audit. Not a runtime projection or test waiver."""
import gzip, hashlib, json, pathlib, subprocess
ROOT = pathlib.Path(__file__).resolve().parents[3]
HEAD = 'a15f9e5115290451865b79ff9db33dc6e5e13961'
PARENTS = {'picker': 'af3ddb2eef8969959454c432cb2743288917a086', 'release': 'af77fb2461c548f0faf104761d107397f75dca08'}
def git(ref, path):
    return subprocess.check_output(['git', 'show', f'{ref}:{path}'], cwd=ROOT)
def sha(b):
    return hashlib.sha256(b.replace(b'\r\n', b'\n')).hexdigest()
def audit():
    contracts = {}
    for name, path in [('pickerCapacity', 'tests/helpers/release-picker-capacity-join.json'), ('capacityPreflight', 'tests/helpers/release-capacity-preflight-source.json.gz')]:
        raw = git(HEAD, path)
        packet = json.loads(gzip.decompress(raw) if path.endswith('.gz') else raw)
        rows = []
        for path, row in packet['files'].items():
            current = sha(git(HEAD, path))
            expected = row['currentSha256']
            if current != expected:
                parents = {side: sha(git(ref, path)) for side, ref in PARENTS.items()}
                rows.append({'path': path, 'expectedSha256': expected, 'currentSha256': current, 'parentSha256': parents, 'introducedByJoin': current not in parents.values()})
        contracts[name] = {'totalBindings': len(packet['files']), 'rawMismatches': rows}
    return {'head': HEAD, 'parents': PARENTS, 'contracts': contracts, 'scope': 'raw identity audit only; existing #707 outer projections may explain parent mismatches; no runtime readiness claim'}
if __name__ == '__main__':
    print(json.dumps(audit(), indent=2) + '\n', end='')
