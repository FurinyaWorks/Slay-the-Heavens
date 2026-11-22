# 项目移除手柄后的牌库复验

输入范围见 [ADR 0003](../../adr/0003-keyboard-and-touch-only.md)。本次比较使用拆手柄前的 #899 源 `74aa9a18311c972d2021bef9700153291620b45b` 和同一 PR 的手柄移除提交。两侧均为 5×2、十根惰性创建的卡面和正式生成布局。

独立复查对默认和正式树递归核对游戏、战斗、地图和模板的导航字段。正式主游戏 `focusable=true` 由 300 处降到 0，`isolateNavigation=true` 由 9 处降到 0。战斗、地图、模板的正向焦点分别由 53、94、6 处降到 0。这些是各生成文件的独立计数，文件间有重叠。

| 离线 Host，键鼠触发真实下一页命中区 | 移除前 | 移除后 |
| --- | ---: | ---: |
| 20 张混合抽牌冷开 `GetChild` / 创建控件 | 2,074 / 3,160 | 2,074 / 3,160 |
| 20 张翻页 `GetChild` / 尺寸写 | 263 / 860 | 262 / 860 |
| 75 张翻页 `GetChild` / 尺寸写 | 211 / 288 | 210 / 288 |
| 20/75 张翻页 Confirm 注册 / 注销 | 10 / 10 | 0 / 0 |
| DeckPanel 监听 / Host 手柄记录 | 88 / 309 | 30 / 0 |
| DeckPanel 活控件 / 物理卡面 | 3,704 / 10 | 3,704 / 10 |
| 暖开及二十次往返创建 / 销毁 | 0 / 0 | 0 / 0 |

两臂各尺寸一次计数。翻页几何工作仍在，二十次往返用于发现资源增长。CPU 行保留在日志中，样本规模只支持计数结论。设备延迟与像素呈现待官方客户端验证。

原生模拟回归保留牌库跨页旧触点、鲜触点与键盘左右键、同页暖开、遗物窗口的旧关闭回调、地图拖动与滚轮，以及战斗目标和药水。独立负控移除 Host 自有的指针盖板后，复现盖板误放行；注入原生监听注册失败和同步退役后，核对其他活控件继续可用。

全量门禁另行验证。拆手柄前后的相同定向重跑均复现真实 OnStart 测试的一条断言及两个旧盖板夹具缺少 `blocker` 的失败。牌库、实际 Host 盖板回归和正式布局定向均通过。

在各自工作树生成同一正式 profile。原始包包含四份输出和两侧通用的计数夹具。

```sh
npm ci
npm run build:data
node scripts/build-ui.mjs build/formal --official-assets --refined-release-monsters --native-page-lifecycle
export PROBE=/absolute/path/to/unpacked/input-retirement-raw
export BUILD="$PWD/build/formal"
export PROFILE=keyboard COUNTS=1 SAMPLES=1 REVISIT=1
TARGET=baseline AMOUNT=20 luatex --luaonly "$PROBE/run.lua"
TARGET=baseline AMOUNT=75 luatex --luaonly "$PROBE/run.lua"
```

在移除后的工作树以 `TARGET=candidate` 重跑同两条命令。正式配置为 `cards=false`、`menuBackground=false`、`selectionAvatar=true`、`battlePortrait=true`、`monsters=true`。

[原始计数和脚本](input-retirement-raw.zip)
