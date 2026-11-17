# Independent shared reward product-seam review

Reviewer: independent code-review pass (separate from implementation).

Scope: isolated product combination on af77 with #689 (`30ead257`) shared-row geometry and #699 (`8d4e5c4a`) identity/potion behavior. This does not approve source-epoch integration, CI provenance, official-device acceptance, or merging an original PR.

## Findings and resolution

1. Found a real cross-state native-image identity bug: state-local `cached.id` can remain blue candle while the single shared icon was changed to calling bell by another state. Minimal production-painter run reproduced expected blue candle / actual calling bell with an unavailable pool. The prior RED log is retained.
2. Found the equivalent cross-state pool-retirement bug: normal replaces the pool, then hover loses lookup and only retires its stale old pool. Reproduced against exact #689 `30ead257` source (the implementation had already repaired current source before this reproduction), expected hidden / actual visible. The prior RED log is retained.
3. Implementation repaired identity and retirement ownership with actual-icon weak-key maps. Identity includes image source; false/throw setters do not create a successful cached identity. State caches retain face/tone/input references only. No duplicate hidePool/paintShared declarations remain.
4. Reviewed the optional root-icon `pcall` lookup: absence/error falls back to the original state-local native icon, while a shared row uses its actual common icon. The old row-runtime assertions were not removed; the fixture parent link models native ownership.
5. Compared retirement helper with #699: only shared-row owner selection and explanatory comments changed. The existing 2 rows × 4 states × 9 cases = 72 required assertions remain, including unavailable/replaced/foreign/destroyed handles and full Run/RNG/peer-pixel checks.
6. lowcost-art retains #689 one shared fallback/pool per relic row plus #699 potion owners. Native and painted relic IDs both use the same formal definition mapping. This review does not bless untested asset count or device-size claims.

## Independent regression verification

Created `tests/reward-shared-state-cache.test.mjs` and two helper fixtures. Final run: **2/2 PASS, 0 skipped, 508 ms**. Tests use the actual production painter with narrow dependency stubs, not a real device. Coverage includes both cross-state bugs, setter false/throw retry, and changing image source at the same identity. Node wrapper requires terminal PASS markers and empty stderr because Fengari may return exit 0 after a Lua assertion failure.

Implementation pass owns the existing generated-Host and alias/potion/retirement batch; this reviewer did not duplicate that batch. Final seam delivery remains contingent on that result and fresh exact-source verification.

## Reviewed SHA256

- `scripts/lowcost-art.mjs`: `d10ebd3d383f4d6986ea45a5e7304eeb8e7b00eac7f2c2a038224c91a7c41aee`
- `src/lua/abyss_battle_reward_layout.lua`: `f160b613dd6f05febdc2c9f66623d8e09ac4f5300f0a05b9bebff3426f651225`
- `tests/helpers/reward-pool-retirement-runtime.lua`: `d1876db68332a0c0ceda1318a5b12572fb79b94a1511adede2510c4b96b967ad`
- `tests/reward-shared-state-cache.test.mjs`: `74bca0a5a827cbe8c83530329badc62c4a6f22145003317508d26c3db784a017`
- `tests/helpers/reward-shared-state-cache.lua`: `822edfcd9adc51a1853abe7905ea6b77ce1cade6180ebcc6ee142bf9938972c9`
- `tests/helpers/reward-shared-state-pool.lua`: `888c946ee567ad7aef0a986ebe0b47fbf159ddf5a7255a8d5b979ca171028347`
