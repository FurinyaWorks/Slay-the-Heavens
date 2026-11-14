# TASK-34 永久界面故障停止背景音乐

基线 `9f2f44e4c79789fbcb64a515938765dbc240f830`，隔离分支 `feat/fatal-bgm-stop`。TASK-34 由主控通过 Backlog CLI 认领；本切片不完成同候选试听与设备 AC。

## 问题与范围

真实 `abyss_ui.lua` 入口启动、进入地图后，向 `game.GetUICanvasSize` 注入既有故障夹具同类异常，再执行实际 `OnUpdate`。永久故障诊断已显示，`GameUI.disabled=true`、更新已关闭，音乐信号数量仍为 `2→2`，最后仍为 `ABYSS_BGM_MAP`。服务端独立音乐图仅收到 `ABYSS_BGM_STOP` 才执行暂停；这里未发停止请求。

生产只增加入口内部音乐发送器的所有权：仅 `nativeBgmEnabled == true` 时保存发送器；`failed()` 先清除该所有权，再以 `pcall` 尝试一次 STOP，随后原清理和原始故障诊断继续执行。发送失败不重试、不覆盖原错误。普通 `GameUI.disable()`、曲目、音量、场景去重和结算规则均不改。`OnDestroy` 仅清除引用，不访问原生信号。

PR661 持有同一入口的整合改动；本切片仅写自己的工作树，不写其树、不创建 PR、不合并。已核对 PR663–668 未修改 `abyss_ui.lua` / `abyss_bgm.lua`。

## 回归与历史来源

新增真实 bootstrap 夹具 `tests/lua/fatal_bgm_stop.lua`，覆盖八组：地图故障停止与迟到回调、STOP 抛错保留清理/诊断、实际 mini-Neow 后首战停止、关闭/字符串/数值参数不触信号、普通 disable 保留原行为，以及仍存活音乐 owner 直接引擎销毁不触信号。Node 包装保持真实 Fengari 退出码断言。

初始生产未修改时，新回归真实失败在 `fatal failure did not stop active BGM`；原始日志保留于 `docs/evidence/task34-fatal-bgm-stop/red.log.gz`。加入生产改动后对应断言通过。

原完整身份检查对新入口拒绝了 14 项，理由为 `combined linked owner identity: src/lua/abyss_ui.lua`；保留该失败日志。新增单路径全文逆投影，绑定两个完整 LF 源码的 SHA256 与 Git blob，原 epoch proof、历史 oracle 和旧来源集合不改。仅既有输入和关联 owner 鉴权入口识别这一个精确后继；未知、部分、附加内容不获权限。原 closeout 复制清单追加新 helper 与两个全文，并绑定修改后的当前 helper。

新增独立来源测试保留纯历史输入，通过当前精确后继，同时拒绝同次 `after` 输入配 `before` 关联读、反向替换、热调用后本入口或另一 owner 污染/缺失。关联 owner 每次重新读取；不缓存许可。CRLF 仅沿用既有 LF 规范。

## 本轮验证

- 新 Node 回归 3/3 通过，包含 Lua 8 场景与精确来源/污染负控。
- 既有 BGM 单元 3/3、Host 2/2 通过。
- `check:lua-static` 通过：14 条明确历史告警、无新增；2161 项受管职责测量。
- `check:architecture` 通过：346 模块、1955 边。
- 旧 timer bootstrap 回归、既有 `game_ui_classes_failure.lua` 七组通过。
- 首轮精确来源适配将 14 项原拒绝缩至两项 slice 预判拒绝；保留失败记录，再仅以同一精确入口逆投影参与旧 row 预判，原始输入仍交现有 owner 鉴权。两项定向通过（23324ms）；最终完整 16/16 来源检查通过（169297ms），含旧历史读次数、当前 Host 所有直接/传递消费者、warm owner 污染及独立副本边界，零跳过。
- JS 语法与 `git diff --check` 通过。独立只读审查来源 `/root/next_product_gap_scan/fatal_bgm_review`；精确提交的增量 ratchet、最终审查绑定与推送结果由交付消息记录，不把未提交脏树的测量当作已提交 HEAD 门禁。

本轮未构建或导入官方候选，没有新 ready、设备录像或听验；模拟 API 发信号通过不能证明官方音轨实际停止或混音验收。禁止据此勾选 TASK-34 剩余设备 AC。
