# Release v2.0.0: profile fixtures and frozen card-input pairing

No official candidate, platform action, new Hosted run, release write, or gate bypass. These files are an isolated handoff, not CI admission or a published build.

## Recent failures and local repairs

- [#684 exact current ae5194](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/684) retains the original card-input mismatch from [prior Hosted POSIX 8](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/43723889389/job/132845266631). The old pre-browsing gesture body does not provide the new Intent field its current caller expects. [Scoped repair](pr684-card-input-compatible-epoch.patch) pairs the verified historical caller with the gesture only for the existing three archive paths. Fresh exact local nil-Intent RED, then the original 12 groups and archive-routing test GREEN in their unchanged time limits. Current sparse-flick tests remained 2/2.
- [#688 Quick](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/43733870793/job/132872063165) runs the Lua fixture directly from the generated default profile; official-only status width assertions fail. [Fixture-only patch](pr688-default-profile-fixture.patch) verifies default fixed geometry and retains the complete official ordered-power and width checks with their explicit profile wrapper.
- [#689 Quick](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/43735120171/job/132875896259) similarly uses the default tree, where official reward image controls intentionally do not exist. [Fixture-only patch](pr689-default-profile-fixture.patch) verifies the actual default text states, single valid claim, other row and RNG; every official pool and fallback assertion remains in its original branch.
- Both direct Lua failures reproduced against the isolated combined product tree before the changes, then passed after. Both original official JS-wrapper tests also passed after. These patches do not change production source, selectors, timeouts or workflow routing. Final recorded test input identities need updating on any branch that adopts them.

## New mobile overlays and boundaries

Adding #688 61bdf6c0 and #689 23bed75c to the previous isolated tree 1d3b3fd4 produced f6d800cdfed0f162289dae1d1e5da7d723e266fc without additional text conflicts. Their two targeted official wrappers and the previous actor transition probe passed on that combined tree before changing fixtures. The scope is product behavior; #684 ae5194 and #679 85f1cd4 subsequently changed source/CI wiring, not the underlying product inputs tested here.

Default layouts and templates stayed byte-for-byte identical. In the generated official profile, full UI +28 controls / +12,708 JSON bytes; battle +28 / +11,348 JSON bytes; serialized UI layout Lua +3,994 bytes; no template change. These representations are not additive and not official GIL, client/server capacity, or latency measurements.

#684 ae5194, #679 85f1cd4 and #690 11ec36bf use independently valid-current input contracts over the same release predecessor, not over one another. They share six source/CI entrypoints, with conflicting independent continuations in the production-source entrypoint. Do not cherry-pick snapshots as if they authorized a combined tree. Preserve old source and calibration witnesses, wait for exact product scope, and authenticate final runtime changes, current inventory, copy closure, forecast and required CI once. The no-GIL and device-acceptance gaps remain.
