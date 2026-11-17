# Actual Fast × Freeze integration after #698 landed

Exact parents: Fast #707 `e2feae68c855214addce2b64a8722a7354e1260f` and Freeze #709 `f8acc21780b90712bffba383101e34fea3471bf8`. Fast includes actual Release #698 merge `b9bca884ed9b9831965b409885d78f719b9a567a`, its CI continuation, and the earlier checkout-independent EOL fixture repair. Product `src`, `data`, and `config` are unchanged from this Fast parent.

The actual Git merge had two CI-source conflicts. Unlike the earlier 3650 candidate, the new B9 join and both CI predecessors must remain active. A new `release-fast-freeze-b9-union` packet saves exact full Git source views for both parents and authenticates 13 current CI inputs plus its own immutable archive. Only a complete known LF/CRLF input maps to its explicitly named parent. Foreign paths, malformed/partial bytes and production paths are not projected. Original B9, selection-map, PC22, bootstrap and Freeze packets and pins are retained.

Current raw joint inputs enter the Fast predecessor before the existing B9/PC22/selection chains; the Freeze-specific historical consumer enters the Freeze predecessor. Caller-provided readers propagate through the B9 public reader and the integration source/read/inventory/current-validation entry points, so mutation of a noncaller dependency cannot gain authority from the real disk. Wrong or empty predecessor descriptors are rejected before projection, preserving raw identity.

Original assertions remain, but test wiring is not byte-for-byte unchanged: the B9 current-input assertion explicitly consumes its authenticated Fast predecessor, and the appended Freeze test binds its current identity validation to the union while replaying the exact Freeze domain. Original full selection checks remain in their existing tests and integrated validation. No expected hashes, assertions, deadlines or policy were weakened.

## Verification

- Initial naive union retained real failures; `initial-red.log.gz` also records an assembly error (duplicate import) fixed before meaningful test coverage. `v1-red.log.gz` retains subsequent raw-source mismatch evidence.
- Final six-file relevant suite: **48/48**, zero skipped, 12896.850895 ms (`focused.log`). This is not Full CI.
- Actual two EOL fixture target files were written to CRLF, the original regression passed **1/1**, and exact bytes were restored in `finally` (`crlf.py`, `crlf.log.gz`). Not a Windows hosted run.
- Additional author probes: **69/69**, exact Git parents, current sources, missing/null/drift, wrong/empty before, production/foreign visibility, injected noncaller drift and recovery (`verify.mjs`, `verify.log`). Independent review is reported separately.

Commands: `python docs/evidence/fast-freeze-b9-union-20261117/capture.py`; `node --test tests/ci-impact.test.mjs tests/ci-summary-runners.test.mjs tests/release-card-contact-integration.test.mjs tests/release-selection-map-source.test.mjs tests/release-pc22-basic-feedback-source.test.mjs tests/integrated-ci-source.cases.mjs`; `node docs/evidence/fast-freeze-b9-union-20261117/verify.mjs`.

This is a real prepared two-parent integration tree, not an upstream merge. Neither source PR, protection nor official/device acceptance was changed. Existing historical gzip LFS objects were materialized locally only and are excluded from this delivery. Recheck actual heads/base and required hosted gates before using the candidate. No Full was started and no release decision was made.
