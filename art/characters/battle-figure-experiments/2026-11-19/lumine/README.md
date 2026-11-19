# 荧 · 战斗站姿原生图元试样

**本页是已拒绝的 342 图元样片，保留作历史对照。** 新参考试样见 [499a8366 重拟合](rework-499a8366/README.md)。仅供开发分支评审，不接正式战斗、不改 Release。 原稿来自 [#744](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/744)，固定提交 `95f0bb3368d41229c1ab8970ade86ddbad388b5c`。以队列最左侧荧的姿态、比例、右朝向、左右脚落点和持剑轴为准，风格图仅参考大色块、硬边平涂。未生成新图、未使用原图纹理；无背景和遮罩。

![原生编辑器导出 4 倍画布](native-4x.png)

## 对象与开销

- 342 个原生三角图片（资产 100003），分组 60/60/60/60/60/42；6 个组、1 个角色宿主，**角色子树 349 控件**，独立试样再加界面根为 350。另有 1 个模板定义，不计入实例。头部 157、衣服 82、腿靴 36、披带 26、手臂 14、武器 27。
- 矢量画布 133×133，角色源裁片为原始坐标 `[0,325,221,866]`，按比例居中。原地保持站姿；静态完成后无逐图元刷新。342 档优先保证五官和脚踝，317/271 档出现边缘和局部断裂，未选。
- 规范化编辑器 JSON 207,888 B；本目录保存同数据的紧凑版 145,853 B。六段原生 Lua 绑定前合计 75,491 B，存档中绑定后合计 75,545 B。独立试样 GIL 108,244 B（相较 25,793 B 清理底样 +82,451 B），**不是正式包大小或平台容量值**。
- 保住站姿、花饰、琥珀眼、蓝白衣服、金色护手和斜剑。略去细发丝、花瓣描边、金边与剑柄纹样，不用把统计值当美术批准。原稿与拟合可用下方复现命令得到同尺寸 133² 和 532²。

## 复现

从继承 #744 参考资产的仓库根执行，输出目录必须全新。Python 3.12；本轮 Pillow 13.0.0、NumPy 2.3.5、OpenCV 4.12.0、Shapely 2.1.2、FastAPI 0.141.1、Pydantic 2.13.4。使用已准备好的仓内 Node 依赖（含 Fengari）、仓库既有 Image Editor `1475505/Miliastra-image-editor-webui@103025f9095d8089e3f9bf097f4d0c5fe039d546` 和现有 MCP 工具 `8itlab/genshin-miliastra-mcp@bcc75795ebf17271612332fc81645336686bd94c`，以工具文档准备依赖。

```sh
A=art/characters/battle-figure-experiments/2026-11-19/lumine
O=/absolute/new/lumine-offline-run
mkdir "$O"
python "$A/replay.py" --repo "$PWD" --editor "$EDITOR" --output "$O/art" --level 6
python "$A/export-batches.py" "$EDITOR" "$O/art" "$O/batches"
export LOCALAPPDATA="$O/appdata" MILIASTRA_SAVE_ROOTS='[]' MILIASTRA_ALLOW_LIVE_WRITE=0
BASE=$(node "$A/prepare-base.mjs" "$MCP_TOOL" "$O/base")
node "$A/pack.mjs" "$MCP_TOOL" "$BASE" "$O/batches" "$O/save"
node "$A/check-lifecycle.mjs" "$MCP_TOOL" "$PWD/node_modules/fengari" \
  "$PWD/tests/fixtures/image-editor-103025-checker.cjs" \
  "$O/art/literal-drawing.json" "$O/save/gil-proof.json"
```

拟合为描原稿可见边界与分层色面，复用 `scripts/art/segment-lowpoly.py` 的原生几何和 `native-triangle-placement.py` 的单轴求解，画布无裁剪节点；逐层参数见 `facets.tsv`、固定 level 6 和 `fit-receipt.json`。Image Editor 重新导出实际 JSON/Lua/PNG，不从预览反推运行数据。仓库不带底样或派生 GIL，使用上游公开测试底样在云端复现，不接项目真实存档。

## 验证边界

- 两次导出 9 个绘制文件逐字一致；两次打包 GIL 逐字一致。回读 6 个宿主的真实模板索引和绑定 Lua，Fengari 执行 342 控件的资产、坐标、旋转、颜色、顺序、创建与释放；注入空实例、设置失败后清理及重建均通过。证据见 [GIL](gil-proof.json) 与 [Lua](lua-lifecycle.json)。
- 独立复核已核对参考身份、画面与全部 342 组原生记录。阈值 127 的透明轮廓交并比 133² 约 87.2%、532² 约 87.8%，133² 外接框差不超过 1px；只作视觉辅助，不是验收门槛。
- **待确认：** Owner 画质、官方客户端导入／渲染、手机与 PC 的性能。当前没有接其他角色，收到画质确认再复用到另一种体型。
- 角色为项目内部拟合研究，非授权商业形象。导出原生绘制 Lua 复用刘力 MIT runtime；保留旁附许可与来源记录。原稿权利说明跟随 #744，不由此扩大授权。
