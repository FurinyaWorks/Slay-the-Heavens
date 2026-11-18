"""From the overlay worktree, bind the exact base and live source without modifying old archives."""
import gzip
import hashlib
import json
from pathlib import Path
import subprocess

base = '5a86c6c2a3784d28fa819ab7487dd58cc7a778b1'
prefix = 'tests/helpers/'
prod = prefix + 'release-pointer-overlay-source.json.gz'
ci = prefix + 'release-pointer-overlay-ci.json.gz'

def read(p):
    return Path(p).read_bytes()

def prior(p):
    return subprocess.check_output(['git', 'show', f'{base}:{p}'])

def digest(data):
    return hashlib.sha256(data).hexdigest()

def binding(data):
    return dict(source=data.decode(), sha256=digest(data),
                gitBlob=hashlib.sha1(f'blob {len(data)}\0'.encode() + data).hexdigest())

def put(p, data):
    Path(p).write_bytes(gzip.compress(json.dumps(data, ensure_ascii=False, separators=(',', ':')).encode(), mtime=0))
    return digest(read(p))

def set_sha(p, old, new):
    source = Path(p)
    text = source.read_text()
    if old in text:
        source.write_text(text.replace(old, new))
    else:
        assert new in text, f'update current digest placeholder in {p}'

owners = ['src/lua/abyss_battle_actions.lua', 'src/lua/abyss_battle_card_gestures.lua']
prod_sha = put(prod, dict(schemaVersion=1, base=base, before={p: binding(prior(p)) for p in owners},
                         current={p: binding(read(p)) for p in owners}))
epoch = prefix + 'closeout-source-epoch.mjs'
set_sha(epoch, 'OVERLAY_PRODUCTION_SHA', prod_sha)
closure = prefix + 'copy-integration-source-closure.mjs'
set_sha(closure, 'OVERLAY_PRODUCTION_SHA', prod_sha)
set_sha(closure, 'OVERLAY_EPOCH_SHA', digest(read(epoch)))

ci_files = [epoch, closure, 'tests/integrated-ci-source.cases.mjs', 'tests/mobile-card-release.test.mjs',
            'tests/release-card-contact-integration.test.mjs', 'tests/lua/support/target_anonymous_context.lua']
old_archive_path = prefix + 'release-pointer-identity-ci.json.gz'
old_archive = read(old_archive_path)
assert old_archive == prior(old_archive_path)
old = json.loads(gzip.decompress(old_archive))
assert all(old['files'][p]['afterSha256'] == digest(prior(p)) for p in ci_files)
ci_sha = put(ci, dict(schemaVersion=1, base=base, productionArchive=prod_sha, files={
    p: dict(before=prior(p).decode(), beforeSha256=digest(prior(p)), afterSha256=digest(read(p))) for p in ci_files
}))
set_sha(prefix + 'release-potion-enemy-source.mjs', 'OVERLAY_CI_SHA', ci_sha)
print(f'{prod_sha}  {prod}')
print(f'{ci_sha}  {ci}')
