# 芙宁娜 · 异瞳与脸颊小修

以 Batch 01 的原生图元为基线，不重画人物。角色自己的左眼（这个右朝向姿势里的远眼、画面右侧）由浅蓝调为深蓝 `#174594`；右眼保留浅蓝。加六块同肤色三角，补面颊边缘的蓝色碎点。直接 133×133 只有眼睛和脸颊的 10 个像素改变；透明度和其他部分完全一致。4 倍直接渲染 62 个像素改变，透明度也一致。

488 个原生图元＋9 分组＋1 宿主＋1 界面根＝499 控件。离线夹具 GIL 143,467 B，重复导出和打包逐字节一致；全部控件的 Lua 创建、回读、清理和异常恢复通过既有离线测试。未做游戏导入或手机/PC 实机，不改正式战斗或 Release。

用 `replay-delta.py` 从上一级 `editable.json` 重放原生参数，再沿用 [Batch 01 replay.py](../../replay.py) 核对导出：

```sh
mkdir -p "$OUT/inputs"
python "$FIX/replay-delta.py" "$FIX/../editable.json" "$OUT/inputs/editable.json"
cp "$FIX/verification.json" "$OUT/inputs/"
python "$FIX/../../replay.py" --editor "$EDITOR" --candidate "$OUT/inputs" --output "$OUT/art"
```
