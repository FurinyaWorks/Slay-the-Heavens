# PC18 default map-entry runtime probe

Scope: exact #699 `73da2626d37fb52f90e71cd65838c08a1b9cae7c` potion-discard UI, with actual previously generated formal-default owner subtree on Release `1cc5479b713edab6fd26db4e20f8eb22b7401cb2` plus clean #695/696/697/699 product slices. No generator rerun or full test suite. #699 comments checked before work; current comments include prior visual reachability/title/cold-pack handoffs, no claim to this narrow map-entry runtime probe.

Run from workspace root:

```
python pc18-default-runtime-2314/prepare.py
python pc18-default-runtime-2314/run-lua.py pc18-default-runtime-2314/probe.lua
```

PASS: Actual `abyss_potion_discard_ui.refreshEntry` executed against generated default map potion-entry controls, three representative identities × all four states, then empty-slot retirement. Fire/strength/flex each remain visible with atlas image **111046**. All 20 default map-slot owners lack `bottleArt`; no dedicated ten-shape recipe is painted. Empty state hides bottle correctly. This establishes runtime-safe fallback but **not distinct PC18 illustrations in formal-default map entry**. The product change should not be called wholly ineffective: identity is passed to the art painter, but this tested profile has no owner pool to receive it.

Boundary: local Lua 5.4 function-level adapter, not full Host/SDK/device, click navigation or inventory mutation. Generated controls are wrapped in minimal recording setters. Real capacity/count function definitions are extracted unchanged from `abyss_run_potions.lua` and only these dependency methods supplied. Initial attempt to load full Run hit its existing compact lexer spelling `floor<=6then` under stock Lua 5.4; no product correction or false Host claim made. Require's Lua 5.4 extra loader return is normalized. No global/native calls, production writes, CI, network build, branch changes, theme/flag changes or new art owners.

Smallest integration follow-up, owned by #699: if approved layout must show these illustrations in default, make default profile explicitly install the intended potion registry and the exact existing per-owner art pools; preserve old fallback and hit/navigation. Do not flip official/V25 globally. Then test map, battle, shop and reward separately with profile-correct generated owners plus cache/retirement/native-failure behavior; today's result covers only map-entry fallback.

`proof.json` records exact module and default tree hashes; `prepare.py` asserts product module equality with #699 Git bytes. Existing tree SHA is 0798f272cba727cf099dd7676b80c0cdf15cd4c4f447904f35e01d44c4c0a7bf. No claim of complete PC18 or release readiness.
