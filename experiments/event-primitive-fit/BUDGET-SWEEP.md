# 默认七事件：49 控件拟合预算实测

从上一轮独审偏好的六张版本中减去低影响形状，按 48/52/56/60 图片控件试跑（每张再加一个根容器；允许少一个而不补空控件）。全 24 个样本在 BeyondSimulator 0.5.2 中打开、渲染、逐个导出；默认七张选 48 图元+根容器，其中鎏金石龛使用原有手工版，组合后全部再实际导出一遍。

- **每张 49 控件，7/7 单独导出合计 306,115 B**（约 299 KiB）。和上一轮偏好版本加精简鎏金石龛的实测分件和 369,567 B 相比，少 63,452 B（17.2%）。
- 330×330 截图及其缩至 180×180 的独立对照中，圣职者、黏液金币、升级神龛、闪耀之光、手工鎏金石龛可作为识别预览；不是生产验收。净化神龛石盆、金翼雕像金币在高档也不够清楚，应手工精修而不是抬统一预算。
- 离线原始截图有越界像素，黏液金币最左超出方框 16 px。裁剪对照图会遮住该问题；正式页面如后续接入须验证裁剪、事件切换和点击。没有改游戏，也没有试官方导入、GIL 增量或真机。

[包含计数、实际导出字节、哈希、裁剪之外记录的收据](default-seven-budget-receipt.json)。本分支不包含原稿、截图或拟合资产。

## 复现

使用已核对的私有原稿和手工神龛候选，仓库生产工具见 `README.md`。先用 `fit.py` 和 `contour.py` 生成默认七张来源，随后：

```sh
python budget.py base contour production variants
node export.mjs --mirror-left-masks --budget-sweep --expected-count=24 "$REPO" variants output
node sim-sweep.mjs "$REPO" output/scenes
node package-seven.mjs "$REPO" output/native-controls.json golden_shrine-lean.controls.json selected
node sim-sweep.mjs "$REPO" selected
```

从能访问上述目录的共同工作目录执行模拟器脚本，并设 `ART_LAB_MCP_ENTRY` 为仓库实验认可的 BeyondSimulator 0.5.2 本机入口。拟合去掉完整形状，误差只用于筛选；档位选择以实际截图的独审为准。
