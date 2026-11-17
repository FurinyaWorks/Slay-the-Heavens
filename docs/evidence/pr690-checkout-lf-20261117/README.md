# PR690 Windows raw-byte JSON checkout repair

Parent cd9106c0e302cb50f83ba8b5c85ce81560c6ed88. One `.gitattributes` entry fixes `tests/helpers/navigation-menu-reader-repair.json` to LF; no source, reader, hash pin or production changes.

Independent real temporary Git checkout with core.autocrlf=true reproduces hosted Win3 exact RED 994c2c7f2daaaf5fca341d98125784fe7b8366aaf4efc154db51c5504107b806; with explicit LF attribute restores original cbc3fc4b9050bf6405cc25029fd98ee47bf7b1e4a8780b40a953b2d53d9538ae. Local Linux/Node24.22.1 two source suites 16/16; independent review PASS. No Windows hosted rerun or Full claim.

Remaining independent POSIX5 failure reproduced exactly by `node --test --test-name-pattern='release navigation raw Full inventory' tests/ci-complete-calibration.test.mjs`: line2036 authenticates raw merged input eb4ef062… against navigation predecessor b2394cff…. Existing navigationMapProductionRead('navigation') shows the correct authenticated domain used by source tests; caller must retain fresh current closure and complete raw inventory guard before historical view. Do not replace pin or old product. Not fixed by EOL rule.

Hosted: https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/43979432717/job/133785958147 and /job/133785958027. Prepared branch only; original PR remains untouched to combine remaining fix and actual Release conflict reconciliation before one push. No Full dispatch, no merge, no device proof.

Local checkout initially omitted .github files and left two LFS gzip pointers; restored exact HEAD files and hash-verified LFS objects before final 16/16 and POSIX reproduction. Neither materialization is committed.
