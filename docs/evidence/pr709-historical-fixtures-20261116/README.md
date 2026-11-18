# PR709 历史 CI 夹具接续

基线：`52c7f9582c5a31ec4ae6c0c74527a78d72ab333a`，Release base `33d71575c5f186a1b54f7bf3e4f1826c145aa1d9`。

## 问题与修复

原树五项命名测试均失败：Draft/Fast mask=1 没有发生突变；Windows 旧28-job形状、工程上传回退及 Full 的两项历史工作流用例直接读取新增 edited/scope gate 后的 live YAML。不是产品超时，也不应修改运行预算或恢复旧 workflow。

四份测试仅在历史夹具入口先使用已有完整 hash 认证的 Release freeze 前驱，再保留原逆变换和断言。Draft/Fast 63个非空 mask、重复块、漂移和两种换行全部保留；live workflow 的 edited、scope gate 与拒绝漂移另外核验。来源 helper 仅为这四份最终完整测试提供精确 current→before 逆向；原五 owner packet、归档、库存与旧 pin 不变，未知路径/类型/尾字节/删字节/损坏换行仍原样拒绝。

## 验证

- `red-original.log.gz`：未改动基线五项失败原始输出，5 fail / 0 pass。
- `source-and-controls.log`：summary + selection 完整定向文件，18/18，无 skipped；含四份修改测试的 LF/CRLF、路径、类型及字节漂移负控。
- `fixtures.log`：其余原失败入口 4/4，无 skipped。summary 原失败项已在上述18项内，不重复计数。
- `closeout.log`：原完整来源与发现库存合同单项 1/1，无 skipped；forecast 只是诊断，不声称 hosted 耗时达标。
- `guidance.log`、`backlog.log`：指引和任务元数据通过。

没有运行本地或手动请求 Hosted Full，没有修改 workflow、生产、旧来源包、运行预算或分支保护。新 HEAD 的必要 CI 与正常合并仍需 GitHub 实际结果。未触碰怪物设计、技能接入、GUI 或正式发布。

原始 RED 日志以 gzip 无损保存，解压 73896 字节，SHA256 `9aa8b2d98055802e9c3a93b2a225b3ae8d8bc92121e9e57c9a8905b3fdd89fbd`；未清理原始尾空格或裁切断言输出。独立复审内容 PASS，另做59项精确绑定/负控探针通过。
