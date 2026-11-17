# Independent diagnostic evidence review

Reviewer: `/root/release1915/review_scoped`

Conclusion: PASS for preserving this **diagnostic experiment only**, not approval to wire the snapshot into public validators, integrate Release, or merge #690.

- Compared `bootstrap-original.mjs` with `git show cd9106c0:tests/helpers/release-bootstrap-ci-source.mjs`: exact whole-file equality after the one relative packet URL adjustment.
- The original standalone sequence retains merge, bootstrap, navigation, complete integrated source, and copy-owner assertions.
- The scoped experiment authenticates current inputs before capture consumption and authenticates raw inputs again before printing PASS. The snapshot uses copied bytes; reads return copied buffers.
- Initial binary failure remains in `probe-initial-binary-red.log`. The final guard preserves non-round-trippable UTF-8 buffers, matching the necessary raw binary distinction.
- Read the actual final log: standalone diagnostic PASS, 2,223 raw reads, 144,935,469 logical bytes, 39.709 seconds. This review did not repeat the 39-second probe or a Full suite.
- Independently ran fresh source drift, archive drift, missing input, and CRCRLF negative controls against `assertCurrent` after a valid baseline: all four rejected. Independently checked Buffer capture/output-copy isolation: PASS. These are boundary checks, not a full snapshot semantics test suite.

## Explicit limitation

The snapshot is **not equivalent to repeatedly reading a mutable/adversarial raw reader**. Transient drift during the callback that is restored before the final check can be invisible to the snapshot; unknown paths still fall through to raw reads. No cross-call warm-reader, arbitrary encoding, or mid-invocation mutation equivalence claim is approved. No production/public validator, old archive, gate, or PR HEAD should change on the strength of this experiment alone.
