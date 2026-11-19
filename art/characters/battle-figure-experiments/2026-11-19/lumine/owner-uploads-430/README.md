# 荧 · 直传原图重描，小样 430

待 Owner 视觉验收。只用于开发实验，不绑定正式战斗或发布资产。

三张直传原件已原样保存在私有 Library；未把整图重复上传到项目。逐个 RGB 像素核对，原件画面与 [固定三档参考](https://github.com/FurinyaWorks/Slay-the-Heavens/tree/499a8366d81924dc675797f46c8cd5564d0e12d2/art/characters/battle-figure-reference/2026-11-19) 完全一致（1448×1086，每档差异像素 0），但 PNG 的字节和 SHA 各异。完整原件哈希和本次实际输入固定在 `fit-receipt.json`。原姿态参考仍锁定站姿、朝向、持剑和脚线；中档为直接逐部位重描对象，高档补读五官和构造，低档只定简化下限。

重描了琥珀眼、花饰、黑领带、蓝金边的两片衣摆、金纹靴口和细剑轮廓；不继续沿用 447 的形状坐标。先按参考提取大色块，再在同一裁切和 133×133 画布试 430、458、486。独立视觉复核在实战比例未看出后两档有足够收益，故取 430；放大时发顶更硬，脚踝与腰间蓝边仍有简化。不是高/中/低三个风格档的独立成本对照。

![430 个原生图元，Image Editor 渲染](native-4x.png)

- **430** 个 100003 原生三角图元，8 组（60×7＋10）和 1 角色宿主，共 **439** 个角色控件；独立测试界面根另计为 440。无贴图、蒙版或背景；模板定义不是实例。
- GIL **130,018 B**，与同一干净测试底样相比增加 **104,225 B**。8 个实际绑定 Lua 共 **95,785 B**。
- 两次导出/分批和离线打包一致；从实际 GIL 回读的 Lua 通过 430 条位置、颜色、顺序、旋转和创建/释放验证，也覆盖两种注入失败清理与恢复。官方导入、客户端运行、容量面板与真机帧率 **未验证**。GIL SHA-256：`92f4d93eface1f6897c78ae4f7e8d9767f211c30bf65bfe8a7fdf967e2ac47b4`。

## 重跑

沿用[父目录](../README.md)里的已钉住 Image Editor、MCP Tool、Python 依赖与离线验证规程。前三张可用直传原件或固定提交中同像素的三档文件。逐部位手描控制点封存在 `facets.tsv`，同一套仓库约束三角剖分、单轴图元摆放、Image Editor 导出与 Lua 验证。列出最终参数而不只列目标数：

```sh
A=art/characters/battle-figure-experiments/2026-11-19/lumine
P="$A/owner-uploads-430"
O=/absolute/new/lumine-owner-430
mkdir "$O"
python "$P/replay-owner.py" --repo "$PWD" --editor "$EDITOR" \
  --medium "$REFS/style-medium-detail.png" --high "$REFS/style-high-detail.png" \
  --low "$REFS/style-low-detail.png" --level 8 --budget 430 --output "$O/art"
python "$A/export-batches.py" "$EDITOR" "$O/art" "$O/batches"
export LOCALAPPDATA="$O/appdata" MILIASTRA_SAVE_ROOTS='[]' MILIASTRA_ALLOW_LIVE_WRITE=0
BASE=$(node "$A/prepare-base.mjs" "$MCP_TOOL" "$O/base")
node "$A/pack.mjs" "$MCP_TOOL" "$BASE" "$O/batches" "$O/save"
node "$A/check-lifecycle.mjs" "$MCP_TOOL" "$PWD/node_modules/fengari" \
  "$PWD/tests/fixtures/image-editor-103025-checker.cjs" \
  "$O/art/literal-drawing.json" "$O/save/gil-proof.json"
```

`editable.json` 入库时作紧凑 JSON 序列化；fit receipt 给出导出原字节哈希。直接传来的原件与固定参考重跑除记录实际输入哈希的 receipt 外，9 项产物逐字节一致。
