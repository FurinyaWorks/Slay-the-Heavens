# PC04 选角蒙层源码核查

TASK-103.3 保持 In Progress / AC4 未验收。源基线为 `release/v2.0.0@36b9b157ee6f05b65eb9f1da7e2978647d36c210`；本切片只修一个已证实的正式组合层级缺口。

逐字稿 02:45–03:19 要求 HUD 与背景有独立半透明层，30:52–31:36 指出整屏及角色被错误蒙暗。图06只有 manifest（SHA256 `55a7399d6323fcab3d6c80b486295570db1d34a809172970c60d8013bfc6557e`，852484 bytes），没有访问或看过原PNG。不能认定本次发现就是原图唯一根因，也不能给出原图像素结论。最新38条台账来源为 `979ff82d:docs/backlog-details/PC-QA-20261115-CONTINUATION.md`。只读开放PR核查未发现其他Release选角蒙层切片；#672仍OPEN且明确保留“选角实际暗化”待验。

## 已证实的边界

`gameLayout → attachOfficialBackdrops` 将全画布 `officialBackdropVeil` 插在选角旧底图上，颜色 `#0F1117`、opacity `128/255`。正式组合复用 V25 时只隐藏了 `veil/border/face/themes/scrim`，漏了这个 sibling；随后批准的1600图元 `lumineSelectionBackground` 放在 characterPanel 第0层，遗留shade仍在第3层，覆盖整幅批准画面。

实际 `buildUI(...,{officialAssets:true,nativePageLifecycle:true})` 生成树与真实 `abyss_traveler_portraits` 回归同时证实：ready 时 `art=true`、`v25Background=false`，遗留 `officialBackdropVeil=true`。因此根因不是历史已指出的0.35 fallback。控制器ready后只隐藏 `v25Background` 与旧 portraits，不管理这个遗留 sibling。

最小修复在 `applyOfficialNoncombatLayout` 隐藏该旧绘制控件。输入blocker仍独立存在；0.35 loading/failed fallback仍由原控制器管理；没有增加新的HUD形状或改变角色、主题参数、角色/元素准入、Run、RNG与平台flags。

## 本轮证据

- 最终同一回归对精确Release36产品：2项RED / 默认profile 1项PASS，退出码1。ready记录 `legacy=true fallback=false art=true`。日志 `pc04-overlay-red-final.log`。
- 定向回归8/8：现有非战斗组合4项、默认官方背景1项、新增生成树/真实Portrait生命周期/opt-out3项。正常building/ready/pause/reentry与模板创建返回nil的failed路径，遗留shade均为false；failed时fallback=true/art=false；缓存重入没有新增或销毁控件。日志 `pc04-related-green.log`。`onEngineDestroy`只用于观察遗留层不复活，不声明原生art teardown验收。
- 四个真实profile生成树：official唯一差异是上述shade的visible；default、candidate-art、v25三个`game-ui.json`与干净Release36逐字节相同，哈希在 `pc04-profile-comparison.json`。批准1600图元、93命之座及现有组件测试保持。
- 真实Host输入：菜单→选角→选择旅行者/岩→查看牌组→原有pileReturn→菜单放弃→取消→选角返回→重入确认地图通过；牌组与退出覆盖期间确认不能创建Run。`pc04-host-probe.log`。这份Host未装官方客户端presentationReady，原生Portrait ready由独立真实模块回归覆盖；不能合称官方ready。
- 新增测试初稿flags读取文件名错误已在本轮工具输出中报告。Host探针初稿漏选角色、误用退休deck veil和close入口的三份失败日志只保留在主仓库 `.artifacts/release-pc-qa-20261115/pc04-host-*-failure.log`，未纳入本归档目录；修正实际入口后通过，没有改产品交互来迁就探针。

没有重复Full、Bootstrap或触发CI；`test-affected --base 36b9… --plan`返回full=false，实际只跑上述定向集与Host。候选写入/严格读回/官方导入/新ready/PC/手机均未执行，禁止用本证据关闭AC4。没有GUI、鼠键、切前台或MCP操作。

## 剩余HUD范围及设备验收条件

现有可读批准稿未给出“独立HUD半透明层”的明确矩形/形状、渐变或opacity；本次移除遗留全屏shade不等于该独立HUD衬底已完成。需要可读取的图06原PNG（用manifest核身份），或注明脱敏变换的新副本；可遮UID/账号等隐私，但保留整幅画布、HUD边界、角色区域、按钮及颜色。还需要认可的原版对照图或明确的HUD区域/透明度批准标注，才能做受控组件/Token调整。

官方录屏/复测应绑定本轮候选buildId与payload hash、设备型号/分辨率/UI缩放，含导入后新订阅日志与真实ready时刻；同机同条件连续记录“进入选角→加载完成后静止→开关牌组→开关退出菜单→返回再入选角”。需要区分加载cover、ready主视觉、合法模态和HUD衬底。无本轮授权输入窗口继续离线工作，不要求反复导中间包。
