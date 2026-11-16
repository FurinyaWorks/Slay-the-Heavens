# TASK-38.6 手机商店详情点外关闭

本切片对应 M05：手机点击商店遗物后，点空白不能关闭说明。用户已确认这些手机测试均使用 iPhone 14 Pro；设备身份不等于本切片已经实测。

## 任务与基线

- 基线为 `origin/develop c2409ad750c15124b7b843c6bbfa5b222537cb75`。
- 合同只读自 [PR #673](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/673) 的 TASK-38.6。该任务尚未进入实施树，`task:pick` 返回任务不存在的 HOLD；按 Owner 明确授权开发独立切片，不复制任务或文档分支，不伪称已认领或关闭任务。
- 已比对 #672：其商店修改为商品布局、药水图像与平台参数，未改变本切片的选择、节点输入和布局源码。此修复没有 #672 的运行时代码依赖；实施基于 develop，不合并文档分支。
- IMG_1404 只证明当时布局，外点行为来自用户录音。原图保留本地忽略目录，不将包含玩家标识的截图提交到仓库。

## 复现与最小修复

真实生成控件、Run/Map/Nodes 中选择遗物后，向既有 backdrop 发空白点击，说明仍可见且完整 Run 不变；旧页面没有背景关闭热区。原生 builder 也明确禁止给 image 直接挂子控件，不能把图像冒充容器。

新增唯一的非手柄焦点 `nodePanel/shopDismiss`，在 backdrop 后、所有节点内容与页脚前。其动作仅复用原 `ShopSelection.cancel()`，清除选择与旧悬停，不调用购买、离店或战斗命令。商品与购买确认路径保留。

背景只记录当前 active 触点和下一次 released；前景声明也只服务本次输入，在 Click、终止或页面刷新时回收。未重构原按钮输入系统。

| 边界 | 处理 |
| --- | --- |
| 背景 Down | 捕获当前选择身份；busy、presentationBusy、手柄屏障下的 Down 不会在恢复后变有效 |
| 背景 Up | 只将同一 active 触点转为下一次 released，并重验当前选择/报价/页面 |
| 背景 Click | 匹配后先消费 released，再检查屏障；缺 touchId 仅在无其他 active 触点时认唯一 released |
| 背景 Drag / Exit / EndDrag | 清本触点 active 与同触点 released，不触发关闭 |
| 前景 Down / Up | 宣告本触点活跃并撤销同触点背景 token；Up 退出活跃态 |
| 前景 Click / Exit / EndDrag | 清前景声明；终止同时撤销同触点背景 token |
| 前景 Drag | 沿原按钮/滑动路径，直到 Up、Exit 或 EndDrag 终止 |
| Hide / clear / begin 重绘 | 清本次所有触点记录；只保留“该宿主发送过 Down”的能力标记，拒绝迟到 Click 回退 |

## 回归与独立复审纠偏

`tests/lua/shop_dismiss.lua` 使用真实生成树与生产命令，覆盖手机/鼠标、购买与离店、外点零 Run/RNG 改动、过期报价/页面、重复释放、两种前景/背景回调顺序、匿名 Click、多指、发布/忙碌/手柄屏障及实际手柄返回。专用布局断言确认新背景全域但不进入焦点注册；旧按钮的尺寸、可读性和重叠断言保留，只将精确的新背景从按钮/可读内容分类中分开验证。

独立复审曾明确拒绝以下四项，失败记录不覆盖：

1. Down/Up 带 ID、Click 为 `{}` 或 nil 时不能关闭：现对齐原节点按钮的匿名 Click 归属条件。
2. 前景匿名 Click 误落入背景 click-only 后备：前景 Down 标记已观察指针，迟到匿名事件不能走无主后备。
3. 手柄阻挡的 Click 在解除屏障后可重复生效：匹配 Click 在屏障检查前消费，阻挡期间的 Down 也不可复活。
4. 前景 Exit/EndDrag 无 Up 留活跃声明：补齐终止回收；参数化矩阵覆盖 Up、Exit、EndDrag、Click、Hide、重绘后，旧 token 无效而新背景点击可恢复。

每项纠偏均保留在对应回归。最终验收仍由独立评审记录绑定精确 HEAD/BASE，本说明不自证独立通过。

## 验证事实与边界

- 背景不关闭的原症状已离线 RED；暂时移除实际 cancel 动作也被新增回归拒绝，恢复生产动作后 GREEN。
- 新增 JS 两项，其中真实 Lua 十二组；原节点布局十二项；原 `shop_selection.lua` 十三组；正式 `official-assets-first` 生成树另验。原始命令输出保存在独立树 `.artifacts/mobile-shop-dismiss-1115/`，源码测试可重放。
- 统一工程入口、JavaScript 语法、原生控件合同及 Backlog 完整性分别执行；精确结果以本轮日志与 PR 说明为准。`test:related --plan` 是路由计划，不冒称已执行完整受影响集合或 Full。
- 未修改游戏规则、平衡、版本、master、发布候选或发布记录。未构建/导入新 GIL，未取得官方 ready、容量或同候选手机实测；本切片不代表当前发布容量合格。
- TASK-38.6 的手机与实际设备要求全部保持未完成；待 #673 正式落地后，使用 Backlog CLI 同步真实进展与证据，不直接编辑任务文件。

## 迁移到 2.0.0 Release

Owner 将本轮必要修复改为 Release 收口后，旧树冻结在未推送的 `4c62817239da4bd9c2e7dc822b27af7e0b4cd8bc`，未向 Develop 创建 PR 或授权合并。

新分支 `fix/mobile-shop-v2-1115` 从 `origin/release/v2.0.0@36b9b157ee6f05b65eb9f1da7e2978647d36c210` 建独立树，读取新 AGENTS 与 V2-RELEASE-HANDOFF 后，以 `cherry-pick -x` 保留旧修复来源。此基线相对原 c240 只变更五个 CI/指引文件，`src/`、`scripts/`、`tests/` 无差异。迁移不合并整个 Develop，不改原分支、候选、master 或 Tag。

本次另修正旧提交 `tests/lua/shop_dismiss.lua` 末尾多余空行；旧 `diff --check` 的失败保留，不将旧提交宣称为空白检查已通过。其余五个源码/测试文件与旧修复逐 Git blob 相同，Lua 测试去除末尾空白后逐字相同，未改变输入行为或测试断言。

Release 树重建数据/UI 后，重新运行完整十二组商店生命周期矩阵与原节点布局，并完成改动 JS 的语法、Backlog 与空白检查；新日志位于 `.artifacts/mobile-shop-v2-1115/`。先前四项独审 RED、纠偏 GREEN、工程与正式生成树记录保留为原基线历史，不迁移旧独审 PASS 到 Release。最终 HEAD/BASE 由原独立评审者重新核实。

PR 目标为 `release/v2.0.0`。Release 保护与 Full CI 依新发版合同核实，由主协调者处理；不套用 Develop 的 Fast/自动队列，不重复本地 Full 或整套工程采集。#673 未合入本树时仍不伪造任务状态。官方导入、ready、iPhone 14 Pro 同候选实测与发布容量仍未验证。
