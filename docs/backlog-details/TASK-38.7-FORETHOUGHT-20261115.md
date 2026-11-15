# TASK-38.7：远虑多选操作反馈切片

## 范围与来源

按未合 PR #673 的 TASK-38.7 只读合同及 Owner 授权实施；`task:pick` 为未知任务 HOLD，不复制任务、不伪造认领/完成，登记落地后再由 Backlog CLI 同步。Release 基线为 `36b9b157ee6f05b65eb9f1da7e2978647d36c210`，分支 `fix/mobile-forethought-v2-1115`。

旧 Develop 工作树的三份未提交改动以精确 patch 迁移，新增 Lua 夹具逐文件复制；旧树与失败证据保留，没有虚构 cherry-pick 提交。迁移 patch SHA256 为 `d9ee1f47e60ca27284b8adb82c1e5c25eb7f77eecdb48c0dd97860c38056d8ee`。迁入后只继续修复本切片与夹具，不引入 #672 的 PageReveal/图像准备改动。

## 已证实的 RED 与结果

真实 GameUI/Fengari 中，升级远虑的单次点击已经立即选中正确 UID；没有复现手机“必须再点一次”的实际触控路径。可证的问题是每次多选点击都会 `close → callback → refresh → open`，同一选择的 openSession 增长，Grid 同步刷新两次、下一 update 再刷新一次；已选择标记随重建重画。现有 PageReveal 因新 session 进入准备，#672 能改善同步就绪盖层，但没有移除这三次重建。

现在多选保留原 session/generation，在同一回调内接纳核心的新 token/selected 表，只更新所点 UID 的选择卡框、标记、计数与确认状态。零次 Grid 刷新、零次 native art 写入，不调用卡面正文与原生图像 writer。callback 返回后核对 run/battle/generation、同一 pendingChoice 及控件身份，旧 owner 不写回。单选与最终确认仍走原提交/关闭流程，核心药水、牌底免费效果、RNG、合法 busy 拒绝与上限不变。

确认按钮原宽 88、文字框宽 80，最小字号 22 下四个汉字需要 88；实测截图 IMG_1405 也显示“确认选”。主题源 `deckView.close` 改为宽 112、中心 x=464，文字框 104，保留字号与高度；已有安全区、排序栏间距和所有状态几何断言继续执行。未修改整套 UI 布局。

## 本轮验证与边界

- 最终新增 Host 夹具对原 Release deck writer 失败于 `multi-select retains its modal session`；修改后的完整夹具通过，包括即时正确 UID/标记、零 Grid/素材重建、快速重复点选、旧 token、RNG、免费出牌、单选不可取消、零选确认、callback owner 切换、倍效液态记忆 required=2 的拒绝超限/取消勾选、返回主菜单后恢复及旧 battle 回调拒绝。
- 三份直接相关 JS 回归中，生命周期/滚动及几何等 10 项通过；新增夹具最初因错误要求 Host callback 返回 true 失败，改为断言 pending/手牌/RNG 的实际结果后定向复跑 1/1 通过（12761ms）。没有删断言或改生产规则；该回调原来不承诺返回布尔。
- required 夹具先前的 nil 来自 `Run.obtainRelic` detached 事务替换 combat 后仍持有旧表；修为显式验证事务换主并读取 `run.combat`。另一次错误假设退出浮层会关闭底层 deck，改用真实菜单暂停/继续入口验证重入。旧失败日志均保留。
- `node scripts/check-engineering.mjs`：351 模块、6170 测量、1988 架构边，CC15 与 Luacheck 原门槛通过，无新增诊断。`verify:backlog`、`check:guidance`、`git diff --check` 通过。只做本切片定向反馈，不运行 Full、不新增 CI 基础设施、不自行创建 PR/触发托管全量。

本地新日志位于 `.artifacts/forethought-v2-1115/`；原只读三次重建/盖层对照探针保留在旧树 `.artifacts/forethought-triage/`。独立评审由协调者绑定最终 HEAD/BASE，本文件不提前宣称审查或合并通过。

Owner 已确认设备为 iPhone 14 Pro，IMG_1405 原图 SHA 前缀 `3de12207a53c`；不提交含标识的原图。未生成本切片 GIL、未官方导入/ready、未同候选手机实测，不将源码即时反馈或文字框量测当作手机验收。全部相关手机 AC 保持未勾，未修改候选、master、Tag 或发布记录。
