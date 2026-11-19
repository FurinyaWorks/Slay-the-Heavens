# 芙宁娜 · 按设计稿一起重描发型和脸部

以 Owner 提供的原图（SHA-256 `bc9118f85b57b2ca70ec027c43a520c3bb2d0f403e4f0f6e167d4297c63a1ff5`）为画面标准，从用户原图分色描出刘海、后发束、两侧垂发和面部；[上版](../source-face)只用于对照。右朝向姿势下仍是角色左眼（画面右侧）深蓝、右眼浅蓝。参考原图不进仓库。所有出图变化局限于头部，其它区域逐像素相同。

选分色 C：与原稿头部颜色更接近，但刀口式发梢仍有明显几何折线。此为评审候选，未实机。488 原生图元＋9 分组＋1 宿主＋1 根＝499 控件。离线夹具 GIL 143,308 B，双次导出/打包一致，全部 488 图元精确回读、创建/清理及注入错误恢复通过；不接产品或 Release。

从此前 [source-face](../source-face) 的确切 editable 用 `replay-delta.py <previous-editable> <output-editable>` 重放，随后将 `verification.json` 复制进输出 editable 的目录，按上级 [Batch 01 replay.py](../../replay.py) 复现实际 PNG 与 Lua。
