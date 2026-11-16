# 复合意图组合 CI 读视图接续

接续 PR #687 精确来源 `d0de2f65454c307f7048bcceac86400dbb40fb35`，实际 Release 基线 `33d71575c5f186a1b54f7bf3e4f1826c145aa1d9`。本切片只修复测试消费者；复合意图产品、生产来源、原历史 packet、预算、发现入口与物理时限均不变。

## 已复现的三类来源失败

- calibration 把生产源码先逆投影为历史 Release 字节，再按当前 117-owner 意图闭包认证，因新增 `abyss_battle_intent_view.lua` 拒绝。现以真实 raw 生产文件及 architecture 进入当前闭包，CI 消费者保留原历史链。
- 原两个 116-owner 测试混用当前 117-owner 证明。现显式使用 `preIntentPost697SourceEpoch`，经当前→`intentPost697Release` 完整认证的读视图重放原数量、列表、LF/CRLF、顺序、缺失/漂移和 foreign 断言；既有独立 union 合同继续逐项验证全部 352 生产文件及 117 raw owners。
- StS 负控把历史 reader 配给当前 raw inventory，或以 `Buffer + ''` 损坏未命中的 gzip。现保持完整原 StS inventory 与对应 reader 配对，非目标读取返回原类型/原字节；raw 当前正例、原注入路径与错误断言均保留。

## 完整证据延续

新增 `intent-post697-ci-reader-repair.json.gz` 保存四个消费者的完整 before/current 与 Release/intent 两域。每个 before 固定为上述 d0de 提交的真实 Git 字节；已有两行的 before/views 与原 packet 必须逐字段相等，新增两行 before 固定到实际 Git blob。current 与本次消费者逐字匹配；生产冻结身份不变，辅助 capture 不冒充产品提交。

原 packet 与所有旧 gzip 不改写。完整辅助 CI 范围为 32 行；原 packet 和新 repair packet 均加入每次新鲜认证，最终 100 个 archives。当前 117 与历史 116 分别验证；raw 880 JS / 1424 Lua 库存、完整 owner 缺失/null/漂移及暖恢复、public source/reader 负控保留。

## 本轮验证与边界

原四个 epoch/StS 用例 RED 0/4、原 component calibration RED 0/1；相同入口修复后 4/4 与 1/1 通过。完整 calibration 74/74、当前 union 6/6 通过。三个 epoch 文件首轮 39 项为 38 PASS / 1 ETIMEDOUT：未改的 official-repair helper 隔离导入达到原 30s 限制，原失败日志保留。协调低并发窗口后仅重验同字节该项，1/1 PASS（用例 16052ms，原子进程 30s 限制不变）；这与先前 38 PASS 共同覆盖 39 项，不冒称首轮全绿或完整 Full。

Hosted 的独立 `parasite_08/frozen391` 曾在 30.234s ETIMEDOUT，另两项 ENOENT 是缺该 manifest 的后果。本轮原入口单组对照在未修改的 30s 子进程限制内通过：frozen 26160ms、current 24100ms，各 678 checkpoints，完整 trace 与 stdout 相同。只说明本地未复现该超时，不宣称 Hosted 超时已修复或归因到负载；未改生命周期源码、夹具、分片、缓存或时限，整套 coverage union 不冒称重跑通过。

没有本地 Full、Hosted Required CI、官方候选导入/ready、容量或实体设备验收。保留原两档 Host/自然 Bellow→地图→返回的既有产品证据原身份，不将本轮 CI-only 修复视作新设备结果。没有新任务认领、状态变更、push、远端操作、合并或发版。
