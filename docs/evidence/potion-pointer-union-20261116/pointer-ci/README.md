# Pointer CI 原合同接续

基于远端 `0780e604323bc78139e0fcf3fc68f1b9d78e6ca8`；本地等树 `0985e7928cc63fa84bc642ef7e86663ad8b2c53d`，tree `0e935f03cd5bfb42fb01417a52b13e63232b4a47`。仍为原 #679 eabff9b × #711 ad6fe84 双父准备树，不是当前 Release 集成。

## 实现

恢复 `battle-pointer-ci-source`、`battle-pointer-sparse-ci-source`、`battle-pointer-inspection-ci-source` 的 mjs/json.gz 共 6 文件。5 个文件逐字等于原 ad6；inspection mjs 唯一变更是将已存在的 `pointerBeforePotionEpoch` 显式别名为 sourceEpoch。该模块验证的是原 pointer 身份，不能把当前 union 产品伪装成历史产品；默认传当前 union 磁盘应失败。原 inspection 全文另在 union pointer view 保留。

恢复 calibration 原末尾两个 raw Full inventory 用例，原断言体不变，原有 78 用例文件前缀逐字不变。通过既有同步 `withPotionPointerCiUnionValidation('pointer', raw)` 先认证全部当前产品/CI 输入，再将有期限的完整 pointer 父视图交给原断言。无跨 await 权限、新缓存或通用设施。

真实 discovery 与 pointer 历史 inventory 的精确差异仅药水 JS `tests/potion-popup-click-payload.test.mjs` 和 Lua `tests/lua/potion_popup_click_payload.lua`。新函数先证明真实扫描完整等于 pointer + 该新增项，再从实际扫描投影；缺失、重复、foreign 或丢药水项均拒绝，不用旧硬编码列表冒充当前发现。

当前输入 195 → 201；旧 packet 原样归档为 `potion-pointer-ci-before-pointer.json.gz`，完整旧键/父域/源全文保持。helper-copy 251 → 258，包含 6 helper/packet 和新前驱档；固定 manifest 与 copier pin 同步更新。产品、原 PR 和两个历史 LFS materialization 不动。

## 实跑

- `node --test --test-name-pattern='^(battle pointer raw Full|sparse battle pointer raw Full)' tests/ci-complete-calibration.test.mjs`：**2/2 PASS，19,646.254603 ms**。旧 78 没有执行，无 Full。
- `node .../pointer-ci/verify.mjs`：**58 控制 PASS**，真实新增文件身份、201 当前认证、missing/empty/drift/null、当前/历史读域、药水输入不可跳过、实际消费者 inventory 函数与 scope 退出失效。
- `node .../pointer-ci/verify-copy.mjs`：**33 控制 PASS**。临时目录真实 import、copy-from-copy、258 helper + 379 显式夹具完整认证，以及复制后的 pointer validators 实际执行。原路径安全/硬链接/源验证负控保留。
- `python .../pointer-ci/capture.py`：精确前驱和当前绑定可重建，SHA 不变；diff-check 通过。
- 独立复审：5 原文件 exact + inspection 唯一别名、旧 78 前缀原样、201 输入和父视图完整；独立真实 inventory 与鲜读 **15 控制 PASS**。见 `review-*`。

作者第一版 probe 错将不在 inspection packet 中的 calibration 路径作为该入口负控，因未抛错失败。已改为从 inspection.files 选择实际受该验证器管辖的非产品路径，保留 v1 日志。此为测试脚本修正，不是删减产品断言或放宽期望。copy 日志的预期红堆栈为隔离篡改负控，最终 PASS。

## 未宣称完成

未运行 Full、旧 calibration 78 或 integrated 19 全套；不重复此前行为 3 用例。其他 shared tests 的 pointer CI 新断言仍需逐项接续，不能因为这 6 文件可运行而宣称整条 pointer 测试迁移已完成。原 owner 的第三触控详情 dismiss 产品缺陷未接管。无官方客户端、ready、手机证据；不等于合并/发布许可。Backlog CLI 缺失，不手工修改任务库。

日志用语修正：已保存 copy.log.gz 的 scope 原文中 “no remaining pointer CI assertions” 意图是未执行其余套件，并非全部完成。复审后仅将 verifier 的输出说明改为 “no other CI assertion suites run; no Full/device acceptance”，实际测试逻辑和原始日志不变，未因此重复执行完整复制控制。
