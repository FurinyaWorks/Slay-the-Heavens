# #707 + #709 integration preflight (2026-11-16)

Owner: release_progress (delegated release integration). Evidence-only, not a merge candidate.

Exact heads: #707 `86670bcfc6565153595abf2e0476bf70750fdc19`, #709 `f8acc21780b90712bffba383101e34fea3471bf8`; common Release base `33d71575c5f186a1b54f7bf3e4f1826c145aa1d9`.

`git merge-tree --write-tree` found two textual conflicts: tests/helpers/release-selection-map-ci-source.mjs and tests/release-selection-map-source.test.mjs. Quality workflow text auto-merges, but its complete source identity changes.

Diagnostic-only attempt: retained #707 historicalSource checks, exported the #709 freeze packet, and chained releaseFreezeCiBefore before historicalSource. It retained all eight tests, assertions and immutable packets. The attached patch is relative to #707 and is NOT sufficient or approved for production.

After materializing the two existing LFS files by their exact pointer SHA256, `node --test tests/release-selection-map-source.test.mjs` produced 5 PASS, 3 FAIL, no skipped. Original output is preserved. All three failures concern combined complete-source authentication: workflow hash `64085f537f925f55d8774f76d5b68de7113238484f6aee6b215ce99c09507b93` differs from the #709 freeze identity, and the combined test source differs from its immutable predecessor. Production source authentication, execution guards, drift rejection and isolated-copy test passed.

Next: preserve both exact heads and append a reviewed complete combined-before/current identity continuation, including test helper copies, both newline forms, unknown/malformed input and predecessor rejection. Do not change old packet hashes or discard either frozen-Release Full validation or release-scope checking. Then rerun targeted contracts, independently review, and only apply to the surviving PR after the first merges.

No production/PR head changed, no full run triggered, no protection change, no merge or release. #707 required checks still queued at inspection; this evidence does not represent hosted pass, final integration or official device acceptance. Evidence branch may be closed after the actual integrated continuation incorporates this record. No second backlog or PR created.
