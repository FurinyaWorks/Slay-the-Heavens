# PC01 default-profile title gap: local test-only prototype

Latest remote readback: Release remains `1cc5479b713edab6fd26db4e20f8eb22b7401cb2`; #699 remains `73da2626d37fb52f90e71cd65838c08a1b9cae7c`. Open PR search found no separate default-title supplement. #699's declared menu source still has its titleMark behind V25/official composition. Ownership stays with #699; no claim or branch edit performed.

## Reproduction and bounded prototype
`probe.mjs` reuses previously generated exact product-combination default game-ui.json, avoiding another generator run. It explicitly reproduces the missing intended title (expected RED), then makes a local **in-memory test-only** insertion of #699's exact `titleMark` output. A source adapter exports the existing title function without changing its body or asset. Its output deep-equals the official-profile title subtree.

- Intended title subtree hash: `3f359c36e65df5916983cac1a4e5bc3c814ce63f3390fcd4a98f9e857e958ec0`.
- Source file hash: `00c8902e05fc6c7e475d06fb344483d86632479b231353c4593a4b471f6de6f3`.
- Title asset hash: `e1b8e8b19b881465f80d9ae7d96f4e857ff2d5f70f5835788d5ff15252f77698`.
- Subtree contains **397 images + 19 containers = 416 nodes**. No cursor/button/command nodes. This is not a cost-free title or an approved platform-budget result.
- Inserted immediately before existing start control, without replacing existing start/continue/quit/settle/result/hits or command routing.
- Removing the injected subtree restores the entire original tree byte-equivalent in JSON structure; every original node remains deep-equal.
- A local pure mode-helper assertion exercises menu → defeat → victory → menu visibility policy. This is **not executed Lua lifecycle proof** and is explicitly marked as such in proof.json.

## Smallest implementation plan for the current owner
1. Extract the current `titleMark` and its polygon helper into a small shared static-decoration producer. Preserve exact title asset/geometry; keep existing V25/official call output identical. Do not invoke `applyV25MenuLayout` for default, since that replaces button visuals/positions and imports scenery/profile assumptions.
2. Explicitly compose only this decoration into the selected default menu; keep all command/hit/navigation nodes and background ownership unchanged. Do not enable official-assets/lifecycle experimental flags or copy the whole experimental menu.
3. In the existing `abyss_game_ui_menu_view` lifecycle, only when the shared title node exists in the default profile, show it in title-menu mode and hide it for victory/defeat. Preserve original outcome title and settlement/navigation behavior. Avoid `v25MainMenu` as an accidental capability signal; the current V25 adapter returns early for default.
4. Add real native-Host tests for repeated menu → game → return and menu → defeat/victory → return, with Continue both present/absent and exit confirmation cancel; verify the original title is hidden only while the static mark is active. Add no extra commands or pointer interception. Then verify actual viewport geometry, layering, and native PC/mobile rendering before claiming visual completion.
5. Keep PC01 button styling separate: this title-only prototype does not prove all PC01 concerns solved. Existing default button styling is intentionally not changed.

## Outcome
A safe *structural* title-only insertion is feasible without changing existing menu controls, but production lifecycle code, geometry/readability, added-node cost and device acceptance still require work by the current owner. No production implementation, pixel rendering, native SDK, Full CI, remote update, user machine or Codex quota used. Do not publish this adapter as production code or mark PC01 done.

Evidence: `probe.mjs`, `probe.log`, `proof.json`; run `node default-menu-pc01-2214/probe.mjs` from the shared workspace. `title-export-adapter.mjs` is generated local test scaffolding and not a deployable file.
