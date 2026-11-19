# 双人战斗容量与图元实验

[TASK-109 决策](../../docs/adr/0001-coop-and-high-fidelity-primitives.md) 的隔离复现工程。使用既有岩荧战斗参考图、TASK-94 分割和三角形工具、V25 原生图元转换及仓库的 BeyondSimulator RPC。压力工程中的敌人、卡牌、HUD 细节和特效是可数的负载样本。每端显示两名角色和自己的十张卡。A/B 分别以模拟器玩家 1/2 查看各自的投影，使用同一角色的两个独立模板实例。脚本只做表现，推进两个循环的站位、攻击及受击位移、首卡隐藏及出牌位置、特效峰值、整页战斗隐藏和复现。

## 复现

从仓库根目录执行。以下为 Bash，Windows 根据安装位置设置相同环境变量。拟合参数和运行时脚本都在本目录，所有输出目录须为新目录。

```bash
mkdir -p build
git lfs smudge < art/characters/traveler-geo/portraits/battle133/source.png > build/coop-source.png
# 已经检出实际 PNG 时直接使用仓库内 source.png。
python -m pip install opencv-python-headless==4.12.0.88 numpy==2.2.6 pillow==11.3.0 shapely==2.1.2
python experiments/coop-primitive-lab/fit.py build/coop-source.png build/coop-fit
node experiments/coop-primitive-lab/build.mjs build/coop-fit build/coop-scenes
npm install --prefix build/coop-sim --ignore-scripts beyond-simulator-mcp@0.5.2
ART_LAB_MCP_ENTRY="$PWD/build/coop-sim/node_modules/beyond-simulator-mcp/dist/index.js" \
  node experiments/coop-primitive-lab/run.mjs build/coop-scenes
node --test tests/coop-primitive-lab.test.mjs
```

拟合对同一源裁去透明外缘并复合到固定深色底，保留几何层序。三角面包含单控件单轴形式和两控件半三角形回退。三档各有一个底板图元。GIA 导出器仅写入左向水平填充，脚本挂载时为半三角形一次性恢复 V25 所需的右向填充。软件截图用于对照轮廓与细部，实机核验还须检查透明边缘、背景叠放、姿势和动作。原图授权及批准范围见 [battle133 资产说明](../../art/characters/traveler-geo/portraits/battle133/asset.json)。

`fit-*.json` 保存源图哈希、参数、工具版本、精度、光栅误差和图元。 `inventory.json` 登记每个静态根、模板及模块的控件树计数和预测。 `simulator-all.json` 保存实际 Lua 运行、每端创建及可见数、绘制列表条目、错误日志、模拟画布和产物哈希。各子目录包含 .gia 和对应的压力场景静态截图。可给 `run.mjs` 增加案例名前缀，只跑对应子集，输出位置仍须干净。

### 写入实际关卡人数

使用 [既有千星 MCP](../../docs/TOOLCHAIN.md) 的副本接口。本轮使用 Linux 上固定提交 `70470757d6fcb319c5afec13b178c87f2d8d54b3`。如使用同版本源码，在该工具目录先执行 `npm ci --ignore-scripts && npm run build:core`。实验源 GIL 是该工具库附带的公开样例 `knowledge/samples/gil/mhw64cr51fue_环境配置.gil`。也可显式传入隔离的 7.1 关卡副本。

```bash
export MILIASTRA_MCP_ROOT=/path/to/genshin-miliastra-mcp
node experiments/coop-primitive-lab/room.mjs \
  "$MILIASTRA_MCP_ROOT/knowledge/samples/gil/mhw64cr51fue_环境配置.gil" build/coop-room
```

运行先读两项 MCP 资源，锁定 `MILIASTRA_ALLOW_LIVE_WRITE=0`，在新目录用 `scene_set_player_count` 写出副本。另一次 `scene_list_respawn_points` 调用读回 1–2，原输入及输入副本哈希须相同。真实大厅行为仍需在官方房间验证。 [MCP 固定来源](https://github.com/8itlab/genshin-miliastra-mcp/tree/70470757d6fcb319c5afec13b178c87f2d8d54b3)

## 本轮结果

| 原始图元/角色 | 生成图片控件/角色 | 分页、根、文字计入后/角色 | 每端创建 | 初始可见 | 特效峰值可见 |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 300 | 334 | 343 | 1,605 | 1,451 | 1,605 |
| 400 | 451 | 463 | 2,455 | 2,046 | 2,455 |
| 600 | 677 | 693 | 3,423 | 2,912 | 3,423 |

A/B 各自实跑所得计数相同。几何光栅对照使用源图 alpha ≥128 区域内的 8 位 RGB 平均绝对误差。固定其余参数后，12 色分割使三档误差从 81.7 / 73.8 / 64.2 降至 61.2 / 57.0 / 48.2。600 图元减轻了部分破碎边缘，五官和服装细部仍与原图有明显差距。可见数来自 Lua 运行时控件树的自身与祖先可见、激活状态，计入容器。绘制列表是模拟器的软件绘制证据，官方计数规则及最终像素覆盖仍需验证。收据的 `hostStartRpcMs` 反映本机模拟器启动与 RPC 观测，设备 FPS、帧时间和内存均为未验证。 [机器可读账本和收据](../../docs/evidence/task-109-coop-lab/results.json) · [三档软件画面对照](../../docs/evidence/task-109-coop-lab/comparison.png)

| 容量场景 | 测试构造 | 模拟器实际创建/可见 |
| --- | --- | ---: |
| 999 / 1,000 / 1,001 / 1,100 | 单传统根下对应个数的图片，根另计 | 1,000 / 1,001 / 1,002 / 1,101 |
| 两传统组 | A/B 各 550 个图片，各出一份组文件 | 各 551 |
| 嵌套客户端容器 | 一份模板含 22 页、1,100 图片，运行时挂入祖先宿主 | 1,124 |
| 动态模板 | 50 个模板实例，每份 22 图片，另计根与宿主 | 1,151 |

模拟器对传统组 A/B 分开启动。正式容量实验把两个 `.gia` 一起装入同一界面并确认同时显示。嵌套案例用于测归属，只有官方明确支持的组织方式才能用到生产。上述模拟器成功、`.gia` 导出和 GIL 副本读回分别取证，均未通过官方导入门禁。

## 官方容量复测与手机方案

1. 在同一干净基线的隔离副本中依次导入每个边界案例，保存编辑器和客户端完整版本、候选哈希、导入或校验原文。传统组同时记录图片子结点和根，核对官方面板计数。若导入拒绝，先标记发生在哪个资源类别。按同条件记录布局、模板、传统组和客户端节点归属，区分导入限制、创建 API 错误、Lua 超时以及正常创建后的卡顿。
2. 对嵌套和动态组按导出的 .gia 类型导入客户端模板与脚本，挂载相应 UI 宿主。导入后校准 Lua 里的模板索引并记录映射，使用当轮 `COOP_LAB dynamic` 或 `COOP_LAB ready` 保留完整日志。核对实际创建和可见数，对空节点、部分失败、未出现 ready、遮挡及超时分别记录。
3. 用同一 1–2 人候选的两台官方客户端检查单人开房、第二人加入、第三人拒绝。权威验证需先确认服务端可获取可信发令主体，避免依赖客户端自报 `playerId`。在同一局重放同指令、乱序、过期、同时操作和超时，并断线、主动退出和重连。对照权威快照代次、随机流和胜负，分别检查 A/B 的私人手牌和公共状态。
4. 在目标中端 Android 设备上固定型号、操作系统版本、分辨率、画质及帧率档，记录芯片、温度、候选哈希和当前 ready。每档每视角预热一次，再以 60 秒采样三次，官方负载检测开/关各跑一组。用平台帧时间工具或 Android Perfetto FrameTimeline 导出帧时间序列、P95/P99 和超 50 ms 帧数，记录进程峰值内存、冷加载至 ready、可用的 Lua、节点图、布局和绘制耗时。根据设备实际可得字段记录工具及缺项。对照静态、双方攻击受击、抽牌出牌、四怪同屏、特效峰值和连续切换，并在完整正式战斗候选上复测。发布前运行官方风险检查和负载检测。 [平台负载证据合同](../../docs/PLATFORM_LOAD.md)

当前 Linux 环境中的 MCP 只完成离线文件操作。官方沙箱和实体设备未接入本轮，房间准入、双端权威战斗以及真机画质和性能保持未验证。400 用作后续质量比较基准，正式规格待定。
