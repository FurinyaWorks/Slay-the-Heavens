# #696 current consumer verification

Initial pre-repair tracked source tree: `6982b0f43d9a79453f356d760d1694bcc24709dd`, remote preparation `3023460eaf5d0bfc0dad76f6727bad852afc50db`; local equivalent `0268adadb52e46beae774efd9012c048fefb2012`. Live Release ref independently read as `af77fb2461c548f0faf104761d107397f75dca08`; original PR remains `e9866fec`, no new owner identified in latest discussion. Two existing LFS gzip archives were hydrated from existing validated bytes, not changed or included in this delivery. Initial copy/inventory/full calibration used this tree; final named/control runs use the bounded repair described below, with unchanged original assertions.

## Completed original tests

- `node --test --test-name-pattern='integration copy closure' tests/integrated-ci-source.cases.mjs`: 1/1 PASS, 0fail/0cancel/0skip, 4.735 seconds total. Full original predecessor/current dependency copy assertions retained.
- `node --test --test-name-pattern='release additions remain in raw Full' tests/sts-style-source-epoch.test.mjs`: 1/1 PASS, 0fail/0cancel/0skip, 336.052 seconds total. All original complete historical inventories and missing/drift injections retained.

These are local targeted tests, not Hosted CI or Full admission. Wall-clock samples overlapped the independent calibration process and are not stable performance ratios.

## Calibration diagnosis and bounded repair

Complete original calibration ran once: **76 tests, 50 pass / 26 fail, 0 cancelled / skipped, 935.470 seconds**, retained in `calibration.log`. Twenty-five failures authenticated a projected licenses.yml reader as raw current; one supplied picker-before-capacity audio bytes to the newer capacity bootstrap validator.

Minimal repair preserves the original raw caller inside integratedRead for both text and binary authorization while historical projection still uses preflightPriorRead. Calibration's old bootstrap contract now explicitly authenticates the complete current joint before calling its existing immutable picker-before-capacity assertion. No old hashes, archives, assertions, budgets, source domains or coverage were relaxed. The current 51-leaf packet was deterministically regenerated: only two current hashes changed; all parent sources remain identical. Its current packet hash was updated, not an old historical pin.

Verification on final source:
- Original named V25 inventory and Release bootstrap calibration tests: **2/2 PASS, 161.9995 seconds**, zero failures/cancellations/skips.
- Healthy text and actual menu binary view, same-reader raw licenses.yml mutation rejection, and restoration: **6 checks PASS**. Original harness selected a nonexistent StS binary view and failed before controls; that failure is retained.
- Deterministic 51-leaf regeneration PASS, packet SHA256 `ff8eb5a358444ad440c5680da967545250ad9ab37cb500b313cb4a3e547cc3b6`.
- Intermediate stale-current-packet-pin failures are retained separately, followed by corrected-pin actual passes.

Earlier copy and inventory passes above belong to source before this minimal repair and are not misrepresented as post-fix suite results. The other 24 calibration failures share the repaired raw-reader stack but have not been rerun; full calibration is **not green**. Broader combinations, current Hosted admission and official/device validation remain pending. No Full dispatch, original PR promotion or merge. No test process remains running.

## Independent review

`/root/continue696/review_consumers` reviewed both fixes and all51 parent leaves: source review PASS, only two current binding changes and no old pin changes. Earlier copy/inventory evidence and both hydrated LFS identities were independently verified. Final result evidence review PASS after correcting the opening to distinguish initial and repaired source trees; all 10 evidence hashes and result totals independently checked.
