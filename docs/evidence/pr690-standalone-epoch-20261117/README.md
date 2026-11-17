# Navigation standalone validator epoch correction

Inspected WIP 4eb9e6a2 and latest Release af77fb2461c548f0faf104761d107397f75dca08. Original PR head is unchanged. This commit preserves evidence on the existing WIP branch only. Latest merge has four unresolved test/helper conflicts; merge trial was aborted, not committed.

Restoring original cd910 standalone function verbatim exposed a real epoch mismatch: its navigation historical input correctly maps build-native-audio-game.mjs to 41042f4c..., but the current expanded bootstrap validator expects TASK111 audio current 38e7b36c.... Original bootstrap-only function must be retained separately. Do not alter historical archive hashes or supply a mixed current audio file.

bootstrap-base-addition.patch applies to af77 and adds the old bootstrap-only function under an explicit name. The current function, including audio/capacity/default-reduction/review and the newer beforeQuickFeedbackAdvisory assertion, remains byte-for-byte unchanged. This does not yet wire standalone into the merged tree or refresh captured CI sources. It is not merge-ready.

Validation: exact original base validator with immutable packet fixture sources passes; mutations of each of all 102 file/archive inputs are rejected. This is a fixture test, not an actual integrated current tree pass. wrong-epoch-red.log records actual WIP failure from mixing epochs. No Full run was started. Whole-chain follow-up was stopped without a result after repeated authenticated large-source reads. No timeout-pass is claimed.

Independent review: review_nav_probe verified the additive patch against af77, current function entirely unchanged and new Base function exact cd910 body except name. WIP only; review does not approve integration or merge.
