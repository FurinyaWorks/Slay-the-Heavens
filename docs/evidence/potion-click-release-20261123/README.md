# 正式战斗药水：取消拖瓶直接释放

精确 Release 基线 `6f688a4669c06ea0d74f504bcb9c7e202e5a519a`。参考《杀戮尖塔》一代固定镜像 [TopPanel](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/ui/panels/TopPanel.java#L428-L462) 与 [PotionPopUp](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/ui/panels/PotionPopUp.java#L180-L257)。正式规则路径：点瓶打开操作，确认使用，自用瓶立即结算；需敌方目标的只进入瞄准，另点有效敌人才消耗。取消不结算。此切片只移除正式配置 PC／触控的直拖释放捷径，不迁移旧 Fork 的箭头补丁，不增加游标跟随或视觉改动。不改卡牌拖拽、背包、丢弃、药水规则。历史／非发布配置用于回放，不受编辑影响。

- `click-parity.lua`：用同一份生成的正式 UI（officialAssets + nativePageLifecycle）及真实 Lua Host，回放鼠标和 1600×720 触控事件，输入为模拟。原版本在“拖瓶未经确认就启动瞄准”断言红；候选两种输入均通过。包括 Up/EndDrag 与迟到点击、仅移位 Up、拖 Use、空白取消、旧敌方尾触点、换瓶拖动、有效敌方仅结算一次、自用瓶、卡牌拖拽。
- `recovered-official.log`：同候选运行现有药水归属回归，覆盖 2/5/10 张手牌、点击上下层的两种回调顺序、药水使用/丢弃/取消、必选牌叠层。
- 在项目根目录生成 data 与正式 layout 到隔离目录，使用该目录作为优先 LUA_PATH，随后是 `src/lua/?.lua`，执行 `node node_modules/fengari-node-cli/src/lua-cli.js -e 'dofile("docs/evidence/potion-click-release-20261123/click-parity.lua")'`。保留异常退出码。原生射线分发、官方导入与实体设备未验证。
