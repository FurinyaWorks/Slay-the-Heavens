# Release v2.0.0: PC and current mobile slices, scoped reconciliation

This is an isolated software rehearsal, **not** a merge, source authorization, Hosted result, frozen release candidate or device pass. No branch protections, workflows, archives, version, tags or official game state were modified.

Release base `36b9b157ee6f05b65eb9f1da7e2978647d36c210`. Exact input order:

| PR | Head |
| --- | --- |
| 684 | `d396abb252b4dcfe4d825dccc6c850daf81086c9` |
| 678 | `0c0f8586c2a42d62be6caf8e8053344161346c39` |
| 679 | `551677b7966437e07a95fc3b08ef8747d48a1a10` |
| 680 | `d9cc12bfc0e620847afa10c7e5c515d748b8ccc3` |
| 685 | `c20c4148cfdf39492d99973943674db091c29941` |
| 686 | `dcb2cf15c8f282fafe1711b4dc2e6ef0c8c90e88` |
| 687 | `f448a9df48054f49af792312cd866c03b53b0197` |

Fixed-base Git rehearsal produced `1d3b3fd401d90913343f4fc972669f39a225ca13`. #686 and #687 changed the TASK-30 and TASK-4.4 records respectively; in the **test-only tree** both conflicted task files were held at the pre-slice side. Integrators must retain both records through the normal backlog workflow. The contact path shared by #684/#679/#686 auto-merges. #685 theme auto-merges. #684 and #687 conflict in two hunks of the actor renderer; [trial reconciliation](pr684-687-actor-reconciliation.patch) keeps the PC sleep label, the mobile compound badge and the original visibility rules. That patch is relative to the old #684 actor blob alone and does not replace the other #687 changes.

Freshly generated data, UI and map plus **27/27** tests across deck layout, popup layout and payload, sleep label, composite intent, sparse card movement, and anonymous target/potion input. [Host transition probe](actor-intent-transition-probe.lua) also passed sleep → composite → hidden → composite → sleep in the enemy1 presentation slot. Exact PC-only actor replacement fails the composite case; exact mobile-only actor replacement fails the sleep case. The conflict resolution had separate read-only review. No official device verification.

On **exact #684 alone**, independent of the rehearsal tree:
- [Full-quality historical inverse](pr684-full-quality-history.patch), old case fails, patched file 18/18 passes; canonical predecessor contributes a separate 1/1 check. Raw workflow admission checks unchanged.
- [Session-menu historical checks](pr684-session-menu-history.patch), four named source checks 2/4 → 4/4. A byte substitution in a live linked owner still fails closed. The two tests are present in the earlier integrated CI source binding: the eventual final source must extend the outer authenticated binding, not overwrite any archive. Neither patch is part of the rehearsal tree above or applied to the PR.

Original Hosted run: [43723889389](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/43723889389). Hold Full until configuration and final source are frozen; no retry was triggered here.
