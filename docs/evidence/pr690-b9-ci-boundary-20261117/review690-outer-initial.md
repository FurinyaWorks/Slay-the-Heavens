# Independent review: staged #690 dual-joint CI boundary

Reviewer: /root/windows_677_fix/review_crlf
Verdict: CHANGES REQUIRED for complete-domain authorization. Preparatory only; consumers are not integrated.
Runtime SHA256: 30e278ff8b4f7479bcdc2576e454a80ea6afd3af9d4379ffc38b98d5b1818300
Packet SHA256: d061f751b661c2e6513914a44edb47e6d528bf9084f7caadd7c6cf307f6fed67

Good properties: exact packet pin and immutable source atoms; explicit two Git input SHAs; CI-only projector refuses production files; projection requires exact declared current input; unknown/drift/CRCRLF inputs return untouched; known projection revalidates declared raw current sources and archives every call; Buffer conversion preserves non-UTF8 raw input. Independent Git existence checks confirm all 19 null historical views are genuinely absent, rather than existing files misclassified as absent.

Blocking closure omission:
The 405 source / 104 archive set is the union of old packet domains plus selected additions, not the actual imported trust closure. At minimum it omits:
- tests/helpers/release-pc22-basic-feedback-source.json.gz
- tests/helpers/release-card-contact-integration.mjs
- tests/helpers/release-card-contact-integration.json

Independent missing-reader injections for each of these three paths still allow ciSource to return the PC22 historical calibration source, with zero reads of the missing path. Thus the claimed full fresh dual-joint authorization is not established. The direct trust dependency scan also reports missing combined-epoch/source-epoch-runtime.mjs, sts-style-source-epoch-runtime.mjs, sts-style-source-proof.mjs, sts-feedback-source-runtime.mjs, sts-feedback-production.mjs, menu-red-source-epoch.mjs, release-source-epoch.mjs, and session-menu-source-epoch.mjs.

Required correction: derive and validate the actual reachable helper/packet dependency closure for both joint domains and product producer authorization, including the two joint helper roots themselves. Preserve side-specific historical identity and raw production/CI separation. Add fresh missing/tamper tests for each newly included owner category, rather than testing only one already declared archive. Do not recast this as permission to insert CI trust leaves into isolated production copies.

Additional limits: no raw discovery inventory adapter or consumer wiring is present in this stage; changed helper-copy closure and the original nine conflict consumers remain unfinished. The 876-check existing log validates the declared domain, not domain completeness. No Full or hosted run performed by this review.
