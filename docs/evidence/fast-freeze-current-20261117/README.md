# Current #707 × #709 actual integration candidate

Exact parents: #707 `3650db918578f92aec3bd24a456572ca6b2cdb2f` and #709 `f8acc21780b90712bffba383101e34fea3471bf8`, Release base `33d71575c5f186a1b54f7bf3e4f1826c145aa1d9`.

An actual no-commit merge produced two conflicts: the selection-map CI source helper and its test. Applied the independently reviewed original union resolution, retaining both PRs' assertions and workflow behavior. The combined workflow still enforces #707 Fast/explicit Full/publication and #709 live metadata/freeze rules. All #707 EOL-fixture changes remain byte-for-byte exact.

The old union packet and original parent identities remain immutable, SHA256 `60ed9b12…`. A separate EOL continuation identifies both current parents and the old packet, saves complete before/current `release-ci.cases.mjs` from exact Git blobs, and adds a fresh current-source check. It does not rewrite old historical pins or weaken assertions. `capture.py` regenerates this packet.

Focused selection-map + ci-impact invocation passed 22 tests, zero skipped (`focused.log`). Actual target files `draft-quality-workflow.mjs` and `release-selection-map-source.test.mjs` were changed to real CRLF bytes: the original EOL regression passed 1/1, and both files were restored byte-for-byte (`crlf.py`, `crlf.log`). Twelve additional exact-parent/current/rollback/missing/empty/null/malformed/CRLF/archive-drift controls passed (`verify.mjs`, `verify.log`). These are targeted Linux Node tests, not a Windows hosted or Full rerun.

Existing LFS archives were materialized only to execute tests; no expanded historical LFS payload is part of this commit. No source PR head, branch protection, official/device result or release decision changed. This is an actual prepared union tree for review, not a merged upstream delivery. Revalidate against actual new Release base when either source PR lands.
