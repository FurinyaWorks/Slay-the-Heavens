# Battle detail latency implementation plan

**Goal:** Remove redundant UI work on the 02:13–02:36 reported battle detail routes.
**Spec:** Owner request in this session; target release/v2.0.0, PR-only emergency squash after directed regression and independent review.
**Architecture:** Reuse existing detail controls and modal ownership. Do not cache mutable battle data. Keep readiness and pointer isolation.
**Constraints:** No deck sorting, card face, art or combat rule edits. Mobile measurements remain NOT_RUN without a device.

- [x] Reproduce redundant deck open/close on relic entry; benchmark actual Host routes before changes (median/P95, repeated open/close, Lua retained memory, native method counts).
- [x] Add failing route regression; open relic directly through the same deck guards, increment modal session, register final presentation source; one Host refresh.
- [x] Add failing detail regression; provide renderInfo-only path with original input preparation, identity and validity checks, full redraw fallback when cancelling potion aim. Switch only detail event renders.
- [ ] Run directed Lua/Node/native UI and syntax/engineering checks; record baseline/final numbers and device limitations.
- [ ] Fresh independent review of exact HEAD/BASE/tree; PR, inspect live rules/permissions, emergency squash and read back actual merge identity. Retain device AC as pending.

Execution ledger: inline implementation; original relic RED and full-render negative control RED, detail regression GREEN. Local npm test started then terminated (not a pass) to prioritize directed regression. Restored exact four LFS inputs after initial environment failures; no asset edits. Engineering gate: unchanged battle M.new CC16>15 (exact baseline Git blob 26120e4e7089273e4a07529d09d386ddb93a06c7); no threshold change. Final validation and independent review identities recorded in PR.
