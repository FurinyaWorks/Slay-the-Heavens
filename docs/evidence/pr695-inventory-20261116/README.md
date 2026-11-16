# PR695 inventory repair candidate

Base: 6cdfd8dbe23aa115e45c1c37a5bc7883d0c46c41.

Original integratedPriorInventory(current JS, selection) rejects current selection-map source 9ceb9109 against historical 273f17c8. Repair authenticates the same complete caller raw reader then uses the exact existing settings selection view. Immutable original packets and production are unchanged. A new full before/current helper packet preserves prior identity.

Direct original inventory entry now returns the expected 855 historical JS paths. Independent review: 118 checks PASS (probe and raw output included), covering exact Git predecessor/current, current inventories, legacy idempotence, missing/empty/drift/Buffer/CRLF/warm recovery. Guidance and Backlog PASS.

UNVERIFIED: deck-browse-source-inverse and competition-roster-config-composition consumer runs lost their executor session during environment replacement; empty log is not PASS. No Full, hosted pass, merge or device claim. Do not apply to active PR until consumer runs complete. LFS materialization changes are not part of this candidate.
