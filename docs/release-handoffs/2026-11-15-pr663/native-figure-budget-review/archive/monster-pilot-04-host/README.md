# Batch04 exact-Release Host offline qualification

PASS on exact Release `33d71575c5f186a1b54f7bf3e4f1826c145aa1d9`. No production files changed. This is generated stock builder + real Lua GameUI/Combat/room resolver running in native-control mocks, NOT an official engine/device measurement or release approval.

## Reproduce

From the parent workspace: `node monster-batch-pilot/batch04-host/run-host.mjs`.
Requires the exact Release checkout's existing locked dependencies and materialized assets. No install is performed. Optional paths: `RELEASE_REPO`, `BATCH03_DIR`, `BATCH04_DIR`, `ACID_MEDIUM_LAYOUT`; defaults are relative sibling inputs in this workspace. Input layout hashes are in the report. Only this evidence directory receives generated files.

## Costs and coverage

| Real room branch | Actors | Visible primitive controls | Reserved primitive controls | Actor-template controls |
| --- | ---: | ---: | ---: | ---: |
| Looter | 1 | 113 | 115 | 154 |
| 2 Fungi Beasts | 2 | 228 | 230 | 308 |
| Looter after fungi replacement | 1 | 113 | 115 | 154 |

The standalone source layouts contain 117 and 118 controls respectively (primitive + 4 containers). Those are NOT the actual Host actor-template costs. The generated template includes HUD and container overhead; separate power templates and whole-screen controls are not included in 154. Selected pool remains 115, unchanged from Batch03; untouched catalog capacity remains 600. The smaller pool is an explicit TEST registry, not a production configuration change.

All visible shapes checked against source geometry, rotation, colour modulation and hidden unused slots. Each case has one settling frame then 120 stable frames; no primitive identity or rotation-write churn in those 120 frames. Two fungi have distinct roots/art pools. Real Strike card/hit-target clicks damage only the selected second fungus. HUD/input objects and geometry remain stable. A death retirement render destroys the first actor while preserving the second's root and coordinates. Unmount destroys owned surfaces; remount redraws. Subsequent real Looter room owns a fresh root.

## Diagnostic transparency

Initial fixture incorrectly read children of an already-destroyed root after unmount; corrected to assert destruction (`initial-fixture-lifecycle-error.log`). A separate initial idle assertion sampled immediately before the first update following room replacement and observed one geometry rewrite (1 -> 2), not control replacement. The final test explicitly permits one settling frame and then checks 120 unchanged frames. `initial-replacement-diagnostic.log` preserves the first failed assertion. This qualification does not claim zero transition writes or fix runtime lifecycle behaviour.

No full CI, GUI, official-device run, remote write, commit or merge performed. `git diff --name-only -- scripts data src tests` was empty in the exact Release checkout after execution.
