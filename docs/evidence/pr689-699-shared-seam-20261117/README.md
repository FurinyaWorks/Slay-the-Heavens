# #689 + #699 product seam on current Release

This WIP resolves a concrete integration seam. It is **not** a source-epoch integrated release candidate and does not replace the original PR owners' branches.

## Exact inputs and scope

- Release base: `af77fb2461c548f0faf104761d107397f75dca08` (includes #703 shared card host and #707 Fast policy).
- #689: `30ead25768a2522be9ae9a1fac105b8c56fba67a`.
- #699: `8d4e5c4a690ef8ccec4f4914e7ebe063523a0d96`.
- Both feature heads' common Release ancestor: `33d71575c5f186a1b54f7bf3e4f1826c145aa1d9`.
- Product source and selected unchanged-assertion tests were three-way composed on af77; source-epoch archives, CI timing data, and the central test runner were intentionally not imported.
- Backlog CLI unavailable in this environment. This is an explicitly delegated integration diagnostic/repair handoff, not a new autonomous feature claim or second Backlog.

## Actual repairs

1. Preserve #689 one actual fallback/pool per relic reward row, while retaining #699 potion bindings and formal source-alias mapping.
2. Independent review found and reproduced two cross-state bugs: state-local image identity could leave the wrong native fallback; state-local pool history could leave a replacement pool visible. Both caches now belong to the actual shared icon (weak keys), not individual state faces.
3. Identity includes the image source and only records a successful setter. False/throw retries remain possible.
4. Optional shared-root lookup now tolerates strict missing-child errors so the original state-local/no-art presentation still renders.
5. Existing #699 fault-injection helpers now address the actual row owner. The 72 retirement assertions, complete Run/RNG and peer-pixel checks, 139 alias checks, 42 potion recipes, old asset hashes, and four state-face geometry assertions are retained. Only pool placement/count expectations change: battle26 and Host49 pools instead of32/55.

## Validation and limits

Final exact-source result: **9/9 PASS in 120.409 seconds**, plus **2/2 cross-state regressions PASS in 0.558 seconds**, zero skips. `git diff --check` and JavaScript syntax checks pass.

See `verified-targeted.log`, `cross-state-verified.log`, and independent review. Commands:

```sh
npm run build:data
node --test --test-concurrency=1 tests/potion-art-runtime.test.mjs tests/reward-relic-shared-art.test.mjs tests/reward-pool-retirement-runtime.test.mjs tests/sts-reward-row-runtime.test.mjs
node --test tests/reward-shared-state-cache.test.mjs
```

Tests use generated layouts/Fengari and narrow painter mocks, not official clients or phone measurements. No Full CI was launched. No branch protection, assertions, timeout limits, or upstream owner branches were changed. Do not merge this WIP until the normal source-epoch and Fast CI integration work is completed. #699's large-pack/source delivery blocker is separate and is not claimed solved here.

`cross-state-cache-red.log` records the initial composition failure; `cross-state-pool-red.log` reproduces against exact original #689 code. Both GREEN logs and marker-checked automated tests are included. Earlier setup failures involved sparse materialization/LFS inputs, not changed production behavior; exact base experiments and LFS images were restored locally only. Hydrated images are not part of this commit.
