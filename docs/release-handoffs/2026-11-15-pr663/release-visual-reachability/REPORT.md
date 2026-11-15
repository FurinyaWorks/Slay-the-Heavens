# Release 2.0 profile reachability matrix, PR 695/696/697/699

## Source
Exact Release `1cc5479b713edab6fd26db4e20f8eb22b7401cb2`, plus product-only changes from:
- #695 `350c447c96dc65c1b48c48c3e0e24a3b627e4b2f`
- #696 `45008d10feb08b9c4d44ea26c1e35205583761b2`
- #697 `2c06753de6f96ab6908ebe30d8e4a216d1ebbe60`
- #699 `73da2626d37fb52f90e71cd65838c08a1b9cae7c`

All four product patches applied sequentially with `git apply --check` and no conflict resolution. Both shared `official-run-layout.mjs` changes are preserved. Included scripts/src/data product paths; excluded tests/proof/Backlog/CI artifacts and #699 scripts/test-lua.mjs and ci-test-timings.json. Not a merge rehearsal for their full source-closure metadata; not an upstream branch. No #691 serializer in this matrix. Existing LFS assets reused from hash-verified prior materialization.

Patch SHA256:
- pr695.patch b37d2f5b9d3de5e7a9257d61425c464d257977d662c8a8c18ce141ae2cfb0428
- pr696.patch c23e2698a95daf6e846e6c095f36fa49f0552d1f9eec9bb286153ad5c8a267fa
- pr697.patch 13cceca36436e0cc28b32376ef3c4dd9e5557fc3a4d2b382d94929c9cdb08d6f
- pr699.patch 36cf1e1bf522c65bacb73bb8ab7d6e7e4ed8d46fc5996dba1be5ec8e95e2f049

## Execution
All three real `build-ui.mjs` generator calls exited 0. Default uses formal audio CLI art flags: cards=false, menuBackground=true, selectionAvatar=true, battlePortrait=true, monsters=false; work-key=contest-2026. Official diagnostic uses `--official-assets`; V25 diagnostic uses default art flags + `--v25-battle-chrome`. Neither diagnostic sets nativePageLifecycle. These are source-only generations, **not `releaseCandidate:true`**, no fake metadata or formal output. Official remains forbidden in formal RC by current policy; do not change profile automatically.

`matrix.py` traverses concrete generated game-ui.json paths and asserts the observed profile distinctions. `matrix.json` contains exact node kinds/sizes/positions/visibility and output hashes. Marker presence is not runtime visibility, native renderer correctness, or device acceptance.

| Specific product marker | Formal-default flags | Official diagnostic | V25-only diagnostic |
|---|---|---|---|
| #695 exitEntry/open/.../officialBattleHud/symbol native image | absent | image 100161, 28×28 | absent |
| #696 picker previous sharedButtonChrome | absent | present, 200×48 | absent |
| #696 picker previous bounds | 44×208 | 200×48 | 44×208 |
| #697 map previewBack/v25Face | absent | present | absent |
| #697 map previewBack bounds | 148×44 | 180×60 | 184×52 |
| #697 character officialBackdropVeil visibility | no explicit false | explicitly false | no explicit false |
| #699 menuPanel/v25MainMenu/titleMark | absent | present | present |

Generated UI hashes:
- default: `0798f272cba727cf099dd7676b80c0cdf15cd4c4f447904f35e01d44c4c0a7bf`
- official: `8849a559a8fbe562da1e08904722623fdb85cacee30b6195e512d3ef4ef3c28c`
- V25-only: `ef9c0e4a9bd508e7733f356c8ebf08c126e64e2aa33719f7a499188e0f755f2e`

## Actionable conclusion and limits
The approved-looking review path is not equivalent to the currently legal formal-default generation path. Merely integrating these product fixes does not expose all of the tested visual markers in formal-default output. V25 alone does not bridge the first three fixes either. A Release owner must select and validate a legal final composition, or explicitly port the intended fixes to that composition, before final official candidate acceptance. Do not infer all changes in these PRs are absent: the matrix covers the named visual markers, not every runtime bugfix or #699 potion/relic changes.

No Full CI, native SDK/platform calls, user machine/GUI/Codex quota, remote edits, gate bypass, or PR merge occurred. JSON byte counts in matrix.json are debug serialization only, not official capacity. Existing work remains owned by PR authors.
