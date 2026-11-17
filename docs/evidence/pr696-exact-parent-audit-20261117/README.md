# #696 exact-parent continuation boundary audit

This is a diagnostic checkpoint, not a completed conflict repair or PR readiness.

- Examined immutable WIP `a15f9e5115290451865b79ff9db33dc6e5e13961` and its actual parents: picker preparation `af3ddb2eef8969959454c432cb2743288917a086`, Release `af77fb2461c548f0faf104761d107397f75dca08`.
- `audit.py` reads only committed Git objects and regenerates `result.json`. It does not alter packets, pins, helpers, production, inventories, assertions or CI policy.
- Picker/capacity contract: 15 raw mismatches among 82 bindings, including 4 paths whose joined bytes match neither parent.
- Capacity/preflight contract: 4 raw mismatches among 11 bindings, including 3 paths whose joined bytes match neither parent. The calibration bytes equal the picker parent, not the Release parent: picker/current f11fa80a… versus Release/expected 4d663e5f…. It is not join-new text, but still requires the correct parent view; this audit does not establish that a runtime continuation handles it.
- These are raw identity comparisons, not a claim that every mismatch is an unresolved runtime defect. Existing outer reader layers must be applied in order.

## Actual named consumer

`node --test --test-name-pattern='^B9 capacity CI join binds' tests/release-selection-map-source.test.mjs`

One named test failed, zero passed. `named-consumer.log` preserves the real failure: the merged selection test is `36d449cf…`, while the #707 preflight contract expects `312409e2…`. Both LFS archives needed by imports were materialized from existing local bytes only after matching each committed pointer's SHA-256; their Git pointers are not part of this change.

## Correct continuation boundary

The selection test's `integrationCapacityCurrentRead` historically means exact #703 current, but its merged #707 assertion requires the preflight current view. Replacing old hash pins would lose historical identity. The current picker helper also invokes card-contact/bootstrap validators whose implementations changed with #707. Therefore a safe repair must preserve explicit picker-parent and Release-parent views, authenticate fresh raw joint source before projection, preserve all immutable archives, and exercise both parent authorization chains plus same-reader mutation/restore controls. A single consumer pass cannot establish complete readiness.

No Full, Hosted dispatch, original PR head update, merge, Release change, or product edit was performed. Remaining runtime continuation and affected consumers are pending.

Independent review: `/root/integration1515/review_parent_audit` independently verified actual Git parents, reproduced result.json byte-for-byte, and checked all recorded hashes. Review corrected the initial calibration-parent interpretation above before commit. PASS is limited to this audit, not runtime integration.
