# #696 bootstrap consumer domain repair

Base source: preparation `96727e37b680ed5a4a12c73eb1bf597bcfd9a41a` / local equivalent `938bad216b40f3c92169546fd52c09fdb7440f5a`, tree `4266d04e8d60f798bf709877c6c5a99ca24bd66b`. Actual Release ref was `af77fb2461c548f0faf104761d107397f75dca08`; original PR remains `e9866fec`. Latest discussion showed no competing owner. No Full dispatch or original PR promotion.

## Interrupted selection run

`selection.json` retains the exact 24 prior failing calibration cases excluding the two already retested in the preceding report. The process was interrupted before any visible result: retained `remaining24.log` is empty, execution metadata was never produced, and on resumption session83258 no longer existed. No pass, fail total, elapsed time or coverage is claimed for this attempt. The 24-case batch was not blindly restarted. Prior complete calibration failure and two named passes remain in `../pr696-consumers-20261117`.

## Reproduced independent consumer failure

Independent review identified the third original integrated consumer using the newer capacity bootstrap validator on historical picker-before-capacity input. Original named execution genuinely fails: `scripts/build-native-audio-game.mjs` actual hash `41042f4c…` versus expected `38e7b36c…`. See `bootstrap-before.log` and `.exit`.

Minimal correction keeps current bootstrap reader/raw-inventory imports, uses the existing immutable picker-before-capacity packet/source/workflow/assert functions for this historical contract, and adds complete current raw joint authorization first. Every original old-byte, foreign, missing, drift, archive, inventory and broken-packet assertion remains unchanged. No old packet, parent source, expected hash, budget or production code changes. Only the consumer current binding in the 51-leaf continuation and its current packet digest are refreshed.

## Independent source review

`/root/continue696_1815/review696_evidence` PASS: all original assertions retained, correct raw/current versus historical domains, 51 leaves and exact parents unchanged, only cases currentSha256 updated to `a443db53…`, packet digest `8acaa764583a64585fb62803e89aaa64963101df9f9457b6bed6eb8eb489cfe7`, clean source diff check (raw failure log retains its original whitespace). Both hydrated gzip files match original LFS OIDs and sizes and are excluded from this change.

## Verification scope

Final named execution and raw-reader controls are recorded below. Broader current-source integrated consumers, remaining calibration cases, required Hosted admission and official/device checks remain pending; this preparation is not merge-ready.

Final unchanged original bootstrap consumer: **1/1 PASS, 0 fail / cancelled / skipped**, 429.083 seconds total (426.207 seconds case). See `bootstrap-after.log` and `.exit`. It completed before publication; no remaining process. The original contract verifies 92 immutable archives across 10 owner rows, including every original negative assertion. This is one named original case, not the complete integrated file or Full CI.

Final-source same-reader raw mutation/recovery controls: **6/6 PASS**, healthy/mutated/restored string and Buffer paths, exit0. See `raw-controls.log`. Source syntax check PASS. Independent source review PASS; final result totals and all 9 evidence hashes independently reviewed PASS by the same reviewer.
