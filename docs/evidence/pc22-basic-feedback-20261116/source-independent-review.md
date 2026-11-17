# Independent PC22 Source / CI review — PASS WITH LIMITS

Code `249511a29f4fb4ae1c9954ef8ab5f9e2c27f6db0`, tree `444ffee17e5617562e1bb4e97aee02fd4b941ef8`; product `1b272ab7f57f2a8bde67fe8796d3a894445ae052`; Release before `36b9b157ee6f05b65eb9f1da7e2978647d36c210`. All 21 paths reviewed (13 source/tests, 8 evidence). Findings and unresolved items: none.

- Independent source6 and one historical inventory seam passed. Eleven read-only/source-copy probe groups passed. Both frozen product blobs are unchanged; product behavior was not rerun.
- Complete 352-file before/current corpora and all 64 old targets remain exact. The original 116-owner set is preserved and CardFlow is the sole genuine new union entry, making 117 owners and 65 targets. All 117 owners are freshly checked with changed/missing/Buffer/throw controls. Producer1b272 and parent36b9 match actual Git.
- All 15 CI bindings, the c240-to36 bootstrap boundary, 92 old archives (90 raw Git gzip plus two physical LFS OID/size matches), and the separately pinned new production packet were verified. Isolated production copies exclude CI trust; warm helper/packet edits and deletions reject.
- Raw Full contains 877 JS / 1424 Lua. The new raw Lua is explicitly linked only to CardFlow; missing/duplicate/foreign/changed inputs and deleting every new addition reject. Original failure evidence and frozen assertions remain intact.
- Predictions 1,756,907 / 1,190,295 ms are diagnostic only. Existing unknown10s, timings, workflow, partition and guards are unchanged. Actual45/30/local75 and Fast45/30 deadlines plus trusted local routing passed direct negative controls. No calibration was invented.

This exact Source/CI slice is acceptable for integration. PR692 remains separate; changed Release inputs require rebinding. Hosted CI, formal GIL/import/ready, PC/mobile and official capacity remain unverified; release remains NO_GO. No product/Host or 44/Full/Fast rerun was performed.
