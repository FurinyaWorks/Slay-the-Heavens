# 胡桃实验 · 文案真实性接续（2026-11-15）

只维护已有HTML实验的三处已确认呈现缺陷。**这不是首位璃月角色选择、胡桃V4/V5/V6机制批准、75卡命名批准或正式职业准入。** TASK-96保持Blocked，具体角色及版本待Owner决定。代码仅在此目录，生产src/data、冻结V4、原V5/V6分支及发版树均未改；不提交、不推送、不建PR、不Full。

可复核成品：[candidate.html](candidate.html)，原件：[baseline/source.html](baseline/source.html)，[7处精确文本替换](patch-manifest.json)，[来源](source-manifest.json)，[最终验证](evidence/verification.json)。

## 准确基线

基线提交`7c3abce098e789cacca03f25ee528047e24fbe25`，位于保全分支`archive/source-closeout-20261114`；原路径`experiments/characters/hutao/full75/胡桃V5_75卡命名修订五战试玩版.html`。Git blob **`d4b97370fa5e314c725edc3a1136fb1523790c78`**，100362字节，SHA256 **`97b9e6313278e98e8868b71387ac962b7ff1116b3f0974ae51638426e3ed2c54`**。原交付说明记过`57ce9650…`，与该Git对象实际字节不一致；本轮使用实际blob而不改历史说明，不借旧hash认证当前输入。

该版已有75卡/150形态，且已包含复制失败反馈、战斗快捷键保护、弹窗键盘焦点修复。它相对`99cc1e05`的完整来源应保留；本轮没有再做这些修复。旧V6 reviewer审的是PR640 `99cc1e05`/blob`364e1d3e…`，不能直接把全部旧发现作为本版本未修。

本工作树从`origin/develop=e65d9b98`创建，分支`feat/hutao-lab-truthful-copy-1115`。原完整HTML仅为来源基线，保持原字节；candidate是在它上面做可逆7处文字替换。

## 本轮改动与发现对账

| 旧发现 | 本轮实际复现/处理 | 状态 |
| --- | --- | --- |
| 机制评审M-01：血之灶火+说无条件+3，但实际半血限制 | 真正play()基础/升级卡后接普攻；72HP为6伤，36HP为8/9伤。仅在升级详细文案补“本战半血及以下时”，原短卡面原本已正确 | 文案修复，机制和数值不改 |
| 呈现PRES-02：c14/u15短文案遗漏本回合 | 两卡基础/升级实际结算的prepAttack分别为3/5与2/4；下一回合归零。只在textForOp的短文案补“本回合” | 文案修复，抽牌/增伤/持续不改 |
| 呈现PRES-03：完整战报实际上最多100条 | 实际写入120条后只剩probe-020至119。两个按钮及本地复制成功提示都改“复制最近100条战报”；导出头和结算提示明确仅含最近100条，之前日志未保留 | 诚实标注保留范围，不改数组限制 |
| 呈现PRES-01：复制失败仍误报成功 | 基线7c已检查execCommand返回false并提示失败，原6个剪贴板合同本轮原断言通过 | 对本基线已过时，不重复修复 |
| 键盘/焦点修复 | 直接保留7c原7个键盘及11个焦点/联合监听合同，只改测试HTML输入URL | 18/18通过；Node DOM替身，不冒充浏览器原生行为 |
| 75卡命名/来源与V6经济问题 | 不更名、不改P1–P4身份，不评定u11/r06的玩法取舍，不批准具体职业或数值 | G3/正式采用继续HOLD |

补条件只改“血之灶火+”旧详细字段，现有真实执行规则和完整引擎类逐字相同。新短文案与已有技术长文案一致。复制操作仍只读，不改变游戏状态；历史失败处理及临时textarea清理代码保留。

## 先红后绿与失败记录

- `evidence/red.tap`：未改HTML上的最初4个呈现合同全部RED，分别是半血条件、本回合、导出范围、按钮完整性承诺。
- `evidence/after-copy-initial.tap`：文字修复后28/29。新增测试错误地将u15的数值预期写成c14的3/5；原数据实际为2/4。纠正测试的独立期望，没有改牌值或放宽断言，失败原日志保留。
- `evidence/red-r02.tap`：用最终同一组5合同重跑原source，4个真实呈现失败+1个原数据一致性通过；退出1。
- `evidence/green-final.tap`：最终29/29、0跳过、退出0。包括原三组24合同、4个呈现合同、75卡身份/费用/稀有度/效果/来源和完整引擎一致性合同。
- `verify.mjs`核实Git blob、source/candidate SHA、恰好7处文本替换、原三测试仅路径适配、原引擎字节未变、两段内联脚本语法及红/绿收据身份。

测试运行方式是Node VM执行实际HTML第一段引擎、实际短文案函数及真实复制/键盘/焦点处理器；DOM为既有测试替身。没有启动物理桌面、发送OS键鼠或将390px视口称实体手机。未跑浏览器/自然五战/Full；这些不属于本次有限呈现合同通过结论。

## 复现

从本仓库根目录执行，不需要联网安装：

```powershell
$env:HUTAO_COPY_FILE='experiments/characters/hutao-v6-followup-1115/baseline/source.html'
node --experimental-test-isolation=none --test experiments/characters/hutao-v6-followup-1115/tests/truthful-copy.test.mjs
Remove-Item Env:HUTAO_COPY_FILE
node --experimental-test-isolation=none --test experiments/characters/hutao-v6-followup-1115/tests/*.test.mjs
node experiments/characters/hutao-v6-followup-1115/verify.mjs
```

第一项预期4失败1通过。`fix-copy.mjs`可从精确保全source重建同SHA candidate；`prepare.mjs`是首次保全/测试URL适配步骤，只在新副本运行，拒绝覆盖既有candidate。原始三份测试字节在baseline/*.txt，按原Git blob校验，不对已有断言做适配。

下一步由主控和独立reviewer复核当前candidate及证据；通过仅表示这三处说明与已有实验实现一致。G3、正式职业/版本批准、千星原生、官方PC及实体手机均未通过。
