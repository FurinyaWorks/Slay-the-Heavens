# Official-profile pre-GIL rehearsal, 2026-11-15 04:14 wake

Scope: current PR #663 d3783cd17be21dedcffd22f391cecc6455ce9a50 production sources plus d241823b62198eb42152d154d966afa0c2e22c2f test-only epoch optimization. Isolated copy of release-0400/ci/rehearsal at source/. No repository production code, profile guard, version, user workspace, device, GIL or remote state changed.

## Executed result

- Real build-lua-data and build-ui official/lifecycle generation completed; UI exit 0.
- verify-generated.mjs parses all 19 generated Lua files using repository luaparse Lua 5.3 and all 6 JSON files; validates exact official art flags, lifecycle true, and actual shared stsReferenceChrome presence. PASS: 25 files, 23,884 layout nodes. Per-output bytes/SHA-256 in generated-verification.json. This does not prove official runtime or capacity.
- Existing targeted official-assets tests: 3/3 PASS (profile guards, receipt reconstruction, audio wrapper forwarding), 1.458 seconds. No Full/51-test rerun.
- Native audio CLI --official-assets --release-candidate exits 1 immediately: `Official assets require a separate non-release candidate without other art profiles`. Rejection precedes base-map access. This is intentional current code, not repaired or bypassed.

## Checkout blocker repaired locally

Initial real UI build failed `Invalid selection budget avatar96`. Both portrait preview PNG sources were unmaterialized 130-byte Git LFS pointers. Reused already available local exact objects in isolated source/ only (no download/source edits):
- avatar96 preview SHA-256 d96f7f81c436971a5d7aa78740b580a7bb237d5ac2962e51f5532dbb51f9eb80
- battle133 preview SHA-256 93b4d73290c3a20da7b02f02b05786b57fd5d381da71b02b5839a8c6a344f80b

Successful actual builder validates these hashes via selectionBudget. Do not mistake pointer checkout failures for gameplay regressions.

## Material profile/release decision

`nativeAudioBuildArgs(['base.gil','out','--release-candidate'])` yields workKey alpha-test and art flags cards=false, menuBackground=true, selectionAvatar=true, battlePortrait=true, monsters=false. It does NOT set officialAssets or nativePageLifecycle. Exact parsed options in generated-verification.json. Actual formal workKey must be supplied, not inferred from this parser demonstration.

Official mode instead disables menuBackground, enables officialAssets plus nativePageLifecycle. Both official-assets-profile.mjs and ui-profile.mjs disallow RC mode. Thus silently removing --official-assets to obtain a release is an appearance/lifecycle change, not a harmless build fix.

Authoritative repository evidence docs/evidence/official-assets-first-20261109/README.md explicitly says official is opt-in, legacy/enhanced/default remain unchanged, formal default awaits same-candidate visual acceptance, and mixing release is forbidden. docs/backlog-details/TASK-88.1-PLAYABLE-20261114.json records user-confirmed playable 311c4c96, NOT formal release, and has no profile receipt fields. Its successful historical ready/import does not authorize changing the formal profile or certify d378. #663 official layout changes and tests demonstrate implementation intent, not owner approval to promote this profile into RC.

## 边界
本报告只记录当前正式候选配置与官方素材试玩配置的差别，以及源码生成与定向测试。不含 GIL、素材或压缩来源见证。换配置需重新验同一候选。
