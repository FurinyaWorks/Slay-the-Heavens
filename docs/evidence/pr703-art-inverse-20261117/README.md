# PR 703 historical art-feature expectations repair

Base: c38581e6d2f11defb5888bb95804e9c3d77fb6d7.

Only tests/art-feature-source-inverse.test.mjs changes. Capacity modified ready-card-runtime; old feature consumers intentionally leave unknown full sources untouched. Two historical rejection tests therefore incorrectly expected linked reads from an unknown source.

Use the existing capacityReview complete current hash and releaseBootstrapCiSource exact before projection for historical assertions. Original error code, identity, actual and expected hash assertions remain intact. New controls verify current raw/CRLF/unknown source does not authorize linked reads; modified inputs remain untouched by the exact inverse. No production code, helpers, historical packets or CI workflow changed.

Original two targeted tests reproduced RED (red.log.gz preserves raw output). Fixed two plus new negative control: 3/3 PASS, zero skip (green.log). Command: node --test --test-name-pattern='pre-component unsupported feature|pre-capacity feature consumers|capacity ready-card source' tests/art-feature-source-inverse.test.mjs.

assertIntegratedCurrent(), check:guidance, verify:backlog and diff-check passed. A subsequent whole-file attempt produced no output and is not certified complete; no Full suite or hosted result claimed. Separate portrait/budget selection133 fixture issue remains outside this repair.

Independent read-only review PASS on source SHA256 c4148c45eef12ec070c23e0b14cb21bc78b5176ef552d7cd1fdb181d0474d60a: exact current packet, exact Git predecessor, original failure guards and drift rejection independently checked. No direct archive self-binding for this test was found.
