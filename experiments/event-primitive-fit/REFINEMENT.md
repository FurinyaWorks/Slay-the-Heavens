# 默认随机事件：同上限可辨识度复验

固定 7 张登记原稿、330×330 显示范围与 60 图片控件上限。复用 TASK-94，减少背景碎片，按原稿可辨识特征（圣职者头盔和双手不同光效、黏液泡轮廓等）分配图元。矩形版本仅作为对照。局部轮廓版的关键部位加权像素误差相对原自动档下降 19.4%–25.6%，**这是离线误差，不是用户评分**。

7/7 轮廓原型用 BeyondSimulator 0.5.2 打开并导出：每张单独显示时 60 个图 + 1 个根，总共 **61 个控件**。独立 GIA 53,425–54,589 B/项，合计 378,375 B；对照此前七张 364,285 B，增加 14,090 B（一些原图元数未用满上限）。独立 GIA 不是正式 GIL、服务器容量或设备性能。

单独看对照图：圣职者、净化神龛、黏液金币和升级神龛的主体更易辨认，仍有底座细节缺失。金翼的轮廓与对照各有优劣；闪耀之光先保留原拟合的人影与光束；鎏金石龛两版都不够像金面具和石坛，不用成绩替代美术批准。不将七张整体换入产品；下一轮把预算从背景/亮点让给主体和基座，不默认加控件。

## 复现

在相同依赖和工具基线，以原 README 的 fit.py 命令生成 7 张基线，最后附上 `cleric purifier goop upgrade_shrine golden_wing shining_light golden_shrine`（7 个 ID）。逐项确认源 PNG SHA 和 baseline MAE 与原收据相同，再运行：

    python experiments/event-primitive-fit/refine.py build/event-fit <独立PNG目录> build/event-fit-cue-rect
    python experiments/event-primitive-fit/contour.py . experiments/event-primitive-fit/fit.py build/event-fit <独立PNG目录> build/event-fit-cue-contour build/event-fit-cue-metrics.json
    node experiments/event-primitive-fit/export.mjs . build/event-fit-cue-contour build/event-fit-cue-native --mirror-left-masks --expected-count=7
    node experiments/coop-primitive-lab/run.mjs build/event-fit-cue-native/scenes

转换默认仍要求 49 项，`--expected-count=7` 仅用于此显式子集。只归档脚本、SHA、离线指标和独审选择，不上传待审源图、几何数据、GIA 或第三方参照。无游戏代码、Release、官方导入或手机更改。
