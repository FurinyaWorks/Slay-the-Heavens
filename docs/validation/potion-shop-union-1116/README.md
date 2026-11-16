# Potion/shop integration checkpoint (not merge-ready)

Inputs: #679 `10cfd7ac965c6aa2f640cdfac35c1149ac42c5c0` and #680 `ad3a53cb3eb87fbad4ae015d11ea870deb6d5db1`; shared Release base `33d71575c5f186a1b54f7bf3e4f1826c145aa1d9`.

Remote real product union: `349b670e4a5ee12c4c13a6e55394b62ac06e5f4b`, verified by coordinator, has both exact input commits as parents and tree `253dac6`. Local producer `879e54d894959055904eff8e0c24d72219258271` has the same tree but is not claimed to have been uploaded. Both original product increments and historical archives remain present. The added narrow two-parent source epoch preserves all predecessor targets and authenticates 352 current production bindings; the shop contribution changes exactly two disjoint owners.

Verified at this checkpoint:
- Direct live union corpus: 59 text bindings and 108 immutable archives; missing/null/drift negative controls against public historical-read and CI-source boundaries, plus raw JS/Lua inventory controls: PASS (19.4s). Null/drift of the queried source itself remains raw without granting historical output.
- Both original post697 production-epoch tests: 2/2 PASS (9.7s), including all owner faults and retained predecessor domains.
- Coordinator separately reports original product entries `potion-popup-click-payload` and `shop-dismiss`: 3/3 PASS after generated data/theme/UI preparation. This is default-profile evidence, not official/mobile acceptance. Initial missing theme build preparation failed and must not be hidden.

Preparation and remaining work:
- Two checkout LFS pointers required local hydration from hash-verified existing objects. Original Git pointer blobs are unchanged and must not be staged as new archive payloads.
- Initial native test entry failed because sparse checkout omitted `experiments/menu-red-fit/compose.mjs`; coordinator restored its exact HEAD blob. This was not an assertion failure.
- Full historical CI-chain authentication diagnostics were interrupted after prolonged nested authentication. No timeout or assertion budget was raised. The historical parent fixtures now authenticate current input once to establish exact old parent test data; they are explicitly test-only, not current-tree authorization readers. Current-tree contracts use separate live raw readers.
- NOT READY: finish both original post697 CI/history cases, current union controls for both targets and inventory injected-source faults, integration helper-copy closure, release selection/calibration/source inventory tests, independent review, required CI, exact final cold-pack size check. No Full run was started.
- New skills/monster redesign and unrelated release agents' work remain untouched.

Additional bounded diagnostic (`--test-name-pattern=post697`, 120s external diagnostic stop): all six original shop post697 cases PASS, including fresh complete corpus, public source, inventory, same-raw integrated reader, cross-input faults, and all 118 production owners. Potion historical case file did not finish before the diagnostic stop (exit 124/cancelled); this is NOT a passing combined history run and not a raised test timeout. See `history-diagnostic.log`.
