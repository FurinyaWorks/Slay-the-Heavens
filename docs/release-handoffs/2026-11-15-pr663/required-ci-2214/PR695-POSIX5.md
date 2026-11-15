# PR 695 POSIX 5/15: exact missing PC06 source boundary

Reviewed current PR comments before diagnosis: only existing integration handoff, no competing repair claim for this failure. Exact head `350c447c96dc65c1b48c48c3e0e24a3b627e4b2f`, Release `1cc5479b713edab6fd26db4e20f8eb22b7401cb2`.

Hosted job https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/43760647040/job/132957182176 checked synthetic merge `457e63149ecda3745366e6e502281cbd8b045087`. It completed 502 tests: **498 pass, 4 fail**, all in ci-complete-calibration.test.mjs:
1. line1501 historical battle continuation;
2. line1854 combined closeout raw-current source;
3. line1940 run HUD current source;
4. line1996 Release bootstrap raw Full.

This is not a settings-image rendering assertion or a timeout. Current HUD bytes are `d24ea5a...` while nested predecessors expect older `60df1c2...`/`05f1bc9...`; bootstrap helper is current `2813c135...` while its frozen predecessor expects `65c09f74...`.

## New source proof
`pr695-packet-probe.py` reads the exact current Git objects, authenticates the existing PC06 packet SHA256 `cef63cfac0c079e6f95a913c20a897464833bac8012404c4062fbb7ddebf87eb`, and verifies all four packet current/predecessor source bytes and hashes against real HEAD/Release. PASS, saved pr695-packet-proof.json.

The underlying PC06 packet is internally consistent. However, **ci-complete-calibration.test.mjs never imports/calls pc06CiRead or assertPc06CiCurrent**, despite containing the four outer/current-source tests. Its existing rawBootstrapRead and raw historical HUD readers consequently encounter newer PC06 files without the predecessor adapter. Existing `pc06CiSource` deliberately sets project=false for the product HUD path; merely wrapping every read with this helper will NOT repair all four errors and changing this flag globally would broaden its contract.

## Required bounded repair, not yet implemented
A new outer calibration continuation should first authenticate true PC06 current bytes and complete raw inventory, then provide named historical-only predecessor views for these old contracts. For the product HUD path, use only exact verified PC06 current→Release-before mapping in that **historical view**; preserve global project=false. Let existing runHUD/closeout adapters perform their remaining older projections. Bootstrap view can use exact PC06 CI-only projection. Preserve the current-image 100161/28px product validation, raw discovery/cost/physical guards, frozen packet bytes and mutation/foreign-path negatives.

Changing calibration changes current authenticated source ownership, so a safe implementation also needs its own exact outer source receipt/continuation and independent review. No guessed hash replacement, unconditional historical byte substitution, test skipping or global reader masking was attempted. This is a rigorous localized blocker plus source proof, **not RED→GREEN** and not a claim the branch is green.

The requested bounded diagnostic was finished without another shard/Full run, CI trigger, remote edit, SDK or user computer. Evidence: pr695-packet-proof.json, probe.py and pr695-hosted-excerpt.log. The compressed packet is an exact local existing Git object, not a new deliverable to publish.
