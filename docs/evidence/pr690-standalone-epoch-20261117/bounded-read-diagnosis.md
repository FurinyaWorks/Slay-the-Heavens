# PR #690 bounded standalone authentication diagnosis

Input: unchanged WIP efe286c07f8d28d6888379409278ebcfdea7c39f (tree 76e0d501d4026484fb4118b2d0d22ee50e781b80). This WIP is not based on latest Release af77fb24; prior merge trial was aborted. No integration or merge-ready claim.

## Actual execution

Restored the original standalone probe with the already reviewed original bootstrap-only validator. Only instrumented the raw reader to count calls/bytes and stop after 90 seconds. No authentication memoization, assertion deletion, altered hashes, or increased product/test budgets. Two initial setup attempts stopped immediately for sparse .github files; then materialized exact committed .github content. Two LFS archives were hydrated from existing local copies after SHA256 verification against their pointers.

The prepared attempt stopped at the diagnostic limit: **437,821 raw reads, 28,780,073,066 bytes read (logical application bytes, not physical disk I/O), 90 seconds**. The stack remained in the first assertReleaseMergeCurrent stage, through navigationFixtureBefore/menuReaderBefore → jointRead/project → assertCurrent. This is an incomplete diagnostic, not a test failure due to an original timeout and not a passing standalone result.

Current joint packet has **984 source paths and 126 archives**. Navigation view matches current for 946 paths and differs for 38. Each recognized projection currently authenticates the entire joint packet again; the nested fixture readers amplify repeated fresh validation. This explains why the prior probe appeared hung; it does not establish the only performance cause.

## Safety / next boundary

No cache or unchanged-view bypass was applied: skipping full validation on unchanged views would change the existing rejection of unrelated linked drift. A correct optimization needs an explicit authentication-scope design and warm-linked-drift/foreign/type controls, not silently trust one successful read. The current bootstrap and historical bootstrap must remain distinct as recorded in the preceding evidence.

No source files, old archives, original PR HEAD, CI workflow, budgets, required gates or branch protections were changed. No Full dispatched. All probe processes exited. Original standalone chain and current Release integration remain incomplete. This report and the terminal log preserve the exact new diagnostic evidence; they are not a new approval or release candidate.
