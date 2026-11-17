# PR690 POSIX5 historical reader repair

Input PR head cd9106c0e302cb50f83ba8b5c85ce81560c6ed88; builds on prepared Windows LF fix 8ba4cee520fcb1606a50697b241c964518d53baa. No new owner implementation in PR timeline at start.

The original inventory consumer sent current production input eb4ef062… to the historical navigation validator expecting b2394cff…. Current raw complete-domain authentication remains first; then the original historical merge reader consumes the authenticated navigation production view. The wrapped current-domain merge reader must not be applied to an already historical fixture view; first experimental red is retained separately.

Exact before/current continuation binds only the changed consumer. No historical hash/archive, original inventory/cost/sharding/timeout assertion, production, workflow, or test count inventory removed or changed. Both raw-byte JSON packets have explicit LF attributes. Locally materialized LFS archives are excluded from commit.

Linux Node24.22.1 targeted original failure and warm/missing/drift/CRLF/Buffer regressions 2/2 PASS (26.66s); original two source contract files 16/16 PASS (14.31s). Independent review 18 checks PASS, exact final hashes in report. Guidance and diff checks passed. Backlog CLI unavailable and checkout lacks materialized backlog/tasks; no Backlog mutation made. No Full dispatch or hosted/official-device success claimed.

Commands:
- node --test --test-name-pattern='release navigation raw Full inventory|release navigation inventory reader rejects' tests/ci-complete-calibration.test.mjs
- node --test tests/release-navigation-map-integration.test.mjs tests/release-navigation-source.test.mjs

Original PR still has Release merge conflicts; final Release integration must preserve this tested consumer and revalidate the actual combined candidate. No release merge or publication permission is asserted by this preparation.
