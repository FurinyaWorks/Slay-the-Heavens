# PR #690 scoped standalone experiment

Input WIP: `a24104cd401f08213771af10289ab3c97de140dd`. This is an isolated diagnostic experiment, **not a production validator change, not current Release integration and not merge-ready**. No original assertion, packet, public reader, CI gate or timeout changed.

## Result

The complete original standalone chain, with the previously reviewed original bootstrap-only validator, completed on a private captured read view: **PASS, 39.709 seconds, 2,223 raw reads and 144,935,469 logical bytes**. Before comparison is the prior bounded run: 437,821 raw reads / 28,780,073,066 logical bytes in 90 seconds, no completed result. This is not a controlled performance claim for production: the diagnostic deliberately uses scoped snapshot semantics rather than public per-read freshness.

The snapshot is captured during complete joint-current authentication. Text and binary values are copied into private buffers. A pure exact-current-to-navigation projector runs on that captured data; non-UTF8 bytes remain raw. The existing historical validators are unchanged and still execute their checks. Complete joint-current authentication runs again against raw input after the standalone function. Unknown paths fall through to raw input. No shared cache survives the process.

Initial experiment omitted the lossless UTF8 check and exposed the binary archive mapping failure (retained `probe-initial-binary-red.log`). That was an experiment bug, not a new product bug; corrected probe preserves the public reader's lossless binary check.

## Boundaries

- Existing public `jointRead` / source-epoch freshness behavior is unchanged. No live consumer uses this diagnostic.
- Before/after raw validation does **not** establish equivalence to reading a mutable injected reader on every historical sub-read. A transient mutation that is restored inside the scope can have different observation semantics. A production optimization needs an explicit scoped contract and appropriate independent review; this evidence alone does not authorize it.
- Not a full source suite, Fast CI, Hosted Full, official GIL/client, capacity or device validation.
- WIP baseline remains before latest Release af77. Original PR HEAD remains unchanged. No new PR, dispatch or merge.
- Two LFS files were locally hydrated only after exact SHA256 matches to their committed pointers; hydrated working-tree files are not included in this evidence commit.
- Backlog CLI unavailable in this environment; no status or task file manually changed.

## Reproduce

From the repository root with original LFS objects materialized:

```
node docs/evidence/pr690-scoped-probe-20261117/scoped-probe.mjs
```

The probe contains a 90-second raw-read diagnostic limit; the observed run also used an external 100-second process limit. The original bootstrap source is kept alongside solely to reproduce the previously established epoch separation, with its immutable packet hash unchanged.
