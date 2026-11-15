# 2.0.0 发布候选预检：版本写入 / 导航回归（18:49 UTC follow-up）

这是隔离工程证据，**未进入正式 Release 或产品 PR**，不代表官方包、设备验收或 CI 准入。研发协作请按下述实际 PR 的精确 SHA 吸收，不要把这个交接分支整支合入。

## 两个相互独立的候选构建关口

1. **版本来源尚未冻结。** Release `36b9b157ee6f05b65eb9f1da7e2978647d36c210` 的 package、lock 两处和 Release Please manifest 都是 1.0.0。调用实际 `loadReleaseNotes` 的 RC 路径，读出的是 `v1.0.0`，不是拒绝所有历史候选。只改 package 被拒；四个值同步 2.0.0 而没有对应玩家说明仍被拒；隔离干净 Git 快照、同步值和测试专用说明可读出 `v2.0.0`，且脏工作区仍拒绝。参见 [5 项定向结果](release-identity.log) 和 [复现脚本](verify-release-identity.mjs)。
2. **#691 生成 Lua 的键格式已变。** 精确 `f85f4e4435e8b128c16713ed23bcbb2559f4fd1e` 生成常规标识符键 `codeVersion="v2.0.0"`，现有 native candidate 仅按文本查找旧的 `["codeVersion"]="v2.0.0"`。这会在第一次 SDK 调用前误拒合法 RC，和此前记录的 Windows/MCP 问题不在同一阶段。局部补丁改为静态核验唯一顶层返回表和唯一的版本字面量；旧键和新键都认可，不执行 Lua，仍拒错版、缺版及伪装，不变更非 RC 参数和构建身份校验。

[#691 补丁](pr691-rc-bundled-version.patch) · [真实 RC 入口日志](pr691-rc-bundled-version.log)。原 gate 两项反向失败，修复后 8/8；把成功用例替换为原始中文生产 narrative 全量序列化再独立通过。夹具使用合成版本和本地假 SDK，不产生官方平台包；完整生产叙事字节的模块摘要和 receipt 仍逐项对齐，13 个负对照全部在读取 SDK 资源前拒绝。

E34 / [#665](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/665) 已有且仍指向 develop；不新建重复任务，不整合 Develop 到 Release，不拿测试说明替代玩家更新日志。最终源头组合与玩家说明确认后，在 Release 一次冻结真实四处版本及对应说明，再用同一 SHA 生成、验包和真机。不要提前填实际发布回执。

## #690 独立 Host 回归

精确 `8129bd8684a7ccf420ba0a8ec5fe077372050708` 的 live `short-overlays` 在 checkpoint 8 调用产品已下线的 `runMenu.help` 而失败。仅在**当代临时探针驱动**替换那两步为取消菜单、同局再打开；保留路线图打开、返回当前调用者、继续、disable，以及 Run/RNG 不变和零结算等守卫。冻结历史驱动、旧 Host 与配对器不改。此 helper 被旧来源包绑定，最终须新增精确外层 continuation，不反写历史 fixture，不据本次局部绿点亮原始 required contexts。

[补丁](pr690-live-host-overlays.patch) · [13 个 checkpoint + 两个负对照](pr690-live-host-overlays.log) · [复现探针](probe-live-overlays.mjs)（放在独立检出根目录运行；负对照参数 `cancel-noop` 或 `retired-help` 应失败）。独立校验再次运行完整当前 13 步成功，未重跑历史全套。

本轮未触发 Full / 构建平台包 / 合并 / 发布。#692 已有 Quality 执行，保持异步；#684、#690 更新过 forecast guard，不能用该修订推定其他门禁都绿。
