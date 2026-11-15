# Final audio startup capture, without weakening existing gates

## Supported route already exists
`docs/TOOLCHAIN.md:94` documents `playtest_start` then `playtest_status`; `scripts/build-native-candidate.mjs:377-383` demonstrates exact request/context/evidence wiring. The `build:native` audio wrapper does not expose that flag and mutates GIL bytes after the full candidate. Therefore reuse the supported playtest route on the FINAL audio file, not the pre-audio startup record. Do not rebuild the candidate merely to capture startup, and do not invent an unsupported CLI flag.

## Authorized toolchain operator recipe (not executed by Dot)
1. Finish final audio candidate and freeze its actual source SHA, receipt and bytes. Preserve originals. On the machine with the supported toolchain, read `miliastra://workflow` and `miliastra://platform-rules`; respect that operator's GUI authorization and prerequisite checks.
2. Immediately BEFORE the real `playtest_start`, save `before-start-context.json` with: `sourceCommit` and `buildId` from the final clean receipt, `mapPath` the actual final audio path, `candidateHash` SHA256 of those actual bytes, and `startedAt: Date.now()` in milliseconds. Preserve this file. Never derive this timestamp from a later file mtime or backfill an older run.
3. Invoke the supported `playtest_start` on that `mapPath`, with `clientScriptLog:true`, `durationSeconds:12`, `screenshotsAt:[2,8]`, and the actual graph name if required by the installed toolchain. Save the real returned object to `actual-start-result.json`; do not fabricate a run ID/directory or use another build's result.
4. Invoke `playtest_status` with that exact returned `runId` and `waitSeconds:15` until terminal status; stop at the repository example's 240-second deadline and diagnose any unsuccessful result. Save the complete decoded tool result to `actual-status-result.json`. Retain its real run directory, request.json and raw GIA logs unchanged on that host.
5. Run the offline converter from the same working directory used for receipt paths:
```
node final-startup.mjs <repo> <installed-tool-root> \
  <final-audio-candidate.json> <before-start-context.json> \
  <actual-start-result.json> <actual-status-result.json>
```
It emits startup evidence to stdout ONLY after the existing `requireStartupEvidence` succeeds, using the exact supported `<tool-root>/src/debug-log.mjs` `inspectDebugLog(bytes,{limit:100000})`. Failure emits only stderr and exit 1. If storing stdout, use a new staging file, check exit zero and re-read it before exclusively placing it beside the final GIL as `startup-evidence.json`; never truncate a previous evidence record before success.
6. Run repository `verify:ui` against that final GIL and actual acceptance manifest. Platform load and other release gates remain independent. Startup evidence is explicitly startup-only, NOT gameplay/mobile/official capacity or release acceptance.

## Converter checks / limits
Reads actual candidate again after raw-log decode; checks frozen clean source, build identity, top-level audio hash and nested canonical hash, file path identity, actual bytes, pre-start timestamp and real start/status linkage. The existing function checks run directory, request candidate/subscription, raw-log freshness, complete parser output, claimed prints, latest build boundary/readiness and runtime faults. The converter uses the installed decoder from the explicitly supplied tool root; results require an actual authenticated toolchain and real run evidence, not a test fixture.

Verification performed in cloud: syntax check; missing arguments exit 1 with empty stdout; existing `native-playtest-evidence.test.mjs` passed (one test with its existing rejection assertions). No positive end-to-end converter verification is claimed: real toolchain and actual final candidate/run are unavailable here. Operator-supplied context/records are not cryptographically authenticated, matching the existing engineering documentation's caveat.
