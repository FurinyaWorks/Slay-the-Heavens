# TASK-25.7 旧怪物拟合接续与切换修复

2026-11-18，基线 `c2409ad750c15124b7b843c6bbfa5b222537cb75`。沿用 `feat/monster-fit-study@d31c400972d380d119c48e4ef92573670cd5a2e8` 的八份实验/说明文件，保留原分支。仅修独立实验控制器，不更改正式怪物登记、生产素材、战斗规则或发行分支。

## 本轮实际执行

从 Git LFS 取得石颚兽与六瓣火轮旧源图，逐字验证 LFS OID、asset 与 source-review 的 SHA256 一致；两图仍仅为 `PASS_SOURCE_CANDIDATE_ONLY`，没有 Owner/native/device 批准。重新盘点 41 份旧源元数据，未将其误记为逐图新验收。Python 环境为 Pillow 12.3.0、NumPy 2.2.6、OpenCV-headless 4.12.0.88、Shapely 2.1.2。

用原拟合器在本轮隔离树重新执行六档，同源、透明轮廓、16色和256工作分辨率均不改：

| 源图 | 100预算实际绘图 | 200预算实际绘图 | 400预算实际绘图 |
| --- | ---: | ---: | ---: |
| jaw_worm | 98 | 188 | 399 |
| hexaghost | 100 | 197 | 398 |

数量与原报告吻合；本轮用实际 shape 类型核算原生图片成本，任意三角仍按两个半幅图片计。这里只证明几何输出与预算，旧报告的宿主、容器、整屏实例与 SDK 墙钟没有本轮重新测量。

当前生产 Lua 的真实 `geometry` 返回石颚兽 173.33、火轮 300 设计单位。本轮几何对照按这些尺寸同时显示原图和100/200/400档；它用 Python 绘制拟合几何，**没有重放 SDK 的材质、三角变换矩阵或官方画面**。独立视觉检查仍认为100/200损失过大，400仅可继续人工比较：石颚兽眼睛、颚牙与足部连接不足；火轮保留六瓣及中心孔，但内部火焰、曲面细节明显损失。不能据此授予正式采用 GO。

## 已复现并修复的缺陷

原控制器在当前 A 尚存活时执行 `Request(B); Request(A); OnUpdate()`，第二次请求仅增加 reuse 计数，未清掉排队 B，下一帧实际切走。旧实现还在请求阶段增加实例 generation，取消替换后保留的 A 回调会失效。

本片分别维护待处理请求与已提交实例的 generation；同身份复用清掉待替换请求，仅在真实替换或关闭时退休实例回调。原始代码执行新回归真实退出1，命中 `LATEST_REQUEST_LOST`；修复后退出0，四组通过。独立复审另将 generation 重新放回 Request 做负控，回归能捕获保留 A 的回调失效。

新增 `experiments/monster-low-budget/switch.test.lua`，执行实际控制器，不复制待测逻辑；最小 host/game 替身只记录创建、销毁和回调结果。覆盖最新请求保留、多次替换只创建最后请求、关闭取消排队、旧回调拒绝、重开新 owner、重复关闭及零存活 surface。它不是 SDK 或正式 actor manager 验收。

## 证据和接续

原始记录见 [本轮证据](../evidence/task25-7-fit-replay-20261118/replay.json)、同目录 fit-receipt/source-inventory、红绿输出与 manifest；[几何对照](../evidence/task25-7-fit-replay-20261118/geometry-comparison.png)和采集脚本也在同目录，摘要由 manifest 绑定。六pack可用原 fit.py 和本页固定依赖重建，源像素继续保存在原 Git LFS，不重复入库。采集脚本保留本轮实际工作区路径，是原始执行记录，不承诺跨机器自动配置环境。避免把重建图误称官方截图。原11-14 SDK 报告独立保留，不改写为本轮收据。

本轮 `verify:backlog`、`check:guidance`、`check:syntax`、单文件 Lua 回归及 diff 检查通过。受影响规划要求 Full；本轮未跑完整 Quality、未请求自动合并，仅保全实验候选。源 PNG 的临时 hydration 已恢复，不把像素文件误提交为源码变更。

TASK-25.7 保持 `In Progress`，全部五项 AC 不变：原生材质与实际显示、图库同条件对照、完整创建/变更调用、官方容量、PC/实体手机以及 Owner 采用确认仍缺。继续本任务时先用修复后源码重新执行 SDK runtime/switch/compare/verify；取得同候选的实际证据后才考虑视觉批准或正式采用，不重复领取 TASK-25.6/#710 的生产图接线。
