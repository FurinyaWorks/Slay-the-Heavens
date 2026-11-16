# PC04/PC08 source 与 CI 接续

本片从产品 checkpoint `74a598a52a0b846bc1bec1ef57083b2fdb1bbc39` 独立接续，Release before 固定 `36b9b157ee6f05b65eb9f1da7e2978647d36c210`。仅 `abyss_game_ui_input.lua` 与 `abyss_game_ui_view.lua` 的完整 before/current 生产绑定前进，352 路径、116 owner 和64个旧目标完整保留，新增一个 Release prior 目标。产品8个脚本/测试 blob 均与 checkpoint 相同。新 helper/copy 使用本片精确闭包，不复用其他切片 after。

当前 raw Full 为879 JS / 1423顶层Lua，保留876个旧JS及全部旧Lua，新增两个产品父JS和一个source父JS。support Lua由PC08父JS完整执行；本片没有重跑产品或Host。旧92份不可变档案逐项核实，其中90份Git物理gzip字节相同、2份LFS按原oid/size及当前物理payload核验；新生产packet单独固定。CI packet绑定21个精确来源，三个bootstrap workflow的before固定c240，未修改workflow或重复#692修复。

本机Node24有界结果：新source6/6、当前raw1/1、原先实际失败的menu-current1/1、owner/copy/source投影44/44、历史session/库存接缝4/4、integrated-CI接缝2/2。44项包含8个直接用例及动态导入的36个source负控。原menu-current失败完整字节保存在`raw-before.log.gz`；其旧完整receipt仍保持原断言，新增raw合同独立检查当前库存。各gzip原始hash、大小、命令边界与具体绑定见`source-validation.json`。

耗时预测Windows1,757,264ms、POSIX1,191,630ms仅作诊断；实际job硬限Windows45/可信本地75、POSIX30分钟及Fast45/30保持，缺失、重复、step-only、wrong-job、路由漂移均有负控。没有调整timings、partition、unknown或阈值。Root已测PC08三场完整Host约17.793s，超过新父JS默认10s未知成本，因此该预测可能低估；没有把预测改成准入硬门禁。

未运行整套Fast/Full、全部CI calibration、hosted CI、官方导入、新ready或设备试玩。官方/PC/手机验收仍未完成，source通过不代表发布许可。#692仍按parent最后报告为open；Release实际base变化后需重绑精确before并复审。
