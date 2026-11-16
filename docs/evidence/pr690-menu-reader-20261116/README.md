# PR #690 历史菜单 reader 接续

- 输入：`ad1df7f3f02561701339d030d3acffb3218aa549`，独立工作树；未改正式产品、历史 archive/pin 或 CI 规则。
- 复现：历史字号用例直接执行旧 Release validator，读取当前 input `eb4ef062…` 却要求导航历史 `b2394cff…`。选择地图 `8476a62e…` 是另一份，不能混用。
- 修复：历史菜单先调用已有 `assertNavigationDomainCurrent`，从同一 raw reader 认证完整导航组合，再给旧 validator 提供正确前驱。保留旧菜单字号断言以及当前退休入口断言。
- 新增独立 before/current 续接文件，before 精确来自输入提交。原有 help retirement packet 不变；仅认证精确的新测试字节后恢复旧测试身份。新增 owner 改动、缺失、Buffer、二次调用漂移拒绝以及 CRLF 正常输入验证。
- 物化：两份 Git LFS gzip 先从已有本地副本恢复并核对原 SHA256 pin；仅用于测试，不纳入本次改动。缺失 `.github` 文件从精确 HEAD 物化。
- 验证：Node 24.22.1 / Linux，`npm run build:data` 和 `npm run build:ui` 成功；三个定向文件 32/32，13.15 秒，原始输出见 targeted.log。未跑 Full，非官方客户端/手机/容量验证。
- 导航 source 与 integration 两文件在原始输入完成正确物化后 15/15 通过，所以没有据旧 Hosted 日志扩大修改。Release merge 候选若仍失败须按实际合并 SHA 另行复现，不能把本次 standalone 结果当其通过。

命令：`node --test tests/mobile-typography.test.mjs tests/release-navigation-map-integration.test.mjs tests/release-navigation-source.test.mjs`

独立复审：`/root/independent_2315/nav690_review`，PASS，unresolved=[]；复核精确 before/current、完整旧断言和最终日志，未重复 Full。包 SHA256 `cbc3fc4b9050bf6405cc25029fd98ee47bf7b1e4a8780b40a953b2d53d9538ae`；helper `e920fd1edb2ed7c5d9f0e9668cc783deb4ff9eedbc95d9ff0310243dcb004597`；typography `69d53258dad8ef0ef7e571bb6144c1181f6aa27efc5d7e2364cf6418f8b1cbcc`；integration test `6df6ced7a23ffdf925fbfaf49ba78dcb602a632b9a7af5472732928e58b5e0be`。
