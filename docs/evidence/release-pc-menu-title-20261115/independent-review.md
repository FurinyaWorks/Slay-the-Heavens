# PC01 精确独立复审

结论：**PASS_SCOPED**。本片标题、开始/退出样式及Continue静态四态/会话事务保留范围无新增代码问题。发现一项既有P2动画边界，见后文；不批准合并，不称整个Release组合或冻结来源CI通过。

被审工作树 `F:/New folder/.worktrees/release-pc-menu-title-1115`；base `36b9b157ee6f05b65eb9f1da7e2978647d36c210`，精确HEAD `8ee25feb4857092ad0458b8890bebe7cc988c3c7`，单一base父。25路径中仅3个产品路径：`scripts/v25-menu-layout.mjs`、`data/presentation/ui_theme.json`、`data/presentation/menu-title-mark.json`；1个既有测试文件及21项证据。复审者仅曾只读核对来源，未参与本片实现。

## 源码与原始证据

- 静态描摹JSON与fbfc3dfd原始字节完全相同，SHA256 `e1b8e8b19b881465f80d9ae7d96f4e857ff2d5f70f5835788d5ff15252f77698`。378三角来自既有入库供图描摹，未重新创作或访问私人原图。字形源点范围x68.134–421.053、y120.893–233.369，配套badge等同源形状均位于原画布左上清空区；不冒称官方像素对照。
- 布局选择性移植最终titleMark、按钮face/arrow/line与托底；theme严格仅改labelX/hoverSeconds/leaveSeconds/lineRestAlpha/accent五字段。背景、Lua、字体、导航及规则代码未改。没有整文件覆盖较旧菜单源：Release的Continue style、start+64定位、原hit对象和事务均保留。
- titleMark置于已有v25MainMenu中；legacy结果标题仍按原规则隐藏/恢复。装饰chrome在start、Continue、quit之前，均无新增cursorArea/focus脚本，原280×56点击区未随视觉运动。原Host指针/触点/控制器焦点与结算命令仍沿原owner和generation gate。
- 四态静态图组沿既有V25.button/pointer切换；开始/退出的动态line writer沿旧animateMenu。结果页由已有not-outcome显隐及同一session状态负责，不新建输入监听或结果页UI。真正生成的official/V25布局各只有一个416控件titleMark；默认皮肤无该标题，背景子树与旧menuRedScene保持同一。
- 只读校验16份压缩日志的原始SHA/长度，以及source-bytes归档11个原始字节binding与各自来源/HEAD的LF规范化一致，保留base缺失标题资产的明确absence。查看RED、GREEN、Host12/12、start hover连续性、四态/结果41与三profile生成及对应主题全树Host输出；未重复整套测试。初次主题错配与CLI用法失败保留，未改产品迁就验证器。
- 源码归档只含声明的基线/供稿/执行文件，不替代正式来源packet闭包。preview-mask实际13PASS、2冻结来源FAIL、1可选浏览器SKIP，均如实保留，不能称完整CI通过。

## 既有P2：Continue动态line未推进（非本片引入）

`src/lua/abyss_v25_menu_view.lua::animateMenu` 只推进start和titleQuit，不推进continueRun。独立最小真实模块探针使用相同的pointer与animate入口，结果：

`startAlpha=255 resumeAlpha=0 resumeFaceHover=true`

探针exit1，原始脚本及日志 `pc01-continue-writer-probe.{lua,log}` 保留在本目录，SHA/长度见JSON。说明Continue的静态hover face确实可见，但动态menuAccent线没有得到writer。该Lua文件与Release36逐字相同，属于已有边界；本片没有引入、也没有修好它。主线程已明确本片不扩大Lua范围，按非阻塞既有P2记录。**不得把start hover或41断言泛称为Continue动画也验收通过。** Continue静态四态、定位、焦点/命令与继续原局是本片回归范围，相关结果仍成立。

## 许可、私图与未验范围

没有新增私人PNG/截图、原版纹理、字体或新外部素材；入库JSON保留原reference哈希，既有项目LICENSE与素材边界未改。没有看过私人原附件或新的官方画面，不声称新稿审美、原图像素匹配或设备效果通过。

source/CI continuation、Full、正式GIL、官方导入/新ready/容量、PC与受影响手机视觉仍未验。新增控件计数只是生成树事实，不能移用旧候选容量或SDK性能。未进行GUI、候选构建、产品/Backlog修改、推送或PR操作；后续组合仍须原Release准入。
