# Clean-parent repair replay, 2026-11-16 21:15 UTC round

Independent replay of archived repair f569af1950f5265d98212e67bae6a6b7f1a6b9f6 in a newly created worktree. Exact #707 86670bcfc6565153595abf2e0476bf70750fdc19 and #709 f8acc21780b90712bffba383101e34fea3471bf8 remain open; no queued PR HEAD changed.

Followed REPAIR.md: merge exact #709 into #707, replace only the two conflicted files and add the combination packet from the remote archived repair. All four recorded SHA256 identities match. No source edits beyond the archived repair were required.

Input preparation: inherited sparse checkout initially omitted .github files, and two original LFS archives were pointers. Restored omitted index files without changing bytes, and verified both archive payloads against original LFS SHA256 before materializing. Initial missing-input failures are environment failures, not product regressions; no assertions changed. Never stage materialized LFS files as normal blobs.

Command: `node --test tests/release-selection-map-source.test.mjs tests/ci-impact.test.mjs tests/integration-source-closure.test.mjs`

Result: 22/22 PASS, 0 skip. This independently confirms the saved three-file repair is sufficient with complete inputs; it is not a hosted Full result or proof on a later merge base. Existing 25/25 and 65 controls are separate earlier rounds, not added to this count.

```
✔ Release integration uses complete affected Fast without weakening develop or explicit Full (7.505591ms)
✔ only exact frozen Release HEAD with complete latest Full permits publication (15.559277ms)
✔ candidate verification rejects branch movement and a newer attempt during reads (4.510085ms)
✔ publication requires immutable actual checkout, never green metadata alone (5.131667ms)
✔ publication gate is in required impact and never removes foreign partial wiring (0.664987ms)
✔ Release history accepts only the complete reviewed gate and push removal together (2.937911ms)
✔ Release CI repair maps only complete reviewed helper and test bytes, retaining drift and foreign inputs (1.270045ms)
✔ complete mapped set is eligible; unknown, deleted, core and release changes require full (0.847558ms)
✔ prose allowlist cannot hide additional unmodelled changes (0.258564ms)
✔ admission control changes require Full even with proven tiny affected tests (0.39749ms)
✔ registered UI responsibilities share eligibility with their parent; unknown modules stay full (0.516177ms)
✔ parallel platform costs are advisory and never expand the complete affected set (1.868533ms)
✔ actual required gate commands reject every missing, failed, cancelled or skipped selected execution (165.692733ms)
✔ actual impact CLI routes Full Fast unknown and merge-group through the complete current matrices (676.818624ms)
✔ actual merged Release authenticates every unchanged Lua and architecture predecessor without advancing the product epoch (29.779214ms)
✔ release selection map production preserves every complete prior target and freshly authenticates the committed source tree (9.62035ms)
✔ release selection map CI validates complete live bindings while unknown or changed bytes stay visible (65.346962ms)
✔ release selection map raw JS and Lua inventories reject missing duplicate foreign and changed additions (61.508219ms)
✔ release selection map raw workflow checks each real execution deadline and trusted local route (2.74141ms)
✔ release selection map production requires fresh complete owners and leaves foreign bytes visible (800.040468ms)
✔ release selection map isolated production copy includes exact helper and packet without CI trust leaf (746.34411ms)
✔ Release freeze CI continuation authenticates fresh owners before historical projection (614.46124ms)
ℹ tests 22
ℹ suites 0
ℹ pass 22
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3840.562107

```
