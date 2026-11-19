# 独立复核：停用 V4 数据的装配前置证据

**PASS：仅限证据准确性。** 本次由不同会话独立复核；没有重跑四个 Lua 场景，没有修改产品、原 fixture、门禁或任务。基线为 `develop@b1669c6db9d268f897f5380523bb82595279cdcf`，源码树 `3bb61d1a4f8e5300a729fbfbe1faafcc78726dde`。

| 评审文件 | SHA-256 |
| --- | --- |
| `README.md` | `c88da3ad2fb361c2f63c75efb21f3f28968c66cad2a34d47016c15c7a3734ab2` |
| `probe.mjs` | `251ae332e1a81325b8827a7395d4ac7e6a9e002bed8eaf7dcec29456da67c6ac` |
| `results.json` | `cfa5e016a9b5ec8490eba1a51427f616319c06e11f8afdc15813a489ec5c03b2` |
| `inventory.json` | `28bcd2682415e13cadc1f656e03aa27523c2d719c25ae121ebe88ea40e3173f3` |
| `intake.txt` | `1a88a4119e9d8483bc1dd6b4bbf7f58ce647bb93772c26346ea7d98f72565071` |

- 查验脚本语法和 runner 接线：每组走原 `runLua` 的标准路径、默认超时和独立 Lua 进程，直接执行原 fixture，不注入历史源码或选测条件。加载器仅在准确模块名上计数或抛错。报告所列 7 个原文件的 SHA-256 和全部 351 个跟踪的生产 Lua 文件，与基线 Git 字节一致；19 个生成 Lua 没有同名覆盖生产源码。
- 对照四组原执行输出与 `results.json`：正式两幕的原数据和禁载组输出逐字相同，各保留 4 组通过和 0 次调用；full-source 正常组保留 3 组通过和 8 次调用；禁载组原三幕 Geo 段先通过，在首次访问 V4 的 `abyss_original_v4_profiles.lua:22` 明确报 `V4_DATA_FORBIDDEN`，退出 1、无信号，不是超时或缺文件错误。
- 独立只读复算 `packageInventory()`：五项美术全关，366 个模块、3,932,365 Lua bytes、14,420 控件、4 模板、0 卡画池；V4 模块 577,904 bytes，SHA-256 `63e4983d6d80241f287e153087efd81e7ab287efbb15e195ef80ad90230fb2cb`。默认 native CLI 启用菜单背景和两类头像，与上述 profile 不同。Git 指针和原背景校验要求相同的预览图 OID；核对保存的 ZIP 哈希、大小、CRC 和全部 768 个成员，未含所需字节；两张已恢复头像分别匹配各自原 OID/大小，且未暂存。默认 profile 仍是缺输入阻断，不能用通用 profile 的成功或另一个候选的测量替代。
- `TASK-103`、`TASK-105` 的基线记录均是 `In Progress / @Furinya`，与门禁的 `HOLD` 一致，不是本轮认领。报告中的同名 sentinel、固定来源重建和 receipt 合同是移交建议，不是已实现或已验收的裁剪。

本复核不证明自然全流程试玩、Full、默认 native 成功、GIL 写入/读回、官方导入/ready、官方容量或设备表现。
