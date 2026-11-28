# v2.2.0 怪物接地实渲对照

以发布分支基线 `5ccff59e9df396849216fb3f790be8852974c769` 对照本修复，逐边重新生成正式 `official-assets-battle-v3` 的布局及低多边形怪物 Lua。左右均保留正式两幕布景与原构造器阵容坐标，画布为 16:9。原始 PNG 均为 Beyond Simulator 0.5.2 软件 Host 的 1600×900 截图，纹理告警为零。两边的原始图与存档摘要、生成 Lua 摘要、每个敌人的艺术图元数、接触、血条和热区坐标见 [实渲清单](simulator-manifest.json)。

- [双赤甲虫和 Collector 的两列整图 A/B](priority-louse-collector.webp)
- [第一幕双赤、混合甲虫、小魔群和小史莱姆](act1-formations.webp)
- [第二幕 Collector、铜制人偶及小魔头领的生产召唤](act2-summons.webp)
- [巡风隼保持飞行、实际 Strike 击落、头槌及恢复 Flight](act2-byrd.webp)
- 42 个正式怪物等像素局部 A/B，[01](official-monsters-01.webp) · [02](official-monsters-02.webp) · [03](official-monsters-03.webp) · [04](official-monsters-04.webp) · [05](official-monsters-05.webp) · [06](official-monsters-06.webp) · [07](official-monsters-07.webp)

Collector 依据原版实战保留高位。第 33 层正式 Boss 入口选择其专用场景，场景台座的座面承接现有立绘底部的暗椭圆，台柱落在第二幕地砖上。A/B 中 Collector 的位置、立绘尺寸、血条、意图和热区坐标逐项相同。由角色真实结束回合触发两只 Torch Head；召唤后仍选中同一套高位背景。原版画面可看到右侧 Boss 坐在抬高的树根，两只 Torch Head 在下方地面。[STS1 实战截图](https://wikiwiki.jp/slaythespire/%E3%82%B3%E3%83%AC%E3%82%AF%E3%82%BF%E3%83%BC)

逐只清单取自 `tests/lua/native_enemy_portraits.lua` 使用的同一份生产定义。小魔头领由生产阵容加入两只随从。重点场景使用生产阵容构建并提供确定性随机输入。第二幕校验真实场景切换，全量逐槽核验图元与坐标。第一幕 229 个可见布景控件，第二幕常规与 Collector 各 249 个。三只巡风隼来自第二幕种子 10 的生产遭遇，领头鸟从合法的 1 层 Flight 开始，以战斗 UI 出 Strike 击落，再经实回合经历眩晕、头槌和重新飞行。两侧相同输入经过 Fengari 中的生产战斗和 UI Lua，Beyond Simulator Host 渲染其控件快照。几何测试验证热区和交互，正式 GIL 导入、官方客户端和最终包设备验收仍待同包进行。

## 复现

需要 Node.js 22+、Python 与 Pillow、DejaVu Sans 和两个独立的检出目录。在两个检出目录安装 `npm ci`。用 Git LFS 在两边填充 `art/characters/traveler-geo/portraits/{avatar96,battle133}/preview-native-1x.png`，正式生成会验证原始文件内容。基线检出为上文完整提交，候选检出为本修复。然后从候选根目录执行以下命令。

```bash
npm install --prefix /tmp/v220-grounding-sdk --ignore-scripts --no-audit --no-fund beyond-simulator-mcp@0.5.2
export ART_LAB_MCP_ENTRY=/tmp/v220-grounding-sdk/node_modules/beyond-simulator-mcp/dist/index.js
bash docs/evidence/v2.2.0-enemy-ground-contact/simulator/reproduce.sh \
  /path/to/baseline-checkout "$PWD" /tmp/v220-grounding-capture /tmp/v220-grounding-atlas
```

如环境通过 HTTP 代理访问图库，可使用 Node 24 并设置 `NODE_USE_ENV_PROXY=1`。每侧保存 54 个实际 Host PNG、相应存档与回执。复现脚本分别调用有正式低多边形配置的 `buildUI`、Fengari 夹具、Beyond Simulator MCP 试玩截图和 Pillow 拼图。
