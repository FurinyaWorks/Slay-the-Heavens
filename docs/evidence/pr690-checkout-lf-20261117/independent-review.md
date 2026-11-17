# Independent review: #690 raw-byte JSON checkout stability

Reviewer: /root/windows_677_fix/review_crlf
Result: PASS, no blocking findings for this narrowly scoped patch.
Parent: cd9106c0e302cb50f83ba8b5c85ce81560c6ed88.
Reviewed .gitattributes SHA256: e86d4168e95e218e9b48c67c82d21e74a7481a5aa3c4855bd7f3850d73948ce7.

The sole intended change adds `tests/helpers/navigation-menu-reader-repair.json text eol=lf` and an explanatory comment. No reader, historical pin, JSON evidence, test assertion, production source, workflow or protection change.

Independent fresh temporary Git repository reproduction used exact HEAD blobs and `git -c core.autocrlf=true checkout-index`:
- Original attributes: JSON becomes CRLF, SHA256 994c2c7f2daaaf5fca341d98125784fe7b8366aaf4efc154db51c5504107b806 (RED against original raw-byte pin).
- Patched attributes: exact original blob bytes retained, SHA256 cbc3fc4b9050bf6405cc25029fd98ee47bf7b1e4a8780b40a953b2d53d9538ae (GREEN against unchanged original pin).

The two dirty .gz files are only materialized original LFS payloads: independently verified SHA256 equals each exact HEAD pointer OID. They are not part of the patch and must not be submitted as ordinary blob changes.

Validation is local Linux Git checkout with Windows-style autocrlf behavior, not an actual hosted Windows rerun. The separate POSIX5 raw inventory failure is not addressed; this does not establish all CI green.
