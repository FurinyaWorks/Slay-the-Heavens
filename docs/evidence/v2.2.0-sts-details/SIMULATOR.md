# 正式发布样式下的预览验证

两侧都由正式 `official-assets-battle-v3` 配置从源码生成完整 GameUI。基线 `95b003d41a229218916d20785145cd4a7e9583fe`，候选的生产源码 `01863013d8647e991187b945b7f509b075637f33`，候选源码树 `022b52a9b26cfa82289afcee1787507531d9b949`。主题文件与锻造中现有两张卡和两个按钮的四棵生成子树逐字段相同。在 1600×900 下分别对幻影、普通攻击的升级确认页裁剪前后两卡与两个按钮，八个区域变化像素都为 0。[像素比较](forge-pixel-comparison.json)

- [桌面画面](simulator-pc.webp)记录实际指针输入下的巢穴基线与候选、两张卡的关键词、金神像遗物、旧伤诅咒、商店横向边界。1600×900 商店卡中心位于画布 81.48%，说明框向左。2100×900 同一货位位于 73.99%，说明框向右。
- [模拟触屏画面](simulator-touch.webp)记录长按与松手后保留的卡面及关键词。事件由移出原热区或下一次按下关闭。锻造用已有详情返回按钮，详情打开时由模态层接收输入，返回后恢复锻造操作。
- [回放清单](simulator-manifest.json)记录实际拾取控件、语义颜色、计时、视口尺寸、截图摘要、增量控件提交及原生 SDK 文字行。前一候选的力量说明文字框只能渲染 1/2 行。最终候选由同一文字光栅验证完整 2/2 行。
- [原版对照](sts1-reference.md)列出原版参考、语义配色、阈值与坐标。原版移动端的松手及取消细节仍待真机核实。

夹具按确定性种子进入房间，随后通过 Beyond Simulator 0.5.2 SDK 拾取原生控件并回放指针。画面由该 SDK 原生 PNG 软件光栅器输出，拼图仅排列、缩放及加帧标签。游戏画面使用仓库正式生成的原生图元及同一图库 ID。外部 STS1 参考图只在原版对照中以链接提供。

状态比较覆盖 Run、路线、资源、牌组及 RNG，排除随帧增加的计时字段。另实际点击取消、确认和事件选项，逐项校验预期提交。各只读场景 120 帧记录的是模拟器 CPU 墙钟和场景增量，主要以零重复提交、控件数稳定及销毁回零判断。官方 GIL 读回、同候选导入和实体 PC/移动设备验收仍单独执行。

## 复现

使用 Node.js 24、Beyond Simulator 0.5.2、Python、Pillow 12.3 和 DejaVu Sans。在两个干净工作树准备好正式构建引用的 Git LFS 资源。`evidence_dir` 指向新建输出目录，`case_dir` 指向本复现脚本目录，`base_checkout` 与 `candidate_checkout` 为对应源码工作树。

```bash
npm install --prefix "$evidence_dir/deps" --ignore-scripts --no-audit --no-fund beyond-simulator-mcp@0.5.2
sim_dist="$evidence_dir/deps/node_modules/beyond-simulator-mcp/dist"
node "$case_dir/export-source.mjs" "$base_checkout" "$evidence_dir/base-source" 95b003d41a229218916d20785145cd4a7e9583fe
node "$case_dir/export-source.mjs" "$candidate_checkout" "$evidence_dir/candidate-source" 01863013d8647e991187b945b7f509b075637f33
NODE_USE_ENV_PROXY=1 node "$case_dir/replay-official.mjs" "$evidence_dir/base-source/game.save.json" \
  "$sim_dist" "$evidence_dir/base-pc" pc-16-9 baseline
for canvas_preset in pc-16-9 pc-21-9 mobile-19.5-9 mobile-4-3; do
  NODE_USE_ENV_PROXY=1 node "$case_dir/replay-official.mjs" "$evidence_dir/candidate-source/game.save.json" \
    "$sim_dist" "$evidence_dir/$canvas_preset" "$canvas_preset" candidate
done
python "$case_dir/compare-forge.py" "$evidence_dir/base-pc" "$evidence_dir/pc-16-9" "$evidence_dir/forge-pixel-comparison.json"
python "$case_dir/montage.py" "$evidence_dir/base-pc" "$evidence_dir/pc-16-9" "$evidence_dir/pc-21-9" \
  "$evidence_dir/mobile-19.5-9" "$evidence_dir"
```

`baseline` 模式保留预期缺陷的失败断言。候选对任一失败返回非零。Lua 执行异常、图库告警、渲染异常与控件释放失败在两种模式均返回非零。
