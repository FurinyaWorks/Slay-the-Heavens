# Reviewed combined repair, not applied to either queued PR

Parents: #707 86670bcfc6565153595abf2e0476bf70750fdc19 and #709 f8acc21780b90712bffba383101e34fea3471bf8. Common Release base 33d71575c5f186a1b54f7bf3e4f1826c145aa1d9.

## Apply only against these exact parents

In an isolated worktree at the #707 head, merge the exact #709 head with --no-commit --no-ff. There are two conflicts. Replace tests/helpers/release-selection-map-ci-source.mjs with release-selection-map-ci-source.mjs.txt from this directory, tests/release-selection-map-source.test.mjs with release-selection-map-source.test.mjs.txt, and add release-fast-freeze-combination.json to tests/helpers/. All other paths are the normal automatic merge. Materialize existing LFS payloads using their original pointer identities; never stage expanded LFS payloads as regular Git blobs. Resolve and review in that worktree; do not copy these files onto different heads without rechecking and regenerating the exact binding.

The packet appends complete combined before/current bindings for precisely two files, retaining the immutable original freeze and selection-map archives. Raw combined inputs are checked first. Only exact whole-source LF/CRLF matches project to the #709 parent; historical views then retain both prior chains. Unknown/malformed inputs and incorrect before identities remain unchanged. Production sources never enter this CI-only projection. Final union preserves #707 Release push removal and frozen Full publication gate and #709 edited/live metadata scope enforcement.

## Evidence

Original naive union: 5 PASS/3 FAIL (parent directory). First broader test run: 58 PASS/2 module-load failures caused by missing luaparse in the new isolated worktree. Restoring the already installed dependency tree let those two entrances run 28/28. Do not add these overlapping rounds into a single total.

After reviewer-identified wrong-before and absent-before-object cases were fixed, final same-round selection-map + ci-impact + integrated-source closure: 25 PASS/0 FAIL/0 skipped. Reviewer controls: 65 PASS, including old parent rejection, current source drift/missing, both newline forms, unknown paths, Buffer and malformed predecessor. Earlier reviewer failure log is retained separately. guidance, Backlog verification and diff check pass. No Full execution requested.

Final SHA256 identities:
- helper: ef6c0c6c8b27a6f8d7308b2fefc1d6da4c356e48388c1c776f385c79e6c2ea99
- packet: 60ed9b12e0bb15e69846473d4e45d9f72412cc2246b9d6430bea41d5956febb9
- test: d3a5b6ae5ad1cf9a1ee4a20cf9250da6908bb710398c8f3ae65a522460b129fc
- union workflow: 64085f537f925f55d8774f76d5b68de7113238484f6aee6b215ce99c09507b93

This directory preserves a reusable repair, not a new competing PR or Backlog. Both queued PR heads remain unchanged. After the first PR merges, apply the repair to the surviving integration as appropriate and validate the actual resulting base/head. Hosted required checks, final merge and official/client/device acceptance remain unverified. Retire this evidence branch only after the surviving PR preserves the evidence and unique repair files.
