# #696 精确 Capacity current 域消费者修复（2026-11-17）

接续已独审 prep 树 `31aaad41cf0dbc6fd0c825e5ca4540407719c2ff` / 远端 prep `9027d43`，Release 仍 `00ab3fe6d386f55aecfb063e59aeca2cf5065807`。仅 prepare 保全，不提升原 PR。

## 实际缺陷与最小修复

真实 selection 首项在合流 current 文件上失败：原断言要求 #703 的精确 SHA，合流文件有合法 picker 接线，不能直接当 #703 原件。新增 `integrationCapacityCurrentRead`，仅把精确登记的合流字节投影为完整 00ab current；实际发生转换先对同一 caller raw 做完整 fresh 认证。与继续到更老 capacity CI 前驱的 `integrationCapacityCiRead` 明确区分。两处健康 current 读取改为该接口；所有旧哈希、畸形输入、foreign、wrong-before、暖漂移/缺失断言原样保留。原测试 complete live source 标签现在表示经 fresh 授权的固定 00ab current 域，不声称磁盘合流字节与旧 SHA 相同。

新接口无跨调用缓存、无 unchecked 导出，Buffer 保留，foreign/no-op 单次读取。旧不可变 packet 没有修改；新 outer packet 只更新 selection 文件 current SHA，对应 helper pin 随之更新。

## 验证（本地离线，不是 hosted / 实机证据）

- 原始失败：`node --test --test-name-pattern='^B9 capacity CI join binds' tests/release-selection-map-source.test.mjs`：exit 1，1 fail，总 2292.433ms。日志保留，不抹除。
- 同原具名消费者修复后：exit 0，1/1 PASS，总 13795.232ms（body 12522.922ms），180s 边界内。
- `node --test --test-name-pattern='^capacity and latest Release CI views compose' tests/release-selection-map-source.test.mjs`：exit 0，1/1 PASS，总 85994.152ms（body 84097.096ms），240s 边界内。保留暖错误 raw 注入断言。
- `current-reader-probe.mjs`：9 checks PASS，17149.231ms；同 raw reader 健康/owner 缺失拒绝/恢复、Buffer、目标自身漂移不投影、foreign 单次读取；输出精确 00ab source SHA。
- 修改源码 syntax 与 diff-check PASS。

未启动 Full 或大矩阵。compose 与小 probe 有短暂并行，耗时不是隔离性能预算验收。

## 仍未完成

calibration bootstrap/selection 其余消费者、其他 selection tests、独立 copy closure 及完整准入仍 pending。新 outer 健康成本约 5.8s，未获得 fast/hosted 成本准入；旧 B9-only 大矩阵32–40分钟估算失效。不能用本轮两项 PASS 替代整套、设备验收或提升原 PR。Backlog CLI 缺失（command not found），未手改任务状态。
