# PR696 / actual capacity Release join preparation

Parents: existing preparation `c2d32421e63f104675fb98d7af033cb5817555eb` (tree46980e) and actual Release `00ab3fe6d386f55aecfb063e59aeca2cf5065807` (#703). Common base is B9 `b9bca884ed9b9831965b409885d78f719b9a567a`. This is a normal merge in a new isolated worktree; the previous B9 worktree/evidence remains untouched. No commit/ref is created by the implementation task.

## Real scope and ownership

The new Release changes211files, including165docs/evidence,34tests/helpers,11scripts and1Backlog document. Only calibration and selection-source tests had textual conflicts; their imports were composed without deleting either side's test bodies. Six prior current-closure files changed, while the prior immutable-archive intersection is empty. All11capacity-changed scripts remain byte-identical to00ab; picker-owned script changes are retained separately. src/config/workflows retain prep bytes. No monster redesign, gameplay changes, duplicated #703 product fix, Full or old45-minute matrix was started.

## New exact boundary

`release-picker-capacity-join.json` binds82current textual files and7new immutable capacity packets, including all capacity script owners and both old/new CI callers. It records29complete prep predecessors and17complete capacity predecessors. The existing B9 packet remains byte-identical. The two bootstrap/selection `-picker-before-capacity.mjs` modules are exact prep-source snapshots, so the old domain does not accidentally execute the new capacity validator against historical bytes. They are not weakened validators.

Every existing B9 public/fixed validator route now enters the outer raw-current checks, then privately supplies each original domain with its exact predecessor. Original capacity card-contact/bootstrap validators execute after the raw boundary; original prep owner/archive/side validators remain. No unchecked reader, skip flag, cross-call cache or externally supplied proof is exposed. The new capacity reader preserves foreign values and Buffer identity and uses one captured input value for its pure transform; authorization still rereads the original caller's raw source.

## Actual checks

- Outer healthy full boundary: PASS,5.816s. This is local diagnostic timing, not budget qualification.
-38-check warm boundary probe: PASS,60.484s. New capacity-only script, new binary archive, both conflict CI files, old Lua owner, old B9 packet and new outer packet missing/drift are rejected through both ordinary public projection and fixed integrated validator; restoration returns the exact Buffer.
- Capacity-reader probe: PASS for string/Buffer, warm capacity-owner missing/recovery, foreign/no-op exact identity and one input read. This followed the capture-only reader refinement; the main raw authorization was unchanged.
- Actual #703 product consumer `native default fallback removal requires a valid bounded lowpolyHero schema`:1/1PASS,0.244s total.
- Actual #703 source consumer `capacity ready-card source remains raw to unsupported old feature consumers without authorizing linked reads`:1/1PASS,16.215s total.
- Syntax, guidance and diff checks pass. These are offline tests, not official client/mobile or hosted runs.

## Explicit remaining work

This is preparation only, not original-PR promotion or merge approval. The combined calibration and selection consumers still need explicit historical-domain adaptation and exact-source execution. In particular the merged #703 strict current-source assertions must not be made to accept arbitrary old or combined bytes; they need the exact authenticated capacity view. All full consumer matrices and isolated helper-copy paths remain unqualified.

**The previous B9-only32–40-minute matrix estimate is obsolete on this new base.** The new healthy boundary is about5.8seconds; no new matrix budget has been measured or approved, and no large run should use the old estimate. Keep original budgets/assertions and review the final closure before planning any further long run. Old successes are retained historical evidence, not passes for this joined source.
