# v2.1.1 有声包严格读回预检（离线）
 
这项预检在干净源码 `06c2577ecc6c07593c6bf8b6e79e158dac5b6195` 上执行，不是正式 Production 或真机验收。固定 MCP `59c576e41632a6bf6781bbca83a676d0da0374ec`；仅使用公开测试底图、`alpha-test`，禁止写入正式存档。
 
- 历史容量对照底图仍有示例服务器图 `_GSTS_CgStage`。它可用于同底图体积对照，但严格审计按预期报告 `GRAPH_COUNT`。不要据此修改图数量门禁或放宽审计。
- 改用固定 MCP 中不带预置服务器图的公开 `tests/fixtures/editor-2026-10-26-shapes.gil`（底图 SHA-256 `b8aa63c8e6c5c24964784842329a37adeb60d50c2f56272f6cc512907baf3706`），同提交有声构建与严格审计 **通过**，375 个 Lua 模块、24,127 个 UI 控件、牌堆模板及五个部件绑定、两个服务器图的名称、启用挂载与信号读回一致；BGM 图含 7 个信号。未验证官方客户端导入或音频播放。
- 预检包共 23,782,428 字节，GIL SHA-256 `45c6556b15c75d248fe030468d08bbc418c3a3a2f89c16ced64fdeb2e6dfa684`；构建 ID `a98e6e37-46d1-4951-ac60-baf75aad7f75`。审计前后字节散列一致。平台验证返回 `UNVERIFIED`，原因只报 `Official load evidence missing`。
 
复现：用上述公开夹具向现有 `npm run build:native` 传入 `--release-candidate --work-key=alpha-test`，保留原始完整与有声 `candidate.json`。用 `node scripts/audit-native-candidate.mjs --source <exact-sha> --candidate <audio/candidate.gil> --receipt <audio/candidate.json> --output build/<new-audit-dir> --bgm`。审计输出应使用仓库下新的 `build/` 目录：独立源码快照需要从祖先目录解析已安装的 `luaparse`，输出到仓库外会误报依赖缺失，并非候选不合格。
 
正式验收仍须用批准的 Production 底图和实际作品键重建，保持两段回执，对同一最终有声包执行严格读回和官方负载检查，再用受影响手机核对从点击进入到首场可操作战斗。离线结果不替代冻结提交的正式 CI 或上述实测。
