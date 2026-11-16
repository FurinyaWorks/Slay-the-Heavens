# 蕈甲兽：陆行水本真蕈原型试制

基于 HoYoWiki [Grounded Hydroshroom，2728](https://wiki.hoyolab.com/pc/genshin/entry/2728?lang=en-us) 实际条目头图逐项绘制，不复用赤/青甲虫的细梗蕈造型。选择理由是角色名指向健壮蕈兽，宽大的层叠蕈盖与粗壮双足提供区别于普通伸缩蕈的小怪轮廓；名字无需一一对应。仅视觉对应，不引入元素规则。

114 图元 + 4 容器 = 118 控件，零遮罩；保存真实原生几何布局和可再生脚本。卷曲冠、浅色层叠鳃盖、奶色双眼面具、长颊瓣、青色粗腿为保留锚点。127px 缩略图人工复核通过可辨识性，主人尚未确认。本稿不替换其他已认可图稿。

`runtime-result.json` 是精确 Release `33d71575` 的独立 Portrait VM 检查：120 帧静态 pose，无逐图元写入；释放后无残余。它不是完整怪物 Host、实机或容量证明。第一次 probe 使用错误的工作目录导致模块路径未找到，随后以精确 Release 为 cwd 成功执行；不是实现失败，也不隐去该试运行。

重建：从归档目录运行 `python fungi-beast/build.py /path/to/exact-release`（依赖 NumPy、Pillow 及精确 Release 原生单轴放置工具，不需要官方原始 PNG）。`report.json` 记录参考来源及哈希。官方原图与条目 JSON 只留本地核对，**不应纳入公开归档**。归档文件为 `build.py`、`native-layout.json`、`native-reconstruction.png`、`thumbnail-127.png`、`runtime-result.json`、`report.json` 和本文件。没有修改 Release、启用正式配置或运行 Full CI。
