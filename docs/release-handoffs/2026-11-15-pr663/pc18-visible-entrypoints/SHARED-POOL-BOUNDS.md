# PC18 shared map-potion pool geometry

**Verdict:** 5 × 11 nodes is structurally possible as five noninteractive siblings of `open/hit`, saving 165 nodes versus four state copies (55 instead of 220). It is **not a drop-in semantics-preserving replacement**. Exact default caller currently hides all physical slots; adding visible siblings would introduce visuals the default never shows. Parent is independently verifying full Host gating.

Source: existing exact formal-default generated tree on Release1cc + clean #695/696/697/699 slices; SHA0798f272cba727cf099dd7676b80c0cdf15cd4c4f447904f35e01d44c4c0a7bf. No generator/full/SDK rerun. `python pc18-shared-pool-geometry/probe.py` passes structural assertions; optional `prototype-entry.json` is an inert, hidden scratch prototype, not production or recommended published layout. Removing the five new nodes restores the entire original entry; hit and all descendants remain byte-structure equal.

## Geometry
- `potionEntry/open`: (332,316),160×48; original hit160×48.
- All four faces share authored slot positions: approximately −82.666,−41.333,0,41.333,82.666; bottle16×16.
- Normal/hover/disabled scales1; **pressed scale0.96**. A sibling outside all four faces does not inherit pressed transform. At authored outer slot, center drift is3.30664px; bottle should shrink16→15.36px. Merely scaling the pool around its own center does not fix center drift.
- Conditional existing `mapSlots=true` writer repositions slots with42px step, centered by capacity. Capacity3: −42,0,42; capacity5: −84,−42,0,42,84. Pressed outer shift is1.68px or3.36px. Shared writer must use runtime capacity, not frozen generated coordinates.
- If matching pressed appearance is required, authoritative active button state must drive both sibling position and scale. No supported native active-state observation mechanism was established here. Do not infer state from authored visibility or introduce extra input handlers.

## Semantics requiring explicit ownership
- Existing Art.paint resolves `icon.parent:GetChild(icon.name..'Art')`. Shared sibling is outside that parent, so current writer cannot locate it. An explicit shared-owner API/writer is necessary, not a name-only move.
- On successful art paint, all four fallback bottles must be suppressed coherently; on failure, restore correct per-state fallbacks. Otherwise an active face can show both old atlas and shared image.
- Existing per-face `slot:SetVisible(mapSlots==true and i<=capacity)` no longer hides a sibling. Shared writer must own mapSlots, capacity, empty inventory, entry hide/show, return transitions and failure/cache retirement without changing hit/child-state semantics.
- Native button state switching must not touch sibling visibility; ordering after hit would overlay decoration. `raycastTarget:false` on all55 proposed nodes avoids requesting input, but native pass-through/render ordering remains unverified.

## Clipping/native unknowns
No explicit clip/mask properties were present on generated entry/ancestor/button/face nodes examined. This is absence of source declarations, **not proof that native engine never clips**. At authored positions, bottle outer bound≈90.666 exceeds hit half-width80. Conditional five-slot writer expands hit to210, but `open` container remains160 wide. Moving to `open` siblings changes inherited face/container chain and therefore any undocumented clipping behavior. Cannot assert equivalent clipping, opacity, disabled tint, z-order, focus animation or platform batching without native contract/device evidence. Retain geometrically bounded recipes and do not add unverified clipping APIs.

Recommendation: default count/management entry can remain unchanged. If physical illustrations are deliberately added, treat shared55-node variant as a separate explicit visual composition with authoritative state/visibility ownership and native checks; do not claim the165-node saving proves drop-in correctness.
