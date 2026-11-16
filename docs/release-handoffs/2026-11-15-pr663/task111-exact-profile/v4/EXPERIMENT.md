# TASK-111: V4 omit-only deployment probe

Source: `FurinyaWorks/Slay-the-Heavens` release `1cc5479b713edab6fd26db4e20f8eb22b7401cb2`. Input generated profile: parent's `build/formal`. This experiment copies exact deployable sources; it does not regenerate or edit production files or mutate branches. Official SDK, GIL construction, device tests and Full CI: NOT_RUN. Official capacity: UNVERIFIED.

## Result

- Production manifest: 366 include modules versus 365 omit modules. The **only omitted** module is `abyss_original_v4_data`, 577904 raw bytes, SHA256 `63e4983d6d80241f287e153087efd81e7ab287efbb15e195ef80ad90230fb2cb`. Remaining names/bytes/hashes identical. Source module bytes rechecked unchanged after runs.
- Uses the existing `candidateScriptFiles` generated-name argument with `generatedModules.filter`; no producer change. Full V4 source/data and generated artifact remain intact.
- `abyss_ui_layout` and `abyss_ui_templates` are copied separately as test-only fixture bridges and are NOT counted as deployed modules.
- Each fresh Fengari process has Lua package.path restricted to the corresponding copied include/omit directory and empty package.cpath. No fallback Lua path to original generated modules.
- V4 prepare positive control: include succeeds. Omit produces expected `module 'abyss_original_v4_data' not found` at `abyss_original_v4_profiles.lua:22`; assertion of that negative passes. This demonstrates an actual broken development capability if omission were applied indiscriminately.

## Scoped public Host result

`scoped-public.lua` extracts the public admission/production/alpha selectors and real GameUI Host blocks from `tests/lua/competition_character_admission.lua`. It excludes the dev-all-roles block and later mocked native-entry block explicitly; it is not a pass of that whole test. Both include and omit pass, with byte-identical printed outputs, two deterministic seed=1 starts per side. The real Host has no portrait adapter, matching its existing fixture options. It validates legal Geo selection/start, rejected foreign roles/elements and forged-state rejection. It does NOT prove full battle flow/RNG state equivalence, visuals or device behavior.

## Original native-entry failure retained

Unmodified `geo_public_entry.lua` was run once per side against formal generated art. Both fail identically: unbound portrait templateIndex, then missing mock `SetActive`, then native opening did not finish. Include and omit logs retained. This pre-SDK/mock binding boundary cannot be counted as a product regression caused by omission, nor as a pass. No synthetic binding or weakened production assertion was inserted to conceal it.

## Boundaries

This proves a bounded offline mapping difference and limited public Host reachability, not safe release removal. Lazy V4 runtime imports remain in full source. `platform-load.mjs` defaults to the full generated mapping and AST reachability is not profile-aware. Production adoption requires an explicit deploy profile and compatible dependency/inventory contracts; preserve full-source dev functionality and normal review/CI. Raw bytes are not saved official MB. This is not a repeated serializer A/B.

Files: `probe.mjs`, `scoped.mjs`, generated scoped Lua, `omit-summary.json`（完整清单由探针本地写出）, `scoped-results.json`, and six logs. The include/omit directories are local test copies, not release artifacts.
