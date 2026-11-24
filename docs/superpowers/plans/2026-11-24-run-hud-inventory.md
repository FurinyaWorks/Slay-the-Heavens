# v2 Run HUD inventory implementation plan

Goal: implement Owner PD-01–05 on exact release BASE c4eec5f9dc0cebb6bf0295b1d25cb1000cc48b96.
Architecture: existing authoritative Run and page writers remain; one Run HUD presentation policy controls all page resource fragments and shared inventory. Generated page chrome paints after room surfaces; mobile content reserves the resource + relic band. Pooled bar slots page independently of the one reusable detail panel.
Tech: Lua Host, generated native JSON/Lua, Node tests, offline runtime projection.
Spec: user PD-01–05, formalized in docs/design/reference-assets/v2.0.0/run-hud-pd-20261124/REFERENCE.md.

Constraints: no new interaction, +N, collection entry, icon shrink, framework, rule/gameplay change, protection change, or falsified device evidence. Existing 84-unit mobile touch targets and pointer guards remain.

Review focus: retained event result with phase=map; late touch after bar page change or room change; modal input below HUD; capacity and inventory mutation; all opaque room fields versus mobile HUD.

- [x] Task 1: capture RED on real official generated tree: event HUD remains visible, opaque field cannot cover bar, owned slots/page/index/detail reuse, 0/1/2/3/5/capacity±1/25/26/53 and capacity 2/3/5 potions. Add tests/run-hud-inventory.test.mjs and tests/lua/support/run_hud_inventory.lua. Run node --test tests/run-hud-inventory.test.mjs (RED).
- [x] Task 2: implement single presentation policy in src/lua/abyss_run_hud.lua; integrate existing refresh lifecycle; remove room-wide inventoryAccess; order generated page chrome after room surfaces; reserve mobile HUD/content geometry. Test event/selection/result/route/modal/settlement and stale input.
- [x] Task 3: replace overflow with fixed pooled relic pages and arrows in relic view layout/runtime/theme. Single detail defaults to actual index, boundary-safe arrows, bar-page preservation, stale touch identity including Run/room/page/modal. No legacy multi-relic runtime entry. Run dedicated suite and existing mobile coordinate regressions.
- [x] Task 4: formalize PDs, original sources and evidence types; supersede failed reference assets and obsolete assertions; inspect actual Host lifecycle across page chain and PC/mobile, record stable object/binding counts and offline projections. Run appropriate related, syntax, architecture, full suite and record baseline failures by name.
- [ ] Task 5: commit final candidate; A product/B code/C tests independent parallel reviews on exact BASE/HEAD/Tree, fix blockers and re-review; PR to release; read live rules/role, use Owner-authorized PR-only admin squash; verify merge tree, candidate build status, develop sync and branch closure. No official publication or tags.

Execution: Owner explicitly requested direct implementation and three final independent reviewers; no additional design/plan approval needed. Existing worktree untouched. LFS source images must be materialized before production build; no validation bypass. No GIL/Miliastra SDK in environment, record formal build/readback UNVERIFIED.
