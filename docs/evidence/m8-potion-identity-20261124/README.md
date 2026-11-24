# TASK-4.15 战斗双槽药水识别基线

本证据不改 Release，固定源码 `55d6396cf315cf1e30085d9521fdb3bfaadeb2ad`。用现有正式原生模板和 Lua Host fixture，按 iPhone 14 Pro 横屏投影 2556×1179。设备像素、引擎安全区域和主观识别未实测。

- 两格分别装瓶中精灵（`fairy_in_a_bottle`）和熵之酿（`entropic_brew`）。四种状态瓶图均为 111047、RGBA 140:196:226:255（#8CC4E2），两种文字标签均隐藏。同状态两瓶视觉配置一致，默认/悬停/禁用 42×48，按下缩为 40.32×46.08。都居各自热区中心；热区保持 84×84，两者有 8 单位水平间隙，间隙探测未落入两药水。
- 坐标点击两格分别打开正确命名弹窗，弹窗跟随对应槽中心。瓶中精灵的使用禁用，熵之酿的使用可点。关闭后保存两瓶。探针不测试 Entropic 实际随机生成或设备触摸。
- 在同样槽状态下，从启动目录的 33 个已接入药水，按真实战斗渲染器的图片、色值（含默认色）和外壳分组：13 组，26 个与别的药水共用一组。最大 10 个。本表是配置分组，只对上述两瓶跑生成布局 Host，不等同对全部 33 个图标做视觉辨识验收。已有鸦羽碰撞是攻击药水，不是力量药水。
- 下一个设计实验宜先做这一对：在同一官方外壳和实际尺寸下放入不同轮廓或辨识符，再做无名称正色/灰度对比；保留中心、触区和实际弹窗路径，避免只靠换色。未批准改稿、未进入生产，不关闭 TASK-4.15。

## 复跑

按原仓库要求恢复输入（本次 369 个 LFS 内容按 OID 和大小验证）。构建：

```sh
node scripts/build-lua-data.mjs data generated/abyss_data.lua
node scripts/build-ui.mjs generated --official-assets --native-page-lifecycle --refined-release-monsters
LUA_PATH="$PWD/generated/?.lua;$PWD/src/lua/?.lua;;" luatex --luaonly /absolute/two-potion-viewport.lua
```

实际 `game-ui.json` SHA-256 `4455315cb0e4a09bf61a92953fa1b919fa9e7fc2878a6f2be47062841fd50312`。此上传只含探针、输出和配置分组，无外部素材或私人 GIL。
