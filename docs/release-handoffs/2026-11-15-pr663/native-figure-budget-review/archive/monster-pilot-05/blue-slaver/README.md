# 蓝衣束缚者：盗宝团拳术家低预算候选

对应实际 Act1 `blue_slaver`，沿用 roster 的 `treasure-hoarder-pugilist` 映射。参考 HoYoWiki 2200 的实际头图（来源 URL 与 SHA 见 source.json，原像素未纳入交付）。已逐像素查看参考后制作。

保留短灰发、可辨双眼、棕色蒙面、黑褐无袖背心、粗壮裸臂、右前臂护具、宽腰带几何徽记、灰绿裤装、浅色护膝裹腿及双拳备战姿势。胸前复杂纹章仅保留两个淡色折面；没有为了名称“蓝衣”擅改原型颜色。

115 图元＋4 预计原生容器＝119；不含血条、意图、状态等战斗 UI。零蒙版；仅原生三角形。解算重建最大坐标误差 < 3e-14；逐行校验没有双轴旋转叠加。此文件是候选，尚未真实引擎/移动端验收。

复现：`python render.py <exact-repository-root>`，使用仓库已有 `scripts/art/native-triangle-placement.py`。Python 需要 NumPy/Pillow。输出 native-layout.json、native-reconstruction.png 与 report.json。未更改正式怪物、战斗、发布分支。
