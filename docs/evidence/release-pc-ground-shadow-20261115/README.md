# PC21 旅行者接地阴影：Release离线切片

基线 `36b9b157ee6f05b65eb9f1da7e2978647d36c210`（release/v2.0.0），产品 `862c3f2a8988b1af21fc897d6de1d65650798a0d`，分支 `feat/release-pc-ground-shadow-1115`。仅从来源 `8b1a591b2972d2184db82be3802557891a2f25af` 选择移植5路径：两个构建脚本、反馈painter、两个阴影测试；没有移植来源父分支、idle后续实现、health painter、UTF-8序列化或图片模式改动。

**当前结论只到源码/Host通过。** 未开PR、推送、构建官方候选或操作GUI/MCP。#676原图12为私人Library，本轮未访问原图；不能据源码认定“看起来不悬空”。TASK-25.5在主树为旧状态、PR684已有PC21新增未验AC，本切片仅只读参照，未改Backlog或勾AC。

## 产品行为及边界

- 仅正式officialAssets且启用battlePortrait时，在现有officialFigure里增加一个groundShadow。默认/禁用profile不增阴影，不加输入触点或新动态资源池；raycastTarget=false，作为首个子控件排在随后创建的绘制页之前。
- 椭圆图片/颜色/宽高比复用现有lagavulin地面影。中心和宽度取冻结approved idle中alpha≥128的最低脚部范围：位置 `[1.5,-93]`，尺寸 `[127,15.875]`，不改7303条人物绘制记录。
- 阴影继承同一个figure宿主的动作位移和缩放，反馈painter只为player同步死亡alpha。暂停、回战、重开、release/destroy沿用原宿主生命周期；不另管死亡时钟，不触碰敌人血条或状态。
- 新增一个静态image是源码/生成树事实，不是官方容量、内存、帧率或平台性能读数。

## 本轮验证

Node24.18.0、既有node_modules与固定Luacheck1.2.0副本；TMP/TEMP使用工作树外根 `.artifacts/release-pc-ground-shadow-1115/tmp`。所有失败、过渡版本通过和最终通过日志均保留为无损gzip，`receipt.json`记录原字节及压缩字节SHA/长度和7个限定输入的物理摘要；不是完整source/CI packet准入。

| 入口 | 实际结果 | 证明范围 |
| --- | --- | --- |
| 来源 `node --test --test-concurrency=1 tests/player-ground-shadow.test.mjs`，仅测试先移植到Release | RED 0/2，失败2 | 布局缺groundShadow；Host也找不到控件。不是基础设施失败 |
| 同入口，仅最小生产补丁后 | GREEN 2/2 | 来源原有层级/脚位、7303绘制数、非输入、HP避让、死亡alpha、暂停返回、重开与释放合同 |
| 同入口，最终增强版本 | GREEN 2/2 | 实际不透明足部行和阴影在完整2.2秒idle周期及非等比action变换后同处地面；姿态调用前后完整Run/RNG递归相等（**没有排除elapsedSeconds**，此段不调用Host update）；怪物GetChild禁止进入officialFigure玩家路径 |
| 9个现有JS文件，串行 | 67/67，无skip | build/flags/equivalence/feedback/lifecycle/game-lifecycle/V25-profile、original-monster-death、native-enemy-portraits。保留默认关闭、原setter序列、失败/重入/取消、死亡、怪物42种构造器等既有断言和预算 |
| `node scripts/check-engineering.mjs` | PASS | 351模块、6166/6166测量、1988依赖边、无新增静态诊断、6项历史告警、2215受管职责测量；原render≤10与范围函数≤15门槛不变 |
| `git diff --check 36b9b157… HEAD`，暂存完整差异检查 | PASS | 提交前以及冻结产品后都检查；未放宽空白或工程规则 |
| `test-affected --fast --base 36b9b157… --plan` | **full=true，未执行Full** | 原路由要求Shared build/test infrastructure: scripts/build-ui.mjs；未用局部测试代替完整准入 |

现有67项的完整命令及逐项输出见 `targeted.log.gz`。中间 `green-boundaries.log.gz` 检查若干idle步；最终 `green-boundaries-final.log.gz` 对应当前产品中44×0.05秒完整周期版本，没有删原断言。`green-source-test.log.gz` 对应未增强的原来源测试。`red-source-test.log.gz` 保留真实RED。

## 未验与交接

独立审查 `/root/pc_backport_audit` 对精确产品head/base给出 **PASS_SCOPED**、无代码发现，见 [review.md](review.md) / [review.json](review.json)；未重复回归。它独立重算足部几何和最低band，核对三生产文件新增/删除行与8b1来源相同、无health painter，并读原日志核SHA。审查只绑定产品切片，未审整个集成HEAD、未批准合并。CI/source组合、原路由Full及正式候选由主线程统一接续；当前结果不能当作Release准入。官方导入、新ready、同候选容量、PC/实体手机视觉/足部运动/死亡帧序均**UNVERIFIED**。源码默认关闭不退化与Host行为通过不能代替这些设备证据。

只读归档复核可用 `node docs/evidence/release-pc-ground-shadow-20261115/verify.mjs`；它核查既有收据和压缩日志，不重跑产品、不触发CI或设备。
