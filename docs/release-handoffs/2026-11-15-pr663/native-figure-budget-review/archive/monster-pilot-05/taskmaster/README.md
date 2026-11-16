# 缚役监军（taskmaster）原生图元试制

实际 Act2 敌人 ID 来自既有 roster。参照 HoYoWiki 2208 的「盗宝团·粉碎者」，近似对应武装监军的形象，不声称名称或机制完全对应。官方托管原图已逐像素查看，来源 URL/SHA256 记录在 source.json，原图不公开入库。

保留：蒙面双眼、偏斜短发、蓝色深 V 领背心、浅色短袖、双侧束腿、宽裤、大矩形锤的体量。不是另画一个自创生物。没有把蓝背心涂红以强配赤衣束缚者。

**115 个三角图元 + 4 个分组容器 = 119 绘图控件。** 无蒙版。按 60 图元/分组计算，不包含敌人 HUD、血条、状态等外围开销。

- `planes.txt` 手工平面分层稿，坐标为 127 单位。
- `render.py` 使用仓库 `scripts/art/native-triangle-placement.py` 转换并从原生变换反算重建像素，非理想多边形代替原生重建。
- `native-layout.json` 原生行数据；`native-reconstruction.png`、`thumbnail-127.png` 预览。
- `verify.py` 检查预算、行结构、无蒙版、仅单轴倾斜、原生变换误差 <1e-6 与重建字节一致。

复现：`python verify.py /path/to/repository`。需要现有 numpy、Pillow。

资格：设计预览待用户确认；只完成几何检查，未跑原生控制器、真实 Host、游戏真机或官方容量验收。未修改、绑定正式怪物配置，不影响已接受的图。
