# TASK-4.21 / TASK-100：2.0 默认包待机与背景白盒探针

旧 Release 精确基线 `1cc5479b713edab6fd26db4e20f8eb22b7401cb2`，默认音频包美术开关 `cards=false, menuBackground=true, selectionAvatar=true, battlePortrait=true, monsters=false`，不启用 Official/V25 实验。以下是**原生成文件、实际 Lua 路径配模拟控件**，不是正式 GIL、引擎 GPU、FPS、内存字节或温度。

| 分开测的对象 | 结果 | 不能推出 |
|---|---|---|
| 默认战斗角色 `battle133` | 4,315 图元、4,389 动态控件；预热后 120 次 idle pose 中，父容器位置/缩放各写 120 次，子图元改写和新建均 0 | 引擎可能仍处理整棵变换子树；不能保证省电 |
| 三个页面的实际 `lowpolyLand` | 同样 362 图元各建一份。菜单预加载选角后 2×370；进战后已访问页面共保留 3×370。300 个稳定 tick 没有任何景物 setter；回地图仍缓存，release 降到 0 | 只测这三份景物，不是全套游戏的实际同时可见数量或原生内存 |
| 另一配置的「7,303 图元」 | `battleApprovedIdle` 仅供 Official 实验选择；分 18 bands 按采样移动，不逐一改写 7,303 个图元 | 不能用来描述正式默认包、把图元数折算官方 MB |
| 另外的 4,500 图元 | `abyss_menu_background` 是通关后手动点开的彩蛋独立大背景；不是三页各自 362 图元，也不是普通待机动画 | 离线静态装配不是实机容量 |

白盒边界：`abyss_feedback.lua` 空闲中仍每个 update 遍历存活角色；`abyss_battle_render_state.lua` 并非活动战斗时解绑。默认 portrait 适配器的 pause 仍缓存；手动直接调用 pose 仍能发出两次写入（正常入口依赖战斗更新门控），release 后已无写入且控件释放。景物只建一次但跨页面保留。下一步优先做同候选的静止战斗 A/B：只切换角色纯待机变换，保留受击/技能/输入，绑定同机型、同战斗、固定亮度/帧设置及测量时长；再独立测试离场景物缓存策略，测回切延迟、内存与发热；两项不能混为同一收益。

复现：在同一基线仓库根目录，先按上一级默认配置生成 `build/formal`，从同一锁定依赖运行以下两个探针。战斗探针重用仓库内 `portrait-runtime-vm`，用真实 portrait 生成器生成 v2 相同战斗绘图，替换 prefab 号为 mock。景物探针读取同一生成输出，仅令 M.new 创建背景功能，以免把人物、卡牌的调用计到背景。

```sh
node /path/to/portrait-probe.mjs
node node_modules/fengari-node-cli/src/lua-cli.js -e "package.path='./build/formal/?.lua;./src/lua/?.lua;'..package.path;dofile('/path/to/cache-probe.lua')"
```

`build/formal` 输入 SHA256：肖像 Lua `347c7ba0189fe2f7666d8438c83bb4e4f0eea849971507e3065255bcc4ff5bac`；UI `0798f272cba727cf099dd7676b80c0cdf15cd4c4f447904f35e01d44c4c0a7bf`；模板 `bf40667522dd57298cba00fc6d0bc91470649ae40590b98c2b45ae2d9cf8c8c4`。未改产品、未重复 CI。
