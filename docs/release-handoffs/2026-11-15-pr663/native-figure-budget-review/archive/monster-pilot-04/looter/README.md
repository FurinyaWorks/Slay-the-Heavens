# 窃金客 / looter：盗宝团斥候原生几何试制

状态：视觉候选，待用户确认。没有修改正式运行时、默认配置、分支或发布。

## 明确参照
- HoYoWiki 官方托管的 Treasure Hoarders - Scout，条目 2202：https://wiki.hoyolab.com/pc/genshin/entry/2202?lang=en-us
- 已下载并查看完整官方条目头图像素；见 source.json 的 URL 和 SHA256。没有用旧 AI 生成稿反推。
- 保留：浅棕短发、双眼、深色蒙面巾、白短袖、斜跨胸带、棕色前臂布条、腰带扣与侧袋、橄榄色七分裤、左腿绑带和黑短靴，以及两臂抬起、双腿分开的原型姿态。
- 简化：小金属铆钉、裤腿纹绣、鞋带和手指；大块材质和主要姿态优先。没有发明装备或改成其它盗宝团职业。
- 官方头图仅作本地参考；公共归档只包含链接、hash 和自制几何，不包含 official.png / entry.json。该图 CDN 为 event-ugc-hoyowiki，不声称独立画师署名或原始工作室素材归属。

## 原生预算与验证
- 113 个图元 + 4 个控制器容器 = **117 个实际控件**，不含战斗宿主及 HUD。
- 无遮罩；三角形使用原生 100003；锚点与 pivot 为中心、scale 1；每片最多一个 XY 倾斜轴。最大重建顶点误差 1.43e-14。
- exact Release `33d71575c5f186a1b54f7bf3e4f1826c145aa1d9` standalone PortraitController VM：PASS，120 静态待机帧没有图元写入，释放后零存活控件。
- 尚未验证 MonsterArt 实际宿主、官方 GIL 容量或真机性能，不可当作生产已落地。

## 复现
在归档目录执行 `python looter/render.py /path/to/exact-release`；依赖 NumPy、Pillow 及精确 Release 现有三角放置工具，不需要官方原始 PNG。用第三批归档的 `standalone-probe.mjs` 在精确 Release 目录验证本布局。

首次 171 控件草稿压缩到 117；删除被覆盖的头底、合并材质面，保留双眼和腿绑带。171 草稿不是候选，不需要归档。
