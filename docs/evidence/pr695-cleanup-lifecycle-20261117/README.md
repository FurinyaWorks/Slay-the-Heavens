# #695 清理生命周期取证接续（不是 Windows 修复验收）

基线：`e887258ce603292b94c8f342a8ce792b20fd19ab`。原 Windows 故障：run 43771012655 / job 132989344587，`Historical drag scope cleanup failed`；既有诊断 comment 6908099256、6909029900 未定位实际原因。

本次交付是可显式启用的 Node 预载取证工具，**不改生产、原测试/helper、CI 路由或任何预算**。它补齐原日志缺失的 close 收到、删树开始/完成、IPC disconnect、worker exit、parent exit/close 阶段，使下一次相同故障能区分停在删除前、删除期间还是已断开但仍有活动句柄。没有增加常驻监控、重复 Full 或占用设备。

## 使用

从仓库根目录执行（Windows PowerShell）：

```powershell
$env:NODE_OPTIONS = '--import="' + (Resolve-Path docs/evidence/pr695-cleanup-lifecycle-20261117/trace-cleanup.mjs).Path + '"'
node --test tests/battle-drag-click-compatibility.test.mjs
Remove-Item Env:NODE_OPTIONS
```

如已有 NODE_OPTIONS，先保存，执行后恢复；不要丢掉现有内存/执行参数。该预载对子进程生效，仅为具名 historical-drag worker 记录删树，父级只跟踪该 worker。记录使用 stderr，不修改正常 stdout。日志写入本身有小额观测开销，不将此时长当无插桩基准。各 PID 的 elapsedMs 有独立起点，**只能在同一 PID 内相减**。

## 实际结果

Linux / Node v24.22.1，本地离线：

- 原完整 `tests/battle-drag-click-compatibility.test.mjs` **9/9、0 skip，82.600 秒**，原 Lua 两分组 15 场景保持；原 30000 ms 执行和 5000 ms 清理限额未变。`real-entry-rerun.log` 使用第一版预载，父级退出可见，但该版本未转发 inactive 时的 worker stderr。
- 最终版预载再跑原真实第一 Lua 分组 **7/7**，`final-preload-real-slice-v3.log`。原 worker 删除真实历史树 10.108 ms；同一 parent PID 发送 close→exit 34.241 ms，正常 code 0。不是 Windows 结果或全部功能重测。
- `trace-controls.mjs` 对正常退出、**删除前停滞**、disconnect 后保持活动句柄分别对照无/有预载。两种停滞都仍在原 5 秒限额失败，无/有预载的结果一致；日志能区分两个阶段。模拟 worker 不运行 Lua，不冒充产品验证。
- 另验证原 rmSync 返回对象、抛出的同一 Error 对象在诊断输出同步抛错时仍保留。诊断输出为最佳努力，不能代替原错误。

## 保留的失败及范围

`real-entry.log` 是本次初次检出尚含 LFS 指针，来源 SHA 拒绝；按 Git LFS oid 精确恢复 368 个已有本地材料后重跑通过，未改 pin。184 个无本地材料的非本测试图片保持指针，未冒称全部资产水合。

`final-preload-real-slice.log` 是临时 `--input-type=module -e` 调用导致 fork 继承该参数而提前退出；`final-preload-real-slice-rerun.log` 是首版诊断 driver 的相对路径多了一层。改用本目录 `real-slice.mjs` 的普通文件入口后通过。这两次是诊断调用准备错误，不是原产品失败。

`controls.log` 为独审前旧命名对照，最终以 `final-controls.log` 为准。原测试/helper 字节保持不变，基础 helper SHA256 `caac30673edc2b0634230389171e9023cd5bcd5f3235482706d12d5311454e93`。

**仍未证明 Windows 超时原因，未修复/关闭该阻塞，未跑 Hosted、Full、官方导入或设备。** 不移动 #695 当前分支，不制造其新 Full。此证据分支供现有负责人在下一次必要的 Windows 定向检查显式加载；不要求重新派整套 Full。
