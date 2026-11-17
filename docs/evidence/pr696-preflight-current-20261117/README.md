# #696 picker / preflight exact-parent continuation

Preparation only. Original #696 head remains `e9866fece8a01ed5fd5dc5530d8b4d9da4bbc9bc`; no original PR update, Full dispatch, merge, or release approval.

## Source change

- Continue remote preparation `cdf0c3a68b90d056f253d5be3b85bdcff84c1d41` on actual Release `af77fb2461c548f0faf104761d107397f75dca08`.
- Add 51 exact changed-leaf bindings with complete picker `af3ddb2eef8969959454c432cb2743288917a086` and Release `af77fb24` parent sources. No historical hash or archive changed. `rebuild-packet.py` derives these from committed parents and current source.
- Freshly authenticate the raw caller, new packet, implementation root, both parent chains and their original archives before returning a historical view. No cache, no broad hash acceptance, no budget change.
- Keep old #703 capacity-current reader distinct from new #707 preflight-current reader. New public CI reader leaves production paths untouched; explicit private parent validation retains both production identities. Buffer fast-return recognizes all mapped leaves and still avoids decoding opaque unmapped archives.
- Relocate the unchanged `assertCapacityPreflightCurrent` invocation into the joint validator's exact Release parent view after raw authentication; `assertIntegratedCurrent` delegates to this complete chain instead of first asserting the wrong raw parent domain.

## Verification

- Original first named selection consumer initially passed 1/1 in 60.773 s before final review corrections, recorded in `first-consumer.log`. Do not treat this as the final source result.
- Final stable negative controls: 122/122 PASS. Both-parent health, exact string/Buffer parent view, same-reader changed/missing source, implementation, packet, preflight archive and production owner, restoration, old/current domain separation, public production opacity, foreign values and added Buffer/string equivalence, every one of the 51 mapped leaves changed/missing, and final full-boundary restoration.
- Initial probe wrongly expected a mutated target to throw rather than remain visibly raw. Corrected control asserts raw preservation plus full validator rejection; original failure retained.
- An intermediate controls run overlapped a local source edit and failed on the changed integrated helper. Retained as `interrupted-by-local-edit-controls.log`; stable rerun passes all 122.
- Initial second consumer failed on a duplicate raw-domain preflight assertion; failure retained in `initial-compose-failure.log`, corrected by the relocation above.
- Intermediate two-consumer run: first passed, second exposed missing Fast-updated `scripts/test-affected.mjs` binding. Retained as `intermediate-consumers.log`; packet expanded by four exact integrated-proof text leaves (47 to 51). Fixed integrated validator now passes; deterministic read-only packet regeneration matches all 51 rows.
- Final original two named consumers: 2/2 PASS, 0fail/0cancel/0skip, 137.608 s total (first 58.104 s; compose 77.921 s), `final-consumers.log`. This is not complete suite or Hosted admission.

Independent review `/root/integrate1615/review_boundary` checked all 51 parent and current bindings and three edited JavaScript files. It identified the production-opacity, Buffer-membership and implementation-freshness corrections above; final source review PASS. This is not blanket PR readiness.

Remaining: broader calibration/consumer combination, copy/inventory paths, current combined performance and required hosted admission. Official import, ready and device checks are separate and unverified. No complete Full or unchanged large matrix was launched.
