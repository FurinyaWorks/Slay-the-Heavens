# #696 current consumer verification

Exact tested tracked source tree: `6982b0f43d9a79453f356d760d1694bcc24709dd`, remote preparation `3023460eaf5d0bfc0dad76f6727bad852afc50db`; local equivalent `0268adadb52e46beae774efd9012c048fefb2012`. Live Release ref independently read as `af77fb2461c548f0faf104761d107397f75dca08`; original PR remains `e9866fec`, no new owner identified in latest discussion. Two existing LFS gzip archives were hydrated from existing validated bytes, not changed or included in this delivery. No source or assertions changed.

## Completed original tests

- `node --test --test-name-pattern='integration copy closure' tests/integrated-ci-source.cases.mjs`: 1/1 PASS, 0fail/0cancel/0skip, 4.735 seconds total. Full original predecessor/current dependency copy assertions retained.
- `node --test --test-name-pattern='release additions remain in raw Full' tests/sts-style-source-epoch.test.mjs`: 1/1 PASS, 0fail/0cancel/0skip, 336.052 seconds total. All original complete historical inventories and missing/drift injections retained.

These are local targeted tests, not Hosted CI or Full admission. Wall-clock samples overlapped the independent calibration process and are not stable performance ratios.

## Pending

`node --test tests/ci-complete-calibration.test.mjs` was started at approximately 17:15 UTC on 2026-11-17 and remained running at 17:26 UTC, with no final totals. Its empty in-progress log is not committed as evidence. No restart or duplicate run was launched. Complete calibration, broader combination and Hosted admission remain unverified; original PR was not promoted or merged.

## Independent review

Read-only reviewer `/root/continue696/review_consumers` regenerated the exact 51-leaf parent packet and verified picker calibration f11fa80a versus Release4d663e5f domains. No domain defect identified; no blanket reader substitution made. Final independent evidence review PASS: original totals, tracked tree, all three manifest hashes and both committed LFS SHA256/size identities verified. Approval is limited to this evidence delivery.
