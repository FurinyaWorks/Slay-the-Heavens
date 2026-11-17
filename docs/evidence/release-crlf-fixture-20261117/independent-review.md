# Independent review: Release CI CRLF test fixtures

Reviewer: /root/windows_677_fix/review_crlf
Result: PASS, no blocking findings.

Reviewed exact modified files:
- #677 parent baec0d6970ecaf0c1cda33320a3d15da6dfb9b61; tests/helpers/release-ci.cases.mjs SHA256 dfb29e2598ddf311f8f2336b9b7ef8269a1af0a97a9e1a94e1e7b8f4e066a393.
- #707 parent 86670bcfc6565153595abf2e0476bf70750fdc19; same path SHA256 53dca4579633a4dde7cdd797fadeaf859df5d9ece64754d98734665a2009eb9d.

Only fixture construction changes: retain the unmodified checkout input, derive explicit LF and CRLF fixtures from canonical LF, and construct exact CRCRLF negative fixture independently of checkout style. Historical pins, production projection helpers, workflow, gates, and assertions are untouched. Wrong before.sha256, drift, foreign path, non-string/Buffer and Buffer-identity controls remain.

Independent reproduction confirms original #677 first CRLF iteration maps to 5c3cc95c…; second iteration generates CRCRLF and is correctly rejected, reproducing hosted actual e2ff52917ec7d67c5b5843c2471afce7d5e5ad53aee64fcf159ad07bb668c561 exactly.

Executed both actual changed test callbacks with a scoped Node preload returning CRLF bytes for affected checkout inputs, including Buffer reads. #677 1/1 PASS; #707 1/1 PASS. Both execute original positive and negative assertions. Node v24.22.1 on Linux; this is a byte-level CRLF checkout simulation, not an actual Windows hosted run, and not Full CI. No production files were mutated by the preload.
