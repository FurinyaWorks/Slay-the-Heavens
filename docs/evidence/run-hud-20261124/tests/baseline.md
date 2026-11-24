# Reviewer C initial baseline / release capabilities

BASE: c4eec5f9dc0cebb6bf0295b1d25cb1000cc48b96
Worktree: /workspace/hotfix-run-hud

`selectionBudget()` initially failed `Invalid selection budget avatar96` because the two source preview PNGs remained Git LFS pointer files. Data rows passed all geometry constraints (avatar96 457 rows, selection133 1940 rows). The manifest's expected source hashes match each pointer OID, not the pointer text SHA256. Scoped `git lfs fetch origin <BASE> --include=<two paths>` plus checkout restored the actual sources (17710 and 18329 bytes). No production changes or assertion changes were necessary.

`node --input-type=module` calling `selectionBudget()` then passed. Calling `buildUI(<fresh /tmp output>, undefined, {officialAssets:true,nativePageLifecycle:true})` passed and generated /tmp/hud-c-base-pRnF4v. This is source generation, not native GIL write/readback or official runtime.

Current CLI account repository permissions: admin=true, maintain=true, push=true.
Release Ruleset 27313515 active; includes refs/heads/release/*; admin RepositoryRole 5 bypass_mode=pull_request. Requires squash, review resolution, no force push, linear history and strict check/presentation/engineering-posix/inventory statuses. Owner emergency bypass is documented docs/CI.md lines 123 onward; no rules changed.

No `.gil` file found anywhere under /workspace; no Miliastra tool exposed in ALL_TOOLS; MILIASTRA_MCP_ROOT is not provided, and default Windows server path does not exist. buildNativeCandidateFromToolchain requires that server, its SDK and native encoder plus a base GIL. Native GIL unavailable in current environment. This does not establish official import, ready, device or platform-load acceptance.

Backlog CLI exists at /workspace/cloud-tools/node_modules/.bin/backlog (1.53.0); only PATH was missing.

## Independent A/B during implementation

Created detached exact-BASE worktree `/tmp/hud-review-c/base`; no parent build directory shared. `node_modules` symlink uses same immutable dependency installation, but all generated test outputs remain in baseline worktree.

`python -m unittest discover -s tests -p test_*.py -v` at BASE: 66 tests, six failures in `test_embedded_cards_match_source_and_presentation` for strike, perfected_strike, pommel_strike, twin_strike, wild_strike, dual_wield. Names and output category identical to current implementation run. Log: `/tmp/hud-review-c/base-presentation.log`.

The first full-JS source hash mismatch in current worktree (`7eaa672a...` versus `5e41bb3c...`) is another LFS pointer, this time `tests/helpers/release-source-epoch.json.gz`; its pointer OID equals expected SHA. Exact-BASE worktree materialized this archive, verifies expected SHA and passes that import stage. This is environment materialization, not an existing production-source defect, and must not be reported as an old failing source archive. Advised parent to materialize required archives and rerun.

First standalone baseline act1 run omitted build:data and thus failed with missing abyss_data; this is invalid test setup and not a project finding. Repeated after `npm run build:data` and `npm run build:ui` (both passed). Active result log `/tmp/hud-review-c/base-act1-after-build.log`.

Initial current engineering failures from unused parameters and Layout shadowing are newly introduced checks and were reported immediately; parent says corrected and rerun pending. Do not classify them as baseline issues.

BASE full act1 file re-run was intentionally cancelled after the complete epoch import and presentation A/B had already answered the requested provenance question; concurrent Fengari loops were consuming CPU alongside the implementer's final matrix. No completion/pass claim is made for this cancelled baseline file run. Current focused review run remains in progress; no additional duplicate matrix will be launched before final freeze.

## Exact-BASE final pure-static A/B requested by coordinator

- `node --test --test-name-pattern='CC15 dispatcher|source inverse authenticates' tests/act1-choice-responsibilities.test.mjs`: source inverse fails at test line79 on exact BASE. CC15 initially had missing local Luacheck (invalid environment for that first result).
- After placing the existing pinned, SHA-verified Luacheck1.2.0 binary in BASE's own `build/tools/luacheck`, `node --test --test-name-pattern='CC15 dispatcher' tests/act1-choice-responsibilities.test.mjs` fails at test line16: responsibility report contains W561, `src/lua/abyss_game_ui_view.lua:89:12`, complexity16>15. It does not identify Act1 dispatcher itself as the issue. Log `/tmp/hud-review-c/base-cc15-final.log`.
- BASE and current `src/lua/abyss_act1_events.lua` SHA256 are both `33bcfab9a306ff82ea2b9658fda387f20f6c323739be9483e67ca309d5d35ae0`; no current diff to that file. Source-inverse failure is baseline, not this HUD change.
- C independent implementation-time matrix: 4/4 PASS, relics, potions, geometry, mutations; `/tmp/hud-review-c/current-focused.log`. Relics111.1s under competing Fengari load; no timeout relaxation was applied.
