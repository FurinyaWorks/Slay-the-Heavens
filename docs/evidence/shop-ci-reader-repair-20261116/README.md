# 商店组合 CI 读视图接续

接续 PR #680 精确来源 `ad3a53cb3eb87fbad4ae015d11ea870deb6d5db1`；实际 Release 基线 `33d71575c5f186a1b54f7bf3e4f1826c145aa1d9`。本切片只修复测试消费者，不引入其他 PR 的产品代码，也不改变 CI、预算、Backlog、历史 packet 或验收状态。

## 真实失败与修复

1. Hosted calibration 报 `abyss_node_ui_input.lua` linked owner identity。消费者先将生产文件逆投影到 Release，再按最终 118-owner 商店组合认证，混用了两代输入。生产目录和 architecture 现在先以 raw 字节进入现有当前闭包；CI 文件保留原历史读链，原断言、完整来源和实际执行 guard 不改。
2. 两个原 116-owner 回归把新增商店 owner 的当前 118-owner 证明当成原证明，因列表差异失败。它们现在明确消费 `preShopPost697SourceEpoch`，通过当前→`shopPost697Release` 读视图重放原来源；所有原数量、精确列表、LF/CRLF、顺序、暖漂移/缺失和 foreign 负控保留。现有独立 union 合同仍直接检查当前 352 生产输入及全部 118 raw owners，而不是减少当前 owner 范围。
3. StS 原负控将历史 reader 配上 raw 当前 inventory，先触发外层 shop 认证，未测到预期的 StS 缺陷。现在历史负控使用其完整原 inventory 和匹配 reader，真实当前准入正例保持 raw；非目标读不再经 `Buffer + ''` 隐式损坏 gzip 字节。所有原错误断言和变异路径保留，没有扩大接受的错误范围。

## 证据延续

独立 `shop-post697-ci-reader-repair.json.gz` 保存四个消费者的完整 before/current。原 packet 内已有的两行 before 与 views 必须逐字段一致；新增注册的两个测试 before 固定到来源提交的 Git blob，release/shop 两域来自原真实提交。每行的 UTF8/LF、SHA-256、Git blob 与完整域均验证。

原 `shop-post697-ci-source.json.gz` 及其原 98 个 archives 不改写；辅助 current 延续增加两个测试 guard，完整 CI 范围为 33 行。原 CI packet 与 repair packet 另加入每次新鲜 archive 认证，最终为 100 个 archives。所有历史 views 和 raw JS/Lua 发现库存保留。

## 本轮边界

从 GitHub connector 读回失败 jobs 133144132619、133144132635、133144132529、133144132582、133144132566 的完整日志。原四个 epoch/StS 入口 0/4、原 component calibration 0/1 的本地 RED 已保留；修复后的对应五入口 GREEN。最终完整 calibration 74/74（218401ms）、三个 epoch/StS 文件 39/39、现有 shop union 合同 6/6（110881ms）全部通过；原始日志由合前协调者复核。

不把本地定向当作 Hosted Required CI、官方候选、设备或容量通过；不运行重复本地 Full。没有 push、远端 PR 操作或新任务认领。Backlog CLI 在环境中缺失，未修改任务；现有 Backlog/guidance 验证器照常运行。
