# v2.0.0 主菜单 · sts1-pc-20261121

Owner 本轮要求初代 PC 主菜单还原，标题「杀戮原塔2」、开始游戏、退出游戏、有效会话继续本局；无其他菜单项。唯一构图来源：https://interfaceingame.com/screenshots/slay-the-spire-main-menu/ ，原图 https://interfaceingame.com/wp-content/uploads/slay-the-spire/slay-the-spire-main-menu.jpg 。未使用初代以外菜单参考。

`design-hd.png` 是按该截图绘制的正式新修订，`background-hd.png` 是同稿去字绘画源。先绘画，再分别提取天空、暖光、塔身、云顶、斜云、前景云和金色标题的稳定轮廓；`background-low/medium.png` 与同名 JSON 是低/中精度原生拟合对照，不是运行背景。新稿尚未得到 Owner 对具体成图的视觉批准，索引如实登记 CURRENT_IMPLEMENTATION；旧批准稿保留原始字节并标 SUPERSEDED，不能把授权实施等同最终画质批准。

`experiments/sts1-menu-fit/fit.py` 可复现：依赖 Pillow、numpy、opencv-python-headless、Shapely 2.1；读取此目录绘画，不使用原图运行贴图。主体轮廓手工语义分层，局部网格的密度由区域单独确定，颜色取源稿覆盖区中位数。不是高清全图随机三角化。标题独立金色语义遮罩保留字腔，轮廓底色和局部高光分层。塔下半部亮橙裂隙单独分配48图元上限。`compile.mjs` 在离线阶段预求原生三角形变换，正式构建无需逐面三角拟合。

实现：`scripts/menu-red-scene.mjs` / `scripts/native-menu-approved-layout.mjs`，沿用稳定 scene 和输入接收器。正式数据为 `data/presentation/native-menu-sts1{,-logo}.json`；运行时仅原生库 100001/100003，未引入绘画 PNG。

对照、四态、真实 Lua 会话证据、预算和性能限制见 [验收记录](../../../../evidence/sts1-main-menu-20261121/README.md)。源稿是按指定游戏截图生成的派生视觉参考，游戏权利仍属原权利人；不声明额外素材授权或字体许可。
