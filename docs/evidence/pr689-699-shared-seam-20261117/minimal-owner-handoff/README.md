# Minimal handoff for the original #689 owner

The parent evidence commit `658aef31` combines #689 and #699 product code. **Do not cherry-pick that entire combination merely to repair #689.** This directory supplies the independent four-file patch against exact original #689 `30ead25768a2522be9ae9a1fac105b8c56fba67a`:

- `src/lua/abyss_battle_reward_layout.lua`: actual-icon identity/pool ownership and optional strict shared-root lookup.
- `tests/reward-shared-state-cache.test.mjs` plus two Lua regression fixtures.

No #699 potion or source-alias production behavior is imported. No source-epoch archive, historical source pin, test registry, CI policy, or branch ref is modified by this patch. The three regressions cover cross-state native identity, cross-state replacement-pool retirement, and plain state-local rendering with a strict missing-root lookup. Setter false/throw retry and image-source changes are also asserted.

## Apply in the owner's isolated worktree

```sh
git rev-parse HEAD # expected exact 30ead25768a2522be9ae9a1fac105b8c56fba67a
git apply --check /path/to/pr689-four-file.patch
git apply /path/to/pr689-four-file.patch
node --test tests/reward-shared-state-cache.test.mjs
```

For a newer integration tree, adapt the same small production delta instead of blindly overwriting its file. Preserve the #699 formal alias and potion branches when integrating with #699.

## Exact-source verification

Original #689 plus only the new tests: **0/2 PASS (RED)**, wrong native image and stale visible pool reproduced. The repaired exact #689: **2/2 PASS, 0 skipped, 560 ms**, marker and empty-stderr checked. These are small production-painter tests with stubbed presentation dependencies, not generated-Host, Full, Hosted, official-device, or source-epoch integration acceptance. The previous 9/9 generated-Host evidence remains bound solely to `658aef31`.

The source change necessarily invalidates #689's current-source authentication until its existing owner incorporates these exact bytes into the final integration contract. This handoff is not merge-ready and must not bypass that guard or rerun old green statuses as a substitute. Existing original owner branches were not touched; no fresh Full was dispatched.
