# Release intake identity verification (2026-11-15 04:14 run)

## Delivered
A read-only offline intake aid, `intake.mjs`, with 14/14 passing synthetic mutation checks (`tests.log`). No production code changed, no GitHub write, no Full run, no GIL construction or toolchain/device use.

## Why this is useful
Reviewed the exact d378 source shadow in `release-0400/ci/rehearsal`:
- `scripts/platform-load.mjs:101-165` checks canonical receipt vs official evidence identity; CLI also hashes the real candidate, checks art and current payload. It does not inspect stable export alias.
- `scripts/export-playtest.mjs:13-49` consumes the final audio receipt's top-level `sha256`, validates bytes, and emits a stable alias receipt with a warning that this is copy integrity only.
- `scripts/build-native-audio-game.mjs:62-81` binds final audio hash to nested `candidate.sha256`, preserves full build identity, records the source receipt, and carries frozen release provenance.
- `scripts/verify-ui-acceptance.mjs:101-113` requires startup evidence for the candidate hash/build; it then re-parses actual runtime evidence with the toolchain. Pre-audio startup evidence must not be presented as acceptance of different final audio bytes.

The gap is operator intake across those formats, not a proposed new mandatory release gate. The aid binds explicitly supplied final GIL bytes to both receipt hash formats, frozen source, startup top-level/expected identity, official record identity, and stable alias bytes/metadata. It reads only explicitly supplied files, never follows receipt-provided paths, writes nothing and rejects missing inputs.

## Run on the FINAL frozen candidate
```
node /path/to/intake.mjs \
  <full-frozen-source-sha> \
  <final.gil> <canonical-candidate.json> <startup-evidence.json> \
  <official-evidence.json> <playtest/latest.gil> <playtest/latest.json>
```
Do NOT pin d378 forever: if the approved source-only fix or version bump lands, use the actual final frozen SHA and rebuild/collect acceptance against that identity. Supply final audio canonical receipt when final audio GIL is what ships; do not substitute the earlier full/base receipt.

## Evidence and limits
Synthetic matrix includes coherent data, frozen SHA mismatch, mutated final bytes, base/full receipt in place of final audio, wrong top-level audio hash, stale startup and expected build, old official source, wrong official payload, stale alias bytes/metadata/length, dirty source, and absent release provenance. All 14 cases passed their assertions.
Success is deliberately `IDENTITY_MATCH_ONLY`, NEVER `PASS` or release approval. Coherent forged records could still match. Repository runtime, raw evidence hashes, image decoding, payload/art, official capacity, mobile/UI acceptance, independent review and CI remain required. This does not claim a final candidate exists or that release gates passed.

No new production candidate or actual official evidence was available to this assignment. This aid is maintained on the separate handoff branch; it is not a proposed merge to the release branch.
