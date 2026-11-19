# M01/M02 药水：当前 develop 红灯与输入 owner 交接

精确来源 `develop@62328bdac7703c3ab241e0ddb19e0fa05474f76a`。本轮查询三仓：主仓 #744、#741、冻结 #738 开放；Fork A/B 无开放 PR。TASK-38.4 仍 To Do/Furinya、三 AC 未勾，`check-pr-slice --start` 返回初步 ALLOW，但仍需服从现有文件 owner，**没有认领或修改任务**。

旧 [#679](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/679#issuecomment-6980739669) 在旧 Release 已交付，固定原头 `1e100dcea21cac88bcfe14a2e6bb2684819e174f`。只读取原 fixture 与三个生产文件，不合入旧 Release 或整个准备分支。

## 真实只读复现

从原头逐字导出 `tests/lua/potion_popup_click_payload.lua` 到未加入 raw 测试发现列表的 `.artifacts/potion-scope/`，用当前原始生成布局、当前 fixture/业务模块及原 runLua 执行。原 fixture 在第 29 行失败（exit 1），没有修改其断言或预先替换生产模块。

追加小型定位对照，均从同一个当前真实 Host 初始化：选择能量药水，已注册 use 的 Down(17)→Up(17)→Click。

- Click 带 touchId=17：弹层关闭，药水恰好消耗，能量 3→5，2 张手牌不动，没有选中牌。
- 同一释放后 Click 不带 ID：弹层仍打开，药水未消耗，能量仍 3，手牌不动。事件未被重写。

这证实 unique 已释放指针遇缺 ID 的原生 Click 被当前逻辑拒绝。它不是手机实测，不证明录音中的每一种失败同根因，也**不把本次未消费药水误报为已复现误出牌**。

## 为什么本轮不并行实施

原 #679 产品接续面是三个文件，共 142 行增加/28 行删除：

- `abyss_battle_potion_popup.lua`：控制器/触点归属、无 ID Click、竞争及旧尾屏障。
- `abyss_battle_ui.lua`：传入 aimReady、使用原始指针来源和消费后屏障。
- `abyss_battle_card_gestures.lua`：popup 下层不得抢关、过期 aim 的本次按压只取消。

[#741 当前及后续交接](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/741#issuecomment-6999340636) 明确由原执行线继续 gestures/PC35；当前 PR head `77c484a9` 已修改同一个完整文件。两边文本位置并非必然冲突，但共享完整 owner 身份/历史来源绑定，不能把这一点说成“无重叠”。因此没有修改任何生产、现行测试或共享来源桥，也没有创建 PR。默认生成物与本诊断只留独立树。

交接原 gestures writer：在真实最新 develop 组合中接三文件的必要原行为，保留 #741 的取消提示改动；先复用原 #679 产品/四能力/targeting 测试，再补完整精确 source continuation 与所有旧负控。归档中的两个 diff 仅是来源范围参考，**不是已验证可直接应用的新实现**。不要整支拷贝旧 Release，不借旧 Hosted Full 宣称当前组合通过。

可直接浏览：[定位 Lua](focused-native-click.lua)、[定位原始输出](focused-native-click.txt)、[原 fixture 红灯原始输出](original-payload-red.txt)、[三文件完整 blob 对照](source-scope.json)、[#679 三文件来源差异](original679-three-owner-scope.patch)、[#741 当前手势差异](active741-gesture-scope.patch)。原 fixture 可从[固定 #679 原提交](https://github.com/FurinyaWorks/Slay-the-Heavens/blob/1e100dcea21cac88bcfe14a2e6bb2684819e174f/tests/lua/potion_popup_click_payload.lua)直接查看。

`red-and-scope.tar.gz` 包含原 fixture、定位 fixture、两份原始日志、真实生成/依赖准备输出、intake 和精确 blob/范围 diff。摘要及归档 SHA256 见 `receipt.json`。未做 Full、GUI、GIL、官方导入、实机或发布。

独立协调会话另核对当前 src/tests/scripts 为精确干净 62328bda，并通过仓库 Lua runner 重跑定位 fixture：exit 0；named 关闭/消费/能量5，anonymous 保留/未消费/能量3，均 hand2/nil selection。边界和报告见 `independent-check.json`；该会话随后也独立重跑本次逐字恢复的原 #679 fixture，确认同一第29行 exit1；fixture SHA256为83b300f9550fd40f5b5f503785c1f42b5662c76db86d67e3d13683e747046119，与固定原提交逐字相同。未扩张为其他 #679 整套用例或迁移独审。
